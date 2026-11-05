/* garde.js · Lanceur « secteur → outil ». Données : secteurs-data.js (VP_SECTEURS, VP_OFFRES). Aucune donnée envoyée. */
(function(){
  'use strict';
  var S = window.VP_SECTEURS || {}, O = window.VP_OFFRES || [];
  var keys = Object.keys(S);
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var LABEL = { ok: 'Référentiel expert', cand: 'En construction' };
  var VERB = { scan: 'Chiffrer', expert: 'Résoudre', predict: 'Anticiper' };
  var ICON = { scan: '€', expert: '✓', predict: '↗' };
  var current = null;
  var BASE = document.documentElement.getAttribute('data-base') || '';
  /* Films de présentation (voix de synthèse, captures réelles des démonstrateurs). Durées en secondes. */
  var FILMS = {
    general: { f: 'video/vp-offre-complete', t: 'Notre offre : VP Scan, VP Expert, VP Predict', d: 103 },
    plastique: {
      scan:    { f: 'video/vp-scan', t: 'VP Scan · chiffrer et prioriser', d: 70 },
      expert:  { f: 'video/vp-expert-plastique', t: 'VP Expert · injection plastique', d: 89 },
      predict: { f: 'video/vp-predict-plastique', t: 'VP Predict · injection plastique', d: 83 }
    },
    caoutchouc: {
      scan:    { f: 'video/vp-scan', t: 'VP Scan · chiffrer et prioriser', d: 70 },
      expert:  { f: 'video/vp-expert-caoutchouc', t: 'VP Expert · caoutchouc', d: 94 },
      predict: { f: 'video/vp-predict-caoutchouc', t: 'VP Predict · caoutchouc', d: 81 }
    }
  };
  function dur(s){ var m = Math.floor(s / 60), r = s % 60; return m ? (m + ' min' + (r ? ' ' + (r < 10 ? '0' : '') + r : '')) : (r + ' s'); }
  function filmBtn(v, cls){
    if (!v) return '';
    return '<button type="button" class="' + cls + '" data-film="' + esc(v.f) + '" data-title="' + esc(v.t) + '" aria-label="Voir le film : ' + esc(v.t) + ' (' + esc(dur(v.d)) + ')">' +
      '<img src="' + esc(href(v.f + '.jpg')) + '" alt="" loading="lazy"><span class="play" aria-hidden="true"><i></i></span>' +
      '<span class="vl"><b>Voir le film</b> · ' + esc(dur(v.d)) + '</span></button>';
  }
  var href = function(u){ return /^https?:/.test(u) ? u : BASE + u; };

  function statusOf(sec){ return (sec.expert && sec.expert.statut) === 'ok' ? 'ok' : 'cand'; }
  function toolLabel(t){
    if (!t) return '';
    return t.statut === 'ok' ? (t.statutL || LABEL.ok) : LABEL.cand;
  }

  function renderRail(){
    var ul = $('g-sect'); ul.innerHTML = '';
    keys.forEach(function(k, i){
      var s = S[k], st = statusOf(s);
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" data-k="' + esc(k) + '" aria-pressed="false">' +
        '<span class="num">' + esc(s.num || ('0' + (i+1))) + '</span>' +
        '<span><span class="nm">' + esc(s.nom) + '</span><span class="sub"><i class="dot ' + (st === 'ok' ? '' : 'cand') + '"></i>' + (st === 'ok' ? 'Référentiel expert' : 'En construction') + ' · ' + esc(s.chiffre + ' ' + s.chiffreL) + '</span></span>' +
        '<span class="arr" aria-hidden="true">→</span></button>';
      li.firstChild.addEventListener('click', function(){ select(k, true); });
      ul.appendChild(li);
    });
  }

  function card(k, s, sk){
    var t = s[k], off = O.filter(function(o){ return o.k === k; })[0] || {};
    if (!t) return '';
    var film = FILMS[sk] && FILMS[sk][k];
    var facts = (t.fait || t.mesures || []).slice(0, 3);
    if (k === 'predict' && t.mesures) facts = ['Mesures suivies : ' + t.mesures.slice(0, 3).join(', ')].concat(t.connexion ? ['Connexion : ' + t.connexion] : []);
    return '<article class="g-card" data-tool="' + k + '">' +
      '<div class="ot"><span class="k">' + esc(VERB[k]) + '</span><span class="st"><i class="dot ' + (t.statut === 'ok' ? '' : 'cand') + '"></i>' + esc(toolLabel(t)) + '</span></div>' +
      '<h3>' + esc(off.nom || k) + '<span>' + esc(t.question || off.q || '') + '</span></h3>' +
      '<ul>' + facts.map(function(f){ return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      filmBtn(film, 'vid') +
      '<p class="base">' + esc(t.base || '') + '</p>' +
      '<a class="go' + (k === 'expert' ? ' main' : '') + '" href="' + esc(href(t.demo)) + '">' + esc(t.demoL || 'Ouvrir la démonstration') + ' <i aria-hidden="true">→</i></a>' +
      '</article>';
  }

  function select(k, push){
    var s = S[k]; if (!s) return;
    current = k;
    document.querySelectorAll('#g-sect button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-k') === k)); });
    $('g-title').innerHTML = esc(s.nom) + '<small>' + esc(s.accroche || '') + ' ' + esc(s.exemple ? 'Exemples : ' + s.exemple : '') + '</small>';
    $('g-chip').innerHTML = '<i class="dot ' + (statusOf(s) === 'ok' ? '' : 'cand') + '"></i>' + esc(s.chiffre) + ' <b>' + esc(s.chiffreL) + '</b>';
    $('g-cards').innerHTML = ['scan', 'expert', 'predict'].map(function(t){ return card(t, s, k); }).join('');
    var res = (s.ressources || []).map(function(r){ return '<a href="' + esc(href(r[1])) + '">' + esc(r[0]) + '</a>'; });
    res.push('<a class="doc" href="' + esc(href('secteur-' + k + '.html')) + '">Page secteur complète</a>');
    $('g-res').innerHTML = res.join('');
    $('g-more').removeAttribute('open');
    $('g-empty').classList.add('off'); $('g-empty').setAttribute('aria-hidden', 'true');
    $('g-tools').classList.add('on');
    $('g-reset').hidden = false;
    if (push) history.replaceState(null, '', '#' + k);
    if (window.matchMedia('(max-width: 980px)').matches) $('g-tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function reset(){
    current = null;
    document.querySelectorAll('#g-sect button').forEach(function(b){ b.setAttribute('aria-pressed', 'false'); });
    $('g-tools').classList.remove('on');
    $('g-empty').classList.remove('off'); $('g-empty').setAttribute('aria-hidden', 'false');
    $('g-reset').hidden = true;
    history.replaceState(null, '', location.pathname);
  }

  $('g-reset').addEventListener('click', reset);

  /* ---- Visionneuse (un seul lecteur ; rien n'est chargé avant le clic) ---- */
  var dlg = $('g-video'), vid = dlg ? dlg.querySelector('video') : null;
  function openFilm(base, title){
    if (!dlg || !vid) { location.href = href(base + '.mp4'); return; }
    dlg.querySelector('.gv-title').textContent = title || '';
    vid.poster = href(base + '.jpg');
    vid.src = href(base + '.mp4');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    var p = vid.play(); if (p && p.catch) p.catch(function(){});
  }
  function closeFilm(){
    if (!dlg) return;
    try { vid.pause(); } catch (e) {}
    vid.removeAttribute('src'); vid.load();
    if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  if (dlg) {
    dlg.querySelector('.gv-close').addEventListener('click', closeFilm);
    dlg.addEventListener('close', closeFilm);
    dlg.addEventListener('click', function(e){ if (e.target === dlg) closeFilm(); });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-film]') : null;
    if (b) { e.preventDefault(); openFilm(b.getAttribute('data-film'), b.getAttribute('data-title')); }
  });
  var hero = $('g-hero'); if (hero) hero.innerHTML = filmBtn(FILMS.general, 'vid hero');

  document.addEventListener('keydown', function(e){
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (dlg && dlg.open) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= keys.length) { select(keys[n - 1], true); return; }
    if (e.key === 'Escape') { reset(); return; }
    var map = { s: 'scan', e: 'expert', p: 'predict' }, t = map[e.key.toLowerCase()];
    if (t && current) { var a = document.querySelector('.g-card[data-tool="' + t + '"] .go'); if (a) a.click(); }
  });

  renderRail();
  var h = (location.hash || '').replace('#', '');
  if (S[h]) select(h, false);
  /* La page de garde s'ouvre toujours vide en début de rendez-vous ; #secteur dans l'URL ouvre directement un secteur. */
})();
