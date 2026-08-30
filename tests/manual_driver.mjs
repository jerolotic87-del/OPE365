// Driver REPL de Playwright para probar la app manualmente en un
// Chromium real (no headless) contra el servidor local. No es parte
// del proyecto -- herramienta puntual para esta sesión de pruebas.
import { chromium } from 'playwright';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SHOT_DIR = process.env.SCREENSHOT_DIR || 'D:/Temp/claude/D--Descargas-JSON-OPE365/cfd30bdf-efd5-481b-a72c-35cfd23bb6f3/scratchpad/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

let browser = null, page = null;

const COMMANDS = {
  async launch() {
    if (browser) return console.log('already launched');
    browser = await chromium.launch({ headless: false });
    page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    page.on('console', msg => { if (msg.type() === 'error') console.log('[console.error]', msg.text()); });
    page.on('pageerror', err => console.log('[pageerror]', err.message));
    console.log('launched.');
  },
  async nav(url) { if (!page) return console.log('ERROR: launch first'); await page.goto(url, { waitUntil: 'load' }); console.log('nav ->', url); },
  async ss(name) {
    if (!page) return console.log('ERROR: launch first');
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png');
    await page.screenshot({ path: f });
    console.log('screenshot:', f);
  },
  async click(sel) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.locator(sel).first().click({ timeout: 5000 }); console.log('click', sel, '-> OK'); }
    catch (e) { console.log('click', sel, '-> ERROR:', e.message.split('\n')[0]); }
  },
  async 'click-text'(text) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.getByText(text, { exact: false }).first().click({ timeout: 5000 }); console.log('click-text', JSON.stringify(text), '-> OK'); }
    catch (e) { console.log('click-text', JSON.stringify(text), '-> ERROR:', e.message.split('\n')[0]); }
  },
  async fill(args) {
    if (!page) return console.log('ERROR: launch first');
    const sp = args.indexOf(' ');
    const sel = args.slice(0, sp), text = args.slice(sp + 1);
    try { await page.locator(sel).first().fill(text, { timeout: 5000 }); console.log('fill', sel, '-> OK'); }
    catch (e) { console.log('fill', sel, '-> ERROR:', e.message.split('\n')[0]); }
  },
  async wait(sel) {
    if (!page) return console.log('ERROR: launch first');
    try { await page.locator(sel).first().waitFor({ timeout: 10000 }); console.log('found:', sel); }
    catch { console.log('TIMEOUT:', sel); }
  },
  async text(sel) {
    if (!page) return console.log('ERROR: launch first');
    console.log(await page.evaluate(s => (s ? document.querySelector(s) : document.body)?.innerText ?? '(null)', sel || null));
  },
  async eval(expr) {
    if (!page) return console.log('ERROR: launch first');
    try { console.log(JSON.stringify(await page.evaluate(expr))); }
    catch (e) { console.log('ERROR:', e.message); }
  },
  async quit() { if (browser) await browser.close().catch(() => {}); browser = null; page = null; },
  help() { console.log('commands:', Object.keys(COMMANDS).join(', ')); },
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'driver> ' });
rl.on('line', async line => {
  const sp = line.trim().indexOf(' ');
  const cmd = sp === -1 ? line.trim() : line.trim().slice(0, sp);
  const rest = sp === -1 ? '' : line.trim().slice(sp + 1);
  if (!cmd) return rl.prompt();
  const fn = COMMANDS[cmd];
  if (!fn) { console.log('unknown:', cmd, '- try: help'); return rl.prompt(); }
  try { await fn(rest); } catch (e) { console.log('ERROR:', e.message); }
  if (cmd === 'quit') { rl.close(); process.exit(0); }
  rl.prompt();
});
rl.on('close', async () => { await COMMANDS.quit(); process.exit(0); });

console.log('OPE365 driver - "help" for commands, "launch" to start');
rl.prompt();
