// Prueba jsdom de la navegación de temario por taxonomía:
// área Temario -> fila de sección -> detalle -> Practicar/Flashcards/Errores.
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

  clickGoto("temario");
  const sectionCards = window.document.querySelectorAll('[data-goto="temario-detalle"]');
  assert(sectionCards.length === 10, `el área Temario lista las 10 secciones (obtenidas ${sectionCards.length})`);

  // Sección "vista" (con contenido real) vía click directo en su fila
  const vistaCard = Array.from(sectionCards).find(b=> b.getAttribute("data-params").includes('"vista"'));
  assert(!!vistaCard, "existe la fila de la sección Vista");
  vistaCard.click();
  assert(window.document.querySelector("h1").textContent.trim()==="Vista", "el detalle muestra el nombre de la sección");
  // El total de "vista" ya no es solo vista.json (61): tras la
  // reclasificación completa del banco heredado (ago-2026), también
  // incluye preguntas de atajos del banco antiguo que son genuinamente
  // de la pestaña Vista (dividir ventana, vista Esquema, etc.) -- se
  // compara contra el recuento real vía computeTaxonomyStats en vez de
  // hardcodear un número que ya no sería la verdad.
  const vistaCount = O.filterQuestions({section:"vista"}).length;
  assert(vistaCount > 61, `Vista incluye preguntas del banco heredado además de vista.json (${vistaCount} > 61)`);
  assert(window.document.getElementById("td-preguntas").textContent.includes(String(vistaCount)), `muestra ${vistaCount} preguntas clasificadas en Vista`);
  const vistaCards = O.FLASHCARDS.filter(c=> c.section==="vista");
  const vistaErrores = vistaCards.filter(c=> c.cardType==="error").length;
  assert(window.document.getElementById("td-flashcards").textContent.includes(String(vistaCards.length)), `muestra ${vistaCards.length} flashcards en Vista`);
  assert(window.document.getElementById("td-errores").textContent.includes(String(vistaErrores)), `muestra ${vistaErrores} fichas de error en Vista`);

  window.document.getElementById("td-preguntas").click();
  assert(O.getSession() && O.getSession().questions.length===vistaCount, `iniciar 'Preguntas' arranca una sesión con las ${vistaCount} preguntas de Vista`);

  clickGoto("temario-detalle", {sectionId:"vista"});
  window.document.getElementById("td-errores").click();
  assert(window.document.getElementById("fc-card"), "iniciar 'Errores' abre la sesión de flashcards de error");

  // Sección sin contenido clasificado todavía (estado vacío honesto).
  // "diseno" es la única de las 10 que sigue a 0 tras la reclasificación
  // completa del banco heredado -- el resto ya tienen preguntas reales.
  assert(O.filterQuestions({section:"diseno"}).length === 0, "'diseno' sigue sin preguntas clasificadas (sanity check del propio test)");
  clickGoto("temario-detalle", {sectionId:"diseno"});
  assert(window.document.querySelector(".empty-state"), "una sección sin preguntas clasificadas muestra el estado vacío");
  window.document.getElementById("td-preguntas").click();
  assert(O.Nav.view === "temario-detalle", "'Preguntas' en una sección vacía no rompe nada, se queda en la vista");

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas de temario/taxonomía pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
