/**
 * Termodynamika / Thermodynamics — simulation `cond`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const COND = [
  ['400', L('miedź (400 W/m·K)', 'copper (400 W/m·K)')],
  ['237', L('aluminium (237 W/m·K)', 'aluminium (237 W/m·K)')],
  ['50', L('stal (50 W/m·K)', 'steel (50 W/m·K)')],
  ['1', L('szkło (1 W/m·K)', 'glass (1 W/m·K)')],
  ['0.15', L('drewno (0,15 W/m·K)', 'wood (0.15 W/m·K)')],
];

sim({
  id: 'cond',
  sec: 'th',
  n: L('Przewodzenie ciepła', 'Heat conduction'),
  d: L(
    'Dwa naczynia z wodą połączono prętem. Szybkość wyrównywania temperatur zależy od materiału pręta, jego długości i izolacji.',
    'Two water containers are joined by a rod. How fast the temperatures equalise depends on the rod’s material, length and insulation.'
  ),
  params: [
    { k: 'kk', type: 'sel', l: L('Materiał pręta', 'Rod material'), o: COND, v: '400' },
    { k: 'Lr', l: L('Długość pręta', 'Rod length'), min: 5, max: 50, step: 1, v: 10, u: 'cm' },
    { k: 'ins', type: 'chk', l: L('Izolacja naczyń', 'Insulated containers'), v: true },
    {
      k: 'ts',
      type: 'sel',
      l: L('Przyspieszenie czasu', 'Time acceleration'),
      o: [
        [10, '×10'],
        [100, '×100'],
        [1000, '×1000'],
      ],
      v: 100,
    },
  ],
  dt: 1 / 60,
  init(s, p) {
    s.Th = 90;
    s.Tc = 10;
    s.tp = 0;
    s.P = 0;
  },
  step(s, p, h) {
    const H = h * p.ts,
      C1 = 0.1 * 4190,
      G = (+p.kk * 4e-4) / (p.Lr / 100),
      Ge = p.ins ? 0 : 0.6;
    s.P = G * (s.Th - s.Tc);
    s.Th += ((-s.P - Ge * (s.Th - 20)) * H) / C1;
    s.Tc += ((s.P - Ge * (s.Tc - 20)) * H) / C1;
    s.tp += H;
    if (s.tp > 2e5 || (Math.abs(s.Th - s.Tc) < 0.1 && (p.ins || Math.abs(s.Th - 20) < 0.2))) s.done = true;
  },
  sample: s => ({ t: s.tp / 60, Th: s.Th, Tc: s.Tc }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const by = h * 0.72,
      bw = w * 0.18,
      bh = h * 0.42,
      x1 = w * 0.14,
      rodL = (w * 0.6 - bw) * clamp(p.Lr / 50, 0.1, 1),
      x2 = x1 + bw + rodL;
    const box = (x, T, lab) => {
      rrect(
        c,
        x - bw / 2 - 6,
        by - bh - 6,
        bw + 12,
        bh + 6,
        10,
        p.ins ? alpha(C.c5, 0.25) : alpha(C.muted, 0.1),
        p.ins ? 'c5' : 'muted',
        p.ins ? 4 : 1.5
      );
      rrect(c, x - bw / 2, by - bh * 0.85, bw, bh * 0.85, 6, tempColor(T, 0.75));
      text(c, fmt(T, 1) + ' °C', x, by - bh * 0.45, {
        align: 'center',
        size: 16,
        weight: 800,
        color: '#fff',
        mono: true,
      });
      text(c, lab, x, by + 20, { align: 'center', size: 12, color: 'muted' });
    };
    const gr = c.createLinearGradient(x1, 0, x2, 0);
    gr.addColorStop(0, tempColor(s.Th));
    gr.addColorStop(1, tempColor(s.Tc));
    c.fillStyle = gr;
    c.fillRect(x1 + bw / 2, by - bh * 0.4, rodL, 16);
    c.strokeStyle = C.obj;
    c.lineWidth = 1.5;
    c.strokeRect(x1 + bw / 2, by - bh * 0.4, rodL, 16);
    text(c, fmt(p.Lr, 0) + ' cm', (x1 + x2) / 2, by - bh * 0.4 + 60, {
      align: 'center',
      size: 11,
      color: 'muted',
    });
    box(x1, s.Th, lang === 'pl' ? 'naczynie A' : 'container A');
    box(x2, s.Tc, lang === 'pl' ? 'naczynie B' : 'container B');
    const flow = Math.min(1, s.P / 40);
    if (s.P > 0.01) {
      const n = 3;
      for (let i = 0; i < n; i++) {
        const u = (s.t * 0.6 + i / n) % 1;
        const x = lerp(x1 + bw / 2 + 12, x2 - bw / 2 - 12, u);
        arrow(c, x - 12, by - bh * 0.4 - 18, x + 12, by - bh * 0.4 - 18, 'c4', '', {
          w: 1.5 + flow * 4,
          head: 8 + flow * 4,
        });
      }
    }
    text(c, 'P = ' + fmt(s.P, s.P < 1 ? 3 : 2) + ' W', x2 + bw / 2 + 20, by - bh * 0.4 + 8, {
      align: 'left',
      size: 13,
      weight: 700,
      color: 'c4',
    });
    text(c, '', 0, 0, { align: 'center', size: 13, weight: 700, color: 'c4' });
    text(c, (lang === 'pl' ? 'czas rzeczywisty: ' : 'real time: ') + fmt(s.tp / 60, 1) + ' min', w - 16, 20, {
      align: 'right',
      size: 13,
      weight: 650,
      color: 'muted',
    });
  },
  read: (s, p) => [
    [L('Temperatura A', 'Temperature A'), s.Th, '°C', 2],
    [L('Temperatura B', 'Temperature B'), s.Tc, '°C', 2],
    [L('Różnica temperatur', 'Temperature difference'), s.Th - s.Tc, 'K', 2],
    [L('Moc przepływu ciepła', 'Heat flow rate'), s.P, 'W', 3],
    [L('Czas rzeczywisty', 'Real time'), s.tp / 60, 'min', 1],
  ],
  charts: [
    {
      name: 'T(t)',
      xl: 't [min]',
      yl: 'T [°C]',
      ymin: 0,
      ymax: 100,
      ser: [
        { k: 'Th', n: 'A', c: 'c4' },
        { k: 'Tc', n: 'B', c: 'c1' },
      ],
    },
  ],
  f: [
    'P = λ·S·ΔT / l',
    L('ciepło płynie od wyższej do niższej temperatury', 'heat flows from higher to lower temperature'),
  ],
  model: L(
    'Każde naczynie: 0,1 kg wody. Pręt o przekroju 4 cm², pomijamy pojemność cieplną pręta. Bez izolacji naczynia oddają ciepło do otoczenia (20 °C).',
    'Each container: 0.1 kg of water. Rod cross-section 4 cm²; the rod’s heat capacity is ignored. Without insulation the containers lose heat to the surroundings (20 °C).'
  ),
  q: [
    L(
      'Jak długo trwa wyrównanie temperatur w zależności od materiału?',
      'How long does equalisation take for different materials?'
    ),
    L(
      'Dlaczego metal i drewno o tej samej temperaturze wydają się różnie ciepłe?',
      'Why do metal and wood at the same temperature feel different?'
    ),
  ],
  task: {
    q: L('Który pręt najszybciej wyrówna temperatury?', 'Which rod equalises the temperatures fastest?'),
    o: [
      L('drewniany 10 cm', 'wooden, 10 cm'),
      L('miedziany 10 cm', 'copper, 10 cm'),
      L('miedziany 50 cm', 'copper, 50 cm'),
      L('szklany 10 cm', 'glass, 10 cm'),
    ],
    a: 1,
    ex: L(
      'Miedź ma największy współczynnik przewodzenia, a krótszy pręt przewodzi więcej ciepła (P ∝ λ/l).',
      'Copper has the highest conductivity, and a shorter rod conducts more heat (P ∝ λ/l).'
    ),
  },
});
