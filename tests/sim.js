/* ============================================================
   OPE365 · Arnés de simulación del motor de aprendizaje
   ------------------------------------------------------------
   Usuario sintético + reloj controlado. Genera las sesiones que
   RECOMIENDA el motor, las responde con un modelo de memoria
   propio (verdad de terreno, independiente del motor) y
   realimenta los eventos. Produce trazas verificables.

   Uso:
     const { loadEngine, makeUser, simulate } = require("./sim");
     const env = await loadEngine();
     const user = makeUser({ competence:0.4, forgetRate:0.08,
                             minutesPerDay:20, weekdays:[1,2,3,4,5],
                             examInDays:90 });
     const res = simulate(env, user, 90);
     res.trace // [{day, date, session, answers, overview, readiness}]
============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
const DAY = 86400000;

async function loadEngine(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","engine.js"].forEach(f=> w.eval(read(f)));
  const O = w.OPE;
  O.LE._noPersist = true;   // la simulación gestiona su propio ciclo de vida
  // arrancar de progreso limpio
  O.PROGRESS.answers = {}; O.PROGRESS.flashcards = {}; O.PROGRESS.history = [];
  O.PROGRESS.concepts = {}; O.PROGRESS.events = []; O.PROGRESS.qstate = {};
  O.PROGRESS.plan = null; delete O.PROGRESS._seeded; delete O.PROGRESS._recentSessionStarts;
  return { w, O, LE:O.LE };
}

/* PRNG determinista para la simulación */
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------
   Usuario sintético
   competence: número 0..1  ·  o función(conceptId) -> 0..1
   forgetRate: caída diaria de fuerza de memoria sin repaso
   minutesPerDay, weekdays, examInDays
   skipProb: probabilidad de saltarse un día de estudio previsto
------------------------------------------------------------ */
function makeUser(opts){
  const o = Object.assign({
    competence: 0.4, forgetRate: 0.06, minutesPerDay: 20,
    weekdays: [1,2,3,4,5], examInDays: null, skipProb: 0, seed: 12345,
    learnRate: 0.22, slowProb: 0.15,
  }, opts || {});
  o.competenceFn = typeof o.competence === "function"
    ? o.competence : (() => o.competence);
  return o;
}

/* ------------------------------------------------------------
   simulate(env, user, days, [startMs])
------------------------------------------------------------ */
function simulate(env, user, days, startMs){
  const { O, LE } = env;
  const rnd = mulberry32(user.seed >>> 0);
  const start = startMs || Date.UTC(2026, 0, 5); // lunes
  const examDate = user.examInDays != null ? start + user.examInDays * DAY : null;

  LE.setPlan({
    examDate, minutesPerDay: user.minutesPerDay,
    weekdays: user.weekdays, objetivo: "consolidar",
  });

  // verdad de terreno: fuerza de memoria por concepto (0..1) + último toque
  const truth = {};   // conceptId -> { s, last }
  LE.CONCEPTS.forEach(c => { truth[c.id] = { s: 0, last: null }; });

  function decayAll(now){
    for(const id in truth){
      const t = truth[id];
      if(t.last == null) continue;
      const d = (now - t.last) / DAY;
      if(d <= 0) continue;
      t.s = t.s * Math.exp(-user.forgetRate * d);
      t.last = now;
    }
  }
  function answerProb(conceptId){
    const base = user.competenceFn(conceptId);          // techo de habilidad
    const mem = truth[conceptId].s;                     // memoria actual
    return Math.max(0.03, Math.min(0.97, 0.15 + 0.35 * base + 0.55 * mem * base + 0.10 * mem));
  }
  function reinforce(conceptId, correct, now){
    const t = truth[conceptId];
    const target = correct ? 1 : 0.15;
    t.s = t.s + user.learnRate * (target - t.s) * (correct ? 1 : 0.6);
    t.s = Math.max(0, Math.min(1, t.s));
    t.last = now;
  }

  const trace = [];
  const seenQ = {};             // qid -> [dayIndex,...]
  const conceptLastSeenDay = {};// conceptId -> dayIndex
  let feasibleFlips = 0, honestFlags = 0;

  for(let day = 0; day < days; day++){
    const now = start + day * DAY;
    const wd = new Date(now).getUTCDay();
    decayAll(now);

    const isStudyDay = user.weekdays.includes(wd) && rnd() >= user.skipProb;
    let rec = null, answers = [];

    if(isStudyDay){
      const run = LE.smartSessionRun(user.minutesPerDay, now);
      rec = run.plan;

      run.plan.items.forEach(it => {
        const cid = it.concept;
        const p = answerProb(cid);
        const slow = rnd() < user.slowProb;
        const correct = rnd() < p;
        const ms = it.kind === "fc"
          ? 5000 + Math.floor(rnd() * 5000)
          : (slow ? 22000 : 9000) + Math.floor(rnd() * 8000);
        const grade = it.isExam
          ? (correct ? "good" : "again")
          : (it.kind === "fc"
              ? (correct ? "good" : (rnd() < 0.5 ? "hard" : "again"))
              : LE.gradeFromAnswer(correct, ms, cid));
        LE.recordEvent({
          kind: it.isExam ? "exam" : it.kind, ref: it.ref, concept: cid,
          framing: it.framing, grade, correct, ms, ts: now,
        });
        reinforce(cid, correct, now);
        answers.push({ ref: it.ref, concept: cid, framing: it.framing,
                       bucket: it.bucket, isExam: !!it.isExam, correct, grade });
        if(it.kind === "q"){ (seenQ[it.ref] = seenQ[it.ref] || []).push(day); }
        conceptLastSeenDay[cid] = day;
      });

      LE.recalc(now);
    }

    const ov = LE.overview(now);
    const rd = LE.examReadiness(LE.planCtx(now));
    if(rd.feasible) feasibleFlips++;
    if(!rd.feasible) honestFlags++;

    trace.push({
      day, date: new Date(now).toISOString().slice(0,10), weekday: wd,
      studied: isStudyDay,
      session: rec && {
        items: rec.items.length, phase: rec.phase, goal: rec.goal,
        mix: rec.mix, concepts: rec.concepts.length,
        estMinutes: rec.estMinutes, maxPerConcept: rec.maxPerConcept,
        deepened: rec.deepened, consecutiveSameConcept: rec.consecutiveSameConcept,
        fcCount: rec.items.filter(i=>i.kind==="fc").length,
      },
      answers,
      overview: {
        cobertura: round(ov.cobertura), recuperado: round(ov.recuperado),
        consolidacion: round(ov.consolidacion), atencion: ov.necesitanAtencion,
        pendientes: ov.pendientes, estabilidad: round(ov.estabilidadMediaDias),
        dims: mapRound(ov.dimensiones), veredicto: ov.veredicto,
      },
      readiness: {
        studyDays: rd.studyDays, capacity: rd.capacity, demand: rd.demand,
        cobertura: round(rd.coverageProjection), feasible: rd.feasible,
        daysLeft: rd.daysLeft, deficitCount: rd.deficitCount, deficits: rd.deficits,
      },
    });
  }

  // métricas finales de conceptos
  const finalNow = start + days * DAY;
  const concepts = LE.CONCEPTS.map(c => {
    const st = O.PROGRESS.concepts[c.id] || {};
    return {
      id: c.id, name: c.name, size: c.size,
      status: st.status || "nuevo",
      mastery: st.masteryStatus || "nuevo",
      review: st.reviewState || "futuro",
      interval: round(st.interval || 0),
      examDeficit: !!st.examDeficit,
      correctReps: st.correctReps || 0,
      framings: (st.framingsCorrect || []).length,
      spanDays: st.correctRepDays && st.correctRepDays.length > 1
        ? st.correctRepDays[st.correctRepDays.length-1] - st.correctRepDays[0] : 0,
      confidence: round(st.diagConfidence || 0),
      trueStrength: round(truth[c.id].s),
      lastSeenDay: conceptLastSeenDay[c.id] ?? null,
      neededRetrievals: LE.neededRetrievals(st),
    };
  });

  return {
    user, days, start, examDate,
    trace, concepts, seenQ, conceptLastSeenDay,
    feasibleFlips, honestFlags,
    finalOverview: trace[trace.length - 1].overview,
    finalReadiness: trace[trace.length - 1].readiness,
  };
}

function round(x){ return Math.round((x || 0) * 100) / 100; }
function mapRound(o){ const r = {}; for(const k in o) r[k] = o[k] == null ? null : round(o[k]); return r; }

/* ------------------------------------------------------------
   Ayudas de aserción para los escenarios
------------------------------------------------------------ */
function maxRepeatWithinSessions(res, env){
  // separación mínima (en nº de sesiones de estudio) con que se repite una
  // misma pregunta — ignorando conceptos con <=3 preguntas, donde repetir
  // antes es inevitable.
  const studyDays = res.trace.filter(t => t.studied).map(t => t.day);
  const idxOfDay = {}; studyDays.forEach((d, i) => idxOfDay[d] = i);
  const bigEnough = qid => {
    const cid = env && env.LE.CONCEPT_OF_Q[qid];
    const meta = cid && env.LE.CONCEPT_BY_ID[cid];
    return meta ? meta.questionIds.length > 3 : true;
  };
  let worst = Infinity;
  for(const qid in res.seenQ){
    if(!bigEnough(qid)) continue;
    const idxs = res.seenQ[qid].map(d => idxOfDay[d]).sort((a,b)=>a-b);
    for(let i = 1; i < idxs.length; i++) worst = Math.min(worst, idxs[i] - idxs[i-1]);
  }
  return worst; // Infinity si nada se repitió
}
function maxSilenceDays(res){
  // mayor nº de días que un concepto CON contenido pasa sin aparecer,
  // una vez que ya ha sido tocado al menos una vez
  let worst = 0;
  const byConcept = {};
  res.trace.forEach(t => {
    (t.answers || []).forEach(a => (byConcept[a.concept] = byConcept[a.concept] || []).push(t.day));
  });
  for(const cid in byConcept){
    const days = byConcept[cid];
    for(let i = 1; i < days.length; i++) worst = Math.max(worst, days[i] - days[i-1]);
    // hueco desde la última vez hasta el final
    worst = Math.max(worst, res.days - days[days.length - 1]);
  }
  return worst;
}

module.exports = { loadEngine, makeUser, simulate, mulberry32,
                   maxRepeatWithinSessions, maxSilenceDays, DAY };
