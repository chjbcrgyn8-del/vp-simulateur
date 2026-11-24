/* Un seul secteur à la fois : une fois le métier choisi (ou une page de secteur ouverte), l'autre secteur disparaît
   des menus, des onglets et de la présentation. Le choix est gardé dans ce navigateur (localStorage « vp-secteur »).
   « Changer de secteur » (index.html?changer=1) l'efface. Sans JavaScript ou sans stockage : tout reste visible.
   Recentrage du 24 novembre 2026 : deux secteurs proposés, caoutchouc puis injection plastique. Le décolletage et le
   traitement de surface ne sont plus proposés : leurs pages restent en ligne, mais aucun menu n'y renvoie et les ouvrir
   ne change pas le secteur mémorisé. Le masquage se fait par adresse du lien, plus par rang dans le menu. */
(function () {
  var K = ['caoutchouc', 'plastique', 'decolletage', 'traitement-surface'];
  var VIS = 2; /* les deux premiers sont proposés */
  var P = {
    caoutchouc: 0, 'presse-caoutchouc': 0, 'enquete-caoutchouc': 0, 'secteur-caoutchouc': 0, 'st-mesures-caoutchouc': 0, 'st-reperes-caoutchouc': 0,
    presse: 1, gains: 1, enquete: 1, 'secteur-plastique': 1, 'st-mesures-plastique': 1,
    'machine-decolletage': 2, 'scan-decolletage': 2, 'enquete-decolletage': 2, 'secteur-decolletage': 2, decolletage: 2, 'sources-decolletage': 2, 'st-mesures-decolletage': 2, 'st-reperes-decolletage': 2,
    'machine-traitement-surface': 3, 'scan-traitement-surface': 3, 'enquete-traitement-surface': 3, 'secteur-traitement-surface': 3, 'sources-traitement-surface': 3, 'st-mesures-traitement-surface': 3, 'st-reperes-traitement-surface': 3
  };
  var name = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  function get() { try { var v = localStorage.getItem('vp-secteur'); var i = K.indexOf(v); return i > -1 && i < VIS ? i : null; } catch (e) { return null; } }
  function set(i) { try { if (i === null) localStorage.removeItem('vp-secteur'); else localStorage.setItem('vp-secteur', K[i]); } catch (e) {} }

  var changer = name === 'index' && /(^|[?&])changer(=|&|$)/.test(location.search);
  if (changer) {
    set(null);
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  }
  var sec = P[name] !== undefined ? P[name] : get();
  if (P[name] !== undefined && sec < VIS) set(sec);

  /* Pages communes qui prennent le secteur dans l'adresse (pilote, savoir technique).
     Adresse précise (?secteur=…) : elle fait foi et devient le secteur mémorisé.
     Adresse sans précision : on y inscrit le secteur mémorisé avant que la page ne se construise, pour qu'elle s'ouvre dans le bon métier. */
  if (name === 'pilote' || name === 'savoir') {
    var mq = /(?:^|[?&])secteur=([^&#]*)/.exec(location.search);
    if (mq) {
      var qv = decodeURIComponent(mq[1]);
      if (qv === 'caoutchouc') sec = 0; else if (qv === 'injection' || qv === 'plastique') sec = 1;
      if (sec !== null && sec < VIS) set(sec);
    } else if (sec !== null && sec < VIS) {
      var v = sec === 0 ? 'caoutchouc' : (name === 'savoir' ? 'injection' : null);
      if (v) { try { history.replaceState(null, '', location.pathname + (location.search ? location.search + '&' : '?') + 'secteur=' + v + location.hash); } catch (e) {} }
    }
  }

  /* Liens à retirer des menus : ceux des secteurs non proposés, toujours ; ceux de l'autre secteur, une fois le métier choisi. */
  var out = function (j) { return sec === null ? j >= VIS : j !== sec; };
  var MENUS = ['nav.tabs.sector', '.vnav details.dd .ddm', '.pick-g', '.doc-top nav', '.sitefoot'];
  var sel = [];
  Object.keys(P).forEach(function (f) {
    if (!out(P[f])) return;
    MENUS.forEach(function (m) { sel.push(m + ' a[href^="' + f + '.html"]'); });
  });
  /* Pilote : les onglets portent le secteur dans l'adresse */
  if (sec === 0) sel.push('nav.tabs.sector a[href="pilote.html"]');
  if (sec === 1) sel.push('nav.tabs.sector a[href="pilote.html?secteur=caoutchouc"]');
  /* Savoir technique : les onglets changent de secteur sans changer de page */
  if (sec !== null && sec < VIS) sel.push('nav.tabs.sector a[data-sec="' + (sec === 0 ? 'p' : 'c') + '"]');
  /* Renvois vers le savoir et les sources des autres secteurs */
  K.forEach(function (s, j) {
    if (!out(j)) return;
    sel.push('main a[href^="st-mesures-' + s + '"]', 'main a[href^="st-reperes-' + s + '"]', 'main a[href^="sources-' + s + '"]');
  });
  var css = sel.join(',') + '{display:none!important}';
  if (sec !== null) {
    document.documentElement.setAttribute('data-sec', K[sec]);
    document.documentElement.setAttribute('data-sec-n', String(sec + 1));
    var h = 'html[data-sec] ';
    css += h + '.pick-lg,' + h + '.sx-secnav,' + h + '.sx-next{display:none!important}' +
      h + '.pick-g{grid-template-columns:1fr;max-width:340px}' +
      h + '.sec-change{color:#e3b47c;font-weight:600;text-decoration:underline;text-underline-offset:3px}' +
      h + '.ddm .sec-change{color:#8a4a0c}';
  }
  /* Posé avant l'affichage : pas de scintillement. */
  var st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  if (sec === null || sec >= VIS) return;

  document.addEventListener('DOMContentLoaded', function () {
    var href = 'index.html?changer=1#secteurs';
    var mk = function (label) { var a = document.createElement('a'); a.className = 'sec-change'; a.href = href; a.setAttribute('data-keep', ''); a.textContent = label; return a; };
    document.querySelectorAll('nav.tabs.sector').forEach(function (nav) { nav.appendChild(mk('Changer de secteur')); });
    document.querySelectorAll('.vnav details.dd:nth-of-type(1) .ddm').forEach(function (m) { var a = mk('Changer de secteur'); a.style.display = 'block'; a.style.padding = '10px 14px'; m.appendChild(a); });
    document.querySelectorAll('nav.tabs.menu a, .vnav>a').forEach(function (a) {
      if (/index\.html#secteurs$/.test(a.getAttribute('href') || '') || (a.textContent.trim() === 'Secteurs' && /#secteurs$/.test(a.getAttribute('href') || ''))) { a.setAttribute('href', href); a.setAttribute('data-keep', ''); a.textContent = 'Changer de secteur'; }
    });
    var pg = document.querySelector('.pick-g');
    if (pg) {
      var l = document.getElementById('pick-l'); if (l) l.textContent = 'Votre métier';
      var p = document.createElement('p'); p.className = 'pick-ch'; p.style.margin = '10px 0 0'; p.appendChild(mk('Changer de secteur')); pg.parentNode.insertBefore(p, pg.nextSibling);
    }
    /* Accueil : chiffres et sources du seul secteur choisi */
    if (name === 'index' || name === 'presentation') {
      var keep = function (e) { return (e.getAttribute('data-s') || '').split(' ').indexOf(K[sec]) > -1; };
      var pr = document.querySelector('.proof');
      if (pr) {
        var shown = 0;
        pr.querySelectorAll(':scope>div[data-s]').forEach(function (d) { if (keep(d)) shown++; else d.style.setProperty('display', 'none', 'important'); });
        if (!shown) pr.style.setProperty('display', 'none', 'important');
      }
      var src = document.querySelector('.kpsrc');
      if (src) {
        var links = [].slice.call(src.querySelectorAll('a[data-s]')).filter(keep);
        if (links.length) { src.innerHTML = 'Sources publiques : '; links.forEach(function (a, i) { if (i) src.appendChild(document.createTextNode(' · ')); src.appendChild(a); }); }
      }
    }
  });
})();
