/**
 * Wspólne / Shared — Shared canvas drawing helpers used by several simulations (car, crate, ground, spring).
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function car(c, x, y, w, color, lab) {
  const h = w * 0.42;
  rrect(c, x - w / 2, y - h - 8, w, h, 7, color);
  rrect(c, x - w * 0.22, y - h - 8 - h * 0.55, w * 0.44, h * 0.62, 6, color);
  rrect(c, x - w * 0.16, y - h - 8 - h * 0.45, w * 0.32, h * 0.42, 4, alpha(C.scene, 0.85));
  circle(c, x - w * 0.28, y - 8, 8, 'obj');
  circle(c, x + w * 0.28, y - 8, 8, 'obj');
  circle(c, x - w * 0.28, y - 8, 3, 'scene');
  circle(c, x + w * 0.28, y - 8, 3, 'scene');
  if (lab) text(c, lab, x, y - h / 2 - 8, { align: 'center', size: 12, weight: 700, color: '#fff' });
}

function box(c, x, y, w, h, color, lab, ang) {
  c.save();
  c.translate(x, y);
  if (ang) c.rotate(ang);
  rrect(c, -w / 2, -h, w, h, 5, color, alpha('#000000', 0.25), 1.2);
  c.strokeStyle = alpha('#ffffff', 0.3);
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(-w / 2 + 5, -h + 5);
  c.lineTo(w / 2 - 5, -5);
  c.moveTo(w / 2 - 5, -h + 5);
  c.lineTo(-w / 2 + 5, -5);
  c.stroke();
  if (lab) {
    c.font = '700 13px ' + getFont();
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineWidth = 3;
    c.strokeStyle = alpha('#000000', 0.35);
    c.strokeText(lab, 0, -h / 2);
    c.fillText(lab, 0, -h / 2);
  }
  c.restore();
}

function ground(c, x0, x1, y) {
  line(c, x0, y, x1, y, 'obj', 2.5);
  c.save();
  c.strokeStyle = C.faint;
  c.lineWidth = 1;
  c.beginPath();
  for (let x = x0; x < x1; x += 12) {
    c.moveTo(x, y + 2);
    c.lineTo(x - 8, y + 10);
  }
  c.stroke();
  c.restore();
}

function spring(c, x1, y1, x2, y2, coils, wid, color) {
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.hypot(dx, dy),
    ux = dx / len,
    uy = dy / len,
    nx = -uy,
    ny = ux;
  c.save();
  c.strokeStyle = col(color || 'muted');
  c.lineWidth = 2;
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(x1, y1);
  const lead = Math.min(12, len * 0.1);
  c.lineTo(x1 + ux * lead, y1 + uy * lead);
  const n = coils * 2;
  for (let i = 1; i < n; i++) {
    const u = lead + ((len - 2 * lead) * i) / n,
      s = (i % 2 ? 1 : -1) * wid;
    c.lineTo(x1 + ux * u + nx * s, y1 + uy * u + ny * s);
  }
  c.lineTo(x2 - ux * lead, y2 - uy * lead);
  c.lineTo(x2, y2);
  c.stroke();
  c.restore();
}

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
