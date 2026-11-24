/**
 * Dynamika / Dynamics — simulation `incline`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'incline',
  sec: 'dyn',
  n: L('Równia pochyła', 'Inclined plane'),
  d: L(
    'Zmieniaj kąt nachylenia, masę i podłoże. Zobacz składowe ciężaru, nacisk, tarcie i sprawdź, przy jakim kącie skrzynia zaczyna się zsuwać.',
    'Change the angle, mass and surface. See the weight components, normal force and friction, and find the angle at which the crate starts sliding.'
  ),
  params: [
    { k: 'ang', l: L('Kąt nachylenia α', 'Incline angle α'), min: 0, max: 60, step: 0.5, v: 30, u: '°' },
    { k: 'm', l: L('Masa m', 'Mass m'), min: 1, max: 20, step: 0.5, v: 5, u: 'kg' },
    { k: 'surf', type: 'sel', l: L('Podłoże', 'Surface'), o: SURF, v: 'wood' },
    { k: 'comp', type: 'chk', l: L('Pokaż składowe ciężaru', 'Show weight components'), v: true, live: true },
  ],
  init(s, p) {
    s.d = 0;
    s.v = 0;
    s.a = 0;
    const g = 9.81,
      a = p.ang * DEG,
      [ms, mk] = MU[p.surf];
    s.slides = Math.tan(a) > ms + 1e-9;
  },
  step(s, p, h) {
    const g = 9.81,
      a = p.ang * DEG,
      [ms, mk] = MU[p.surf];
    if (!s.slides) {
      s.a = 0;
      if (s.t > 3) s.done = true;
      return;
    }
    s.a = g * (Math.sin(a) - mk * Math.cos(a));
    if (s.a < 0) s.a = 0;
    s.v += s.a * h;
    s.d += s.v * h;
    if (s.d >= 4) {
      s.d = 4;
      s.done = true;
    }
  },
  sample: s => ({ v: s.v, d: s.d }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const a = p.ang * DEG,
      Lm = 4,
      base = h - 50;
    const sc = Math.min((w - 160) / (Lm * Math.cos(a) + 0.6), (h - 110) / (Lm * Math.sin(a) + 0.6));
    const x0 = w / 2 - (Lm * Math.cos(a) * sc) / 2,
      y0 = base - Lm * Math.sin(a) * sc,
      x1 = x0 + Lm * Math.cos(a) * sc;
    c.save();
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, base);
    c.lineTo(x0, base);
    c.closePath();
    c.fillStyle = alpha(C.muted, 0.18);
    c.fill();
    c.strokeStyle = C.obj;
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();
    ground(c, 20, w - 20, base);
    if (p.ang > 2) {
      c.save();
      c.strokeStyle = C.muted;
      c.beginPath();
      c.arc(x1, base, 46, Math.PI, Math.PI + a);
      c.stroke();
      c.restore();
      text(c, 'α', x1 - 58, base - 12, { size: 13, weight: 700, color: 'muted' });
    }
    const dd = s.d * sc + 40,
      bx = x0 + dd * Math.cos(a),
      by = y0 + dd * Math.sin(a);
    const bw = 54 + p.m,
      bh = 36 + p.m * 0.6;
    box(c, bx, by, bw, bh, 'c2', fmt(p.m, 1) + ' kg', a);
    const g = 9.81,
      N = p.m * g * Math.cos(a),
      Fp = p.m * g * Math.sin(a),
      [ms, mk] = MU[p.surf],
      T = s.slides ? mk * N : Fp;
    const k = 110 / (p.m * g);
    const cx = bx + (Math.sin(a) * bh) / 2,
      cy = by - (Math.cos(a) * bh) / 2;
    arrow(c, cx, cy, cx, cy + p.m * g * k, 'c5', 'Fg', { lx: 12 });
    if (p.comp) {
      arrow(c, cx, cy, cx + Fp * k * Math.cos(a), cy + Fp * k * Math.sin(a), 'c5', 'F∥', {
        dash: [5, 4],
        w: 2,
      });
      arrow(c, cx, cy, cx - N * k * Math.sin(a), cy + N * k * Math.cos(a), 'c5', 'F⊥', {
        dash: [5, 4],
        w: 2,
      });
    }
    const nx = bx + Math.sin(a) * bh,
      ny = by - Math.cos(a) * bh;
    arrow(c, nx, ny, nx + N * k * Math.sin(a), ny - N * k * Math.cos(a), 'c6', 'N');
    if (T > 0.01)
      arrow(
        c,
        bx - (Math.cos(a) * bw) / 2,
        by - (Math.sin(a) * bw) / 2,
        bx - Math.cos(a) * (bw / 2 + T * k),
        by - Math.sin(a) * (bw / 2 + T * k),
        'c4',
        lang === 'pl' ? 'T' : 'f'
      );
    text(
      c,
      s.slides
        ? lang === 'pl'
          ? 'skrzynia zsuwa się'
          : 'the crate slides'
        : lang === 'pl'
          ? 'skrzynia stoi — tarcie statyczne ją utrzymuje'
          : 'the crate stays — static friction holds it',
      16,
      20,
      { size: 13, weight: 650, color: s.slides ? 'c3' : 'muted' }
    );
  },
  read(s, p) {
    const g = 9.81,
      a = p.ang * DEG,
      [ms, mk] = MU[p.surf],
      N = p.m * g * Math.cos(a),
      Fp = p.m * g * Math.sin(a);
    return [
      [L('Ciężar Fg', 'Weight Fg'), p.m * g, 'N', 1],
      [L('Składowa równoległa F∥', 'Parallel component F∥'), Fp, 'N', 1],
      [L('Nacisk N', 'Normal force N'), N, 'N', 1],
      [L('Tarcie', 'Friction'), s.slides ? mk * N : Fp, 'N', 1],
      [L('Przyspieszenie a', 'Acceleration a'), s.a, 'm/s²'],
      [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
      [L('Kąt graniczny arctg μs', 'Critical angle arctan μs'), Math.atan(ms) / DEG, '°', 1],
      [L('Droga', 'Distance'), s.d, 'm'],
    ];
  },
  charts: [
    { name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
    {
      name: L('a(α) — teoria', 'a(α) — theory'),
      fn: p => {
        const [ms, mk] = MU[p.surf],
          pts = [];
        for (let d = 0; d <= 60; d += 0.5) {
          const a = d * DEG;
          pts.push([d, Math.tan(a) > ms ? 9.81 * (Math.sin(a) - mk * Math.cos(a)) : 0]);
        }
        return {
          xl: 'α [°]',
          yl: 'a [m/s²]',
          ser: [{ c: 'c1', pts }],
          marker: [
            p.ang,
            Math.tan(p.ang * DEG) > ms ? 9.81 * (Math.sin(p.ang * DEG) - mk * Math.cos(p.ang * DEG)) : 0,
          ],
        };
      },
    },
  ],
  f: [
    'F∥ = mg·sinα',
    'N = F⊥ = mg·cosα',
    L('a = g(sinα − μk·cosα)', 'a = g(sinα − μk·cosα)'),
    L('zsuwanie gdy tgα > μs', 'slides when tanα > μs'),
  ],
  model: L(
    'Równia o długości 4 m. Skrzynia startuje z odpoczynku. Tarcie statyczne μs i kinetyczne μk zależą od podłoża.',
    'The incline is 4 m long. The crate starts from rest. Static μs and kinetic μk depend on the surface.'
  ),
  q: [
    L(
      'Przy jakim kącie skrzynia zacznie zsuwać się po równi?',
      'At what angle does the crate start sliding?'
    ),
    L('Czy masa wpływa na przyspieszenie na równi?', 'Does mass affect the acceleration on the incline?'),
  ],
  task: {
    q: L(
      'Jak zmieni się przyspieszenie zsuwającej się skrzyni, gdy podwoimy jej masę?',
      'How does the acceleration of a sliding crate change when its mass doubles?'
    ),
    o: [
      L('wzrośnie 2×', 'doubles'),
      L('zmaleje 2×', 'halves'),
      L('nie zmieni się', 'stays the same'),
      L('wzrośnie 4×', 'quadruples'),
    ],
    a: 2,
    ex: L(
      'Zarówno F∥, jak i tarcie są proporcjonalne do m, więc a = g(sinα − μk cosα) nie zależy od masy.',
      'Both F∥ and friction are proportional to m, so a = g(sinα − μk cosα) does not depend on mass.'
    ),
  },
});
