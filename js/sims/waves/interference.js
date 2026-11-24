/**
 * Drgania i fale / Oscillations & waves — simulation `interf`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'interf',
  sec: 'osc',
  n: L('Interferencja fal', 'Wave interference'),
  d: L(
    'Dwa źródła wysyłają fale kołowe. Obszary wzmocnienia i wygaszenia zależą od różnicy dróg i fazy. Przeciągnij sondę, by zmierzyć różnicę dróg.',
    'Two sources emit circular waves. Regions of reinforcement and cancellation depend on path difference and phase. Drag the probe to measure the path difference.'
  ),
  params: [
    {
      k: 'lam',
      l: L('Długość fali λ', 'Wavelength λ'),
      min: 1,
      max: 5,
      step: 0.1,
      v: 2.5,
      u: 'cm',
      live: true,
    },
    {
      k: 'd',
      l: L('Odległość źródeł d', 'Source separation d'),
      min: 1,
      max: 15,
      step: 0.5,
      v: 7.5,
      u: 'cm',
      live: true,
    },
    {
      k: 'phi',
      l: L('Przesunięcie fazy φ', 'Phase shift φ'),
      min: 0,
      max: 360,
      step: 15,
      v: 0,
      u: '°',
      live: true,
    },
    {
      k: 'view',
      type: 'sel',
      l: L('Widok', 'View'),
      o: [
        ['inst', L('chwilowe wychylenie', 'instantaneous displacement')],
        ['int', L('natężenie (średnie)', 'intensity (average)')],
      ],
      v: 'inst',
      live: true,
    },
  ],
  dt: 1 / 120,
  autorun: true,
  drag: true,
  init(s, p) {
    s.px = s.px || 0.75;
    s.py = s.py || 0.35;
  },
  step(s, p, h) {
    if (s.t > 600) s.done = true;
  },
  geom(w, h, p) {
    const sc = w / 36;
    return { sc, s1: [w * 0.12, h / 2 - (p.d / 2) * sc], s2: [w * 0.12, h / 2 + (p.d / 2) * sc] };
  },
  draw(c, w, h, s, p) {
    const R = 3,
      cw = Math.ceil(w / R),
      ch = Math.ceil(h / R);
    if (!this.off || this.off.width !== cw || this.off.height !== ch) {
      this.off = document.createElement('canvas');
      this.off.width = cw;
      this.off.height = ch;
    }
    const o = this.off.getContext('2d'),
      img = o.createImageData(cw, ch),
      D = img.data;
    const { sc, s1, s2 } = this.geom(w, h, p);
    const k = (2 * Math.PI) / (p.lam * sc),
      wt = 2 * Math.PI * 0.8 * s.t,
      ph = p.phi * DEG;
    const pos = C.dark ? [107, 156, 255] : [31, 95, 214],
      neg = C.dark ? [255, 165, 74] : [224, 122, 16],
      bgc = C.dark ? [16, 23, 29] : [252, 252, 250];
    for (let j = 0; j < ch; j++)
      for (let i = 0; i < cw; i++) {
        const x = i * R,
          y = j * R;
        const r1 = Math.hypot(x - s1[0], y - s1[1]) + 1,
          r2 = Math.hypot(x - s2[0], y - s2[1]) + 1;
        const a1 = 1 / Math.sqrt(r1 / sc + 1),
          a2 = 1 / Math.sqrt(r2 / sc + 1);
        let v;
        if (p.view === 'inst') {
          v = (a1 * Math.cos(wt - k * r1) + a2 * Math.cos(wt - k * r2 + ph)) * 0.75;
        } else {
          const re = a1 * Math.cos(k * r1) + a2 * Math.cos(k * r2 - ph),
            im = a1 * Math.sin(k * r1) + a2 * Math.sin(k * r2 - ph);
          v = Math.sqrt(re * re + im * im) * 0.75;
        }
        const q = (j * cw + i) * 4,
          u = clamp(Math.abs(v), 0, 1),
          cc = v >= 0 ? pos : neg;
        D[q] = bgc[0] + (cc[0] - bgc[0]) * u;
        D[q + 1] = bgc[1] + (cc[1] - bgc[1]) * u;
        D[q + 2] = bgc[2] + (cc[2] - bgc[2]) * u;
        D[q + 3] = 255;
      }
    o.putImageData(img, 0, 0);
    c.imageSmoothingEnabled = true;
    c.drawImage(this.off, 0, 0, w, h);
    circle(c, s1[0], s1[1], 7, 'ink', C.scene, 2);
    circle(c, s2[0], s2[1], 7, 'ink', C.scene, 2);
    text(c, 'S₁', s1[0] - 14, s1[1], { align: 'right', size: 12, weight: 700, halo: true });
    text(c, 'S₂', s2[0] - 14, s2[1], { align: 'right', size: 12, weight: 700, halo: true });
    const px = s.px * w,
      py = s.py * h;
    line(c, s1[0], s1[1], px, py, 'ink', 1, [3, 4]);
    line(c, s2[0], s2[1], px, py, 'ink', 1, [3, 4]);
    circle(c, px, py, 8, 'c4', C.scene, 2.5);
    const dr = this.dr(s, p, w, h);
    text(c, 'Δr = ' + fmt(dr, 2) + 'λ', px + 14, py - 12, { size: 12, weight: 700, halo: true });
  },
  dr(s, p, w, h) {
    const { sc, s1, s2 } = this.geom(w, h, p);
    const px = s.px * w,
      py = s.py * h;
    return (Math.hypot(px - s2[0], py - s2[1]) - Math.hypot(px - s1[0], py - s1[1])) / sc / p.lam;
  },
  down(s, p, x, y, w, h) {
    if (Math.hypot(x - s.px * w, y - s.py * h) < 26) {
      this.move(s, p, x, y, w, h);
      return true;
    }
    return false;
  },
  move(s, p, x, y, w, h) {
    s.px = clamp(x / w, 0.02, 0.98);
    s.py = clamp(y / h, 0.02, 0.98);
  },
  hover(s, p, x, y, w, h) {
    return Math.hypot(x - s.px * w, y - s.py * h) < 26;
  },
  read(s, p) {
    const cv = document.getElementById('stage');
    const w = cv ? cv.clientWidth : 800,
      h = E.stageH;
    const dr = this.dr(s, p, w, h);
    const net = dr + p.phi / 360;
    const fr = ((net % 1) + 1) % 1;
    const st =
      fr < 0.15 || fr > 0.85
        ? L('wzmocnienie', 'constructive')
        : fr > 0.35 && fr < 0.65
          ? L('wygaszenie', 'destructive')
          : L('pośrednie', 'intermediate');
    return [
      [L('Różnica dróg Δr', 'Path difference Δr'), dr * p.lam, 'cm', 2],
      [L('Δr w długościach fali', 'Δr in wavelengths'), dr, 'λ', 2],
      [L('Interferencja w sondzie', 'Interference at probe'), st, '', null, true],
    ];
  },
  f: [
    L('wzmocnienie: Δr = n·λ', 'constructive: Δr = n·λ'),
    L('wygaszenie: Δr = (n + ½)·λ', 'destructive: Δr = (n + ½)·λ'),
    L('(dla źródeł zgodnych w fazie, φ = 0)', '(for in-phase sources, φ = 0)'),
  ],
  model: L(
    'Fale kołowe o amplitudzie malejącej jak 1/√r (fale na wodzie). Skala: szerokość sceny ≈ 36 cm.',
    'Circular waves with amplitude falling as 1/√r (water waves). Scale: the scene is about 36 cm wide.'
  ),
  q: [
    L('Dlaczego dwa źródła mogą wygasić falę?', 'Why can two sources cancel a wave?'),
    L(
      'Jak zmienia się liczba prążków, gdy rośnie odległość źródeł?',
      'How does the number of fringes change when the source separation grows?'
    ),
  ],
  task: {
    q: L(
      'Źródła zgodne w fazie. W punkcie, gdzie Δr = 1,5λ, obserwujemy:',
      'In-phase sources. At a point where Δr = 1.5λ we observe:'
    ),
    o: [
      L('wzmocnienie', 'reinforcement'),
      L('wygaszenie', 'cancellation'),
      L('podwojenie częstotliwości', 'doubled frequency'),
      L('brak zmian', 'no change'),
    ],
    a: 1,
    ex: L(
      '1,5λ = (1 + ½)λ — fale docierają w przeciwnych fazach i się wygaszają.',
      '1.5λ = (1 + ½)λ — the waves arrive in opposite phase and cancel.'
    ),
  },
});
