/* Un seul secteur à la fois : une fois le métier choisi (ou une page de secteur ouverte), les autres secteurs disparaissent
   des menus, des onglets et de l'accueil. Le choix est gardé dans ce navigateur (localStorage « vp-secteur »).
   « Changer de secteur » (index.html?changer=1) l'efface. Sans JavaScript ou sans stockage : tout reste visible. */
(function () {
  var K = ['plastique', 'caoutchouc', 'decolletage', 'traitement-surface'];
  var P = {
    presse: 0, gains: 0, enquete: 0, 'secteur-plastique': 0, 'banc-essai': 0, 'st-mesures-plastique': 0,
    caoutchouc: 1, 'presse-caoutchouc': 1, 'enquete-caoutchouc': 1, 'secteur-caoutchouc': 1, 'st-mesures-caoutchouc': 1, 'st-reperes-caoutchouc': 1,
    'machine-decolletage': 2, 'scan-decolletage': 2, 'enquete-decolletage': 2, 'secteur-decolletage': 2, decolletage: 2, 'sources-decolletage': 2, 'st-mesures-decolletage': 2, 'st-reperes-decolletage': 2,
    'machine-traitement-surface': 3, 'scan-traitement-surface': 3, 'enquete-traitement-surface': 3, 'secteur-traitement-surface': 3, 'sources-traitement-surface': 3, 'st-mesures-traitement-surface': 3, 'st-reperes-traitement-surface': 3
  };
  var name = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  function get() { try { var v = localStorage.getItem('vp-secteur'); var i = K.indexOf(v); return i > -1 ? i : null; } catch (e) { return null; } }
  function set(i) { try { if (i === null) localStorage.removeItem('vp-secteur'); else localStorage.setItem('vp-secteur', K[i]); } catch (e) {} }

  var changer = name === 'index' && /(^|[?&])changer(=|&|$)/.test(location.search);
  if (changer) {
    set(null);
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  }
  var sec = P[name] !== undefined ? P[name] : get();
  if (P[name] !== undefined) set(sec);
  if (sec === null) return;

  var n = sec + 1;
  document.documentElement.setAttribute('data-sec', K[sec]);
  document.documentElement.setAttribute('data-sec-n', String(n));

  /* Masquage par CSS, posé avant l'affichage : pas de scintillement. Les menus gardent le même ordre dans toutes les pages
     (plastique, caoutchouc, décolletage, traitement de surface). */
  var h = 'html[data-sec-n="' + n + '"] ';
  /* Renvois vers le savoir et les sources des autres secteurs, et onglets des pages documentaires */
  var EN = ['enquete.html', 'enquete-caoutchouc.html', 'enquete-decolletage.html', 'enquete-traitement-surface.html'];
  var cross = [];
  K.forEach(function (s, j) {
    if (j === sec) return;
    cross.push('html[data-sec-n="' + n + '"] main a[href^="st-mesures-' + s + '"]', 'html[data-sec-n="' + n + '"] main a[href^="st-reperes-' + s + '"]', 'html[data-sec-n="' + n + '"] main a[href^="sources-' + s + '"]', 'html[data-sec-n="' + n + '"] .doc-top nav a[href="' + EN[j] + '"]');
  });
  var css = cross.join(',') + '{display:none!important}' + [
    h + 'nav.tabs.sector a:not(.sec-change):not(:nth-of-type(' + n + '))',
    h + '.vnav details.dd:nth-of-type(1) .ddm>a:not(.sec-change):not(:nth-of-type(' + n + '))',
    h + '.vnav details.dd:nth-of-type(2) .ddm.dd3>div:nth-child(-n+2)>a:not(:nth-of-type(' + n + '))',
    h + '.pick-g .pick-b:not(:nth-of-type(' + n + '))',
    h + '.pick-lg', h + '.sx-secnav', h + '.sx-next'
  ].join(',') + '{display:none!important}' +
    h + '.pick-g{grid-template-columns:1fr;max-width:340px}' +
    h + '.sec-change{color:#e3b47c;font-weight:600;text-decoration:underline;text-underline-offset:3px}' +
    h + '.ddm .sec-change{color:#8a4a0c}';
  var st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  document.addEventListener('DOMContentLoaded', function () {
    var href = 'index.html?changer=1#secteurs';
    var mk = function (label) { var a = document.createElement('a'); a.className = 'sec-change'; a.href = href; a.setAttribute('data-keep', ''); a.textContent = label; return a; };
    document.querySelectorAll('nav.tabs.sector').forEach(function (nav) { nav.appendChild(mk('Changer de secteur')); });
    document.querySelectorAll('.vnav details.dd:nth-of-type(1) .ddm').forEach(function (m) { var a = mk('Changer de secteur'); a.style.display = 'block'; a.style.padding = '10px 14px'; m.appendChild(a); });
    document.querySelectorAll('nav.tabs.menu a, .vnav>a').forEach(function (a) {
      if (/index\.html#secteurs$/.test(a.getAttribute('href') || '') || (a.textContent.trim() === 'Secteurs' && /#secteurs$/.test(a.getAttribute('href') || ''))) { a.setAttribute('href', href); a.textContent = 'Changer de secteur'; }
    });
    var pg = document.querySelector('.pick-g');
    if (pg) {
      var l = document.getElementById('pick-l'); if (l) l.textContent = 'Votre métier';
      var p = document.createElement('p'); p.className = 'pick-ch'; p.style.margin = '10px 0 0'; p.appendChild(mk('Changer de secteur')); pg.parentNode.insertBefore(p, pg.nextSibling);
    }
    /* Savoir technique : on ouvre directement le savoir du secteur choisi */
    if (name === 'savoir') {
      if (sec === 1) { var c = document.querySelector('[data-sec="c"]'); if (c) c.click(); }
      else if (sec === 2) location.replace('st-reperes-decolletage.html');
      else if (sec === 3) location.replace('st-reperes-traitement-surface.html');
    }
  });
})();
