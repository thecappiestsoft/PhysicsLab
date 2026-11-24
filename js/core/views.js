/**
 * PhysicsLab core — Views: home, simulation page, “My lab”; routing on location.hash.
 */
'use strict';

const app = document.getElementById('app');
function nav(active) {
  document.getElementById('nav').innerHTML =
    `<a data-go="home" role="link" tabindex="0" class="${active === 'home' ? 'on' : ''}">${t('sections')}</a><a data-go="lab" role="link" tabindex="0" class="${active === 'lab' ? 'on' : ''}">${t('lab')}</a>`;
  const bb = document.getElementById('boardBtn');
  bb.title = t('board');
  bb.setAttribute('aria-label', t('board'));
  document.querySelectorAll('#themeSeg button').forEach(b => {
    b.title = t(b.dataset.theme);
    b.setAttribute('aria-label', t(b.dataset.theme));
  });
}
/*
 * Routing.
 * The current view is kept in ROUTE (not read from the address bar), because when
 * the page is embedded (Google Sites, LMS, srcdoc iframes) links like href="#pend"
 * resolve against the PARENT page URL, and hosts like Google Sites intercept link
 * clicks altogether. In-app navigation therefore uses elements with data-go="…"
 * (no href), handled in app.js and passed to go(); the hash is only
 * updated as a convenience (deep links, Back button) where the browser allows it.
 */
let ROUTE = readHash();
function readHash() {
  let h = '';
  try {
    h = location.hash.replace(/^#\/?/, '');
  } catch (e) {}
  return h.startsWith('sim/') ? h.slice(4) : h;
}
/** Navigate to a view: 'home', 'lab' or a simulation id. */
function go(name) {
  ROUTE = name || 'home';
  try {
    if (readHash() !== ROUTE) history.pushState(null, '', '#' + ROUTE);
  } catch (e) {}
  route();
}
/** Called when the user edits the address or presses Back/Forward. */
function onHashChange() {
  const h = readHash();
  if (h === ROUTE) return;
  ROUTE = h;
  route();
}
function route() {
  const h = ROUTE;
  cancelSim();
  if (simById[h]) viewSim(simById[h]);
  else if (h === 'lab') viewLab();
  else viewHome();
  window.scrollTo(0, 0);
}
function cancelSim() {
  if (E.sim && E.sim.leave) E.sim.leave(E.s, E.p);
  E.sim = null;
  E.run = false;
  if (heroRaf) {
    cancelAnimationFrame(heroRaf);
    heroRaf = 0;
  }
}
function secIcon(sc, size) {
  return `<div class="ic" style="background:${sc.col}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[sc.id]}</svg></div>`;
}
let heroRaf = 0;
function viewHome() {
  nav('home');
  document.title = 'PhysicsLab';
  app.innerHTML = `<section class="hero"><div><h1>PhysicsLab<br><span>${t('heroT')}</span></h1><p>${t('heroP')}</p>
 <div class="steps">${t('rule')
   .map((s, i) => `<div class="st"><b>${i + 1}</b>${s}</div>`)
   .join('')}</div></div>
 <div class="hero-art"><canvas id="heroCv"></canvas></div></section>
 <h2 class="h2">${t('allSec')} <span class="hint">· ${SIMS.length} ${t('sims')}</span></h2>
 <div class="grid-sec">${SECTIONS.map(sc => {
   const ss = SIMS.filter(s => s.sec === sc.id);
   return `<div class="sec-card"><div class="hd">${secIcon(sc)}<div><h3>${tr(sc.n)}</h3></div></div><p>${tr(sc.d)}</p><div class="chips">${ss.map(s => `<a class="chip" data-go="${s.id}" role="link" tabindex="0">${esc(tr(s.n))}</a>`).join('')}</div></div>`;
 }).join('')}</div>`;
  heroAnim();
}
function heroAnim() {
  const cv = document.getElementById('heroCv');
  if (!cv) return;
  const t0 = performance.now();
  const f = () => {
    heroRaf = requestAnimationFrame(f);
    const H = cv.parentElement.clientHeight;
    const { c, w, h } = fitCanvas(cv, H);
    const tt = (performance.now() - t0) / 1000;
    bg(c, w, h, 24);
    // pendulum
    const px = w * 0.28,
      py = h * 0.12,
      Lp = h * 0.55,
      th = 0.55 * Math.cos(tt * Math.sqrt(9.81 / 1.2));
    const bx = px + Lp * Math.sin(th),
      by = py + Lp * Math.cos(th);
    line(c, px - 40, py, px + 40, py, 'obj', 3);
    line(c, px, py, bx, by, 'muted', 1.6);
    circle(c, bx, by, 16, 'c1');
    arrow(
      c,
      bx,
      by,
      bx + Math.cos(th) * -Math.sin(tt * 2.86) * 60,
      by - Math.sin(th) * -Math.sin(tt * 2.86) * 60,
      'c3',
      'v'
    );
    // wave
    c.save();
    c.strokeStyle = C.c2;
    c.lineWidth = 2.5;
    c.beginPath();
    for (let x = w * 0.5; x < w * 0.95; x += 3) {
      const y = h * 0.32 + Math.sin((x / w) * 18 - tt * 3) * h * 0.07;
      x === w * 0.5 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke();
    c.restore();
    // projectile
    const T = 2.2,
      ph = (tt % T) / T,
      vx = w * 0.4,
      x0 = w * 0.52,
      y0 = h * 0.88;
    c.save();
    c.strokeStyle = C.c5;
    c.setLineDash([3, 5]);
    c.lineWidth = 1.5;
    c.beginPath();
    for (let u = 0; u <= ph; u += 0.01) {
      const xx = x0 + vx * u,
        yy = y0 - h * 1.6 * u + h * 1.6 * u * u;
      u === 0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy);
    }
    c.stroke();
    c.restore();
    const xx = x0 + vx * ph,
      yy = y0 - h * 1.6 * ph + h * 1.6 * ph * ph;
    circle(c, xx, yy, 9, 'c5');
    arrow(c, xx, yy, xx, yy + 36, 'c4', 'g');
    line(c, w * 0.48, y0 + 9, w * 0.97, y0 + 9, 'obj', 2);
  };
  f();
}
function viewSim(sm) {
  nav('');
  const sc = SECTIONS.find(s => s.id === sm.sec);
  document.title = tr(sm.n) + ' · PhysicsLab';
  E.sim = sm;
  const saved = store.get('p.' + sm.id, null);
  E.p = Object.assign(defaults(sm), saved || {});
  E.chartIdx = 0;
  E.speed = 1;
  const ss = SIMS.filter(s => s.sec === sm.sec);
  app.innerHTML = `<div class="crumb"><a data-go="home" role="link" tabindex="0">${t('sections')}</a><span>›</span><span>${tr(sc.n)}</span></div>
 <div class="sim-head"><div><h1>${esc(tr(sm.n))}</h1><p>${esc(tr(sm.d))}</p></div></div>
 <div class="tabs-sims">${ss.map(s => `<a data-go="${s.id}" role="link" tabindex="0" class="${s === sm ? 'on' : ''}">${esc(tr(s.n))}</a>`).join('')}</div>
 <div class="layout"><div class="col">
  <div class="card"><div class="stage"><canvas id="stage" aria-label="${esc(tr(sm.n))}"></canvas></div>
   <div class="toolbar">${sm.step ? `<button class="btn pri" id="runBtn"></button><button class="btn" id="stepBtn">${IC.step}${t('step')}</button>` : ''}
   <button class="btn" id="resetBtn">${IC.reset}${t('reset')}</button>
   ${sm.step ? `<label class="hint" for="spd">${t('speed')}</label><select class="sel" id="spd">${[0.1, 0.25, 0.5, 1, 2, 4].map(v => `<option value="${v}" ${v === 1 ? 'selected' : ''}>×${fmt(v, v < 1 ? (v < 0.25 ? 1 : 2) : 0)}</option>`).join('')}</select><span class="clock" id="clock"></span>` : ''}
   <span class="spacer"></span>${sm.extraBtn ? `<button class="btn" id="xBtn">${tr(sm.extraBtn.l)}</button>` : ''}<button class="btn" id="recBtn">${IC.rec}${t('record')}</button></div></div>
  ${sm.charts ? `<div class="card"><div class="ch">${t('chart')}${sm.charts.length > 1 ? `<span class="spacer"></span><div class="seg" id="chSeg">${sm.charts.map((c, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${esc(tr(c.name))}</button>`).join('')}</div>` : `<span class="sub">${esc(tr(sm.charts[0].name))}</span>`}</div><div class="cb chart-wrap"><canvas id="chart"></canvas></div></div>` : ''}
  <div class="card"><div class="ch">${t('meas')}<span class="spacer"></span><label class="chk" style="font-weight:500;font-size:12.5px"><input type="checkbox" id="noise" ${NOISE ? 'checked' : ''}>${t('noise')}</label><button class="btn sm" id="csvBtn">${IC.dl}${t('export')}</button><button class="btn sm" id="cpBtn">${IC.copy}${t('copy')}</button><button class="btn sm" id="clrBtn" title="${t('clear')}" aria-label="${t('clear')}">${IC.trash}</button></div><div class="tbl-wrap" id="meas"></div></div>
 </div><div class="col">
  <div class="card"><div class="ch">${t('params')}</div><div class="cb prm" id="prm"></div></div>
  <div class="card"><div class="ch">${t('reads')}</div><div class="cb"><div class="reads" id="reads"></div></div></div>
  <div class="card"><div class="ptabs"><button data-t="know">${t('know')}</button><button data-t="task">${t('task')}</button></div><div class="cb" id="side"></div></div>
  <div class="hint" style="text-align:center">${t('keys')}</div>
 </div></div>`;
  buildParams();
  bindSim();
  drawTable();
  sideTab(E.tab);
  E.stageH = stageHeight();
  resetSim();
  updClock();
}
function stageHeight() {
  const w = (document.getElementById('stage') || {}).clientWidth || 800;
  return Math.round(clamp(w * 0.52, 300, document.body.classList.contains('board') ? 620 : 470));
}
function buildParams() {
  const sm = E.sim,
    el = document.getElementById('prm');
  el.innerHTML = sm.params
    .filter(q => !q.if || q.if(E.p))
    .map(q => {
      const lab = esc(tr(q.l));
      if (q.type === 'sel')
        return `<div class="row"><div class="lab">${lab}</div><select data-k="${q.k}">${q.o.map(o => `<option value="${o[0]}" ${String(E.p[q.k]) === String(o[0]) ? 'selected' : ''}>${esc(tr(o[1]))}</option>`).join('')}</select></div>`;
      if (q.type === 'chk')
        return `<label class="chk"><input type="checkbox" data-k="${q.k}" ${E.p[q.k] ? 'checked' : ''}>${lab}</label>`;
      return `<div class="row"><div class="lab"><span>${lab}</span><span class="val"><input type="number" data-n="${q.k}" min="${q.min}" max="${q.max}" step="${q.step}" value="${q.v != null ? E.p[q.k] : ''}" aria-label="${lab}"><span class="u">${esc(q.u || '')}</span></span></div><input type="range" data-k="${q.k}" min="${q.min}" max="${q.max}" step="${q.step}" value="${E.p[q.k]}" aria-label="${lab}"></div>`;
    })
    .join('');
}
function setParam(k, v, from) {
  const sm = E.sim,
    q = sm.params.find(x => x.k === k);
  if (q.type !== 'sel' && q.type !== 'chk') {
    v = clamp(+v, q.min, q.max);
    if (!isFinite(v)) return;
  }
  if (q.type === 'sel' && typeof q.v === 'number') v = +v;
  E.p[k] = v;
  store.set('p.' + sm.id, E.p);
  const el = document.getElementById('prm');
  if (from !== 'range') {
    const r = el.querySelector(`input[type=range][data-k="${k}"]`);
    if (r) r.value = v;
  }
  if (from !== 'num') {
    const n = el.querySelector(`[data-n="${k}"]`);
    if (n) n.value = +(+v).toFixed(6);
  }
  const hasIf = sm.params.some(x => x.if);
  if (hasIf && (q.type === 'sel' || q.type === 'chk')) {
    buildParams();
  }
  if (q.live || sm.live === true || (Array.isArray(sm.live) && sm.live.includes(k))) {
    if (sm.onLive) sm.onLive(E.s, E.p, k);
    drawStage();
    drawReads();
    drawCh();
  } else {
    const was = E.run;
    resetSim();
    if (was && sm.keepRun) {
      E.run = true;
      updButtons();
    }
  }
}
function bindSim() {
  const sm = E.sim;
  const el = document.getElementById('prm');
  el.addEventListener('input', e => {
    const k = e.target.dataset.k,
      n = e.target.dataset.n;
    if (k && e.target.type === 'range') setParam(k, e.target.value, 'range');
    else if (n && e.target.value !== '') setParam(n, e.target.value, 'num');
  });
  el.addEventListener('change', e => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (e.target.type === 'checkbox') setParam(k, e.target.checked);
    else if (e.target.tagName === 'SELECT') setParam(k, e.target.value);
  });
  const g = id => document.getElementById(id);
  if (g('runBtn')) g('runBtn').onclick = toggleRun;
  if (g('stepBtn')) g('stepBtn').onclick = stepOnce;
  g('resetBtn').onclick = resetSim;
  if (g('spd')) g('spd').onchange = e => (E.speed = +e.target.value);
  g('recBtn').onclick = record;
  if (g('xBtn'))
    g('xBtn').onclick = () => {
      sm.extraBtn.f(E.s, E.p);
      drawStage();
      drawReads();
      drawCh();
    };
  g('noise').onchange = e => (NOISE = e.target.checked);
  g('csvBtn').onclick = () => {
    const rows = MEAS[sm.id] || [];
    if (!rows.length) {
      toast(t('noMeas'));
      return;
    }
    download('physicslab-' + sm.id + '.csv', csvOf(sm, rows));
  };
  g('cpBtn').onclick = () => {
    const rows = MEAS[sm.id] || [];
    if (!rows.length) {
      toast(t('noMeas'));
      return;
    }
    copyText(csvOf(sm, rows));
  };
  g('clrBtn').onclick = () => {
    delete MEAS[sm.id];
    saveMeas();
    drawTable();
    drawCh();
  };
  if (g('chSeg'))
    g('chSeg').onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      E.chartIdx = +b.dataset.i;
      g('chSeg')
        .querySelectorAll('button')
        .forEach(x => x.classList.toggle('on', x === b));
      drawCh();
    };
  document.querySelector('.ptabs').onclick = e => {
    const b = e.target.closest('button');
    if (b) sideTab(b.dataset.t);
  };
  const cv = g('stage');
  const pos = e => {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, r.width, E.stageH];
  };
  let drag = false;
  cv.addEventListener('pointerdown', e => {
    if (!sm.down) return;
    const [x, y, w, h] = pos(e);
    if (sm.down(E.s, E.p, x, y, w, h)) {
      drag = true;
      cv.setPointerCapture(e.pointerId);
      drawStage();
      drawReads();
      drawCh();
    }
  });
  cv.addEventListener('pointermove', e => {
    const [x, y, w, h] = pos(e);
    if (drag && sm.move) {
      sm.move(E.s, E.p, x, y, w, h);
      store.set('p.' + sm.id, E.p);
      syncParamInputs();
      drawStage();
      drawReads();
      drawCh();
    } else if (sm.hover) {
      cv.style.cursor = sm.hover(E.s, E.p, x, y, w, h) ? 'grab' : 'default';
    }
  });
  const up = () => {
    if (drag) {
      drag = false;
      if (sm.up) sm.up(E.s, E.p);
      drawStage();
    }
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
}
function syncParamInputs() {
  const el = document.getElementById('prm');
  if (!el) return;
  E.sim.params.forEach(q => {
    const r = el.querySelector(`input[type=range][data-k="${q.k}"]`);
    if (r && +r.value !== E.p[q.k]) {
      r.value = E.p[q.k];
      const n = el.querySelector(`[data-n="${q.k}"]`);
      if (n) n.value = +(+E.p[q.k]).toFixed(4);
    }
  });
}
function sideTab(tb) {
  E.tab = tb;
  document.querySelectorAll('.ptabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tb));
  const sm = E.sim,
    el = document.getElementById('side');
  if (tb === 'know') {
    el.innerHTML = `<h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">${t('formulas')}</h4>${(sm.f || []).map(f => `<div class="formula">${esc(tr(f))}</div>`).join('')}
  ${sm.model ? `<div class="note"><b>${t('model')}:</b> ${esc(tr(sm.model))}</div>` : ''}${sm.drag ? `<div class="note">${t('drag')}</div>` : ''}
  ${sm.q ? `<h4 style="margin:14px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">${t('questions')}</h4><ul class="qs">${sm.q.map(q => `<li>${esc(tr(q))}</li>`).join('')}</ul>` : ''}`;
    return;
  }
  const nt = NOTES[sm.id] || {};
  const tk = sm.task;
  el.innerHTML = `<div class="task"><div class="flow">${t('rule')
    .map((s, i) => `<span class="${i === (nt.ans != null ? 2 : nt.hyp ? 1 : 0) ? 'on' : ''}">${s}</span>`)
    .join('')}</div>
  <h4>${t('hyp')}</h4><textarea id="hyp" placeholder="${t('hypPh')}">${esc(nt.hyp || '')}</textarea>
  ${
    tk
      ? `<h4>${t('check')}</h4><p class="q">${esc(tr(tk.q))}</p>${tk.o.map((o, i) => `<button class="opt ${nt.ans === i ? (i === tk.a ? 'ok' : 'bad') : ''}" data-i="${i}"><b>${'ABCD'[i]}</b>${esc(tr(o))}</button>`).join('')}
  ${nt.ans != null ? `<div class="fb ${nt.ans === tk.a ? 'ok' : 'bad'}"><b>${nt.ans === tk.a ? t('correct') : t('wrong')}</b>${nt.ans === tk.a ? ' ' + esc(tr(tk.ex)) : ''}</div>` : ''}`
      : ''
  }
  <h4>${t('concl')}</h4><textarea id="concl" placeholder="${t('conclPh')}">${esc(nt.concl || '')}</textarea></div>`;
  const save = () => {
    NOTES[sm.id] = Object.assign(NOTES[sm.id] || {}, {
      hyp: el.querySelector('#hyp').value,
      concl: el.querySelector('#concl').value,
    });
    saveNotes();
  };
  el.querySelector('#hyp').oninput = save;
  el.querySelector('#concl').oninput = save;
  el.querySelectorAll('.opt').forEach(
    b =>
      (b.onclick = () => {
        save();
        NOTES[sm.id].ans = +b.dataset.i;
        saveNotes();
        sideTab('task');
      })
  );
}
function viewLab() {
  nav('lab');
  document.title = t('lab') + ' · PhysicsLab';
  const ids = SIMS.filter(
    s => (MEAS[s.id] && MEAS[s.id].length) || (NOTES[s.id] && (NOTES[s.id].hyp || NOTES[s.id].concl))
  );
  app.innerHTML = `<div class="sim-head"><div><h1>${t('lab')}</h1><p>${t('labIntro')}</p></div><span class="spacer"></span>${ids.length ? `<button class="btn" id="cpAll">${IC.copy}${t('copyAll')}</button><button class="btn" id="expAll">${IC.dl}${t('exportAll')}</button>` : ''}</div>
 ${
   ids.length
     ? ids
         .map(sm => {
           const rows = MEAS[sm.id] || [];
           const nt = NOTES[sm.id] || {};
           const cols = tableCols(rows);
           const sc = SECTIONS.find(s => s.id === sm.sec);
           return `<div class="card lab-sim"><div class="ch">${esc(tr(sm.n))}<span class="sub">· ${tr(sc.n)} · ${rows.length} ${t('measN')}</span><span class="spacer"></span><a class="btn sm" data-go="${sm.id}" role="link" tabindex="0">${t('open')}</a></div>
  ${rows.length ? `<div class="tbl-wrap"><table class="meas"><thead><tr><th>#</th>${cols.map(k => `<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${cols.map(k => `<td>${r[k] == null ? '' : esc(typeof r[k] === 'number' ? fmt(r[k]) : r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
  ${nt.hyp || nt.concl ? `<div class="lab-notes"><div><b>${t('hyp').replace(/^1\.\s*/, '')}</b>${esc(nt.hyp || '—')}</div><div><b>${t('concl').replace(/^3\.\s*/, '')}</b>${esc(nt.concl || '—')}</div></div>` : ''}</div>`;
         })
         .join('')
     : `<div class="card"><div class="empty" style="padding:40px">${t('labEmpty')}</div></div>`
 }`;
  const allCsv = () =>
    ids
      .filter(s => MEAS[s.id] && MEAS[s.id].length)
      .map(s => csvOf(s, MEAS[s.id]))
      .join('\n\n');
  const cb = document.getElementById('cpAll');
  if (cb) cb.onclick = () => copyText(allCsv());
  const b = document.getElementById('expAll');
  if (b)
    b.onclick = () =>
      download(
        'physicslab-' + new Date().toISOString().slice(0, 10) + '.csv',
        ids
          .filter(s => MEAS[s.id] && MEAS[s.id].length)
          .map(s => csvOf(s, MEAS[s.id]))
          .join('\n\n')
      );
}
function redrawAll() {
  if (E.sim) {
    drawStage();
    drawCh();
    drawReads();
  }
}
