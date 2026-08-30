// Prueba jsdom de la navegación de temario por taxonomía (Etapa 8):
// hub Estudiar -> tarjeta de sección -> detalle -> Preguntas/Flashcards/Errores.
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

  clickGoto("study");
  const sectionCards = window.document.querySelectorAll('[data-goto="temario-detalle"]');
  assert(sectionCards.length === 10, `el hub Estudiar lista las 10 secciones del temario (obtenidas ${sectionCards.length})`);

  // Sección "vista" (con contenido real) vía click directo en su tarjeta
  const vistaCard = Array.from(sectionCards).find(b=> b.getAttribute("data-params").includes('"vista"'));
  assert(!!vistaCard, "existe la tarjeta de la sección Vista");
  vistaCard.click();
  assert(window.document.querySelector("h1").textContent.trim()==="Vista", "el detalle muestra el nombre de la sección");
  assert(window.document.getElementById("td-preguntas").textContent.includes("61"), "muestra 61 preguntas clasificadas en Vista");
  assert(window.document.getElementById("td-flashcards").textContent.includes("46"), "muestra 46 flashcards en Vista");
  assert(window.document.getElementById("td-errores").textContent.includes("7"), "muestra 7 fichas de error en Vista");

  window.document.getElementById("td-preguntas").click();
  assert(O.getSession() && O.getSession().questions.length===61, "iniciar 'Preguntas' arranca una sesión con las 61 preguntas de Vista");

  clickGoto("temario-detalle", {sectionId:"vista"});
  window.document.getElementById("td-errores").click();
  assert(window.document.getElementById("fc-card"), "iniciar 'Errores' abre la sesión de flashcards de error");

  // Sección sin contenido clasificado todavía (estado vacío honesto)
  clickGoto("temario-detalle", {sectionId:"interfaz"});
  assert(window.document.querySelector(".empty-state"), "una sección sin preguntas clasificadas muestra el estado vacío");
  window.document.getElementById("td-preguntas").click();
  assert(O.Nav.view === "temario-detalle", "'Preguntas' en una sección vacía no rompe nada, se queda en la vista");

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas de temario/taxonomía pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
