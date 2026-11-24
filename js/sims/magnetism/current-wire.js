/**
 * Magnetyzm / Magnetism — simulation `wire`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'wire',
  sec: 'mag',
  n: L('Przewodnik z prądem', 'Current-carrying wire'),
  d: L(
    'Prostoliniowy przewodnik z prądem (widok z góry, prąd prostopadle do ekranu). Linie pola to okręgi; kierunek wyznacza reguła prawej dłoni.',
    'A straight current-carrying wire (top view, current perpendicular to the screen). Field lines are circles; their direction follows the right-hand rule.'
  ),
  params: [
    {
      k: 'I',
      l: L('Natężenie I (znak = kierunek)', 'Current I (sign = direction)'),
      min: -20,
      max: 20,
      step: 0.5,
      v: 10,
      u: 'A',
    },
  ],
  autorun: true,
  dt: 1 / 60,
  step(s, p, h) {
    if (s.t > 3600) s.done = true;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const cx = w * 0.42,
      cy = h / 2,
      sgn = Math.sign(p.I);
    const n = Math.round(Math.abs(p.I) / 2.5);
    for (let i = 1; i <= 6; i++) {
      const r = i * Math.min(w, h) * 0.07;
      c.save();
      c.strokeStyle = alpha(C.c5, clamp((((Math.abs(p.I) / 20) * 1.2) / i) * 2, 0.08, 0.75));
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(cx, cy, r, 0, 7);
      c.stroke();
      c.restore();
      if (sgn) {
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4 - s.t * 0.3 * sgn;
          const x = cx + r * Math.cos(a),
            y = cy + r * Math.sin(a);
          const tx = -Math.sin(a) * sgn * -1,
            ty = Math.cos(a) * sgn * -1;
          arrow(c, x - tx * 5, y - ty * 5, x + tx * 6, y + ty * 6, alpha(C.c5, 0.8), '', { w: 1.6, head: 8 });
        }
      }
    }
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6,
        r = Math.min(w, h) * 0.21;
      const x = cx + r * Math.cos(a),
        y = cy + r * Math.sin(a);
      compass(c, x, y, 12, sgn ? a - (Math.PI / 2) * sgn : 0);
    }
    circle(c, cx, cy, 18, 'paper', 'obj', 2.5);
    if (sgn > 0) {
      circle(c, cx, cy, 5, 'obj');
    } else if (sgn < 0) {
      line(c, cx - 9, cy - 9, cx + 9, cy + 9, 'obj', 3);
      line(c, cx - 9, cy + 9, cx + 9, cy - 9, 'obj', 3);
    }
    const lx = w * 0.78;
    text(c, lang === 'pl' ? 'Oznaczenia' : 'Legend', lx, 40, { size: 13, weight: 700 });
    circle(c, lx + 8, 70, 9, 'paper', 'obj', 2);
    circle(c, lx + 8, 70, 3, 'obj');
    text(c, lang === 'pl' ? 'prąd do nas' : 'current out of screen', lx + 26, 70, {
      size: 12,
      color: 'muted',
    });
    circle(c, lx + 8, 100, 9, 'paper', 'obj', 2);
    line(c, lx + 3, 95, lx + 13, 105, 'obj', 2);
    line(c, lx + 3, 105, lx + 13, 95, 'obj', 2);
    text(c, lang === 'pl' ? 'prąd od nas' : 'current into screen', lx + 26, 100, {
      size: 12,
      color: 'muted',
    });
    text(c, lang === 'pl' ? 'Prąd do nas → pole przeciwnie' : 'Out of screen → field turns', lx, 140, {
      size: 12,
      color: 'muted',
    });
    text(c, lang === 'pl' ? 'do ruchu wskazówek zegara' : 'counter-clockwise', lx, 158, {
      size: 12,
      color: 'muted',
    });
  },
  read: (s, p) => {
    const B = r => ((2e-7 * Math.abs(p.I)) / r) * 1e6;
    return [
      [L('B w odległości 1 cm', 'B at 1 cm'), B(0.01), 'μT', 1],
      [L('B w odległości 5 cm', 'B at 5 cm'), B(0.05), 'μT', 1],
      [
        L('Kierunek pola', 'Field direction'),
        p.I > 0
          ? L('przeciwnie do wskazówek zegara', 'counter-clockwise')
          : p.I < 0
            ? L('zgodnie ze wskazówkami zegara', 'clockwise')
            : L('brak pola', 'no field'),
        '',
        null,
        true,
      ],
    ];
  },
  charts: [
    {
      name: L('B(r)', 'B(r)'),
      fn: p => {
        const pts = [];
        for (let r = 0.5; r <= 10; r += 0.1) pts.push([r, ((2e-7 * Math.abs(p.I)) / (r / 100)) * 1e6]);
        return { xl: 'r [cm]', yl: 'B [μT]', ymin: 0, ser: [{ c: 'c5', pts }] };
      },
    },
  ],
  f: [
    'B = μ₀·I / (2π·r)',
    'μ₀ = 4π·10⁻⁷ T·m/A',
    L('reguła prawej dłoni: kciuk — prąd, palce — pole', 'right-hand rule: thumb — current, fingers — field'),
  ],
  model: L(
    'Nieskończenie długi, prostoliniowy przewodnik. Pole Ziemi pominięte.',
    'An infinitely long straight wire. Earth’s field is ignored.'
  ),
  q: [
    L('Jak zmiana kierunku prądu wpływa na pole?', 'How does reversing the current affect the field?'),
    L(
      'Jak pole zależy od odległości od przewodnika?',
      'How does the field depend on distance from the wire?'
    ),
  ],
  task: {
    q: L(
      'Odległość od przewodnika zwiększamy 2 razy. Indukcja pola B:',
      'The distance from the wire doubles. The field B:'
    ),
    o: [
      L('rośnie 2×', 'doubles'),
      L('maleje 2×', 'halves'),
      L('maleje 4×', 'drops 4×'),
      L('nie zmienia się', 'stays the same'),
    ],
    a: 1,
    ex: L(
      'B ∝ 1/r — dwukrotnie dalej pole jest dwa razy słabsze.',
      'B ∝ 1/r — twice as far the field is half as strong.'
    ),
  },
});
