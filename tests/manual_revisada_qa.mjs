/* QA en Chromium real de la marca «✓ revisada».

   jsdom confirma que la etiqueta está en el DOM; lo que aquí importa es que se
   VEA como una marca discreta y no compita con el enunciado, y que el filtro
   del Editor del banco dé el avance por pestaña de un vistazo.

     node tests/manual_revisada_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8809;
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
const pg = await browser.newPage({ viewport:{ width:430, height:900 } });
pg.on("pageerror", e=>{ fails++; console.error("PAGEERROR:", e.message); });
await pg.goto(`http://localhost:${PORT}/index.html`);
await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length");

// ── el reparto del dato ───────────────────────────────────────────────
const reparto = await pg.evaluate(()=>{
  const m = {};
  window.OPE.QUESTIONS.forEach(q=>{
    const s = m[q.section] || (m[q.section] = { n:0, rev:0 });
    s.n++; if(q.revisada) s.rev++;
  });
  return m;
});
const hechas = Object.keys(reparto).filter(s=> reparto[s].rev === reparto[s].n).sort();
ok(hechas.join(",") === "archivo,inicio", `secciones marcadas al completo: ${hechas.join(", ")}`);

// ── se ve al estudiar, y discreta ─────────────────────────────────────
const arranca = async (pred)=> pg.evaluate((p)=>{
  const f = new Function("q", "return " + p);
  const ids = window.OPE.QUESTIONS.filter(f).slice(0,2).map(q=>q.id);
  const s = window.OPE.buildSessionFromIds(ids, { mode:"practice", shuffleOptions:false });
  window.OPE.setSession(s); window.OPE.saveSessionSnapshot();
  const b = document.createElement("button"); b.setAttribute("data-goto","running");
  document.body.appendChild(b); b.click(); b.remove();
}, pred);

await arranca(`q.revisada && q.tipo==="opcion_unica" && q.categoria!=="atajo"`);
await pg.waitForSelector(".tag-rev", { timeout:5000 });
const marca = await pg.evaluate(()=>{
  const t = document.querySelector(".tag-rev"), h = document.querySelector("#runner-qcard h3");
  const ct = getComputedStyle(t), ch = getComputedStyle(h);
  return { texto:t.textContent.trim(), tam:parseFloat(ct.fontSize), tamEnunciado:parseFloat(ch.fontSize),
           color:ct.color, fondo:ct.backgroundColor, ancho:Math.round(t.getBoundingClientRect().width) };
});
ok(/revisada/.test(marca.texto), `la pregunta lleva la marca («${marca.texto}»)`);
ok(marca.tam < marca.tamEnunciado, `es más pequeña que el enunciado (${marca.tam}px frente a ${marca.tamEnunciado}px)`);
// verde, no el gris por defecto de .tag: si la regla queda antes de la base
// en el CSS, la pisa y la marca se pinta como cualquier otra etiqueta
const gris = await pg.evaluate(()=> getComputedStyle(document.querySelector(".tag:not(.tag-rev)")).color);
ok(marca.color !== gris, `tiene color propio, no el gris de las demás (${marca.color} frente a ${gris})`);
ok(marca.ancho < 120, `no ocupa media línea (${marca.ancho}px)`);
await pg.screenshot({ path:"tests/_revisada.png" });

await arranca(`!q.revisada && q.tipo==="opcion_unica" && q.categoria!=="atajo"`);
await pg.waitForTimeout(250);
ok((await pg.$$(".tag-rev")).length === 0, "una sin revisar no la lleva");

// ── el Editor del banco da el avance ──────────────────────────────────
await pg.evaluate(()=>{
  window.OPE.GHS.setCfg({ owner:"test", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  const b = document.createElement("button"); b.setAttribute("data-goto","banco");
  document.body.appendChild(b); b.click(); b.remove();
});
await pg.waitForSelector("#bk-estado", { timeout:5000 });
const cuenta = async (estado, seccion)=>{
  await pg.selectOption("#bk-estado", estado);
  if(seccion) await pg.selectOption("#bk-section", seccion);
  await pg.waitForTimeout(150);
  return pg.evaluate(()=> document.getElementById("bk-count").textContent.trim());
};
const total = await pg.evaluate(()=> window.OPE.QUESTIONS.length);
const rev = await pg.evaluate(()=> window.OPE.QUESTIONS.filter(q=>q.revisada).length);
ok((await cuenta("revisada")).startsWith(String(rev)), `filtro «Revisadas»: ${rev} de ${total}`);
ok((await cuenta("sinrevisar")).startsWith(String(total-rev)), `filtro «Sin revisar»: ${total-rev}`);
// avance de una pestaña concreta, que es el uso real
const insertarSin = await cuenta("sinrevisar", "insertar");
ok(insertarSin.startsWith(String(reparto.insertar.n - reparto.insertar.rev)),
   `avance por pestaña: insertar sin revisar = ${insertarSin}`);
const filas = await pg.evaluate(()=> Array.from(document.querySelectorAll("#bk-body .badge")).slice(0,5).map(b=>b.textContent.trim()));
ok(filas.every(f=> f !== "✓"), `en «sin revisar» ninguna fila lleva el ✓ (${filas.join(" ")})`);
await pg.selectOption("#bk-estado", "revisada");
await pg.selectOption("#bk-section", "inicio");
await pg.waitForTimeout(200);
const filas2 = await pg.evaluate(()=> Array.from(document.querySelectorAll("#bk-body .badge")).slice(0,5).map(b=>b.textContent.trim()));
ok(filas2.length > 0 && filas2.every(f=> f === "✓"), `en «revisadas» todas lo llevan (${filas2.join(" ")})`);
await pg.screenshot({ path:"tests/_revisada_banco.png" });

console.log("   capturas → tests/_revisada.png · tests/_revisada_banco.png");
await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
