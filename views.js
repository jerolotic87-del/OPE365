/* ============================================================
   OPE365 · Capa de interfaz v2 (Inicio / Estudiar / Tests / Progreso)
   ============================================================ */
(function(){
"use strict";
const O = window.OPE;
const $ = (sel,ctx)=> (ctx||document).querySelector(sel);
const $$ = (sel,ctx)=> Array.from((ctx||document).querySelectorAll(sel));
const mainEl = ()=> document.getElementById("main-view");

/* ---------------------------------------------------------------
   ICONOS — un único sistema SVG lineal, coherente y discreto
--------------------------------------------------------------- */
const ICONS = {
  home:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
  study:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 15.5v-10z"/><path d="M4 15.5A2.5 2.5 0 016.5 18H20"/></svg>',
  tests:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></svg>',
  progress:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  settings:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.4.6.7 1 .7H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  code:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  share:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-3.9M8.6 13.5l6.8 3.9"/></svg>',
  challenge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1112 0c0 3-2 4-2 7H8c0-3-2-4-2-7z"/><path d="M9 21h6"/><path d="M10 17v2M14 17v2"/></svg>',
  lock:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  unlock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 017.6-1.8"/></svg>',
  history:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  bookmark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>',
  errors:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  chevronR:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  arrowL:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  play:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l14 8-14 8V4z"/></svg>',
  clock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  cards:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 7V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>',
  layers:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
};
function icon(name){ return ICONS[name] || ""; }

/* ---------------------------------------------------------------
   NAVEGACIÓN PRIMARIA
--------------------------------------------------------------- */
const PRIMARY_TABS = [
  {id:"home",       label:"Inicio",      ic:"home"},
  {id:"temario",    label:"Temario",     ic:"layers"},
  {id:"practica",   label:"Práctica",    ic:"study"},
  {id:"flashcards", label:"Flashcards",  ic:"cards"},
  {id:"progress",   label:"Progreso",    ic:"progress"},
];

function groupForView(view){
  if(view==="home") return "home";
  if(["temario","temario-detalle"].includes(view)) return "temario";
  if(["practica","study","test-wizard","test-preview","running","results",
      "review-hub","review-detail","mp-setup","mp-lobby","mp-game"].includes(view)) return "practica";
  if(["flashcards","flashcards-study"].includes(view)) return "flashcards";
  if(["progress","tests","challenges","challenge-create","challenge-detail",
      "comparison","history"].includes(view)) return "progress";
  return "home";
}

function renderTopbar(activeView){
  const group = groupForView(activeView);
  const navHtml = PRIMARY_TABS.map(t=>`
    <button class="nav-btn ${group===t.id?'active':''}" data-goto="${t.id}">${t.label}</button>
  `).join("");
  const navHtmlMobile = PRIMARY_TABS.map(t=>`
    <button class="nav-btn ${group===t.id?'active':''}" data-goto="${t.id}">${icon(t.ic)}<span>${t.label}</span></button>
  `).join("");
  document.getElementById("primary-nav").innerHTML = navHtml;
  document.getElementById("bottom-nav").innerHTML = navHtmlMobile;
}

function go(view, params){
  O.Nav.view = view;
  O.Nav.params = params||{};
  window.scrollTo({top:0});
  renderTopbar(view);
  render(view, O.Nav.params);
}
window.addEventListener("click", (e)=>{
  const btn = e.target.closest("[data-goto]");
  if(btn){ go(btn.getAttribute("data-goto"), btn.dataset.params ? JSON.parse(btn.dataset.params) : undefined); }
});

function render(view, params){
  params = params || {};
  if(view==="home") return renderHome();
  if(view==="temario") return renderTemario();
  if(view==="practica" || view==="study") return renderTestWizard(params.mode ? params : {mode:"practice"});
  if(view==="tests") return renderProgress();
  if(view==="progress") return renderProgress();
  if(view==="test-wizard") return renderTestWizard(params);
  if(view==="running") return renderRunner();
  if(view==="results") return renderResults();
  if(view==="review-hub") return renderReviewHub(params);
  if(view==="challenges") return renderChallengesList();
  if(view==="challenge-detail") return renderChallengeDetail(params);
  if(view==="comparison") return renderComparison(params);
  if(view==="history") return renderHistory();
  if(view==="mp-setup") return renderMpSetup();
  if(view==="mp-lobby") return renderMpLobby();
  if(view==="mp-game") return renderMpGame();
  if(view==="flashcards") return renderFlashcardsHub(params);
  if(view==="flashcards-study") return renderFlashcardsStudy();
  if(view==="temario-detalle") return renderTemarioDetalle(params);
  return renderHome();
}

function tipoLabel(t){ return O.TYPE_LABELS[t] || t; }
function categoriaLabel(c){ return O.CATEGORY_LABELS[c] || c; }
function truncate(s,n){ return s.length>n ? s.slice(0,n-1)+"…" : s; }
function badgeClass(qid){ const st=O.getQuestionState(qid); return st==="correct"?"badge-correct":st==="incorrect"?"badge-incorrect":"badge-unanswered"; }
function badgeGlyph(qid){ const st=O.getQuestionState(qid); return st==="correct"?"✓":st==="incorrect"?"✕":"–"; }
function toggleMark(qid){ if(O.PROGRESS.marked[qid]) delete O.PROGRESS.marked[qid]; else O.PROGRESS.marked[qid]=true; O.persist(); }

/* ---------------------------------------------------------------
   INICIO — dashboard: continuar · estado · acciones
--------------------------------------------------------------- */
function dayKey(ts){ const d = new Date(ts); return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); }
function studyStreak(){
  const days = new Set();
  Object.values(O.PROGRESS.answers||{}).forEach(a=>{ if(a && a.ultimaVez) days.add(dayKey(a.ultimaVez)); });
  (O.PROGRESS.history||[]).forEach(h=>{ if(h && h.finishedAt) days.add(dayKey(h.finishedAt)); });
  if(!days.size) return 0;
  let streak = 0;
  const d = new Date(); d.setHours(0,0,0,0);
  if(!days.has(dayKey(d.getTime()))) d.setDate(d.getDate()-1);
  while(days.has(dayKey(d.getTime()))){ streak++; d.setDate(d.getDate()-1); }
  return streak;
}

function renderHome(){
  const s = O.computeStats();
  const fc = O.computeFlashcardStats();
  const saved = O.PROGRESS.currentSession;
  const hasContinue = saved && !saved.finished && saved.questionIds && saved.questionIds.length;
  const pendingChallenges = Object.values(O.PROGRESS.challenges||{}).filter(c=>c.role==="recipient" && c.status!=="UNLOCKED" && c.status!=="COMPLETED");
  const streak = studyStreak();
  const last = O.PROGRESS.history.slice(-1)[0];

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <p class="eyebrow">OPE365 · Word 365</p>
      <h1>${hasContinue ? "Sigamos donde lo dejaste" : "¿Qué estudiamos hoy?"}</h1>
    </div>

    ${hasContinue ? `
    <button class="hero-continue as-button" id="home-continue">
      <div>
        <div class="label">Continuar</div>
        <h3>${saved.mode==="exam"?"Examen":"Práctica"} en curso</h3>
        <p>${Object.keys(saved.responses||{}).length} de ${saved.questionIds.length} preguntas respondidas</p>
      </div>
      <span class="hc-go">${icon('play')}</span>
    </button>` : ``}

    <div class="stat-strip">
      <div class="ss-cell"><div class="ss-num">${streak}</div><div class="ss-lbl">día${streak===1?'':'s'} de racha</div></div>
      <div class="ss-cell"><div class="ss-num">${s.accuracy}<small>%</small></div><div class="ss-lbl">precisión</div></div>
      <div class="ss-cell"><div class="ss-num">${s.incorrect}</div><div class="ss-lbl">falladas</div></div>
      <div class="ss-cell"><div class="ss-num">${fc.pendientes}</div><div class="ss-lbl">flashcards</div></div>
    </div>

    <div class="section-block">
      <div class="section-title"><h3>Empezar</h3></div>
      <div class="action-grid">
        <button class="action-card" data-goto="practica">
          <div class="ic">${icon('study')}</div><div class="t">Practicar</div>
          <div class="d">Configura una sesión en segundos</div>
        </button>
        <button class="action-card" data-goto="flashcards">
          <div class="ic">${icon('cards')}</div><div class="t">Flashcards</div>
          <div class="d">${fc.pendientes} pendientes de repaso</div>
        </button>
        <button class="action-card" id="home-errors" ${s.incorrect?'':'disabled'}>
          <div class="ic">${icon('errors')}</div><div class="t">Repasar errores</div>
          <div class="d">${s.incorrect} preguntas falladas</div>
        </button>
        <button class="action-card" data-goto="mp-setup">
          <div class="ic">${icon('challenge')}</div><div class="t">Duelo en vivo</div>
          <div class="d">Reto en tiempo real con otra persona</div>
        </button>
      </div>
    </div>

    ${(pendingChallenges.length || last) ? `<div class="nav-list" style="margin-top:var(--sp-2);">
      ${pendingChallenges.length ? `<button class="nav-row" data-goto="challenges">
        <span class="nr-ic">${icon('challenge')}</span>
        <span class="nr-title">${pendingChallenges.length} desafío${pendingChallenges.length===1?'':'s'} pendiente${pendingChallenges.length===1?'':'s'}</span>
        <span class="nr-chev">${icon('chevronR')}</span></button>` : ``}
      ${last ? `<button class="nav-row" data-goto="progress">
        <span class="nr-ic">${icon('progress')}</span>
        <span class="nr-title">Última sesión: ${last.mode==="exam"?"examen":"práctica"} ${last.correct}/${last.total} (${last.accuracy}%)</span>
        <span class="nr-meta">${O.fmtDate(last.finishedAt)}</span><span class="nr-chev">${icon('chevronR')}</span></button>` : ``}
    </div>` : ``}
  </div>`;

  if(hasContinue){
    $("#home-continue").addEventListener("click", ()=>{
      const hydrated = O.hydrateSession(saved);
      O.setSession(hydrated); O.saveSessionSnapshot(); go("running");
    });
  }
  const errBtn = $("#home-errors");
  if(errBtn) errBtn.addEventListener("click", ()=>{
    const s2 = O.buildSession({mode:"practice", scope:"errores", count:"todas", qOrder:"aleatorio", source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true});
    if(s2){ O.setSession(s2); O.saveSessionSnapshot(); go("running"); }
    else O.toast("No tienes preguntas falladas pendientes");
  });
}

function renderChallengeCardHtml(c){
  const statusLabel = {CREATED:"Creado", WAITING:"Pendiente", IN_PROGRESS:"En curso", COMPLETED:"Completado", UNLOCKED:"Desbloqueado"}[c.status]||c.status;
  const statusClass = {CREATED:"pending", WAITING:"pending", IN_PROGRESS:"progress", COMPLETED:"done", UNLOCKED:"done"}[c.status]||"";
  const n = (c.ids && c.ids.length) || c.cfg.count || "?";
  return `<button class="challenge-card" style="width:100%; text-align:left; cursor:pointer; border:1px solid var(--border); background:var(--surface);" data-challenge-open="${c.challengeId}">
    <div>
      <div class="t">${c.role==="creator"?"Reto que creaste":"Reto recibido"}</div>
      <div class="d">${n} preguntas · ${c.sealedResult||c.creatorResult!==undefined&&c.status==='WAITING'?'resultado oculto':'desde cero'}</div>
    </div>
    <span class="status-pill ${statusClass}">${statusLabel}</span>
  </button>`;
}

/* ---------------------------------------------------------------
   TEMARIO — biblioteca de contenido: las 10 pestañas de Word 365
   como una lista con progreso, no una rejilla de tarjetas.
--------------------------------------------------------------- */
function sectionProgress(sid){
  const qs = O.QUESTIONS.filter(q=>q.section===sid);
  const total = qs.length;
  let answered=0, correct=0;
  qs.forEach(q=>{ const a=O.PROGRESS.answers[q.id]; if(a){ answered++; if(a.correcta) correct++; } });
  return { total, answered, correct, pct: total ? Math.round((answered/total)*100) : 0 };
}

function renderTemario(){
  const taxStats = O.computeTaxonomyStats();
  const globalAnswered = O.TAXONOMY_SECTIONS.reduce((n,s)=> n + sectionProgress(s.id).answered, 0);
  const globalTotal = O.QUESTIONS.length;

  mainEl().innerHTML = `
  <div class="view">
    <div class="view-head">
      <p class="eyebrow">Temario</p>
      <h1>Explora Word 365 por pestañas</h1>
      <p>${O.TAXONOMY_SECTIONS.length} pestañas de la cinta · ${globalAnswered} de ${globalTotal} preguntas vistas.</p>
    </div>

    <div class="progress-list">
      ${O.TAXONOMY_SECTIONS.map(sec=>{
        const st = taxStats[sec.id] || {questions:0, flashcards:0};
        const p = sectionProgress(sec.id);
        const empty = st.questions === 0;
        return `<button class="progress-row${empty?' is-empty':''}" data-goto="temario-detalle" data-params='{"sectionId":"${sec.id}"}'>
          <div class="pr-main">
            <div class="pr-name">${O.escapeHtml(sec.name)}</div>
            <div class="pr-meta">${st.questions} pregunta${st.questions===1?'':'s'}${st.flashcards?` · ${st.flashcards} flashcard${st.flashcards===1?'':'s'}`:''}</div>
          </div>
          <div class="pr-bar"><div class="bar-track"><i style="width:${p.pct}%"></i></div></div>
          <div class="pr-pct">${empty?'—':p.pct+'%'}</div>
          <span class="pr-chev">${icon('chevronR')}</span>
        </button>`;
      }).join("")}
    </div>
  </div>`;
}

function renderHistory(){
  const hist = O.PROGRESS.history.slice().reverse();
  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="progress" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Progreso</button>
      <h1>Historial</h1>
      <p>${hist.length} sesiones completadas.</p>
    </div>
    ${hist.length ? `<ul class="mini-list">${hist.map(h=>`
      <li><span class="mini-row-main">${h.mode==="exam"?"Test":"Práctica"} · ${h.correct}/${h.total} (${h.accuracy}%)</span><span class="mini-row-sub">${O.fmtDate(h.finishedAt)}</span></li>
    `).join("")}</ul>` : `<div class="empty-panel"><div class="glyph">${icon('history')}</div><h4>Sin sesiones todavía</h4><p>Tu historial aparecerá aquí en cuanto completes una.</p></div>`}
  </div>`;
}

/* ---------------------------------------------------------------
   ASISTENTE DE CREACIÓN DE TEST — divulgación progresiva
--------------------------------------------------------------- */
let wizardState = {};

function renderTestWizard(params){
  wizardState = {
    mode: params.mode || "practice",
    scope: "todo", // todo | tema | tipo | marcadas | errores
    source: "all", tema: "all", tipo: "all", categoria: "all",
    section: "all", topic: "all",
    count: "20", qOrder: "aleatorio", shuffleOptions: true, minutes: "20",
    step: 1,
  };
  // Los accesos rápidos desde Estudiar preseleccionan el ámbito pero
  // siempre entran por el paso 1, para que el usuario elija el tema/tipo
  // concreto antes de continuar (nunca se salta esa elección).
  if(params.step==="tema") wizardState.scope="tema";
  if(params.step==="tipo") wizardState.scope="tipo";
  renderWizardStep();
}

const WIZARD_STEPS_EXAM = 4; // qué / cuántas / tiempo / avanzado(preview)
const WIZARD_STEPS_PRACTICE = 3; // qué / cuántas / avanzado(preview)

function wizardTotalSteps(){ return wizardState.mode==="exam" ? WIZARD_STEPS_EXAM : WIZARD_STEPS_PRACTICE; }

function renderWizardStep(){
  const names = wizardState.mode==="exam"
    ? ["Contenido","Preguntas","Tiempo","Resumen"]
    : ["Contenido","Preguntas","Resumen"];
  const stepper = names.map((nm,i)=>{
    const n = i+1, cls = n<wizardState.step ? "done" : n===wizardState.step ? "current" : "";
    return `<div class="wz-step ${cls}"><span class="wz-num">${n<wizardState.step?"✓":n}</span><span class="wz-lbl">${nm}</span></div>`;
  }).join(`<span class="wz-sep"></span>`);

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="${wizardState.mode==='exam'?'progress':'home'}" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Cancelar</button>
      <p class="eyebrow">Práctica</p>
      <h1>Configura tu sesión</h1>
    </div>
    ${wizardState.step===1 ? `
    <div class="segmented wz-mode" style="margin-bottom:var(--sp-5);">
      <button class="seg ${wizardState.mode!=='exam'?'on':''}" data-mode="practice">Práctica</button>
      <button class="seg ${wizardState.mode==='exam'?'on':''}" data-mode="exam">Examen</button>
    </div>
    <p class="wz-mode-hint">${wizardState.mode==='exam' ? 'Sin corrección ni explicaciones hasta el final; con cronómetro opcional.' : 'Corrección y explicación inmediata después de cada pregunta.'}</p>
    ` : ``}
    <div class="wz-stepper">${stepper}</div>
    <div id="wizard-body"></div>
  </div>`;

  if(wizardState.step===1){
    $$(".wz-mode .seg").forEach(b=> b.addEventListener("click", ()=>{
      if(b.getAttribute("data-mode")===wizardState.mode) return;
      wizardState.mode = b.getAttribute("data-mode");
      renderWizardStep();
    }));
  }

  if(wizardState.step===1) renderWizardWhat();
  else if(wizardState.step===2) renderWizardCount();
  else if(wizardState.step===3 && wizardState.mode==="exam") renderWizardTime();
  else renderWizardPreview();
}

function renderWizardWhat(){
  const body = $("#wizard-body");
  const scopes = [
    {id:"todo", t:"Todo", d:"Todas las preguntas del banco"},
    {id:"tema", t:"Tema", d:"Elige un bloque concreto"},
    {id:"tipo", t:"Tipo de ejercicio", d:"Opción única, V/F, multi, emparejar"},
    {id:"categoria", t:"Rutas / atajos", d:"Solo atajos o solo rutas de menú"},
    {id:"marcadas", t:"Preguntas marcadas", d:"Tus preguntas guardadas"},
    {id:"errores", t:"Preguntas falladas", d:"Repasar tus errores"},
  ];
  body.innerHTML = `
    <h3 class="wz-q">¿Qué quieres practicar?</h3>
    <div class="choice-grid" id="wiz-scope">
      ${scopes.map(s=>`<button class="choice-card ${wizardState.scope===s.id?'selected':''}" data-scope="${s.id}"><div class="t">${s.t}</div><div class="d">${s.d}</div></button>`).join("")}
    </div>
    <div id="wiz-scope-detail"></div>
    <div style="margin-top:var(--sp-6);"><button class="btn btn-solid btn-block btn-lg" id="wiz-next">Continuar ${icon('chevronR')}</button></div>
  `;
  renderScopeDetail();
  $$("#wiz-scope .choice-card").forEach(c=>{
    c.addEventListener("click", ()=>{
      wizardState.scope = c.getAttribute("data-scope");
      $$("#wiz-scope .choice-card").forEach(x=>x.classList.remove("selected"));
      c.classList.add("selected");
      renderScopeDetail();
    });
  });
  $("#wiz-next").addEventListener("click", ()=>{ wizardState.step=2; renderWizardStep(); });

  function renderScopeDetail(){
    const el = $("#wiz-scope-detail");
    el.className = "";
    if(wizardState.scope==="tema"){
      const sections = O.TAXONOMY_SECTIONS;
      el.className = "config-panel";
      el.innerHTML = `
        <div class="field"><label>Pestaña</label><select id="wiz-section">${sections.map(s=>`<option value="${s.id}">${O.escapeHtml(s.name)}</option>`).join("")}</select></div>
        <div class="field" style="margin-bottom:0;"><label>Grupo</label><select id="wiz-topic"></select></div>
      `;
      if(wizardState.section==="all") wizardState.section = sections[0].id;
      $("#wiz-section").value = wizardState.section;
      function refreshTopicSelect(){
        const sec = sections.find(s=>s.id===$("#wiz-section").value);
        const topics = (sec && sec.topics) || [];
        const topicSel = $("#wiz-topic");
        topicSel.innerHTML = `<option value="all">Toda la pestaña${sec?" ("+O.escapeHtml(sec.name)+")":""}</option>` +
          topics.map(t=>`<option value="${t.id}">${O.escapeHtml(t.name)}</option>`).join("");
        topicSel.value = topics.some(t=>t.id===wizardState.topic) ? wizardState.topic : "all";
        wizardState.topic = topicSel.value;
      }
      refreshTopicSelect();
      wizardState.section = $("#wiz-section").value;
      $("#wiz-section").addEventListener("change", ()=>{ wizardState.section=$("#wiz-section").value; wizardState.topic="all"; refreshTopicSelect(); });
      $("#wiz-topic").addEventListener("change", ()=> wizardState.topic = $("#wiz-topic").value);
    } else if(wizardState.scope==="tipo"){
      el.className = "config-panel";
      el.innerHTML = `<label class="cp-label">Tipo de ejercicio</label><div class="pill-row" id="wiz-tipo-pills">
        ${Object.entries(O.TYPE_LABELS).map(([v,l])=>`<button class="pill ${wizardState.tipo===v?'active':''}" data-v="${v}">${l}</button>`).join("")}
      </div>`;
      if(wizardState.tipo==="all") wizardState.tipo="opcion_unica";
      $$("#wiz-tipo-pills .pill").forEach(p=>{
        if(p.getAttribute("data-v")===wizardState.tipo) p.classList.add("active");
        p.addEventListener("click", ()=>{ wizardState.tipo=p.getAttribute("data-v"); $$("#wiz-tipo-pills .pill").forEach(x=>x.classList.remove("active")); p.classList.add("active"); });
      });
    } else if(wizardState.scope==="categoria"){
      el.className = "config-panel";
      el.innerHTML = `<label class="cp-label">Dimensión</label><div class="pill-row" id="wiz-cat-pills">
        ${O.CATEGORY_REGISTRY.filter(c=>c.id!=="general").map(c=>`<button class="pill ${wizardState.categoria===c.id?'active':''}" data-v="${c.id}">${c.name}</button>`).join("")}
      </div>`;
      if(wizardState.categoria==="all") wizardState.categoria = O.CATEGORY_REGISTRY.find(c=>c.id!=="general").id;
      $$("#wiz-cat-pills .pill").forEach(p=>{
        if(p.getAttribute("data-v")===wizardState.categoria) p.classList.add("active");
        p.addEventListener("click", ()=>{ wizardState.categoria=p.getAttribute("data-v"); $$("#wiz-cat-pills .pill").forEach(x=>x.classList.remove("active")); p.classList.add("active"); });
      });
    } else {
      el.innerHTML = "";
    }
  }
}

function renderWizardCount(){
  const body = $("#wizard-body");
  const counts = [10,20,30,50,100,"todas"];
  body.innerHTML = `
    <h3 class="wz-q">¿Cuántas preguntas?</h3>
    <div class="segmented segmented-wrap" id="wiz-count-pills">
      ${counts.map(c=>`<button class="seg ${String(wizardState.count)===String(c)?'on':''}" data-c="${c}">${c==="todas"?"Todas":c}</button>`).join("")}
    </div>
    <details class="advanced" style="margin-top:var(--sp-5);">
      <summary>Opciones avanzadas</summary>
      <div class="config-panel" style="margin-top:var(--sp-3);">
        <div class="field"><label>Orden de preguntas</label><select id="wiz-order">
          <option value="aleatorio" ${wizardState.qOrder==='aleatorio'?'selected':''}>Aleatorio</option>
          <option value="fuente" ${wizardState.qOrder==='fuente'?'selected':''}>Orden de fuente</option>
          <option value="tematico" ${wizardState.qOrder==='tematico'?'selected':''}>Temático</option>
          <option value="dificultad" ${wizardState.qOrder==='dificultad'?'selected':''}>Por tipo de ejercicio</option>
        </select></div>
        <div class="field" style="margin-bottom:0;"><label>Orden de respuestas</label><div class="segmented" id="wiz-shuffle-pills">
          <button class="seg ${wizardState.shuffleOptions?'on':''}" data-v="1">Aleatorio</button>
          <button class="seg ${!wizardState.shuffleOptions?'on':''}" data-v="0">Original</button>
        </div></div>
      </div>
    </details>
    <div style="margin-top:var(--sp-6); display:flex; gap:10px;">
      <button class="btn btn-outline" id="wiz-back">${icon('arrowL')}</button>
      <button class="btn btn-solid btn-block btn-lg" id="wiz-next">Continuar ${icon('chevronR')}</button>
    </div>
  `;
  $$("#wiz-count-pills .seg").forEach(p=>{
    p.addEventListener("click", ()=>{ wizardState.count=p.getAttribute("data-c"); $$("#wiz-count-pills .seg").forEach(x=>x.classList.remove("on")); p.classList.add("on"); });
  });
  $("#wiz-order").addEventListener("change", ()=> wizardState.qOrder = $("#wiz-order").value);
  $$("#wiz-shuffle-pills .seg").forEach(p=>{
    p.addEventListener("click", ()=>{ wizardState.shuffleOptions = p.getAttribute("data-v")==="1"; $$("#wiz-shuffle-pills .seg").forEach(x=>x.classList.remove("on")); p.classList.add("on"); });
  });
  $("#wiz-back").addEventListener("click", ()=>{ wizardState.step=1; renderWizardStep(); });
  $("#wiz-next").addEventListener("click", ()=>{ wizardState.step++; renderWizardStep(); });
}

function renderWizardTime(){
  const body = $("#wizard-body");
  body.innerHTML = `
    <h3 class="wz-q">¿Con cronómetro?</h3>
    <div class="choice-grid" id="wiz-time-pills">
      <button class="choice-card ${wizardState.timed!==false?'selected':''}" data-v="timed"><div class="t">Con tiempo</div><div class="d">Simulacro real</div></button>
      <button class="choice-card ${wizardState.timed===false?'selected':''}" data-v="free"><div class="t">Sin tiempo</div><div class="d">A tu ritmo</div></button>
    </div>
    <div class="config-panel" id="wiz-minutes-field" style="margin-top:var(--sp-4); ${wizardState.timed===false?'display:none;':''}">
      <div class="field" style="margin-bottom:0;"><label>Minutos</label>
      <input type="number" id="wiz-minutes" value="${wizardState.minutes}" min="1" max="240"></div>
    </div>
    <div style="margin-top:var(--sp-6); display:flex; gap:10px;">
      <button class="btn btn-outline" id="wiz-back">${icon('arrowL')}</button>
      <button class="btn btn-solid btn-block btn-lg" id="wiz-next">Continuar ${icon('chevronR')}</button>
    </div>
  `;
  wizardState.timed = wizardState.timed !== false;
  $$("#wiz-time-pills .choice-card").forEach(c=>{
    c.addEventListener("click", ()=>{
      wizardState.timed = c.getAttribute("data-v")==="timed";
      $$("#wiz-time-pills .choice-card").forEach(x=>x.classList.remove("selected"));
      c.classList.add("selected");
      $("#wiz-minutes-field").style.display = wizardState.timed ? "" : "none";
    });
  });
  $("#wiz-minutes").addEventListener("input", ()=> wizardState.minutes = $("#wiz-minutes").value);
  $("#wiz-back").addEventListener("click", ()=>{ wizardState.step=2; renderWizardStep(); });
  $("#wiz-next").addEventListener("click", ()=>{ wizardState.step++; renderWizardStep(); });
}

function wizardToConfig(){
  const scope = ["marcadas","errores"].includes(wizardState.scope) ? wizardState.scope : null;
  return {
    mode: wizardState.mode,
    scope: scope === "errores" ? "errores" : scope === "marcadas" ? "marcadas" : null,
    source: "all",
    section: wizardState.scope==="tema" ? wizardState.section : "all",
    topic: wizardState.scope==="tema" ? wizardState.topic : "all",
    tipo: wizardState.scope==="tipo" ? wizardState.tipo : "all",
    categoria: wizardState.scope==="categoria" ? wizardState.categoria : "all",
    count: wizardState.count,
    qOrder: wizardState.qOrder,
    shuffleOptions: wizardState.shuffleOptions,
    minutes: (wizardState.mode==="exam" && wizardState.timed!==false) ? wizardState.minutes : null,
  };
}

function renderWizardPreview(){
  const body = $("#wizard-body");
  const config = wizardToConfig();
  const previewIds = O.resolveQuestionIds(config);
  const n = previewIds.length;
  const typesInSet = new Set(previewIds.map(id=>O.Q_BY_ID[id].tipo));

  body.innerHTML = `
    <div class="test-preview">
      <div class="big">${n}</div>
      <div class="sub">preguntas${config.count!=="todas" && n<Number(config.count) ? " (todas las disponibles)" : ""}</div>
      <div class="meta-row">
        <span>Modo: <b>${config.mode==="exam"?"Examen":"Práctica"}</b></span>
        <span>Tiempo: <b>${config.minutes ? config.minutes+" min" : "libre"}</b></span>
        <span>Tipos: <b>${typesInSet.size}</b></span>
      </div>
    </div>
    ${n===0 ? `<p style="text-align:center; color:var(--bad); font-size:13px; margin-top:var(--sp-4);">No hay preguntas disponibles con esta configuración.</p>` : ``}
    <div style="margin-top:var(--sp-6); display:flex; gap:10px;">
      <button class="btn btn-outline" id="wiz-back">${icon('arrowL')}</button>
      <button class="btn btn-solid btn-block btn-lg" id="wiz-start" ${n===0?'disabled':''}>${icon('play')} ${config.mode==="exam"?"Empezar examen":"Empezar práctica"}</button>
    </div>
  `;
  $("#wiz-back").addEventListener("click", ()=>{ wizardState.step = wizardState.mode==="exam" ? 3 : 2; renderWizardStep(); });
  $("#wiz-start").addEventListener("click", ()=>{
    const s = O.buildSession(config);
    if(!s){ O.toast("No hay preguntas disponibles con esos filtros"); return; }
    O.setSession(s); O.saveSessionSnapshot(); go("running");
  });
}

/* ---------------------------------------------------------------
   SESIÓN DE ESTUDIO — shell consistente, la pregunta domina
--------------------------------------------------------------- */
let pendingMultiSelection = [];
let pendingMatchSelection = { leftId:null, pairs:{} };
let pendingBlankValues = [];

function renderRunner(){
  const s = O.getSession();
  if(!s){ go("home"); return; }
  const isExam = s.mode==="exam";

  mainEl().innerHTML = `
  <div class="view ${isExam?'':'view-narrow'}">
    <div class="session-shell" style="max-width:${isExam?'none':'720px'};">
      <div class="session-topbar">
        <button class="exit" id="session-exit">${icon('arrowL')} Salir</button>
        <span class="counter" id="session-counter"></span>
        ${isExam ? `<button class="icon-btn" id="session-pause" aria-label="Pausa" title="Pausa" style="width:30px;height:30px;">⏸</button>` : ''}
      </div>
      <div class="session-progress"><i id="session-progress-bar"></i></div>
      <div class="${isExam?'exam-layout':''}">
        <div><div class="surface qcard" id="runner-qcard" style="padding:var(--sp-6);"></div></div>
        ${isExam ? `<div class="exam-sidebar">
          <div class="timer-box" id="timer-box"><span style="font-size:12px;color:var(--text-2);">Tiempo</span><span class="clock" id="timer-clock">--:--</span></div>
          <div class="nav-legend">
            <span><i style="background:var(--surface-2);border:1px solid var(--border-2);"></i>Respondida</span>
            <span><i style="background:var(--surface);border:1px solid var(--border);"></i>Sin responder</span>
            <span><i style="background:var(--warn);"></i>★ Marcada</span>
          </div>
          <div class="navgrid" id="exam-navgrid"></div>
          <button class="btn btn-solid btn-block" id="exam-submit">Entregar test</button>
        </div>`:``}
      </div>
    </div>
  </div>`;

  $("#session-exit").addEventListener("click", confirmExitSession);
  const pauseBtn = $("#session-pause");
  if(pauseBtn) pauseBtn.addEventListener("click", showExamPauseOverlay);
  renderQuestionCard(s.questions[s.current], s, isExam);
  if(isExam){ renderNavGrid(); setupTimer(s); $("#exam-submit").addEventListener("click", confirmSubmitExam); }
}

function updateSessionChrome(s){
  const counter = $("#session-counter");
  if(counter) counter.textContent = `Pregunta ${s.current+1} de ${s.questions.length}`;
  const bar = $("#session-progress-bar");
  if(bar) bar.style.width = Math.round(((s.current+1)/s.questions.length)*100) + "%";
}

function showExamPauseOverlay(){
  const timer = O.getActiveTimer();
  if(timer) timer.stop();
  showModal(`
    <h3>Pausa</h3>
    <p>El cronómetro se ha detenido. Retoma cuando quieras seguir.</p>
    <div class="actions"><button class="btn btn-solid" id="exam-resume">Reanudar</button></div>
    <button class="btn btn-ghost btn-block" id="exam-pause-exit" style="margin-top:10px;">Salir del test</button>
  `, (root)=>{
    root.querySelector("#exam-resume").addEventListener("click", ()=>{ closeModal(); if(timer) timer.start(); });
    root.querySelector("#exam-pause-exit").addEventListener("click", ()=>{ closeModal(); confirmExitSession(); });
  });
}

function confirmExitSession(){
  showModal(`
    <h3>¿Salir de la sesión?</h3>
    <p>Tu progreso se guarda automáticamente — podrás continuar desde donde lo dejaste.</p>
    <div class="actions">
      <button class="btn btn-ghost" id="exit-cancel">Seguir aquí</button>
      <button class="btn btn-outline" id="exit-confirm">Salir</button>
    </div>
  `, (root)=>{
    root.querySelector("#exit-cancel").addEventListener("click", closeModal);
    root.querySelector("#exit-confirm").addEventListener("click", ()=>{ closeModal(); go(O.getSession().mode==="exam"?"progress":"home"); });
  });
}

function renderQuestionCard(q, s, isExam){
  const idx = s.current;
  const resp = s.responses[idx];
  const answeredAlready = !!resp;
  const marked = !!s.markedThisSession[q.id] || O.isMarked(q.id);
  updateSessionChrome(s);

  const card = document.getElementById("runner-qcard");
  card.innerHTML = `
    <div class="qcard-top">
      <div class="qcard-meta">
        <span class="tag tag-type">${tipoLabel(q.tipo)}</span>
        ${q.categoria && q.categoria!=="general" ? `<span class="tag">${categoriaLabel(q.categoria)}</span>` : ''}
        ${q.negativa ? '<span class="tag tag-neg">⚠ Negativa</span>' : ''}
      </div>
      <button class="star ${marked?"on":""}" id="q-star">★</button>
    </div>
    <h3>${O.renderBlank(q.enunciado)}</h3>
    <div id="q-body"></div>
    <div id="q-feedback"></div>
    <details class="meta-panel">
      <summary>Detalles de la pregunta</summary>
      <div class="meta-grid">
        <div><b>Tema</b>${O.escapeHtml(q.tema||"—")}</div>
        <div><b>Fuente</b>${q.sourceFile} (pregunta ${q.qnumInSource||"—"})</div>
      </div>
    </details>
    <div class="qnav-footer">
      <button class="btn btn-outline btn-sm" id="q-prev" ${idx===0?"disabled":""}>${icon('arrowL')}</button>
      <span class="pos">${idx+1} / ${s.questions.length}</span>
      <button class="btn btn-primary btn-sm" id="q-next">${idx===s.questions.length-1 ? (isExam?"Ir a resumen":"Finalizar") : "Siguiente"}</button>
    </div>
  `;

  pendingMultiSelection = (answeredAlready && Array.isArray(resp.answer) && q.tipo==="seleccion_multiple") ? resp.answer.slice() : [];
  pendingMatchSelection = { leftId:null, pairs: (answeredAlready && resp.answer && q.tipo==="emparejamiento") ? Object.assign({},resp.answer) : {} };
  pendingBlankValues = (q.tipo==="relleno") ? new Array(O.countBlanks(q.enunciado)).fill("") : [];

  renderQuestionBody(q, s, isExam, answeredAlready, resp);

  $("#q-star").addEventListener("click", (e)=>{
    toggleMark(q.id); s.markedThisSession[q.id] = O.isMarked(q.id);
    e.currentTarget.classList.toggle("on");
    if(isExam) renderNavGrid();
  });
  $("#q-prev").addEventListener("click", ()=>{
    s.current = Math.max(0, s.current-1); O.saveSessionSnapshot();
    renderQuestionCard(s.questions[s.current], s, isExam); if(isExam) renderNavGrid();
  });
  $("#q-next").addEventListener("click", ()=>{
    if(idx === s.questions.length-1){ if(isExam){ go("results"); } else { finishPracticeSession(s); } return; }
    s.current = idx+1; O.saveSessionSnapshot();
    renderQuestionCard(s.questions[s.current], s, isExam); if(isExam) renderNavGrid();
  });
}

function renderQuestionBody(q, s, isExam, answeredAlready, resp){
  const body = document.getElementById("q-body");
  const feedback = document.getElementById("q-feedback");
  feedback.innerHTML = "";

  if(q.tipo==="opcion_unica"){
    body.innerHTML = `<div class="options">${q.opciones.map(o=>
      `<button class="option ${answeredAlready ? optionResultClass(o.letter,q,resp) : ''}" data-letter="${o.letter}" ${answeredAlready?"disabled":""}>
        <span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span>
      </button>`).join("")}</div>`;
    if(!answeredAlready){ $$(".option", body).forEach(btn=> btn.addEventListener("click", ()=> submitAnswer(q, s, isExam, btn.getAttribute("data-letter")))); }
    else if(!isExam){ showFeedback(feedback, q, resp); }
  }
  else if(q.tipo==="verdadero_falso"){
    body.innerHTML = `<div class="tf-row">
      <button class="tf-btn ${answeredAlready?tfResultClass(true,q,resp):''}" data-val="true" ${answeredAlready?"disabled":""}>Verdadero</button>
      <button class="tf-btn ${answeredAlready?tfResultClass(false,q,resp):''}" data-val="false" ${answeredAlready?"disabled":""}>Falso</button>
    </div>`;
    if(!answeredAlready){ $$(".tf-btn", body).forEach(btn=> btn.addEventListener("click", ()=> submitAnswer(q, s, isExam, btn.getAttribute("data-val")==="true"))); }
    else if(!isExam){ showFeedback(feedback, q, resp); }
  }
  else if(q.tipo==="seleccion_multiple"){
    body.innerHTML = `<div class="options">${q.opciones.map(o=>{
      const sel = pendingMultiSelection.includes(o.letter);
      const cls = answeredAlready ? multiResultClass(o.letter,q,resp) : (sel?"selected":"");
      return `<button class="option ${cls}" data-letter="${o.letter}" ${answeredAlready?"disabled":""}><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></button>`;
    }).join("")}</div>
    ${!answeredAlready ? `<div style="margin-top:12px;"><span class="chip">Selecciona todas las que apliquen</span>
      <button class="btn btn-primary btn-sm" id="multi-check" style="margin-left:8px;">Comprobar</button></div>` : ''}`;
    if(!answeredAlready){
      $$(".option", body).forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const l = btn.getAttribute("data-letter");
          const i = pendingMultiSelection.indexOf(l);
          if(i>=0) pendingMultiSelection.splice(i,1); else pendingMultiSelection.push(l);
          btn.classList.toggle("selected");
        });
      });
      $("#multi-check", body).addEventListener("click", ()=>{
        if(pendingMultiSelection.length===0){ O.toast("Selecciona al menos una opción"); return; }
        submitAnswer(q, s, isExam, pendingMultiSelection.slice());
      });
    } else if(!isExam){ showFeedback(feedback, q, resp); }
  }
  else if(q.tipo==="emparejamiento"){
    renderMatchingBody(body, q, s, isExam, answeredAlready, resp);
    if(answeredAlready && !isExam) showFeedback(feedback, q, resp);
  }
  else if(q.tipo==="relleno"){
    renderBlankFillBody(body, q, s, isExam, answeredAlready, resp);
    if(answeredAlready && !isExam) showFeedback(feedback, q, resp);
  }
}

function optionResultClass(letter, q, resp){ if(letter===q.respuesta) return "correct"; if(resp && resp.answer===letter) return "incorrect"; return ""; }
function tfResultClass(val, q, resp){ if(val===q.respuesta) return "correct"; if(resp && resp.answer===val) return "incorrect"; return ""; }
function multiResultClass(letter, q, resp){
  const chosen = resp && Array.isArray(resp.answer) && resp.answer.includes(letter);
  if(q.respuesta.includes(letter)) return "correct"; if(chosen) return "incorrect"; return "";
}

function renderMatchingBody(body, q, s, isExam, answeredAlready, resp){
  const pairs = answeredAlready ? (resp.answer||{}) : pendingMatchSelection.pairs;
  const usedRight = new Set(Object.values(pairs));
  body.innerHTML = `<div class="match-wrap">
    <div class="match-col"><h4>Elementos</h4>${q.matching.left.map(l=>{
      let cls = "match-item";
      if(pairs[l.id]) cls += " paired";
      if(pendingMatchSelection.leftId===l.id) cls += " active";
      if(answeredAlready){ cls += (pairs[l.id]===q.matching.correct[l.id]) ? " correct" : " incorrect"; }
      return `<div class="${cls}" data-left="${l.id}"><span class="tagnum">${l.id}</span>${O.escapeHtml(l.label)}${pairs[l.id]?` → ${pairs[l.id]}`:''}</div>`;
    }).join("")}</div>
    <div class="match-col"><h4>Correspondencias</h4>${q.matching.right.map(r=>{
      let cls = "match-item"; if(usedRight.has(r.id) && !answeredAlready) cls += " used";
      return `<div class="${cls}" data-right="${r.id}"><span class="tagnum">${r.id}</span>${O.escapeHtml(r.label)}</div>`;
    }).join("")}</div>
  </div>
  ${!answeredAlready ? `<div style="margin-top:12px;">
    <span class="chip">Toca un elemento y luego su correspondencia</span>
    <button class="btn btn-primary btn-sm" id="match-check" style="margin-left:8px;" ${Object.keys(pairs).length<q.matching.left.length?"disabled":""}>Comprobar</button>
    <button class="btn btn-ghost btn-sm" id="match-reset">Reiniciar</button>
  </div>` : ''}`;
  if(answeredAlready) return;
  $$("[data-left]", body).forEach(el=> el.addEventListener("click", ()=>{ pendingMatchSelection.leftId = el.getAttribute("data-left"); renderMatchingBody(body, q, s, isExam, false, null); }));
  $$("[data-right]", body).forEach(el=> el.addEventListener("click", ()=>{
    const rid = el.getAttribute("data-right");
    if(!pendingMatchSelection.leftId){ O.toast("Primero selecciona un elemento de la izquierda"); return; }
    pendingMatchSelection.pairs[pendingMatchSelection.leftId] = rid; pendingMatchSelection.leftId = null;
    renderMatchingBody(body, q, s, isExam, false, null);
  }));
  const chk = $("#match-check", body);
  if(chk) chk.addEventListener("click", ()=> submitAnswer(q, s, isExam, Object.assign({}, pendingMatchSelection.pairs)));
  const rst = $("#match-reset", body);
  if(rst) rst.addEventListener("click", ()=>{ pendingMatchSelection = {leftId:null, pairs:{}}; renderMatchingBody(body, q, s, isExam, false, null); });
}

function renderBlankFillBody(body, q, s, isExam, answeredAlready, resp){
  const n = O.countBlanks(q.enunciado);
  const values = answeredAlready ? (resp.answer||[]) : pendingBlankValues;
  body.innerHTML = `<div class="blank-fill-wrap">${Array.from({length:n}).map((_,i)=>{
    let cls = "blank-input";
    if(answeredAlready){
      const accepted = q.respuesta[i];
      const variants = Array.isArray(accepted) ? accepted : [accepted];
      const ok = variants.some(v => String(v).trim().toLowerCase()===String(values[i]||"").trim().toLowerCase());
      cls += ok ? " correct" : " incorrect";
    }
    return `<label class="blank-field">
      <span class="tagnum">[${i+1}]</span>
      <input type="text" class="${cls}" data-blank="${i}" value="${O.escapeHtml(values[i]||"")}" ${answeredAlready?"disabled":""} autocomplete="off">
      ${answeredAlready && !Array.isArray(q.respuesta[i]) ? `<span class="blank-correct">${O.escapeHtml(q.respuesta[i])}</span>` : ''}
      ${answeredAlready && Array.isArray(q.respuesta[i]) ? `<span class="blank-correct">${O.escapeHtml(q.respuesta[i][0])}</span>` : ''}
    </label>`;
  }).join("")}</div>
  ${!answeredAlready ? `<div style="margin-top:12px;">
    <span class="chip">Rellena todos los huecos</span>
    <button class="btn btn-primary btn-sm" id="blank-check" style="margin-left:8px;">Comprobar</button>
  </div>` : ''}`;
  if(answeredAlready) return;
  $$("[data-blank]", body).forEach(input=>{
    input.addEventListener("input", ()=>{ pendingBlankValues[Number(input.getAttribute("data-blank"))] = input.value; });
  });
  $("#blank-check", body).addEventListener("click", ()=>{
    if(pendingBlankValues.some(v=>!v || !v.trim())){ O.toast("Rellena todos los huecos"); return; }
    submitAnswer(q, s, isExam, pendingBlankValues.slice());
  });
}

function showFeedback(el, q, resp){
  el.innerHTML = `<div class="feedback-box ${resp.correct?"ok":"bad"}">
    <strong>${resp.correct?"Correcto":"Incorrecto"}</strong>
    ${q.explicacion ? `<div class="expl">${O.escapeHtml(q.explicacion)}</div>` : ''}
    ${q.sourceIssue ? `<div class="issue-warn">Incidencia detectada en la fuente original</div>` : ''}
  </div>`;
}

function submitAnswer(q, s, isExam, answer){
  const correct = O.evaluateAnswer(q, answer);
  s.responses[s.current] = { answer, correct, submitted:true };
  if(!isExam){ O.recordAnswer(q, answer, correct); }
  O.saveSessionSnapshot();
  renderQuestionCard(q, s, isExam);
  if(isExam) renderNavGrid();
}

function finishPracticeSession(s){
  const summary = O.summarizeSession(s);
  O.PROGRESS.history.push(Object.assign({mode:"practice", finishedAt:Date.now(), config:s.config}, summary));
  s.finished = true;
  O.saveSessionSnapshot(); O.persist();
  O.toast("Sesión de práctica completada");
  go("home");
}

function renderNavGrid(){
  const s = O.getSession();
  const grid = document.getElementById("exam-navgrid");
  if(!grid) return;
  grid.innerHTML = s.questions.map((q,i)=>{
    let cls = "navcell";
    if(i===s.current) cls += " current";
    if(s.responses[i]) cls += " answered";
    if(O.isMarked(q.id) || s.markedThisSession[q.id]) cls += " marked";
    return `<button class="${cls}" data-idx="${i}">${i+1}</button>`;
  }).join("");
  $$(".navcell", grid).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      s.current = Number(btn.getAttribute("data-idx")); O.saveSessionSnapshot();
      renderQuestionCard(s.questions[s.current], s, true); renderNavGrid();
    });
  });
}

function setupTimer(s){
  const old = O.getActiveTimer(); if(old) old.stop();
  if(!s.timeLimitSec){ document.getElementById("timer-clock").textContent="Libre"; return; }
  const t = new O.Timer(s.remainingSec, (rem)=>{
    s.remainingSec = rem;
    const box = document.getElementById("timer-box"); const clock = document.getElementById("timer-clock");
    if(clock) clock.textContent = O.fmtTime(rem);
    if(box && rem<=60) box.classList.add("warn");
    if(rem % 15 === 0) O.saveSessionSnapshot();
  }, ()=>{ O.toast("Tiempo agotado — entregando automáticamente"); go("results"); });
  document.getElementById("timer-clock").textContent = O.fmtTime(s.remainingSec);
  t.start(); O.setActiveTimer(t);
}

function confirmSubmitExam(){
  const s = O.getSession();
  const unanswered = s.questions.length - Object.keys(s.responses).length;
  showModal(`
    <h3>¿Entregar test?</h3>
    <p>${unanswered>0 ? `Tienes <strong>${unanswered}</strong> pregunta(s) sin responder. ` : ''}No podrás modificar tus respuestas después.</p>
    <div class="actions">
      <button class="btn btn-ghost" id="cancel-submit">Cancelar</button>
      <button class="btn btn-solid" id="confirm-submit">Entregar</button>
    </div>
  `, (root)=>{
    root.querySelector("#cancel-submit").addEventListener("click", closeModal);
    root.querySelector("#confirm-submit").addEventListener("click", ()=>{ closeModal(); go("results"); });
  });
}

/* ---------------------------------------------------------------
   RESULTADOS
--------------------------------------------------------------- */
function renderResults(){
  const s = O.getSession();
  if(!s){ go("home"); return; }
  const timer = O.getActiveTimer(); if(timer) timer.stop();

  s.questions.forEach((q,i)=>{ const r=s.responses[i]; if(r) O.recordAnswer(q, r.answer, r.correct); });
  const summary = O.summarizeSession(s);

  const byTema = {}, byTipo = {};
  s.questions.forEach((q,i)=>{
    const r = s.responses[i];
    const bump = (map,key)=>{ map[key]=map[key]||{total:0,correct:0}; map[key].total++; if(r&&r.correct) map[key].correct++; };
    bump(byTema, q.tema||"General"); bump(byTipo, tipoLabel(q.tipo));
  });

  O.PROGRESS.history.push(Object.assign({mode:"exam", finishedAt:Date.now(), config:s.config}, summary));
  s.finished = true;

  if(s.challengeId){
    O.completeChallengeAttempt(s.challengeId, summary);
    O.saveSessionSnapshot(); O.persist();
    return renderChallengeCompletion(s.challengeId, summary, byTema, byTipo);
  }

  O.saveSessionSnapshot(); O.persist();

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="result-hero">
      <div class="score">${summary.accuracy}<small>%</small></div>
      <p>${summary.correct} correctas · ${summary.incorrect} incorrectas · ${summary.unanswered} sin responder${summary.completionTime!=null?` · ${O.fmtTime(summary.completionTime)}`:''}</p>
    </div>
    <div class="result-stats">
      <div class="stat-cell good"><div class="num">${summary.correct}</div><div class="label">Correctas</div></div>
      <div class="stat-cell bad"><div class="num">${summary.incorrect}</div><div class="label">Incorrectas</div></div>
      <div class="stat-cell"><div class="num">${summary.unanswered}</div><div class="label">Sin responder</div></div>
    </div>
    <div class="section-block">
      <div class="section-title"><h3>Rendimiento por tema</h3></div>
      ${renderBreakdownTable(byTema)}
    </div>
    <div class="section-block">
      <div class="section-title"><h3>Rendimiento por tipo</h3></div>
      ${renderBreakdownTable(byTipo)}
    </div>
    <div class="action-grid">
      <button class="action-card" id="res-review"><div class="t">Revisar respuestas</div><div class="d">Ver aciertos y fallos</div></button>
      <button class="action-card" id="res-share"><div class="ic">${icon('share')}</div><div class="t">Compartir test</div><div class="d">Que otra persona haga el mismo</div></button>
      <button class="action-card" id="res-challenge"><div class="ic">${icon('challenge')}</div><div class="t">Crear desafío</div><div class="d">Con tu resultado oculto</div></button>
      <button class="action-card" data-goto="home"><div class="t">Volver a estudiar</div><div class="d">Panel principal</div></button>
    </div>
  </div>`;

  $("#res-review").addEventListener("click", ()=> go("review-hub",{sessionResults:true}));
  $("#res-share").addEventListener("click", ()=> openShareTestModal(s));
  $("#res-challenge").addEventListener("click", ()=> openCreateChallengeModal(s, summary));
}

function renderChallengeCompletion(cid, summary, byTema, byTipo){
  const rec = O.PROGRESS.challenges[cid];
  const unlocked = rec.status === "UNLOCKED";
  let returnCodeBlock = "";
  if(rec.role==="recipient"){
    const returnCode = O.shareCodeForReturnResult(cid, summary);
    returnCodeBlock = `
      <div class="section-block">
        <div class="section-title"><h3>Enviar tu resultado de vuelta</h3></div>
        <p style="font-size:12.5px; color:var(--text-2); margin-bottom:var(--sp-3);">Comparte este código con quien te retó para que también pueda ver la comparación.</p>
        <div class="code-display" id="return-code-text">${returnCode}</div>
        <button class="btn btn-primary btn-sm" id="return-copy" style="margin-top:var(--sp-3);">Copiar código</button>
      </div>`;
  }

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="result-hero">
      <div class="score">${summary.accuracy}<small>%</small></div>
      <p>${unlocked ? "Resultado desbloqueado — la otra persona ya completó el reto." : "Reto completado."} ${summary.correct}/${summary.total}</p>
    </div>
    ${unlocked && rec.creatorResult ? renderComparisonBlock(rec.role==="creator"?rec.creatorResult:summary, rec.role==="creator"?rec.recipientResult:rec.creatorResult, cid) : ``}
    ${returnCodeBlock}
    <div class="section-block">
      <div class="section-title"><h3>Rendimiento por tema</h3></div>
      ${renderBreakdownTable(byTema)}
    </div>
    <div class="action-grid">
      <button class="action-card" id="res-review"><div class="t">Revisar respuestas</div><div class="d">Ver aciertos y fallos</div></button>
      <button class="action-card" data-goto="challenges"><div class="t">Mis desafíos</div><div class="d">Ver todos</div></button>
      <button class="action-card" data-goto="home"><div class="t">Volver a estudiar</div><div class="d">Panel principal</div></button>
    </div>
  </div>`;
  $("#res-review").addEventListener("click", ()=> go("review-hub",{sessionResults:true}));
  const copyBtn = $("#return-copy");
  if(copyBtn) copyBtn.addEventListener("click", ()=> copyToClipboard(O.shareCodeForReturnResult(cid, summary)));
}
function renderBreakdownTable(map){
  const rows = Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!rows.length) return `<p style="font-size:13px;color:var(--text-2);">Sin datos.</p>`;
  return `<table class="breakdown-table"><thead><tr><th>Nombre</th><th>Acierto</th><th></th></tr></thead><tbody>
    ${rows.map(([k,v])=>{ const pct = v.total? Math.round((v.correct/v.total)*100):0;
      return `<tr><td>${O.escapeHtml(k)}</td><td>${v.correct}/${v.total}</td><td><div class="bar"><i style="width:${pct}%"></i></div></td></tr>`;
    }).join("")}</tbody></table>`;
}

/* ---------------------------------------------------------------
   REPASAR — lista filtrable + detalle
--------------------------------------------------------------- */
let reviewList = [];
let reviewIndex = 0;

function renderReviewHub(params){
  const f = { estado:(params&&params.estado)||"all" };
  mainEl().innerHTML = `
  <div class="view">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="practica" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Práctica</button>
      <h1>Repasar preguntas</h1>
      <p>Filtra por estado, pestaña, grupo, tipo o fuente. Consulta la respuesta correcta y la explicación.</p>
    </div>
    <div class="filter-bar">
      <select id="rv-estado">
        <option value="all">Todas</option><option value="correct">Acertadas</option><option value="incorrect">Falladas</option>
        <option value="unanswered">Sin responder</option><option value="marcadas">Marcadas</option>
      </select>
      <select id="rv-source"><option value="all">Todas las páginas</option>${O.ALL_SOURCES.map(s=>`<option value="${s}">${s}</option>`).join("")}</select>
      <select id="rv-section"><option value="all">Todas las pestañas</option>${O.TAXONOMY_SECTIONS.map(s=>`<option value="${s.id}">${O.escapeHtml(s.name)}</option>`).join("")}</select>
      <select id="rv-topic"><option value="all">Todos los grupos</option></select>
      <select id="rv-tipo"><option value="all">Todos los tipos</option>${Object.entries(O.TYPE_LABELS).map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select>
      <select id="rv-categoria"><option value="all">Rutas y atajos: todo</option><option value="atajo">Solo atajos</option><option value="ruta">Solo rutas</option><option value="concepto">Solo conceptos</option></select>
      <input type="search" id="rv-search" placeholder="Buscar…">
      <span class="chip" id="rv-count">0 preguntas</span>
    </div>
    <div id="rv-body"></div>
  </div>`;
  $("#rv-estado").value = f.estado;
  function refreshTopicOptions(){
    const sec = O.TAXONOMY_SECTIONS.find(s=>s.id===$("#rv-section").value);
    const topics = (sec && sec.topics) || [];
    const topicSel = $("#rv-topic");
    const prev = topicSel.value;
    topicSel.innerHTML = `<option value="all">Todos los grupos</option>` + topics.map(t=>`<option value="${t.id}">${O.escapeHtml(t.name)}</option>`).join("");
    topicSel.value = topics.some(t=>t.id===prev) ? prev : "all";
  }
  ["#rv-estado","#rv-source","#rv-tipo","#rv-categoria","#rv-search"].forEach(sel=> $(sel).addEventListener("input", refresh));
  $("#rv-section").addEventListener("input", ()=>{ refreshTopicOptions(); refresh(); });
  $("#rv-topic").addEventListener("input", refresh);
  refreshTopicOptions();
  refresh();
  function refresh(){
    reviewList = O.filterQuestions({ estado:$("#rv-estado").value, source:$("#rv-source").value, section:$("#rv-section").value, topic:$("#rv-topic").value, tipo:$("#rv-tipo").value, categoria:$("#rv-categoria").value, search:$("#rv-search").value.trim() });
    $("#rv-count").textContent = reviewList.length + " preguntas";
    const bodyEl = $("#rv-body");
    if(!reviewList.length){ bodyEl.innerHTML = `<div class="empty-state"><div class="glyph">${icon('search')}</div><p>No hay preguntas que coincidan con estos filtros.</p></div>`; return; }
    bodyEl.innerHTML = `<div class="qlist">${reviewList.map((q,i)=>`
      <button class="qlist-item" data-idx="${i}">
        <span class="badge ${badgeClass(q.id)}">${badgeGlyph(q.id)}</span>
        <div style="flex:1;"><div class="qtext">${O.renderBlank(truncate(q.enunciado,150))}</div>
        <div class="qmeta">${q.sourceFile} · ${tipoLabel(q.tipo)}${q.negativa?" · negativa":""}</div></div>
        <span class="star ${O.isMarked(q.id)?"on":""}" data-star="${q.id}">★</span>
      </button>`).join("")}</div>`;
    $$("#rv-body .qlist-item").forEach(btn=> btn.addEventListener("click",(e)=>{ if(e.target.closest("[data-star]")) return; reviewIndex=Number(btn.getAttribute("data-idx")); openReviewDetail(); }));
    $$("#rv-body [data-star]").forEach(st=> st.addEventListener("click",(e)=>{ e.stopPropagation(); toggleMark(st.getAttribute("data-star")); st.classList.toggle("on"); }));
  }
}
function openReviewDetail(){
  const q = reviewList[reviewIndex];
  showModal(buildReviewDetailHtml(q), (root)=> wireReviewDetail(root), {wide:true});
}
function buildReviewDetailHtml(q){
  const a = O.PROGRESS.answers[q.id];
  return `<div class="qcard" style="padding:0;">
    <div class="qcard-top">
      <div class="qcard-meta">
        <span class="tag tag-type">${tipoLabel(q.tipo)}</span><span class="tag">${q.sourceFile}</span>
        ${q.categoria&&q.categoria!=="general"?`<span class="tag">${categoriaLabel(q.categoria)}</span>`:''}
        ${q.negativa?'<span class="tag tag-neg">Pregunta negativa</span>':''}
      </div>
      <button class="star ${O.isMarked(q.id)?"on":""}" id="rd-star" data-star="${q.id}">★</button>
    </div>
    <h3>${O.renderBlank(q.enunciado)}</h3>
    <div id="rd-body"></div>
    <div class="feedback-box ${a? (a.correcta?"ok":"bad") : "ok"}" style="margin-top:16px;">
      <strong>${a ? (a.correcta?"Respondiste correctamente":"Respondiste de forma incorrecta") : "Aún no has respondido esta pregunta"}</strong>
      ${q.explicacion ? `<div class="expl">${O.escapeHtml(q.explicacion)}</div>` : ''}
    </div>
    <div class="qnav-footer">
      <button class="btn btn-outline btn-sm" id="rd-prev">${icon('arrowL')}</button>
      <span class="pos">${reviewIndex+1} / ${reviewList.length}</span>
      <button class="btn btn-outline btn-sm" id="rd-next">${icon('chevronR')}</button>
    </div>
  </div>`;
}
function wireReviewDetail(root){
  const q = reviewList[reviewIndex];
  renderStaticAnswerBody(root.querySelector("#rd-body"), q);
  root.querySelector("#rd-star").addEventListener("click",(e)=>{ toggleMark(q.id); e.target.classList.toggle("on"); });
  root.querySelector("#rd-prev").addEventListener("click", ()=>{ reviewIndex=(reviewIndex-1+reviewList.length)%reviewList.length; closeModal(); openReviewDetail(); });
  root.querySelector("#rd-next").addEventListener("click", ()=>{ reviewIndex=(reviewIndex+1)%reviewList.length; closeModal(); openReviewDetail(); });
}
function renderStaticAnswerBody(el, q){
  const a = O.PROGRESS.answers[q.id];
  if(q.tipo==="opcion_unica"){
    el.innerHTML = `<div class="options">${q.opciones.map(o=>{ let cls="option locked"; if(o.letter===q.respuesta) cls+=" correct"; else if(a && a.seleccion===o.letter) cls+=" incorrect";
      return `<div class="${cls}"><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></div>`; }).join("")}</div>`;
  } else if(q.tipo==="verdadero_falso"){
    el.innerHTML = `<div class="tf-row">${[true,false].map(v=>{ let cls="tf-btn locked"; if(v===q.respuesta) cls+=" correct"; else if(a && a.seleccion===v) cls+=" incorrect";
      return `<div class="${cls}">${v?"Verdadero":"Falso"}</div>`; }).join("")}</div>`;
  } else if(q.tipo==="seleccion_multiple"){
    el.innerHTML = `<div class="options">${q.opciones.map(o=>{ let cls="option locked"; const wasSel = a && Array.isArray(a.seleccion) && a.seleccion.includes(o.letter);
      if(q.respuesta.includes(o.letter)) cls+=" correct"; else if(wasSel) cls+=" incorrect";
      return `<div class="${cls}"><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></div>`; }).join("")}</div>`;
  } else if(q.tipo==="emparejamiento"){
    const correct = q.matching.correct;
    el.innerHTML = `<div class="match-wrap"><div class="match-col"><h4>Elementos</h4>${q.matching.left.map(l=>`<div class="match-item correct">${O.escapeHtml(l.label)} → ${correct[l.id]}</div>`).join("")}</div>
      <div class="match-col"><h4>Correspondencias</h4>${q.matching.right.map(r=>`<div class="match-item">${r.id}) ${O.escapeHtml(r.label)}</div>`).join("")}</div></div>`;
  } else if(q.tipo==="relleno"){
    el.innerHTML = `<div class="blank-fill-wrap">${q.respuesta.map((accepted,i)=>{
      const text = Array.isArray(accepted) ? accepted[0] : accepted;
      return `<label class="blank-field"><span class="tagnum">[${i+1}]</span><input type="text" class="blank-input correct" value="${O.escapeHtml(text)}" disabled></label>`;
    }).join("")}</div>`;
  }
}

/* ---------------------------------------------------------------
   FLASHCARDS — hub filtrable + sesión de estudio (frente/dorso).
   Recurso independiente del banco de preguntas (ver app.js §10).
   Sesión de estudio deliberadamente no persistida entre recargas --
   es un estado de página, no una sesión de examen: base simple para
   ampliar más adelante (repetición espaciada, etc.), no todavía.
--------------------------------------------------------------- */
let fcList = [];
let fcSession = null; // { ids:[canonicalId...], index:0, revealed:false }

function priorityLabel(p){ return p==="alta" ? "★ Prioridad alta" : ""; }
function cardTypeLabel(t){ return t==="error" ? "Error frecuente" : "Contenido"; }

/* Formatea el texto de una flashcard: si contiene una enumeración
   ("1. .. 2. .."), saltos de línea, o una lista corta separada por " · ",
   la renderiza como lista (en 2 columnas si son muchos ítems cortos).
   En cualquier otro caso, un párrafo normal. */
function cardListMarkup(items, ordered){
  const cols = items.length >= 6 && items.every(i=>i.length <= 32);
  const tag = ordered ? "ol" : "ul";
  return `<${tag} class="card-list${cols?' cols':''}">${items.map(i=>`<li>${O.escapeHtml(i)}</li>`).join("")}</${tag}>`;
}
function formatCardText(raw){
  const t = String(raw==null?"":raw).trim();
  if(!t) return "";
  if(t.includes("\n")){
    const lines = t.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    if(lines.length >= 2){
      const num = lines.every(l=>/^\(?\d+[.)]/.test(l));
      return cardListMarkup(lines.map(l=> num ? l.replace(/^\(?\d+[.)]\s*/,"") : l), num);
    }
  }
  const numParts = t.split(/(?=(?:^|[\s(])\d+[.)]\s)/).map(s=>s.trim()).filter(Boolean);
  if(numParts.length >= 3 && numParts.every(p=>/^\(?\d+[.)]\s/.test(p))){
    return cardListMarkup(numParts.map(p=>p.replace(/^\(?\d+[.)]\s*/,"").replace(/[.;]\s*$/,"")), true);
  }
  if(t.includes(" · ")){
    const segs = t.split(" · ").map(s=>s.trim()).filter(Boolean);
    const listy = segs.length >= 4 && segs.every(s=>
      s.length <= 44 && !/[.:]\s/.test(s) && !/^(Atajo|OJO|Nota|aulaClic|Tu temario|Requiere|Ctrl|Alt)\b/i.test(s));
    if(listy) return cardListMarkup(segs, false);
  }
  return `<p>${O.escapeHtml(t)}</p>`;
}

function sectionName(id){ const s = O.TAXONOMY_SECTIONS.find(x=>x.id===id); return s ? s.name : id; }

let fcHubState = { section:"all", tab:"repaso" };

function renderFlashcardsHub(params){
  if(params && params.section) fcHubState.section = params.section;
  if(params && params.tab) fcHubState.tab = params.tab;
  const secList = O.TAXONOMY_SECTIONS.filter(s=> O.FLASHCARDS.some(c=>c.section===s.id));

  function drawHub(){
    const sec = fcHubState.section;
    const total = O.filterFlashcards({section:sec}).length;
    const pend = O.filterFlashcards({section:sec, estado:"pendiente"}).length;

    mainEl().innerHTML = `
    <div class="view view-narrow">
      <div class="view-head">
        <p class="eyebrow">Flashcards</p>
        <h1>Repaso rápido</h1>
        <p>Hechos, rutas y atajos en formato frente/dorso. Toca la tarjeta para girarla.</p>
      </div>
      <div class="chip-row" id="fc-chips">
        <button class="chip-btn ${sec==='all'?'on':''}" data-sec="all">Todas</button>
        ${secList.map(s=>`<button class="chip-btn ${sec===s.id?'on':''}" data-sec="${s.id}">${O.escapeHtml(s.name)}</button>`).join("")}
      </div>
      <div class="segmented segmented-wrap" style="margin:var(--sp-5) 0;">
        <button class="seg ${fcHubState.tab==='repaso'?'on':''}" data-tab="repaso">Repaso</button>
        <button class="seg ${fcHubState.tab==='todas'?'on':''}" data-tab="todas">Todas · ${total}</button>
      </div>
      <div id="fc-tab"></div>
    </div>`;

    $$("#fc-chips .chip-btn").forEach(b=> b.addEventListener("click", ()=>{ fcHubState.section=b.getAttribute("data-sec"); drawHub(); }));
    $$('.segmented .seg[data-tab]').forEach(b=> b.addEventListener("click", ()=>{ fcHubState.tab=b.getAttribute("data-tab"); drawHub(); }));

    if(fcHubState.tab==="todas") drawTodas(sec);
    else drawRepaso(sec, total, pend);
  }

  function drawRepaso(sec, total, pend){
    const el = $("#fc-tab");
    if(!total){ el.innerHTML = `<div class="empty-state"><div class="glyph">${icon('cards')}</div><p>No hay flashcards en esta selección.</p></div>`; return; }
    el.innerHTML = `
      <button class="fc-cta" id="fc-repasar">
        <div>
          <div class="fc-cta-t">${pend ? 'Repasar' : 'Repasar de nuevo'}</div>
          <div class="fc-cta-d">${pend ? pend+' pendiente'+(pend===1?'':'s') : 'las '+total+' ya están dominadas'}</div>
        </div>
        <span class="fc-cta-go">${icon('play')}</span>
      </button>
      ${(pend && pend<total) ? `<button class="btn btn-ghost btn-block btn-sm" id="fc-repasar-todas" style="margin-top:var(--sp-3);">Repasar las ${total} de nuevo</button>` : ``}
      <div class="section-block" style="margin-top:var(--sp-7);">
        <div class="section-title"><h3>Dominadas por pestaña</h3></div>
        <div class="progress-list">
          ${secList.map(s=>{
            const t = O.filterFlashcards({section:s.id}).length;
            const p = O.filterFlashcards({section:s.id, estado:'pendiente'}).length;
            const pc = t ? Math.round(((t-p)/t)*100) : 0;
            return `<button class="progress-row" data-secjump="${s.id}">
              <div class="pr-main"><div class="pr-name">${O.escapeHtml(s.name)}</div><div class="pr-meta">${t-p} / ${t} dominadas</div></div>
              <div class="pr-bar"><div class="bar-track good"><i style="width:${pc}%"></i></div></div>
              <div class="pr-pct">${pc}%</div><span class="pr-chev">${icon('chevronR')}</span>
            </button>`;
          }).join("")}
        </div>
      </div>`;
    $("#fc-repasar").addEventListener("click", ()=>{
      const ids = O.filterFlashcards({section:sec, estado: pend ? "pendiente" : "all"}).map(c=>c.canonicalId);
      if(ids.length) startFlashcardSession(ids, 0); else O.toast("No hay tarjetas para repasar");
    });
    const allBtn = $("#fc-repasar-todas");
    if(allBtn) allBtn.addEventListener("click", ()=> startFlashcardSession(O.filterFlashcards({section:sec}).map(c=>c.canonicalId), 0));
    $$("[data-secjump]").forEach(b=> b.addEventListener("click", ()=>{ fcHubState.section=b.getAttribute("data-secjump"); fcHubState.tab="repaso"; drawHub(); }));
  }

  function drawTodas(sec){
    const el = $("#fc-tab");
    el.innerHTML = `
      <div class="filter-bar">
        <select id="fc-prioridad"><option value="all">Cualquier prioridad</option><option value="alta">Solo prioridad alta</option></select>
        <select id="fc-estado"><option value="all">Todas</option><option value="pendiente">Pendientes</option><option value="dominada">Dominadas</option></select>
        <select id="fc-tipo"><option value="all">Todos los tipos</option><option value="contenido">Contenido</option><option value="error">Errores frecuentes</option></select>
        <input type="search" id="fc-search" placeholder="Buscar…">
        <span class="chip" id="fc-count"></span>
      </div>
      <div id="fc-body"></div>`;
    function currentFilters(){
      return { section:sec, cardType:$("#fc-tipo").value, priority:$("#fc-prioridad").value,
        estado:$("#fc-estado").value, search:$("#fc-search").value.trim() };
    }
    function refresh(){
      fcList = O.filterFlashcards(currentFilters());
      $("#fc-count").textContent = fcList.length + " tarjeta" + (fcList.length===1?"":"s");
      const bodyEl = $("#fc-body");
      if(!fcList.length){ bodyEl.innerHTML = `<div class="empty-state"><div class="glyph">${icon('cards')}</div><p>Sin resultados.</p></div>`; return; }
      bodyEl.innerHTML = `<div class="qlist">${fcList.map((c,i)=>`
        <button class="qlist-item" data-idx="${i}">
          <span class="badge ${O.getFlashcardState(c.canonicalId)==='dominada'?'badge-correct':'badge-unanswered'}">${O.getFlashcardState(c.canonicalId)==='dominada'?'✓':'–'}</span>
          <div style="flex:1;"><div class="qtext">${O.escapeHtml(truncate(c.front,150))}</div>
          <div class="qmeta">${O.escapeHtml(c.topic||c.section)}${c.subtopic?" · "+O.escapeHtml(c.subtopic):""} · ${cardTypeLabel(c.cardType)}${c.priority==="alta"?" · ★":""}</div></div>
        </button>`).join("")}</div>`;
      $$(".qlist-item", bodyEl).forEach(btn=> btn.addEventListener("click", ()=> startFlashcardSession(fcList.map(c=>c.canonicalId), Number(btn.getAttribute("data-idx")))));
    }
    ["#fc-prioridad","#fc-estado","#fc-tipo","#fc-search"].forEach(s=> $(s).addEventListener("input", refresh));
    refresh();
  }

  drawHub();
}

function startFlashcardSession(ids, startIndex){
  fcSession = { ids, index: startIndex||0, revealed:false };
  go("flashcards-study");
}

function renderFlashcardsStudy(){
  if(!fcSession || !fcSession.ids.length){ go("flashcards"); return; }
  if(fcSession.index >= fcSession.ids.length) fcSession.index = fcSession.ids.length-1;
  const c = O.F_BY_ID[fcSession.ids[fcSession.index]];
  if(!c){ go("flashcards"); return; }
  if(!fcSession.revealed) O.markFlashcardSeen(c.canonicalId);
  const dominada = O.getFlashcardState(c.canonicalId)==="dominada";
  const total = fcSession.ids.length, idx = fcSession.index, last = idx===total-1;
  const revealed = fcSession.revealed;

  function advance(){
    if(last){ fcSession=null; O.toast("Repaso terminado"); go("flashcards"); return; }
    fcSession.index++; fcSession.revealed=false; renderFlashcardsStudy();
  }

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="session-shell fc-study" style="max-width:600px;">
      <div class="session-topbar">
        <button class="exit" id="fc-exit">${icon('arrowL')} Salir</button>
        <span class="counter">${O.escapeHtml(sectionName(c.section))} · ${idx+1} / ${total}</span>
      </div>
      <div class="session-progress"><i style="width:${Math.round(((idx+1)/total)*100)}%"></i></div>

      <button class="flip-card ${revealed?'flipped':''}" id="fc-card" aria-label="${revealed?'Ocultar respuesta':'Mostrar respuesta'}">
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <div class="ff-tags">
              <span class="tag tag-type">${cardTypeLabel(c.cardType)}</span>
              ${c.priority==="alta" ? `<span class="tag">★ Prioridad alta</span>` : ''}
              ${dominada ? `<span class="tag" style="color:var(--good);border-color:var(--good-line);">Dominada</span>` : ''}
            </div>
            <div class="ff-text">${formatCardText(c.front)}</div>
            <div class="ff-hint">Mostrar respuesta</div>
          </div>
          <div class="flip-face flip-back" id="fc-back">
            <div class="fb-label">Respuesta</div>
            <div class="fb-text">${formatCardText(c.back)}</div>
          </div>
        </div>
      </button>

      <div class="fc-verdict ${revealed?'':'is-hidden'}">
        <button class="btn btn-outline btn-lg btn-block" id="fc-forgot">No la recordaba</button>
        <button class="btn btn-solid btn-lg btn-block" id="fc-knew">La recordaba</button>
      </div>

      <div class="qnav-footer">
        <button class="btn btn-ghost btn-sm" id="fc-prev" ${idx===0?"disabled":""}>${icon('arrowL')} Anterior</button>
        <span class="pos">${idx+1} / ${total}</span>
        <button class="btn btn-ghost btn-sm" id="fc-next">${last?"Terminar":"Saltar"} ${icon('chevronR')}</button>
      </div>
    </div>
  </div>`;

  $("#fc-exit").addEventListener("click", ()=>{ fcSession=null; go("flashcards"); });
  $("#fc-card").addEventListener("click", ()=>{ fcSession.revealed = !fcSession.revealed; renderFlashcardsStudy(); });
  $("#fc-knew").addEventListener("click", ()=>{ O.setFlashcardMastered(c.canonicalId, true); advance(); });
  $("#fc-forgot").addEventListener("click", ()=>{ O.setFlashcardMastered(c.canonicalId, false); advance(); });
  $("#fc-prev").addEventListener("click", ()=>{ fcSession.index = Math.max(0, idx-1); fcSession.revealed=false; renderFlashcardsStudy(); });
  $("#fc-next").addEventListener("click", advance);
}

/* ---------------------------------------------------------------
   TEMARIO — detalle de una sección de la taxonomía (Preguntas /
   Flashcards / Errores). La mayoría de secciones no tienen todavía
   preguntas clasificadas (ver CLAUDE.md, Etapa 8): se muestra un
   estado vacío honesto en vez de fallar o inventar contenido.
--------------------------------------------------------------- */
function renderTemarioDetalle(params){
  const sectionId = params && params.sectionId;
  const sec = O.TAXONOMY_SECTIONS.find(s=>s.id===sectionId);
  if(!sec){ go("temario"); return; }
  const qCount = O.filterQuestions({section:sectionId}).length;
  const fCount = O.filterFlashcards({section:sectionId}).length;
  const errCount = O.filterFlashcards({section:sectionId, cardType:"error"}).length;
  const p = sectionProgress(sectionId);
  const topics = (sec.topics || []).map(t=>({ ...t, n: O.filterQuestions({section:sectionId, topic:t.id}).length }));

  const practiceSection = ()=>{
    const s2 = O.buildSession({mode:"practice", section:sectionId, count:"todas", qOrder:"aleatorio", source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true});
    if(s2){ O.setSession(s2); O.saveSessionSnapshot(); go("running"); } else O.toast("No hay preguntas disponibles");
  };
  const practiceTopic = (topicId)=>{
    const s2 = O.buildSession({mode:"practice", section:sectionId, topic:topicId, count:"todas", qOrder:"aleatorio", source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true});
    if(s2){ O.setSession(s2); O.saveSessionSnapshot(); go("running"); } else O.toast("No hay preguntas en este grupo");
  };

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <nav class="breadcrumb"><button data-goto="temario">Temario</button><span>/</span><b>${O.escapeHtml(sec.name)}</b></nav>
    <div class="view-head">
      <h1>${O.escapeHtml(sec.name)}</h1>
      <p>${qCount} pregunta${qCount===1?'':'s'} · ${fCount} flashcard${fCount===1?'':'s'}${p.total?` · ${p.pct}% vistas`:''}</p>
      ${p.total ? `<div class="bar-track" style="margin-top:var(--sp-3);max-width:280px;"><i style="width:${p.pct}%"></i></div>` : ``}
    </div>

    ${qCount ? `
    <button class="btn btn-solid btn-lg btn-block" id="td-preguntas" style="margin-bottom:var(--sp-6);">
      ${icon('play')} Practicar esta pestaña · ${qCount}
    </button>

    ${topics.length ? `
    <div class="section-block">
      <div class="section-title"><h3>Grupos</h3></div>
      <div class="nav-list">
        ${topics.map(t=>`<button class="nav-row" data-topic="${t.id}" ${t.n?'':'disabled'}>
          <span class="nr-title">${O.escapeHtml(t.name)}</span>
          <span class="nr-meta">${t.n}</span>
          <span class="nr-chev">${icon('chevronR')}</span>
        </button>`).join("")}
      </div>
    </div>` : ``}
    ` : `
    <span id="td-preguntas" hidden>${qCount} preguntas</span>
    <div class="empty-state">
      <div class="glyph">${icon('layers')}</div>
      <p>Todavía no hay preguntas de "${O.escapeHtml(sec.name)}" en el banco.</p>
    </div>`}

    <div class="section-block">
      <div class="section-title"><h3>Repaso</h3></div>
      <div class="nav-list">
        <button class="nav-row" id="td-flashcards" ${fCount?'':'disabled'}>
          <span class="nr-ic">${icon('cards')}</span>
          <span class="nr-title">Flashcards</span>
          <span class="nr-meta">${fCount}</span>
          <span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" id="td-errores" ${errCount?'':'disabled'}>
          <span class="nr-ic">${icon('errors')}</span>
          <span class="nr-title">Errores frecuentes</span>
          <span class="nr-meta">${errCount}</span>
          <span class="nr-chev">${icon('chevronR')}</span>
        </button>
      </div>
    </div>
  </div>`;

  const tdP = $("#td-preguntas");
  if(tdP && tdP.tagName === "BUTTON") tdP.addEventListener("click", practiceSection);
  $$(".nav-row[data-topic]").forEach(btn=> btn.addEventListener("click", ()=> practiceTopic(btn.getAttribute("data-topic"))));
  $("#td-flashcards").addEventListener("click", ()=>{ if(fCount) go("flashcards", {section:sectionId}); });
  $("#td-errores").addEventListener("click", ()=>{
    const errs = O.filterFlashcards({section:sectionId, cardType:"error"});
    if(errs.length) startFlashcardSession(errs.map(c=>c.canonicalId), 0); else O.toast("No hay fichas de error en esta sección");
  });
}

/* ---------------------------------------------------------------
   PROGRESO
--------------------------------------------------------------- */
function renderProgress(){
  const s = O.computeStats();
  const challenges = Object.values(O.PROGRESS.challenges||{});
  const hist = O.PROGRESS.history.slice().reverse();
  mainEl().innerHTML = `
  <div class="view">
    <div class="view-head"><p class="eyebrow">Progreso</p><h1>Tu rendimiento</h1><p>Sigue tu avance y detecta tus puntos débiles antes del examen.</p></div>

    <div class="section-block">
      <div class="section-title"><h3>Rendimiento general</h3></div>
      <div class="stat-strip">
        <div class="ss-cell"><div class="ss-num">${s.answered}</div><div class="ss-lbl">de ${s.total} respondidas</div></div>
        <div class="ss-cell"><div class="ss-num" style="color:var(--good);">${s.correct}</div><div class="ss-lbl">acertadas</div></div>
        <div class="ss-cell"><div class="ss-num" style="color:var(--bad);">${s.incorrect}</div><div class="ss-lbl">falladas</div></div>
        <div class="ss-cell"><div class="ss-num" style="color:var(--accent-ink);">${s.markedCount}</div><div class="ss-lbl">marcadas</div></div>
      </div>
      <div style="display:flex; align-items:center; gap:14px; margin-top:var(--sp-4);">
        <div class="bar-track" style="flex:1;"><i style="width:${s.accuracy}%"></i></div>
        <strong style="font-family:var(--font-mono); font-size:14px;">${s.accuracy}% acierto</strong>
      </div>
    </div>

    <div class="section-block">
      <div class="section-title"><h3>Repasar</h3></div>
      <div class="nav-list">
        <button class="nav-row" id="pg-errores" ${s.incorrect?'':'disabled'}>
          <span class="nr-ic">${icon('errors')}</span><span class="nr-title">Preguntas falladas</span>
          <span class="nr-meta">${s.incorrect}</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" id="pg-marcadas" ${s.markedCount?'':'disabled'}>
          <span class="nr-ic">${icon('bookmark')}</span><span class="nr-title">Preguntas marcadas</span>
          <span class="nr-meta">${s.markedCount}</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
      </div>
    </div>

    <div class="section-block">
      <div class="section-title"><h3>Rendimiento por grupo</h3><span class="section-hint">los más flojos primero</span></div>
      ${renderRankList(s.byTema)}
    </div>

    <div class="section-block">
      <div class="section-title"><h3>Cobertura por pestaña</h3></div>
      <div class="progress-list">${O.TAXONOMY_SECTIONS.filter(sec=>{
        return O.QUESTIONS.some(q=>q.section===sec.id);
      }).map(sec=>{
        const p = sectionProgress(sec.id);
        return `<button class="progress-row" data-goto="temario-detalle" data-params='{"sectionId":"${sec.id}"}'>
          <div class="pr-main"><div class="pr-name">${O.escapeHtml(sec.name)}</div><div class="pr-meta">${p.answered} / ${p.total} vistas</div></div>
          <div class="pr-bar"><div class="bar-track"><i style="width:${p.pct}%"></i></div></div>
          <div class="pr-pct">${p.pct}%</div><span class="pr-chev">${icon('chevronR')}</span>
        </button>`;
      }).join("")}</div>
    </div>

    <div class="section-block">
      <div class="section-title"><h3>Retos y actividad</h3></div>
      <div class="nav-list">
        <button class="nav-row" data-goto="test-wizard" data-params='{"mode":"exam"}'>
          <span class="nr-ic">${icon('tests')}</span><span class="nr-title">Crear examen</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" data-goto="mp-setup">
          <span class="nr-ic">${icon('challenge')}</span><span class="nr-title">Duelo en vivo</span>
          <span class="nr-meta">tiempo real</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" data-goto="challenges">
          <span class="nr-ic">${icon('challenge')}</span><span class="nr-title">Desafíos asíncronos</span>
          <span class="nr-meta">${challenges.length}</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" data-goto="history">
          <span class="nr-ic">${icon('history')}</span><span class="nr-title">Historial de sesiones</span>
          <span class="nr-meta">${O.PROGRESS.history.length}</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
        <button class="nav-row" id="pg-codigo">
          <span class="nr-ic">${icon('code')}</span><span class="nr-title">Introducir código</span>
          <span class="nr-meta">pregunta · test · reto</span><span class="nr-chev">${icon('chevronR')}</span>
        </button>
      </div>
      ${hist.length ? `<ul class="mini-list" style="margin-top:var(--sp-3);">${hist.slice(0,4).map(h=>`
        <li><span class="mini-row-main">${h.mode==="exam"?"Examen":"Práctica"} · ${h.correct}/${h.total} (${h.accuracy}%)</span><span class="mini-row-sub">${O.fmtDate(h.finishedAt)}</span></li>
      `).join("")}</ul>` : ``}
    </div>
  </div>`;

  const errBtn = $("#pg-errores");
  if(errBtn) errBtn.addEventListener("click", ()=>{
    const s2 = O.buildSession({mode:"practice", scope:"errores", count:"todas", qOrder:"aleatorio", source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true});
    if(s2){ O.setSession(s2); O.saveSessionSnapshot(); go("running"); } else O.toast("No tienes preguntas falladas pendientes");
  });
  const mkBtn = $("#pg-marcadas");
  if(mkBtn) mkBtn.addEventListener("click", ()=>{
    const s2 = O.buildSession({mode:"practice", scope:"marcadas", count:"todas", qOrder:"aleatorio", source:"all", tema:"all", tipo:"all", categoria:"all", shuffleOptions:true});
    if(s2){ O.setSession(s2); O.saveSessionSnapshot(); go("running"); } else O.toast("Aún no has marcado ninguna pregunta");
  });
  $("#pg-codigo").addEventListener("click", openCodeImportModal);
}
function renderRankList(byTema){
  const rows = Object.entries(byTema).filter(([,v])=>v.answered>=2)
    .map(([k,v])=>({tema:k, pct:Math.round((v.correct/v.answered)*100), answered:v.answered}))
    .sort((a,b)=>a.pct-b.pct);
  if(!rows.length) return `<p style="font-size:13px;color:var(--text-2);">Responde al menos 2 preguntas de un grupo para ver tu rendimiento aquí.</p>`;
  const shown = rows.slice(0,10);
  const strong = rows.filter(r=>r.pct>=80).length;
  const tone = p => p<60 ? "bad" : p<80 ? "warn" : "good";
  return `<ul class="rank-list">${shown.map(r=>`<li>
      <span class="name">${O.escapeHtml(r.tema)}</span>
      <span class="rk-bar"><i class="${tone(r.pct)}" style="width:${r.pct}%"></i></span>
      <span class="pct ${tone(r.pct)}">${r.pct}%</span>
    </li>`).join("")}</ul>
    ${rows.length>10 || strong ? `<p class="rank-foot">${rows.length>10?`+${rows.length-10} grupos más · `:''}${strong} grupo${strong===1?'':'s'} por encima del 80%.</p>` : ``}`;
}

/* ---------------------------------------------------------------
   COMPARTIR — modales de código
--------------------------------------------------------------- */
function openShareTestModal(s){
  const code = O.shareCodeForSession(s);
  showModal(`
    <h3>Compartir test</h3>
    <p>Quien reciba este código hará exactamente el mismo test: mismas preguntas, mismo orden.</p>
    <div class="code-display" id="share-code-text">${code}</div>
    <div class="actions" style="margin-top:var(--sp-5); justify-content:flex-start; flex-wrap:wrap;">
      <button class="btn btn-primary btn-sm" id="share-copy">Copiar código</button>
      <button class="btn btn-outline btn-sm" id="share-native" style="display:none;">Compartir…</button>
    </div>
  `, (root)=>{
    root.querySelector("#share-copy").addEventListener("click", ()=> copyToClipboard(code));
    if(navigator.share){
      const nativeBtn = root.querySelector("#share-native");
      nativeBtn.style.display = "";
      nativeBtn.addEventListener("click", ()=>{ navigator.share({title:"OPE365", text:"Haz este test de Word 365 conmigo:", text2:code}).catch(()=>{}); });
    }
  }, {wide:false});
}

function openCreateChallengeModal(session_, summary){
  showModal(`
    <h3>Crear desafío</h3>
    <p>Elige si quiere que la otra persona empiece desde cero o si quieres ocultar tu resultado hasta que termine.</p>
    <div class="choice-grid">
      <button class="choice-card" id="ch-zero"><div class="t">Desde cero</div><div class="d">Ambos empezáis igual, sin resultado previo</div></button>
      <button class="choice-card" id="ch-sealed"><div class="t">Resultado oculto</div><div class="d">Tu resultado se revela cuando la otra persona termine</div></button>
    </div>
    <div class="security-note">Esto no es un sistema de seguridad: el código contiene todo lo necesario para reconstruir el resultado, así que alguien con conocimientos técnicos podría verlo antes de tiempo. Funciona por confianza mutua, como un sobre cerrado entre dos personas que ya se conocen.</div>
  `, (root)=>{
    root.querySelector("#ch-zero").addEventListener("click", ()=>{
      const { code } = O.createChallenge(session_, null);
      closeModal(); showChallengeCodeModal(code, false);
    });
    root.querySelector("#ch-sealed").addEventListener("click", ()=>{
      const { code } = O.createChallenge(session_, summary);
      closeModal(); showChallengeCodeModal(code, true);
    });
  }, {wide:true});
}

function showChallengeCodeModal(code, sealed){
  showModal(`
    <h3>Reto creado ✓</h3>
    <p>${sealed ? "Comparte este código. Tu resultado quedará oculto hasta que la otra persona termine el mismo test." : "Comparte este código. Ambos haréis exactamente el mismo test desde cero."}</p>
    <div class="code-display">${code}</div>
    <div class="actions" style="margin-top:var(--sp-5); justify-content:flex-start;">
      <button class="btn btn-primary btn-sm" id="cc-copy">Copiar código</button>
      <button class="btn btn-ghost btn-sm" id="cc-close">Cerrar</button>
    </div>
  `, (root)=>{
    root.querySelector("#cc-copy").addEventListener("click", ()=> copyToClipboard(code));
    root.querySelector("#cc-close").addEventListener("click", ()=>{ closeModal(); go("challenges"); });
  });
}

function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=> O.toast("Código copiado")).catch(()=> O.toast("No se pudo copiar — selecciona el código manualmente"));
  } else {
    O.toast("Selecciona el código manualmente para copiarlo");
  }
}

function openCodeImportModal(){
  showModal(`
    <h3>Introducir código</h3>
    <p>Pega el código que te han compartido: una pregunta, una selección, un test o un reto.</p>
    <input type="text" class="code-input" id="code-import-input" placeholder="T-XXXXXX-XXXXXX">
    <div class="actions" style="margin-top:var(--sp-5);">
      <button class="btn btn-ghost" id="code-cancel">Cancelar</button>
      <button class="btn btn-solid" id="code-continue">Continuar</button>
    </div>
    <p id="code-error" style="color:var(--bad); font-size:12.5px; margin-top:10px;"></p>
  `, (root)=>{
    root.querySelector("#code-cancel").addEventListener("click", closeModal);
    const go2 = ()=> handleCodeImport(root.querySelector("#code-import-input").value, root.querySelector("#code-error"));
    root.querySelector("#code-continue").addEventListener("click", go2);
    root.querySelector("#code-import-input").addEventListener("keydown",(e)=>{ if(e.key==="Enter") go2(); });
  });
}

function handleCodeImport(raw, errEl){
  const parsed = O.parseShareCode(raw);
  if(!parsed){ errEl.textContent = "Código no válido"; return; }
  if(parsed.payload.bv !== O.MIGRATION_REPORT.bankVersion){ errEl.textContent = "Este código no es compatible con esta versión del banco"; return; }

  if(parsed.type==="Q"){
    const q = O.Q_BY_ID[parsed.payload.qid];
    if(!q){ errEl.textContent = "La pregunta ya no está disponible"; return; }
    closeModal();
    reviewList = [q]; reviewIndex = 0; openReviewDetail();
    return;
  }
  if(parsed.type==="S"){
    const ids = (parsed.payload.ids||[]).filter(id=>O.Q_BY_ID[id]);
    if(!ids.length){ errEl.textContent = "Ninguna de estas preguntas está disponible"; return; }
    closeModal();
    reviewList = ids.map(id=>O.Q_BY_ID[id]); reviewIndex = 0; openReviewDetail();
    return;
  }
  if(parsed.type==="T" && !parsed.payload.challengeId){
    const recon = O.sessionFromTestPayload(parsed.payload);
    if(recon.error){ errEl.textContent = "No se ha podido cargar el test"; return; }
    closeModal();
    O.setSession(recon.session); O.saveSessionSnapshot(); go("running");
    return;
  }
  if(parsed.type==="R" && parsed.payload.returnResult){
    const res = O.importReturnedResult(parsed.payload);
    if(res.error){ errEl.textContent = "No se ha podido asociar este resultado a un reto tuyo"; return; }
    closeModal();
    go("challenge-detail", {challengeId: res.challengeId});
    return;
  }
  if(parsed.type==="T" || parsed.type==="R"){
    const imported = O.importChallengeCode(raw);
    if(imported.error==="ya_importado"){ errEl.textContent = "Ya has importado este reto antes"; return; }
    if(imported.error){ errEl.textContent = "No se ha podido cargar el reto"; return; }
    closeModal();
    go("challenge-detail", {challengeId: imported.challengeId});
    return;
  }
  errEl.textContent = "Código no válido";
}

/* ---------------------------------------------------------------
   DESAFÍOS
--------------------------------------------------------------- */
function renderChallengesList(){
  const list = Object.values(O.PROGRESS.challenges||{}).sort((a,b)=>b.createdAt-a.createdAt);
  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="progress" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Progreso</button>
      <h1>Mis desafíos</h1>
      <p>Compite con otra persona: mismo test, resultado comparado.</p>
    </div>
    <button class="btn btn-outline btn-block" id="ch-import" style="margin-bottom:var(--sp-6);">${icon('code')} Introducir código de reto</button>
    ${list.length ? `<div style="display:flex; flex-direction:column; gap:8px;">${list.map(c=>renderChallengeCardHtml(c)).join("")}</div>` :
      `<div class="empty-panel"><div class="glyph">${icon('challenge')}</div><h4>Todavía no tienes desafíos</h4><p>Comparte un test con otra persona y podréis comparar resultados.</p><button class="btn btn-outline btn-sm" data-goto="test-wizard" data-params='{"mode":"exam"}'>Crear test</button></div>`}
  </div>`;
  $("#ch-import").addEventListener("click", openCodeImportModal);
  $$("[data-challenge-open]").forEach(el=> el.addEventListener("click", ()=> go("challenge-detail",{challengeId:el.getAttribute("data-challenge-open")})));
}

function renderChallengeDetail(params){
  const cid = params.challengeId;
  const rec = O.PROGRESS.challenges[cid];
  if(!rec){ go("challenges"); return; }

  const isSealedPending = rec.status==="WAITING" && rec.role==="recipient" && rec.sealedResult && !rec.myResult;
  const isCreatorWaiting = rec.role==="creator" && rec.status==="WAITING";
  const isZeroPending = rec.status==="CREATED";
  const isDone = rec.status==="COMPLETED" || rec.status==="UNLOCKED";

  let body = "";
  if(isZeroPending || (rec.role==="recipient" && rec.status==="CREATED")){
    body = `<div class="sealed-panel">
      <div class="lock">${icon('challenge')}</div>
      <h4>Ambos haréis el mismo test desde cero</h4>
      <p>Cuando lo completes podréis comparar resultados.</p>
      <button class="btn btn-solid" id="ch-start">Comenzar ${icon('chevronR')}</button>
    </div>`;
  } else if(isSealedPending){
    body = `<div class="sealed-panel">
      <div class="lock">${icon('lock')}</div>
      <h4>Resultado oculto</h4>
      <p>Completa el reto para descubrir cómo lo hizo la otra persona.</p>
      <button class="btn btn-solid" id="ch-start">Comenzar ${icon('chevronR')}</button>
    </div>
    <div class="security-note">El resultado de la otra persona permanece oculto en tu dispositivo hasta que termines — no se muestra en ningún momento antes de eso.</div>`;
  } else if(isCreatorWaiting){
    body = `<div class="sealed-panel">
      <div class="lock">${icon('clock')}</div>
      <h4>Esperando a la otra persona</h4>
      <p>Tu resultado quedará oculto hasta que complete el mismo test.</p>
    </div>`;
  } else if(isDone){
    if(rec.role==="creator" && !rec.creatorResult){
      body = `<div class="sealed-panel"><div class="lock">${icon('unlock')}</div><h4>Test completado</h4><p>Aún no hay una comparación disponible.</p></div>`;
    } else {
      const mine = rec.role==="creator" ? rec.creatorResult : rec.myResult;
      const theirs = rec.role==="creator" ? rec.recipientResult : rec.creatorResult;
      if(theirs){
        body = renderComparisonBlock(mine, theirs, cid);
      } else {
        body = `<div class="sealed-panel"><div class="lock">${icon('unlock')}</div><h4>Resultado desbloqueado</h4><p>Tu resultado: <strong>${mine.correct}/${mine.total}</strong> (${mine.accuracy}%)</p></div>`;
      }
    }
  }

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="challenges" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Desafíos</button>
      <h1>${rec.role==="creator"?"Reto que creaste":"Reto recibido"}</h1>
      <p>${(rec.ids&&rec.ids.length)||rec.cfg.count||"—"} preguntas · creado ${O.fmtDate(rec.createdAt)}</p>
    </div>
    ${body}
  </div>`;

  const startBtn = $("#ch-start");
  if(startBtn){
    startBtn.addEventListener("click", ()=>{
      const recon = O.sessionForChallenge(cid);
      if(recon.error){ O.toast("No se ha podido cargar el reto"); return; }
      recon.session.mode = "exam";
      recon.session.challengeId = cid;
      if(!recon.session.timeLimitSec && rec.cfg.minutes){ recon.session.timeLimitSec = Number(rec.cfg.minutes)*60; recon.session.remainingSec = recon.session.timeLimitSec; }
      O.setSession(recon.session); O.saveSessionSnapshot();
      go("running");
    });
  }
}

function renderComparisonBlock(mine, theirs, cid){
  const diff = mine.accuracy - theirs.accuracy;
  return `
    <div class="result-hero">
      <div class="score">${mine.accuracy}<small>%</small></div>
      <p>Tu resultado · ${mine.correct}/${mine.total}</p>
    </div>
    <table class="compare-table">
      <thead><tr><th></th><th>Tú</th><th>Otra persona</th></tr></thead>
      <tbody>
        <tr><td>Aciertos</td><td>${mine.correct}</td><td>${theirs.correct}</td></tr>
        <tr><td>Errores</td><td>${mine.incorrect}</td><td>${theirs.incorrect}</td></tr>
        <tr><td>Nota</td><td>${mine.accuracy}%</td><td>${theirs.accuracy}%</td></tr>
        <tr><td>Diferencia</td><td colspan="2" class="compare-diff ${diff>0?'pos':diff<0?'neg':''}">${diff>0?'+':''}${diff}%</td></tr>
      </tbody>
    </table>
    <div style="margin-top:var(--sp-5);">
      <button class="btn btn-outline btn-block" data-goto="comparison" data-params='{"challengeId":"${cid}"}'>Ver preguntas diferentes</button>
    </div>
  `;
}

function renderComparison(params){
  const cid = params.challengeId;
  const rec = O.PROGRESS.challenges[cid];
  if(!rec){ go("challenges"); return; }
  const mine = rec.role==="creator" ? rec.creatorResult : rec.myResult;
  const theirs = rec.role==="creator" ? rec.recipientResult : rec.creatorResult;
  if(!mine || !theirs){ go("challenge-detail",{challengeId:cid}); return; }
  const cmp = O.compareResults(rec.role==="creator"?mine:mine, rec.role==="creator"?theirs:theirs);

  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="challenge-detail" data-params='{"challengeId":"${cid}"}' style="margin-bottom:var(--sp-4);">${icon('arrowL')} Comparación</button>
      <h1>Preguntas diferentes</h1>
      <p>${cmp.diffs.length} de ${cmp.totalCompared} preguntas con respuestas distintas · ${cmp.bothCorrect} acertadas por ambos · ${cmp.bothWrong} falladas por ambos</p>
    </div>
    ${cmp.diffs.length ? `<div class="qlist">${cmp.diffs.map(d=>{
      const q = O.Q_BY_ID[d.qid];
      if(!q) return "";
      return `<button class="qlist-item" data-diff-qid="${d.qid}">
        <div style="flex:1;">
          <div class="qtext">${O.renderBlank(truncate(q.enunciado,150))}</div>
          <div class="qmeta">Tú: ${fmtDiffAnswer(d.a.answer)} ${d.a.correct?'✓':'✕'} · Otra persona: ${fmtDiffAnswer(d.b.answer)} ${d.b.correct?'✓':'✕'}</div>
        </div>
      </button>`;
    }).join("")}</div>` : `<div class="empty-panel"><div class="glyph">${icon('progress')}</div><h4>Sin discrepancias</h4><p>Ambos respondisteis exactamente igual en todas las preguntas comparadas.</p></div>`}
  </div>`;

  $$("[data-diff-qid]").forEach(el=> el.addEventListener("click", ()=>{
    const q = O.Q_BY_ID[el.getAttribute("data-diff-qid")];
    reviewList = [q]; reviewIndex = 0; openReviewDetail();
  }));
}
function fmtDiffAnswer(a){
  if(typeof a === "boolean") return a ? "Verdadero" : "Falso";
  if(Array.isArray(a)) return a.join(", ");
  if(a && typeof a === "object") return "—";
  return String(a);
}

/* ---------------------------------------------------------------
   BÚSQUEDA GLOBAL
--------------------------------------------------------------- */
function openSearchModal(){
  showModal(`
    <h3>Buscar</h3>
    <input type="text" class="code-input" id="search-input" style="text-transform:none; text-align:left; font-family:var(--font-ui); font-size:14px;" placeholder="Buscar pregunta, tema, fuente…">
    <div id="search-results" style="margin-top:var(--sp-4); max-height:340px; overflow-y:auto;"></div>
  `, (root)=>{
    const input = root.querySelector("#search-input");
    const results = root.querySelector("#search-results");
    input.focus();
    input.addEventListener("input", ()=>{
      const term = input.value.trim();
      if(term.length<2){ results.innerHTML = ""; return; }
      const matches = O.filterQuestions({search:term}).slice(0,25);
      if(!matches.length){ results.innerHTML = `<p style="font-size:13px;color:var(--text-2);">Sin resultados.</p>`; return; }
      results.innerHTML = `<div class="qlist">${matches.map((q,i)=>`
        <button class="qlist-item" data-sidx="${i}"><span class="badge ${badgeClass(q.id)}">${badgeGlyph(q.id)}</span>
        <div><div class="qtext">${O.renderBlank(truncate(q.enunciado,120))}</div><div class="qmeta">${q.sourceFile} · ${tipoLabel(q.tipo)}</div></div></button>
      `).join("")}</div>`;
      $$("[data-sidx]", results).forEach(btn=> btn.addEventListener("click", ()=>{
        const q = matches[Number(btn.getAttribute("data-sidx"))];
        closeModal(); reviewList=[q]; reviewIndex=0; openReviewDetail();
      }));
    });
  }, {wide:true});
}

/* ---------------------------------------------------------------
   MODALES / TOAST
--------------------------------------------------------------- */
function showModal(innerHtml, wireFn, opts){
  opts = opts||{};
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop"; backdrop.id = "active-modal";
  backdrop.innerHTML = `<div class="modal" style="${opts.wide?'max-width:560px;':''}" role="dialog" aria-modal="true">${innerHtml}</div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click",(e)=>{ if(e.target===backdrop) closeModal(); });
  document.addEventListener("keydown", escCloseOnce);
  if(wireFn) wireFn(backdrop.querySelector(".modal"));
}
function escCloseOnce(e){ if(e.key==="Escape") closeModal(); }
function closeModal(){ const m=document.getElementById("active-modal"); if(m) m.remove(); document.removeEventListener("keydown", escCloseOnce); }

/* ---------------------------------------------------------------
   AJUSTES / DIAGNÓSTICO
--------------------------------------------------------------- */
function openSettingsModal(){
  const ir = O.INTEGRITY_REPORT;
  const mr = O.MIGRATION_REPORT;
  showModal(`
    <h3>Ajustes y diagnóstico</h3>
    <div class="debug-panel">
      <p><strong>Almacenamiento:</strong> ${O.storageIsLocal? "activo en este navegador" : "modo memoria (no persistirá al cerrar)"}</p>
      <p><strong>Preguntas válidas:</strong> ${ir.valid} / ${ir.total} · <strong>Banco</strong> v${mr.bankVersion}</p>
      <table><thead><tr><th>Fuente</th><th>Preguntas</th></tr></thead>
        <tbody>${Object.entries(ir.bySource).sort().map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</tbody></table>
      <table><thead><tr><th>Tipo</th><th>Preguntas</th></tr></thead>
        <tbody>${Object.entries(ir.byType).map(([k,v])=>`<tr><td>${tipoLabel(k)}</td><td>${v}</td></tr>`).join("")}</tbody></table>
      ${ir.invalid ? `<p style="color:var(--bad);">Registros inválidos: ${ir.invalid}</p>` : `<p>Sin registros inválidos.</p>`}
      <p>IDs duplicados: <strong>${mr.duplicateIds.length}</strong> · Cobertura contentHash: <strong>${mr.contentHashCoverage}%</strong> · Generadas: <strong>${mr.generatedCount}</strong></p>
    </div>
    <hr class="div">
    <p style="font-weight:700; font-size:13px; margin-bottom:8px;">Borrado de datos</p>
    <div class="actions" style="justify-content:flex-start; flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" id="reset-current">Reiniciar test actual</button>
      <button class="btn btn-danger btn-sm" id="reset-progress">Borrar progreso</button>
      <button class="btn btn-danger btn-sm" id="reset-all">Borrar todo</button>
    </div>
    <div class="actions" style="margin-top:16px;"><button class="btn btn-ghost" id="close-settings">Cerrar</button></div>
  `, (root)=>{
    root.querySelector("#close-settings").addEventListener("click", closeModal);
    root.querySelector("#reset-current").addEventListener("click", ()=> confirmDanger(
      "Reiniciar test actual","Se perderán las respuestas de la sesión en curso.",
      ()=>{ O.setSession(null); O.saveSessionSnapshot(); closeModal(); go("home"); O.toast("Test actual reiniciado"); }
    ));
    root.querySelector("#reset-progress").addEventListener("click", ()=> confirmDanger(
      "Borrar todo el progreso","Se eliminarán tus respuestas, marcadas, historial y desafíos. No se puede deshacer.",
      ()=>{ O.PROGRESS.answers={}; O.PROGRESS.marked={}; O.PROGRESS.history=[]; O.PROGRESS.challenges={}; O.persist(); closeModal(); go("home"); O.toast("Progreso borrado"); }
    ));
    root.querySelector("#reset-all").addEventListener("click", ()=> confirmDanger(
      "Borrar todos los datos","Esto restablece la aplicación por completo.",
      ()=>{ O.STORE.removeItem("ope365_v1"); Object.assign(O.PROGRESS, {answers:{},marked:{},history:[],settings:{onboarded:false},currentSession:null,challenges:{}}); O.setSession(null); closeModal(); go("home"); O.toast("Aplicación restablecida"); }
    ));
  }, {wide:true});
}
function confirmDanger(title, msg, onConfirm){
  closeModal();
  showModal(`<h3>${title}</h3><p>${msg}</p>
    <div class="actions"><button class="btn btn-ghost" id="danger-cancel">Cancelar</button><button class="btn btn-danger" id="danger-confirm">Confirmar</button></div>
  `, (root)=>{
    root.querySelector("#danger-cancel").addEventListener("click", closeModal);
    root.querySelector("#danger-confirm").addEventListener("click", onConfirm);
  });
}

/* ---------------------------------------------------------------
   INICIALIZACIÓN
--------------------------------------------------------------- */
function init(){
  document.getElementById("settings-btn").addEventListener("click", openSettingsModal);
  document.getElementById("search-btn").addEventListener("click", openSearchModal);

  const saved = O.PROGRESS.currentSession;
  if(saved && !saved.finished && saved.questionIds && saved.questionIds.length){
    showModal(`
      <h3>Sesión sin terminar</h3>
      <p>Tienes una sesión de ${saved.mode==="exam"?"test":"práctica"} en curso (${Object.keys(saved.responses||{}).length}/${saved.questionIds.length} respondidas). ¿Quieres continuarla?</p>
      <div class="actions">
        <button class="btn btn-ghost" id="discard-session">Descartar</button>
        <button class="btn btn-primary" id="continue-session">Continuar</button>
      </div>
    `, (root)=>{
      root.querySelector("#discard-session").addEventListener("click", ()=>{ O.PROGRESS.currentSession=null; O.persist(); closeModal(); go("home"); });
      root.querySelector("#continue-session").addEventListener("click", ()=>{
        const hydrated = O.hydrateSession(saved);
        O.setSession(hydrated); O.saveSessionSnapshot(); closeModal(); go("running");
      });
    });
    go("home");
  } else {
    go("home");
  }
}

document.addEventListener("DOMContentLoaded", init);

/* ================================================================
   DUELO EN VIVO — configuración, sala, tablero, resultados
   Requiere conexión a internet en ambos dispositivos (señalización
   WebRTC vía PeerJS). El resto de la aplicación sigue funcionando
   sin conexión; esta es la única parte que la necesita.
================================================================ */
const MP = window.OPE_MP;
let mpSetupState = { role:null, name:"", mode:"duelo", preset:"clasica", rounds:15, seconds:10, scope:"todo", tema:"all", tipo:"all", categoria:"all", joinCode:"", raceMode:false };
let mpSession = null, mpDuel = null, mpPoker = null, mpGameMode = "duelo";
let mpConnPhase = "idle";
let mpDuelPhase = "idle";
let mpPokerPhase = "idle";
let mpPokerReveal = null, mpPokerFinal = null, mpPokerDeck = [], mpPokerPlayed = {};
let mpTimerInterval = null;
let mpLastRoundExtra = null;
let mpRoomCode = null;
let mpFinalExtra = null;

const MP_PRESETS = {
  relampago: { label:"Relámpago", rounds:5, seconds:5 },
  clasica:   { label:"Clásica",   rounds:15, seconds:10 },
  larga:     { label:"Larga",     rounds:30, seconds:15 },
  personalizada: { label:"Personalizada", rounds:15, seconds:10 },
};

const MP_CONN_LABELS = {
  idle:"", creating_room:"Creando partida…", waiting_rival:"Sala lista",
  connecting:"Conectando con tu rival…", connected:"Rival conectado", preparing:"Preparando partida…",
  syncing:"Sincronizando partida…", ready:"Todo listo", reconnecting:"Conexión interrumpida",
  restored:"Conexión recuperada", connect_failed:"No se ha podido conectar",
  reconnect_failed:"No se ha podido recuperar la conexión", room_create_failed:"No se ha podido crear la sala",
  room_full:"Esa sala ya está ocupada",
};

function mpReset(){
  if(mpSession){ try{ mpSession.destroy(); }catch(e){} }
  mpSession = null; mpDuel = null; mpPoker = null; mpConnPhase = "idle"; mpDuelPhase = "idle"; mpPokerPhase = "idle";
  mpRoomCode = null; mpLastRoundExtra = null; mpFinalExtra = null; mpPokerReveal = null; mpPokerFinal = null;
  mpPokerDeck = []; mpPokerPlayed = {};
  if(mpTimerInterval){ clearInterval(mpTimerInterval); mpTimerInterval = null; }
  if(mpPressureInterval){ clearInterval(mpPressureInterval); mpPressureInterval = null; }
}

/* --------------------------- CONFIGURACIÓN --------------------------- */
function renderMpSetup(){
  mpSetupState.role = mpSetupState.role || null;
  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <button class="btn btn-ghost btn-sm" data-goto="home" style="margin-bottom:var(--sp-4);">${icon('arrowL')} Inicio</button>
      <p class="eyebrow">Duelo en vivo</p>
      <h1>Reta a alguien en tiempo real</h1>
      <p>Necesitáis conexión a internet los dos. Cada uno responde desde su propio dispositivo, al mismo tiempo.</p>
    </div>
    <div class="choice-grid" id="mp-role-pick" style="margin-bottom:var(--sp-6);">
      <button class="choice-card ${mpSetupState.role==='host'?'selected':''}" data-role="host"><div class="t">Crear partida</div><div class="d">Configura el duelo y comparte el código</div></button>
      <button class="choice-card ${mpSetupState.role==='guest'?'selected':''}" data-role="guest"><div class="t">Unirme a una partida</div><div class="d">Ya tengo un código</div></button>
    </div>
    <div id="mp-setup-body"></div>
  </div>`;
  $$("#mp-role-pick .choice-card").forEach(c=> c.addEventListener("click", ()=>{ mpSetupState.role = c.getAttribute("data-role"); renderMpSetup(); }));
  if(mpSetupState.role === "host") renderMpHostConfig();
  else if(mpSetupState.role === "guest") renderMpGuestJoin();
}

function renderMpHostConfig(){
  const body = $("#mp-setup-body");
  body.innerHTML = `
    <div class="field"><label>Tu nombre</label><input type="text" id="mp-name" maxlength="16" placeholder="Tu nombre" value="${O.escapeHtml(mpSetupState.name)}"></div>

    <p style="font-size:11.5px; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:.04em; margin:var(--sp-5) 0 10px;">Modo</p>
    <div class="mode-grid" id="mp-mode-grid">
      <button class="mode-card ${mpSetupState.mode==='duelo'?'selected':''}" data-mode="duelo"><div class="glyph">⚔️</div><div class="t">Duelo</div><div class="d">Cada uno responde. Gana quien consigue más puntos.</div></button>
      <button class="mode-card ${mpSetupState.mode==='farol'?'selected':''}" data-mode="farol"><div class="glyph">🎭</div><div class="t">Farol</div><div class="d">Elige tu respuesta. Tu rival decide si se fía o no.</div></button>
      <button class="mode-card soon" disabled><div class="glyph">🤝</div><div class="t">Cooperativo</div><div class="d">Los dos jugáis juntos contra Word.</div><span class="soon-badge">Próximamente</span></button>
      <button class="mode-card" data-goto="challenges"><div class="glyph">🎯</div><div class="t">Desafío</div><div class="d">Comparte una partida y compite por el mejor resultado, sin estar conectados a la vez.</div></button>
    </div>

    <div id="mp-mode-fields"></div>

    <div style="margin-top:var(--sp-6);"><button class="btn btn-solid btn-block" id="mp-create-room">${mpSetupState.mode==='farol' ? 'Continuar' : 'Crear sala'} ${icon('chevronR')}</button></div>
  `;
  $("#mp-name").addEventListener("input", ()=> mpSetupState.name = $("#mp-name").value);
  $$("#mp-mode-grid .mode-card[data-mode]").forEach(c=> c.addEventListener("click", ()=>{ mpSetupState.mode = c.getAttribute("data-mode"); renderMpHostConfig(); }));
  renderMpModeFields();

  $("#mp-create-room").addEventListener("click", ()=>{
    if(!mpSetupState.name.trim()){ O.toast("Escribe tu nombre"); return; }
    mpStartAsHost();
  });
}

function renderMpModeFields(){
  const el = $("#mp-mode-fields");
  if(mpSetupState.mode === "farol"){
    el.innerHTML = `<div class="security-note" style="margin-top:var(--sp-5);">
      Cada uno elige su propia respuesta y decide si presentarla en serio o farolear. El otro ve lo que has marcado y elige: <strong style="color:var(--text);">CONFÍO</strong> o <strong style="color:var(--text);">DUDO</strong>. Prepararéis vuestro mazo de atajos en la sala, antes de empezar.
    </div>`;
    return;
  }
  el.innerHTML = `
    <p style="font-size:11.5px; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:.04em; margin:var(--sp-6) 0 10px;">Formato de ronda</p>
    <div class="choice-grid" id="mp-format-grid">
      <button class="choice-card ${!mpSetupState.raceMode?'selected':''}" data-race="0"><div class="t">Cada uno responde</div><div class="d">La ronda avanza cuando ambos respondéis, o al acabar el tiempo</div></button>
      <button class="choice-card ${mpSetupState.raceMode?'selected':''}" data-race="1"><div class="t">El primero que pulse</div><div class="d">Quien responde primero se lleva la pregunta y se pasa a la siguiente</div></button>
    </div>

    <p style="font-size:11.5px; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:.04em; margin:var(--sp-6) 0 10px;">Duración</p>
    <div class="preset-grid" id="mp-preset-grid">
      ${Object.entries(MP_PRESETS).map(([k,p])=>`<button class="preset-card ${mpSetupState.preset===k?'selected':''}" data-preset="${k}"><div class="t">${p.label}</div><div class="d">${k==='personalizada'?'A tu medida':p.rounds+' rondas · '+p.seconds+' s'}</div></button>`).join("")}
    </div>
    <div class="config-grid" id="mp-custom-fields" style="margin-top:var(--sp-4); ${mpSetupState.preset==='personalizada'?'':'display:none;'}">
      <div class="field"><label>Rondas</label><input type="number" id="mp-rounds" min="3" max="50" value="${mpSetupState.rounds}"></div>
      <div class="field"><label>Segundos por pregunta</label><input type="number" id="mp-seconds" min="3" max="60" value="${mpSetupState.seconds}"></div>
    </div>

    <details class="advanced" style="margin-top:var(--sp-5);">
      <summary>Contenido y tipos de ejercicio</summary>
      <div class="config-grid" style="margin-top:var(--sp-4);">
        <div class="field"><label>Contenido</label><select id="mp-scope">
          <option value="todo" ${mpSetupState.scope==='todo'?'selected':''}>Todo</option>
          <option value="tema" ${mpSetupState.scope==='tema'?'selected':''}>Por tema</option>
          <option value="categoria" ${mpSetupState.scope==='categoria'?'selected':''}>Por categoría (rutas/atajos)</option>
        </select></div>
        <div class="field" id="mp-tema-field" style="${mpSetupState.scope==='tema'?'':'display:none;'}"><label>Tema</label><select id="mp-tema">${O.ALL_TEMAS.map(t=>`<option value="${O.escapeHtml(t)}" ${mpSetupState.tema===t?'selected':''}>${O.escapeHtml(t)}</option>`).join("")}</select></div>
        <div class="field" id="mp-cat-field" style="${mpSetupState.scope==='categoria'?'':'display:none;'}"><label>Categoría</label><select id="mp-categoria">${O.CATEGORY_REGISTRY.filter(c=>c.id!=='general').map(c=>`<option value="${c.id}" ${mpSetupState.categoria===c.id?'selected':''}>${c.name}</option>`).join("")}</select></div>
        <div class="field"><label>Tipo de ejercicio</label><select id="mp-tipo">
          <option value="all" ${mpSetupState.tipo==='all'?'selected':''}>Todos</option>
          <option value="opcion_unica" ${mpSetupState.tipo==='opcion_unica'?'selected':''}>Opción única</option>
          <option value="seleccion_multiple" ${mpSetupState.tipo==='seleccion_multiple'?'selected':''}>Selección múltiple</option>
          <option value="verdadero_falso" ${mpSetupState.tipo==='verdadero_falso'?'selected':''}>Verdadero / Falso</option>
          <option value="emparejamiento" ${mpSetupState.tipo==='emparejamiento'?'selected':''}>Emparejamiento</option>
        </select></div>
      </div>
    </details>
  `;
  $$("#mp-format-grid .choice-card").forEach(c=>{
    c.addEventListener("click", ()=>{
      mpSetupState.raceMode = c.getAttribute("data-race")==="1";
      $$("#mp-format-grid .choice-card").forEach(x=>x.classList.remove("selected")); c.classList.add("selected");
    });
  });
  $$("#mp-preset-grid .preset-card").forEach(c=>{
    c.addEventListener("click", ()=>{
      mpSetupState.preset = c.getAttribute("data-preset");
      $$("#mp-preset-grid .preset-card").forEach(x=>x.classList.remove("selected")); c.classList.add("selected");
      const p = MP_PRESETS[mpSetupState.preset];
      if(mpSetupState.preset !== "personalizada"){ mpSetupState.rounds = p.rounds; mpSetupState.seconds = p.seconds; }
      $("#mp-custom-fields").style.display = mpSetupState.preset === "personalizada" ? "" : "none";
    });
  });
  const roundsInput = $("#mp-rounds"), secondsInput = $("#mp-seconds");
  if(roundsInput) roundsInput.addEventListener("input", ()=> mpSetupState.rounds = Number(roundsInput.value)||15);
  if(secondsInput) secondsInput.addEventListener("input", ()=> mpSetupState.seconds = Number(secondsInput.value)||10);
  $("#mp-scope").addEventListener("change", ()=>{
    mpSetupState.scope = $("#mp-scope").value;
    $("#mp-tema-field").style.display = mpSetupState.scope==="tema" ? "" : "none";
    $("#mp-cat-field").style.display = mpSetupState.scope==="categoria" ? "" : "none";
  });
  const temaSel = $("#mp-tema"); if(temaSel) temaSel.addEventListener("change", ()=> mpSetupState.tema = temaSel.value);
  const catSel = $("#mp-categoria"); if(catSel) catSel.addEventListener("change", ()=> mpSetupState.categoria = catSel.value);
  $("#mp-tipo").addEventListener("change", ()=> mpSetupState.tipo = $("#mp-tipo").value);
}

function renderMpGuestJoin(){
  const body = $("#mp-setup-body");
  body.innerHTML = `
    <div class="field"><label>Tu nombre</label><input type="text" id="mp-name-g" maxlength="16" placeholder="Tu nombre" value="${O.escapeHtml(mpSetupState.name)}"></div>
    <div class="field"><label>Código de sala</label><input type="text" class="code-input" id="mp-join-code" maxlength="5" placeholder="XXXXX" value="${mpSetupState.joinCode}"></div>
    <button class="btn btn-solid btn-block" id="mp-join-btn">Unirme ${icon('chevronR')}</button>
  `;
  $("#mp-name-g").addEventListener("input", ()=> mpSetupState.name = $("#mp-name-g").value);
  $("#mp-join-code").addEventListener("input", ()=> mpSetupState.joinCode = $("#mp-join-code").value.toUpperCase());
  $("#mp-join-btn").addEventListener("click", ()=>{
    if(!mpSetupState.name.trim()){ O.toast("Escribe tu nombre"); return; }
    if(mpSetupState.joinCode.trim().length < 4){ O.toast("Escribe el código de sala"); return; }
    mpStartAsGuest();
  });
}

/* --------------------------- ARRANQUE DE SESIÓN --------------------------- */
function mpStartAsHost(){
  mpReset();
  mpGameMode = mpSetupState.mode;
  const transport = MP.makeTransport();
  mpSession = MP.createSession(transport);
  mpSession.setHandlers({
    onState(s, extra){
      if(s === "ready"){
        mpSession.send({type:"game_mode", mode:mpGameMode});
        mpCreateGameEngine(true);
      }
      mpConnPhase = s;
      if(s === "waiting_rival") mpRoomCode = (extra && extra.code) || mpSession.getRoomCode();
      mpRerenderCurrentMpView();
    },
    onMessage(){ /* el motor real toma el relevo en cuanto se crea */ },
  });
  mpSession.hostCreateRoom(mpSetupState.name.trim());
  go("mp-lobby");
}
function mpStartAsGuest(){
  mpReset();
  const transport = MP.makeTransport();
  mpSession = MP.createSession(transport);
  mpSession.setHandlers({
    onState(s){ mpConnPhase = s; mpRerenderCurrentMpView(); },
    onMessage(msg){
      if(msg && msg.type === "game_mode"){ mpGameMode = msg.mode; mpCreateGameEngine(false); }
    },
  });
  mpSession.guestJoinRoom(mpSetupState.joinCode.trim(), mpSetupState.name.trim());
  go("mp-lobby");
}

function mpCreateGameEngine(isHost){
  if(mpGameMode === "farol"){
    mpPoker = MP.createPokerGame(mpSession);
    mpWirePokerHandlers();
  } else {
    mpDuel = MP.createDuelGame(mpSession);
    mpWireDuelHandlers();
    if(isHost){
      mpDuel.hostSetConfig({
        rounds: mpSetupState.rounds, seconds: mpSetupState.seconds,
        tema: mpSetupState.scope==="tema" ? mpSetupState.tema : "all",
        tipo: mpSetupState.tipo, categoria: mpSetupState.scope==="categoria" ? mpSetupState.categoria : "all",
        raceMode: !!mpSetupState.raceMode,
      });
    }
  }
  mpRerenderCurrentMpView();
}

function mpWireDuelHandlers(){
  mpDuel.setHandlers({
    onConnState(s, extra){
      mpConnPhase = s;
      if(s === "waiting_rival") mpRoomCode = (extra && extra.code) || mpSession.getRoomCode();
      mpRerenderCurrentMpView();
    },
    onPhase(p, extra){
      mpDuelPhase = p;
      if(p === "round_end"){
        mpLastRoundExtra = extra;
        setTimeout(()=>{ if(mpDuel) mpDuel.advanceIfHost(); }, 2200);
      }
      if(p === "finished") mpFinalExtra = extra;
      if(p === "round" || p === "lobby_ready" || p === "countdown" || p === "round_end" || p === "finished"){
        if(O.Nav.view !== "mp-game" && (p==="round"||p==="round_end"||p==="finished"||p==="countdown")) go("mp-game");
        else mpRerenderCurrentMpView();
      }
    },
    onSelfAnswered(){
      mpUpdateSelfStatus();
      const st = mpDuel.getState();
      if(O.Nav.view === "mp-game" && st.roundIndex>=0 && mpDuelPhase==="round") mpRenderAnswerBody(st.questions[st.roundIndex], st);
    },
    onRivalAnswered(){ mpUpdateSelfStatus(); },
  });
}
function mpRerenderCurrentMpView(){
  if(O.Nav.view === "mp-lobby") renderMpLobby();
  else if(O.Nav.view === "mp-game") renderMpGame();
}

/* --------------------------- SALA / ESTADOS DE CONEXIÓN --------------------------- */
function renderMpLobby(){
  if(!mpSession){ go("mp-setup"); return; }
  const view = mainEl();

  if(mpConnPhase === "waiting_rival"){
    view.innerHTML = `
    <div class="view view-narrow">
      <div class="room-code-hero surface-raised">
        <p class="eyebrow" style="margin-bottom:0;">Sala lista</p>
        <div class="big-code">${mpRoomCode}</div>
        <p style="color:var(--text-2); font-size:13px;">Comparte este código con tu rival para que se una.</p>
        <button class="btn btn-primary btn-sm" id="mp-copy-code" style="margin-top:var(--sp-4);">Copiar código</button>
      </div>
      <div class="conn-status-panel">
        <div class="conn-spinner"></div>
        <h3>Esperando rival…</h3>
        <p>La partida empezará en cuanto se una.</p>
      </div>
      <button class="btn btn-ghost btn-block" id="mp-exit">Salir</button>
    </div>`;
    $("#mp-copy-code").addEventListener("click", ()=> copyToClipboard(mpRoomCode));
    $("#mp-exit").addEventListener("click", mpExitToSetup);
    return;
  }

  if(["connect_failed","room_create_failed","reconnect_failed","room_full"].includes(mpConnPhase)){
    view.innerHTML = `
    <div class="view view-narrow">
      <div class="conn-status-panel">
        <div class="glyph" style="font-size:30px; margin-bottom:var(--sp-3); color:var(--bad);">⚠</div>
        <h3>${MP_CONN_LABELS[mpConnPhase]}</h3>
        <p>${mpConnPhase==="room_full" ? "Esa partida ya tiene dos jugadores." : "Puede que tu rival se haya desconectado o que la conexión haya fallado."}</p>
      </div>
      <div class="actions" style="justify-content:center; margin-top:var(--sp-5);">
        <button class="btn btn-outline" id="mp-retry">Intentar de nuevo</button>
        <button class="btn btn-ghost" id="mp-exit">Salir</button>
      </div>
    </div>`;
    $("#mp-retry").addEventListener("click", ()=>{ mpSetupState.role==='host' ? mpStartAsHost() : mpStartAsGuest(); });
    $("#mp-exit").addEventListener("click", mpExitToSetup);
    return;
  }

  if(mpGameMode === "farol" && mpPoker){
    return renderPokerLobby(view);
  }

  if(mpDuelPhase === "lobby_ready"){
    const rounds = mpDuel.getState().questions.length;
    const cfg = mpDuel.getState().config || {};
    view.innerHTML = `
    <div class="view view-narrow">
      <div class="test-preview">
        <div class="big">${rounds}</div>
        <div class="sub">rondas · ${cfg.seconds||10} s por pregunta</div>
      </div>
      <p style="text-align:center; color:var(--text-2); font-size:13px; margin-top:var(--sp-4);">Jugando contra <strong style="color:var(--text);">${O.escapeHtml(mpSession.getRivalName())}</strong></p>
      <button class="btn btn-solid btn-block" id="mp-im-ready" style="margin-top:var(--sp-6);">Estoy listo</button>
      <button class="btn btn-ghost btn-block" id="mp-exit" style="margin-top:10px;">Salir</button>
    </div>`;
    $("#mp-im-ready").addEventListener("click", (e)=>{ mpDuel.confirmReady(); e.target.disabled=true; e.target.textContent="Esperando al rival…"; });
    $("#mp-exit").addEventListener("click", mpExitToSetup);
    return;
  }

  // estados de progreso genéricos: creating_room / connecting / connected / preparing / syncing
  view.innerHTML = `
  <div class="view view-narrow">
    <div class="conn-status-panel">
      <div class="conn-spinner"></div>
      <h3>${MP_CONN_LABELS[mpConnPhase] || "Preparando…"}</h3>
    </div>
    <button class="btn btn-ghost btn-block" id="mp-exit">Salir</button>
  </div>`;
  $("#mp-exit").addEventListener("click", mpExitToSetup);
}

function mpExitToSetup(){ mpReset(); go("mp-setup"); }

/* --------------------------- TABLERO EN VIVO --------------------------- */
function renderMpGame(){
  if(mpGameMode === "farol"){
    if(!mpPoker){ go("mp-setup"); return; }
    return renderPokerGame();
  }
  if(!mpDuel){ go("mp-setup"); return; }
  if(mpTimerInterval){ clearInterval(mpTimerInterval); mpTimerInterval = null; }

  if(mpConnPhase === "reconnecting"){
    mainEl().innerHTML = `<div class="view view-narrow"><div class="conn-status-panel">
      <div class="conn-spinner"></div><h3>Conexión interrumpida</h3><p>Intentando reconectar… tu partida se conserva.</p>
    </div></div>`;
    return;
  }
  if(mpConnPhase === "reconnect_failed"){
    mainEl().innerHTML = `<div class="view view-narrow"><div class="conn-status-panel">
      <div class="glyph" style="font-size:30px; margin-bottom:var(--sp-3); color:var(--bad);">⚠</div>
      <h3>No se ha podido recuperar la conexión</h3><p>Tu resultado hasta ahora se ha guardado.</p>
    </div>
    <button class="btn btn-outline btn-block" id="mp-exit" style="margin-top:var(--sp-5);">Salir</button></div>`;
    $("#mp-exit").addEventListener("click", mpExitToSetup);
    return;
  }

  if(mpDuelPhase === "countdown"){
    mainEl().innerHTML = `<div class="view view-narrow"><div class="countdown-hero"><div class="num" id="mp-countdown-num">3</div><p style="color:var(--text-2);">Preparaos…</p></div></div>`;
    let n = 3;
    const el = $("#mp-countdown-num");
    const iv = setInterval(()=>{ n--; if(!el) { clearInterval(iv); return; } if(n<=0){ el.textContent="¡YA!"; clearInterval(iv); } else el.textContent = String(n); }, 1000);
    return;
  }

  if(mpDuelPhase === "finished"){ return renderMpResults(); }

  const st = mpDuel.getState();
  const q = st.questions[st.roundIndex];
  if(!q) return;
  const roundEndData = (mpDuelPhase === "round_end" && mpLastRoundExtra && mpLastRoundExtra.round === st.roundIndex) ? mpLastRoundExtra : null;

  mainEl().innerHTML = `
  <div class="view">
    <div class="duel-board">
      <div class="session-topbar">
        <button class="exit" id="mp-game-exit">${icon('arrowL')} Salir</button>
        <span class="counter">Ronda ${st.roundIndex+1} / ${st.questions.length}</span>
        <button class="icon-btn" id="mp-game-pause" aria-label="Pausa" title="Pausa" style="width:30px;height:30px;">⏸</button>
      </div>
      <div class="duel-players-row">
        <div class="duel-player self">
          <div class="name"><span class="status-dot"></span>${O.escapeHtml(mpSetupState.name)||"Tú"}</div>
          <div class="score" id="mp-my-score">${st.myScore}</div>
          ${st.myCombo>1?`<div class="combo">🔥 COMBO x${st.myCombo}</div>`:''}
        </div>
        <div class="duel-player">
          <div class="name"><span class="status-dot ${mpConnPhase==='restored'?'warn':''}"></span>${O.escapeHtml(mpSession.getRivalName())}</div>
          <div class="score" id="mp-rival-score">${st.rivalScore}</div>
          ${st.rivalCombo>1?`<div class="combo">🔥 COMBO x${st.rivalCombo}</div>`:''}
        </div>
      </div>

      ${roundEndData ? renderMpRoundEnd(roundEndData) : `
        <div class="duel-timer" id="mp-timer-wrap"><div class="t-num" id="mp-timer-num">--</div><div class="t-bar"><i id="mp-timer-bar" style="width:100%;"></i></div></div>
        <div class="surface qcard" style="padding:var(--sp-6);" id="mp-qcard">
          <div class="qcard-top"><div class="qcard-meta"><span class="tag tag-type">${tipoLabel(q.tipo)}</span></div></div>
          <h3>${O.renderBlank(q.enunciado)}</h3>
          <div id="mp-q-body"></div>
        </div>
        <div class="duel-selfstatus" id="mp-selfstatus">Pensando…</div>
      `}
    </div>
  </div>`;

  $("#mp-game-exit").addEventListener("click", mpConfirmExitDuringGame);
  $("#mp-game-pause").addEventListener("click", mpShowPauseOverlay);

  if(!roundEndData){
    mpRenderAnswerBody(q, st);
    mpStartTimerTick(st);
    mpUpdateSelfStatus();
  }
}

function mpConfirmExitDuringGame(){
  showModal(`
    <h3>¿Salir del duelo?</h3>
    <p>La partida sigue en curso para tu rival. Si sales ahora, no podrás retomarla — tendrías que empezar una nueva.</p>
    <div class="actions">
      <button class="btn btn-ghost" id="mp-exit-cancel">Seguir jugando</button>
      <button class="btn btn-outline" id="mp-exit-confirm">Salir</button>
    </div>
  `, (root)=>{
    root.querySelector("#mp-exit-cancel").addEventListener("click", closeModal);
    root.querySelector("#mp-exit-confirm").addEventListener("click", ()=>{ closeModal(); mpExitToSetup(); });
  });
}

function mpShowPauseOverlay(){
  showModal(`
    <h3>Pausa</h3>
    <p>El reloj de la ronda sigue corriendo para los dos — pausar aquí no lo detiene, es solo un respiro visual. Vuelve cuando quieras seguir.</p>
    <div class="actions">
      <button class="btn btn-solid" id="mp-resume">Reanudar</button>
    </div>
    <button class="btn btn-ghost btn-block" id="mp-pause-exit" style="margin-top:10px;">Salir del duelo</button>
  `, (root)=>{
    root.querySelector("#mp-resume").addEventListener("click", closeModal);
    root.querySelector("#mp-pause-exit").addEventListener("click", ()=>{ closeModal(); mpConfirmExitDuringGame(); });
  });
}

function mpRenderAnswerBody(q, st){
  const body = $("#mp-q-body");
  const already = !!st.myAnswerState;
  const timedOut = st.myAnswerState === "TIMEOUT";
  if(q.tipo === "opcion_unica"){
    body.innerHTML = `<div class="options">${q.opciones.map(o=>{
      const chosen = already && !timedOut && st.myAnswerValue === o.letter;
      return `<button class="option ${chosen?'selected':''}" data-letter="${o.letter}" ${already?"disabled":""}><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></button>`;
    }).join("")}</div>`;
    if(!already) $$(".option", body).forEach(btn=> btn.addEventListener("click", ()=> mpSubmit(btn.getAttribute("data-letter"))));
  } else if(q.tipo === "verdadero_falso"){
    const chosenTrue = already && !timedOut && st.myAnswerValue === true;
    const chosenFalse = already && !timedOut && st.myAnswerValue === false;
    body.innerHTML = `<div class="tf-row"><button class="tf-btn ${chosenTrue?'selected':''}" data-v="true" ${already?"disabled":""}>Verdadero</button><button class="tf-btn ${chosenFalse?'selected':''}" data-v="false" ${already?"disabled":""}>Falso</button></div>`;
    if(!already) $$(".tf-btn", body).forEach(btn=> btn.addEventListener("click", ()=> mpSubmit(btn.getAttribute("data-v")==="true")));
  } else if(q.tipo === "seleccion_multiple"){
    let sel = (already && !timedOut && Array.isArray(st.myAnswerValue)) ? st.myAnswerValue.slice() : [];
    body.innerHTML = `<div class="options">${q.opciones.map(o=>{
      const chosen = sel.includes(o.letter);
      return `<button class="option ${chosen?'selected':''}" data-letter="${o.letter}" ${already?"disabled":""}><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></button>`;
    }).join("")}
      ${!already?`<button class="btn btn-primary btn-sm" id="mp-multi-confirm" style="margin-top:12px;">Confirmar respuesta</button>`:''}`;
    if(!already){
      $$(".option", body).forEach(btn=> btn.addEventListener("click", ()=>{ const l=btn.getAttribute("data-letter"); const i=sel.indexOf(l); if(i>=0) sel.splice(i,1); else sel.push(l); btn.classList.toggle("selected"); }));
      $("#mp-multi-confirm").addEventListener("click", ()=>{ if(!sel.length){ O.toast("Selecciona al menos una opción"); return; } mpSubmit(sel.slice()); });
    }
  } else if(q.tipo === "emparejamiento"){
    let pairs = (already && !timedOut && st.myAnswerValue && typeof st.myAnswerValue === "object") ? Object.assign({}, st.myAnswerValue) : {};
    let leftId = null;
    function draw(){
      body.innerHTML = `<div class="match-wrap">
        <div class="match-col"><h4>Elementos</h4>${q.matching.left.map(l=>`<div class="match-item ${pairs[l.id]?'paired':''} ${leftId===l.id?'active':''}" data-left="${l.id}">${O.escapeHtml(l.label)}${pairs[l.id]?` → ${pairs[l.id]}`:''}</div>`).join("")}</div>
        <div class="match-col"><h4>Correspondencias</h4>${q.matching.right.map(r=>`<div class="match-item" data-right="${r.id}">${r.id}) ${O.escapeHtml(r.label)}</div>`).join("")}</div>
      </div>${!already?`<button class="btn btn-primary btn-sm" id="mp-match-confirm" style="margin-top:12px;" ${Object.keys(pairs).length<q.matching.left.length?'disabled':''}>Confirmar respuesta</button>`:''}`;
      if(already) return;
      $$("[data-left]",body).forEach(el=> el.addEventListener("click", ()=>{ leftId = el.getAttribute("data-left"); draw(); }));
      $$("[data-right]",body).forEach(el=> el.addEventListener("click", ()=>{ if(!leftId) return; pairs[leftId]=el.getAttribute("data-right"); leftId=null; draw(); }));
      const cbtn = $("#mp-match-confirm"); if(cbtn) cbtn.addEventListener("click", ()=> mpSubmit(Object.assign({},pairs)));
    }
    draw();
  }
}
function mpSubmit(answer){ mpDuel.submitAnswer(answer); }
function mpUpdateSelfStatus(){
  const el = $("#mp-selfstatus");
  if(!el) return;
  const st = mpDuel.getState();
  if(st.myAnswerState){
    el.textContent = st.rivalAnswerState ? "Ambos habéis respondido" : "✓ Respuesta registrada — esperando al rival…";
    el.className = "duel-selfstatus " + (st.rivalAnswerState ? "waiting" : "submitted");
  } else {
    el.textContent = "Pensando…"; el.className = "duel-selfstatus";
  }
}

function mpStartTimerTick(st){
  const cfg = st.config || {};
  const durationMs = (Number(cfg.seconds)||10) * 1000;
  if(!mpStartTimerTick._roundStartLocal || mpStartTimerTick._round !== st.roundIndex){
    mpStartTimerTick._roundStartLocal = Date.now();
    mpStartTimerTick._round = st.roundIndex;
  }
  const startedAt = mpStartTimerTick._roundStartLocal;
  mpTimerInterval = setInterval(()=>{
    const numEl = $("#mp-timer-num"), barEl = $("#mp-timer-bar"), wrapEl = $("#mp-timer-wrap");
    if(!numEl){ clearInterval(mpTimerInterval); return; }
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, durationMs - elapsed);
    numEl.textContent = (remaining/1000).toFixed(1) + " s";
    const frac = Math.max(0, Math.min(1, remaining/durationMs));
    barEl.style.width = (frac*100) + "%";
    wrapEl.classList.remove("warn","critical");
    if(frac <= 0.15) wrapEl.classList.add("critical");
    else if(frac <= 0.4) wrapEl.classList.add("warn");
    if(remaining <= 0) clearInterval(mpTimerInterval);
  }, 100);
}

function renderMpRoundEnd(data){
  if(data.race){
    if(data.iWon === null){
      return `<div class="round-end-panel">
        <div class="verdict bad">⏱ Nadie respondió a tiempo</div>
        <p style="font-size:12.5px; color:var(--text-2);">Se pasa a la siguiente pregunta.</p>
      </div>`;
    }
    const won = data.iWon;
    const mine = won ? data.me : data.rival;
    const label = won ? "¡La has pillado tú!" : `${O.escapeHtml(mpSession.getRivalName())} ha respondido antes`;
    return `
    <div class="round-end-panel">
      <div class="verdict ${won ? (mine.correct?'ok':'bad') : 'bad'}">${label}</div>
      ${won ? `<p style="font-size:13px; color:var(--text-2);">${mine.correct?'✓ Acierto':'✕ Fallo'} · +${mine.points} puntos</p>` : `<p style="font-size:12.5px; color:var(--text-2);">No te ha dado tiempo a responder esta.</p>`}
    </div>`;
  }
  const meOk = data.me.correct, rivalOk = data.rival.correct;
  return `
  <div class="round-end-panel">
    <div class="verdict ${meOk?'ok':'bad'}">${meOk ? '¡Correcto!' : (data.me.state==='TIMEOUT' ? 'Tiempo agotado' : 'Incorrecto')}</div>
    <div class="pts">+${data.me.points} puntos</div>
    <div class="round-end-vs">
      <div><strong>Tú</strong><br>${meOk?'✓ Acierto':'✕ Fallo'} · +${data.me.points}</div>
      <div><strong>${O.escapeHtml(mpSession.getRivalName())}</strong><br>${rivalOk?'✓ Acierto':'✕ Fallo'} · +${data.rival.points}</div>
    </div>
  </div>`;
}

/* --------------------------- RESULTADOS --------------------------- */
function renderMpResults(){
  const f = mpFinalExtra;
  if(!f) return;
  const outcomeLabel = { victory:"VICTORIA", defeat:"DERROTA", draw:"EMPATE" }[f.outcome];
  const outcomeClass = { victory:"win", defeat:"lose", draw:"draw" }[f.outcome];
  const isHost = mpSession.getRole() === "host";
  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="victory-hero ${outcomeClass}">
      <h1>${outcomeLabel}</h1>
      <p style="color:var(--text-2); font-size:13px;">${f.myScore} — ${f.rivalScore} puntos</p>
    </div>
    <table class="victory-compare">
      <thead><tr><th></th><th>Tú</th><th>${O.escapeHtml(mpSession.getRivalName())}</th></tr></thead>
      <tbody>
        <tr><td>Puntuación de juego</td><td>${f.myScore}</td><td>${f.rivalScore}</td></tr>
        <tr><td>Aciertos</td><td>${f.myCorrect}/${f.total}</td><td>${f.rivalCorrect}/${f.total}</td></tr>
        <tr><td>Precisión</td><td>${f.myAccuracy}%</td><td>${f.rivalAccuracy}%</td></tr>
      </tbody>
    </table>
    <p style="font-size:11.5px; color:var(--text-3); margin-top:var(--sp-3);">La precisión es tu dato educativo puro; la puntuación de juego también premia la velocidad y la racha de aciertos.</p>
    ${isHost ? `
    <div class="action-grid" style="margin-top:var(--sp-6);">
      <button class="action-card" id="mp-rematch"><div class="t">Revancha</div><div class="d">Mismas reglas, preguntas nuevas</div></button>
      <button class="action-card" id="mp-repeat"><div class="t">Repetir partida</div><div class="d">Exactamente las mismas preguntas</div></button>
      <button class="action-card" data-goto="home"><div class="t">Salir</div><div class="d">Volver al panel principal</div></button>
    </div>` : `
    <div class="empty-panel" style="margin-top:var(--sp-6);"><p>Si tu rival decide una revancha, la partida empezará automáticamente.</p></div>
    <button class="btn btn-outline btn-block" data-goto="home" style="margin-top:var(--sp-4);">Salir</button>
    `}
  </div>`;
  const rm = $("#mp-rematch"); if(rm) rm.addEventListener("click", ()=>{ mpDuel.requestRematch(true); mpDuelPhase="lobby_ready"; go("mp-lobby"); });
  const rp = $("#mp-repeat"); if(rp) rp.addEventListener("click", ()=>{ mpDuel.requestRematch(false); mpDuelPhase="lobby_ready"; go("mp-lobby"); });
}

/* ================================================================
   FAROL (WORD POKER) — duelo de conocimiento con farol
   Reutiliza Session/transporte/handshake del Duelo. Motor propio:
   MP.createPokerGame (ver multiplayer.js). El "mazo" son preguntas
   canónicas de opción única de categoría 'atajo' (sin frases
   negativas, para que la carta se lea limpia como pregunta directa).
================================================================ */
function mpWirePokerHandlers(){
  mpPoker.setHandlers({
    onConnState(){ /* ya gestionado por el puente de mpStartAsHost/Guest */ },
    onPhase(p, extra){
      mpPokerPhase = p;
      if(p === "reveal"){
        mpPokerReveal = extra;
        setTimeout(()=>{ if(mpPoker) mpPoker.nextTurn(); }, 3200);
      }
      if(p === "finished") mpPokerFinal = extra;
      if(O.Nav.view === "mp-lobby"){
        go("mp-game");
      } else if(O.Nav.view === "mp-game"){
        mpRerenderCurrentMpView();
      }
    },
  });
}

function pokerCardPool(){
  return O.QUESTIONS.filter(q=> q.categoria==="atajo" && q.tipo==="opcion_unica" && !q.negativa);
}
function pokerSuggestDeck(excludeIds){
  const excl = new Set(excludeIds||[]);
  const pool = pokerCardPool().filter(q=>!excl.has(q.id));
  const mastered = O.shuffle(pool.filter(q=>{ const a=O.PROGRESS.answers[q.id]; return a && a.correcta; }));
  const rest = O.shuffle(pool.filter(q=>{ const a=O.PROGRESS.answers[q.id]; return !(a && a.correcta); }));
  const deck = mastered.slice(0, MP.POKER_ROUNDS_PER_DECK);
  while(deck.length < MP.POKER_ROUNDS_PER_DECK && rest.length) deck.push(rest.shift());
  return deck.map(q=>q.id);
}
function pokerMasteredCount(){
  return pokerCardPool().filter(q=>{ const a=O.PROGRESS.answers[q.id]; return a && a.correcta; }).length;
}

function renderPokerLobby(view){
  if(!mpPokerDeck.length) mpPokerDeck = pokerSuggestDeck();
  const readyDisabled = mpPokerPhase === "waiting_ready";
  view.innerHTML = `
  <div class="view view-narrow">
    <div class="view-head">
      <p class="eyebrow">Farol</p>
      <h1>Prepara tu mazo</h1>
      <p>${pokerMasteredCount()} atajos dominados de ${pokerCardPool().length}. Se han sugerido ${MP.POKER_ROUNDS_PER_DECK} cartas — cambia las que quieras.</p>
    </div>
    <div class="qlist" id="poker-deck-list">
      ${mpPokerDeck.map((qid,i)=>{
        const q = O.Q_BY_ID[qid]; const mastered = O.PROGRESS.answers[qid] && O.PROGRESS.answers[qid].correcta;
        return `<div class="qlist-item" style="cursor:default;">
          <span class="chip" style="flex-shrink:0;">${mastered?'✓ Dominado':'Nuevo'}</span>
          <div style="flex:1;"><div class="qtext">${O.renderBlank(truncate(q.enunciado,90))}</div></div>
          <button class="btn btn-ghost btn-sm" data-swap="${i}" title="Cambiar carta">🔀</button>
        </div>`;
      }).join("")}
    </div>
    <div class="actions" style="margin-top:var(--sp-4); justify-content:flex-start;">
      <button class="btn btn-outline btn-sm" id="poker-shuffle-all">Barajar mazo completo</button>
    </div>
    <div class="security-note">🎭 3 faroles de alto valor por jugador — pasado ese límite, mentir sigue siendo posible pero vale menos puntos.</div>
    <button class="btn btn-solid btn-block" id="poker-confirm-deck" style="margin-top:var(--sp-5);" ${readyDisabled?'disabled':''}>${readyDisabled ? 'Esperando a tu rival…' : 'Confirmar mazo'}</button>
    <button class="btn btn-ghost btn-block" id="mp-exit" style="margin-top:10px;">Salir</button>
  `;
  $$("#poker-deck-list [data-swap]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = Number(btn.getAttribute("data-swap"));
      const [replacement] = pokerSuggestDeck(mpPokerDeck).slice(0,1);
      if(replacement) mpPokerDeck[i] = replacement;
      renderPokerLobby(mainEl());
    });
  });
  $("#poker-shuffle-all").addEventListener("click", ()=>{ mpPokerDeck = pokerSuggestDeck(); renderPokerLobby(mainEl()); });
  $("#poker-confirm-deck").addEventListener("click", (e)=>{
    mpPoker.setMyDeck(mpPokerDeck);
    mpPoker.confirmReady();
    mpPokerPhase = "waiting_ready";
    renderPokerLobby(mainEl());
  });
  $("#mp-exit").addEventListener("click", mpExitToSetup);
}

function renderPokerGame(){
  if(mpPokerPhase === "finished"){ return renderPokerResults(); }
  const st = mpPoker.getState();
  const round = mpPoker.getRound();
  const asaltoNow = round ? st.asalto : false;

  const header = `
    <div class="session-topbar">
      <button class="exit" id="mp-game-exit">${icon('arrowL')} Salir</button>
      <span class="counter">Turno ${st.turnIndex+1} / ${st.totalRounds}</span>
      <span class="chip">🎭 ${st.myFarolTokens}</span>
    </div>
    ${asaltoNow ? `<div class="security-note" style="text-align:center; border-color:var(--warn); color:var(--warn); margin-bottom:var(--sp-3);">⚡ ¡Asalto de faroles! Los faroles y las detecciones valen más esta ronda.</div>` : ``}
    ${round && round.comebackActive ? `<div class="security-note" style="text-align:center; border-color:var(--accent-line); color:var(--accent-ink); margin-bottom:var(--sp-3);">🔥 Remontada activa: ${round.attackerIsMe?'tus':O.escapeHtml(mpSession.getRivalName())+' sus'} puntos de esta ronda se duplican.</div>` : ``}
    <div class="duel-players-row">
      <div class="duel-player self"><div class="name"><span class="status-dot"></span>Tú</div><div class="score">${st.myScore}</div></div>
      <div class="duel-player"><div class="name"><span class="status-dot"></span>${O.escapeHtml(mpSession.getRivalName())}</div><div class="score">${st.rivalScore}</div></div>
    </div>
    ${renderPokerHistoryStrip()}`;

  let body = "";
  if(mpPokerPhase === "reveal" && mpPokerReveal && mpPokerReveal.turn === st.turnIndex){
    body = renderPokerReveal(mpPokerReveal);
  } else if(!round){
    body = `<div class="conn-status-panel"><div class="conn-spinner"></div><h3>Preparando turno…</h3></div>`;
  } else if(round.attackerIsMe){
    body = renderPokerAttackerUI(round, mpPokerPhase);
  } else {
    body = renderPokerDefenderUI(round, mpPokerPhase);
  }

  mainEl().innerHTML = `<div class="view view-narrow"><div class="duel-board">${header}${body}</div></div>`;
  $("#mp-game-exit").addEventListener("click", mpConfirmExitDuringGame);
  wirePokerGameHandlers(round, mpPokerPhase);
  $$("[data-history-idx]").forEach(el=> el.addEventListener("click", ()=> openPokerHistoryDetail(Number(el.getAttribute("data-history-idx")))));
  mpStartPressureText();
}
function renderPokerHistoryStrip(){
  const hist = mpPoker.getHistory();
  if(!hist.length) return "";
  return `<div style="display:flex; gap:5px; margin-bottom:var(--sp-4); flex-wrap:wrap;">
    ${hist.map((r,i)=>{
      let color = r.attackerTruthful ? "var(--good)" : (r.decision==='confio' ? "var(--warn)" : "var(--accent)");
      if(!r.attackerTruthful && r.decision==='dudo' && r.defenderCorrect) color = "var(--warn)";
      return `<button data-history-idx="${i}" title="Turno ${r.turn+1}" style="width:20px; height:20px; border-radius:5px; border:none; cursor:pointer; background:${color};"></button>`;
    }).join("")}
  </div>`;
}
function openPokerHistoryDetail(i){
  const r = mpPoker.getHistory()[i];
  if(!r) return;
  showModal(`<h3>Turno ${r.turn+1}</h3>${renderPokerReveal(r)}`, ()=>{}, {wide:true});
}

let mpPressureInterval = null;
function mpStartPressureText(){
  if(mpPressureInterval){ clearInterval(mpPressureInterval); mpPressureInterval = null; }
  const el = $("#mp-pressure-text");
  if(!el) return;
  const msgs = JSON.parse(el.getAttribute("data-msgs"));
  let i = 0;
  el.textContent = msgs[0];
  mpPressureInterval = setInterval(()=>{
    i = Math.min(i+1, msgs.length-1);
    const e2 = $("#mp-pressure-text");
    if(!e2){ clearInterval(mpPressureInterval); return; }
    e2.textContent = msgs[i];
  }, 2600);
}

function renderPokerAttackerUI(round, phase){
  if(phase === "attacker_select_card"){
    const played = new Set(Object.keys(mpPokerPlayed));
    const available = mpPokerDeck.filter(qid=>!played.has(qid));
    return `
      <p style="text-align:center; color:var(--text-2); font-size:13px; margin:var(--sp-4) 0;">Elige la carta que quieres jugar.</p>
      <div class="qlist">${available.map(qid=>{
        const q = O.Q_BY_ID[qid];
        return `<button class="qlist-item" data-play-card="${qid}"><div class="qtext">${O.renderBlank(truncate(q.enunciado,90))}</div></button>`;
      }).join("")}</div>`;
  }
  if(phase === "attacker_answer"){
    const q = O.Q_BY_ID[round.qid];
    return `
      <p style="text-align:center; color:var(--text-2); font-size:13px; margin:var(--sp-4) 0;">Elige la respuesta que quieres presentar.</p>
      <div class="surface qcard" style="padding:var(--sp-6);">
        <h3>${O.renderBlank(q.enunciado)}</h3>
        <div class="options">${q.opciones.map(o=>`<button class="option" data-claim="${o.letter}"><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></button>`).join("")}</div>
      </div>`;
  }
  return `<div class="conn-status-panel"><div class="conn-spinner"></div><h3 id="mp-pressure-text" data-msgs='${JSON.stringify(["Respuesta registrada","Tu rival está pensando…","Tu rival está dudando…","Tu rival está a punto de decidir…"])}'>Respuesta registrada</h3></div>`;
}

function renderPokerDefenderUI(round, phase){
  if(phase === "defender_wait_card"){
    return `<div class="conn-status-panel"><div class="conn-spinner"></div><h3 id="mp-pressure-text" data-msgs='${JSON.stringify(["Pensando…","Eligiendo su carta…"])}'>Pensando…</h3><p>${O.escapeHtml(mpSession.getRivalName())} está eligiendo su carta.</p></div>`;
  }
  if(phase === "defender_wait_claim"){
    return `<div class="conn-status-panel"><div class="conn-spinner"></div><h3 id="mp-pressure-text" data-msgs='${JSON.stringify(["Pensando…","Decidiendo su respuesta…"])}'>Pensando…</h3><p>${O.escapeHtml(mpSession.getRivalName())} está decidiendo su respuesta.</p></div>`;
  }
  const q = O.Q_BY_ID[round.qid];
  if(phase === "defender_decide"){
    const claimOpt = q.opciones.find(o=>o.letter===round.claim);
    return `
      <div class="surface qcard" style="padding:var(--sp-6);">
        <h3>${O.renderBlank(q.enunciado)}</h3>
        <div class="security-note" style="margin-bottom:var(--sp-4);">Tu rival ha marcado:</div>
        <div class="option selected" style="pointer-events:none;"><span class="letter">${claimOpt.letter}</span><span>${O.escapeHtml(claimOpt.text)}</span></div>
        <p style="text-align:center; font-weight:700; margin-top:var(--sp-5);">¿Te fías?</p>
        <div class="tf-row" style="margin-top:var(--sp-3);">
          <button class="tf-btn" id="poker-confio">🤝 CONFÍO</button>
          <button class="tf-btn" id="poker-dudo">🧐 DUDO</button>
        </div>
      </div>`;
  }
  // defender_answer (tras pulsar DUDO)
  const wildcardAvailable = !mpPoker.getState().myWildcardUsed;
  return `
    <div class="surface qcard" style="padding:var(--sp-6);">
      <h3>${O.renderBlank(q.enunciado)}</h3>
      <p style="text-align:center; color:var(--text-2); font-size:13px; margin-bottom:var(--sp-3);">Elige tu propia respuesta.</p>
      <div class="options" id="poker-defend-options">${q.opciones.map(o=>`<button class="option" data-defend="${o.letter}"><span class="letter">${o.letter}</span><span>${O.escapeHtml(o.text)}</span></button>`).join("")}</div>
      ${wildcardAvailable ? `<button class="btn btn-outline btn-sm" id="poker-wildcard" style="margin-top:var(--sp-4);">🃏 50/50 (elimina 2 — vale la mitad de puntos si aciertas)</button>` : ``}
    </div>`;
}

function wirePokerGameHandlers(round, phase){
  if(round && round.attackerIsMe && phase === "attacker_select_card"){
    $$("[data-play-card]").forEach(btn=> btn.addEventListener("click", ()=>{
      const qid = btn.getAttribute("data-play-card");
      mpPokerPlayed[qid] = true;
      mpPoker.playCard(qid);
    }));
  }
  if(round && round.attackerIsMe && phase === "attacker_answer"){
    $$("[data-claim]").forEach(btn=> btn.addEventListener("click", ()=> mpPoker.submitClaim(btn.getAttribute("data-claim"))));
  }
  if(round && !round.attackerIsMe && phase === "defender_decide"){
    $("#poker-confio").addEventListener("click", ()=> mpPoker.decideConfio());
    $("#poker-dudo").addEventListener("click", ()=>{ mpPokerPhase = "defender_answer"; renderPokerGame(); });
  }
  if(round && !round.attackerIsMe && phase === "defender_answer"){
    $$("[data-defend]").forEach(btn=> btn.addEventListener("click", ()=> mpPoker.decideDudo(btn.getAttribute("data-defend"))));
    const wc = $("#poker-wildcard");
    if(wc) wc.addEventListener("click", ()=>{
      const keep = mpPoker.useWildcard();
      if(!keep) return;
      $$("#poker-defend-options .option").forEach(btn=>{
        if(!keep.includes(btn.getAttribute("data-defend"))){ btn.disabled = true; btn.style.opacity = ".35"; btn.style.pointerEvents = "none"; }
      });
      wc.remove();
    });
  }
}

function renderPokerReveal(r){
  const q = r.question;
  const correctOpt = q.opciones.find(o=>o.letter===r.correct);
  const claimOpt = q.opciones.find(o=>o.letter===r.claim);
  const answerOpt = q.opciones.find(o=>o.letter===r.answer);
  const myWasAttacker = r.attackerIsMe;
  const myPts = myWasAttacker ? r.attackerPts : r.defenderPts;

  let verdictLine = "";
  if(r.attackerTruthful){
    verdictLine = "✅ ERA VERDAD";
  } else {
    verdictLine = "🎭 ERA UN FAROL" + (r.farolConsumedByAttacker ? "" : " (sin ficha de farol)");
  }
  let detectLine = "";
  if(!r.attackerTruthful){
    if(r.decision === "dudo" && r.defenderCorrect) detectLine = (myWasAttacker ? "Tu rival ha detectado tu farol 👁️" : "👁️ HAS DETECTADO EL FAROL");
    else if(r.decision === "confio") detectLine = (myWasAttacker ? "Tu rival se ha creído tu farol 🎭" : "🎭 TE HAS CREÍDO EL FAROL");
  }
  const extraNotes = [];
  if(r.asalto) extraNotes.push("⚡ Asalto de faroles");
  if(r.comebackActive) extraNotes.push("🔥 Remontada (puntos duplicados)");
  if(r.wildcardUsed) extraNotes.push("🃏 50/50 usado (puntos a la mitad)");

  return `
    <div class="round-end-panel">
      <div class="verdict ${r.attackerTruthful?'ok':'bad'}">${verdictLine}</div>
      ${detectLine ? `<p style="font-size:13px; color:var(--text-2); margin-bottom:var(--sp-2);">${detectLine}</p>` : ''}
      <div class="pts">${myPts>0?'+':''}${myPts} puntos</div>
      ${extraNotes.length ? `<p style="font-size:11.5px; color:var(--text-3); margin-top:6px;">${extraNotes.join(' · ')}</p>` : ''}
    </div>
    <div class="surface pad-5" style="margin-top:var(--sp-4);">
      <p style="font-size:11px; text-transform:uppercase; color:var(--text-3); font-family:var(--font-mono); margin-bottom:8px;">${O.escapeHtml(q.enunciado)}</p>
      <p style="font-size:13px; margin:4px 0;">✅ Respuesta correcta: <strong>${O.escapeHtml(correctOpt.text)}</strong></p>
      <p style="font-size:13px; margin:4px 0; color:var(--text-2);">${O.escapeHtml(mpWasAttackerName(r))} marcó: ${O.escapeHtml(claimOpt.text)}</p>
      ${r.decision==='dudo' ? `<p style="font-size:13px; margin:4px 0; color:var(--text-2);">${O.escapeHtml(mpWasDefenderName(r))} respondió: ${O.escapeHtml(answerOpt.text)}</p>` : ''}
      ${q.explicacion ? `<p style="font-size:12.5px; color:var(--text-2); margin-top:10px; border-top:1px solid var(--border); padding-top:10px;">${O.escapeHtml(q.explicacion)}</p>` : ''}
    </div>
    <p style="text-align:center; font-size:12px; color:var(--text-3); margin-top:var(--sp-4);">Siguiente turno en un momento…</p>
  `;
}
function mpWasAttackerName(r){ return r.attackerIsMe ? "Tú" : mpSession.getRivalName(); }
function mpWasDefenderName(r){ return r.attackerIsMe ? mpSession.getRivalName() : "Tú"; }

function renderPokerResults(){
  const f = mpPokerFinal;
  if(!f) return;
  const outcomeLabel = { victory:"VICTORIA", defeat:"DERROTA", draw:"EMPATE" }[f.outcome];
  const outcomeClass = { victory:"win", defeat:"lose", draw:"draw" }[f.outcome];
  const dudoPct = f.myDudoTotal ? Math.round((f.myDudoCorrect/f.myDudoTotal)*100) : null;
  mainEl().innerHTML = `
  <div class="view view-narrow">
    <div class="victory-hero ${outcomeClass}">
      <h1>${outcomeLabel}</h1>
      <p style="color:var(--text-2); font-size:13px;">${f.myScore} — ${f.rivalScore} puntos</p>
    </div>
    <div class="result-stats">
      <div class="stat-cell"><div class="num">${f.myCorrect}</div><div class="label">Respuestas correctas</div></div>
      <div class="stat-cell"><div class="num">${f.myBluffsSuccessful}</div><div class="label">🎭 Faroles logrados</div></div>
      <div class="stat-cell"><div class="num">${f.myBluffsDetectedByMe}</div><div class="label">👁️ Faroles detectados</div></div>
    </div>
    <div class="section-block">
      <div class="section-title"><h3>Cómo has leído a ${O.escapeHtml(mpSession.getRivalName())}</h3></div>
      <ul class="mini-list">
        <li><span class="mini-row-main">${O.escapeHtml(mpSession.getRivalName())} faroleó ${f.rivalBluffCount} ${f.rivalBluffCount===1?'vez':'veces'}</span><span class="mini-row-sub">confiaste en ${f.trustedRivalBluffCount}</span></li>
        <li><span class="mini-row-main">Faroles suyos detectados</span><span class="mini-row-sub">${f.detectedRivalBluffCount} de ${f.rivalBluffCount}</span></li>
        ${dudoPct!==null ? `<li><span class="mini-row-main">Cuando dudaste, acertaste</span><span class="mini-row-sub">${dudoPct}% (${f.myDudoCorrect}/${f.myDudoTotal})</span></li>` : ``}
      </ul>
    </div>
    <div class="action-grid" style="margin-top:var(--sp-6);">
      <button class="action-card" data-goto="mp-setup"><div class="t">Jugar otra vez</div><div class="d">Vuelve a configurar la partida</div></button>
      <button class="action-card" data-goto="home"><div class="t">Salir</div><div class="d">Volver al panel principal</div></button>
    </div>
  </div>`;
}

})();
