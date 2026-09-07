/* ============================================================
   OPE365 · QA de integración motor↔UI (jsdom)
   Recorre los flujos A–X del brief de la Fase 2: carga, navegación,
   configuración de práctica, responder (correcta/incorrecta →
   evento en el motor), flashcard (flip + valoración → evento),
   progreso, asentado+atrasado, fecha de examen, persistencia,
   recarga y compatibilidad con datos de versiones anteriores.
     node tests/test_ui_integration.js   → exit 0/1
============================================================ */
const fs=require("fs"),{JSDOM}=require("jsdom");
const SCRIPTS=["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];
function boot(storage){
  const dom=new JSDOM(fs.readFileSync("tests/fixture.html","utf8"),{runScripts:"dangerously",url:"http://localhost/",
    beforeParse(w){ if(storage) w.localStorage.setItem("ope365_v1", storage); }});
  const w=dom.window; const errs=[];
  w.addEventListener("error",e=>errs.push(String(e.error&&e.error.stack||e.message)));
  const origErr=console.error;
  SCRIPTS.forEach(f=>{try{w.eval(fs.readFileSync(f,"utf8"))}catch(e){errs.push(f+": "+e.message)}});
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  return {w, D:w.document, O:w.OPE, errs};
}
function goto(D,w,v,p){const b=D.createElement("button");b.setAttribute("data-goto",v);if(p)b.dataset.params=JSON.stringify(p);D.body.appendChild(b);b.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));b.remove();}
function click(D,w,sel){const el=typeof sel==="string"?D.querySelector(sel):sel; if(el){el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));return true;} return false;}
let pass=0,fail=0;
function ck(c,m){ if(c){pass++;console.log("  OK  "+m);} else {fail++;console.error("  XX  "+m);} }

// ===== A) carga inicial =====
let {w,D,O,errs}=boot();
ck(errs.length===0, "A · carga inicial sin errores ("+errs.length+")");
ck(!!O.LEB, "A · LEB presente");
ck(O.QUESTIONS.length>=1342 && O.FLASHCARDS.length>=407, `A · ${O.QUESTIONS.length} preguntas / ${O.FLASHCARDS.length} flashcards`);

// ===== B) navegación =====
["home","temario","practica","flashcards","iconos","progress"].forEach(v=>{ goto(D,w,v); ck(!D.querySelector(".error")&&errs.length===0, "B · nav "+v); });

// ===== B2) Iconos: hub y sesión de solo preguntas con imagen =====
goto(D,w,"iconos");
ck(!!D.getElementById("ic-start"), "B2 · Iconos: hub con botón Empezar");
{
  const big = D.querySelector(".test-preview .big");
  const nImg = O.filterQuestions({conImagen:true}).length;
  ck(big && Number(big.textContent) === nImg, `B2 · Iconos: contador = ${nImg} preguntas con imagen`);
  click(D,w,"#ic-start");
  const started = O.Nav.view==="running";
  ck(started, "B2 · Iconos: «Empezar» arranca la sesión");
  if(started){
    const s0 = O.getSession();
    ck(s0 && s0.questions.length>0 && s0.questions.every(q=>!!q.imagen), "B2 · Iconos: la sesión son solo preguntas con imagen");
    ck(!!D.querySelector(".q-image img"), "B2 · Iconos: el runner pinta la imagen del ejercicio");

    // B3 · compartir un test de iconos: el código lleva conImagen y la
    // sesión se reconstruye con las imágenes intactas (se resuelven del
    // banco local por id — las data URI NO viajan en el código).
    w.TextEncoder = w.TextEncoder || global.TextEncoder;   // jsdom no lo expone; los navegadores sí
    w.TextDecoder = w.TextDecoder || global.TextDecoder;
    const code = O.shareCodeForSession(s0);
    const parsed = O.parseShareCode(code);
    ck(!!parsed && parsed.type === "T" && parsed.payload.cfg.conImagen === true,
       "B3 · el código de test compartido conserva conImagen");
    const rec = parsed ? O.sessionFromTestPayload(parsed.payload) : null;
    ck(rec && rec.session && rec.session.questions.length === s0.questions.length
       && rec.session.questions.every(q=>!!q.imagen),
       "B3 · el test compartido se reconstruye con todas las imágenes");
    ck(code.length < 2000, `B3 · el código sigue siendo compacto (${code.length} chars: las imágenes no viajan en él)`);

    O.setSession(null); O.saveSessionSnapshot();
  }
}

// ===== C) inicio =====
goto(D,w,"home");
ck(!!D.querySelector(".cta-hero"), "C · Inicio: CTA principal");

// ===== D) temario =====
goto(D,w,"temario");
ck(D.querySelectorAll('.tm-acc').length===10, "D · Temario: 10 pestañas");
goto(D,w,"temario-detalle",{sectionId:"inicio"});
ck(D.querySelectorAll(".nav-row[data-topic]").length>0, "D · detalle Inicio con bloques");

// ===== E) configurar práctica =====
goto(D,w,"practica");
ck(!!D.getElementById("in-tema"), "E · Práctica: elección de intención");
click(D,w,"#in-tema");
click(D,w,'[data-scope="tema"]');
ck(!!D.getElementById("wiz-section"), "E · asistente: selector de pestaña");
D.getElementById("wiz-section").value="inicio"; D.getElementById("wiz-section").dispatchEvent(new w.Event("change"));
click(D,w,"#wiz-next"); // paso 2
click(D,w,'#wiz-count-pills .seg[data-c="10"]');
click(D,w,"#wiz-next"); // preview
ck(!!D.querySelector(".test-preview .big"), "E · preview con recuento");
click(D,w,"#wiz-start");
ck(O.Nav.view==="running", "E · arranca la sesión");

// ===== F/G/H/I/M) pregunta, correcta, incorrecta, explicación, siguiente =====
let s=O.getSession();
let answeredWrong=false, answeredRight=false, expandedFb=false;
for(let k=0;k<10;k++){
  const q=s.questions[s.current];
  const before=(O.PROGRESS.events||[]).length;
  // responder: elegir la correcta a propósito una vez, la incorrecta otra
  if(q.tipo==="opcion_unica"){
    const wantWrong = !answeredWrong;
    const target=[...D.querySelectorAll(".option")].find(o=> wantWrong ? o.dataset.letter!==q.respuesta : o.dataset.letter===q.respuesta) || D.querySelector(".option");
    click(D,w,target);
  } else if(q.tipo==="verdadero_falso"){ click(D,w,".tf-btn"); }
  else if(q.tipo==="seleccion_multiple"){ click(D,w,".option"); click(D,w,"#multi-check"); }
  else if(q.tipo==="emparejamiento"){ /* skip interact */ }
  else if(q.tipo==="relleno"){ D.querySelectorAll("[data-blank]").forEach(i=>{i.value="x";i.dispatchEvent(new w.Event("input"));}); click(D,w,"#blank-check"); }
  const resp=s.responses[s.current];
  if(resp){ if(resp.correct) answeredRight=true; else answeredWrong=true; }
  const evAfter=(O.PROGRESS.events||[]).length;
  if(evAfter>before) { /* engine got it */ }
  const more=D.querySelector(".fb-more");
  if(more){ more.open=true; expandedFb=true; }
  click(D,w,"#q-next");
  s=O.getSession(); if(!s || O.Nav.view!=="running") break;
}
ck(answeredRight, "G · respuesta correcta registrada");
ck(answeredWrong, "H · respuesta incorrecta registrada");
ck((O.PROGRESS.events||[]).some(e=>e.kind==="q"), "Q · responder alimenta el motor (evento kind:q)");
ck(Object.keys(O.PROGRESS.concepts||{}).length>0, "Q · el motor actualiza conceptos");

// ===== N/O/P) flashcard: flip + valoración =====
goto(D,w,"flashcards");
click(D,w,'.segmented .seg[data-tab="todas"]');
click(D,w,".qlist-item");
ck(!!D.getElementById("fc-card"), "N · flashcard en pantalla");
click(D,w,"#fc-card");
ck(D.getElementById("fc-card").classList.contains("flipped"), "O · la tarjeta gira");
const fcEvBefore=(O.PROGRESS.events||[]).filter(e=>e.kind==="fc").length;
click(D,w,"#fc-hard");
ck((O.PROGRESS.events||[]).filter(e=>e.kind==="fc").length===fcEvBefore+1, "P · 'Con dificultad' genera evento fc en el motor");

// ===== R/S/T) progreso, atrasado, asentado+atrasado =====
goto(D,w,"progress");
ck(!!D.querySelector(".dim-list") || !!D.querySelector(".empty-panel"), "R · Progreso renderiza");
// forzar un concepto a asentado+atrasado y comprobar overview
// (excluye conceptos ya tocados por pasos anteriores del test -p.ej. la
// flashcard de P puede caer en el primero de la taxonomía- para no
// contaminar el estado antes de forzarlo aquí)
const cid=O.LE.CONCEPTS.find(c=>c.framings.length>=2 && !O.PROGRESS.concepts[c.id]).id;
const t0=Date.UTC(2026,0,5);
[0,4,11].forEach((d,i)=>O.LE.recordEvent({kind:"q",ref:O.LE.CONCEPT_BY_ID[cid].questionIds[0],concept:cid,framing:["conceptual","ruta","caso"][i],grade:"good",correct:true,ms:1500,ts:t0+d*86400000}));
O.LE.recalc(t0+100*86400000);
const st=O.PROGRESS.concepts[cid];
ck(st.masteryStatus==="asentado" && st.reviewState==="atrasado", "T · 'asentado + atrasado' es un estado real ("+st.masteryStatus+"/"+st.reviewState+")");

// ===== U) fecha de examen =====
O.LEB.setPlan({examDate:Date.now()+45*86400000, minutesPerDay:25});
goto(D,w,"progress");
ck(!!D.querySelector(".exam-strip"), "U · con fecha aparece la tira de preparación de examen");
const hm=O.LEB.homeModel();
ck(hm.exam && typeof hm.exam.deficitCount==="number", "U · homeModel expone déficits reales del motor");

// ===== V/W) persistencia + recarga =====
O.persist();
const saved=w.localStorage.getItem("ope365_v1");
const parsed=JSON.parse(saved);
ck("concepts" in parsed && "events" in parsed && "plan" in parsed && parsed.plan.examDate, "V · persistencia incluye motor + plan");
let r2=boot(saved);
ck(r2.errs.length===0, "W · recarga con datos guardados sin errores");
ck(Object.keys(r2.O.PROGRESS.concepts).length>0 && r2.O.PROGRESS.plan.examDate, "W · el estado del motor sobrevive a la recarga");
r2.w.document; goto(r2.D,r2.w,"home");
ck(!!r2.D.querySelector(".learn-panel") || !!r2.D.querySelector(".cta-hero"), "W · Inicio se pinta con el estado recargado");

// ===== X) datos de versión ANTERIOR (sin claves del motor) =====
const legacy=JSON.stringify({answers:{"inicio-1":{tipo:"opcion_unica",correcta:true,seleccion:"A",intentos:1,ultimaVez:Date.now()-9e7}},marked:{},history:[{mode:"practice",finishedAt:Date.now()-9e7,total:3,correct:2,accuracy:67}],settings:{onboarded:true},currentSession:null,challenges:{},flashcards:{"inicio:F-01":{dominada:true,vecesVista:1,ultimaVez:Date.now()-9e7}}});
let r3=boot(legacy);
ck(r3.errs.length===0, "X · datos antiguos cargan sin errores");
goto(r3.D,r3.w,"home"); goto(r3.D,r3.w,"progress"); goto(r3.D,r3.w,"temario");
ck(r3.errs.length===0, "X · navegación con datos antiguos sin errores");
ck(Object.keys(r3.O.PROGRESS.answers).length===1 && r3.O.PROGRESS.history.length===1, "X · answers/history antiguos intactos");

console.log(`\n${pass} OK · ${fail} fallo(s)`);
process.exit(fail?1:0);
