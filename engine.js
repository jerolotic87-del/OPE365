/* ============================================================
   OPE365 · Motor de aprendizaje (Learning Engine)
   ------------------------------------------------------------
   Fase 1 + endurecimiento. Motor + priorizador + generador de
   sesión + capa de examen. SIN interfaz. Se valida con
   tests/sim.js y tests/test_engine.js antes de integrar
   ninguna pantalla.

   Documentos de diseño:
     docs/plan-inteligente.html   — arquitectura
     docs/memory-engine.html      — este motor, con cada
                                    parámetro etiquetado

   No toca app.js. Lee/escribe claves nuevas en OPE.PROGRESS
   (plan, events, concepts, qstate, fcstate) con guardas de init
   y llama a OPE.persist(). Todo el tiempo entra por un parámetro
   `now` (ms) para que la simulación controle el reloj.

   MODELO DE ESTADO (endurecido) — dos ejes independientes:
     masteryStatus : nuevo · aprendiendo · consolidando · asentado
     reviewState   : futuro · debido · atrasado
   Un concepto puede ser  asentado + atrasado  a la vez: que toque
   repasarlo NO significa que se haya dejado de saber. 'asentado'
   sólo se abandona ante evidencia ACTUAL de pérdida (un fallo
   reciente o el acierto reciente por debajo del umbral).
   `status` se conserva como valor compuesto legado para compat.
============================================================ */
(function(){
"use strict";
const O = window.OPE;
if(!O){ console.warn("engine.js: window.OPE no disponible"); return; }

const DAY = 86400000;
const HOUR = 3600000;
function save(){ if(!O.LE || !O.LE._noPersist) O.persist(); }

/* ============================================================
   PARÁMETROS — la "tabla de honestidad" en forma de código.
   Categorías:  PRINCIPIO (ciencia) · PRODUCTO (decisión) ·
                HEURÍSTICA (punto de partida) · CALIBRABLE
   Sólo se tocan aquí, nunca desde la interfaz.
============================================================ */
const P = {
  // — "asentado": evidencia suficiente de dominio ACTUAL (reversible).
  //   PRODUCTO. Umbral conservador para preparación de oposición.
  //   3 recuperaciones (Rawson) + condiciones adicionales.
  masteryReps:        3,      // recuperaciones correctas en días DISTINTOS
  masterySpanDays:    3,      // separación temporal real (primera→última), días
  masteryInterval:    7,      // intervalo alcanzado, días
  masteryAcc:         0.8,    // acierto en las últimas 5 recuperaciones
  masteryFramings:    2,      // nº de framings distintos acertados (transferencia)
  masteryConfidence:  0.45,   // confianza mínima del diagnóstico para declarar 'asentado'
  //   histéresis: una vez 'asentado', sólo se pierde con evidencia actual
  masteryDropAcc:     0.6,    // si el acierto reciente cae por debajo → 'consolidando'

  // — retención objetivo. PRODUCTO. Solo configurable aquí.
  //   0.90 = priorizar no olvidar sobre eficiencia. NO es una constante
  //   científica descubierta para este usuario: es una decisión de producto
  //   calibrable a la luz de simulación y datos reales.
  targetRetention:    0.90,

  // — curva de olvido. HEURÍSTICA. R(t)=2^(-kR·t/interval); kR fija R=target en t=interval.
  get kR(){ return -Math.log2(this.targetRetention); },   // ≈ 0.152 para 0.90

  // — progresión de intervalos. HEURÍSTICA (rango de SM-2 / FSRS; valores nuestros).
  firstInterval:   2,   // primera revisión tras un acierto, días. NO depende de la
                        // rapidez de la respuesta (eso influye a partir de la 2ª rep).
  lapseFactor:     0.4, // "again": interval ·= lapseFactor
  growth:          2.2, // multiplicador tras un "good" espaciado
  hardFactor:      0.35,// "hard" crece (growth-1)·hardFactor
  spacingBonusMin: 0.8, // recuperar tras hueco < intervalo previo vale menos
  spacingBonusMax: 1.4, // recuperar tras hueco largo vale más (efecto de espaciado, PRINCIPIO)
  difficultyDamp:  0.15,// amortigua el crecimiento en conceptos intrínsecamente duros
  sameSessionHours: 10, // dos recuperaciones dentro de este margen = misma sesión:
                        //   cuentan como recuperación pero NO espacian (no se puede
                        //   "espaciar" dentro del mismo día). Esto hace que dos
                        //   eventos del mismo instante sean conmutativos.
  intervalMin: 1, intervalMax: 365,

  // — capa de examen. PRODUCTO.
  safetyBufferDays:   2,    // ninguna revisión en los 2 días previos al examen
  defaultHorizonDays: 90,   // horizonte operativo si aún no hay fecha

  // — anti-repetición. PRODUCTO.
  minRepeatSessions:  3,    // un ítem no se repite en N sesiones consecutivas
  minRepeatHours:    20,    // ni dentro de esta ventana horaria
  maxSilenceDays:    21,    // ningún concepto con contenido más de N días sin aparecer
  maxPerConceptLong: 3,     // veces que un concepto puede aparecer en una sesión larga
  maxPerConceptShort: 2,    // …y en una sesión corta (≤12 ítems)

  // — ritmo / duración de sesión. HEURÍSTICA (se sustituye por la media móvil real).
  secPerQuestion:   28,     // por defecto hasta tener ≥8 medidas reales
  secPerFlashcard:  14,
  secObservedMin:   12, secObservedMax: 120,
  sessionMinItems:  3,
  minSecPerItemHard: 8,     // nadie responde más rápido que esto: sólo evita divisiones absurdas
  //   tolerancia de duración: una sesión de M min debe caer en [M·lo, M·hi]
  //   salvo que se agote el contenido disponible.
  sessionDurLo: 0.70, sessionDurHi: 1.25,

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
   ESTADO — PROGRESS.concepts / events / plan / qstate / fcstate
============================================================ */
function store(){
  const pr = O.PROGRESS;
  if(!pr.concepts) pr.concepts = {};
  if(!pr.events)   pr.events   = [];
  if(!pr.qstate)   pr.qstate   = {};
  if(!pr.fcstate)  pr.fcstate  = {};
  if(!("plan" in pr)) pr.plan  = null;
  return pr;
}
function dayNum(ms){ return Math.floor(ms / DAY); }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

function newConcept(){
  return { interval:0, lastReview:null, nextReview:null,
    reps:0, correctReps:0, lapses:0, recall:[], framingsCorrect:[],
    correctRepDays:[], examPerf:[], firstSeen:null,
    masteryStatus:"nuevo", reviewState:"futuro", status:"nuevo",
    diagConfidence:0, examDeficit:false };
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
function recentAcc(c){
  const r = (c && c.recall) || [];
  return r.length ? r.filter(Boolean).length / r.length : 0;
}
function spanDays(c){
  const d = (c && c.correctRepDays) || [];
  return d.length < 2 ? 0 : d[d.length-1] - d[0];
}
function memoryOK(c, now){ return retrievability(c, now||Date.now()) >= 0.75 || (c && c.interval >= P.masteryInterval); }
// transferencia: el estado no guarda su propio id, así que recibe (estado, conceptId)
function transferScoreOf(state, conceptId){
  const avail = (CONCEPT_BY_ID[conceptId] && CONCEPT_BY_ID[conceptId].framings.length) || 1;
  return clamp(((state.framingsCorrect||[]).length) / Math.max(2, avail), 0, 1);
}

/* ---- EJE 1: dominio del concepto (independiente de si toca repasar) ---- */
function deriveMastery(c){
  if(!c || !c.reps) return "nuevo";
  const acc = recentAcc(c);
  const meets =
       (c.correctReps||0)            >= P.masteryReps
    && (c.correctRepDays||[]).length >= P.masteryReps
    && spanDays(c)                   >= P.masterySpanDays
    && (c.interval||0)               >= P.masteryInterval
    && acc                           >= P.masteryAcc
    && (c.framingsCorrect||[]).length>= P.masteryFramings
    && (c.diagConfidence||0)         >= P.masteryConfidence;
  if(meets) return "asentado";
  if(c.masteryStatus === "asentado"){
    // ya estaba asentado: sólo se abandona ante evidencia ACTUAL de pérdida.
    // Que haya vencido para repaso, o que el intervalo se haya recortado por
    // matemática de agenda, NO cuenta como pérdida de dominio.
    const lapsedRecently = (c.recall||[]).slice(-2).includes(false);
    if(lapsedRecently || acc < P.masteryDropAcc) return "consolidando";
    return "asentado";
  }
  if((c.correctReps||0) >= 1 && acc >= 0.5) return "consolidando";
  return "aprendiendo";
}
/* ---- EJE 2: estado de repaso (puramente temporal) ---- */
function deriveReviewState(c, now){
  if(!c || !c.nextReview) return "futuro";
  if(now < c.nextReview) return "futuro";
  const over = (now - c.nextReview) / ((c.interval||1) * DAY);
  return over > 0.5 ? "atrasado" : "debido";
}
/* valor compuesto legado (compat con lecturas antiguas) */
function legacyStatus(c){
  if(!c || !c.reps) return "nuevo";
  if(c.masteryStatus === "asentado") return c.reviewState === "futuro" ? "asentado" : "repaso";
  return c.masteryStatus;
}

/* confianza del diagnóstico (INTERNA, 0..1): cuánto se fía el motor de conocer
   el verdadero estado del concepto. Sube con volumen de respuestas, variedad de
   framings y dispersión temporal. Nunca se muestra al usuario; sirve para no
   tomar decisiones agresivas con pocos datos. */
function deriveConfidence(c){
  const vol   = clamp(((c.reps||0) + ((c.examPerf||[]).length) * 2) / 10, 0, 1);
  const varia = clamp(((c.framingsCorrect||[]).length) / 4, 0, 1);
  const disp  = clamp(spanDays(c) / 21, 0, 1);
  return clamp(0.45 * vol + 0.35 * varia + 0.20 * disp, 0, 1);
}
/* recalcula los tres campos derivados de un concepto */
function refreshDerived(c, now){
  c.diagConfidence = deriveConfidence(c);
  c.masteryStatus  = deriveMastery(c);
  c.reviewState    = deriveReviewState(c, now);
  c.status         = legacyStatus(c);
}

/* ============================================================
   REGISTRO DE EVENTOS + ACTUALIZACIÓN DEL MODELO
============================================================ */
function gradeFromAnswer(correct, ms){
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
  const isExam = ev.kind === "exam";
  const itemKind = ev.kind === "fc" ? "fc" : "q";
  const conceptId = ev.concept
    || (itemKind === "fc" ? CONCEPT_OF_CARD[ev.ref] : CONCEPT_OF_Q[ev.ref]);
  const framing = ev.framing
    || (itemKind === "q" && O.Q_BY_ID[ev.ref] ? framingOf(O.Q_BY_ID[ev.ref]) : "conceptual");

  pr.events.push({ ts:now, kind:ev.kind, ref:ev.ref, concept:conceptId,
    framing, grade:ev.grade, correct:!!ev.correct, ms:ev.ms||null,
    confidence:ev.confidence||null });
  if(pr.events.length > 4000) pr.events = pr.events.slice(-3000);

  // estado ligero del ítem (anti-repetición + señal de competencia) — preguntas y fichas
  const bag = itemKind === "fc" ? pr.fcstate : pr.qstate;
  if(ev.ref){
    const s = bag[ev.ref] || { seen:0, correct:0, wrong:0, last:0 };
    s.seen++; s.last = now; ev.correct ? s.correct++ : s.wrong++;
    bag[ev.ref] = s;
  }

  if(conceptId) updateConceptState(conceptId, ev.grade, framing, isExam, now);
  save();
}

function updateConceptState(conceptId, grade, framing, isExam, now){
  const c = getConcept(conceptId);
  const prevInterval = c.interval || 0;
  const sameSession = c.lastReview != null && (now - c.lastReview) < P.sameSessionHours * HOUR;

  if(grade === "again"){
    c.interval = Math.max(P.intervalMin, (c.interval || 1) * P.lapseFactor);
    c.lapses++;
    c.recall.push(false);
  } else {
    if(!prevInterval){
      // primera recuperación: intervalo fijo, no depende de la rapidez
      c.interval = P.firstInterval;
    } else if(!sameSession){
      const gap = c.lastReview ? ((now - c.lastReview) / DAY) / prevInterval : 1;
      const spacingBonus = clamp(gap, P.spacingBonusMin, P.spacingBonusMax);
      const gr = grade === "hard" ? (1 + (P.growth - 1) * P.hardFactor) : P.growth;
      const diffFactor = 1 - P.difficultyDamp * (conceptDifficulty(conceptId) - 0.5) * 2;
      // un acierto NUNCA acorta el intervalo (a lo sumo lo hace crecer poco: "hard")
      c.interval = Math.max(prevInterval, prevInterval * gr * spacingBonus * diffFactor);
    }
    // sameSession con intervalo ya existente: el intervalo NO cambia — no se puede
    // espaciar dentro de la misma sesión. Así dos eventos del mismo instante son
    // conmutativos (mismo resultado en cualquier orden).
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
  refreshDerived(c, now);
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
  // el estado sembrado nace inestable: recorta intervalos largos (determinista)
  Object.values(pr.concepts).forEach(c=>{
    if(c.interval > 10){ c.interval = 10; c.nextReview = c.lastReview + c.interval*DAY; }
    refreshDerived(c, now);
  });
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
    createdAt: (pr.plan && pr.plan.createdAt) || Date.now(),
    lastRecalc: Date.now(),
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
    if(weekdays.includes(new Date(d*DAY).getUTCDay())) n++;
  }
  return Math.max(0, n);
}
function observedSecPerItem(kind){
  const pr = store();
  const want = kind === "fc" ? "fc" : "q";
  const evs = pr.events.filter(e=> e.kind === want && e.ms).slice(-60);
  if(evs.length < 8) return want === "fc" ? P.secPerFlashcard : P.secPerQuestion;
  const avg = evs.reduce((s,e)=> s + e.ms/1000, 0) / evs.length;
  return clamp(avg, P.secObservedMin, P.secObservedMax);
}
/* Nº de ítems para un presupuesto de minutos. Objetivo aproximado, no tope duro:
   se usa el ritmo real observado; el único límite es una densidad máxima
   (maxItemsPerMinute) para no comprimir la sesión hasta lo irreal. */
function itemsForMinutes(minutes){
  const sec = observedSecPerItem("q");
  const raw = Math.round(minutes * 60 / sec);
  const ceil = Math.round(minutes * 60 / P.minSecPerItemHard);   // sólo evita cifras absurdas
  return clamp(raw, P.sessionMinItems, Math.max(P.sessionMinItems, ceil));
}
/* duración estimada (min) de una sesión de n ítems al ritmo observado */
function estimatedMinutes(nItems){
  return Math.round(nItems * observedSecPerItem("q") / 60);
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
    return { score: w.cobertura * 1 + w.importancia * sizeNorm,
             masteryStatus:"nuevo", reviewState:"futuro", status:"nuevo" };
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

  // amortiguar sólo lo que está DOMINADO y aún no vencido; si está dominado pero
  // debido/atrasado, se deja subir por 'atraso' (repasar lo que sabes también toca).
  if(c.masteryStatus === "asentado"){
    if(c.reviewState === "futuro") score -= w.stableDamp;
    else if(c.reviewState === "debido") score -= w.stableDamp * 0.3;
  }
  return { score: Math.max(0, score), masteryStatus:c.masteryStatus, reviewState:c.reviewState,
           status:c.status, R, overdue, examP };
}

/* nº de recuperaciones que faltan para 'asentado' (o 1 refresco si ya asentado
   pero vencido, de cara a la fecha de examen) */
function neededRetrievals(c){
  if(!c || !c.reps) return P.masteryReps;
  if(c.masteryStatus === "asentado") return c.reviewState === "futuro" ? 0 : 1;
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
  const activeConcepts = CONCEPTS.filter(x=>{
    const st = pr.concepts[x.id];
    return !st || st.masteryStatus !== "asentado";
  }).length || 1;
  const opportunities = studyDays / Math.max(1, activeConcepts / itemsForMinutes(ctx.plan.minutesPerDay));
  return clamp(need / Math.max(1, opportunities), 0, 3);
}

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
   SELECCIÓN DE ÍTEM PARA UN CONCEPTO
============================================================ */
function recentlySeen(ref, kind, ctx){
  const pr = store();
  const st = (kind === "fc" ? pr.fcstate : pr.qstate)[ref];
  if(!st) return false;
  if(ctx.now - st.last < P.minRepeatHours * HOUR) return true;
  const sessTs = (pr._recentSessionStarts || []).slice(-P.minRepeatSessions);
  return sessTs.some(ts => st.last >= ts);
}
/* devuelve {kind,id,framing} o null. Prefiere preguntas; cae a flashcard sólo si
   no queda pregunta utilizable. Respeta anti-repetición para AMBOS tipos. */
function bestItem(conceptId, ctx, avoid){
  const meta = CONCEPT_BY_ID[conceptId]; if(!meta) return null;
  const pr = store();
  const c = pr.concepts[conceptId];

  let qpool = meta.questionIds.filter(id => O.Q_BY_ID[id] && !avoid.has(id));
  const qfresh = qpool.filter(id => !recentlySeen(id, "q", ctx));
  let usePool = qfresh.length ? qfresh : qpool;
  if(usePool.length){
    if(c && c.correctReps >= 2){
      const unseen = usePool.filter(id => !(c.framingsCorrect||[]).includes(framingOf(O.Q_BY_ID[id])));
      if(unseen.length) usePool = unseen;
    }
    const acc = c ? recentAcc(c) : 0.5;
    const wantHard = acc >= 0.8 && c && c.correctReps >= 2;
    const rk = { baja: wantHard?2:0, media:1, alta: wantHard?0:2 };
    usePool = usePool.slice().sort((a,b)=>{
      const da = rk[O.Q_BY_ID[a].difficulty] ?? 1, db = rk[O.Q_BY_ID[b].difficulty] ?? 1;
      if(da !== db) return da - db;
      return ((pr.qstate[a]||{}).seen||0) - ((pr.qstate[b]||{}).seen||0);
    });
    const id = usePool[0];
    return { kind:"q", id, framing:framingOf(O.Q_BY_ID[id]) };
  }

  let fpool = meta.flashcardIds.filter(id => !avoid.has(id));
  const ffresh = fpool.filter(id => !recentlySeen(id, "fc", ctx));
  const fp = ffresh.length ? ffresh : fpool;
  if(fp.length){
    fp.sort((a,b)=> ((pr.fcstate[a]||{}).seen||0) - ((pr.fcstate[b]||{}).seen||0));
    return { kind:"fc", id:fp[0], framing:"conceptual" };
  }
  return null;
}

/* ============================================================
   GENERADOR DE SESIÓN
   Pasada 1 = AMPLITUD (un ítem por concepto, por prioridad).
   Pasada 2 = PROFUNDIDAD (repetir conceptos de alta prioridad:
              transferencia pendiente, recuperación en curso,
              presión de examen) — hasta maxPerConcept veces.
   Reordenado final: nunca dos ítems seguidos del mismo concepto
   salvo que sea inevitable.
============================================================ */
function buildSmartSession(minutes, ctx){
  ctx = ctx || planCtx();
  const pr = store();
  const n = itemsForMinutes(minutes);
  const prof = ctx.profile;
  const maxPer = n <= 12 ? P.maxPerConceptShort : P.maxPerConceptLong;

  const ranked = rankedConcepts(ctx);
  const due = new Set(dueConcepts(ctx));
  const avoid = new Set();
  const perConcept = {};
  let items = [];

  function pick(conceptId, bucket, isExam){
    if((perConcept[conceptId]||0) >= maxPer) return false;
    const it = bestItem(conceptId, ctx, avoid);
    if(!it) return false;
    avoid.add(it.id);
    items.push({ kind:it.kind, ref:it.id, concept:conceptId, framing:it.framing, bucket, isExam:!!isExam });
    perConcept[conceptId] = (perConcept[conceptId]||0) + 1;
    return true;
  }

  // ---- PASADA 1 · AMPLITUD -------------------------------------------------
  // 0. rescate anti-silencio (concepto ya visto > maxSilenceDays sin aparecer)
  CONCEPTS.filter(c=>{
    const st = pr.concepts[c.id];
    return st && st.lastReview && (ctx.now - st.lastReview) > P.maxSilenceDays * DAY;
  }).sort((a,b)=> pr.concepts[a.id].lastReview - pr.concepts[b.id].lastReview)
    .forEach(c=>{ if(items.length < n) pick(c.id, "repaso"); });

  // 1. repaso: conceptos vencidos, por prioridad
  const dueRanked = ranked.filter(r => due.has(r.id));
  for(const r of dueRanked){
    if(items.filter(i=>i.bucket==="repaso").length >= Math.round(n*prof.mix.repaso)) break;
    if(!perConcept[r.id]) pick(r.id, "repaso");
  }
  // 2. refuerzo: error reciente + sin dominio
  const weak = ranked.filter(r => {
    const st = pr.concepts[r.id];
    return st && st.reps && recentAcc(st) < 0.7 && st.masteryStatus !== "asentado";
  });
  for(const r of weak){
    if(items.filter(i=>i.bucket==="refuerzo").length >= Math.round(n*prof.mix.refuerzo)) break;
    if(!perConcept[r.id]) pick(r.id, "refuerzo");
  }
  // 3. mixto: interleaving nuevo + prioridad media, barajado entre secciones
  const mixBySec = {};
  ranked.forEach(r=>{
    if(perConcept[r.id]) return;
    const st = pr.concepts[r.id];
    const isNew = !st || st.masteryStatus === "nuevo";
    if(isNew && !prof.newAllowed) return;
    if(!isNew && r.score <= 0.12) return;
    (mixBySec[r.id.split(":")[0]] = mixBySec[r.id.split(":")[0]] || []).push(r.id);
  });
  {
    const secs = Object.keys(mixBySec);
    const mixTarget = Math.round(n * prof.mix.mixto);
    for(let step=0, si=0; step < ranked.length && secs.length && items.length < n; step++, si++){
      if(items.filter(i=>i.bucket==="mixto").length >= mixTarget) break;
      const k = si % secs.length;
      const id = mixBySec[secs[k]].shift();
      if(id) pick(id, "mixto");
      if(!mixBySec[secs[k]] || !mixBySec[secs[k]].length){ secs.splice(k, 1); si--; }
    }
  }
  // 4. examen: bloque sin feedback, sólo contenido ya estudiado
  const examTarget = Math.round(n * prof.mix.examen);
  if(examTarget > 0){
    const pool = shuffleDet(CONCEPTS.map(c=>c.id).filter(id=>{
      const st = pr.concepts[id]; return st && st.reps;
    }), ctx.now);
    for(const id of pool){
      if(items.filter(i=>i.bucket==="examen").length >= examTarget) break;
      pick(id, "examen", true);
    }
  }

  // ---- PASADA 2 · PROFUNDIDAD --------------------------------------------
  const deepen = ranked.filter(r=>{
    const st = pr.concepts[r.id];
    if(!st || !st.reps) return false;
    const transferPend = memoryOK(st, ctx.now) && transferScoreOf(st, r.id) < 0.75;
    const learning = st.masteryStatus === "aprendiendo" || st.masteryStatus === "consolidando";
    const examUrg = ctx.hasExam && examPressure(r.id, ctx) > 0.5;
    return (transferPend || learning || examUrg) && r.score > 0.15;
  });
  for(let guard = 0; items.length < n && guard < n * 3; guard++){
    let added = false;
    for(const r of deepen){
      if(items.length >= n) break;
      if((perConcept[r.id]||0) >= maxPer) continue;
      if(pick(r.id, "profundizar")) added = true;
    }
    if(!added) break;
  }

  // ---- RELLENO por prioridad si aún falta ------------------------------
  for(const r of ranked){
    if(items.length >= n) break;
    if(!prof.newAllowed){ const st = pr.concepts[r.id]; if(!st || !st.reps) continue; }
    pick(r.id, "mixto");
  }

  // ---- REORDENAR: nunca dos ítems seguidos del mismo concepto ----------
  items = spreadByConcept(items).slice(0, n);

  pr._recentSessionStarts = (pr._recentSessionStarts || []).concat(ctx.now).slice(-10);
  save();

  const consecutive = countConsecutive(items);
  return {
    items, minutes, estItems:n, estMinutes: estimatedMinutes(items.length),
    phase: prof.name, mix: countBuckets(items), goal: sessionGoal(items, ctx),
    concepts: [...new Set(items.map(i=>i.concept))],
    maxPerConcept: maxPer,
    deepened: items.filter(i=>i.bucket==="profundizar").length,
    consecutiveSameConcept: consecutive,
    topPriority: ranked.find(r=>perConcept[r.id]) || null,
  };
}
function spreadByConcept(items){
  const rest = items.slice();
  const out = [];
  while(rest.length){
    let idx = rest.findIndex(it => !out.length || it.concept !== out[out.length-1].concept);
    if(idx === -1) idx = 0;              // inevitable: sólo queda un concepto
    out.push(rest.splice(idx, 1)[0]);
  }
  return out;
}
function countConsecutive(items){
  let n = 0;
  for(let i=1;i<items.length;i++) if(items[i].concept === items[i-1].concept) n++;
  return n;
}
function countBuckets(items){
  const c = { repaso:0, refuerzo:0, mixto:0, examen:0, profundizar:0 };
  items.forEach(i=> c[i.bucket] = (c[i.bucket]||0) + 1);
  return c;
}
function sessionGoal(items, ctx){
  const consolidables = new Set(items.filter(i=>i.bucket==="repaso"||i.bucket==="refuerzo").map(i=>i.concept)).size;
  const transfer = items.filter(i=> (i.bucket==="mixto"||i.bucket==="profundizar") && ["caso","ruta","discriminacion"].includes(i.framing)).length;
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
// índice eventos-por-concepto, memoizado por identidad+longitud del log
let _idxCache = { arr:null, len:-1, map:null };
function eventsByConcept(){
  const pr = store();
  if(_idxCache.arr === pr.events && _idxCache.len === pr.events.length && _idxCache.map) return _idxCache.map;
  const map = {};
  pr.events.forEach(e=>{ if(e.concept) (map[e.concept] = map[e.concept] || []).push(e); });
  _idxCache = { arr: pr.events, len: pr.events.length, map };
  return map;
}
function conceptDimensions(conceptId, now, idx){
  now = now || Date.now();
  const c = store().concepts[conceptId];
  const meta = CONCEPT_BY_ID[conceptId];
  if(!c || !c.reps) return { memoria:0, competencia:0, transferencia:0, cobertura:0,
                             examen:null, confianza:0, masteryStatus:"nuevo", reviewState:"futuro", status:"nuevo" };
  const evAll = (idx || eventsByConcept())[conceptId] || [];
  const R = retrievability(c, now);
  const memoria = clamp(R * (c.interval >= P.masteryInterval ? 1 : c.interval / P.masteryInterval), 0, 1);
  const hardFr = ["caso","ruta","discriminacion"];
  const evs = evAll.filter(e=> e.kind !== "exam" && hardFr.includes(e.framing));
  const competencia = evs.length ? evs.filter(e=>e.correct).length / evs.length : (c.correctReps>=2 ? 0.5 : 0.2);
  const transferencia = transferScoreOf(c, conceptId);
  const seen = new Set(evAll.filter(e=>e.kind==="q").map(e=>e.ref));
  const cobertura = meta ? clamp(seen.size / Math.min(meta.size, 8), 0, 1) : 0;
  const examen = c.examPerf.length ? c.examPerf.filter(Boolean).length / c.examPerf.length : null;
  return { memoria, competencia, transferencia, cobertura, examen,
           confianza:c.diagConfidence, masteryStatus:c.masteryStatus, reviewState:c.reviewState, status:c.status };
}
function overview(now){
  now = now || Date.now();
  const pr = store();
  const total = CONCEPTS.length;
  let seen=0, recuperado=0, asentado=0, asentadoPendiente=0, atencion=0, atrasados=0, nInterval=0;
  const dims = { memoria:0, competencia:0, transferencia:0, cobertura:0 };
  let examSum=0, examN=0, wsum=0;
  const idx = eventsByConcept();
  const intervals = [];
  CONCEPTS.forEach(c=>{
    const st = pr.concepts[c.id];
    const w = c.size;
    if(st && st.reps){
      seen++;
      if(st.correctReps >= 1) recuperado++;
      if(st.masteryStatus === "asentado"){ asentado++; if(st.reviewState !== "futuro") asentadoPendiente++; }
      if(st.masteryStatus === "aprendiendo" || (st.reps && recentAcc(st) < 0.6)) atencion++;
      if(st.reviewState === "atrasado") atrasados++;
      intervals.push(st.interval); nInterval++;
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
    asentados: asentado, asentadosPendientesDeRepaso: asentadoPendiente,
    necesitanAtencion: atencion, atrasados, pendientes: total - seen,
    estabilidadMediaDias: nInterval ? median(intervals) : 0,
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
  const daysAvailToCritical = ctx.hasExam ? countStudyDays(ctx.now, ctx.criticalMs, ctx.plan.weekdays) : Infinity;
  const itemsPerDay = itemsForMinutes(minutes);
  const capacity = studyDays * itemsPerDay;

  let demand = 0;
  const deficits = [];
  CONCEPTS.forEach(c=>{
    const st = pr.concepts[c.id];
    const need = neededRetrievals(st);
    demand += need;
    if(st && st.interval){
      const daysWindow = studyDays * (7 / Math.max(1, ctx.plan.weekdays.length));
      demand += clamp(daysWindow / Math.max(P.masteryInterval, st.interval), 0, 6);
    }
    // déficit real: no caben 'need' recuperaciones (≥1 día de separación) antes de la fecha crítica
    if(ctx.hasExam && need > 0 && (daysAvailToCritical < need || (st && st.examDeficit)))
      deficits.push(c.id);
  });
  const coverageProjection = demand > 0 ? Math.min(1, capacity / demand) : 1;
  const feasible = coverageProjection >= 0.95 && deficits.length === 0;
  return {
    studyDays, itemsPerDay, capacity, demand: Math.round(demand),
    coverageProjection, feasible,
    deficits, deficitCount: deficits.length,
    daysLeft: ctx.daysLeft,
    hint: minutesOverride ? null : (function(){
      const more = examReadiness(ctx, minutes + 10);
      return more.coverageProjection - coverageProjection > 0.03
        ? `Con ${minutes+10} min/día pasarías de ${Math.round(coverageProjection*100)}% a ${Math.round(more.coverageProjection*100)}%.`
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
  const ctx = planCtx(now);

  Object.keys(pr.concepts).forEach(id=>{
    const c = pr.concepts[id];
    if(c.masteryStatus == null) c.masteryStatus = "nuevo";   // backfill de estados antiguos
    refreshDerived(c, now);
  });

  // capa de examen: garantía dura de que ninguna recuperación NECESARIA queda
  // programada después de la fecha crítica; si no cabe, se marca déficit (no se oculta).
  if(ctx.hasExam){
    const daysAvail = Math.max(1, countStudyDays(now, ctx.criticalMs, ctx.plan.weekdays));
    CONCEPTS.forEach(c=>{
      const st = pr.concepts[c.id];
      if(!st) return;
      const need = neededRetrievals(st);
      if(!need){ st.examDeficit = false; return; }
      st.examDeficit = daysAvail < need;   // no caben ni con 1 día de separación
      const soonest = now + Math.max(1, daysAvail / (need + 1)) * DAY;
      st.nextReview = Math.min(st.nextReview || Infinity, soonest);
      if(st.nextReview > ctx.criticalMs) st.nextReview = ctx.criticalMs - DAY;  // GARANTÍA
      st.interval = Math.min(st.interval || soonest/DAY, Math.max(1, daysAvail / (need + 1)));
      st.reviewState = deriveReviewState(st, now);
      st.status = legacyStatus(st);
    });
  }
  if(pr.plan) pr.plan.lastRecalc = now;
  save();
}

/* ============================================================
   API — construir una sesión ejecutable
============================================================ */
function smartSessionRun(minutes, now){
  const ctx = planCtx(now);
  const plan = buildSmartSession(minutes, ctx);
  return {
    plan,
    qIds:    plan.items.filter(i=>i.kind==="q").map(i=>i.ref),
    cardIds: plan.items.filter(i=>i.kind==="fc").map(i=>i.ref),
    hasExamBucket: plan.items.some(i=>i.isExam),
  };
}

/* ============================================================
   EXPONER
============================================================ */
O.LE = {
  P, DAY, FRAMINGS,
  CONCEPTS, CONCEPT_BY_ID, CONCEPT_OF_Q, CONCEPT_OF_CARD, framingOf, conceptDifficulty,
  store, seedFromLegacy, setPlan, planCtx,
  recordEvent, updateConceptState, gradeFromAnswer, gradeFromFlashcard,
  getConcept, retrievability, recentAcc, spanDays,
  deriveMastery, deriveReviewState, deriveConfidence, refreshDerived,
  conceptPriority, rankedConcepts, dueConcepts, neededRetrievals, examPressure,
  bestItem, buildSmartSession, smartSessionRun, backlogPlan,
  conceptDimensions, overview, examReadiness, recalc,
  countStudyDays, itemsForMinutes, observedSecPerItem, estimatedMinutes,
};

})();
