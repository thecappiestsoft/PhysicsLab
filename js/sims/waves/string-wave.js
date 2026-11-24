/**
 * Drgania i fale / Oscillations & waves — simulation `wave`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'wave',
  sec: 'osc',
  n: L('Fala na sznurze', 'Wave on a string'),
  d: L(
    'Źródło porusza końcem sznura. Zmieniaj amplitudę, częstotliwość i prędkość fali; obserwuj długość fali, węzły i strzałki fali stojącej.',
    'A source moves the end of a string. Change amplitude, frequency and wave speed; observe the wavelength, nodes and antinodes of a standing wave.'
  ),
  params: [
    { k: 'A', l: L('Amplituda A', 'Amplitude A'), min: 1, max: 10, step: 0.5, v: 5, u: 'cm' },
    { k: 'f', l: L('Częstotliwość f', 'Frequency f'), min: 0.2, max: 3, step: 0.05, v: 1, u: 'Hz' },
    { k: 'v', l: L('Prędkość fali v', 'Wave speed v'), min: 0.5, max: 5, step: 0.1, v: 2, u: 'm/s' },
    {
      k: 'mode',
      type: 'sel',
      l: L('Rodzaj', 'Mode'),
      o: [
        ['run', L('fala biegnąca', 'travelling wave')],
        ['stand', L('odbicie od końca → fala stojąca', 'reflection → standing wave')],
      ],
      v: 'run',
    },
  ],
  dt: 1 / 240,
  autorun: true,
  init(s, p) {},
  step(s, p, h) {
    if (s.t > 600) s.done = true;
  },
  y(x, t, p) {
    const Ls = 4,
      w = 2 * Math.PI * p.f,
      k = w / p.v;
    const inc = x <= p.v * t ? p.A * Math.sin(w * t - k * x) : 0;
    if (p.mode !== 'stand') return inc;
    const tr = 2 * Ls - x;
    return inc + (tr <= p.v * t ? -p.A * Math.sin(w * t - k * tr) : 0);
  },
  sample(s, p) {
    return { y: this.y(1, s.t, p) };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const x0 = 50,
      x1 = w - 40,
      sc = (x1 - x0) / 4,
      mid = h * 0.5,
      ay = (h * 0.32) / 10;
    const Y = x => mid - this.y(x, s.t, p) * ay;
    line(c, x0, mid, x1, mid, 'faint', 1, [4, 4]);
    rrect(c, x0 - 24, mid - this.y(0, s.t, p) * ay - 14, 22, 28, 4, 'c2');
    if (p.mode === 'stand') rrect(c, x1, mid - 40, 10, 80, 2, 'obj');
    c.save();
    c.strokeStyle = C.obj;
    c.lineWidth = 2.4;
    c.beginPath();
    for (let px = 0; px <= x1 - x0; px += 2) {
      const x = px / sc,
        y = Y(x);
      px ? c.lineTo(x0 + px, y) : c.moveTo(x0, y);
    }
    c.stroke();
    c.restore();
    for (let i = 1; i < 20; i++) {
      const x = i * 0.2;
      circle(c, x0 + x * sc, Y(x), i === 5 ? 6 : 3.5, i === 5 ? 'c4' : 'c1');
    }
    const lam = p.v / p.f;
    if (lam < 4) {
      const xs = 0.2;
      const a = x0 + xs * sc,
        b = x0 + (xs + lam) * sc;
      if (b < x1) {
        line(c, a, mid + 0.36 * h * 0.5 + 8, b, mid + 0.36 * h * 0.5 + 8, 'c5', 1.5);
        line(c, a, mid + h * 0.18 + 2, a, mid + h * 0.18 + 14, 'c5', 1.5);
        line(c, b, mid + h * 0.18 + 2, b, mid + h * 0.18 + 14, 'c5', 1.5);
        text(c, 'λ = ' + fmt(lam, 2) + ' m', (a + b) / 2, mid + h * 0.18 + 24, {
          align: 'center',
          size: 12,
          weight: 700,
          color: 'c5',
        });
      }
    }
    if (p.mode === 'stand') {
      const k = (2 * Math.PI) / lam;
      for (let n = 0; ; n++) {
        const x = 4 - (n * lam) / 2;
        if (x < 0) break;
        circle(c, x0 + x * sc, mid, 4, null, 'c4', 2);
      }
    }
    ruler(c, x0, h - 34, x1, 0, 4, 0.5, 'm');
    text(
      c,
      lang === 'pl'
        ? 'czerwony punkt: x = 1 m — porusza się tylko w pionie'
        : 'red dot: x = 1 m — moves only vertically',
      16,
      20,
      { size: 12, color: 'muted' }
    );
  },
  read: (s, p) => [
    [L('Długość fali λ = v/f', 'Wavelength λ = v/f'), p.v / p.f, 'm'],
    [L('Okres T = 1/f', 'Period T = 1/f'), 1 / p.f, 's'],
    [L('Liczba falowa k', 'Wave number k'), (2 * Math.PI * p.f) / p.v, 'rad/m'],
    [L('Wychylenie punktu x = 1 m', 'Displacement at x = 1 m'), simById.wave.y(1, E.s.t, p), 'cm', 2],
  ],
  charts: [
    { name: L('y(t) punktu', 'y(t) of point'), xl: 't [s]', yl: 'y [cm]', ser: [{ k: 'y', c: 'c4' }] },
    {
      name: L('kształt y(x)', 'shape y(x)'),
      fn: (p, s) => {
        const pts = [];
        for (let x = 0; x <= 4.001; x += 0.01) pts.push([x, simById.wave.y(x, s.t, p)]);
        return { xl: 'x [m]', yl: 'y [cm]', ymin: -2.2 * p.A, ymax: 2.2 * p.A, ser: [{ c: 'c1', pts }] };
      },
    },
  ],
  f: ['v = λ·f', 'T = 1/f', 'y(x,t) = A·sin(ωt − kx)', 'ω = 2πf, k = 2π/λ'],
  model: L(
    'Sznur o długości 4 m bez tłumienia. W trybie odbicia koniec jest zamocowany (odbicie z odwróceniem fazy).',
    'A 4 m string without damping. In reflection mode the end is fixed (reflection with phase inversion).'
  ),
  q: [
    L(
      'Jak zmieni się długość fali przy stałej prędkości i większej częstotliwości?',
      'How does the wavelength change at constant speed and higher frequency?'
    ),
    L('Gdzie powstają węzły fali stojącej?', 'Where do the nodes of a standing wave form?'),
  ],
  task: {
    q: L('v = 2 m/s, f = 0,5 Hz. Ile wynosi długość fali?', 'v = 2 m/s, f = 0.5 Hz. What is the wavelength?'),
    o: ['1 m', '2 m', '4 m', '0,25 m'].map(x => L(x, x.replace(',', '.'))),
    a: 2,
    ex: L('λ = v/f = 2/0,5 = 4 m.', 'λ = v/f = 2/0.5 = 4 m.'),
  },
});
