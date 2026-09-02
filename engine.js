/* ============================================================
   OPE365 · Motor de aprendizaje (Learning Engine)
   ------------------------------------------------------------
   Fase 1: motor + priorizador + generador de sesión + capa de
   examen. SIN interfaz. Se valida con tests/sim.js antes de
   integrar ninguna pantalla.

   Documentos de diseño:
     docs/plan-inteligente.html   — arquitectura
     docs/memory-engine.html      — este motor, con cada
                                    parámetro etiquetado

   No toca app.js. Lee/escribe claves nuevas en OPE.PROGRESS
   (plan, events, concepts) y llama a OPE.persist().
   Todo el tiempo entra por un parámetro `now` (ms) para que la
   simulación controle el reloj.
============================================================ */
(function(){
"use strict";
const O = window.OPE;
if(!O){ console.warn("engine.js: window.OPE no disponible"); return; }

const DAY = 86400000;
function save(){ if(!O.LE || !O.LE._noPersist) O.persist(); }

/* ============================================================
   PARÁMETROS — la "tabla de honestidad" en forma de código.
   Categorías:  PRINCIPIO (ciencia) · PRODUCTO (decisión) ·
                HEURÍSTICA (punto de partida) · CALIBRABLE
   Solo se tocan aquí, nunca desde la interfaz.
============================================================ */
const P = {
  // — "asentado": evidencia suficiente de dominio ACTUAL (reversible).
  //   PRODUCTO. Umbral conservador para preparación de oposición.
  //   3 recuperaciones (Rawson) + 4 condiciones como hipótesis inicial.
  masteryReps:        3,      // recuperaciones correctas
  masterySpanDays:    3,      // separación temporal real (primera→última)
  masteryInterval:    7,      // intervalo alcanzado, días
  masteryAcc:         0.8,    // acierto en las últimas 5 recuperaciones
  masteryFramings:    2,      // nº de framings distintos acertados (transferencia)
  masteryConfidence:  0.45,   // confianza mínima del diagnóstico para declarar 'asentado'

  // — retención objetivo. PRODUCTO. Solo configurable aquí.
  //   0.90 = priorizar no olvidar sobre eficiencia.
  targetRetention:    0.90,

  // — curva de olvido. HEURÍSTICA. R(t)=2^(-kR·t/interval); kR fija R=target en t=interval.
  get kR(){ return -Math.log2(this.targetRetention); },   // ≈ 0.152 para 0.90

  // — progresión de intervalos. HEURÍSTICA (rango de SM-2 / FSRS; valores nuestros).
  interval0:   { again: 1, hard: 2, good: 3 },   // primera revisión, días
  growth:      2.2,     // multiplicador tras un "good"
  hardFactor:  0.35,    // "hard" crece (growth-1)·hardFactor
  lapseFactor: 0.4,     // "again": interval ·= lapseFactor
  spacingBonusMin: 0.8, // recuperar tras hueco < intervalo previo vale menos
  spacingBonusMax: 1.4, // recuperar tras hueco largo vale más (efecto de espaciado, PRINCIPIO)
  difficultyDamp: 0.15, // amortigua el crecimiento en conceptos intrínsecamente duros
  intervalMin: 1, intervalMax: 365,

  // — capa de examen. PRODUCTO.
  safetyBufferDays:   2,    // ninguna revisión en los 2 días previos al examen
  defaultHorizonDays: 90,   // horizonte operativo si aún no hay fecha

  // — anti-repetición. PRODUCTO.
  minRepeatSessions:  3,    // una pregunta no se repite en N sesiones
  minRepeatHours:    20,
  maxSilenceDays:    21,    // ningún concepto con contenido más de N días sin aparecer

  // — ritmo. HEURÍSTICA (se sustituye por la media móvil real).
  secPerQuestion: 28,
  secPerFlashcard: 14,

  // — pesos del priorizador. CALIBRABLE (empiezan como juicio).
  //   Cada fase modula estos multiplicadores (ver phaseProfile).
  w: { olvido:1.0, atraso:0.7, error:0.9, examen:0.0, cobertura:1.2,
       transfer:0.4, importancia:0.3, stableDamp:0.8 },
};

/* Perfil por recta final. PRODUCTO. Devuelve overrides de pesos + mezcla de cubos. */
function phaseProfile(daysLeft){
  if(daysLeft == null || daysLeft > 30)
    return { name:"construir",   w:{ examen:0.0, cobertura:1.2, transfer:0.4 },
             mix:{ repaso:.45, refuerzo:.30, mixto:.25, examen:.00 }, newAllowed:true };
  if(daysLeft > 14)
    return { name:"consolidar",  w:{ examen:0.4, cobertura:0.9, transfer:0.7 },
             mix:{ repaso:.40, refuerzo:.25, mixto:.25, examen:.10 }, newAllowed:true };
  if(daysLeft > 7)
    return { name:"mezclar",     w:{ examen:1.0, cobertura:0.5, transfer:0.9 },
             mix:{ repaso:.35, refuerzo:.30, mixto:.20, examen:.15 }, newAllowed:true };
  if(daysLeft > 2)
    return { name:"simular",     w:{ examen:1.8, atraso:1.0, cobertura:0.25, transfer:1.0 },
             mix:{ repaso:.30, refuerzo:.35, mixto:.15, examen:.20 }, newAllowed:false };
  if(daysLeft >= 1)
    return { name:"asegurar",    w:{ examen:2.2, error:1.6, atraso:1.2, cobertura:0.0, transfer:0.6 },
             mix:{ repaso:.40, refuerzo:.40, mixto:.05, examen:.15 }, newAllowed:false };
  return   { name:"aflojar",     w:{ examen:1.0, error:1.4, cobertura:0.0, transfer:0.3 },
             mix:{ repaso:.55, refuerzo:.35, mixto:.05, examen:.05 }, newAllowed:false };
}

/* ============================================================
   CONCEPTOS — derivados del banco: un concepto = section:topic
   con al menos 1 pregunta. ~61.
============================================================ */
const FRAMINGS = ["conceptual","ruta","caso","discriminacion","atajo","vf","emparejamiento"];
function framingOf(q){
  if(!q) return "conceptual";
  if(q.tipo === "verdadero_falso") return "vf";
  if(q.tipo === "emparejamiento") return "emparejamiento";
  if(q.categoria === "atajo") return "atajo";
  if(q.negativa || q.tipo === "seleccion_multiple") return "discriminacion";
  if(q.categoria === "ruta") return "ruta";
  if(/necesit|quieres|has (copiado|escrito|pegado)|un usuario|est[áa]s (trabajando|redactando|maquetando)|para conseguir|quer[íi]as/i.test(q.enunciado||""))
    return "caso";
  return "conceptual";
}

const CONCEPTS = (function(){
  const secName = {}; (O.TAXONOMY_SECTIONS||[]).forEach(s=>{
    secName[s.id] = s.name;
    (s.topics||[]).forEach(t=> secName[s.id+":"+t.id] = t.name);
  });
  const map = {};
  (O.QUESTIONS||[]).forEach(q=>{
    if(!q.section || !q.topic) return;
    const id = q.section + ":" + q.topic;
    if(!map[id]) map[id] = {
      id, section:q.section, topic:q.topic,
      name: (secName[q.section]||q.section) + " · " + (secName[id]||q.topic),
      questionIds: [], flashcardIds: [], framings: new Set(),
    };
    map[id].questionIds.push(q.id);
    map[id].framings.add(framingOf(q));
  });
  (O.FLASHCARDS||[]).forEach(c=>{
    if(!c.section || !c.topic) return;
    const id = c.section + ":" + c.topic;
    if(map[id]) map[id].flashcardIds.push(c.canonicalId);
  });
  return Object.values(map).map(c=>({ ...c, size:c.questionIds.length, framings:[...c.framings] }));
})();
const CONCEPT_BY_ID = {}; CONCEPTS.forEach(c=> CONCEPT_BY_ID[c.id]=c);
const CONCEPT_OF_Q = {}; CONCEPTS.forEach(c=> c.questionIds.forEach(qid=> CONCEPT_OF_Q[qid]=c.id));
const CONCEPT_OF_CARD = {}; CONCEPTS.forEach(c=> c.flashcardIds.forEach(cid=> CONCEPT_OF_CARD[cid]=c.id));
const MAX_SIZE = Math.max(1, ...CONCEPTS.map(c=>c.size));

/* dificultad intrínseca del concepto: media de difficulty de sus preguntas (0..1) */
function conceptDifficulty(conceptId){
  const c = CONCEPT_BY_ID[conceptId]; if(!c) return 0.5;
  const w = { baja:0.25, media:0.5, alta:0.8 };
  let sum=0, n=0;
  c.questionIds.forEach(qid=>{ const d=O.Q_BY_ID[qid] && O.Q_BY_ID[qid].difficulty; if(d && w[d]!=null){ sum+=w[d]; n++; } });
  return n ? sum/n : 0.5;
}

/* ============================================================
   ESTADO — PROGRESS.concepts / events / plan / qstate
============================================================ */
function store(){
  const pr = O.PROGRESS;
  if(!pr.concepts) pr.concepts = {};
  if(!pr.events)   pr.events   = [];
  if(!pr.qstate)   pr.qstate   = {};
  if(!pr.plan)     pr.plan     = null;
  return pr;
}
function dayNum(ms){ return Math.floor(ms / DAY); }

function newConcept(){
  return { interval:0, lastReview:null, nextReview:null,
    reps:0, correctReps:0, lapses:0, recall:[], framingsCorrect:[],
    correctRepDays:[], examPerf:[], firstSeen:null,
    status:"nuevo", diagConfidence:0 };
}
function getConcept(id){
  const pr = store();
  if(!pr.concepts[id]) pr.concepts[id] = newConcept();
  return pr.concepts[id];
}

/* retrievabilidad estimada (0..1) */
function retrievability(c, now){
  if(!c || c.lastReview == null || !c.interval) return 0;
  const t = Math.max(0, (now - c.lastReview) / DAY);
  return Math.pow(2, -P.kR * t / c.interval);
}
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
function recentAcc(c){ return c.recall.length ? c.recall.filter(Boolean).length / c.recall.length : 0; }
function spanDays(c){
  if(c.correctRepDays.length < 2) return 0;
  return c.correctRepDays[c.correctRepDays.length-1] - c.correctRepDays[0];
}
function memoryOK(c, now){ return retrievability(c, now||Date.now()) >= 0.75 || c.interval >= P.masteryInterval; }
// transferencia: el estado no guarda su propio id, así que recibe (estado, conceptId)
function transferScoreOf(state, conceptId){
  const avail = (CONCEPT_BY_ID[conceptId] && CONCEPT_BY_ID[conceptId].framings.length) || 1;
  return clamp(state.framingsCorrect.length / Math.max(2, avail), 0, 1);
}

/* estado derivado — SIEMPRE recalculado, por eso "asentado" es reversible */
function deriveStatus(c, now){
  if(!c.reps) return "nuevo";
  const acc = recentAcc(c);
  const asentado =
       c.correctReps      >= P.masteryReps
    && c.correctRepDays.length >= P.masteryReps
    && spanDays(c)        >= P.masterySpanDays
    && c.interval         >= P.masteryInterval
    && acc                >= P.masteryAcc
    && c.framingsCorrect.length >= P.masteryFramings
    && (c.diagConfidence || 0)  >= P.masteryConfidence;   // sin datos suficientes no se declara dominio
  if(asentado){
    // si el recuerdo estimado ha caído demasiado, el concepto vuelve a
    // necesitar consolidación aunque la evidencia histórica siga ahí
    if(retrievability(c, now) < 0.5) return "consolidando";
    return (c.nextReview && c.nextReview > now) ? "repaso" : "asentado";
  }
  if(c.correctReps >= 1 && acc >= 0.5) return "consolidando";
  return "aprendiendo";
}
/* confianza del diagnóstico (INTERNA, 0..1): cuánto se fía el motor de conocer
   el verdadero estado del concepto. Sube con volumen de respuestas, variedad de
   framings y dispersión temporal. Nunca se muestra al usuario. */
function deriveConfidence(c){
  const vol   = clamp((c.reps + (c.examPerf||[]).length * 2) / 10, 0, 1);
  const varia = clamp((c.framingsCorrect||[]).length / 4, 0, 1);
  const disp  = clamp(spanDays(c) / 21, 0, 1);
  return clamp(0.45 * vol + 0.35 * varia + 0.20 * disp, 0, 1);
}

/* ============================================================
   REGISTRO DE EVENTOS + ACTUALIZACIÓN DEL MODELO
============================================================ */
function gradeFromAnswer(correct, ms, conceptId){
  if(!correct) return "again";
  if(ms && ms > 3200) return "hard";   // acierto lento
  return "good";
}
function gradeFromFlashcard(rating){   // 'no'|'dificil'|'si'
  return rating === "no" ? "again" : rating === "dificil" ? "hard" : "good";
}

/* Núcleo: registra un evento y actualiza el concepto. */
function recordEvent(ev){
  const pr = store();
  const now = ev.ts || Date.now();
  const conceptId = ev.concept
    || (ev.kind === "fc" ? CONCEPT_OF_CARD[ev.ref] : CONCEPT_OF_Q[ev.ref]);
  const framing = ev.framing
    || (ev.kind === "q" && O.Q_BY_ID[ev.ref] ? framingOf(O.Q_BY_ID[ev.ref]) : "conceptual");

  pr.events.push({ ts:now, kind:ev.kind, ref:ev.ref, concept:conceptId,
    framing, grade:ev.grade, correct:!!ev.correct, ms:ev.ms||null,
    confidence:ev.confidence||null });
  if(pr.events.length > 4000) pr.events = pr.events.slice(-3000);

  // estado ligero de la pregunta (antirrepetición + señal de competencia)
  if(ev.kind === "q" && ev.ref){
    const qs = pr.qstate[ev.ref] || { seen:0, correct:0, wrong:0, last:0 };
    qs.seen++; qs.last = now; ev.correct ? qs.correct++ : qs.wrong++;
    pr.qstate[ev.ref] = qs;
  }

  if(!conceptId){ save(); return; }
  updateConceptState(conceptId, ev.grade, framing, ev.kind === "exam", now);
  save();
}

function updateConceptState(conceptId, grade, framing, isExam, now){
  const c = getConcept(conceptId);
  const prevInterval = c.interval || 0;

  if(grade === "again"){
    c.interval = Math.max(P.intervalMin, (c.interval || 1) * P.lapseFactor);
    c.lapses++;
    c.recall.push(false);
  } else {
    const gap = prevInterval > 0 && c.lastReview
      ? ((now - c.lastReview) / DAY) / prevInterval : 1;
    const spacingBonus = clamp(gap, P.spacingBonusMin, P.spacingBonusMax);
    const gr = grade === "hard" ? (1 + (P.growth - 1) * P.hardFactor) : P.growth;
    const diffFactor = 1 - P.difficultyDamp * (conceptDifficulty(conceptId) - 0.5) * 2;
    c.interval = c.interval
      ? c.interval * gr * spacingBonus * diffFactor
      : P.interval0[grade];
    c.correctReps++;
    c.recall.push(true);
    if(framing && !c.framingsCorrect.includes(framing)) c.framingsCorrect.push(framing);
    const dk = dayNum(now);
    if(!c.correctRepDays.includes(dk)) c.correctRepDays.push(dk);
  }

  c.interval = clamp(c.interval, P.intervalMin, P.intervalMax);
  c.reps++;
  c.recall = c.recall.slice(-5);
  c.lastReview = now;
  c.nextReview = now + c.interval * DAY;
  if(!c.firstSeen) c.firstSeen = now;
  if(isExam) c.examPerf = c.examPerf.concat(grade !== "again").slice(-12);
  c.diagConfidence = deriveConfidence(c);   // antes de deriveStatus: lo condiciona
  c.status = deriveStatus(c, now);
}

/* Siembra el estado de conceptos desde el progreso ya existente
   (answers / flashcards) — un intento previo = una recuperación de
   baja estabilidad. Idempotente: no re-siembra si ya hay eventos. */
function seedFromLegacy(now){
  const pr = store();
  now = now || Date.now();
  if(pr.events.length || pr._seeded) return;
  const perConcept = {};
  Object.keys(pr.answers || {}).forEach(qid=>{
    const cid = CONCEPT_OF_Q[qid]; if(!cid) return;
    const a = pr.answers[qid];
    (perConcept[cid] = perConcept[cid] || []).push({
      correct: !!a.correcta, ts: a.ultimaVez || now - 7*DAY,
      framing: O.Q_BY_ID[qid] ? framingOf(O.Q_BY_ID[qid]) : "conceptual" });
  });
  Object.keys(pr.flashcards || {}).forEach(cardId=>{
    const cid = CONCEPT_OF_CARD[cardId]; if(!cid) return;
    const f = pr.flashcards[cardId];
    (perConcept[cid] = perConcept[cid] || []).push({
      correct: !!f.dominada, ts: f.ultimaVez || now - 7*DAY, framing:"conceptual" });
  });
  Object.keys(perConcept).forEach(cid=>{
    perConcept[cid].sort((a,b)=> a.ts - b.ts).forEach(e=>{
      updateConceptState(cid, e.correct ? "good" : "again", e.framing, false, e.ts);
    });
  });
  // el estado sembrado nace algo inestable: recorta intervalos largos
  Object.values(pr.concepts).forEach(c=>{ if(c.interval > 10) c.interval = 10 * (1 + Math.random()*0); c.nextReview = c.lastReview + c.interval*DAY; });
  pr._seeded = true;
  save();
}

/* ============================================================
   PLAN
============================================================ */
function setPlan(opts){
  const pr = store();
  pr.plan = {
    examDate: opts.examDate || null,           // ms o null
    minutesPerDay: opts.minutesPerDay || 20,
    weekdays: opts.weekdays || [1,2,3,4,5],     // 0=domingo … 6=sábado
    objetivo: opts.objetivo || "consolidar",
    createdAt: Date.now(), lastRecalc: Date.now(),
  };
  save();
  return pr.plan;
}
function planCtx(now){
  const pr = store();
  now = now || Date.now();
  const plan = pr.plan || { minutesPerDay:20, weekdays:[1,2,3,4,5], examDate:null, objetivo:"consolidar" };
  const horizonMs = plan.examDate || (now + P.defaultHorizonDays*DAY);
  const criticalMs = plan.examDate ? plan.examDate - P.safetyBufferDays*DAY : horizonMs;
  const daysLeft = plan.examDate ? Math.max(0, Math.round((plan.examDate - now)/DAY)) : null;
  return { now, plan, horizonMs, criticalMs, daysLeft,
           hasExam: !!plan.examDate, profile: phaseProfile(daysLeft) };
}
function countStudyDays(fromMs, toMs, weekdays){
  let n = 0;
  for(let d = dayNum(fromMs); d < dayNum(toMs); d++){
    const wd = new Date(d*DAY).getUTCDay();
    if(weekdays.includes(wd)) n++;
  }
  return Math.max(0, n);
}
function observedSecPerItem(kind){
  const pr = store();
  const evs = pr.events.filter(e=> e.kind === (kind==="fc"?"fc":"q") && e.ms).slice(-60);
  if(evs.length < 8) return kind==="fc" ? P.secPerFlashcard : P.secPerQuestion;
  const avg = evs.reduce((s,e)=> s + e.ms/1000, 0) / evs.length;
  return clamp(avg, 12, 120);
}
function itemsForMinutes(minutes){
  return clamp(Math.round(minutes * 60 / observedSecPerItem("q")), 3, 50);
}

/* ============================================================
   PRIORIZADOR
============================================================ */
function conceptPriority(conceptId, ctx){
  const pr = store();
  const w = Object.assign({}, P.w, ctx.profile.w);
  const c = pr.concepts[conceptId];
  const meta = CONCEPT_BY_ID[conceptId];
  const sizeNorm = meta ? meta.size / MAX_SIZE : 0;

  if(!c || !c.reps){
    return { score: w.cobertura * 1 + w.importancia * sizeNorm, status:"nuevo" };
  }
  const R = retrievability(c, ctx.now);
  const overdue = c.nextReview ? clamp((ctx.now - c.nextReview) / (c.interval*DAY || DAY), 0, 1.5) : 0;
  const recentErr = c.recall.length ? c.recall.filter(x=>!x).length / c.recall.length : 0;
  const examP = ctx.hasExam ? examPressure(conceptId, ctx) : 0;
  const transferGap = memoryOK(c, ctx.now) ? (1 - transferScoreOf(c, conceptId)) : 0;
  const lowConf = (1 - c.diagConfidence) * 0.3;

  let score =
      w.olvido      * (1 - R)
    + w.atraso      * overdue
    + w.error       * recentErr
    + w.examen      * Math.min(examP, 1)
    + w.transfer    * transferGap
    + w.importancia * sizeNorm
    + lowConf;

  if((c.status === "asentado" || c.status === "repaso") && c.nextReview > ctx.now){
    score -= w.stableDamp * (1 - overdue);
  }
  return { score: Math.max(0, score), status:c.status, R, overdue, examP };
}

/* nº de recuperaciones que faltan para "asentado" */
function neededRetrievals(c){
  if(!c || !c.reps) return P.masteryReps;
  if(c.status === "asentado" || c.status === "repaso") return 0;
  const recall = c.recall || [];
  const acc = recall.length ? recall.filter(Boolean).length / recall.length : 0;
  let missing = Math.max(0, P.masteryReps - (c.correctReps || 0));
  if((c.interval || 0) < P.masteryInterval) missing = Math.max(missing, 1);
  if(acc < P.masteryAcc) missing = Math.max(missing, 1);
  if((c.framingsCorrect || []).length < P.masteryFramings) missing = Math.max(missing, 1);
  return missing;
}
function examPressure(conceptId, ctx){
  const pr = store();
  const c = pr.concepts[conceptId];
  const need = neededRetrievals(c);
  if(!need) return 0;
  const studyDays = countStudyDays(ctx.now, ctx.criticalMs, ctx.plan.weekdays);
  if(studyDays <= 0) return 3;
  // reparto: cada concepto "posee" una fracción del tiempo ∝ nº de conceptos activos
  const activeConcepts = CONCEPTS.filter(x=>{
    const st = pr.concepts[x.id];
    return !st || st.status !== "asentado";
  }).length || 1;
  const opportunities = studyDays / Math.max(1, activeConcepts / itemsForMinutes(ctx.plan.minutesPerDay));
  return clamp(need / Math.max(1, opportunities), 0, 3);
}

/* conceptos vencidos, ordenados por prioridad */
function rankedConcepts(ctx){
  return CONCEPTS.map(c=>{
    const p = conceptPriority(c.id, ctx);
    return { id:c.id, name:c.name, size:c.size, ...p };
  }).sort((a,b)=> b.score - a.score);
}
function dueConcepts(ctx){
  const pr = store();
  return CONCEPTS.filter(c=>{
    const st = pr.concepts[c.id];
    return st && st.nextReview && st.nextReview <= ctx.now;
  }).map(c=>c.id);
}

/* ============================================================
   SELECCIÓN DE PREGUNTA PARA UN CONCEPTO
============================================================ */
function recentlySeen(qid, ctx){
  const pr = store();
  const qs = pr.qstate[qid];
  if(!qs) return false;
  if(ctx.now - qs.last < P.minRepeatHours*3600000) return true;
  // ¿en alguna de las últimas N sesiones?
  const sessTs = (pr._recentSessionStarts || []).slice(-P.minRepeatSessions);
  return sessTs.some(ts => qs.last >= ts);
}
function bestQuestion(conceptId, ctx, avoid){
  const meta = CONCEPT_BY_ID[conceptId]; if(!meta) return null;
  const pr = store();
  const c = pr.concepts[conceptId];
  let pool = meta.questionIds.filter(id => O.Q_BY_ID[id] && !avoid.has(id));
  if(!pool.length) return null;
  let fresh = pool.filter(id => !recentlySeen(id, ctx));
  if(fresh.length) pool = fresh;

  // preferir un framing aún no acertado si el concepto ya se repitió
  if(c && c.correctReps >= 2){
    const unseen = pool.filter(id => !(c.framingsCorrect||[]).includes(framingOf(O.Q_BY_ID[id])));
    if(unseen.length) pool = unseen;
  }
  // dificultad acorde: si el usuario falla el concepto, preferir fácil; si lo domina, difícil
  const acc = c ? recentAcc(c) : 0.5;
  const wantHard = acc >= 0.8 && c && c.correctReps >= 2;
  const rank = { baja: wantHard?2:0, media:1, alta: wantHard?0:2 };
  pool = pool.slice().sort((a,b)=>{
    const da = rank[O.Q_BY_ID[a].difficulty] ?? 1, db = rank[O.Q_BY_ID[b].difficulty] ?? 1;
    if(da !== db) return da - db;
    const sa = (pr.qstate[a]||{}).seen||0, sb = (pr.qstate[b]||{}).seen||0;
    return sa - sb;   // desempate: la menos vista
  });
  return pool[0];
}

/* ============================================================
   GENERADOR DE SESIÓN
============================================================ */
function buildSmartSession(minutes, ctx){
  ctx = ctx || planCtx();
  const pr = store();
  const n = itemsForMinutes(minutes);
  const mix = ctx.profile.mix;
  const target = {
    repaso:   Math.round(n * mix.repaso),
    refuerzo: Math.round(n * mix.refuerzo),
    mixto:    Math.round(n * mix.mixto),
    examen:   Math.round(n * mix.examen),
  };

  const ranked = rankedConcepts(ctx);
  const due = new Set(dueConcepts(ctx));
  const avoid = new Set();
  const items = [];
  const usedConcepts = new Set();

  function take(conceptId, bucket, isExam){
    const qid = bestQuestion(conceptId, ctx, avoid);
    if(qid){
      avoid.add(qid);
      const q = O.Q_BY_ID[qid];
      items.push({ kind:"q", ref:qid, concept:conceptId, framing:framingOf(q), bucket, isExam:!!isExam });
      usedConcepts.add(conceptId);
      return true;
    }
    // sin pregunta libre → probar flashcard del concepto
    const meta = CONCEPT_BY_ID[conceptId];
    const card = meta && meta.flashcardIds.find(cid => !avoid.has(cid));
    if(card){
      avoid.add(card);
      items.push({ kind:"fc", ref:card, concept:conceptId, framing:"conceptual", bucket, isExam:false });
      usedConcepts.add(conceptId);
      return true;
    }
    return false;
  }

  // 0. RESCATE — ningún concepto ya visto puede pasar de maxSilenceDays sin reaparecer
  const silent = CONCEPTS.filter(c=>{
    const st = pr.concepts[c.id];
    return st && st.lastReview && (ctx.now - st.lastReview) > P.maxSilenceDays * DAY;
  }).sort((a,b)=> pr.concepts[a.id].lastReview - pr.concepts[b.id].lastReview);
  for(const c of silent){
    if(items.length >= n - 1) break;
    take(c.id, "repaso");
  }

  // 1. REPASO — conceptos vencidos por prioridad
  const dueRanked = ranked.filter(r => due.has(r.id));
  for(const r of dueRanked){ if(items.filter(i=>i.bucket==="repaso").length >= target.repaso) break; take(r.id,"repaso"); }

  // 2. REFUERZO — más error reciente + baja consolidación
  const weak = ranked.filter(r => {
    const st = pr.concepts[r.id];
    return st && st.reps && recentAcc(st) < 0.7 && st.status !== "asentado";
  }).slice(0, 8);
  for(const r of weak){ if(items.filter(i=>i.bucket==="refuerzo").length >= target.refuerzo) break; take(r.id,"refuerzo"); }

  // 3. MIXTO — interleaving: vencidos restantes + algún concepto nuevo, barajado entre secciones
  const mixPool = [];
  ranked.forEach(r => { if(!usedConcepts.has(r.id)){
    const st = pr.concepts[r.id];
    if(!st || st.status === "nuevo"){ if(ctx.profile.newAllowed) mixPool.push(r.id); }
    else if(r.score > 0.15) mixPool.push(r.id);
  }});
  // barajar por sección para forzar identificación
  const bySec = {};
  mixPool.forEach(id => (bySec[id.split(":")[0]] = bySec[id.split(":")[0]] || []).push(id));
  // recorrido round-robin por secciones, acotado a mixPool.length pasos
  const secs = Object.keys(bySec);
  for(let step = 0, si = 0; step < mixPool.length && secs.length; step++, si++){
    if(items.filter(i=>i.bucket==="mixto").length >= target.mixto) break;
    const k = si % secs.length;
    const id = (bySec[secs[k]] || []).shift();
    if(id) take(id, "mixto");
    if(!bySec[secs[k]] || !bySec[secs[k]].length){ secs.splice(k, 1); si--; }
  }

  // 4. EXAMEN — bloque cronometrado, sin feedback, distribución equilibrada
  if(target.examen > 0){
    const examConcepts = shuffleDet(CONCEPTS.map(c=>c.id).filter(id => {
      const st = pr.concepts[id]; return st && st.reps;   // solo lo ya estudiado
    }), ctx.now);
    for(const id of examConcepts){
      if(items.filter(i=>i.bucket==="examen").length >= target.examen) break;
      take(id, "examen", true);
    }
  }

  // rellenar hasta n si falta (con lo siguiente en prioridad)
  for(const r of ranked){
    if(items.length >= n) break;
    if(usedConcepts.has(r.id)) continue;
    if(!ctx.profile.newAllowed){ const st=pr.concepts[r.id]; if(!st||!st.reps) continue; }
    take(r.id, "mixto");
  }

  // registrar inicio de sesión (para antirrepetición entre sesiones)
  pr._recentSessionStarts = (pr._recentSessionStarts || []).concat(ctx.now).slice(-10);
  save();

  const goal = sessionGoal(items, ctx);
  return {
    items: items.slice(0, n),
    minutes, estItems:n, phase: ctx.profile.name,
    mix: countBuckets(items), goal,
    concepts: [...usedConcepts],
    topPriority: dueRanked[0] || weak[0] || ranked.find(r=>usedConcepts.has(r.id)) || null,
  };
}
function countBuckets(items){
  const c = { repaso:0, refuerzo:0, mixto:0, examen:0 };
  items.forEach(i=> c[i.bucket]++);
  return c;
}
function sessionGoal(items, ctx){
  const consolidables = new Set(items.filter(i=>i.bucket==="repaso"||i.bucket==="refuerzo").map(i=>i.concept)).size;
  const transfer = items.filter(i=> i.bucket==="mixto" && ["caso","ruta","discriminacion"].includes(i.framing)).length;
  if(items.length <= 12) return `Consolidar ${consolidables} concepto${consolidables===1?"":"s"}.`;
  if(items.length <= 26) return `Recuperar ${consolidables} conceptos${transfer?` + ${transfer} de transferencia`:""}.`;
  return "Sesión completa + diagnóstico.";
}
function shuffleDet(arr, seedN){
  const a = arr.slice();
  let s = (seedN >>> 0) || 1;
  for(let i=a.length-1;i>0;i--){
    s = (s*1664525 + 1013904223) >>> 0;
    const j = s % (i+1);
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ============================================================
   RECUPERACIÓN DE ATRASOS
============================================================ */
function backlogPlan(ctx){
  ctx = ctx || planCtx();
  const pr = store();
  const overdue = CONCEPTS.map(c=>c.id).filter(id=>{
    const st = pr.concepts[id]; return st && st.nextReview && st.nextReview <= ctx.now;
  });
  const cap = itemsForMinutes(ctx.plan.minutesPerDay);
  if(overdue.length <= cap * 1.5) return { needed:false, overdue:overdue.length };
  const scored = overdue.map(id=>{
    const st = pr.concepts[id];
    const risk = (1 - retrievability(st, ctx.now)) * ((CONCEPT_BY_ID[id].size)/MAX_SIZE + 0.3);
    return { id, risk };
  }).sort((a,b)=> b.risk - a.risk);
  const todayN = Math.round(cap * 1.2);
  return {
    needed:true, overdue:overdue.length,
    today: scored.slice(0, todayN).map(s=>s.id),
    rescheduled: overdue.length - todayN,
    message: "Has estado unos días sin estudiar. No pasa nada. Hemos priorizado tus repasos más importantes.",
  };
}

/* ============================================================
   COBERTURA / PREPARACIÓN — 5 dimensiones, sin colapsar
============================================================ */
// índice eventos-por-concepto, memoizado por longitud del log (evita O(eventos·conceptos))
let _idxCache = { len:-1, map:null };
function eventsByConcept(){
  const pr = store();
  if(_idxCache.len === pr.events.length && _idxCache.map) return _idxCache.map;
  const map = {};
  pr.events.forEach(e=>{ if(e.concept) (map[e.concept] = map[e.concept] || []).push(e); });
  _idxCache = { len: pr.events.length, map };
  return map;
}
function conceptDimensions(conceptId, now, idx){
  now = now || Date.now();
  const c = store().concepts[conceptId];
  const meta = CONCEPT_BY_ID[conceptId];
  if(!c || !c.reps) return { memoria:0, competencia:0, transferencia:0, cobertura:0, examen:null, confianza:0, status:"nuevo" };
  const evAll = (idx || eventsByConcept())[conceptId] || [];
  const R = retrievability(c, now);
  const memoria = clamp(R * (c.interval >= P.masteryInterval ? 1 : c.interval / P.masteryInterval), 0, 1);
  // competencia: acierto en framings exigentes
  const hardFr = ["caso","ruta","discriminacion"];
  const evs = evAll.filter(e=> e.kind !== "exam" && hardFr.includes(e.framing));
  const competencia = evs.length ? evs.filter(e=>e.correct).length / evs.length : (c.correctReps>=2 ? 0.5 : 0.2);
  const transferencia = transferScoreOf(c, conceptId);
  const seen = new Set(evAll.filter(e=>e.kind==="q").map(e=>e.ref));
  const cobertura = meta ? clamp(seen.size / Math.min(meta.size, 8), 0, 1) : 0;
  const examen = c.examPerf.length ? c.examPerf.filter(Boolean).length / c.examPerf.length : null;
  return { memoria, competencia, transferencia, cobertura, examen, confianza:c.diagConfidence, status:c.status };
}
function overview(now){
  now = now || Date.now();
  const pr = store();
  const total = CONCEPTS.length;
  let seen=0, recuperado=0, asentado=0, atencion=0, sumInterval=0, nInterval=0;
  const dims = { memoria:0, competencia:0, transferencia:0, cobertura:0 };
  let examSum=0, examN=0, wsum=0;
  const idx = eventsByConcept();
  CONCEPTS.forEach(c=>{
    const st = pr.concepts[c.id];
    const w = c.size;
    if(st && st.reps){
      seen++;
      if(st.correctReps >= 1) recuperado++;
      if(st.status === "asentado" || st.status === "repaso") asentado++;
      if(st.status === "aprendiendo" || (st.reps && recentAcc(st) < 0.6)) atencion++;
      sumInterval += st.interval; nInterval++;
      const d = conceptDimensions(c.id, now, idx);
      dims.memoria += d.memoria*w; dims.competencia += d.competencia*w;
      dims.transferencia += d.transferencia*w; dims.cobertura += d.cobertura*w;
      if(d.examen != null){ examSum += d.examen*w; examN += w; }
      wsum += w;
    }
  });
  const norm = k => wsum ? dims[k]/wsum : 0;
  return {
    conceptsTotal: total,
    cobertura: seen/total, recuperado: recuperado/total, consolidacion: asentado/total,
    necesitanAtencion: atencion, pendientes: total - seen,
    estabilidadMediaDias: nInterval ? median(CONCEPTS.map(c=>pr.concepts[c.id]).filter(Boolean).map(s=>s.interval)) : 0,
    dimensiones: {
      memoria: norm("memoria"), competencia: norm("competencia"),
      transferencia: norm("transferencia"), cobertura: norm("cobertura"),
      rendimientoExamen: examN ? examSum/examN : null,
    },
    veredicto: verdict(seen/total, asentado/total),
  };
}
function verdict(cov, cons){
  if(cov < 0.3) return "empezando";
  if(cons < 0.4) return "en construcción";
  if(cons < 0.7) return "bien encaminado";
  return "bien preparado";
}
function median(a){ if(!a.length) return 0; const s=a.slice().sort((x,y)=>x-y); const m=s.length>>1;
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2; }

/* ============================================================
   MOTOR DE PREPARACIÓN — proyección capacidad vs demanda
============================================================ */
function examReadiness(ctx, minutesOverride){
  ctx = ctx || planCtx();
  const pr = store();
  const minutes = minutesOverride || ctx.plan.minutesPerDay;
  const endMs = ctx.hasExam ? ctx.criticalMs : ctx.horizonMs;
  const studyDays = countStudyDays(ctx.now, endMs, ctx.plan.weekdays);
  const itemsPerDay = itemsForMinutes(minutes);
  const capacity = studyDays * itemsPerDay;

  let demand = 0;
  CONCEPTS.forEach(c=>{
    const st = pr.concepts[c.id];
    demand += neededRetrievals(st);
    // repasos proyectados: si el concepto está vivo, ~1 revisión por cada "interval" en la ventana
    if(st && st.interval){
      const daysWindow = studyDays * (7 / Math.max(1, ctx.plan.weekdays.length));
      demand += clamp(daysWindow / Math.max(P.masteryInterval, st.interval), 0, 6);
    }
  });
  const coverageProjection = demand > 0 ? Math.min(1, capacity / demand) : 1;
  return {
    studyDays, itemsPerDay, capacity, demand: Math.round(demand),
    coverageProjection,
    feasible: coverageProjection >= 0.95,
    daysLeft: ctx.daysLeft,
    hint: minutesOverride ? null : (function(){
      const more = examReadiness(ctx, minutes + 10).coverageProjection;
      return more - coverageProjection > 0.03
        ? `Con ${minutes+10} min/día pasarías de ${Math.round(coverageProjection*100)}% a ${Math.round(more*100)}%.`
        : null;
    })(),
  };
}

/* ============================================================
   RECÁLCULO — tras sesión / simulacro / cambio de fecha / atraso
============================================================ */
function recalc(now){
  const pr = store();
  now = now || Date.now();
  Object.keys(pr.concepts).forEach(id=>{
    const c = pr.concepts[id];
    c.diagConfidence = deriveConfidence(c);
    c.status = deriveStatus(c, now);
  });
  // capa de examen: comprimir revisiones que caen después de la fecha crítica
  const ctx = planCtx(now);
  if(ctx.hasExam){
    CONCEPTS.forEach(c=>{
      const st = pr.concepts[c.id];
      if(!st) return;
      const need = neededRetrievals(st);
      if(!need) return;
      const daysAvail = Math.max(1, countStudyDays(now, ctx.criticalMs, ctx.plan.weekdays));
      if(st.nextReview > ctx.criticalMs || st.interval > daysAvail){
        st.nextReview = now + (daysAvail / (need + 1)) * DAY;
        st.interval = Math.min(st.interval, Math.max(1, daysAvail / (need + 1)));
      }
    });
  }
  if(pr.plan) pr.plan.lastRecalc = now;
  save();
}

/* ============================================================
   API — construir una sesión ejecutable (reutiliza el motor actual)
============================================================ */
function smartSessionRun(minutes, now){
  const ctx = planCtx(now);
  const plan = buildSmartSession(minutes, ctx);
  const qIds = plan.items.filter(i=>i.kind==="q").map(i=>i.ref);
  const cardIds = plan.items.filter(i=>i.kind==="fc").map(i=>i.ref);
  const hasExamBucket = plan.items.some(i=>i.isExam);
  return { plan, qIds, cardIds, hasExamBucket };
}

/* ============================================================
   EXPONER
============================================================ */
O.LE = {
  P, DAY,
  CONCEPTS, CONCEPT_BY_ID, CONCEPT_OF_Q, CONCEPT_OF_CARD, framingOf, conceptDifficulty,
  store, seedFromLegacy, setPlan, planCtx,
  recordEvent, updateConceptState, gradeFromAnswer, gradeFromFlashcard,
  getConcept, retrievability, recentAcc, deriveStatus, deriveConfidence,
  conceptPriority, rankedConcepts, dueConcepts, neededRetrievals, examPressure,
  bestQuestion, buildSmartSession, smartSessionRun, backlogPlan,
  conceptDimensions, overview, examReadiness, recalc,
  countStudyDays, itemsForMinutes,
};

})();
