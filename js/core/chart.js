/**
 * PhysicsLab core — Lightweight line/scatter chart renderer.
 */
'use strict';

function niceStep(range, n) {
  const raw = range / n,
    p = Math.pow(10, Math.floor(Math.log10(raw))),
    m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}
function drawChart(cv, spec) {
  const h = 260;
  const { c, w } = fitCanvas(cv, h);
  c.clearRect(0, 0, w, h);
  c.fillStyle = C.paper;
  c.fillRect(0, 0, w, h);
  if (!spec || !spec.ser) {
    return;
  }
  const pad = { l: 58, r: 16, t: 30, b: 40 };
  let xs = [],
    ys = [];
  spec.ser.forEach(s =>
    s.pts.forEach(p => {
      if (isFinite(p[0]) && isFinite(p[1])) {
        xs.push(p[0]);
        ys.push(p[1]);
      }
    })
  );
  let x0 = spec.xmin != null ? spec.xmin : Math.min(0, ...xs),
    x1 = spec.xmax != null ? spec.xmax : Math.max(...xs, x0 + 1),
    y0 = spec.ymin != null ? spec.ymin : Math.min(0, ...ys),
    y1 = spec.ymax != null ? spec.ymax : Math.max(...ys, 0);
  if (!xs.length) {
    x0 = spec.xmin != null ? spec.xmin : 0;
    x1 = spec.xmax != null ? spec.xmax : 1;
    if (spec.ymin == null) y0 = 0;
    if (spec.ymax == null) y1 = 1;
  }
  if (y1 - y0 < 1e-9) {
    y1 += 1;
    y0 -= y0 < 0 ? 1 : 0;
  }
  if (spec.ymax == null) {
    const r = y1 - y0;
    y1 += r * 0.08;
    if (y0 < 0 && spec.ymin == null) y0 -= r * 0.08;
  }
  if (x1 - x0 < 1e-9) x1 = x0 + 1;
  const X = v => pad.l + ((v - x0) / (x1 - x0)) * (w - pad.l - pad.r),
    Y = v => h - pad.b - ((v - y0) / (y1 - y0)) * (h - pad.t - pad.b);
  c.font = '11px ' + getFont();
  const xsN = niceStep(x1 - x0, Math.max(3, Math.floor((w - pad.l) / 90))),
    ysN = niceStep(y1 - y0, 5);
  c.strokeStyle = C.line2;
  c.lineWidth = 1;
  for (let v = Math.ceil(x0 / xsN) * xsN; v <= x1 + 1e-9; v += xsN) {
    const x = Math.round(X(v)) + 0.5;
    c.beginPath();
    c.moveTo(x, pad.t);
    c.lineTo(x, h - pad.b);
    c.stroke();
    text(c, fmt(+v.toPrecision(6), xsN < 1 ? (xsN < 0.1 ? 2 : 1) : 0), x, h - pad.b + 13, {
      align: 'center',
      size: 11,
      color: 'muted',
    });
  }
  for (let v = Math.ceil(y0 / ysN) * ysN; v <= y1 + 1e-9; v += ysN) {
    const y = Math.round(Y(v)) + 0.5;
    c.beginPath();
    c.moveTo(pad.l, y);
    c.lineTo(w - pad.r, y);
    c.stroke();
    text(c, fmt(+v.toPrecision(6), ysN < 1 ? (ysN < 0.1 ? (ysN < 0.01 ? 3 : 2) : 1) : 0), pad.l - 7, y, {
      align: 'right',
      size: 11,
      color: 'muted',
    });
  }
  if (y0 < 0 && y1 > 0) line(c, pad.l, Y(0), w - pad.r, Y(0), 'faint', 1.2);
  line(c, pad.l, h - pad.b, w - pad.r, h - pad.b, 'muted', 1.2);
  line(c, pad.l, pad.t, pad.l, h - pad.b, 'muted', 1.2);
  text(c, spec.xl || '', w - pad.r, h - 8, { align: 'right', size: 12, weight: 650, color: 'muted' });
  text(c, spec.yl || '', pad.l - 50, 14, { align: 'left', size: 12, weight: 650, color: 'muted' });
  c.save();
  c.beginPath();
  c.rect(pad.l, pad.t - 4, w - pad.l - pad.r, h - pad.t - pad.b + 8);
  c.clip();
  spec.ser.forEach(s => {
    const cc = col(s.c || 'c1');
    if (s.dots) {
      s.pts.forEach(p => {
        circle(c, X(p[0]), Y(p[1]), 4.5, cc, C.paper, 1.5);
      });
    }
    if (!s.dots || s.line) {
      c.strokeStyle = cc;
      c.lineWidth = s.w || 2.2;
      c.setLineDash(s.dash || []);
      c.lineJoin = 'round';
      c.beginPath();
      let st = false;
      s.pts.forEach(p => {
        if (!isFinite(p[1])) {
          st = false;
          return;
        }
        const x = X(p[0]),
          y = Y(p[1]);
        if (!st) {
          c.moveTo(x, y);
          st = true;
        } else c.lineTo(x, y);
      });
      c.stroke();
      c.setLineDash([]);
    }
  });
  if (spec.vline != null) line(c, X(spec.vline), pad.t, X(spec.vline), h - pad.b, 'faint', 1, [4, 4]);
  if (spec.marker) {
    const m = spec.marker;
    circle(c, X(m[0]), Y(m[1]), 6, col(m[2] || 'c4'), C.paper, 2);
  }
  c.restore();
  if (spec.ser.length > 1 || (spec.ser[0] && spec.ser[0].n)) {
    legend(
      c,
      spec.ser.filter(s => s.n).map(s => [tr(s.n), s.c || 'c1']),
      pad.l + 6,
      12
    );
  }
}
