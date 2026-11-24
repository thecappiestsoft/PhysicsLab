/**
 * Fizyka atomowa / Atomic physics — simulation `atom`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const ELEM = [
  ['H', 'Wodór', 'Hydrogen'],
  ['He', 'Hel', 'Helium'],
  ['Li', 'Lit', 'Lithium'],
  ['Be', 'Beryl', 'Beryllium'],
  ['B', 'Bor', 'Boron'],
  ['C', 'Węgiel', 'Carbon'],
  ['N', 'Azot', 'Nitrogen'],
  ['O', 'Tlen', 'Oxygen'],
  ['F', 'Fluor', 'Fluorine'],
  ['Ne', 'Neon', 'Neon'],
  ['Na', 'Sód', 'Sodium'],
  ['Mg', 'Magnez', 'Magnesium'],
  ['Al', 'Glin', 'Aluminium'],
  ['Si', 'Krzem', 'Silicon'],
  ['P', 'Fosfor', 'Phosphorus'],
  ['S', 'Siarka', 'Sulfur'],
  ['Cl', 'Chlor', 'Chlorine'],
  ['Ar', 'Argon', 'Argon'],
  ['K', 'Potas', 'Potassium'],
  ['Ca', 'Wapń', 'Calcium'],
];

const STABLE = {
  1: [0, 1],
  2: [1, 2],
  3: [3, 4],
  4: [5],
  5: [5, 6],
  6: [6, 7],
  7: [7, 8],
  8: [8, 9, 10],
  9: [10],
  10: [10, 11, 12],
  11: [12],
  12: [12, 13, 14],
  13: [14],
  14: [14, 15, 16],
  15: [16],
  16: [16, 17, 18, 20],
  17: [18, 20],
  18: [18, 20, 22],
  19: [20, 22],
  20: [20, 22, 23, 24, 26, 28],
};

const sup = n =>
  String(n)
    .split('')
    .map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])
    .join('');

sim({
  id: 'atom',
  sec: 'at',
  n: L('Budowa atomu i izotopy', 'Atomic structure & isotopes'),
  d: L(
    'Dodawaj protony, neutrony i elektrony. Liczba protonów wyznacza pierwiastek, liczba neutronów — izotop, a różnica protonów i elektronów — ładunek jonu.',
    'Add protons, neutrons and electrons. The proton number sets the element, the neutron number the isotope, and the proton–electron difference the ion’s charge.'
  ),
  params: [
    { k: 'Z', l: L('Protony Z', 'Protons Z'), min: 1, max: 20, step: 1, v: 6, u: '', live: true },
    { k: 'Nn', l: L('Neutrony N', 'Neutrons N'), min: 0, max: 30, step: 1, v: 6, u: '', live: true },
    { k: 'e', l: L('Elektrony', 'Electrons'), min: 0, max: 22, step: 1, v: 6, u: '', live: true },
  ],
  autorun: true,
  dt: 1 / 60,
  step(s, p, h) {
    if (s.t > 3600) s.done = true;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const cx = w * 0.4,
      cy = h / 2;
    const A = p.Z + p.Nn;
    const shells = [2, 8, 8, 4];
    let left = p.e;
    const R0 = Math.min(w, h) * 0.15;
    for (let i = 0; i < 4; i++) {
      const n = Math.min(left, shells[i]);
      left -= n;
      const r = R0 + i * Math.min(w, h) * 0.095;
      if (n > 0 || i === 0) {
        c.save();
        c.strokeStyle = alpha(C.muted, 0.45);
        c.lineWidth = 1.2;
        c.setLineDash([3, 4]);
        c.beginPath();
        c.arc(cx, cy, r, 0, 7);
        c.stroke();
        c.restore();
      }
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + s.t * (0.9 - i * 0.18);
        circle(c, cx + r * Math.cos(a), cy + r * Math.sin(a), 6, 'c1');
        text(c, '−', cx + r * Math.cos(a), cy + r * Math.sin(a), {
          align: 'center',
          size: 11,
          weight: 800,
          color: '#fff',
        });
      }
    }
    const parts = [];
    for (let i = 0; i < A; i++) parts.push(i);
    const pr = Math.max(6.5, Math.min(w, h) * 0.022);
    let pi = 0,
      ni = 0;
    parts.forEach((q, i) => {
      const r = Math.sqrt(i) * pr * 1.05,
        a = i * 2.39996;
      const isP = (pi / p.Z <= ni / Math.max(1, p.Nn) && pi < p.Z) || ni >= p.Nn;
      if (isP) pi++;
      else ni++;
      circle(
        c,
        cx + r * Math.cos(a),
        cy + r * Math.sin(a),
        pr,
        isP ? 'c4' : C.dark ? '#7b8794' : '#a3adb8',
        C.scene,
        1
      );
    });
    const el = ELEM[p.Z - 1];
    const charge = p.Z - p.e;
    const bx = w * 0.74,
      byy = h * 0.2;
    rrect(c, bx, byy, Math.min(170, w * 0.22), 150, 12, 'paper', 'line', 1.5);
    text(c, sup(A), bx + 20, byy + 42, { size: 20, weight: 700, color: 'muted' });
    text(c, el[0], bx + 48, byy + 70, { size: 54, weight: 800 });
    text(c, String(p.Z), bx + 22, byy + 102, { size: 16, weight: 700, color: 'muted' });
    if (charge)
      text(
        c,
        (Math.abs(charge) > 1 ? Math.abs(charge) : '') + (charge > 0 ? '+' : '−'),
        bx + 50 + c.measureText(el[0]).width * 4.2,
        byy + 38,
        { size: 18, weight: 800, color: charge > 0 ? 'c4' : 'c1' }
      );
    text(c, lang === 'pl' ? el[1] : el[2], bx + 20, byy + 132, { size: 14, weight: 650, color: 'muted' });
    const st = STABLE[p.Z].includes(p.Nn);
    text(
      c,
      st
        ? lang === 'pl'
          ? 'izotop trwały'
          : 'stable isotope'
        : lang === 'pl'
          ? 'izotop nietrwały (promieniotwórczy)'
          : 'unstable (radioactive) isotope',
      bx,
      byy + 176,
      { size: 13, weight: 700, color: st ? 'ok' : 'warn' }
    );
    legend(
      c,
      [
        [lang === 'pl' ? 'proton' : 'proton', 'c4'],
        [lang === 'pl' ? 'neutron' : 'neutron', C.dark ? '#7b8794' : '#a3adb8'],
        [lang === 'pl' ? 'elektron' : 'electron', 'c1'],
      ],
      16,
      h - 18
    );
    text(
      c,
      lang === 'pl' ? 'model dydaktyczny — nie w skali' : 'teaching model — not to scale',
      w - 16,
      h - 18,
      { align: 'right', size: 11, color: 'muted' }
    );
  },
  read(s, p) {
    const el = ELEM[p.Z - 1];
    const ch = p.Z - p.e;
    return [
      [
        L('Pierwiastek', 'Element'),
        L(el[1] + ' (' + el[0] + ')', el[2] + ' (' + el[0] + ')'),
        '',
        null,
        true,
      ],
      [L('Liczba masowa A = Z + N', 'Mass number A = Z + N'), p.Z + p.Nn, '', 0],
      [
        L('Ładunek', 'Charge'),
        ch === 0 ? L('obojętny (0)', 'neutral (0)') : (ch > 0 ? '+' : '−') + Math.abs(ch),
        '',
        null,
      ],
      [L('Zapis izotopu', 'Isotope notation'), el[0] + '-' + (p.Z + p.Nn), '', null],
      [
        L('Trwałość', 'Stability'),
        STABLE[p.Z].includes(p.Nn) ? L('trwały', 'stable') : L('nietrwały', 'unstable'),
        '',
        null,
      ],
      [L('Trwałe izotopy (N)', 'Stable isotopes (N)'), STABLE[p.Z].join(', '), '', null, true],
    ];
  },
  f: [
    L('A = Z + N (liczba nukleonów)', 'A = Z + N (nucleon number)'),
    L('izotopy: to samo Z, różne N', 'isotopes: same Z, different N'),
    L('jon: liczba elektronów ≠ Z', 'ion: number of electrons ≠ Z'),
  ],
  model: L(
    'Rozmieszczenie elektronów na uproszczonych powłokach (2, 8, 8, …). Rozmiary jądra i atomu nie są w skali — rzeczywisty atom jest ok. 100 000 razy większy od jądra.',
    'Electrons on simplified shells (2, 8, 8, …). Nucleus and atom sizes are not to scale — a real atom is about 100,000 times larger than its nucleus.'
  ),
  q: [
    L('Czym różnią się izotopy tego samego pierwiastka?', 'How do isotopes of the same element differ?'),
    L('Co się zmieni po dodaniu jednego protonu?', 'What changes when one proton is added?'),
  ],
  task: {
    q: L(
      'Węgiel-14 ma 6 protonów. Ile ma neutronów?',
      'Carbon-14 has 6 protons. How many neutrons does it have?'
    ),
    o: ['6', '8', '14', '20'],
    a: 1,
    ex: L('N = A − Z = 14 − 6 = 8.', 'N = A − Z = 14 − 6 = 8.'),
  },
});
