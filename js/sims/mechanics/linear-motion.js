/**
 * Mechanika / Mechanics — simulation `motion`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'motion',
  sec: 'mech',
  n: L('Ruch prostoliniowy', 'Linear motion'),
  d: L(
    'Pojazd porusza się ruchem jednostajnym lub jednostajnie przyspieszonym. Zmieniaj x₀, v₀ i a, porównaj dwa pojazdy i odczytaj wykresy x(t), v(t), a(t).',
    'A vehicle moves uniformly or with constant acceleration. Change x₀, v₀ and a, compare two vehicles and read the x(t), v(t), a(t) graphs.'
  ),
  params: [
    {
      k: 'x0',
      l: L('Położenie początkowe x₀', 'Initial position x₀'),
      min: 0,
      max: 50,
      step: 1,
      v: 0,
      u: 'm',
    },
    {
      k: 'v0',
      l: L('Prędkość początkowa v₀', 'Initial velocity v₀'),
      min: -10,
      max: 20,
      step: 0.5,
      v: 5,
      u: 'm/s',
    },
    { k: 'a', l: L('Przyspieszenie a', 'Acceleration a'), min: -4, max: 4, step: 0.1, v: 0, u: 'm/s²' },
    {
      k: 'cmp',
      type: 'chk',
      l: L('Porównaj z drugim pojazdem (B)', 'Compare with a second vehicle (B)'),
      v: true,
    },
    {
      k: 'v0B',
      l: L('v₀ pojazdu B', 'B: initial velocity v₀'),
      min: -10,
      max: 20,
      step: 0.5,
      v: 2,
      u: 'm/s',
      if: p => p.cmp,
    },
    {
      k: 'aB',
      l: L('a pojazdu B', 'B: acceleration a'),
      min: -4,
      max: 4,
      step: 0.1,
      v: 1,
      u: 'm/s²',
      if: p => p.cmp,
    },
  ],
  init(s, p) {
    s.x = p.x0;
    s.v = p.v0;
    s.xB = p.x0;
    s.vB = p.v0B;
    s.path = 0;
    s.marks = [];
    s.marksB = [];
    s.nextMark = 1;
  },
  step(s, p, h) {
    const t = s.t + h;
    const xo = s.x;
    s.x = p.x0 + p.v0 * t + 0.5 * p.a * t * t;
    s.v = p.v0 + p.a * t;
    s.path += Math.abs(s.x - xo);
    s.xB = p.x0 + p.v0B * t + 0.5 * p.aB * t * t;
    s.vB = p.v0B + p.aB * t;
    if (t >= s.nextMark - 1e-9) {
      s.marks.push([s.x, s.nextMark]);
      s.marksB.push([s.xB, s.nextMark]);
      s.nextMark++;
    }
    const out = x => x < -10 || x > 110;
    if (t >= 20 || (out(s.x) && (!p.cmp || out(s.xB)))) s.done = true;
  },
  sample: (s, p) => ({
    x: s.x,
    v: s.v,
    a: p.a,
    xB: p.cmp ? s.xB : null,
    vB: p.cmp ? s.vB : null,
    aB: p.cmp ? p.aB : null,
  }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const m0 = -10,
      m1 = 110,
      X = m => 40 + ((m - m0) / (m1 - m0)) * (w - 80);
    const lanes = p.cmp ? [h * 0.4, h * 0.72] : [h * 0.58];
    ruler(c, 40, h - 40, w - 40, m0, m1, 10, 'm');
    const drawLane = (y, x, v, a, marks, colr, lab) => {
      ground(c, 20, w - 20, y);
      marks.forEach(([mx, tt]) => {
        if (mx < m0 || mx > m1) return;
        circle(c, X(mx), y + 16, 3.5, colr);
        text(c, tt + 's', X(mx), y + 28, { align: 'center', size: 10, color: 'muted' });
      });
      const cx = X(x);
      car(c, cx, y, 58, colr, lab);
      const vy = y - 58;
      arrow(c, cx, vy, cx + v * 7, vy, 'c3', Math.abs(v) > 0.3 ? 'v' : '');
      arrow(c, cx, vy - 20, cx + a * 22, vy - 20, 'c4', Math.abs(a) > 0.05 ? 'a' : '');
    };
    drawLane(lanes[0], s.x, s.v, p.a, s.marks, 'c1', 'A');
    if (p.cmp) drawLane(lanes[1], s.xB, s.vB, p.aB, s.marksB, 'c2', 'B');
    legend(
      c,
      [
        ['v', 'c3'],
        ['a', 'c4'],
        [lang === 'pl' ? 'położenie co 1 s' : 'position every 1 s', 'muted'],
      ],
      16,
      18
    );
  },
  read: (s, p) => {
    const r = [
      [L('Czas t', 'Time t'), s.t, 's', 2],
      [L('Położenie x (A)', 'Position x (A)'), s.x, 'm'],
      [L('Prędkość v (A)', 'Velocity v (A)'), s.v, 'm/s'],
      [L('Droga s (A)', 'Distance s (A)'), s.path, 'm'],
      [L('Przemieszczenie Δx (A)', 'Displacement Δx (A)'), s.x - p.x0, 'm'],
    ];
    if (p.cmp)
      r.push(
        [L('Położenie x (B)', 'Position x (B)'), s.xB, 'm'],
        [L('Prędkość v (B)', 'Velocity v (B)'), s.vB, 'm/s'],
        [L('Odległość A–B', 'Distance A–B'), Math.abs(s.x - s.xB), 'm']
      );
    return r;
  },
  charts: [
    {
      name: L('x(t)', 'x(t)'),
      xl: 't [s]',
      yl: 'x [m]',
      ser: [
        { k: 'x', n: L('A', 'A'), c: 'c1' },
        { k: 'xB', n: L('B', 'B'), c: 'c2', if: p => p.cmp },
      ],
    },
    {
      name: L('v(t)', 'v(t)'),
      xl: 't [s]',
      yl: 'v [m/s]',
      ser: [
        { k: 'v', n: 'A', c: 'c1' },
        { k: 'vB', n: 'B', c: 'c2', if: p => p.cmp },
      ],
    },
    {
      name: L('a(t)', 'a(t)'),
      xl: 't [s]',
      yl: 'a [m/s²]',
      ymin: -4.5,
      ymax: 4.5,
      ser: [
        { k: 'a', n: 'A', c: 'c1' },
        { k: 'aB', n: 'B', c: 'c2', if: p => p.cmp },
      ],
    },
  ],
  f: ['x = x₀ + v·t', L('v = v₀ + a·t', 'v = v₀ + a·t'), 'x = x₀ + v₀t + ½at²', 'v² = v₀² + 2a(x − x₀)'],
  model: L(
    'Pojazd traktujemy jak punkt materialny, przyspieszenie jest stałe, pomijamy opory ruchu.',
    'The vehicle is treated as a point mass, acceleration is constant, resistance is neglected.'
  ),
  q: [
    L(
      'Jak zmieni się droga w 2 s i 4 s, gdy prędkość jest stała?',
      'How does the distance change after 2 s and 4 s at constant velocity?'
    ),
    L('Porównaj wykresy dla a = 1 m/s² i a = 2 m/s².', 'Compare the graphs for a = 1 m/s² and a = 2 m/s².'),
    L(
      'Kiedy przy ujemnym przyspieszeniu pojazd się zatrzyma?',
      'When does a vehicle with negative acceleration stop?'
    ),
  ],
  task: {
    q: L(
      'Pojazd rusza z v₀ = 0 i a = 2 m/s². Jaką drogę przejedzie w ciągu 3 s?',
      'A vehicle starts with v₀ = 0 and a = 2 m/s². How far does it travel in 3 s?'
    ),
    o: [L('6 m', '6 m'), L('9 m', '9 m'), L('12 m', '12 m'), L('18 m', '18 m')],
    a: 1,
    ex: L(
      's = ½at² = ½·2·3² = 9 m. Sprawdź w symulacji: x₀ = 0, v₀ = 0, a = 2.',
      's = ½at² = ½·2·3² = 9 m. Check it: x₀ = 0, v₀ = 0, a = 2.'
    ),
  },
});
