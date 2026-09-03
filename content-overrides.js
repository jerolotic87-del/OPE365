/* ============================================================
   OPE365 · Correcciones de contenido en la propia app
   ------------------------------------------------------------
   window.OPE.ContentEdit

   Permite corregir sobre la marcha una pregunta o una flashcard
   (texto del enunciado, opciones, respuesta correcta, explicación,
   frente/dorso…) SIN tocar el código ni los JSON de data/.

   Las correcciones se guardan en PROGRESS.contentOverrides y se
   aplican EN SITIO a los objetos canónicos (OPE.Q_BY_ID / OPE.F_BY_ID)
   en cada carga, ANTES de que engine.js construya sus conceptos —
   así todo (runner, repaso, motor, evaluación) ve el texto corregido.

   Se carga entre app.js y engine.js.

   Para volcar las correcciones al banco de verdad: Ajustes →
   "Correcciones de contenido" → Exportar (copia un JSON que se
   pega en data/ o se pasa a quien mantenga el banco).
============================================================ */
(function(){
"use strict";
const O = window.OPE;
if(!O){ console.warn("content-overrides.js: OPE no disponible"); return; }

/* campos editables por seguridad — nada estructural (tipo, matching, huecos) */
const Q_FIELDS  = ["enunciado","explicacion","negativa","respuesta","opciones","imagen"];
const FC_FIELDS = ["front","back","priority","imagen"];

/* originales de los campos tocados (solo memoria; se reconstruye en cada carga) */
const _orig = { q:{}, fc:{} };

function deep(v){ return (v && typeof v === "object") ? JSON.parse(JSON.stringify(v)) : v; }

function store(){
  if(!O.PROGRESS.contentOverrides) O.PROGRESS.contentOverrides = { q:{}, fc:{} };
  const c = O.PROGRESS.contentOverrides;
  if(!c.q) c.q = {};
  if(!c.fc) c.fc = {};
  return c;
}
function bagFor(kind){ const c = store(); return kind === "fc" ? c.fc : c.q; }
function objFor(kind, id){ return kind === "fc" ? O.F_BY_ID[id] : O.Q_BY_ID[id]; }
function fieldsFor(kind){ return kind === "fc" ? FC_FIELDS : Q_FIELDS; }

/* guarda el valor original de cada campo del patch que aún no tengamos */
function snapshotOriginals(kind, id, patch){
  const obj = objFor(kind, id);
  if(!obj) return;
  const dst = (_orig[kind][id] = _orig[kind][id] || {});
  Object.keys(patch).forEach(f=>{
    if(f === "ts" || f === "nota") return;
    if(!(f in dst)) dst[f] = deep(obj[f]);
  });
}

/* aplica un patch a un objeto canónico, en sitio */
function patchObject(obj, patch, allowed){
  if(!obj || !patch) return;
  Object.keys(patch).forEach(f=>{
    if(f === "ts" || f === "nota") return;
    if(allowed && allowed.indexOf(f) === -1) return;
    if(f === "opciones" && Array.isArray(patch.opciones) && Array.isArray(obj.opciones)){
      patch.opciones.forEach(po=>{
        const to = obj.opciones.find(o=> o.letter === po.letter);
        if(to && typeof po.text === "string") to.text = po.text;
      });
      return;
    }
    obj[f] = deep(patch[f]);
  });
}

/* aplica TODAS las correcciones guardadas — llamar una vez, al cargar */
function applyAll(){
  const c = store();
  ["q","fc"].forEach(kind=>{
    const bag = kind === "fc" ? c.fc : c.q;
    Object.keys(bag).forEach(id=>{
      const obj = objFor(kind, id);
      if(!obj){ return; }              // huérfano seguro: el id ya no existe
      snapshotOriginals(kind, id, bag[id]);
      patchObject(obj, bag[id], fieldsFor(kind));
    });
  });
}

/* --- API pública ------------------------------------------------ */

// guarda/actualiza una corrección y la aplica en vivo
function apply(kind, id, patch){
  if(kind !== "fc") kind = "q";
  const obj = objFor(kind, id);
  if(!obj) return false;
  snapshotOriginals(kind, id, patch);
  const bag = bagFor(kind);
  bag[id] = Object.assign({}, bag[id] || {}, patch, { ts: Date.now() });
  patchObject(obj, bag[id], fieldsFor(kind));
  O.persist();
  return true;
}

// deshace la corrección: restaura los campos originales y borra el registro
function revert(kind, id){
  if(kind !== "fc") kind = "q";
  const obj = objFor(kind, id);
  const orig = _orig[kind][id];
  if(obj && orig){
    Object.keys(orig).forEach(f=>{ obj[f] = deep(orig[f]); });
  }
  delete bagFor(kind)[id];
  delete _orig[kind][id];
  O.persist();
}

function get(kind, id){ return bagFor(kind === "fc" ? "fc" : "q")[id] || null; }
function has(kind, id){ return !!get(kind, id); }

// "hornea" la corrección: la da por incorporada al banco de origen (la usa
// github-sync.js tras un commit) — borra el registro de override y el
// snapshot original SIN restaurar el objeto, así que los valores corregidos
// se quedan y deja de aparecer el badge "corregida".
function bake(kind, id){
  if(kind !== "fc") kind = "q";
  delete bagFor(kind)[id];
  delete _orig[kind][id];
  O.persist();
}

function count(){
  const c = store();
  return Object.keys(c.q).length + Object.keys(c.fc).length;
}

// lista para la pantalla de Ajustes
function list(){
  const c = store();
  const out = [];
  Object.keys(c.q).forEach(id=>{
    const q = O.Q_BY_ID[id];
    out.push({ kind:"q", id, ts:c.q[id].ts || 0,
      label: q ? (q.enunciado||"").slice(0,70) : "(pregunta no encontrada)",
      fields: Object.keys(c.q[id]).filter(k=> k!=="ts" && k!=="nota"),
      note: c.q[id].nota || "" });
  });
  Object.keys(c.fc).forEach(id=>{
    const f = O.F_BY_ID[id];
    out.push({ kind:"fc", id, ts:c.fc[id].ts || 0,
      label: f ? (f.front||"").slice(0,70) : "(flashcard no encontrada)",
      fields: Object.keys(c.fc[id]).filter(k=> k!=="ts" && k!=="nota"),
      note: c.fc[id].nota || "" });
  });
  return out.sort((a,b)=> b.ts - a.ts);
}

// JSON exportable para volcar al banco
function exportJSON(){
  const c = store();
  const u = ustore();
  return JSON.stringify({
    _comentario: "OPE365 · contenido editado y creado en la app. " +
                 "'correcciones' = patch por id (solo campos cambiados) sobre el banco. " +
                 "'creadas' = preguntas/flashcards nuevas (van a data/questions|flashcards/*.json). " +
                 "La imagen es un data URI incrustado.",
    exportadoEl: new Date().toISOString(),
    correcciones: { preguntas: c.q, flashcards: c.fc },
    creadas: { preguntas: u.q, flashcards: u.fc },
  }, null, 2);
}

function clearAll(){
  ["q","fc"].forEach(kind=> Object.keys(bagFor(kind)).forEach(id=> revert(kind, id)));
}

/* originales pristinos de un objeto (para el formulario de edición) */
function original(kind, id){
  kind = kind === "fc" ? "fc" : "q";
  const orig = _orig[kind][id];
  const obj = objFor(kind, id);
  if(!obj) return null;
  const base = {};
  fieldsFor(kind).concat(["nota","imagen"]).forEach(f=>{
    base[f] = (orig && f in orig) ? deep(orig[f]) : deep(obj[f]);
  });
  return base;
}

/* ============================================================
   CONTENIDO PROPIO — preguntas y flashcards creadas por el usuario
   (p. ej. "¿a qué comando corresponde esta imagen?"). Viven en
   PROGRESS.userContent y se FUSIONAN con el banco canónico
   (OPE.QUESTIONS / OPE.FLASHCARDS) antes de engine.js, así que el
   motor las trata como cualquier otra pregunta de su section:topic.
   La imagen se guarda como data URI en el propio objeto.
============================================================ */
function ustore(){
  if(!O.PROGRESS.userContent) O.PROGRESS.userContent = { q:[], fc:[] };
  const u = O.PROGRESS.userContent;
  if(!Array.isArray(u.q))  u.q  = [];
  if(!Array.isArray(u.fc)) u.fc = [];
  return u;
}
const _mergedIds = { q:{}, fc:{} };

function mergeQuestion(q){
  if(!q || !q.id || _mergedIds.q[q.id]) return;
  if(!O.Q_BY_ID[q.id]){ O.QUESTIONS.push(q); O.Q_BY_ID[q.id] = q; }
  _mergedIds.q[q.id] = true;
}
function mergeFlashcard(c){
  if(!c || !c.cardId || !c.section) return;
  c.canonicalId = c.canonicalId || (c.section + ":" + c.cardId);
  if(_mergedIds.fc[c.canonicalId]) return;
  if(!O.F_BY_ID[c.canonicalId]){ O.FLASHCARDS.push(c); O.F_BY_ID[c.canonicalId] = c; }
  _mergedIds.fc[c.canonicalId] = true;
}
function mergeUserContent(){
  const u = ustore();
  u.q.forEach(mergeQuestion);
  u.fc.forEach(mergeFlashcard);
}

/* engancha una pregunta recién creada al grafo de conceptos del motor
   (solo hace falta para las creadas EN CALIENTE; al recargar ya entran
   por CONCEPTS) */
function registerWithEngine(q){
  const LE = O.LE;
  if(!LE || !q || !q.section || !q.topic) return;
  const cid = q.section + ":" + q.topic;
  const meta = LE.CONCEPT_BY_ID[cid];
  if(!meta) return;
  if(meta.questionIds.indexOf(q.id) === -1){ meta.questionIds.push(q.id); meta.size = meta.questionIds.length; }
  LE.CONCEPT_OF_Q[q.id] = cid;
  const fr = LE.framingOf(q);
  if(meta.framings.indexOf(fr) === -1) meta.framings.push(fr);
}
function registerCardWithEngine(c){
  const LE = O.LE;
  if(!LE || !c || !c.section || !c.topic) return;
  const cid = c.section + ":" + c.topic;
  const meta = LE.CONCEPT_BY_ID[cid];
  if(!meta) return;
  if(meta.flashcardIds.indexOf(c.canonicalId) === -1) meta.flashcardIds.push(c.canonicalId);
  LE.CONCEPT_OF_CARD[c.canonicalId] = cid;
}

function uid(prefix){
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
}

/* crea una pregunta propia. data: {tipo, enunciado, opciones:[{letter,text}],
   respuesta, explicacion, categoria, section, topic, imagen} */
function createQuestion(data){
  const TIPOS = ["opcion_unica","verdadero_falso","seleccion_multiple"];
  const q = {
    id: uid("usr-q"),
    sourceFile: "usuario", bloque: "Creada por ti", sourceQuestionId: null,
    tipo: TIPOS.indexOf(data.tipo) >= 0 ? data.tipo : "opcion_unica",
    categoria: data.categoria || "general",
    negativa: !!data.negativa,
    section: data.section, topic: data.topic, subtopic: null,
    tema: data.tema || null,
    enunciado: String(data.enunciado || "").trim(),
    matching: null,
    explicacion: String(data.explicacion || "").trim(),
    creado: true,
  };
  if(data.imagen) q.imagen = data.imagen;
  if(q.tipo === "verdadero_falso"){
    q.opciones = [];
    q.respuesta = data.respuesta === true || data.respuesta === "true";
  } else {
    q.opciones = (data.opciones || []).map((o,i)=>({ letter:o.letter || "ABCDEF"[i], text:String(o.text||"").trim() }))
      .filter(o=>o.text);
    q.respuesta = q.tipo === "seleccion_multiple"
      ? (Array.isArray(data.respuesta) ? data.respuesta.slice().sort() : [])
      : data.respuesta;
  }
  ustore().q.push(q);
  mergeQuestion(q);
  registerWithEngine(q);
  O.persist();
  return q.id;
}

/* crea una flashcard propia. data: {front, back, priority, cardType,
   section, topic, imagen} */
function createFlashcard(data){
  const section = data.section;
  const c = {
    cardId: uid("U").replace(/-/g,"").toUpperCase().slice(0,10),
    section, topic: data.topic || null, subtopic: null,
    cardType: data.cardType === "error" ? "error" : "contenido",
    priority: data.priority === "alta" ? "alta" : "normal",
    front: String(data.front || "").trim(),
    back: String(data.back || "").trim(),
    sourceRefs: [], knowledgeRefs: [], questionRefs: [],
    creado: true,
  };
  if(data.imagen) c.imagen = data.imagen;
  c.canonicalId = section + ":" + c.cardId;
  ustore().fc.push(c);
  mergeFlashcard(c);
  registerCardWithEngine(c);
  O.persist();
  return c.canonicalId;
}

function updateUserItem(kind, id, patch){
  const u = ustore();
  const arr = kind === "fc" ? u.fc : u.q;
  const idx = kind === "fc" ? arr.findIndex(x=>x.canonicalId === id) : arr.findIndex(x=>x.id === id);
  if(idx < 0) return false;
  const item = arr[idx];
  Object.keys(patch).forEach(k=>{ if(k === "id" || k === "canonicalId" || k === "cardId") return; item[k] = patch[k]; });
  // reflejar en el objeto canónico fusionado (misma ref, pero por si acaso)
  const canon = kind === "fc" ? O.F_BY_ID[id] : O.Q_BY_ID[id];
  if(canon && canon !== item) Object.assign(canon, item);
  O.persist();
  return true;
}

// Quita un item de las estructuras EN VIVO (banco canónico, índices, grafo de
// conceptos del motor, progreso y override asociados) para que la app deje de
// mostrarlo sin recargar. No toca ustore() ni el repo. Lo usan tanto el
// borrado de contenido propio como el borrado del banco vía GitHub (GHS).
function purgeFromRuntime(kind, id){
  if(kind === "fc"){
    const i = O.FLASHCARDS.findIndex(x=>x.canonicalId === id);
    if(i >= 0) O.FLASHCARDS.splice(i,1);
    delete O.F_BY_ID[id];
    delete _mergedIds.fc[id];
    if(O.LE){ delete O.LE.CONCEPT_OF_CARD[id];
      Object.values(O.LE.CONCEPT_BY_ID).forEach(m=>{ const k=m.flashcardIds.indexOf(id); if(k>=0) m.flashcardIds.splice(k,1); }); }
  } else {
    const i = O.QUESTIONS.findIndex(x=>x.id === id);
    if(i >= 0) O.QUESTIONS.splice(i,1);
    delete O.Q_BY_ID[id];
    delete _mergedIds.q[id];
    if(O.LE){ delete O.LE.CONCEPT_OF_Q[id];
      Object.values(O.LE.CONCEPT_BY_ID).forEach(m=>{ const k=m.questionIds.indexOf(id); if(k>=0){ m.questionIds.splice(k,1); m.size=m.questionIds.length; } }); }
  }
  if(O.PROGRESS.answers) delete O.PROGRESS.answers[id];
  if(O.PROGRESS.marked) delete O.PROGRESS.marked[id];
  if(O.PROGRESS.flashcards) delete O.PROGRESS.flashcards[id];
  const bq = bagFor("q"), bf = bagFor("fc");
  if(bq && bq[id]) delete bq[id];
  if(bf && bf[id]) delete bf[id];
}

function deleteUserItem(kind, id){
  const u = ustore();
  if(kind === "fc") u.fc = u.fc.filter(x=>x.canonicalId !== id);
  else u.q = u.q.filter(x=>x.id !== id);
  purgeFromRuntime(kind, id);
  O.persist();
}

function isUser(kind, id){
  const u = ustore();
  return kind === "fc" ? u.fc.some(x=>x.canonicalId === id) : u.q.some(x=>x.id === id);
}
function listUser(){
  const u = ustore();
  return [].concat(
    u.q.map(q=>({ kind:"q", id:q.id, label:(q.enunciado||"(sin enunciado)").slice(0,70), tipo:q.tipo, hasImg:!!q.imagen, section:q.section, topic:q.topic, published:q.published || null })),
    u.fc.map(c=>({ kind:"fc", id:c.canonicalId, label:(c.front||"(sin frente)").slice(0,70), tipo:"flashcard", hasImg:!!c.imagen, section:c.section, topic:c.topic, published:c.published || null }))
  );
}
function userCount(){ const u = ustore(); return u.q.length + u.fc.length; }

/* copia profunda de tu contenido, para publicarlo al repo */
function userItems(){
  const u = ustore();
  return { q: deep(u.q) || [], fc: deep(u.fc) || [] };
}

/* marca un elemento propio como ya publicado en el repo (github-sync.js) */
function markPublished(kind, id, info){
  const u = ustore();
  const arr = kind === "fc" ? u.fc : u.q;
  const item = kind === "fc" ? arr.find(x=>x.canonicalId === id) : arr.find(x=>x.id === id);
  if(!item) return false;
  item.published = Object.assign({ sha:null, at:Date.now(), newId:null }, info || {});
  O.persist();
  return true;
}

O.ContentEdit = { applyAll, apply, revert, bake, get, has, count, list, exportJSON, clearAll, original,
                  Q_FIELDS, FC_FIELDS,
                  createQuestion, createFlashcard, updateUserItem, deleteUserItem,
                  purgeFromRuntime,
                  isUser, listUser, userCount, userItems, markPublished };

// al cargar (antes que engine.js): fusionar contenido propio y aplicar correcciones
mergeUserContent();
applyAll();

})();
