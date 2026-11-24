/**
 * Magnetyzm / Magnetism — simulation `magfield`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'magfield',
  sec: 'mag',
  n: L('Magnes i kompas', 'Magnet and compass'),
  d: L(
    'Przesuwaj magnes sztabkowy i obserwuj igły kompasów oraz linie pola magnetycznego. Igła wskazuje kierunek pola (biegun N igły — czerwony).',
    'Move the bar magnet and watch the compass needles and field lines. A needle points along the field (red = north end).'
  ),
  params: [
    {
      k: 'ang',
      l: L('Obrót magnesu', 'Magnet rotation'),
      min: 0,
      max: 360,
      step: 5,
      v: 0,
      u: '°',
      live: true,
    },
    { k: 'flip', type: 'chk', l: L('Zamień bieguny', 'Swap poles'), v: false, live: true },
    { k: 'lines', type: 'chk', l: L('Linie pola', 'Field lines'), v: true, live: true },
    { k: 'grid', type: 'chk', l: L('Siatka kompasów', 'Compass grid'), v: true, live: true },
  ],
  drag: true,
  init(s, p) {
    s.mx = s.mx || 0.42;
    s.my = s.my || 0.5;
    s.cx = s.cx || 0.78;
    s.cy = s.cy || 0.3;
  },
  B(s, p, x, y, w, h) {
    const a = p.ang * DEG,
      Lh = Math.min(w, h) * 0.16,
      sgn = p.flip ? -1 : 1;
    const nx = s.mx * w + Math.cos(a) * Lh * sgn,
      ny = s.my * h + Math.sin(a) * Lh * sgn,
      sx = s.mx * w - Math.cos(a) * Lh * sgn,
      sy = s.my * h - Math.sin(a) * Lh * sgn;
    let dx = x - nx,
      dy = y - ny,
      r3 = Math.pow(dx * dx + dy * dy + 25, 1.5);
    let bx = dx / r3,
      by = dy / r3;
    dx = x - sx;
    dy = y - sy;
    r3 = Math.pow(dx * dx + dy * dy + 25, 1.5);
    bx -= dx / r3;
    by -= dy / r3;
    return [bx, by, nx, ny, sx, sy];
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const a = p.ang * DEG,
      Lh = Math.min(w, h) * 0.16;
    if (p.lines) {
      const [, , nx, ny, sx, sy] = this.B(s, p, 0, 0, w, h);
      c.save();
      c.strokeStyle = alpha(C.c5, 0.55);
      c.lineWidth = 1.3;
      for (let i = 0; i < 16; i++) {
        const th = (i / 16) * Math.PI * 2;
        let x = nx + Math.cos(th) * 8,
          y = ny + Math.sin(th) * 8;
        c.beginPath();
        c.moveTo(x, y);
        let n = 0;
        for (; n < 1400; n++) {
          const [bx, by] = this.B(s, p, x, y, w, h);
          const m = Math.hypot(bx, by);
          if (!m) break;
          x += (bx / m) * 3;
          y += (by / m) * 3;
          c.lineTo(x, y);
          if (Math.hypot(x - sx, y - sy) < 7 || x < -50 || x > w + 50 || y < -50 || y > h + 50) break;
          if (n % 70 === 35) {
          }
        }
        c.stroke();
      }
      c.restore();
    }
    if (p.grid) {
      const st = 46;
      for (let y = st / 2; y < h; y += st)
        for (let x = st / 2; x < w; x += st) {
          const [bx, by] = this.B(s, p, x, y, w, h);
          const d = Math.hypot(x - s.mx * w, y - s.my * h);
          if (d < Lh * 1.15) continue;
          compass(c, x, y, 12, Math.atan2(by, bx), true);
        }
    }
    magnetDraw(c, s.mx * w, s.my * h, Lh * 2.4, Lh * 0.55, a, p.flip);
    const [bx, by] = this.B(s, p, s.cx * w, s.cy * h, w, h);
    compass(c, s.cx * w, s.cy * h, 30, Math.atan2(by, bx));
    text(
      c,
      lang === 'pl' ? 'przeciągnij magnes lub duży kompas' : 'drag the magnet or the big compass',
      16,
      20,
      { size: 12, color: 'muted', halo: true }
    );
  },
  down(s, p, x, y, w, h) {
    if (Math.hypot(x - s.cx * w, y - s.cy * h) < 34) {
      s.drag = 'c';
      return true;
    }
    if (Math.hypot(x - s.mx * w, y - s.my * h) < Math.min(w, h) * 0.2) {
      s.drag = 'm';
      s.ox = x - s.mx * w;
      s.oy = y - s.my * h;
      return true;
    }
    return false;
  },
  move(s, p, x, y, w, h) {
    if (s.drag === 'c') {
      s.cx = clamp(x / w, 0.04, 0.96);
      s.cy = clamp(y / h, 0.06, 0.94);
    } else if (s.drag === 'm') {
      s.mx = clamp((x - s.ox) / w, 0.1, 0.9);
      s.my = clamp((y - s.oy) / h, 0.12, 0.88);
    }
  },
  up(s) {
    s.drag = null;
  },
  hover(s, p, x, y, w, h) {
    return (
      Math.hypot(x - s.cx * w, y - s.cy * h) < 34 ||
      Math.hypot(x - s.mx * w, y - s.my * h) < Math.min(w, h) * 0.2
    );
  },
  read(s, p) {
    const cv = document.getElementById('stage');
    const w = cv ? cv.clientWidth : 800,
      h = E.stageH;
    const [bx, by] = this.B(s, p, s.cx * w, s.cy * h, w, h);
    const [b0] = this.B(s, p, s.mx * w, s.my * h - Math.min(w, h) * 0.5, w, h);
    const d = (Math.hypot(s.cx * w - s.mx * w, s.cy * h - s.my * h) / (Math.min(w, h) * 0.16)) * 5;
    let deg = (-Math.atan2(by, bx) / DEG + 360) % 360;
    return [
      [L('Kierunek igły (0° = w prawo)', 'Needle direction (0° = right)'), deg, '°', 0],
      [L('Odległość kompasu od magnesu', 'Compass–magnet distance'), d, 'cm', 1],
      [L('Względna wartość pola', 'Relative field strength'), Math.hypot(bx, by) * 1e5, '', 2],
    ];
  },
  f: [
    L('Linie pola: od N do S na zewnątrz magnesu', 'Field lines: from N to S outside the magnet'),
    L(
      'Bieguny jednoimienne się odpychają, różnoimienne przyciągają',
      'Like poles repel, unlike poles attract'
    ),
  ],
  model: L(
    'Pole magnesu sztabkowego przybliżone polem dwóch „biegunów” (model dydaktyczny 2D). Wartości pola są względne.',
    'The bar magnet field is approximated by two “poles” (a 2D teaching model). Field values are relative.'
  ),
  q: [
    L('Gdzie pole magnesu jest najsilniejsze?', 'Where is the magnet’s field strongest?'),
    L(
      'Jak zachowa się kompas po zamianie biegunów magnesu?',
      'How does the compass react when the poles are swapped?'
    ),
  ],
  task: {
    q: L('Czerwony koniec igły kompasu (N) wskazuje:', 'The red (N) end of a compass needle points:'),
    o: [
      L('zawsze na północ geograficzną', 'always to geographic north'),
      L(
        'w kierunku linii pola, ku biegunowi S magnesu',
        'along the field lines, towards the magnet’s S pole'
      ),
      L('ku biegunowi N magnesu', 'towards the magnet’s N pole'),
      L('prostopadle do linii pola', 'perpendicular to the field lines'),
    ],
    a: 1,
    ex: L(
      'Igła ustawia się wzdłuż linii pola; jej biegun N jest przyciągany przez biegun S magnesu.',
      'The needle aligns with the field; its N end is attracted to the magnet’s S pole.'
    ),
  },
});
