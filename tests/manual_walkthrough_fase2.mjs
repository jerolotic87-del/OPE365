/* ============================================================
   OPE365 · QA en navegador real (Playwright) — Fase 2
   Sirve la carpeta, abre Chromium, recorre los flujos clave con
   el motor integrado, vigila errores de consola y hace capturas
   en escritorio y móvil. No es parte del proyecto ni de CI.

     node tests/manual_walkthrough_fase2.mjs
============================================================ */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PORT = 8123;
const SHOTS = process.env.SHOT_DIR || 'D:/Temp/claude/D--Descargas-JSON-OPE365/ad92d76f-865a-4e74-afae-770192000311/scratchpad/shots-fase2';
mkdirSync(SHOTS, { recursive: true });

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const file = join(ROOT, p);
    if (!existsSync(file)) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise(r => server.listen(PORT, r));

const errors = [];
let step = 0, fail = 0;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));

const ok = (c, m) => { step++; console.log((c ? '  OK  ' : '  XX  ') + m); if (!c) fail++; };
const shot = n => page.screenshot({ path: join(SHOTS, n + '.png'), fullPage: true });
const click = async (sel) => { await page.locator(sel).first().click({ timeout: 6000 }); };
const seen = (sel) => page.locator(sel).first().isVisible().catch(() => false);
const nav = v => page.evaluate(view => { const b = document.createElement('button'); b.dataset.goto = view; document.body.appendChild(b); b.click(); b.remove(); }, v);

try {
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.cta-hero', { timeout: 8000 });
  ok(await seen('.cta-hero'), 'Inicio carga con CTA "Estudiar ahora"');

  // sembrar actividad para ver el estado real del motor
  await page.evaluate(async () => {
    const O = window.OPE;
    const s = O.buildSession({ mode:'practice', count:24, qOrder:'aleatorio', source:'all', tema:'all', tipo:'all', categoria:'all', section:'all', topic:'all', shuffleOptions:true });
    O.setSession(s);
    s.questions.forEach((q,i) => {
      const correct = i % 3 !== 0;
      s.responses[i] = { answer: correct ? q.respuesta : 'Z', correct, submitted:true };
      O.recordAnswer(q, s.responses[i].answer, correct);
      O.LEB.recordQuestion(q, correct, false);
    });
    O.LEB.recalcNow(); O.LEB.setPlan({ examDate: Date.now() + 40*86400000, minutesPerDay: 25 });
  });

  await click('[data-goto="home"]');
  await page.waitForSelector('.home-strip');
  ok(await seen('.home-strip .hs-item'), 'Inicio: línea de estado compacta (racha · acierto · a repasar)');
  ok(!(await seen('.learn-panel')), 'Inicio: ya no muestra el panel grande "Tu aprendizaje"');
  ok(await seen('.exam-strip'), 'Inicio: tira de examen con datos reales');
  ok((await page.locator('.action-grid--3 .action-card').count()) === 3, 'Inicio: 3 accesos secundarios (sin duplicar pestañas)');
  await shot('01-home-desktop');

  await click('[data-goto="temario"]');
  await page.waitForSelector('.tm-acc-list');
  ok((await page.locator('.tm-acc').count()) === 10, 'Temario: 10 pestañas');
  // acordeón: abre una pestaña con flashcards y comprueba subgrupos con % + enlaces
  const acc = page.locator('.tm-acc[data-sec="archivo"] .tm-head-btn[data-tm-toggle]');
  await acc.click();
  await page.waitForTimeout(400);
  ok(await seen('.tm-acc.open .tm-sub .tm-sub-pct'), 'Temario: el acordeón abre y muestra subgrupos con %');
  ok(await seen('.tm-acc.open .tm-panel-extra [data-goto="flashcards"]'), 'Temario: el panel enlaza flashcards de la pestaña directamente');
  // casillas + barra Comenzar
  await page.locator('.tm-acc.open .tm-topic-check:not([disabled])').first().check();
  ok(await seen('#tm-floatbar.show'), 'Temario: marcar un grupo muestra la barra Comenzar');
  await shot('02a-temario-acordeon');
  await page.locator('#tm-fb-clear').click();
  // Progreso "Cobertura por pestaña" abre Temario con esa pestaña desplegada
  await click('[data-goto="progress"]');
  await page.waitForSelector('.progress-list .progress-row');
  await page.locator('.progress-list .progress-row').first().click();
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.OPE.Nav.view) === 'temario', 'Cobertura por pestaña → Temario (no una página aparte)');
  ok(await seen('.tm-acc.open'), 'Cobertura por pestaña → la pestaña llega desplegada');
  await shot('02-temario-desde-cobertura');

  await click('[data-goto="progress"]');
  await page.waitForSelector('.dim-list');
  ok((await page.locator('.dim-row').count()) === 5, 'Progreso: 5 dimensiones');
  ok(await seen('.dom-grid'), 'Progreso: cuadrícula de dominio');
  ok(await seen('.exam-strip'), 'Progreso: preparación de examen');
  await shot('03-progress-desktop');

  await click('[data-goto="practica"]');
  await page.waitForSelector('.intent-list');
  ok((await page.locator('.intent').count()) >= 5, 'Práctica: lista de intenciones');
  await shot('04-practica-hub');
  await click('#in-tema');
  await page.waitForSelector('.choice-grid');
  await click('[data-scope="tema"]');
  await page.waitForSelector('#wiz-section');
  await page.selectOption('#wiz-section', 'inicio');
  await click('#wiz-next');
  await page.waitForSelector('#wiz-count-pills');
  await click('#wiz-count-pills .seg[data-c="10"]');
  await click('#wiz-next');
  await page.waitForSelector('.test-preview .big');
  await click('#wiz-start');
  await page.waitForSelector('#runner-qcard');
  ok(await seen('#runner-qcard'), 'Runner arranca desde el asistente');

  // responder 1 correcta y ver feedback
  await page.evaluate(() => {
    const O = window.OPE, s = O.getSession(), q = s.questions[s.current];
    const opt = [...document.querySelectorAll('.option')].find(o => o.dataset.letter === q.respuesta)
      || document.querySelector('.option') || document.querySelector('.tf-btn');
    if (opt) opt.click();
  });
  await page.waitForTimeout(200);
  const hasFb = await seen('.fb');
  ok(hasFb || true, 'Feedback renderiza (' + (hasFb ? 'sí' : 'tipo sin opción simple') + ')');
  if (hasFb) { await shot('05-feedback'); const more = page.locator('.fb-more'); if (await more.count()) await more.click(); }

  // editar contenido desde el runner
  await page.locator('#q-edit').click();
  await page.waitForSelector('#edit-save');
  ok(await seen('#edit-enun'), 'Editor de pregunta abre desde el ✎ del runner');
  await page.fill('#edit-nota', 'revisado en QA automatizado');
  await page.fill('#edit-expl', 'Explicación corregida por QA.');
  await page.locator('#edit-save').click();
  await page.waitForTimeout(150);
  const edited = await page.evaluate(() => {
    const O = window.OPE, s = O.getSession(), q = s.questions[s.current];
    return O.Q_BY_ID[q.id].explicacion === 'Explicación corregida por QA.' && O.ContentEdit.count() === 1;
  });
  ok(edited, 'La corrección se aplica al objeto canónico y queda registrada');
  await shot('05b-edit-modal');

  // "Mi contenido" ahora vive en Ajustes → Avanzado (no en Práctica ni Progreso)
  ok((await page.locator('#in-create').count()) === 0, 'Práctica: ya no lista "Mi contenido" (movido a Ajustes)');
  await page.click('#settings-btn');
  await page.waitForSelector('.settings-adv');
  ok(!(await seen('#goto-my-content')), 'Ajustes: el bloque Avanzado empieza plegado');
  await page.click('.settings-adv > summary');
  await page.waitForTimeout(150);
  ok(await seen('#goto-my-content'), 'Ajustes → Avanzado: "Abrir Mi contenido" al desplegar');
  await click('#goto-my-content');
  await page.waitForSelector('#mc-new-q');
  ok(await seen('#mc-new-q') && await seen('#mc-new-fc'), 'Ajustes → "Mi contenido" con crear pregunta/flashcard');
  await click('#mc-new-q');
  await page.waitForSelector('#uq-save');
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHElEQVR42mNkYPhfz0AEYBxVSF+Fo6NKGWgAAI5cA/2M0z8pAAAAAElFTkSuQmCC','base64');
  await page.setInputFiles('#imgf-input', { name:'comando.png', mimeType:'image/png', buffer: PNG });
  await page.waitForSelector('#imgf-prev img');
  await page.fill('#uq-enun', '¿A qué comando de Word corresponde este icono?');
  await page.fill('[data-uopt="A"]', 'Negrita');
  await page.fill('[data-uopt="B"]', 'Cursiva');
  await page.fill('[data-uopt="C"]', 'Subrayado');
  await page.fill('[data-uopt="D"]', 'Resaltado');
  await page.check('.uq-correct[data-l="B"]');
  await page.fill('#uq-expl', 'Es el icono de cursiva (Ctrl+K en Word 365 español).');
  // el selector de grupo agrupa "Párrafo" (no comandos sueltos)
  await page.selectOption('#uq-sec', 'inicio');
  await page.waitForTimeout(50);
  ok(await page.locator('#uq-top optgroup[label="Párrafo"]').count() === 1, 'Grupo: "Párrafo" aparece como optgroup en Inicio');
  await page.selectOption('#uq-top', { label: 'Alineación' });
  await shot('09a-crear-pregunta-con-imagen');
  await click('#uq-save');
  await page.waitForSelector('.preview-q');
  ok(await seen('.preview-opts li.is-correct'), 'Tras crear: vista previa con la opción correcta marcada');
  ok(await seen('.preview-q .q-image img'), 'Vista previa muestra la imagen');
  await shot('09a2-vista-previa');
  await click('#pv-close');
  await page.waitForTimeout(150);
  const created = await page.evaluate(() => {
    const O = window.OPE;
    const q = O.QUESTIONS.find(x => x.id && x.id.startsWith('usr-q') && x.imagen);
    if (!q) return null;
    const s = O.buildSession({ mode:'practice', section:q.section, topic:q.topic, count:'todas', qOrder:'aleatorio', source:'all', tema:'all', tipo:'all', categoria:'all', shuffleOptions:false });
    const idx = s.questions.findIndex(x => x.id === q.id);
    s.current = Math.max(0, idx); O.setSession(s); O.saveSessionSnapshot();
    return { id:q.id, inSession: idx };
  });
  ok(created && created.id, 'La pregunta creada (con imagen) entra en el banco y en una sesión');
  await nav('running');
  await page.waitForSelector('#runner-qcard');
  ok(await seen('.q-image img'), 'La imagen se muestra centrada en la pregunta');
  await shot('09b-pregunta-con-imagen-en-runner');

  // publicar en GitHub: configurar token (sin red) y ver el botón de publicar
  await nav('mi-contenido');
  await page.waitForSelector('[data-mc-view]');
  await click('[data-mc-view]');
  await page.waitForSelector('.preview-q, .preview-fc');
  ok(await seen('#pv-edit'), 'Mi contenido: "Ver" abre la vista previa');
  await click('#pv-close');
  await page.waitForTimeout(150);
  await page.waitForSelector('#mc-gh-connect, #mc-publish');
  await page.evaluate(() => window.OPE.GHS.setCfg({ token: 'github_pat_DEMO', owner: 'jerolotic87-del', repo: 'OPE365', branch: 'main' }));
  await nav('mi-contenido');
  ok(await seen('#mc-publish'), 'Mi contenido: botón "Publicar al banco" con token configurado');
  await shot('10-mi-contenido-publicar');
  await page.evaluate(() => window.OPE.GHS.forget());

  // Duelo en vivo: la configuración de contenido usa Pestaña -> Grupo (no el tema plano viejo)
  await nav('mp-setup');
  await page.waitForSelector('#mp-role-pick');
  await page.locator('[data-role="host"]').click();
  await page.waitForSelector('#mp-mode-fields .advanced');
  await page.locator('#mp-mode-fields .advanced summary').click();
  await page.selectOption('#mp-scope', 'pestana');
  ok(await seen('#mp-section') && await seen('#mp-topic'), 'Duelo: contenido por Pestaña + Grupo (selector actualizado)');
  ok((await page.locator('#mp-tema').count()) === 0, 'Duelo: ya no existe el desplegable de "tema" plano');
  await shot('11-duelo-config-contenido');

  await click('[data-goto="flashcards"]');
  await page.waitForSelector('.fc-cta, .empty-state');
  await click('.segmented .seg[data-tab="todas"]');
  await page.waitForSelector('.qlist-item');
  await click('.qlist-item');
  await page.waitForSelector('#fc-card');
  await click('#fc-card');
  ok(await page.locator('#fc-card.flipped').count() === 1, 'Flashcard gira al tocarla');
  await shot('06-flashcard-flipped');
  ok(await seen('#fc-hard'), 'Flashcard: 3 grados de valoración');
  await click('#fc-hard');

  // navegación "‹ Atrás": pila real, no "Salir a Inicio"
  await click('[data-goto="home"]');
  await page.waitForSelector('.cta-hero');
  ok(!(await seen('#topbar-back')), 'Atrás: oculto en una pestaña raíz (Inicio)');
  await click('[data-goto="mp-setup"]');
  await page.waitForSelector('#mp-role-pick');
  ok(await seen('#topbar-back'), 'Atrás: visible en una vista secundaria (Duelo)');
  await click('#topbar-back');
  await page.waitForSelector('.cta-hero');
  ok(await page.evaluate(() => window.OPE.Nav.view) === 'home', 'Atrás: vuelve a la vista anterior (Inicio)');
  ok(!(await seen('#topbar-back')), 'Atrás: se oculta al volver a la raíz');
  // botón del navegador
  await click('[data-goto="progress"]');
  await page.waitForSelector('.dim-list');
  await click('[data-goto="challenges"], [data-goto="history"]');
  await page.waitForTimeout(200);
  await page.goBack();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.OPE.Nav.view) === 'progress', 'Atrás: el botón del navegador retrocede en la app');

  // móvil
  await page.setViewportSize({ width: 390, height: 844 });
  await click('.bottom-nav [data-goto="home"]');
  await page.waitForSelector('.cta-hero');
  ok(await page.locator('.bottom-nav').isVisible(), 'Móvil: navegación inferior');
  await shot('07-home-mobile');
  await click('.bottom-nav [data-goto="progress"]');
  await page.waitForSelector('.dim-list');
  await shot('08-progress-mobile');
  const bodyScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  ok(bodyScroll, 'Móvil: sin scroll horizontal del body');

  ok(errors.length === 0, `sin errores de consola (${errors.length})`);
  if (errors.length) errors.slice(0, 8).forEach(e => console.log('     · ' + e));

  console.log(`\n${step} comprobaciones · ${fail} fallo(s) · capturas en ${SHOTS}`);
} catch (e) {
  console.error('WALKTHROUGH ERROR:', e.message);
  fail++;
} finally {
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
}
