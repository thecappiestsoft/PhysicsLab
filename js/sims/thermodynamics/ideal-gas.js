/**
 * Termodynamika / Thermodynamics — simulation `gas`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

function thermoK(c, x, y, hh, T) {
  rrect(c, x - 7, y - hh, 14, hh, 7, 'paper', 'line', 1.5);
  const u = clamp((T - 100) / 800, 0, 1);
  rrect(c, x - 3.5, y - 6 - u * (hh - 12), 7, u * (hh - 12) + 6, 3.5, tempColor(u * 100));
  circle(c, x, y + 6, 11, tempColor(u * 100), 'line', 1.5);
  text(c, fmt(T, 0) + ' K', x, y - hh - 12, { align: 'center', size: 12, weight: 700, mono: true });
}

sim({
  id: 'gas',
  sec: 'th',
  n: L('Gaz doskonały — model cząsteczkowy', 'Ideal gas — particle model'),
  d: L(
    'Cząsteczki gazu zderzają się ze ściankami naczynia i wywierają ciśnienie. Zmieniaj temperaturę i objętość; zapisz pomiary, aby zbadać przemiany gazowe.',
    'Gas particles hit the container walls and create pressure. Change the temperature and volume; record measurements to study gas processes.'
  ),
  params: [
    { k: 'N', l: L('Liczba cząsteczek', 'Number of particles'), min: 20, max: 300, step: 10, v: 120, u: '' },
    {
      k: 'T',
      l: L('Temperatura T', 'Temperature T'),
      min: 100,
      max: 900,
      step: 10,
      v: 300,
      u: 'K',
      live: true,
    },
    {
      k: 'V',
      l: L('Objętość V (tłok)', 'Volume V (piston)'),
      min: 0.3,
      max: 1,
      step: 0.05,
      v: 1,
      u: 'dm³',
      live: true,
    },
  ],
  dt: 1 / 240,
  autorun: true,
  keepRun: true,
  init(s, p) {
    s.P = [];
    const sd = Math.sqrt(p.T) * 8;
    for (let i = 0; i < p.N; i++) {
      const g = () => {
        let u = 0;
        for (let k = 0; k < 6; k++) u += Math.random();
        return (u - 3) / Math.sqrt(0.5);
      };
      s.P.push({
        x: Math.random() * p.V,
        y: Math.random(),
        vx: (g() * sd) / Math.SQRT2 / 130,
        vy: (g() * sd) / Math.SQRT2 / 130,
      });
    }
    s.Tcur = p.T;
    s.imp = 0;
    s.acc = 0;
    s.pm = null;
    s.Vcur = p.V;
  },
  onLive(s, p, k) {
    if (k === 'T') {
      const f = Math.sqrt(p.T / s.Tcur);
      s.P.forEach(q => {
        q.vx *= f;
        q.vy *= f;
      });
      s.Tcur = p.T;
    }
  },
  step(s, p, h) {
    if (s.Vcur !== p.V) {
      s.Vcur += clamp(p.V - s.Vcur, -0.5 * h, 0.5 * h);
      if (Math.abs(s.Vcur - p.V) < 1e-4) s.Vcur = p.V;
    }
    const Wd = s.Vcur;
    s.P.forEach(q => {
      q.x += q.vx * h;
      q.y += q.vy * h;
      if (q.x < 0) {
        q.x = -q.x;
        q.vx = -q.vx;
        s.imp += 2 * Math.abs(q.vx);
      }
      if (q.x > Wd) {
        q.x = 2 * Wd - q.x;
        q.vx = -Math.abs(q.vx);
        s.imp += 2 * Math.abs(q.vx);
      }
      if (q.y < 0) {
        q.y = -q.y;
        q.vy = -q.vy;
        s.imp += 2 * Math.abs(q.vy);
      }
      if (q.y > 1) {
        q.y = 2 - q.y;
        q.vy = -q.vy;
        s.imp += 2 * Math.abs(q.vy);
      }
    });
    s.acc += h;
    if (s.acc >= 1) {
      const per = 2 * (Wd + 1);
      const pm = s.imp / s.acc / per;
      s.pm = pm * this.kfac();
      s.imp = 0;
      s.acc = 0;
    }
    if (s.t > 3600) s.done = true;
  },
  kfac() {
    return 100 / ((120 * 300 * 64) / 16900 / 2);
  },
  pid(p) {
    return (100 * (p.N / 120) * (p.T / 300)) / p.V;
  },
  sample(s, p) {
    return { pm: s.pm, pi: this.pid(p) };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const bx = 40,
      by = 30,
      bh = h - 70,
      bw = Math.min(w * 0.62, bh * 1.6);
    const Wd = s.Vcur * bw;
    rrect(c, bx - 6, by - 6, bw + 12, bh + 12, 6, null, 'obj', 3);
    c.fillStyle = alpha(C.c1, 0.05);
    c.fillRect(bx, by, Wd, bh);
    rrect(c, bx + Wd, by - 14, 14, bh + 28, 3, 'muted');
    line(c, bx + Wd + 14, by + bh / 2, bx + bw + 60, by + bh / 2, 'muted', 5);
    const vref = ((Math.sqrt(p.T) * 8) / 130) * 1.4;
    s.P.forEach(q => {
      const sp = Math.hypot(q.vx, q.vy);
      const u = clamp(sp / (vref * 1.8), 0, 1);
      circle(c, bx + q.x * bw, by + q.y * bh, 4.2, `hsl(${lerp(220, 0, u)},80%,${C.dark ? 60 : 50}%)`);
    });
    const tx = w - 50;
    thermoK(c, tx, h - 50, h * 0.6, p.T);
    const gx = w - 150,
      gy = 70;
    c.save();
    c.beginPath();
    c.arc(gx, gy, 40, Math.PI * 0.75, Math.PI * 2.25);
    c.strokeStyle = C.obj;
    c.lineWidth = 2;
    c.stroke();
    c.restore();
    const pv = s.pm == null ? 0 : s.pm;
    const ang = Math.PI * 0.75 + clamp(pv / 600, 0, 1) * Math.PI * 1.5;
    line(c, gx, gy, gx + Math.cos(ang) * 34, gy + Math.sin(ang) * 34, 'c4', 2.5);
    circle(c, gx, gy, 4, 'obj');
    text(c, (s.pm == null ? '…' : fmt(s.pm, 0)) + ' kPa', gx, gy + 30, {
      align: 'center',
      size: 12,
      weight: 700,
      mono: true,
    });
    text(c, lang === 'pl' ? 'kolor = prędkość cząsteczki' : 'colour = particle speed', bx, h - 16, {
      size: 11,
      color: 'muted',
    });
  },
  read(s, p) {
    return [
      [L('Ciśnienie zmierzone', 'Measured pressure'), s.pm == null ? '…' : s.pm, 'kPa', 1],
      [L('Ciśnienie z równania pV = nRT', 'Pressure from pV = nRT'), this.pid(p), 'kPa', 1],
      [L('Objętość V', 'Volume V'), p.V, 'dm³', 2],
      [L('Temperatura T', 'Temperature T'), p.T, 'K', 0],
      [L('Liczba cząsteczek', 'Particles'), p.N, '', 0],
      [L('p·V / T', 'p·V / T'), (this.pid(p) * p.V) / p.T, '', 4],
    ];
  },
  charts: [
    {
      name: 'p(t)',
      xl: 't [s]',
      yl: 'p [kPa]',
      ymin: 0,
      ser: [
        { k: 'pi', n: L('teoria', 'theory'), c: 'c1', dash: [5, 4] },
        { k: 'pm', n: L('zmierzone', 'measured'), c: 'c4' },
      ],
    },
    {
      name: L('p(V) — pomiary', 'p(V) — data'),
      fn: (p, s, rows) => {
        const ks = Object.keys(rows[0] || {});
        const kp = ks.find(k => /^(Ciśnienie zmierzone|Measured pressure)/.test(k)),
          kV = ks.find(k => /^(Objętość|Volume)/.test(k));
        const pts = rows
          .map(r => [r[kV], r[kp]])
          .filter(q => typeof q[0] === 'number' && typeof q[1] === 'number');
        const iso = [];
        for (let V = 0.3; V <= 1.001; V += 0.01) iso.push([V, (100 * (p.N / 120) * (p.T / 300)) / V]);
        return {
          xl: 'V [dm³]',
          yl: 'p [kPa]',
          xmin: 0.25,
          xmax: 1.05,
          ymin: 0,
          ser: [
            { n: L('izoterma dla bieżącego T', 'isotherm for current T'), c: 'c1', dash: [5, 4], pts: iso },
            { n: L('pomiary', 'data'), c: 'c4', dots: true, pts },
          ],
        };
      },
    },
  ],
  f: [
    'p·V = n·R·T',
    'p·V / T = const',
    L('izotermiczna (T = const): p·V = const', 'isothermal (T = const): p·V = const'),
    L('izobaryczna (p = const): V/T = const', 'isobaric (p = const): V/T = const'),
    L('izochoryczna (V = const): p/T = const', 'isochoric (V = const): p/T = const'),
  ],
  model: L(
    'Model 2D: cząsteczki zderzają się tylko ze ściankami (sprężyście). Ciśnienie zmierzone liczymy z pędu przekazanego ściankom w ciągu 1 s i skalujemy tak, by dla 120 cząsteczek, 300 K i 1 dm³ wynosiło ok. 100 kPa.',
    '2D model: particles collide elastically with the walls only. Measured pressure comes from momentum transferred to the walls over 1 s, scaled so 120 particles, 300 K and 1 dm³ give about 100 kPa.'
  ),
  q: [
    L(
      'Co się stanie z ciśnieniem gazu w zamkniętym naczyniu, gdy wzrośnie temperatura?',
      'What happens to the pressure in a closed container when the temperature rises?'
    ),
    L(
      'Zmniejsz objętość dwukrotnie przy stałej temperaturze. Jak zmienia się ciśnienie?',
      'Halve the volume at constant temperature. How does the pressure change?'
    ),
  ],
  task: {
    q: L(
      'Temperaturę bezwzględną gazu podwajamy przy stałej objętości. Ciśnienie:',
      'The absolute temperature is doubled at constant volume. The pressure:'
    ),
    o: [
      L('maleje 2×', 'halves'),
      L('nie zmienia się', 'stays the same'),
      L('rośnie 2×', 'doubles'),
      L('rośnie 4×', 'quadruples'),
    ],
    a: 2,
    ex: L(
      'Przemiana izochoryczna: p/T = const, więc p rośnie 2×. Cząsteczki są szybsze i mocniej uderzają w ścianki.',
      'Isochoric process: p/T = const, so p doubles. Faster particles hit the walls harder and more often.'
    ),
  },
});
