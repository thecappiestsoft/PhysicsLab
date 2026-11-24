/**
 * Elektryczność / Electricity — simulation `ohm`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'ohm',
  sec: 'el',
  n: L('Prawo Ohma', 'Ohm’s law'),
  d: L(
    'Zmieniaj napięcie na rezystorze i mierz natężenie prądu. Zapisz kilka pomiarów, aby zbudować wykres I(U), a potem zmień opór i porównaj nachylenie.',
    'Change the voltage across a resistor and measure the current. Record several points to build the I(U) graph, then change the resistance and compare the slope.'
  ),
  params: [
    { k: 'U', l: L('Napięcie U', 'Voltage U'), min: 0, max: 12, step: 0.5, v: 6, u: 'V', live: true },
    { k: 'R', l: L('Opór R', 'Resistance R'), min: 5, max: 100, step: 1, v: 20, u: 'Ω', live: true },
  ],
  autorun: true,
  keepRun: true,
  dt: 1 / 120,
  init(s, p) {
    s.q = 0;
    s.E = 0;
  },
  step(s, p, h) {
    const I = p.U / p.R;
    s.q += I * h * 90;
    s.E += p.U * I * h;
    if (s.t > 3600) s.done = true;
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const x0 = w * 0.18,
      x1 = w * 0.82,
      y0 = h * 0.24,
      y1 = h * 0.76,
      I = p.U / p.R;
    const loop = [
      [x0, y1],
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ];
    wire(c, loop);
    electrons(
      c,
      [
        [x0, y0],
        [x0, y1],
        [x1, y1],
        [x1, y0],
        [x0, y0],
      ],
      s.q,
      22
    );
    battery(c, x0, (y0 + y1) / 2, true, 'U = ' + fmt(p.U, 1) + ' V');
    const rx = (x0 + x1) / 2 - 30;
    resistor(c, rx, y0, 90, 'R = ' + fmt(p.R, 0) + ' Ω');
    meter(c, x1, (y0 + y1) / 2, 'A', fmt(I, 3) + ' A', 'c1');
    const vy = y0 - 62;
    wire(
      c,
      [
        [rx - 60, y0],
        [rx - 60, vy],
        [rx + 60, vy],
        [rx + 60, y0],
      ],
      'c5',
      1.6
    );
    meter(c, rx, vy, 'V', null, 'c5');
    text(c, fmt(p.U, 2) + ' V', rx + 30, vy, { size: 12, weight: 700, color: 'c5', mono: true });
    circle(c, rx - 60, y0, 3.5, 'obj');
    circle(c, rx + 60, y0, 3.5, 'obj');
    const P = p.U * I;
    bulb(c, (x0 + x1) / 2, y1, 0, null);
    text(c, 'P = ' + fmt(P, 2) + ' W', (x0 + x1) / 2, y1 + 30, {
      align: 'center',
      size: 13,
      weight: 700,
      color: 'c2',
    });
    text(
      c,
      lang === 'pl'
        ? 'kropki: model przepływu ładunków (elektrony płyną od − do +)'
        : 'dots: charge flow model (electrons flow from − to +)',
      16,
      h - 16,
      { size: 11, color: 'muted' }
    );
  },
  read: (s, p) => {
    const I = p.U / p.R;
    return [
      [L('Napięcie U', 'Voltage U'), p.U, 'V', 2],
      [L('Natężenie I', 'Current I'), I, 'A', 4],
      [L('Opór R = U/I', 'Resistance R = U/I'), p.R, 'Ω', 1],
      [L('Moc P = U·I', 'Power P = U·I'), p.U * I, 'W', 3],
      [L('Energia Q = P·t (od startu)', 'Energy Q = P·t (since start)'), s.E, 'J', 1, false, true],
      [L('Czas', 'Time'), s.t, 's', 1, false, true],
    ];
  },
  charts: [
    {
      name: L('I(U) — pomiary', 'I(U) — data'),
      fn: (p, s, rows) => {
        const kU = Object.keys(rows[0] || {}).find(k => /^(Napięcie|Voltage)/.test(k)),
          kI = Object.keys(rows[0] || {}).find(k => /^(Natężenie|Current)/.test(k));
        const pts = rows.map(r => [r[kU], r[kI]]).filter(q => q[0] != null && q[1] != null);
        return {
          xl: 'U [V]',
          yl: 'I [A]',
          xmin: 0,
          xmax: 12,
          ymin: 0,
          ser: [
            {
              n: L('teoria dla bieżącego R', 'theory for current R'),
              c: 'c1',
              dash: [6, 4],
              pts: [
                [0, 0],
                [12, 12 / p.R],
              ],
            },
            { n: L('pomiary', 'measurements'), c: 'c2', dots: true, pts },
          ],
          marker: [p.U, p.U / p.R, 'c4'],
        };
      },
    },
  ],
  f: ['I = U/R', 'R = U/I', 'P = U·I = I²R = U²/R', 'Q = P·t'],
  model: L(
    'Rezystor omowy (R stałe), idealne źródło, przewody i mierniki. Amperomierz szeregowo, woltomierz równolegle.',
    'Ohmic resistor (constant R), ideal source, wires and meters. Ammeter in series, voltmeter in parallel.'
  ),
  q: [
    L(
      'Co stanie się z prądem, gdy napięcie wzrośnie dwukrotnie przy stałym oporze?',
      'What happens to the current when the voltage doubles at constant resistance?'
    ),
    L(
      'Wykonaj 5 pomiarów dla różnych U przy stałym R. Czy wykres I(U) jest prosty?',
      'Take 5 measurements for different U at constant R. Is I(U) a straight line?'
    ),
    L('Jak nachylenie wykresu I(U) zależy od R?', 'How does the slope of I(U) depend on R?'),
  ],
  task: {
    q: L(
      'Rezystor 20 Ω podłączono do 6 V. Jakie natężenie wskaże amperomierz?',
      'A 20 Ω resistor is connected to 6 V. What does the ammeter read?'
    ),
    o: ['0,3 A', '3,3 A', '120 A', '0,03 A'].map(x => L(x, x.replace(',', '.'))),
    a: 0,
    ex: L('I = U/R = 6/20 = 0,3 A.', 'I = U/R = 6/20 = 0.3 A.'),
  },
});
