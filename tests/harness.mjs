/**
 * Test harness: loads the PhysicsLab scripts (everything except js/core/app.js)
 * into a Node `vm` context with a minimal browser stub, so simulation models can
 * be stepped and checked against reference formulas without a browser.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = root;

/** Script paths in the order index.html loads them. */
export function scriptList() {
  const html = readFileSync(join(src, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
}

export function loadApp() {
  const files = scriptList().filter(f => !f.endsWith('core/app.js'));
  const el = () => ({
    style: {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    setAttribute() {},
  });
  const sandbox = {
    console,
    window: { matchMedia: () => ({ matches: false }), devicePixelRatio: 1, addEventListener() {} },
    localStorage: { getItem: () => null, setItem() {} },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      documentElement: { dataset: {}, lang: 'pl' },
      body: el(),
      addEventListener() {},
      createElement: el,
    },
    getComputedStyle: () => ({ getPropertyValue: () => '#000000', fontFamily: 'sans-serif' }),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    performance: { now: () => 0 },
    location: { hash: '' },
    matchMedia: () => ({ matches: false }),
  };
  sandbox.globalThis = sandbox;
  const code =
    files.map(f => readFileSync(join(src, f), 'utf8')).join('\n;\n') +
    '\n;globalThis.__app={SIMS,simById,SECTIONS,UI,E,fmt,L,tr,setLangForTest:l=>{lang=l}};';
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'physicslab-bundle.js' });
  return sandbox.__app;
}

/** Run a simulation headlessly. Returns the final state. */
export function run(app, id, params = {}, { maxT = 60, until } = {}) {
  const sm = app.simById[id];
  const p = Object.assign(Object.fromEntries(sm.params.map(q => [q.k, q.v])), params);
  const s = { t: 0, hist: [] };
  if (sm.init) sm.init(s, p);
  const h = sm.dt || 1 / 240;
  while (sm.step && s.t < maxT && !s.done) {
    sm.step(s, p, h);
    s.t += h;
    if (until && until(s, p)) break;
  }
  return { s, p, sm };
}
