/**
 * Wspólne / Shared — Shared parameter presets (gravity options, friction surfaces).
 * See docs/SIMULATION_API.md for the structure of a simulation definition.
 */
'use strict';

const G_OPTS = [
  [9.81, L('Ziemia (9,81 m/s²)', 'Earth (9.81 m/s²)')],
  [1.62, L('Księżyc (1,62 m/s²)', 'Moon (1.62 m/s²)')],
  [3.71, L('Mars (3,71 m/s²)', 'Mars (3.71 m/s²)')],
  [24.79, L('Jowisz (24,79 m/s²)', 'Jupiter (24.79 m/s²)')],
];

const SURF = [
  ['none', L('bez tarcia', 'frictionless')],
  ['ice', L('lód (μs 0,10 · μk 0,05)', 'ice (μs 0.10 · μk 0.05)')],
  ['wood', L('drewno (μs 0,50 · μk 0,30)', 'wood (μs 0.50 · μk 0.30)')],
  ['rubber', L('guma (μs 0,90 · μk 0,70)', 'rubber (μs 0.90 · μk 0.70)')],
];

const MU = { none: [0, 0], ice: [0.1, 0.05], wood: [0.5, 0.3], rubber: [0.9, 0.7] };
