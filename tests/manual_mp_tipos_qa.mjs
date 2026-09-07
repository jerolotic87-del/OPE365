/* QA en Chromium real de los fallos reportados en partida:
     · selección múltiple en Duelo y en Contra Word — se puede marcar y confirmar
     · un repintado a mitad de ronda (reconexión) no borra lo ya marcado
     · el botón «Confirmar respuesta» no se cuela dentro de la rejilla de opciones
     · la cuenta atrás no se reinicia al repintar (los dos empiezan a la vez)
     · nadie ve "voto registrado" sin haber votado
   jsdom ya cubre la lógica (tests/test_multiplayer_tipos.js); aquí se mira el
   LAYOUT y el comportamiento reales, que es donde se escapó el bug original.

     node tests/manual_mp_tipos_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8797;
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

/* Deja la página del HOST en la ronda 1 de una partida con preguntas de `tipo`. */
async function abrirPartida(pg, { modo, tipo, seconds=90 }){
  await pg.goto(`http://localhost:${PORT}/index.html`);
  await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length && window.OPE_MP");
  await pg.evaluate(()=>{ const MP = window.OPE_MP;
    window.__pair = MP.createMockPair(); MP.makeTransport = ()=> window.__pair.a; });
  await pg.evaluate(()=>{ const b=document.createElement("button");
    b.setAttribute("data-goto","mp-setup"); document.body.appendChild(b); b.click(); b.remove(); });
  await pg.click('[data-role="host"]');
  await pg.fill("#mp-name", "Yo");
  await pg.click(`[data-mode="${modo}"]`);
  await pg.evaluate(()=> document.querySelectorAll("details.advanced").forEach(d=> d.open = true));
  if(modo === "coop"){
    const c = await pg.$('[data-cp="personalizada"]'); if(c) await c.click();
    await pg.fill("#mp-coop-rounds", "3"); await pg.fill("#mp-coop-seconds", String(seconds));
  } else {
    const c = await pg.$('[data-preset="personalizada"]'); if(c) await c.click();
    await pg.fill("#mp-rounds", "3"); await pg.fill("#mp-seconds", String(seconds));
  }
  await pg.selectOption("#mp-tipo", tipo);
  await pg.click("#mp-create-room");
  await pg.evaluate((m)=>{ const MP = window.OPE_MP;
    window.__gS = MP.createSession(window.__pair.b);
    window.__gG = m === "coop" ? MP.createCoopGame(window.__gS) : MP.createDuelGame(window.__gS);
    window.__gPhase = null;
    window.__gG.setHandlers({ onPhase:(p)=>{ window.__gPhase = p; } });
    window.__gS.guestJoinRoom("MOCK1", "Rival");
  }, modo);
  await pg.waitForFunction("window.__gPhase === 'lobby_ready'", null, { timeout:15000 });
  await pg.waitForSelector("#mp-im-ready", { timeout:10000 });
  await pg.evaluate(()=> window.__gG.confirmReady());
  await pg.click("#mp-im-ready");
}

/* ───────── DUELO: los 4 tipos, marcando de verdad con el ratón ───────── */
for(const tipo of ["opcion_unica","verdadero_falso","seleccion_multiple","emparejamiento"]){
  const pg = await browser.newPage({ viewport:{ width:412, height:900 } });
  pg.on("pageerror", e=>{ fails++; console.error(`PAGEERROR (duelo/${tipo}):`, e.message); });
  await abrirPartida(pg, { modo:"duelo", tipo });
  await pg.waitForFunction("window.__gPhase === 'round'", null, { timeout:20000 });
  await pg.waitForSelector("#mp-q-body", { timeout:20000 });

  const ctrl = await pg.evaluate(()=> document.querySelectorAll("#mp-q-body .option, #mp-q-body .tf-btn, #mp-q-body .match-item").length);
  ok(ctrl > 0, `Duelo/${tipo}: hay ${ctrl} controles pulsables`);

  if(tipo === "opcion_unica")       await pg.click("#mp-q-body .option");
  else if(tipo === "verdadero_falso") await pg.click("#mp-q-body .tf-btn");
  else if(tipo === "seleccion_multiple"){
    const ops = await pg.$$("#mp-q-body .option");
    await ops[0].click(); if(ops[1]) await ops[1].click();
    const marcadas = await pg.evaluate(()=> document.querySelectorAll("#mp-q-body .option.selected").length);
    ok(marcadas >= 1, `Duelo/${tipo}: al pulsar, la opción queda marcada (${marcadas})`);

    // el botón de confirmar NO puede estar dentro de la rejilla de opciones
    const layout = await pg.evaluate(()=>{
      const b = document.querySelector("#mp-multi-confirm");
      const grid = document.querySelector("#mp-q-body .options");
      if(!b || !grid) return null;
      const rb = b.getBoundingClientRect(), rg = grid.getBoundingClientRect();
      return { dentro: grid.contains(b), debajo: rb.top >= rg.bottom - 1, ancho: Math.round(rb.width) };
    });
    ok(layout && !layout.dentro, `Duelo/${tipo}: «Confirmar» está fuera del <div class="options">`);
    ok(layout && layout.debajo,  `Duelo/${tipo}: «Confirmar» se pinta DEBAJO de las opciones, no dentro de la rejilla`);

    // repintado a mitad de ronda (lo que provoca una reconexión real)
    await pg.evaluate(()=>{ const b=document.createElement("button");
      b.setAttribute("data-goto","mp-game"); document.body.appendChild(b); b.click(); b.remove(); });
    const tras = await pg.evaluate(()=> document.querySelectorAll("#mp-q-body .option.selected").length);
    ok(tras === marcadas, `Duelo/${tipo}: lo marcado sobrevive al repintado (${marcadas} → ${tras})`);
    await pg.click("#mp-multi-confirm");
  } else {
    // cada pareja repinta el bloque entero: hay que re-consultar los ids,
    // los ElementHandle anteriores quedan desprendidos del DOM
    const ids = await pg.evaluate(()=> Array.from(document.querySelectorAll("#mp-q-body [data-left]")).map(e=>e.getAttribute("data-left")));
    for(const id of ids){
      await pg.click(`#mp-q-body [data-left="${id}"]`);
      const rid = await pg.evaluate(()=> document.querySelector("#mp-q-body [data-right]").getAttribute("data-right"));
      await pg.click(`#mp-q-body [data-right="${rid}"]`);
    }
    const conf = await pg.$("#mp-match-confirm");
    ok(!!conf && !(await conf.isDisabled()), `Duelo/${tipo}: «Confirmar» se habilita al completar los pares`);
    if(conf) await conf.click();
  }

  let estado = null;
  try{
    await pg.waitForFunction("window.__gG.getState().rivalAnswerState === 'SUBMITTED'", null, { timeout:5000 });
    estado = "SUBMITTED";
  }catch{ estado = await pg.evaluate(()=> window.__gG.getState().rivalAnswerState); }
  ok(estado === "SUBMITTED", `Duelo/${tipo}: la respuesta llega al rival como SUBMITTED (fue ${estado||"nada"})`);
  await pg.close();
}

/* ───────── CONTRA WORD: votar y estado honesto ───────── */
{
  const pg = await browser.newPage({ viewport:{ width:412, height:900 } });
  pg.on("pageerror", e=>{ fails++; console.error("PAGEERROR (coop):", e.message); });
  await abrirPartida(pg, { modo:"coop", tipo:"seleccion_multiple" });

  // la cuenta atrás no se reinicia al repintar
  await pg.waitForSelector("#mp-countdown-num", { timeout:10000 });
  const n0 = await pg.textContent("#mp-countdown-num");
  await pg.waitForTimeout(1400);
  await pg.evaluate(()=>{ const b=document.createElement("button");
    b.setAttribute("data-goto","mp-game"); document.body.appendChild(b); b.click(); b.remove(); });
  const n1 = await pg.textContent("#mp-countdown-num");
  ok(Number(n1) < Number(n0) || n1 === "¡YA!", `Contra Word: la cuenta atrás no se reinicia al repintar (${n0} → ${n1})`);

  await pg.waitForFunction("window.__gPhase === 'round'", null, { timeout:20000 });
  await pg.waitForSelector("#mp-coop-body .coop-btn", { timeout:20000 });

  const antes = (await pg.textContent("#mp-selfstatus")) || "";
  ok(/aún no has votado/i.test(antes), `Contra Word: antes de votar dice "Aún no has votado" (dijo: ${JSON.stringify(antes.trim())})`);

  // vota el compañero primero: mis botones tienen que seguir vivos
  await pg.evaluate(()=> window.__gG.submitAnswer("V"));
  await pg.waitForTimeout(200);
  const tras = (await pg.textContent("#mp-selfstatus")) || "";
  ok(/te falta votar a ti/i.test(tras), `Contra Word: deja claro que me falta a MÍ (dijo: ${JSON.stringify(tras.trim())})`);
  const vivos = await pg.evaluate(()=> Array.from(document.querySelectorAll("#mp-coop-body .coop-btn")).filter(b=>!b.disabled).length);
  ok(vivos === 2, `Contra Word: mis 2 botones siguen pulsables (${vivos})`);

  // el cronómetro corre de verdad (no congelado en 0 ni en "--")
  const t0 = await pg.textContent("#mp-timer-num");
  await pg.waitForTimeout(600);
  const t1 = await pg.textContent("#mp-timer-num");
  ok(t0 !== "--" && parseFloat(t1) < parseFloat(t0), `Contra Word: el cronómetro avanza (${t0} → ${t1})`);

  await pg.click("#mp-coop-body .coop-btn");
  let st = null;
  try{ await pg.waitForFunction("window.__gG.getState().rivalAnswerState === 'SUBMITTED'", null, { timeout:5000 }); st = "SUBMITTED"; }
  catch{ st = await pg.evaluate(()=> window.__gG.getState().rivalAnswerState); }
  ok(st === "SUBMITTED", `Contra Word: mi voto llega al compañero (fue ${st||"nada"})`);
  await pg.screenshot({ path:"tests/_mp_tipos_qa.png" });
  console.log("   captura → tests/_mp_tipos_qa.png");
  await pg.close();
}

await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
