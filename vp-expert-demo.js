/* VP Expert · démonstration guidée de 90 secondes.
   Rejoue, sur un cas fictif et avec les vrais boutons de la page, le parcours complet : défaut, contexte, contrôles dans
   l'ordre (conforme, non conforme, non vérifié), essai et résultat, synthèse. Aucun moteur n'est modifié : le script clique
   comme le ferait l'utilisateur. Rien n'est enregistré dans la mémoire d'atelier. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let laters = [], timer = null, idx = -1, playing = false, active = false, hl = null, card = null, bar = null, ticks = 0;

  const later = (ms, fn) => { laters.push(setTimeout(() => { try { if (active) fn(); } catch (e) { /* sans effet */ } }, ms)); };
  const clearLaters = () => { laters.forEach(clearTimeout); laters = []; };
  const stepBtn = n => $('[data-vp-step="' + n + '"]');
  const go = n => { const b = stepBtn(n); if (b) b.click(); };
  const click = el => { if (el) el.click(); return !!el; };
  const firstBtn = k => $('#vp-step-2 .opts[data-k="' + k + '"] button');
  const next = () => $('#res .cc.next') || $('#res .cc:not(.found):not(.done):not(.unver):not(.lock)');
  const isGate = el => !!el && /Avant toute correction/.test(el.textContent);

  function show(el) {
    if (hl) hl.classList.remove('vp-demo-hl');
    hl = el || null;
    if (!hl) return;
    hl.classList.add('vp-demo-hl');
    hl.scrollIntoView({ block: 'center', behavior: reduce ? 'instant' : 'smooth' });
  }

  /* Chaque étape : titre, texte, durée en secondes, action (lance les vrais clics), élément mis en valeur */
  const STEPS = [
    { t: 'Un défaut qui revient', d: 7, x: 'Cas fictif, en 90 secondes : voici ce que VP Expert apporte au régleur et à la direction. Rien n’est enregistré.',
      run: () => { go(1); }, el: () => $('#defs') || $('#vp-step-1') },
    { t: '1 · Le défaut', d: 8, x: 'Le régleur choisit le défaut qu’il voit, dans la liste du métier : ici le premier de la liste, à titre d’exemple.',
      run: () => { go(1); click($('#defs button')); }, el: () => $('#defs button') },
    { t: '2 · Le contexte', d: 10, x: 'Quoi, qui, où, quand, comment : ce que l’on sait, pas plus. Une réponse inconnue reste vide, elle n’est jamais prise pour un fait.',
      run: () => { go(2); ['qui', 'ou', 'quand', 'freq', 'vis', 'terme'].forEach(k => click(firstBtn(k))); }, el: () => $('#vp-step-2 .opts') },
    { t: '3 · Les contrôles, dans l’ordre', d: 11, x: 'VP Expert classe les contrôles et dit pourquoi chacun est proposé ici. Le premier est celui à faire en priorité.',
      run: () => { go(3); }, el: () => next() },
    { t: 'Au poste : le mode Focus sur téléphone', d: 15, x: 'Au pied de la presse, le régleur ne voit qu’un contrôle à la fois, en grand, avec trois réponses possibles. Il appuie, le contrôle suivant s’affiche.',
      run: () => {
        go(3);
        const F = window.VPFocus; if (!F) return;
        F.setFocus(true); F.setPhone(true);
        later(4500, () => { const c = next(); click($(isGate(c) ? '#vf-ok' : '#vf-nc')); });
        later(9500, () => click($('#vf-nv')));
      }, el: () => $('#vp-focus') },
    { t: 'Constater, sans conclure', d: 12, x: 'Chaque contrôle reçoit un constat : conforme, non conforme, ou non vérifié quand il est impossible ou non concluant. Un constat n’est jamais une cause démontrée.',
      run: () => {
        const F = window.VPFocus; if (F && F.isOn()) F.setFocus(false);
        go(3);
        let c = next();
        if (c && isGate(c)) { click(c.querySelector('[data-ok]')); c = next(); }
        if (!$('#res .cc.found') && c) { click(c.querySelector('[data-nc]')); c = next(); }
        if (!$('#res .cc.done') && c) { click(c.querySelector('[data-ok]')); c = next(); }
        if (!$('#res .cc.unver') && c) click(c.querySelector('[data-nv]'));
      }, el: () => $('#res .cc.found') || $('#res .cc') },
    { t: '4 · Essai, action, résultat', d: 12, x: 'Après les contrôles : la cause retenue, l’action menée, le résultat observé. La validation par la qualité reste nécessaire.',
      run: () => {
        go(4);
        const sel = $('#bilan-cause');
        if (sel) { const o = [...sel.options].find(x => x.value); if (o) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } }
        const act = $('#bilan-action');
        if (act) { act.value = 'Exemple fictif : réglage ramené à la fiche, contrôle refait sur trois cycles.'; act.dispatchEvent(new Event('input', { bubbles: true })); act.dispatchEvent(new Event('change', { bubbles: true })); }
        click($('[data-outcome="disparu"]'));
      }, el: () => $('#expert-bilan') || $('#bilan-cause') },
    { t: 'La mémoire d’atelier', d: 10, x: 'Une fois la cause confirmée, « Mémoriser ce retour d’expérience » la rappelle aux analyses suivantes de ce défaut. Dans cette démonstration, rien n’est mémorisé.',
      run: () => { }, el: () => $('#rex-save') || $('#expert-bilan') },
    { t: 'La synthèse pour la direction', d: 12, x: 'Une page simple : ce qu’il faut examiner, ce qui a été fait, ce qui reste à faire. Exportable en PDF en un clic.',
      run: () => { go(4); }, el: () => $('#expert-synthese') || $('#syn-body') },
    { t: 'À vous de jouer', d: 0, x: 'Fin de la démonstration. Vous pouvez continuer avec ce cas fictif, ou repartir d’un dossier vierge pour votre propre défaut.', run: () => { }, el: () => null, end: true }
  ];

  function build() {
    if (card) return;
    card = document.createElement('div');
    card.className = 'vp-demo';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Démonstration guidée');
    card.innerHTML = '<div class="vp-demo-bar" aria-hidden="true"><i></i></div><p class="vp-demo-k"></p><h2 class="vp-demo-t"></h2><p class="vp-demo-x" aria-live="polite"></p><div class="vp-demo-b"></div>';
    document.body.appendChild(card);
    bar = card.querySelector('.vp-demo-bar i');
    document.addEventListener('keydown', e => { if (active && e.key === 'Escape') stop(); });
  }

  function buttons(end) {
    const b = card.querySelector('.vp-demo-b');
    b.innerHTML = '';
    const mk = (label, cls, fn) => { const x = document.createElement('button'); x.type = 'button'; x.className = cls; x.textContent = label; x.addEventListener('click', fn); b.appendChild(x); return x; };
    if (end) {
      mk('Continuer avec ce cas', 'vp-demo-p', stop);
      mk('Repartir d’un dossier vierge', 'vp-demo-s', () => { stop(); go(1); const r = $('.vp-case-reset'); if (r) r.click(); });
    } else {
      mk(playing ? 'Pause' : 'Reprendre', 'vp-demo-s', () => { playing = !playing; buttons(false); tick(); });
      mk('Suivant →', 'vp-demo-p', () => to(idx + 1));
      mk('Quitter', 'vp-demo-s', stop);
    }
  }

  function to(i) {
    if (i < 0 || i >= STEPS.length) return;
    idx = i; ticks = 0; clearLaters();
    const s = STEPS[i];
    try { s.run(); } catch (e) { /* un clic raté ne doit jamais bloquer la démonstration */ }
    card.querySelector('.vp-demo-k').textContent = 'Démonstration guidée · étape ' + (i + 1) + ' sur ' + STEPS.length + ' · cas fictif';
    card.querySelector('.vp-demo-t').textContent = s.t;
    card.querySelector('.vp-demo-x').textContent = s.x;
    bar.style.width = '0%';
    buttons(!!s.end);
    setTimeout(() => show(s.el && s.el()), 250);
    const b = card.querySelector('.vp-demo-p'); if (b && !reduce) b.focus({ preventScroll: true });
    clearInterval(timer);
    if (!s.end) timer = setInterval(tick, 250);
  }

  function tick() {
    if (!active || !playing) return;
    const s = STEPS[idx]; if (!s || s.end) return;
    ticks++;
    bar.style.width = Math.min(100, ticks / 4 / s.d * 100) + '%';
    if (ticks / 4 >= s.d) to(idx + 1);
  }

  function start() {
    build();
    active = true; playing = !reduce;
    document.body.classList.add('vp-demo-on');
    card.hidden = false;
    to(0);
  }

  function stop() {
    active = false; playing = false; clearInterval(timer); clearLaters();
    const F = window.VPFocus; if (F && F.isOn()) F.setFocus(false);
    if (card) card.hidden = true;
    show(null);
    document.body.classList.remove('vp-demo-on');
  }

  function launcher() {
    const toggle = document.getElementById('vp-focus-toggle');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'vp-demo-launch'; btn.id = 'vp-demo-launch';
    btn.textContent = 'Démonstration guidée · 90 s';
    btn.addEventListener('click', start);
    if (toggle && toggle.parentNode) {
      const wrap = document.createElement('div'); wrap.className = 'vp-modes';
      toggle.parentNode.insertBefore(wrap, toggle); wrap.append(btn, toggle);
    } else {
      const nav = $('.esteps'); if (nav) nav.after(btn);
    }
    if (/(^|[?&])demo=1(&|$)/.test(location.search)) setTimeout(start, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(launcher, 0));
  else setTimeout(launcher, 0);
})();
