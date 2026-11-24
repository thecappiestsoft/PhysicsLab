/**
 * Termodynamika / Thermodynamics — simulation `mix`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const CAP = [
  ['4190', L('woda (4190 J/kg·K)', 'water (4190 J/kg·K)')],
  ['900', L('aluminium (900 J/kg·K)', 'aluminium (900 J/kg·K)')],
  ['450', L('żelazo (450 J/kg·K)', 'iron (450 J/kg·K)')],
  ['385', L('miedź (385 J/kg·K)', 'copper (385 J/kg·K)')],
];

sim({
  id: 'mix',
  sec: 'th',
  n: L('Bilans cieplny', 'Heat balance'),
  d: L(
    'Ciepła i zimna substancja wymieniają ciepło aż do wyrównania temperatur. Ciepło oddane przez cieplejsze ciało = ciepło pobrane przez chłodniejsze.',
    'A hot and a cold body exchange heat until their temperatures equalise. Heat given off by the warmer body = heat taken by the cooler one.'
  ),
  params: [
    { k: 'm1', l: L('Masa wody m₁', 'Water mass m₁'), min: 0.1, max: 2, step: 0.05, v: 0.5, u: 'kg' },
    {
      k: 'T1',
      l: L('Temperatura wody T₁', 'Water temperature T₁'),
      min: 0,
      max: 100,
      step: 1,
      v: 20,
      u: '°C',
    },
    { k: 'c2', type: 'sel', l: L('Ciało 2', 'Body 2'), o: CAP, v: '4190' },
    { k: 'm2', l: L('Masa ciała 2', 'Mass of body 2'), min: 0.1, max: 2, step: 0.05, v: 0.3, u: 'kg' },
    {
      k: 'T2',
      l: L('Temperatura ciała 2', 'Temperature of body 2'),
      min: 0,
      max: 100,
      step: 1,
      v: 90,
      u: '°C',
    },
  ],
  dt: 1 / 60,
  init(s, p) {
    s.T1 = p.T1;
    s.T2 = p.T2;
  },
  step(s, p, h) {
    const c1 = 4190,
      c2 = +p.c2,
      G = 60;
    const P = G * (s.T2 - s.T1);
    s.T1 += (P * h) / (p.m1 * c1);
    s.T2 -= (P * h) / (p.m2 * c2);
    if (Math.abs(s.T1 - s.T2) < 0.05 || s.t > 600) s.done = true;
  },
  sample: s => ({ T1: s.T1, T2: s.T2 }),
  Tk(p) {
    const a = p.m1 * 4190,
      b = p.m2 * +p.c2;
    return (a * p.T1 + b * p.T2) / (a + b);
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const cx = w * 0.42,
      by = h - 40,
      bw = Math.min(w * 0.4, 300),
      bh = h * 0.62;
    rrect(c, cx - bw / 2 - 10, by - bh - 10, bw + 20, bh + 10, 12, alpha(C.muted, 0.15), 'muted', 2);
    rrect(c, cx - bw / 2, by - bh * 0.82, bw, bh * 0.82, 8, tempColor(s.T1, 0.55));
    text(c, lang === 'pl' ? 'woda' : 'water', cx - bw / 2 + 12, by - bh * 0.82 + 16, {
      size: 12,
      weight: 650,
      color: 'ink',
    });
    const isW = p.c2 === '4190';
    if (isW) {
      rrect(c, cx - bw * 0.22, by - bh * 0.82 - 20, bw * 0.44, bh * 0.7, 6, tempColor(s.T2, 0.7), 'obj', 1.5);
      text(
        c,
        lang === 'pl' ? 'ciepła woda (cienkie naczynie)' : 'hot water (thin vessel)',
        cx,
        by - bh * 0.82 - 30,
        { align: 'center', size: 11, color: 'muted' }
      );
    } else {
      rrect(c, cx - bw * 0.16, by - bh * 0.42, bw * 0.32, bh * 0.3, 4, tempColor(s.T2), 'obj', 2);
      text(c, lang === 'pl' ? 'metal' : 'metal', cx, by - bh * 0.27, {
        align: 'center',
        size: 12,
        weight: 700,
        color: '#fff',
      });
    }
    const P = 60 * (s.T2 - s.T1);
    if (Math.abs(P) > 1) {
      for (let i = -1; i <= 1; i++)
        arrow(
          c,
          cx + bw * (isW ? 0.24 : 0.18) * 1,
          by - bh * 0.4 + i * 24,
          cx + bw * (isW ? 0.24 : 0.18) + 18 + Math.min(40, Math.abs(P) / 40),
          by - bh * 0.4 + i * 24,
          'c4',
          '',
          { w: 2, head: 8 }
        );
    }
    thermo(c, w * 0.78, by - 20, bh * 0.75, s.T1, 0, 100, lang === 'pl' ? 'woda T₁' : 'water T₁');
    thermo(c, w * 0.9, by - 20, bh * 0.75, s.T2, 0, 100, lang === 'pl' ? 'ciało 2 T₂' : 'body 2 T₂');
  },
  read(s, p) {
    const Q = p.m1 * 4190 * (s.T1 - p.T1);
    return [
      [L('Temperatura T₁', 'Temperature T₁'), s.T1, '°C', 2],
      [L('Temperatura T₂', 'Temperature T₂'), s.T2, '°C', 2],
      [L('Temp. końcowa (teoria)', 'Final temp. (theory)'), this.Tk(p), '°C', 2],
      [L('Ciepło pobrane przez wodę', 'Heat taken by water'), Q / 1000, 'kJ', 2],
      [
        L('Ciepło oddane przez ciało 2', 'Heat given by body 2'),
        (p.m2 * +p.c2 * (p.T2 - s.T2)) / 1000,
        'kJ',
        2,
      ],
    ];
  },
  charts: [
    {
      name: 'T(t)',
      xl: 't [s]',
      yl: 'T [°C]',
      ymin: 0,
      ymax: 100,
      ser: [
        { k: 'T1', n: 'T₁', c: 'c1' },
        { k: 'T2', n: 'T₂', c: 'c4' },
      ],
    },
  ],
  f: ['Q = m·c·ΔT', L('Q_oddane = Q_pobrane', 'Q_given = Q_taken'), 'T_k = (m₁c₁T₁ + m₂c₂T₂)/(m₁c₁ + m₂c₂)'],
  model: L(
    'Układ izolowany — bez strat ciepła do otoczenia i do naczynia. Szybkość wymiany ciepła jest umowna.',
    'An isolated system — no heat lost to the surroundings or the container. The rate of heat exchange is arbitrary.'
  ),
  q: [
    L('Od czego zależy temperatura końcowa?', 'What does the final temperature depend on?'),
    L(
      'Dlaczego metal o tej samej masie zmienia temperaturę wody słabiej niż woda?',
      'Why does a metal of the same mass change the water temperature less than water does?'
    ),
  ],
  task: {
    q: L(
      'Mieszamy 1 kg wody o 20 °C i 1 kg wody o 80 °C (bez strat). Temperatura końcowa:',
      'We mix 1 kg of water at 20 °C with 1 kg at 80 °C (no losses). The final temperature is:'
    ),
    o: ['40 °C', '50 °C', '60 °C', '100 °C'],
    a: 1,
    ex: L(
      'Równe masy tej samej substancji: T_k = (20 + 80)/2 = 50 °C.',
      'Equal masses of the same substance: T_f = (20 + 80)/2 = 50 °C.'
    ),
  },
});
