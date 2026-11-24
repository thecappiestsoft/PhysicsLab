/**
 * Optyka / Optics — simulation `mirror`
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

sim(
  Object.assign(opticsSim('mirror'), {
    id: 'mirror',
    sec: 'opt',
    n: L('Zwierciadła', 'Mirrors'),
    d: L(
      'Zwierciadło płaskie, wklęsłe lub wypukłe. Przesuwaj przedmiot i obserwuj, kiedy obraz jest rzeczywisty, a kiedy pozorny.',
      'A plane, concave or convex mirror. Move the object and see when the image is real and when it is virtual.'
    ),
    params: [
      {
        k: 'type',
        type: 'sel',
        l: L('Rodzaj zwierciadła', 'Mirror type'),
        o: [
          ['concave', L('wklęsłe', 'concave')],
          ['convex', L('wypukłe', 'convex')],
          ['plane', L('płaskie', 'plane')],
        ],
        v: 'concave',
      },
      {
        k: 'f',
        l: L('Ogniskowa |f| = R/2', 'Focal length |f| = R/2'),
        min: 10,
        max: 40,
        step: 0.5,
        v: 25,
        u: 'cm',
      },
      {
        k: 'x',
        l: L('Odległość przedmiotu x', 'Object distance x'),
        min: 2,
        max: 110,
        step: 0.5,
        v: 70,
        u: 'cm',
      },
      { k: 'h', l: L('Wysokość przedmiotu', 'Object height'), min: 2, max: 15, step: 0.5, v: 8, u: 'cm' },
    ],
    f: [
      '1/f = 1/x + 1/y',
      'f = R/2',
      'p = |y| / x',
      L('zwierciadło płaskie: y = −x, p = 1', 'plane mirror: y = −x, m = 1'),
    ],
    model: L(
      'Promienie przyosiowe. Obraz pozorny (y < 0) powstaje za zwierciadłem — przedłużenia promieni zaznaczono linią przerywaną.',
      'Paraxial rays. A virtual image (y < 0) forms behind the mirror — ray extensions are dashed.'
    ),
    q: [
      L('Gdzie powstaje obraz w zwierciadle płaskim?', 'Where does a plane mirror form an image?'),
      L('Dlaczego lusterka samochodowe bywają wypukłe?', 'Why are car side mirrors often convex?'),
    ],
    task: {
      q: L('Obraz w zwierciadle wypukłym jest zawsze:', 'The image in a convex mirror is always:'),
      o: [
        L('rzeczywisty i odwrócony', 'real and inverted'),
        L('pozorny, prosty i pomniejszony', 'virtual, upright and diminished'),
        L('pozorny i powiększony', 'virtual and magnified'),
        L('tej samej wielkości', 'the same size'),
      ],
      a: 1,
      ex: L(
        'Zwierciadło wypukłe rozprasza światło — obraz jest zawsze pozorny, prosty i pomniejszony, co daje szerokie pole widzenia.',
        'A convex mirror diverges light — the image is always virtual, upright and diminished, giving a wide field of view.'
      ),
    },
  })
);
