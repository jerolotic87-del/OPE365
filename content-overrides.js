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
const Q_FIELDS  = ["enunciado","explicacion","negativa","respuesta","opciones"];
const FC_FIELDS = ["front","back","priority"];

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
  return JSON.stringify({
    _comentario: "OPE365 · correcciones de contenido hechas en la app. " +
                 "Cada entrada es un patch por id: solo los campos cambiados. " +
                 "Aplicar sobre data/questions/*.json y data/flashcards/*.json.",
    exportadoEl: new Date().toISOString(),
    preguntas: c.q,
    flashcards: c.fc,
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
  fieldsFor(kind).concat(["nota"]).forEach(f=>{
    base[f] = (orig && f in orig) ? deep(orig[f]) : deep(obj[f]);
  });
  return base;
}

O.ContentEdit = { applyAll, apply, revert, get, has, count, list, exportJSON, clearAll, original,
                  Q_FIELDS, FC_FIELDS };

// aplicar de inmediato al cargar (antes que engine.js)
applyAll();

})();
