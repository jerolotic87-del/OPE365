// Prueba de humo del multijugador (Etapa 10): NO se modifica ni se
// vuelve a probar en profundidad la lógica de multiplayer.js (eso es
// zona estable, fuera de alcance de esta migración). Esto solo
// confirma que sigue integrando correctamente con el app.js que sí se
// tocó (nuevos campos section/topic/subtopic, tipo "relleno",
// flashcards) usando MP.createMockPair(), tal como describe CLAUDE.md.
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function read(name){ return fs.readFileSync(path.join(ROOT, name), "utf-8"); }

function waitFor(predicate, timeoutMs){
  return new Promise((resolve, reject)=>{
    const start = Date.now();
    const iv = setInterval(()=>{
      if(predicate()){ clearInterval(iv); resolve(); }
      else if(Date.now()-start > (timeoutMs||3000)){ clearInterval(iv); reject(new Error("timeout esperando condición")); }
    }, 20);
  });
}

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
  runScript(read("multiplayer.js"));

  const O = window.OPE;
  const MP = window.OPE_MP;
  let failures = 0;
  function assert(cond, msg){ if(!cond){ failures++; console.error("FALLO:", msg); } else console.log("OK:", msg); }

  assert(!!MP, "multiplayer.js se carga y expone window.OPE_MP");

  const pair = MP.createMockPair();
  const hostSession = MP.createSession(pair.a);
  const guestSession = MP.createSession(pair.b);
  const hostGame = MP.createDuelGame(hostSession);
  const guestGame = MP.createDuelGame(guestSession);

  let hostState = null, guestState = null;
  hostGame.setHandlers({ onConnState:(s)=>{ hostState = s; } });
  guestGame.setHandlers({ onConnState:(s)=>{ guestState = s; } });

  hostSession.hostCreateRoom("Host");
  await waitFor(()=> hostState === "waiting_rival");
  const code = hostSession.getRoomCode();
  assert(!!code, "el host genera un código de sala (mock)");
  guestSession.guestJoinRoom(code, "Guest");

  await waitFor(()=> hostState === "ready" && guestState === "ready", 4000);
  assert(true, "ambos lados alcanzan el estado 'ready' tras el apretón de manos");

  let hostPhase = null, guestPhase = null, hostRoundQ = null, guestRoundQ = null, hostFinished = null;
  hostGame.setHandlers({
    onConnState:(s)=>{ hostState = s; },
    onPhase:(p, extra)=>{ hostPhase = p; if(p==="round") hostRoundQ = extra.question; if(p==="finished") hostFinished = extra; },
  });
  guestGame.setHandlers({
    onConnState:(s)=>{ guestState = s; },
    onPhase:(p, extra)=>{ guestPhase = p; if(p==="round") guestRoundQ = extra.question; },
  });

  hostGame.hostSetConfig({ rounds:1, seconds:15, tema:"all", tipo:"all", categoria:"all", raceMode:false });
  await waitFor(()=> hostPhase==="lobby_ready" && guestPhase==="lobby_ready", 3000);
  assert(true, "config del duelo llega a ambos lados (lobby_ready)");

  hostGame.confirmReady();
  guestGame.confirmReady();
  await waitFor(()=> hostPhase==="round" && guestPhase==="round", 5000);
  assert(!!hostRoundQ && !!guestRoundQ, "ambos lados reciben la pregunta de la ronda");
  assert(hostRoundQ.id === guestRoundQ.id, "host e invitado ven exactamente la misma pregunta (misma semilla)");

  // Este smoke test debe funcionar igual sin importar qué tipo de
  // pregunta tocó por semilla -- incluida una de tipo "relleno" nueva,
  // que es precisamente la superficie que se tocó en esta migración.
  const q = hostRoundQ;
  let hostAnswer;
  if(q.tipo === "opcion_unica") hostAnswer = q.respuesta;
  else if(q.tipo === "verdadero_falso") hostAnswer = q.respuesta;
  else if(q.tipo === "seleccion_multiple") hostAnswer = q.respuesta.slice();
  else if(q.tipo === "emparejamiento") hostAnswer = Object.assign({}, q.matching.correct);
  else if(q.tipo === "relleno") hostAnswer = q.respuesta.map(a=> Array.isArray(a)?a[0]:a);
  else throw new Error("tipo de pregunta no contemplado en el smoke test: " + q.tipo);

  hostGame.submitAnswer(hostAnswer);
  guestGame.submitAnswer(hostAnswer); // el invitado responde lo mismo -- basta para comprobar el flujo, no la puntuación exacta

  await waitFor(()=> hostPhase==="round_end", 3000);
  assert(true, "la ronda se resuelve (round_end) tras responder ambos lados");
  hostGame.advanceIfHost(); // como en la UI real (views.js): el host avanza tras ver el resultado de la ronda

  await waitFor(()=> hostFinished !== null, 5000);
  assert(hostFinished.myCorrect === 1 && hostFinished.rivalCorrect === 1, "ambas respuestas correctas se contabilizan bien vía O.evaluateAnswer (incluye el tipo relleno)");
  assert(hostFinished.myScore > 0, "se otorgan puntos por la respuesta correcta");

  hostSession.destroy(); guestSession.destroy();

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nSmoke test de multijugador (Duelo, mock transport): OK.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
