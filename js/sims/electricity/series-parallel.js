/**
 * Elektryczność / Electricity — simulation `circuit`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'circuit',
  sec: 'el',
  n: L('Połączenia szeregowe i równoległe', 'Series and parallel circuits'),
  d: L(
    'Dołączaj kolejne żarówki szeregowo lub równolegle. Obserwuj opór zastępczy, prąd, napięcia na żarówkach i ich jasność.',
    'Add bulbs in series or in parallel. Observe the equivalent resistance, current, voltages across the bulbs and their brightness.'
  ),
  params: [
    {
      k: 'mode',
      type: 'sel',
      l: L('Połączenie', 'Connection'),
      o: [
        ['ser', L('szeregowe', 'series')],
        ['par', L('równoległe', 'parallel')],
      ],
      v: 'ser',
    },
    { k: 'n', l: L('Liczba żarówek', 'Number of bulbs'), min: 1, max: 4, step: 1, v: 2, u: '' },
    { k: 'U', l: L('Napięcie U', 'Voltage U'), min: 1, max: 24, step: 0.5, v: 12, u: 'V' },
    {
      k: 'R',
      l: L('Opór jednej żarówki', 'Resistance of one bulb'),
      min: 5,
      max: 60,
      step: 1,
      v: 24,
      u: 'Ω',
    },
  ],
  autorun: true,
  keepRun: true,
  dt: 1 / 120,
  live: true,
  init(s, p) {
    s.q = 0;
  },
  step(s, p, h) {
    s.q += this.calc(p).I * h * 120;
    if (s.t > 3600) s.done = true;
  },
  calc(p) {
    const Rz = p.mode === 'ser' ? p.n * p.R : p.R / p.n,
      I = p.U / Rz,
      Ub = p.mode === 'ser' ? p.U / p.n : p.U,
      Ib = p.mode === 'ser' ? I : I / p.n;
    return { Rz, I, Ub, Ib, Pb: Ub * Ib, Pt: p.U * I };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const k = this.calc(p),
      x0 = w * 0.14,
      x1 = w * 0.86,
      y0 = h * 0.22,
      y1 = h * 0.8,
      Pref = (p.U * p.U) / p.R;
    if (p.mode === 'ser') {
      wire(c, [
        [x0, y1],
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]);
      electrons(
        c,
        [
          [x0, y0],
          [x0, y1],
          [x1, y1],
          [x1, y0],
          [x0, y0],
        ],
        s.q,
        22
      );
      for (let i = 0; i < p.n; i++) {
        const bx = x0 + ((x1 - x0) * (i + 1)) / (p.n + 1);
        c.fillStyle = C.scene;
        c.fillRect(bx - 16, y0 - 16, 32, 32);
        bulb(c, bx, y0, (k.Pb / Pref) * 1.2, fmt(k.Ub, 2) + ' V');
      }
    } else {
      wire(c, [
        [x0, y1],
        [x0, y0],
        [x1 - 0, y0],
      ]);
      wire(c, [
        [x0, y1],
        [x1, y1],
      ]);
      const xs = [];
      for (let i = 0; i < p.n; i++) xs.push(x0 + ((x1 - x0) * (i + 1)) / (p.n + 0.6));
      const xl = xs[xs.length - 1];
      wire(c, [
        [x0, y0],
        [xl, y0],
      ]);
      wire(c, [
        [x0, y1],
        [xl, y1],
      ]);
      xs.forEach((bx, i) => {
        wire(c, [
          [bx, y0],
          [bx, y1],
        ]);
        electrons(
          c,
          [
            [bx, y0],
            [bx, y1],
          ],
          s.q / p.n,
          22
        );
        const by = (y0 + y1) / 2;
        c.fillStyle = C.scene;
        c.fillRect(bx - 16, by - 16, 32, 32);
        bulb(c, bx, by, (k.Pb / Pref) * 1.2, fmt(k.Ib, 3) + ' A');
        circle(c, bx, y0, 3.5, 'obj');
        circle(c, bx, y1, 3.5, 'obj');
      });
      for (let i = 0; i < p.n; i++) {
        const a = i ? xs[i - 1] : x0,
          b = xs[i];
        const frac = (p.n - i) / p.n;
        electrons(
          c,
          [
            [a, y1],
            [b, y1],
          ],
          s.q * frac,
          22
        );
        electrons(
          c,
          [
            [b, y0],
            [a, y0],
          ],
          s.q * frac,
          22
        );
      }
      electrons(
        c,
        [
          [x0, y0],
          [x0, y1],
        ],
        s.q,
        22
      );
    }
    battery(c, x0, (y0 + y1) / 2, true, fmt(p.U, 1) + ' V');
    text(
      c,
      (p.mode === 'ser'
        ? lang === 'pl'
          ? 'szeregowo: ten sam prąd, napięcie dzieli się'
          : 'series: same current, voltage is shared'
        : lang === 'pl'
          ? 'równolegle: to samo napięcie, prąd się rozgałęzia'
          : 'parallel: same voltage, current splits') +
        ' · I = ' +
        fmt(k.I, 3) +
        ' A',
      16,
      20,
      { size: 13, weight: 650, color: 'muted' }
    );
  },
  read(s, p) {
    const k = this.calc(p);
    return [
      [L('Opór zastępczy R_z', 'Equivalent resistance R_eq'), k.Rz, 'Ω', 2],
      [L('Prąd całkowity I', 'Total current I'), k.I, 'A', 3],
      [L('Napięcie na żarówce', 'Voltage per bulb'), k.Ub, 'V', 2],
      [L('Prąd przez żarówkę', 'Current per bulb'), k.Ib, 'A', 3],
      [L('Moc żarówki', 'Power per bulb'), k.Pb, 'W', 2],
      [L('Moc całkowita', 'Total power'), k.Pt, 'W', 2],
    ];
  },
  charts: [
    {
      name: L('I(n) — teoria', 'I(n) — theory'),
      fn: p => {
        const pts = s => [1, 2, 3, 4].map(n => [n, p.U / (s === 'ser' ? n * p.R : p.R / n)]);
        return {
          xl: 'n',
          yl: 'I [A]',
          xmin: 1,
          xmax: 4,
          ser: [
            { n: L('szeregowo', 'series'), c: 'c1', pts: pts('ser') },
            { n: L('równolegle', 'parallel'), c: 'c2', pts: pts('par') },
          ],
          marker: [p.n, p.U / (p.mode === 'ser' ? p.n * p.R : p.R / p.n)],
        };
      },
    },
  ],
  f: [
    'R_sz = R₁ + R₂ + …',
    '1/R_r = 1/R₁ + 1/R₂ + …',
    L('szeregowo: I = const, U = U₁ + U₂ + …', 'series: I = const, U = U₁ + U₂ + …'),
    L('równolegle: U = const, I = I₁ + I₂ + …', 'parallel: U = const, I = I₁ + I₂ + …'),
  ],
  model: L(
    'Żarówki traktujemy jak stałe oporniki (w rzeczywistości opór żarówki rośnie z temperaturą). Źródło idealne.',
    'Bulbs are modelled as constant resistors (in reality a bulb’s resistance rises with temperature). Ideal source.'
  ),
  q: [
    L(
      'Jak zmienia się prąd całkowity po dołączeniu kolejnej gałęzi równoległej?',
      'How does the total current change when another parallel branch is added?'
    ),
    L('Dlaczego żarówki połączone szeregowo świecą słabiej?', 'Why do bulbs in series glow more dimly?'),
  ],
  task: {
    q: L(
      'Trzy żarówki po 30 Ω połączono równolegle. Opór zastępczy wynosi:',
      'Three 30 Ω bulbs are connected in parallel. The equivalent resistance is:'
    ),
    o: ['90 Ω', '30 Ω', '10 Ω', '3 Ω'],
    a: 2,
    ex: L('1/R = 3/30 ⇒ R = 10 Ω.', '1/R = 3/30 ⇒ R = 10 Ω.'),
  },
});
