/* VP Expert · scène « Capitaliser » (démonstration seule).
   Ce qui se passe après l'enquête, en trois moments : le régleur clôture le cas, les méthodes ou la qualité
   le valident comme méthode, puis un autre régleur le retrouve sur le même outillage et dit si cela a fonctionné.
   La scène lit le dossier affiché (défaut, cause retenue, action, résultat, contrôles) : rien n'est ressaisi.
   Aucun moteur n'est modifié. Rien n'est enregistré : ni serveur, ni stockage du navigateur. Fermer la scène l'efface.
   Seule écriture possible dans la page : l'outillage ou la machine saisis ici sont recopiés dans les références du
   dossier si elles étaient vides, pour éviter une seconde saisie. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const click = el => { if (el) el.click(); return !!el; };
  const fire = (el, types) => types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));

  /* Vocabulaire par métier : presses, tours ou lignes. Les références d'exemple sont fictives et signalées comme telles. */
  const SECT = {
    TP: { machine: 'Presse', tool: 'Moule', exTool: 'Moule M-1042', exMachine: 'Presse P-220' },
    CA: { machine: 'Presse', tool: 'Moule', exTool: 'Moule C-310', exMachine: 'Presse V-300' },
    DC: { machine: 'Tour', tool: 'Outil et montage', exTool: 'Montage T-118', exMachine: 'Tour D-12' },
    TS: { machine: 'Ligne', tool: 'Montage', exTool: 'Montage MT-07', exMachine: 'Ligne L-2' }
  };
  const voc = () => SECT[(window.VPExpertAPI && window.VPExpertAPI.sector) || 'TP'] || SECT.TP;
  const dossierMoule = () => voc().tool === 'Moule';
  const EX_ACTION = 'Exemple fictif : réglage ramené à la fiche, contrôle refait sur trois cycles.';
  const EX_TAG = ' (exemple fictif)';

  const IC = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7M8 12h12"/></svg>'
  };

  let root, win, lastFocus = null, st = null;
  const blank = () => ({ step: 'intro', closed: false, decision: null, cond: { machine: '', material: '' }, reuse: '', example: false, tool: '', machine: '', err: '' });

  /* ---------- lecture du dossier affiché ---------- */
  const isGate = c => /Avant toute correction/.test(c.textContent);
  const cardState = c => c.classList.contains('found') ? 'nc' : c.classList.contains('done') ? 'ok' : c.classList.contains('unver') ? 'nv' : 'open';
  /* Nom de la cause : attribut data-name en plasturgie, titre de la carte sans ses étiquettes dans les autres métiers. */
  function cardName(c) {
    if (c.dataset.name) return c.dataset.name;
    const b = $('.ch b', c); if (!b) return '';
    const t = b.cloneNode(true); $$('span', t).forEach(x => x.remove());
    return txt(t);
  }
  function cardInfo(c) {
    const p = $$('p', c).find(x => /Contrôle\s*:/.test(x.textContent));
    return { name: cardName(c), what: p ? txt(p).replace(/^.*?Contrôle\s*:\s*/, '') : '', state: cardState(c), gate: isGate(c) };
  }
  const ctxEl = k => $('textarea[data-expert-group="context"][data-expert-field="' + k + '"]');
  const ctxVal = k => { const e = ctxEl(k); return e ? e.value.split('\n')[0].replace(/\s+/g, ' ').trim().slice(0, 80) : ''; };
  function readCase() {
    const sel = $('#bilan-cause'), act = $('#bilan-action'), out = $('[data-outcome][aria-pressed="true"]'), lvl = $('#vpp-level');
    const cards = $$('#res .cc').map(cardInfo).filter(c => !c.gate);
    const cause = sel ? sel.value : '';
    const cc = cards.find(c => c.name === cause);
    return {
      hasDefect: !!$('#defs button[aria-pressed="true"]'),
      defect: txt($('#vp-case-defect')) || 'Défaut',
      cause, causeCtl: cc ? cc.what : '', causeNc: !!cc && cc.state === 'nc',
      action: act ? act.value.trim() : '',
      outcome: out ? out.dataset.outcome : '',
      ruled: cards.filter(c => c.state === 'ok'), unver: cards.filter(c => c.state === 'nv'),
      level: lvl && lvl.value ? txt(lvl.options[lvl.selectedIndex]) : '',
      levelOk: !!(lvl && lvl.value) && /^(Vérifié|Validé)/.test(txt(lvl.options[lvl.selectedIndex])),
      tool: ctxVal('equipment'), machine: ctxVal('machine'), material: ctxVal('material')
    };
  }
  const ready = c => !!c.cause && c.outcome === 'disparu';
  /* Ce que la revue voit comme incomplet. Valider reste possible : la réserve est alors écrite sur la fiche. */
  function gaps(c) {
    const g = [];
    if (!c.causeNc) g.push('aucun écart enregistré sur le contrôle de la cause');
    if (!c.ruled.length) g.push('aucune autre cause écartée par contrôle');
    if (c.unver.length) g.push(c.unver.length + (c.unver.length > 1 ? ' contrôles non vérifiés' : ' contrôle non vérifié'));
    if (!c.level) g.push('niveau de preuve non déclaré');
    else if (!c.levelOk) g.push('niveau de preuve déclaré « ' + c.level + ' »');
    if (!c.material) g.push('matière non renseignée');
    return g;
  }
  /* Un dossier rempli par l'exemple (ou par la démonstration guidée) se reconnaît à son action, libellée « Exemple fictif ». */
  const isExample = c => /^Exemple fictif/.test(c.action);

  /* ---------- cas d'exemple : les vrais boutons de la page, comme la démonstration guidée ---------- */
  function playExample() {
    const go = n => click($('[data-vp-step="' + n + '"]'));
    const next = () => $('#res .cc.next') || $('#res .cc:not(.found):not(.done):not(.unver):not(.lock)');
    try {
      if (!$('#defs button[aria-pressed="true"]')) { go(1); click($('#defs button')); }
      go(2);
      ['qui', 'ou', 'quand', 'freq', 'vis', 'terme'].forEach(k => {
        const g = $('#vp-step-2 .opts[data-k="' + k + '"]');
        if (g && !$('button[aria-pressed="true"]', g)) click($('button', g));
      });
      go(3);
      let c = next();
      if (c && isGate(c)) { click($('[data-ok]', c)); c = next(); }
      if (!$('#res .cc.found') && c) { click($('[data-nc]', c)); c = next(); }
      if (!$$('#res .cc.done').some(x => !isGate(x)) && c) click($('[data-ok]', c));
      go(4);
      const sel = $('#bilan-cause');
      if (sel && !sel.value) {
        const found = $('#res .cc.found');
        const o = [...sel.options].find(x => x.value && found && x.value === cardName(found)) || [...sel.options].find(x => x.value);
        if (o) { sel.value = o.value; fire(sel, ['change']); }
      }
      const act = $('#bilan-action');
      if (act && !act.value.trim()) { act.value = EX_ACTION; fire(act, ['input', 'change']); }
      click($('[data-outcome="disparu"]'));
    } catch (e) { /* un clic raté ne doit jamais bloquer la scène */ }
  }

  /* ---------- fragments ---------- */
  const DAYS = { close: 'J', review: 'J\u00a0+\u00a02', reuse: 'J\u00a0+\u00a021' };
  const STEPS = [['close', 'Clôturer', 'Régleur'], ['review', 'Valider', 'Méthodes ou qualité'], ['reuse', 'Réutiliser', 'Régleur de nuit']];
  const reached = k => k === 'close' ? st.step !== 'intro' : k === 'review' ? st.closed : !!(st.decision && st.decision.type === 'valide');
  const condKnown = () => st.cond.machine === 'same' && st.cond.material === 'same';

  function status() {
    if (st.reuse === 'inefficace') return ['warn', 'Méthode validée · à revoir'];
    if (st.decision && st.decision.type === 'valide') return ['ok', 'Méthode validée'];
    if (st.decision && st.decision.type === 'renvoi') return ['wait', 'Cas résolu · complément demandé'];
    if (st.closed) return ['wait', 'Cas résolu · non validé'];
    return ['idle', 'Enquête terminée · cas non clôturé'];
  }

  function header() {
    const temps = ['Constater', 'Comprendre', 'Résoudre', 'Capitaliser'];
    const s = status(), solved = st.step !== 'intro';
    return '<header class="vc-h"><div class="vc-hr"><div><p class="vc-k">VP Expert · démonstration</p>' +
      '<h2 class="vc-t" id="vc-title" tabindex="-1">Capitaliser : valider, puis réutiliser</h2></div>' +
      '<button type="button" class="vc-x" data-a="close" aria-label="Fermer la scène">' + IC.close + '</button></div>' +
      '<ol class="vc-temps" aria-label="Les quatre temps de la méthode">' + temps.map((t, i) =>
        '<li' + (i === 3 ? ' class="on" aria-current="step"' : solved ? ' class="done"' : '') + '>' + (i < 3 && solved ? IC.ok : '') + '<span>' + t + '</span></li>').join('') + '</ol>' +
      (st.step === 'intro' ? '' :
        '<nav class="vc-steps" aria-label="Moments de la scène">' + STEPS.map(([k, t, who], i) =>
          '<button type="button" data-a="goto" data-v="' + k + '"' + (st.step === k ? ' aria-current="step"' : '') + (reached(k) ? '' : ' disabled') + '>' +
          '<b>' + (i + 1) + '</b><span>' + t + '<small>' + who + '</small></span></button>').join('') + '</nav>' +
        '<p class="vc-status"><span>Statut de la fiche</span><em class="vc-badge ' + s[0] + '">' + esc(s[1]) + '</em>' +
        (st.example ? '<em class="vc-tag">Cas fictif</em>' : '') + '</p>') +
      '</header>';
  }

  const row = (k, v, empty) => '<div class="vc-row"><dt>' + k + '</dt><dd' + (v ? '' : ' class="none"') + '>' + (v ? esc(v) : (empty || 'Non renseigné')) + '</dd></div>';
  const names = a => a.map(c => c.name).join(' ; ');

  function fiche(c) {
    const s = status(), v = voc();
    const log = [];
    if (st.closed) log.push([DAYS.close, 'Clôturé par le régleur : défaut disparu après action.']);
    if (st.decision) log.push([DAYS.review, st.decision.type === 'valide' ? 'Validé comme méthode par ' + st.decision.by +
      (st.decision.open ? ', avec ' + st.decision.open + (st.decision.open > 1 ? ' réserves.' : ' réserve.') : '.') : 'Complément demandé par ' + st.decision.by + '.']);
    if (st.reuse) log.push([DAYS.reuse, 'Repris de nuit sur le même outillage, ' + (condKnown() ? 'conditions identiques' : 'après contrôle refait') + ' : ' +
      ({ efficace: 'efficace', partiel: 'résultat partiel', inefficace: 'sans effet' })[st.reuse] + '.']);
    const moule = dossierMoule();
    return '<aside class="vc-fiche" aria-label="' + (moule ? 'Dossier de preuve du moule' : 'Fiche de mémoire') + '">' +
      '<p class="vc-fk">' + (moule ? 'Dossier de preuve · par moule' : 'Mémoire d’atelier · par outillage') + '</p>' +
      '<h3 class="vc-ft">' + (st.tool ? esc(st.tool) : 'Outillage à préciser') + '</h3>' +
      '<p class="vc-fs">' + esc([st.machine, c.defect].filter(Boolean).join(' · ')) + '</p>' +
      '<p class="vc-fb"><em class="vc-badge ' + s[0] + '">' + esc(s[1]) + '</em></p>' +
      '<dl class="vc-dl">' + row('Cause retenue', c.cause) + row('Contrôle qui a tranché', c.causeCtl, 'Non relié à un contrôle') +
      row('Action menée', c.action) + row('Causes écartées', names(c.ruled), 'Aucune enregistrée') + '</dl>' +
      '<div class="vc-log"><p class="vc-lk">Journal</p>' + (log.length ? '<ol>' + log.map(l => '<li><b>' + l[0] + '</b><span>' + esc(l[1]) + '</span></li>').join('') + '</ol>' :
        '<p class="vc-none">Rien pour l’instant : le cas n’est pas clôturé.</p>') + '</div>' +
      (st.reuse ? '<p class="vc-count"><b>1</b> reprise · <b>' + (st.reuse === 'efficace' ? 1 : 0) + '</b> efficace<small>Décompte seul : aucun taux en dessous de cinq reprises.</small></p>' : '') +
      '<p class="vc-fn">' + v.tool + ' et ' + v.machine.toLowerCase() + ' : c’est par eux que le cas sera retrouvé.</p>' +
      (moule ? '<p class="vc-fn"><b>Livrables du pilote, établis avec vos équipes :</b> fiche de transfert de moule s’il change de presse ; pré-rapport de réclamation (pré-8D) si une réclamation est en cause. La démonstration ne les génère pas et n’enregistre rien.</p>' : '') + '</aside>';
  }

  /* ---------- écrans ---------- */
  function viewIntro(c) {
    const miss = [];
    if (!c.cause) miss.push('une cause retenue après contrôle');
    if (c.outcome !== 'disparu') miss.push('le résultat « Défaut disparu »');
    return '<section class="vc-main vc-solo"><p class="vc-role">Avant de commencer</p>' +
      '<h3 class="vc-q">Cette scène part d’un cas résolu.</h3>' +
      '<p class="vc-lead">Elle montre ce qui se passe après l’enquête : le régleur clôture le cas, les méthodes ou la qualité le valident, puis un autre régleur retrouve la solution sur le même outillage.</p>' +
      '<p class="vc-miss">Il manque dans le dossier en cours : ' + miss.join(' et ') + '.</p>' +
      '<div class="vc-acts"><button type="button" class="vc-btn gold" data-a="example">Jouer sur un cas d’exemple</button>' +
      '<button type="button" class="vc-btn" data-a="finish">Terminer mon enquête d’abord</button></div>' +
      '<p class="vc-note">Le cas d’exemple complète l’enquête de cette page avec des réponses fictives, sans effacer ce que vous avez déjà saisi. Rien n’est enregistré.</p></section>';
  }

  function viewClose(c) {
    const v = voc();
    return '<section class="vc-main"><p class="vc-role">Régleur · au poste · ' + DAYS.close + '</p>' +
      '<h3 class="vc-q">Le défaut a disparu. Que garde l’atelier ?</h3>' +
      '<p class="vc-lead">Tout vient de l’enquête : rien à ressaisir. Il reste à dire sur quel outillage, pour que le cas soit retrouvé.</p>' +
      '<dl class="vc-dl card">' + row('Défaut', c.defect) + row('Cause retenue', c.cause) + row('Action menée', c.action, 'Non renseignée') +
      row('Résultat', 'Défaut disparu') + row('Causes écartées', names(c.ruled), 'Aucune enregistrée') + '</dl>' +
      '<div class="vc-fields"><label class="vc-f">' + v.tool + '<input id="vc-tool" maxlength="80" autocomplete="off" value="' + esc(st.tool) + '"' + (st.err ? ' aria-invalid="true" aria-describedby="vc-err"' : '') + '></label>' +
      '<label class="vc-f">' + v.machine + '<input id="vc-machine" maxlength="80" autocomplete="off" value="' + esc(st.machine) + '"></label></div>' +
      (st.err ? '<p class="vc-err" id="vc-err" role="alert">' + esc(st.err) + '</p>' : '') +
      '<div class="vc-acts"><button type="button" class="vc-btn gold" data-a="do-close">' + (st.closed ? 'Continuer vers la validation' : 'Clôturer le cas') + '</button></div>' +
      '<p class="vc-note">Une fois clôturé, le cas est consultable par l’atelier comme précédent, avec la mention « non validé ».</p></section>';
  }

  function viewReview(c) {
    const v = voc(), d = st.decision, g = gaps(c);
    const checks = '<ul class="vc-checks">' +
      '<li class="' + (c.causeNc ? 'ok' : 'warn') + '"><b>Cause retenue</b><span>' + esc(c.cause) + ' · ' + (c.causeNc ? 'écart constaté au contrôle' : 'aucun écart enregistré sur son contrôle') + '</span></li>' +
      '<li class="' + (c.ruled.length ? 'ok' : 'warn') + '"><b>Causes écartées</b><span>' + (c.ruled.length ? c.ruled.length + ' par contrôle conforme : ' + esc(names(c.ruled)) : 'Aucune : les autres pistes n’ont pas été contrôlées') + '</span></li>' +
      '<li class="' + (c.unver.length ? 'warn' : 'ok') + '"><b>Contrôles non vérifiés</b><span>' + (c.unver.length ? c.unver.length + ' : ' + esc(names(c.unver)) : 'Aucun') + '</span></li>' +
      '<li class="' + (c.levelOk ? 'ok' : 'warn') + '"><b>Niveau de preuve déclaré</b><span>' + (c.level ? esc(c.level) : 'Non renseigné par l’atelier') + '</span></li>' +
      '<li class="' + (c.material ? 'ok' : 'warn') + '"><b>Domaine de validité</b><span>' + esc([st.tool, st.machine, c.material ? 'Matière : ' + c.material : 'matière non renseignée'].filter(Boolean).join(' · ')) + '</span></li></ul>';
    let tail;
    if (!d) {
      tail = '<p class="vc-lab">Votre décision</p><div class="vc-acts">' +
        '<button type="button" class="vc-btn gold" data-a="valide" data-v="les méthodes">Valider · Méthodes</button>' +
        '<button type="button" class="vc-btn gold" data-a="valide" data-v="la qualité">Valider · Qualité</button>' +
        '<button type="button" class="vc-btn" data-a="renvoi">Renvoyer pour complément</button></div>' +
        '<p class="vc-note">La validation porte sur ce contexte : ' + v.tool.toLowerCase() + ', ' + v.machine.toLowerCase() + ' et matière. Ailleurs, la méthode reste une piste à contrôler.</p>';
    } else if (d.type === 'valide') {
      tail = '<div class="vc-done ok"><b>Méthode validée par ' + esc(d.by) + '.</b><span>Elle sera proposée en premier quand ce défaut reviendra sur cet outillage. Sa revue périodique est à convenir avec le site.</span>' +
        (g.length ? '<span class="vc-res">Réserves écrites sur la fiche : ' + esc(g.join(' ; ')) + '.</span>' : '') + '</div>' +
        (dossierMoule() ? '<p class="vc-note">Le cas clos par le régleur et validé par les méthodes ou la qualité rejoint le dossier de preuve du moule. Le dossier de l’atelier rassemble constats, essais et pièces de preuve : photos, relevés et résultats de contrôle. Ici, la validation est simulée et rien n’est enregistré.</p>' : '') +
        '<div class="vc-acts"><button type="button" class="vc-btn gold" data-a="goto" data-v="reuse">Voir la suite : le défaut revient</button>' +
        '<button type="button" class="vc-btn" data-a="undo">Revenir sur la décision</button></div>';
    } else {
      tail = '<div class="vc-done wait"><b>Complément demandé au régleur.</b><span>Le cas reste consultable comme précédent, avec la mention « non validé ». Il ne sera pas proposé en premier.</span></div>' +
        '<div class="vc-acts"><button type="button" class="vc-btn" data-a="undo">Reprendre la revue</button></div>';
    }
    return '<section class="vc-main"><p class="vc-role">Méthodes ou qualité · en revue · ' + DAYS.review + '</p>' +
      '<h3 class="vc-q">Ce cas peut-il devenir une méthode pour cet outillage ?</h3>' +
      '<p class="vc-lead">La revue lit ce que l’atelier a constaté. Elle ne refait pas l’enquête : elle décide si le cas est assez étayé pour être réutilisé.</p>' +
      checks + tail + '</section>';
  }

  function seg(k, label) {
    const o = [['same', 'Identique'], ['diff', 'Différente'], ['unknown', 'Je ne sais pas']];
    return '<div class="vc-seg" role="group" aria-label="' + esc(label) + '"><span>' + esc(label) + '</span><div>' + o.map(x =>
      '<button type="button" data-a="cond" data-k="' + k + '" data-v="' + x[0] + '" aria-pressed="' + (st.cond[k] === x[0] ? 'true' : 'false') + '">' + x[1] + '</button>').join('') + '</div></div>';
  }

  function viewReuse(c) {
    const v = voc(), by = st.decision ? st.decision.by : '';
    const doubt = [st.cond.machine, st.cond.material].some(x => x === 'diff' || x === 'unknown');
    const notice = doubt ? '<p class="vc-cond warn">Condition différente ou inconnue : refaire le contrôle qui a tranché avant d’appliquer l’action.</p>' :
      condKnown() ? '<p class="vc-cond ok">Conditions identiques au cas validé : la méthode est proposée en premier.</p>' :
        '<p class="vc-cond idle">Sans réponse, une condition est tenue pour inconnue : elle n’est jamais supposée identique.</p>';
    const res = [['efficace', 'Oui, défaut disparu'], ['partiel', 'En partie'], ['inefficace', 'Non, sans effet']];
    const after = !st.reuse ? '' :
      '<div class="vc-done ' + (st.reuse === 'efficace' ? 'ok' : 'wait') + '"><b>' + ({
        efficace: 'Reprise notée : efficace.', partiel: 'Reprise notée : résultat partiel.', inefficace: 'Reprise notée : sans effet.'
      })[st.reuse] + '</b><span>' + ({
        efficace: 'L’enquête n’est pas repartie de zéro, et la fiche garde la trace que la méthode a de nouveau fonctionné.',
        partiel: 'La méthode reste proposée, avec ce retour. Les méthodes ou la qualité le verront à la prochaine revue.',
        inefficace: 'La méthode est signalée pour revue aux méthodes ou à la qualité. Elle reste visible, avec cette reprise sans succès, et l’enquête guidée reprend.'
      })[st.reuse] + '</span></div>' +
      '<div class="vc-acts"><button type="button" class="vc-btn gold" data-a="close">Fermer la scène</button>' +
      '<button type="button" class="vc-btn" data-a="replay">Rejouer la scène</button>' +
      (st.example ? '<button type="button" class="vc-btn" data-a="fresh">Repartir d’un dossier vierge</button>' : '') + '</div>';
    return '<section class="vc-main"><p class="vc-role">Régleur · équipe de nuit · ' + DAYS.reuse + '</p>' +
      '<h3 class="vc-q">Le même défaut revient sur le même outillage.</h3>' +
      '<p class="vc-lead">Le régleur présent n’était pas là la dernière fois. Dès le défaut et l’outillage saisis, la mémoire lui répond.</p>' +
      '<div class="vc-night"><p class="vc-nk">Sur cet outillage · méthode validée par ' + esc(by) + '</p>' +
      '<p class="vc-nl">À contrôler d’abord</p><p class="vc-nt">' + esc(c.causeCtl || c.cause) + '</p>' +
      '<dl><div><dt>Cause confirmée la dernière fois</dt><dd>' + esc(c.cause) + '</dd></div>' +
      '<div><dt>Action qui a fonctionné</dt><dd>' + (c.action ? esc(c.action) : 'Non renseignée') + '</dd></div>' +
      (c.ruled.length ? '<div><dt>Déjà écarté, à ne pas refaire d’abord</dt><dd>' + esc(names(c.ruled)) + '</dd></div>' : '') + '</dl></div>' +
      '<p class="vc-lab">Avant d’appliquer : les conditions sont-elles les mêmes ?</p>' +
      seg('machine', v.machine) + seg('material', 'Matière et lot') + notice +
      '<p class="vc-lab">Ça a marché ?</p><div class="vc-acts three">' + res.map(x =>
        '<button type="button" class="vc-btn pick" data-a="reuse" data-v="' + x[0] + '" aria-pressed="' + (st.reuse === x[0] ? 'true' : 'false') + '">' + x[1] + '</button>').join('') + '</div>' +
      after + '</section>';
  }

  /* ---------- affichage ---------- */
  function render(focus) {
    if (!root || root.hidden) return;
    const c = readCase();
    if (st.step !== 'intro' && !ready(c)) st = Object.assign(blank(), { example: st.example });
    const keep = document.activeElement && root.contains(document.activeElement) ? document.activeElement : null;
    const keepSel = keep && (keep.id || (keep.dataset.a ? '[data-a="' + keep.dataset.a + '"]' + (keep.dataset.v ? '[data-v="' + keep.dataset.v + '"]' : '') + (keep.dataset.k ? '[data-k="' + keep.dataset.k + '"]' : '') : ''));
    const view = st.step === 'intro' ? viewIntro(c) : st.step === 'close' ? viewClose(c) : st.step === 'review' ? viewReview(c) : viewReuse(c);
    win.innerHTML = header() + '<div class="vc-body' + (st.step === 'intro' ? ' solo' : '') + '">' + view + (st.step === 'intro' ? '' : fiche(c)) + '</div>' +
      '<footer class="vc-foot"><span>Scène de démonstration · rien n’est enregistré, ni sur serveur ni dans ce navigateur.</span></footer>';
    /* Le statut est annoncé aux lecteurs d'écran par une zone qui, elle, n'est pas réécrite à chaque affichage. */
    const live = $('#vc-live', root), say = st.step === 'intro' ? '' : 'Statut de la fiche : ' + status()[1];
    if (live && live.textContent !== say) live.textContent = say;
    if (focus) { const b = $('.vc-body', win); if (b) b.scrollTop = 0; const t = $('#vc-title', win); if (t) t.focus({ preventScroll: true }); return; }
    if (keepSel) { const e = keep.id ? $('#' + keep.id, win) : $(keepSel, win); if (e && !e.disabled) e.focus({ preventScroll: true }); }
  }
  const go = (s, f = true) => { st.step = s; st.err = ''; render(f); };

  function enter() {
    const c = readCase();
    if (!ready(c)) return go('intro');
    st.example = st.example || isExample(c);
    if (!st.tool) st.tool = c.tool || (st.example ? voc().exTool + EX_TAG : '');
    if (!st.machine) st.machine = c.machine || (st.example ? voc().exMachine + EX_TAG : '');
    go('close');
  }

  /* L'outillage ou la machine saisis ici rejoignent les références du dossier si elles étaient vides. */
  function writeBack(k, v) {
    const e = ctxEl(k);
    if (!e || e.value.trim() || !v || v.endsWith(EX_TAG)) return;
    e.value = v; fire(e, ['input', 'change']);
  }

  /* Après une décision : le résultat est amené à l'écran et le clavier reprend sur l'action suivante. */
  function land(sel) {
    const box = $('.vc-main .vc-done', win), b = sel ? $('.vc-main ' + sel, win) : null;
    if (b) b.focus({ preventScroll: true });
    const t = box || b; if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest' });
    const acts = box && box.nextElementSibling; if (acts && acts.scrollIntoView) acts.scrollIntoView({ block: 'nearest' });
  }

  function act(a, el) {
    const d = el.dataset;
    if (a === 'close') return close();
    if (a === 'goto') { if (reached(d.v)) go(d.v); return; }
    if (a === 'example') { st.example = true; playExample(); return enter(); }
    if (a === 'finish') { close(); click($('[data-vp-step="' + (readCase().hasDefect ? 4 : 1) + '"]')); return; }
    if (a === 'do-close') {
      st.tool = ($('#vc-tool', win).value || '').trim(); st.machine = ($('#vc-machine', win).value || '').trim();
      if (!st.tool) { st.err = 'Indiquez l’outillage : c’est par lui que le cas sera retrouvé.'; render(false); const i = $('#vc-tool', win); if (i) i.focus(); return; }
      writeBack('equipment', st.tool); writeBack('machine', st.machine);
      st.closed = true; return go('review');
    }
    if (a === 'valide') { st.decision = { type: 'valide', by: d.v, open: gaps(readCase()).length }; render(false); return land('[data-a="goto"][data-v="reuse"]'); }
    if (a === 'renvoi') { st.decision = { type: 'renvoi', by: 'les méthodes ou la qualité' }; render(false); return land('[data-a="undo"]'); }
    if (a === 'undo') { st.decision = null; st.reuse = ''; st.cond = { machine: '', material: '' }; render(false); return land('[data-a="valide"]'); }
    if (a === 'cond') { st.cond[d.k] = st.cond[d.k] === d.v ? '' : d.v; return render(false); }
    if (a === 'reuse') { st.reuse = d.v; render(false); return land(''); }
    if (a === 'replay') { const ex = st.example; st = blank(); st.example = ex; return enter(); }
    if (a === 'fresh') { close(); click($('.vp-case-reset') || $('#expert-new')); }
  }

  function trap(e) {
    if (e.key !== 'Tab') return;
    const f = $$('button:not([disabled]),input,select,textarea,a[href],[tabindex="0"]', win).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (e.shiftKey && (a === first || !win.contains(a) || a.id === 'vc-title')) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (a === last || !win.contains(a))) { e.preventDefault(); first.focus(); }
  }

  function build() {
    root = document.createElement('div'); root.id = 'vp-capi'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'vc-title');
    root.innerHTML = '<div class="vc-back" data-a="close"></div><div class="vc-win" id="vc-win"></div><p class="vc-sr" id="vc-live" aria-live="polite"></p>';
    document.body.appendChild(root); win = $('#vc-win', root);
    root.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) act(b.dataset.a, b); });
    root.addEventListener('input', e => { if (e.target.id === 'vc-tool') st.tool = e.target.value; if (e.target.id === 'vc-machine') st.machine = e.target.value; });
    root.addEventListener('keydown', e => { if (e.target.id === 'vc-tool' && e.key === 'Enter') { e.preventDefault(); click($('[data-a="do-close"]', win)); } trap(e); });
    document.addEventListener('keydown', e => { if (root && !root.hidden && e.key === 'Escape') { e.stopPropagation(); close(); } }, true);
  }

  function open() {
    if (!root) build();
    if (window.VPApp && window.VPApp.isOpen && window.VPApp.isOpen()) window.VPApp.close();
    lastFocus = document.activeElement;
    st = blank();
    root.hidden = false; document.body.classList.add('vp-capi-open');
    enter();
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; document.body.classList.remove('vp-capi-open'); win.innerHTML = ''; $('#vc-live', root).textContent = ''; st = null;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  window.VPCapitaliser = { open, close, isOpen: () => !!root && !root.hidden };

  /* ---------- entrées : bouton sous les étapes, carte à l'étape 4, lien ?capitaliser=1 ---------- */
  function cta() {
    const host = $('#expert-bilan'); if (!host) return;
    let box = $('#vp-capi-cta');
    const show = ready(readCase());
    if (!show) { if (box) box.hidden = true; return; }
    if (!box) {
      box = document.createElement('div'); box.id = 'vp-capi-cta'; box.className = 'vp-capi-cta';
      box.innerHTML = '<div><b>Et ensuite : capitaliser.</b><span>' + (dossierMoule() ? 'Voir comment le cas est clos par le régleur, validé par les méthodes ou la qualité, puis rejoint le dossier de preuve du moule.' : 'Voir comment ce cas devient une méthode validée, puis sert au régleur suivant sur le même outillage.') + '</span></div>' +
        '<button type="button" class="vp-capi-go">Ouvrir la scène Capitaliser</button>';
      $('button', box).addEventListener('click', open);
    }
    if (box.previousElementSibling !== host) host.after(box);
    box.hidden = false;
  }

  function launcher() {
    let wrap = $('.vp-modes');
    if (!wrap) { const nav = $('.esteps'); if (!nav) return; wrap = document.createElement('div'); wrap.className = 'vp-modes'; nav.after(wrap); }
    if (!$('#vp-capi-launch')) {
      const b = document.createElement('button');
      b.type = 'button'; b.id = 'vp-capi-launch'; b.className = 'vp-capi-launch'; b.textContent = 'Scène Capitaliser';
      b.addEventListener('click', open);
      wrap.appendChild(b);
    }
    cta();
    window.addEventListener('vp:enquete-render', () => { cta(); if (root && !root.hidden) render(false); });
    document.addEventListener('click', () => setTimeout(cta, 0));
    document.addEventListener('change', () => setTimeout(cta, 0));
    if (/(^|[?&])capitaliser=1(&|$)/.test(location.search)) setTimeout(open, 600);
  }
  const start = () => setTimeout(launcher, 140);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
