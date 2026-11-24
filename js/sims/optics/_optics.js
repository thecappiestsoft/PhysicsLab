/**
 * Optyka / Optics — Factory shared by the lens and mirror simulations (thin-lens / mirror equation, ray tracing, image features).
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function opticsSim(kind) {
  return {
    drag: true,
    live: true,
    fval(p) {
      if (kind === 'lens') return p.type === 'conv' ? p.f : -p.f;
      if (p.type === 'plane') return Infinity;
      return p.type === 'concave' ? p.f : -p.f;
    },
    img(p) {
      const f = this.fval(p);
      if (!isFinite(f)) return { y: -p.x, m: 1 };
      const den = 1 / f - 1 / p.x;
      if (Math.abs(den) < 1e-6) return { y: Infinity, m: Infinity };
      const y = 1 / den;
      return { y, m: -y / p.x };
    },
    draw(c, w, h, s, p) {
      bg(c, w, h);
      const sc = w / 150,
        cx = kind === 'lens' ? w * 0.5 : w * 0.78,
        cy = h * 0.52,
        f = this.fval(p);
      const Xi = d => cx + d * sc,
        X = d => (kind === 'lens' ? cx + d * sc : cx - d * sc);
      line(c, 10, cy, w - 10, cy, 'muted', 1.2);
      if (kind === 'lens') {
        const H = h * 0.36;
        c.save();
        c.fillStyle = alpha(C.c6, 0.18);
        c.strokeStyle = C.c6;
        c.lineWidth = 2;
        c.beginPath();
        if (p.type === 'conv') {
          c.ellipse(cx, cy, 12, H, 0, 0, 7);
        } else {
          c.moveTo(cx - 14, cy - H);
          c.lineTo(cx + 14, cy - H);
          c.quadraticCurveTo(cx + 2, cy, cx + 14, cy + H);
          c.lineTo(cx - 14, cy + H);
          c.quadraticCurveTo(cx - 2, cy, cx - 14, cy - H);
        }
        c.fill();
        c.stroke();
        c.restore();
        [-1, 1].forEach(sg => {
          [1, 2].forEach(m => {
            const x = cx + sg * m * Math.abs(f) * sc;
            if (x > 10 && x < w - 10) {
              circle(c, x, cy, 3.5, 'ink');
              text(c, (m === 2 ? '2' : '') + (sg < 0 ? 'F' : 'F′'), x, cy + 16, {
                align: 'center',
                size: 11,
                weight: 650,
                color: 'muted',
              });
            }
          });
        });
      } else {
        const H = h * 0.38;
        c.save();
        c.strokeStyle = C.c6;
        c.lineWidth = 4;
        c.beginPath();
        if (p.type === 'plane') {
          c.moveTo(cx, cy - H);
          c.lineTo(cx, cy + H);
        } else {
          const R = 2 * Math.abs(f) * sc;
          const bend = p.type === 'concave' ? 1 : -1;
          const a = Math.asin(Math.min(1, H / R));
          c.arc(cx - bend * R, cy, R, bend > 0 ? -a : Math.PI - a, bend > 0 ? a : Math.PI + a);
        }
        c.stroke();
        c.restore();
        c.save();
        c.strokeStyle = alpha(C.muted, 0.5);
        c.lineWidth = 1;
        for (let y = cy - H + 6; y < cy + H; y += 10) {
          const off =
            p.type === 'plane'
              ? 0
              : (p.type === 'concave' ? 1 : -1) *
                (2 * Math.abs(f) * sc - Math.sqrt(Math.max(0, (2 * Math.abs(f) * sc) ** 2 - (y - cy) ** 2)));
          c.beginPath();
          c.moveTo(cx + off + 3, y);
          c.lineTo(cx + off + 10, y - 6);
          c.stroke();
        }
        c.restore();
        if (isFinite(f)) {
          [1, 2].forEach(m => {
            const x = cx - (f > 0 ? 1 : -1) * m * Math.abs(f) * sc;
            if (x > 10 && x < w - 10) {
              circle(c, x, cy, 3.5, 'ink');
              text(c, m === 2 ? 'C' : 'F', x, cy + 16, {
                align: 'center',
                size: 11,
                weight: 650,
                color: 'muted',
              });
            }
          });
        }
      }
      const ox = Xi(-p.x),
        oh = p.h * sc;
      arrow(c, ox, cy, ox, cy - oh, 'c2', lang === 'pl' ? 'przedmiot' : 'object', { w: 4, ly: -4 });
      const im = this.img(p);
      const rays = [];
      const P = [-p.x, p.h];
      rays.push([0, p.h]);
      rays.push([-p.h / p.x, 0]);
      if (isFinite(f) && Math.abs(p.x - f) > 0.6) {
        const u = -p.h / (p.x - f);
        rays.push([u, p.h + u * p.x]);
      }
      const cols = ['c1', 'c3', 'c5'];
      rays.forEach((r, i) => {
        const u = r[0],
          yl = r[1];
        const uo = isFinite(f) ? u - yl / f : u;
        const A = [Xi(-p.x), cy - p.h * sc],
          B = [cx, cy - yl * sc];
        line(c, A[0], A[1], B[0], B[1], cols[i], 2);
        const far = 200;
        const Cc = [X(far), cy - (yl + uo * far) * sc];
        line(c, B[0], B[1], Cc[0], Cc[1], cols[i], 2);
        if (im.y < 0 || !isFinite(im.y)) {
          if (isFinite(im.y)) {
            const back = [X(im.y), cy - (yl + uo * im.y) * sc];
            line(c, B[0], B[1], back[0], back[1], cols[i], 1.3, [5, 5]);
          }
        }
      });
      if (isFinite(im.y) && Math.abs(im.y) < 400) {
        const ix = X(im.y),
          ih = im.m * p.h * sc;
        arrow(c, ix, cy, ix, cy - ih, 'c4', lang === 'pl' ? 'obraz' : 'image', {
          w: 3.5,
          dash: im.y < 0 ? [6, 4] : null,
          ly: ih > 0 ? -4 : 4,
        });
      } else if (!isFinite(im.y))
        text(
          c,
          lang === 'pl'
            ? 'przedmiot w ognisku — obraz w nieskończoności'
            : 'object at the focus — image at infinity',
          w / 2,
          24,
          { align: 'center', size: 13, weight: 650, color: 'c4' }
        );
      text(c, lang === 'pl' ? 'przeciągnij przedmiot' : 'drag the object', 16, h - 16, {
        size: 11,
        color: 'muted',
      });
    },
    down(s, p, x, y, w, h) {
      const sc = w / 150,
        cx = kind === 'lens' ? w * 0.5 : w * 0.78,
        ox = kind === 'lens' ? cx - p.x * sc : cx - p.x * sc;
      if (Math.abs(x - ox) < 24) {
        s.drag = true;
        return true;
      }
      return false;
    },
    move(s, p, x, y, w, h) {
      const sc = w / 150,
        cx = kind === 'lens' ? w * 0.5 : w * 0.78;
      p.x = Math.round(clamp((cx - x) / sc, 2, kind === 'lens' ? 70 : 110) * 2) / 2;
    },
    hover(s, p, x, y, w, h) {
      const sc = w / 150,
        cx = kind === 'lens' ? w * 0.5 : w * 0.78;
      return Math.abs(x - (cx - p.x * sc)) < 24;
    },
    read(s, p) {
      const im = this.img(p),
        f = this.fval(p);
      const inf = !isFinite(im.y);
      const feat = inf
        ? L('brak obrazu (w nieskończoności)', 'no image (at infinity)')
        : L(
            [
              im.y > 0 ? 'rzeczywisty' : 'pozorny',
              im.m < 0 ? 'odwrócony' : 'prosty',
              Math.abs(im.m) > 1.001
                ? 'powiększony'
                : Math.abs(im.m) < 0.999
                  ? 'pomniejszony'
                  : 'tej samej wielkości',
            ].join(', '),
            [
              im.y > 0 ? 'real' : 'virtual',
              im.m < 0 ? 'inverted' : 'upright',
              Math.abs(im.m) > 1.001 ? 'magnified' : Math.abs(im.m) < 0.999 ? 'diminished' : 'same size',
            ].join(', ')
          );
      const r = [
        [L('Odległość przedmiotu x', 'Object distance x'), p.x, 'cm', 1],
        [L('Odległość obrazu y', 'Image distance y'), inf ? '∞' : im.y, 'cm', 1],
        [L('Powiększenie p = |y/x|', 'Magnification m = |y/x|'), inf ? '∞' : Math.abs(im.m), '×', 2],
        [L('Wysokość obrazu', 'Image height'), inf ? '∞' : Math.abs(im.m * p.h), 'cm', 2],
        [L('Cechy obrazu', 'Image features'), feat, '', null, true],
      ];
      if (kind === 'lens')
        r.push([L('Zdolność skupiająca Z = 1/f', 'Optical power P = 1/f'), 100 / f, 'D', 2]);
      return r;
    },
    charts: [
      {
        name: L('y(x) — teoria', 'y(x) — theory'),
        fn: p => {
          const sm = simById[kind === 'lens' ? 'lens' : 'mirror'];
          const pts = [];
          for (let x = 1; x <= (kind === 'lens' ? 70 : 110); x += 0.25) {
            const y = sm.img(Object.assign({}, p, { x })).y;
            pts.push([x, Math.abs(y) > 300 ? NaN : y]);
          }
          const im = sm.img(p);
          return {
            xl: 'x [cm]',
            yl: 'y [cm]',
            ymin: -150,
            ymax: 150,
            ser: [{ c: 'c4', pts }],
            vline: isFinite(sm.fval(p)) ? Math.abs(sm.fval(p)) : null,
            marker: Math.abs(im.y) < 150 ? [p.x, im.y] : null,
          };
        },
      },
    ],
  };
}
