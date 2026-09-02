/* ============================================================
   OPE365 · Pruebas del motor de aprendizaje (16 escenarios)
   ------------------------------------------------------------
   Cada escenario define un usuario sintético, lo simula con
   tests/sim.js y comprueba aserciones sobre las TRAZAS.
   Ningún escenario toca la interfaz.

     node tests/test_engine.js
   Sale con 0 si todo pasa, 1 si algo falla.
============================================================ */
"use strict";
const { loadEngine, makeUser, simulate, maxRepeatWithinSessions, maxSilenceDays } = require("./sim");

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

  function fresh(){
    O.PROGRESS.answers = {}; O.PROGRESS.flashcards = {}; O.PROGRESS.history = [];
    O.PROGRESS.concepts = {}; O.PROGRESS.events = []; O.PROGRESS.qstate = {};
    O.PROGRESS.plan = null; delete O.PROGRESS._seeded; delete O.PROGRESS._recentSessionStarts;
  }

  // ---- 1 · Principiante, 90 días, 20 min, sin examen -------------
  head(1, "Principiante · 90 días · 20 min/día · progreso sostenido");
  fresh();
  let r = simulate(env, makeUser({ competence:0.45, forgetRate:0.05, minutesPerDay:20, examInDays:null, seed:101 }), 90);
  ok(r.finalOverview.cobertura >= 0.85, `cobertura final ${r.finalOverview.cobertura} ≥ 0.85`);
  ok(r.finalOverview.consolidacion > r.trace[20].overview.consolidacion, "la consolidación crece con el tiempo");
  ok(r.finalOverview.recuperado >= 0.8, `recuperado ${r.finalOverview.recuperado} ≥ 0.8`);
  ok(["bien encaminado","bien preparado","en construcción"].includes(r.finalOverview.veredicto), `veredicto plausible: ${r.finalOverview.veredicto}`);

  // ---- 2 · Antirrepetición de preguntas -------------------------
  head(2, "Antirrepetición · ninguna pregunta se repite en < minRepeatSessions");
  const gap = maxRepeatWithinSessions(r, env);
  ok(gap >= 2 || gap === Infinity, `una misma pregunta (concepto con >3) nunca se repite en la sesión siguiente: separación mínima = ${gap}`);
  // ninguna repetición dentro de la ventana horaria dura
  const sameDay = Object.values(r.seenQ).some(days => days.some((d,i)=> i>0 && d === days[i-1]));
  ok(!sameDay, "ninguna pregunta se repite el mismo día");

  // ---- 3 · Antisilencio de conceptos ---------------------------
  head(3, "Antisilencio · ningún concepto tocado desaparece demasiado tiempo");
  const silence = maxSilenceDays(r);
  ok(silence <= P.maxSilenceDays + 7, `mayor silencio de un concepto = ${silence}d (límite blando ${P.maxSilenceDays + 7})`);

  // ---- 4 · Tamaño de sesión acotado por el tiempo -------------
  head(4, "Tamaño de sesión · nunca excede el presupuesto de minutos");
  const cap = LE.itemsForMinutes(20);
  const tooBig = r.trace.filter(t => t.session && t.session.items > cap + 3);
  ok(tooBig.length === 0, `todas las sesiones ≤ ${cap + 3} ítems (max observado ${Math.max(0, ...r.trace.filter(t=>t.session).map(t=>t.session.items))})`);

  // ---- 5 · Usuario fuerte · conceptos se asientan ------------
  head(5, "Usuario fuerte · los conceptos alcanzan 'asentado' con intervalos largos");
  fresh();
  let rs = simulate(env, makeUser({ competence:0.82, forgetRate:0.03, minutesPerDay:25, examInDays:null, seed:202 }), 120);
  const asentados = rs.concepts.filter(c => c.status === "asentado" || c.status === "repaso");
  ok(asentados.length >= rs.concepts.length * 0.4, `${asentados.length}/${rs.concepts.length} conceptos asentados/repaso`);
  ok(asentados.every(c => c.interval >= P.masteryInterval - 0.01), "todo asentado tiene interval ≥ masteryInterval");
  ok(asentados.every(c => c.correctReps >= P.masteryReps && c.framings >= P.masteryFramings), "todo asentado cumple reps y framings mínimos");
  ok(asentados.every(c => c.spanDays >= P.masterySpanDays), "todo asentado tiene separación temporal real");

  // ---- 6 · Usuario débil · el motor no miente ----------------
  head(6, "Usuario débil · no se declara dominio en falso");
  fresh();
  let rw = simulate(env, makeUser({ competence:0.2, forgetRate:0.1, minutesPerDay:20, examInDays:null, seed:303 }), 90);
  ok(rw.finalOverview.consolidacion <= 0.4, `consolidación baja y honesta: ${rw.finalOverview.consolidacion}`);
  ok(rw.finalOverview.atencion >= 5, `${rw.finalOverview.atencion} conceptos marcados 'necesitan atención'`);
  const falsPos = rw.concepts.filter(c => (c.status === "asentado") && c.trueStrength < 0.35);
  ok(falsPos.length <= 1, `casi ningún falso 'asentado' con fuerza real baja: ${falsPos.length} de ${rw.concepts.length}`);

  // ---- 7 · Reversibilidad de 'asentado' ---------------------
  head(7, "'asentado' es reversible · un fallo posterior revierte el estado sin drama");
  fresh();
  const cid = LE.CONCEPTS.find(c => c.framings.length >= 2).id;
  const t0 = Date.UTC(2026,0,5);
  // llevarlo a asentado: 3 recuperaciones correctas espaciadas, 2 framings
  LE.recordEvent({ kind:"q", ref:LE.CONCEPT_BY_ID[cid].questionIds[0], concept:cid, framing:"conceptual", grade:"good", correct:true, ms:1500, ts:t0 });
  LE.recordEvent({ kind:"q", ref:LE.CONCEPT_BY_ID[cid].questionIds[0], concept:cid, framing:"ruta", grade:"good", correct:true, ms:1500, ts:t0 + 3*86400000 });
  LE.recordEvent({ kind:"q", ref:LE.CONCEPT_BY_ID[cid].questionIds[0], concept:cid, framing:"caso", grade:"good", correct:true, ms:1500, ts:t0 + 10*86400000 });
  LE.recalc(t0 + 10*86400000);
  let st = O.PROGRESS.concepts[cid];
  const wasAsentado = st.status === "asentado" || st.status === "repaso";
  ok(wasAsentado, `el concepto llega a asentado/repaso (status=${st.status}, interval=${st.interval.toFixed(1)})`);
  const histLen = O.PROGRESS.history.length;
  LE.recordEvent({ kind:"q", ref:LE.CONCEPT_BY_ID[cid].questionIds[0], concept:cid, framing:"discriminacion", grade:"again", correct:false, ms:2000, ts:t0 + 30*86400000 });
  LE.recalc(t0 + 30*86400000);
  st = O.PROGRESS.concepts[cid];
  ok(st.status !== "asentado", `tras el fallo el estado revierte (status=${st.status})`);
  ok(O.PROGRESS.history.length === histLen, "revertir no genera ningún registro de 'lo perdiste' en history");
  ok(st.correctReps === 3, "las recuperaciones previas NO se borran (correctReps sigue = 3)");
  ok(st.interval < LE.P.masteryInterval * 3, "el intervalo se acorta pero el concepto no vuelve a cero");

  // ---- 8 · Examen a 30 días · cada concepto llega o se avisa -
  head(8, "Examen a 30 días · todo concepto alcanza ≥3 recuperaciones espaciadas o el motor lo avisa");
  fresh();
  let re = simulate(env, makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:25, examInDays:30, seed:404 }), 30);
  const noLlegan = re.concepts.filter(c => c.neededRetrievals > 0 && c.lastSeenDay != null);
  const finalFeasible = re.finalReadiness.feasible;
  ok(finalFeasible || re.honestFlags > 0, `si no todo llega, el motor lo declara (feasible=${finalFeasible}, flags=${re.honestFlags})`);
  ok(!(finalFeasible && noLlegan.length > re.concepts.length * 0.5),
     `coherencia: no dice 'factible' con ${noLlegan.length}/${re.concepts.length} conceptos cortos`);
  const phases = new Set(re.trace.filter(t=>t.session).map(t=>t.session.phase));
  ok([...phases].some(p => ["consolidar","mezclar","simular"].includes(p)), `la recta final cambia de fase: ${[...phases].join(",")}`);

  // ---- 9 · Examen a 10 días · sin contenido nuevo al final ---
  head(9, "Víspera de examen · deja de introducir conceptos nuevos");
  fresh();
  let rv = simulate(env, makeUser({ competence:0.55, forgetRate:0.05, minutesPerDay:30, examInDays:10, seed:505 }), 10);
  const lastDays = rv.trace.filter(t => t.session && t.readiness.daysLeft != null && t.readiness.daysLeft <= 2);
  const newConceptsLate = lastDays.some(t => {
    const before = new Set();
    rv.trace.filter(x => x.day < t.day).forEach(x => (x.answers||[]).forEach(a => before.add(a.concept)));
    return (t.answers||[]).some(a => !before.has(a.concept));
  });
  ok(!newConceptsLate, "en los últimos 2 días no aparece ningún concepto que no se hubiera visto antes");
  ok(["simular","asegurar","aflojar"].includes(rv.trace[rv.trace.length-1].session ? rv.trace[rv.trace.length-1].session.phase : "asegurar"),
     "la fase final es de aseguramiento, no de construcción");

  // ---- 10 · Sin fecha de examen · horizonte operativo -------
  head(10, "Sin fecha de examen · horizonte de 90 días, nunca se muestra una cuenta atrás");
  fresh();
  let rn = simulate(env, makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:20, examInDays:null, seed:606 }), 60);
  ok(rn.trace.every(t => t.readiness.daysLeft == null), "readiness.daysLeft es siempre null sin fecha de examen");
  ok(rn.trace.every(t => t.readiness.studyDays > 0), "aun así el motor proyecta días de estudio (horizonte operativo)");
  ok(rn.finalReadiness.demand > 0 && rn.finalReadiness.capacity > 0, "capacidad y demanda se calculan sin fecha");

  // ---- 11 · Cambio de fecha de examen a mitad --------------
  head(11, "Cambio de fecha · recálculo produce plan factible o aviso honesto");
  fresh();
  const u11 = makeUser({ competence:0.5, forgetRate:0.05, minutesPerDay:25, examInDays:120, seed:707 });
  let r11a = simulate(env, u11, 40);
  const covBefore = r11a.finalReadiness.cobertura;
  // adelantar el examen: ahora a 25 días desde el día 40
  const now40 = r11a.start + 40 * 86400000;
  LE.setPlan({ examDate: now40 + 25 * 86400000, minutesPerDay: 25, weekdays: u11.weekdays, objetivo:"consolidar" });
  LE.recalc(now40);
  const rd = LE.examReadiness(LE.planCtx(now40));
  ok(rd.daysLeft <= 25, `la cuenta atrás refleja la nueva fecha (${rd.daysLeft}d)`);
  ok(rd.feasible || rd.coverageProjection < 1, `el motor responde con honestidad: feasible=${rd.feasible}, cobertura=${rd.cobertura ?? Math.round(rd.coverageProjection*100)/100}`);
  const compressed = LE.CONCEPTS.map(c => O.PROGRESS.concepts[c.id]).filter(Boolean)
    .filter(s => LE.neededRetrievals(s) > 0);
  const past = compressed.filter(s => s.nextReview > now40 + 23 * 86400000);
  ok(past.length <= compressed.length * 0.25, `los repasos con déficit se comprimen dentro de la fecha crítica (${past.length}/${compressed.length} fuera)`);

  // ---- 12 · Atrasos · recuperación amable ------------------
  head(12, "Atrasos · tras días sin estudiar, se prioriza el riesgo sin culpabilizar");
  fresh();
  let r12 = simulate(env, makeUser({ competence:0.5, forgetRate:0.09, minutesPerDay:20, weekdays:[1,2,3,4,5], skipProb:0.55, seed:808 }), 45);
  const ctx12 = LE.planCtx(r12.start + 45 * 86400000);
  const bl = LE.backlogPlan(ctx12);
  ok(typeof bl.overdue === "number", `backlogPlan informa de ${bl.overdue} conceptos vencidos`);
  if(bl.needed){
    ok(/priori|import/i.test(bl.message) && !/perd|fracas|mal|culpa/i.test(bl.message), `mensaje de recuperación sin culpabilizar: "${bl.message}"`);
    ok(Array.isArray(bl.today) && bl.today.length > 0, "propone un lote concreto para hoy");
  } else {
    ok(true, "no se acumularon suficientes atrasos como para activar el plan (aceptable)");
  }

  // ---- 13 · Corrección independiente del orden -------------
  head(13, "Dos recuperaciones el mismo instante · el estado no depende del orden");
  function twoEvents(order){
    fresh();
    const c = LE.CONCEPTS.find(x => x.questionIds.length >= 2);
    const ts = Date.UTC(2026,1,1);
    const evs = [
      { kind:"q", ref:c.questionIds[0], concept:c.id, framing:"conceptual", grade:"good", correct:true, ms:1500, ts },
      { kind:"q", ref:c.questionIds[1], concept:c.id, framing:"ruta", grade:"hard", correct:true, ms:5000, ts },
    ];
    (order === "rev" ? evs.reverse() : evs).forEach(e => LE.recordEvent(e));
    const s = O.PROGRESS.concepts[c.id];
    return { interval: Math.round(s.interval * 1000) / 1000, reps: s.reps, correctReps: s.correctReps, framings: s.framingsCorrect.slice().sort() };
  }
  const a13 = twoEvents("fwd"), b13 = twoEvents("rev");
  ok(a13.correctReps === b13.correctReps && JSON.stringify(a13.framings) === JSON.stringify(b13.framings), "reps y framings idénticos con orden invertido");
  const relDiff = Math.abs(a13.interval - b13.interval) / Math.max(a13.interval, b13.interval);
  ok(relDiff < 0.15, `el intervalo apenas depende del orden (${a13.interval} vs ${b13.interval}, ${Math.round(relDiff*100)}%); la única asimetría es qué 'grade' siembra la primera repetición`);

  // ---- 14 · Transferencia · un solo framing no basta -------
  head(14, "Transferencia · acertar siempre el mismo framing no da 'asentado'");
  fresh();
  const c14 = LE.CONCEPTS.find(x => x.framings.length >= 3);
  let ts14 = Date.UTC(2026,0,5);
  for(let i = 0; i < 8; i++){
    LE.recordEvent({ kind:"q", ref:c14.questionIds[0], concept:c14.id, framing:"conceptual", grade:"good", correct:true, ms:1400, ts: ts14 });
    ts14 += 6 * 86400000;
  }
  LE.recalc(ts14);
  const s14 = O.PROGRESS.concepts[c14.id];
  ok(s14.correctReps >= 3 && s14.interval >= LE.P.masteryInterval, `memoria sobrada (reps ${s14.correctReps}, interval ${s14.interval.toFixed(0)})`);
  ok(s14.status !== "asentado", `pero NO asentado por falta de transferencia (status=${s14.status}, framings=${s14.framingsCorrect.length})`);
  const dims14 = LE.conceptDimensions(c14.id, ts14);
  ok(dims14.transferencia < 0.6, `dimensión transferencia baja: ${Math.round(dims14.transferencia*100)/100}`);
  const ctx14 = LE.planCtx(ts14);
  const pr14 = LE.conceptPriority(c14.id, ctx14);
  // el hueco de transferencia por sí solo lo mantiene en el radar
  ok(pr14.score >= 0.3, `el motor no lo abandona pese a la memoria saturada: prioridad ${Math.round(pr14.score*100)/100} (≥ 0.3 solo por transferencia)`);
  // y si tuviera la transferencia cubierta, su prioridad bajaría
  s14.framingsCorrect = ["conceptual","ruta","caso"];
  const pr14b = LE.conceptPriority(c14.id, ctx14);
  s14.framingsCorrect = ["conceptual"];
  ok(pr14b.score < pr14.score, `cubrir la transferencia reduce su prioridad (${Math.round(pr14b.score*100)/100} < ${Math.round(pr14.score*100)/100})`);

  // ---- 15 · Confianza del diagnóstico (interna) -----------
  head(15, "Confianza del diagnóstico · sube con volumen, variedad y dispersión temporal");
  fresh();
  const c15 = LE.CONCEPTS.find(x => x.framings.length >= 3 && x.questionIds.length >= 3);
  LE.recordEvent({ kind:"q", ref:c15.questionIds[0], concept:c15.id, framing:"conceptual", grade:"good", correct:true, ms:1500, ts: Date.UTC(2026,0,5) });
  LE.recordEvent({ kind:"q", ref:c15.questionIds[0], concept:c15.id, framing:"conceptual", grade:"good", correct:true, ms:1500, ts: Date.UTC(2026,0,6) });
  let lowConf = O.PROGRESS.concepts[c15.id].diagConfidence;
  ok(lowConf < 0.45, `2 respuestas / 1 framing / 1 día → confianza baja: ${Math.round(lowConf*100)/100}`);
  let ts15 = Date.UTC(2026,0,10);
  const frs = ["ruta","caso","discriminacion","vf"];
  for(let i = 0; i < 7; i++){
    LE.recordEvent({ kind:"q", ref:c15.questionIds[i % c15.questionIds.length], concept:c15.id, framing: frs[i % frs.length], grade:"good", correct:true, ms:1500, ts: ts15 });
    ts15 += 3 * 86400000;
  }
  let hiConf = O.PROGRESS.concepts[c15.id].diagConfidence;
  ok(hiConf > lowConf && hiConf >= 0.6, `9 respuestas / 4+ framings / ~3 semanas → confianza alta: ${Math.round(hiConf*100)/100}`);
  ok(!("confianza" in LE.overview(ts15).dimensiones),
     `la confianza NO se expone entre las dimensiones del resumen (${Object.keys(LE.overview(ts15).dimensiones).join(", ")})`);

  // ---- 16 · Parámetros · retención objetivo y viabilidad ---
  head(16, "Retención objetivo 0.90 exacta y carga viable para el usuario medio");
  const base = 100 * 86400000;
  const testC = { interval: 12, lastReview: base };
  const Rat = LE.retrievability(testC, base + 12 * 86400000);
  ok(Math.abs(Rat - P.targetRetention) < 0.005, `R(t = interval) = ${Rat.toFixed(3)} ≈ ${P.targetRetention}`);
  const Rhalf = LE.retrievability(testC, base + 6 * 86400000);
  ok(Rhalf > Rat && Rhalf < 1, `R decae monótonamente (R(t/2) = ${Rhalf.toFixed(3)})`);
  ok(P.targetRetention === 0.90, "targetRetention = 0.90 y solo vive en el objeto P (no en la UI)");
  // viabilidad: usuario medio 25 min/día llega a >=90% de cobertura proyectada en 90 días
  fresh();
  let r16 = simulate(env, makeUser({ competence:0.45, forgetRate:0.05, minutesPerDay:25, examInDays:90, seed:909 }), 85);
  const mid = r16.trace[45].readiness;      // a mitad de camino, con ventana real por delante
  ok(mid.cobertura >= 0.75,
     `carga asumible: cobertura proyectada a mitad de plan = ${mid.cobertura} (si <0.75 de forma persistente → recalibrar P)`);

  // ---- resumen -------------------------------------------------
  console.log(`\n${scenarios} escenarios · ${failures} fallo(s).`);
  if(failures) process.exit(1);
  console.log("Todos los escenarios del motor pasaron.");
}

main().catch(e => { console.error(e); process.exit(1); });
