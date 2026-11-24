/**
 * Energia / Energy — simulation `work`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'work',
  sec: 'en',
  n: L('Praca siły', 'Work done by a force'),
  d: L(
    'Przesuwasz skrzynię siłą działającą pod kątem α. Pracę wykonuje tylko składowa siły równoległa do przesunięcia.',
    'You pull a crate with a force at angle α. Only the force component parallel to the displacement does work.'
  ),
  params: [
    { k: 'F', l: L('Siła F', 'Force F'), min: 0, max: 100, step: 1, v: 50, u: 'N' },
    { k: 'ang', l: L('Kąt α', 'Angle α'), min: 0, max: 90, step: 1, v: 30, u: '°' },
    { k: 'd', l: L('Przesunięcie s', 'Displacement s'), min: 1, max: 10, step: 0.5, v: 5, u: 'm' },
  ],
  init(s, p) {
    s.x = 0;
    s.W = 0;
  },
  step(s, p, h) {
    s.x = Math.min(p.d, s.x + 1.2 * h);
    s.W = p.F * Math.cos(p.ang * DEG) * s.x;
    if (s.x >= p.d) s.done = true;
  },
  sample: s => ({ x: s.x, W: s.W }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const gy = h * 0.66,
      sc = (w - 200) / 10,
      X = m => 70 + m * sc;
    c.fillStyle = alpha(C.muted, C.dark ? 0.1 : 0.07);
    c.fillRect(0, gy, w, h - gy);
    ground(c, 0, w, gy);
    ruler(c, X(0), gy + 22, X(10), 0, 10, 1, 'm');
    line(c, X(p.d) + 45, gy - 110, X(p.d) + 45, gy + 8, 'c5', 1.2, [5, 4]);
    const bx = X(s.x) + 45;
    box(c, bx, gy, 90, 64, 'c2');
    const a = p.ang * DEG,
      k = 1.6,
      ox = bx + 45,
      oy = gy - 32;
    arrow(c, ox, oy, ox + p.F * k * Math.cos(a), oy - p.F * k * Math.sin(a), 'c1', 'F');
    arrow(c, ox, oy, ox + p.F * k * Math.cos(a), oy, 'c3', 'F∥', { dash: [5, 4], w: 2 });
    arrow(c, ox, oy, ox, oy - p.F * k * Math.sin(a), 'c6', 'F⊥', { dash: [5, 4], w: 2, lx: -14 });
    if (p.ang > 3) {
      c.save();
      c.strokeStyle = C.muted;
      c.beginPath();
      c.arc(ox, oy, 30, -a, 0);
      c.stroke();
      c.restore();
      text(c, 'α', ox + 38, oy - 10, { size: 12, color: 'muted' });
    }
    arrow(c, X(0) + 45, gy + 50, X(s.x) + 45, gy + 50, 'c5', s.x > 0.3 ? 's' : '', { w: 2 });
    text(c, 'W = ' + fmt(s.W, 1) + ' J', 16, 22, { size: 16, weight: 700, color: 'c3' });
  },
  read: (s, p) => [
    [L('Składowa równoległa F∥', 'Parallel component F∥'), p.F * Math.cos(p.ang * DEG), 'N', 1],
    [L('Składowa prostopadła F⊥', 'Perpendicular component F⊥'), p.F * Math.sin(p.ang * DEG), 'N', 1],
    [L('Przesunięcie', 'Displacement'), s.x, 'm', 2],
    [L('Praca wykonana W', 'Work done W'), s.W, 'J', 1],
    [L('Praca całkowita F·s·cosα', 'Total work F·s·cosα'), p.F * p.d * Math.cos(p.ang * DEG), 'J', 1],
  ],
  charts: [
    { name: 'W(s)', xk: 'x', xl: 's [m]', yl: 'W [J]', xmax: p => p.d, ser: [{ k: 'W', c: 'c3' }] },
    {
      name: L('W(α) — teoria', 'W(α) — theory'),
      fn: p => {
        const pts = [];
        for (let d = 0; d <= 90; d++) pts.push([d, p.F * p.d * Math.cos(d * DEG)]);
        return {
          xl: 'α [°]',
          yl: 'W [J]',
          ser: [{ c: 'c1', pts }],
          marker: [p.ang, p.F * p.d * Math.cos(p.ang * DEG)],
        };
      },
    },
  ],
  f: ['W = F·s·cosα', 'F∥ = F·cosα', 'W = 0  dla α = 90°'],
  model: L(
    'Skrzynia przesuwana ze stałą prędkością po gładkim podłożu; liczymy pracę tylko siły F.',
    'The crate moves at constant speed on a smooth floor; only the work of F is calculated.'
  ),
  q: [
    L(
      'Porównaj pracę wykonaną przy przesunięciu skrzyni o 2 m i 5 m.',
      'Compare the work done over 2 m and 5 m.'
    ),
    L(
      'Ile wynosi praca siły prostopadłej do przesunięcia?',
      'How much work does a force perpendicular to the displacement do?'
    ),
  ],
  task: {
    q: L(
      'F = 50 N, α = 60°, s = 4 m. Ile wynosi praca?',
      'F = 50 N, α = 60°, s = 4 m. How much work is done?'
    ),
    o: ['200 J', '173 J', '100 J', '0 J'],
    a: 2,
    ex: L('W = 50·4·cos60° = 200·0,5 = 100 J.', 'W = 50·4·cos60° = 200·0.5 = 100 J.'),
  },
});
