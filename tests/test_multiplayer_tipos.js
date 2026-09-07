/* Multijugador — TODOS los tipos de ejercicio deben poder responderse.
   Motivación: en una partida real, una pregunta de selección múltiple no
   dejaba marcar y la ronda se iba a TIMEOUT. Este test conduce la UI real
   del host (jsdom + transporte mock) una ronda por CADA tipo de ejercicio,
   en Duelo y en Contra Word, y comprueba:
     · que hay controles para responder
     · que al pulsarlos la respuesta QUEDA registrada (SUBMITTED, no TIMEOUT)
     · que el estado que se enseña coincide con lo que ha hecho el jugador
       (no decir "voto registrado" a quien no ha votado)
   node tests/test_multiplayer_tipos.js
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
function waitFor(pred, ms, what){
  return new Promise((res, rej)=>{
    const t0 = Date.now();
    const iv = setInterval(()=>{
      let v=false; try{ v = pred(); }catch(e){}
      if(v){ clearInterval(iv); res(); }
      else if(Date.now()-t0 > (ms||6000)){ clearInterval(iv); rej(new Error("timeout: "+(what||"?"))); }
    }, 15);
  });
}
let failures = 0;
const ok = (c,m)=>{ if(c) console.log("OK: "+m); else { failures++; console.error("FALLO: "+m); } };

function boot(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window; const errs = [];
  w.addEventListener("error", e=> errs.push(String(e.error && e.error.stack || e.message)));
  w.scrollTo = ()=>{};
  ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","content-overrides.js",
   "github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"]
    .forEach(f=> w.eval(read(f)));
  return { w, D:w.document, O:w.OPE, MP:w.OPE_MP, errs };
}

/* Conduce una partida de `modo` con preguntas de `tipo` y devuelve utilidades
   para operar sobre la ronda en curso desde la UI del HOST. */
async function startGame(opts){
  const { modo, tipo, rondas } = opts;
  const ctx = boot();
  const { w, D, O, MP } = ctx;
  await waitFor(()=> O.Nav.view === "home", 5000, "init de views.js");

  const pair = MP.createMockPair();
  MP.makeTransport = ()=> pair.a;

  const goto = v => { const b=D.createElement("button"); b.setAttribute("data-goto",v);
    D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); };
  const click = sel => { const el = typeof sel==="string" ? D.querySelector(sel) : sel;
    if(!el) return false; el.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); return true; };
  const setVal = (sel,v) => { const el=D.querySelector(sel); if(!el) return false; el.value=v;
    el.dispatchEvent(new w.Event("input",{bubbles:true})); el.dispatchEvent(new w.Event("change",{bubbles:true})); return true; };

  goto("mp-setup");
  click('[data-role="host"]');
  setVal("#mp-name", "Yo");
  click(`[data-mode="${modo}"]`);
  D.querySelectorAll("details.advanced").forEach(d=> d.open = true);
  if(modo === "coop"){
    click('[data-cp="personalizada"]');
    setVal("#mp-coop-rounds", String(rondas||1));
    setVal("#mp-coop-seconds", "90");
  } else {
    setVal("#mp-rounds", String(rondas||1));
    setVal("#mp-seconds", "90");
  }
  setVal("#mp-tipo", tipo);
  click("#mp-create-room");

  const gS = MP.createSession(pair.b);
  const gG = modo === "coop" ? MP.createCoopGame(gS) : MP.createDuelGame(gS);
  const g = { phase:null, extra:null };
  gG.setHandlers({ onPhase:(p,x)=>{ g.phase=p; g.extra=x; } });
  gS.guestJoinRoom("MOCK1", "Rival");
  await waitFor(()=> g.phase === "lobby_ready", 8000, "lobby_ready");

  await waitFor(()=> !!D.querySelector("#mp-im-ready"), 6000, "lobby del host");
  gG.confirmReady();
  click("#mp-im-ready");
  if(opts.stopAt === "countdown"){
    await waitFor(()=> !!D.querySelector("#mp-countdown-num"), 8000, "cuenta atrás");
    return { ...ctx, pair, gS, gG, g, goto, click, setVal };
  }
  await waitFor(()=> g.phase === "round", 12000, "ronda en juego");
  await waitFor(()=> !!D.querySelector("#mp-q-body, #mp-coop-body"), 12000, "cuerpo de respuesta");

  return { ...ctx, pair, gS, gG, g, goto, click, setVal,
           board: gG.getState().questions,
           hostState: ()=> w.OPE_MP_HOST_STATE };
}

async function main(){

/* ─────────── DUELO: un tipo por ronda, se responde desde la UI ─────────── */
for(const tipo of ["opcion_unica","verdadero_falso","seleccion_multiple","emparejamiento"]){
  let ctx;
  try{ ctx = await startGame({ modo:"duelo", tipo, rondas:1 }); }
  catch(e){ ok(false, `Duelo/${tipo}: no se llega a la ronda (${e.message})`); continue; }
  const { D, click, g, board } = ctx;
  const q = board[0];
  ok(q && q.tipo === tipo, `Duelo/${tipo}: la ronda es del tipo pedido`);

  const body = D.querySelector("#mp-q-body");
  const controles = body ? body.querySelectorAll(".option, .tf-btn, .match-item, input").length : 0;
  ok(controles > 0, `Duelo/${tipo}: hay controles para responder (${controles})`);

  // responder como lo haría una persona
  if(tipo === "opcion_unica"){
    click(body.querySelector(".option"));
  } else if(tipo === "verdadero_falso"){
    click(body.querySelector(".tf-btn"));
  } else if(tipo === "seleccion_multiple"){
    click(body.querySelector(".option"));                       // marcar una
    const conf = D.querySelector("#mp-multi-confirm");
    ok(!!conf, `Duelo/${tipo}: existe el botón «Confirmar respuesta»`);
    ok(!!conf && body.contains(conf), `Duelo/${tipo}: el botón de confirmar está dentro del cuerpo de la pregunta`);
    if(conf) click(conf);
  } else if(tipo === "emparejamiento"){
    const lefts = Array.from(body.querySelectorAll("[data-left]"));
    const rights = Array.from(body.querySelectorAll("[data-right]"));
    ok(lefts.length > 0 && rights.length > 0, `Duelo/${tipo}: hay columnas para emparejar`);
    for(const l of lefts){                                       // emparejar todo
      click(D.querySelector(`[data-left="${l.getAttribute("data-left")}"]`));
      const r = rights[0].getAttribute("data-right");
      click(D.querySelector(`[data-right="${r}"]`));
    }
    const conf = D.querySelector("#mp-match-confirm");
    ok(!!conf && !conf.disabled, `Duelo/${tipo}: «Confirmar respuesta» se habilita al completar los pares`);
    if(conf) click(conf);
  }

  let estado = null;
  try{
    await waitFor(()=>{ estado = ctx.gG.getState().rivalAnswerState; return !!estado; }, 4000, "respuesta registrada");
  }catch(e){}
  ok(estado === "SUBMITTED",
     `Duelo/${tipo}: la respuesta del host llega al rival como SUBMITTED (fue ${estado||"nada"})`);
  ctx.gS.destroy();
}

/* ─────────── CONTRA WORD: todos los tipos → siempre voto V/F ─────────── */
for(const tipo of ["opcion_unica","verdadero_falso","seleccion_multiple","emparejamiento"]){
  let ctx;
  try{ ctx = await startGame({ modo:"coop", tipo, rondas:1 }); }
  catch(e){ ok(false, `Contra Word/${tipo}: no se llega a la ronda (${e.message})`); continue; }
  const { D, click, gG, board } = ctx;
  ok(board[0] && board[0].tipo === tipo, `Contra Word/${tipo}: la ronda es del tipo pedido`);

  const votos = D.querySelectorAll("#mp-coop-body .coop-btn");
  ok(votos.length === 2, `Contra Word/${tipo}: se ofrecen los 2 botones de voto`);
  const claim = D.querySelector(".coop-card");
  ok(claim && claim.textContent.trim().length > 20,
     `Contra Word/${tipo}: la afirmación de Word tiene contenido`);

  // ANTES de votar, el estado no puede AFIRMAR que ya se ha votado
  // (sí puede decir "aún no has votado" — eso es justo lo que debe decir).
  const antes = (D.querySelector("#mp-selfstatus")||{}).textContent || "";
  ok(!/voto está registrado|voto registrado|habéis votado los dos/i.test(antes),
     `Contra Word/${tipo}: antes de votar NO dice que ya se votó (dice: ${JSON.stringify(antes.trim().slice(0,45))})`);
  ok(/aún no has votado/i.test(antes),
     `Contra Word/${tipo}: dice explícitamente que TÚ aún no has votado`);

  // El compañero vota primero: el mensaje debe dejar claro que a MÍ me falta,
  // y mis botones tienen que seguir vivos (bug real: parecía que ya votabas).
  gG.submitAnswer("V");
  await waitFor(()=> /compañero/i.test((D.querySelector("#mp-selfstatus")||{}).textContent||""),
                4000, "aviso de que el compañero ya votó").catch(()=>{});
  const tras = (D.querySelector("#mp-selfstatus")||{}).textContent || "";
  ok(/te falta votar a ti/i.test(tras),
     `Contra Word/${tipo}: tras votar el compañero, el mensaje dice que me falta a MÍ (dice: ${JSON.stringify(tras.trim().slice(0,50))})`);
  const vivos = Array.from(D.querySelectorAll("#mp-coop-body .coop-btn")).filter(b=> !b.disabled);
  ok(vivos.length === 2, `Contra Word/${tipo}: mis 2 botones siguen pulsables tras votar el compañero (${vivos.length})`);

  click(votos[0]);
  let st = null;
  try{ await waitFor(()=>{ st = gG.getState().rivalAnswerState; return !!st; }, 4000, "voto registrado"); }catch(e){}
  ok(st === "SUBMITTED", `Contra Word/${tipo}: el voto llega al compañero como SUBMITTED (fue ${st||"nada"})`);
  ctx.gS.destroy();
}

/* ─── Repintado a mitad de ronda: lo ya marcado NO se puede perder ───
   Bug real: la vista se repinta entera ante cualquier evento de conexión
   (`onConnState`) y el borrador de selección múltiple / emparejamiento vivía
   en una variable local de mpRenderAnswerBody → una reconexión (habitual con
   datos móviles) borraba en silencio lo marcado y la ronda se iba a TIMEOUT. */
for(const tipo of ["seleccion_multiple","emparejamiento"]){
  let ctx;
  try{ ctx = await startGame({ modo:"duelo", tipo, rondas:1 }); }
  catch(e){ ok(false, `Repintado/${tipo}: no se llega a la ronda (${e.message})`); continue; }
  const { D, w, click, gG } = ctx;
  const body = ()=> D.querySelector("#mp-q-body");
  const marcados = ()=> tipo === "seleccion_multiple"
    ? body().querySelectorAll(".option.selected").length
    : body().querySelectorAll("[data-left].paired").length;

  // marcar a medias, sin confirmar
  if(tipo === "seleccion_multiple"){
    const ops = Array.from(body().querySelectorAll(".option")).slice(0,2);
    ops.forEach(o=> click(o));
  } else {
    const l = body().querySelector("[data-left]").getAttribute("data-left");
    const r = body().querySelector("[data-right]").getAttribute("data-right");
    click(D.querySelector(`[data-left="${l}"]`));
    click(D.querySelector(`[data-right="${r}"]`));
  }
  const antes = marcados();
  ok(antes > 0, `Repintado/${tipo}: se marca algo antes del repintado (${antes})`);

  // Repintado completo de la vista — el mismo camino que toma
  // mpRerenderCurrentMpView() cuando el motor avisa de "reconnecting"/"restored".
  const b = D.createElement("button"); b.setAttribute("data-goto","mp-game");
  D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove();

  const despues = marcados();
  ok(despues === antes,
     `Repintado/${tipo}: lo marcado sobrevive al repintado (${antes} → ${despues})`);

  // y sigue siendo confirmable
  const conf = D.querySelector("#mp-multi-confirm, #mp-match-confirm");
  if(tipo === "seleccion_multiple"){
    ok(!!conf, `Repintado/${tipo}: sigue el botón de confirmar`);
    if(conf) click(conf);
    let st = null;
    try{ await waitFor(()=>{ st = gG.getState().rivalAnswerState; return !!st; }, 4000); }catch(e){}
    ok(st === "SUBMITTED", `Repintado/${tipo}: se puede confirmar tras el repintado (fue ${st||"nada"})`);
  }
  ctx.gS.destroy();
}

/* ─── El botón de confirmar no puede quedar dentro de .options ───
   (el <div class="options"> se cerraba después del botón: se colaba en la
   rejilla de opciones y en móvil salía deformado). */
{
  let ctx;
  try{
    ctx = await startGame({ modo:"duelo", tipo:"seleccion_multiple", rondas:1 });
    const conf = ctx.D.querySelector("#mp-multi-confirm");
    ok(!!conf && !conf.closest(".options"),
       "Selección múltiple: «Confirmar respuesta» queda FUERA de la rejilla de opciones");
    ctx.gS.destroy();
  }catch(e){ ok(false, "Selección múltiple: layout del botón confirmar ("+e.message+")"); }
}

/* ─── La cuenta atrás va contra el instante que fija el HOST ───
   Antes era un `let n=3` que descontaba desde el momento de PINTAR: cada
   móvil arrancaba su 3·2·1 cuando le llegaba el mensaje (y cualquier
   repintado la reiniciaba a 3), así que la ronda 1 no entraba a la vez. */
for(const modo of ["duelo","coop"]){
  let ctx;
  try{ ctx = await startGame({ modo, tipo:"opcion_unica", rondas:1, stopAt:"countdown" }); }
  catch(e){ ok(false, `Cuenta atrás/${modo}: no se llega (${e.message})`); continue; }
  const { D, w } = ctx;
  const num = ()=> (D.querySelector("#mp-countdown-num")||{}).textContent || "";
  const n0 = num();
  ok(/^[123]$/.test(n0), `Cuenta atrás/${modo}: arranca en 3·2·1 (era "${n0}")`);

  await new Promise(r=> setTimeout(r, 1400));
  // repintado completo a mitad de cuenta atrás (evento de conexión)
  const b = D.createElement("button"); b.setAttribute("data-goto","mp-game");
  D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove();
  const n1 = num();
  ok(Number(n1) < Number(n0) || n1 === "¡YA!",
     `Cuenta atrás/${modo}: un repintado NO la reinicia (${n0} → ${n1})`);
  ctx.gS.destroy();
}

console.log(failures ? `\n${failures} fallo(s)` : "\nTODO OK");
process.exit(failures ? 1 : 0);
}
main().catch(e=>{ console.error("ERROR:", e && e.stack || e); process.exit(1); });
