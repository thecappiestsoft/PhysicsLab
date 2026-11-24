/**
 * Mechanika / Mechanics — simulation `proj`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'proj',
  sec: 'mech',
  n: L('Rzut ukośny', 'Projectile motion'),
  d: L(
    'Rzut pod kątem do poziomu: ruch jednostajny w poziomie i jednostajnie zmienny w pionie. Szukaj kąta dającego największy zasięg.',
    'A projectile launched at an angle: uniform motion horizontally and uniformly changing motion vertically. Find the angle with the greatest range.'
  ),
  params: [
    {
      k: 'v0',
      l: L('Prędkość początkowa v₀', 'Initial speed v₀'),
      min: 5,
      max: 40,
      step: 0.5,
      v: 20,
      u: 'm/s',
    },
    { k: 'ang', l: L('Kąt rzutu α', 'Launch angle α'), min: 0, max: 90, step: 1, v: 45, u: '°' },
    { k: 'h0', l: L('Wysokość początkowa h₀', 'Initial height h₀'), min: 0, max: 30, step: 1, v: 0, u: 'm' },
    { k: 'g', type: 'sel', l: L('Grawitacja', 'Gravity'), o: G_OPTS, v: 9.81 },
    { k: 'ghost', type: 'chk', l: L('Pokaż poprzednie tory', 'Show previous paths'), v: true, live: true },
  ],
  init(s, p) {
    s.x = 0;
    s.y = p.h0;
    const a = p.ang * DEG;
    s.vx = p.v0 * Math.cos(a);
    s.vy = p.v0 * Math.sin(a);
    s.path = [[0, p.h0]];
    E.ghosts = E.ghosts || [];
  },
  step(s, p, h) {
    const t = s.t + h,
      a = p.ang * DEG;
    s.x = p.v0 * Math.cos(a) * t;
    s.y = p.h0 + p.v0 * Math.sin(a) * t - 0.5 * p.g * t * t;
    s.vy = p.v0 * Math.sin(a) - p.g * t;
    if (Math.round(t * 240) % 6 === 0) s.path.push([s.x, s.y]);
    if (s.y <= 0 && t > 0.01) {
      s.y = 0;
      s.path.push([s.x, 0]);
      s.done = true;
      E.ghosts.push(s.path.slice());
      if (E.ghosts.length > 5) E.ghosts.shift();
    }
  },
  sample: s => ({ x: s.x, y: s.y, vy: s.vy, vx: s.vx }),
  geo(p) {
    const a = p.ang * DEG,
      vx = p.v0 * Math.cos(a),
      vy = p.v0 * Math.sin(a),
      T = (vy + Math.sqrt(vy * vy + 2 * p.g * p.h0)) / p.g;
    return { T, R: vx * T, H: p.h0 + (vy * vy) / (2 * p.g) };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const gm = this.geo(p);
    const maxR = Math.max(gm.R, 10),
      maxH = Math.max(gm.H, 5);
    const sc = Math.min((w - 110) / niceMax(maxR * 1.05), (h - 90) / niceMax(maxH * 1.1));
    const X = x => 60 + x * sc,
      Y = y => h - 46 - y * sc;
    ground(c, 20, w - 20, Y(0));
    const st = niceStep((w - 110) / sc, 8);
    for (let m = 0; m <= (w - 110) / sc; m += st) {
      line(c, X(m), Y(0), X(m), Y(0) + 6, 'muted', 1);
      text(c, fmt(m, 0), X(m), Y(0) + 17, { align: 'center', size: 11, color: 'muted' });
    }
    text(c, 'x [m]', w - 24, Y(0) + 17, { align: 'right', size: 11, color: 'muted' });
    if (p.h0 > 0) rrect(c, X(0) - 24, Y(p.h0), 24, Y(0) - Y(p.h0), 3, alpha(C.muted, 0.3));
    if (p.ghost && E.ghosts)
      E.ghosts.forEach(g => {
        c.save();
        c.strokeStyle = alpha(C.faint, 0.6);
        c.setLineDash([3, 4]);
        c.lineWidth = 1.4;
        c.beginPath();
        g.forEach((q, i) => (i ? c.lineTo(X(q[0]), Y(q[1])) : c.moveTo(X(q[0]), Y(q[1]))));
        c.stroke();
        c.restore();
      });
    c.save();
    c.strokeStyle = C.c1;
    c.lineWidth = 2.2;
    c.beginPath();
    s.path.forEach((q, i) => (i ? c.lineTo(X(q[0]), Y(q[1])) : c.moveTo(X(q[0]), Y(q[1]))));
    c.lineTo(X(s.x), Y(s.y));
    c.stroke();
    c.restore();
    const bx = X(s.x),
      by = Y(s.y);
    circle(c, bx, by, 9, 'c1');
    const k = 3;
    arrow(c, bx, by, bx + s.vx * k, by, 'c3', 'vₓ', { w: 2 });
    arrow(c, bx, by, bx, by - s.vy * k, 'c6', 'v_y', { w: 2 });
    arrow(c, bx, by, bx + s.vx * k, by - s.vy * k, 'c3', 'v');
    arrow(c, bx - 26, by, bx - 26, by + 30, 'c4', 'g', { w: 2 });
    if (s.t === 0) {
      c.save();
      c.strokeStyle = C.muted;
      c.beginPath();
      c.arc(X(0), Y(p.h0), 36, -p.ang * DEG, 0);
      c.stroke();
      c.restore();
      text(c, 'α = ' + p.ang + '°', X(0) + 42, Y(p.h0) - 12, { size: 12, color: 'muted' });
    }
    if (s.done)
      text(c, (lang === 'pl' ? 'zasięg ' : 'range ') + fmt(s.x, 1) + ' m', X(s.x), Y(0) - 16, {
        align: 'center',
        size: 12,
        weight: 700,
        color: 'c1',
        halo: true,
      });
  },
  read(s, p) {
    const g = this.geo(p);
    return [
      [L('Czas t', 'Time t'), s.t, 's', 2],
      ['x', s.x, 'm'],
      ['y', s.y, 'm'],
      ['vₓ', s.vx, 'm/s'],
      ['v_y', s.vy, 'm/s'],
      [L('Zasięg (teoria)', 'Range (theory)'), g.R, 'm'],
      [L('Wysokość maks.', 'Max height'), g.H, 'm'],
      [L('Czas lotu', 'Flight time'), g.T, 's', 2],
    ];
  },
  charts: [
    { name: 'y(x)', xk: 'x', xl: 'x [m]', yl: 'y [m]', ser: [{ k: 'y', c: 'c1' }] },
    {
      name: 'v(t)',
      xl: 't [s]',
      yl: 'v [m/s]',
      ser: [
        { k: 'vx', n: 'vₓ', c: 'c3' },
        { k: 'vy', n: 'v_y', c: 'c6' },
      ],
    },
  ],
  f: [
    'x = v₀·cosα·t',
    'y = h₀ + v₀·sinα·t − ½gt²',
    'Z = v₀²·sin2α / g  (h₀ = 0)',
    'h_max = h₀ + (v₀ sinα)²/(2g)',
  ],
  model: L(
    'Pomijamy opór powietrza. Dla h₀ = 0 największy zasięg daje kąt 45°.',
    'Air resistance is neglected. For h₀ = 0 the maximum range is at 45°.'
  ),
  q: [
    L('Dla jakiego kąta zasięg jest największy?', 'Which angle gives the greatest range?'),
    L('Porównaj zasięgi dla 30° i 60°.', 'Compare the ranges for 30° and 60°.'),
    L('Jak zmienia się vₓ w czasie lotu?', 'How does vₓ change during the flight?'),
  ],
  task: {
    q: L(
      'Przy h₀ = 0 który kąt da taki sam zasięg jak 30°?',
      'With h₀ = 0, which angle gives the same range as 30°?'
    ),
    o: ['45°', '60°', '75°', '90°'],
    a: 1,
    ex: L(
      'Z ∝ sin2α, a sin60° = sin120°. Kąty dopełniające do 90° dają ten sam zasięg.',
      'R ∝ sin2α and sin60° = sin120°. Complementary angles give the same range.'
    ),
  },
});
