// Prueba jsdom de github-sync.js (OPE.GHS): configuración del token,
// limpieza de objetos, numeración de ids y publicación (commit atómico
// simulado con fetch mockeado). No toca la red real.
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function read(name){ return fs.readFileSync(path.join(ROOT, name), "utf-8"); }

async function main(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts: "dangerously", url: "http://localhost/" });
  const { window } = dom;
  function runScript(code){ window.eval(code); }
  runScript(read("questions_data.js"));
  runScript(read("taxonomy_data.js"));
  runScript(read("flashcards_data.js"));
  runScript(read("app.js"));
  runScript(read("content-overrides.js"));
  runScript(read("github-sync.js"));
  runScript(read("engine.js"));
  runScript(read("engine-bridge.js"));

  const O = window.OPE;
  let failures = 0;
  const assert = (c,m)=>{ if(!c){ failures++; console.error("FALLO:", m); } else console.log("OK:", m); };

  assert(!!O.GHS, "OPE.GHS existe");

  // --- configuración ---
  assert(O.GHS.hasToken() === false, "sin token al inicio");
  O.GHS.setCfg({ owner:"jerolotic87-del", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  assert(O.GHS.hasToken() === true, "hasToken tras setCfg");
  assert(O.GHS.repoLabel() === "jerolotic87-del/OPE365", "repoLabel");
  assert(window.localStorage.getItem("ope365_gh").indexOf("github_pat_TEST") >= 0, "token en su clave propia (localStorage)");
  assert((O.PROGRESS && JSON.stringify(O.PROGRESS).indexOf("github_pat_TEST") < 0), "token NO está en PROGRESS");

  // --- limpieza / numeración ---
  const card = O.GHS.cleanCard({ section:"inicio", topic:"x", front:"F", back:"B", imagen:"data:img", extra:1 }, "F-009");
  assert(card.cardId === "F-009" && !("extra" in card) && card.imagen === "data:img", "cleanCard normaliza y conserva imagen");
  assert(card.sourceRefs.length === 1, "cleanCard pone sourceRefs por defecto");
  assert(O.GHS.nextCardNum([{cardId:"F-001"},{cardId:"F-014"},{cardId:"U-x"}]) === 15, "nextCardNum = max+1");
  assert(O.GHS.nextQNum("inicio", [{id:"inicio-3"},{id:"inicio-40"},{id:"vista-99"}]) === 41, "nextQNum por sección");

  const q = O.GHS.cleanQuestion({ id:"usr-q-abc", section:"inicio", topic:"t", tipo:"opcion_unica",
    enunciado:"¿?", opciones:[{letter:"A",text:"a"},{letter:"B",text:"b"}], respuesta:"A", explicacion:"e" }, "inicio-394");
  assert(q.id === "inicio-394" && q.sourceFile === "inicio.json" && q.sourceQuestionId === "usr-q-abc" && q.creado === true,
    "cleanQuestion asigna id/sourceFile y guarda procedencia");

  // --- publicar: crear contenido propio y simular la API ---
  const qid = O.ContentEdit.createQuestion({ tipo:"opcion_unica", enunciado:"Pregunta de prueba",
    opciones:[{text:"uno"},{text:"dos"},{text:"tres"}], respuesta:"A", section:"inicio", topic:"portapapeles" });
  const fcId = O.ContentEdit.createFlashcard({ front:"Frente prueba", back:"Dorso prueba", section:"inicio", topic:"portapapeles" });
  assert(O.GHS.pendingCount() === 2, "pendingCount = 2 tras crear");

  // banco de destino simulado
  const fcFile = [{ cardId:"F-001", section:"inicio", front:"a", back:"b" }, { cardId:"F-002", section:"inicio", front:"c", back:"d" }];
  const qFile  = [{ id:"inicio-1", section:"inicio", enunciado:"x" }, { id:"inicio-2", section:"inicio", enunciado:"y" }];
  const calls = [];
  const blobs = [];
  window.fetch = async (url, opts)=>{
    opts = opts || {};
    const method = opts.method || "GET";
    calls.push(method + " " + url.replace("https://api.github.com",""));
    const j = (obj, status)=> ({ ok: (status||200) < 300, status: status||200,
      json: async ()=> obj, });
    if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
    if(url.indexOf("/contents/data/flashcards/inicio.json") >= 0)
      return j({ sha:"fcsha", content: Buffer.from(JSON.stringify(fcFile),"utf-8").toString("base64") });
    if(url.indexOf("/contents/data/questions/inicio.json") >= 0)
      return j({ sha:"qsha", content: Buffer.from(JSON.stringify(qFile),"utf-8").toString("base64") });
    if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"HEADSHA" } });
    if(url.indexOf("/git/commits/HEADSHA") >= 0) return j({ tree:{ sha:"BASETREE" } });
    if(method === "POST" && url.indexOf("/git/blobs") >= 0){ blobs.push(JSON.parse(opts.body)); return j({ sha:"blob"+blobs.length }); }
    if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"NEWTREE" });
    if(method === "POST" && url.indexOf("/git/commits") >= 0) return j({ sha:"abc1234def5678" });
    if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0) return j({});
    return j({ message:"ruta no simulada: "+url }, 404);
  };

  const res = await O.GHS.publish();
  assert(res.count === 2, "publish informa 2 elementos");
  assert(res.shaShort === "abc1234", "sha corto del commit");
  assert(calls.some(c=>c.startsWith("PATCH ") && c.indexOf("/git/refs/heads/main") >= 0), "actualiza la rama (PATCH ref)");
  assert(res.files.indexOf("data/flashcards/inicio.json") >= 0 && res.files.indexOf("flashcards_data.js") >= 0
      && res.files.indexOf("data/questions/inicio.json") >= 0 && res.files.indexOf("questions_data.js") >= 0,
    "commitea fuente + artefacto para ambos tipos");

  // el blob de la fuente contiene la tarjeta nueva con el id correcto
  const b64 = require("buffer").Buffer;
  const fcBlob = blobs.map(x=> b64.from(x.content, "base64").toString("utf-8")).find(t=> t.indexOf("data/flashcards") < 0 && t.indexOf("Frente prueba") >= 0);
  assert(fcBlob && fcBlob.indexOf('"F-003"') >= 0, "la flashcard nueva se numera F-003 en el fichero fuente");
  const qBlob = blobs.map(x=> b64.from(x.content, "base64").toString("utf-8")).find(t=> t.indexOf("Pregunta de prueba") >= 0 && t.indexOf("window.__OPE365_DATA__") < 0);
  assert(qBlob && qBlob.indexOf('"inicio-3"') >= 0, "la pregunta nueva se numera inicio-3 en el fichero fuente");

  // marcadas como publicadas
  assert(O.GHS.pendingCount() === 0, "pendingCount = 0 tras publicar");
  const list = O.ContentEdit.listUser();
  assert(list.every(it=> it.published && it.published.sha === "abc1234def5678"), "listUser marca published con el sha");

  // sin contenido nuevo -> error claro
  let threw = false;
  try { await O.GHS.publish(); } catch(e){ threw = /nuevo que publicar/.test(e.message); }
  assert(threw, "publish sin pendientes lanza error explicativo");

  // sin token -> test() falla antes de tocar nada
  O.GHS.forget();
  assert(O.GHS.hasToken() === false, "forget borra el token");

  console.log(failures ? `\n${failures} FALLO(S)` : "\nTODO OK");
  process.exit(failures ? 1 : 0);
}
main().catch(e=>{ console.error(e); process.exit(1); });
