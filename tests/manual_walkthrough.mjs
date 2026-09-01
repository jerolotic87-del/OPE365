// Recorrido manual de la app real en un Chromium visible, contra el
// servidor local. Herramienta puntual de esta sesión (no forma parte
// del proyecto). Toma capturas en cada paso y vigila errores de consola.
import { chromium } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE = 'http://localhost:8123/';
const SHOT_DIR = 'D:/Temp/claude/D--Descargas-JSON-OPE365/cfd30bdf-efd5-481b-a72c-35cfd23bb6f3/scratchpad/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

let shotN = 0;
async function shot(page, name) {
  shotN++;
  const f = path.join(SHOT_DIR, `${String(shotN).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: f });
  console.log('screenshot:', f);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('--- 1) Home ---');
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('#primary-nav .nav-btn', { timeout: 10000 });
  await shot(page, 'home');

  console.log('--- 2) Temario ---');
  await page.locator('#primary-nav .nav-btn', { hasText: 'Temario' }).click();
  await page.waitForSelector('.progress-row', { timeout: 10000 });
  await shot(page, 'estudiar-temario');

  console.log('--- 3) Temario -> sección Vista ---');
  const vistaCard = page.locator('[data-goto="temario-detalle"]').filter({ hasText: 'Vista' }).first();
  await vistaCard.click();
  await page.waitForSelector('h1:has-text("Vista")', { timeout: 10000 });
  await shot(page, 'temario-vista');
  const tdText = await page.locator('#td-preguntas').innerText();
  console.log('td-preguntas dice:', JSON.stringify(tdText));

  console.log('--- 4) Vista -> Preguntas (arranca sesión de práctica) ---');
  await page.locator('#td-preguntas').click();
  await page.waitForSelector('#runner-qcard', { timeout: 10000 });
  await shot(page, 'practica-runner-pregunta1');
  const qText = await page.locator('#runner-qcard h3').innerText();
  console.log('primera pregunta:', JSON.stringify(qText.slice(0, 120)));
  const qType = await page.locator('.tag-type').first().innerText();
  console.log('tipo de pregunta:', qType);

  // Si es opción única, responder para ver el feedback
  const optBtn = page.locator('#q-body .option').first();
  if (await optBtn.count()) {
    await optBtn.click();
    await page.waitForTimeout(300);
    await shot(page, 'practica-respondida');
  } else {
    await shot(page, 'practica-tipo-no-opcion-unica');
  }

  console.log('--- 5) Salir a Flashcards ---');
  await page.locator('#session-exit').click();
  await page.waitForSelector('.modal, #app', { timeout: 5000 }).catch(() => {});
  const exitConfirm = page.getByText('Salir', { exact: true }).last();
  if (await exitConfirm.count()) await exitConfirm.click().catch(() => {});
  await page.waitForTimeout(300);

  await page.getByText('Flashcards', { exact: true }).first().click();
  await page.waitForSelector('#fc-count', { timeout: 10000 });
  await shot(page, 'flashcards-hub');
  const fcCount = await page.locator('#fc-count').innerText();
  console.log('fc-count:', fcCount);

  console.log('--- 6) Flashcards -> abrir una y voltearla ---');
  await page.locator('.qlist-item').first().click();
  await page.waitForSelector('#fc-card', { timeout: 10000 });
  await shot(page, 'flashcard-frente');
  await page.locator('#fc-card').click();
  await page.waitForTimeout(200);
  await shot(page, 'flashcard-dorso');
  const backHidden = await page.locator('#fc-back').evaluate(el => el.classList.contains('hidden'));
  console.log('dorso oculto tras click:', backHidden, '(debería ser false)');

  console.log('--- 7) Marcar dominada y siguiente ---');
  await page.locator('#fc-mastered').click();
  await page.waitForTimeout(200);
  await shot(page, 'flashcard-dominada');
  await page.locator('#fc-next').click();
  await page.waitForTimeout(200);
  await shot(page, 'flashcard-siguiente');

  console.log('--- 8) Volver a Inicio y comprobar Progreso ---');
  await page.getByText('Progreso', { exact: true }).first().click();
  await page.waitForSelector('.stat-cell', { timeout: 10000 });
  await shot(page, 'progreso');

  console.log('\n=== console.error capturados ===');
  console.log(consoleErrors.length ? consoleErrors : '(ninguno)');
  console.log('=== pageerror capturados ===');
  console.log(pageErrors.length ? pageErrors : '(ninguno)');

  await browser.close();
  console.log('\nRecorrido terminado.');
}

main().catch(e => { console.error('FALLO DEL RECORRIDO:', e); process.exit(1); });
