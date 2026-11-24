/**
 * Dynamika / Dynamics — simulation `newton1`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'newton1',
  sec: 'dyn',
  n: L('I zasada Newtona', 'Newton’s 1st law'),
  d: L(
    'Na wózek działają dwie siły. Gdy się równoważą, wózek pozostaje w spoczynku lub porusza się ruchem jednostajnym. Zmień jedną siłę i zobacz, kiedy pojawia się przyspieszenie.',
    'Two forces act on a cart. When they balance, the cart stays at rest or moves uniformly. Change one force and see when acceleration appears.'
  ),
  params: [
    {
      k: 'F1',
      l: L('Siła w prawo F₁', 'Force to the right F₁'),
      min: 0,
      max: 50,
      step: 1,
      v: 20,
      u: 'N',
      live: true,
    },
    {
      k: 'F2',
      l: L('Siła w lewo F₂', 'Force to the left F₂'),
      min: 0,
      max: 50,
      step: 1,
      v: 20,
      u: 'N',
      live: true,
    },
    { k: 'v0', l: L('Prędkość początkowa', 'Initial velocity'), min: -3, max: 3, step: 0.5, v: 1, u: 'm/s' },
    { k: 'm', l: L('Masa m', 'Mass m'), min: 1, max: 20, step: 1, v: 5, u: 'kg' },
  ],
  keepRun: true,
  init(s, p) {
    s.x = 0;
    s.v = p.v0;
  },
  step(s, p, h) {
    s.a = (p.F1 - p.F2) / p.m;
    s.v += s.a * h;
    s.x += s.v * h;
    if (s.t > 20) s.done = true;
  },
  sample: (s, p) => ({ v: s.v, a: (p.F1 - p.F2) / p.m }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const gy = h * 0.66,
      ppm = 50,
      cam = s.x * ppm - w / 2;
    c.fillStyle = alpha(C.muted, C.dark ? 0.1 : 0.07);
    c.fillRect(0, gy, w, h - gy);
    ground(c, 0, w, gy);
    for (let m = Math.floor(cam / ppm) - 1; m < (cam + w) / ppm + 1; m++) {
      const x = m * ppm - cam;
      line(c, x, gy, x, gy + 8, 'muted', 1);
      if (m % 2 === 0) text(c, m + ' m', x, gy + 20, { align: 'center', size: 11, color: 'muted' });
    }
    const bx = w / 2;
    car(c, bx, gy, 110, 'c1');
    const k = 3;
    arrow(c, bx + 60, gy - 40, bx + 60 + p.F1 * k, gy - 40, 'c2', 'F₁');
    arrow(c, bx - 60, gy - 40, bx - 60 - p.F2 * k, gy - 40, 'c5', 'F₂');
    const Fw = p.F1 - p.F2;
    text(
      c,
      Fw === 0
        ? lang === 'pl'
          ? 'siły się równoważą: F_w = 0 → a = 0'
          : 'forces balance: F_net = 0 → a = 0'
        : lang === 'pl'
          ? 'F_w ≠ 0 → wózek przyspiesza'
          : 'F_net ≠ 0 → the cart accelerates',
      16,
      20,
      { size: 13, weight: 650, color: Fw === 0 ? 'c3' : 'c4' }
    );
    if (Fw) arrow(c, bx, gy - 110, bx + Fw * k, gy - 110, 'ink', 'F_w');
    arrow(c, 16, 46, 16 + s.v * 30, 46, 'c3', Math.abs(s.v) > 0.05 ? 'v' : '', { w: 2 });
  },
  read: (s, p) => [
    [L('Siła wypadkowa F_w', 'Net force F_net'), p.F1 - p.F2, 'N', 1],
    [L('Przyspieszenie a', 'Acceleration a'), (p.F1 - p.F2) / p.m, 'm/s²'],
    [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
    [L('Położenie x', 'Position x'), s.x, 'm'],
  ],
  charts: [{ name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] }],
  f: [L('ΣF = 0 ⇒ v = const', 'ΣF = 0 ⇒ v = const'), 'F_w = F₁ − F₂'],
  model: L(
    'Brak tarcia. Siły F₁ i F₂ możesz zmieniać w trakcie ruchu.',
    'No friction. You can change F₁ and F₂ while the cart is moving.'
  ),
  q: [
    L(
      'Czy ciało może poruszać się, gdy siła wypadkowa jest równa zero?',
      'Can a body move when the net force is zero?'
    ),
  ],
  task: {
    q: L(
      'Wózek jedzie 1 m/s, a siły się równoważą. Co się stanie?',
      'A cart moves at 1 m/s and the forces are balanced. What happens?'
    ),
    o: [
      L('zatrzyma się', 'it stops'),
      L('będzie jechał 1 m/s', 'it keeps moving at 1 m/s'),
      L('przyspieszy', 'it speeds up'),
      L('zawróci', 'it turns back'),
    ],
    a: 1,
    ex: L(
      'Zgodnie z I zasadą dynamiki ciało zachowuje stan ruchu jednostajnego, gdy siły się równoważą.',
      'By Newton’s first law the body keeps moving uniformly when the forces balance.'
    ),
  },
});
