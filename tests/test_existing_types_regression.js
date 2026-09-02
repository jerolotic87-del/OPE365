// Comprobación rápida de que los 4 tipos de ejercicio existentes
// (opcion_unica, verdadero_falso, seleccion_multiple, emparejamiento)
// siguen funcionando igual tras añadir el tipo "relleno" -- especialmente
// el guard nuevo en pendingMultiSelection y el dispatcher de
// renderQuestionBody, que se tocaron para dar cabida a relleno.
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function read(name){ return fs.readFileSync(path.join(ROOT, name), "utf-8"); }

async function main(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts: "dangerously", url: "http://localhost/" });
  const { window } = dom;
  function runScript(code){ window.eval(code); }
  runScript(read("questions_data.js"));
  runScript(read("taxonomy_data.js"));
  runScript(read("app.js"));
  runScript(read("content-overrides.js"));
  runScript(read("engine.js"));
  runScript(read("engine-bridge.js"));
  runScript(read("views.js"));

  const O = window.OPE;
  let failures = 0;
  function assert(cond, msg){ if(!cond){ failures++; console.error("FALLO:", msg); } else console.log("OK:", msg); }
  function clickGoto(view){
    const b = window.document.createElement("button");
    b.setAttribute("data-goto", view);
    window.document.body.appendChild(b);
    b.dispatchEvent(new window.MouseEvent("click", { bubbles:true }));
    b.remove();
  }

  const opcionUnica = O.QUESTIONS.find(q=>q.tipo==="opcion_unica");
  const vf = O.QUESTIONS.find(q=>q.tipo==="verdadero_falso");
  const multi = O.QUESTIONS.find(q=>q.tipo==="seleccion_multiple");
  const match = O.QUESTIONS.find(q=>q.tipo==="emparejamiento");
  assert(opcionUnica && vf && multi && match, "hay al menos una pregunta real de cada uno de los 4 tipos existentes");

  function runFor(q, answerFn, expectCorrect){
    const s = O.buildSessionFromIds([q.id], { mode:"practice" }, 999);
    O.setSession(s);
    clickGoto("running");
    answerFn();
    const resp = O.getSession().responses[0];
    assert(!!resp, `${q.tipo}: se registra una respuesta`);
    assert(resp.correct === expectCorrect, `${q.tipo}: correct=${expectCorrect} (obtenido ${resp && resp.correct})`);
  }

  runFor(opcionUnica, ()=>{
    const s2 = O.getSession();
    const composed = s2.questions[0];
    window.document.querySelector(`[data-letter="${composed.respuesta}"]`).click();
  }, true);

  runFor(vf, ()=>{
    const s2 = O.getSession();
    const composed = s2.questions[0];
    window.document.querySelector(`[data-val="${composed.respuesta}"]`).click();
  }, true);

  runFor(multi, ()=>{
    const s2 = O.getSession();
    const composed = s2.questions[0];
    composed.respuesta.forEach(letter=> window.document.querySelector(`[data-letter="${letter}"]`).click());
    window.document.getElementById("multi-check").click();
  }, true);

  runFor(match, ()=>{
    const s2 = O.getSession();
    const composed = s2.questions[0];
    composed.matching.left.forEach(l=>{
      window.document.querySelector(`[data-left="${l.id}"]`).click();
      window.document.querySelector(`[data-right="${composed.matching.correct[l.id]}"]`).click();
    });
    window.document.getElementById("match-check").click();
  }, true);

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nRegresión de los 4 tipos existentes: OK.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
