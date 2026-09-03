/* ============================================================
   OPE365 · Correcciones de contenido en la app (jsdom)
   Verifica que editar una pregunta/flashcard desde la interfaz:
   - parchea el objeto canónico en sitio (runner, evaluación, motor)
   - persiste y se re-aplica al recargar
   - se puede deshacer (revert restaura el original)
   - exporta un JSON con solo los campos cambiados
     node tests/test_content_edit.js
============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js",
  "content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];

function boot(storage){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/",
    beforeParse(w){ if(storage) w.localStorage.setItem("ope365_v1", storage); } });
  const w = dom.window;
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  return w;
}

let fail = 0;
const ok = (c,m)=>{ console.log((c?"  OK  ":"  XX  ")+m); if(!c) fail++; };

(function main(){
  let w = boot();
  const O = w.OPE, D = w.document;
  ok(!!O.ContentEdit, "OPE.ContentEdit disponible");

  // ---- editar una pregunta de opción única ----
  const q = O.QUESTIONS.find(x=> x.tipo==="opcion_unica" && x.opciones && x.opciones.length>=3);
  const qid = q.id;
  const origResp = q.respuesta, origExpl = q.explicacion, origOpt0 = q.opciones[0].text;
  const newResp = q.opciones.find(o=> o.letter !== origResp).letter;

  O.ContentEdit.apply("q", qid, { respuesta:newResp, explicacion:"EXPLICACIÓN CORREGIDA", opciones:[{letter:q.opciones[0].letter, text:"OPCIÓN 0 CORREGIDA"}], nota:"la correcta es "+newResp });
  ok(O.Q_BY_ID[qid].respuesta === newResp, "respuesta canónica parcheada en sitio");
  ok(O.Q_BY_ID[qid].explicacion === "EXPLICACIÓN CORREGIDA", "explicación canónica parcheada");
  ok(O.Q_BY_ID[qid].opciones[0].text === "OPCIÓN 0 CORREGIDA", "texto de opción parcheado (emparejado por letra)");
  ok(O.Q_BY_ID[qid].opciones.length === q.opciones.length, "no se altera el nº de opciones");
  ok(O.evaluateAnswer(O.Q_BY_ID[qid], newResp) === true, "evaluateAnswer usa la respuesta corregida");
  ok(O.evaluateAnswer(O.Q_BY_ID[qid], origResp) === false, "la respuesta original ahora es incorrecta");
  ok(O.ContentEdit.count() === 1, "se registra 1 corrección");

  // ---- persiste ----
  O.persist();
  const saved = w.localStorage.getItem("ope365_v1");
  const parsed = JSON.parse(saved);
  ok(parsed.contentOverrides && parsed.contentOverrides.q[qid], "la corrección se persiste en localStorage");
  ok(parsed.contentOverrides.q[qid].respuesta === newResp && !("tipo" in parsed.contentOverrides.q[qid]),
     "el patch guardado solo lleva los campos cambiados (+ ts/nota)");

  // ---- se re-aplica al recargar ----
  w = boot(saved);
  const O2 = w.OPE;
  ok(O2.Q_BY_ID[qid].respuesta === newResp, "tras recargar, la corrección sigue aplicada");
  ok(O2.Q_BY_ID[qid].explicacion === "EXPLICACIÓN CORREGIDA", "tras recargar, la explicación corregida persiste");

  // ---- exportar ----
  const exp = JSON.parse(O2.ContentEdit.exportJSON());
  ok(exp.correcciones && exp.correcciones.preguntas && exp.correcciones.preguntas[qid] && exp.correcciones.preguntas[qid].respuesta === newResp, "exportJSON incluye el patch de la pregunta");

  // ---- revertir ----
  O2.ContentEdit.revert("q", qid);
  ok(O2.Q_BY_ID[qid].respuesta === origResp, "revert restaura la respuesta original");
  ok(O2.Q_BY_ID[qid].explicacion === origExpl, "revert restaura la explicación original");
  ok(O2.Q_BY_ID[qid].opciones[0].text === origOpt0, "revert restaura el texto de la opción");
  ok(O2.ContentEdit.count() === 0, "tras revert no quedan correcciones");
  O2.persist();
  ok(!JSON.parse(w.localStorage.getItem("ope365_v1")).contentOverrides.q[qid], "revert también limpia el almacenamiento");

  // ---- flashcard ----
  w = boot();
  const O3 = w.OPE;
  const fcid = O3.FLASHCARDS[0].canonicalId;
  const origFront = O3.F_BY_ID[fcid].front;
  O3.ContentEdit.apply("fc", fcid, { front:"FRENTE CORREGIDO", priority:"alta" });
  ok(O3.F_BY_ID[fcid].front === "FRENTE CORREGIDO", "flashcard: frente parcheado");
  ok(O3.F_BY_ID[fcid].priority === "alta", "flashcard: prioridad parcheada");
  O3.ContentEdit.revert("fc", fcid);
  ok(O3.F_BY_ID[fcid].front === origFront, "flashcard: revert restaura el frente");

  // ---- vista "Mi contenido" ----
  const D3 = w.document;
  { const b=D3.createElement("button"); b.setAttribute("data-goto","mi-contenido"); D3.body.appendChild(b);
    b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); }
  ok(O3.Nav.view === "mi-contenido" && !!D3.querySelector("#mc-new-q") && !!D3.querySelector("#mc-new-fc"),
     "la vista 'Mi contenido' se abre con los botones de crear");
  ok(D3.querySelectorAll(".mc-row").length === 0, "sin contenido propio la lista está vacía");

  // ---- botón ✎ presente en el runner ----
  const s = O3.buildSession({mode:"practice",count:3,qOrder:"aleatorio",source:"all",tema:"all",tipo:"all",categoria:"all",section:"all",topic:"all",shuffleOptions:true});
  O3.setSession(s); O3.saveSessionSnapshot();
  const btn = D3.createElement("button"); btn.setAttribute("data-goto","running"); D3.body.appendChild(btn);
  btn.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); btn.remove();
  ok(!!D3.getElementById("q-edit"), "el runner muestra el botón ✎ de editar");

  // ---- CREAR contenido propio (con imagen) ----
  w = boot();
  const O4 = w.OPE;
  const IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const nq0 = O4.QUESTIONS.length;
  const sec = O4.TAXONOMY_SECTIONS.find(s=>s.topics && s.topics.length);
  const qid2 = O4.ContentEdit.createQuestion({
    tipo:"opcion_unica", enunciado:"¿A qué comando corresponde esta imagen?",
    opciones:[{letter:"A",text:"Negrita"},{letter:"B",text:"Cursiva"},{letter:"C",text:"Subrayado"},{letter:"D",text:"Tachado"}],
    respuesta:"B", explicacion:"Es el icono de cursiva.", categoria:"concepto",
    section:sec.id, topic:sec.topics[0].id, imagen:IMG,
  });
  ok(O4.QUESTIONS.length === nq0 + 1, "createQuestion añade la pregunta al banco en memoria");
  ok(O4.Q_BY_ID[qid2] && O4.Q_BY_ID[qid2].imagen === IMG, "la pregunta creada lleva la imagen (data URI)");
  ok(O4.evaluateAnswer(O4.Q_BY_ID[qid2], "B") === true, "evaluateAnswer funciona sobre la pregunta creada");
  ok(O4.LE.CONCEPT_OF_Q[qid2] === sec.id+":"+sec.topics[0].id, "el motor asocia la pregunta creada a su concepto");
  ok(O4.ContentEdit.isUser("q", qid2) && O4.ContentEdit.userCount() === 1, "queda registrada como contenido propio");

  // selección múltiple
  const qid3 = O4.ContentEdit.createQuestion({
    tipo:"seleccion_multiple", enunciado:"¿Cuáles son formatos de fuente?",
    opciones:[{letter:"A",text:"Negrita"},{letter:"B",text:"Interlineado"},{letter:"C",text:"Cursiva"},{letter:"D",text:"Sangría"}],
    respuesta:["C","A"], explicacion:"Negrita y cursiva son formato de fuente.",
    section:sec.id, topic:sec.topics[0].id,
  });
  ok(O4.Q_BY_ID[qid3].tipo === "seleccion_multiple" && Array.isArray(O4.Q_BY_ID[qid3].respuesta), "createQuestion soporta selección múltiple (respuesta como array ordenado)");
  ok(JSON.stringify(O4.Q_BY_ID[qid3].respuesta) === JSON.stringify(["A","C"]), "la respuesta múltiple se guarda ordenada");
  ok(O4.evaluateAnswer(O4.Q_BY_ID[qid3], ["A","C"]) === true, "evaluateAnswer valida la selección múltiple creada");

  const fcid2 = O4.ContentEdit.createFlashcard({ front:"¿Qué es este icono?", back:"R: Pegado especial", section:sec.id, topic:sec.topics[0].id, imagen:IMG, priority:"alta" });
  ok(O4.F_BY_ID[fcid2] && O4.F_BY_ID[fcid2].imagen === IMG, "createFlashcard añade la flashcard con imagen");
  ok(O4.LE.CONCEPT_OF_CARD[fcid2] === sec.id+":"+sec.topics[0].id, "el motor asocia la flashcard creada a su concepto");

  // ---- persiste y sobrevive a la recarga ----
  O4.persist();
  const s4 = w.localStorage.getItem("ope365_v1");
  w = boot(s4);
  const O5 = w.OPE;
  ok(O5.Q_BY_ID[qid2] && O5.Q_BY_ID[qid2].imagen === IMG, "tras recargar, la pregunta creada sigue en el banco");
  ok(O5.F_BY_ID[fcid2], "tras recargar, la flashcard creada sigue en el banco");
  ok(O5.LE.CONCEPT_OF_Q[qid2], "tras recargar, el concepto del motor incluye la pregunta creada");
  const exp5 = JSON.parse(O5.ContentEdit.exportJSON());
  ok(exp5.creadas && exp5.creadas.preguntas.length === 2 && exp5.creadas.flashcards.length === 1, "exportJSON separa 'creadas' de 'correcciones'");

  // ---- eliminar ----
  const n5 = O5.ContentEdit.userCount();
  O5.ContentEdit.deleteUserItem("q", qid2);
  ok(!O5.Q_BY_ID[qid2] && O5.QUESTIONS.every(x=>x.id!==qid2), "deleteUserItem quita la pregunta del banco");
  O5.ContentEdit.deleteUserItem("fc", fcid2);
  ok(!O5.F_BY_ID[fcid2], "deleteUserItem quita la flashcard del banco");
  O5.ContentEdit.deleteUserItem("q", qid3);
  ok(O5.ContentEdit.userCount() === n5 - 3, "userCount baja tras borrar cada elemento");
  ok(O5.ContentEdit.userCount() === 0, "no queda contenido propio tras borrar todo");

  // ---- purgeFromRuntime sobre una pregunta del banco (lo usa el borrado vía GitHub) ----
  const bankId = O5.QUESTIONS.find(q=> !O5.ContentEdit.isUser("q", q.id)).id;
  const nBank = O5.QUESTIONS.length;
  O5.PROGRESS.answers[bankId] = { tipo:"opcion_unica", correcta:true, seleccion:"A", intentos:1, ultimaVez:Date.now() };
  O5.ContentEdit.purgeFromRuntime("q", bankId);
  ok(!O5.Q_BY_ID[bankId] && O5.QUESTIONS.length === nBank - 1, "purgeFromRuntime quita una pregunta del banco en vivo");
  ok(!O5.PROGRESS.answers[bankId], "purgeFromRuntime limpia el progreso asociado");
  ok(!O5.LE.CONCEPT_OF_Q[bankId], "purgeFromRuntime la quita del grafo de conceptos del motor");

  // ---- huérfano seguro: id inexistente ----
  const bad = JSON.stringify({ contentOverrides:{ q:{ "no-existe-999":{respuesta:"A",ts:1} }, fc:{} }, answers:{}, marked:{}, history:[], settings:{}, challenges:{}, flashcards:{} });
  w = boot(bad);
  ok(w.OPE.QUESTIONS.length === w.__OPE365_DATA__.length, "un override sobre un id inexistente no rompe la carga");

  console.log(`\n${fail} fallo(s)`);
  process.exit(fail ? 1 : 0);
})();
