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

  function card(k, s){
    var t = s[k], off = O.filter(function(o){ return o.k === k; })[0] || {};
    if (!t) return '';
    var facts = (t.fait || t.mesures || []).slice(0, 3);
    if (k === 'predict' && t.mesures) facts = ['Mesures suivies : ' + t.mesures.slice(0, 3).join(', ')].concat(t.connexion ? ['Connexion : ' + t.connexion] : []);
    return '<article class="g-card" data-tool="' + k + '">' +
      '<div class="ot"><span class="k">' + esc(VERB[k]) + '</span><span class="st"><i class="dot ' + (t.statut === 'ok' ? '' : 'cand') + '"></i>' + esc(toolLabel(t)) + '</span></div>' +
      '<h3>' + esc(off.nom || k) + '<span>' + esc(t.question || off.q || '') + '</span></h3>' +
      '<ul>' + facts.map(function(f){ return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
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
    $('g-cards').innerHTML = ['scan', 'expert', 'predict'].map(function(t){ return card(t, s); }).join('');
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

  document.addEventListener('keydown', function(e){
    if (e.metaKey || e.ctrlKey || e.altKey) return;
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
