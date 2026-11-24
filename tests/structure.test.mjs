/**
 * Structural checks for every simulation definition and the translations.
 * Catches typos when adding or editing a simulation. Run with:  npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from './harness.mjs';

const app = loadApp();
const both = o => o && typeof o === 'object' && typeof o.pl === 'string' && typeof o.en === 'string';

test('interface translations: PL and EN have the same keys', () => {
  const pl = Object.keys(app.UI.pl).sort();
  const en = Object.keys(app.UI.en).sort();
  assert.deepEqual(en, pl);
});

test('simulation ids are unique and sections exist', () => {
  const ids = app.SIMS.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id');
  const secs = new Set(app.SECTIONS.map(s => s.id));
  for (const s of app.SIMS) assert.ok(secs.has(s.sec), `${s.id}: unknown section "${s.sec}"`);
  for (const sec of secs)
    assert.ok(
      app.SIMS.some(s => s.sec === sec),
      `section ${sec} has no simulations`
    );
});

for (const sm of app.SIMS) {
  test(`simulation "${sm.id}" is well-formed`, () => {
    assert.ok(both(sm.n), 'name n must be L(pl, en)');
    assert.ok(both(sm.d), 'description d must be L(pl, en)');
    assert.equal(typeof sm.draw, 'function', 'draw() is required');
    for (const q of sm.params) {
      assert.ok(q.k, 'param needs a key k');
      assert.ok(both(q.l), `param ${q.k}: label l must be L(pl, en)`);
      if (q.type === 'sel')
        assert.ok(
          q.o.some(o => String(o[0]) === String(q.v)),
          `param ${q.k}: default not in options`
        );
      else if (q.type !== 'chk') {
        assert.ok(q.min <= q.v && q.v <= q.max, `param ${q.k}: default ${q.v} outside [${q.min}, ${q.max}]`);
        assert.ok(q.step > 0, `param ${q.k}: step must be > 0`);
      }
    }
    if (sm.task) {
      assert.ok(both(sm.task.q), 'task.q must be L(pl, en)');
      assert.ok(sm.task.a >= 0 && sm.task.a < sm.task.o.length, 'task.a must index an option');
      assert.ok(both(sm.task.ex), 'task.ex must be L(pl, en)');
    }
    // init + a few steps + readouts must not throw
    const p = Object.fromEntries(sm.params.map(q => [q.k, q.v]));
    const s = { t: 0, hist: [] };
    if (sm.init) sm.init(s, p);
    for (let i = 0; i < 30 && sm.step; i++) {
      sm.step(s, p, sm.dt || 1 / 240);
      s.t += sm.dt || 1 / 240;
    }
    if (sm.read) for (const r of sm.read(s, p)) assert.ok(r.length >= 2, 'readout must be [label, value, …]');
  });
}
