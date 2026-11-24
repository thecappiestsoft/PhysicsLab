/**
 * Termodynamika / Thermodynamics — Temperature colour scale and thermometer drawing helpers.
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function tempColor(T, a) {
  const u = clamp(T / 100, 0, 1);
  const r = Math.round(lerp(40, 230, u)),
    g = Math.round(lerp(120, 70, Math.abs(u - 0.5) * 2)),
    b = Math.round(lerp(230, 40, u));
  return `rgba(${r},${g},${b},${a == null ? 1 : a})`;
}

function thermo(c, x, y, hh, T, Tmin, Tmax, lab) {
  rrect(c, x - 7, y - hh, 14, hh, 7, 'paper', 'line', 1.5);
  const u = clamp((T - Tmin) / (Tmax - Tmin), 0, 1);
  rrect(c, x - 3.5, y - 6 - u * (hh - 12), 7, u * (hh - 12) + 6, 3.5, tempColor(T));
  circle(c, x, y + 6, 11, tempColor(T), 'line', 1.5);
  text(c, fmt(T, 1) + ' °C', x, y - hh - 12, { align: 'center', size: 12, weight: 700, mono: true });
  if (lab) text(c, lab, x, y + 26, { align: 'center', size: 11, color: 'muted' });
}
