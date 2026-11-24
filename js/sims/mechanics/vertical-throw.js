/**
 * Mechanika / Mechanics — simulation `vthrow`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'vthrow',
  sec: 'mech',
  n: L('Rzut pionowy', 'Vertical throw'),
  d: L(
    'Obiekt wyrzucony w górę zwalnia, zatrzymuje się w najwyższym punkcie i spada. Przyspieszenie g cały czas skierowane jest w dół.',
    'An object thrown upwards slows down, stops momentarily at the top and falls back. The acceleration g always points down.'
  ),
  params: [
    {
      k: 'v0',
      l: L('Prędkość początkowa v₀', 'Initial speed v₀'),
      min: 1,
      max: 40,
      step: 0.5,
      v: 15,
      u: 'm/s',
    },
    { k: 'h0', l: L('Wysokość początkowa h₀', 'Initial height h₀'), min: 0, max: 30, step: 1, v: 0, u: 'm' },
    { k: 'g', type: 'sel', l: L('Grawitacja', 'Gravity'), o: G_OPTS, v: 9.81 },
  ],
  init(s, p) {
    s.y = p.h0;
    s.v = p.v0;
    s.top = null;
    s.trail = [];
  },
  step(s, p, h) {
    const t = s.t + h;
    s.y = p.h0 + p.v0 * t - 0.5 * p.g * t * t;
    const vo = s.v;
    s.v = p.v0 - p.g * t;
    if (vo > 0 && s.v <= 0) s.top = [t, s.y];
    if (Math.round(t * 240) % 24 === 0) s.trail.push(s.y);
    if (s.y <= 0 && t > 0.01) {
      s.y = 0;
      s.done = true;
    }
  },
  sample: s => ({ y: s.y, v: s.v }),
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const H = p.h0 + (p.v0 * p.v0) / (2 * p.g);
    const top = 40,
      bot = h - 44,
      sc = (bot - top) / niceMax(H * 1.05),
      Y = y => bot - y * sc,
      x = w * 0.45;
    ground(c, 20, w - 20, bot + 12);
    if (p.h0 > 0) rrect(c, x - 40, Y(p.h0) + 14, 80, bot + 12 - Y(p.h0) - 14, 4, alpha(C.muted, 0.25));
    const step = niceStep(niceMax(H * 1.05), 6);
    for (let m = 0; m <= niceMax(H * 1.05) + 1e-9; m += step) {
      line(c, 60, Y(m), w - 20, Y(m), 'line2', 1);
      text(c, fmt(m, 0) + ' m', 54, Y(m), { align: 'right', size: 11, color: 'muted' });
    }
    line(c, x - 70, Y(H), x + 70, Y(H), 'c5', 1.4, [6, 5]);
    text(c, 'h_max = ' + fmt(H, 2) + ' m', x + 78, Y(H), { size: 12, weight: 650, color: 'c5' });
    s.trail.forEach((y, i) => circle(c, x - 36, Y(y), 2.5, alpha(C.c1, 0.45)));
    circle(c, x, Y(s.y) - 12, 12, 'c1');
    arrow(c, x + 24, Y(s.y) - 12, x + 24, Y(s.y) - 12 - s.v * 4, 'c3', Math.abs(s.v) > 0.6 ? 'v' : '');
    arrow(c, x - 24, Y(s.y) - 12, x - 24, Y(s.y) - 12 + p.g * 4, 'c4', 'g');
    if (s.top)
      text(
        c,
        (lang === 'pl' ? 'v = 0 w t = ' : 'v = 0 at t = ') + fmt(s.top[0], 2) + ' s',
        x + 78,
        Y(H) + 18,
        { size: 12, color: 'muted' }
      );
  },
  read: (s, p) => [
    [L('Czas t', 'Time t'), s.t, 's', 2],
    [L('Wysokość h', 'Height h'), s.y, 'm'],
    [L('Prędkość v', 'Velocity v'), s.v, 'm/s'],
    [L('Przyspieszenie', 'Acceleration'), -p.g, 'm/s²'],
    [L('Wysokość maks. (teoria)', 'Max height (theory)'), p.h0 + (p.v0 * p.v0) / (2 * p.g), 'm'],
    [L('Czas wznoszenia v₀/g', 'Rise time v₀/g'), p.v0 / p.g, 's', 2],
  ],
  charts: [
    { name: 'h(t)', xl: 't [s]', yl: 'h [m]', ser: [{ k: 'y', c: 'c1' }] },
    { name: 'v(t)', xl: 't [s]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
  ],
  f: ['h = h₀ + v₀t − ½gt²', 'v = v₀ − gt', 'h_max = h₀ + v₀²/(2g)', 't_wzn = v₀/g'],
  model: L(
    'Pomijamy opór powietrza; g jest stałe. Oś pionowa skierowana do góry.',
    'Air resistance is neglected; g is constant. The vertical axis points up.'
  ),
  q: [
    L(
      'W którym momencie rzut pionowy osiąga maksymalną wysokość?',
      'When does a vertical throw reach its maximum height?'
    ),
    L(
      'Jak zmienia się wektor przyspieszenia podczas lotu?',
      'How does the acceleration vector change during the flight?'
    ),
  ],
  task: {
    q: L(
      'Jaka jest prędkość i przyspieszenie w najwyższym punkcie toru?',
      'What are the velocity and acceleration at the highest point?'
    ),
    o: [
      L('v = 0, a = 0', 'v = 0, a = 0'),
      L('v = 0, a = g w dół', 'v = 0, a = g downward'),
      L('v = v₀, a = 0', 'v = v₀, a = 0'),
      L('v = 0, a = g w górę', 'v = 0, a = g upward'),
    ],
    a: 1,
    ex: L(
      'W najwyższym punkcie prędkość chwilowo jest zerowa, ale grawitacja nadal działa — a = g skierowane w dół.',
      'At the top the velocity is momentarily zero, but gravity still acts — a = g pointing down.'
    ),
  },
});
