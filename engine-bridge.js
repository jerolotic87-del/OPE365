/* ============================================================
   OPE365 · Puente motor ↔ interfaz  (window.OPE.LEB)
   ------------------------------------------------------------
   ÚNICO punto por el que la interfaz habla con el motor de
   aprendizaje (engine.js / window.OPE.LE).

   La UI NO calcula prioridades, intervalos, estados de dominio,
   estados de repaso, preparación de examen ni recomendaciones:
   todo eso sale de aquí, y aquí sale del motor.

   Este módulo:
   · arranca el motor (siembra desde el progreso previo + recalc)
   · traduce cada interacción real en un evento del motor
   · construye la "sesión inteligente" reutilizando el runner actual
   · expone view-models ya masticados para cada pantalla
============================================================ */
(function(){
"use strict";
const O = window.OPE;
if(!O || !O.LE){ console.warn("engine-bridge.js: OPE.LE no disponible"); return; }
const LE = O.LE;
const DAY = 86400000;

/* ---- arranque ------------------------------------------------ */
let booted = false;
function boot(){
  if(booted) return;
  booted = true;
  try{
    LE.seedFromLegacy(Date.now());   // idempotente: no re-siembra si ya hay eventos
    LE.recalc(Date.now());
  }catch(e){ console.warn("LEB.boot", e); }
}

/* ---- registro de interacciones ----------------------------- */
// tiempo en pantalla de la pregunta/ficha actual (lo fija la vista)
let shownAt = 0;
function markShown(){ shownAt = Date.now(); }
function elapsedMs(){ return shownAt ? Math.max(200, Date.now() - shownAt) : null; }

function recordQuestion(q, correct, isExam){
  if(!q) return;
  const ms = elapsedMs();
  try{
    LE.recordEvent({
      kind: isExam ? "exam" : "q",
      ref: q.id,
      grade: LE.gradeFromAnswer(correct, ms),
      correct: !!correct,
      ms,
    });
  }catch(e){ console.warn("LEB.recordQuestion", e); }
}

// Examen: se registra en bloque al entregar (sin feedback intermedio).
function recordExamSession(s){
  if(!s || !s.questions) return;
  s.questions.forEach((q,i)=>{
    const r = s.responses[i];
    if(r) recordQuestion(q, r.correct, true);
  });
  recalcSoon();
}

function recordFlashcard(canonicalId, rating){   // rating: 'no' | 'dificil' | 'si'
  try{
    LE.recordEvent({
      kind: "fc",
      ref: canonicalId,
      grade: LE.gradeFromFlashcard(rating),
      correct: rating === "si",
      ms: elapsedMs(),
    });
  }catch(e){ console.warn("LEB.recordFlashcard", e); }
}

let recalcTimer = null;
function recalcSoon(){
  if(recalcTimer) return;
  recalcTimer = setTimeout(()=>{ recalcTimer = null; try{ LE.recalc(Date.now()); }catch(e){} }, 0);
}
function recalcNow(){ try{ LE.recalc(Date.now()); }catch(e){} }

/* ---- plan de estudio -------------------------------------- */
function getPlan(){
  const pr = LE.store();
  return pr.plan || null;
}
function setPlan(opts){
  const cur = getPlan() || {};
  const plan = LE.setPlan({
    examDate: ("examDate" in opts) ? opts.examDate : cur.examDate,
    minutesPerDay: opts.minutesPerDay || cur.minutesPerDay || 20,
    weekdays: opts.weekdays || cur.weekdays || [1,2,3,4,5],
    objetivo: opts.objetivo || cur.objetivo || "consolidar",
  });
  recalcNow();
  return plan;
}
function clearExamDate(){
  const cur = getPlan(); if(!cur) return;
  LE.setPlan({ examDate:null, minutesPerDay:cur.minutesPerDay, weekdays:cur.weekdays, objetivo:cur.objetivo });
  recalcNow();
}

/* ---- sesión inteligente ---------------------------------- */
// Devuelve { session, plan, cardIds } o null si no hay nada que estudiar.
// La sesión es una sesión de PRÁCTICA normal (feedback inmediato) que se
// ejecuta con el runner existente; las flashcards del plan se encadenan
// al terminar (ver finishPractice en views.js).
function startSmartSession(minutes){
  const run = LE.smartSessionRun(minutes || (getPlan() && getPlan().minutesPerDay) || 20);
  const qIds = run.qIds;
  const cardIds = run.cardIds;
  if(!qIds.length && !cardIds.length) return null;

  if(!qIds.length){
    // solo flashcards en el plan
    return { session:null, plan:run.plan, cardIds };
  }
  const cfg = { mode:"practice", shuffleOptions:true, smart:true, minutes:null };
  const s = O.buildSessionFromIds(qIds, cfg, null);
  if(!s) return { session:null, plan:run.plan, cardIds };
  s.smart = true;
  s.smartCardIds = cardIds;
  s.smartPlan = { phase:run.plan.phase, goal:run.plan.goal, estMinutes:run.plan.estMinutes,
                  buckets:run.plan.mix, deepened:run.plan.deepened };
  return { session:s, plan:run.plan, cardIds };
}

/* ---- etiquetas de estado (semántica única para toda la UI) --- */
const MASTERY_LABEL = { nuevo:"Sin empezar", aprendiendo:"Aprendiendo", consolidando:"Consolidando", asentado:"Asentado" };
const MASTERY_TONE  = { nuevo:"neutral", aprendiendo:"learn", consolidando:"consolid", asentado:"settled" };
const REVIEW_LABEL  = { futuro:"", debido:"Toca repasar", atrasado:"Repaso atrasado" };
function masteryLabel(m){ return MASTERY_LABEL[m] || "—"; }
function masteryTone(m){ return MASTERY_TONE[m] || "neutral"; }
function reviewLabel(r){ return REVIEW_LABEL[r] || ""; }

/* estado de un concepto, ya masticado para la vista */
function conceptView(id, now){
  now = now || Date.now();
  const st = LE.store().concepts[id] || {};
  const meta = LE.CONCEPT_BY_ID[id] || {};
  const seen = !!st.reps;
  return {
    id, name: meta.name || id, section: meta.section, topic: meta.topic,
    questionCount: (meta.questionIds||[]).length,
    flashcardCount: (meta.flashcardIds||[]).length,
    seen,
    mastery: seen ? (st.masteryStatus||"nuevo") : "nuevo",
    review: seen ? (st.reviewState||"futuro") : "futuro",
    masteryLabel: masteryLabel(seen ? st.masteryStatus : "nuevo"),
    masteryTone: masteryTone(seen ? st.masteryStatus : "nuevo"),
    reviewLabel: seen ? reviewLabel(st.reviewState) : "",
    dueNow: seen && st.nextReview ? st.nextReview <= now : false,
    correctReps: st.correctReps || 0,
    lastReview: st.lastReview || null,
    examDeficit: !!st.examDeficit,
  };
}

/* reparto de conceptos por estado de dominio (solo los que tienen contenido) */
function masteryBreakdown(now){
  now = now || Date.now();
  const pr = LE.store();
  const b = { nuevo:0, aprendiendo:0, consolidando:0, asentado:0,
             asentadoAlDia:0, asentadoPendiente:0, debido:0, atrasado:0, total:LE.CONCEPTS.length };
  LE.CONCEPTS.forEach(c=>{
    const st = pr.concepts[c.id];
    if(!st || !st.reps){ b.nuevo++; return; }
    b[st.masteryStatus] = (b[st.masteryStatus]||0) + 1;
    if(st.masteryStatus === "asentado"){
      if(st.reviewState === "futuro") b.asentadoAlDia++;
      else b.asentadoPendiente++;
    }
    if(st.reviewState === "debido") b.debido++;
    if(st.reviewState === "atrasado") b.atrasado++;
  });
  return b;
}

/* ---- view-model: INICIO ("¿qué hago ahora?") ---------------- */
function homeModel(){
  const now = Date.now();
  const ctx = LE.planCtx(now);
  const ov = LE.overview(now);
  const ranked = LE.rankedConcepts(ctx);
  const breakdown = masteryBreakdown(now);
  const anyData = LE.store().events.length > 0;

  // acciones recomendadas: los conceptos de mayor prioridad que NO están
  // "asentado + al día" (esos no necesitan nada ahora).
  const actionable = ranked
    .filter(r => !(r.masteryStatus === "asentado" && r.reviewState === "futuro"))
    .slice(0, 6)
    .map(r => {
      const meta = LE.CONCEPT_BY_ID[r.id];
      let reason;
      if(r.reviewState === "atrasado")      reason = "Repaso atrasado";
      else if(r.reviewState === "debido")    reason = "Toca repasar";
      else if(r.masteryStatus === "nuevo")   reason = "Sin empezar";
      else if(r.masteryStatus === "aprendiendo") reason = "Aprendiendo — necesita recuperación";
      else if(r.masteryStatus === "consolidando") reason = "Consolidando";
      else                                   reason = "Reforzar";
      return { id:r.id, name: meta ? meta.name : r.id, reason,
               mastery:r.masteryStatus, review:r.reviewState,
               masteryLabel:masteryLabel(r.masteryStatus), masteryTone:masteryTone(r.masteryStatus) };
    });

  let exam = null;
  if(ctx.hasExam){
    const rd = LE.examReadiness(ctx);
    exam = {
      daysLeft: rd.daysLeft,
      studyDays: rd.studyDays,
      deficitCount: rd.deficitCount,
      deficitConcepts: rd.deficits.map(id => (LE.CONCEPT_BY_ID[id]||{}).name || id).slice(0, 6),
      // "coverageProjection" es todavía poco discriminante -> NO se muestra como % de probabilidad
      sinDeficit: rd.deficitCount === 0,
      phase: ctx.profile.name,
      hint: rd.hint,
    };
  }

  return {
    anyData,
    minutesPerDay: (getPlan() && getPlan().minutesPerDay) || 20,
    dimensiones: ov.dimensiones,
    breakdown,
    dueTotal: breakdown.debido + breakdown.atrasado,
    atrasadoTotal: breakdown.atrasado,
    pendientes: ov.pendientes,
    veredicto: ov.veredicto,
    estabilidadMediaDias: Math.round(ov.estabilidadMediaDias),
    actionable,
    exam,
    hasExam: ctx.hasExam,
  };
}

/* ---- view-model: PROGRESO ---------------------------------- */
function progressModel(){
  const now = Date.now();
  const ctx = LE.planCtx(now);
  const ov = LE.overview(now);
  const breakdown = masteryBreakdown(now);

  // por pestaña: reparto de dominio de sus conceptos
  const bySection = LE.CONCEPTS.reduce((acc,c)=>{
    (acc[c.section] = acc[c.section] || []).push(c.id);
    return acc;
  }, {});
  const sections = (O.TAXONOMY_SECTIONS||[]).filter(s=>bySection[s.id]).map(s=>{
    const ids = bySection[s.id];
    let asentado=0, enProgreso=0, nuevo=0, repaso=0;
    ids.forEach(id=>{
      const cv = conceptView(id, now);
      if(!cv.seen) nuevo++;
      else if(cv.mastery === "asentado") asentado++;
      else enProgreso++;
      if(cv.seen && cv.review !== "futuro") repaso++;
    });
    return { id:s.id, name:s.name, total:ids.length, asentado, enProgreso, nuevo, repaso,
             pct: ids.length ? Math.round((asentado/ids.length)*100) : 0 };
  });

  // conceptos que "se escapan": vistos, sin dominio, con error reciente o atraso
  const escaping = LE.rankedConcepts(ctx)
    .filter(r=>{
      const st = LE.store().concepts[r.id];
      return st && st.reps && r.masteryStatus !== "asentado" &&
             (r.reviewState === "atrasado" || (r.overdue||0) > 0 || (st.recall||[]).slice(-3).includes(false));
    })
    .slice(0, 8)
    .map(r=>({ id:r.id, name:(LE.CONCEPT_BY_ID[r.id]||{}).name || r.id,
               masteryLabel:masteryLabel(r.masteryStatus), reviewLabel:reviewLabel(r.reviewState),
               masteryTone:masteryTone(r.masteryStatus) }));

  let exam = null;
  if(ctx.hasExam){
    const rd = LE.examReadiness(ctx);
    exam = { daysLeft: rd.daysLeft, studyDays: rd.studyDays, deficitCount: rd.deficitCount,
             deficitConcepts: rd.deficits.map(id=>(LE.CONCEPT_BY_ID[id]||{}).name || id),
             phase: ctx.profile.name, hint: rd.hint, sinDeficit: rd.deficitCount === 0 };
  }

  return { ov, breakdown, sections, escaping, exam, hasExam: ctx.hasExam,
           estabilidadMediaDias: Math.round(ov.estabilidadMediaDias) };
}

/* ---- view-model: TEMARIO (una pestaña) --------------------- */
function sectionConceptsModel(sectionId){
  const now = Date.now();
  const sec = (O.TAXONOMY_SECTIONS||[]).find(s=>s.id===sectionId);
  if(!sec) return null;
  const topics = (sec.topics||[]).map(t=>{
    const id = sectionId + ":" + t.id;
    const cv = conceptView(id, now);
    return Object.assign({ topicId:t.id, topicName:t.name }, cv, { exists: !!LE.CONCEPT_BY_ID[id] });
  }).filter(t=>t.exists);
  const seen = topics.filter(t=>t.seen).length;
  const asentado = topics.filter(t=>t.mastery==="asentado").length;
  const repaso = topics.filter(t=>t.seen && t.review!=="futuro").length;
  return { section:{ id:sec.id, name:sec.name }, topics, total:topics.length, seen, asentado, repaso };
}

/* ---- flashcards del plan del motor ------------------------- */
function smartFlashcards(minutes){
  const run = LE.smartSessionRun(minutes || (getPlan() && getPlan().minutesPerDay) || 20);
  return run.cardIds;
}

// Sesión centrada SOLO en lo que toca repasar (conceptos debidos/atrasados).
// Devuelve una sesión de práctica lista para el runner, o null si no hay nada.
function startReviewSession(minutes){
  const ctx = LE.planCtx(Date.now());
  const pr = LE.store();
  const now = Date.now();
  const due = LE.rankedConcepts(ctx).filter(r=>{
    const st = pr.concepts[r.id];
    return st && st.nextReview && st.nextReview <= now;
  });
  if(!due.length) return null;
  const n = LE.itemsForMinutes(minutes || (getPlan() && getPlan().minutesPerDay) || 20);
  const avoid = new Set();
  const qIds = [];
  // dos pasadas: amplitud y luego profundidad
  for(let pass=0; pass<3 && qIds.length<n; pass++){
    let added = false;
    for(const r of due){
      if(qIds.length >= n) break;
      const it = LE.bestItem(r.id, ctx, avoid);
      if(it && it.kind === "q"){ avoid.add(it.id); qIds.push(it.id); added = true; }
    }
    if(!added) break;
  }
  if(!qIds.length) return null;
  const s = O.buildSessionFromIds(qIds, { mode:"practice", shuffleOptions:true, smart:true }, null);
  if(s){ s.smart = true; s.smartCardIds = []; }
  return s;
}

// Sesión de práctica centrada en un único concepto (section:topic).
function startConceptSession(conceptId){
  const meta = LE.CONCEPT_BY_ID[conceptId];
  if(!meta) return null;
  const [section, topic] = conceptId.split(":");
  return O.buildSession({ mode:"practice", section, topic, count:"todas", qOrder:"aleatorio",
    source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true });
}

// Vista previa del plan inteligente sin construir la sesión (para el Inicio).
function smartPreview(minutes){
  const run = LE.smartSessionRun(minutes || (getPlan() && getPlan().minutesPerDay) || 20, null, { preview:true });
  return { total: run.plan.items.length, questions: run.qIds.length, cards: run.cardIds.length,
           phase: run.plan.phase, goal: run.plan.goal, estMinutes: run.plan.estMinutes,
           buckets: run.plan.mix };
}

O.LEB = {
  boot, markShown, elapsedMs,
  recordQuestion, recordExamSession, recordFlashcard, recalcNow, recalcSoon,
  getPlan, setPlan, clearExamDate,
  startSmartSession, startReviewSession, startConceptSession, smartFlashcards, smartPreview,
  homeModel, progressModel, sectionConceptsModel, conceptView, masteryBreakdown,
  masteryLabel, masteryTone, reviewLabel,
};

})();
