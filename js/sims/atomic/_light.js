/**
 * Fizyka atomowa / Atomic physics — Wavelength (nm) → visible RGB colour.
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function wlColor(nm, a) {
  let r = 0,
    g = 0,
    b = 0;
  if (nm < 380) {
    r = 0.5;
    g = 0;
    b = 1;
  } else if (nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else r = 1;
  let f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (780 - nm)) / 80 : 1;
  if (nm < 380) f = 0.6;
  f = clamp(f, 0.2, 1);
  return `rgba(${Math.round(255 * r * f)},${Math.round(255 * g * f)},${Math.round(255 * b * f)},${a == null ? 1 : a})`;
}
