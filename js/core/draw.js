/**
 * PhysicsLab core — Canvas drawing primitives: lines, arrows, text, shapes, energy bars, rulers.
 */
'use strict';

function fitCanvas(cv, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + 'px';
  }
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, w, h };
}
function col(k) {
  return C[k] || k;
}
function line(c, x1, y1, x2, y2, color, w, dash) {
  c.save();
  c.strokeStyle = col(color || 'ink');
  c.lineWidth = w || 1.5;
  if (dash) c.setLineDash(dash);
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  c.restore();
}
function arrow(c, x1, y1, x2, y2, color, label, o) {
  o = o || {};
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.hypot(dx, dy);
  if (len < 2) return;
  const cc = col(color);
  c.save();
  c.strokeStyle = cc;
  c.fillStyle = cc;
  c.lineWidth = o.w || 2.6;
  c.lineCap = 'round';
  if (o.dash) c.setLineDash(o.dash);
  const ux = dx / len,
    uy = dy / len,
    hs = Math.min(o.head || 11, len * 0.6);
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2 - ux * hs * 0.8, y2 - uy * hs * 0.8);
  c.stroke();
  c.setLineDash([]);
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - ux * hs - uy * hs * 0.45, y2 - uy * hs + ux * hs * 0.45);
  c.lineTo(x2 - ux * hs + uy * hs * 0.45, y2 - uy * hs - ux * hs * 0.45);
  c.closePath();
  c.fill();
  if (label) {
    c.font = '600 13px ' + getFont();
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    const lx = x2 + ux * 14 + (o.lx || 0),
      ly = y2 + uy * 14 + (o.ly || 0);
    c.lineWidth = 4;
    c.strokeStyle = C.scene;
    c.strokeText(label, lx, ly);
    c.fillText(label, lx, ly);
  }
  c.restore();
}
let _font = '';
function getFont() {
  if (!_font) _font = getComputedStyle(document.body).fontFamily;
  return _font;
}
function text(c, s, x, y, o) {
  o = o || {};
  c.save();
  c.font =
    (o.weight || 500) +
    ' ' +
    (o.size || 13) +
    'px ' +
    (o.mono ? 'ui-monospace,Consolas,monospace' : getFont());
  c.fillStyle = col(o.color || 'ink');
  c.textAlign = o.align || 'left';
  c.textBaseline = o.base || 'middle';
  if (o.halo) {
    c.lineWidth = 4;
    c.strokeStyle = C.scene;
    c.lineJoin = 'round';
    c.strokeText(s, x, y);
  }
  c.fillText(s, x, y);
  c.restore();
}
function rrect(c, x, y, w, h, r, fill, stroke, lw) {
  c.save();
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
  if (fill) {
    c.fillStyle = col(fill);
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = col(stroke);
    c.lineWidth = lw || 1.5;
    c.stroke();
  }
  c.restore();
}
function circle(c, x, y, r, fill, stroke, lw) {
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = col(fill);
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = col(stroke);
    c.lineWidth = lw || 1.5;
    c.stroke();
  }
  c.restore();
}
function bg(c, w, h, grid) {
  c.fillStyle = C.scene;
  c.fillRect(0, 0, w, h);
  if (grid !== false) {
    c.save();
    c.strokeStyle = C.grid;
    c.lineWidth = 1;
    const g = grid || 28;
    c.beginPath();
    for (let x = g; x < w; x += g) {
      c.moveTo(x + 0.5, 0);
      c.lineTo(x + 0.5, h);
    }
    for (let y = g; y < h; y += g) {
      c.moveTo(0, y + 0.5);
      c.lineTo(w, y + 0.5);
    }
    c.stroke();
    c.restore();
  }
}
function alpha(hex, a) {
  if (hex.startsWith('#')) {
    let h = hex.slice(1);
    if (h.length === 3)
      h = h
        .split('')
        .map(x => x + x)
        .join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return hex;
}
function legend(c, items, x, y) {
  let cx = x;
  c.save();
  c.font = '600 12px ' + getFont();
  items.forEach(([lab, colr]) => {
    c.fillStyle = col(colr);
    c.fillRect(cx, y - 5, 12, 10);
    c.fillStyle = C.muted;
    c.textBaseline = 'middle';
    c.fillText(lab, cx + 17, y);
    cx += c.measureText(lab).width + 34;
  });
  c.restore();
}
/* bars: energy bars etc. items [[label,value,colour]] */
function bars(c, x, y, w, h, items, max, title) {
  rrect(c, x, y, w, h, 10, alpha(C.paper, C.dark ? 0.85 : 0.9), C.line, 1);
  if (title) text(c, title, x + w / 2, y + 14, { align: 'center', size: 12, weight: 650, color: 'muted' });
  const n = items.length,
    bw = Math.min(34, (w - 20) / n - 10),
    top = y + 30,
    bot = y + h - 34,
    gap = (w - n * bw) / (n + 1);
  max = max || 1;
  items.forEach(([lab, v, cc], i) => {
    const bx = x + gap + i * (bw + gap);
    const bh = clamp(v / max, 0, 1.02) * (bot - top);
    rrect(c, bx, bot - bh, bw, Math.max(bh, 0.5), 4, cc);
    text(c, lab, bx + bw / 2, bot + 12, { align: 'center', size: 12, weight: 650, color: cc });
    text(c, fmt(v, v >= 100 ? 0 : 1), bx + bw / 2, bot + 25, {
      align: 'center',
      size: 10.5,
      color: 'muted',
      mono: true,
    });
  });
  line(c, x + 8, bot, x + w - 8, bot, 'line', 1);
}
function ruler(c, x0, y, x1, m0, m1, stepM, unit) {
  line(c, x0, y, x1, y, 'muted', 1.2);
  const sc = (x1 - x0) / (m1 - m0);
  for (let m = Math.ceil(m0 / stepM) * stepM; m <= m1 + 1e-9; m += stepM) {
    const x = x0 + (m - m0) * sc;
    line(c, x, y, x, y + 6, 'muted', 1.2);
    text(c, fmt(+m.toFixed(6), Math.abs(stepM) < 1 ? 1 : 0), x, y + 16, {
      align: 'center',
      size: 11,
      color: 'muted',
    });
  }
  if (unit) text(c, unit, x1 + 6, y + 16, { size: 11, color: 'muted' });
}
