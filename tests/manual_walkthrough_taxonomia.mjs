// Verificación visual de la nueva navegación "Por pestaña y grupo" en
// el asistente, y del hub Estudiar tras la reclasificación completa.
import { chromium } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE = 'http://localhost:8123/';
const SHOT_DIR = 'D:/Temp/claude/D--Descargas-JSON-OPE365/cfd30bdf-efd5-481b-a72c-35cfd23bb6f3/scratchpad/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('favicon')) consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('[pageerror] ' + err.message));

  await page.goto(BASE, { waitUntil: 'load' });
  await page.locator('#primary-nav .nav-btn', { hasText: 'Temario' }).click();
  await page.screenshot({ path: path.join(SHOT_DIR, '30-estudiar-temario-completo.png') });

  await page.locator('#primary-nav .nav-btn', { hasText: 'Práctica' }).click();
  await page.waitForSelector('[data-scope="tema"]', { timeout: 10000 });
  await page.locator('[data-scope="tema"]').click();
  await page.screenshot({ path: path.join(SHOT_DIR, '31-wizard-pestana-grupo.png') });

  await page.selectOption('#wiz-section', 'archivo');
  await page.screenshot({ path: path.join(SHOT_DIR, '32-wizard-seccion-archivo.png') });
  const topicOptions = await page.locator('#wiz-topic option').allTextContents();
  console.log('Grupos de Archivo:', topicOptions);

  await page.selectOption('#wiz-topic', 'opciones');
  await page.locator('#wiz-next').click();
  await page.waitForTimeout(200);
  // Avanzar hasta la vista previa
  for (let i = 0; i < 5; i++) {
    const preview = await page.locator('.test-preview').count();
    if (preview) break;
    const btn = page.locator('#wizard-body .btn-solid, #wizard-body .btn-primary').first();
    if (await btn.count()) await btn.click();
    await page.waitForTimeout(150);
  }
  await page.screenshot({ path: path.join(SHOT_DIR, '33-wizard-preview-archivo-opciones.png') });
  const bigNum = await page.locator('.test-preview .big').textContent().catch(()=>null);
  console.log('Preguntas en Archivo > Opciones:', bigNum);

  // Repasar preguntas con el nuevo filtro Sección/Grupo: navegación directa
  await page.evaluate(() => {
    const b = document.createElement('button');
    b.setAttribute('data-goto', 'review-hub');
    document.body.appendChild(b);
    b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    b.remove();
  });
  await page.waitForSelector('#rv-section', { timeout: 10000 });
  await page.selectOption('#rv-section', 'inicio');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SHOT_DIR, '34-repasar-seccion-inicio.png') });
  const rvCount = await page.locator('#rv-count').textContent();
  console.log('Repasar > Inicio:', rvCount);

  console.log('console errors:', consoleErrors.length ? consoleErrors : '(ninguno)');
  await browser.close();
}

main().catch(e => { console.error('FALLO:', e); process.exit(1); });
