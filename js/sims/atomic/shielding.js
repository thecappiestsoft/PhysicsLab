/**
 * Fizyka atomowa / Atomic physics — simulation `shield`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const SH = {
  alpha: { none: 0, paper: 0, al: 0, pb: 0 },
  beta: { none: 1, paper: 0.85, al: 0.03, pb: 0 },
  gamma: { none: 1, paper: 1, al: 0.88, pb: 0.12 },
};

sim({
  id: 'shield',
  sec: 'at',
  n: L('Osłony przed promieniowaniem', 'Radiation shielding'),
  d: L(
    'Porównaj przenikliwość promieniowania α, β i γ przez papier, aluminium i ołów. Licznik pokazuje, ile cząstek dociera do detektora.',
    'Compare how α, β and γ radiation penetrate paper, aluminium and lead. The counter shows how many particles reach the detector.'
  ),
  params: [
    {
      k: 'rad',
      type: 'sel',
      l: L('Promieniowanie', 'Radiation'),
      o: [
        ['alpha', L('alfa (α) — jądra helu', 'alpha (α) — helium nuclei')],
        ['beta', L('beta (β) — elektrony', 'beta (β) — electrons')],
        ['gamma', L('gamma (γ) — fotony', 'gamma (γ) — photons')],
      ],
      v: 'beta',
    },
    {
      k: 'mat',
      type: 'sel',
      l: L('Osłona', 'Shield'),
      o: [
        ['none', L('brak', 'none')],
        ['paper', L('kartka papieru', 'sheet of paper')],
        ['al', L('aluminium 5 mm', 'aluminium 5 mm')],
        ['pb', L('ołów 5 cm', 'lead 5 cm')],
      ],
      v: 'paper',
    },
  ],
  dt: 1 / 120,
  autorun: true,
  init(s, p) {
    s.P = [];
    s.cnt = 0;
    s.hits = [];
    s.emit = 0;
  },
  step(s, p, h) {
    s.emit += h * 40;
    while (s.emit >= 1) {
      s.emit--;
      const a = (Math.random() - 0.5) * 0.5;
      s.P.push({
        x: 0.08,
        y: 0.5,
        vx: Math.cos(a),
        vy: Math.sin(a),
        pass: Math.random() < SH[p.rad][p.mat],
        life: p.rad === 'alpha' ? 0.18 + Math.random() * 0.05 : 9,
      });
    }
    const sp = p.rad === 'gamma' ? 0.9 : p.rad === 'beta' ? 0.6 : 0.3;
    s.P.forEach(q => {
      const ox = q.x;
      q.x += q.vx * sp * h;
      q.y += q.vy * sp * h;
      q.life -= Math.abs(q.vx * sp * h);
      if (p.mat !== 'none' && ox < 0.5 && q.x >= 0.5 && !q.pass) q.dead = true;
      if (q.life <= 0) q.dead = true;
      if (q.x >= 0.88 && Math.abs(q.y - 0.5) < 0.18 && !q.dead) {
        q.dead = true;
        s.hits.push(s.t);
      }
      if (q.x > 1 || q.y < 0 || q.y > 1) q.dead = true;
    });
    s.P = s.P.filter(q => !q.dead);
    while (s.hits.length && s.hits[0] < s.t - 2) s.hits.shift();
    if (s.t > 3600) s.done = true;
  },
  sample: s => ({ r: s.hits.length / 2 }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const X = x => x * w,
      Y = y => y * h;
    rrect(c, X(0.02), Y(0.38), X(0.06), Y(0.24), 6, 'obj');
    text(c, lang === 'pl' ? 'źródło' : 'source', X(0.05), Y(0.66), {
      align: 'center',
      size: 11,
      color: 'muted',
    });
    const wid = { none: 0, paper: 3, al: 10, pb: 34 }[p.mat];
    if (wid) {
      rrect(
        c,
        X(0.5) - wid / 2,
        Y(0.1),
        wid,
        Y(0.8),
        2,
        p.mat === 'paper' ? (C.dark ? '#e6e2d6' : '#f2efe6') : p.mat === 'al' ? '#b9c3cc' : '#6b7280',
        C.line,
        1
      );
      text(c, tr(this.params[1].o.find(o => o[0] === p.mat)[1]), X(0.5), Y(0.06), {
        align: 'center',
        size: 12,
        weight: 650,
        color: 'muted',
      });
    }
    rrect(c, X(0.88), Y(0.32), X(0.08), Y(0.36), 6, alpha(C.c3, 0.25), 'c3', 2);
    text(c, lang === 'pl' ? 'detektor' : 'detector', X(0.92), Y(0.74), {
      align: 'center',
      size: 11,
      color: 'muted',
    });
    const cc = p.rad === 'alpha' ? 'c4' : p.rad === 'beta' ? 'c1' : 'c5';
    s.P.forEach(q => {
      if (p.rad === 'gamma') {
        c.save();
        c.strokeStyle = C.c5;
        c.lineWidth = 1.6;
        c.beginPath();
        for (let k = 0; k < 14; k++) {
          const xx = X(q.x) - k * 1.6,
            yy = Y(q.y) + Math.sin(k * 1.4) * 3;
          k ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
        }
        c.stroke();
        c.restore();
      } else circle(c, X(q.x), Y(q.y), p.rad === 'alpha' ? 5 : 3, cc);
    });
    text(c, (lang === 'pl' ? 'zliczenia: ' : 'counts: ') + fmt(s.hits.length / 2, 1) + ' /s', 16, 22, {
      size: 15,
      weight: 700,
      color: 'c3',
    });
    text(
      c,
      lang === 'pl' ? 'model uproszczony (jakościowy)' : 'simplified (qualitative) model',
      w - 16,
      h - 14,
      { align: 'right', size: 11, color: 'muted' }
    );
  },
  read: (s, p) => [
    [L('Zliczenia detektora', 'Detector count rate'), s.hits.length / 2, '1/s', 1],
    [L('Przenikanie przez osłonę', 'Shield transmission'), SH[p.rad][p.mat] * 100, '%', 0],
    [
      L('Zasięg w powietrzu', 'Range in air'),
      p.rad === 'alpha'
        ? L('kilka cm', 'a few cm')
        : p.rad === 'beta'
          ? L('do kilku m', 'up to a few m')
          : L('bardzo duży', 'very large'),
      '',
      null,
      true,
    ],
  ],
  charts: [
    { name: L('zliczenia(t)', 'counts(t)'), xl: 't [s]', yl: '1/s', ymin: 0, ser: [{ k: 'r', c: 'c3' }] },
  ],
  f: [
    L('α: zatrzymuje kartka papieru', 'α: stopped by a sheet of paper'),
    L('β: zatrzymuje kilka mm aluminium', 'β: stopped by a few mm of aluminium'),
    L('γ: osłabia gruba warstwa ołowiu lub betonu', 'γ: weakened by thick lead or concrete'),
  ],
  model: L(
    'Model jakościowy — przepuszczalności są wartościami ilustracyjnymi, a zasięg cząstek α w powietrzu jest pokazany w skrócie.',
    'A qualitative model — transmission values are illustrative and the α range in air is shown shortened.'
  ),
  q: [
    L('Które promieniowanie jest najbardziej przenikliwe?', 'Which radiation is the most penetrating?'),
    L(
      'Dlaczego źródła α są groźne głównie po dostaniu się do organizmu?',
      'Why are α sources dangerous mainly inside the body?'
    ),
  ],
  task: {
    q: L('Promieniowanie zatrzymane przez kartkę papieru to:', 'Radiation stopped by a sheet of paper is:'),
    o: ['α', 'β', 'γ', L('wszystkie', 'all of them')],
    a: 0,
    ex: L(
      'Cząstki α są ciężkie i mają duży ładunek — silnie jonizują i szybko tracą energię.',
      'α particles are heavy and highly charged — they ionise strongly and lose energy quickly.'
    ),
  },
});
