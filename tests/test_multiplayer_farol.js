/* Farol — partida completa y los caminos que rompen.
   El modo por turnos no tiene reloj, así que un fallo aquí no "se agota":
   la partida se queda COLGADA, que es peor. Se conduce la UI real del host
   (jsdom + transporte mock) contra un invitado headless, turno a turno.

   Cubre:
     · los 10 turnos hasta 'finished', atacando y defendiendo de verdad
     · CONFÍO y DUDO, con y sin comodín 50/50
     · el 50/50 sobrevive a un repintado (se paga con puntos: perderlo es robar)
     · reenvíos tras reconexión (resume_request) no echan al defensor atrás
     · una carta que no está en el banco del rival no cuelga la partida
       ni revienta el render

   node tests/test_multiplayer_farol.js
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
  w.addEventListener("error", e=> errs.push(String((e.error && e.error.message) || e.message)));
  w.scrollTo = ()=>{};
  ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","content-overrides.js",
   "github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"]
    .forEach(f=> w.eval(read(f)));
  return { w, D:w.document, O:w.OPE, MP:w.OPE_MP, errs };
}

/* Deja al HOST en el turno 0 de una partida de Farol, con un invitado
   headless que juega por la API del motor. */
async function abrirFarol(){
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
  click('[data-mode="farol"]');
  click("#mp-create-room");

  const gS = MP.createSession(pair.b);
  const gG = MP.createPokerGame(gS);
  const g = { phase:null, extra:null };
  gG.setHandlers({ onPhase:(p,x)=>{ g.phase=p; g.extra=x; } });
  gS.guestJoinRoom("MOCK1", "Rival");

  await waitFor(()=> !!D.querySelector("#poker-confirm-deck"), 10000, "lobby de Farol del host");

  // mazo del invitado: 5 cartas del mismo tipo que la app sugiere al host
  const pool = O.QUESTIONS.filter(q=> q.categoria==="atajo" && q.tipo==="opcion_unica" && !q.negativa).map(q=>q.id);
  const guestDeck = pool.slice(0, MP.POKER_ROUNDS_PER_DECK);
  gG.setMyDeck(guestDeck);

  click("#poker-confirm-deck");
  gG.confirmReady();
  await waitFor(()=> g.phase && g.phase !== "idle", 10000, "arranque de la partida");
  return { ...ctx, pair, gS, gG, g, goto, click, setVal, guestDeck };
}

/* ¿Qué le toca al host ahora? Se deduce del DOM, sin tocar estado privado. */
const hostUI = D => ({
  eligeCarta:  !!D.querySelector("[data-play-card]"),
  eligeClaim:  !!D.querySelector("[data-claim]"),
  decide:      !!D.querySelector("#poker-confio"),
  responde:    !!D.querySelector("[data-defend]"),
  noDisponible: /Carta no disponible/.test(D.body.textContent||""),
});

/* Juega la parte del INVITADO (headless). Devuelve true si hizo algo. */
function jugarInvitado(ctx, opts){
  const { O, gG } = ctx; const o = opts || {};
  const r = gG.getRound();
  if(!r) return false;
  if(r.attackerIsMe){
    if(!r.qid){ gG.playCard(o.qidFalso || ctx.guestDeck[r.turn % ctx.guestDeck.length]); return true; }
    if(!r.claim){ const q = O.Q_BY_ID[r.qid]; gG.submitClaim(q ? q.opciones[0].letter : "A"); return true; }
  } else if(r.claim && !r.decision){ gG.decideConfio(); return true; }
  return false;
}

/* Avanza la partida (host por la UI, invitado por la API) hasta que `hasta`
   se cumpla o se agote el presupuesto. El revelado tarda 3,2 s por turno:
   el bucle va por tiempo, no por número de pasos. */
async function avanzar(ctx, hasta, ms, jugarHost){
  const t0 = Date.now();
  while(!hasta() && Date.now()-t0 < (ms||90000)){
    if(!jugarHost(hostUI(ctx.D))) jugarInvitado(ctx);
    await new Promise(res=> setTimeout(res, 25));
  }
  return hasta();
}

async function main(){

/* ─────────── 1. Partida completa: los 10 turnos, sin colgarse ─────────── */
{
  const ctx = await abrirFarol();
  const { D, click, g, errs } = ctx;
  let confios = 0, dudos = 0, comodinUsado = false, cartaRota = false;
  let final = null;
  ctx.gG.setHandlers({ onPhase:(p,x)=>{ ctx.g.phase=p; ctx.g.extra=x; if(p==="finished") final = x; } });

  await avanzar(ctx, ()=> g.phase === "finished" || cartaRota, 120000, ui=>{
    if(ui.noDisponible){ cartaRota = true; return true; }
    if(ui.eligeCarta){ click(D.querySelector("[data-play-card]")); return true; }
    if(ui.eligeClaim){ click(D.querySelector("[data-claim]")); return true; }
    if(ui.decide){                              // el host defiende: alterna CONFÍO / DUDO
      if(dudos <= confios){ dudos++; click("#poker-dudo"); } else { confios++; click("#poker-confio"); }
      return true;
    }
    if(ui.responde){
      if(!comodinUsado && D.querySelector("#poker-wildcard")){
        comodinUsado = true; click("#poker-wildcard");
        const vivas = Array.from(D.querySelectorAll("#poker-defend-options .option")).filter(b=>!b.disabled);
        ok(vivas.length === 2, `Comodín 50/50: deja exactamente 2 opciones vivas (${vivas.length})`);
        click(vivas[0]);
      } else click(D.querySelector("[data-defend]"));
      return true;
    }
    return false;
  });

  ok(!cartaRota, "Partida completa: no aparece «Carta no disponible» con dos bancos iguales");
  ok(g.phase === "finished", `Partida completa: llega al final (fase ${g.phase})`);
  ok(dudos > 0 && confios > 0, `Partida completa: se juegan DUDO (${dudos}) y CONFÍO (${confios})`);
  ok(comodinUsado, "Partida completa: se llegó a usar el comodín 50/50");
  const f = final || {};
  ok(typeof f.myScore === "number" && typeof f.rivalScore === "number",
     `Partida completa: marcador final numérico (${f.rivalScore} vs ${f.myScore})`);
  ok(Array.isArray(f.review) && f.review.length === 10,
     `Partida completa: el repaso final trae los 10 turnos (${(f.review||[]).length})`);
  ok(/Farol|Resultado|Victoria|Derrota|Empate/i.test(D.body.textContent||""),
     "Partida completa: la pantalla final del host se pinta");
  ok(errs.length === 0, `Partida completa: sin errores de JS en la UI (${errs.slice(0,2).join(" | ")||0})`);
  ctx.gS.destroy();
}

/* ─── 2. El 50/50 sobrevive a un repintado ───
   Se paga con la mitad de los puntos: si un repintado devuelve las 4
   opciones, el jugador ha pagado por nada. */
{
  const ctx = await abrirFarol();
  const { D, w, click } = ctx;
  const llegoADefender = await avanzar(ctx, ()=> !!D.querySelector("#poker-confio"), 40000, ui=>{
    if(ui.eligeCarta){ click(D.querySelector("[data-play-card]")); return true; }
    if(ui.eligeClaim){ click(D.querySelector("[data-claim]")); return true; }
    return false;
  });
  ok(llegoADefender, "50/50: el host llega a defender");
  click("#poker-dudo");
  ok(!!D.querySelector("#poker-wildcard"), "50/50: el botón del comodín está disponible");
  click("#poker-wildcard");
  const antes = Array.from(D.querySelectorAll("#poker-defend-options .option")).filter(b=>!b.disabled).length;
  ok(antes === 2, `50/50: quedan 2 opciones tras usarlo (${antes})`);

  // repintado completo (lo que hace cualquier evento de fase o conexión)
  const b = D.createElement("button"); b.setAttribute("data-goto","mp-game");
  D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove();

  const despues = Array.from(D.querySelectorAll("#poker-defend-options .option")).filter(x=>!x.disabled).length;
  ok(despues === 2, `50/50: sigue habiendo 2 opciones tras el repintado (${despues}) — se pagó por él`);
  ok(!D.querySelector("#poker-wildcard"), "50/50: el botón no reaparece tras el repintado");
  ctx.gS.destroy();
}

/* ─── 3. Reenvíos tras reconexión no echan al defensor atrás ───
   El motor reenvía carta y claim al recibir resume_request. Si esos
   mensajes se reprocesan, el defensor que ya pulsó DUDO vuelve a
   «¿Te fías?» y pierde el comodín que acaba de gastar. */
{
  const ctx = await abrirFarol();
  const { D, click, gG } = ctx;
  await avanzar(ctx, ()=> !!D.querySelector("#poker-confio"), 40000, ui=>{
    if(ui.eligeCarta){ click(D.querySelector("[data-play-card]")); return true; }
    if(ui.eligeClaim){ click(D.querySelector("[data-claim]")); return true; }
    return false;
  });
  click("#poker-dudo");
  click("#poker-wildcard");
  ok(!!D.querySelector("[data-defend]"), "Reenvío: el host está eligiendo su respuesta");

  // el rival reenvía carta y claim, como tras recuperar la conexión
  const r = gG.getRound();
  ctx.pair.b.send({ type:"poker_card",  turn:r.turn, qid:r.qid });
  ctx.pair.b.send({ type:"poker_claim", turn:r.turn, claim:r.claim });
  await new Promise(res=> setTimeout(res, 120));

  ok(!!D.querySelector("[data-defend]"),
     "Reenvío: el defensor SIGUE eligiendo respuesta (no vuelve a «¿Te fías?»)");
  const vivas = Array.from(D.querySelectorAll("#poker-defend-options .option")).filter(b=>!b.disabled).length;
  ok(vivas === 2, `Reenvío: el comodín gastado sigue aplicado (${vivas} opciones)`);
  ctx.gS.destroy();
}

/* ─── 4. Carta que NO está en el banco del defensor: se juega igual ───
   El mazo de Farol viajaba SOLO por ids. Si al defensor le faltaba esa
   pregunta (Pages sin redesplegar entre los dos móviles, contenido propio,
   una borrada), resolveTurn no podía puntuar y la partida se quedaba
   COLGADA para él. Ahora la carta viaja POR VALOR, como el tablero de
   Duelo/Contra Word. */
{
  const ctx = await abrirFarol();
  const { D, O, click, gG, errs } = ctx;
  let jugada = false;
  await avanzar(ctx, ()=> !!D.querySelector("#poker-confio") || /Carta no disponible/.test(D.body.textContent||""), 40000, ui=>{
    if(ui.eligeCarta){ click(D.querySelector("[data-play-card]")); return true; }
    if(ui.eligeClaim){ click(D.querySelector("[data-claim]")); return true; }
    const r = gG.getRound();
    if(r && r.attackerIsMe && !r.qid && !jugada){
      // el invitado ataca con una carta que el HOST no tiene en su banco
      const fake = "carta-fantasma-999";
      O.Q_BY_ID[fake] = Object.assign({}, O.Q_BY_ID[ctx.guestDeck[0]], { id:fake });
      gG.playCard(fake);
      delete O.Q_BY_ID[fake];                          // el host no la encuentra
      jugada = true;
      return true;
    }
    if(r && r.attackerIsMe && r.qid && !r.claim){ gG.submitClaim("A"); return true; }
    return false;
  });
  ok(jugada, "Carta ausente: el invitado llega a jugar la carta fantasma");
  ok(!/Carta no disponible/.test(D.body.textContent||""),
     "Carta ausente: NO se corta la partida — la carta viaja por valor");
  ok(!!D.querySelector("#poker-confio"), "Carta ausente: el host puede decidir CONFÍO/DUDO igualmente");
  click("#poker-confio");
  await new Promise(r=> setTimeout(r, 200));
  ok(gG.getHistory().length >= 1, `Carta ausente: el turno se resuelve y puntúa (${gG.getHistory().length} en el historial)`);
  ok(errs.length === 0, `Carta ausente: sin errores de JS (${errs.slice(0,2).join(" | ")||0})`);
  ctx.gS.destroy();
}

/* ─── 5. Mensaje de una versión anterior (sin la carta por valor) ───
   Sigue siendo posible si un móvil tiene la app vieja en caché: no puede
   reventar el render ni dejar la pantalla en blanco. */
{
  const ctx = await abrirFarol();
  const { D, O, click, gG, errs } = ctx;
  let enviado = false;
  await avanzar(ctx, ()=> /Carta no disponible/.test(D.body.textContent||""), 40000, ui=>{
    if(ui.eligeCarta){ click(D.querySelector("[data-play-card]")); return true; }
    if(ui.eligeClaim){ click(D.querySelector("[data-claim]")); return true; }
    const r = gG.getRound();
    if(r && r.attackerIsMe && !enviado){
      // mensajes "a la antigua": solo el id, sin la carta por valor
      enviado = true;
      ctx.pair.b.send({ type:"poker_card",  turn:r.turn, qid:"carta-que-no-existe-000" });
      ctx.pair.b.send({ type:"poker_claim", turn:r.turn, claim:"A" });
      return true;
    }
    return false;
  });
  ok(/Carta no disponible/.test(D.body.textContent||""),
     "Mensaje antiguo: se avisa en pantalla en vez de quedarse en blanco");
  ok(errs.length === 0, `Mensaje antiguo: sin errores de JS (${errs.slice(0,2).join(" | ")||0})`);
  ok(!!D.querySelector("#mp-game-exit"), "Mensaje antiguo: el botón de salir sigue disponible");
  ctx.gS.destroy();
}

console.log(failures ? `\n${failures} fallo(s)` : "\nTODO OK");
process.exit(failures ? 1 : 0);
}
main().catch(e=>{ console.error("ERROR:", e && e.stack || e); process.exit(1); });
