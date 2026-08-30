// Verificación visual dirigida del tipo "relleno" a través del asistente
// real de la app (Estudiar -> Por tipo de ejercicio -> Relleno de huecos).
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
  await page.getByText('Estudiar', { exact: true }).first().click();
  await page.locator('#sh-tipo').click();
  await page.waitForSelector('#wiz-scope-detail', { timeout: 10000 });
  await page.getByText('Tipo de ejercicio', { exact: true }).first().click();
  await page.waitForSelector('#wiz-tipo-pills .pill', { timeout: 10000 });

  const pillLabels = await page.locator('#wiz-tipo-pills .pill').allTextContents();
  console.log('pills de tipo disponibles:', pillLabels);
  const rellenoPill = page.locator('#wiz-tipo-pills .pill', { hasText: 'Relleno' });
  const picked = await rellenoPill.count() > 0;
  if (picked) await rellenoPill.click();
  console.log('pill de tipo Relleno encontrada y pulsada:', picked);
  await page.screenshot({ path: path.join(SHOT_DIR, '20-wizard-tipo-relleno.png') });

  // Avanzar el asistente pulsando "Continuar" en cada paso hasta llegar
  // a la práctica (el botón final cambia de texto, p.ej. "Empezar práctica").
  for (let i = 0; i < 8; i++) {
    if (await page.locator('#runner-qcard, [data-blank]').count()) break;
    const btn = page.locator('button.btn-solid, button.btn-primary').last();
    if (!(await btn.count())) break;
    const label = await btn.textContent();
    console.log(`  paso ${i}: pulso botón "${label.trim()}"`);
    await btn.click();
    await page.waitForTimeout(250);
  }

  await page.waitForSelector('#runner-qcard, [data-blank]', { timeout: 10000 }).catch(()=>{});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOT_DIR, '21-relleno-pregunta.png') });

  const blanks = await page.locator('[data-blank]').count();
  console.log('inputs de hueco encontrados:', blanks);

  if (blanks > 0) {
    const inputs = await page.locator('[data-blank]').all();
    for (const inp of inputs) await inp.fill('respuesta de prueba');
    await page.screenshot({ path: path.join(SHOT_DIR, '22-relleno-rellenado.png') });
    const checkBtn = page.locator('#blank-check');
    if (await checkBtn.count()) {
      await checkBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SHOT_DIR, '23-relleno-corregido.png') });
    }
  } else {
    console.log('AVISO: no se llegó a una pregunta de tipo relleno con este intento (el banco filtrado puede haber caído en otra cosa) -- ver captura 21');
  }

  console.log('console errors:', consoleErrors.length ? consoleErrors : '(ninguno)');
  await browser.close();
}

main().catch(e => { console.error('FALLO:', e); process.exit(1); });
