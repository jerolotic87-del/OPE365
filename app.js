/* ============================================================
   OPE365 · Motor de la aplicación
   ============================================================ */
(function(){
"use strict";

/* ---------------------------------------------------------------
   0. ALMACENAMIENTO — con fallback en memoria si localStorage falla
--------------------------------------------------------------- */
const MemStore = (function(){
  const mem = {};
  return {
    getItem:(k)=> Object.prototype.hasOwnProperty.call(mem,k) ? mem[k] : null,
    setItem:(k,v)=>{ mem[k]=String(v); },
    removeItem:(k)=>{ delete mem[k]; }
  };
})();

let STORE = MemStore;
let storageIsLocal = false;
try{
  const testKey = "__ope365_test__";
  const ls = window.localStorage; // el propio acceso puede lanzar en orígenes opacos / iframes en sandbox
  ls.setItem(testKey, "1");
  ls.removeItem(testKey);
  STORE = ls;
  storageIsLocal = true;
}catch(e){
  STORE = MemStore;
  storageIsLocal = false;
}

const SKEY = "ope365_v1";

function loadProgress(){
  try{
    const raw = STORE.getItem(SKEY);
    if(!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultProgress(), parsed);
  }catch(e){
    return defaultProgress();
  }
}
function defaultProgress(){
  return {
    answers: {},        // qid -> {tipo, correcta(bool), seleccion, intentos, ultimaVez}
    marked: {},          // qid -> true
    history: [],          // array of session summaries
    settings: {
      onboarded:false
    },
    currentSession: null,  // in-progress exam/practice session for recovery
    challenges: {}          // challengeId -> registro de reto (ver sección 9)
  };
}
let PROGRESS = loadProgress();

function persist(){
  try{ STORE.setItem(SKEY, JSON.stringify(PROGRESS)); }
  catch(e){ /* silent fail per spec: app must not crash */ }
}

/* ---------------------------------------------------------------
   1. DATASET + VALIDACIÓN DE INTEGRIDAD
--------------------------------------------------------------- */
const RAW_QUESTIONS = window.__OPE365_DATA__ || [];
const TAXONOMY = window.__OPE365_TAXONOMY__ || { version:0, sections:[] };

function validateDataset(list){
  const report = { total:list.length, valid:0, invalid:0, invalidIds:[], bySource:{}, byType:{}, duplicateIds:[] };
  const seenIds = {};
  const valid = [];
  list.forEach(q=>{
    let ok = true;
    if(!q.id || !q.enunciado) ok = false;
    if(seenIds[q.id]) { report.duplicateIds.push(q.id); }
    seenIds[q.id] = (seenIds[q.id]||0)+1;

    if(q.tipo === "opcion_unica"){
      if(!q.opciones || q.opciones.length < 2) ok = false;
      if(!q.opciones || !q.opciones.some(o=>o.letter===q.respuesta)) ok = false;
    } else if(q.tipo === "seleccion_multiple"){
      if(!q.opciones || q.opciones.length < 2) ok = false;
      if(!Array.isArray(q.respuesta) || q.respuesta.length < 1) ok = false;
    } else if(q.tipo === "verdadero_falso"){
      if(typeof q.respuesta !== "boolean") ok = false;
    } else if(q.tipo === "emparejamiento"){
      if(!q.matching || !q.matching.left || !q.matching.left.length) ok = false;
    } else {
      ok = false;
    }

    if(ok){
      report.valid++;
      report.bySource[q.sourceFile] = (report.bySource[q.sourceFile]||0)+1;
      report.byType[q.tipo] = (report.byType[q.tipo]||0)+1;
      valid.push(q);
    } else {
      report.invalid++;
      report.invalidIds.push(q.id);
    }
  });
  return { report, valid };
}
const { report: INTEGRITY_REPORT, valid: QUESTIONS } = validateDataset(RAW_QUESTIONS);
const Q_BY_ID = {}; QUESTIONS.forEach(q=> Q_BY_ID[q.id]=q);
const ALL_SOURCES = Array.from(new Set(QUESTIONS.map(q=>q.sourceFile))).sort();
const ALL_TEMAS = Array.from(new Set(QUESTIONS.map(q=>q.tema).filter(Boolean)));
const ALL_TYPES = Array.from(new Set(QUESTIONS.map(q=>q.tipo)));
const ALL_CATEGORIAS = Array.from(new Set(QUESTIONS.map(q=>q.categoria).filter(c=>c && c!=="general")));

/* ---------------------------------------------------------------
   1.1 MODELO CANÓNICO — registros, hash de contenido y versión
   Normalización estructural (sin alterar contenido). Ver informe
   de migración expuesto en OPE.MIGRATION_REPORT / panel de Ajustes.
--------------------------------------------------------------- */

// Registro canónico de tipos de ejercicio. Los 4 valores internos
// (columna derecha) ya eran consistentes en todo el banco — no existían
// alias legados — así que este registro formaliza esa convención
// existente en lugar de renombrarla en todo el motor (evita romper
// referencias `q.tipo==="opcion_unica"` ya usadas en el motor y la UI).
const EXERCISE_TYPES = Object.freeze({
  OPTION_SINGLE:   "opcion_unica",
  OPTION_MULTIPLE: "seleccion_multiple",
  TRUE_FALSE:      "verdadero_falso",
  MATCHING:        "emparejamiento",
});
const TYPE_LABELS = Object.freeze({
  opcion_unica:        "Opción única",
  seleccion_multiple:  "Selección múltiple",
  verdadero_falso:     "Verdadero / Falso",
  emparejamiento:      "Emparejamiento",
});

// Registro de categorías (dimensión ruta/atajo/concepto/general),
// derivado de los valores ya presentes en los datos — no se inventa
// ninguna categoría nueva.
const CATEGORY_LABELS = Object.freeze({
  general:  "General",
  atajo:    "Atajo de teclado",
  ruta:     "Ruta / menú",
  concepto: "Concepto",
});
const CATEGORY_REGISTRY = Array.from(new Set(QUESTIONS.map(q=>q.categoria).filter(Boolean)))
  .sort()
  .map(id => ({ id, name: CATEGORY_LABELS[id] || id }));

// Registro de temas, derivado de los valores `tema` ya presentes.
// Se expone como registro adicional de consulta; el campo `tema` de
// cada pregunta se conserva tal cual (no se fuerza ninguna jerarquía
// tema→categoría porque los datos de origen no la respaldan).
function slugify(s){
  return String(s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "sin-tema";
}
const TOPIC_REGISTRY = Array.from(new Set(QUESTIONS.map(q=>q.tema).filter(Boolean)))
  .sort()
  .map(name => ({ id: slugify(name), name }));
const TOPIC_ID_BY_NAME = {}; TOPIC_REGISTRY.forEach(t=> TOPIC_ID_BY_NAME[t.name]=t.id);

// Registro de fuentes, derivado de sourceFile (+ bloque como sección
// cuando existe). No se inventan páginas ni documentos.
const SOURCE_REGISTRY = ALL_SOURCES.map(doc => ({
  id: doc, document: doc,
  sections: Array.from(new Set(QUESTIONS.filter(q=>q.sourceFile===doc).map(q=>q.bloque).filter(Boolean))).sort()
}));

// Huella de contenido estable (no incluye estado de sesión, orden de
// presentación ni metadatos de clasificación — solo el contenido
// evaluable: tipo, enunciado, respuestas canónicas y explicación).
function contentHash(q){
  let basis = q.tipo + "|" + q.enunciado + "|" + JSON.stringify(q.respuesta) + "|" + (q.explicacion||"");
  if(q.opciones && q.opciones.length){
    basis += "|" + q.opciones.map(o=>o.letter+":"+o.text).join(",");
  }
  if(q.matching){
    basis += "|" + JSON.stringify(q.matching.left) + "|" + JSON.stringify(q.matching.right) + "|" + JSON.stringify(q.matching.correct);
  }
  // hash djb2 — determinista, síncrono, sin dependencias externas
  let h = 5381;
  for(let i=0;i<basis.length;i++){ h = ((h*33) ^ basis.charCodeAt(i)) >>> 0; }
  return "q" + h.toString(16).padStart(8,"0");
}

// Anota cada pregunta canónica con campos de normalización aditivos
// (nunca se toca enunciado/opciones/respuesta/explicación/tipo/fuente).
const migrationLog = [];
QUESTIONS.forEach(q=>{
  const changes = [];
  if(!q.questionVersion){ q.questionVersion = 1; changes.push("questionVersion=1 asignada"); }
  const h = contentHash(q);
  if(q.contentHash !== h){ q.contentHash = h; changes.push("contentHash calculado"); }
  if(q.topicId === undefined){ q.topicId = q.tema ? TOPIC_ID_BY_NAME[q.tema] : null; changes.push("vinculada a registro de temas"); }
  // Taxonomía pedagógica nueva (section/topic/subtopic), independiente de
  // sourceFile/bloque/tema (que siguen siendo procedencia). Aditivo y
  // nulo por defecto: no se reclasifica el banco existente de golpe,
  // solo se garantiza que el campo exista para quien lo consulte.
  if(q.section === undefined){ q.section = null; changes.push("section=null por defecto"); }
  if(q.topic === undefined){ q.topic = null; changes.push("topic=null por defecto"); }
  if(q.subtopic === undefined){ q.subtopic = null; changes.push("subtopic=null por defecto"); }
  if(changes.length){
    migrationLog.push({ originalId:q.id, canonicalId:q.id, changes, status:"MIGRATED" });
  }
});

// Auditoría de migración (informe §26 / §46): inventario completo,
// duplicados, huérfanos, conflictos y validación estructural por tipo.
function buildMigrationReport(){
  const idCounts = {};
  QUESTIONS.forEach(q=>{ idCounts[q.id]=(idCounts[q.id]||0)+1; });
  const duplicateIds = Object.entries(idCounts).filter(([,c])=>c>1).map(([id])=>id);

  const structuralIssues = [];
  QUESTIONS.forEach(q=>{
    if(q.tipo===EXERCISE_TYPES.OPTION_SINGLE){
      if(!q.opciones || q.opciones.length<2) structuralIssues.push({id:q.id, issue:"opciones insuficientes"});
      else if(!q.opciones.some(o=>o.letter===q.respuesta)) structuralIssues.push({id:q.id, issue:"respuesta no referencia una opción existente"});
    } else if(q.tipo===EXERCISE_TYPES.OPTION_MULTIPLE){
      if(!q.opciones || q.opciones.length<2) structuralIssues.push({id:q.id, issue:"opciones insuficientes"});
      else if(!Array.isArray(q.respuesta) || !q.respuesta.length) structuralIssues.push({id:q.id, issue:"conjunto de respuestas vacío"});
    } else if(q.tipo===EXERCISE_TYPES.TRUE_FALSE){
      if(typeof q.respuesta !== "boolean") structuralIssues.push({id:q.id, issue:"respuesta V/F no booleana"});
    } else if(q.tipo===EXERCISE_TYPES.MATCHING){
      if(!q.matching || !q.matching.left || !q.matching.left.length) structuralIssues.push({id:q.id, issue:"emparejamiento sin elementos"});
      else {
        const rightIds = new Set(q.matching.right.map(r=>r.id));
        Object.values(q.matching.correct||{}).forEach(rv=>{
          if(!rightIds.has(rv)) structuralIssues.push({id:q.id, issue:"referencia de emparejamiento huérfana: "+rv});
        });
      }
    } else {
      structuralIssues.push({id:q.id, issue:"tipo de ejercicio no reconocido: "+q.tipo});
    }
  });

  const missingExplanation = QUESTIONS.filter(q=>!q.explicacion).map(q=>q.id);

  return {
    bankId: "ope365-word365",
    bankVersion: "1.0.0",
    migrationVersion: "2026-08-29-normalizacion-1",
    totalRecords: QUESTIONS.length,
    byType: INTEGRITY_REPORT.byType,
    byCategoria: CATEGORY_REGISTRY.reduce((m,c)=>{ m[c.id]=QUESTIONS.filter(q=>q.categoria===c.id).length; return m; },{}),
    bySource: INTEGRITY_REPORT.bySource,
    distinctTopics: TOPIC_REGISTRY.length,
    duplicateIds,
    invalidRecords: INTEGRITY_REPORT.invalid,
    structuralIssues,
    missingExplanationCount: missingExplanation.length,
    missingExplanationIds: missingExplanation,
    contentHashCoverage: QUESTIONS.length ? Math.round(QUESTIONS.filter(q=>q.contentHash).length/QUESTIONS.length*100) : 0,
    generatedCount: QUESTIONS.filter(q=>q.generado).length,
    migrationLogEntries: migrationLog.length,
  };
}
const MIGRATION_REPORT = buildMigrationReport();

// Registro de taxonomía pedagógica (section > topic > subtopic), leído de
// taxonomy_data.js. Ordenado por 'order'; el dato crudo también se expone
// tal cual por si hace falta la forma original (notas, ids, etc.).
const TAXONOMY_SECTIONS = (TAXONOMY.sections || []).slice().sort((a,b)=>(a.order||0)-(b.order||0));

/* ---------------------------------------------------------------
   2. UTILIDADES
--------------------------------------------------------------- */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function escapeHtml(str){
  return String(str==null?"":str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function renderBlank(text){
  return escapeHtml(text).replace(/_{3,}/g, '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
}
function fmtTime(sec){
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec/60), s = sec%60;
  return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}
function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}) + " " +
         d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
}
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("show"), 2200);
}
function uid(){ return Math.random().toString(36).slice(2,10); }

/* Randomize a question's presentation (option order) without altering correctness */
function randomizeQuestionView(q){
  const clone = JSON.parse(JSON.stringify(q));
  if((clone.tipo === "opcion_unica" || clone.tipo === "seleccion_multiple") && clone.opciones && clone.opciones.length){
    const letters = clone.opciones.map(o=>o.letter);
    const texts = clone.opciones.map(o=>o.text);
    const shuffledTexts = shuffle(texts);
    // rebuild options with original letters but shuffled text, remap correct answer(s)
    const textToNewLetter = {};
    clone.opciones = letters.map((letter, idx)=>{
      const text = shuffledTexts[idx];
      textToNewLetter[text] = letter;
      return { letter, text };
    });
    // find where each original-correct text ended up
    if(clone.tipo === "opcion_unica"){
      const origCorrectText = texts[letters.indexOf(q.respuesta)];
      clone.respuesta = textToNewLetter[origCorrectText];
    } else {
      clone.respuesta = q.respuesta.map(letter=>{
        const origText = texts[letters.indexOf(letter)];
        return textToNewLetter[origText];
      });
    }
  }
  if(clone.tipo === "emparejamiento" && clone.matching){
    clone.matching.right = shuffle(clone.matching.right);
  }
  return clone;
}

/* ---------------------------------------------------------------
   3. FILTRADO DE PREGUNTAS
--------------------------------------------------------------- */
function getQuestionState(qid){
  const a = PROGRESS.answers[qid];
  if(!a) return "unanswered";
  return a.correcta ? "correct" : "incorrect";
}
function isMarked(qid){ return !!PROGRESS.marked[qid]; }

function filterQuestions(opts){
  opts = opts || {};
  return QUESTIONS.filter(q=>{
    if(opts.source && opts.source!=="all" && q.sourceFile!==opts.source) return false;
    if(opts.tema && opts.tema!=="all" && q.tema!==opts.tema) return false;
    if(opts.tipo && opts.tipo!=="all" && q.tipo!==opts.tipo) return false;
    if(opts.categoria && opts.categoria!=="all" && q.categoria!==opts.categoria) return false;
    if(opts.estado && opts.estado!=="all"){
      const st = getQuestionState(q.id);
      if(opts.estado==="marcadas"){ if(!isMarked(q.id)) return false; }
      else if(st!==opts.estado) return false;
    }
    if(opts.soloMarcadas && !isMarked(q.id)) return false;
    if(opts.soloErrores){
      const a = PROGRESS.answers[q.id];
      if(!a || a.correcta) return false;
    }
    if(opts.search){
      const s = opts.search.toLowerCase();
      const hay = (q.enunciado+" "+(q.tema||"")+" "+q.sourceFile+" "+(q.explicacion||"")).toLowerCase();
      if(!hay.includes(s)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------
   4. EVALUACIÓN DE RESPUESTAS
--------------------------------------------------------------- */
function evaluateAnswer(q, userAnswer){
  if(q.tipo === "opcion_unica"){
    return userAnswer === q.respuesta;
  }
  if(q.tipo === "verdadero_falso"){
    return userAnswer === q.respuesta;
  }
  if(q.tipo === "seleccion_multiple"){
    if(!Array.isArray(userAnswer)) return false;
    const a = userAnswer.slice().sort().join(",");
    const b = q.respuesta.slice().sort().join(",");
    return a === b;
  }
  if(q.tipo === "emparejamiento"){
    if(!userAnswer) return false;
    const correct = q.matching.correct;
    const keys = Object.keys(correct);
    return keys.every(k => userAnswer[k] === correct[k]);
  }
  return false;
}

function recordAnswer(q, userAnswer, correcta){
  const prev = PROGRESS.answers[q.id];
  PROGRESS.answers[q.id] = {
    tipo:q.tipo, correcta, seleccion:userAnswer,
    intentos: prev ? prev.intentos+1 : 1,
    ultimaVez: Date.now()
  };
  persist();
}

/* ---------------------------------------------------------------
   5. ESTADÍSTICAS
--------------------------------------------------------------- */
function computeStats(){
  const total = QUESTIONS.length;
  // orphan-safe: solo se cuentan respuestas cuyo id sigue existiendo en el banco canónico
  const answeredIds = Object.keys(PROGRESS.answers).filter(id=>Q_BY_ID[id]);
  const answered = answeredIds.length;
  const correct = answeredIds.filter(id=>PROGRESS.answers[id].correcta).length;
  const incorrect = answered - correct;
  const unanswered = total - answered;
  const markedCount = Object.keys(PROGRESS.marked).filter(id=>PROGRESS.marked[id] && Q_BY_ID[id]).length;
  const accuracy = answered ? Math.round((correct/answered)*100) : 0;

  // by tema
  const byTema = {};
  QUESTIONS.forEach(q=>{
    const t = q.tema || "General";
    byTema[t] = byTema[t] || {total:0, answered:0, correct:0};
    byTema[t].total++;
    const a = PROGRESS.answers[q.id];
    if(a){ byTema[t].answered++; if(a.correcta) byTema[t].correct++; }
  });
  const weakTopics = Object.entries(byTema)
    .filter(([,v])=>v.answered>=3)
    .map(([k,v])=>({tema:k, pct:Math.round((v.correct/v.answered)*100), answered:v.answered}))
    .sort((a,b)=>a.pct-b.pct)
    .slice(0,5);

  return { total, answered, correct, incorrect, unanswered, markedCount, accuracy, byTema, weakTopics };
}

/* ---------------------------------------------------------------
   6. TEMPORIZADOR
--------------------------------------------------------------- */
function Timer(totalSeconds, onTick, onEnd){
  let remaining = totalSeconds;
  let handle = null;
  this.start = function(){
    if(handle) return; // evita duplicados
    handle = setInterval(()=>{
      remaining--;
      onTick(remaining);
      if(remaining<=0){ this.stop(); onEnd(); }
    },1000);
  };
  this.stop = function(){ if(handle){ clearInterval(handle); handle=null; } };
  this.getRemaining = function(){ return remaining; };
  this.setRemaining = function(v){ remaining = v; };
}

/* ---------------------------------------------------------------
   7. ESTADO DE NAVEGACIÓN / SESIÓN
   Separación canónico ↔ sesión: la sesión NUNCA copia el contenido
   completo de la pregunta para persistirlo. Solo guarda:
     - questionIds[]           (referencia al banco canónico)
     - presentation{qid}       (permutación de orden, minúscula)
     - responses{}             (respuestas del usuario, en espacio canónico)
   La vista compuesta en memoria (`session.questions`) se reconstruye
   bajo demanda a partir del banco canónico + la permutación — nunca
   se serializa tal cual (ver saveSessionSnapshot / hydrateSession).
--------------------------------------------------------------- */
const Nav = { view:"home" };
let session = null; // sesión activa (practice o exam)
let activeTimer = null;

/* --- 7.1 PRNG determinista (mulberry32), versionado ---------------
   Nunca se usa Math.random para nada que deba reproducirse a partir
   de un código compartido. Toda la aleatoriedad "que importa" (orden
   de preguntas cuando el test es reproducible + orden de opciones)
   consume UN único flujo de números deterministas derivado de la
   semilla, en un orden estrictamente definido y estable. */
const RANDOMIZATION_ALGORITHM_VERSION = "mulberry32-v1";
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeSeed(){ return (Math.random()*4294967296) >>> 0; }
function seededShuffle(arr, rng){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Construye la permutación de presentación para una pregunta a partir
// de un generador determinista, sin mutar el contenido canónico.
function makePresentation(q, shuffleOptions, rng){
  const rand = rng || Math.random;
  if((q.tipo===EXERCISE_TYPES.OPTION_SINGLE || q.tipo===EXERCISE_TYPES.OPTION_MULTIPLE) && q.opciones && q.opciones.length){
    const idxs = q.opciones.map((_,i)=>i);
    return { optionPerm: shuffleOptions ? seededShuffle(idxs, rand) : idxs };
  }
  if(q.tipo===EXERCISE_TYPES.MATCHING && q.matching){
    const rightIds = q.matching.right.map(r=>r.id);
    return { rightOrder: shuffleOptions ? seededShuffle(rightIds, rand) : rightIds };
  }
  return {};
}

// Compone una vista de presentación a partir del contenido canónico
// (Q_BY_ID) + una permutación guardada. Determinista: mismos
// (qid, presentation) siempre producen la misma vista — esto es lo
// que hace posible reconstruir una sesión sin duplicar contenido.
function composeSessionQuestion(qid, pres){
  const q = Q_BY_ID[qid];
  if(!q) return null; // huérfano seguro: nunca revienta si el banco cambia
  const clone = JSON.parse(JSON.stringify(q));
  pres = pres || {};
  if((clone.tipo===EXERCISE_TYPES.OPTION_SINGLE || clone.tipo===EXERCISE_TYPES.OPTION_MULTIPLE) && clone.opciones && clone.opciones.length){
    const n = clone.opciones.length;
    const perm = (pres.optionPerm && pres.optionPerm.length===n) ? pres.optionPerm : clone.opciones.map((_,i)=>i);
    const canonicalTexts = clone.opciones.map(o=>o.text);
    const canonicalLetters = clone.opciones.map(o=>o.letter);
    clone.opciones = canonicalLetters.map((letter,i)=>({ letter, text: canonicalTexts[perm[i]] }));
    if(clone.tipo===EXERCISE_TYPES.OPTION_SINGLE){
      const correctIdx = canonicalLetters.indexOf(q.respuesta);
      const slot = perm.indexOf(correctIdx);
      clone.respuesta = canonicalLetters[slot];
    } else {
      clone.respuesta = q.respuesta.map(letter=>{
        const correctIdx = canonicalLetters.indexOf(letter);
        const slot = perm.indexOf(correctIdx);
        return canonicalLetters[slot];
      });
    }
  }
  if(clone.tipo===EXERCISE_TYPES.MATCHING && clone.matching){
    const rightById = {}; clone.matching.right.forEach(r=> rightById[r.id]=r);
    const order = (pres.rightOrder && pres.rightOrder.length===clone.matching.right.length) ? pres.rightOrder : clone.matching.right.map(r=>r.id);
    clone.matching.right = order.map(id=>rightById[id]).filter(Boolean);
  }
  return clone;
}

/* --- 7.2 Selección de preguntas (config → questionIds[]) ----------
   Si se pasa `rng`, la rama "aleatorio" consume ese flujo determinista
   en vez de Math.random — así una selección basada en config+seed
   (sin lista explícita de ids) es reproducible en cualquier copia de
   la aplicación con el mismo banco. Los ámbitos personales (errores/
   marcadas/no_respondidas) dependen del progreso local del creador y
   nunca se reconstruyen así — ver shareableFromSession. */
function resolveQuestionIds(config, rng){
  let pool = filterQuestions({
    source: config.source, tema: config.tema, tipo: config.tipo, categoria: config.categoria
  });
  if(config.scope === "errores"){
    pool = pool.filter(q=>{ const a=PROGRESS.answers[q.id]; return a && !a.correcta; });
  } else if(config.scope === "marcadas"){
    pool = pool.filter(q=> isMarked(q.id));
  } else if(config.scope === "no_respondidas"){
    pool = pool.filter(q=> !PROGRESS.answers[q.id]);
  }
  if(pool.length === 0) return [];

  if(config.qOrder === "aleatorio"){
    pool = rng ? seededShuffle(pool, rng) : shuffle(pool);
  } else if(config.qOrder === "dificultad"){
    const order = {opcion_unica:0, verdadero_falso:1, seleccion_multiple:2, emparejamiento:3};
    pool = pool.slice().sort((a,b)=>(order[a.tipo]||9)-(order[b.tipo]||9));
  } else if(config.qOrder === "tematico"){
    pool = pool.slice().sort((a,b)=> (a.tema||"").localeCompare(b.tema||""));
  } // 'fuente' = orden original

  let n = config.count;
  if(!n || n === "todas" || Number(n) > pool.length) n = pool.length;
  pool = pool.slice(0, Number(n));
  return pool.map(q=>q.id);
}

// Construye la sesión completa a partir de una lista YA resuelta de
// ids + una semilla. Es la única función que genera `presentation`.
function buildSessionFromIds(questionIds, config, seed, rng){
  if(!questionIds || !questionIds.length) return null;
  const usedSeed = (seed!=null) ? (seed>>>0) : makeSeed();
  const usedRng = rng || mulberry32(usedSeed);
  const presentation = {};
  questionIds.forEach(qid=>{ presentation[qid] = makePresentation(Q_BY_ID[qid], !!config.shuffleOptions, usedRng); });
  const questions = questionIds.map(qid=> composeSessionQuestion(qid, presentation[qid]));
  return {
    id: uid(),
    mode: config.mode, // 'practice' | 'exam'
    createdAt: Date.now(),
    config,
    seed: usedSeed, randomizationAlgorithmVersion: RANDOMIZATION_ALGORITHM_VERSION, bankVersion: MIGRATION_REPORT.bankVersion,
    questionIds, presentation,
    questions, // vista compuesta en memoria (derivada; no se persiste tal cual)
    current: 0,
    responses: {}, // index -> {answer, correct, submitted}  — answer en espacio canónico (letra fija)
    markedThisSession: {},
    timeLimitSec: config.mode==="exam" ? (Number(config.minutes)||0)*60 : null,
    remainingSec: config.mode==="exam" ? (Number(config.minutes)||0)*60 : null,
    finished:false
  };
}

function buildSession(config){
  const seed = makeSeed();
  const rng = mulberry32(seed);
  const ids = resolveQuestionIds(config, rng);
  if(!ids.length) return null;
  return buildSessionFromIds(ids, config, seed, rng);
}

// Reconstrucción determinista de un test a partir de config+semilla
// (sin lista explícita de ids) — usada al importar un código de test
// compartido cuando el creador no partió de un ámbito personal.
function buildSessionFromShareableConfig(config, seed){
  const rng = mulberry32(seed>>>0);
  const ids = resolveQuestionIds(config, rng);
  if(!ids.length) return null;
  return buildSessionFromIds(ids, config, seed, rng);
}

// Reconstruye una sesión completa (con `.questions` compuesto) a
// partir de la forma compacta persistida. Huérfano-seguro: si algún
// questionId ya no existiera en el banco canónico, se descarta sin
// romper la reanudación del resto de la sesión.
function hydrateSession(slim){
  if(!slim) return null;
  const questionIds = (slim.questionIds||[]).filter(qid=>Q_BY_ID[qid]);
  const presentation = slim.presentation||{};
  const questions = questionIds.map(qid=> composeSessionQuestion(qid, presentation[qid]));
  return Object.assign({}, slim, { questionIds, questions });
}

// Forma compacta para persistir: nunca incluye la vista compuesta
// `.questions` (contenido duplicado) — solo referencias canónicas.
function slimSession(s){
  if(!s) return null;
  const slim = {};
  Object.keys(s).forEach(k=>{ if(k!=="questions") slim[k]=s[k]; });
  return slim;
}

function saveSessionSnapshot(){
  if(!session){ PROGRESS.currentSession = null; persist(); return; }
  PROGRESS.currentSession = session.finished ? null : slimSession(session);
  persist();
}

// Resultado consolidado de una sesión terminada (para compartir /
// comparar / historial) — nunca contiene contenido de pregunta,
// solo métricas + respuestas en espacio canónico.
function summarizeSession(s){
  let correct=0, incorrect=0;
  const answers = {};
  s.questions.forEach((q,i)=>{
    const r = s.responses[i];
    if(r){ answers[q.id] = { answer:r.answer, correct:r.correct }; if(r.correct) correct++; else incorrect++; }
  });
  const answered = correct+incorrect;
  const total = s.questions.length;
  return {
    total, answered, correct, incorrect, unanswered: total-answered,
    accuracy: answered ? Math.round((correct/answered)*100) : 0,
    answers, completionTime: s.timeLimitSec ? (s.timeLimitSec-(s.remainingSec||0)) : null,
    completedAt: Date.now()
  };
}

/* ---------------------------------------------------------------
   8. CÓDIGOS DE COMPARTIR (Q- / S- / T- / R-)
   Codifican {versión, versión de banco, definición de test o ids,
   semilla, versión del algoritmo} en texto compacto. El código ES
   el transporte — nunca se expone al usuario ningún término técnico.
--------------------------------------------------------------- */
const SHARE_VERSION = 1;

function b64urlEncode(str){
  const bytes = new TextEncoder().encode(str);
  let bin = ""; bytes.forEach(b=> bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function b64urlDecode(b64){
  let s = b64.replace(/-/g,"+").replace(/_/g,"/");
  while(s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function chunkCode(s, size){
  const parts = [];
  for(let i=0;i<s.length;i+=size) parts.push(s.slice(i,i+size));
  return parts.join("-");
}
function makeShareCode(type, payload){
  const body = b64urlEncode(JSON.stringify(payload));
  return `${type}-${chunkCode(body, 6)}`;
}
// Analiza un código pegado por el usuario. Nunca lanza — cualquier
// fallo de formato o de parseo se traduce en `null` (código no válido).
function parseShareCode(raw){
  const cleaned = String(raw||"").trim().replace(/\s+/g,"");
  const m = cleaned.match(/^([QSTRqstr])-(.+)$/);
  if(!m) return null;
  const type = m[1].toUpperCase();
  const body = m[2].replace(/-/g,"");
  try{
    const payload = JSON.parse(b64urlDecode(body));
    if(!payload || payload.v !== SHARE_VERSION) return null;
    return { type, payload };
  }catch(e){ return null; }
}

// Ofuscación reversible ligera (NO es cifrado seguro). Se documenta
// así deliberadamente: en una app estática sin servidor, cualquier
// persona con conocimientos técnicos podría derivar la misma clave
// que usa el propio código para des-ofuscar, porque todo el material
// necesario viaja en el mismo código. Esto NO protege contra un
// destinatario decidido a hacer trampa — solo evita que el resultado
// se vea en texto claro al pegar el código en un editor cualquiera.
function obfuscate(obj, keyStr){
  const json = JSON.stringify(obj);
  let out = "";
  for(let i=0;i<json.length;i++){
    out += String.fromCharCode(json.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length));
  }
  return b64urlEncode(out);
}
function deobfuscate(b64, keyStr){
  const scrambled = b64urlDecode(b64);
  let out = "";
  for(let i=0;i<scrambled.length;i++){
    out += String.fromCharCode(scrambled.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length));
  }
  return JSON.parse(out);
}

// Construye el código para "Compartir test" (§29) o la base de un
// desafío (§31). Si el test se generó desde un ámbito personal
// (errores/marcadas/no_respondidas) no es reproducible por config en
// otro dispositivo, así que se congela la lista de ids explícita;
// en cualquier otro caso basta con config+semilla (código más compacto).
function shareCodeForSession(s){
  const personalScope = s.config && (s.config.scope==="errores" || s.config.scope==="marcadas" || s.config.scope==="no_respondidas");
  const cfg = { source:s.config.source, tema:s.config.tema, tipo:s.config.tipo, categoria:s.config.categoria,
                qOrder:s.config.qOrder, count:s.questionIds.length, shuffleOptions:s.config.shuffleOptions,
                minutes:s.config.minutes, mode:s.config.mode };
  const payload = { v:SHARE_VERSION, bv:s.bankVersion, alg:s.randomizationAlgorithmVersion, seed:s.seed, cfg };
  if(personalScope) payload.ids = s.questionIds;
  return makeShareCode("T", payload);
}

function shareCodeForQuestion(qid){
  return makeShareCode("Q", { v:SHARE_VERSION, bv:MIGRATION_REPORT.bankVersion, qid });
}
function shareCodeForSelection(qids){
  return makeShareCode("S", { v:SHARE_VERSION, bv:MIGRATION_REPORT.bankVersion, ids:qids });
}

// A partir de un payload T (con o sin ids explícitos) reconstruye la
// MISMA sesión determinista. huboIds indica si se usó lista congelada.
function sessionFromTestPayload(payload){
  if(payload.bv !== MIGRATION_REPORT.bankVersion) return { error:"bank_version" };
  const cfg = Object.assign({}, payload.cfg);
  let s;
  if(payload.ids && payload.ids.length){
    const validIds = payload.ids.filter(id=>Q_BY_ID[id]);
    if(!validIds.length) return { error:"no_questions" };
    s = buildSessionFromIds(validIds, cfg, payload.seed);
  } else {
    s = buildSessionFromShareableConfig(cfg, payload.seed);
  }
  if(!s) return { error:"no_questions" };
  return { session:s };
}

/* ---------------------------------------------------------------
   9. DESAFÍOS (dos personas, mismo test, resultado sellado opcional)
   Almacenamiento 100% local: cada participante guarda su copia del
   reto en su propio PROGRESS.challenges. No existe servidor — el
   código es el único canal entre ambas personas.
--------------------------------------------------------------- */
function challengeId(){ return "c" + uid() + uid(); }

function createChallenge(session_, sealWithResult){
  const cid = challengeId();
  const baseCode = shareCodeForSession(session_);
  const parsed = parseShareCode(baseCode).payload;
  let code = baseCode;
  let sealed = null;
  if(sealWithResult){
    const key = cid + ":" + session_.seed;
    sealed = obfuscate(sealWithResult, key);
    const rPayload = Object.assign({}, parsed, { challengeId:cid, sealed });
    code = makeShareCode("R", rPayload);
  } else {
    const tPayload = Object.assign({}, parsed, { challengeId:cid });
    code = makeShareCode("T", tPayload);
  }
  const record = {
    challengeId:cid, role:"creator", code,
    bankVersion:parsed.bv, seed:parsed.seed, alg:parsed.alg, cfg:parsed.cfg, ids:parsed.ids||session_.questionIds,
    status: sealWithResult ? "WAITING" : "CREATED",
    myResult: sealWithResult || null,
    creatorResult: sealWithResult || null,
    recipientResult: null,
    createdAt: Date.now(), completedAt: sealWithResult ? Date.now() : null
  };
  PROGRESS.challenges[cid] = record;
  persist();
  return { code, record };
}

// Importa un código T o R como desafío entrante (destinatario).
function importChallengeCode(raw){
  const parsed = parseShareCode(raw);
  if(!parsed) return { error:"codigo_invalido" };
  if(parsed.type!=="T" && parsed.type!=="R") return { error:"tipo_no_soportado" };
  const payload = parsed.payload;
  if(payload.bv !== MIGRATION_REPORT.bankVersion) return { error:"bank_version" };
  const cid = payload.challengeId || challengeId();
  if(PROGRESS.challenges[cid]) return { error:"ya_importado", challengeId:cid };
  const rec = {
    challengeId:cid, role:"recipient", code:raw,
    bankVersion:payload.bv, seed:payload.seed, alg:payload.alg, cfg:payload.cfg, ids:payload.ids||null,
    status: parsed.type==="R" ? "WAITING" : "CREATED",
    myResult:null,
    creatorResult: null,
    sealedResult: parsed.type==="R" ? payload.sealed : null,
    createdAt: Date.now(), completedAt:null
  };
  PROGRESS.challenges[cid] = rec;
  persist();
  return { challengeId:cid, record:rec };
}

function sessionForChallenge(cid){
  const rec = PROGRESS.challenges[cid];
  if(!rec) return { error:"no_encontrado" };
  if(rec.bankVersion !== MIGRATION_REPORT.bankVersion) return { error:"bank_version" };
  let s;
  if(rec.ids && rec.ids.length){
    const validIds = rec.ids.filter(id=>Q_BY_ID[id]);
    if(!validIds.length) return { error:"no_questions" };
    s = buildSessionFromIds(validIds, rec.cfg, rec.seed);
  } else {
    s = buildSessionFromShareableConfig(rec.cfg, rec.seed);
  }
  if(!s) return { error:"no_questions" };
  s.challengeId = cid;
  return { session:s };
}

function completeChallengeAttempt(cid, summary){
  const rec = PROGRESS.challenges[cid];
  if(!rec) return;
  rec.myResult = summary;
  rec.completedAt = Date.now();
  if(rec.role==="creator"){
    rec.creatorResult = summary;
    rec.status = rec.recipientResult ? "UNLOCKED" : "COMPLETED";
  } else {
    rec.status = rec.sealedResult ? "UNLOCKED" : "COMPLETED";
    if(rec.sealedResult){
      try{
        const key = cid + ":" + rec.seed;
        rec.creatorResult = deobfuscate(rec.sealedResult, key);
      }catch(e){ rec.creatorResult = null; }
    }
  }
  persist();
}

// Código que el destinatario envía DE VUELTA al creador con su propio
// resultado (ya no es secreto — es su resultado, lo comparte a propósito).
function shareCodeForReturnResult(cid, result){
  return makeShareCode("R", { v:SHARE_VERSION, bv:MIGRATION_REPORT.bankVersion, challengeId:cid, returnResult:true, result });
}
function importReturnedResult(payload){
  const rec = PROGRESS.challenges[payload.challengeId];
  if(!rec || rec.role!=="creator") return { error:"no_encontrado" };
  rec.recipientResult = payload.result;
  rec.status = rec.creatorResult ? "UNLOCKED" : "COMPLETED";
  persist();
  return { challengeId: payload.challengeId };
}

function compareResults(a, b){
  const ids = new Set([...Object.keys(a.answers||{}), ...Object.keys(b.answers||{})]);
  const diffs = []; let bothCorrect=0, bothWrong=0, onlyA=0, onlyB=0, same=0;
  ids.forEach(qid=>{
    const ra = a.answers[qid], rb = b.answers[qid];
    if(ra && rb){
      const eq = JSON.stringify(ra.answer)===JSON.stringify(rb.answer);
      if(eq) same++; else diffs.push({ qid, a:ra, b:rb });
      if(ra.correct && rb.correct) bothCorrect++;
      else if(!ra.correct && !rb.correct) bothWrong++;
      else if(ra.correct) onlyA++;
      else onlyB++;
    }
  });
  return { diffs, bothCorrect, bothWrong, onlyA, onlyB, same, totalCompared: ids.size };
}

/* ---------------------------------------------------------------
   EXPOSE
--------------------------------------------------------------- */
window.OPE = {
  STORE, storageIsLocal, PROGRESS, persist,
  QUESTIONS, Q_BY_ID, ALL_SOURCES, ALL_TEMAS, ALL_TYPES, ALL_CATEGORIAS, INTEGRITY_REPORT,
  EXERCISE_TYPES, TYPE_LABELS, CATEGORY_REGISTRY, CATEGORY_LABELS, TOPIC_REGISTRY, SOURCE_REGISTRY,
  TAXONOMY, TAXONOMY_SECTIONS,
  contentHash, MIGRATION_REPORT, RANDOMIZATION_ALGORITHM_VERSION,
  shuffle, seededShuffle, mulberry32, makeSeed, escapeHtml, renderBlank, fmtTime, fmtDate, toast, uid,
  randomizeQuestionView, filterQuestions, getQuestionState, isMarked,
  evaluateAnswer, recordAnswer, computeStats, Timer,
  Nav, buildSession, buildSessionFromIds, buildSessionFromShareableConfig, resolveQuestionIds,
  saveSessionSnapshot, hydrateSession, summarizeSession,
  getSession:()=>session, setSession:(s)=>{ session=s; },
  getActiveTimer:()=>activeTimer, setActiveTimer:(t)=>{ activeTimer=t; },
  makeShareCode, parseShareCode, shareCodeForSession, shareCodeForQuestion, shareCodeForSelection,
  sessionFromTestPayload, createChallenge, importChallengeCode, sessionForChallenge,
  completeChallengeAttempt, compareResults, shareCodeForReturnResult, importReturnedResult,
};

})();
