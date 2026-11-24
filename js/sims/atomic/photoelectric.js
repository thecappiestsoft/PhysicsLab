/**
 * Fizyka atomowa / Atomic physics — simulation `photo`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const METALS = [
  ['2.14', L('cez Cs (W = 2,14 eV)', 'caesium Cs (W = 2.14 eV)')],
  ['2.28', L('sód Na (W = 2,28 eV)', 'sodium Na (W = 2.28 eV)')],
  ['2.87', L('wapń Ca (W = 2,87 eV)', 'calcium Ca (W = 2.87 eV)')],
  ['4.33', L('cynk Zn (W = 4,33 eV)', 'zinc Zn (W = 4.33 eV)')],
  ['4.7', L('miedź Cu (W = 4,70 eV)', 'copper Cu (W = 4.70 eV)')],
];

sim({
  id: 'photo',
  sec: 'at',
  n: L('Efekt fotoelektryczny', 'Photoelectric effect'),
  d: L(
    'Oświetlaj metal światłem o różnej długości fali i natężeniu. Poniżej częstotliwości progowej elektrony nie są emitowane — niezależnie od natężenia.',
    'Shine light of different wavelength and intensity on a metal. Below the threshold frequency no electrons are emitted — whatever the intensity.'
  ),
  params: [
    {
      k: 'lam',
      l: L('Długość fali λ', 'Wavelength λ'),
      min: 150,
      max: 750,
      step: 5,
      v: 450,
      u: 'nm',
      live: true,
    },
    {
      k: 'I',
      l: L('Natężenie światła', 'Light intensity'),
      min: 0,
      max: 100,
      step: 5,
      v: 50,
      u: '%',
      live: true,
    },
    { k: 'W', type: 'sel', l: L('Metal katody', 'Cathode metal'), o: METALS, v: '2.28', live: true },
  ],
  dt: 1 / 120,
  autorun: true,
  init(s, p) {
    s.ph = [];
    s.el = [];
    s.acc = 0;
    s.cnt = [];
  },
  Ef(p) {
    return 1239.84 / p.lam;
  },
  step(s, p, h) {
    s.acc += h * p.I * 0.5;
    while (s.acc >= 1) {
      s.acc--;
      s.ph.push({ u: 0, y: 0.2 + Math.random() * 0.6 });
    }
    const E = this.Ef(p),
      W = +p.W,
      Ek = E - W;
    s.ph.forEach(q => {
      q.u += h * 1.4;
      if (q.u >= 1) {
        q.dead = true;
        if (Ek > 0) {
          const a = (Math.random() - 0.5) * 1.4;
          const v = 0.25 + Math.sqrt(Ek) * 0.35;
          s.el.push({ x: 0.62, y: q.y * 0.7 + 0.15, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 });
          s.cnt.push(s.t);
        }
      }
    });
    s.ph = s.ph.filter(q => !q.dead);
    s.el.forEach(e => {
      e.x += e.vx * h;
      e.y += e.vy * h;
      if (e.x > 1.05 || e.y < -0.05 || e.y > 1.05 || e.x < 0.6) e.dead = true;
    });
    s.el = s.el.filter(e => !e.dead);
    while (s.cnt.length && s.cnt[0] < s.t - 1) s.cnt.shift();
    if (s.t > 3600) s.done = true;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const plateX = w * 0.62;
    const colr = wlColor(p.lam);
    const lx = w * 0.08,
      ly = h * 0.18;
    rrect(c, lx - 30, ly - 20, 60, 40, 8, 'obj');
    circle(c, lx + 30, ly, 10, colr);
    c.save();
    c.globalAlpha = 0.12 + (p.I / 100) * 0.25;
    c.fillStyle = colr;
    c.beginPath();
    c.moveTo(lx + 30, ly - 12);
    c.lineTo(plateX, h * 0.15);
    c.lineTo(plateX, h * 0.85);
    c.lineTo(lx + 30, ly + 12);
    c.closePath();
    c.fill();
    c.restore();
    s.ph.forEach(q => {
      const x0 = lx + 30,
        y0 = ly;
      const x = lerp(x0, plateX, q.u),
        y = lerp(y0, h * (q.y * 0.7 + 0.15), q.u);
      c.save();
      c.strokeStyle = colr;
      c.lineWidth = 2;
      c.beginPath();
      for (let k = 0; k < 18; k++) {
        const xx = x - k * 1.5,
          yy =
            y - (k * 1.5 * (h * (q.y * 0.7 + 0.15) - y0)) / (plateX - x0) + Math.sin(k * 1.2 - s.t * 30) * 3;
        k ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
      c.restore();
    });
    rrect(c, plateX, h * 0.12, 16, h * 0.76, 3, '#9aa5b1', 'obj', 1.5);
    text(c, tr(METALS.find(m => m[0] === p.W)[1]).split(' (')[0], plateX + 8, h * 0.94, {
      align: 'center',
      size: 12,
      weight: 650,
      color: 'muted',
    });
    s.el.forEach(e => {
      circle(c, e.x * w, e.y * h, 4.5, 'c1');
      text(c, '−', e.x * w, e.y * h, { align: 'center', size: 9, weight: 800, color: '#fff' });
    });
    const E = this.Ef(p),
      ok = E >= +p.W;
    text(
      c,
      ok
        ? lang === 'pl'
          ? 'elektrony są emitowane'
          : 'electrons are emitted'
        : lang === 'pl'
          ? 'brak emisji — za mała energia fotonu'
          : 'no emission — photon energy too low',
      16,
      h - 16,
      { size: 13, weight: 700, color: ok ? 'ok' : 'bad' }
    );
    const sx = w * 0.08,
      sw = w * 0.42,
      sy = h - 60;
    for (let i = 0; i < sw; i++) {
      const nm = 150 + (i / sw) * 600;
      c.fillStyle = nm < 380 ? alpha(C.c5, 0.25) : nm > 750 ? '#000' : wlColor(nm, 0.85);
      c.fillRect(sx + i, sy, 1, 10);
    }
    const mx = sx + ((p.lam - 150) / 600) * sw;
    line(c, mx, sy - 6, mx, sy + 16, 'ink', 2);
    text(c, p.lam < 380 ? 'UV' : '', sx + 4, sy - 8, { size: 10, color: 'muted' });
  },
  read(s, p) {
    const E = this.Ef(p),
      W = +p.W,
      f = 2.998e8 / (p.lam * 1e-9);
    return [
      [L('Częstotliwość f', 'Frequency f'), f / 1e14, '·10¹⁴ Hz', 2],
      [L('Energia fotonu E = hf', 'Photon energy E = hf'), E, 'eV', 2],
      [L('Praca wyjścia W', 'Work function W'), W, 'eV', 2],
      [L('Maks. energia elektronów', 'Max electron energy'), Math.max(0, E - W), 'eV', 2],
      [L('Częstotliwość progowa f₀', 'Threshold frequency f₀'), W / 4.1357e-15 / 1e14, '·10¹⁴ Hz', 2],
      [L('Graniczna długość fali λ₀', 'Threshold wavelength λ₀'), 1239.84 / W, 'nm', 0],
      [L('Elektrony / s (model)', 'Electrons / s (model)'), s.cnt.length, '', 0],
    ];
  },
  charts: [
    {
      name: L('Ek,max(f)', 'Ek,max(f)'),
      fn: p => {
        const ser = METALS.map((m, i) => {
          const W = +m[0];
          const f0 = W / 4.1357e-15 / 1e14;
          return {
            n: L(tr(m[1]).split(' ')[1], tr(m[1]).split(' ')[1]),
            c: 'c' + (i + 1),
            dash: m[0] === p.W ? null : [4, 4],
            pts: [
              [f0, 0],
              [20, 4.1357e-15 * 20e14 - W],
            ],
          };
        });
        const f = 2.998e8 / (p.lam * 1e-9) / 1e14;
        return {
          xl: 'f [10¹⁴ Hz]',
          yl: 'Ek [eV]',
          xmin: 4,
          xmax: 20,
          ymin: 0,
          ymax: 6,
          ser,
          marker: [f, Math.max(0, 4.1357e-15 * f * 1e14 - +p.W)],
        };
      },
    },
  ],
  f: ['E = h·f = h·c/λ', 'Ek,max = h·f − W', 'f₀ = W/h', 'h = 6,63·10⁻³⁴ J·s = 4,14·10⁻¹⁵ eV·s'],
  model: L(
    'Liczba emitowanych elektronów jest proporcjonalna do natężenia (gdy f ≥ f₀); energia każdego elektronu zależy tylko od f. Kolor na pasku widma dla UV jest umowny.',
    'The number of emitted electrons is proportional to intensity (when f ≥ f₀); each electron’s energy depends only on f. The colour for UV on the spectrum bar is symbolic.'
  ),
  q: [
    L(
      'Czy zwiększenie natężenia światła poniżej częstotliwości progowej wywoła efekt fotoelektryczny?',
      'Does increasing intensity below the threshold frequency cause emission?'
    ),
    L(
      'Jak zmieni się energia fotoelektronów po zwiększeniu częstotliwości światła?',
      'How does the photoelectron energy change when the frequency increases?'
    ),
  ],
  task: {
    q: L(
      'Co się stanie po zwiększeniu natężenia światła (powyżej f₀)?',
      'What happens when the light intensity increases (above f₀)?'
    ),
    o: [
      L('wzrośnie energia elektronów', 'electron energy increases'),
      L('wzrośnie liczba elektronów', 'more electrons are emitted'),
      L('zmaleje praca wyjścia', 'the work function decreases'),
      L('nic się nie zmieni', 'nothing changes'),
    ],
    a: 1,
    ex: L(
      'Większe natężenie = więcej fotonów = więcej elektronów; energia pojedynczego elektronu zależy tylko od częstotliwości.',
      'More intensity = more photons = more electrons; each electron’s energy depends only on frequency.'
    ),
  },
});
