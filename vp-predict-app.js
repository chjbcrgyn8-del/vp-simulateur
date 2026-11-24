/* VP Predict · parcours téléphone (présentation seule).
   Ce que vit le régleur sur une presse connectée : la presse tourne, VP Predict veille ; l'alerte arrive sur le téléphone ;
   il la prend en charge ; VP Expert prend le relais (causes classées, action, vérification) ; le résultat rejoint l'historique.
   Même principe que le parcours téléphone de VP Expert : l'écran lit l'état affiché par la console (sim2.js) et clique sur
   ses vrais boutons. Aucun moteur n'est modifié, rien n'est enregistré ailleurs que dans l'historique de démonstration.
   Dans la démonstration, la dérive est déclenchée à la main et l'alerte est simulée : en production, elle suppose une presse connectée. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const click = el => { if (el) el.click(); return !!el; };
  const CFG = window.SIM_CFG || {};
  const PARAMS = CFG.params || [];
  const PRESS = CFG.press || 'Presse';
  const DIRL = { up: 'en hausse', down: 'en baisse' };

  const IC = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7M8 12h12"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    nc: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    hist: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/></svg>',
    pulse: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>'
  };

  let root, frame, view = null, pick = { p: null, dir: null }, showChecks = false, lastHTML = '', lastFocus = null, prevView = 'watch';

  /* ---------- lecture de la console ---------- */
  const side = () => $('#side');
  function phase() {
    const s = side(); if (!s) return 'watch';
    if (s.querySelector('.vrf')) return 'verify';
    if (s.querySelector('.pane.done')) return 'done';
    if (s.querySelector('.phone2')) {
      if (s.querySelector('#take')) return 'alert';
      if (s.querySelector('.ptq') && /pendant le diagnostic/.test(txt(s.querySelector('.ptq')))) return 'stop';
      if (s.querySelector('.cr')) return 'actions';
      return 'causes';
    }
    const h = txt(s.querySelector('h3'));
    if (/Dérive en cours/.test(h)) return 'drifting';
    return 'watch';
  }
  const statusInfo = () => { const st = $('#status'); return { text: txt(st && st.querySelector('span')), cls: st && /warn/.test(st.className) ? 'warn' : st && /ok/.test(st.className) ? 'ok' : '' }; };
  const cycle = () => txt($('#cycle'));
  const tiles = () => $$('#tiles .tile').map(t => ({ name: txt(t.querySelector('.tn')), val: txt(t.querySelector('.tv')), st: /bad/.test(t.className) ? 'bad' : /warn/.test(t.className) ? 'warn' : '' }));
  const alertInfo = () => {
    const s = side(), pn = s.querySelector('.phone2 .pn'), ap = s.querySelector('.alertp');
    return { time: txt(s.querySelector('.phone2 .pt span:last-child')), title: txt(pn && pn.querySelector('b')), sub: txt(pn && pn.querySelector('span')),
      kick: txt(ap && ap.querySelector('.kick')), h3: txt(ap && ap.querySelector('h3')), why: txt(ap && ap.querySelector('.sl')), hors: !!(ap && ap.classList.contains('hors')) };
  };
  const machine = () => { const q = side().querySelector('.ptq'); return { text: txt(q), stop: side().querySelector('#pstop'), go: side().querySelector('#pgo') }; };
  const causes = () => $$('#side .rank button[data-c]').map(b => ({ el: b, label: txt(b.querySelector('.rl')), pc: txt(b.querySelector('.pc')).replace(/\s*pts$/, ''), src: txt(b.querySelector('small:not(.pt)')), out: b.classList.contains('out'), hint: b.classList.contains('hint') }));
  const actions = () => $$('#side .rank button.act[data-a]').map(b => ({ el: b, label: txt(b.querySelector('.rl')), pc: txt(b.querySelector('.pc')).replace(/\s*pts$/, ''), src: txt(b.querySelector('small:not(.pt)')) }));
  const checksFor = () => { const a = alertParam(); const c = CFG.checks || {}; return (a && c[a.id]) || c._all || []; };
  function alertParam() { const t = alertInfo().h3 || alertInfo().title; return PARAMS.find(p => t.indexOf(p.n) >= 0) || null; }
  const histRows = () => $$('#hist tr').filter(r => !r.querySelector('.empty')).map(r => { const t = $$('td', r); return { date: txt(t[0]), time: txt(t[1]), drift: txt(t[2]), cause: txt(t[3]), action: txt(t[4]), ok: !!(t[5] && t[5].querySelector('.ok')) }; });

  /* ---------- gabarit ---------- */
  function head(title, step, back, opts) {
    opts = opts || {};
    return '<header class="va-h"><div class="va-hr">' +
      (back ? '<button type="button" class="va-ic" data-a="back" aria-label="Retour">' + IC.back + '</button>' : '<span class="va-ic va-ph"></span>') +
      '<h2 class="va-t" id="va-title" tabindex="-1">' + esc(title) + '</h2>' +
      (step ? '<span class="va-step" aria-label="Étape ' + step + ' sur 4">' + step + ' / 4</span>' : '') +
      (opts.hist ? '<button type="button" class="va-ic" data-a="hist" aria-label="Historique des dérives">' + IC.hist + '</button>' : '') +
      '<button type="button" class="va-ic" data-a="close" aria-label="Quitter le parcours téléphone">' + IC.close + '</button></div>' +
      (opts.sub ? '<p class="va-sub">' + esc(opts.sub) + '</p>' : '') + '</header>';
  }
  const note = s => '<p class="va-note">' + s + '</p>';
  const cancelLink = () => (side().querySelector('[data-cancel]') ? '<button type="button" class="va-link" data-a="cancel">Annuler la dérive (démonstration)</button>' : '');

  function viewWatch() {
    const st = statusInfo(), drifting = phase() === 'drifting', ready = !($('#drift') && $('#drift').disabled) && !drifting;
    const rows = tiles().map(t => '<li class="va-row ' + t.st + '"><span>' + esc(t.name) + '</span><b>' + esc(t.val) + '</b></li>').join('');
    return head(PRESS, 0, false, { hist: true, sub: 'Presse connectée · VP Predict veille' }) +
      '<div class="va-b"><div class="va-status ' + st.cls + '"><i></i><span>' + esc(st.text) + '</span><small>Cycle ' + esc(cycle()) + '</small></div>' +
      (drifting ? '<div class="va-card va-night"><span class="va-k">Dérive en cours</span><h3 class="va-ct">Surveillance<span class="va-dots" aria-hidden="true"><i></i><i></i><i></i></span></h3><p>' + esc(txt(side().querySelector('.pane .sl'))) + '</p><p>Le téléphone sonnera dès qu’une règle d’alerte se déclenche.</p></div>' : '') +
      '<p class="va-lead">Mesures suivies, cycle par cycle.</p><ul class="va-rows">' + rows + '</ul>' +
      (!drifting ? '<div class="va-card"><span class="va-k va-k-dk">Démonstration</span><p>Dans l’atelier, le régleur n’a rien à faire : la presse connectée envoie ses cycles et VP Predict compare chacun à sa référence. Pour voir l’alerte arriver, déclenchez une dérive.</p>' +
        '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="drift"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Je simule une dérive' : 'Calcul de la référence…') + '</button></div></div>' : '<div class="va-stack">' + cancelLink() + '</div>') +
      note('Alerte simulée : en production, elle suppose une presse connectée. Rien n’est enregistré sur serveur.') + '</div>';
  }

  function viewDrift() {
    const ps = PARAMS.map(p => '<button type="button" class="va-big va-opt' + (pick.p === p.id ? ' on' : '') + '" data-a="pick" data-p="' + esc(p.id) + '">' + esc(p.n) + '</button>').join('');
    const ds = ['up', 'down'].map(d => '<button type="button" class="va-big va-opt' + (pick.dir === d ? ' on' : '') + '" data-a="dir" data-d="' + d + '">' + (d === 'up' ? 'En hausse' : 'En baisse') + '</button>').join('');
    return head('Je simule une dérive', 0, true, { sub: 'Démonstration · la presse reçoit une dérive' }) +
      '<div class="va-b"><p class="va-prog">1. Quel paramètre ?</p><div class="va-stack va-tight">' + ps + '</div>' +
      '<p class="va-prog va-gap">2. Dans quel sens ?</p><div class="va-stack va-tight va-two">' + ds + '</div>' +
      '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="go"' + (pick.p && pick.dir ? '' : ' disabled') + '>Lancer la dérive</button></div>' +
      note('La dérive s’ajoute progressivement au signal. L’alerte tombe quand une règle se déclenche : seuil franchi, 7 cycles du même côté ou tendance lissée hors zone.') + '</div>';
  }

  function viewAlert() {
    const a = alertInfo();
    return head('Alerte reçue', 1, false, { hist: true, sub: PRESS + ' · presse connectée' }) +
      '<div class="va-b"><div class="va-card va-night va-notif"><div class="va-nt"><span>' + IC.bell + ' VP Predict</span><span>' + esc(a.time) + '</span></div>' +
      '<h3 class="va-ct">' + esc(a.title) + '</h3><p class="va-nsub">' + esc(a.sub) + '</p></div>' +
      '<div class="va-card"><span class="va-k va-k-dk">' + esc(a.kick || (a.hors ? 'Hors tolérance' : 'Alerte préventive')) + '</span><p>' + esc(a.why) + '</p></div>' +
      '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="take">Je prends en charge</button></div>' +
      note('Sans réponse sous 5 min : chef d’équipe prévenu (simulé dans la démonstration).') + '</div>';
  }

  function viewStop() {
    const a = alertInfo();
    return head('Prise en charge', 1, false, { sub: a.h3 || a.title }) +
      '<div class="va-b"><h3 class="va-q">Arrêter la presse pendant le diagnostic ?</h3>' +
      '<div class="va-stack"><button type="button" class="va-big va-nc" data-a="pstop">Oui, arrêter</button><button type="button" class="va-big va-ok" data-a="pgo">Non, laisser tourner</button></div>' +
      note('L’alerte est préventive : la mesure reste dans la tolérance. C’est le régleur qui décide.') + cancelLink() + '</div>';
  }

  function viewCauses() {
    const a = alertInfo(), list = causes(), m = machine(), fail = txt(side().querySelector('.emsgf'));
    const items = list.map((c, i) => '<button type="button" class="va-big va-rk' + (c.out ? ' out' : c.hint ? ' hint' : '') + '" data-a="cause" data-i="' + i + '"' + (c.out ? ' disabled' : '') + '>' +
      '<span class="va-rkl"><b>' + esc(c.label) + '</b><small>' + (c.out ? 'Écartée : l’action n’a pas ramené la mesure' : c.hint ? 'Contrôle simulé : écart relevé sur ce point' : esc(c.src)) + '</small></span>' +
      (c.out ? '' : '<span class="va-pc">' + esc(c.pc) + '<small>pts</small></span>') + '</button>').join('');
    const checks = showChecks ? '<div class="va-card"><span class="va-k va-k-dk">Vérifications suggérées, dans l’ordre</span><ol class="va-ol">' + checksFor().map(t => '<li>' + esc(t) + '</li>').join('') + '</ol><p class="va-small">Choisissez ensuite la cause que le contrôle a confirmée.</p></div>' : '';
    return head('Causes à contrôler', 2, false, { hist: true, sub: a.h3 || a.title }) +
      '<div class="va-b"><p class="va-prog">VP Expert · prend le relais</p>' +
      (fail ? '<div class="va-card va-fail"><p>' + esc(fail) + '</p></div>' : '') +
      '<p class="va-lead">Classées par pertinence. Un score n’est pas une probabilité : contrôlez avant d’agir.</p>' +
      '<div class="va-stack va-tight">' + items + '</div>' +
      '<div class="va-stack"><button type="button" class="va-big va-skip" data-a="checks" aria-expanded="' + showChecks + '">' + (showChecks ? 'Masquer les vérifications' : 'Je ne sais pas') + '</button></div>' + checks +
      '<div class="va-mach"><span>' + esc(m.text) + '</span>' + (m.stop ? '<button type="button" class="va-link va-inl" data-a="pstop">Arrêter la presse</button>' : '') + (m.go ? '<button type="button" class="va-link va-inl" data-a="pgo">Redémarrer la presse</button>' : '') + '</div>' +
      cancelLink() + '</div>';
  }

  function viewActions() {
    const cause = txt(side().querySelector('.cr')), list = actions(), fail = txt(side().querySelector('.emsgf'));
    const items = list.map((x, i) => '<button type="button" class="va-big va-rk" data-a="act" data-i="' + i + '"><span class="va-rkl"><b>' + esc(x.label) + '</b><small>' + esc(x.src) + '</small></span><span class="va-pc">' + esc(x.pc) + '<small>pts</small></span></button>').join('');
    return head('Action', 3, true, { hist: true, sub: alertInfo().h3 || alertInfo().title }) +
      '<div class="va-b"><div class="va-card va-night"><span class="va-k">Cause retenue après contrôle</span><h3 class="va-ct">' + esc(cause) + '</h3><button type="button" class="va-link va-inl va-gold-l" data-a="back">Changer de cause</button></div>' +
      (fail ? '<div class="va-card va-fail"><p>' + esc(fail) + '</p></div>' : '') +
      '<p class="va-lead">Une seule action à la fois, puis on vérifie sur les cycles suivants.</p>' +
      (items ? '<div class="va-stack va-tight">' + items + '</div>' : '<p class="va-empty">Aucune action en mémoire pour cette cause.</p>') +
      note('Actions du scénario, non approuvées en atelier. Retour au réglage d’origine si l’action échoue.') + cancelLink() + '</div>';
  }

  function viewVerify() {
    const v = side().querySelector('.vrf'), h3 = txt(v.querySelector('h3')), wait = txt(v.querySelector('.wait')), bad = txt(v.querySelector('.emsgf'));
    const m = wait.match(/(\d+)\s*\/\s*(\d+)/), n = m ? +m[1] : 0, tot = m ? +m[2] : 6;
    const hint = $$('.sl', v).map(txt).find(t => /Lisez la courbe/.test(t));
    let body;
    if (wait) body = '<div class="va-card va-night"><span class="va-k">Observation des cycles suivants</span><h3 class="va-ct">' + n + ' / ' + tot + '<span class="va-dots" aria-hidden="true"><i></i><i></i><i></i></span></h3><div class="va-bar"><u style="width:' + Math.round(n / tot * 100) + '%"></u></div><p>La mesure doit revenir dans sa zone de référence.</p></div>' + note('Patientez : la console avance d’un cycle par seconde.');
    else body = '<h3 class="va-q">Le signal est-il revenu dans sa zone ?</h3>' + (hint ? '<p class="va-lead">' + esc(hint) + '</p>' : '') + (bad ? '<div class="va-card va-fail"><p>' + esc(bad) + '</p></div>' : '') +
      '<div class="va-stack"><button type="button" class="va-big va-ok" data-a="vok">' + IC.ok + '<span>Oui, enregistrer le résultat</span></button><button type="button" class="va-big va-nc" data-a="vko">' + IC.nc + '<span>Non, pas d’effet</span></button></div>' +
      note('La conformité réelle des pièces reste à vérifier sur site. Un retour dans la zone étaye l’hypothèse, il ne la prouve pas.');
    return head('Vérification', 4, false, { hist: true, sub: h3.replace(/^Action simulée\s*:\s*/, 'Action : ') }) + '<div class="va-b">' + body + cancelLink() + '</div>';
  }

  function viewDone() {
    const r = histRows()[0];
    return head('Dérive traitée', 0, false, { hist: true }) +
      '<div class="va-b va-center"><div class="va-check">' + IC.ok + '</div><h3 class="va-q">Résultat enregistré</h3>' +
      (r ? '<p class="va-sum"><b>' + esc(r.drift) + '</b><br>Cause : ' + esc(r.cause) + '<br>Action : ' + esc(r.action) + '<br>' + esc(r.time) + ' · action efficace : ' + (r.ok ? 'oui' : 'non') + '</p>' : '') +
      '<p class="va-sum">Ce cas rejoint l’historique par presse, paramètre, cause et action : la mémoire de l’entreprise.</p>' +
      '<div class="va-stack"><button type="button" class="va-big va-out" data-a="hist">Voir l’historique</button><button type="button" class="va-big va-gold" data-a="drift">Nouvelle dérive</button><button type="button" class="va-link" data-a="close">Retour à la console</button></div>' +
      note('Résultat simulé : il illustre le parcours, il ne prouve ni une cause réelle ni l’efficacité industrielle de l’action.') + '</div>';
  }

  function viewHist() {
    const rows = histRows();
    return head('Historique', 0, true, {}) + '<div class="va-b">' + (rows.length ? rows.map(r =>
      '<article class="va-h-i ' + (r.ok ? 'ok' : 'nc') + '"><div><b>' + esc(r.drift) + '</b><small>' + esc(r.time) + ' · ' + esc(r.cause) + ' · ' + esc(r.action) + '</small></div><span class="va-chip ' + (r.ok ? 'ok' : 'nc') + '">' + (r.ok ? 'Efficace' : 'Sans effet') + '</span></article>').join('') :
      '<p class="va-empty">Aucune dérive traitée pour l’instant.</p>') + note('Historique de démonstration, non conservé. Dans l’application, il est partagé par site, presse, moule, matière et résultat vérifié.') + '</div>';
  }

  /* ---------- affichage ---------- */
  const VIEWS = { watch: viewWatch, drifting: viewWatch, drift: viewDrift, alert: viewAlert, stop: viewStop, causes: viewCauses, actions: viewActions, verify: viewVerify, done: viewDone, hist: viewHist };
  function current() { return view || phase(); }
  function render(focusTitle) {
    if (!root || root.hidden) return;
    const cur = current(), html = (VIEWS[cur] || viewWatch)();
    if (html === lastHTML && !focusTitle) return;
    const b0 = $('.va-b', frame), top = b0 ? b0.scrollTop : 0, changed = cur !== prevView;
    frame.innerHTML = html; lastHTML = html; prevView = cur;
    const b = $('.va-b', frame); if (b) b.scrollTop = (changed || focusTitle) ? 0 : top;
    if (focusTitle || changed) { const t = $('#va-title', frame); if (t) t.focus({ preventScroll: true }); }
  }
  const go = (v, f = true) => { view = v; render(f); };
  const follow = () => { view = null; render(true); };

  function act(a, el) {
    const d = el.dataset, s = side();
    if (a === 'close') return close();
    if (a === 'hist') { window.__vpPrev = current(); return go('hist'); }
    if (a === 'back') {
      if (current() === 'hist') { view = window.__vpPrev === 'hist' ? null : (window.__vpPrev === 'drift' ? 'drift' : null); return render(true); }
      if (current() === 'drift') return follow();
      if (current() === 'actions') { click(s.querySelector('#back')); return follow(); }
      return follow();
    }
    if (a === 'drift') { pick = { p: null, dir: null }; return go('drift'); }
    if (a === 'pick') { pick.p = d.p; return render(false); }
    if (a === 'dir') { pick.dir = d.d; return render(false); }
    if (a === 'go') {
      if (!(pick.p && pick.dir)) return;
      click($('#drift')); click($('#modal [data-mp="' + pick.p + '"]')); click($('#modal [data-md="' + pick.dir + '"]')); click($('#go'));
      return follow();
    }
    if (a === 'cancel') { click(s.querySelector('[data-cancel]')); showChecks = false; return follow(); }
    if (a === 'take') { click(s.querySelector('#take')); return follow(); }
    if (a === 'pstop') { click(s.querySelector('#pstop')); return follow(); }
    if (a === 'pgo') { click(s.querySelector('#pgo')); return follow(); }
    if (a === 'checks') { showChecks = !showChecks; return render(false); }
    if (a === 'cause') { const c = causes()[+d.i]; if (c && !c.out) { click(c.el); showChecks = false; } return follow(); }
    if (a === 'act') { const x = actions()[+d.i]; if (x) click(x.el); return follow(); }
    if (a === 'vok') { click(s.querySelector('#vok')); return follow(); }
    if (a === 'vko') { click(s.querySelector('#vko')); return follow(); }
  }

  function build() {
    root = document.createElement('div'); root.id = 'vp-app'; root.hidden = true; root.className = 'vp-predict-app';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'va-title');
    root.innerHTML = '<div class="va-back" data-a="close"></div><div class="va-phone"><div class="va-screen" id="va-frame"></div></div>';
    document.body.appendChild(root); frame = $('#va-frame', root);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
      if (b.classList.contains('va-back') && e.target !== b) return;
      act(b.dataset.a, b);
    });
    document.addEventListener('keydown', e => { if (!root || root.hidden || e.key !== 'Escape') return; const m = $('#modal'); if (!m || m.hidden) close(); });
    /* La console se redessine à chaque cycle : on suit ses changements sans la modifier. */
    let raf = 0; const sched = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(false); }); };
    const obs = new MutationObserver(sched);
    ['side', 'status', 'cycle', 'tiles', 'hist'].forEach(id => { const el = $('#' + id); if (el) obs.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'disabled'] }); });
    const dr = $('#drift'); if (dr) obs.observe(dr, { attributes: true, attributeFilter: ['disabled'] });
  }

  function open() {
    if (!root) build();
    lastFocus = document.activeElement;
    view = null; showChecks = false; lastHTML = ''; prevView = '';
    root.hidden = false; document.body.classList.add('vp-app-open');
    render(true);
  }
  function close() {
    if (!root) return;
    root.hidden = true; document.body.classList.remove('vp-app-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.VPPredictApp = { open, close, isOpen: () => !!root && !root.hidden };

  function launcher() {
    const ctr = $('.console .ctrls'); if (!ctr) return;
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'vp-app-launch'; b.className = 'vp-app-launch pr-launch'; b.textContent = 'Parcours téléphone';
    b.title = 'Ce que vit le régleur sur une presse connectée : alerte reçue, prise en charge, causes, action, vérification';
    b.addEventListener('click', open);
    ctr.insertBefore(b, ctr.firstChild);
    if (/(^|[?&])app=1(&|$)/.test(location.search)) setTimeout(open, 600);
  }
  const start = () => setTimeout(launcher, 60);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
