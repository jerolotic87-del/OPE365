/* ============================================================
   OPE365 · Saltos de línea al editar una pregunta (jsdom)

   Bug real: al reescribir un enunciado desde el ✎ y pulsar Intro o
   Mayús+Intro, el salto se guardaba —`readQPatch` hace `.value.trim()`,
   que solo recorta los extremos— pero NO se veía al volver a la
   pregunta. Dos causas distintas:
     · el enunciado se mete en HTML, donde los saltos colapsan a espacio;
     · `cleanExplic` hacía `\s{2,} → " "`, y \n es whitespace, así que la
       explicación perdía los saltos antes siquiera de llegar al HTML.

   Falla con el código anterior.
     node tests/test_saltos_linea.js   → exit 0/1
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
function escribir(w, el, valor){ el.value = valor; el.dispatchEvent(new w.Event("input",{bubbles:true})); el.dispatchEvent(new w.Event("change",{bubbles:true})); }
let pass=0, fail=0;
const ck=(c,m)=>{ if(c){pass++;console.log("  OK  "+m);} else {fail++;console.error("  XX  "+m);} };

const { w, D, O, errs } = boot();
ck(errs.length===0, "carga sin errores ("+errs.join(" | ")+")");

// ── A) el enunciado conserva los saltos al pintarse ──────────────────
{
  const dos   = O.renderBlank("Primera línea.\nSegunda línea.");
  const parr  = O.renderBlank("Un párrafo.\n\nOtro párrafo.");
  ck(/Primera línea\.<br>Segunda línea\./.test(dos), "A · un salto simple se pinta como <br>");
  ck((parr.match(/<br>/g)||[]).length === 2, "A · un salto de párrafo deja dos <br>, o sea una línea en blanco");
  ck(O.renderBlank("Sin saltos") === "Sin saltos", "A · un texto sin saltos no cambia");
}

// El <br> se añade DESPUÉS de escapar: no puede colarse marcado del usuario.
{
  const malicioso = O.renderBlank("<img src=x onerror=alert(1)>\nsegunda");
  ck(!/<img/.test(malicioso) && /&lt;img/.test(malicioso), "A · el texto sigue escapado: el <br> no abre una vía de inyección");
  ck(/<br>/.test(malicioso), "A · y aun así el salto se respeta");
}

// Los huecos [1] de las preguntas de relleno siguen funcionando.
ck(/class="blank"/.test(O.renderBlank("Escribe aquí: ______")), "A · los huecos ___ se siguen pintando");

// ── B) de punta a punta: editar y ver el resultado ───────────────────
{
  const q = O.QUESTIONS.find(x=> x.tipo==="opcion_unica" && !x.imagen);
  const conSalto = "Primera línea del enunciado.\n\nSegunda línea, tras un salto.";
  O.ContentEdit.apply("q", q.id, { enunciado: conSalto });

  ck(O.Q_BY_ID[q.id].enunciado === conSalto, "B · la corrección guarda el salto tal cual en el dato");

  const s = O.buildSessionFromIds([q.id], { mode:"practice", shuffleOptions:false });
  O.setSession(s); O.saveSessionSnapshot(); goto(D,w,"running");
  const h3 = D.querySelector("#runner-qcard h3");
  ck(!!h3 && h3.querySelectorAll("br").length === 2,
     `B · al estudiarla se ven los dos <br> (${h3 ? h3.querySelectorAll("br").length : "sin h3"})`);
  ck(h3 && /Segunda línea/.test(h3.textContent), "B · y el texto completo sigue ahí");

  O.ContentEdit.revert("q", q.id);
}

// ── C) las listas NO se rompen: ahí el salto se aplana ───────────────
{
  // El buscador del editor filtra por SUBCADENA de id, así que «archivo-1»
  // casa también con archivo-10 y archivo-100: hay que elegir un id que no
  // sea subcadena de ningún otro y localizar su fila por data-qid.
  const q = O.QUESTIONS.slice().reverse().find(x=>
    x.tipo==="opcion_unica" && !x.imagen &&
    O.QUESTIONS.filter(o=> o.id.includes(x.id)).length === 1);
  ck(!!q, `C · hay un id no ambiguo para la prueba (${q ? q.id : "ninguno"})`);
  O.ContentEdit.apply("q", q.id, { enunciado: "Línea uno.\nLínea dos." });
  O.GHS.setCfg({ owner:"test", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  goto(D,w,"banco");
  // Se filtra por PESTAÑA, no por el buscador: aquel tiene un antirrebote de
  // 180 ms y este test es síncrono. El selector de sección refresca al vuelo.
  const selSec = D.getElementById("bk-section");
  if(selSec) escribir(w, selSec, q.section);
  const fila = D.querySelector(`#bk-body .qlist-item[data-qid="${q.id}"] .qtext`);
  ck(!!fila, "C · su fila aparece en el Editor del banco");
  if(fila){
    ck(fila.querySelectorAll("br").length === 0, "C · la fila de lista NO mete <br>: seguiría siendo de un renglón");
    ck(/Línea uno\. Línea dos\./.test(fila.textContent),
       `C · el salto se aplana a un espacio en la vista previa (${JSON.stringify(fila.textContent.slice(0,40))})`);
  }
  O.ContentEdit.revert("q", q.id);
}

// ── D) la explicación también conserva los saltos ────────────────────
{
  const q = O.QUESTIONS.find(x=> x.tipo==="opcion_unica" && !x.imagen);
  // Dos líneas en minúscula y SIN punto final: `splitExpl` ya partía por
  // frase, así que con puntos este paso pasaba también con el código
  // antiguo. Así lo único que puede separarlas es el salto de línea.
  O.ContentEdit.apply("q", q.id, { explicacion: "primer motivo escrito en minúscula y sin punto\nsegundo motivo igual de largo y también sin punto" });

  const s = O.buildSessionFromIds([q.id], { mode:"practice", shuffleOptions:false });
  O.setSession(s); O.saveSessionSnapshot(); goto(D,w,"running");
  click(D,w,"#q-body .option");            // responder para que salga el feedback
  const fb = D.getElementById("q-feedback");
  const items = fb ? fb.querySelectorAll(".expl-list li").length : 0;
  ck(items === 2, `D · una explicación de dos líneas sale como dos viñetas (${items})`);
  ck(fb && /segundo motivo/.test(fb.textContent), "D · con el texto de la segunda línea incluido");

  O.ContentEdit.revert("q", q.id);
}

ck(errs.length===0, "sin errores de página durante todo el recorrido");
console.log(`\n${pass} OK · ${fail} fallos`);
process.exit(fail ? 1 : 0);
