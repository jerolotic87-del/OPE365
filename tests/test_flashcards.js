// Prueba jsdom del motor + UI mínima de flashcards (Etapas 6 y 7):
// listado/filtro, iniciar sesión, revelar dorso, marcar dominada,
// siguiente/anterior, salir. Sigue el patrón de pruebas del proyecto.
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
  function clickGoto(view){
    const b = window.document.createElement("button");
    b.setAttribute("data-goto", view);
    window.document.body.appendChild(b);
    b.dispatchEvent(new window.MouseEvent("click", { bubbles:true }));
    b.remove();
  }

  // Recuentos derivados de los datos (el banco de flashcards crece por
  // secciones: vista, revision, ...), no hardcodeados.
  const totalCards = O.FLASHCARDS.length;
  const altaCards = O.FLASHCARDS.filter(c=>c.priority==="alta").length;
  assert(totalCards >= 55, `se cargan las flashcards (${totalCards})`);
  assert(O.FLASHCARD_INTEGRITY_REPORT.invalid === 0, "0 flashcards inválidas");

  clickGoto("flashcards");
  const items = window.document.querySelectorAll(".qlist-item");
  assert(items.length === totalCards, `el hub de flashcards lista las ${totalCards} sin filtros`);

  // Filtrar por prioridad alta
  const prioSel = window.document.getElementById("fc-prioridad");
  prioSel.value = "alta";
  prioSel.dispatchEvent(new window.Event("input"));
  const itemsAlta = window.document.querySelectorAll(".qlist-item");
  assert(itemsAlta.length === altaCards, `filtro de prioridad alta da ${altaCards} tarjetas (obtenidas ${itemsAlta.length})`);

  // Iniciar sesión desde la primera tarjeta filtrada
  itemsAlta[0].click();
  assert(window.document.getElementById("fc-card"), "se muestra la tarjeta de estudio");
  assert(window.document.getElementById("fc-back").classList.contains("hidden"), "el dorso empieza oculto");

  window.document.getElementById("fc-card").click();
  assert(!window.document.getElementById("fc-back").classList.contains("hidden"), "al tocar la tarjeta se revela el dorso");

  const firstCanonical = O.FLASHCARDS.find(c=>c.priority==="alta").canonicalId;
  assert(O.PROGRESS.flashcards[firstCanonical] && O.PROGRESS.flashcards[firstCanonical].vecesVista >= 1, "se registra que se ha visto la tarjeta");

  window.document.getElementById("fc-mastered").click();
  assert(O.getFlashcardState(firstCanonical)==="dominada", "marcar dominada actualiza el estado");

  window.document.getElementById("fc-next").click();
  assert(window.document.querySelector(".pos").textContent.trim()===`2 / ${altaCards}`, `avanza a la siguiente tarjeta (2/${altaCards})`);

  window.document.getElementById("fc-prev").click();
  assert(window.document.querySelector(".pos").textContent.trim()===`1 / ${altaCards}`, `retrocede a la tarjeta anterior (1/${altaCards})`);

  window.document.getElementById("fc-exit").click();
  assert(O.Nav.view === "flashcards", "salir vuelve al hub de flashcards");

  const stats = O.computeFlashcardStats();
  assert(stats.dominadas >= 1, "computeFlashcardStats refleja la tarjeta dominada");

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas de flashcards pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
