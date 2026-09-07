/* QA en navegador real de la pestana Iconos: aparece en la nav, el hub
   lista los iconos por pestana, y "Empezar" arranca una sesion del runner
   con la imagen visible.   node tests/manual_iconos_qa.mjs */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
const ROOT = process.cwd(), PORT = 8791;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json" };
const srv = createServer(async (req,res)=>{ try{ let p=decodeURIComponent(req.url.split("?")[0]); if(p==="/")p="/index.html"; const b=await readFile(join(ROOT,p)); res.writeHead(200,{"content-type":MIME[extname(p)]||"application/octet-stream"}); res.end(b);}catch{res.writeHead(404);res.end("404");}});
await new Promise(r=>srv.listen(PORT,r));
const br = await chromium.launch();
const pg = await br.newPage({ viewport:{ width:420, height:820 } });
pg.on("pageerror", e=>console.log("PAGEERROR:", e.message));
await pg.goto(`http://localhost:${PORT}/index.html`);
await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length");

const tabExists = await pg.evaluate(()=>{
  const b = [...document.querySelectorAll('[data-goto]')].find(x=>x.getAttribute('data-goto')==='iconos');
  if(b){ b.click(); return true; } return false;
});
console.log("pestana Iconos en la nav:", tabExists);
await pg.waitForSelector("#ic-start", { timeout:4000 });
console.log("hub:", await pg.$eval(".view-head h1", e=>e.textContent),
            "| total:", await pg.$eval(".test-preview .big", e=>e.textContent),
            "| chips:", await pg.$$eval("#ic-chips .chip-btn", els=>els.length));

await pg.evaluate(()=>{ const c=[...document.querySelectorAll('#ic-chips .chip-btn')].find(x=>/Insertar/.test(x.textContent)); if(c) c.click(); });
await pg.waitForTimeout(150);
await pg.click("#ic-start");
await pg.waitForSelector("#q-body", { timeout:4000 });
const nImg = await pg.$$eval(".q-image img.zoomable", els=>els.length);
console.log("sesion arrancada · imagen visible:", nImg>0);
if(!tabExists) throw new Error("no aparece la pestana");
if(nImg===0) throw new Error("la sesion de iconos no muestra imagen");
console.log("\nOK");
await br.close(); srv.close();
