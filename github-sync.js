/* ============================================================
   OPE365 · Publicar contenido propio al repo (GitHub API)
   ------------------------------------------------------------
   window.OPE.GHS

   Manda las preguntas / flashcards que has creado en la app
   directamente a data/questions|flashcards/*.json del repositorio,
   en un ÚNICO commit atómico (Git Data API). GitHub Pages
   redespliega solo en ~1-2 min y el material queda permanente y
   disponible en todos tus dispositivos.

   Sin backend: usa un token personal de GitHub que se guarda SOLO
   en el localStorage de este navegador, en una clave propia
   (`ope365_gh`) — NO entra en PROGRESS, así que no viaja en los
   códigos de compartir, ni en la exportación, ni en el HTML
   empaquetado.

   El commit escribe:
     - data/<tipo>/<section>.json  (fuente, con sangría, canónica)
     - <tipo>_data.js              (artefacto que sirve la web —
                                    regenerado desde el banco en
                                    memoria + lo nuevo; un
                                    `python build_data.py` local lo
                                    normaliza igualmente)
     - data/<tipo>/manifest.json   (solo si aparece una pestaña sin
                                    fichero previo)

   Se carga después de content-overrides.js.
============================================================ */
(function(){
"use strict";
const O = window.OPE;
if(!O){ console.warn("github-sync.js: OPE no disponible"); return; }

const CFG_KEY = "ope365_gh";
const API = "https://api.github.com";
const DEFAULTS = { owner:"jerolotic87-del", repo:"OPE365", branch:"main", token:"" };

/* --- configuración (localStorage propio, fuera de PROGRESS) ---- */
function cfg(){
  let c = {};
  try { c = JSON.parse(window.localStorage.getItem(CFG_KEY) || "{}") || {}; } catch(e){}
  return Object.assign({}, DEFAULTS, c);
}
function setCfg(patch){
  const c = Object.assign(cfg(), patch || {});
  try { window.localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch(e){}
  return c;
}
function forget(){ try { window.localStorage.removeItem(CFG_KEY); } catch(e){} }
function hasToken(){ return !!(cfg().token || "").trim(); }
function repoLabel(){ const c = cfg(); return c.owner + "/" + c.repo; }

/* --- base64 utf-8 seguro ------------------------------------- */
function b64enc(str){ return btoa(unescape(encodeURIComponent(str))); }
function b64dec(str){ return decodeURIComponent(escape(atob(String(str).replace(/\s/g,"")))); }

/* --- llamada a la API --------------------------------------- */
async function gh(path, opts){
  const c = cfg();
  const token = (c.token || "").trim();
  if(!token) throw new Error("No hay token de GitHub. Configúralo en Ajustes → Publicar en GitHub.");
  const res = await fetch(API + path, Object.assign({
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }, opts || {}));
  if(!res.ok){
    let detail = "";
    try { detail = (await res.json()).message || ""; } catch(e){}
    if(res.status === 401) throw new Error("Token inválido o caducado (401).");
    if(res.status === 403) throw new Error("El token no tiene permiso para escribir en " + repoLabel() + " (403).");
    if(res.status === 404) { const e = new Error("404 " + path); e.status = 404; throw e; }
    throw new Error("GitHub " + res.status + (detail ? " · " + detail : ""));
  }
  return res.status === 204 ? null : res.json();
}

/* comprueba token + permiso de escritura */
async function test(){
  const c = cfg();
  const repo = await gh(`/repos/${c.owner}/${c.repo}`);
  if(!repo.permissions || !repo.permissions.push)
    throw new Error("El token llega al repo pero sin permiso de escritura (Contents: Read and write).");
  return repo.full_name;
}

/* lee un fichero del repo como texto + su sha (o null si no existe) */
async function getFile(path){
  const c = cfg();
  try {
    const meta = await gh(`/repos/${c.owner}/${c.repo}/contents/${encodeURIComponent(path).replace(/%2F/g,"/")}?ref=${c.branch}`);
    return { sha: meta.sha, text: b64dec(meta.content), existed: true };
  } catch(e){
    if(e.status === 404) return { sha: null, text: null, existed: false };
    throw e;
  }
}

/* commit atómico de varios ficheros (Git Data API) */
async function commitFiles(files, message){
  const c = cfg();
  const base = `/repos/${c.owner}/${c.repo}`;
  const ref = await gh(`${base}/git/ref/heads/${c.branch}`);
  const headSha = ref.object.sha;
  const headCommit = await gh(`${base}/git/commits/${headSha}`);
  const tree = [];
  for(const f of files){
    const blob = await gh(`${base}/git/blobs`, {
      method:"POST",
      body: JSON.stringify({ content: b64enc(f.content), encoding:"base64" }),
    });
    tree.push({ path: f.path, mode:"100644", type:"blob", sha: blob.sha });
  }
  const newTree = await gh(`${base}/git/trees`, {
    method:"POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  });
  const commit = await gh(`${base}/git/commits`, {
    method:"POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents:[headSha] }),
  });
  await gh(`${base}/git/refs/heads/${c.branch}`, {
    method:"PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}

/* --- limpieza de objetos para el banco ---------------------- */
function cleanCard(c, cardId){
  const out = {
    cardId,
    section: c.section,
    topic: c.topic || null,
    subtopic: c.subtopic || null,
    cardType: c.cardType === "error" ? "error" : "contenido",
    priority: c.priority === "alta" ? "alta" : "normal",
    front: String(c.front || "").trim(),
    back: String(c.back || "").trim(),
  };
  if(c.imagen) out.imagen = c.imagen;
  out.sourceRefs = (Array.isArray(c.sourceRefs) && c.sourceRefs.length) ? c.sourceRefs : ["Creada en la app"];
  out.knowledgeRefs = [];
  out.questionRefs = Array.isArray(c.questionRefs) ? c.questionRefs : [];
  return out;
}
function cleanQuestion(q, id){
  const out = {
    id,
    sourceFile: q.section + ".json",
    bloque: q.bloque || "Creada en la app",
    tipo: q.tipo || "opcion_unica",
    categoria: q.categoria || "general",
    negativa: !!q.negativa,
    section: q.section,
    topic: q.topic || null,
    subtopic: q.subtopic || null,
    tema: q.tema || null,
    sourceQuestionId: q.id || null,
    enunciado: String(q.enunciado || "").trim(),
    opciones: q.tipo === "verdadero_falso" ? [] : (q.opciones || []).map(o=>({ letter:o.letter, text:String(o.text||"").trim() })),
    matching: null,
    respuesta: q.respuesta,
    explicacion: String(q.explicacion || "").trim(),
  };
  if(q.imagen) out.imagen = q.imagen;
  out.creado = true;
  return out;
}

function nextCardNum(cards){
  let max = 0;
  cards.forEach(c=>{ const m = /^F-0*(\d+)$/.exec(c && c.cardId || ""); if(m) max = Math.max(max, +m[1]); });
  return max + 1;
}
function nextQNum(section, questions){
  const re = new RegExp("^" + section.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "-(\\d+)$");
  let max = 0;
  questions.forEach(q=>{ const m = re.exec(q && q.id || ""); if(m) max = Math.max(max, +m[1]); });
  return max + 1;
}

/* banco pristino en memoria (lo que build_data.py regeneraría, sin lo tuyo) */
function bankCards(){ return (window.__OPE365_FLASHCARDS__ || []).slice(); }
function bankQuestions(){ return (window.__OPE365_DATA__ || []).slice(); }

function dataJs(globalName, arr){
  return "window." + globalName + " = " + JSON.stringify(arr).replace(/<\/script/gi, "<\\/script") + ";\n";
}

/* --- publicación ------------------------------------------- */
/* sel opcional: { q:[ids], fc:[canonicalIds] }. Sin sel = todo lo no publicado. */
async function publish(sel){
  if(!O.ContentEdit || !O.ContentEdit.userItems) throw new Error("content-overrides.js no disponible.");
  const all = O.ContentEdit.userItems();
  let qs  = all.q.filter(x=> !x.published);
  let fcs = all.fc.filter(x=> !x.published);
  if(sel){
    const qset = new Set(sel.q || []), fset = new Set(sel.fc || []);
    qs  = qs.filter(x=> qset.has(x.id));
    fcs = fcs.filter(x=> fset.has(x.canonicalId));
  }
  if(!qs.length && !fcs.length) throw new Error("No hay contenido nuevo que publicar.");

  await test(); // falla pronto y claro si el token no sirve

  const files = {};        // path -> string content (para el commit)
  const published = [];    // { kind, localId, newId }

  /* ---- flashcards ---- */
  if(fcs.length){
    const bank = bankCards();
    const bySec = {};
    fcs.forEach(x=> (bySec[x.section] = bySec[x.section] || []).push(x));
    let manifest = null, manifestPath = "data/flashcards/manifest.json";

    for(const sec of Object.keys(bySec)){
      const path = `data/flashcards/${sec}.json`;
      const f = await getFile(path);
      const arr = f.existed ? JSON.parse(f.text) : [];
      let n = nextCardNum(arr);
      for(const x of bySec[sec]){
        const cardId = "F-" + String(n++).padStart(3,"0");
        const card = cleanCard(x, cardId);
        arr.push(card);
        bank.push(card);
        published.push({ kind:"fc", localId:x.canonicalId, newId: sec + ":" + cardId });
      }
      files[path] = JSON.stringify(arr, null, 2) + "\n";
      if(!f.existed){
        if(!manifest){ const mf = await getFile(manifestPath); manifest = JSON.parse(mf.text); }
        if(manifest.indexOf(sec + ".json") === -1) manifest.push(sec + ".json");
      }
    }
    if(manifest) files[manifestPath] = JSON.stringify(manifest, null, 2) + "\n";
    files["flashcards_data.js"] = dataJs("__OPE365_FLASHCARDS__", bank);
  }

  /* ---- preguntas ---- */
  if(qs.length){
    const bank = bankQuestions();
    const bySec = {};
    qs.forEach(x=> (bySec[x.section] = bySec[x.section] || []).push(x));
    let manifest = null, manifestPath = "data/questions/manifest.json";

    for(const sec of Object.keys(bySec)){
      const path = `data/questions/${sec}.json`;
      const f = await getFile(path);
      const arr = f.existed ? JSON.parse(f.text) : [];
      let n = nextQNum(sec, arr);
      for(const x of bySec[sec]){
        const id = sec + "-" + (n++);
        const q = cleanQuestion(x, id);
        arr.push(q);
        bank.push(q);
        published.push({ kind:"q", localId:x.id, newId:id });
      }
      files[path] = JSON.stringify(arr, null, 2) + "\n";
      if(!f.existed){
        if(!manifest){ const mf = await getFile(manifestPath); manifest = JSON.parse(mf.text); }
        if(manifest.indexOf(sec + ".json") === -1) manifest.push(sec + ".json");
      }
    }
    if(manifest) files[manifestPath] = JSON.stringify(manifest, null, 2) + "\n";
    files["questions_data.js"] = dataJs("__OPE365_DATA__", bank);
    files["questions_all.json"] = JSON.stringify(bank).replace(/<\/script/gi, "<\\/script");
  }

  const parts = [];
  if(fcs.length) parts.push(`${fcs.length} flashcard${fcs.length===1?"":"s"}`);
  if(qs.length)  parts.push(`${qs.length} pregunta${qs.length===1?"":"s"}`);
  const msg = `contenido: ${parts.join(" + ")} creada${published.length===1?"":"s"} desde la app`;

  const fileList = Object.keys(files).map(path=>({ path, content: files[path] }));
  const sha = await commitFiles(fileList, msg);

  published.forEach(p=> O.ContentEdit.markPublished(p.kind, p.localId, { sha, at: Date.now(), newId: p.newId }));

  return { sha, shaShort: sha.slice(0,7), count: published.length, files: Object.keys(files), items: published };
}

/* --- borrado del banco de verdad -------------------------------
   Quita una pregunta / flashcard del repo: la elimina de
   data/<tipo>/<section>.json (sin renumerar el resto — deja el
   hueco, igual que publish() nunca renumera al añadir) y regenera
   el artefacto que sirve la web. Un commit atómico. Irreversible
   salvo revertir el commit a mano.                                */
async function deleteFromBank(kind, id){
  await test(); // token + permiso de escritura, falla pronto

  if(kind === "fc"){
    if(O.ContentEdit && O.ContentEdit.isUser("fc", id))
      throw new Error("Es contenido tuyo sin publicar — bórralo desde “Mi contenido”.");
    const m = /^([^:]+):(.+)$/.exec(id || "");
    const card = O.F_BY_ID && O.F_BY_ID[id];
    const section = card ? card.section : (m && m[1]);
    const cardId  = card ? card.cardId  : (m && m[2]);
    if(!section || !cardId) throw new Error("No se puede deducir la sección de la flashcard " + id + ".");
    const path = `data/flashcards/${section}.json`;
    const f = await getFile(path);
    if(!f.existed) throw new Error("No existe " + path + " en el repo.");
    const arr = JSON.parse(f.text);
    const rest = arr.filter(c=> c.cardId !== cardId);
    if(rest.length === arr.length) throw new Error(`${id} no está en ${path} (¿ya borrada, o con otro cardId?).`);
    const bank = bankCards().filter(c=> (c.section + ":" + c.cardId) !== id);
    const files = [
      { path, content: JSON.stringify(rest, null, 2) + "\n" },
      { path: "flashcards_data.js", content: dataJs("__OPE365_FLASHCARDS__", bank) },
    ];
    const sha = await commitFiles(files, `contenido: borrada flashcard ${id} desde la app`);
    return { sha, shaShort: sha.slice(0,7), kind, id, files: files.map(x=>x.path) };
  }

  if(O.ContentEdit && O.ContentEdit.isUser("q", id))
    throw new Error("Es contenido tuyo sin publicar — bórralo desde “Mi contenido”.");
  const q = O.Q_BY_ID && O.Q_BY_ID[id];
  const m = /^(.+)-\d+$/.exec(id || "");
  const section = q ? ((q.sourceFile || "").replace(/\.json$/, "") || q.section) : (m && m[1]);
  if(!section) throw new Error("No se puede deducir la sección de la pregunta " + id + ".");
  const path = `data/questions/${section}.json`;
  const f = await getFile(path);
  if(!f.existed) throw new Error("No existe " + path + " en el repo.");
  const arr = JSON.parse(f.text);
  const rest = arr.filter(x=> x.id !== id);
  if(rest.length === arr.length) throw new Error(`${id} no está en ${path}.`);
  const bank = bankQuestions().filter(x=> x.id !== id);
  const files = [
    { path, content: JSON.stringify(rest, null, 2) + "\n" },
    { path: "questions_data.js", content: dataJs("__OPE365_DATA__", bank) },
    { path: "questions_all.json", content: JSON.stringify(bank).replace(/<\/script/gi, "<\\/script") },
  ];
  const sha = await commitFiles(files, `contenido: borrada pregunta ${id} desde la app`);
  return { sha, shaShort: sha.slice(0,7), kind, id, files: files.map(x=>x.path) };
}

/* cuántos elementos propios quedan sin publicar */
function pendingCount(){
  if(!O.ContentEdit || !O.ContentEdit.userItems) return 0;
  const all = O.ContentEdit.userItems();
  return all.q.filter(x=>!x.published).length + all.fc.filter(x=>!x.published).length;
}

O.GHS = {
  cfg, setCfg, forget, hasToken, repoLabel,
  test, publish, deleteFromBank, pendingCount,
  commitFiles, getFile, cleanCard, cleanQuestion, nextCardNum, nextQNum, // testables
};

})();
