/* VP Scan · décolletage et traitement de surface.
   Calculateur dans le navigateur : pertes annuelles par poste, part adressable par VP Expert ou VP Predict,
   priorités, données disponibles. Valeurs de départ illustratives, objectifs = hypothèses Vella Partners.
   Aucun prix d'offre n'est affiché. */
(function () {
  const CFG = {
    decolletage: {
      nom: 'Décolletage', unite: 'machine', unites: 'machines',
      titre: 'Où vos machines perdent-elles de l’argent ?',
      lead: 'Six postes de perte propres au décolletage : arrêts, réglages, rebuts, séries bloquées, tri et outils. Tout est prérempli avec des valeurs d’exemple : remplacez ce que vous connaissez.',
      expert: 'enquete-decolletage.html', predict: 'machine-decolletage.html',
      groupes: [
        { t: 'Votre parc', f: [
          ['n', 'Tours et décolleteuses en production', 'machines', 12, 1, 'Monobroches, multibroches, poupée mobile : comptez toutes les machines qui produisent.'],
          ['ch', 'Coût d’une heure machine, opérateur compris', '€/h', 70, 1, 'Coût complet d’une heure de production perdue. 70 €/h est un exemple, pas un repère sectoriel.']]},
        { t: 'Arrêts et réglages', f: [
          ['arr', 'Arrêts non planifiés par machine', 'h/mois', 10, .5, 'Casse d’outil, panne, attente de réglage ou de contrôle.'],
          ['chg', 'Changements de série et reprises de réglage', 'par an', 400, 10, 'Total sur le parc, réglages d’usure compris.'],
          ['chd', 'Durée moyenne d’un changement ou d’une reprise', 'h', 2.5, .25, 'De la dernière pièce bonne à la première pièce bonne.']]},
        { t: 'Qualité', f: [
          ['ca', 'Valeur de la production annuelle', '€/an', 8000000, 50000, 'Chiffre d’affaires des pièces décolletées.'],
          ['rb', 'Rebuts', '%', 2, .1, 'Pièces rebutées, en valeur.'],
          ['lot', 'Lots bloqués ou séries perdues par un contrôle tardif', 'par an', 10, 1, 'Une dérive découverte au contrôle final ou chez le client.'],
          ['lotc', 'Coût moyen d’un lot bloqué', '€', 4000, 100, 'Matière, tri, refabrication, transport express.'],
          ['tri', 'Heures de tri et de retouche', 'h/an', 1200, 50, 'Tri 100 %, ébavurage et reprises de pièces.'],
          ['tric', 'Coût d’une heure de tri', '€/h', 40, 1, '']]},
        { t: 'Outils', f: [
          ['out', 'Budget annuel d’outils coupants', '€/an', 150000, 5000, 'Plaquettes, forets, outils de forme, affûtage.']]}
      ],
      postes: [
        { k: 'arr', n: 'Arrêts non planifiés', o: 'expert', cible: 20, f: v => v.n * v.arr * 12 * v.ch,
          d: v => `${v.n} machines × ${fx(v.arr)} h/mois × 12 × ${fx(v.ch)} €/h`, why: 'Diagnostic guidé : la cause probable et le contrôle à faire d’abord, sans attendre le régleur expérimenté.' },
        { k: 'chg', n: 'Réglages et changements de série', o: 'expert', cible: 15, f: v => v.chg * v.chd * v.ch,
          d: v => `${fx(v.chg)} par an × ${fx(v.chd)} h × ${fx(v.ch)} €/h`, why: 'Retour au réglage de référence et mémoire des réglages réussis.' },
        { k: 'rb', n: 'Rebuts', o: 'predict', cible: 30, f: v => v.ca * v.rb / 100,
          d: v => `${fx(v.ca)} € × ${fx(v.rb)} %`, why: 'La cote qui dérive avec l’usure est signalée avant la tolérance.' },
        { k: 'lot', n: 'Lots bloqués, séries perdues', o: 'predict', cible: 50, f: v => v.lot * v.lotc,
          d: v => `${fx(v.lot)} lots × ${fx(v.lotc)} €`, why: 'La dérive est vue pendant la série, pas au contrôle final.' },
        { k: 'tri', n: 'Tri et retouches', o: 'expert', cible: 30, f: v => v.tri * v.tric,
          d: v => `${fx(v.tri)} h × ${fx(v.tric)} €/h`, why: 'La cause traitée plus vite réduit le volume à trier.' },
        { k: 'out', n: 'Outils changés trop tôt ou trop tard', o: 'predict', cible: 8, f: v => v.out,
          d: v => `budget ${fx(v.out)} € (perte = part évitable)`, why: 'Changement d’outil décidé sur l’usure mesurée plutôt qu’à intervalle fixe.', budget: true }
      ],
      data: [
        ['spc', 'Contrôles statistiques saisis (SPC) avec date et machine'],
        ['mes', 'Mesure en ligne ou en machine (palpeur, laser)'],
        ['cn', 'Commandes numériques connectables (OPC UA, MTConnect, protocole constructeur)'],
        ['out', 'Changements d’outil enregistrés (date, outil, motif)'],
        ['arr', 'Arrêts saisis avec un motif']
      ]
    },
    'traitement-surface': {
      nom: 'Traitement de surface', unite: 'ligne', unites: 'lignes',
      titre: 'Où vos lignes perdent-elles de l’argent ?',
      lead: 'Six postes de perte propres au traitement de surface : arrêts de ligne, retouches et décapages, réclamations, corrections de bain, vidanges et consommation de chimie. Tout est prérempli avec des valeurs d’exemple : remplacez ce que vous connaissez.',
      expert: 'enquete-traitement-surface.html', predict: 'machine-traitement-surface.html',
      groupes: [
        { t: 'Vos lignes', f: [
          ['n', 'Lignes en production (attache, tonneau, continu)', 'lignes', 3, 1, 'Zinc, zinc-nickel, anodisation, nickel chimique, chromage, peinture : comptez chaque ligne.'],
          ['ch', 'Coût d’une heure de ligne arrêtée', '€/h', 220, 5, 'Main-d’œuvre, énergie de maintien en température, production perdue. 220 €/h est un exemple, pas un repère sectoriel.']]},
        { t: 'Arrêts et bains', f: [
          ['arr', 'Arrêts non planifiés par ligne', 'h/mois', 12, .5, 'Panne de redresseur, pont, filtration, attente d’analyse.'],
          ['vid', 'Vidanges ou remontées de bain non planifiées', 'par an', 4, 1, 'Bain pollué ou hors plage, à refaire.'],
          ['vidc', 'Coût moyen d’une vidange non planifiée', '€', 12000, 500, 'Chimie, traitement des effluents, arrêt de ligne.'],
          ['cor', 'Heures de corrections de bain et d’analyses en urgence', 'h/an', 400, 10, 'Analyses supplémentaires, ajouts correctifs, cellule de Hull.'],
          ['corc', 'Coût d’une heure de laboratoire ou de régleur', '€/h', 60, 1, '']]},
        { t: 'Qualité', f: [
          ['ca', 'Chiffre d’affaires traité', '€/an', 5000000, 50000, 'Valeur facturée des traitements.'],
          ['ret', 'Pièces retouchées ou redécapées', '%', 4, .1, 'Part du chiffre d’affaires repassée en ligne.'],
          ['retx', 'Coût d’une retouche, rapporté au traitement initial', '×', 1.6, .1, 'Décapage puis nouveau traitement : souvent plus cher que le traitement initial.'],
          ['rec', 'Pièces client rebutées et réclamations', '€/an', 60000, 1000, 'Pièces refacturées, pénalités, tri chez le client.']]},
        { t: 'Chimie et énergie', f: [
          ['chim', 'Achats annuels de chimie, d’anodes et de sels', '€/an', 300000, 5000, '']]}
      ],
      postes: [
        { k: 'ret', n: 'Retouches et redécapages', o: 'predict', cible: 30, f: v => v.ca * v.ret / 100 * v.retx,
          d: v => `${fx(v.ca)} € × ${fx(v.ret)} % × ${fx(v.retx)}`, why: 'L’épaisseur ou la composition qui dérive est signalée entre deux analyses, avant les pièces hors spécification.' },
        { k: 'arr', n: 'Arrêts non planifiés', o: 'expert', cible: 20, f: v => v.n * v.arr * 12 * v.ch,
          d: v => `${v.n} lignes × ${fx(v.arr)} h/mois × 12 × ${fx(v.ch)} €/h`, why: 'Diagnostic guidé : la cause probable et le contrôle à faire d’abord.' },
        { k: 'rec', n: 'Rebuts définitifs et réclamations', o: 'expert', cible: 30, f: v => v.rec,
          d: v => `${fx(v.rec)} € par an`, why: 'Contre-mesure exigée et cause tracée : la même réclamation ne revient pas.' },
        { k: 'vid', n: 'Vidanges non planifiées', o: 'predict', cible: 40, f: v => v.vid * v.vidc,
          d: v => `${fx(v.vid)} par an × ${fx(v.vidc)} €`, why: 'La pollution ou le vieillissement du bain est suivi avant la vidange forcée.' },
        { k: 'cor', n: 'Corrections et analyses en urgence', o: 'predict', cible: 30, f: v => v.cor * v.corc,
          d: v => `${fx(v.cor)} h × ${fx(v.corc)} €/h`, why: 'Les ajouts sont anticipés sur la tendance des analyses et des ampères-heures.' },
        { k: 'chim', n: 'Surconsommation de chimie', o: 'predict', cible: 5, f: v => v.chim,
          d: v => `achats ${fx(v.chim)} € (perte = part évitable)`, why: 'Bain conduit au plus juste dans sa plage, sans surdosage de sécurité.', budget: true }
      ],
      data: [
        ['lab', 'Analyses de bain enregistrées (date, bain, valeurs, ajouts)'],
        ['xrf', 'Épaisseurs mesurées (XRF ou magnétique) tracées par charge'],
        ['red', 'Redresseurs connectables (courant, tension, ampères-heures)'],
        ['sonde', 'Sondes de bain connectées (pH, température, conductivité)'],
        ['arr', 'Arrêts et retouches saisis avec un motif']
      ]
    }
  };
  const SCEN = { prudent: [.5, 'Prudent'], central: [.75, 'Central'], cible: [1, 'Cible'] };
  const ON = { expert: 'VP Expert', predict: 'VP Predict' };

  const key = document.body.dataset.scan, C = CFG[key], root = document.getElementById('scan');
  if (!C || !root) return;
  const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  function fx(x) { return nf.format(x); }
  const eur = x => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(x / 100) * 100) + '\u00a0€';
  const keur = x => x >= 1e6 ? nf.format(Math.round(x / 1e5) / 10) + '\u00a0M€' : new Intl.NumberFormat('fr-FR').format(Math.round(x / 1e3)) + '\u00a0k€';
  const nb = s => String(s).replace(/ ([?:;!»%])/g, '\u00a0$1').replace(/« /g, '«\u00a0');

  const V = {}, D0 = {}, touched = new Set(), have = new Set();
  C.groupes.forEach(g => g.f.forEach(([k, , , d]) => { V[k] = d; D0[k] = d; }));
  let scen = 'central';

  const field = ([k, l, u, d, st, h]) => `<label class="sc-f" for="sc-${k}"><span class="sc-l">${nb(l)}</span>
    <span class="sc-in"><input id="sc-${k}" data-k="${k}" type="text" inputmode="decimal" autocomplete="off" value="${fx(d)}"><span class="sc-u">${u}</span></span>
    ${h ? `<span class="sc-h">${nb(h)}</span>` : ''}<span class="sc-tag" data-tag="${k}">Valeur d’exemple</span></label>`;

  root.innerHTML = `
  <header class="sc-hero"><p class="eyebrow">VP Scan · ${C.nom}</p><h1>${nb(C.titre)}</h1><p class="sc-lead">${nb(C.lead)}</p>
    <p class="sc-warn">Estimation dans votre navigateur, rien n’est envoyé. Les valeurs de départ sont des exemples et non des repères sectoriels ; les objectifs de réduction sont des hypothèses Vella Partners, à confirmer lors du VP Scan sur site.</p></header>
  <div class="sc-grid">
    <form class="sc-form" id="sc-form" novalidate>
      ${C.groupes.map((g, i) => `<fieldset class="sc-g"><legend><span>${i + 1}</span>${g.t}</legend>${g.f.map(field).join('')}</fieldset>`).join('')}
      <fieldset class="sc-g"><legend><span>${C.groupes.length + 1}</span>Vos données aujourd’hui</legend>
        <p class="sc-h sc-hd">Cochez ce qui existe déjà. Cela ne change pas le montant : cela indique ce que VP Predict pourrait suivre sans projet de connexion.</p>
        <div class="sc-chk">${C.data.map(([k, l]) => `<label><input type="checkbox" data-d="${k}"><span>${nb(l)}</span></label>`).join('')}</div>
      </fieldset>
    </form>
    <aside class="sc-res" id="sc-res" aria-live="polite">
      <p class="sc-k">Pertes annuelles estimées</p>
      <p class="sc-big" id="sc-tot"></p><p class="sc-rg" id="sc-rg"></p>
      <div class="sc-bars" id="sc-bars"></div>
      <div class="sc-scen" role="group" aria-label="Scénario">${Object.entries(SCEN).map(([k, [, l]]) => `<button type="button" data-s="${k}" aria-pressed="${k === scen}">${l}</button>`).join('')}</div>
      <p class="sc-k">Gain possible par an · scénario <span id="sc-sl"></span></p>
      <p class="sc-gain" id="sc-gain"></p>
      <div class="sc-split" id="sc-split"></div>
      <p class="sc-rel" id="sc-rel"></p>
    </aside>
  </div>
  <a class="sc-mini" href="#sc-res"><span>Pertes estimées</span><b id="sc-mt"></b><em>Voir le résultat ↓</em></a>
  <section class="sc-out">
    <div class="sc-pri"><p class="eyebrow">Où regarder en premier</p><h2>Vos trois premières priorités</h2><ol id="sc-pri"></ol></div>
    <div class="sc-dat"><p class="eyebrow">Vos données</p><h2 id="sc-dt"></h2><p id="sc-dd"></p></div>
  </section>
  <section class="sc-hyp"><details><summary>Détail du calcul et hypothèses</summary>
    <table><thead><tr><th>Poste</th><th>Calcul</th><th>Perte</th><th>Objectif</th><th>Offre</th></tr></thead><tbody id="sc-hyp"></tbody></table>
    <p class="sc-h">Gain = perte × objectif de réduction × facteur de scénario (prudent 50 %, central 75 %, cible 100 %). Fourchette affichée : ± 35 % tant que les chiffres n’ont pas été vérifiés sur site. Pour les postes « outils » et « chimie », la perte retenue est la part évitable du budget, égale à l’objectif.</p></details></section>
  <section class="sc-cta"><div><p class="eyebrow">Et ensuite</p><h2>Le VP Scan sur site vérifie ces chiffres</h2>
    <p>Une intervention courte : vos arrêts, rebuts et retouches relevés sur vos ${C.unites}, la qualité de vos données évaluée, les ${C.unites} critiques désignées. Vos priorités chiffrées vous restent acquises, même sans suite.</p></div>
    <div class="sc-btns"><a class="btn primary" href="pilote.html#rdv">Préparer un VP Scan sur site</a><a class="btn ghost" href="${C.expert}">VP Expert · résoudre un défaut</a><a class="btn ghost" href="${C.predict}">VP Predict · voir une dérive</a></div></section>`;

  const $ = id => document.getElementById(id);
  document.body.appendChild(root.querySelector('.sc-mini'));
  if ('IntersectionObserver' in window) { const mini = document.querySelector('.sc-mini'); new IntersectionObserver(e => mini.classList.toggle('hid', e[0].isIntersecting), { threshold: .15 }).observe(document.getElementById('sc-res')); }
  root.querySelectorAll('input[data-k]').forEach(inp => inp.addEventListener('input', () => {
    const x = parseFloat(String(inp.value).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
    V[inp.dataset.k] = isFinite(x) && x >= 0 ? x : 0;
    if (V[inp.dataset.k] !== D0[inp.dataset.k]) touched.add(inp.dataset.k); else touched.delete(inp.dataset.k);
    calc();
  }));
  root.querySelectorAll('input[data-k]').forEach(inp => inp.addEventListener('blur', () => { inp.value = fx(V[inp.dataset.k]); }));
  root.querySelectorAll('input[data-d]').forEach(c => c.addEventListener('change', () => { c.checked ? have.add(c.dataset.d) : have.delete(c.dataset.d); calc(); }));
  root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { scen = b.dataset.s; root.querySelectorAll('[data-s]').forEach(x => x.setAttribute('aria-pressed', x === b)); calc(); }));

  function calc() {
    const f = SCEN[scen][0];
    const P = C.postes.map(p => {
      const base = Math.max(0, p.f(V));
      const loss = p.budget ? base * p.cible / 100 : base;
      const gain = p.budget ? loss * f : loss * p.cible / 100 * f;
      return { ...p, loss, gain };
    });
    const tot = P.reduce((a, p) => a + p.loss, 0), gain = P.reduce((a, p) => a + p.gain, 0);
    const ge = P.filter(p => p.o === 'expert').reduce((a, p) => a + p.gain, 0), gp = gain - ge;
    $('sc-tot').textContent = eur(tot);
    $('sc-mt').textContent = eur(tot);
    $('sc-rg').textContent = `Fourchette ${keur(tot * .65)} à ${keur(tot * 1.35)}`;
    const mx = Math.max(...P.map(p => p.loss), 1);
    $('sc-bars').innerHTML = [...P].sort((a, b) => b.loss - a.loss).map(p => `<div class="sc-bar"><span class="sc-bn">${p.n}</span><span class="sc-bv">${keur(p.loss)}</span><i class="${p.o}" style="width:${Math.max(2, p.loss / mx * 100)}%"></i></div>`).join('');
    $('sc-sl').textContent = SCEN[scen][1].toLowerCase();
    $('sc-gain').textContent = eur(gain);
    $('sc-split').innerHTML = `<div><i class="expert"></i><b>VP Expert</b><span>résoudre plus vite</span><em>${keur(ge)}</em></div><div><i class="predict"></i><b>VP Predict</b><span>anticiper la dérive</span><em>${keur(gp)}</em></div>`;
    const known = touched.size, all = Object.keys(V).length;
    $('sc-rel').textContent = known === 0 ? `Aucune valeur saisie : résultat entièrement illustratif.` : `${known} valeur${known > 1 ? 's' : ''} saisie${known > 1 ? 's' : ''} sur ${all}. Les autres restent des exemples.`;
    root.querySelectorAll('[data-tag]').forEach(t => t.hidden = touched.has(t.dataset.tag));
    $('sc-pri').innerHTML = [...P].sort((a, b) => b.gain - a.gain).slice(0, 3).map(p => `<li><div><b>${p.n}</b><span>${keur(p.loss)} de pertes · gain possible ${keur(p.gain)}</span><p>${nb(p.why)}</p></div><a href="${p.o === 'expert' ? C.expert : C.predict}" class="sc-ob ${p.o}">${ON[p.o]} →</a></li>`).join('');
    const h = have.size, n = C.data.length;
    $('sc-dt').textContent = h === 0 ? 'Données à constituer' : h >= 3 ? 'Base suffisante pour un pilote VP Predict' : 'Base partielle';
    $('sc-dd').textContent = h === 0
      ? `Sans données tracées, commencez par VP Expert, qui fonctionne sans connexion : chaque résolution saisie constitue l’historique. Le VP Scan dira quelles ${C.unites} connecter en premier.`
      : h >= 3 ? `${h} sources sur ${n} existent déjà. Un pilote VP Predict de trois mois sur une à trois ${C.unites} critiques est envisageable ; le VP Scan vérifie la qualité de ces données (dates, unités, trous).`
      : `${h} source${h > 1 ? 's' : ''} sur ${n}. VP Expert peut démarrer tout de suite ; VP Predict demandera de compléter le suivi sur les ${C.unites} critiques.`;
    $('sc-hyp').innerHTML = P.map(p => `<tr><td>${p.n}</td><td>${nb(p.d(V))}</td><td>${eur(p.loss)}</td><td>${p.cible}\u00a0%</td><td>${ON[p.o]}</td></tr>`).join('');
  }
  calc();
})();
