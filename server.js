'use strict';
/* Allégeance server, phase 1: serves the page, keeps one game on disk, resolves turns with the engine.
 *   GET  /api/health   -> {ok:true}
 *   GET  /api/game     -> {state}     (a fresh game if none is saved)
 *   PUT  /api/game     <- {state}     (phase 1: the single client is trusted)
 *   POST /api/run      -> {state, digest, report}   (resolves one turn on the server)
 * Optional access key: set ALLEGEANCE_KEY, then open the page as /?key=... */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createEngine } = require('./engine/engine');

const PORT = process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA, 'game.json');
const KEY = process.env.ALLEGEANCE_KEY || '';
const PUB = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const engine = createEngine();
fs.mkdirSync(DATA, { recursive: true });

function loadState() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return engine.initial(); }
}
function saveState(state) {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, FILE);
}
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > 20e6) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

async function api(req, res, url) {
  if (url === '/api/health') return send(res, 200, { ok: true });
  if (KEY && req.headers['x-key'] !== KEY) return send(res, 401, { error: 'access key missing or wrong (open the page as /?key=...)' });
  if (url === '/api/game' && req.method === 'GET') return send(res, 200, { state: loadState() });
  if (url === '/api/game' && req.method === 'PUT') {
    const b = await readBody(req);
    if (!b.state || typeof b.state !== 'object') return send(res, 400, { error: 'no state' });
    saveState(b.state);
    return send(res, 200, { ok: true });
  }
  if (url === '/api/run' && req.method === 'POST') {
    const out = engine.run(loadState());
    saveState(out.state);
    return send(res, 200, out);
  }
  send(res, 404, { error: 'unknown endpoint' });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url.startsWith('/api/')) {
    api(req, res, url).catch(e => { console.error(e); send(res, 500, { error: String(e.message || e) }); });
    return;
  }
  let file = path.normalize(path.join(PUB, url === '/' ? 'index.html' : url));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

if (require.main === module) server.listen(PORT, () => console.log('Allégeance on http://localhost:' + PORT));
module.exports = { server, engine };
