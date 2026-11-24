/**
 * Physics checks: simulation results must agree with reference formulas
 * (project requirement: "Symulacje muszą mieć testy porównujące wyniki
 * z obliczeniami wzorcowymi"). Run with:  npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApp, run } from './harness.mjs';

const app = loadApp();
const close = (actual, expected, relTol, msg) =>
  assert.ok(
    Math.abs(actual - expected) <= Math.abs(expected) * relTol,
    `${msg}: got ${actual}, expected ${expected} (±${relTol * 100}%)`
  );

test('free fall in vacuum: t = √(2h/g), independent of mass', () => {
  const { s, p } = run(app, 'fall', { h: 45, g: 9.81, air: false, m1: 5, m2: 0.1 });
  const t = Math.sqrt((2 * p.h) / p.g);
  close(s.t1, t, 0.01, 'ball 1 fall time');
  close(s.t2, t, 0.01, 'ball 2 fall time');
});

test('free fall with air resistance: the lighter ball lands later', () => {
  const { s } = run(app, 'fall', { h: 45, air: true, m1: 5, m2: 0.1 });
  assert.ok(s.t2 > s.t1 * 1.1, `t2=${s.t2} should be clearly larger than t1=${s.t1}`);
});

test('vertical throw: h_max = v₀²/(2g)', () => {
  const { s, p } = run(app, 'vthrow', { v0: 15, h0: 0, g: 9.81 });
  close(s.top[1], (p.v0 * p.v0) / (2 * p.g), 0.005, 'max height');
});

test('projectile: range at 45° = v₀²/g', () => {
  const { s, p } = run(app, 'proj', { v0: 20, ang: 45, h0: 0, g: 9.81 });
  close(s.x, (p.v0 * p.v0) / p.g, 0.01, 'range');
});

test('pendulum (small angle): T ≈ 2π√(l/g), independent of mass', () => {
  for (const m of [0.2, 4]) {
    const { s, p } = run(app, 'pend', { L: 1.5, th0: 3, m, b: 0 }, { maxT: 8 });
    close(s.Tm, 2 * Math.PI * Math.sqrt(p.L / p.g), 0.005, `period (m=${m})`);
  }
});

test('mass on a spring: T = 2π√(m/k)', () => {
  const { s, p } = run(app, 'springosc', { m: 1, k: 40, A: 0.15, b: 0 }, { maxT: 5 });
  close(s.Tm, 2 * Math.PI * Math.sqrt(p.m / p.k), 0.005, 'period');
});

test('skate track without friction conserves mechanical energy', () => {
  const sm = app.simById.track;
  const { s, p } = run(app, 'track', { mu: 0, h: 4, m: 2 }, { maxT: 6 });
  const e = sm.en(s, p);
  close(e.Ek + e.Ep, p.m * 9.81 * p.h, 0.01, 'total mechanical energy');
  close(s.vmax, Math.sqrt(2 * 9.81 * p.h), 0.01, 'max speed √(2gh)');
});

test('Newton 2: kinetic-friction acceleration a = (F − μk·mg)/m', () => {
  const { s, p } = run(app, 'newton2', { m: 5, F: 30, surf: 'wood', mode: 'const' }, { maxT: 1 });
  close(s.a, (p.F - 0.3 * p.m * 9.81) / p.m, 0.001, 'acceleration');
});

test('Newton 3: total momentum stays zero', () => {
  const { s, p } = run(app, 'newton3', { m1: 80, m2: 40, F: 200, tp: 0.5 }, { maxT: 2 });
  assert.ok(Math.abs(p.m1 * s.v1 + p.m2 * s.v2) < 1e-6, 'p₁ + p₂ = 0');
});

test("Ohm's law and equivalent resistance", () => {
  const ohm = app.simById.ohm.read({ E: 0, t: 0 }, { U: 6, R: 20 });
  close(ohm[1][1], 0.3, 1e-9, 'I = U/R');
  const c = app.simById.circuit;
  close(c.calc({ mode: 'ser', n: 3, U: 12, R: 30 }).Rz, 90, 1e-9, 'series');
  close(c.calc({ mode: 'par', n: 3, U: 12, R: 30 }).Rz, 10, 1e-9, 'parallel');
});

test('thin lens: object at 2f gives a real, inverted, same-size image at 2f', () => {
  const im = app.simById.lens.img({ type: 'conv', f: 15, x: 30, h: 5 });
  close(im.y, 30, 1e-9, 'image distance');
  close(im.m, -1, 1e-9, 'magnification');
});

test("refraction: Snell's law and critical angle", () => {
  const k = app.simById.refr.calc({ n1: 1, n2: 1.5, a: 30 });
  close(Math.sin(k.b), Math.sin(30 * (Math.PI / 180)) / 1.5, 1e-9, 'sin β');
  const g = app.simById.refr.calc({ n1: 1.5, n2: 1, a: 50 });
  assert.equal(g.tir, true, 'total internal reflection above the critical angle');
  close(g.crit, (Math.asin(1 / 1.5) * 180) / Math.PI, 1e-9, 'critical angle');
});

test('heat balance reaches the theoretical final temperature', () => {
  const { s, p, sm } = run(app, 'mix', { m1: 1, T1: 20, c2: '4190', m2: 1, T2: 80 }, { maxT: 2000 });
  close(sm.Tk(p), 50, 1e-9, 'theoretical Tk');
  close(s.T1, 50, 0.005, 'simulated T₁');
});

test('radioactive decay follows N₀·2^(−t/T½) on average', () => {
  const { s, p } = run(app, 'decay', { N0: 2500, T: 5 }, { maxT: 5 });
  close(s.N, p.N0 / 2, 0.08, 'N after one half-life');
});

test('photoelectric effect: Ek = hf − W, none below threshold', () => {
  const sm = app.simById.photo;
  close(sm.Ef({ lam: 400 }), 1239.84 / 400, 1e-9, 'photon energy');
  const below = run(app, 'photo', { lam: 700, I: 100, W: '2.28' }, { maxT: 3 });
  assert.equal(below.s.cnt.length, 0, 'no electrons below threshold');
});
