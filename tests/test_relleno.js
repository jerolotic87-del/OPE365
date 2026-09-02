// Prueba jsdom del tipo de ejercicio "relleno" (huecos numerados),
// añadido para dar soporte nativo a las preguntas de Vista de ese
// formato. Sigue el patrón del proyecto: JSDOM + fixture mínimo +
// simulación de eventos + lectura de OPE.getState().
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
  runScript(read("github-sync.js"));
  runScript(read("engine.js"));
  runScript(read("engine-bridge.js"));
  runScript(read("views.js"));

  const O = window.OPE;
  let failures = 0;
  function assert(cond, msg){
    if(!cond){ failures++; console.error("FALLO:", msg); }
    else console.log("OK:", msg);
  }

  // Inyecta una pregunta de relleno sintética directamente en el banco
  // canónico en memoria (no toca ficheros) para probar el ciclo completo.
  const testQ = {
    id: "test-relleno-1", sourceFile: "test.txt", tipo: "relleno",
    enunciado: "La Vista Esquema se utiliza para [1] y [2] esquemas.",
    respuesta: ["crear", "editar"],
    explicacion: "Explicación de prueba.", categoria: "concepto", negativa: false
  };
  O.Q_BY_ID[testQ.id] = testQ;
  O.QUESTIONS.push(testQ);

  assert(O.countBlanks(testQ.enunciado) === 2, "countBlanks detecta 2 huecos");
  assert(O.evaluateAnswer(testQ, ["crear","editar"]) === true, "evaluateAnswer acepta la respuesta exacta");
  assert(O.evaluateAnswer(testQ, ["CREAR"," Editar "]) === true, "evaluateAnswer normaliza mayúsculas/espacios");
  assert(O.evaluateAnswer(testQ, ["crear","otra cosa"]) === false, "evaluateAnswer rechaza una respuesta incorrecta");

  const session = O.buildSessionFromIds([testQ.id], { mode:"practice" }, 12345);
  assert(!!session, "se construye una sesión con la pregunta de relleno");
  O.setSession(session);

  // Navega usando el mismo contrato público que usa la UI real: un
  // elemento con [data-goto] capturado por el listener delegado en
  // window (ver views.js). No se llama a go()/render() directamente
  // porque no están expuestas fuera de la IIFE de views.js.
  const navBtn = window.document.createElement("button");
  navBtn.setAttribute("data-goto", "running");
  window.document.body.appendChild(navBtn);
  navBtn.dispatchEvent(new window.MouseEvent("click", { bubbles:true }));
  navBtn.remove();

  const inputs = window.document.querySelectorAll("[data-blank]");
  assert(inputs.length === 2, "el runner pinta 2 inputs para 2 huecos");

  inputs[0].value = "crear";
  inputs[0].dispatchEvent(new window.Event("input"));
  inputs[1].value = "editar";
  inputs[1].dispatchEvent(new window.Event("input"));

  const btn = window.document.getElementById("blank-check");
  assert(!!btn, "existe el botón Comprobar");
  btn.dispatchEvent(new window.Event("click"));

  const respondedSession = O.getSession();
  const resp = respondedSession.responses[0];
  assert(!!resp && resp.correct === true, "la respuesta se registra como correcta");

  const disabledInputs = window.document.querySelectorAll("[data-blank]");
  assert(disabledInputs.length === 2 && disabledInputs[0].disabled, "tras responder, los inputs quedan deshabilitados");
  assert(window.document.querySelector(".blank-input.correct"), "se pinta el estado 'correct' en el input");

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas de 'relleno' pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
