/**
 * PhysicsLab core — Translation helpers: L(pl,en), tr(obj), t(key) and the current language.
 */
'use strict';

const L = (pl, en) => ({ pl, en });
let lang = store.get('lang', 'pl');
const tr = o => (o == null ? '' : typeof o === 'string' ? o : o[lang] != null ? o[lang] : o.pl);
/** UI strings per language — filled in by js/i18n/<lang>.js */
const UI = {};
const t = k => (UI[lang][k] != null ? UI[lang][k] : k);
