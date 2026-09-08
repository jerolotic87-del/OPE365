/* QA en Chromium real de los saltos de línea al editar una pregunta.

   jsdom comprueba el <br> en el DOM; aquí se hace el recorrido de verdad:
   abrir el ✎ sobre una pregunta, TECLEAR con Intro y Mayús+Intro en el
   textarea, guardar, y ver si el salto aparece al volver a la pregunta.
   Es lo que reportó el usuario y lo que jsdom no puede reproducir, porque
   allí el valor se asigna a mano.

     node tests/manual_saltos_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8811;
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

// una pregunta cualquiera de opción única, sin imagen
const qid = await pg.evaluate(()=>{
  const q = window.OPE.QUESTIONS.find(x=> x.tipo==="opcion_unica" && !x.imagen);
  const s = window.OPE.buildSessionFromIds([q.id], { mode:"practice", shuffleOptions:false });
  window.OPE.setSession(s); window.OPE.saveSessionSnapshot();
  const b=document.createElement("button"); b.setAttribute("data-goto","running");
  document.body.appendChild(b); b.click(); b.remove();
  return q.id;
});
await pg.waitForSelector("#runner-qcard h3");

// ── se abre el ✎ y se TECLEA con Intro y Mayús+Intro ─────────────────
await pg.click("#q-edit");
await pg.waitForSelector("#edit-enun", { timeout:5000 });
await pg.fill("#edit-enun", "");
await pg.click("#edit-enun");
await pg.keyboard.type("Primera línea del enunciado.");
await pg.keyboard.press("Enter");
await pg.keyboard.press("Enter");
await pg.keyboard.type("Tras un salto de párrafo.");
await pg.keyboard.press("Shift+Enter");
await pg.keyboard.type("Y tras un Mayús+Intro.");

const enTextarea = await pg.inputValue("#edit-enun");
ok((enTextarea.match(/\n/g)||[]).length === 3, `el textarea recoge los tres saltos tecleados (${JSON.stringify(enTextarea.slice(0,40))}…)`);

// guardar
const guardado = await pg.evaluate(()=>{
  const b = Array.from(document.querySelectorAll(".modal button, .modal .btn"))
    .find(x=> /guardar/i.test(x.textContent));
  if(!b) return false; b.click(); return true;
});
ok(guardado, "el botón de guardar responde");
await pg.waitForTimeout(400);

// ── y el resultado se ve ─────────────────────────────────────────────
await pg.waitForSelector("#runner-qcard h3");
const pintado = await pg.evaluate(()=>{
  const h = document.querySelector("#runner-qcard h3");
  return { brs: h.querySelectorAll("br").length, txt: h.textContent, alto: Math.round(h.getBoundingClientRect().height) };
});
ok(pintado.brs === 3, `la pregunta se pinta con los tres saltos (${pintado.brs} <br>)`);
ok(/Tras un salto de párrafo/.test(pintado.txt) && /Mayús\+Intro/.test(pintado.txt),
   "con todo el texto de las tres partes");
ok(pintado.alto > 60, `y ocupa varias líneas de alto (${pintado.alto}px)`);
await pg.screenshot({ path:"tests/_saltos.png" });

// el dato guardado conserva los saltos, no <br> literales
const dato = await pg.evaluate((id)=> window.OPE.Q_BY_ID[id].enunciado, qid);
ok((dato.match(/\n/g)||[]).length === 3 && !/<br>/.test(dato),
   "el dato guarda saltos reales, no marcado HTML");

// ── deshacer la corrección para no dejar rastro ──────────────────────
await pg.evaluate((id)=> window.OPE.ContentEdit.revert("q", id), qid);
const limpio = await pg.evaluate((id)=> !/\n/.test(window.OPE.Q_BY_ID[id].enunciado), qid);
ok(limpio, "al descartar la corrección el enunciado vuelve al original");

console.log("   captura → tests/_saltos.png");
await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
