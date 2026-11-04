/* VP Expert · parcours téléphone (présentation seule).
   Un parcours en application, écran par écran, pour le régleur : quel défaut, trois questions, les contrôles un par un,
   le résultat, puis l'historique. Il lit l'état affiché et clique sur les vrais boutons de la page (comme le mode Focus) :
   aucun moteur n'est modifié, rien n'est enregistré ailleurs que dans le dossier en cours. Aucun chiffre ni
   aucune valeur de réglage n'est affiché qui ne vienne du parcours lui-même. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const click = el => { if (el) el.click(); return !!el; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CTX = ['ou', 'quand', 'freq'];           /* trois questions : assez pour classer les contrôles */
  const IC = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7M8 12h12"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    nc: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    nv: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12h12"/></svg>',
    hist: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2"/></svg>',
    dot: '<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false"><rect x="14" y="16" width="92" height="48" rx="6" fill="#efe7d8" stroke="#3d4756" stroke-width="2"/><circle cx="60" cy="40" r="9" fill="none" stroke="#b4541a" stroke-width="3"/></svg>'
  };

  let root, frame, screen = 'defect', ctxIdx = 0, query = '', wasOpen = false, lastFocus = null;

  /* ---------- lecture du moteur ---------- */
  const defects = () => $$('#defs button.dt').map(b => ({ el: b, name: txt($('b', b)) || txt(b), hint: txt($('small', b)), on: b.getAttribute('aria-pressed') === 'true' }));
  const defName = () => txt($('#vp-case-defect')) || 'Défaut';
  function question(k) {
    const g = $('#vp-step-2 .opts[data-k="' + k + '"]'); if (!g) return null;
    const q = g.closest('.q'); const label = q ? txt($('b', q)) : '';
    return { k, label: label || 'Question', opts: $$('button', g).map(b => ({ el: b, v: b.dataset.v, text: txt(b), on: b.getAttribute('aria-pressed') === 'true' })) };
  }
  const cards = () => $$('#res .cc');
  const nextCard = () => $('#res .cc.next') || $('#res .cc:not(.done):not(.found):not(.unver):not(.lock)');
  const isGate = c => !!c && /Avant toute correction/.test(c.textContent);
  function cardInfo(c) {
    const t = c.querySelector('.ch b').cloneNode(true); $$('.tg,.rtag', t).forEach(x => x.remove());
    const p = $$('p', c).find(x => /Contrôle\s*:/.test(x.textContent));
    const why = c.querySelector('.why');
    return { name: txt(t), what: p ? txt(p).replace(/^.*?Contrôle\s*:\s*/, '') : '', why: why ? txt(why) : '', gate: isGate(c) };
  }
  const state = c => c.classList.contains('found') ? 'nc' : c.classList.contains('done') ? 'ok' : c.classList.contains('unver') ? 'nv' : 'open';
  const histRows = () => $$('#hb tr').map(r => { const t = $$('td', r); return { time: txt(t[0]), def: txt(t[1]), ctl: txt(t[2]), res: txt(t[3]), cls: /unv/.test(r.className) ? 'nv' : /nc/.test(r.className) ? 'nc' : 'ok' }; });

  /* ---------- gabarit ---------- */
  function head(title, step, back, opts) {
    return '<header class="va-h"><div class="va-hr">' +
      (back ? '<button type="button" class="va-ic" data-a="back" aria-label="Retour">' + IC.back + '</button>' : '<span class="va-ic va-ph"></span>') +
      '<h2 class="va-t" id="va-title" tabindex="-1">' + esc(title) + '</h2>' +
      (step ? '<span class="va-step" aria-label="Étape ' + step + ' sur 4">' + step + ' / 4</span>' : '') +
      (opts && opts.hist ? '<button type="button" class="va-ic" data-a="hist" aria-label="Historique des contrôles">' + IC.hist + '</button>' : '') +
      '<button type="button" class="va-ic" data-a="close" aria-label="Quitter le parcours téléphone">' + IC.close + '</button></div>' +
      (opts && opts.sub ? '<p class="va-sub">' + esc(opts.sub) + '</p>' : '') + (opts && opts.extra ? opts.extra : '') + '</header>';
  }

  function viewDefect() {
    const all = defects(), q = query.trim().toLowerCase();
    const list = q ? all.filter(d => (d.name + ' ' + d.hint).toLowerCase().includes(q)) : all;
    const tiles = list.map((d, i) => {
      const k = window.VPSchemas && window.VPSchemas.keyFor(d.name);
      return '<button type="button" class="va-tile' + (d.on ? ' on' : '') + '" data-a="def" data-i="' + all.indexOf(d) + '">' +
        '<span class="va-tic">' + (k ? window.VPSchemas.svg(k, false) : IC.dot) + '</span><b>' + esc(d.name) + '</b>' + (d.hint ? '<small>' + esc(d.hint) + '</small>' : '') + '</button>';
    }).join('');
    return head('Quel défaut ?', 1, false, { extra: '<label class="va-search"><span class="va-vh">Rechercher un défaut</span><input type="search" id="va-q" placeholder="Rechercher un défaut…" value="' + esc(query) + '" autocomplete="off"></label>' }) +
      '<div class="va-b"><p class="va-lead">Touchez le défaut que vous voyez. ' + all.length + ' défauts référencés.</p>' +
      (tiles ? '<div class="va-grid">' + tiles + '</div>' : '<p class="va-empty">Aucun défaut ne correspond. Essayez un autre mot.</p>') + '</div>';
  }

  function viewCtx() {
    const k = CTX[ctxIdx], q = k && question(k);
    if (!q) { screen = 'ctrl'; return viewCtrl(); }
    const opts = q.opts.map((o, i) => '<button type="button" class="va-big va-opt' + (o.on ? ' on' : '') + '" data-a="ctx" data-i="' + i + '">' + esc(o.text) + '</button>').join('');
    return head('Diagnostic', 2, true, { sub: defName() }) +
      '<div class="va-b"><p class="va-prog">Question ' + (ctxIdx + 1) + ' sur ' + CTX.length + '</p><h3 class="va-q">' + esc(q.label) + '</h3>' +
      '<div class="va-stack">' + opts + '<button type="button" class="va-big va-skip" data-a="skip">Je ne sais pas</button></div>' +
      '<p class="va-note">Une réponse inconnue reste vide : elle n’est jamais prise pour un fait.</p></div>';
  }

  function viewCtrl() {
    const all = cards(); const c = nextCard();
    const fin = all.filter(x => state(x) !== 'open').length;
    if (!all.length) {
      return head('Contrôles', 3, true, { sub: defName() }) + '<div class="va-b"><h3 class="va-q">Pas encore de contrôle à proposer</h3><p class="va-note">Répondez à au moins deux questions du diagnostic pour classer les contrôles.</p>' +
        '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="back">Revenir aux questions</button></div></div>';
    }
    if (!c) {
      return head('Contrôles', 3, true, { sub: defName(), hist: true }) + '<div class="va-b"><div class="va-card"><span class="va-k">Contrôles</span><h3 class="va-q va-dk">Tous les contrôles ont un constat</h3>' +
        '<p>' + fin + ' constat' + (fin > 1 ? 's' : '') + ' enregistré' + (fin > 1 ? 's' : '') + '. Un constat ne prouve pas une cause.</p></div>' +
        '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="result">Passer au résultat</button></div></div>';
    }
    const i = cardInfo(c);
    const okL = i.gate ? 'Écart confirmé, moyen fiable' : 'Conforme', ncL = i.gate ? 'Écart non confirmé ou moyen douteux' : 'Non conforme';
    return head('Contrôle ' + Math.min(all.length, fin + 1) + ' sur ' + all.length, 3, true, { sub: defName(), hist: true }) +
      '<div class="va-b"><div class="va-card va-night"><span class="va-k">Contrôle prioritaire</span><h3 class="va-ct">' + esc(i.name) + '</h3><p>' + esc(i.what) + '</p>' +
      '<div class="va-bar"><u style="width:' + Math.round(fin / all.length * 100) + '%"></u></div>' +
      (i.why ? '<details class="va-why"><summary>Pourquoi ce contrôle ?</summary><p>' + esc(i.why) + '</p></details>' : '') + '</div>' +
      '<div class="va-stack"><button type="button" class="va-big va-ok" data-a="ok">' + IC.ok + '<span>' + esc(okL) + '</span></button>' +
      '<button type="button" class="va-big va-nc" data-a="nc">' + IC.nc + '<span>' + esc(ncL) + '</span></button>' +
      '<button type="button" class="va-big va-nv" data-a="nv">' + IC.nv + '<span>Non vérifié</span></button></div>' +
      '<p class="va-note">Un constat ne prouve pas une cause. Non vérifié : aucune conclusion tirée.</p>' +
      (fin ? '<button type="button" class="va-link" data-a="result">Passer au résultat</button>' : '') + '</div>';
  }

  function viewResult() {
    const sel = $('#bilan-cause'), act = $('#bilan-action');
    const opts = sel ? [...sel.options].filter(o => o.value) : [];
    const out = $$('[data-outcome]');
    const cur = sel ? sel.value : '';
    const sh = { disparu: 'Défaut disparu', attenue: 'Défaut atténué', 'sans-effet': 'Pas d’effet', 'non-verifie': 'Pas encore vérifié' };
    return head('Ça a marché ?', 4, true, { sub: defName(), hist: true }) +
      '<div class="va-b"><label class="va-lab" for="va-cause">Cause retenue après contrôle</label>' +
      '<select id="va-cause" class="va-sel"><option value="">Choisir parmi les causes…</option>' + opts.map(o => '<option value="' + esc(o.value) + '"' + (o.value === cur ? ' selected' : '') + '>' + esc(txt(o)) + '</option>').join('') + '</select>' +
      '<label class="va-lab" for="va-action">Action menée</label><input id="va-action" class="va-in" maxlength="300" placeholder="Ex. : circuit nettoyé, pièce remplacée" value="' + esc(act ? act.value : '') + '">' +
      '<p class="va-lab">Résultat après action</p><div class="va-stack">' + out.map(o => '<button type="button" class="va-big va-out' + (o.getAttribute('aria-pressed') === 'true' ? ' on' : '') + '" data-a="out" data-v="' + esc(o.dataset.outcome) + '">' + esc(txt(o) || sh[o.dataset.outcome] || o.dataset.outcome) + '</button>').join('') + '</div>' +
      '<p class="va-note">Un résultat favorable étaye une hypothèse ; la validation par la qualité reste nécessaire.</p>' +
      '<div class="va-stack"><button type="button" class="va-big va-gold" data-a="done">Terminer</button></div></div>';
  }

  function viewDone() {
    const rows = histRows(), n = rows.length, out = $('[data-outcome][aria-pressed="true"]'), cause = $('#bilan-cause') ? $('#bilan-cause').value : '';
    return head('Dossier prêt', 0, false, {}) +
      '<div class="va-b va-center"><div class="va-check">' + IC.ok + '</div><h3 class="va-q">Dossier prêt</h3>' +
      '<p class="va-sum"><b>' + esc(defName()) + '</b><br>' + n + ' constat' + (n > 1 ? 's' : '') + ' enregistré' + (n > 1 ? 's' : '') +
      (cause ? '<br>Cause retenue : ' + esc(cause) : '') + (out ? '<br>Résultat : ' + esc(txt(out)) : '') + '</p>' +
      '<div class="va-stack">' + ($('#syn-pdf') ? '<button type="button" class="va-big va-gold" data-a="pdf">Synthèse en PDF</button>' : '') +
      ($('#rex-save') ? '<button type="button" class="va-big va-out" data-a="rex">Mémoriser ce retour d’expérience</button>' : '') +
      '<button type="button" class="va-big va-nv" data-a="again">Nouveau dossier</button>' +
      '<button type="button" class="va-link" data-a="close">Retour au parcours complet</button></div></div>';
  }

  function viewHist() {
    const rows = histRows();
    return head('Historique', 0, true, {}) + '<div class="va-b">' + (rows.length ? rows.map(r =>
      '<article class="va-h-i ' + r.cls + '"><div><b>' + esc(r.ctl) + '</b><small>' + esc(r.time) + ' · ' + esc(r.def) + '</small></div><span class="va-chip ' + r.cls + '">' + esc(r.res.replace(/ :.*$/, '')) + '</span></article>').join('') :
      '<p class="va-empty">Aucun constat pour l’instant.</p>') + '</div>';
  }

  /* ---------- affichage ---------- */
  const VIEWS = { defect: viewDefect, ctx: viewCtx, ctrl: viewCtrl, result: viewResult, done: viewDone, hist: viewHist };
  function render(focusTitle) {
    if (!root || root.hidden) return;
    const keepQ = document.activeElement && document.activeElement.id === 'va-q';
    const sel = keepQ ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
    frame.innerHTML = VIEWS[screen]();
    if (keepQ) { const i = $('#va-q', frame); if (i) { i.focus(); try { i.setSelectionRange(sel[0], sel[1]); } catch (e) { /* champ de recherche */ } } }
    const b = $('.va-b', frame); if (b && focusTitle) b.scrollTop = 0;
    if (focusTitle) { const t = $('#va-title', frame); if (t) t.focus({ preventScroll: true }); }
  }
  const go = (s, f = true) => { screen = s; render(f); };

  function act(a, el) {
    const d = el.dataset;
    if (a === 'close') return close();
    if (a === 'back') {
      if (screen === 'hist') return go(window.__vaPrev || 'ctrl');
      if (screen === 'ctx') { if (ctxIdx > 0) { ctxIdx--; return go('ctx'); } return go('defect'); }
      if (screen === 'ctrl') { ctxIdx = CTX.length - 1; return go('ctx'); }
      if (screen === 'result') return go('ctrl');
      return go('defect');
    }
    if (a === 'hist') { window.__vaPrev = screen; return go('hist'); }
    if (a === 'def') { const dd = defects()[+d.i]; if (dd) click(dd.el); ctxIdx = 0; return go('ctx'); }
    if (a === 'ctx') { const q = question(CTX[ctxIdx]); if (q && q.opts[+d.i]) click(q.opts[+d.i].el); return nextCtx(); }
    if (a === 'skip') return nextCtx();
    if (a === 'ok' || a === 'nc' || a === 'nv') { const c = nextCard(); if (c) click($('[data-' + (a === 'ok' ? 'ok' : a) + ']', c)); return go('ctrl', false); }
    if (a === 'result') return go('result');
    if (a === 'out') { click($('[data-outcome="' + d.v + '"]')); return go('result', false); }
    if (a === 'done') return go('done');
    if (a === 'pdf') return click($('#syn-pdf'));
    if (a === 'rex') { click($('#rex-save')); return go('done', false); }
    if (a === 'again') { close(); click($('#expert-new')); }
  }
  function nextCtx() { if (ctxIdx < CTX.length - 1) { ctxIdx++; return go('ctx'); } return go('ctrl'); }

  function build() {
    root = document.createElement('div'); root.id = 'vp-app'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'va-title');
    root.innerHTML = '<div class="va-back" data-a="close"></div><div class="va-phone"><div class="va-screen" id="va-frame"></div></div>';
    document.body.appendChild(root); frame = $('#va-frame', root);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.classList.contains('va-back') && e.target !== b) return;
      act(b.dataset.a, b);
    });
    root.addEventListener('input', e => {
      if (e.target.id === 'va-q') { query = e.target.value; render(false); }
      if (e.target.id === 'va-action') { const a = $('#bilan-action'); if (a) { a.value = e.target.value; a.dispatchEvent(new Event('input', { bubbles: true })); a.dispatchEvent(new Event('change', { bubbles: true })); } }
    });
    root.addEventListener('change', e => {
      if (e.target.id === 'va-cause') { const s = $('#bilan-cause'); if (s) { s.value = e.target.value; s.dispatchEvent(new Event('change', { bubbles: true })); } }
    });
    document.addEventListener('keydown', e => { if (root && !root.hidden && e.key === 'Escape') close(); });
    window.addEventListener('vp:enquete-render', () => { if (root && !root.hidden && screen !== 'defect') render(false); });
  }

  function open() {
    if (!root) build();
    lastFocus = document.activeElement;
    const more = $('#more'); if (more) click(more);          /* tous les défauts de la liste */
    query = ''; ctxIdx = 0; screen = 'defect';
    root.hidden = false; document.body.classList.add('vp-app-open'); wasOpen = true;
    render(true);
  }
  function close() {
    if (!root) return;
    root.hidden = true; document.body.classList.remove('vp-app-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.VPApp = { open, close, go: s => { if (root && !root.hidden) go(s); }, isOpen: () => !!root && !root.hidden };

  function launcher() {
    let wrap = $('.vp-modes');
    if (!wrap) { const nav = $('.esteps'); if (!nav) return; wrap = document.createElement('div'); wrap.className = 'vp-modes'; nav.after(wrap); }
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'vp-app-launch'; b.className = 'vp-app-launch'; b.textContent = 'Parcours téléphone';
    b.addEventListener('click', open);
    wrap.insertBefore(b, wrap.firstChild);
    if (/(^|[?&])app=1(&|$)/.test(location.search)) setTimeout(open, 500);
  }
  const start = () => setTimeout(launcher, 60);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
