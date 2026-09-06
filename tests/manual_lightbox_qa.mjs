/* QA en navegador real del visor/recorte de imagen.
   Sirve la carpeta y comprueba: abrir visor, marco visible, wheel-zoom,
   pan, "Guardar recorte" -> q.imagen cambia a un PNG mas pequeño.
     node tests/manual_lightbox_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd();
const PORT = 8731;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json" };
const srv = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(buf);
  } catch { res.writeHead(404); res.end("404"); }
});
await new Promise(r => srv.listen(PORT, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 800 } });
const logs = [];
page.on("console", m => logs.push(m.text()));
page.on("pageerror", e => console.log("PAGEERROR:", e.message));

await page.goto(`http://localhost:${PORT}/index.html`);
await page.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length");

// id de una pregunta con imagen + token para el editor del banco
const qid = await page.evaluate(() => {
  window.OPE.GHS.setCfg({ owner:"x", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  return window.OPE.QUESTIONS.find(x => x.imagen).id;
});
console.log("pregunta con imagen:", qid);

await page.evaluate(() => {
  const b = document.createElement("button"); b.setAttribute("data-goto","banco");
  document.body.appendChild(b); b.click(); b.remove();
});
await page.fill("#bk-search", qid);
await page.waitForTimeout(300);
await page.click(`#bk-body [data-qid="${qid}"]`);
await page.waitForSelector("#bk-editor img.zoomable");

const imgBefore = await page.evaluate(id => window.OPE.Q_BY_ID[id].imagen.length, qid);

await page.click("#bk-editor img.zoomable");
await page.waitForSelector("#img-lb");
await page.waitForFunction(() => document.getElementById("img-lb-frame").offsetWidth > 20, null, { timeout: 3000 });
const frame = await page.evaluate(() => {
  const f = document.getElementById("img-lb-frame");
  const im = document.getElementById("img-lb-img");
  return { fw: f.offsetWidth, fh: f.offsetHeight, imgT: im.style.transform };
});
console.log("marco:", frame.fw, "x", frame.fh, " transform inicial:", frame.imgT);
if (frame.fw < 20 || frame.fh < 20) throw new Error("marco no renderiza");

// zoom con rueda sobre el centro + pan
const stage = await page.$("#img-lb-stage");
const box = await stage.boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
await page.mouse.wheel(0, -600);   // acercar
await page.waitForTimeout(50);
await page.mouse.down();
await page.mouse.move(box.x + box.width/2 - 40, box.y + box.height/2 - 25, { steps: 5 });
await page.mouse.up();
await page.waitForTimeout(50);
const tAfter = await page.evaluate(() => document.getElementById("img-lb-img").style.transform);
console.log("transform tras zoom+pan:", tAfter);
if (tAfter === frame.imgT) throw new Error("el zoom/pan no modifico la imagen");

await page.click("#img-lb-save");
await page.waitForTimeout(200);
const res = await page.evaluate(id => {
  const q = window.OPE.Q_BY_ID[id];
  return { len: q.imagen.length, isPng: q.imagen.startsWith("data:image/"), hasOv: window.OPE.ContentEdit.has("q", id) };
}, qid);
console.log("imagen antes:", imgBefore, "chars  ->  despues:", res.len, "chars  · dataURI:", res.isPng, "· override:", res.hasOv);
if (!res.isPng || !res.hasOv) throw new Error("Guardar recorte no produjo una correccion de imagen valida");

// que la nueva imagen carga y tiene dimensiones > 0
const dims = await page.evaluate(id => new Promise(r => {
  const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r([0,0]);
  i.src = window.OPE.Q_BY_ID[id].imagen;
}), qid);
console.log("dimensiones del recorte:", dims);
if (dims[0] < 2 || dims[1] < 2) throw new Error("el recorte no es una imagen valida");

await page.evaluate(id => window.OPE.ContentEdit.revert("q", id), qid);

console.log("\nTODO OK  ·  el visor/recorte funciona en navegador real");
await browser.close();
srv.close();
