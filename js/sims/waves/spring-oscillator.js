/**
 * Drgania i fale / Oscillations & waves — simulation `springosc`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'springosc',
  sec: 'osc',
  n: L('Masa na sprężynie', 'Mass on a spring'),
  d: L(
    'Ciężarek drga na sprężynie. Zmieniaj masę m i sztywność k, mierz okres. Rejestrator rysuje wykres x(t) na przesuwającej się taśmie.',
    'A mass oscillates on a spring. Change m and k and measure the period. A chart recorder draws x(t) on moving paper.'
  ),
  params: [
    { k: 'm', l: L('Masa m', 'Mass m'), min: 0.1, max: 5, step: 0.1, v: 1, u: 'kg' },
    { k: 'k', l: L('Sztywność k', 'Spring constant k'), min: 5, max: 200, step: 1, v: 40, u: 'N/m' },
    { k: 'A', l: L('Amplituda A', 'Amplitude A'), min: 0.02, max: 0.3, step: 0.01, v: 0.15, u: 'm' },
    { k: 'b', l: L('Tłumienie', 'Damping'), min: 0, max: 1, step: 0.02, v: 0, u: '1/s' },
  ],
  dt: 1 / 1000,
  init(s, p) {
    s.x = p.A;
    s.v = 0;
    s.Tm = null;
    s.lc = null;
    s.tape = [];
  },
  step(s, p, h) {
    const a = (-p.k / p.m) * s.x - p.b * s.v;
    s.v += a * h;
    const o = s.x;
    s.x += s.v * h;
    if (o < 0 && s.x >= 0) {
      const tc = s.t + h;
      if (s.lc != null) s.Tm = tc - s.lc;
      s.lc = tc;
    }
    if (Math.round(s.t * 1000) % 10 === 0) {
      s.tape.push(s.x);
      if (s.tape.length > 600) s.tape.shift();
    }
    if (s.t > 120) s.done = true;
  },
  sample: s => ({ x: s.x, v: s.v }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const ax = w * 0.22,
      top = 26,
      eq = h * 0.5,
      sc = (h * 0.36) / 0.3;
    const my = eq + s.x * sc;
    rrect(c, ax - 60, top - 8, 120, 10, 3, 'obj');
    spring(c, ax, top, ax, my - 24, 16, 14, 'muted');
    const sz = 30 + Math.cbrt(p.m) * 14;
    rrect(c, ax - sz / 2, my - 24, sz, sz, 5, 'c1');
    text(c, fmt(p.m, 1) + ' kg', ax, my - 24 + sz / 2, {
      align: 'center',
      size: 11,
      weight: 700,
      color: '#fff',
    });
    line(c, ax - 80, eq, w - 20, eq, 'faint', 1, [4, 4]);
    text(c, lang === 'pl' ? 'położenie równowagi' : 'equilibrium', ax - 80, eq - 10, {
      size: 11,
      color: 'muted',
    });
    arrow(
      c,
      ax + sz / 2 + 20,
      my,
      ax + sz / 2 + 20,
      my + s.v * sc * 0.25,
      'c3',
      Math.abs(s.v) > 0.05 ? 'v' : ''
    );
    const tx0 = w * 0.42,
      tx1 = w - 30;
    rrect(c, tx0, eq - 0.33 * sc, tx1 - tx0, 0.66 * sc, 8, alpha(C.paper, 0.6), C.line, 1);
    line(c, tx0, my - 24 + sz / 2 - s.x * 0, tx0, my, 'c1', 1);
    c.save();
    c.strokeStyle = C.c1;
    c.lineWidth = 2;
    c.beginPath();
    const n = s.tape.length;
    for (let i = 0; i < n; i++) {
      const x = tx0 + (n - 1 - i) * ((tx1 - tx0) / 600),
        y = eq + s.tape[i] * sc;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    c.restore();
    line(c, ax + sz / 2, my, tx0, my, 'c1', 1, [2, 3]);
    text(c, lang === 'pl' ? 'rejestrator x(t) — 6 s' : 'recorder x(t) — 6 s', tx1, eq - 0.33 * sc - 10, {
      align: 'right',
      size: 11,
      color: 'muted',
    });
  },
  read: (s, p) => [
    [L('Wychylenie x', 'Displacement x'), s.x, 'm'],
    [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
    [L('Okres zmierzony', 'Measured period'), s.Tm == null ? '—' : s.Tm, 's', 3],
    [L('Okres 2π√(m/k)', 'Period 2π√(m/k)'), 2 * Math.PI * Math.sqrt(p.m / p.k), 's', 3],
    [L('Częstotliwość', 'Frequency'), 1 / (2 * Math.PI * Math.sqrt(p.m / p.k)), 'Hz', 3],
    [L('Energia ½kA²', 'Energy ½kA²'), 0.5 * p.k * p.A * p.A, 'J'],
  ],
  charts: [
    { name: 'x(t)', xl: 't [s]', yl: 'x [m]', ser: [{ k: 'x', c: 'c1' }] },
    { name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
  ],
  f: ['T = 2π√(m/k)', 'f = 1/T', 'x(t) = A·cos(2πt/T)', 'F = −kx'],
  model: L(
    'Sprężyna idealna i nieważka; położenie mierzymy od położenia równowagi (ciężar jest zrównoważony wstępnym rozciągnięciem).',
    'Ideal massless spring; position measured from equilibrium (the weight is balanced by the initial stretch).'
  ),
  q: [
    L('Jak masa i sztywność wpływają na okres?', 'How do mass and stiffness affect the period?'),
    L(
      'Czy amplituda zmienia okres oscylatora sprężynowego?',
      'Does amplitude change the period of a spring oscillator?'
    ),
  ],
  task: {
    q: L(
      'Masę zwiększamy 4 razy przy tej samej sprężynie. Częstotliwość drgań:',
      'The mass is quadrupled on the same spring. The frequency:'
    ),
    o: [
      L('rośnie 2×', 'doubles'),
      L('maleje 2×', 'halves'),
      L('maleje 4×', 'drops 4×'),
      L('nie zmienia się', 'stays the same'),
    ],
    a: 1,
    ex: L('T = 2π√(m/k) rośnie 2×, więc f = 1/T maleje 2×.', 'T = 2π√(m/k) doubles, so f = 1/T halves.'),
  },
});
