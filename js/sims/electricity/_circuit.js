/**
 * Elektryczność / Electricity — Circuit drawing helpers: wires, moving electrons, battery, resistor, meters, bulbs.
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function pathLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

function pathAt(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= l) {
      const u = d / l;
      return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
    }
    d -= l;
  }
  return pts[pts.length - 1];
}

function wire(c, pts, color, w) {
  c.save();
  c.strokeStyle = col(color || 'obj');
  c.lineWidth = w || 2.5;
  c.lineJoin = 'round';
  c.beginPath();
  pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
  c.stroke();
  c.restore();
}

function electrons(c, pts, q, spacing) {
  const L = pathLen(pts);
  const off = ((q % spacing) + spacing) % spacing;
  for (let d = off; d < L; d += spacing) {
    const [x, y] = pathAt(pts, d);
    circle(c, x, y, 3, 'c6');
  }
}

function battery(c, x, y, vert, lab) {
  c.save();
  c.fillStyle = C.scene;
  if (vert) c.fillRect(x - 22, y - 12, 44, 24);
  else c.fillRect(x - 12, y - 22, 24, 44);
  c.restore();
  if (vert) {
    line(c, x - 20, y - 6, x + 20, y - 6, 'obj', 3);
    line(c, x - 11, y + 6, x + 11, y + 6, 'obj', 6);
    text(c, '+', x + 26, y - 8, { size: 13, weight: 700, color: 'c4' });
    text(c, '−', x + 26, y + 8, { size: 13, weight: 700, color: 'c1' });
  } else {
    line(c, x - 6, y - 20, x - 6, y + 20, 'obj', 3);
    line(c, x + 6, y - 11, x + 6, y + 11, 'obj', 6);
  }
  if (lab) text(c, lab, x - 30, y, { align: 'right', size: 12, weight: 650, color: 'muted' });
}

function resistor(c, x, y, w, lab, vert) {
  c.save();
  c.fillStyle = C.scene;
  if (vert) {
    c.fillRect(x - 10, y - w / 2, 20, w);
    rrect(c, x - 9, y - w / 2, 18, w, 3, alpha(C.c2, 0.18), 'c2', 2);
  } else {
    c.fillRect(x - w / 2, y - 10, w, 20);
    rrect(c, x - w / 2, y - 9, w, 18, 3, alpha(C.c2, 0.18), 'c2', 2);
  }
  c.restore();
  if (lab)
    text(c, lab, vert ? x + 18 : x, vert ? y : y - 20, {
      align: vert ? 'left' : 'center',
      size: 12,
      weight: 650,
      color: 'c2',
    });
}

function meter(c, x, y, L, val, colr) {
  circle(c, x, y, 19, 'scene', colr, 2.5);
  text(c, L, x, y, { align: 'center', size: 15, weight: 800, color: colr });
  if (val != null)
    text(c, val, x, y + 33, { align: 'center', size: 12, weight: 700, color: colr, mono: true, halo: true });
}

function bulb(c, x, y, br, lab) {
  const b = clamp(br, 0, 1.4);
  if (b > 0.02) {
    const g = c.createRadialGradient(x, y, 4, x, y, 46 * b + 8);
    g.addColorStop(0, 'rgba(255,214,90,' + Math.min(0.9, b * 0.75) + ')');
    g.addColorStop(1, 'rgba(255,214,90,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, 46 * b + 8, 0, 7);
    c.fill();
  }
  circle(
    c,
    x,
    y,
    14,
    b > 0.02
      ? `rgba(255,${200 + Math.round(40 * Math.min(b, 1))},${90},${0.35 + 0.6 * Math.min(b, 1)})`
      : 'scene',
    'obj',
    2
  );
  line(c, x - 9, y - 9, x + 9, y + 9, 'obj', 1.5);
  line(c, x - 9, y + 9, x + 9, y - 9, 'obj', 1.5);
  if (lab) text(c, lab, x, y + 26, { align: 'center', size: 11, color: 'muted' });
}
