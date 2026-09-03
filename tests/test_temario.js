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
  const sectionCards = window.document.querySelectorAll('.tm-acc');
  assert(sectionCards.length === 10, `el área Temario lista las 10 secciones (obtenidas ${sectionCards.length})`);

  // acordeón: empieza contraído; al abrir muestra los subgrupos con su %
  const D = window.document;
  const fire = (el,type)=> el.dispatchEvent(new window.Event(type, { bubbles:true }));
  const accs = D.querySelectorAll('.tm-acc[data-sec]');
  assert(accs.length >= 8, `${accs.length} pestañas son acordeones desplegables`);
  assert(Array.from(accs).every(a=> !a.classList.contains('open')), "todos los acordeones empiezan contraídos");
  const vistaAcc = Array.from(accs).find(a=> a.getAttribute('data-sec') === 'vista');
  const head = vistaAcc.querySelector('.tm-head-btn[data-tm-toggle]');
  assert(head.getAttribute('aria-expanded') === 'false', "la cabecera marca aria-expanded=false al inicio");
  head.dispatchEvent(new window.MouseEvent('click', { bubbles:true }));
  assert(vistaAcc.classList.contains('open') && head.getAttribute('aria-expanded') === 'true', "clic en la cabecera abre el acordeón");
  const subs = vistaAcc.querySelectorAll('.tm-sub');
  assert(subs.length > 0, `${subs.length} subgrupos dentro de Vista`);
  assert(subs[0].querySelector('.tm-sub-pct') && /%$/.test(subs[0].querySelector('.tm-sub-pct').textContent), "cada subgrupo muestra su porcentaje");
  assert(!vistaAcc.querySelector('.tm-sub-name').closest('.tm-head-btn'), "los subgrupos NO están dentro de la cabecera");

  // casillas + barra Comenzar
  const bar = D.getElementById('tm-floatbar');
  assert(bar && !bar.classList.contains('show'), "la barra Comenzar está oculta sin selección");
  const firstTopic = vistaAcc.querySelector('.tm-topic-check:not([disabled])');
  const topId = firstTopic.getAttribute('data-topic');
  firstTopic.checked = true; fire(firstTopic, 'change');
  assert(bar.classList.contains('show'), "marcar un subgrupo muestra la barra Comenzar");
  const expected = O.filterQuestions({ section:'vista', topic:topId }).length;
  assert(D.getElementById('tm-fb-count').textContent === String(expected), `la barra cuenta las ${expected} preguntas del grupo`);
  // marcar la pestaña entera
  const secCheck = vistaAcc.querySelector('.tm-sec-check');
  secCheck.checked = true; fire(secCheck, 'change');
  const allVista = O.filterQuestions({ section:'vista' }).length;
  assert(Number(D.getElementById('tm-fb-count').textContent) === allVista && allVista > expected,
    `marcar la pestaña selecciona sus ${allVista} preguntas`);
  assert(Array.from(vistaAcc.querySelectorAll('.tm-topic-check:not([disabled])')).every(c=>c.checked),
    "marcar la pestaña marca todos sus subgrupos");
  // Comenzar
  D.getElementById('tm-fb-go').dispatchEvent(new window.MouseEvent('click', { bubbles:true }));
  assert(O.getSession() && O.getSession().questions.length === allVista && O.Nav.view === 'running',
    `"Comenzar" arranca una sesión con las ${allVista} preguntas seleccionadas`);
  O.setSession(null);
  clickGoto("temario");

  // el panel del acordeón enlaza flashcards + errores directamente (no una página aparte)
  const vistaAcc2 = Array.from(D.querySelectorAll('.tm-acc[data-sec="vista"]'))[0];
  vistaAcc2.querySelector('.tm-head-btn[data-tm-toggle]').dispatchEvent(new window.MouseEvent('click', { bubbles:true }));
  const extra = vistaAcc2.querySelector('.tm-panel-extra');
  const vistaCardsAll = O.FLASHCARDS.filter(c=> c.section==="vista");
  assert(extra && extra.querySelector('[data-goto="flashcards"][data-params*="vista"]'), "el panel enlaza 'Flashcards de esta pestaña'");
  assert(extra.textContent.includes(String(vistaCardsAll.length)), `el enlace de flashcards muestra el recuento (${vistaCardsAll.length})`);

  // llegada desde Progreso: abrir Temario con una pestaña desplegada
  clickGoto("temario", { expand:"vista" });
  const vistaAcc3 = D.querySelector('.tm-acc[data-sec="vista"]');
  assert(vistaAcc3 && vistaAcc3.classList.contains('open'), "clickGoto temario {expand} abre esa pestaña");

  // temario-detalle sigue existiendo como vista directa (para secciones sin subgrupos)
  clickGoto("temario-detalle", {sectionId:"vista"});
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
