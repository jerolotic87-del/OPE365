/* ============================================================
   OPE365 · Visor / recorte de imagen (lightbox)
   Toda imagen de ejercicio es .zoomable + data-imgref; pulsarla abre
   #img-lb; con ref editable aparece «Guardar recorte»; Cerrar/Esc lo quitan.
   El campo `imagen` ya es una correccion valida en ContentEdit.
     node tests/test_image_lightbox.js
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
let fail = 0;
const ok = (c,m)=>{ console.log((c?"  OK  ":"  XX  ")+m); if(!c) fail++; };
function goto(w, v){
  const b = w.document.createElement("button");
  b.setAttribute("data-goto", v); w.document.body.appendChild(b);
  b.dispatchEvent(new w.MouseEvent("click", { bubbles:true })); b.remove();
}

(async function(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  w.scrollTo = ()=>{};
  w.HTMLElement.prototype.setPointerCapture = function(){};
  w.HTMLElement.prototype.releasePointerCapture = function(){};
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await tick(60);
  const O = w.OPE;

  ok(O.ContentEdit.Q_FIELDS.includes("imagen") && O.ContentEdit.FC_FIELDS.includes("imagen"),
     "ContentEdit acepta correcciones del campo 'imagen'");

  const q = O.QUESTIONS.find(x=> x.imagen);
  ok(!!q, `hay una pregunta con imagen (${q && q.id})`);

  // render real: panel del Editor del banco
  O.GHS.setCfg({ owner:"x", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  goto(w, "banco");
  const s = w.document.querySelector("#bk-search");
  s.value = q.id; s.dispatchEvent(new w.Event("input", { bubbles:true }));
  await tick(240);
  w.document.querySelector(`#bk-body [data-qid="${q.id}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  await tick(20);

  const img = w.document.querySelector("#bk-editor img.zoomable");
  ok(!!img, "el panel de edicion muestra la imagen como .zoomable");
  ok(img.getAttribute("data-imgref") === "q|"+q.id, "la imagen lleva data-imgref con el id");

  img.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  await tick(20);
  let lb = w.document.getElementById("img-lb");
  ok(!!lb, "pulsar la imagen abre el visor #img-lb");
  ok(!!lb.querySelector("#img-lb-save") && !!lb.querySelector("#img-lb-reset") && !!lb.querySelector("#img-lb-frame"),
     "el visor tiene «Guardar recorte», «Restablecer» y marco de recorte");
  lb.querySelector("#img-lb-close").dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  await tick(10);
  ok(!w.document.getElementById("img-lb"), "«Cerrar» quita el visor");

  // reabrir y cerrar con Esc
  w.document.querySelector("#bk-editor img.zoomable").dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
  await tick(10);
  ok(!!w.document.getElementById("img-lb"), "se reabre");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key:"Escape" }));
  await tick(10);
  ok(!w.document.getElementById("img-lb"), "Esc cierra el visor");

  // guardar una imagen recortada = correccion local (sin canvas real: via ContentEdit)
  const before = O.Q_BY_ID[q.id].imagen;
  O.ContentEdit.apply("q", q.id, { imagen: "data:image/png;base64,iVBORw0KGgo=" });
  ok(O.Q_BY_ID[q.id].imagen === "data:image/png;base64,iVBORw0KGgo=" && O.ContentEdit.has("q", q.id),
     "ContentEdit.apply({imagen}) guarda el recorte como correccion local");
  O.ContentEdit.revert("q", q.id);
  ok(O.Q_BY_ID[q.id].imagen === before, "revert restaura la imagen original");

  console.log(fail ? `\n${fail} FALLO(S)` : "\nTODO OK");
  process.exit(fail ? 1 : 0);
})();
