/**
 * Drgania i fale / Oscillations & waves — simulation `sound`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

let AUDIO = null;

function audioStop() {
  if (AUDIO) {
    try {
      AUDIO.o.forEach(o => o.stop());
      AUDIO.ctx.close();
    } catch (e) {}
    AUDIO = null;
  }
}

function audioUpdate(p) {
  if (!AUDIO) return;
  const n = AUDIO.ctx.currentTime;
  AUDIO.o[0].frequency.setTargetAtTime(p.f, n, 0.02);
  AUDIO.o[0].type = p.wf;
  AUDIO.g[0].gain.setTargetAtTime(p.amp * 0.25, n, 0.03);
  AUDIO.o[1].frequency.setTargetAtTime(p.f2, n, 0.02);
  AUDIO.o[1].type = p.wf;
  AUDIO.g[1].gain.setTargetAtTime(p.two ? p.amp * 0.25 : 0, n, 0.03);
}

function audioStart(p) {
  audioStop();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const o = [ctx.createOscillator(), ctx.createOscillator()],
    g = [ctx.createGain(), ctx.createGain()];
  o.forEach((x, i) => {
    x.connect(g[i]);
    g[i].connect(ctx.destination);
    g[i].gain.value = 0;
    x.start();
  });
  AUDIO = { ctx, o, g };
  audioUpdate(p);
}

function harm(wf, n) {
  if (wf === 'sine') return n === 1 ? 1 : 0;
  if (wf === 'square') return n % 2 ? 1 / n : 0;
  if (wf === 'triangle') return n % 2 ? 1 / (n * n) : 0;
  return 1 / n;
}

function wfv(wf, ph) {
  const u = (((ph / (2 * Math.PI)) % 1) + 1) % 1;
  if (wf === 'sine') return Math.sin(ph);
  if (wf === 'square') return u < 0.5 ? 1 : -1;
  if (wf === 'triangle') return u < 0.25 ? 4 * u : u < 0.75 ? 2 - 4 * u : 4 * u - 4;
  return 2 * ((u + 0.5) % 1) - 1;
}

sim({
  id: 'sound',
  sec: 'osc',
  n: L('Dźwięk', 'Sound'),
  d: L(
    'Generator tonów: wysokość dźwięku zależy od częstotliwości, głośność od amplitudy, a barwa od kształtu fali (widma). Dwa bliskie tony dają dudnienia.',
    'A tone generator: pitch depends on frequency, loudness on amplitude and timbre on waveform (spectrum). Two close tones produce beats.'
  ),
  params: [
    { k: 'f', l: L('Częstotliwość f', 'Frequency f'), min: 100, max: 1000, step: 1, v: 440, u: 'Hz' },
    {
      k: 'amp',
      l: L('Amplituda (głośność)', 'Amplitude (loudness)'),
      min: 0,
      max: 1,
      step: 0.05,
      v: 0.6,
      u: '',
    },
    {
      k: 'wf',
      type: 'sel',
      l: L('Kształt fali (barwa)', 'Waveform (timbre)'),
      o: [
        ['sine', L('sinusoidalna', 'sine')],
        ['square', L('prostokątna', 'square')],
        ['triangle', L('trójkątna', 'triangle')],
        ['sawtooth', L('piłokształtna', 'sawtooth')],
      ],
      v: 'sine',
    },
    { k: 'two', type: 'chk', l: L('Drugi ton (dudnienia)', 'Second tone (beats)'), v: false },
    {
      k: 'f2',
      l: L('Częstotliwość f₂', 'Frequency f₂'),
      min: 100,
      max: 1000,
      step: 1,
      v: 444,
      u: 'Hz',
      if: p => p.two,
    },
  ],
  live: true,
  onLive: (s, p) => audioUpdate(p),
  leave: () => audioStop(),
  extraBtn: {
    l: L('🔊 Odtwórz / zatrzymaj', '🔊 Play / stop'),
    f: (s, p) => {
      if (AUDIO) audioStop();
      else audioStart(p);
    },
  },
  init() {},
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const top = 16,
      ph = h * 0.5 - 24;
    rrect(c, 14, top, w - 28, ph, 10, alpha(C.paper, 0.6), C.line, 1);
    const mid = top + ph / 2;
    line(c, 24, mid, w - 24, mid, 'faint', 1, [4, 4]);
    const win = p.two ? 0.5 : 5 / p.f;
    text(
      c,
      (lang === 'pl' ? 'oscyloskop — okno ' : 'oscilloscope — window ') +
        fmt(win * 1000, win < 0.05 ? 1 : 0) +
        ' ms',
      24,
      top + 14,
      { size: 11, color: 'muted' }
    );
    c.save();
    c.strokeStyle = C.c1;
    c.lineWidth = p.two ? 1.2 : 2.2;
    c.beginPath();
    const N = p.two ? 2400 : 600;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * win;
      let y = p.amp * wfv(p.wf, 2 * Math.PI * p.f * t);
      if (p.two) y = (y + p.amp * wfv(p.wf, 2 * Math.PI * p.f2 * t)) / 2;
      const x = 24 + (i / N) * (w - 48),
        yy = mid - y * ph * 0.42;
      i ? c.lineTo(x, yy) : c.moveTo(x, yy);
    }
    c.stroke();
    c.restore();
    const sy = top + ph + 20,
      sh = h - sy - 34;
    rrect(c, 14, sy, w - 28, sh, 10, alpha(C.paper, 0.6), C.line, 1);
    text(c, lang === 'pl' ? 'widmo (harmoniczne)' : 'spectrum (harmonics)', 24, sy + 14, {
      size: 11,
      color: 'muted',
    });
    const fx = f => 34 + (f / 4000) * (w - 68),
      base = sy + sh - 24;
    line(c, 30, base, w - 30, base, 'muted', 1);
    for (let f = 0; f <= 4000; f += 500) {
      line(c, fx(f), base, fx(f), base + 5, 'muted', 1);
      text(c, f + (f === 4000 ? ' Hz' : ''), fx(f), base + 14, { align: 'center', size: 10, color: 'muted' });
    }
    const stem = (f, a, cc) => {
      if (f > 4000 || a <= 0) return;
      const hh = a * (sh - 56);
      line(c, fx(f), base, fx(f), base - hh, cc, 3);
      circle(c, fx(f), base - hh, 3.5, cc);
    };
    for (let n = 1; n <= 20; n++) {
      stem(p.f * n, harm(p.wf, n) * p.amp, 'c1');
      if (p.two) stem(p.f2 * n + 1, harm(p.wf, n) * p.amp, 'c2');
    }
    text(
      c,
      AUDIO
        ? lang === 'pl'
          ? '🔊 dźwięk włączony'
          : '🔊 sound on'
        : lang === 'pl'
          ? 'kliknij „Odtwórz”, aby usłyszeć ton'
          : 'click “Play” to hear the tone',
      w - 24,
      top + 14,
      { align: 'right', size: 11, weight: 650, color: AUDIO ? 'c3' : 'muted' }
    );
  },
  read: (s, p) => {
    const r = [
      [L('Okres T = 1/f', 'Period T = 1/f'), 1000 / p.f, 'ms', 2],
      [L('Długość fali w powietrzu (343 m/s)', 'Wavelength in air (343 m/s)'), 343 / p.f, 'm', 3],
      [L('Długość fali w wodzie (1480 m/s)', 'Wavelength in water (1480 m/s)'), 1480 / p.f, 'm', 3],
    ];
    if (p.two)
      r.push([L('Częstotliwość dudnień |f₂ − f|', 'Beat frequency |f₂ − f|'), Math.abs(p.f2 - p.f), 'Hz', 0]);
    return r;
  },
  f: [
    'T = 1/f',
    'λ = v/f',
    L('v_dźwięku ≈ 343 m/s (powietrze, 20 °C)', 'v_sound ≈ 343 m/s (air, 20 °C)'),
    L('f_dudnień = |f₁ − f₂|', 'f_beat = |f₁ − f₂|'),
  ],
  model: L(
    'Głośność w modelu jest proporcjonalna do amplitudy (bez skali decybelowej). Widmo pokazuje względne amplitudy harmonicznych idealnych przebiegów.',
    'Loudness is modelled as proportional to amplitude (no decibel scale). The spectrum shows relative harmonic amplitudes of ideal waveforms.'
  ),
  q: [
    L(
      'Czym różnią się dźwięki o tej samej częstotliwości, ale innym kształcie fali?',
      'How do sounds with the same frequency but different waveforms differ?'
    ),
    L('Jak dudnienia zależą od różnicy częstotliwości?', 'How do beats depend on the frequency difference?'),
  ],
  task: {
    q: L(
      'Ton 440 Hz rozchodzi się w powietrzu (343 m/s). Długość fali wynosi około:',
      'A 440 Hz tone travels in air (343 m/s). Its wavelength is about:'
    ),
    o: ['0,78 m', '1,28 m', '7,8 m', '0,078 m'].map(x => L(x, x.replace(',', '.'))),
    a: 0,
    ex: L('λ = v/f = 343/440 ≈ 0,78 m.', 'λ = v/f = 343/440 ≈ 0.78 m.'),
  },
});
