'use strict';
/* The Allégeance engine, run on the server.
 *
 * The rules live in one place: the <script> of public/index.html. The server runs that same script
 * in a Node `vm` context with a stand-in for the page (a "stub DOM"), flagged `window.HEADLESS`,
 * so the page draws nothing, and the server resolves a turn with exactly the code the browser runs.
 * (Phase 2 will pull this script out into a separate engine file; see docs/PLAN.md.)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// A universal stand-in: any property is another stand-in, any call returns one, and it behaves
// as 0 / '' when used as a number or a string. Enough for code that only pokes at the page.
function stub() {
  const target = function () {};
  const handler = {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
      if (prop === 'valueOf') return () => 0;
      if (prop === 'toString') return () => '';
      if (prop === 'length') return 0;
      if (prop === 'then') return undefined;
      if (prop === 'style' || prop === 'classList' || prop === 'dataset') return stub();
      return stub();
    },
    set() { return true; },
    apply() { return stub(); },
    construct() { return stub(); },
    has() { return true; },
  };
  return new Proxy(target, handler);
}

function createEngine(htmlPath) {
  htmlPath = htmlPath || path.join(__dirname, '..', 'public', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const open = html.indexOf('<script>');
  const close = html.lastIndexOf('</script>');
  if (open < 0 || close < 0) throw new Error('no <script> in ' + htmlPath);
  const code = html.slice(open + '<script>'.length, close);

  const document = {
    createElement: () => stub(), getElementById: () => stub(), querySelector: () => stub(),
    querySelectorAll: () => [], addEventListener() {}, body: stub(), documentElement: stub(),
    fonts: undefined,
  };
  const sandbox = {
    document, HEADLESS: true,
    console, Math, JSON, Date, Object, Array, Set, Map, String, Number, Boolean, RegExp, Error,
    URLSearchParams, Float32Array, Float64Array, Int8Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array,
    Uint8ClampedArray, parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, undefined,
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    addEventListener() {}, removeEventListener() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    devicePixelRatio: 1, innerWidth: 1200, innerHeight: 800,
    location: { search: '', href: '' }, navigator: { userAgent: 'node' },
    fetch: () => Promise.reject(new Error('no network in the engine')),
    performance: { now: () => Date.now() },
  };
  sandbox.window = sandbox;                       // the page's globals and `window` are one object
  const window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(code, context, { filename: 'public/index.html', timeout: 60000 });
  const SB = window.SB;
  if (!SB || !SB.dump || !SB.load) throw new Error('the page script does not expose SB.dump / SB.load');

  return {
    SB,
    // the state of a fresh game
    initial() { SB.reset(); return SB.dump(); },
    // resolve one turn from a saved game (orders included) and return the new game
    run(state) {
      SB.load(state);
      SB.run();
      return { state: SB.dump(), digest: SB.digest(), report: SB.report() };
    },
    digestOf(state) { SB.load(state); return SB.digest(); },
  };
}

module.exports = { createEngine, stub };
