/**
 * Magnetyzm / Magnetism — simulation `emag`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'emag',
  sec: 'mag',
  n: L('Elektromagnes', 'Electromagnet'),
  d: L(
    'Zmieniaj prąd, liczbę zwojów i rdzeń. Silniejszy elektromagnes podnosi więcej spinaczy.',
    'Change the current, number of turns and core. A stronger electromagnet lifts more paper clips.'
  ),
  params: [
    { k: 'I', l: L('Natężenie I', 'Current I'), min: 0, max: 5, step: 0.1, v: 2, u: 'A', live: true },
    {
      k: 'N',
      l: L('Liczba zwojów N', 'Number of turns N'),
      min: 20,
      max: 500,
      step: 10,
      v: 200,
      u: '',
      live: true,
    },
    {
      k: 'core',
      type: 'sel',
      l: L('Rdzeń', 'Core'),
      o: [
        ['air', L('brak (powietrze)', 'none (air)')],
        ['al', L('aluminium', 'aluminium')],
        ['fe', L('żelazo', 'iron')],
      ],
      v: 'fe',
      live: true,
    },
  ],
  B(p) {
    const mu = { air: 1, al: 1, fe: 300 }[p.core];
    return Math.min((4 * Math.PI * 1e-7 * mu * p.N * p.I) / 0.1, 1.6);
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const B = this.B(p),
      cx = w * 0.42,
      cy = h * 0.32,
      cw = w * 0.36,
      chh = h * 0.14;
    const nClips = Math.min(14, Math.floor(B / 0.11));
    if (p.core !== 'air')
      rrect(
        c,
        cx - cw / 2 - 14,
        cy - chh * 0.32,
        cw + 28,
        chh * 0.64,
        4,
        p.core === 'fe' ? '#7d8792' : '#c6cdd4'
      );
    c.save();
    c.strokeStyle = '#c27a2c';
    c.lineWidth = 3;
    const turns = Math.max(6, Math.round(p.N / 20));
    for (let i = 0; i < turns; i++) {
      const x = cx - cw / 2 + (cw * (i + 0.5)) / turns;
      c.beginPath();
      c.ellipse(x, cy, 5, chh * 0.55, 0, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
    wire(
      c,
      [
        [cx - cw / 2, cy + chh * 0.55],
        [cx - cw / 2, cy + chh * 1.6],
        [cx - cw / 2 - 40, cy + chh * 1.6],
      ],
      '#c27a2c',
      2.5
    );
    wire(
      c,
      [
        [cx + cw / 2, cy + chh * 0.55],
        [cx + cw / 2, cy + chh * 1.6],
        [cx + cw / 2 + 40, cy + chh * 1.6],
      ],
      '#c27a2c',
      2.5
    );
    text(c, 'I = ' + fmt(p.I, 1) + ' A', cx, cy + chh * 1.6 + 18, {
      align: 'center',
      size: 12,
      weight: 650,
      color: 'muted',
    });
    if (B > 0.001) {
      c.save();
      c.strokeStyle = alpha(C.c5, clamp(B / 1.6 + 0.15, 0.15, 0.8));
      c.lineWidth = 1.4;
      for (let k = 1; k <= 3; k++) {
        c.beginPath();
        c.ellipse(cx, cy, cw / 2 + k * 28, chh * 0.5 + k * 26, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
      text(c, 'N', cx + cw / 2 + 22, cy, { size: 15, weight: 800, color: 'c4' });
      text(c, 'S', cx - cw / 2 - 24, cy, { size: 15, weight: 800, color: 'c1' });
    }
    const ex = cx + cw / 2 + 14,
      base = h - 34;
    line(c, w * 0.55, base, w - 20, base, 'obj', 2);
    const pile = 14 - nClips;
    for (let i = 0; i < nClips; i++) {
      const y = cy + chh * 0.32 + 10 + i * 12;
      c.save();
      c.strokeStyle = C.muted;
      c.lineWidth = 2;
      rrect(c, ex - 7, y, 14, 11, 4, null, 'muted', 2);
      c.restore();
    }
    for (let i = 0; i < pile; i++) {
      const x = w * 0.6 + (i % 7) * 24,
        y = base - 8 - Math.floor(i / 7) * 11;
      rrect(c, x, y, 18, 8, 4, null, 'muted', 2);
    }
    text(c, (lang === 'pl' ? 'podniesione spinacze: ' : 'clips lifted: ') + nClips, 16, 20, {
      size: 14,
      weight: 700,
      color: 'c5',
    });
  },
  read(s, p) {
    const B = this.B(p);
    return [
      [L('Indukcja B wewnątrz cewki', 'Field B inside the coil'), B * 1000, 'mT', 1],
      [L('Podniesione spinacze', 'Clips lifted'), Math.min(14, Math.floor(B / 0.11)), '', 0],
      [L('Iloczyn N·I', 'Product N·I'), p.N * p.I, 'A·zw', 0],
    ];
  },
  charts: [
    {
      name: 'B(I)',
      fn: p => {
        const pts = [];
        for (let I = 0; I <= 5.001; I += 0.05)
          pts.push([I, simById.emag.B(Object.assign({}, p, { I })) * 1000]);
        return {
          xl: 'I [A]',
          yl: 'B [mT]',
          ymin: 0,
          ser: [{ c: 'c5', pts }],
          marker: [p.I, simById.emag.B(p) * 1000],
        };
      },
    },
  ],
  f: ['B = μ₀·μr·N·I / l', L('żelazo: μr ≫ 1 (wzmacnia pole)', 'iron: μr ≫ 1 (strengthens the field)')],
  model: L(
    'Długość cewki l = 10 cm. Model jakościowy: μr żelaza ≈ 300, nasycenie rdzenia ograniczone do 1,6 T; liczba spinaczy proporcjonalna do B.',
    'Coil length l = 10 cm. Qualitative model: iron μr ≈ 300, core saturation capped at 1.6 T; the number of clips is proportional to B.'
  ),
  q: [
    L('Jak zwiększyć siłę elektromagnesu?', 'How can you make an electromagnet stronger?'),
    L(
      'Dlaczego rdzeń aluminiowy prawie nic nie zmienia?',
      'Why does an aluminium core hardly change anything?'
    ),
  ],
  task: {
    q: L(
      'Które działanie NIE wzmocni elektromagnesu?',
      'Which change will NOT strengthen the electromagnet?'
    ),
    o: [
      L('zwiększenie prądu', 'increasing the current'),
      L('dodanie zwojów', 'adding turns'),
      L('włożenie rdzenia żelaznego', 'inserting an iron core'),
      L('zamiana rdzenia żelaznego na aluminiowy', 'replacing the iron core with aluminium'),
    ],
    a: 3,
    ex: L(
      'Aluminium nie jest ferromagnetykiem (μr ≈ 1) — usunięcie żelaza osłabia elektromagnes.',
      'Aluminium is not ferromagnetic (μr ≈ 1) — removing the iron weakens the electromagnet.'
    ),
  },
});
