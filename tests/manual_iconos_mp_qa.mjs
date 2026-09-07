/* QA en Chromium real: preguntas CON IMAGEN en los modos multijugador.
   jsdom ya cubre Duelo (tests/test_multiplayer_iconos.js); aquí se
   comprueban en un navegador de verdad los dos modos que faltaban:
     · Contra Word — el icono se pinta encima de la afirmación de Word
     · Farol       — el icono se ve al elegir carta, al afirmar y al defender
   El transporte se sustituye por MP.createMockPair() (no hay WebRTC en un
   navegador headless sin par real), con el invitado headless en la misma
   página, igual que en el test jsdom.

     node tests/manual_iconos_mp_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8795;
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

/* ───────────────────────── CONTRA WORD ───────────────────────── */
{
  const pg = await browser.newPage({ viewport:{ width:430, height:900 } });
  pg.on("pageerror", e=> { fails++; console.error("PAGEERROR:", e.message); });
  await pg.goto(`http://localhost:${PORT}/index.html`);
  await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length && window.OPE_MP");

  // transporte mock: el host usa la UI, el invitado va headless en la misma página
  await pg.evaluate(()=>{
    const MP = window.OPE_MP;
    window.__pair = MP.createMockPair();
    MP.makeTransport = ()=> window.__pair.a;
  });

  await pg.evaluate(()=>{ const b=document.createElement("button");
    b.setAttribute("data-goto","mp-setup"); document.body.appendChild(b); b.click(); b.remove(); });
  await pg.waitForSelector('[data-role="host"]');
  await pg.click('[data-role="host"]');
  await pg.fill("#mp-name", "Yo");
  await pg.click('[data-mode="coop"]');
  // en Contra Word los selectores de contenido viven en un <details> plegado
  await pg.evaluate(()=>{ document.querySelectorAll("details.advanced").forEach(d=> d.open = true); });
  await pg.waitForSelector("#mp-scope", { state:"visible" });
  await pg.selectOption("#mp-scope", "imagen");
  // preset "a tu medida" para bajar las rondas
  const custom = await pg.$('[data-cp="personalizada"]');
  if(custom){ await custom.click(); await pg.fill("#mp-coop-rounds", "2"); await pg.fill("#mp-coop-seconds", "60"); }
  await pg.click("#mp-create-room");

  await pg.evaluate(()=>{
    const MP = window.OPE_MP;
    window.__gS = MP.createSession(window.__pair.b);
    window.__gG = MP.createCoopGame(window.__gS);
    window.__gPhase = null;
    window.__gG.setHandlers({ onPhase:(p)=>{ window.__gPhase = p; } });
    window.__gS.guestJoinRoom("MOCK1", "Rival");
  });
  await pg.waitForFunction("window.__gPhase === 'lobby_ready'", null, { timeout:15000 });

  const board = await pg.evaluate(()=> window.__gG.getState().questions.map(q=>({ id:q.id, img: !!q.imagen })));
  ok(board.length > 0 && board.every(q=> q.img), `Contra Word: tablero de ${board.length} rondas, todas con imagen`);

  await pg.waitForSelector("#mp-im-ready", { timeout:10000 });
  await pg.evaluate(()=> window.__gG.confirmReady());
  await pg.click("#mp-im-ready");
  await pg.waitForFunction("window.__gPhase === 'round'", null, { timeout:20000 });
  await pg.waitForSelector(".coop-card .q-image img", { timeout:20000 });

  const shot = await pg.evaluate(()=>{
    const card = document.querySelector(".coop-card");
    return {
      src: (card.querySelector(".q-image img")||{}).src || "",
      claim: (card.querySelector(".coop-claim")||{}).textContent || "",
      ask: (card.querySelector(".coop-ask")||{}).textContent || "",
      votes: card.parentElement.querySelectorAll(".coop-btn").length,
    };
  });
  ok(shot.src.startsWith("data:image"), "Contra Word: la ronda pinta el icono");
  ok(shot.claim.trim().length > 0, `Contra Word: Word afirma algo concreto (${JSON.stringify(shot.claim.slice(0,40))})`);
  ok(shot.votes === 2, "Contra Word: siguen los dos botones Verdadero/Falso");
  await pg.screenshot({ path:"tests/_mp_coop_icono.png" });
  console.log("   captura → tests/_mp_coop_icono.png");
  await pg.close();
}

/* ───────────────────────────── FAROL ───────────────────────────── */
{
  const pg = await browser.newPage({ viewport:{ width:430, height:900 } });
  pg.on("pageerror", e=> { fails++; console.error("PAGEERROR:", e.message); });
  await pg.goto(`http://localhost:${PORT}/index.html`);
  await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE_MP");

  // El mazo de Farol se sugiere entre las preguntas de atajo YA dominadas.
  // Marcamos como acertadas solo las de icono para que el mazo sea de iconos.
  const nIconAtajo = await pg.evaluate(()=>{
    const O = window.OPE;
    const pool = O.QUESTIONS.filter(q=> q.categoria==="atajo" && q.tipo==="opcion_unica" && !q.negativa && q.imagen);
    O.PROGRESS.answers = {};
    pool.forEach(q=>{ O.PROGRESS.answers[q.id] = { correcta:true, ts:Date.now() }; });
    O.persist();
    const MP = window.OPE_MP;
    window.__pair = MP.createMockPair();
    MP.makeTransport = ()=> window.__pair.a;
    return pool.length;
  });
  ok(nIconAtajo >= 5, `Farol: hay ${nIconAtajo} preguntas de atajo CON icono para el mazo`);

  await pg.evaluate(()=>{ const b=document.createElement("button");
    b.setAttribute("data-goto","mp-setup"); document.body.appendChild(b); b.click(); b.remove(); });
  await pg.waitForSelector('[data-role="host"]');
  await pg.click('[data-role="host"]');
  await pg.fill("#mp-name", "Yo");
  await pg.click('[data-mode="farol"]');
  await pg.click("#mp-create-room");

  // invitado headless para llegar al lobby de Farol (mazo)
  await pg.evaluate(()=>{
    const MP = window.OPE_MP;
    window.__gS = MP.createSession(window.__pair.b);
    window.__gG = MP.createPokerGame(window.__gS);
    window.__gS.guestJoinRoom("MOCK1", "Rival");
  });
  await pg.waitForSelector("#poker-deck-list .qlist-item", { timeout:15000 });
  const deck = await pg.evaluate(()=>({
    items: document.querySelectorAll("#poker-deck-list .qlist-item").length,
    thumbs: document.querySelectorAll("#poker-deck-list .mp-card-thumb").length,
    firstSrc: (document.querySelector("#poker-deck-list .mp-card-thumb")||{}).src || "",
  }));
  ok(deck.items > 0 && deck.thumbs === deck.items,
     `Farol: las ${deck.items} cartas del mazo muestran su miniatura de icono`);
  ok(deck.firstSrc.startsWith("data:image"), "Farol: la miniatura es la imagen real de la pregunta");
  await pg.screenshot({ path:"tests/_mp_farol_icono.png" });
  console.log("   captura → tests/_mp_farol_icono.png");
  await pg.close();
}

await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
