/**
 * Optyka / Optics — simulation `refr`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const MEDIA = [
  [1, L('powietrze (1,00)', 'air (1.00)')],
  [1.33, L('woda (1,33)', 'water (1.33)')],
  [1.5, L('szkło (1,50)', 'glass (1.50)')],
  [2.42, L('diament (2,42)', 'diamond (2.42)')],
];

sim({
  id: 'refr',
  sec: 'opt',
  n: L('Załamanie i całkowite odbicie', 'Refraction & total internal reflection'),
  d: L(
    'Promień przechodzi przez granicę dwóch ośrodków. Zmieniaj kąt padania i współczynniki załamania; odkryj kąt graniczny i zasadę działania światłowodu.',
    'A ray crosses the boundary of two media. Change the angle of incidence and refractive indices; discover the critical angle and how optical fibres work.'
  ),
  params: [
    { k: 'n1', type: 'sel', l: L('Ośrodek 1 (górny)', 'Medium 1 (top)'), o: MEDIA, v: 1.5 },
    { k: 'n2', type: 'sel', l: L('Ośrodek 2 (dolny)', 'Medium 2 (bottom)'), o: MEDIA, v: 1 },
    { k: 'a', l: L('Kąt padania α', 'Angle of incidence α'), min: 0, max: 89, step: 0.5, v: 35, u: '°' },
  ],
  live: true,
  drag: true,
  calc(p) {
    const sb = (p.n1 / p.n2) * Math.sin(p.a * DEG);
    const tir = sb > 1;
    const b = tir ? null : Math.asin(sb);
    let R;
    if (tir) R = 1;
    else {
      const ci = Math.cos(p.a * DEG),
        ct = Math.cos(b);
      const rs = ((p.n1 * ci - p.n2 * ct) / (p.n1 * ci + p.n2 * ct)) ** 2,
        rp = ((p.n1 * ct - p.n2 * ci) / (p.n1 * ct + p.n2 * ci)) ** 2;
      R = (rs + rp) / 2;
    }
    return { tir, b, R, crit: p.n1 > p.n2 ? Math.asin(p.n2 / p.n1) / DEG : null };
  },
  draw(c, w, h, s, p) {
    const k = this.calc(p),
      cx = w / 2,
      cy = h / 2,
      Ld = Math.min(w, h) * 0.45;
    bg(c, w, h, false);
    const tint = n =>
      n === 1
        ? alpha(C.scene, 0)
        : n === 1.33
          ? alpha('#3b82f6', C.dark ? 0.18 : 0.12)
          : n === 1.5
            ? alpha('#64748b', C.dark ? 0.22 : 0.13)
            : alpha('#a855f7', C.dark ? 0.2 : 0.12);
    c.fillStyle = tint(p.n1);
    c.fillRect(0, 0, w, cy);
    c.fillStyle = tint(p.n2);
    c.fillRect(0, cy, w, h - cy);
    line(c, 0, cy, w, cy, 'obj', 2);
    line(c, cx, 16, cx, h - 16, 'faint', 1.2, [6, 5]);
    text(c, 'n₁ = ' + fmt(p.n1, 2), 16, 22, { size: 13, weight: 650, color: 'muted' });
    text(c, 'n₂ = ' + fmt(p.n2, 2), 16, h - 18, { size: 13, weight: 650, color: 'muted' });
    const a = p.a * DEG;
    const sx = cx - Ld * Math.sin(a),
      sy = cy - Ld * Math.cos(a);
    const beam = '#e5484d';
    arrow(c, sx, sy, cx - Ld * 0.35 * Math.sin(a), cy - Ld * 0.35 * Math.cos(a), beam, '', { w: 3 });
    line(c, sx, sy, cx, cy, beam, 3);
    circle(c, sx, sy, 9, 'c2', C.scene, 2);
    c.save();
    c.globalAlpha = clamp(k.R * 1.2 + 0.08, 0.1, 1);
    line(c, cx, cy, cx + Ld * Math.sin(a), cy - Ld * Math.cos(a), beam, 3);
    arrow(c, cx, cy, cx + Ld * 0.7 * Math.sin(a), cy - Ld * 0.7 * Math.cos(a), beam, '', { w: 3 });
    c.restore();
    if (!k.tir) {
      c.save();
      c.globalAlpha = clamp(1 - k.R, 0.1, 1);
      line(c, cx, cy, cx + Ld * Math.sin(k.b), cy + Ld * Math.cos(k.b), beam, 3);
      arrow(c, cx, cy, cx + Ld * 0.7 * Math.sin(k.b), cy + Ld * 0.7 * Math.cos(k.b), beam, '', { w: 3 });
      c.restore();
      c.save();
      c.strokeStyle = C.c3;
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(cx, cy, 56, Math.PI / 2 - k.b, Math.PI / 2);
      c.stroke();
      c.restore();
      text(c, 'β = ' + fmt(k.b / DEG, 1) + '°', cx + 14 + 56 * Math.sin(k.b / 2), cy + 70, {
        size: 13,
        weight: 700,
        color: 'c3',
        halo: true,
      });
    }
    c.save();
    c.strokeStyle = C.c1;
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(cx, cy, 56, -Math.PI / 2 - a, -Math.PI / 2);
    c.stroke();
    c.restore();
    text(c, 'α = ' + fmt(p.a, 1) + '°', cx - 20 - 56 * Math.sin(a / 2), cy - 70, {
      align: 'right',
      size: 13,
      weight: 700,
      color: 'c1',
      halo: true,
    });
    if (k.tir)
      text(c, lang === 'pl' ? 'CAŁKOWITE WEWNĘTRZNE ODBICIE' : 'TOTAL INTERNAL REFLECTION', w - 16, 22, {
        align: 'right',
        size: 14,
        weight: 800,
        color: 'c4',
      });
    if (k.crit != null)
      text(
        c,
        (lang === 'pl' ? 'kąt graniczny: ' : 'critical angle: ') + fmt(k.crit, 1) + '°',
        w - 16,
        k.tir ? 44 : 22,
        { align: 'right', size: 12, weight: 650, color: 'muted' }
      );
    text(c, lang === 'pl' ? 'przeciągnij źródło światła' : 'drag the light source', w - 16, h - 18, {
      align: 'right',
      size: 11,
      color: 'muted',
    });
  },
  down(s, p, x, y, w, h) {
    const a = p.a * DEG,
      Ld = Math.min(w, h) * 0.45,
      sx = w / 2 - Ld * Math.sin(a),
      sy = h / 2 - Ld * Math.cos(a);
    if (Math.hypot(x - sx, y - sy) < 26) {
      this.move(s, p, x, y, w, h);
      return true;
    }
    return false;
  },
  move(s, p, x, y, w, h) {
    const dx = w / 2 - x,
      dy = h / 2 - y;
    p.a = Math.round(clamp(Math.atan2(Math.max(dx, 0), Math.max(dy, 1)) / DEG, 0, 89) * 2) / 2;
  },
  hover(s, p, x, y, w, h) {
    const a = p.a * DEG,
      Ld = Math.min(w, h) * 0.45;
    return Math.hypot(x - (w / 2 - Ld * Math.sin(a)), y - (h / 2 - Ld * Math.cos(a))) < 26;
  },
  read(s, p) {
    const k = this.calc(p);
    return [
      [L('Kąt padania α', 'Angle of incidence α'), p.a, '°', 1],
      [L('Kąt załamania β', 'Angle of refraction β'), k.tir ? '—' : k.b / DEG, '°', 1],
      [L('Kąt graniczny', 'Critical angle'), k.crit == null ? '—' : k.crit, '°', 1],
      [L('Odbite światło', 'Reflected light'), k.R * 100, '%', 1],
      [
        L('Stan', 'Status'),
        k.tir
          ? L('całkowite wewnętrzne odbicie', 'total internal reflection')
          : p.n2 > p.n1
            ? L('załamanie ku normalnej', 'bends towards the normal')
            : p.n2 < p.n1
              ? L('załamanie od normalnej', 'bends away from the normal')
              : L('brak załamania', 'no refraction'),
        '',
        null,
        true,
      ],
    ];
  },
  charts: [
    {
      name: L('β(α) — teoria', 'β(α) — theory'),
      fn: p => {
        const pts = [];
        for (let a = 0; a <= 89; a += 0.5) {
          const sb = (p.n1 / p.n2) * Math.sin(a * DEG);
          pts.push([a, sb > 1 ? NaN : Math.asin(sb) / DEG]);
        }
        const k = simById.refr.calc(p);
        return {
          xl: 'α [°]',
          yl: 'β [°]',
          xmax: 90,
          ymin: 0,
          ymax: 90,
          ser: [
            { c: 'c3', pts },
            {
              c: 'faint',
              dash: [4, 4],
              pts: [
                [0, 0],
                [90, 90],
              ],
            },
          ],
          marker: k.tir ? null : [p.a, k.b / DEG],
        };
      },
    },
  ],
  f: ['n₁·sinα = n₂·sinβ', 'sinα_gr = n₂/n₁  (n₁ > n₂)', L('n = c/v', 'n = c/v')],
  model: L(
    'Płaska granica ośrodków, światło monochromatyczne. Jasność promienia odbitego wg wzorów Fresnela (światło niespolaryzowane).',
    'A flat boundary, monochromatic light. Reflected brightness from Fresnel equations (unpolarised light).'
  ),
  q: [
    L(
      'Dlaczego promień załamuje się ku normalnej przy przejściu do ośrodka optycznie gęstszego?',
      'Why does light bend towards the normal when entering an optically denser medium?'
    ),
    L('Jak działa światłowód?', 'How does an optical fibre work?'),
  ],
  task: {
    q: L(
      'Całkowite wewnętrzne odbicie może zajść, gdy światło przechodzi:',
      'Total internal reflection can occur when light goes:'
    ),
    o: [
      L('z powietrza do wody', 'from air to water'),
      L('ze szkła do powietrza', 'from glass to air'),
      L('z powietrza do szkła', 'from air to glass'),
      L('z wody do diamentu', 'from water to diamond'),
    ],
    a: 1,
    ex: L(
      'Warunek: przejście do ośrodka o mniejszym n (n₁ > n₂) i kąt padania większy od granicznego.',
      'Condition: going into a medium with lower n (n₁ > n₂) and an angle larger than the critical angle.'
    ),
  },
});
