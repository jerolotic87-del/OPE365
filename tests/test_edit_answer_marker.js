/* ============================================================
   OPE365 · Editor del banco — marcador de respuesta correcta
   Regresión del bug reportado: al reescribir las opciones de una
   pregunta, el selector de "Respuesta correcta" se quedaba fijo en
   la letra antigua (que podía dejar de existir). Ahora cada opción
   lleva su propio radio/checkbox: la respuesta SIEMPRE está atada a
   una fila viva y solo hay letras A/B/C/D…
     node tests/test_edit_answer_marker.js
============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js",
  "content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];
const tick = ms => new Promise(r=> setTimeout(r, ms||30));

function goto(w, v){
  const b = w.document.createElement("button");
  b.setAttribute("data-goto", v); w.document.body.appendChild(b);
  b.dispatchEvent(new w.MouseEvent("click", { bubbles:true })); b.remove();
}
let fail = 0;
const ok = (c,m)=>{ console.log((c?"  OK  ":"  XX  ")+m); if(!c) fail++; };

(async function(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  w.scrollTo = ()=>{};
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await tick(60);
  const O = w.OPE;
  O.GHS.setCfg({ owner:"x", repo:"OPE365", branch:"main", token:"github_pat_TEST" });

  const M = () => [...w.document.querySelectorAll('#bk-editor input.uq-correct[name="bk-ed-correct"]')];
  const optInput = L => w.document.querySelector(`#bk-editor [data-bk-ed-opt="${L}"]`);
  // marca exactamente `letters` (array) y dispara el autoguardado
  function setCorrect(letters){
    const set = new Set(letters);
    M().forEach(r=>{ r.checked = set.has(r.getAttribute("data-l")); });
    M()[0].dispatchEvent(new w.Event("change", { bubbles:true }));
  }
  function setText(L, txt){ const el = optInput(L); el.value = txt; el.dispatchEvent(new w.Event("change", { bubbles:true })); }
  async function openPanel(id){
    goto(w, "banco");
    const s = w.document.querySelector("#bk-search");
    s.value = id; s.dispatchEvent(new w.Event("input", { bubbles:true }));
    await tick(240);
    w.document.querySelector(`#bk-body [data-qid="${id}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
    await tick(20);
  }

  // ---------- OPCIÓN ÚNICA con respuesta != A ----------
  const q1 = O.QUESTIONS.find(x=> x.tipo==="opcion_unica" && (x.opciones||[]).length>=4 && x.respuesta!=="A" && !O.ContentEdit.has("q",x.id));
  const q1resp = q1.respuesta, q1Aorig = q1.opciones[0].text;
  ok(!!q1, `opción única con respuesta != A: ${q1.id} -> ${q1resp}`);
  await openPanel(q1.id);
  ok(!w.document.querySelector("#bk-ed-resp"), "ya no existe el <select> 'Respuesta correcta' antiguo");
  ok(M().length === q1.opciones.length && M().every(r=> r.type==="radio"), `un radio por opción (${M().length})`);
  ok((M().find(r=>r.checked)||{}).getAttribute("data-l") === q1resp, `el marcador activo = respuesta real (${q1resp})`);

  // reescribir la opción A y marcarla como correcta
  setText("A", "NUEVA OPCIÓN CORRECTA DEL TEST");
  setCorrect(["A"]);
  await tick(20);
  ok(O.Q_BY_ID[q1.id].respuesta === "A", "marcar el radio A guarda la respuesta en A");
  ok(O.Q_BY_ID[q1.id].opciones[0].text === "NUEVA OPCIÓN CORRECTA DEL TEST", "el texto nuevo de A se guarda");
  ok(O.ContentEdit.has("q", q1.id), "queda una corrección local");

  // volver todo al original -> la corrección se retira sola
  await openPanel(q1.id);
  setText("A", q1Aorig);
  setCorrect([q1resp]);
  await tick(20);
  ok(!O.ContentEdit.has("q", q1.id), "volver texto y marcador al original retira la corrección");

  // marca una letra cuya opción se ha vaciado: se puede, pero readQPatch no inventa
  await openPanel(q1.id);
  setCorrect(["D"]);
  await tick(20);
  ok(O.Q_BY_ID[q1.id].respuesta === "D", "el marcador solo maneja letras A-D, se puede mover a cualquiera");
  O.ContentEdit.revert("q", q1.id);

  // ---------- SELECCIÓN MÚLTIPLE ----------
  const q2 = O.QUESTIONS.find(x=> x.tipo==="seleccion_multiple" && Array.isArray(x.respuesta) && x.respuesta.length>=2 && !O.ContentEdit.has("q",x.id));
  const q2resp = q2.respuesta.slice();
  ok(!!q2, `selección múltiple: ${q2.id} -> [${q2resp}]`);
  await openPanel(q2.id);
  ok(M().length===q2.opciones.length && M().every(c=>c.type==="checkbox"), "selección múltiple -> checkboxes");
  const on = M().filter(c=>c.checked).map(c=>c.getAttribute("data-l")).sort();
  ok(JSON.stringify(on)===JSON.stringify(q2resp.slice().sort()), `marcados = respuesta (${on.join(",")})`);
  // quitar la primera correcta
  const keep = q2resp.slice(1);
  setCorrect(keep);
  await tick(20);
  ok(JSON.stringify(O.Q_BY_ID[q2.id].respuesta.slice().sort())===JSON.stringify(keep.slice().sort()),
     `desmarcar un checkbox actualiza el array respuesta -> [${keep}]`);
  O.ContentEdit.revert("q", q2.id);

  console.log(fail ? `\n${fail} FALLO(S)` : "\nTODO OK");
  process.exit(fail ? 1 : 0);
})();
