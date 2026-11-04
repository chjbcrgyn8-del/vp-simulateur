/* VP Expert — mode Focus (couche de présentation, v1).
 * À charger APRÈS vp-expert-ui.js. Ne contient aucune règle métier :
 * - lit l'état affiché (#vp-case-defect, carte .cc.next) ;
 * - déclenche les boutons existants (data-nc / data-ok / #vp-next) ;
 * - n'écrit rien en stockage, n'ajoute aucun score, ne réordonne rien.
 * Désactivation : retirer la balise <script>, le parcours historique reste intact.
 */
(() => {
  'use strict';
  const api = window.VPExpertAPI;
  const main = document.querySelector('main');
  if (!api || !main || !document.getElementById('s3')) return;
  const $ = (s, r = document) => r.querySelector(s);
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  /* 0. Défaut présélectionné signalé « exemple » jusqu'au premier choix du régleur */
  let exemple = true;
  const badge = document.createElement('span');
  badge.className = 'vf-exemple'; badge.textContent = 'Exemple présélectionné · touchez un défaut pour choisir le vôtre';
  const caseDef = $('#vp-case-defect'); if (caseDef) caseDef.after(badge);
  document.addEventListener('click', e => {
    if (exemple && e.target.closest('#defs [data-def]')) { exemple = false; badge.remove(); requestAnimationFrame(render); }
  }, true);

  /* 1. Bascule Focus : bouton dans la barre d'étapes, état dans l'URL (#focus) */
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.id = 'vp-focus-toggle'; toggle.className = 'vp-focus-toggle';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.textContent = 'Mode Focus';
  ($('.esteps') || main).after(toggle);

  /* 2. Panneau Focus : 4 blocs fixes */
  const panel = document.createElement('section');
  panel.id = 'vp-focus'; panel.hidden = true; panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-label', 'Mode Focus');
  panel.innerHTML =
    '<div class="vf-card vf-def"><div class="vf-defh"><span class="vf-k">Défaut</span>' +
      '<button type="button" class="vf-link" data-vf-step="1">Changer</button></div><b id="vf-def"></b>' +
      '<span class="vf-exemple" id="vf-exemple">Exemple présélectionné</span></div>' +
    '<div class="vf-card vf-ctl"><span class="vf-k">Contrôle prioritaire</span>' +
      '<b id="vf-ctl-name"></b><p id="vf-ctl-what"></p>' +
      '<div class="vf-prog" id="vf-prog"><span id="vf-prog-t"></span><i><u id="vf-prog-b"></u></i></div>' +
      '<p class="vf-meta"><span id="vf-rank"></span> · <span id="vf-score"></span>' +
      ' <small>Classement d’ordre, pas une probabilité de cause</small></p>' +
      '<button type="button" class="vf-big vf-go" id="vf-src" hidden>Relevé à la main (VP Expert seul)</button>' +
      '<button type="button" class="vf-big vf-go" id="vf-ctx" hidden>Compléter le contexte</button></div>' +
    '<div class="vf-card vf-res"><span class="vf-k">Résultat du contrôle</span>' +
      '<div class="vf-acts"><button type="button" class="vf-big vf-ok" id="vf-ok"><svg class="vf-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>Conforme</span></button>' +
      '<button type="button" class="vf-big vf-nc" id="vf-nc"><svg class="vf-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Non conforme</span></button>' +
      '<button type="button" class="vf-big vf-nv" id="vf-nv"><svg class="vf-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12h12"/></svg><span>Non vérifié</span></button></div>' +
      '<p class="vf-note" id="vf-state">Un constat ne prouve pas une cause.</p></div>' +
    '<div class="vf-card vf-next"><span class="vf-k">Ensuite</span>' +
      '<p id="vf-next-text"></p><button type="button" class="vf-big vf-go" id="vf-go"></button></div>' +
    '<p class="vf-guard">Démonstration · contrôles et actions à valider pour votre machine, matière et outillage. ' +
      '<button type="button" class="vf-link" data-vf-step="3">Voir tous les contrôles</button></p>';
  toggle.before(panel); panel.after(toggle);
  const phoneBtn = document.createElement('button');
  phoneBtn.type = 'button'; phoneBtn.id = 'vf-phone'; phoneBtn.className = 'vp-focus-toggle vf-phone-btn'; phoneBtn.hidden = true; phoneBtn.setAttribute('aria-pressed', 'false');
  phoneBtn.textContent = 'Aperçu téléphone';
  toggle.after(phoneBtn);
  const setPhone = on => { document.body.classList.toggle('vp-phone', on); phoneBtn.setAttribute('aria-pressed', String(on)); phoneBtn.textContent = on ? 'Quitter l’aperçu' : 'Aperçu téléphone'; };
  phoneBtn.addEventListener('click', () => setPhone(!document.body.classList.contains('vp-phone')));
  window.VPFocus = { setPhone, setFocus: on => setFocus(on), isOn: () => !panel.hidden };

  const card = () => $('#s3 .cc.next') || $('#s3 .cc:not(.done):not(.found):not(.lock)');
  function render() {
    if (panel.hidden) return;
    $('#vf-def').textContent = txt($('#vp-case-defect')) || 'Choisissez un défaut';
    $('#vf-exemple').hidden = !exemple;
    const c = card();
    const ok = c && $('[data-ok]', c), nc = c && $('[data-nc]', c);
    const src = !c && $('#sit [data-b="sans"]') && $('#sit [data-b="sans"]').getAttribute('aria-pressed') !== 'true' ? $('#sit [data-b="sans"]') : null;
    const res = $('#res'), need = !c && !src && res && /au moins deux questions/i.test(res.textContent);
    $('#vf-ctx').hidden = !need;
    $('#vf-src').hidden = !src; $('.vf-meta').hidden = !c;
    if (c) {
      const title = c.querySelector('.ch b').cloneNode(true);
      title.querySelectorAll('.tg').forEach(t => t.remove());
      $('#vf-ctl-name').textContent = txt(title).replace(/([^\s·])((?:DC|TS)\d{2}-R\d{2})/, '$1 · $2');
      const p = [...c.querySelectorAll('p')].find(x => /Contrôle\s*:/.test(x.textContent));
      $('#vf-ctl-what').textContent = p ? txt(p).replace(/^.*?Contrôle\s*:\s*/, '') : '';
      $('#vf-rank').textContent = 'Rang ' + txt($('.rk', c));
      $('#vf-score').textContent = 'score indicatif ' + txt($('.ind', c));
    } else if (src) {
      $('#vf-ctl-name').textContent = 'D’où viennent les mesures ?';
      $('#vf-ctl-what').textContent = 'Choisissez la source des mesures pour afficher les contrôles dans l’ordre.';
    } else if (need) {
      $('#vf-ctl-name').textContent = 'Contexte à compléter';
      $('#vf-ctl-what').textContent = 'Répondez à au moins deux questions parmi Où, Quand, Fréquence… « Qui l’a détecté ? » sert au confinement et ne classe pas les causes.';
    } else {
      $('#vf-ctl-name').textContent = 'Aucun contrôle en attente';
      $('#vf-ctl-what').textContent = 'Tous les contrôles affichés ont un constat, ou un contrôle préalable est requis.';
      $('#vf-rank').textContent = ''; $('#vf-score').textContent = '';
    }
    const nv = c && $('[data-nv]', c);
    $('#vf-ok').disabled = !ok; $('#vf-nc').disabled = !nc; $('#vf-nv').disabled = !nv;
    const all = [...document.querySelectorAll('#res .cc')], fin = all.filter(x => /\b(done|found|unver)\b/.test(x.className)).length;
    $('#vf-prog').hidden = !c || !all.length;
    if (c && all.length) { $('#vf-prog-t').textContent = 'Contrôle ' + Math.min(all.length, fin + 1) + ' sur ' + all.length; $('#vf-prog-b').style.width = Math.round(fin / all.length * 100) + '%'; }
    const lock = $('#s3 .cc.lock');
    $('#vf-next-text').textContent = c ? 'Notez le constat, VP Expert affiche le contrôle suivant.'
      : 'Passez à l’essai : une seule variable à la fois, résultat tracé.';
    $('.vf-res').hidden = !!(src || need); $('.vf-next').hidden = !!(src || need);
    $('#vf-go').textContent = c ? 'Ouvrir ce contrôle dans la liste' : 'Préparer l’essai →';
    $('#vf-go').dataset.mode = c ? 'skip' : 'essai';
    $('#vf-state').textContent = lock ? 'Contre-mesure préalable requise : les leviers correctifs restent verrouillés.'
      : 'Un constat ne prouve pas une cause.';
  }

  const goStep = n => { const b = $('[data-vp-step="' + n + '"]'); if (b) b.click(); };
  function setFocus(on) {
    document.body.classList.toggle('vp-focus-on', on);
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Quitter le mode Focus' : 'Mode Focus';
    panel.hidden = !on;
    phoneBtn.hidden = !on;
    if (!on) setPhone(false);
    if (on && history.replaceState) history.replaceState(null, '', '#focus');
    else if (location.hash === '#focus') history.replaceState(null, '', location.pathname + location.search);
    if (on) { goStep(3); render(); panel.scrollIntoView({ block: 'start' }); $('#vf-ok').focus({ preventScroll: true }); }
  }

  toggle.addEventListener('click', () => { pending = null; setFocus(panel.hidden); });
  panel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.vfStep) { pending = b.dataset.vfStep === '1' ? 'def' : null; setFocus(false); goStep(+b.dataset.vfStep); return; }
    const c = card();
    if (b.id === 'vf-ctx') { pending = 'ctx'; setFocus(false); goStep(2); return; }
    if (b.id === 'vf-src') { const x = $('#sit [data-b="sans"]'); if (x) x.click(); }
    if (b.id === 'vf-ok' && c) $('[data-ok]', c).click();          // bouton du moteur
    if (b.id === 'vf-nc' && c) $('[data-nc]', c).click();          // bouton du moteur
    if (b.id === 'vf-nv' && c) $('[data-nv]', c).click();          // bouton du moteur
    if (b.id === 'vf-go') {
      if (b.dataset.mode === 'essai') { setFocus(false); goStep(4); }
      else { setFocus(false); goStep(3); c && c.scrollIntoView({ block: 'center' }); }
    }
    requestAnimationFrame(render);
  });

  /* Retour automatique au Focus : après le choix d'un défaut, ou dès que le contexte suffit au classement */
  let pending = null;
  document.addEventListener('click', e => {
    if (!pending || !panel.hidden) return;
    if (pending === 'def' && e.target.closest('#defs [data-def]')) { pending = null; setTimeout(() => setFocus(true), 0); }
    else if (pending === 'ctx' && e.target.closest('#s2 button')) setTimeout(() => {
      if (pending === 'ctx' && $('#s3 .cc')) { pending = null; setFocus(true); }
    }, 0);
  }, true); // phase de capture : le moteur re-rend la liste pendant son propre gestionnaire

  /* 3. Mise à jour quand le moteur re-rend les contrôles */
  new MutationObserver(() => requestAnimationFrame(render))
    .observe(main, { childList: true, subtree: true, characterData: true });

  /* 4. Au changement d'étape (hors Focus) : remonter en haut de l'étape active, sans animation longue */
  document.addEventListener('click', e => {
    if (!e.target.closest('#vp-next,#vp-prev,[data-vp-step]') || !panel.hidden) return;
    setTimeout(() => { const s = $('.vp-stage:not([hidden])'); if (s) s.scrollIntoView({ block: 'start', behavior: 'instant' }); }, 0);
  }, true);

  if (location.hash === '#focus') setFocus(true);
})();
