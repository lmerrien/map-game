// Browser/server parity: start the server, open the page, run 3 turns through the server,
// and require the status line to say "in step with the server" each time.
import { createRequire } from 'module';
const require = createRequire('/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const dir = fs.mkdtempSync('/tmp/alg-');
const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT: '3917', DATA_DIR: dir }, stdio: 'inherit' });
await new Promise(r => setTimeout(r, 1500));
const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:3917/'); await p.waitForTimeout(1500);
let ok = true;
for (let i = 1; i <= 3; i++) {
  await p.click('#play');
  await p.waitForFunction(() => /in step|differ|Could not/.test(document.getElementById('net').textContent), null, { timeout: 120000 });
  const m = await p.textContent('#net'); console.log('turn', i, '->', m); if (!/in step/.test(m)) ok = false;
}
const saved = JSON.parse(fs.readFileSync(dir + '/game.json', 'utf8')); console.log('saved turnNo', saved.turnNo);
await p.reload(); await p.waitForTimeout(1500);
const t = await p.evaluate(() => window.SB && window.SB.digest().turn); console.log('after reload turn', t);
await b.close(); srv.kill();
console.log(errs.length ? 'ERRORS ' + errs.join('|') : 'no page errors', ok ? 'PARITY OK' : 'PARITY FAIL');
process.exit(ok && !errs.length ? 0 : 1);
