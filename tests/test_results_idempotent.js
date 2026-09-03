/* ============================================================
   OPE365 · renderResults idempotente (jsdom)
   go("results") puede re-ejecutarse (re-render de la vista, volver
   atrás y adelante). Antes, cada pasada añadía otra fila a
   PROGRESS.history y otro evento de examen al motor. Ahora
   consolidateSession(s) registra la sesión EXACTAMENTE UNA VEZ.
     node tests/test_results_idempotent.js
============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js",
  "content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];

function boot(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
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

(function main(){
  const w = boot();
  const O = w.OPE;

  // sesión de examen de 6 preguntas, todas respondidas
  const s = O.buildSession({ mode:"exam", count:6, qOrder:"aleatorio", source:"all",
    section:"all", topic:"all", tema:"all", tipo:"opcion_unica", categoria:"all", shuffleOptions:false });
  ok(!!s && s.questions.length === 6, "sesión de examen de 6 preguntas construida");
  s.responses = {};
  s.questions.forEach((q,i)=>{ s.responses[i] = { answer:q.respuesta, correct:true }; });
  O.setSession(s);

  goto(w, "results");
  const hist1 = O.PROGRESS.history.length;
  const ev1 = (O.PROGRESS.events || []).length;
  ok(hist1 === 1, `1ª pasada: 1 fila de historial (tiene ${hist1})`);
  ok(ev1 === 6, `1ª pasada: 6 eventos en el motor, uno por pregunta (tiene ${ev1})`);
  ok(s._consolidated === true, "1ª pasada: sesión marcada como consolidada");

  // re-render de la misma vista, 3 veces más
  goto(w, "results");
  goto(w, "results");
  goto(w, "results");
  ok(O.PROGRESS.history.length === hist1, `tras 3 re-renders: sigue habiendo ${hist1} fila(s) de historial (tiene ${O.PROGRESS.history.length})`);
  ok((O.PROGRESS.events || []).length === ev1, `tras 3 re-renders: ningún evento nuevo en el motor (${ev1} → ${(O.PROGRESS.events||[]).length})`);

  // la vista sigue mostrando el resultado
  ok(/result-hero|score/.test(w.document.querySelector("main").innerHTML), "la vista de resultados se sigue renderizando");

  // renderRunner con sesión terminada no revienta ni re-renderiza el runner
  goto(w, "running");
  ok(!/session-shell/.test(w.document.querySelector("main").innerHTML), "running con sesión terminada redirige (no re-abre el runner)");

  console.log(fail ? `\n${fail} FALLO(S)` : "\nTODO OK");
  process.exit(fail ? 1 : 0);
})();
