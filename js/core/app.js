/**
 * PhysicsLab core — Application start-up: event wiring, theme, language, first render.
 */
'use strict';

function boot() {
  readColors();
  document.documentElement.dataset.theme = theme;
  readColors();
  document.getElementById('langSeg').onclick = e => {
    const b = e.target.closest('button');
    if (b) setLang(b.dataset.lang);
  };
  document.getElementById('themeSeg').onclick = e => {
    const b = e.target.closest('button');
    if (b) setTheme(b.dataset.theme);
  };
  const bb = document.getElementById('boardBtn');
  bb.onclick = () => {
    const on = !document.body.classList.contains('board');
    document.body.classList.toggle('board', on);
    bb.classList.toggle('on', on);
    bb.setAttribute('aria-pressed', on);
    if (E.sim) {
      E.stageH = stageHeight();
      redrawAll();
    }
  };
  // In-app navigation uses [data-go] elements, NOT <a href="#…">: hosts such as Google Sites
  // intercept every link click inside embedded HTML before the page sees it. See go() in views.js.
  const goFrom = e => {
    const el = e.target.closest && e.target.closest('[data-go]');
    if (!el) return false;
    e.preventDefault();
    go(el.dataset.go);
    return true;
  };
  document.addEventListener('click', goFrom);
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-go]')) goFrom(e);
  });
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('popstate', onHashChange);
  window.addEventListener('resize', () => {
    if (E.sim) {
      E.stageH = stageHeight();
      redrawAll();
    }
  });
  document.addEventListener('keydown', e => {
    if (!E.sim || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      toggleRun();
    } else if (e.key === 'r' || e.key === 'R') resetSim();
    else if (e.key === 'm' || e.key === 'M') record();
  });
  setTheme(theme);
  setLang(lang);
  requestAnimationFrame(loop);
}

boot();
