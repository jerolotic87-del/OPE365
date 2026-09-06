/* QA en navegador real del recuadro de feedback tras responder:
   la explicacion es UN bloque; si es larga se recorta con line-clamp y el
   boton "Continuar leyendo" la despliega EN EL SITIO (sin linea que la
   parta, sin boton en medio del texto).
     node tests/manual_feedback_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8733;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json" };
const srv = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" }); res.end(buf);
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise(r => srv.listen(PORT, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 820 } });
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto(`http://localhost:${PORT}/index.html`);
await page.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length");

// sesion de practica con una pregunta de explicacion larga
const built = await page.evaluate(() => {
  const q = window.OPE.QUESTIONS.find(x => (x.explicacion||"").length > 300 && x.tipo === "opcion_unica");
  const s = window.OPE.buildSessionFromIds([q.id], { mode:"practice", shuffleOptions:false }, 1);
  window.OPE.setSession(s);
  return { id:q.id, expLen:(q.explicacion||"").length };
});
console.log("pregunta:", built.id, "· explicacion", built.expLen, "chars");

await page.evaluate(() => {
  const b = document.createElement("button"); b.setAttribute("data-goto","running");
  document.body.appendChild(b); b.click(); b.remove();
});
await page.waitForSelector("#q-body .options .option", { timeout: 4000 });
await page.click("#q-body .options .option");           // opcion_unica: se responde al clic
await page.waitForSelector("#q-feedback .fb-gist", { timeout: 4000 });

const st = await page.evaluate(() => {
  const fb = document.querySelector(".fb");
  const p = document.querySelector(".fb-gist");
  const btn = document.querySelector(".fb-toggle");
  const kids = [...fb.children].map(c => c.className || c.tagName);
  return {
    order: kids,
    clamped: p.classList.contains("is-clamped"),
    pRect: p.getBoundingClientRect(),
    btnRect: btn ? btn.getBoundingClientRect() : null,
    btnText: btn ? btn.textContent.trim() : null,
    hasFbMore: !!document.querySelector(".fb-more"),
    pScroll: p.scrollHeight, pClient: p.clientHeight,
  };
});
console.log("hijos del recuadro:", st.order);
console.log("clamped:", st.clamped, "· boton:", JSON.stringify(st.btnText),
            "· recorta de", st.pScroll, "a", st.pClient, "px");
if (st.hasFbMore) throw new Error("sigue existiendo .fb-more (la version vieja)");
if (!st.btnRect) throw new Error("no hay boton Continuar leyendo pese a explicacion larga");
if (st.btnRect.top < st.pRect.bottom - 2) throw new Error("el boton NO esta debajo del texto (se solapa / va en medio)");
if (!st.clamped || st.pClient >= st.pScroll) throw new Error("el texto no se esta recortando");

// desplegar
await page.click(".fb-toggle");
const st2 = await page.evaluate(() => {
  const p = document.querySelector(".fb-gist"), btn = document.querySelector(".fb-toggle");
  return { clamped: p.classList.contains("is-clamped"), full: p.scrollHeight <= p.clientHeight + 1,
           btnText: btn.textContent.trim(), btnBelow: btn.getBoundingClientRect().top >= p.getBoundingClientRect().bottom - 2 };
});
console.log("tras desplegar -> clamped:", st2.clamped, "· texto completo:", st2.full, "· boton:", JSON.stringify(st2.btnText));
if (st2.clamped || !st2.full) throw new Error("desplegar no muestra el texto completo");
if (!st2.btnBelow) throw new Error("el boton ya no queda debajo del texto al desplegar");

console.log("\nTODO OK  ·  la explicacion es un solo bloque; el boton va siempre debajo");
await browser.close(); srv.close();
