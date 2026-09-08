/* QA en Chromium real de la reorganización del asistente de práctica en
   cuatro modos por habilidad (Atajos · Rutas · Iconos · Conceptos).

   Comprueba lo que jsdom no juzga bien: que los modos aparecen con su
   recuento, que el selector de pestaña SOLO ofrece las que tienen material
   («solo atajos» en Diseño daba 0), y que cada modo llega a arrancar una
   sesión cuyas preguntas son realmente de esa categoría.

     node tests/manual_modos_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8803;
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

// el banco ya no debe tener la categoría cajón de sastre
const cats = await pg.evaluate(()=>{
  const m = {}; window.OPE.QUESTIONS.forEach(q=> m[q.categoria] = (m[q.categoria]||0)+1); return m;
});
ok(!cats.general, `El banco ya no tiene categoría «general» (${JSON.stringify(cats)})`);

const irAlAsistente = async ()=>{
  await pg.evaluate(()=>{ const b=document.createElement("button");
    b.setAttribute("data-goto","practica"); document.body.appendChild(b); b.click(); b.remove(); });
  await pg.waitForSelector("#in-tema", { timeout:8000 });
  await pg.click("#in-tema");
  await pg.waitForSelector("#wiz-scope .choice-card", { timeout:8000 });
};

await irAlAsistente();

const modos = await pg.evaluate(()=> Array.from(document.querySelectorAll("#wiz-scope .choice-card")).map(c=>({
  id: c.getAttribute("data-scope"),
  titulo: (c.querySelector(".t")||{textContent:""}).textContent.trim(),
  n: parseInt(((c.querySelector(".sk-n")||{textContent:"0"}).textContent||"0").replace(/\D/g,""), 10),
})));
ok(modos.length === 4, `El primer nivel ofrece 4 modos, no 7 (${modos.length})`);
ok(modos.map(m=>m.id).join(",") === "atajos,rutas,iconos,conceptos",
   `Los modos son Atajos, Rutas, Iconos y Conceptos (${modos.map(m=>m.id).join(", ")})`);
ok(modos.every(m=> m.n > 0), `Cada modo muestra su recuento (${modos.map(m=>m.id+":"+m.n).join(" · ")})`);

const otras = await pg.evaluate(()=> document.querySelectorAll("#wiz-scope-2 .choice-card").length);
ok(otras === 5, `Las otras formas de entrar quedan en un desplegable aparte (${otras})`);

/* ── el selector de pestaña no puede ofrecer combinaciones vacías ── */
for(const modo of ["atajos","rutas","iconos","conceptos"]){
  await pg.click(`#wiz-scope .choice-card[data-scope="${modo}"]`);
  await pg.waitForSelector("#wiz-skill-section", { timeout:5000 });
  const info = await pg.evaluate((m)=>{
    const sel = document.querySelector("#wiz-skill-section");
    const opts = Array.from(sel.options).map(o=>({ v:o.value, txt:o.textContent }));
    // recuento real de cada pestaña ofrecida, calculado con el propio filtro
    const base = m === "iconos" ? { conImagen:true }
               : { categoria: m === "atajos" ? "atajo" : m === "rutas" ? "ruta" : "concepto" };
    const reales = opts.filter(o=>o.v!=="all").map(o=>({
      v:o.v, n: window.OPE.filterQuestions(Object.assign({section:o.v}, base)).length }));
    return { opts, reales, vacias: reales.filter(r=>r.n===0) };
  }, modo);
  ok(info.vacias.length === 0,
     `${modo}: ninguna pestaña ofrecida está vacía (${info.opts.length-1} ofrecidas)`);
  ok(info.opts.every(o=> /\(\d+\)/.test(o.txt)),
     `${modo}: cada pestaña muestra su recuento`);
}

// Diseño no tiene atajos: no debe aparecer en el modo Atajos, y sí en Conceptos
await pg.click(`#wiz-scope .choice-card[data-scope="atajos"]`);
await pg.waitForSelector("#wiz-skill-section");
const enAtajos = await pg.evaluate(()=> Array.from(document.querySelector("#wiz-skill-section").options).map(o=>o.value));
await pg.click(`#wiz-scope .choice-card[data-scope="conceptos"]`);
await pg.waitForSelector("#wiz-skill-section");
const enConceptos = await pg.evaluate(()=> Array.from(document.querySelector("#wiz-skill-section").options).map(o=>o.value));
ok(!enAtajos.includes("diseno"), "Diseño NO se ofrece en Atajos (no tiene ninguno)");
ok(enConceptos.includes("diseno"), "Diseño SÍ se ofrece en Conceptos (tiene 86)");

/* ── cada modo arranca una sesión del contenido correcto ── */
for(const [modo, comprueba] of [
  ["atajos",    q=> q.categoria === "atajo"],
  ["rutas",     q=> q.categoria === "ruta"],
  ["conceptos", q=> q.categoria === "concepto"],
  ["iconos",    q=> !!q.imagen],
]){
  await irAlAsistente();
  await pg.click(`#wiz-scope .choice-card[data-scope="${modo}"]`);
  await pg.click("#wiz-next");
  await pg.waitForSelector("#wiz-count-pills", { timeout:5000 });
  await pg.click('#wiz-count-pills [data-c="10"]');
  await pg.click("#wiz-next");
  await pg.waitForSelector("#wiz-start, [id^=wiz-start]", { timeout:5000 }).catch(()=>{});
  const arranco = await pg.evaluate(()=>{
    const b = document.querySelector("#wiz-start") ||
      Array.from(document.querySelectorAll("button")).find(x=>/empezar|comenzar|iniciar/i.test(x.textContent));
    if(!b) return false; b.click(); return true;
  });
  await pg.waitForTimeout(400);
  const res = await pg.evaluate(()=>{
    const s = window.OPE.getSession();
    if(!s) return null;
    return s.questionIds.map(id=>{ const q = window.OPE.Q_BY_ID[id];
      return q ? { categoria:q.categoria, imagen:!!q.imagen } : null; }).filter(Boolean);
  });
  ok(arranco && res && res.length > 0, `${modo}: la sesión arranca (${res ? res.length : 0} preguntas)`);
  if(res && res.length) ok(res.every(comprueba), `${modo}: todas las preguntas son del modo elegido`);
}

await pg.screenshot({ path:"tests/_modos.png" });
console.log("   captura → tests/_modos.png");
await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
