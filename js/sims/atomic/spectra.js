/**
 * Fizyka atomowa / Atomic physics — simulation `spectra`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const LINES = {
  H: [656.3, 486.1, 434.0, 410.2, 397.0],
  He: [447.1, 471.3, 492.2, 501.6, 587.6, 667.8, 706.5],
  Na: [498.3, 515.3, 568.8, 589.0, 589.6],
  Ne: [
    540.1, 585.2, 588.2, 603.0, 607.4, 616.4, 621.7, 626.6, 633.4, 638.3, 640.2, 650.6, 659.9, 692.9, 703.2,
  ],
  Hg: [404.7, 435.8, 546.1, 577.0, 579.1],
};

sim({
  id: 'spectra',
  sec: 'at',
  n: L('Widma atomowe', 'Atomic spectra'),
  d: L(
    'Każdy pierwiastek emituje światło o charakterystycznych długościach fali. Dla wodoru zobacz, jak linie widma wynikają z przejść elektronu między poziomami energetycznymi.',
    'Every element emits light at characteristic wavelengths. For hydrogen, see how spectral lines come from electron transitions between energy levels.'
  ),
  params: [
    {
      k: 'el',
      type: 'sel',
      l: L('Pierwiastek', 'Element'),
      o: [
        ['H', L('wodór H', 'hydrogen H')],
        ['He', L('hel He', 'helium He')],
        ['Na', L('sód Na', 'sodium Na')],
        ['Ne', L('neon Ne', 'neon Ne')],
        ['Hg', L('rtęć Hg', 'mercury Hg')],
      ],
      v: 'H',
    },
    {
      k: 'mode',
      type: 'sel',
      l: L('Rodzaj widma', 'Spectrum type'),
      o: [
        ['em', L('emisyjne', 'emission')],
        ['ab', L('absorpcyjne', 'absorption')],
      ],
      v: 'em',
    },
    {
      k: 'sel',
      l: L('Wybrana linia (wodór)', 'Selected line (hydrogen)'),
      min: 3,
      max: 7,
      step: 1,
      v: 3,
      u: 'n →2',
      if: p => p.el === 'H',
    },
  ],
  live: true,
  draw(c, w, h, s, p) {
    bg(c, w, h, false);
    const sx = 40,
      sw = w - 80,
      sy = h * 0.12,
      sh = h * 0.2,
      nm0 = 380,
      nm1 = 750,
      X = nm => sx + ((nm - nm0) / (nm1 - nm0)) * sw;
    for (let i = 0; i < sw; i++) {
      const nm = nm0 + (i / sw) * (nm1 - nm0);
      c.fillStyle = p.mode === 'ab' ? wlColor(nm) : '#05070a';
      c.fillRect(sx + i, sy, 1, sh);
    }
    LINES[p.el].forEach(nm => {
      c.fillStyle = p.mode === 'ab' ? '#05070a' : wlColor(nm);
      c.fillRect(X(nm) - 1.5, sy, 3, sh);
    });
    rrect(c, sx, sy, sw, sh, 2, null, 'line', 1);
    for (let nm = 400; nm <= 750; nm += 50) {
      line(c, X(nm), sy + sh, X(nm), sy + sh + 6, 'muted', 1);
      text(c, nm, X(nm), sy + sh + 16, { align: 'center', size: 11, color: 'muted' });
    }
    text(c, 'nm', sx + sw, sy + sh + 30, { align: 'right', size: 11, color: 'muted' });
    if (p.el === 'H') {
      const ly0 = h * 0.5,
        ly1 = h - 30,
        E = n => -13.6 / (n * n),
        Y = e => ly0 + ((e + 13.6 * 0.27) / (-13.6 * 0.27)) * (ly0 - ly1) * -1;
      const yy = e => lerp(ly1, ly0, (e - -3.6) / 3.6);
      const lx0 = w * 0.12,
        lx1 = w * 0.55;
      for (let n = 2; n <= 7; n++) {
        const y = yy(E(n));
        line(c, lx0, y, lx1, y, 'muted', 1.5);
        text(c, 'n = ' + n, lx0 - 8, y, { align: 'right', size: 11, color: 'muted' });
        text(c, fmt(E(n), 2) + ' eV', lx1 + 8, y, { size: 11, color: 'muted', mono: true });
      }
      for (let n = 3; n <= 7; n++) {
        const x = lerp(lx0 + 30, lx1 - 30, (n - 3) / 4),
          nm = 1 / (1.0968e-2 * (1 / 4 - 1 / (n * n)));
        const on = n === p.sel;
        arrow(c, x, yy(E(n)), x, yy(E(2)), on ? wlColor(nm) : alpha(C.muted, 0.5), '', { w: on ? 3.5 : 1.5 });
        if (on) {
          const xx = X(nm);
          c.save();
          c.strokeStyle = C.ink;
          c.lineWidth = 1.5;
          c.strokeRect(xx - 5, sy - 4, 10, sh + 8);
          c.restore();
        }
      }
      const nm = 1 / (1.0968e-2 * (1 / 4 - 1 / (p.sel * p.sel)));
      text(
        c,
        (lang === 'pl' ? 'przejście ' : 'transition ') +
          p.sel +
          ' → 2:  λ = ' +
          fmt(nm, 1) +
          ' nm,  E = ' +
          fmt(13.6 * (1 / 4 - 1 / (p.sel * p.sel)), 2) +
          ' eV',
        w * 0.62,
        h * 0.6,
        { size: 14, weight: 700 }
      );
      text(
        c,
        lang === 'pl' ? 'seria Balmera (światło widzialne)' : 'Balmer series (visible light)',
        w * 0.62,
        h * 0.6 + 24,
        { size: 12, color: 'muted' }
      );
    } else {
      text(
        c,
        (lang === 'pl' ? 'linie charakterystyczne: ' : 'characteristic lines: ') +
          LINES[p.el].map(x => fmt(x, 1)).join(', ') +
          ' nm',
        40,
        h * 0.55,
        { size: 13, color: 'muted' }
      );
      text(
        c,
        lang === 'pl'
          ? 'Widmo to „odcisk palca” pierwiastka — służy do badania składu gwiazd.'
          : 'A spectrum is an element’s “fingerprint” — used to study the composition of stars.',
        40,
        h * 0.55 + 26,
        { size: 13, color: 'muted' }
      );
    }
  },
  read(s, p) {
    const r = [
      [L('Liczba linii (zakres widzialny)', 'Number of lines (visible range)'), LINES[p.el].length, '', 0],
    ];
    if (p.el === 'H') {
      const nm = 1 / (1.0968e-2 * (1 / 4 - 1 / (p.sel * p.sel)));
      r.push(
        [L('Długość fali λ', 'Wavelength λ'), nm, 'nm', 1],
        [L('Energia fotonu', 'Photon energy'), 1239.84 / nm, 'eV', 3],
        [L('Częstotliwość', 'Frequency'), 2.998e8 / (nm * 1e-9) / 1e14, '·10¹⁴ Hz', 2]
      );
    }
    return r;
  },
  f: [
    L('E_n = −13,6 eV / n²', 'E_n = −13.6 eV / n²'),
    'h·f = E_m − E_n',
    '1/λ = R(1/2² − 1/n²)',
    L('R = 1,097·10⁷ 1/m', 'R = 1.097·10⁷ 1/m'),
  ],
  model: L(
    'Model Bohra dla wodoru; dla innych pierwiastków pokazano wybrane najjaśniejsze linie w zakresie widzialnym.',
    'Bohr model for hydrogen; for other elements selected bright visible lines are shown.'
  ),
  q: [
    L('Dlaczego każdy pierwiastek ma inne widmo?', 'Why does each element have a different spectrum?'),
    L(
      'Czym różni się widmo emisyjne od absorpcyjnego?',
      'How does an emission spectrum differ from an absorption spectrum?'
    ),
  ],
  task: {
    q: L(
      'Czerwona linia wodoru (656 nm) powstaje przy przejściu elektronu:',
      'The red hydrogen line (656 nm) comes from an electron transition:'
    ),
    o: ['2 → 1', '3 → 2', '4 → 2', '5 → 2'],
    a: 1,
    ex: L(
      'Najmniejsza energia w serii Balmera to przejście 3 → 2, czyli najdłuższa fala (czerwona).',
      'The lowest-energy Balmer transition is 3 → 2, giving the longest (red) wavelength.'
    ),
  },
});
