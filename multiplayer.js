/* ============================================================
   OPE365 · Multijugador en tiempo real — Duelo
   Transporte: WebRTC vía PeerJS (broker público de señalización;
   requiere conexión a internet en ambos dispositivos — a diferencia
   del resto de la app, que funciona sin conexión).
   ============================================================ */
(function(){
"use strict";
const O = window.OPE;

/* ---------------------------------------------------------------
   0. CAPA DE DIAGNÓSTICO INTERNO (nunca visible al usuario normal)
--------------------------------------------------------------- */
const NET_LOG = [];
let DEBUG_MODE = false;
function netLog(event, data){
  const entry = { t: Date.now(), event, data: data||null };
  NET_LOG.push(entry);
  if(NET_LOG.length > 300) NET_LOG.shift();
  if(DEBUG_MODE) { try{ console.log("[mp]", event, data||""); }catch(e){} }
}
function setDebugMode(v){ DEBUG_MODE = !!v; }

/* ---------------------------------------------------------------
   1. CÓDIGO DE SALA — corto, legible, sin caracteres ambiguos
--------------------------------------------------------------- */
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I
function generateRoomCode(){
  let s = "";
  for(let i=0;i<5;i++) s += CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)];
  return s;
}
const PEER_PREFIX = "ope365du-";

/* Servidores de señalización PeerJS a probar, en orden. El primero es el
   broker público por defecto (0.peerjs.com); si está caído o saturado
   —causa del "no llega a iniciar", el Peer nunca abre— se reintenta contra
   un broker alternativo. `undefined` = usar los valores por defecto de PeerJS. */
const PEER_SERVERS = [
  undefined,
  { host: "0.peerjs.com", port: 443, path: "/", secure: true },
  { host: "peerjs.92k.de", port: 443, path: "/", secure: true },
];
/* ICE: STUN de Google + un TURN gratuito (OpenRelay). Sin un servidor TURN,
   dos dispositivos en redes móviles / detrás de CGNAT abren la sala pero el
   canal de datos nunca llega a establecerse (se queda en "conectando"). */
const ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
  { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:staticauth.openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
];
function peerOpts(serverIdx){
  const base = { debug: 0, config: { iceServers: ICE_SERVERS } };
  const srv = PEER_SERVERS[serverIdx] || null;
  return srv ? Object.assign({}, srv, base) : base;
}

/* ---------------------------------------------------------------
   2. CAPA DE TRANSPORTE
   `RealTransport` envuelve PeerJS. `MockTransport` (usado solo en
   pruebas automatizadas) simula dos extremos en memoria para poder
   validar toda la lógica de la partida sin una conexión WebRTC real
   — jsdom no implementa WebRTC, así que la conectividad real entre
   dos navegadores debe probarse manualmente, no puede verificarse
   desde este entorno de pruebas.
--------------------------------------------------------------- */
function createRealTransport(){
  let peer = null, conn = null;
  const handlers = {};
  function on(evt, fn){ handlers[evt] = fn; }
  function emit(evt, ...args){ if(handlers[evt]) handlers[evt](...args); }

  function hostCreateRoom(){
    attempt(0);
    function attempt(retry){
      const code = generateRoomCode();
      netLog("ROOM_CREATE_ATTEMPTED", {code, retry});
      let settled = false;
      const p = new window.Peer(PEER_PREFIX+code, peerOpts(retry % PEER_SERVERS.length));
      const to = setTimeout(()=>{
        if(settled) return; settled = true;
        try{ p.destroy(); }catch(e){}
        if(retry < 5) attempt(retry+1); else emit("room_create_failed");
      }, 11000);
      p.on("open", (id)=>{
        if(settled) return; settled = true;
        clearTimeout(to);
        peer = p;
        netLog("PEER_OPEN", {id});
        emit("room_ready", code);
        peer.on("connection", (c)=>{
          if(conn && conn.open){
            netLog("DUPLICATE_JOIN_REJECTED", {peer:c.peer});
            c.on("open", ()=>{ try{ c.send({type:"room_full"}); }catch(e){} setTimeout(()=>{ try{c.close();}catch(e){} }, 300); });
            return;
          }
          netLog("PEER_CONNECTION_ATTEMPTED", {peer:c.peer});
          attach(c);
        });
      });
      p.on("error", (err)=>{
        const type = err && err.type;
        netLog("PEER_ERROR", {type, msg:String(err)});
        if(settled) return;
        // id colisionado, broker caído/inaccesible o error de servidor -> siguiente intento
        if(["unavailable-id","network","server-error","socket-error","socket-closed"].includes(type)){
          settled = true; clearTimeout(to);
          try{ p.destroy(); }catch(e){}
          if(retry < 5) attempt(retry+1); else emit("room_create_failed");
        }
      });
    }
  }

  function guestJoinRoom(code){
    attempt(0);
    function attempt(retry){
      netLog("ROOM_JOIN_ATTEMPTED", {code, retry});
      let settled = false;
      const p = new window.Peer(undefined, peerOpts(retry % PEER_SERVERS.length));
      function nextOrFail(){
        try{ p.destroy(); }catch(e){}
        if(retry < 5) attempt(retry+1); else emit("connect_failed");
      }
      const toOpen = setTimeout(()=>{ if(settled) return; settled=true; nextOrFail(); }, 11000);
      p.on("open", ()=>{
        if(settled) return; settled = true;
        clearTimeout(toOpen);
        peer = p;
        const c = p.connect(PEER_PREFIX+code.toUpperCase(), {reliable:true});
        let connSettled = false;
        const toConn = setTimeout(()=>{ if(connSettled) return; connSettled=true; nextOrFail(); }, 11000);
        c.on("open", ()=>{
          if(connSettled) return; connSettled = true;
          clearTimeout(toConn);
          netLog("PEER_CONNECTED", {});
          attach(c);
        });
        c.on("error", (err)=>{
          netLog("CONN_ERROR", {type: err && err.type, msg:String(err)});
          if(connSettled) return; connSettled = true; clearTimeout(toConn);
          nextOrFail();
        });
      });
      p.on("error", (err)=>{
        const type = err && err.type;
        netLog("PEER_ERROR", {type, msg:String(err)});
        // 'peer-unavailable' = el host no está en ESTE broker; probamos el siguiente
        if(["network","server-error","socket-error","socket-closed","peer-unavailable","unavailable-id"].includes(type)){
          if(settled) return; settled = true; clearTimeout(toOpen);
          nextOrFail();
        }
      });
    }
  }

  function attach(c){
    conn = c;
    netLog("HANDSHAKE_SENT", {});
    emit("connected");
    c.on("data", (msg)=>{ netLog("RECV:"+(msg&&msg.type), msg); emit("message", msg); });
    c.on("close", ()=>{ netLog("CONNECTION_LOST", {}); emit("disconnected"); });
    c.on("error", (err)=>{ netLog("CONN_ERROR_LIVE", {msg:String(err)}); });
  }

  function send(msg){
    if(conn && conn.open){ netLog("SEND:"+msg.type, msg); try{ conn.send(msg); }catch(e){ netLog("SEND_FAILED", {err:String(e)}); } }
    else netLog("SEND_DROPPED_NO_CONN", msg);
  }

  function reconnect(code){
    netLog("RECONNECT_ATTEMPTED", {code});
    if(!peer || peer.destroyed){ emit("reconnect_failed"); return; }
    const c = peer.connect(PEER_PREFIX+code, {reliable:true});
    let settled = false;
    const to = setTimeout(()=>{ if(settled) return; settled=true; emit("reconnect_failed"); }, 12000);
    c.on("open", ()=>{ if(settled) return; settled=true; clearTimeout(to); netLog("CONNECTION_RESTORED", {}); attach(c); emit("reconnected"); });
    c.on("error", ()=>{ if(settled) return; settled=true; clearTimeout(to); emit("reconnect_failed"); });
  }

  function destroy(){
    try{ if(conn) conn.close(); }catch(e){}
    try{ if(peer) peer.destroy(); }catch(e){}
    peer = null; conn = null;
  }

  return { on, hostCreateRoom, guestJoinRoom, send, reconnect, destroy, isOpen:()=> !!(conn && conn.open) };
}

// Transporte simulado en memoria, para pruebas automatizadas de la
// lógica de partida (sin red real). Dos instancias enlazadas a mano.
function createMockPair(){
  const handlersA = {}, handlersB = {};
  let linked = true;
  function make(handlers, other){
    return {
      on:(evt,fn)=>{ handlers[evt]=fn; },
      hostCreateRoom:()=>{ setTimeout(()=>{ if(handlers.room_ready) handlers.room_ready("MOCK1"); }, 0); },
      guestJoinRoom:()=>{ setTimeout(()=>{ if(linked){ if(handlers.connected) handlers.connected(); if(other().connected) other().connected(); } }, 0); },
      send:(msg)=>{ setTimeout(()=>{ if(!linked) return; const h = other(); if(h.message) h.message(JSON.parse(JSON.stringify(msg))); }, 0); },
      reconnect:()=>{ setTimeout(()=>{ linked = true; if(handlers.reconnected) handlers.reconnected(); if(other().reconnected===undefined){} }, 0); },
      destroy:()=>{},
      isOpen:()=>linked,
    };
  }
  const a = make(handlersA, ()=>handlersB);
  const b = make(handlersB, ()=>handlersA);
  return {
    a, b,
    simulateDrop(){ linked = false; if(handlersA.disconnected) handlersA.disconnected(); if(handlersB.disconnected) handlersB.disconnected(); },
  };
}

/* ---------------------------------------------------------------
   3. SESIÓN — maneja el protocolo de mensajes sobre el transporte:
   apretón de manos, sincronización de reloj, configuración, y el
   ciclo de vida de conexión con reintentos y tiempos de espera.
   Expone únicamente estados/eventos en español-neutrales para la UI.
--------------------------------------------------------------- */
function createSession(transport){
  let role = null;         // 'host' | 'guest'
  let roomCode = null;
  let state = "idle";
  let clockOffset = 0;     // guest: hostTime ≈ Date.now() + clockOffset
  let myName = "Jugador";
  let rivalName = "Rival";
  let handlers = {};        // {onState, onMessage}
  let pingSamples = [];
  let pendingPingT0 = null;
  let phaseTimers = {};

  function setPhaseTimeout(key, ms, fn){
    clearPhaseTimeout(key);
    phaseTimers[key] = setTimeout(fn, ms);
  }
  function clearPhaseTimeout(key){ if(phaseTimers[key]){ clearTimeout(phaseTimers[key]); delete phaseTimers[key]; } }
  function clearAllPhaseTimeouts(){ Object.keys(phaseTimers).forEach(clearPhaseTimeout); }

  function setState(s, extra){
    state = s;
    netLog("STATE:"+s, extra);
    if(handlers.onState) handlers.onState(s, extra);
  }

  transport.on("room_ready", (code)=>{ roomCode = code; setState("waiting_rival", {code}); });
  transport.on("room_create_failed", ()=> setState("room_create_failed"));
  transport.on("connect_failed", ()=> setState("connect_failed"));
  transport.on("connected", ()=>{
    clearPhaseTimeout("connecting");
    setState("connected");
    setState("preparing");
    transport.send({type:"hello", v:1, name:myName});
    setPhaseTimeout("handshake", 15000, ()=> setState("connect_failed"));
  });
  transport.on("disconnected", ()=>{
    clearAllPhaseTimeouts();
    if(["playing","round_end","preparing","syncing","ready","countdown"].includes(state)){
      setState("reconnecting");
      setPhaseTimeout("reconnect", 15000, ()=> setState("reconnect_failed"));
      transport.reconnect(roomCode);
    } else {
      setState("connect_failed");
    }
  });
  transport.on("reconnected", ()=>{
    clearPhaseTimeout("reconnect");
    setState("restored");
    transport.send({type:"resume_request"});
    setTimeout(()=> setState(state==="restored" ? "playing" : state), 600);
  });
  transport.on("reconnect_failed", ()=> setState("reconnect_failed"));

  transport.on("message", (msg)=>{
    if(!msg || !msg.type) return;
    if(msg.type === "room_full"){ setState("room_full"); return; }
    if(msg.type === "hello"){
      clearPhaseTimeout("handshake");
      rivalName = msg.name || "Rival";
      transport.send({type:"hello_ack", v:1, name:myName});
      if(role === "guest") startClockSync();
      else setState("ready"); // el host es la referencia de reloj: no necesita medir su propio desfase
      return;
    }
    if(msg.type === "hello_ack"){
      rivalName = msg.name || "Rival";
      return;
    }
    if(msg.type === "ping"){
      transport.send({type:"pong", t0:msg.t0, t1:Date.now()});
      return;
    }
    if(msg.type === "pong"){
      const t2 = Date.now();
      const rtt = t2 - msg.t0;
      const offsetSample = msg.t1 - (msg.t0 + t2)/2;
      pingSamples.push({offsetSample, rtt});
      if(pingSamples.length < 4){
        sendPing();
      } else {
        pingSamples.sort((a,b)=>a.rtt-b.rtt);
        const best = pingSamples.slice(0, Math.max(1, Math.ceil(pingSamples.length/2)));
        clockOffset = best.reduce((s,x)=>s+x.offsetSample,0)/best.length;
        netLog("CLOCK_SYNC_COMPLETE", {offset:clockOffset, samples:pingSamples.length});
        setState("ready");
      }
      return;
    }
    if(handlers.onMessage) handlers.onMessage(msg);
  });

  function sendPing(){
    pendingPingT0 = Date.now();
    transport.send({type:"ping", t0:pendingPingT0});
  }
  function startClockSync(){
    setState("syncing");
    pingSamples = [];
    netLog("CLOCK_SYNC_STARTED", {});
    sendPing();
  }

  function hostToLocalTime(hostTs){ return hostTs - clockOffset; } // convierte un instante del reloj del host al reloj local del invitado
  function localToHostTime(localTs){ return localTs + clockOffset; }

  return {
    hostCreateRoom(name){
      role = "host"; myName = name || "Jugador";
      setState("creating_room");
      transport.hostCreateRoom();
    },
    guestJoinRoom(code, name){
      role = "guest"; myName = name || "Jugador"; roomCode = code.toUpperCase();
      setState("connecting");
      // holgado: el transporte reintenta contra varios brokers (hasta ~60 s);
      // este es solo la red de seguridad si ni siquiera emite 'connect_failed'.
      setPhaseTimeout("connecting", 75000, ()=> setState("connect_failed"));
      transport.guestJoinRoom(roomCode);
    },
    send(msg){ transport.send(msg); },
    setHandlers(h){ handlers = h; },
    getRole(){ return role; },
    getRoomCode(){ return roomCode; },
    getRivalName(){ return rivalName; },
    getState(){ return state; },
    // El host, tras recibir 'ready' del invitado y estar listo él mismo,
    // usa esta hora (en su propio reloj) como referencia de la cuenta atrás.
    now(){ return role === "guest" ? Date.now() + clockOffset : Date.now(); }, // "ahora" en el reloj del HOST, estimado
    hostToLocalTime, localToHostTime,
    getNetLog(){ return NET_LOG.slice(); },
    destroy(){ clearAllPhaseTimeouts(); transport.destroy(); },
  };
}

/* ---------------------------------------------------------------
   4. LÓGICA DE PARTIDA — MODO DUELO
   Reutiliza el motor determinista ya existente (buildSessionFromShareableConfig)
   para que ambos jugadores vean exactamente el mismo tablero: mismas
   preguntas, mismo orden, mismas opciones — sin necesidad de reinventar
   nada de esa parte. El host marca el ritmo (cuándo empieza cada ronda);
   cada lado calcula su propia puntuación de forma independiente a partir
   de las mismas respuestas intercambiadas, así que nunca hace falta que
   un lado "confíe" en el resultado que afirma el otro.
--------------------------------------------------------------- */
const ROUND_GRACE_MS = 2500; // margen tras el deadline para aceptar una respuesta que ya iba de camino

function createDuelGame(session){
  let handlers = {};
  let config = null, seed = null, questions = [];
  let roundIndex = -1;
  let roundDeadlineHost = null;
  let roundDuration = 10000;
  let myAnswer = null, rivalAnswer = null;
  let resolvedRounds = {};
  let pendingRivalMsgs = {};
  let myScore = 0, rivalScore = 0;
  let myCombo = 0, rivalCombo = 0;
  let myCorrect = 0, rivalCorrect = 0;
  let roundHistory = [];
  let localTimeoutHandle = null;
  let readyFlags = {mine:false, rival:false};
  let pendingConfig = null;
  let ended = false;

  function emitPhase(p, extra){ netLog("DUEL:"+p, extra); if(handlers.onPhase) handlers.onPhase(p, extra||{}); }

  session.setHandlers({
    onState(s, extra){
      if(handlers.onConnState) handlers.onConnState(s, extra);
      if(s === "ready" && session.getRole() === "host") trySendConfig();
    },
    onMessage(msg){ handleMsg(msg); }
  });

  function trySendConfig(){
    if(!pendingConfig || session.getState() !== "ready") return;
    seed = O.makeSeed();
    config = pendingConfig;
    buildBoard();
    session.send({type:"config", config, seed});
    emitPhase("lobby_ready", {rounds:questions.length, config});
  }
  function buildBoard(){
    roundDuration = (Number(config.seconds)||10) * 1000;
    // El HOST fija la lista EXACTA de ids y la mete en el config; el
    // invitado la usa tal cual. Así el tablero no depende de que los dos
    // dispositivos tengan un banco idéntico (contenido propio creado en
    // uno solo hacía divergir la reconstrucción "determinista").
    let ids = config.questionIds;
    if(!Array.isArray(ids)){
      let pool = O.filterQuestions({
        section: config.section || "all", topic: config.topic || "all",
        tema: config.tema || "all", tipo: config.tipo || "all", categoria: config.categoria || "all",
      }).filter(q=>
        q.tipo !== "relleno"          // no hay UI para escribir huecos en un duelo a reloj
        && !q.creado                  // el contenido propio de un jugador no lo tiene el otro
        && !/^usr-/.test(q.id || "")
      );
      pool = O.seededShuffle(pool, O.mulberry32((seed >>> 0)));
      const n = Math.min(Number(config.rounds) || 15, pool.length);
      ids = pool.slice(0, n).map(q=>q.id);
      config.questionIds = ids;
    }
    ids = ids.filter(id=> O.Q_BY_ID[id]);
    const built = ids.length ? O.buildSessionFromIds(ids, { mode:"duel", shuffleOptions:true }, seed >>> 0) : null;
    questions = built ? built.questions : [];
  }

  function handleMsg(msg){
    if(msg.type === "config"){
      config = msg.config; seed = msg.seed;
      buildBoard();
      emitPhase("lobby_ready", {rounds:questions.length, config});
      return;
    }
    if(msg.type === "player_ready"){
      readyFlags.rival = true;
      checkBothReady();
      return;
    }
    if(msg.type === "start_countdown"){
      emitPhase("countdown", {startAtLocal: session.hostToLocalTime(msg.startAt)});
      return;
    }
    if(msg.type === "round_start"){
      if(session.getRole() !== "guest") return; // el host es la autoridad de ronda: nunca reaplica un round_start ajeno (evita borrar su propia respuesta ya confirmada al reconectar)
      if(msg.round === roundIndex && roundDeadlineHost === msg.deadline) return; // reenvío idempotente tras reconexión: no reiniciar respuestas ya registradas
      beginRound(msg.round, msg.deadline);
      return;
    }
    if(msg.type === "answer"){
      if(msg.round === roundIndex){
        applyRivalAnswer(msg);
      } else if(msg.round > roundIndex){
        pendingRivalMsgs["ans_"+msg.round] = msg;
      }
      return;
    }
    if(msg.type === "race_lock"){
      // Solo en modo Carrera. El host es la autoridad que decide quién
      // pulsó antes; el invitado nunca resuelve por sí mismo, solo
      // aplica lo que el host ya decidió.
      if(msg.round !== roundIndex || resolvedRounds[roundIndex]) return;
      resolvedRounds[roundIndex] = true;
      if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
      const winnerIsMe = msg.winnerIsHost === null ? null : (session.getRole()==="host" ? msg.winnerIsHost : !msg.winnerIsHost);
      doResolveRace(winnerIsMe);
      return;
    }
    if(msg.type === "game_end"){
      finishGame();
      return;
    }
    if(msg.type === "resume_request"){
      // Solo el host reenvía el round_start autoritativo (el invitado nunca
      // origina rondas). Ambos lados reenvían su propia respuesta si ya
      // la tenían, para que el otro no se quede esperando indefinidamente.
      if(session.getRole() === "host" && roundIndex >= 0 && !ended){
        session.send({type:"round_start", round:roundIndex, deadline:roundDeadlineHost});
      }
      if(myAnswer && roundIndex >= 0){
        session.send({type:"answer", round:roundIndex, answer:myAnswer.answer, clientTime:myAnswer.clientTimeHost, timeout:myAnswer.state==="TIMEOUT"});
      }
      return;
    }
  }

  function checkBothReady(){
    if(readyFlags.mine && readyFlags.rival && session.getRole()==="host"){
      if(!questions.length){
        readyFlags = {mine:false, rival:false};
        emitPhase("no_content", {});
        return;
      }
      const startAt = Date.now() + 3200; // 3·2·1·¡YA!
      session.send({type:"start_countdown", startAt});
      emitPhase("countdown", {startAtLocal:startAt});
      setTimeout(()=>{ if(!ended) hostStartRound(0); }, 3200);
    }
  }

  function beginRound(i, deadlineHost){
    roundIndex = i;
    roundDeadlineHost = deadlineHost;
    myAnswer = null; rivalAnswer = null;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    const deadlineLocal = session.getRole()==="host" ? deadlineHost : session.hostToLocalTime(deadlineHost);
    // El temporizador de la ronda se mide desde AHORA con la duración
    // configurada — exactamente igual que la barra visible. El deadline
    // convertido del host solo se usa como cota superior: si por un
    // desfase de reloj saliera más corto que la duración, se ignora.
    // Antes, un reloj de invitado adelantado hacía que `wait` fuera casi
    // cero y la ronda se auto-agotaba al instante (parecía que el jugador
    // ya había respondido). Nunca acortamos la ronda por debajo de lo que
    // se ve en pantalla.
    const byDeadline = deadlineLocal - Date.now();
    const wait = Math.max(roundDuration, Math.min(roundDuration + ROUND_GRACE_MS, byDeadline || 0));
    localTimeoutHandle = setTimeout(()=> handleLocalTimeout(i), wait + 250);
    emitPhase("round", {index:i, total:questions.length, question:questions[i], deadlineLocal, duration:roundDuration});

    const bufferedAns = pendingRivalMsgs["ans_"+i];
    if(bufferedAns){ delete pendingRivalMsgs["ans_"+i]; applyRivalAnswer(bufferedAns); }
  }

  function handleLocalTimeout(i){
    if(i !== roundIndex || myAnswer || resolvedRounds[i]) return;
    myAnswer = { answer:null, clientTimeHost: roundDeadlineHost, state:"TIMEOUT" };
    session.send({type:"answer", round:i, answer:null, clientTime:roundDeadlineHost, timeout:true});
    if(handlers.onSelfAnswered) handlers.onSelfAnswered("TIMEOUT");
    maybeResolve();
  }

  function submitAnswer(answer){
    if(myAnswer || roundIndex<0) return; // una respuesta ya confirmada nunca se sobrescribe
    const nowLocal = Date.now();
    const clientTimeHost = session.getRole()==="host" ? nowLocal : session.localToHostTime(nowLocal);
    myAnswer = { answer, clientTimeHost, state:"SUBMITTED" };
    session.send({type:"answer", round:roundIndex, answer, clientTime:clientTimeHost, timeout:false});
    if(handlers.onSelfAnswered) handlers.onSelfAnswered("SUBMITTED");
    maybeResolve();
  }

  function applyRivalAnswer(msg){
    if(rivalAnswer) return; // ya se recibió/asentó una respuesta del rival para esta ronda
    const late = msg.clientTime > roundDeadlineHost + ROUND_GRACE_MS;
    rivalAnswer = { answer: msg.timeout ? null : msg.answer, clientTimeHost: msg.clientTime, state: (msg.timeout || late) ? "TIMEOUT" : "SUBMITTED" };
    if(handlers.onRivalAnswered) handlers.onRivalAnswered(rivalAnswer.state);
    maybeResolve();
  }

  function maybeResolve(){
    if(resolvedRounds[roundIndex]) return;
    const raceMode = !!(config && config.raceMode);

    if(!raceMode){
      // Formato "Cada uno responde": nunca se resuelve hasta que AMBOS
      // hayan respondido (o agotado el tiempo, que también cuenta como
      // respuesta local vía handleLocalTimeout) — jamás con un solo pulso.
      if(!myAnswer || !rivalAnswer) return;
      doResolveBoth();
      return;
    }

    // Formato "El primero que pulse": el host es quien decide, de forma
    // autoritativa, quién se lleva la pregunta — evita que ambos lados
    // se declaren "ganadores" por una discrepancia de un instante en la
    // llegada de los mensajes por la red.
    if(session.getRole() !== "host") return;
    const myReal = !!(myAnswer && myAnswer.state === "SUBMITTED");
    const rivalReal = !!(rivalAnswer && rivalAnswer.state === "SUBMITTED");
    if(!myReal && !rivalReal){
      if(myAnswer && rivalAnswer) lockRace(null); // ambos agotaron el tiempo sin responder de verdad
      return; // todavía no hay ninguna respuesta real que pueda decidir la carrera
    }
    let winnerIsMe;
    if(myReal && rivalReal) winnerIsMe = myAnswer.clientTimeHost <= rivalAnswer.clientTimeHost;
    else winnerIsMe = myReal; // ya son booleanos reales: si solo uno respondió de verdad, gana ese
    lockRace(winnerIsMe);
  }

  function doResolveBoth(){
    resolvedRounds[roundIndex] = true;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }

    const q = questions[roundIndex];
    const myCorrectNow = myAnswer.state==="SUBMITTED" && O.evaluateAnswer(q, myAnswer.answer);
    const rivalCorrectNow = rivalAnswer.state==="SUBMITTED" && O.evaluateAnswer(q, rivalAnswer.answer);

    myCombo = myCorrectNow ? myCombo+1 : 0;
    rivalCombo = rivalCorrectNow ? rivalCombo+1 : 0;
    const myPts = computePoints(myCorrectNow, myAnswer.clientTimeHost, roundDeadlineHost, roundDuration, myCombo);
    const rivalPts = computePoints(rivalCorrectNow, rivalAnswer.clientTimeHost, roundDeadlineHost, roundDuration, rivalCombo);
    myScore += myPts; rivalScore += rivalPts;
    if(myCorrectNow) myCorrect++;
    if(rivalCorrectNow) rivalCorrect++;

    const result = {
      round: roundIndex, question:q, race:false,
      me:{ answer:myAnswer.answer, state:myAnswer.state, correct:myCorrectNow, points:myPts, combo:myCombo },
      rival:{ answer:rivalAnswer.answer, state:rivalAnswer.state, correct:rivalCorrectNow, points:rivalPts, combo:rivalCombo },
      myScore, rivalScore,
    };
    roundHistory.push(result);
    emitPhase("round_end", result);
  }

  // winnerIsMe: true (gané yo), false (ganó el rival), null (nadie respondió a tiempo)
  function lockRace(winnerIsMe){
    if(resolvedRounds[roundIndex]) return;
    resolvedRounds[roundIndex] = true;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    session.send({type:"race_lock", round:roundIndex, winnerIsHost: winnerIsMe===null ? null : winnerIsMe});
    doResolveRace(winnerIsMe);
  }

  function doResolveRace(winnerIsMe){
    const q = questions[roundIndex];
    if(winnerIsMe === null){
      myCombo = 0; rivalCombo = 0;
      const result = {
        round: roundIndex, question:q, race:true, iWon:null,
        me:{ answer:null, state:"TIMEOUT", correct:false, points:0, combo:0 },
        rival:{ answer:null, state:"TIMEOUT", correct:false, points:0, combo:0 },
        myScore, rivalScore,
      };
      roundHistory.push(result);
      emitPhase("round_end", result);
      return;
    }

    const winnerAns = winnerIsMe ? myAnswer : rivalAnswer;
    const correct = !!(winnerAns && O.evaluateAnswer(q, winnerAns.answer));
    if(winnerIsMe) myCombo = correct ? myCombo+1 : 0;
    else rivalCombo = correct ? rivalCombo+1 : 0;
    const comboForPts = winnerIsMe ? myCombo : rivalCombo;
    const pts = winnerAns ? computePoints(correct, winnerAns.clientTimeHost, roundDeadlineHost, roundDuration, comboForPts) : 0;
    if(winnerIsMe){ myScore += pts; if(correct) myCorrect++; }
    else { rivalScore += pts; if(correct) rivalCorrect++; }

    const result = {
      round: roundIndex, question:q, race:true, iWon: winnerIsMe,
      me: winnerIsMe
        ? { answer:winnerAns.answer, state:"SUBMITTED", correct, points:pts, combo:myCombo }
        : { answer: myAnswer?myAnswer.answer:null, state: myAnswer?myAnswer.state:"NO_ATTEMPT", correct:false, points:0, combo:myCombo },
      rival: !winnerIsMe
        ? { answer:winnerAns.answer, state:"SUBMITTED", correct, points:pts, combo:rivalCombo }
        : { answer: rivalAnswer?rivalAnswer.answer:null, state: rivalAnswer?rivalAnswer.state:"NO_ATTEMPT", correct:false, points:0, combo:rivalCombo },
      myScore, rivalScore,
    };
    roundHistory.push(result);
    emitPhase("round_end", result);
  }

  function computePoints(correct, clientTimeHost, deadlineHost, duration, comboAfter){
    if(!correct) return 0;
    const remainingFrac = Math.max(0, Math.min(1, (deadlineHost - clientTimeHost) / duration));
    const base = 100;
    const speedBonus = Math.round(50 * remainingFrac); // tope +50 — el conocimiento pesa más que la velocidad
    const comboMult = 1 + Math.min(comboAfter, 5) * 0.08; // tope x1.4 aprox.
    return Math.round((base + speedBonus) * comboMult);
  }

  function hostStartRound(i){
    if(session.getRole() !== "host") return;
    if(i >= questions.length){ hostEndGame(); return; }
    const deadline = Date.now() + roundDuration;
    session.send({type:"round_start", round:i, deadline});
    beginRound(i, deadline);
  }
  function hostEndGame(){
    session.send({type:"game_end"});
    finishGame();
  }
  function finishGame(){
    if(ended) return;
    ended = true;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    emitPhase("finished", {
      myScore, rivalScore, myCombo, rivalCombo,
      myAccuracy: questions.length ? Math.round(myCorrect/questions.length*100) : 0,
      rivalAccuracy: questions.length ? Math.round(rivalCorrect/questions.length*100) : 0,
      myCorrect, rivalCorrect, total: questions.length,
      outcome: myScore>rivalScore ? "victory" : myScore<rivalScore ? "defeat" : "draw",
    });
  }

  return {
    setHandlers(h){ handlers = h; },
    hostSetConfig(cfg){ pendingConfig = cfg; trySendConfig(); },
    confirmReady(){ readyFlags.mine = true; session.send({type:"player_ready"}); checkBothReady(); },
    submitAnswer,
    advanceIfHost(){ if(session.getRole()==="host" && !ended) hostStartRound(roundIndex+1); },
    requestRematch(newSeed){
      if(session.getRole() !== "host") return;
      ended = false; roundIndex = -1; resolvedRounds = {}; pendingRivalMsgs = {};
      myScore=0; rivalScore=0; myCombo=0; rivalCombo=0; myCorrect=0; rivalCorrect=0; roundHistory=[];
      readyFlags = {mine:false, rival:false};
      seed = newSeed ? O.makeSeed() : seed;
      if(config) delete config.questionIds;   // re-resolver el tablero desde cero
      buildBoard();
      session.send({type:"config", config, seed});
      emitPhase("lobby_ready", {rounds:questions.length, config});
    },
    getState(){ return { config, seed, questions, roundIndex, myScore, rivalScore, myCombo, rivalCombo, roundHistory, myAnswerState: myAnswer&&myAnswer.state, rivalAnswerState: rivalAnswer&&rivalAnswer.state, myAnswerValue: myAnswer&&myAnswer.answer }; },
  };
}

/* ---------------------------------------------------------------
   4·bis. CONTRA WORD — cooperativo
   Los dos jugadores forman equipo; el rival es la app ("Word"), que
   lanza una AFIRMACIÓN (un atajo, una ruta, un dato) que puede ser
   verdad o trampa. Cada humano decide V (me lo creo) o T (es trampa).
   Reutiliza el mismo transporte/Session, reloj compartido y tablero
   determinista que el Duelo. El "plan de Word" (qué afirma cada ronda
   y si es cierto) lo fija el host y viaja en el config — igual que la
   lista de ids — para que ambos lados vean EXACTAMENTE lo mismo sin
   servidor. La ronda se resuelve como el Duelo "cada uno responde":
   nunca con un solo pulso, siempre esperando a los dos o al reloj.
--------------------------------------------------------------- */
function createCoopGame(session){
  let handlers = {};
  let config = null, seed = null, questions = [], wordPlan = [];
  let roundIndex = -1, roundDeadlineHost = null, roundDuration = 15000;
  let myAnswer = null, rivalAnswer = null;
  let resolvedRounds = {}, pendingRivalMsgs = {};
  let teamScore = 0, wordScore = 0, teamStreak = 0;
  let teamCorrectRounds = 0, bothCorrectRounds = 0, disagreements = 0;
  let missedTopics = {};
  let roundHistory = [];
  let localTimeoutHandle = null;
  let readyFlags = {mine:false, rival:false};
  let pendingConfig = null, ended = false;

  function emitPhase(p, extra){ netLog("COOP:"+p, extra); if(handlers.onPhase) handlers.onPhase(p, extra||{}); }

  session.setHandlers({
    onState(s){ if(handlers.onConnState) handlers.onConnState(s); if(s === "ready" && session.getRole() === "host") trySendConfig(); },
    onMessage(msg){ handleMsg(msg); },
  });

  function trySendConfig(){
    if(!pendingConfig || session.getState() !== "ready") return;
    seed = O.makeSeed();
    config = pendingConfig;
    buildBoard();
    session.send({type:"config", config, seed});
    emitPhase("lobby_ready", {rounds:questions.length, config});
  }

  function buildBoard(){
    roundDuration = (Number(config.seconds)||15) * 1000;
    let ids = config.questionIds;
    if(!Array.isArray(ids)){
      let pool = O.filterQuestions({
        section: config.section || "all", topic: config.topic || "all",
        tema: config.tema || "all", categoria: config.categoria || "all",
      }).filter(q=>
        q.tipo !== "relleno"          // relleno no tiene distractores: Word no puede "equivocarse" sin inventar contenido
        && !q.creado && !/^usr-/.test(q.id || "")
      );
      pool = O.seededShuffle(pool, O.mulberry32((seed >>> 0)));
      const n = Math.min(Number(config.rounds) || 12, pool.length);
      ids = pool.slice(0, n).map(q=>q.id);
      config.questionIds = ids;
    }
    ids = ids.filter(id=> O.Q_BY_ID[id]);
    const built = ids.length ? O.buildSessionFromIds(ids, { mode:"coop", shuffleOptions:true }, seed >>> 0) : null;
    questions = built ? built.questions : [];

    // Plan de Word: lo fija el host y viaja en el config.
    if(Array.isArray(config.wordPlan) && config.wordPlan.length === questions.length){
      wordPlan = config.wordPlan;
    } else {
      wordPlan = buildWordPlan();
      config.wordPlan = wordPlan;
    }
  }

  function buildWordPlan(){
    const rng = O.mulberry32(((seed >>> 0) ^ 0x9e3779b9) >>> 0);
    const pick = arr => arr[Math.floor(rng()*arr.length)];
    const lieRate = Math.max(0.1, Math.min(0.9, Number(config.lieRate) || 0.5));

    // Presupuesto FIJO de mentiras para toda la partida, repartido entre las
    // rondas donde Word puede equivocarse (las V/F no cuentan: su verdad es
    // intrínseca a la frase). Así no se "resetea" el % en cada ronda ni salen
    // rachas de 6 mentiras seguidas: si son 12 rondas y Word es "tramposo"
    // (0.65), miente en 8, ni una más ni una menos, en posiciones barajadas.
    const lieable = [];
    questions.forEach((q,i)=>{ if(q.tipo !== "verdadero_falso") lieable.push(i); });
    const target = Math.round(lieRate * lieable.length);
    const shuffled = lieable.slice();
    for(let k = shuffled.length - 1; k > 0; k--){ const j = Math.floor(rng()*(k+1)); const t = shuffled[k]; shuffled[k] = shuffled[j]; shuffled[j] = t; }
    const lieSet = new Set(shuffled.slice(0, target));

    return questions.map((q,idx)=>{
      // V/F: la afirmación ES la pregunta; no hay "mentira" de Word, la frase es
      // cierta o falsa de por sí. El jugador responde Verdadero / Falso.
      if(q.tipo === "verdadero_falso"){
        return { kind:"vf", context:q.enunciado, truth: (q.respuesta === true || q.respuesta === "true") };
      }
      const lies = lieSet.has(idx);

      if(q.tipo === "seleccion_multiple"){
        const all = (q.opciones||[]).map(o=>o.letter);
        const real = Array.isArray(q.respuesta) ? q.respuesta.slice() : [];
        let claimed = real.slice();
        if(lies && all.length > real.length && real.length){
          // cambia una correcta por una incorrecta
          const out = pick(real);
          const inn = pick(all.filter(l=> !real.includes(l)));
          claimed = real.filter(l=> l !== out).concat(inn);
        } else if(lies && real.length > 1){
          claimed = real.slice(0, real.length - 1);   // omite una
        } else if(lies){
          const extra = pick(all.filter(l=> !real.includes(l)));
          if(extra) claimed = real.concat(extra);
        }
        const same = claimed.length === real.length && claimed.every(l=> real.includes(l));
        const byLetter = Object.fromEntries((q.opciones||[]).map(o=>[o.letter,o.text]));
        return { kind:"multi", context:q.enunciado,
          claimItems: claimed.slice().sort().map(l=> byLetter[l] || l), truth: same };
      }

      if(q.tipo === "emparejamiento" && q.matching){
        const leftById = Object.fromEntries((q.matching.left||[]).map(x=>[x.id,x.label]));
        const rightById = Object.fromEntries((q.matching.right||[]).map(x=>[x.id,x.label]));
        const real = q.matching.correct || q.respuesta || {};
        const claimed = Object.assign({}, real);
        let truthy = true;
        if(lies){
          const lefts = Object.keys(real);
          if(lefts.length >= 2){
            const a = pick(lefts);
            let b = pick(lefts); let guard = 0;
            while(b === a && guard++ < 8) b = pick(lefts);
            if(b !== a){ const t = claimed[a]; claimed[a] = claimed[b]; claimed[b] = t; truthy = false; }
          }
        }
        return { kind:"match", context:q.enunciado,
          claimPairs: Object.keys(claimed).map(lid=> ({ l: leftById[lid] || lid, r: rightById[claimed[lid]] || claimed[lid] })),
          truth: truthy };
      }

      // opcion_unica
      let opt;
      if(lies){
        const wrong = (q.opciones||[]).filter(o=> o.letter !== q.respuesta);
        opt = wrong.length ? pick(wrong) : (q.opciones||[])[0];
      } else {
        opt = (q.opciones||[]).find(o=> o.letter === q.respuesta) || (q.opciones||[])[0];
      }
      return { kind:"opt", context:q.enunciado, claim: opt ? opt.text : "", truth: !lies };
    });
  }

  function handleMsg(msg){
    if(msg.type === "config"){ config = msg.config; seed = msg.seed; buildBoard(); emitPhase("lobby_ready", {rounds:questions.length, config}); return; }
    if(msg.type === "player_ready"){ readyFlags.rival = true; checkBothReady(); return; }
    if(msg.type === "start_countdown"){ emitPhase("countdown", {startAtLocal: session.hostToLocalTime(msg.startAt)}); return; }
    if(msg.type === "round_start"){
      if(session.getRole() !== "guest") return;
      if(msg.round === roundIndex && roundDeadlineHost === msg.deadline) return;
      beginRound(msg.round, msg.deadline);
      return;
    }
    if(msg.type === "answer"){
      if(msg.round === roundIndex) applyRivalAnswer(msg);
      else if(msg.round > roundIndex) pendingRivalMsgs["ans_"+msg.round] = msg;
      return;
    }
    if(msg.type === "game_end"){ finishGame(); return; }
    if(msg.type === "resume_request"){
      if(session.getRole() === "host" && roundIndex >= 0 && !ended) session.send({type:"round_start", round:roundIndex, deadline:roundDeadlineHost});
      if(myAnswer && roundIndex >= 0) session.send({type:"answer", round:roundIndex, answer:myAnswer.answer, timeout:myAnswer.state==="TIMEOUT"});
      return;
    }
  }

  function checkBothReady(){
    if(readyFlags.mine && readyFlags.rival && session.getRole()==="host"){
      if(!questions.length){ readyFlags = {mine:false, rival:false}; emitPhase("no_content", {}); return; }
      const startAt = Date.now() + 3200;
      session.send({type:"start_countdown", startAt});
      emitPhase("countdown", {startAtLocal:startAt});
      setTimeout(()=>{ if(!ended) hostStartRound(0); }, 3200);
    }
  }

  function beginRound(i, deadlineHost){
    roundIndex = i;
    roundDeadlineHost = deadlineHost;
    myAnswer = null; rivalAnswer = null;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    const deadlineLocal = session.getRole()==="host" ? deadlineHost : session.hostToLocalTime(deadlineHost);
    const byDeadline = deadlineLocal - Date.now();
    const wait = Math.max(roundDuration, Math.min(roundDuration + ROUND_GRACE_MS, byDeadline || 0));
    localTimeoutHandle = setTimeout(()=> handleLocalTimeout(i), wait + 250);
    emitPhase("round", {index:i, total:questions.length, question:questions[i], plan:wordPlan[i], deadlineLocal, duration:roundDuration});
    const buffered = pendingRivalMsgs["ans_"+i];
    if(buffered){ delete pendingRivalMsgs["ans_"+i]; applyRivalAnswer(buffered); }
  }

  function handleLocalTimeout(i){
    if(i !== roundIndex || myAnswer || resolvedRounds[i]) return;
    myAnswer = { answer:null, state:"TIMEOUT" };
    session.send({type:"answer", round:i, answer:null, timeout:true});
    if(handlers.onSelfAnswered) handlers.onSelfAnswered("TIMEOUT");
    maybeResolve();
  }

  function submitAnswer(call){          // call: "V" (me lo creo) | "T" (es trampa)
    if(myAnswer || roundIndex<0) return;
    myAnswer = { answer: call, state:"SUBMITTED" };
    session.send({type:"answer", round:roundIndex, answer:call, timeout:false});
    if(handlers.onSelfAnswered) handlers.onSelfAnswered("SUBMITTED");
    maybeResolve();
  }

  function applyRivalAnswer(msg){
    if(rivalAnswer) return;
    rivalAnswer = { answer: msg.timeout ? null : msg.answer, state: msg.timeout ? "TIMEOUT" : "SUBMITTED" };
    if(handlers.onRivalAnswered) handlers.onRivalAnswered(rivalAnswer.state);
    maybeResolve();
  }

  function maybeResolve(){
    if(resolvedRounds[roundIndex]) return;
    if(!myAnswer || !rivalAnswer) return;
    resolveRound();
  }

  function resolveRound(){
    resolvedRounds[roundIndex] = true;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    const plan = wordPlan[roundIndex] || {truth:true};
    const truthCall = plan.truth ? "V" : "F";
    const myRight = myAnswer.state === "SUBMITTED" && myAnswer.answer === truthCall;
    const rivalRight = rivalAnswer.state === "SUBMITTED" && rivalAnswer.answer === truthCall;
    const n = (myRight?1:0) + (rivalRight?1:0);
    const disagreed = myAnswer.state === "SUBMITTED" && rivalAnswer.state === "SUBMITTED" && myAnswer.answer !== rivalAnswer.answer;

    teamStreak = (n === 2) ? teamStreak + 1 : 0;
    const mult = 1 + Math.min(teamStreak, 5) * 0.1;                // tope x1.5
    const teamPts = n === 2 ? Math.round(200 * mult) : (n === 1 ? 90 : 0);
    const wordPts = n === 0 ? 140 : 0;
    teamScore += teamPts; wordScore += wordPts;

    if(n >= 1) teamCorrectRounds++;
    if(n === 2) bothCorrectRounds++;
    if(disagreed) disagreements++;
    if(n === 0){
      const q = questions[roundIndex];
      const key = (q.section||"?") + ":" + (q.topic||"?");
      missedTopics[key] = (missedTopics[key]||0) + 1;
    }

    const result = {
      round: roundIndex, question: questions[roundIndex], plan, truthCall,
      me:{ call: myAnswer.answer, state: myAnswer.state, right: myRight },
      rival:{ call: rivalAnswer.answer, state: rivalAnswer.state, right: rivalRight },
      n, disagreed, teamPts, wordPts, teamStreak, teamScore, wordScore,
    };
    roundHistory.push(result);
    emitPhase("round_end", result);
  }

  function hostStartRound(i){
    if(session.getRole() !== "host") return;
    if(i >= questions.length){ hostEndGame(); return; }
    const deadline = Date.now() + roundDuration;
    session.send({type:"round_start", round:i, deadline});
    beginRound(i, deadline);
  }
  function hostEndGame(){ session.send({type:"game_end"}); finishGame(); }
  function finishGame(){
    if(ended) return;
    ended = true;
    if(localTimeoutHandle){ clearTimeout(localTimeoutHandle); localTimeoutHandle=null; }
    const total = questions.length;
    emitPhase("finished", {
      teamScore, wordScore,
      outcome: teamScore > wordScore ? "victory" : (teamScore < wordScore ? "defeat" : "draw"),
      total, teamCorrectRounds, bothCorrectRounds, disagreements,
      teamAccuracy: total ? Math.round(teamCorrectRounds/total*100) : 0,
      missedTopics: Object.entries(missedTopics).sort((a,b)=>b[1]-a[1]).slice(0,4).map(e=>e[0]),
    });
  }

  return {
    setHandlers(h){ handlers = h; },
    hostSetConfig(cfg){ pendingConfig = cfg; trySendConfig(); },
    confirmReady(){ readyFlags.mine = true; session.send({type:"player_ready"}); checkBothReady(); },
    submitAnswer,
    advanceIfHost(){ if(session.getRole()==="host" && !ended) hostStartRound(roundIndex+1); },
    requestRematch(newSeed){
      if(session.getRole() !== "host") return;
      ended = false; roundIndex = -1; resolvedRounds = {}; pendingRivalMsgs = {};
      teamScore=0; wordScore=0; teamStreak=0; teamCorrectRounds=0; bothCorrectRounds=0; disagreements=0; missedTopics={}; roundHistory=[];
      readyFlags = {mine:false, rival:false};
      seed = newSeed ? O.makeSeed() : seed;
      if(config){ delete config.questionIds; delete config.wordPlan; }
      buildBoard();
      session.send({type:"config", config, seed});
      emitPhase("lobby_ready", {rounds:questions.length, config});
    },
    getState(){ return {
      config, seed, questions, roundIndex, teamScore, wordScore, teamStreak, roundHistory,
      plan: wordPlan[roundIndex] || null,
      myAnswerState: myAnswer&&myAnswer.state, rivalAnswerState: rivalAnswer&&rivalAnswer.state, myAnswerValue: myAnswer&&myAnswer.answer,
    }; },
  };
}

/* ---------------------------------------------------------------
   5. WORD POKER — duelo de conocimiento con farol
   Reutiliza exactamente la misma Session (transporte, apretón de
   manos, sincronización de reloj) que el modo Duelo — no se crea
   ninguna pila de red paralela. A diferencia del Duelo (respuesta
   simultánea con deadline), Poker es por turnos: no hay reloj de
   ronda — se espera la decisión humana, como un juego de mesa real.
   Cada lado calcula el resultado de forma determinista a partir de
   los mismos mensajes intercambiados (carta, farol, decisión), así
   que nunca hace falta "confiar" en lo que afirma el otro lado — la
   pregunta y su respuesta correcta son canónicas y las conoce cada
   cliente igualmente. Aviso honesto: sin servidor propio, un
   jugador con herramientas de desarrollador SIEMPRE podría mirar el
   banco canónico antes de tiempo — igual que en los desafíos con
   resultado sellado. Para una partida entre dos personas de
   confianza esto es un riesgo aceptable, pero no es "anti-trampa"
   real y no debe presentarse como tal.
--------------------------------------------------------------- */
const FAROL_TOKENS_PER_PLAYER = 3;
const POKER_ROUNDS_PER_DECK = 5; // cartas por mazo → nº de turnos que ataca cada jugador

function createPokerGame(session){
  let handlers = {};
  let myDeckIds = [];         // IDs de preguntas elegidas — nunca se envían enteros al rival
  let totalRounds = 0;        // 2 × POKER_ROUNDS_PER_DECK (turnos totales, alternando)
  let turnIndex = -1;
  let myFarolTokens = FAROL_TOKENS_PER_PLAYER, rivalFarolTokens = FAROL_TOKENS_PER_PLAYER;
  let myScore = 0, rivalScore = 0;
  let myCorrect = 0, rivalCorrect = 0, myBluffsSuccessful = 0, myBluffsDetectedByMe = 0;
  let myWildcardUsed = false, rivalWildcardUsed = false;
  let myComebackAvailable = true, rivalComebackAvailable = true;
  let readyFlags = {mine:false, rival:false};
  let ended = false;
  let matchHistory = []; // revelados resueltos, en orden — para el tablero de memoria
  // Estadísticas de "lectura del rival" (solo desde mi perspectiva de defensor)
  let rivalBluffCount = 0, trustedRivalBluffCount = 0, detectedRivalBluffCount = 0;
  let myDudoTotal = 0, myDudoCorrect = 0;

  const COMEBACK_THRESHOLD = 8;

  // Estado de la ronda en curso
  let round = null; // { turn, attackerIsMe, qid, claim, decision, answer, resolved, comebackActive, wildcardUsed }
  let lastSentForTurn = {}; // { [turn]: {card:bool, claim:bool, decision:bool} } — para reenviar tras reconexión

  function emitPhase(p, extra){ netLog("POKER:"+p, extra); if(handlers.onPhase) handlers.onPhase(p, extra||{}); }

  session.setHandlers({
    onState(s, extra){ if(handlers.onConnState) handlers.onConnState(s, extra); },
    onMessage(msg){ handleMsg(msg); }
  });

  function setMyDeck(qids){ myDeckIds = qids.slice(); }

  // Asalto de Faroles: los 2 turnos centrales de la partida, donde
  // faroles y detecciones valen más. Se calcula igual en ambos lados
  // a partir de totalRounds (ya sincronizado), sin necesidad de avisar.
  function isAsaltoTurn(turn){
    if(!totalRounds) return false;
    const mid = Math.floor(totalRounds/2);
    return turn === mid-1 || turn === mid;
  }

  function handleMsg(msg){
    if(msg.type === "poker_ready"){ readyFlags.rival = true; checkBothReady(); return; }
    if(msg.type === "poker_start"){
      totalRounds = msg.totalRounds;
      turnIndex = -1;
      beginTurn(0, msg.firstAttackerIsHost);
      return;
    }
    if(msg.type === "poker_next_turn"){
      if(session.getRole() === "host") return; // el host ya avanzó localmente al enviar este mensaje
      if(msg.turn === turnIndex) return; // reenvío idempotente (p.ej. tras reconexión)
      beginTurn(msg.turn, true);
      return;
    }
    if(msg.type === "poker_card"){
      if(msg.turn !== turnIndex || round.attackerIsMe) return; // solo el defensor procesa la carta del rival
      round.qid = msg.qid;
      emitPhase("defender_wait_claim", {});
      return;
    }
    if(msg.type === "poker_claim"){
      if(msg.turn !== turnIndex || round.attackerIsMe) return;
      round.claim = msg.claim;
      emitPhase("defender_decide", { qid: round.qid, claim: round.claim });
      return;
    }
    if(msg.type === "poker_decision"){
      if(msg.turn !== turnIndex || !round.attackerIsMe) return;
      round.decision = msg.decision;
      round.answer = msg.decision === "dudo" ? msg.answer : round.claim;
      round.wildcardUsed = !!msg.wildcardUsed;
      resolveTurn();
      return;
    }
    if(msg.type === "resume_request"){
      const sent = lastSentForTurn[turnIndex] || {};
      if(round && round.attackerIsMe){
        if(sent.card) session.send({type:"poker_card", turn:turnIndex, qid:round.qid});
        if(sent.claim) session.send({type:"poker_claim", turn:turnIndex, claim:round.claim});
      } else if(round){
        if(sent.decision) session.send({type:"poker_decision", turn:turnIndex, decision:round.decision, answer:round.answer, wildcardUsed:round.wildcardUsed});
      }
      return;
    }
  }

  function checkBothReady(){
    if(readyFlags.mine && readyFlags.rival && session.getRole() === "host"){
      const rounds = 2 * POKER_ROUNDS_PER_DECK;
      totalRounds = rounds;
      session.send({type:"poker_start", totalRounds:rounds, firstAttackerIsHost:true});
      turnIndex = -1;
      beginTurn(0, true);
    }
  }

  // firstAttackerIsHost define la alternancia: host ataca en turnos pares, invitado en impares.
  // La remontada se calcula de forma independiente e idéntica en ambos lados, a partir del
  // marcador ya sincronizado — no hace falta transmitirla, ambos llegan al mismo resultado.
  function beginTurn(turn, firstAttackerIsHost){
    turnIndex = turn;
    if(turn >= totalRounds){ finishMatch(); return; }
    const hostAttacks = (turn % 2 === 0) === firstAttackerIsHost;
    const iAmHost = session.getRole() === "host";
    const attackerIsMe = hostAttacks === iAmHost;

    const attackerScore = attackerIsMe ? myScore : rivalScore;
    const defenderScore = attackerIsMe ? rivalScore : myScore;
    const attackerComebackFlag = attackerIsMe ? myComebackAvailable : rivalComebackAvailable;
    let comebackActive = false;
    if(attackerComebackFlag && (defenderScore - attackerScore) >= COMEBACK_THRESHOLD){
      comebackActive = true;
      if(attackerIsMe) myComebackAvailable = false; else rivalComebackAvailable = false;
    }

    round = { turn, attackerIsMe, qid:null, claim:null, decision:null, answer:null, comebackActive, wildcardUsed:false };
    lastSentForTurn[turn] = {};
    emitPhase(attackerIsMe ? "attacker_select_card" : "defender_wait_card", { turn, total:totalRounds, attackerIsMe, comebackActive, asalto:isAsaltoTurn(turn) });
  }

  function playCard(qid){
    if(!round || !round.attackerIsMe || round.qid) return;
    round.qid = qid;
    lastSentForTurn[turnIndex].card = true;
    session.send({type:"poker_card", turn:turnIndex, qid});
    emitPhase("attacker_answer", { qid });
  }

  function submitClaim(claim){
    if(!round || !round.attackerIsMe || !round.qid || round.claim) return;
    round.claim = claim;
    lastSentForTurn[turnIndex].claim = true;
    session.send({type:"poker_claim", turn:turnIndex, claim});
    emitPhase("attacker_wait_defender", {});
  }

  function decideConfio(){
    if(!round || round.attackerIsMe || round.decision) return;
    round.decision = "confio"; round.answer = round.claim;
    lastSentForTurn[turnIndex].decision = true;
    session.send({type:"poker_decision", turn:turnIndex, decision:"confio", wildcardUsed:false});
    resolveTurn();
  }
  function decideDudo(answer){
    if(!round || round.attackerIsMe || round.decision) return;
    round.decision = "dudo"; round.answer = answer;
    lastSentForTurn[turnIndex].decision = true;
    session.send({type:"poker_decision", turn:turnIndex, decision:"dudo", answer, wildcardUsed:!!round.wildcardUsed});
    resolveTurn();
  }

  // Comodín 50/50 — solo para el defensor, solo antes de responder tras
  // DUDO, 1 uso por partida. Reduce a la mitad los puntos de esa ronda
  // si finalmente acierta (nunca es gratis).
  function useWildcard(){
    if(myWildcardUsed || !round || round.attackerIsMe || round.decision || !round.qid) return null;
    const q = O.Q_BY_ID[round.qid];
    if(!q) return null;
    myWildcardUsed = true;
    round.wildcardUsed = true;
    const wrongs = q.opciones.map(o=>o.letter).filter(l=>l!==q.respuesta);
    const keptWrong = wrongs[Math.floor(Math.random()*wrongs.length)];
    return [q.respuesta, keptWrong];
  }

  function resolveTurn(){
    if(!round || round.resolved || round.decision === null) return;
    round.resolved = true;
    const q = O.Q_BY_ID[round.qid];
    if(!q){ emitPhase("error", {message:"Pregunta no disponible"}); return; }
    const correct = q.respuesta;
    const attackerTruthful = round.claim === correct;
    const defenderCorrect = round.answer === correct;
    const asalto = isAsaltoTurn(round.turn);
    const iAmAttacker = round.attackerIsMe;

    let attackerPts = 0, defenderPts = 0;
    let farolConsumedByAttacker = false, fullBluffValue = true;

    if(attackerTruthful){
      if(round.decision === "confio"){ attackerPts = asalto?3:2; defenderPts = asalto?3:2; }
      else { // dudo
        if(defenderCorrect){ attackerPts = 1; defenderPts = 1; }
        else { attackerPts = asalto?3:2; defenderPts = 0; }
      }
    } else {
      const attackerTokensLeft = iAmAttacker ? myFarolTokens : rivalFarolTokens;
      farolConsumedByAttacker = attackerTokensLeft > 0;
      fullBluffValue = farolConsumedByAttacker;
      if(farolConsumedByAttacker){ if(iAmAttacker) myFarolTokens--; else rivalFarolTokens--; }
      if(round.decision === "confio"){
        attackerPts = fullBluffValue ? (asalto?6:4) : 1; defenderPts = 0;
      } else { // dudo
        if(defenderCorrect){ attackerPts = 0; defenderPts = fullBluffValue ? (asalto?5:3) : 2; }
        else { attackerPts = fullBluffValue ? (asalto?3:2) : 1; defenderPts = 0; }
      }
    }

    // Remontada: duplica SOLO los puntos del atacante en esta ronda (ya se decidió al empezar el turno).
    if(round.comebackActive) attackerPts *= 2;
    // Comodín 50/50: si el defensor acertó usándolo, sus puntos de esta ronda se reducen a la mitad.
    if(round.wildcardUsed && defenderCorrect) defenderPts = Math.max(1, Math.round(defenderPts/2));

    if(iAmAttacker){
      myScore += attackerPts; rivalScore += defenderPts;
      if(attackerTruthful) myCorrect++;
      if(!attackerTruthful && round.decision==="confio") myBluffsSuccessful++;
    } else {
      rivalScore += attackerPts; myScore += defenderPts;
      if(defenderCorrect) myCorrect++;
      if(!attackerTruthful && round.decision==="dudo" && defenderCorrect) myBluffsDetectedByMe++;
      // Estadísticas de lectura del rival (solo tienen sentido cuando YO defiendo)
      if(!attackerTruthful){
        rivalBluffCount++;
        if(round.decision==="confio") trustedRivalBluffCount++;
        else if(defenderCorrect) detectedRivalBluffCount++;
      }
      if(round.decision==="dudo"){ myDudoTotal++; if(defenderCorrect) myDudoCorrect++; }
    }

    const result = {
      turn: round.turn, question:q, attackerIsMe: iAmAttacker,
      claim: round.claim, decision: round.decision, answer: round.answer, correct,
      attackerTruthful, defenderCorrect, attackerPts, defenderPts, farolConsumedByAttacker,
      comebackActive: round.comebackActive, wildcardUsed: round.wildcardUsed, asalto,
      myScore, rivalScore,
    };
    matchHistory.push(result);
    emitPhase("reveal", result);
  }

  function nextTurn(){
    if(session.getRole() !== "host") return;
    const next = turnIndex + 1;
    session.send({type:"poker_next_turn", turn:next});
    beginTurn(next, true);
  }
  function finishMatch(){
    if(ended) return;
    ended = true;
    emitPhase("finished", {
      myScore, rivalScore, myCorrect, myBluffsSuccessful, myBluffsDetectedByMe,
      rivalBluffCount, trustedRivalBluffCount, detectedRivalBluffCount, myDudoTotal, myDudoCorrect,
      outcome: myScore>rivalScore ? "victory" : myScore<rivalScore ? "defeat" : "draw",
    });
  }

  return {
    setHandlers(h){ handlers = h; },
    setMyDeck,
    confirmReady(){ readyFlags.mine = true; session.send({type:"poker_ready"}); checkBothReady(); },
    playCard, submitClaim, decideConfio, decideDudo, useWildcard, nextTurn,
    getRound(){ return round; },
    getHistory(){ return matchHistory.slice(); },
    getState(){ return {
      turnIndex, totalRounds, myScore, rivalScore, myFarolTokens, rivalFarolTokens,
      myCorrect, myBluffsSuccessful, myBluffsDetectedByMe, deckIds:myDeckIds,
      myWildcardUsed, myComebackAvailable, asalto: isAsaltoTurn(turnIndex),
    }; },
  };
}

window.OPE_MP = {
  netLog, setDebugMode, getNetLog:()=>NET_LOG.slice(),
  createRealTransport, createMockPair,
  createSession, createDuelGame, createCoopGame, createPokerGame,
  generateRoomCode, FAROL_TOKENS_PER_PLAYER, POKER_ROUNDS_PER_DECK,
  // Fábrica de transporte sustituible — solo para pruebas automatizadas;
  // en producción siempre usa el transporte WebRTC real.
  _transportFactory: createRealTransport,
  makeTransport(){ return window.OPE_MP._transportFactory(); },
  __setTransportFactoryForTests(fn){ window.OPE_MP._transportFactory = fn; },
};
})();
