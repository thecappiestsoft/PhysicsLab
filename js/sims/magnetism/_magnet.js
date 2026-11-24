/**
 * Magnetyzm / Magnetism — Magnet and compass drawing helpers.
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function compass(c, x, y, r, ang, dim) {
  c.save();
  c.translate(x, y);
  circle(c, 0, 0, r + 2, dim ? null : alpha(C.paper, 0.85), C.line, 1);
  c.rotate(ang);
  c.beginPath();
  c.moveTo(r, 0);
  c.lineTo(0, r * 0.28);
  c.lineTo(0, -r * 0.28);
  c.closePath();
  c.fillStyle = C.c4;
  c.fill();
  c.beginPath();
  c.moveTo(-r, 0);
  c.lineTo(0, r * 0.28);
  c.lineTo(0, -r * 0.28);
  c.closePath();
  c.fillStyle = C.dark ? '#b8c2cc' : '#8796a5';
  c.fill();
  c.restore();
  circle(c, x, y, 1.8, 'obj');
}

function magnetDraw(c, x, y, len, wid, ang, flip) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  const nC = flip ? C.c1 : C.c4,
    sC = flip ? C.c4 : C.c1;
  c.fillStyle = nC;
  c.fillRect(0, -wid / 2, len / 2, wid);
  c.fillStyle = sC;
  c.fillRect(-len / 2, -wid / 2, len / 2, wid);
  c.strokeStyle = alpha('#000000', 0.3);
  c.strokeRect(-len / 2, -wid / 2, len, wid);
  c.fillStyle = '#fff';
  c.font = '800 15px ' + getFont();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(flip ? 'S' : 'N', len / 4, 0);
  c.fillText(flip ? 'N' : 'S', -len / 4, 0);
  c.restore();
}
