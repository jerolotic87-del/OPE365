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

  // --- borrar del banco de verdad ---
  const delBlobs = [];
  const qBankFile = [{ id:"inicio-1", section:"inicio", enunciado:"uno" },
                     { id:"inicio-2", section:"inicio", enunciado:"dos" },
                     { id:"inicio-3", section:"inicio", enunciado:"tres" }];
  const fcBankFile = [{ cardId:"F-001", section:"inicio", front:"a", back:"b" },
                      { cardId:"F-002", section:"inicio", front:"c", back:"d" }];
  window.fetch = async (url, opts)=>{
    opts = opts || {};
    const method = opts.method || "GET";
    const j = (obj, status)=> ({ ok:(status||200)<300, status:status||200, json: async ()=>obj });
    if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
    if(url.indexOf("/contents/data/questions/inicio.json") >= 0)
      return j({ sha:"qsha", content: Buffer.from(JSON.stringify(qBankFile),"utf-8").toString("base64") });
    if(url.indexOf("/contents/data/flashcards/inicio.json") >= 0)
      return j({ sha:"fcsha", content: Buffer.from(JSON.stringify(fcBankFile),"utf-8").toString("base64") });
    if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"HEADSHA" } });
    if(url.indexOf("/git/commits/HEADSHA") >= 0) return j({ tree:{ sha:"BASETREE" } });
    if(method === "POST" && url.indexOf("/git/blobs") >= 0){ delBlobs.push(JSON.parse(opts.body)); return j({ sha:"dblob"+delBlobs.length }); }
    if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"DTREE" });
    if(method === "POST" && url.indexOf("/git/commits") >= 0) return j({ sha:"del9999commit" });
    if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0) return j({});
    return j({ message:"ruta no simulada: "+url }, 404);
  };
  const dsrc = ()=> delBlobs.map(x=> require("buffer").Buffer.from(x.content,"base64").toString("utf-8"));

  const dq = await O.GHS.deleteFromBank("q", "inicio-2");
  assert(dq.shaShort === "del9999", "deleteFromBank(q) devuelve el sha del commit");
  assert(dq.files.indexOf("data/questions/inicio.json") >= 0 && dq.files.indexOf("questions_data.js") >= 0
      && dq.files.indexOf("questions_all.json") >= 0, "deleteFromBank(q) commitea fuente + ambos artefactos");
  const qSrcBlob = dsrc().find(t=> t.indexOf('"inicio-1"') >= 0 && t.indexOf("window.") < 0 && t.indexOf("[") === 0);
  assert(qSrcBlob && qSrcBlob.indexOf('"inicio-2"') < 0 && qSrcBlob.indexOf('"inicio-3"') >= 0,
    "el fichero fuente pierde inicio-2 y conserva el resto sin renumerar");

  delBlobs.length = 0;
  const df = await O.GHS.deleteFromBank("fc", "inicio:F-001");
  assert(df.files.indexOf("data/flashcards/inicio.json") >= 0 && df.files.indexOf("flashcards_data.js") >= 0,
    "deleteFromBank(fc) commitea fuente + artefacto");
  const fcSrcBlob = dsrc().find(t=> t.indexOf("[") === 0 && t.indexOf("F-002") >= 0);
  assert(fcSrcBlob && fcSrcBlob.indexOf('"F-001"') < 0, "el fichero fuente de flashcards pierde F-001");

  // id que no está en el fichero -> error, nada se toca
  let dThrew = false;
  try { await O.GHS.deleteFromBank("q", "inicio-999"); } catch(e){ dThrew = /no está en/.test(e.message); }
  assert(dThrew, "deleteFromBank de un id inexistente lanza error y no commitea");

  // contenido propio sin publicar -> redirige a Mi contenido
  const uq = O.ContentEdit.createQuestion({ tipo:"opcion_unica", enunciado:"mía sin publicar",
    opciones:[{text:"a"},{text:"b"}], respuesta:"A", section:"inicio", topic:"portapapeles" });
  let uThrew = false;
  try { await O.GHS.deleteFromBank("q", uq); } catch(e){ uThrew = /Mi contenido/.test(e.message); }
  assert(uThrew, "deleteFromBank rechaza contenido propio sin publicar");

  // --- publicar una corrección al banco (applyEditToBank) ---
  const editBlobs = [];
  const qEditFile = [{ id:"inicio-7", section:"inicio", enunciado:"viejo", opciones:[{letter:"A",text:"a"},{letter:"B",text:"b"}], respuesta:"A", explicacion:"vieja" }];
  window.fetch = async (url, opts)=>{
    opts = opts || {};
    const method = opts.method || "GET";
    const j = (obj,status)=> ({ ok:(status||200)<300, status:status||200, json: async ()=>obj });
    if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
    if(url.indexOf("/contents/data/questions/inicio.json") >= 0)
      return j({ sha:"qe", content: Buffer.from(JSON.stringify(qEditFile),"utf-8").toString("base64") });
    if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"H" } });
    if(url.indexOf("/git/commits/H") >= 0) return j({ tree:{ sha:"T" } });
    if(method === "POST" && url.indexOf("/git/blobs") >= 0){ editBlobs.push(JSON.parse(opts.body)); return j({ sha:"eb"+editBlobs.length }); }
    if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"NT" });
    if(method === "POST" && url.indexOf("/git/commits") >= 0) return j({ sha:"edit777commit" });
    if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0) return j({});
    return j({ message:"no simulada: "+url }, 404);
  };
  const q7 = O.QUESTIONS.find(x=>x.id==="inicio-7") || O.Q_BY_ID["inicio-7"];
  O.ContentEdit.apply("q", "inicio-7", { explicacion:"EXPLICACIÓN CORREGIDA", enunciado:"nuevo enunciado" });
  assert(O.Q_BY_ID["inicio-7"].explicacion === "EXPLICACIÓN CORREGIDA", "corrección aplicada en memoria");
  const er = await O.GHS.applyEditToBank("q", "inicio-7");
  assert(er.shaShort === "edit777", "applyEditToBank devuelve el sha del commit");
  const srcBlob = editBlobs.map(x=> require("buffer").Buffer.from(x.content,"base64").toString("utf-8"))
    .find(t=> t.indexOf("[") === 0 && t.indexOf("inicio-7") >= 0);
  assert(srcBlob && srcBlob.indexOf("EXPLICACIÓN CORREGIDA") >= 0 && srcBlob.indexOf("nuevo enunciado") >= 0,
    "el fichero fuente recibe los campos corregidos");
  O.ContentEdit.bake("q", "inicio-7");
  assert(!O.ContentEdit.has("q", "inicio-7") && O.Q_BY_ID["inicio-7"].explicacion === "EXPLICACIÓN CORREGIDA",
    "bake() quita el override pero conserva los valores corregidos");

  /* --- publicar TODAS las correcciones de golpe: UN commit ---
     Antes solo se podía de una en una: 8 correcciones = 8 commits y 8
     confirmaciones. Aquí se comprueba que salga un único commit, que toque
     cada fichero de sección UNA vez y que los artefactos se regeneren una
     sola vez por tipo. */
  {
    const secQ = { inicio:[{ id:"inicio-7", section:"inicio", enunciado:"a" },
                           { id:"inicio-8", section:"inicio", enunciado:"b" }],
                   vista: [{ id:"vista-1", section:"vista", enunciado:"c" }] };
    const secF = { inicio:[{ cardId:"F-001", section:"inicio", front:"f1", back:"b1" }] };
    const lotBlobs = []; const lotCalls = [];
    window.fetch = async (url, opts)=>{
      opts = opts || {};
      const method = opts.method || "GET";
      lotCalls.push(method + " " + url.replace("https://api.github.com",""));
      const j = (obj, status)=> ({ ok:(status||200)<300, status:status||200, json: async ()=>obj });
      if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
      const mq = /\/contents\/data\/questions\/([a-z]+)\.json/.exec(url);
      if(mq) return secQ[mq[1]]
        ? j({ sha:"s", content: Buffer.from(JSON.stringify(secQ[mq[1]]),"utf-8").toString("base64") })
        : j({ message:"Not Found" }, 404);
      const mf = /\/contents\/data\/flashcards\/([a-z]+)\.json/.exec(url);
      if(mf) return secF[mf[1]]
        ? j({ sha:"s", content: Buffer.from(JSON.stringify(secF[mf[1]]),"utf-8").toString("base64") })
        : j({ message:"Not Found" }, 404);
      if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"H" } });
      if(url.indexOf("/git/commits/H") >= 0) return j({ tree:{ sha:"T" } });
      if(method === "POST" && url.indexOf("/git/blobs") >= 0){ lotBlobs.push(JSON.parse(opts.body)); return j({ sha:"b"+lotBlobs.length }); }
      if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"NT" });
      if(method === "POST" && url.indexOf("/git/commits") >= 0) return j({ sha:"lote99commit" });
      if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0) return j({});
      return j({ message:"no simulada: "+url }, 404);
    };

    // 4 correcciones repartidas en 3 ficheros distintos + 1 imposible
    O.ContentEdit.apply("q",  "inicio-7", { explicacion:"LOTE A" });
    O.ContentEdit.apply("q",  "inicio-8", { explicacion:"LOTE B" });
    O.ContentEdit.apply("q",  "vista-1",  { explicacion:"LOTE C" });
    O.ContentEdit.apply("fc", "inicio:F-001", { back:"LOTE D" });
    assert(O.ContentEdit.list().length >= 4, "hay 4+ correcciones pendientes");

    const lr = await O.GHS.applyEditsToBank();
    assert(lr.shaShort === "lote99c", "el lote devuelve el sha corto del commit");

    const commits = lotCalls.filter(c=> c.startsWith("POST ") && /\/git\/commits$/.test(c.split(" ")[1]));
    assert(commits.length === 1, "UN SOLO commit para las 4 correcciones (fueron " + commits.length + ")");
    const patches = lotCalls.filter(c=> c.startsWith("PATCH ") && c.indexOf("/git/refs/heads/main") >= 0);
    assert(patches.length === 1, "la rama se actualiza una sola vez (fueron " + patches.length + ")");

    assert(lr.ok.length === 4, "informa de las 4 publicadas (fueron " + lr.ok.length + ")");
    assert(lr.fallidos.length === 0, "ninguna falla con los 3 ficheros disponibles");

    // cada fichero de seccion se baja UNA vez, no una por correccion
    const getsInicio = lotCalls.filter(c=> c.indexOf("/contents/data/questions/inicio.json") >= 0);
    assert(getsInicio.length === 1, "inicio.json se lee una sola vez pese a tener 2 correcciones (fueron " + getsInicio.length + ")");

    // artefactos una sola vez por tipo
    const paths = lr.files;
    assert(paths.filter(x=> x === "questions_data.js").length === 1, "questions_data.js se regenera una vez");
    assert(paths.filter(x=> x === "flashcards_data.js").length === 1, "flashcards_data.js se regenera una vez");
    assert(paths.indexOf("data/questions/inicio.json") >= 0 && paths.indexOf("data/questions/vista.json") >= 0
        && paths.indexOf("data/flashcards/inicio.json") >= 0, "toca los 3 ficheros de seccion");

    // el contenido escrito lleva las correcciones
    const txts = lotBlobs.map(x=> Buffer.from(x.content,"base64").toString("utf-8"));
    assert(txts.some(t=> t.indexOf("LOTE A") >= 0 && t.indexOf("LOTE B") >= 0),
      "las 2 correcciones de inicio van en el MISMO fichero escrito");
    assert(txts.some(t=> t.indexOf("LOTE C") >= 0), "la de vista tambien se escribe");
    assert(txts.some(t=> t.indexOf("LOTE D") >= 0), "la flashcard tambien se escribe");

    ["inicio-7","inicio-8","vista-1"].forEach(id=> O.ContentEdit.bake("q", id));
    O.ContentEdit.bake("fc", "inicio:F-001");
  }

  /* --- un item que no se puede escribir no tumba el resto --- */
  {
    const secQ = { inicio:[{ id:"inicio-7", section:"inicio", enunciado:"a" }] };
    window.fetch = async (url, opts)=>{
      opts = opts || {};
      const method = opts.method || "GET";
      const j = (obj, status)=> ({ ok:(status||200)<300, status:status||200, json: async ()=>obj });
      if(/\/repos\/[^/]+\/[^/]+$/.test(url)) return j({ full_name:"jerolotic87-del/OPE365", permissions:{ push:true } });
      const mq = /\/contents\/data\/questions\/([a-z]+)\.json/.exec(url);
      if(mq) return secQ[mq[1]]
        ? j({ sha:"s", content: Buffer.from(JSON.stringify(secQ[mq[1]]),"utf-8").toString("base64") })
        : j({ message:"Not Found" }, 404);   // vista.json NO existe en el repo
      if(url.indexOf("/git/ref/heads/main") >= 0) return j({ object:{ sha:"H" } });
      if(url.indexOf("/git/commits/H") >= 0) return j({ tree:{ sha:"T" } });
      if(method === "POST" && url.indexOf("/git/blobs") >= 0) return j({ sha:"bb" });
      if(method === "POST" && url.indexOf("/git/trees") >= 0) return j({ sha:"NT" });
      if(method === "POST" && url.indexOf("/git/commits") >= 0) return j({ sha:"parcial9commit" });
      if(method === "PATCH" && url.indexOf("/git/refs/heads/main") >= 0) return j({});
      return j({ message:"no simulada: "+url }, 404);
    };
    O.ContentEdit.apply("q", "inicio-7", { explicacion:"SOBREVIVE" });
    O.ContentEdit.apply("q", "vista-1",  { explicacion:"NO SE PUEDE" });
    const pr = await O.GHS.applyEditsToBank();
    assert(pr.ok.length === 1 && pr.ok[0].id === "inicio-7", "publica la que sí se puede");
    assert(pr.fallidos.length === 1 && pr.fallidos[0].id === "vista-1", "informa de la que no, sin tumbar el lote");
    assert(O.ContentEdit.has("q", "vista-1"), "la fallida sigue guardada en local");
    O.ContentEdit.bake("q", "inicio-7"); O.ContentEdit.revert("q", "vista-1");
  }

  // lote sin nada pendiente -> error claro
  {
    let threwLote = false;
    try{ await O.GHS.applyEditsToBank(); }catch(e){ threwLote = /correcciones pendientes/.test(e.message); }
    assert(threwLote, "el lote sin pendientes lanza un error explicativo");
  }

  // sin token -> test() falla antes de tocar nada
  O.GHS.forget();
  assert(O.GHS.hasToken() === false, "forget borra el token");

  console.log(failures ? `\n${failures} FALLO(S)` : "\nTODO OK");
  process.exit(failures ? 1 : 0);
}
main().catch(e=>{ console.error(e); process.exit(1); });
