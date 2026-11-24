/**
 * Drgania i fale / Oscillations & waves — simulation `pend`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function SIMS_pendE(s, p) {
  const v = s.w * p.L;
  return { Ek: 0.5 * p.m * v * v, Ep: p.m * p.g * p.L * (1 - Math.cos(s.th)) };
}

sim({
  id: 'pend',
  sec: 'osc',
  n: L('Wahadło matematyczne', 'Simple pendulum'),
  d: L(
    'Zmieniaj długość, masę i amplitudę. Mierz okres i sprawdź, od czego zależy. Słupki pokazują przemiany energii.',
    'Change the length, mass and amplitude. Measure the period and see what it depends on. Bars show energy transformations.'
  ),
  params: [
    { k: 'L', l: L('Długość l', 'Length l'), min: 0.2, max: 3, step: 0.05, v: 1.5, u: 'm' },
    { k: 'm', l: L('Masa m', 'Mass m'), min: 0.1, max: 5, step: 0.1, v: 1, u: 'kg' },
    { k: 'th0', l: L('Amplituda θ₀', 'Amplitude θ₀'), min: 2, max: 80, step: 1, v: 15, u: '°' },
    { k: 'g', type: 'sel', l: L('Grawitacja', 'Gravity'), o: G_OPTS, v: 9.81 },
    { k: 'b', l: L('Tłumienie', 'Damping'), min: 0, max: 0.5, step: 0.01, v: 0, u: '1/s' },
  ],
  dt: 1 / 1000,
  init(s, p) {
    s.th = p.th0 * DEG;
    s.w = 0;
    s.Tm = null;
    s.lastCross = null;
    s.trail = [];
  },
  step(s, p, h) {
    const f = (th, w) => -(p.g / p.L) * Math.sin(th) - p.b * w;
    const k1t = s.w,
      k1w = f(s.th, s.w),
      k2t = s.w + (k1w * h) / 2,
      k2w = f(s.th + (k1t * h) / 2, s.w + (k1w * h) / 2),
      k3t = s.w + (k2w * h) / 2,
      k3w = f(s.th + (k2t * h) / 2, s.w + (k2w * h) / 2),
      k4t = s.w + k3w * h,
      k4w = f(s.th + k3t * h, s.w + k3w * h);
    const old = s.th;
    s.th += (h / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
    s.w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    if (old < 0 && s.th >= 0) {
      const tc = s.t + h * (-old / (s.th - old));
      if (s.lastCross != null) s.Tm = tc - s.lastCross;
      s.lastCross = tc;
    }
    if (s.t > 120) s.done = true;
  },
  sample: (s, p) => {
    const e = SIMS_pendE(s, p);
    return { th: s.th / DEG, Ek: e.Ek, Ep: e.Ep };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const bw = 130,
      px = (w - bw) / 2,
      py = 34,
      sc = (h - 80) / 3.05;
    const bx = px + p.L * sc * Math.sin(s.th),
      by = py + p.L * sc * Math.cos(s.th);
    rrect(c, px - 60, py - 10, 120, 10, 3, 'obj');
    line(c, px, py, px, py + p.L * sc + 20, 'faint', 1, [4, 4]);
    c.save();
    c.strokeStyle = alpha(C.c5, 0.5);
    c.lineWidth = 1.2;
    c.setLineDash([3, 4]);
    c.beginPath();
    c.arc(px, py, p.L * sc, Math.PI / 2 - p.th0 * DEG, Math.PI / 2 + p.th0 * DEG);
    c.stroke();
    c.restore();
    line(c, px, py, bx, by, 'muted', 1.8);
    const r = 8 + Math.cbrt(p.m) * 7;
    circle(c, bx, by, r, 'c1');
    const v = s.w * p.L;
    arrow(
      c,
      bx,
      by,
      bx + Math.cos(s.th) * v * 25,
      by - Math.sin(s.th) * v * 25,
      'c3',
      Math.abs(v) > 0.1 ? 'v' : ''
    );
    text(c, 'θ = ' + fmt(s.th / DEG, 1) + '°', px + 10, py + 26, { size: 12, color: 'muted' });
    ruler(c, 24, h - 24, 24 + sc, 0, 1, 0.5, 'm');
    const e = SIMS_pendE(s, p),
      E0 = p.m * p.g * p.L * (1 - Math.cos(p.th0 * DEG));
    bars(
      c,
      w - bw - 12,
      14,
      bw,
      h - 28,
      [
        ['Ek', e.Ek, 'c3'],
        ['Ep', e.Ep, 'c1'],
      ],
      E0 * 1.05,
      lang === 'pl' ? 'Energia [J]' : 'Energy [J]'
    );
  },
  read: (s, p) => {
    const e = SIMS_pendE(s, p);
    return [
      [L('Kąt θ', 'Angle θ'), s.th / DEG, '°', 1],
      [L('Prędkość v', 'Speed v'), Math.abs(s.w * p.L), 'm/s'],
      [L('Okres zmierzony T', 'Measured period T'), s.Tm == null ? '—' : s.Tm, 's', 3],
      [
        L('Okres teoretyczny 2π√(l/g)', 'Theoretical period 2π√(l/g)'),
        2 * Math.PI * Math.sqrt(p.L / p.g),
        's',
        3,
      ],
      [
        L('Częstotliwość f = 1/T', 'Frequency f = 1/T'),
        s.Tm ? 1 / s.Tm : 1 / (2 * Math.PI * Math.sqrt(p.L / p.g)),
        'Hz',
        3,
      ],
      [L('Ek', 'Ek'), e.Ek, 'J'],
      [L('Ep', 'Ep'), e.Ep, 'J'],
    ];
  },
  charts: [
    { name: 'θ(t)', xl: 't [s]', yl: 'θ [°]', ser: [{ k: 'th', c: 'c1' }] },
    {
      name: 'E(t)',
      xl: 't [s]',
      yl: 'E [J]',
      ser: [
        { k: 'Ek', n: 'Ek', c: 'c3' },
        { k: 'Ep', n: 'Ep', c: 'c1' },
      ],
    },
    {
      name: L('T(l) — teoria', 'T(l) — theory'),
      fn: p => {
        const pts = [];
        for (let l = 0.1; l <= 3.001; l += 0.05) pts.push([l, 2 * Math.PI * Math.sqrt(l / p.g)]);
        return {
          xl: 'l [m]',
          yl: 'T [s]',
          ser: [{ c: 'c1', pts }],
          marker: [p.L, 2 * Math.PI * Math.sqrt(p.L / p.g)],
        };
      },
    },
  ],
  f: [
    L('T ≈ 2π√(l/g)  (małe wychylenia)', 'T ≈ 2π√(l/g)  (small angles)'),
    'f = 1/T',
    'Ep = mgl(1 − cosθ)',
    'Ek = ½mv²',
  ],
  model: L(
    'Punktowa masa na nieważkiej, nierozciągliwej nici. Równanie ruchu rozwiązywane numerycznie (bez przybliżenia małych kątów), więc dla dużych amplitud okres rośnie.',
    'A point mass on a massless, inextensible string. The equation of motion is solved numerically (no small-angle approximation), so the period grows for large amplitudes.'
  ),
  q: [
    L('Jak długość wahadła wpływa na okres?', 'How does the length affect the period?'),
    L(
      'Czy zwiększenie amplitudy zawsze zmienia okres wahadła?',
      'Does increasing the amplitude always change the period?'
    ),
    L('Czy masa ma wpływ na okres?', 'Does the mass affect the period?'),
  ],
  task: {
    q: L(
      'Długość wahadła zwiększamy 4 razy. Okres:',
      'The pendulum length is increased 4 times. The period:'
    ),
    o: [
      L('rośnie 4×', 'grows 4×'),
      L('rośnie 2×', 'grows 2×'),
      L('nie zmienia się', 'stays the same'),
      L('maleje 2×', 'halves'),
    ],
    a: 1,
    ex: L('T = 2π√(l/g), więc T ∝ √l; √4 = 2.', 'T = 2π√(l/g), so T ∝ √l; √4 = 2.'),
  },
});
