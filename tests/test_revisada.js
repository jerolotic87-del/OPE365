/* ============================================================
   OPE365 · Marca «✓ revisada» (jsdom)

   El banco tiene 2.843 preguntas y solo una parte ha pasado por la
   reescritura a mano de docs/GUIA_ESTILO_ITEMS.md. El campo `revisada`
   lo dice, y la interfaz tiene que reflejarlo en los dos sitios donde
   importa: al estudiar (etiqueta en la pregunta) y en el Editor del
   banco (insignia y filtro, para ver el avance por pestaña).

   Falla con el código anterior: no existía ni el campo ni la etiqueta.
     node tests/test_revisada.js   → exit 0/1
============================================================ */
const fs = require("fs"), { JSDOM } = require("jsdom");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];
function boot(){
  const dom = new JSDOM(fs.readFileSync("tests/fixture.html","utf8"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window, errs = [];
  w.addEventListener("error", e=> errs.push(String(e.error && e.error.stack || e.message)));
  SCRIPTS.forEach(f=>{ try{ w.eval(fs.readFileSync(f,"utf8")); }catch(e){ errs.push(f+": "+e.message); } });
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  return { w, D:w.document, O:w.OPE, errs };
}
function goto(D,w,v){ const b=D.createElement("button"); b.setAttribute("data-goto",v); D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); }
let pass=0, fail=0;
const ck=(c,m)=>{ if(c){pass++;console.log("  OK  "+m);} else {fail++;console.error("  XX  "+m);} };

const { w, D, O, errs } = boot();
ck(errs.length===0, "carga sin errores ("+errs.join(" | ")+")");

// ── A) el dato: qué secciones están marcadas ────────────────────────
const porSeccion = {};
O.QUESTIONS.forEach(q=>{
  const s = porSeccion[q.section] || (porSeccion[q.section] = { n:0, rev:0 });
  s.n++; if(q.revisada) s.rev++;
});
const terminadas = Object.keys(porSeccion).filter(s=> porSeccion[s].rev === porSeccion[s].n);
const intactas   = Object.keys(porSeccion).filter(s=> porSeccion[s].rev === 0);
ck(terminadas.includes("archivo") && terminadas.includes("inicio"),
   `A · archivo e inicio marcadas al completo (${terminadas.sort().join(", ")})`);
ck(terminadas.length + intactas.length === Object.keys(porSeccion).length,
   "A · ninguna sección queda a medias: o entera o sin tocar");
const totalRev = O.QUESTIONS.filter(q=>q.revisada).length;
ck(totalRev > 0 && totalRev < O.QUESTIONS.length,
   `A · ${totalRev} de ${O.QUESTIONS.length} revisadas: la marca distingue de verdad`);

// La marca es solo informativa: no puede alterar el contenido ni el hash.
{
  const q = O.QUESTIONS.find(x=>x.revisada);
  const gemela = Object.assign({}, q); delete gemela.revisada;
  ck(O.contentHash(q) === O.contentHash(gemela),
     "A · el campo no entra en contentHash: el progreso previo no se invalida");
}

// ── B) al estudiar se ve la etiqueta ────────────────────────────────
function sesionCon(pred, cfg){
  const ids = O.QUESTIONS.filter(pred).slice(0,3).map(q=>q.id);
  const s = O.buildSessionFromIds(ids, Object.assign({ mode:"practice", shuffleOptions:false }, cfg||{}));
  O.setSession(s); O.saveSessionSnapshot(); goto(D,w,"running");
  return s;
}
sesionCon(q=> q.revisada && q.tipo==="opcion_unica" && q.categoria!=="atajo");
const tags = () => Array.from(D.querySelectorAll(".qcard-meta .tag")).map(t=>t.textContent.trim());
ck(tags().some(t=>/revisada/.test(t)), `B · una revisada lleva su etiqueta (${tags().join(" · ")})`);
ck(!!D.querySelector(".tag-rev"), "B · con su clase propia, para poder darle color aparte");

sesionCon(q=> !q.revisada && q.tipo==="opcion_unica" && q.categoria!=="atajo");
ck(!tags().some(t=>/revisada/.test(t)), `B · una sin revisar NO la lleva (${tags().join(" · ")})`);

// ── C) el Editor del banco filtra por ese estado ────────────────────
{
  const f = { search:"", section:"all", topic:"all", tipo:"all" };
  const rev = O.QUESTIONS.filter(q=>q.revisada).length;
  const sin = O.QUESTIONS.length - rev;
  // el filtro vive dentro del IIFE de views.js, así que se comprueba por la UI.
  // La vista solo existe con token de GitHub configurado (es de administración).
  O.GHS.setCfg({ owner:"test", repo:"OPE365", branch:"main", token:"github_pat_TEST" });
  goto(D,w,"banco");
  const sel = D.getElementById("bk-estado");
  ck(!!sel, "C · el Editor del banco abre con su filtro de estado");
  if(sel){
    const vals = Array.from(sel.options).map(o=>o.value);
    ck(vals.includes("revisada") && vals.includes("sinrevisar"),
       `C · ofrece «Revisadas» y «Sin revisar» (${vals.join(", ")})`);
    const cuenta = (v)=>{
      sel.value = v;
      sel.dispatchEvent(new w.Event("change", { bubbles:true }));
      const c = D.getElementById("bk-count");
      // el contador se pinta como "N / total": interesa el primero
      return c ? parseInt(String(c.textContent).split("/")[0].replace(/\D/g,""),10) : -1;
    };
    ck(cuenta("revisada") === rev, `C · «Revisadas» cuenta ${rev}`);
    ck(cuenta("sinrevisar") === sin, `C · «Sin revisar» cuenta ${sin}`);
    ck(cuenta("all") === O.QUESTIONS.length, "C · «Cualquier estado» vuelve al total");
  }
}

ck(errs.length===0, "sin errores de página durante todo el recorrido");
console.log(`\n${pass} OK · ${fail} fallos`);
process.exit(fail ? 1 : 0);
