/**
 * PhysicsLab core — Number formatting (locale-aware decimal separator) and math helpers.
 */
'use strict';

function fmt(v, d) {
  if (typeof v !== 'number') return v;
  if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
  if (d == null && Number.isInteger(v)) d = 0;
  if (d == null) {
    const a = Math.abs(v);
    d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 0.01 || a === 0 ? 3 : 4;
    if (a !== 0 && a < 1e-3) return v.toExponential(2).replace('-', '−');
  }
  let s = v.toFixed(d);
  if (lang === 'pl') s = s.replace('.', ',');
  return s.replace(/^-/, '−');
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const DEG = Math.PI / 180;
