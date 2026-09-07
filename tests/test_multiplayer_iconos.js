/* Preguntas CON IMAGEN en multijugador.
   Hasta sep-2026 los tableros de Duelo y "Contra Word" excluían a propósito
   `q.imagen` porque ningún render de multijugador pintaba el icono. Ahora sí
   se pinta (mpQuestionImage) y la imagen viaja dentro de config.qPayload.

   Este test cubre las dos capas:
     A) MOTOR (multiplayer.js, sin UI, con MP.createMockPair)
        - el pool acepta preguntas con imagen y `conImagen:true` las aísla
        - la imagen viaja por VALOR en config.qPayload (el invitado no
          depende de tener la pregunta en su banco)
        - Contra Word convierte una pregunta de icono con la rama `opt`
     B) UI (views.js en jsdom): se conduce el asistente del HOST por el DOM
        con el transporte mock, el invitado va headless, y se comprueba que
        la ronda y el repaso final pintan <img> del icono.

   node tests/test_multiplayer_iconos.js
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function read(name){ return fs.readFileSync(path.join(ROOT, name), "utf-8"); }
function waitFor(pred, ms, what){
  return new Promise((res, rej)=>{
    const t0 = Date.now();
    const iv = setInterval(()=>{
      let ok=false; try{ ok = pred(); }catch(e){}
      if(ok){ clearInterval(iv); res(); }
      else if(Date.now()-t0 > (ms||4000)){ clearInterval(iv); rej(new Error("timeout: "+(what||"condición"))); }
    }, 15);
  });
}

let failures = 0;
function ok(cond, msg){ if(cond) console.log("OK: "+msg); else { failures++; console.error("FALLO: "+msg); } }

function boot(withViews){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  const errs = [];
  w.addEventListener("error", e=> errs.push(String(e.message)));
  w.scrollTo = ()=>{};                    // jsdom no lo implementa
  ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js",
   "content-overrides.js","github-sync.js","engine.js","engine-bridge.js",
   "peerjs.min.js","multiplayer.js"].forEach(f=> w.eval(read(f)));
  if(withViews) w.eval(read("views.js"));
  return { w, D:w.document, O:w.OPE, MP:w.OPE_MP, errs };
}

async function main(){

/* ═══════════════ A) MOTOR ═══════════════ */
{
  const { O, MP } = boot(false);
  const nImg = O.filterQuestions({ conImagen:true }).length;
  ok(nImg > 0, `el banco tiene ${nImg} preguntas con imagen`);

  // ---- Duelo con "Solo iconos" ----
  const pair = MP.createMockPair();
  const hS = MP.createSession(pair.a), gS = MP.createSession(pair.b);
  const hG = MP.createDuelGame(hS), gG = MP.createDuelGame(gS);
  let hSt=null, gSt=null, hPh=null, gPh=null;
  hG.setHandlers({ onConnState:s=>{hSt=s;}, onPhase:p=>{hPh=p;} });
  gG.setHandlers({ onConnState:s=>{gSt=s;}, onPhase:p=>{gPh=p;} });
  hS.hostCreateRoom("H");
  await waitFor(()=> hSt==="waiting_rival", 3000, "sala creada");
  gS.guestJoinRoom(hS.getRoomCode(), "G");
  await waitFor(()=> hSt==="ready" && gSt==="ready", 4000, "handshake");

  hG.hostSetConfig({ rounds:6, seconds:15, section:"all", topic:"all", tipo:"all",
                     categoria:"all", conImagen:true, raceMode:false });
  await waitFor(()=> hPh==="lobby_ready" && gPh==="lobby_ready", 3000, "lobby_ready");

  const hQ = hG.getState().questions, gQ = gG.getState().questions;
  ok(hQ.length === 6, `Duelo "Solo iconos": tablero de ${hQ.length} rondas (esperadas 6)`);
  ok(hQ.length > 0 && hQ.every(q=> !!q.imagen), "Duelo: TODAS las preguntas del tablero llevan imagen");
  ok(hQ.every(q=> q.tipo !== "relleno" && !q.creado), "Duelo: se siguen excluyendo relleno y contenido propio");

  const payload = hG.getState().config.qPayload;
  ok(Array.isArray(payload) && payload.every(q=> typeof q.imagen === "string" && q.imagen.startsWith("data:image")),
     "Duelo: la imagen viaja por VALOR dentro de config.qPayload");
  ok(JSON.stringify(hQ.map(q=>q.id)) === JSON.stringify(gQ.map(q=>q.id)),
     "Duelo: el invitado recibe el MISMO tablero que el host");
  ok(gQ.every(q=> !!q.imagen), "Duelo: el invitado también recibe la imagen (no depende de su banco)");
  hS.destroy(); gS.destroy();

  // ---- Contra Word con "Solo iconos" ----
  const p2 = MP.createMockPair();
  const hS2 = MP.createSession(p2.a), gS2 = MP.createSession(p2.b);
  const hC = MP.createCoopGame(hS2), gC = MP.createCoopGame(gS2);
  let hSt2=null, gSt2=null, hPh2=null, gPh2=null;
  hC.setHandlers({ onConnState:s=>{hSt2=s;}, onPhase:p=>{hPh2=p;} });
  gC.setHandlers({ onConnState:s=>{gSt2=s;}, onPhase:p=>{gPh2=p;} });
  hS2.hostCreateRoom("H2");
  await waitFor(()=> hSt2==="waiting_rival", 3000, "sala coop");
  gS2.guestJoinRoom(hS2.getRoomCode(), "G2");
  await waitFor(()=> hSt2==="ready" && gSt2==="ready", 4000, "handshake coop");

  hC.hostSetConfig({ rounds:6, seconds:20, section:"all", topic:"all", tipo:"all",
                     categoria:"all", conImagen:true });
  await waitFor(()=> hPh2==="lobby_ready" && gPh2==="lobby_ready", 3000, "lobby_ready coop");

  const cQ = hC.getState().questions;
  const plan = hC.getState().config.wordPlan;
  ok(cQ.length > 0 && cQ.every(q=> !!q.imagen), "Contra Word: todas las preguntas del tablero llevan imagen");
  ok(Array.isArray(plan) && plan.length === cQ.length, "Contra Word: hay un plan de Word por ronda");
  ok(plan.every(p=> p.kind === "opt"), "Contra Word: las preguntas de icono usan la rama 'opt' (son opción única)");
  ok(plan.every(p=> typeof p.claim === "string" && p.claim.length > 0),
     "Contra Word: cada afirmación tiene un texto de opción concreto (no queda vacía)");
  ok(plan.every((p,i)=>{
      const q = cQ[i];
      const correcta = (q.opciones||[]).find(o=> o.letter === q.respuesta);
      return p.truth === (!!correcta && p.claim === correcta.text);
    }), "Contra Word: `truth` cuadra con si el claim es la opción correcta");
  ok(JSON.stringify(gC.getState().config.wordPlan) === JSON.stringify(plan),
     "Contra Word: el invitado recibe el mismo plan de Word");
  hS2.destroy(); gS2.destroy();

  // ---- sin conImagen se sigue pudiendo jugar de todo (no hay regresión) ----
  const p3 = MP.createMockPair();
  const hS3 = MP.createSession(p3.a), gS3 = MP.createSession(p3.b);
  const hG3 = MP.createDuelGame(hS3), gG3 = MP.createDuelGame(gS3);
  let a3=null,b3=null,ph3=null,ph3g=null;
  hG3.setHandlers({ onConnState:s=>{a3=s;}, onPhase:p=>{ph3=p;} });
  gG3.setHandlers({ onConnState:s=>{b3=s;}, onPhase:p=>{ph3g=p;} });
  hS3.hostCreateRoom("H3");
  await waitFor(()=> a3==="waiting_rival", 3000, "sala mixta");
  gS3.guestJoinRoom(hS3.getRoomCode(), "G3");
  await waitFor(()=> a3==="ready" && b3==="ready", 4000, "handshake mixto");
  hG3.hostSetConfig({ rounds:12, seconds:10, section:"all", topic:"all", tipo:"all", categoria:"all", raceMode:false });
  await waitFor(()=> ph3==="lobby_ready" && ph3g==="lobby_ready", 3000, "lobby mixto");
  ok(hG3.getState().questions.length === 12, "sin 'Solo iconos' el tablero mixto sigue armándose igual");
  hS3.destroy(); gS3.destroy();
}

/* ═══════════════ B) UI ═══════════════ */
{
  const { w, D, O, MP, errs } = boot(true);
  // views.js arranca en DOMContentLoaded (init() → go("home")). jsdom lo
  // dispara en el siguiente tick: hay que esperarlo ANTES de conducir la UI,
  // o el init tardío devuelve la vista a Inicio a mitad del recorrido.
  await waitFor(()=> O.Nav.view === "home", 4000, "init() de views.js");

  // El HOST usa la UI real; el invitado es un motor headless al otro extremo
  // del mismo par mock. `makeTransport` se sustituye para que mpStartAsHost()
  // coja el extremo A (jsdom no tiene WebRTC — ver CLAUDE.md).
  const pair = MP.createMockPair();
  MP.makeTransport = ()=> pair.a;

  function goto(v){ const b=D.createElement("button"); b.setAttribute("data-goto",v);
    D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); }
  function click(sel){ const el = typeof sel==="string" ? D.querySelector(sel) : sel;
    if(!el) return false; el.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); return true; }
  function setVal(sel, val){ const el=D.querySelector(sel); if(!el) return false;
    el.value = val; el.dispatchEvent(new w.Event("input",{bubbles:true}));
    el.dispatchEvent(new w.Event("change",{bubbles:true})); return true; }

  goto("mp-setup");
  ok(!!D.querySelector('[data-role="host"]'), "UI: asistente de multijugador abierto");
  click('[data-role="host"]');
  setVal("#mp-name", "Yo");
  ok(!!D.querySelector('[data-mode="duelo"]'), "UI: se puede elegir el modo Duelo");
  click('[data-mode="duelo"]');

  const scopeSel = D.querySelector("#mp-scope");
  ok(!!scopeSel && Array.from(scopeSel.options).some(o=> o.value === "imagen"),
     "UI: el selector de Contenido ofrece «Solo iconos (con imagen)»");
  setVal("#mp-scope", "imagen");
  const tipoSel = D.querySelector("#mp-tipo");
  ok(tipoSel && tipoSel.disabled && tipoSel.value === "all",
     "UI: con «Solo iconos» el tipo de ejercicio se fuerza a Todos y se deshabilita");

  // rondas cortas para terminar rápido
  setVal("#mp-rounds", "2");
  click("#mp-create-room");

  // invitado headless
  await waitFor(()=> !!(w.OPE_MP_DEBUG || true) && D.querySelector(".code-display, .room-code, #mp-lobby-code, .view"), 3000, "lobby host");
  const gS = MP.createSession(pair.b);
  const gG = MP.createDuelGame(gS);
  let gPhase = null, gState = null;
  gG.setHandlers({ onConnState:s=>{gState=s;}, onPhase:p=>{gPhase=p;} });
  gS.guestJoinRoom("MOCK1", "Rival");
  await waitFor(()=> gState === "ready", 5000, "invitado conectado");
  await waitFor(()=> gPhase === "lobby_ready", 5000, "config recibida por el invitado");

  const board = gG.getState().questions;
  ok(board.length === 2 && board.every(q=> !!q.imagen),
     "UI→motor: la partida creada desde el asistente es de solo iconos");

  // ambos listos → ronda. El host pulsa "Estoy listo" en su lobby real.
  await waitFor(()=> !!D.querySelector("#mp-im-ready"), 5000, "lobby del host con botón de listo");
  ok(!D.querySelector("#mp-im-ready").disabled, "UI: el lobby del host tiene preguntas (botón «Estoy listo» activo)");
  gG.confirmReady();
  click("#mp-im-ready");
  await waitFor(()=> gPhase === "round" || gPhase === "countdown", 6000, "arranque de ronda");
  await waitFor(()=> gPhase === "round", 9000, "ronda en juego");
  // el host arranca con 3 s de cuenta atrás antes de pintar el tablero
  await waitFor(()=> !!D.querySelector("#mp-qcard"), 9000, "tablero del host pintado");
  await waitFor(()=> !!D.querySelector("#mp-qcard .q-image img"), 6000, "icono en la ronda del host");
  const img = D.querySelector("#mp-qcard .q-image img");
  ok(!!img && String(img.getAttribute("src")).startsWith("data:image"),
     "UI: la ronda de Duelo pinta el icono de la pregunta");
  ok(!D.querySelector("#mp-qcard .q-image img[data-imgref]"),
     "UI: en partida el visor es de solo lectura (sin data-imgref → no se puede recortar)");

  // ---- jugar las 2 rondas hasta el final y comprobar el repaso ----
  for(let r = 0; r < board.length; r++){
    await waitFor(()=> gPhase === "round", 9000, "ronda "+(r+1));
    const q = gG.getState().questions[r];
    // el host responde por DOM (opción correcta) y el invitado por motor
    await waitFor(()=> !!D.querySelector("#mp-q-body .option"), 6000, "opciones del host");
    const btn = Array.from(D.querySelectorAll("#mp-q-body .option"))
      .find(b=> b.getAttribute("data-letter") === q.respuesta) || D.querySelector("#mp-q-body .option");
    click(btn);
    gG.submitAnswer(q.respuesta);
    await waitFor(()=> gPhase === "round_end" || gPhase === "finished", 8000, "fin de ronda "+(r+1));
    if(r === 0){
      ok(!!D.querySelector(".round-end-panel .q-image img"),
         "UI: el panel de fin de ronda del Duelo repite el icono");
    }
    // el host avanza solo 2,2 s después de ver el resultado (views.js)
    if(gPhase === "round_end" && r < board.length-1){
      await waitFor(()=> gPhase === "round" || gPhase === "finished", 9000, "avance de ronda");
    }
  }
  await waitFor(()=> gPhase === "finished", 12000, "partida terminada");
  await waitFor(()=> !!D.querySelector(".mp-review"), 8000, "repaso final del host");
  ok(!!D.querySelector(".mp-review .q-image img"),
     "UI: el repaso final del Duelo también muestra el icono de cada pregunta");

  ok(errs.length === 0, "UI: sin errores de JS durante la partida ("+errs.length+")");
  gS.destroy();
}

console.log(failures ? `\n${failures} fallo(s)` : "\nTODO OK");
process.exit(failures ? 1 : 0);
}

main().catch(e=>{ console.error("ERROR:", e && e.message); process.exit(1); });
