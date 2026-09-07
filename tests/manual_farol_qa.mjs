/* QA de Farol en Chromium real: partida completa de 10 turnos conducida
   desde la UI del host (invitado headless con transporte mock en la misma
   página), mirando lo que jsdom no puede juzgar — que el comodín 50/50 se
   VE aplicado, que ninguna pantalla se queda en blanco y que no salta
   ningún error de JS en toda la partida.

     node tests/manual_farol_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8799;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json" };
const srv = createServer(async (req,res)=>{
  try{ let p = decodeURIComponent(req.url.split("?")[0]); if(p==="/") p="/index.html";
    const b = await readFile(join(ROOT,p));
    res.writeHead(200,{ "content-type": MIME[extname(p)]||"application/octet-stream" }); res.end(b);
  }catch{ res.writeHead(404); res.end("404"); }
});
await new Promise(r=> srv.listen(PORT, r));

let fails = 0;
const ok = (c,m)=>{ if(c) console.log("OK: "+m); else { fails++; console.error("FALLO: "+m); } };

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport:{ width:412, height:900 } });
pg.on("pageerror", e=>{ fails++; console.error("PAGEERROR:", e.message); });

await pg.goto(`http://localhost:${PORT}/index.html`);
await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length && window.OPE_MP");
await pg.evaluate(()=>{ const MP = window.OPE_MP;
  window.__pair = MP.createMockPair(); MP.makeTransport = ()=> window.__pair.a; });

await pg.evaluate(()=>{ const b=document.createElement("button");
  b.setAttribute("data-goto","mp-setup"); document.body.appendChild(b); b.click(); b.remove(); });
await pg.click('[data-role="host"]');
await pg.fill("#mp-name", "Yo");
await pg.click('[data-mode="farol"]');
await pg.click("#mp-create-room");

// invitado headless: mismo motor, mazo propio, juega por la API
await pg.evaluate(()=>{
  const MP = window.OPE_MP, O = window.OPE;
  window.__gS = MP.createSession(window.__pair.b);
  window.__gG = MP.createPokerGame(window.__gS);
  window.__gPhase = null; window.__gFinal = null;
  window.__gG.setHandlers({ onPhase:(p,x)=>{ window.__gPhase = p; if(p==="finished") window.__gFinal = x; } });
  window.__gS.guestJoinRoom("MOCK1", "Rival");
  window.__deck = O.QUESTIONS
    .filter(q=> q.categoria==="atajo" && q.tipo==="opcion_unica" && !q.negativa)
    .slice(0, MP.POKER_ROUNDS_PER_DECK).map(q=>q.id);
  window.__gG.setMyDeck(window.__deck);
});

await pg.waitForSelector("#poker-confirm-deck", { timeout:15000 });
const mazo = await pg.evaluate(()=> document.querySelectorAll("#poker-deck-list .qlist-item").length);
ok(mazo === 5, `Lobby: el mazo sugerido trae 5 cartas (${mazo})`);
await pg.click("#poker-confirm-deck");
await pg.evaluate(()=> window.__gG.confirmReady());

/* ── partida completa: el host juega por pantalla, el invitado por la API ── */
const t0 = Date.now();
let dudos = 0, confios = 0, comodin = false, comodinOk = null, blancos = 0;
while(Date.now() - t0 < 180000){
  const fase = await pg.evaluate(()=> window.__gPhase);
  if(fase === "finished") break;

  const ui = await pg.evaluate(()=>({
    carta:   !!document.querySelector("[data-play-card]"),
    claim:   !!document.querySelector("[data-claim]"),
    decide:  !!document.querySelector("#poker-confio"),
    defiende:!!document.querySelector("[data-defend]"),
    wc:      !!document.querySelector("#poker-wildcard"),
    noDisp:  /Carta no disponible/.test(document.body.textContent||""),
    // "en blanco" = la vista principal sin contenido util (no vale mirar
    // .duel-board: la pantalla de resultados no lo tiene)
    vacio:   ((document.querySelector("main")||{textContent:""}).textContent||"").trim().length < 30,
  }));
  if(ui.noDisp){ ok(false, "Partida: apareció «Carta no disponible» con dos bancos iguales"); break; }
  if(ui.vacio) blancos++;

  if(ui.carta)       await pg.click("[data-play-card]");
  else if(ui.claim)  await pg.click("[data-claim]");
  else if(ui.decide){
    if(dudos <= confios){ dudos++; await pg.click("#poker-dudo"); }
    else { confios++; await pg.click("#poker-confio"); }
  }
  else if(ui.defiende){
    if(!comodin && ui.wc){
      comodin = true;
      await pg.click("#poker-wildcard");
      // el 50/50 tiene que VERSE: 2 opciones apagadas y no pulsables
      comodinOk = await pg.evaluate(()=>{
        const ops = Array.from(document.querySelectorAll("#poker-defend-options .option"));
        const vivas = ops.filter(b=> !b.disabled);
        const muertas = ops.filter(b=> b.disabled);
        const opacas = muertas.every(b=> parseFloat(getComputedStyle(b).opacity) < 0.6);
        return { total:ops.length, vivas:vivas.length, muertas:muertas.length, opacas,
                 avisa: /50\/50 usado/.test(document.body.textContent||"") };
      });
      // y tiene que sobrevivir a un repintado (ya está pagado con puntos)
      await pg.evaluate(()=>{ const b=document.createElement("button");
        b.setAttribute("data-goto","mp-game"); document.body.appendChild(b); b.click(); b.remove(); });
      const tras = await pg.evaluate(()=> document.querySelectorAll("#poker-defend-options .option:not([disabled])").length);
      ok(tras === 2, `50/50: sigue aplicado tras un repintado (${tras} opciones vivas)`);
    }
    await pg.click("#poker-defend-options .option:not([disabled])");
  }
  else {
    // le toca al invitado
    await pg.evaluate(()=>{
      const O = window.OPE, g = window.__gG, r = g.getRound();
      if(!r) return;
      if(r.attackerIsMe){
        if(!r.qid) g.playCard(window.__deck[r.turn % window.__deck.length]);
        else if(!r.claim){ const q = r.q || O.Q_BY_ID[r.qid]; g.submitClaim(q ? q.opciones[0].letter : "A"); }
      } else if(r.claim && !r.decision) g.decideConfio();
    });
  }
  await pg.waitForTimeout(60);
}

const fin = await pg.evaluate(()=> window.__gPhase);
ok(fin === "finished", `Partida: llega al final (fase ${fin})`);
ok(dudos > 0 && confios > 0, `Partida: se juegan DUDO (${dudos}) y CONFÍO (${confios})`);
ok(comodin, "Partida: se llegó a usar el comodín 50/50");
ok(comodinOk && comodinOk.total === 4 && comodinOk.vivas === 2 && comodinOk.muertas === 2,
   `50/50: 4 opciones → 2 vivas / 2 descartadas (${JSON.stringify(comodinOk)})`);
ok(comodinOk && comodinOk.opacas, "50/50: las descartadas se ven apagadas, no solo deshabilitadas");
ok(comodinOk && comodinOk.avisa, "50/50: se avisa en pantalla de que ya se usó");
ok(blancos === 0, `Partida: ninguna pantalla se queda en blanco (${blancos})`);

const final = await pg.evaluate(()=> window.__gFinal);
ok(final && Array.isArray(final.review) && final.review.length === 10,
   `Final: el repaso trae los 10 turnos (${(final&&final.review||[]).length})`);
const pantallaFinal = await pg.evaluate(()=>({
  texto: (document.querySelector(".view")||{textContent:""}).textContent.trim().length,
  repaso: document.querySelectorAll(".mp-review .mp-rev-item").length,
}));
ok(pantallaFinal.texto > 50, "Final: la pantalla de resultados del host tiene contenido");
ok(pantallaFinal.repaso === 10, `Final: se listan los 10 turnos en el repaso (${pantallaFinal.repaso})`);

await pg.screenshot({ path:"tests/_farol_final.png", fullPage:true });
console.log("   captura → tests/_farol_final.png");

await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
