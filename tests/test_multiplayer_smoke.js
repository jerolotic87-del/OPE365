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

  hostGame.hostSetConfig({ rounds:1, seconds:15, section:"all", topic:"all", tipo:"all", categoria:"all", raceMode:false });
  await waitFor(()=> hostPhase==="lobby_ready" && guestPhase==="lobby_ready", 3000);
  assert(true, "config del duelo llega a ambos lados (lobby_ready)");

  const hIds = hostGame.getState().config.questionIds, gIds = guestGame.getState().config.questionIds;
  assert(Array.isArray(hIds) && hIds.length === 1, "el host fija la lista exacta de ids (config.questionIds)");
  assert(JSON.stringify(hIds) === JSON.stringify(gIds), "el invitado usa la MISMA lista de ids que el host (no la reconstruye)");
  assert(hostGame.getState().questions.every(q=>q.tipo !== "relleno"), "el tablero de duelo excluye preguntas de tipo relleno");

  hostGame.confirmReady();
  guestGame.confirmReady();
  await waitFor(()=> hostPhase==="round" && guestPhase==="round", 5000);
  assert(!!hostRoundQ && !!guestRoundQ, "ambos lados reciben la pregunta de la ronda");
  assert(hostRoundQ.id === guestRoundQ.id, "host e invitado ven exactamente la misma pregunta (misma semilla)");

  // Debe funcionar sea cual sea el tipo que tocó por semilla. El duelo
  // ya NO incluye "relleno" (no hay UI para teclear huecos a reloj), pero
  // dejamos la rama por si el filtro cambiara.
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

  // ── Formato "cada uno responde": si UNO no pulsa, la ronda NO se
  //    resuelve al instante — espera a que se agote el reloj de la ronda.
  const pair2 = MP.createMockPair();
  const hS = MP.createSession(pair2.a), gS = MP.createSession(pair2.b);
  const hG = MP.createDuelGame(hS), gG = MP.createDuelGame(gS);
  let hSt2=null, gSt2=null, hPhase2=null, hEnd2=null;
  hG.setHandlers({ onConnState:s=>{hSt2=s;}, onPhase:(p,x)=>{ hPhase2=p; if(p==="round_end") hEnd2=x; } });
  gG.setHandlers({ onConnState:s=>{gSt2=s;}, onPhase:()=>{} });
  hS.hostCreateRoom("H2");
  await waitFor(()=> hSt2==="waiting_rival");
  gS.guestJoinRoom(hS.getRoomCode(), "G2");
  await waitFor(()=> hSt2==="ready" && gSt2==="ready", 4000);
  hG.hostSetConfig({ rounds:1, seconds:1, section:"all", topic:"all", tipo:"all", categoria:"all", raceMode:false });
  await waitFor(()=> hG.getState().config && hG.getState().config.questionIds, 3000);
  hG.confirmReady(); gG.confirmReady();
  await waitFor(()=> hPhase2==="round", 5000);

  const q2 = hG.getState().questions[0];
  let a2;
  if(q2.tipo==="opcion_unica"||q2.tipo==="verdadero_falso") a2=q2.respuesta;
  else if(q2.tipo==="seleccion_multiple") a2=q2.respuesta.slice();
  else if(q2.tipo==="emparejamiento") a2=Object.assign({},q2.matching.correct);
  else a2=q2.respuesta.map(a=>Array.isArray(a)?a[0]:a);

  hG.submitAnswer(a2);               // solo el host responde
  await new Promise(r=> setTimeout(r, 150));
  assert(hPhase2 === "round", "la ronda NO se resuelve solo porque el host haya respondido");
  assert(!gG.getState().myAnswerState, "el invitado que no ha pulsado sigue sin respuesta (no se auto-agota al instante)");

  await waitFor(()=> hPhase2 === "round_end", 4000);
  assert(hEnd2 && hEnd2.rival.state === "TIMEOUT", "la ronda se cierra por tiempo agotado del invitado, no por un pulso fantasma");
  hS.destroy(); gS.destroy();

  // ── CONTRA WORD (cooperativo): Word lanza una afirmación, los dos votan
  //    V/T, puntúa el equipo; falla el equipo -> Word marca.
  const pair3 = MP.createMockPair();
  const cH = MP.createSession(pair3.a), cGs = MP.createSession(pair3.b);
  const cHost = MP.createCoopGame(cH), cGuest = MP.createCoopGame(cGs);
  let cHs=null, cGsSt=null, cHost_lobby=false, cGuest_lobby=false, cHostRound=null, cGuestRound=null, cEnd=null, cFin=null, cEndCount=0;
  cHost.setHandlers({ onConnState:s=>{cHs=s;}, onPhase:(p,x)=>{ if(p==="lobby_ready")cHost_lobby=true; if(p==="round")cHostRound=x; if(p==="round_end"){cEnd=x;cEndCount++;} if(p==="finished")cFin=x; } });
  cGuest.setHandlers({ onConnState:s=>{cGsSt=s;}, onPhase:(p,x)=>{ if(p==="lobby_ready")cGuest_lobby=true; if(p==="round")cGuestRound=x; if(p==="round")cGuestRound=x; } });
  cH.hostCreateRoom("Ana");
  await waitFor(()=> cHs==="waiting_rival");
  cGs.guestJoinRoom(cH.getRoomCode(), "Beto");
  await waitFor(()=> cHs==="ready" && cGsSt==="ready", 4000);
  cHost.hostSetConfig({ rounds:2, seconds:1, section:"all", topic:"all", categoria:"all", lieRate:0.5 });
  await waitFor(()=> cHost_lobby && cGuest_lobby, 3000);

  const cState = cHost.getState();
  assert(cState.questions.length === 2, "Contra Word: el host fija el tablero (2 rondas)");
  assert(Array.isArray(cState.config.wordPlan) && cState.config.wordPlan.length === 2, "Contra Word: el plan de Word viaja en el config");
  assert(JSON.stringify(cHost.getState().config.wordPlan) === JSON.stringify(cGuest.getState().config.wordPlan), "Contra Word: los dos lados ven el mismo plan de Word");
  assert(cState.questions.every(q=> q.tipo==="opcion_unica" || q.tipo==="verdadero_falso"), "Contra Word: solo preguntas convertibles a afirmación");

  cHost.confirmReady(); cGuest.confirmReady();
  await waitFor(()=> !!cHostRound && !!cGuestRound, 5000);
  assert(cHostRound.plan && typeof cHostRound.plan.truth === "boolean", "Contra Word: cada ronda trae la afirmación de Word y si es cierta");

  // los dos aciertan: votan según la verdad real del plan
  const truthCall = cHostRound.plan.truth ? "V" : "T";
  cHost.submitAnswer(truthCall);
  await new Promise(r=> setTimeout(r,120));
  assert(!cEnd, "Contra Word: la ronda no se cierra con un solo voto");
  cGuest.submitAnswer(truthCall);
  await waitFor(()=> cEndCount === 1, 3000);
  assert(cEnd.n === 2 && cEnd.teamPts > 0 && cEnd.wordPts === 0, "Contra Word: los dos aciertan -> puntúa el equipo, Word no");

  // ronda 2: nadie vota -> se cierra por tiempo -> Word marca
  cHost.advanceIfHost();
  await waitFor(()=> cHostRound.index === 1, 3000);
  await waitFor(()=> cEndCount === 2, 4000);
  assert(cEnd.n === 0 && cEnd.wordPts > 0, "Contra Word: si nadie acierta, Word marca");

  cHost.advanceIfHost();
  await waitFor(()=> !!cFin, 5000);
  assert(cFin.teamScore > 0 && ["victory","defeat","draw"].includes(cFin.outcome), "Contra Word: la partida termina con marcador equipo vs Word");
  cH.destroy(); cGs.destroy();

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nSmoke test de multijugador (Duelo + Contra Word, mock transport): OK.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
