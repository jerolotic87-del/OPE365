/* ============================================================
   OPE365 · Editor del banco (admin) — jsdom
   Vista "banco": buscar/filtrar/editar/borrar cualquier pregunta
   o flashcard. Solo visible con token de GitHub configurado.
     node tests/test_banco_admin.js
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

async function boot(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await tick(60);          // deja que el DOMContentLoaded real de jsdom se asiente (init() → go("home"))
  return w;
}
function goto(w, v){
  const b = w.document.createElement("button");
  b.setAttribute("data-goto", v);
  w.document.body.appendChild(b);
  b.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  b.remove();
}
let fail = 0;
const ok = (c,m)=>{ console.log((c?"  OK  ":"  XX  ")+m); if(!c) fail++; };
const main = w => w.document.querySelector("main");
const rows = w => w.document.querySelectorAll("#bk-body .qlist-item").length;

(async function(){
  const w = await boot();
  const O = w.OPE;

  goto(w, "banco");
  ok(!/Editor del banco/.test(main(w).innerHTML), "sin token: la vista banco NO se muestra");

  O.GHS.setCfg({ owner:"jerolotic87-del", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  goto(w, "banco");
  ok(/Editor del banco/.test(main(w).innerHTML), "con token: la vista banco se muestra");
  ok(w.document.querySelector("#bk-search") && w.document.querySelector("#bk-section") && w.document.querySelector("#bk-estado"),
    "barra de filtros presente");
  ok(rows(w) > 0, `lista de preguntas con filas (${rows(w)})`);
  ok(w.document.querySelector("#bk-count").textContent === `${O.QUESTIONS.length} / ${O.QUESTIONS.length}`,
    `contador "N / ${O.QUESTIONS.length}"`);

  // búsqueda por id exacto
  // un id que no sea subcadena de ningún otro (el buscador filtra por
  // subcadena de id): p.ej. inicio-38 casa también con inicio-380..389.
  const sample = O.QUESTIONS.slice().reverse().find(q =>
    O.QUESTIONS.filter(o => o.id.includes(q.id)).length === 1
  ) || O.QUESTIONS[Math.floor(O.QUESTIONS.length/2)];
  const s = w.document.querySelector("#bk-search");
  s.value = sample.id;
  s.dispatchEvent(new w.Event("input", { bubbles:true }));
  await tick(240);   // debounce 180ms
  ok(rows(w) === 1, `buscar "${sample.id}" deja 1 fila (${rows(w)})`);
  const row = w.document.querySelector(`#bk-body [data-qid="${sample.id}"]`);
  ok(!!row, "la fila es la pregunta buscada");

  row.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  ok(!!w.document.querySelector("#bk-editor #bk-ed-enun") && !!w.document.querySelector("#bk-editor #bk-ed-delbank"),
    "clic en fila carga el panel de edición inline con 'Borrar del banco'");
  ok(w.document.querySelector(`#bk-body [data-qid="${sample.id}"]`).classList.contains("selected"),
    "la fila queda marcada como seleccionada");

  // autoguardado: cambiar la explicación dispara una corrección local
  const origExpl = O.ContentEdit.original("q", sample.id).explicacion || "";
  const expl = w.document.querySelector("#bk-ed-expl");
  expl.value = "Explicación corregida por el test.";
  expl.dispatchEvent(new w.Event("change", { bubbles:true }));
  ok(O.Q_BY_ID[sample.id].explicacion === "Explicación corregida por el test." && O.ContentEdit.has("q", sample.id),
    "editar en el panel guarda la corrección en el objeto canónico");
  ok(!!w.document.querySelector("#bk-ed-save") && w.document.querySelector("#bk-ed-publish") && !w.document.querySelector("#bk-ed-publish").disabled,
    "con corrección pendiente: botones Guardar y Publicar al banco activos");

  // al re-seleccionar la fila, el panel muestra la corrección (no el original)
  goto(w, "banco");
  s.value = sample.id; s.dispatchEvent(new w.Event("input", { bubbles:true })); await tick(240);
  w.document.querySelector(`#bk-body [data-qid="${sample.id}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  ok(w.document.querySelector("#bk-ed-expl").value === "Explicación corregida por el test.",
    "el panel muestra el texto corregido al reabrirlo, no el original");

  // volver el campo al valor original en el propio panel -> la corrección se retira sola
  const expl2 = w.document.querySelector("#bk-ed-expl");
  expl2.value = origExpl;
  expl2.dispatchEvent(new w.Event("change", { bubbles:true }));
  ok(!O.ContentEdit.has("q", sample.id) && (O.Q_BY_ID[sample.id].explicacion || "") === origExpl,
    "dejar el campo como el original retira la corrección automáticamente");

  // pestaña Flashcards
  goto(w, "banco");
  w.document.querySelector('.pill-row [data-bt="fc"]').dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  ok(/Flashcards ·/.test(main(w).innerHTML) && !!w.document.querySelector('#bk-body [data-fcid]'),
    "la pestaña Flashcards lista flashcards del banco");
  ok(w.document.querySelector("#bk-count").textContent === `${O.FLASHCARDS.length} / ${O.FLASHCARDS.length}`,
    "contador de flashcards correcto");
  ok(!w.document.querySelector("#bk-tipo"), "en Flashcards no hay filtro de tipo de ejercicio");

  const est = w.document.querySelector("#bk-estado");
  est.value = "creada"; est.dispatchEvent(new w.Event("change", { bubbles:true }));
  ok(w.document.querySelector("#bk-count").textContent.startsWith("0 "), "filtro 'Creadas por mí' con banco limpio da 0");

  console.log(fail ? `\n${fail} FALLO(S)` : "\nTODO OK");
  process.exit(fail ? 1 : 0);
})();
