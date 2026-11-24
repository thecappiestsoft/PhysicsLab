/**
 * Energia / Energy — simulation `track`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const TRACKS = {
  U: X => (X * X) / 5,
  flat: X => {
    const u = Math.max(0, Math.abs(X) - 2) / 3;
    return 5 * u * u;
  },
  W: X => {
    const u = X / 5;
    return 5 * (2.8 * u ** 4 - 2.4 * u * u + 0.6);
  },
};

sim({
  id: 'track',
  sec: 'en',
  n: L('Zjazd po torze', 'Skate track'),
  d: L(
    'Kulka zjeżdża po torze. Energia potencjalna zamienia się w kinetyczną, a przy tarciu część energii mechanicznej przechodzi w cieplną.',
    'A ball rolls along a track. Potential energy turns into kinetic energy; with friction some mechanical energy becomes thermal.'
  ),
  params: [
    {
      k: 'tr',
      type: 'sel',
      l: L('Kształt toru', 'Track shape'),
      o: [
        ['U', L('rynna (U)', 'half-pipe (U)')],
        ['flat', L('płaskie dno', 'flat bottom')],
        ['W', L('dwie doliny (W)', 'double valley (W)')],
      ],
      v: 'U',
    },
    { k: 'h', l: L('Wysokość startowa h', 'Start height h'), min: 0.5, max: 5, step: 0.1, v: 4, u: 'm' },
    { k: 'm', l: L('Masa m', 'Mass m'), min: 0.5, max: 10, step: 0.5, v: 2, u: 'kg' },
    {
      k: 'mu',
      l: L('Współczynnik tarcia μ', 'Friction coefficient μ'),
      min: 0,
      max: 0.3,
      step: 0.01,
      v: 0.03,
      u: '',
    },
  ],
  dt: 1 / 600,
  init(s, p) {
    const f = TRACKS[p.tr];
    let a = -5,
      b = { U: 0, flat: -2, W: -3.273 }[p.tr];
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      f(m) > p.h ? (a = m) : (b = m);
    }
    s.X = (a + b) / 2;
    s.v = 0;
    s.Q = 0;
    s.vmax = 0;
  },
  step(s, p, h) {
    const f = TRACKS[p.tr],
      g = 9.81,
      e = 1e-4,
      d = (f(s.X + e) - f(s.X - e)) / (2 * e),
      th = Math.atan(d),
      sn = Math.sin(th),
      cs = Math.cos(th);
    if (Math.abs(s.v) < 0.004 && Math.abs(sn) <= p.mu * cs) {
      s.v = 0;
      s.restT = (s.restT || 0) + h;
      if (s.restT > 1) s.done = true;
      return;
    }
    s.restT = 0;
    let a = -g * sn;
    if (s.v !== 0) a -= Math.sign(s.v) * p.mu * g * cs;
    else a -= Math.sign(-sn) * p.mu * g * cs;
    const v0 = s.v;
    s.v += a * h;
    if (p.mu > 0 && v0 !== 0 && Math.sign(s.v) !== Math.sign(v0) && Math.abs(sn) <= p.mu * cs) s.v = 0;
    s.Q += p.mu * p.m * g * cs * Math.abs(s.v) * h;
    s.X += s.v * cs * h;
    if (s.X < -5) {
      s.X = -5;
      s.v = 0;
    }
    if (s.X > 5) {
      s.X = 5;
      s.v = 0;
    }
    s.vmax = Math.max(s.vmax, Math.abs(s.v));
    if (s.t > 40) s.done = true;
  },
  en(s, p) {
    const y = TRACKS[p.tr](s.X);
    const Ek = 0.5 * p.m * s.v * s.v,
      Ep = p.m * 9.81 * y;
    return { Ek, Ep, Q: s.Q, E: Ek + Ep + s.Q, y };
  },
  sample(s, p) {
    const e = this.en(s, p);
    return { Ek: e.Ek, Ep: e.Ep, Q: e.Q, E: e.E };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const f = TRACKS[p.tr],
      bw = 150;
    const sc = Math.min((w - bw - 70) / 10.5, (h - 70) / 5.6),
      X = x => 30 + (x + 5.2) * sc,
      Y = y => h - 34 - y * sc;
    c.save();
    c.beginPath();
    for (let x = -5; x <= 5.001; x += 0.05) {
      const px = X(x),
        py = Y(f(x));
      x === -5 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.lineTo(X(5), Y(0) + 20);
    c.lineTo(X(-5), Y(0) + 20);
    c.closePath();
    c.fillStyle = alpha(C.muted, 0.15);
    c.fill();
    c.restore();
    c.save();
    c.beginPath();
    for (let x = -5; x <= 5.001; x += 0.05) {
      const px = X(x),
        py = Y(f(x));
      x === -5 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.strokeStyle = C.obj;
    c.lineWidth = 3;
    c.stroke();
    c.restore();
    line(c, X(-5.2), Y(p.h), X(5.2), Y(p.h), 'c5', 1.2, [6, 5]);
    text(c, 'h = ' + fmt(p.h, 1) + ' m', X(-5.2) + 4, Y(p.h) - 10, { size: 11, color: 'c5' });
    for (let m = 0; m <= 5; m++) {
      text(c, m + ' m', X(5.2) + 4, Y(m), { size: 10.5, color: 'muted' });
    }
    const e = 1e-4,
      d = (f(s.X + e) - f(s.X - e)) / (2 * e),
      th = Math.atan(d),
      r = 12;
    const bx = X(s.X) - Math.sin(th) * r,
      by = Y(f(s.X)) - Math.cos(th) * r;
    circle(c, bx, by, r, 'c1');
    arrow(
      c,
      bx,
      by,
      bx + s.v * Math.cos(th) * 10,
      by - s.v * Math.sin(th) * 10,
      'c3',
      Math.abs(s.v) > 0.3 ? 'v' : ''
    );
    const en = this.en(s, p),
      E0 = p.m * 9.81 * p.h;
    bars(
      c,
      w - bw - 12,
      14,
      bw,
      h - 28,
      [
        ['Ek', en.Ek, 'c3'],
        ['Ep', en.Ep, 'c1'],
        ['Q', en.Q, 'c4'],
        ['E', en.E, 'c5'],
      ],
      E0 * 1.05,
      lang === 'pl' ? 'Energia [J]' : 'Energy [J]'
    );
  },
  read(s, p) {
    const e = this.en(s, p);
    return [
      [L('Prędkość v', 'Speed v'), Math.abs(s.v), 'm/s'],
      [L('Wysokość h', 'Height h'), e.y, 'm'],
      [L('Energia kinetyczna Ek', 'Kinetic energy Ek'), e.Ek, 'J', 1],
      [L('Energia potencjalna Ep', 'Potential energy Ep'), e.Ep, 'J', 1],
      [L('Energia cieplna Q', 'Thermal energy Q'), e.Q, 'J', 1],
      [L('Energia całkowita', 'Total energy'), e.E, 'J', 1],
      [L('v_max bez tarcia √(2gh)', 'v_max frictionless √(2gh)'), Math.sqrt(2 * 9.81 * p.h), 'm/s'],
      [L('v_max zmierzona', 'Measured v_max'), s.vmax, 'm/s'],
    ];
  },
  charts: [
    {
      name: L('E(t)', 'E(t)'),
      xl: 't [s]',
      yl: 'E [J]',
      ser: [
        { k: 'Ek', n: 'Ek', c: 'c3' },
        { k: 'Ep', n: 'Ep', c: 'c1' },
        { k: 'Q', n: 'Q', c: 'c4' },
        { k: 'E', n: 'E', c: 'c5' },
      ],
    },
  ],
  f: [
    'Ek = ½mv²',
    'Ep = mgh',
    'E_mech = Ek + Ep',
    'v = √(2gh)  (μ = 0)',
    L('Q = μ·N·s (praca tarcia)', 'Q = μ·N·s (work of friction)'),
  ],
  model: L(
    'Kulka jako punkt materialny ślizga się bez toczenia. Tarcie μ·g·cosθ (pomijamy siłę dośrodkową). Poziom odniesienia Ep: dno toru.',
    'The ball is a sliding point mass (no rolling). Friction μ·g·cosθ (centripetal term ignored). Ep reference level: bottom of the track.'
  ),
  q: [
    L(
      'Czy kulka na torze o różnym kształcie, ale tej samej wysokości startowej, osiągnie tę samą prędkość bez tarcia?',
      'Will the ball reach the same speed on differently shaped tracks from the same start height (no friction)?'
    ),
    L(
      'Gdzie trafia energia mechaniczna przy tarciu?',
      'Where does mechanical energy go when there is friction?'
    ),
  ],
  task: {
    q: L(
      'Bez tarcia kulka startuje z h = 5 m. Jaka jest jej prędkość na dnie toru?',
      'Without friction a ball starts at h = 5 m. What is its speed at the bottom?'
    ),
    o: ['5 m/s', '9,9 m/s', '49 m/s', '98 m/s'].map(x => L(x, x.replace(',', '.'))),
    a: 1,
    ex: L(
      'mgh = ½mv² ⇒ v = √(2gh) = √(2·9,81·5) ≈ 9,9 m/s — niezależnie od masy i kształtu toru.',
      'mgh = ½mv² ⇒ v = √(2gh) = √(2·9.81·5) ≈ 9.9 m/s — independent of mass and track shape.'
    ),
  },
});
