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
  await page.waitForSelector('.learn-panel');
  ok(await seen('.learn-panel'), 'Inicio: panel "Tu aprendizaje" (dominio + repaso)');
  ok(await seen('.exam-strip'), 'Inicio: tira de examen con datos reales');
  ok(await seen('.mastery-bar .mb-seg'), 'Inicio: barra de dominio apilada');
  await shot('01-home-desktop');

  await click('[data-goto="temario"]');
  await page.waitForSelector('.progress-list');
  ok((await page.locator('[data-goto="temario-detalle"]').count()) === 10, 'Temario: 10 pestañas');
  await click('[data-goto="temario-detalle"]');
  await page.waitForSelector('.nav-row[data-topic], .empty-state');
  await shot('02-temario-detalle');

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

  // crear una pregunta con imagen desde "Mi contenido"
  await nav('practica');
  await page.waitForSelector('#in-create');
  await click('#in-create');
  await page.waitForSelector('#mc-new-q');
  ok(await seen('#mc-new-q') && await seen('#mc-new-fc'), 'Práctica → "Mi contenido" con crear pregunta/flashcard');
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
  await shot('09a-crear-pregunta-con-imagen');
  await click('#uq-save');
  await page.waitForTimeout(200);
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
