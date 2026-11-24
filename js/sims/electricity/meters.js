/**
 * Elektryczność / Electricity — simulation `meters`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim({
  id: 'meters',
  sec: 'el',
  n: L('Prawidłowy pomiar', 'Connecting meters'),
  d: L(
    'Sprawdź, co się dzieje, gdy amperomierz lub woltomierz podłączymy niewłaściwie. Amperomierz włączamy szeregowo, woltomierz — równolegle.',
    'See what happens when an ammeter or voltmeter is connected incorrectly. Ammeters go in series, voltmeters in parallel.'
  ),
  params: [
    {
      k: 'am',
      type: 'sel',
      l: L('Amperomierz', 'Ammeter'),
      o: [
        ['ser', L('szeregowo (poprawnie)', 'in series (correct)')],
        ['par', L('równolegle do żarówki', 'in parallel with the bulb')],
      ],
      v: 'ser',
    },
    {
      k: 'vm',
      type: 'sel',
      l: L('Woltomierz', 'Voltmeter'),
      o: [
        ['par', L('równolegle (poprawnie)', 'in parallel (correct)')],
        ['ser', L('szeregowo w obwodzie', 'in series in the circuit')],
      ],
      v: 'par',
    },
    { k: 'U', l: L('Napięcie źródła', 'Source voltage'), min: 1, max: 12, step: 0.5, v: 6, u: 'V' },
  ],
  live: true,
  calc(p) {
    const R = 30,
      r = 0.5;
    let I, UA, UV, st, br;
    if (p.vm === 'ser') {
      I = p.U / 1e6;
      UV = p.U;
      UA = p.am === 'ser' ? I : 0;
      br = 0;
      st = L(
        'Woltomierz szeregowo: ma ogromny opór, więc prąd prawie nie płynie — żarówka nie świeci, a woltomierz pokazuje napięcie źródła.',
        'Voltmeter in series: its huge resistance stops the current — the bulb is off and the voltmeter shows the source voltage.'
      );
    } else if (p.am === 'par') {
      I = p.U / r;
      UA = I;
      UV = 0;
      br = 0;
      st = L(
        'ZWARCIE! Amperomierz ma znikomy opór — prąd omija żarówkę i gwałtownie rośnie. Może uszkodzić miernik i źródło.',
        'SHORT CIRCUIT! The ammeter has negligible resistance — the current bypasses the bulb and rises sharply. It can damage the meter and the source.'
      );
    } else {
      I = p.U / R;
      UA = I;
      UV = p.U;
      br = 1;
      st = L(
        'Poprawnie: amperomierz mierzy prąd płynący przez żarówkę, woltomierz — napięcie na jej końcach.',
        'Correct: the ammeter measures the current through the bulb, the voltmeter measures the voltage across it.'
      );
    }
    return {
      I,
      UA,
      UV,
      st,
      br,
      ok: p.am === 'ser' && p.vm === 'par',
      short: p.am === 'par' && p.vm !== 'ser',
    };
  },
  draw(c, w, h, s, p) {
    bg(c, w, h);
    const k = this.calc(p),
      x0 = w * 0.18,
      x1 = w * 0.82,
      y0 = h * 0.3,
      y1 = h * 0.8,
      bx = (x0 + x1) / 2;
    wire(
      c,
      [
        [x0, y1],
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ],
      k.short ? 'c4' : 'obj',
      k.short ? 3.5 : 2.5
    );
    battery(c, x0, (y0 + y1) / 2, true, fmt(p.U, 1) + ' V');
    c.fillStyle = C.scene;
    c.fillRect(bx - 18, y0 - 18, 36, 36);
    bulb(c, bx, y0, (k.br * p.U) / 6, null);
    if (p.am === 'ser') {
      c.fillStyle = C.scene;
      c.fillRect(x1 - 22, (y0 + y1) / 2 - 22, 44, 44);
      meter(c, x1, (y0 + y1) / 2, 'A', fmt(k.UA, k.UA < 0.01 ? 6 : 3) + ' A', k.short ? 'c4' : 'c1');
    } else {
      wire(
        c,
        [
          [bx - 60, y0],
          [bx - 60, y0 + 70],
          [bx + 60, y0 + 70],
          [bx + 60, y0],
        ],
        'c4',
        2.5
      );
      circle(c, bx - 60, y0, 3.5, 'obj');
      circle(c, bx + 60, y0, 3.5, 'obj');
      meter(c, bx, y0 + 70, 'A', fmt(k.UA, 2) + ' A', 'c4');
    }
    if (p.vm === 'par') {
      wire(
        c,
        [
          [bx - 60, y0],
          [bx - 60, y0 - 70],
          [bx + 60, y0 - 70],
          [bx + 60, y0],
        ],
        'c5',
        1.8
      );
      meter(c, bx, y0 - 70, 'V', null, 'c5');
      text(c, fmt(k.UV, 2) + ' V', bx + 26, y0 - 70, { size: 12, weight: 700, color: 'c5', mono: true });
      circle(c, bx - 60, y0, 3.5, 'obj');
      circle(c, bx + 60, y0, 3.5, 'obj');
    } else {
      c.fillStyle = C.scene;
      c.fillRect(bx - 22, y1 - 22, 44, 44);
      meter(c, bx, y1, 'V', fmt(k.UV, 2) + ' V', 'c5');
    }
    const msg = tr(k.st);
    c.save();
    c.font = '600 13px ' + getFont();
    const words = msg.split(' ');
    let ln = '',
      yy = 24;
    const lines = [];
    words.forEach(wd => {
      if (c.measureText(ln + wd).width > w - 40) {
        lines.push(ln);
        ln = '';
      }
      ln += wd + ' ';
    });
    lines.push(ln);
    c.restore();
    rrect(c, 12, 8, w - 24, lines.length * 18 + 14, 8, k.ok ? alpha(C.ok, 0.12) : alpha(C.bad, 0.12));
    lines.forEach((l, i) =>
      text(c, l, 22, 22 + i * 18, { size: 13, weight: 600, color: k.ok ? 'ok' : 'bad' })
    );
  },
  read(s, p) {
    const k = this.calc(p);
    return [
      [L('Wskazanie amperomierza', 'Ammeter reading'), k.UA, 'A', 4],
      [L('Wskazanie woltomierza', 'Voltmeter reading'), k.UV, 'V', 2],
      [L('Prąd przez żarówkę', 'Current through bulb'), p.am === 'par' && p.vm !== 'ser' ? 0 : k.I, 'A', 4],
      [
        L('Stan', 'Status'),
        k.ok
          ? L('poprawnie', 'correct')
          : k.short
            ? L('zwarcie!', 'short circuit!')
            : L('błędne podłączenie', 'wrong connection'),
        '',
        null,
        true,
      ],
    ];
  },
  f: [
    L('amperomierz: szeregowo, R_A ≈ 0', 'ammeter: in series, R_A ≈ 0'),
    L('woltomierz: równolegle, R_V → ∞', 'voltmeter: in parallel, R_V → ∞'),
  ],
  model: L(
    'Żarówka 30 Ω, opór wewnętrzny źródła 0,5 Ω, amperomierz idealny (0 Ω), woltomierz 1 MΩ.',
    'Bulb 30 Ω, internal resistance 0.5 Ω, ideal ammeter (0 Ω), voltmeter 1 MΩ.'
  ),
  q: [
    L('Dlaczego amperomierz włącza się szeregowo?', 'Why is an ammeter connected in series?'),
    L('Co pokaże woltomierz włączony szeregowo?', 'What does a voltmeter in series show?'),
  ],
  task: {
    q: L(
      'Amperomierz podłączono równolegle do żarówki. Co się stanie?',
      'An ammeter is connected in parallel with a bulb. What happens?'
    ),
    o: [
      L('pomiar będzie poprawny', 'the reading will be correct'),
      L('prąd nie popłynie', 'no current flows'),
      L('nastąpi zwarcie — duży prąd', 'a short circuit — large current'),
      L('żarówka zaświeci jaśniej', 'the bulb gets brighter'),
    ],
    a: 2,
    ex: L(
      'Amperomierz ma znikomy opór, więc tworzy drogę „na skróty” — zwarcie.',
      'The ammeter has negligible resistance, so it creates a shortcut — a short circuit.'
    ),
  },
});
