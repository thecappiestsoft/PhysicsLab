/**
 * Optyka / Optics — simulation `lens`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim(
  Object.assign(opticsSim('lens'), {
    id: 'lens',
    sec: 'opt',
    n: L('Soczewki', 'Lenses'),
    d: L(
      'Przesuwaj przedmiot i zmieniaj ogniskową. Program konstruuje obraz za pomocą trzech promieni charakterystycznych i podaje jego cechy.',
      'Move the object and change the focal length. The image is constructed with three principal rays and its features are listed.'
    ),
    params: [
      {
        k: 'type',
        type: 'sel',
        l: L('Rodzaj soczewki', 'Lens type'),
        o: [
          ['conv', L('skupiająca', 'converging')],
          ['div', L('rozpraszająca', 'diverging')],
        ],
        v: 'conv',
      },
      { k: 'f', l: L('Ogniskowa |f|', 'Focal length |f|'), min: 5, max: 30, step: 0.5, v: 15, u: 'cm' },
      {
        k: 'x',
        l: L('Odległość przedmiotu x', 'Object distance x'),
        min: 2,
        max: 70,
        step: 0.5,
        v: 40,
        u: 'cm',
      },
      { k: 'h', l: L('Wysokość przedmiotu', 'Object height'), min: 2, max: 15, step: 0.5, v: 8, u: 'cm' },
    ],
    f: [
      '1/f = 1/x + 1/y',
      'p = |y| / x',
      'Z = 1/f  [D = 1/m]',
      L(
        'Konwencja: y > 0 — obraz rzeczywisty (za soczewką), y < 0 — pozorny; dla soczewki rozpraszającej f < 0',
        'Convention: y > 0 — real image (behind the lens), y < 0 — virtual; for a diverging lens f < 0'
      ),
    ],
    model: L(
      'Cienka soczewka, promienie przyosiowe. Skala: szerokość sceny ≈ 150 cm.',
      'Thin lens, paraxial rays. Scale: the scene is about 150 cm wide.'
    ),
    q: [
      L(
        'Gdzie powstanie obraz, gdy przedmiot znajduje się poza 2f?',
        'Where is the image when the object is beyond 2f?'
      ),
      L(
        'Jak zmieni się obraz po skróceniu ogniskowej?',
        'How does the image change when the focal length is shortened?'
      ),
      L(
        'Kiedy soczewka skupiająca działa jak lupa?',
        'When does a converging lens act as a magnifying glass?'
      ),
    ],
    task: {
      q: L(
        'Przedmiot stoi w odległości 2f od soczewki skupiającej. Obraz jest:',
        'An object is placed at 2f from a converging lens. The image is:'
      ),
      o: [
        L('pozorny, prosty, powiększony', 'virtual, upright, magnified'),
        L('rzeczywisty, odwrócony, tej samej wielkości', 'real, inverted, same size'),
        L('rzeczywisty, prosty, pomniejszony', 'real, upright, diminished'),
        L('nie powstaje', 'not formed'),
      ],
      a: 1,
      ex: L(
        'Dla x = 2f: y = 2f, powiększenie 1 — obraz rzeczywisty, odwrócony, tej samej wielkości.',
        'For x = 2f: y = 2f, magnification 1 — real, inverted, same size.'
      ),
    },
  })
);
