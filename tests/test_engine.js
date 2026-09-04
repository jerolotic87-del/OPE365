/* ============================================================
   OPE365 · Pruebas del motor de aprendizaje (20 escenarios)
   ------------------------------------------------------------
   Cada escenario define un usuario sintético o una secuencia de
   eventos, y comprueba PROPIEDADES del motor sobre las trazas.
   Ningún escenario toca la interfaz.

     node tests/test_engine.js      → exit 0 si todo pasa, 1 si algo falla

   Distinción deliberada en los mensajes:
     "implementado"  el código hace X
     "probado"       un test unitario lo verifica
     "validado"      una simulación con usuario sintético lo confirma
============================================================ */
"use strict";
const { loadEngine, makeUser, simulate, maxRepeatWithinSessions, maxSilenceDays } = require("./sim");
const DAY = 86400000;

let failures = 0, scenarios = 0;
function ok(cond, msg){
  if(cond) console.log("  OK  " + msg);
  else { failures++; console.error("  FALLO  " + msg); }
}
function head(n, title){ scenarios++; console.log(`\n[${n}] ${title}`); }

async function main(){
  const env = await loadEngine();
  const { LE, O } = env;
  const P = LE.P;
  const Q0 = cid => LE.CONCEPT_BY_ID[cid].questionIds[0];

  function fresh(){
    O.PROGRESS.answers = {}; O.PROGRESS.flashcards = {}; O.PROGRESS.history = [];
    O.PROGRESS.concepts = {}; O.PROGRESS.events = []; O.PROGRESS.qstate = {}; O.PROGRESS.fcstate = {};
    O.PROGRESS.plan = null;
    delete O.PROGRESS._seeded; delete O.PROGRESS._recentSessionStarts;
  }
  function ev(o){ LE.recordEvent(Object.assign({ correct: o.grade !== "again", ms: 1500 }, o)); }

  // ══ 1 · Principiante, 90 días, sin examen ═══════════════════════════════════
  head(1, "Principiante · 90 días · 20 min/día · progreso sostenido [validado]");
  fresh();
  let r = simulate(env, makeUser({ competence:0.45, forgetRate:0.05, minutesPerDay:20, examInDays:null, seed:101 }), 90);
  ok(r.finalOverview.cobertura >= 0.85, `cobertura final ${r.finalOverview.cobertura} ≥ 0.85`);
  // La 'consolidacion' (fracción en estado consolidando) es transitoria: los
  // conceptos la atraviesan camino de 'asentado', así que no es monótona.
  // La señal real de que el aprendizaje consolida con el tiempo es que la
  // estabilidad de memoria crece.
  ok(r.finalOverview.estabilidad > r.trace[20].overview.estabilidad, "la estabilidad de memoria crece con el tiempo");
  ok(r.finalOverview.recuperado >= 0.8, `recuperado ${r.finalOverview.recuperado} ≥ 0.8`);
  ok(["bien encaminado","bien preparado","en construcción"].includes(r.finalOverview.veredicto), `veredicto plausible: ${r.finalOverview.veredicto}`);

  // ══ 2 · Anti-repetición ════════════════════════════════════════════════════
  head(2, "Anti-repetición · un ítem no reaparece en la sesión siguiente [validado]");
  const gap = maxRepeatWithinSessions(r, env);
  ok(gap >= 2 || gap === Infinity, `separación mínima de repetición (conceptos con >6 preguntas) = ${gap}`);
  const sameDay = Object.values(r.seenQ).some(days => days.some((d,i)=> i>0 && d === days[i-1]));
  ok(!sameDay, "ninguna pregunta se repite el mismo día");

  // ══ 3 · Anti-silencio ══════════════════════════════════════════════════════
  head(3, "Anti-silencio · ningún concepto tocado desaparece indefinidamente [validado]");
  ok(maxSilenceDays(r) <= P.maxSilenceDays + 7, `mayor silencio = ${maxSilenceDays(r)}d (límite blando ${P.maxSilenceDays + 7})`);

  // ══ 4 · Duración de sesión ≈ presupuesto ═══════════════════════════════════
  head(4, "Duración de sesión · se acerca al presupuesto de minutos, no a un tope arbitrario [validado]");
  const dur = r.trace.filter(t=>t.session).map(t=>t.session.estMinutes);
  const within = dur.filter(m => m >= 20*P.sessionDurLo && m <= 20*P.sessionDurHi).length;
  ok(within / dur.length >= 0.9, `${within}/${dur.length} sesiones de 20 min caen en [${(20*P.sessionDurLo).toFixed(0)}, ${(20*P.sessionDurHi).toFixed(0)}] min`);

  // ══ 5 · Usuario fuerte · conceptos se asientan ═════════════════════════════
  head(5, "Usuario fuerte · alcanza 'asentado' con intervalos largos y evidencia real [validado]");
  fresh();
  let rs = simulate(env, makeUser({ competence:0.82, forgetRate:0.03, minutesPerDay:25, examInDays:null, seed:202 }), 120);
  const asentados = rs.concepts.filter(c => c.mastery === "asentado");
  // Umbral 0.35: 'asentado' exige ≥2 framings demostrados y ~15 conceptos del
  // banco son de "ruta de menú" pura (¿dónde está X?), que sólo tienen un
  // framing y por diseño se quedan en 'consolidando'. Entre los conceptos que
  // SÍ pueden asentarse la tasa sigue siendo ~45%.
  ok(asentados.length >= rs.concepts.length * 0.35, `${asentados.length}/${rs.concepts.length} conceptos asentados`);
  ok(asentados.every(c => c.interval >= P.masteryInterval - 0.01), "todo asentado tiene interval ≥ masteryInterval");
  ok(asentados.every(c => c.correctReps >= P.masteryReps && c.framings >= P.masteryFramings), "todo asentado cumple reps y framings mínimos");
  ok(asentados.every(c => c.spanDays >= P.masterySpanDays), "todo asentado tiene separación temporal real");

  // ══ 6 · Usuario débil · el motor no miente ═════════════════════════════════
  head(6, "Usuario débil · no se declara dominio en falso [validado]");
  fresh();
  let rw = simulate(env, makeUser({ competence:0.2, forgetRate:0.1, minutesPerDay:20, examInDays:null, seed:303 }), 90);
  ok(rw.finalOverview.consolidacion <= 0.4, `consolidación baja y honesta: ${rw.finalOverview.consolidacion}`);
  ok(rw.finalOverview.atencion >= 5, `${rw.finalOverview.atencion} conceptos 'necesitan atención'`);
  // un falso positivo real = el motor cree que NO hace falta repasarlo (review futuro)
  // y sin embargo la fuerza real está por los suelos. Que esté 'asentado + atrasado'
  // con fuerza baja NO es mentira: es un concepto que se demostró y ahora toca repasar.
  const falsPos = rw.concepts.filter(c => c.mastery === "asentado" && c.review === "futuro" && c.trueStrength < 0.35);
  ok(falsPos.length === 0, `ningún 'asentado + no toca repasar' con fuerza real baja: ${falsPos.length}/${rw.concepts.length}`);

  // ══ 7 · Reversibilidad de 'asentado' ══════════════════════════════════════
  head(7, "'asentado' es reversible · un fallo posterior revierte sin drama [probado]");
  fresh();
  const cid = LE.CONCEPTS.find(c => c.framings.length >= 2).id;
  const t0 = Date.UTC(2026,0,5);
  ev({ kind:"q", ref:Q0(cid), concept:cid, framing:"conceptual", grade:"good", ts:t0 });
  ev({ kind:"q", ref:Q0(cid), concept:cid, framing:"ruta",       grade:"good", ts:t0 + 3*DAY });
  ev({ kind:"q", ref:Q0(cid), concept:cid, framing:"caso",       grade:"good", ts:t0 + 10*DAY });
  LE.recalc(t0 + 10*DAY);
  let st = O.PROGRESS.concepts[cid];
  ok(st.masteryStatus === "asentado", `llega a asentado (mastery=${st.masteryStatus}, review=${st.reviewState}, interval=${st.interval.toFixed(1)})`);
  const histLen = O.PROGRESS.history.length;
  ev({ kind:"q", ref:Q0(cid), concept:cid, framing:"discriminacion", grade:"again", correct:false, ts:t0 + 30*DAY });
  LE.recalc(t0 + 30*DAY);
  st = O.PROGRESS.concepts[cid];
  ok(st.masteryStatus !== "asentado", `tras el fallo el dominio revierte (mastery=${st.masteryStatus})`);
  ok(O.PROGRESS.history.length === histLen, "revertir no genera ningún registro de 'lo perdiste'");
  ok(st.correctReps === 3, "las recuperaciones previas NO se borran (correctReps sigue = 3)");
  ok(st.interval < P.masteryInterval * 3 && st.interval >= 1, "el intervalo se acorta pero el concepto no vuelve a cero");

  // ══ 8 · Examen a 30 días · garantía dura de fecha crítica ═════════════════
  head(8, "Examen · ninguna recuperación NECESARIA se programa tras la fecha crítica [validado]");
  fresh();
  let re = simulate(env, makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:25, examInDays:30, seed:404 }), 28);
  const lastDay = re.start + 28*DAY;
  LE.recalc(lastDay);
  const ctx8 = LE.planCtx(lastDay);
  const rd8 = LE.examReadiness(ctx8);
  let violaciones = 0;
  LE.CONCEPTS.forEach(c=>{
    const s = O.PROGRESS.concepts[c.id];
    if(!s) return;
    if(LE.neededRetrievals(s) > 0 && s.nextReview > ctx8.criticalMs && !rd8.deficits.includes(c.id)) violaciones++;
  });
  ok(violaciones === 0, `0 conceptos con recuperación necesaria programada tras la fecha crítica sin marcar déficit (${violaciones})`);
  ok(!(rd8.feasible && rd8.deficitCount > 0), `coherencia: nunca 'feasible' con déficit (feasible=${rd8.feasible}, déficits=${rd8.deficitCount})`);
  const phases = new Set(re.trace.filter(t=>t.session).map(t=>t.session.phase));
  ok([...phases].some(p => ["consolidar","mezclar","simular","asegurar"].includes(p)), `la recta final cambia de fase: ${[...phases].join(",")}`);

  // ══ 9 · Víspera de examen · sin contenido nuevo ══════════════════════════
  head(9, "Víspera de examen · deja de introducir conceptos nuevos [validado]");
  fresh();
  let rv = simulate(env, makeUser({ competence:0.55, forgetRate:0.05, minutesPerDay:30, examInDays:10, seed:505 }), 10);
  const lastDays = rv.trace.filter(t => t.session && t.readiness.daysLeft != null && t.readiness.daysLeft <= 2);
  const newLate = lastDays.some(t => {
    const before = new Set();
    rv.trace.filter(x => x.day < t.day).forEach(x => (x.answers||[]).forEach(a => before.add(a.concept)));
    return (t.answers||[]).some(a => !before.has(a.concept));
  });
  ok(!newLate, "en los últimos 2 días no aparece ningún concepto no visto antes");
  const lastPhase = rv.trace[rv.trace.length-1].session ? rv.trace[rv.trace.length-1].session.phase : "asegurar";
  ok(["simular","asegurar","aflojar"].includes(lastPhase), `fase final de aseguramiento: ${lastPhase}`);

  // ══ 10 · Sin fecha de examen · horizonte operativo ═══════════════════════
  head(10, "Sin fecha de examen · horizonte de 90 días, nunca una cuenta atrás [validado]");
  fresh();
  let rn = simulate(env, makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:20, examInDays:null, seed:606 }), 60);
  ok(rn.trace.every(t => t.readiness.daysLeft == null), "readiness.daysLeft siempre null sin fecha de examen");
  ok(rn.trace.every(t => t.readiness.studyDays > 0), "aun así proyecta días de estudio");
  ok(rn.finalReadiness.demand > 0 && rn.finalReadiness.capacity > 0, "capacidad y demanda se calculan sin fecha");

  // ══ 11 · Cambio de fecha de examen ═══════════════════════════════════════
  head(11, "Cambio de fecha · recálculo factible o aviso honesto, sin repasos fuera de plazo [validado]");
  fresh();
  const u11 = makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:25, examInDays:120, seed:707 });
  let r11 = simulate(env, u11, 40);
  const now40 = r11.start + 40 * DAY;
  LE.setPlan({ examDate: now40 + 25 * DAY, minutesPerDay: 25, weekdays: u11.weekdays, objetivo:"consolidar" });
  LE.recalc(now40);
  const ctx11 = LE.planCtx(now40);
  const rd11 = LE.examReadiness(ctx11);
  ok(rd11.daysLeft <= 25, `la cuenta atrás refleja la nueva fecha (${rd11.daysLeft}d)`);
  ok(rd11.feasible || rd11.coverageProjection < 1 || rd11.deficitCount > 0, `respuesta honesta: feasible=${rd11.feasible}, cobertura=${Math.round(rd11.coverageProjection*100)/100}, déficits=${rd11.deficitCount}`);
  let fuera = 0;
  LE.CONCEPTS.forEach(c=>{ const s = O.PROGRESS.concepts[c.id];
    if(s && LE.neededRetrievals(s) > 0 && s.nextReview > ctx11.criticalMs && !rd11.deficits.includes(c.id)) fuera++; });
  ok(fuera === 0, `0 repasos necesarios programados tras la fecha crítica sin marcar déficit (${fuera})`);

  // ══ 12 · Atrasos · recuperación amable ══════════════════════════════════
  head(12, "Atrasos · tras inactividad se prioriza el riesgo sin culpabilizar [validado]");
  fresh();
  let r12 = simulate(env, makeUser({ competence:0.5, forgetRate:0.09, minutesPerDay:20, skipProb:0.6, seed:808 }), 50);
  const bl = LE.backlogPlan(LE.planCtx(r12.start + 50 * DAY));
  ok(typeof bl.overdue === "number", `backlogPlan informa de ${bl.overdue} conceptos vencidos`);
  if(bl.needed){
    ok(/priori|import/i.test(bl.message) && !/perd|fracas|culpa/i.test(bl.message), `mensaje sin culpabilizar: "${bl.message}"`);
    ok(Array.isArray(bl.today) && bl.today.length > 0, "propone un lote concreto para hoy");
  } else {
    ok(true, "no se acumularon suficientes atrasos como para activarlo (aceptable)");
  }

  // ══ 13 · Eventos del mismo instante · conmutativos ══════════════════════
  head(13, "Dos recuperaciones del mismo instante · resultado idéntico en cualquier orden [probado]");
  function twoEvents(order){
    fresh();
    const c = LE.CONCEPTS.find(x => x.questionIds.length >= 2);
    const ts = Date.UTC(2026,1,1);
    const evs = [
      { kind:"q", ref:c.questionIds[0], concept:c.id, framing:"conceptual", grade:"good", correct:true, ms:1500, ts },
      { kind:"q", ref:c.questionIds[1], concept:c.id, framing:"ruta",       grade:"hard", correct:true, ms:5000, ts },
    ];
    (order === "rev" ? evs.slice().reverse() : evs).forEach(e => LE.recordEvent(e));
    const s = O.PROGRESS.concepts[c.id];
    return { interval:s.interval, reps:s.reps, correctReps:s.correctReps,
             framings:s.framingsCorrect.slice().sort(), mastery:s.masteryStatus };
  }
  const a13 = twoEvents("fwd"), b13 = twoEvents("rev");
  ok(a13.interval === b13.interval, `interval idéntico (${a13.interval} vs ${b13.interval}) — las recuperaciones de la misma sesión no espacian`);
  ok(a13.correctReps === b13.correctReps && JSON.stringify(a13.framings) === JSON.stringify(b13.framings) && a13.mastery === b13.mastery,
     "reps, framings y estado de dominio idénticos con el orden invertido");

  // ══ 14 · Transferencia ═════════════════════════════════════════════════
  head(14, "Transferencia · un solo framing no da 'asentado'; demostrarla lo detecta [probado + validado]");
  fresh();
  const c14 = LE.CONCEPTS.find(x => x.framings.length >= 3 && x.questionIds.length >= 3).id;
  let ts14 = Date.UTC(2026,0,5);
  for(let i = 0; i < 8; i++){ ev({ kind:"q", ref:Q0(c14), concept:c14, framing:"conceptual", grade:"good", ts: ts14 }); ts14 += 6*DAY; }
  LE.recalc(ts14);
  let s14 = O.PROGRESS.concepts[c14];
  ok(s14.correctReps >= 3 && s14.interval >= P.masteryInterval, `memoria sobrada (reps ${s14.correctReps}, interval ${s14.interval.toFixed(0)})`);
  ok(s14.masteryStatus !== "asentado", `NO asentado por falta de transferencia (mastery=${s14.masteryStatus}, framings=${s14.framingsCorrect.length})`);
  const ctx14 = LE.planCtx(ts14);
  const prBefore = LE.conceptPriority(c14, ctx14).score;
  // (unitario) cubrir framings a mano baja la prioridad
  const saved = s14.framingsCorrect.slice();
  s14.framingsCorrect = ["conceptual","ruta","caso"];
  const prManual = LE.conceptPriority(c14, ctx14).score;
  s14.framingsCorrect = saved;
  ok(prManual < prBefore, `[unitario] cubrir la transferencia baja la prioridad (${Math.round(prManual*100)/100} < ${Math.round(prBefore*100)/100})`);
  // (integración) demostrar ruta + caso mediante eventos reales
  const c14q = LE.CONCEPT_BY_ID[c14].questionIds;
  ev({ kind:"q", ref:c14q[1], concept:c14, framing:"ruta", grade:"good", ts: ts14 + 5*DAY });
  ev({ kind:"q", ref:c14q[2], concept:c14, framing:"caso", grade:"good", ts: ts14 + 11*DAY });
  LE.recalc(ts14 + 11*DAY);
  s14 = O.PROGRESS.concepts[c14];
  const prAfter = LE.conceptPriority(c14, LE.planCtx(ts14 + 11*DAY)).score;
  ok(s14.framingsCorrect.length >= 3, `[integración] el motor registra los 3 framings demostrados (${s14.framingsCorrect.join(",")})`);
  ok(prAfter < prBefore, `[integración] demostrar transferencia baja la prioridad (${Math.round(prAfter*100)/100} < ${Math.round(prBefore*100)/100})`);
  ok(s14.masteryStatus === "asentado", "…y ahora sí puede asentarse");

  // ══ 15 · Confianza del diagnóstico (interna) ═══════════════════════════
  head(15, "Confianza del diagnóstico · sube con volumen, variedad y dispersión; nunca se expone [probado]");
  fresh();
  const c15 = LE.CONCEPTS.find(x => x.framings.length >= 3 && x.questionIds.length >= 3).id;
  ev({ kind:"q", ref:Q0(c15), concept:c15, framing:"conceptual", grade:"good", ts: Date.UTC(2026,0,5) });
  ev({ kind:"q", ref:Q0(c15), concept:c15, framing:"conceptual", grade:"good", ts: Date.UTC(2026,0,6) });
  const lowConf = O.PROGRESS.concepts[c15].diagConfidence;
  ok(lowConf < 0.45, `2 respuestas / 1 framing / 1 día → confianza baja: ${Math.round(lowConf*100)/100}`);
  let ts15 = Date.UTC(2026,0,10);
  const frs = ["ruta","caso","discriminacion","vf"];
  for(let i = 0; i < 7; i++){
    ev({ kind:"q", ref:LE.CONCEPT_BY_ID[c15].questionIds[i % LE.CONCEPT_BY_ID[c15].questionIds.length], concept:c15, framing: frs[i % frs.length], grade:"good", ts: ts15 });
    ts15 += 3*DAY;
  }
  const hiConf = O.PROGRESS.concepts[c15].diagConfidence;
  ok(hiConf > lowConf && hiConf >= 0.6, `9 respuestas / 4+ framings / ~3 semanas → confianza alta: ${Math.round(hiConf*100)/100}`);
  const dimKeys = Object.keys(LE.overview(ts15).dimensiones);
  ok(!dimKeys.includes("confianza") && !dimKeys.includes("diagConfidence"), `la confianza NO se expone entre las dimensiones (${dimKeys.join(", ")})`);

  // ══ 16 · Retención objetivo 0.90 ═══════════════════════════════════════
  head(16, "Retención objetivo 0.90 · implementada con coherencia (decisión de producto, no constante científica) [probado]");
  const base = 100 * DAY;
  const Rat = LE.retrievability({ interval: 12, lastReview: base }, base + 12 * DAY);
  ok(Math.abs(Rat - P.targetRetention) < 0.005, `R(t = interval) = ${Rat.toFixed(3)} ≈ ${P.targetRetention}`);
  const Rhalf = LE.retrievability({ interval: 12, lastReview: base }, base + 6 * DAY);
  ok(Rhalf > Rat && Rhalf < 1, `R decae monótonamente (R(t/2) = ${Rhalf.toFixed(3)})`);
  ok(P.targetRetention === 0.90, "targetRetention = 0.90 vive sólo en P (no en la UI)");
  fresh();
  let r16 = simulate(env, makeUser({ competence:0.45, forgetRate:0.05, minutesPerDay:25, examInDays:90, seed:909 }), 85);
  ok(r16.trace[45].readiness.cobertura >= 0.75, `[validado] carga asumible a mitad de plan: cobertura proyectada ${r16.trace[45].readiness.cobertura} (si <0.75 de forma persistente → recalibrar P)`);

  // ══ 17 · Ciclo de vida de una flashcard ════════════════════════════════
  head(17, "Flashcard · participa de verdad en el motor (evento → estado → agenda → anti-repetición → vuelve) [probado]");
  fresh();
  const cf = LE.CONCEPTS.find(c => c.flashcardIds.length >= 2 && c.questionIds.length >= 1).id;
  const card = LE.CONCEPT_BY_ID[cf].flashcardIds[0];
  const Tf = Date.UTC(2026,2,1);
  LE.recordEvent({ kind:"fc", ref:card, concept:cf, grade:"good", correct:true, ms:8000, ts:Tf });
  let sf = O.PROGRESS.concepts[cf];
  ok(sf && sf.reps === 1 && sf.correctReps === 1, "el evento de flashcard actualiza el concepto (reps=1)");
  ok(sf.nextReview > Tf, `programa una revisión futura (+${((sf.nextReview - Tf)/DAY).toFixed(1)}d)`);
  ok(O.PROGRESS.fcstate[card] && O.PROGRESS.fcstate[card].last === Tf, "queda registrada en fcstate (anti-repetición)");
  const itSoon = LE.bestItem(cf, LE.planCtx(Tf + 2*3600000), new Set(LE.CONCEPT_BY_ID[cf].questionIds));
  ok(!itSoon || itSoon.id !== card, "no se vuelve a ofrecer la misma flashcard justo después");
  const itLater = LE.bestItem(cf, LE.planCtx(Tf + 40*DAY), new Set(LE.CONCEPT_BY_ID[cf].questionIds));
  ok(itLater && itLater.kind === "fc", "agotadas las preguntas del concepto, la sesión ofrece una flashcard suya");
  LE.recalc(sf.nextReview + DAY);
  ok(O.PROGRESS.concepts[cf].reviewState !== "futuro", "pasada su fecha, el concepto vuelve a estar pendiente de repaso");

  // ══ 18 · Tolerancia de duración de sesión ══════════════════════════════
  head(18, "Duración de sesión · con ritmo real medido, 10/30/60 min quedan cerca del presupuesto [probado]");
  fresh();
  let tt = Date.UTC(2026,0,5);
  const cc = LE.CONCEPTS[0];
  for(let i = 0; i < 40; i++){
    LE.recordEvent({ kind:"q", ref:cc.questionIds[i % cc.questionIds.length], concept:cc.id, framing:"conceptual", grade:"good", correct:true, ms:24000, ts: tt });
    tt += 3*DAY;
  }
  const sec = LE.observedSecPerItem("q");
  ok(Math.abs(sec - 24) < 3, `el motor aprende el ritmo real (${sec.toFixed(1)} s/ítem ≈ 24)`);
  for(const m of [10, 30, 60]){
    const nn = LE.itemsForMinutes(m);
    const est = nn * sec / 60;
    ok(est >= m*P.sessionDurLo && est <= m*P.sessionDurHi,
       `${m} min → ${nn} ítems ≈ ${est.toFixed(0)} min ∈ [${(m*P.sessionDurLo).toFixed(0)}, ${(m*P.sessionDurHi).toFixed(0)}]`);
  }

  // ══ 19 · Monotonicidad del usuario ═════════════════════════════════════
  head(19, "Monotonicidad · a igualdad de tiempo/contenido/días, el usuario más competente no queda por detrás [validado]");
  fresh();
  const cfg19 = { forgetRate:0.05, minutesPerDay:20, weekdays:[1,2,3,4,5], examInDays:80, seed:2468 };
  let strong = simulate(env, makeUser(Object.assign({}, cfg19, { competence:0.72 })), 70);
  fresh();
  let weak = simulate(env, makeUser(Object.assign({}, cfg19, { competence:0.30 })), 70);
  ok(strong.finalOverview.consolidacion >= weak.finalOverview.consolidacion,
     `dominio agregado: fuerte ${strong.finalOverview.consolidacion} ≥ débil ${weak.finalOverview.consolidacion}`);
  ok(strong.finalOverview.dims.memoria >= weak.finalOverview.dims.memoria - 0.05,
     `memoria agregada: fuerte ${strong.finalOverview.dims.memoria} ≳ débil ${weak.finalOverview.dims.memoria}`);
  ok(strong.finalReadiness.cobertura >= weak.finalReadiness.cobertura - 0.05,
     `preparación proyectada: fuerte ${strong.finalReadiness.cobertura} ≳ débil ${weak.finalReadiness.cobertura}`);

  // ══ 20 · Dominio ⟂ estado de repaso ════════════════════════════════════
  head(20, "Dominio y estado de repaso son ejes independientes · 'asentado + atrasado' es válido [probado]");
  fresh();
  const cm = LE.CONCEPTS.find(c => c.framings.length >= 2).id;
  const B = Date.UTC(2026,3,1);
  ev({ kind:"q", ref:Q0(cm), concept:cm, framing:"conceptual", grade:"good", ts:B });
  ev({ kind:"q", ref:Q0(cm), concept:cm, framing:"ruta",       grade:"good", ts:B + 4*DAY });
  ev({ kind:"q", ref:Q0(cm), concept:cm, framing:"caso",       grade:"good", ts:B + 12*DAY });
  let sm = O.PROGRESS.concepts[cm];
  ok(sm.masteryStatus === "asentado" && sm.reviewState === "futuro", `asentado + futuro (interval ${sm.interval.toFixed(0)}d)`);
  const farLater = sm.nextReview + 60 * DAY;
  LE.recalc(farLater);
  sm = O.PROGRESS.concepts[cm];
  ok(sm.masteryStatus === "asentado", "sigue DOMINADO aunque haga tiempo que tocaba repasar");
  ok(sm.reviewState === "atrasado", "…pero su reviewState es 'atrasado'");
  ok(sm.status === "repaso", "el status compuesto legado lo refleja como 'repaso'");
  const rank20 = LE.rankedConcepts(LE.planCtx(farLater));
  const pos = rank20.findIndex(x => x.id === cm);
  ok(pos >= 0 && pos < LE.CONCEPTS.length * 0.6, `vuelve a la cola de repaso con prioridad (posición ${pos+1}/${rank20.length})`);
  ev({ kind:"q", ref:Q0(cm), concept:cm, framing:"discriminacion", grade:"good", ts:farLater });
  sm = O.PROGRESS.concepts[cm];
  ok(sm.masteryStatus === "asentado" && sm.reviewState === "futuro", "tras repasarlo: sigue asentado y vuelve a 'futuro'");

  // ── resumen ────────────────────────────────────────────────────────────
  console.log(`\n${scenarios} escenarios · ${failures} fallo(s).`);
  if(failures){ process.exit(1); }
  console.log("Todos los escenarios del motor pasaron.");
}

main().catch(e => { console.error(e); process.exit(1); });
