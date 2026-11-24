/**
 * PhysicsLab core — Light/dark theme and colour palette read from CSS variables (C).
 */
'use strict';

let theme = store.get(
  'theme',
  window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);
let C = {};
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  [
    'bg',
    'paper',
    'panel',
    'ink',
    'muted',
    'faint',
    'line',
    'line2',
    'accent',
    'ok',
    'bad',
    'warn',
    'grid',
    'scene',
    'obj',
    'c1',
    'c2',
    'c3',
    'c4',
    'c5',
    'c6',
  ].forEach(k => (C[k] = cs.getPropertyValue('--' + k).trim()));
  C.dark = theme === 'dark';
}
function setTheme(th) {
  theme = th;
  document.documentElement.dataset.theme = th;
  store.set('theme', th);
  readColors();
  document.querySelectorAll('#themeSeg button').forEach(b => {
    b.classList.toggle('on', b.dataset.theme === th);
    b.setAttribute('aria-pressed', b.dataset.theme === th);
  });
  redrawAll();
}
function setLang(l) {
  lang = l;
  store.set('lang', l);
  document.documentElement.lang = l;
  document.querySelectorAll('#langSeg button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === l);
    b.setAttribute('aria-pressed', b.dataset.lang === l);
  });
  route();
}
