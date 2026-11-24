/**
 * PhysicsLab core — Simulation loop, sampling, readouts, measurements table and CSV export.
 */
'use strict';

const E = {
  sim: null,
  p: {},
  s: {},
  run: false,
  speed: 1,
  raf: 0,
  last: 0,
  chartIdx: 0,
  acc: 0,
  sampleAcc: 0,
  tab: 'know',
  stageH: 420,
};
let MEAS = store.get('meas', {}),
  NOTES = store.get('notes', {}),
  NOISE = false;
function saveMeas() {
  store.set('meas', MEAS);
}
function saveNotes() {
  store.set('notes', NOTES);
}
function defaults(sm) {
  const p = {};
  sm.params.forEach(q => (p[q.k] = q.v));
  return p;
}
function resetSim() {
  const sm = E.sim;
  E.s = { t: 0, hist: [] };
  if (sm.init) sm.init(E.s, E.p);
  sample(true);
  E.run = !!sm.autorun;
  updButtons();
  drawStage();
  drawReads();
  drawCh();
}
function sample(force) {
  const sm = E.sim;
  if (!sm.sample) return;
  const r = sm.sample(E.s, E.p);
  if (r) {
    r.t = r.t != null ? r.t : E.s.t;
    E.s.hist.push(r);
    if (E.s.hist.length > 4000) E.s.hist.splice(0, 1000);
  }
}
function loop(ts) {
  E.raf = requestAnimationFrame(loop);
  if (!E.sim) return;
  const dtReal = Math.min(0.05, (ts - (E.last || ts)) / 1000);
  E.last = ts;
  const sm = E.sim;
  let changed = false;
  if (E.run && sm.step) {
    const h = sm.dt || 1 / 240;
    E.acc += dtReal * E.speed;
    let n = 0;
    while (E.acc >= h && n < 2000) {
      sm.step(E.s, E.p, h);
      E.s.t += h;
      E.acc -= h;
      n++;
      E.sampleAcc += h;
      if (E.sampleAcc >= (sm.sampleDt || 1 / 30)) {
        E.sampleAcc = 0;
        sample();
      }
      if (E.s.done) {
        E.run = false;
        E.acc = 0;
        sample();
        updButtons();
        break;
      }
    }
    changed = true;
  }
  if (sm.anim) {
    sm.anim(E.s, E.p, dtReal * E.speed);
    changed = true;
  }
  if (changed) {
    drawStage();
    throttle();
  }
}
let _th = 0;
function throttle() {
  const n = performance.now();
  if (n - _th > 110) {
    _th = n;
    drawReads();
    drawCh();
    updClock();
  }
}
function stepOnce() {
  const sm = E.sim;
  if (!sm.step) return;
  E.run = false;
  const h = sm.dt || 1 / 240;
  for (let i = 0; i < Math.round(0.05 / h); i++) {
    sm.step(E.s, E.p, h);
    E.s.t += h;
    if (E.s.done) break;
  }
  sample();
  updButtons();
  drawStage();
  drawReads();
  drawCh();
  updClock();
}
function toggleRun() {
  if (!E.sim.step) return;
  if (E.s.done) {
    resetSim();
  }
  E.run = !E.run;
  E.last = 0;
  updButtons();
}
function drawStage() {
  const cv = document.getElementById('stage');
  if (!cv) return;
  const { c, w, h } = fitCanvas(cv, E.stageH);
  c.save();
  E.sim.draw(c, w, h, E.s, E.p);
  c.restore();
}
function curReads() {
  return E.sim.read ? E.sim.read(E.s, E.p) : [];
}
function drawReads() {
  const el = document.getElementById('reads');
  if (!el) return;
  const r = curReads();
  el.innerHTML = r
    .map(
      x =>
        `<div class="rd${x[4] ? ' wide' : ''}"><div class="k" title="${esc(tr(x[0]))}">${esc(tr(x[0]))}</div><div class="v">${esc(typeof x[1] === 'number' ? fmt(x[1], x[3]) : tr(x[1]))}${x[2] ? `<small>${esc(x[2])}</small>` : ''}</div></div>`
    )
    .join('');
}
function chartSpec() {
  const sm = E.sim;
  if (!sm.charts) return null;
  const ch = sm.charts[E.chartIdx] || sm.charts[0];
  if (ch.fn) return ch.fn(E.p, E.s, MEAS[sm.id] || []);
  const H = E.s.hist;
  return {
    xl: ch.xl,
    yl: ch.yl,
    xmin: ch.xmin,
    xmax: typeof ch.xmax === 'function' ? ch.xmax(E.p, E.s) : ch.xmax,
    ymin: ch.ymin,
    ymax: typeof ch.ymax === 'function' ? ch.ymax(E.p, E.s) : ch.ymax,
    ser: ch.ser
      .filter(s => !s.if || s.if(E.p))
      .map(s => ({
        n: s.n,
        c: s.c,
        dash: s.dash,
        pts: H.filter(r => r[s.k] != null).map(r => [r[ch.xk || 't'], r[s.k]]),
      })),
  };
}
function drawCh() {
  const cv = document.getElementById('chart');
  if (!cv) return;
  drawChart(cv, chartSpec());
}
function updClock() {
  const el = document.getElementById('clock');
  if (el && E.sim.step) el.textContent = 't = ' + fmt(E.s.t, 2) + ' s';
}
const IC = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  step: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l10-7z"/><rect x="16" y="5" width="3" height="14" rx="1"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  rec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
};
function updButtons() {
  const b = document.getElementById('runBtn');
  if (!b) return;
  b.innerHTML = E.run ? IC.pause + t('pause') : IC.play + t('start');
  b.classList.toggle('pri', !E.run);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
}
function toast(m) {
  const el = document.getElementById('toast');
  el.textContent = m;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1600);
}

function record() {
  const sm = E.sim;
  const r = curReads().filter(x => !x[5]);
  const row = {};
  r.forEach(x => {
    let v = x[1];
    if (typeof v === 'number' && NOISE && !x[6]) v = v * (1 + (Math.random() * 2 - 1) * 0.02);
    row[tr(x[0]) + (x[2] ? ' [' + x[2] + ']' : '')] = typeof v === 'number' ? +v.toPrecision(5) : tr(v);
  });
  (MEAS[sm.id] = MEAS[sm.id] || []).push(row);
  saveMeas();
  drawTable();
  drawCh();
  toast(t('saved'));
}
function tableCols(rows) {
  const cols = [];
  rows.forEach(r =>
    Object.keys(r).forEach(k => {
      if (!cols.includes(k)) cols.push(k);
    })
  );
  return cols;
}
function drawTable() {
  const el = document.getElementById('meas');
  if (!el) return;
  const rows = MEAS[E.sim.id] || [];
  if (!rows.length) {
    el.innerHTML = `<div class="empty">${t('noMeas')}</div>`;
    return;
  }
  const cols = tableCols(rows);
  const means = cols.map(k => {
    const v = rows.map(r => r[k]).filter(x => typeof x === 'number');
    return v.length === rows.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  });
  el.innerHTML = `<table class="meas"><thead><tr><th>#</th>${cols.map(k => `<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${cols.map(k => `<td>${r[k] == null ? '' : esc(typeof r[k] === 'number' ? fmt(r[k]) : r[k])}</td>`).join('')}</tr>`).join('')}</tbody>${rows.length > 1 ? `<tfoot><tr><td>${t('mean')}</td>${means.map(m => `<td>${m == null ? '' : fmt(m)}</td>`).join('')}</tr></tfoot>` : ''}</table>`;
}
function csvOf(sm, rows) {
  const cols = tableCols(rows);
  const sep = lang === 'pl' ? ';' : ',';
  const q = v => {
    let s = v == null ? '' : String(v);
    if (lang === 'pl' && typeof v === 'number') s = s.replace('.', ',');
    return /[";,\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [q(tr(sm.n))]
    .concat(
      [cols.map(q).join(sep)],
      rows.map(r => cols.map(k => q(r[k])).join(sep))
    )
    .join('\n');
}
function copyText(txt) {
  const ok = () => toast(t('copied'));
  try {
    navigator.clipboard.writeText(txt).then(ok, () => fallbackCopy(txt));
  } catch (e) {
    fallbackCopy(txt);
  }
}
function fallbackCopy(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let r = false;
  try {
    r = document.execCommand('copy');
  } catch (e) {}
  ta.remove();
  toast(r ? t('copied') : t('copyFail'));
}
let DL = null;
if (window.claude && window.claude.use) {
  window.claude
    .use('downloads')
    .then(d => {
      DL = d;
    })
    .catch(() => {});
}
function download(name, txt) {
  if (DL) {
    DL.save({ filename: name, data: '\ufeff' + txt }).then(
      () => toast(t('exported')),
      e => {
        if (e && e.code !== 'declined') copyText(txt);
      }
    );
    return;
  }
  const blob = new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
  toast(t('exported'));
}
