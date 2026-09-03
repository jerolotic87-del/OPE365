/* ============================================================
   OPE365 · Borrado de datos (jsdom)
   Verifica que O.resetProgress hace lo que dice:
   - "progress": borra TODO el aprendizaje (respuestas, marcadas,
     historial, desafíos, flashcards y el estado completo del motor),
     conserva ajustes + contenido propio + correcciones.
   - "all": deja localStorage vacío (blob + config de GitHub).
   Antes de este test, "Borrar todo" solo reseteaba 6 de ~18 claves
   y el motor / flashcards / contenido propio revivían al persistir.
     node tests/test_reset.js
============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const read = n => fs.readFileSync(path.join(ROOT, n), "utf-8");
const SCRIPTS = ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js",
  "content-overrides.js","github-sync.js","engine.js","engine-bridge.js","peerjs.min.js","multiplayer.js","views.js"];

function boot(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts:"dangerously", url:"http://localhost/" });
  const w = dom.window;
  SCRIPTS.forEach(f=> w.eval(read(f)));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  return w;
}

let fail = 0;
const ok = (c,m)=>{ console.log((c?"  OK  ":"  XX  ")+m); if(!c) fail++; };

(function main(){
  const w = boot();
  const O = w.OPE;
  ok(typeof O.resetProgress === "function", "O.resetProgress existe");
  ok(typeof O.pushHistory === "function", "O.pushHistory existe");

  // --- sembrar de todo ---
  const q = O.QUESTIONS.find(x=>x.tipo==="opcion_unica");
  O.recordAnswer(q, q.respuesta, true);
  O.PROGRESS.marked[q.id] = true;
  O.pushHistory({ mode:"practice", finishedAt:Date.now(), total:1, correct:1, accuracy:100, answers:{} });
  O.PROGRESS.challenges["c-test"] = { challengeId:"c-test", role:"creator", status:"CREATED" };
  const fc = O.FLASHCARDS[0];
  O.setFlashcardMastered(fc.canonicalId, true);
  // estado del motor
  const cid = O.LE.CONCEPT_OF_Q[q.id];
  O.LE.recordEvent({ kind:"q", ref:q.id, concept:cid, grade:"good", correct:true, ms:1500 });
  O.LE.setPlan({ examDate: Date.now() + 30*86400000, minutesPerDay: 25 });
  // contenido propio + corrección
  const uqid = O.ContentEdit.createQuestion({ tipo:"opcion_unica", enunciado:"mía",
    opciones:[{text:"a"},{text:"b"}], respuesta:"A", section:q.section, topic:q.topic });
  O.ContentEdit.apply("q", q.id, { explicacion: "corregida por test" });
  O.PROGRESS.settings.onboarded = true;

  ok(O.PROGRESS.events && O.PROGRESS.events.length > 0, "sembrado: eventos del motor");
  ok(Object.keys(O.PROGRESS.concepts).length > 0, "sembrado: conceptos del motor");
  ok(!!O.PROGRESS.plan, "sembrado: plan de examen");
  ok(O.ContentEdit.userCount() === 1, "sembrado: 1 pregunta propia");
  ok(O.ContentEdit.count() === 1, "sembrado: 1 corrección");

  const historyCap = 205;
  for(let i=0;i<historyCap;i++) O.pushHistory({ mode:"practice", finishedAt:Date.now()+i, total:1, correct:0, accuracy:0, answers:{} });
  ok(O.PROGRESS.history.length <= 200, `historial topado a 200 (tiene ${O.PROGRESS.history.length})`);

  // --- resetProgress("progress") ---
  O.resetProgress("progress");
  ok(Object.keys(O.PROGRESS.answers).length === 0, "progress: answers vaciado");
  ok(Object.keys(O.PROGRESS.marked).length === 0, "progress: marcadas vaciado");
  ok(O.PROGRESS.history.length === 0, "progress: historial vaciado");
  ok(Object.keys(O.PROGRESS.challenges).length === 0, "progress: desafíos vaciados");
  ok(Object.keys(O.PROGRESS.flashcards || {}).length === 0, "progress: progreso de flashcards vaciado");
  ok(Object.keys(O.PROGRESS.concepts || {}).length === 0, "progress: CONCEPTOS del motor vaciados");
  ok((O.PROGRESS.events || []).length === 0, "progress: EVENTOS del motor vaciados");
  ok(!O.PROGRESS.plan, "progress: plan del motor borrado");
  ok(!O.PROGRESS._seeded, "progress: flag _seeded borrado (el motor re-siembra limpio)");
  ok(O.PROGRESS.settings && O.PROGRESS.settings.onboarded === true, "progress: ajustes CONSERVADOS");
  ok(O.ContentEdit.userCount() === 1, "progress: contenido propio CONSERVADO");
  ok(O.ContentEdit.count() === 1, "progress: correcciones CONSERVADAS");
  // y lo persistido coincide (no revive nada al recargar)
  const raw = JSON.parse(w.localStorage.getItem("ope365_v1"));
  ok(Object.keys(raw.concepts || {}).length === 0 && (raw.events || []).length === 0,
    "progress: localStorage tampoco tiene estado de motor (no revive al recargar)");
  ok(raw.userContent && raw.userContent.q.length === 1, "progress: localStorage conserva el contenido propio");

  // --- resetProgress("all") ---
  w.localStorage.setItem("ope365_gh", JSON.stringify({ owner:"x", repo:"y", branch:"main", token:"github_pat_SECRET" }));
  O.resetProgress("all");
  ok(w.localStorage.getItem("ope365_v1") === null, "all: blob ope365_v1 borrado de localStorage");
  ok(w.localStorage.getItem("ope365_gh") === null, "all: configuración de GitHub (token) borrada");
  ok(O.ContentEdit.userCount() === 0, "all: contenido propio también borrado");
  ok(Object.keys(O.PROGRESS.answers).length === 0 && !O.PROGRESS.plan, "all: PROGRESS en memoria = estado inicial");

  console.log(fail ? `\n${fail} FALLO(S)` : "\nTODO OK");
  process.exit(fail ? 1 : 0);
})();
