/**
 * Energia / Energy — simulation `springE`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'springE',
  sec: 'en',
  n: L('Energia sprężystości', 'Elastic energy'),
  d: L(
    'Ściśnij sprężynę i puść klocek. Energia sprężystości zamienia się w kinetyczną i z powrotem; tarcie zamienia ją w ciepło.',
    'Compress the spring and release the block. Elastic energy turns into kinetic energy and back; friction turns it into heat.'
  ),
  params: [
    {
      k: 'k',
      l: L('Sztywność sprężyny k', 'Spring constant k'),
      min: 10,
      max: 200,
      step: 5,
      v: 60,
      u: 'N/m',
    },
    { k: 'm', l: L('Masa m', 'Mass m'), min: 0.2, max: 5, step: 0.1, v: 1, u: 'kg' },
    { k: 'x0', l: L('Ściśnięcie x₀', 'Compression x₀'), min: 0.05, max: 0.5, step: 0.01, v: 0.3, u: 'm' },
    { k: 'mu', l: L('Tarcie μ', 'Friction μ'), min: 0, max: 0.3, step: 0.01, v: 0.02, u: '' },
  ],
  dt: 1 / 1000,
  init(s, p) {
    s.x = -p.x0;
    s.v = 0;
    s.Q = 0;
  },
  step(s, p, h) {
    const g = 9.81,
      fr = p.mu * p.m * g;
    if (s.v === 0 && Math.abs(p.k * s.x) <= fr) {
      s.rest = (s.rest || 0) + h;
      if (s.rest > 0.5) s.done = true;
      return;
    }
    s.rest = 0;
    let a = (-p.k * s.x) / p.m;
    const dir = s.v !== 0 ? Math.sign(s.v) : Math.sign(-s.x);
    a -= (dir * fr) / p.m;
    const v0 = s.v;
    s.v += a * h;
    if (v0 !== 0 && Math.sign(s.v) !== Math.sign(v0) && Math.abs(p.k * s.x) <= fr) s.v = 0;
    s.Q += fr * Math.abs(s.v) * h;
    s.x += s.v * h;
    if (s.t > 30) s.done = true;
  },
  en(s, p) {
    return { Es: 0.5 * p.k * s.x * s.x, Ek: 0.5 * p.m * s.v * s.v, Q: s.Q };
  },
  sample(s, p) {
    const e = this.en(s, p);
    return { x: s.x, Es: e.Es, Ek: e.Ek, Q: e.Q, E: e.Es + e.Ek + e.Q };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const bw = 150,
      gy = h * 0.68,
      ppm = Math.min(500, (w - bw - 120) / 1.4),
      eqx = 40 + 0.75 * ppm;
    ground(c, 20, w - bw - 30, gy);
    rrect(c, 24, gy - 110, 16, 110, 3, 'obj');
    const bxw = 56 + p.m * 6;
    const bx = eqx + s.x * ppm;
    spring(c, 40, gy - 30, bx - bxw / 2, gy - 30, 14, 12, 'muted');
    box(c, bx, gy, bxw, 60, 'c2', fmt(p.m, 1) + ' kg');
    line(c, eqx, gy + 6, eqx, gy - 125, 'faint', 1, [4, 4]);
    text(c, 'x = 0', eqx, gy - 132, { align: 'center', size: 11, color: 'muted' });
    ruler(c, eqx - 0.5 * ppm, gy + 30, eqx + 0.5 * ppm, -0.5, 0.5, 0.1, 'm');
    arrow(c, bx, gy - 80, bx + s.v * 60, gy - 80, 'c3', Math.abs(s.v) > 0.05 ? 'v' : '');
    const F = -p.k * s.x;
    if (Math.abs(F) > 0.2) arrow(c, bx, gy - 100, bx + F * 1.5, gy - 100, 'c4', 'F_s');
    const e = this.en(s, p),
      E0 = 0.5 * p.k * p.x0 * p.x0;
    bars(
      c,
      w - bw - 12,
      14,
      bw,
      h - 28,
      [
        ['Es', e.Es, 'c5'],
        ['Ek', e.Ek, 'c3'],
        ['Q', e.Q, 'c4'],
      ],
      E0 * 1.05,
      lang === 'pl' ? 'Energia [J]' : 'Energy [J]'
    );
  },
  read(s, p) {
    const e = this.en(s, p);
    return [
      [L('Wychylenie x', 'Displacement x'), s.x, 'm'],
      [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
      [L('Energia sprężystości Es', 'Elastic energy Es'), e.Es, 'J'],
      [L('Energia kinetyczna Ek', 'Kinetic energy Ek'), e.Ek, 'J'],
      [L('Ciepło Q', 'Heat Q'), e.Q, 'J'],
      [L('Suma', 'Total'), e.Es + e.Ek + e.Q, 'J'],
      [L('v_max = x₀√(k/m)', 'v_max = x₀√(k/m)'), p.x0 * Math.sqrt(p.k / p.m), 'm/s'],
    ];
  },
  charts: [
    {
      name: 'E(t)',
      xl: 't [s]',
      yl: 'E [J]',
      ser: [
        { k: 'Es', n: 'Es', c: 'c5' },
        { k: 'Ek', n: 'Ek', c: 'c3' },
        { k: 'Q', n: 'Q', c: 'c4' },
        { k: 'E', n: 'E', c: 'ink', dash: [5, 4] },
      ],
    },
    { name: 'x(t)', xl: 't [s]', yl: 'x [m]', ser: [{ k: 'x', c: 'c2' }] },
  ],
  f: [
    'Es = ½kx²',
    'Ek = ½mv²',
    'F = −kx',
    L('½kx₀² = ½mv²_max (bez tarcia)', '½kx₀² = ½mv²_max (no friction)'),
  ],
  model: L(
    'Sprężyna idealna (spełnia prawo Hooke’a), nieważka. Tarcie kinetyczne stałe μmg.',
    'Ideal massless spring (Hooke’s law). Constant kinetic friction μmg.'
  ),
  q: [
    L(
      'Jak zmieni się energia sprężystości, gdy ściśnięcie wzrośnie dwukrotnie?',
      'How does elastic energy change when the compression doubles?'
    ),
  ],
  task: {
    q: L(
      'Ściśnięcie sprężyny zwiększamy 2 razy. Energia sprężystości:',
      'The compression is doubled. The elastic energy:'
    ),
    o: [
      L('rośnie 2×', 'doubles'),
      L('rośnie 4×', 'quadruples'),
      L('nie zmienia się', 'stays the same'),
      L('maleje 2×', 'halves'),
    ],
    a: 1,
    ex: L(
      'Es = ½kx², więc przy 2x energia rośnie 2² = 4 razy.',
      'Es = ½kx², so with 2x the energy grows 2² = 4 times.'
    ),
  },
});
