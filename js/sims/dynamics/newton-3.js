/**
 * Dynamika / Dynamics — simulation `newton3`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'newton3',
  sec: 'dyn',
  n: L('III zasada Newtona', 'Newton’s 3rd law'),
  d: L(
    'Dwoje łyżwiarzy odpycha się od siebie. Siły akcji i reakcji mają równe wartości i przeciwne zwroty, ale działają na różne ciała.',
    'Two skaters push each other apart. Action and reaction forces are equal and opposite but act on different bodies.'
  ),
  params: [
    { k: 'm1', l: L('Masa łyżwiarza 1', 'Mass of skater 1'), min: 20, max: 120, step: 1, v: 80, u: 'kg' },
    { k: 'm2', l: L('Masa łyżwiarza 2', 'Mass of skater 2'), min: 20, max: 120, step: 1, v: 40, u: 'kg' },
    { k: 'F', l: L('Siła odpychania F', 'Push force F'), min: 50, max: 400, step: 10, v: 200, u: 'N' },
    { k: 'tp', l: L('Czas odpychania', 'Push duration'), min: 0.2, max: 1, step: 0.1, v: 0.5, u: 's' },
  ],
  init(s, p) {
    s.x1 = -0.4;
    s.x2 = 0.4;
    s.v1 = 0;
    s.v2 = 0;
    s.push = true;
  },
  step(s, p, h) {
    s.push = s.t < p.tp;
    if (s.push) {
      s.v1 -= (p.F / p.m1) * h;
      s.v2 += (p.F / p.m2) * h;
    }
    s.x1 += s.v1 * h;
    s.x2 += s.v2 * h;
    if (s.t > 6 || s.x2 > 9) s.done = true;
  },
  sample: s => ({ v1: s.v1, v2: s.v2, p1: 0, p: 0 }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const gy = h * 0.7,
      sc = Math.min(48, w / 20),
      X = x => w / 2 + x * sc;
    c.fillStyle = alpha(C.c6, C.dark ? 0.12 : 0.09);
    c.fillRect(0, gy, w, h - gy);
    line(c, 0, gy, w, gy, 'c6', 2);
    for (let m = -10; m <= 10; m += 2) {
      line(c, X(m), gy, X(m), gy + 6, 'muted', 1);
      text(c, m + ' m', X(m), gy + 18, { align: 'center', size: 10.5, color: 'muted' });
    }
    const fig = (x, m, colr, lab, dir) => {
      const sz = 0.6 + (m / 120) * 0.8,
        hh = 90 * sz;
      const cx = X(x);
      c.save();
      c.strokeStyle = col(colr);
      c.lineWidth = 5 * sz + 2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx, gy - hh * 0.45);
      c.lineTo(cx, gy - hh * 0.9);
      c.moveTo(cx, gy - hh * 0.45);
      c.lineTo(cx - 10 * sz, gy - 6);
      c.moveTo(cx, gy - hh * 0.45);
      c.lineTo(cx + 10 * sz, gy - 6);
      c.moveTo(cx, gy - hh * 0.78);
      c.lineTo(cx - dir * 24 * sz, gy - hh * 0.7);
      c.stroke();
      c.restore();
      circle(c, cx, gy - hh - 8 * sz, 11 * sz, colr);
      line(c, cx - 18, gy - 2, cx + 18, gy - 2, 'obj', 3);
      text(c, lab + ' · ' + m + ' kg', cx, gy + 36, { align: 'center', size: 12, weight: 700, color: colr });
      return gy - hh * 0.72;
    };
    const y1 = fig(s.x1, p.m1, 'c1', '1', -1),
      y2 = fig(s.x2, p.m2, 'c2', '2', 1);
    const k = 0.35;
    if (s.push) {
      arrow(c, X(s.x1) - 4, y1 - 26, X(s.x1) - 4 - p.F * k, y1 - 26, 'c4', 'F₂₁');
      arrow(c, X(s.x2) + 4, y2 - 26, X(s.x2) + 4 + p.F * k, y2 - 26, 'c4', 'F₁₂');
    }
    arrow(c, X(s.x1), gy - 140, X(s.x1) + s.v1 * 40, gy - 140, 'c3', Math.abs(s.v1) > 0.05 ? 'v₁' : '');
    arrow(c, X(s.x2), gy - 140, X(s.x2) + s.v2 * 40, gy - 140, 'c3', Math.abs(s.v2) > 0.05 ? 'v₂' : '');
    text(
      c,
      s.push
        ? (lang === 'pl' ? 'odpychanie: |F₁₂| = |F₂₁| = ' : 'pushing: |F₁₂| = |F₂₁| = ') + p.F + ' N'
        : lang === 'pl'
          ? 'po odepchnięciu — ruch jednostajny (brak tarcia)'
          : 'after the push — uniform motion (no friction)',
      16,
      20,
      { size: 13, weight: 650, color: s.push ? 'c4' : 'muted' }
    );
  },
  read: (s, p) => [
    [L('Prędkość v₁', 'Velocity v₁'), s.v1, 'm/s'],
    [L('Prędkość v₂', 'Velocity v₂'), s.v2, 'm/s'],
    [L('Pęd p₁ = m₁v₁', 'Momentum p₁ = m₁v₁'), p.m1 * s.v1, 'kg·m/s', 1],
    [L('Pęd p₂ = m₂v₂', 'Momentum p₂ = m₂v₂'), p.m2 * s.v2, 'kg·m/s', 1],
    [L('Pęd całkowity', 'Total momentum'), p.m1 * s.v1 + p.m2 * s.v2, 'kg·m/s', 1],
    [L('Stosunek |v₂/v₁|', 'Ratio |v₂/v₁|'), s.v1 ? Math.abs(s.v2 / s.v1) : p.m1 / p.m2, '', 2],
    [L('Stosunek m₁/m₂', 'Ratio m₁/m₂'), p.m1 / p.m2, '', 2],
    [L('Przyspieszenie a₁ (w trakcie)', 'Acceleration a₁ (push)'), -p.F / p.m1, 'm/s²'],
  ],
  charts: [
    {
      name: 'v(t)',
      xl: 't [s]',
      yl: 'v [m/s]',
      ser: [
        { k: 'v1', n: 'v₁', c: 'c1' },
        { k: 'v2', n: 'v₂', c: 'c2' },
      ],
    },
  ],
  f: ['F₁₂ = −F₂₁', 'a₁ = F/m₁, a₂ = F/m₂', 'm₁v₁ + m₂v₂ = 0', '|v₂/v₁| = m₁/m₂'],
  model: L(
    'Lód bez tarcia, siła odpychania stała w czasie odpychania. Pęd układu jest zachowany.',
    'Frictionless ice, constant force during the push. The total momentum is conserved.'
  ),
  q: [
    L('Dlaczego siły akcji i reakcji nie równoważą się?', 'Why don’t action and reaction forces cancel out?'),
    L('Który łyżwiarz odjedzie szybciej i dlaczego?', 'Which skater moves away faster and why?'),
  ],
  task: {
    q: L(
      'Łyżwiarz 80 kg i 40 kg odpychają się. Jaki jest stosunek ich prędkości v₂/v₁?',
      'An 80 kg and a 40 kg skater push apart. What is the speed ratio v₂/v₁?'
    ),
    o: ['1/2', '1', '2', '4'],
    a: 2,
    ex: L(
      'Siły i czasy są równe, więc pędy są równe co do wartości: v₂/v₁ = m₁/m₂ = 2.',
      'Forces and times are equal, so momenta are equal in magnitude: v₂/v₁ = m₁/m₂ = 2.'
    ),
  },
});
