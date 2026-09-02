// Prueba jsdom del asistente "Por pestaña y grupo" (reemplaza el
// desplegable plano de 48 temas por Pestaña -> Grupo jerárquico).
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
  runScript(read("flashcards_data.js"));
  runScript(read("app.js"));
  runScript(read("content-overrides.js"));
  runScript(read("github-sync.js"));
  runScript(read("engine.js"));
  runScript(read("engine-bridge.js"));
  runScript(read("views.js"));

  const O = window.OPE;
  let failures = 0;
  function assert(cond, msg){ if(!cond){ failures++; console.error("FALLO:", msg); } else console.log("OK:", msg); }
  function clickGoto(view, params){
    const b = window.document.createElement("button");
    b.setAttribute("data-goto", view);
    if(params) b.setAttribute("data-params", JSON.stringify(params));
    window.document.body.appendChild(b);
    b.dispatchEvent(new window.MouseEvent("click", { bubbles:true }));
    b.remove();
  }

  clickGoto("practica");
  assert(!!window.document.getElementById("in-tema"), "Práctica muestra primero la elección de qué hacer");
  window.document.getElementById("in-tema").click();   // "Practicar un tema" → asistente
  window.document.querySelector('[data-scope="tema"]').click();

  const sectionSel = window.document.getElementById("wiz-section");
  assert(!!sectionSel, "aparece el selector de Pestaña");
  assert(sectionSel.options.length === 10, `el selector de Pestaña lista las 10 pestañas (obtenidas ${sectionSel.options.length})`);

  sectionSel.value = "vista";
  sectionSel.dispatchEvent(new window.Event("change"));
  const topicSel = window.document.getElementById("wiz-topic");
  const topicLabels = Array.from(topicSel.options).map(o=>o.textContent);
  assert(topicLabels.some(l=>l.includes("Zoom")), `el selector de Grupo se actualiza con los grupos de Vista (${topicLabels.join(", ")})`);

  // Elegir un grupo concreto y comprobar que el conteo previo coincide con filterQuestions
  topicSel.value = "zoom";
  topicSel.dispatchEvent(new window.Event("change"));
  const expected = O.filterQuestions({section:"vista", topic:"zoom"}).length;
  assert(expected > 0, "hay preguntas reales en Vista > Zoom para comprobar el flujo");

  window.document.getElementById("wiz-next").click();
  // Saltar los pasos de cantidad/tiempo pulsando "Continuar" hasta la vista previa
  for(let i=0;i<5;i++){
    const nBtn = window.document.querySelector("#wizard-body .btn-solid, #wizard-body .btn-primary");
    if(window.document.querySelector(".test-preview")) break;
    if(nBtn) nBtn.click();
  }
  const bigNum = window.document.querySelector(".test-preview .big");
  assert(!!bigNum, "se llega a la vista previa del test");
  assert(Number(bigNum.textContent.trim()) === expected, `la vista previa muestra el mismo número que filterQuestions (${bigNum.textContent.trim()} vs ${expected})`);

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas del asistente 'Por pestaña y grupo' pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
