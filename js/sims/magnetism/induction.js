/**
 * Magnetyzm / Magnetism — simulation `induct`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'induct',
  sec: 'mag',
  n: L('Indukcja elektromagnetyczna', 'Electromagnetic induction'),
  d: L(
    'Magnes porusza się względem cewki. Napięcie indukuje się tylko wtedy, gdy strumień pola się zmienia — jego znak zależy od kierunku ruchu.',
    'A magnet moves relative to a coil. A voltage is induced only while the magnetic flux changes — its sign depends on the direction of motion.'
  ),
  params: [
    {
      k: 'mode',
      type: 'sel',
      l: L('Ruch magnesu', 'Magnet motion'),
      o: [
        ['osc', L('automatyczny (tam i z powrotem)', 'automatic (back and forth)')],
        ['drag', L('ręczny — przeciągnij magnes', 'manual — drag the magnet')],
      ],
      v: 'osc',
    },
    { k: 'v', l: L('Prędkość magnesu', 'Magnet speed'), min: 0.1, max: 2, step: 0.05, v: 0.6, u: 'm/s' },
    { k: 'N', l: L('Liczba zwojów N', 'Number of turns N'), min: 50, max: 500, step: 10, v: 200, u: '' },
    {
      k: 'B',
      l: L('Siła magnesu B₀', 'Magnet strength B₀'),
      min: 0.05,
      max: 0.5,
      step: 0.01,
      v: 0.2,
      u: 'T',
    },
    { k: 'flip', type: 'chk', l: L('Odwróć magnes', 'Flip the magnet'), v: false },
  ],
  dt: 1 / 600,
  autorun: true,
  drag: true,
  init(s, p) {
    s.x = -0.3;
    s.U = 0;
    s.phi = this.phi(s.x, p);
    s.dragX = null;
  },
  phi(x, p) {
    const a = 0.05,
      A = Math.PI * 0.03 * 0.03;
    return ((p.flip ? -1 : 1) * p.B * A) / Math.pow(1 + (x / a) * (x / a), 1.5);
  },
  step(s, p, h) {
    let nx;
    if (p.mode === 'osc') {
      const A = 0.3,
        om = p.v / A;
      nx = -A * Math.cos(om * (s.t + h));
    } else nx = s.dragX != null ? s.dragX : s.x;
    const ph = this.phi(nx, p);
    const Ui = (-p.N * (ph - s.phi)) / h;
    s.U = s.U + (Ui - s.U) * 0.08;
    s.phi = ph;
    s.x = nx;
    if (s.t > 600) s.done = true;
  },
  sample: (s, p) => ({ U: s.U * 1000, phi: s.phi * 1e6 }),
  sc(w) {
    return (w * 0.7) / 0.8;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const cy = h * 0.42,
      cx = w * 0.5,
      sc = this.sc(w);
    const mx = cx + s.x * sc;
    c.save();
    c.strokeStyle = '#c27a2c';
    c.lineWidth = 3;
    const turns = 10;
    for (let i = 0; i < turns; i++) {
      const x = cx - 40 + i * 9;
      c.beginPath();
      c.ellipse(x, cy, 5, 46, 0, Math.PI / 2, Math.PI * 1.5);
      c.stroke();
    }
    c.restore();
    magnetDraw(c, mx, cy, 150, 34, 0, p.flip);
    c.save();
    c.strokeStyle = '#c27a2c';
    c.lineWidth = 3;
    for (let i = 0; i < turns; i++) {
      const x = cx - 40 + i * 9;
      c.beginPath();
      c.ellipse(x, cy, 5, 46, 0, -Math.PI / 2, Math.PI / 2);
      c.stroke();
    }
    c.restore();
    wire(
      c,
      [
        [cx - 40, cy + 46],
        [cx - 40, h * 0.78],
        [cx - 30, h * 0.78],
      ],
      '#c27a2c',
      2
    );
    wire(
      c,
      [
        [cx + 41, cy + 46],
        [cx + 41, h * 0.78],
        [cx + 30, h * 0.78],
      ],
      '#c27a2c',
      2
    );
    const gx = cx,
      gy = h * 0.82;
    c.save();
    c.beginPath();
    c.arc(gx, gy, 48, Math.PI, 0);
    c.fillStyle = C.paper;
    c.fill();
    c.strokeStyle = C.obj;
    c.lineWidth = 2;
    c.stroke();
    c.restore();
    const Umax = Math.max(0.05, ((p.N * p.B * Math.PI * 9e-4 * p.v) / 0.05) * 0.9);
    const ang = clamp(s.U / Umax, -1, 1) * 1.2;
    line(c, gx, gy, gx + Math.sin(ang) * 42, gy - Math.cos(ang) * 42, 'c4', 2.5);
    circle(c, gx, gy, 4, 'obj');
    text(c, 'mV', gx, gy - 16, { align: 'center', size: 10, color: 'muted' });
    text(c, '−', gx - 40, gy - 8, { size: 12, color: 'muted' });
    text(c, '+', gx + 36, gy - 8, { size: 12, color: 'muted' });
    arrow(
      c,
      mx,
      cy - 40,
      mx + (p.mode === 'osc' ? Math.sin((p.v / 0.3) * s.t) * p.v * 40 : 0),
      cy - 40,
      'c3',
      '',
      { w: 2 }
    );
    text(c, 'U = ' + fmt(s.U * 1000, 1) + ' mV', 16, 20, { size: 15, weight: 700, color: 'c4' });
    if (p.mode === 'drag')
      text(
        c,
        lang === 'pl' ? 'przeciągnij magnes w lewo i w prawo' : 'drag the magnet left and right',
        w - 16,
        20,
        { align: 'right', size: 12, color: 'muted' }
      );
  },
  down(s, p, x, y, w, h) {
    if (p.mode !== 'drag') return false;
    const mx = w * 0.5 + s.x * this.sc(w);
    if (Math.abs(x - mx) < 80 && Math.abs(y - h * 0.42) < 30) {
      s.ox = x - mx;
      s.dragX = s.x;
      E.run = true;
      updButtons();
      return true;
    }
    return false;
  },
  move(s, p, x, y, w, h) {
    s.dragX = clamp((x - s.ox - w * 0.5) / this.sc(w), -0.45, 0.45);
  },
  hover(s, p, x, y, w, h) {
    return (
      p.mode === 'drag' && Math.abs(x - (w * 0.5 + s.x * this.sc(w))) < 80 && Math.abs(y - h * 0.42) < 30
    );
  },
  read: (s, p) => [
    [L('Napięcie indukowane U', 'Induced voltage U'), s.U * 1000, 'mV', 2],
    [L('Strumień Φ', 'Flux Φ'), s.phi * 1e6, 'μWb', 2],
    [L('Położenie magnesu', 'Magnet position'), s.x * 100, 'cm', 1],
  ],
  charts: [
    { name: 'U(t)', xl: 't [s]', yl: 'U [mV]', ser: [{ k: 'U', c: 'c4' }] },
    { name: 'Φ(t)', xl: 't [s]', yl: 'Φ [μWb]', ser: [{ k: 'phi', c: 'c5' }] },
  ],
  f: [
    'U_ind = −N·ΔΦ/Δt',
    'Φ = B·S·cosα',
    L(
      'reguła Lenza: prąd indukcyjny przeciwdziała zmianie strumienia',
      'Lenz’s law: the induced current opposes the change in flux'
    ),
  ],
  model: L(
    'Cewka o promieniu 3 cm; pole magnesu na osi przybliżone polem dipola. Wartości ilustracyjne.',
    'Coil radius 3 cm; the magnet’s field on the axis is approximated by a dipole. Values are illustrative.'
  ),
  q: [
    L(
      'Dlaczego nieruchomy magnes przy cewce nie indukuje napięcia?',
      'Why does a stationary magnet next to a coil induce no voltage?'
    ),
    L(
      'Jak zmieni się znak napięcia po odwróceniu ruchu magnesu?',
      'How does the voltage sign change when the magnet’s motion reverses?'
    ),
    L('Jak zwiększyć napięcie indukowane?', 'How can you increase the induced voltage?'),
  ],
  task: {
    q: L('Kiedy w cewce indukuje się napięcie?', 'When is a voltage induced in the coil?'),
    o: [
      L('gdy magnes jest w środku cewki', 'when the magnet is inside the coil'),
      L('gdy strumień pola przez cewkę się zmienia', 'when the magnetic flux through the coil changes'),
      L('tylko przy dużej liczbie zwojów', 'only with many turns'),
      L('zawsze, gdy w pobliżu jest magnes', 'whenever a magnet is nearby'),
    ],
    a: 1,
    ex: L(
      'Zgodnie z prawem Faradaya napięcie zależy od szybkości zmian strumienia, a nie od samej jego wartości.',
      'By Faraday’s law the voltage depends on the rate of change of flux, not on the flux itself.'
    ),
  },
});
