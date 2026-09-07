/* QA en Chromium real: la barra de "publicar todas las correcciones" del
   Editor del banco. Antes solo se podía publicar de una en una, desde el
   panel de cada pregunta — con 8 correcciones eran 8 commits y 8
   confirmaciones. Aquí se comprueba que:
     · la barra sale siempre, y el contador sube al editar
     · el botón se habilita solo cuando hay algo pendiente
     · "Ver cuáles" lista lo pendiente y deja saltar a cada una
     · publicar dispara UN solo commit (API de GitHub mockeada, sin red)

     node tests/manual_publish_lote_qa.mjs
*/
import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const ROOT = process.cwd(), PORT = 8801;
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
const pg = await browser.newPage({ viewport:{ width:1200, height:900 } });
pg.on("pageerror", e=>{ fails++; console.error("PAGEERROR:", e.message); });

await pg.goto(`http://localhost:${PORT}/index.html`);
await pg.waitForFunction("window.OPE && window.OPE.QUESTIONS && window.OPE.QUESTIONS.length && window.OPE.GHS");

// token falso + API de GitHub simulada: no se toca la red ni el repo real
await pg.evaluate(()=>{
  window.OPE.GHS.setCfg({ token:"ghp_falso_para_pruebas" });
  window.__commits = 0; window.__patches = 0; window.__gets = [];
  const secQ = {};
  window.fetch = async (url, opts)=>{
    opts = opts || {};
    const method = opts.method || "GET";
    const j = (obj, st)=> ({ ok:(st||200)<300, status:st||200, json: async ()=>obj });
    if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
    const mq = /\/contents\/data\/questions\/([a-z]+)\.json/.exec(url);
    if(mq){
      window.__gets.push(mq[1]);
      if(!secQ[mq[1]]) secQ[mq[1]] = window.OPE.QUESTIONS.filter(q=>q.section===mq[1])
        .map(q=>({ id:q.id, section:q.section, enunciado:q.enunciado, opciones:q.opciones, respuesta:q.respuesta, explicacion:q.explicacion }));
      return j({ sha:"s", content: btoa(unescape(encodeURIComponent(JSON.stringify(secQ[mq[1]])))) });
    }
    if(/\/contents\/data\/flashcards\//.test(url)) return j({ message:"Not Found" }, 404);
    if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"H" } });
    if(url.indexOf("/git/commits/H") >= 0) return j({ tree:{ sha:"T" } });
    if(method === "POST" && url.indexOf("/git/blobs") >= 0) return j({ sha:"b" });
    if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"NT" });
    if(method === "POST" && url.indexOf("/git/commits") >= 0){ window.__commits++; return j({ sha:"lotecommit123456" }); }
    if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0){ window.__patches++; return j({}); }
    return j({ message:"no simulada" }, 404);
  };
});

await pg.evaluate(()=>{ const b=document.createElement("button");
  b.setAttribute("data-goto","banco"); document.body.appendChild(b); b.click(); b.remove(); });
await pg.waitForSelector("#bk-pubbar", { timeout:10000 });

const vacia = await pg.evaluate(()=>({
  texto: document.querySelector("#bk-pubbar .pb-txt").textContent,
  deshabilitado: document.querySelector("#bk-pub-all").disabled,
  visible: getComputedStyle(document.querySelector("#bk-pubbar")).display !== "none",
}));
ok(vacia.visible, "La barra de publicar está siempre visible en el Editor del banco");
ok(/Sin correcciones pendientes/.test(vacia.texto), "Sin nada pendiente lo dice claramente");
ok(vacia.deshabilitado, "Con 0 pendientes el botón está deshabilitado");

// 5 correcciones en 2 secciones distintas, hechas por la API de la app
await pg.evaluate(()=>{
  const O = window.OPE;
  const ini = O.QUESTIONS.filter(q=>q.section==="inicio").slice(0,3);
  const vis = O.QUESTIONS.filter(q=>q.section==="vista").slice(0,2);
  window.__editadas = ini.concat(vis).map(q=>q.id);
  window.__editadas.forEach((id,i)=> O.ContentEdit.apply("q", id, { explicacion:"CORRECCION EN LOTE "+i }));
});
await pg.evaluate(()=> window.OPE_TEST_REFRESH_BAR ? null : null);
await pg.evaluate(()=>{ const b=document.createElement("button");
  b.setAttribute("data-goto","banco"); document.body.appendChild(b); b.click(); b.remove(); });
await pg.waitForTimeout(200);

const con = await pg.evaluate(()=>({
  texto: document.querySelector("#bk-pubbar .pb-txt").textContent,
  boton: document.querySelector("#bk-pub-all").textContent.trim(),
  activo: !document.querySelector("#bk-pub-all").disabled,
  resaltada: document.querySelector("#bk-pubbar").classList.contains("on"),
}));
ok(/5\s*correcciones sin publicar/.test(con.texto.replace(/\s+/g," ")), `La barra cuenta las 5 (dice: ${JSON.stringify(con.texto.trim().slice(0,45))})`);
ok(/Publicar las 5/.test(con.boton), `El botón dice cuántas publica (${JSON.stringify(con.boton)})`);
ok(con.activo, "Con pendientes el botón se habilita");
ok(con.resaltada, "La barra se resalta cuando hay algo que publicar");

// "Ver cuáles" lista lo pendiente
await pg.click("#bk-pub-ver");
await pg.waitForSelector("[data-pend]", { timeout:5000 });
const listado = await pg.evaluate(()=> document.querySelectorAll("[data-pend]").length);
ok(listado === 5, `«Ver cuáles» lista las 5 correcciones (${listado})`);
await pg.click("#pv-x");

// publicar todas -> UN commit
await pg.click("#bk-pub-all");
await pg.waitForSelector("#cd-yes, .modal button", { timeout:5000 });
const btnConfirm = await pg.evaluate(()=>{
  const b = Array.from(document.querySelectorAll(".modal button, dialog button"))
    .find(x=> /publicar|s[ií]|confirmar|entiendo/i.test(x.textContent));
  if(b){ b.id = b.id || "qa-confirm"; return b.id; }
  return null;
});
ok(!!btnConfirm, "Sale la confirmación antes de tocar el repo");
if(btnConfirm) await pg.click("#" + btnConfirm);

await pg.waitForFunction("window.__commits > 0", null, { timeout:15000 });
await pg.waitForTimeout(400);
const res = await pg.evaluate(()=>({
  commits: window.__commits, patches: window.__patches,
  gets: window.__gets.slice(),
  pendientes: window.OPE.ContentEdit.list().length,
  texto: (document.body.textContent||"").slice(0,0) || "",
  modal: (document.querySelector(".modal, dialog")||{textContent:""}).textContent,
}));
ok(res.commits === 1, `Las 5 correcciones salen en UN SOLO commit (fueron ${res.commits})`);
ok(res.patches === 1, `La rama se actualiza una sola vez (${res.patches})`);
ok(res.gets.length === 2, `Cada fichero de sección se lee una vez, no una por corrección (${res.gets.join(", ")})`);
ok(res.pendientes === 0, `No quedan correcciones pendientes tras publicar (${res.pendientes})`);
ok(/publicada/i.test(res.modal), "Se confirma en pantalla que se publicaron");

await pg.screenshot({ path:"tests/_publish_lote.png" });
console.log("   captura → tests/_publish_lote.png");

await browser.close(); srv.close();
console.log(fails ? `\n${fails} fallo(s)` : "\nTODO OK");
process.exit(fails ? 1 : 0);
