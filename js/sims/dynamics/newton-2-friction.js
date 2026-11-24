/**
 * Dynamika / Dynamics — simulation `newton2`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'newton2',
  sec: 'dyn',
  n: L('II zasada Newtona i tarcie', 'Newton’s 2nd law & friction'),
  d: L(
    'Popychaj skrzynię siłą F. Obserwuj tarcie statyczne, moment ruszenia, tarcie kinetyczne oraz zależność a = F_w/m.',
    'Push a crate with force F. Observe static friction, the moment it starts, kinetic friction and the relation a = F_net/m.'
  ),
  params: [
    { k: 'm', l: L('Masa m', 'Mass m'), min: 1, max: 20, step: 0.5, v: 5, u: 'kg' },
    {
      k: 'mode',
      type: 'sel',
      l: L('Siła', 'Force'),
      o: [
        ['const', L('stała', 'constant')],
        ['ramp', L('rosnąca (2 N/s … do F)', 'increasing (2 N/s … up to F)')],
      ],
      v: 'const',
    },
    { k: 'F', l: L('Siła przyłożona F', 'Applied force F'), min: 0, max: 100, step: 1, v: 30, u: 'N' },
    { k: 'surf', type: 'sel', l: L('Podłoże', 'Surface'), o: SURF, v: 'wood' },
  ],
  init(s, p) {
    s.x = 0;
    s.v = 0;
    s.Fa = p.mode === 'ramp' ? 0 : p.F;
    s.T = 0;
    s.a = 0;
    s.moving = false;
    s.startF = null;
  },
  step(s, p, h) {
    const g = 9.81,
      N = p.m * g,
      [ms, mk] = MU[p.surf];
    s.Fa = p.mode === 'ramp' ? Math.min(p.F, 2 * s.t) : p.F;
    if (!s.moving) {
      if (s.Fa > ms * N + 1e-9 || (ms === 0 && s.Fa > 0)) {
        s.moving = true;
        if (s.startF == null) s.startF = s.Fa;
      } else {
        s.T = s.Fa;
        s.a = 0;
        s.v = 0;
      }
    }
    if (s.moving) {
      s.T = mk * N;
      s.a = (s.Fa - s.T) / p.m;
      s.v += s.a * h;
      if (s.v <= 0) {
        s.v = 0;
        s.moving = false;
        s.T = Math.min(s.Fa, ms * N);
        s.a = 0;
      }
      s.x += s.v * h;
    }
    if (s.t >= 15) s.done = true;
  },
  sample: s => ({ v: s.v, F: s.Fa, T: s.T, a: s.a, x: s.x }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const gy = h * 0.66,
      ppm = 60,
      cam = s.x * ppm - w * 0.4;
    c.fillStyle = alpha(C.muted, C.dark ? 0.1 : 0.07);
    c.fillRect(0, gy, w, h - gy);
    ground(c, 0, w, gy);
    for (let m = Math.floor(cam / ppm) - 1; m < (cam + w) / ppm + 1; m++) {
      const x = m * ppm - cam;
      line(c, x, gy, x, gy + 8, 'muted', 1);
      if (m % 2 === 0) text(c, m + ' m', x, gy + 20, { align: 'center', size: 11, color: 'muted' });
    }
    const bx = s.x * ppm - cam + 60,
      bw = 90 + p.m * 2.2,
      bh = 60 + p.m * 1.2;
    box(c, bx, gy, bw, bh, 'c2', fmt(p.m, 1) + ' kg');
    const N = p.m * 9.81,
      mx = Math.max(p.F, N, 1),
      k = Math.min(130 / mx, 3),
      cy = gy - bh / 2;
    arrow(c, bx - bw / 2 - 6 - s.Fa * k, cy, bx - bw / 2 - 6, cy, 'c1', 'F', { ly: -12 });
    if (s.T > 0.01) arrow(c, bx, gy + 3, bx - s.T * k, gy + 3, 'c4', lang === 'pl' ? 'T' : 'f', { ly: 12 });
    arrow(c, bx, cy, bx, cy + N * k * 0.6, 'c5', 'Fg', { lx: 16 });
    arrow(c, bx, gy - bh, bx, gy - bh - N * k * 0.6, 'c6', 'N', { lx: 14 });
    const Fw = s.Fa - s.T;
    if (Math.abs(Fw) > 0.05)
      arrow(c, bx, gy - bh - N * k * 0.6 - 22, bx + Fw * k, gy - bh - N * k * 0.6 - 22, 'ink', 'F_w');
    text(
      c,
      s.moving
        ? lang === 'pl'
          ? 'ruch — tarcie kinetyczne'
          : 'moving — kinetic friction'
        : lang === 'pl'
          ? 'spoczynek — tarcie statyczne'
          : 'at rest — static friction',
      16,
      20,
      { size: 13, weight: 650, color: s.moving ? 'c3' : 'muted' }
    );
    arrow(c, 16, 44, 16 + Math.min(s.v * 14, 200), 44, 'c3', s.v > 0.05 ? 'v' : '', { w: 2 });
  },
  read: (s, p) => {
    const N = p.m * 9.81,
      [ms, mk] = MU[p.surf];
    return [
      [L('Siła F', 'Force F'), s.Fa, 'N', 1],
      [L('Tarcie T', 'Friction f'), s.T, 'N', 1],
      [L('Siła wypadkowa F_w', 'Net force F_net'), s.Fa - s.T, 'N', 1],
      [L('Przyspieszenie a', 'Acceleration a'), s.a, 'm/s²'],
      [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
      [L('Droga x', 'Distance x'), s.x, 'm'],
      [L('Nacisk N = mg', 'Normal force N = mg'), N, 'N', 1],
      [L('Maks. tarcie statyczne μsN', 'Max static friction μsN'), ms * N, 'N', 1],
      [L('Siła ruszenia', 'Breakaway force'), s.startF == null ? '—' : s.startF, 'N', 1],
    ];
  },
  charts: [
    { name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
    {
      name: L('F i T (t)', 'F and f (t)'),
      xl: 't [s]',
      yl: 'F [N]',
      ser: [
        { k: 'F', n: 'F', c: 'c1' },
        { k: 'T', n: L('T', 'f'), c: 'c4' },
      ],
    },
    {
      name: L('a(F) z pomiarów', 'a(F) from data'),
      fn: (p, s, rows) => {
        const kF = Object.keys(rows[0] || {}).find(k => /^(Siła F|Force F)/.test(k)),
          ka = Object.keys(rows[0] || {}).find(k => /^(Przyspieszenie|Acceleration)/.test(k));
        return {
          xl: 'F [N]',
          yl: 'a [m/s²]',
          ser: [
            {
              n: L('pomiary', 'data'),
              c: 'c1',
              dots: true,
              pts: rows.map(r => [r[kF], r[ka]]).filter(q => q[0] != null && q[1] != null),
            },
          ],
        };
      },
    },
  ],
  f: [
    'F_w = ΣF = m·a',
    'a = F_w / m',
    'Fg = m·g',
    L('T_s ≤ μs·N (statyczne)', 'f_s ≤ μs·N (static)'),
    L('T_k = μk·N (kinetyczne)', 'f_k = μk·N (kinetic)'),
  ],
  model: L(
    'Siła działa poziomo; N = mg. Tarcie statyczne dopasowuje się do siły aż do μsN; w ruchu działa stałe tarcie kinetyczne μkN.',
    'The force is horizontal; N = mg. Static friction matches the force up to μsN; in motion constant kinetic friction μkN acts.'
  ),
  q: [
    L(
      'Jaką siłę należy przyłożyć do wózka o masie 2 kg, aby uzyskał a = 3 m/s² (bez tarcia)?',
      'What force gives a 2 kg cart a = 3 m/s² (no friction)?'
    ),
    L(
      'Czy większa masa zawsze oznacza większą siłę tarcia?',
      'Does a larger mass always mean a larger friction force?'
    ),
    L(
      'Zapisz pomiary a dla kilku F i zobacz wykres a(F).',
      'Record a for several F values and look at the a(F) graph.'
    ),
  ],
  task: {
    q: L(
      'Skrzynia 10 kg leży na drewnie (μs = 0,5). Działamy siłą 30 N. Ile wynosi siła tarcia?',
      'A 10 kg crate rests on wood (μs = 0.5). We push with 30 N. What is the friction force?'
    ),
    o: [L('0 N', '0 N'), L('30 N', '30 N'), L('49 N', '49 N'), L('29 N', '29 N')],
    a: 1,
    ex: L(
      'Maksymalne tarcie statyczne to 0,5·10·9,81 ≈ 49 N > 30 N, więc skrzynia stoi, a tarcie równoważy siłę: 30 N.',
      'Max static friction is 0.5·10·9.81 ≈ 49 N > 30 N, so the crate stays at rest and friction balances the push: 30 N.'
    ),
  },
});
