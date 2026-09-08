/* ============================================================
   OPE365 · Modo Atajos en formato TARJETA (jsdom)

   Practicar atajos no es un test: es memoria de pares tecla-acción. La
   sesión de `categoria:"atajo"` en modo práctica presenta cada pregunta
   tapada, se destapa a voluntad y se autocalifica — pero SIGUE siendo la
   misma sesión del runner normal, así que el resumen, el historial, el
   progreso y el motor quedan igual que con un test.

   Falla con el código anterior (no existía `#card-reveal`).
     node tests/test_modo_tarjeta.js   → exit 0/1
============================================================ */
const fs = require("fs"), { JSDOM } = require("jsdom");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];
function boot(){
  const dom = new JSDOM(fs.readFileSync("tests/fixture.html","utf8"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window, errs = [];
  w.addEventListener("error", e=> errs.push(String(e.error && e.error.stack || e.message)));
  SCRIPTS.forEach(f=>{ try{ w.eval(fs.readFileSync(f,"utf8")); }catch(e){ errs.push(f+": "+e.message); } });
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  return { w, D:w.document, O:w.OPE, errs };
}
function goto(D,w,v){ const b=D.createElement("button"); b.setAttribute("data-goto",v); D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); }
function click(D,w,sel){ const el = typeof sel==="string" ? D.querySelector(sel) : sel; if(el){ el.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); return true; } return false; }
let pass=0, fail=0;
const ck = (c,m)=>{ if(c){ pass++; console.log("  OK  "+m); } else { fail++; console.error("  XX  "+m); } };

const { w, D, O, errs } = boot();
ck(errs.length===0, "carga sin errores ("+errs.join(" | ")+")");

/* Arranca una sesión de práctica de solo atajos, igual que el asistente
   cuando eliges el modo «Atajos». */
function sesionAtajos(count, tipo){
  const s = O.buildSession({ mode:"practice", source:"all", section:"all", topic:"all", tema:"all",
    tipo: tipo||"all", categoria:"atajo", count, qOrder:"aleatorio", shuffleOptions:true, minutes:null });
  O.setSession(s); O.saveSessionSnapshot(); goto(D,w,"running");
  return O.getSession();
}
const convertible = q => q.tipo==="opcion_unica" && !q.negativa;

// ── A) la sesión se presenta tapada ────────────────────────────────────
let s = sesionAtajos(8);
ck(!!s && s.questions.length===8, "A · sesión de 8 atajos creada");
ck(s.questions.every(q=> q.categoria==="atajo"), "A · todas las preguntas son de atajo");

while(!convertible(s.questions[s.current]) && s.current < s.questions.length-1){ s.current++; goto(D,w,"running"); }
const q0 = s.questions[s.current];
ck(convertible(q0), "A · hay al menos una pregunta convertible en tarjeta");
ck(!!D.getElementById("card-reveal"), "A · se pinta tapada, con «Ver la respuesta»");
ck(D.querySelectorAll("#q-body .option").length===0, "A · NO se ofrecen las 4 opciones antes de destapar");
ck(/Tarjeta/.test(D.querySelector(".tag-type").textContent), "A · la etiqueta de tipo dice «Tarjeta»");

const correcta = q0.opciones.find(o=> o.letter===q0.respuesta).text;
ck(D.getElementById("q-body").innerHTML.indexOf(correcta) === -1,
   "A · la respuesta correcta no está en el DOM mientras está tapada");

// ── B) destapar muestra dorso, explicación y los 3 grados ──────────────
click(D,w,"#card-reveal");
ck(!!D.querySelector(".card-back"), "B · al destapar aparece el dorso");
ck(D.querySelector(".card-back").textContent.trim() === correcta.trim(), "B · el dorso es exactamente la opción correcta");
ck(D.querySelectorAll(".fc-grade").length===3, "B · tres grados de autocalificación");
ck(!q0.explicacion || !!D.querySelector(".card-expl"), "B · la explicación se muestra al destapar");

// ── C) calificar alimenta a los dos sistemas y avanza ──────────────────
const antes = s.current;
click(D, w, '.fc-grade[data-g="si"]');
ck(s.responses[antes] && s.responses[antes].correct === true, "C · «La sabía» cuenta como acierto");
ck(s.responses[antes].card === true && s.responses[antes].grade === "si", "C · la respuesta queda marcada como tarjeta");
ck(O.PROGRESS.answers[q0.id] && O.PROGRESS.answers[q0.id].correcta === true, "C · queda registrada en el progreso legado");
ck(s.current === antes+1, "C · calificar avanza a la siguiente");

function calificar(g){
  const i = s.current, q = s.questions[i];
  if(D.getElementById("card-reveal")) click(D,w,"#card-reveal");
  if(!D.querySelector('.fc-grade[data-g="'+g+'"]')) return null;
  click(D, w, '.fc-grade[data-g="'+g+'"]');
  return { i, q, r:s.responses[i] };
}
let r = calificar("dificil");
if(r) ck(r.r.correct === true, "C · «Me costó» cuenta como acierto (igual que en flashcards)");
r = calificar("no");
if(r) ck(r.r.correct === false && O.PROGRESS.answers[r.q.id].correcta === false,
         "C · «No me salía» cuenta como fallo, en sesión y en progreso");

// ── D) volver atrás enseña el veredicto, no vuelve a preguntar ─────────
{
  const iAnt = s.current;
  click(D,w,"#q-prev");
  ck(s.current === iAnt-1, "D · se puede volver a la anterior");
  if(s.responses[s.current] && convertible(s.questions[s.current])){
    ck(!!D.querySelector(".card-verdict"), "D · una ya calificada muestra el veredicto que diste");
    ck(D.querySelectorAll(".fc-grade").length===0, "D · y no deja recalificarla sin querer");
  }
  click(D,w,"#q-next");
}

// ── E) las NO convertibles siguen siendo test en la misma sesión ───────
{
  const s2 = sesionAtajos(60);
  let vistoTest = false, vistoTarjeta = false;
  for(let i=0; i<s2.questions.length && !(vistoTest && vistoTarjeta); i++){
    s2.current = i; goto(D,w,"running");
    const q = s2.questions[i];
    if(convertible(q)){ if(D.getElementById("card-reveal")) vistoTarjeta = true; }
    else if(D.querySelectorAll("#q-body .tf-btn, #q-body .option").length > 0) vistoTest = true;
  }
  ck(vistoTarjeta, "E · las de opción única se juegan como tarjeta");
  ck(vistoTest, "E · las V/F y negativas siguen jugándose como test, sin salir de la sesión");
}

// ── F) el EXAMEN de atajos sigue siendo un test ────────────────────────
{
  const s3 = O.buildSession({ mode:"exam", source:"all", section:"all", topic:"all", tema:"all",
    tipo:"opcion_unica", categoria:"atajo", count:5, qOrder:"aleatorio", shuffleOptions:true, minutes:10 });
  O.setSession(s3); O.saveSessionSnapshot(); goto(D,w,"running");
  ck(!D.getElementById("card-reveal"), "F · en examen NO se tapa: un examen es un test");
  ck(D.querySelectorAll("#q-body .option").length===4, "F · en examen salen las 4 opciones");
}

// ── G) una sesión que no es de atajos no se ve afectada ────────────────
{
  const s4 = O.buildSession({ mode:"practice", source:"all", section:"all", topic:"all", tema:"all",
    tipo:"opcion_unica", categoria:"ruta", count:5, qOrder:"aleatorio", shuffleOptions:true, minutes:null });
  O.setSession(s4); O.saveSessionSnapshot(); goto(D,w,"running");
  ck(!D.getElementById("card-reveal"), "G · practicar rutas sigue siendo test de opciones");
  ck(D.querySelectorAll("#q-body .option").length===4, "G · con sus 4 opciones");
}

// ── H) el resumen final cuenta las tarjetas como respuestas ────────────
{
  // Sesión con ids FIJOS y convertibles: `buildSession` sortea con semilla
  // aleatoria y puede colar una negativa, que por diseño se juega como test y
  // no tiene botones de grado. Elegir a suerte hacía este paso inestable.
  const ids = O.QUESTIONS.filter(q=> q.categoria==="atajo" && convertible(q)).slice(0,3).map(q=>q.id);
  const s5 = O.buildSessionFromIds(ids, { mode:"practice", source:"all", section:"all", topic:"all",
    tema:"all", tipo:"all", categoria:"atajo", count:3, qOrder:"aleatorio", shuffleOptions:true, minutes:null });
  O.setSession(s5); O.saveSessionSnapshot(); goto(D,w,"running");
  ck(s5.questions.length === 3 && s5.questions.every(convertible),
     "H · sesión de 3 atajos, los tres convertibles en tarjeta");
  for(let n=0; n<3; n++){
    if(O.Nav.view !== "running") break;
    if(D.getElementById("card-reveal")) click(D,w,"#card-reveal");
    if(!click(D, w, '.fc-grade[data-g="si"]')) break;
  }
  const res = O.summarizeSession(s5);
  ck(res.answered === 3 && res.correct === 3, `H · el resumen cuenta las 3 tarjetas calificadas (${res.correct}/${res.answered} de ${res.total})`);
}

ck(errs.length===0, "sin errores de página durante todo el recorrido");
console.log(`\n${pass} OK · ${fail} fallos`);
process.exit(fail ? 1 : 0);
