/**
 * Fizyka atomowa / Atomic physics — simulation `decay`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

let DECAY_PREV = [];

sim({
  id: 'decay',
  sec: 'at',
  n: L('Rozpad promieniotwórczy', 'Radioactive decay'),
  d: L(
    'Wiele jąder rozpada się losowo. Pojedynczy rozpad jest nieprzewidywalny, ale liczba jąder maleje regularnie — po każdym okresie półtrwania o połowę.',
    'Many nuclei decay at random. A single decay is unpredictable, but the number of nuclei falls regularly — halving every half-life.'
  ),
  params: [
    {
      k: 'N0',
      l: L('Liczba jąder N₀', 'Number of nuclei N₀'),
      min: 100,
      max: 2500,
      step: 100,
      v: 1000,
      u: '',
    },
    { k: 'T', l: L('Okres półtrwania T½', 'Half-life T½'), min: 1, max: 20, step: 0.5, v: 5, u: 's' },
  ],
  dt: 1 / 60,
  init(s, p) {
    s.alive = new Uint8Array(p.N0).fill(1);
    s.flash = new Float32Array(p.N0);
    s.N = p.N0;
    s.recent = [];
    s.saved = false;
  },
  step(s, p, h) {
    const pr = 1 - Math.pow(0.5, h / p.T);
    let d = 0;
    for (let i = 0; i < p.N0; i++) {
      if (s.alive[i] && Math.random() < pr) {
        s.alive[i] = 0;
        s.flash[i] = 1;
        d++;
      }
      if (s.flash[i] > 0) s.flash[i] -= h * 2;
    }
    s.N -= d;
    s.recent.push([s.t, d]);
    while (s.recent.length && s.recent[0][0] < s.t - 1) s.recent.shift();
    if (s.t >= p.T * 6 || s.N === 0) {
      s.done = true;
      if (!s.saved) {
        s.saved = true;
        DECAY_PREV.push(s.hist.map(r => [r.t, r.N]));
        if (DECAY_PREV.length > 3) DECAY_PREV.shift();
      }
    }
  },
  sample: (s, p) => ({ N: s.N, Nt: p.N0 * Math.pow(0.5, s.t / p.T) }),
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const cols = Math.ceil(Math.sqrt(p.N0 * (w / h))),
      rows = Math.ceil(p.N0 / cols);
    const cs = Math.min((w - 40) / cols, (h - 60) / rows);
    const ox = (w - cs * cols) / 2,
      oy = 40;
    for (let i = 0; i < p.N0; i++) {
      const x = ox + (i % cols) * cs,
        y = oy + Math.floor(i / cols) * cs;
      const r = Math.max(1.2, cs * 0.36);
      if (s.alive[i]) circle(c, x + cs / 2, y + cs / 2, r, 'c2');
      else {
        circle(c, x + cs / 2, y + cs / 2, r, alpha(C.muted, 0.25));
        if (s.flash[i] > 0)
          circle(c, x + cs / 2, y + cs / 2, r + 3 * s.flash[i], alpha('#ffd84a', s.flash[i]));
      }
    }
    text(c, (lang === 'pl' ? 'pozostało: ' : 'remaining: ') + s.N + ' / ' + p.N0, 16, 20, {
      size: 14,
      weight: 700,
      color: 'c2',
    });
    legend(
      c,
      [
        [lang === 'pl' ? 'jądro nierozpadnięte' : 'undecayed nucleus', 'c2'],
        [lang === 'pl' ? 'rozpadnięte' : 'decayed', alpha(C.muted, 0.5)],
      ],
      w * 0.45,
      20
    );
  },
  read: (s, p) => [
    [L('Pozostałe jądra N', 'Remaining nuclei N'), s.N, '', 0],
    [L('Teoria N₀·2^(−t/T½)', 'Theory N₀·2^(−t/T½)'), p.N0 * Math.pow(0.5, s.t / p.T), '', 0],
    [L('Liczba okresów półtrwania', 'Number of half-lives'), s.t / p.T, '', 2],
    [L('Aktywność (ostatnia 1 s)', 'Activity (last 1 s)'), s.recent.reduce((a, b) => a + b[1], 0), 'Bq', 0],
    [L('Stała rozpadu λ = ln2/T½', 'Decay constant λ = ln2/T½'), Math.LN2 / p.T, '1/s', 3],
    [L('Czas', 'Time'), s.t, 's', 1],
  ],
  charts: [
    {
      name: 'N(t)',
      fn: (p, s) => {
        const ser = DECAY_PREV.map((pts, i) => ({ c: 'faint', pts }));
        ser.push({ n: L('symulacja', 'simulation'), c: 'c2', pts: s.hist.map(r => [r.t, r.N]) });
        const th = [];
        for (let t = 0; t <= p.T * 6; t += p.T / 20) th.push([t, p.N0 * Math.pow(0.5, t / p.T)]);
        ser.push({ n: L('teoria', 'theory'), c: 'c1', dash: [5, 4], pts: th });
        return { xl: 't [s]', yl: 'N', xmin: 0, xmax: p.T * 6, ymin: 0, ser };
      },
    },
  ],
  f: ['N(t) = N₀ · 2^(−t/T½)', 'A = λ·N', 'λ = ln2 / T½'],
  model: L(
    'Każde jądro w każdej chwili ma takie samo prawdopodobieństwo rozpadu. Szare linie na wykresie to poprzednie serie — porównaj odchylenia statystyczne.',
    'Each nucleus has the same decay probability at every moment. Grey lines in the graph are previous runs — compare the statistical spread.'
  ),
  q: [
    L('Co oznacza okres półtrwania?', 'What does half-life mean?'),
    L(
      'Czy można przewidzieć, które jądro rozpadnie się następne?',
      'Can you predict which nucleus decays next?'
    ),
    L('Jak liczba jąder N₀ wpływa na zgodność z teorią?', 'How does N₀ affect agreement with theory?'),
  ],
  task: {
    q: L(
      'Po 3 okresach półtrwania z 1000 jąder zostanie około:',
      'After 3 half-lives, about how many of 1000 nuclei remain?'
    ),
    o: ['333', '250', '125', '0'],
    a: 2,
    ex: L('1000 · (½)³ = 125.', '1000 · (½)³ = 125.'),
  },
});
