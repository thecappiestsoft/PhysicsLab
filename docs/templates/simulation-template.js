/**
 * <Dział / Section> — simulation `my-sim`
 *
 * TEMPLATE: copy this file to js/sims/<section>/<name>.js, rename the id,
 * then add a <script src="js/sims/<section>/<name>.js"></script> line in
 * index.html. Full reference: docs/SIMULATION_API.md
 *
 * This example is a body sliding with constant acceleration.
 */
'use strict';

sim({
  id: 'my-sim', // unique, used as the page address (#my-sim)
  sec: 'mech', // mech | dyn | en | osc | el | mag | opt | th | at
  n: L('Moja symulacja', 'My simulation'),
  d: L('Krótki opis tego, co uczeń bada.', 'A short description of what the student investigates.'),

  // ── Parameters (panel on the right). Values arrive as p.<k> ──────────────
  params: [
    {
      k: 'v0',
      l: L('Prędkość początkowa v₀', 'Initial velocity v₀'),
      min: 0,
      max: 20,
      step: 0.5,
      v: 5,
      u: 'm/s',
    },
    { k: 'a', l: L('Przyspieszenie a', 'Acceleration a'), min: -3, max: 3, step: 0.1, v: 1, u: 'm/s²' },
    { k: 'trail', type: 'chk', l: L('Pokaż ślad', 'Show trail'), v: true, live: true },
  ],

  // ── Physics (no DOM here — keeps it testable in Node) ───────────────────
  init(s, p) {
    s.x = 0;
    s.v = p.v0;
    s.marks = [];
  },
  step(s, p, h) {
    s.v += p.a * h;
    s.x += s.v * h;
    if (Math.round((s.t + h) * 240) % 240 === 0) s.marks.push(s.x); // a dot every 1 s
    if (s.t >= 10 || s.x > 100 || s.x < 0) s.done = true; // stops the run
  },

  // ── Data for graphs (sampled ~30×/s while running) ──────────────────────
  sample: s => ({ x: s.x, v: s.v }),
  charts: [
    { name: 'x(t)', xl: 't [s]', yl: 'x [m]', ser: [{ k: 'x', c: 'c1' }] },
    { name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
  ],

  // ── Drawing (every frame) ───────────────────────────────────────────────
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const gy = h * 0.65,
      X = m => 40 + (m / 100) * (w - 80); // metres → pixels
    ground(c, 20, w - 20, gy);
    ruler(c, 40, gy + 24, w - 40, 0, 100, 10, 'm');
    if (p.trail) s.marks.forEach(m => circle(c, X(m), gy + 10, 3, 'c1'));
    box(c, X(s.x), gy, 60, 40, 'c2');
    arrow(c, X(s.x), gy - 60, X(s.x) + s.v * 8, gy - 60, 'c3', 'v');
    arrow(c, X(s.x), gy - 80, X(s.x) + p.a * 25, gy - 80, 'c4', 'a');
  },

  // ── Readouts: [label, value, unit, decimals, wide, skipInTable, noNoise] ─
  read: (s, p) => [
    [L('Czas t', 'Time t'), s.t, 's', 2],
    [L('Położenie x', 'Position x'), s.x, 'm'],
    [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
  ],

  // ── “Theory” and “Task” tabs ────────────────────────────────────────────
  f: ['x = v₀t + ½at²', 'v = v₀ + at'],
  model: L(
    'Punkt materialny, stałe przyspieszenie, brak oporów.',
    'Point mass, constant acceleration, no resistance.'
  ),
  q: [L('Jak a wpływa na kształt wykresu x(t)?', 'How does a affect the shape of x(t)?')],
  task: {
    q: L(
      'Ile wynosi v po 4 s, gdy v₀ = 2 m/s i a = 1 m/s²?',
      'What is v after 4 s if v₀ = 2 m/s and a = 1 m/s²?'
    ),
    o: ['4 m/s', '6 m/s', '8 m/s', '2 m/s'],
    a: 1,
    ex: L('v = v₀ + at = 2 + 1·4 = 6 m/s.', 'v = v₀ + at = 2 + 1·4 = 6 m/s.'),
  },
});
