/**
 * PhysicsLab core — Section list, icons and the simulation registry: sim(definition).
 */
'use strict';

const ICONS = {
  mech: '<path d="M3 17h18M6 17V9l4-3 4 3v8"/><circle cx="18" cy="8" r="2.5"/><path d="M18 11v3"/>',
  dyn: '<rect x="4" y="9" width="9" height="8" rx="1"/><path d="M13 13h7M17 10l3 3-3 3M2 19h20"/>',
  en: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>',
  osc: '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0 2 3 2 3"/>',
  el: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h3M8.5 10.5v3M14 12h3"/>',
  mag: '<path d="M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3Z"/><path d="M6 7h4M14 7h4"/>',
  opt: '<path d="M12 3c2 3 2 15 0 18-2-3-2-15 0-18Z"/><path d="M2 8l10 4 10-4M2 16l10-4 10 4"/>',
  th: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7"/>',
  at: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
};
const SECTIONS = [
  {
    id: 'mech',
    col: '#1f5fd6',
    n: L('Mechanika', 'Mechanics'),
    d: L(
      'Ruch jednostajny i przyspieszony, spadek swobodny, rzuty.',
      'Uniform and accelerated motion, free fall, projectiles.'
    ),
  },
  {
    id: 'dyn',
    col: '#e07a10',
    n: L('Dynamika', 'Dynamics'),
    d: L(
      'Siły, masa, tarcie, zasady Newtona, równia pochyła.',
      'Forces, mass, friction, Newton’s laws, inclined plane.'
    ),
  },
  {
    id: 'en',
    col: '#c79a00',
    n: L('Energia', 'Energy'),
    d: L(
      'Praca, energia kinetyczna, potencjalna i sprężystości, bilanse.',
      'Work, kinetic, potential and elastic energy, energy balance.'
    ),
  },
  {
    id: 'osc',
    col: '#0e8f9e',
    n: L('Drgania i fale', 'Oscillations & waves'),
    d: L('Wahadło, sprężyna, fale, dźwięk, interferencja.', 'Pendulum, spring, waves, sound, interference.'),
  },
  {
    id: 'el',
    col: '#d63a34',
    n: L('Elektryczność', 'Electricity'),
    d: L(
      'Obwody, prawo Ohma, połączenia, mierniki, moc.',
      'Circuits, Ohm’s law, connections, meters, power.'
    ),
  },
  {
    id: 'mag',
    col: '#7c4dd6',
    n: L('Magnetyzm', 'Magnetism'),
    d: L(
      'Pole magnetyczne, elektromagnes, indukcja, silnik.',
      'Magnetic field, electromagnet, induction, motor.'
    ),
  },
  {
    id: 'opt',
    col: '#16935a',
    n: L('Optyka', 'Optics'),
    d: L(
      'Soczewki, zwierciadła, załamanie i całkowite odbicie.',
      'Lenses, mirrors, refraction and total internal reflection.'
    ),
  },
  {
    id: 'th',
    col: '#c2410c',
    n: L('Termodynamika', 'Thermodynamics'),
    d: L(
      'Ciepło, bilans cieplny, przewodzenie, gaz, rozszerzalność.',
      'Heat, heat balance, conduction, gases, expansion.'
    ),
  },
  {
    id: 'at',
    col: '#475569',
    n: L('Fizyka atomowa', 'Atomic physics'),
    d: L(
      'Atom, izotopy, rozpad, osłony, fotoefekt, widma.',
      'Atom, isotopes, decay, shielding, photoelectric effect, spectra.'
    ),
  },
];
const SIMS = [];
const simById = {};
function sim(d) {
  d.params = d.params || [];
  SIMS.push(d);
  simById[d.id] = d;
}
