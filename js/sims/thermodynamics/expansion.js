/**
 * Termodynamika / Thermodynamics — simulation `expand`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const EXP = [
  ['23', L('aluminium (23·10⁻⁶ 1/K)', 'aluminium (23·10⁻⁶ 1/K)')],
  ['17', L('miedź (17·10⁻⁶ 1/K)', 'copper (17·10⁻⁶ 1/K)')],
  ['12', L('stal (12·10⁻⁶ 1/K)', 'steel (12·10⁻⁶ 1/K)')],
  ['9', L('szkło (9·10⁻⁶ 1/K)', 'glass (9·10⁻⁶ 1/K)')],
  ['1.2', L('inwar (1,2·10⁻⁶ 1/K)', 'invar (1.2·10⁻⁶ 1/K)')],
];

sim({
  id: 'expand',
  sec: 'th',
  n: L('Rozszerzalność cieplna', 'Thermal expansion'),
  d: L(
    'Ogrzewaj pręt i obserwuj wydłużenie na czujniku zegarowym. Porównaj materiały — dlatego mosty mają szczeliny dylatacyjne.',
    'Heat a rod and watch the elongation on a dial gauge. Compare materials — this is why bridges have expansion joints.'
  ),
  params: [
    { k: 'al', type: 'sel', l: L('Materiał', 'Material'), o: EXP, v: '23' },
    {
      k: 'L0',
      l: L('Długość początkowa L₀', 'Initial length L₀'),
      min: 0.5,
      max: 5,
      step: 0.1,
      v: 2,
      u: 'm',
    },
    {
      k: 'dT',
      l: L('Przyrost temperatury ΔT', 'Temperature rise ΔT'),
      min: 0,
      max: 200,
      step: 1,
      v: 80,
      u: 'K',
    },
  ],
  live: true,
  dL(p) {
    return +p.al * 1e-6 * p.L0 * p.dT;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const dl = this.dL(p) * 1000;
    const x0 = 60,
      y = h * 0.45,
      Lpx = (w - 260) * (p.L0 / 5) + 60,
      mag = Math.min(40, (w - x0 - Lpx - 130) / 10);
    rrect(c, x0 - 24, y - 60, 24, 120, 3, 'obj');
    const T = 20 + p.dT;
    rrect(c, x0, y - 14, Lpx + dl * mag, 28, 4, tempColor(clamp(T / 2.2, 0, 100)));
    for (let i = 0; i < 8; i++) {
      const fx = x0 + 20 + (i * (Lpx - 40)) / 7;
      c.save();
      c.strokeStyle = '#f97316';
      c.globalAlpha = clamp(p.dT / 200, 0, 1);
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(fx - 8, y + 48);
      c.quadraticCurveTo(fx, y + 30, fx - 4, y + 20);
      c.moveTo(fx + 8, y + 48);
      c.quadraticCurveTo(fx, y + 30, fx + 4, y + 20);
      c.stroke();
      c.restore();
    }
    line(c, x0 + Lpx, y - 40, x0 + Lpx, y + 40, 'faint', 1, [4, 4]);
    text(c, 'L₀', x0 + Lpx, y - 48, { align: 'center', size: 12, color: 'muted' });
    const gx = x0 + Lpx + dl * mag + 70,
      gy = y;
    line(c, x0 + Lpx + dl * mag, gy, gx - 36, gy, 'muted', 3);
    circle(c, gx, gy, 36, 'paper', 'obj', 2);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      line(
        c,
        gx + Math.cos(a) * 28,
        gy + Math.sin(a) * 28,
        gx + Math.cos(a) * 34,
        gy + Math.sin(a) * 34,
        'muted',
        1.5
      );
    }
    const ang = -Math.PI / 2 + (dl / 5) * Math.PI * 2;
    line(c, gx, gy, gx + Math.cos(ang) * 28, gy + Math.sin(ang) * 28, 'c4', 2.5);
    circle(c, gx, gy, 3.5, 'obj');
    text(c, lang === 'pl' ? '1 obrót = 5 mm' : '1 turn = 5 mm', gx, gy + 52, {
      align: 'center',
      size: 11,
      color: 'muted',
    });
    text(c, 'ΔL = ' + fmt(dl, 3) + ' mm', 16, 22, { size: 16, weight: 800, color: 'c4' });
    text(
      c,
      (lang === 'pl' ? 'wydłużenie na rysunku powiększone ×' : 'elongation in drawing magnified ×') +
        fmt((mag * 1000) / ((w - 260) / 5), 0),
      16,
      44,
      { size: 11, color: 'muted' }
    );
    text(c, 'T = ' + fmt(T, 0) + ' °C', x0 + Lpx / 2, y + 68, {
      align: 'center',
      size: 12,
      weight: 650,
      color: 'muted',
    });
  },
  read(s, p) {
    const dl = this.dL(p);
    return [
      [L('Wydłużenie ΔL', 'Elongation ΔL'), dl * 1000, 'mm', 3],
      [L('Długość końcowa L', 'Final length L'), p.L0 + dl, 'm', 5],
      [L('Współczynnik α', 'Coefficient α'), +p.al, '·10⁻⁶ 1/K', 1],
      [L('Względne wydłużenie ΔL/L₀', 'Relative elongation ΔL/L₀'), (dl / p.L0) * 100, '%', 4],
    ];
  },
  charts: [
    {
      name: 'ΔL(ΔT)',
      fn: p => ({
        xl: 'ΔT [K]',
        yl: 'ΔL [mm]',
        xmin: 0,
        xmax: 200,
        ymin: 0,
        ser: EXP.map((e, i) => ({
          n: L(tr(e[1]).split(' (')[0], tr(e[1]).split(' (')[0]),
          c: 'c' + (i + 1),
          pts: [
            [0, 0],
            [200, +e[0] * 1e-6 * p.L0 * 200 * 1000],
          ],
        })),
        marker: [p.dT, simById.expand.dL(p) * 1000],
      }),
    },
  ],
  f: ['ΔL = α·L₀·ΔT', 'L = L₀(1 + αΔT)'],
  model: L(
    'Rozszerzalność liniowa, α stałe w badanym zakresie temperatur. Temperatura początkowa 20 °C.',
    'Linear expansion with constant α in this temperature range. Initial temperature 20 °C.'
  ),
  q: [
    L('Który materiał najmniej się wydłuża?', 'Which material expands the least?'),
    L('Dlaczego przewody elektryczne latem bardziej zwisają?', 'Why do power lines sag more in summer?'),
  ],
  task: {
    q: L(
      'Stalowa szyna 10 m nagrzewa się o 50 K (α = 12·10⁻⁶ 1/K). Wydłuży się o:',
      'A 10 m steel rail warms by 50 K (α = 12·10⁻⁶ 1/K). It lengthens by:'
    ),
    o: ['0,6 mm', '6 mm', '60 mm', '0,06 mm'].map(x => L(x, x.replace(',', '.'))),
    a: 1,
    ex: L('ΔL = 12·10⁻⁶ · 10 m · 50 K = 0,006 m = 6 mm.', 'ΔL = 12·10⁻⁶ · 10 m · 50 K = 0.006 m = 6 mm.'),
  },
});
