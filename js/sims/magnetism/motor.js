/**
 * Magnetyzm / Magnetism — simulation `motor`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'motor',
  sec: 'mag',
  n: L('Silnik elektryczny', 'Electric motor'),
  d: L(
    'Ramka z prądem w polu magnetycznym: siły elektrodynamiczne tworzą moment obrotowy, a komutator zmienia kierunek prądu co pół obrotu.',
    'A current loop in a magnetic field: magnetic forces create torque, and the commutator reverses the current every half turn.'
  ),
  params: [
    { k: 'I', l: L('Natężenie I', 'Current I'), min: 0, max: 5, step: 0.1, v: 2, u: 'A', live: true },
    {
      k: 'B',
      l: L('Indukcja pola B', 'Magnetic field B'),
      min: 0.05,
      max: 1,
      step: 0.05,
      v: 0.4,
      u: 'T',
      live: true,
    },
    {
      k: 'N',
      l: L('Liczba zwojów ramki', 'Turns in the loop'),
      min: 1,
      max: 50,
      step: 1,
      v: 20,
      u: '',
      live: true,
    },
  ],
  dt: 1 / 600,
  keepRun: true,
  init(s, p) {
    s.th = 0.3;
    s.w = 0;
  },
  step(s, p, h) {
    const A = 0.04 * 0.04,
      Fl = p.N * p.B * p.I * 0.04;
    const tq = Fl * 0.04 * Math.abs(Math.cos(s.th));
    const fr = 0.004 * s.w + 0.0005 * Math.sign(s.w);
    const J = 2e-5;
    s.w += ((tq - fr) / J) * h * 0.02;
    if (s.w < 0) s.w = 0;
    s.th += s.w * h;
    s.tq = tq;
    if (s.t > 600) s.done = true;
  },
  sample: s => ({ w: (s.w * 60) / (2 * Math.PI) }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const cx = w * 0.42,
      cy = h / 2,
      R = Math.min(w, h) * 0.26;
    rrect(c, cx - R - 110, cy - R * 0.9, 70, R * 1.8, 6, 'c4');
    text(c, 'N', cx - R - 75, cy, { align: 'center', size: 20, weight: 800, color: '#fff' });
    rrect(c, cx + R + 40, cy - R * 0.9, 70, R * 1.8, 6, 'c1');
    text(c, 'S', cx + R + 75, cy, { align: 'center', size: 20, weight: 800, color: '#fff' });
    for (let i = -2; i <= 2; i++)
      arrow(
        c,
        cx - R - 30,
        cy + i * R * 0.35,
        cx + R + 30,
        cy + i * R * 0.35,
        alpha(C.c5, 0.35),
        i === 2 ? 'B' : '',
        { w: 1.4, head: 8 }
      );
    const x1 = cx + R * Math.cos(s.th + Math.PI / 2),
      y1 = cy - R * Math.sin(s.th + Math.PI / 2),
      x2 = cx - R * Math.cos(s.th + Math.PI / 2),
      y2 = cy + R * Math.sin(s.th + Math.PI / 2);
    line(c, x1, y1, x2, y2, 'obj', 4);
    circle(c, cx, cy, 5, 'obj');
    const sgn = Math.sin(s.th + Math.PI / 2) >= 0 ? 1 : -1;
    const Fk = clamp((p.N * p.B * p.I) / 20, 0, 1) * 90;
    const wireX = (x, y, out) => {
      circle(c, x, y, 13, 'paper', 'c2', 2.5);
      if (out) circle(c, x, y, 4, 'c2');
      else {
        line(c, x - 6, y - 6, x + 6, y + 6, 'c2', 2.5);
        line(c, x - 6, y + 6, x + 6, y - 6, 'c2', 2.5);
      }
    };
    wireX(x1, y1, sgn > 0);
    wireX(x2, y2, sgn < 0);
    if (p.I > 0) {
      arrow(c, x1, y1 - 16 * (sgn > 0 ? 1 : -1) * 0, x1, y1 - (sgn > 0 ? 1 : -1) * Fk * -1, 'c3', 'F');
      arrow(c, x2, y2, x2, y2 - (sgn > 0 ? 1 : -1) * Fk, 'c3', 'F');
    }
    text(
      c,
      (lang === 'pl' ? 'obroty: ' : 'speed: ') +
        fmt((s.w * 60) / (2 * Math.PI), 0) +
        ' obr/min'.replace('obr/min', lang === 'pl' ? 'obr/min' : 'rpm'),
      16,
      20,
      { size: 14, weight: 700, color: 'c3' }
    );
    text(c, lang === 'pl' ? 'widok wzdłuż osi obrotu' : 'view along the rotation axis', 16, 40, {
      size: 12,
      color: 'muted',
    });
  },
  read: (s, p) => [
    [L('Siła na bok ramki F = NBIl', 'Force on a side F = NBIl'), p.N * p.B * p.I * 0.04, 'N', 3],
    [L('Moment siły', 'Torque'), (s.tq || 0) * 1000, 'mN·m', 2],
    [
      L('Prędkość obrotowa', 'Rotation speed'),
      (s.w * 60) / (2 * Math.PI),
      lang === 'pl' ? 'obr/min' : 'rpm',
      0,
    ],
  ],
  charts: [
    { name: 'n(t)', xl: 't [s]', yl: lang === 'pl' ? 'n [obr/min]' : 'n [rpm]', ser: [{ k: 'w', c: 'c3' }] },
  ],
  f: [
    'F = B·I·l·N',
    'M = F·d·cosθ',
    L('komutator odwraca prąd co ½ obrotu', 'the commutator reverses the current every ½ turn'),
  ],
  model: L(
    'Ramka kwadratowa 4 × 4 cm, tarcie proporcjonalne do prędkości. Model jakościowy.',
    'A 4 × 4 cm square loop, friction proportional to speed. Qualitative model.'
  ),
  q: [
    L(
      'Jak zmieni się kierunek obrotu po odwróceniu prądu lub pola?',
      'How does the rotation direction change if the current or field is reversed?'
    ),
    L('Po co w silniku komutator?', 'Why does a motor need a commutator?'),
  ],
  task: {
    q: L(
      'Siła działająca na przewodnik z prądem w polu magnetycznym rośnie, gdy:',
      'The force on a current-carrying wire in a magnetic field increases when:'
    ),
    o: [
      L('zmniejszamy prąd', 'the current decreases'),
      L('zwiększamy B lub I', 'B or I increases'),
      L('przewodnik jest równoległy do linii pola', 'the wire is parallel to the field'),
      L('zmieniamy kolor magnesu', 'the magnet colour changes'),
    ],
    a: 1,
    ex: L(
      'F = B·I·l — siła jest proporcjonalna do indukcji pola i natężenia prądu.',
      'F = B·I·l — the force is proportional to the field and the current.'
    ),
  },
});
