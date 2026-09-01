// QA manual del rediseño de UI (ago-2026): recorre las 5 áreas, los
// flujos principales y comprueba responsive + consola limpia.
// node tests/manual_walkthrough_redesign.mjs  (necesita playwright + chromium)
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const url = pathToFileURL(path.resolve('OPE365_Word365_Estudio.html')).href;
const b = await chromium.launch();
const errors = [];
const page = await b.newPage({ viewport:{width:1200,height:900} });
page.on('console', m=>{ if(m.type()==='error') errors.push('CONSOLE: '+m.text()); });
page.on('pageerror', e=> errors.push('PAGEERROR: '+e.message));
await page.goto(url);
await page.waitForTimeout(300);
const disc = page.locator('#discard-session'); if(await disc.count()) await disc.click();

async function step(name, fn){
  try{ await fn(); console.log('  OK  '+name); }
  catch(e){ console.log('  X   '+name+' -- '+e.message.split('\n')[0]); errors.push('STEP '+name+': '+e.message.split('\n')[0]); }
}
const nav = t => page.locator(`#primary-nav .nav-btn:has-text("${t}")`).click();

await step('nav Inicio', async()=>{ await nav('Inicio'); await page.locator('.stat-strip').waitFor({timeout:2000}); });
await step('nav Temario -> lista de 10', async()=>{ await nav('Temario'); const n = await page.locator('.progress-row').count(); if(n!==10) throw new Error('rows='+n); });
await step('Temario -> detalle Inicio -> grupos', async()=>{ await page.locator('.progress-row', {hasText:'Inicio'}).first().click(); await page.locator('#td-preguntas').waitFor(); const g = await page.locator('.nav-row[data-topic]').count(); if(!g) throw new Error('sin grupos'); });
await step('detalle -> Practicar esta pestaña arranca sesion', async()=>{ await page.locator('#td-preguntas').click(); await page.locator('#runner-qcard').first().waitFor({timeout:2000}); await page.locator('#session-exit').click(); const c=page.locator('#exit-confirm'); if(await c.count()) await c.click(); });
await step('nav Practica -> wizard con toggle', async()=>{ await nav('Práctica'); await page.locator('.wz-mode .seg').first().waitFor(); const segs = await page.locator('.wz-mode .seg').count(); if(segs!==2) throw new Error('segs='+segs); });
await step('wizard: elegir Tema -> panel contextual', async()=>{ await page.locator('[data-scope="tema"]').click(); await page.locator('.config-panel #wiz-section').waitFor({timeout:1500}); });
await step('wizard: hasta preview + empezar', async()=>{
  await page.locator('#wiz-next').click();
  await page.locator('#wiz-count-pills .seg[data-c="10"]').click();
  await page.locator('#wiz-next').click();
  await page.locator('.test-preview .big').waitFor();
  await page.locator('#wiz-start').click();
  await page.locator('#runner-qcard').waitFor({timeout:2000});
});
await step('practica: responder y feedback', async()=>{
  if(await page.locator('#q-body .option').count()) await page.locator('#q-body .option').first().click();
  else if(await page.locator('#q-body .tf-btn').count()) await page.locator('#q-body .tf-btn').first().click();
  await page.waitForTimeout(200);
});
await step('salir de la sesion', async()=>{ await page.locator('#session-exit').click(); const c=page.locator('#exit-confirm'); if(await c.count()) await c.click(); });
await step('nav Flashcards -> hub repaso', async()=>{ await nav('Flashcards'); await page.locator('#fc-repasar').waitFor({timeout:2000}); });
await step('flashcards: pestana Todas -> tabla', async()=>{ await page.locator('.segmented .seg[data-tab="todas"]').click(); await page.locator('.qlist-item').first().waitFor(); });
await step('flashcards: estudiar -> flip -> binario', async()=>{
  await page.locator('.segmented .seg[data-tab="repaso"]').click();
  await page.locator('#fc-repasar').click();
  await page.locator('#fc-card').waitFor();
  await page.locator('#fc-card').click();
  await page.waitForTimeout(600);
  if(!await page.locator('#fc-card.flipped').count()) throw new Error('no flip');
  await page.locator('#fc-knew').click();
  await page.locator('#fc-exit').click();
});
await step('nav Progreso -> secciones', async()=>{ await nav('Progreso'); await page.locator('.section-title:has-text("Retos y actividad")').waitFor({timeout:2000}); });
await step('Progreso -> Historial', async()=>{ await page.locator('.nav-row:has-text("Historial")').click(); await page.locator('h1:has-text("Historial")').waitFor(); });
await step('Progreso -> Introducir codigo (modal)', async()=>{ await nav('Progreso'); await page.locator('#pg-codigo').click(); await page.locator('.modal').waitFor(); await page.keyboard.press('Escape'); });
await step('Duelo accesible desde Inicio', async()=>{ await nav('Inicio'); await page.locator('.action-card:has-text("Duelo")').click(); await page.locator('h1:has-text("Reta a alguien")').waitFor({timeout:2000}); });
await step('busqueda (icono)', async()=>{ await page.locator('#search-btn').click(); await page.locator('#search-input').fill('negrita'); await page.waitForTimeout(300); await page.keyboard.press('Escape'); });
await step('ajustes (icono)', async()=>{ await page.locator('#settings-btn').click(); await page.locator('.modal:has-text("Ajustes")').waitFor(); await page.keyboard.press('Escape'); });

await step('responsive 375: bottom-nav visible, primary oculto', async()=>{ await page.setViewportSize({width:375,height:780}); await page.locator('#bottom-nav .nav-btn').first().waitFor({timeout:1500}); if(await page.locator('#primary-nav').isVisible()) throw new Error('primary-nav visible en movil'); });
await step('responsive 375: sin scroll horizontal (Inicio)', async()=>{ await page.locator('#bottom-nav .nav-btn:has-text("Inicio")').click(); await page.waitForTimeout(150); const sw = await page.evaluate(()=> document.documentElement.scrollWidth); const cw = await page.evaluate(()=> document.documentElement.clientWidth); if(sw > cw+2) throw new Error(`scrollWidth ${sw} > client ${cw}`); });
await step('responsive 375: sin overflow (Temario detalle)', async()=>{ await page.locator('#bottom-nav .nav-btn:has-text("Temario")').click(); await page.locator('.progress-row').first().click(); await page.waitForTimeout(150); const sw = await page.evaluate(()=> document.documentElement.scrollWidth); const cw = await page.evaluate(()=> document.documentElement.clientWidth); if(sw > cw+2) throw new Error(`overflow ${sw}/${cw}`); });
await step('responsive 375: wizard sin overflow', async()=>{ await page.locator('#bottom-nav .nav-btn:has-text("Práctica")').click(); await page.locator('[data-scope="tema"]').click(); await page.waitForTimeout(150); const sw = await page.evaluate(()=> document.documentElement.scrollWidth); const cw = await page.evaluate(()=> document.documentElement.clientWidth); if(sw > cw+2) throw new Error(`overflow ${sw}/${cw}`); });

await b.close();
console.log('\n' + (errors.length ? errors.length+' problema(s):\n'+errors.join('\n') : 'QA limpio: 0 errores de consola, 0 pasos fallidos'));
process.exit(errors.length?1:0);
