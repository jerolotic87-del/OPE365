/* QA en Chromium real del modo tarjeta de Atajos.

   jsdom confirma la lógica pero no juzga lo que aquí importa: que al elegir
   «Atajos» en el asistente salga una tarjeta y no un test, que el dorso se lea
   como una tecla, y que los tres grados quepan y se puedan pulsar en móvil.

     node tests/manual_tarjeta_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8807;
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
const pg = await browser.newPage({ viewport:{ width:390, height:844 } });   // móvil
pg.on("pageerror", e=>{ fails++; console.error("PAGEERROR:", e.message); });
await pg.goto(`http://localhost:${PORT}/index.html`);
await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length");

// ── recorrido real: Práctica → Atajos → empezar ───────────────────────
await pg.evaluate(()=>{ const b=document.createElement("button");
  b.setAttribute("data-goto","practica"); document.body.appendChild(b); b.click(); b.remove(); });
await pg.waitForSelector("#in-tema", { timeout:8000 });
await pg.click("#in-tema");
await pg.waitForSelector('#wiz-scope .choice-card[data-scope="atajos"]', { timeout:8000 });
await pg.click('#wiz-scope .choice-card[data-scope="atajos"]');
await pg.click("#wiz-next");
await pg.waitForSelector("#wiz-count-pills", { timeout:5000 });
await pg.click('#wiz-count-pills [data-c="10"]');
await pg.click("#wiz-next");
await pg.waitForSelector("#wiz-start", { timeout:5000 });
await pg.click("#wiz-start");
await pg.waitForTimeout(400);

const cfg = await pg.evaluate(()=> window.OPE.getSession().config);
ok(cfg.categoria === "atajo" && cfg.mode === "practice", `la sesión es de atajos en práctica (${cfg.categoria}/${cfg.mode})`);

// avanza hasta una que sea convertible en tarjeta
for(let i=0;i<12;i++){
  if(await pg.$("#card-reveal")) break;
  await pg.click("#q-next"); await pg.waitForTimeout(120);
}
ok(!!(await pg.$("#card-reveal")), "el modo Atajos abre TAPADO, con «Ver la respuesta»");
ok((await pg.$$("#q-body .option")).length === 0, "no se ven las 4 opciones antes de destapar");
await pg.screenshot({ path:"tests/_tarjeta_frente.png" });

// ── destapar ──────────────────────────────────────────────────────────
await pg.click("#card-reveal");
await pg.waitForSelector(".card-back", { timeout:3000 });
const back = await pg.evaluate(()=>{
  const el = document.querySelector(".card-back"), cs = getComputedStyle(el);
  return { txt: el.textContent.trim(), combo: el.classList.contains("is-combo"),
           mono: /mono|Consolas|Courier|Menlo/i.test(cs.fontFamily), size: parseFloat(cs.fontSize),
           ancho: el.getBoundingClientRect().width };
});
ok(back.txt.length > 0, `el dorso trae la respuesta ("${back.txt.slice(0,42)}")`);
if(back.combo) ok(back.mono && back.size >= 18, `una combinación se lee como tecla (mono ${back.mono}, ${back.size}px)`);
ok(back.ancho <= 390, "el dorso no desborda la pantalla del móvil");

const grados = await pg.evaluate(()=> Array.from(document.querySelectorAll(".fc-grade")).map(b=>{
  const r = b.getBoundingClientRect();
  return { t:b.textContent.trim(), w:Math.round(r.width), h:Math.round(r.height), visible:r.width>0 && r.height>0 };
}));
ok(grados.length === 3, `tres grados de autocalificación (${grados.map(g=>g.t).join(" · ")})`);
ok(grados.every(g=> g.visible && g.h >= 38), "los tres son pulsables con el dedo (≥38px de alto)");
ok(!!(await pg.$(".card-expl")) || !(await pg.evaluate(()=> !!window.OPE.getSession().questions[window.OPE.getSession().current].explicacion)),
   "la explicación acompaña al dorso");
await pg.screenshot({ path:"tests/_tarjeta_dorso.png" });

// ── calificar avanza y vuelve a tapar ─────────────────────────────────
const iAntes = await pg.evaluate(()=> window.OPE.getSession().current);
await pg.click('.fc-grade[data-g="si"]');
await pg.waitForTimeout(250);
const tras = await pg.evaluate(()=>{
  const s = window.OPE.getSession();
  return { i:s.current, r:s.responses[s.current-1], tapada: !!document.getElementById("card-reveal") };
});
ok(tras.i === iAntes+1, "calificar avanza a la siguiente");
ok(tras.r && tras.r.correct === true && tras.r.card === true, "queda registrada como tarjeta acertada");
ok(tras.tapada || (await pg.$$("#q-body .option")).length > 0, "la siguiente vuelve a salir tapada");

// ── volver atrás enseña el veredicto ──────────────────────────────────
await pg.click("#q-prev"); await pg.waitForTimeout(200);
ok(!!(await pg.$(".card-verdict")), "al volver atrás se ve el veredicto que diste, no otra vez la pregunta");
ok((await pg.$$(".fc-grade")).length === 0, "y no deja recalificar sin querer");

// ── el examen de atajos sigue siendo un test ──────────────────────────
await pg.evaluate(()=>{
  const s = window.OPE.buildSession({ mode:"exam", source:"all", section:"all", topic:"all", tema:"all",
    tipo:"opcion_unica", categoria:"atajo", count:5, qOrder:"aleatorio", shuffleOptions:true, minutes:10 });
  window.OPE.setSession(s); window.OPE.saveSessionSnapshot();
  const b=document.createElement("button"); b.setAttribute("data-goto","running");
  document.body.appendChild(b); b.click(); b.remove();
});
await pg.waitForTimeout(300);
ok(!(await pg.$("#card-reveal")), "en EXAMEN no se tapa: un examen es un test");
ok((await pg.$$("#q-body .option")).length === 4, "en examen salen las 4 opciones");

console.log("   capturas → tests/_tarjeta_frente.png · tests/_tarjeta_dorso.png");
await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
