'use strict';
// Node-only check: the engine loads, plays 3 turns deterministically, and the server API answers.
const assert = require('assert');
const http = require('http');
const { server, engine } = require('../server');

const a = JSON.stringify(engine.initial());
const copy = () => JSON.parse(a);
let s = copy(), digs = [];
for (let i = 0; i < 3; i++) { const r = engine.run(s); s = r.state; digs.push(r.digest); }
assert.strictEqual(digs[2].turn, 4, 'three turns played');
const again = engine.run(engine.run(engine.run(copy()).state).state).digest;
assert.deepStrictEqual(again, digs[2], 'the engine is deterministic');

server.listen(0, async () => {
  const port = server.address().port;
  const call = (method, p, body) => new Promise((ok, ko) => {
    const r = http.request({ port, path: p, method, headers: { 'Content-Type': 'application/json' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => ok({ code: res.statusCode, body: d }));
    }); r.on('error', ko); if (body) r.write(JSON.stringify(body)); r.end();
  });
  try {
    assert.strictEqual((await call('GET', '/api/health')).code, 200);
    assert.strictEqual((await call('PUT', '/api/game', { state: copy() })).code, 200);
    const run = JSON.parse((await call('POST', '/api/run')).body);
    assert.deepStrictEqual(run.digest, JSON.parse(JSON.stringify(digs[0])), 'server run equals engine run');
    assert.strictEqual((await call('GET', '/')).code, 200);
    console.log('smoke test OK; turn 2 digest', JSON.stringify(run.digest).slice(0, 80));
  } catch (e) { console.error(e); process.exitCode = 1; }
  server.close();
});
