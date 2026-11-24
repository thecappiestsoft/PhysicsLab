/**
 * Mechanika / Mechanics — simulation `fall`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'fall',
  sec: 'mech',
  n: L('Spadek swobodny', 'Free fall'),
  d: L(
    'Dwie kule spadają z tej samej wysokości. Porównaj ich ruch w próżni i z oporem powietrza oraz na różnych planetach.',
    'Two balls fall from the same height. Compare their motion in a vacuum and with air resistance, and on different planets.'
  ),
  params: [
    { k: 'h', l: L('Wysokość h', 'Height h'), min: 1, max: 100, step: 1, v: 45, u: 'm' },
    { k: 'g', type: 'sel', l: L('Grawitacja', 'Gravity'), o: G_OPTS, v: 9.81 },
    { k: 'air', type: 'chk', l: L('Opór powietrza', 'Air resistance'), v: false },
    { k: 'm1', l: L('Masa kuli 1', 'Mass of ball 1'), min: 0.05, max: 10, step: 0.05, v: 5, u: 'kg' },
    { k: 'm2', l: L('Masa kuli 2', 'Mass of ball 2'), min: 0.05, max: 10, step: 0.05, v: 0.1, u: 'kg' },
  ],
  init(s, p) {
    s.y1 = p.h;
    s.y2 = p.h;
    s.v1 = 0;
    s.v2 = 0;
    s.t1 = null;
    s.t2 = null;
  },
  step(s, p, h) {
    const k = p.air ? 0.5 * 1.2 * 0.47 * Math.PI * 0.1 * 0.1 : 0;
    const st = (y, v, m) => {
      const a = p.g - (k * v * Math.abs(v)) / m;
      v += a * h;
      y -= v * h;
      return [y, v];
    };
    if (s.t1 == null) {
      [s.y1, s.v1] = st(s.y1, s.v1, p.m1);
      if (s.y1 <= 0) {
        s.y1 = 0;
        s.t1 = s.t + h;
      }
    }
    if (s.t2 == null) {
      [s.y2, s.v2] = st(s.y2, s.v2, p.m2);
      if (s.y2 <= 0) {
        s.y2 = 0;
        s.t2 = s.t + h;
      }
    }
    if (s.t1 != null && s.t2 != null) s.done = true;
  },
  sample: s => ({ y1: s.y1, y2: s.y2, v1: s.v1, v2: s.v2 }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const top = 40,
      bot = h - 50,
      Y = y => bot - (y / p.h) * (bot - top);
    const x1 = w * 0.42,
      x2 = w * 0.62;
    ground(c, 20, w - 20, bot + 14);
    line(c, 90, Y(p.h), 90, bot + 14, 'muted', 1.2);
    const st = niceStep(p.h, 6);
    for (let m = 0; m <= p.h + 1e-9; m += st) {
      line(c, 84, Y(m), 96, Y(m), 'muted', 1.2);
      text(c, fmt(m, 0) + ' m', 78, Y(m), { align: 'right', size: 11, color: 'muted' });
    }
    rrect(c, x1 - 60, top - 22, x2 - x1 + 120, 8, 3, 'obj');
    const ball = (x, y, v, m, colr, lab, tl) => {
      circle(c, x, Y(y) + 2, 14, colr);
      text(c, lab, x, Y(y) + 2, { align: 'center', size: 11, weight: 700, color: '#fff' });
      arrow(c, x + 24, Y(y), x + 24, Y(y) + v * 3, 'c3', v > 0.5 ? 'v' : '');
      text(c, fmt(m, 2) + ' kg', x, top - 34, { align: 'center', size: 12, weight: 600, color: colr });
      if (tl != null)
        text(c, 't = ' + fmt(tl, 2) + ' s', x, bot + 30, {
          align: 'center',
          size: 12,
          weight: 700,
          color: colr,
        });
    };
    ball(x1, s.y1, s.v1, p.m1, 'c1', '1', s.t1);
    ball(x2, s.y2, s.v2, p.m2, 'c2', '2', s.t2);
    text(
      c,
      p.air
        ? lang === 'pl'
          ? 'z oporem powietrza'
          : 'with air resistance'
        : lang === 'pl'
          ? 'próżnia'
          : 'vacuum',
      w - 20,
      24,
      { align: 'right', size: 13, weight: 650, color: 'muted' }
    );
  },
  read: (s, p) => [
    [L('Czas t', 'Time t'), s.t, 's', 2],
    [L('Teoretyczny czas (próżnia)', 'Theoretical time (vacuum)'), Math.sqrt((2 * p.h) / p.g), 's', 2],
    [L('Prędkość kuli 1', 'Ball 1 speed'), s.v1, 'm/s'],
    [L('Prędkość kuli 2', 'Ball 2 speed'), s.v2, 'm/s'],
    [L('Wysokość kuli 1', 'Ball 1 height'), s.y1, 'm'],
    [L('Wysokość kuli 2', 'Ball 2 height'), s.y2, 'm'],
    [L('Czas spadku kuli 1', 'Ball 1 fall time'), s.t1 == null ? '—' : s.t1, 's', 2],
    [L('Czas spadku kuli 2', 'Ball 2 fall time'), s.t2 == null ? '—' : s.t2, 's', 2],
    [L('Ek kuli 1', 'Ball 1 Ek'), 0.5 * p.m1 * s.v1 * s.v1, 'J'],
    [L('Ep kuli 1', 'Ball 1 Ep'), p.m1 * p.g * s.y1, 'J'],
  ],
  charts: [
    {
      name: 'h(t)',
      xl: 't [s]',
      yl: 'h [m]',
      ser: [
        { k: 'y1', n: L('kula 1', 'ball 1'), c: 'c1' },
        { k: 'y2', n: L('kula 2', 'ball 2'), c: 'c2' },
      ],
    },
    {
      name: 'v(t)',
      xl: 't [s]',
      yl: 'v [m/s]',
      ser: [
        { k: 'v1', n: L('kula 1', 'ball 1'), c: 'c1' },
        { k: 'v2', n: L('kula 2', 'ball 2'), c: 'c2' },
      ],
    },
  ],
  f: ['h = ½gt²', 't = √(2h/g)', 'v = g·t = √(2gh)', L('F_oporu = ½ρC·A·v²', 'F_drag = ½ρC·A·v²')],
  model: L(
    'Kule mają ten sam promień (10 cm). Bez oporu pomijamy powietrze. Opór kwadratowy: ρ = 1,2 kg/m³, C = 0,47.',
    'Both balls have the same radius (10 cm). Without resistance air is ignored. Quadratic drag: ρ = 1.2 kg/m³, C = 0.47.'
  ),
  q: [
    L('Czy w próżni cięższy przedmiot spada szybciej?', 'Does a heavier object fall faster in a vacuum?'),
    L(
      'Z jakiej wysokości trzeba zrzucić obiekt, by czas spadania był dwukrotnie większy?',
      'From what height must an object be dropped to double the fall time?'
    ),
    L(
      'Jak opór powietrza zmienia ruch lekkiej kuli?',
      'How does air resistance change the motion of the light ball?'
    ),
  ],
  task: {
    q: L(
      'Ile razy trzeba zwiększyć wysokość, aby czas spadania (w próżni) wzrósł dwukrotnie?',
      'By what factor must the height increase for the fall time (vacuum) to double?'
    ),
    o: [L('2 razy', '2 times'), L('4 razy', '4 times'), L('√2 razy', '√2 times'), L('8 razy', '8 times')],
    a: 1,
    ex: L(
      't = √(2h/g), więc t ∝ √h. Aby t wzrósł 2×, h musi wzrosnąć 4×.',
      't = √(2h/g), so t ∝ √h. To double t, h must be 4× larger.'
    ),
  },
});
