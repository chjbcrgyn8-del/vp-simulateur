/* VP Expert · schémas illustratifs des défauts (en attendant des photos validées par les experts).
   Dessins simples, pas des photos : ils aident à reconnaître la famille du défaut, rien de plus.
   Ajoutés aux cartes de l'étape 1 et au dossier en cours ; aucun moteur n'est modifié. */
(function () {
  'use strict';
  const INK = '#3d4756', CREAM = '#efe7d8', PAPER = '#fffdf9', SAND = '#cfc6b6', GREY = '#9aa7b8', COPPER = '#b4541a', METAL = '#cfd6df';
  const sw = (w) => 'stroke="' + INK + '" stroke-width="' + (w || 1.5) + '"';

  /* Chaque schéma : 120 × 80, fond transparent. « § » est remplacé par un identifiant unique (dégradés). */
  const S = {
    flash: ['bavure au plan de joint : de la matière passe dans le jeu entre les deux moitiés du moule',
      '<rect x="8" y="10" width="104" height="26" fill="' + SAND + '"/><rect x="8" y="46" width="104" height="26" fill="' + SAND + '"/>' +
      '<rect x="36" y="36" width="48" height="10" fill="' + CREAM + '" ' + sw() + '/><rect x="84" y="39.5" width="26" height="3" fill="' + COPPER + '"/><rect x="10" y="39.5" width="26" height="3" fill="' + COPPER + '"/>'],
    short: ['pièce incomplète : la matière n’arrive pas jusqu’au bout de l’empreinte',
      '<rect x="12" y="22" width="98" height="36" rx="3" fill="none" stroke="' + GREY + '" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<path d="M12 22 H74 Q84 30 74 40 Q84 48 74 58 H12 Z" fill="' + CREAM + '" ' + sw() + ' stroke-linejoin="round"/>' +
      '<path d="M3 40 L12 35 V45 Z" fill="' + INK + '"/><path d="M90 31 L98 40 L90 49" fill="none" stroke="' + COPPER + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
    sink: ['retassure : creux en surface au droit d’une nervure ou d’une zone épaisse',
      '<path d="M10 24 H46 Q60 31 74 24 H110 V38 H68 V68 H52 V38 H10 Z" fill="' + CREAM + '" ' + sw() + ' stroke-linejoin="round"/>' +
      '<line x1="46" y1="24" x2="74" y2="24" stroke="' + COPPER + '" stroke-width="1.5" stroke-dasharray="3 2"/>'],
    weld: ['ligne de soudure : trait là où deux fronts de matière se rejoignent derrière un trou',
      '<rect x="10" y="14" width="100" height="52" rx="3" fill="' + CREAM + '" ' + sw() + '/><circle cx="52" cy="40" r="9" fill="' + PAPER + '" ' + sw() + '/>' +
      '<path d="M61 40 C70 37 76 43 85 40 S100 41 110 40" fill="none" stroke="' + COPPER + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M16 40 H32 M27 35 L32 40 L27 45" fill="none" stroke="' + GREY + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'],
    burn: ['brûlure : zone brunie ou noircie, souvent en fin de remplissage',
      '<defs><linearGradient id="g§" x1="0" x2="1" y1="0" y2="0"><stop offset=".5" stop-color="' + CREAM + '"/><stop offset="1" stop-color="#3a2410"/></linearGradient></defs>' +
      '<rect x="10" y="14" width="100" height="52" rx="3" fill="url(#g§)" ' + sw() + '/>'],
    splay: ['givrage : traînées argentées qui partent du point d’injection',
      '<rect x="10" y="14" width="100" height="52" rx="3" fill="#b7bfca" ' + sw() + '/><g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95">' +
      '<path d="M22 40 L70 30"/><path d="M22 40 L80 43"/><path d="M24 36 L60 22"/><path d="M24 45 L64 58"/><path d="M26 40 L96 38"/><path d="M30 33 L88 26"/></g>'],
    warp: ['déformation : la pièce n’est plus plane, elle s’écarte de sa forme nominale',
      '<line x1="10" y1="50" x2="110" y2="50" stroke="' + GREY + '" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<path d="M10 56 Q60 14 110 56" fill="none" ' + sw(8) + ' stroke-linecap="round"/><path d="M10 56 Q60 14 110 56" fill="none" stroke="' + CREAM + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M60 48 V34 M55 39 L60 34 L65 39" fill="none" stroke="' + COPPER + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'],
    specks: ['points noirs : petites inclusions sombres dans la pièce',
      '<rect x="10" y="14" width="100" height="52" rx="3" fill="' + CREAM + '" ' + sw() + '/><g fill="#1b1b1b"><circle cx="34" cy="30" r="2.4"/><circle cx="52" cy="48" r="1.6"/><circle cx="70" cy="28" r="1.9"/><circle cx="84" cy="50" r="2.6"/><circle cx="96" cy="34" r="1.4"/><circle cx="44" cy="56" r="1.3"/><circle cx="62" cy="38" r="1.2"/></g>'],
    voids: ['bulles ou porosités : vides à l’intérieur ou en surface de la pièce',
      '<rect x="12" y="14" width="96" height="52" rx="3" fill="' + CREAM + '" ' + sw() + '/><g fill="' + PAPER + '" ' + sw(1.2) + '><circle cx="38" cy="36" r="7"/><circle cx="64" cy="48" r="5"/><circle cx="82" cy="30" r="4"/><circle cx="52" cy="26" r="2.6"/><circle cx="94" cy="50" r="2.4"/></g>'],
    dia: ['cote hors tolérance : le diamètre sort de la bande de tolérance',
      '<rect x="10" y="26" width="80" height="28" fill="' + CREAM + '" ' + sw() + '/>' +
      '<line x1="10" y1="30" x2="96" y2="30" stroke="' + COPPER + '" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="10" y1="50" x2="96" y2="50" stroke="' + COPPER + '" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<path d="M104 26 V54 M100 31 L104 26 L108 31 M100 49 L104 54 L108 49" fill="none" ' + sw(1.5) + ' stroke-linecap="round" stroke-linejoin="round"/>'],
    edge: ['arête de coupe : usure, ébréchure ou casse du bec de l’outil',
      '<path d="M20 66 L60 20 L100 66 Z" fill="' + SAND + '" ' + sw() + ' stroke-linejoin="round"/><path d="M60 20 L67 29 L57 31 Z" fill="' + PAPER + '" stroke="' + COPPER + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M25 60 L42 41" fill="none" stroke="' + COPPER + '" stroke-width="1.6" stroke-dasharray="3 2"/>'],
    thin: ['épaisseur de dépôt insuffisante par rapport au minimum visé',
      '<rect x="10" y="46" width="100" height="24" fill="' + METAL + '" ' + sw() + '/><rect x="10" y="42" width="100" height="4" fill="' + COPPER + '"/>' +
      '<line x1="10" y1="32" x2="110" y2="32" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="4 3"/><path d="M60 33 V41 M56 37 L60 41 L64 37" fill="none" stroke="' + COPPER + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'],
    thick: ['épaisseur de dépôt trop forte ou irrégulière',
      '<rect x="10" y="50" width="100" height="22" fill="' + METAL + '" ' + sw() + '/><path d="M10 50 V40 Q30 22 50 38 T90 34 T110 42 V50 Z" fill="' + COPPER + '"/>'],
    pits: ['piqûres : petits trous en surface du dépôt',
      '<rect x="10" y="14" width="100" height="52" rx="3" fill="' + METAL + '" ' + sw() + '/><g fill="' + INK + '"><circle cx="30" cy="30" r="2.2"/><circle cx="48" cy="46" r="1.6"/><circle cx="64" cy="26" r="2"/><circle cx="80" cy="44" r="2.6"/><circle cx="94" cy="28" r="1.5"/><circle cx="42" cy="56" r="1.4"/><circle cx="70" cy="56" r="1.8"/></g>'],
    blister: ['cloquage : le dépôt se soulève et se décolle du support',
      '<rect x="10" y="50" width="100" height="22" fill="' + METAL + '" ' + sw() + '/><path d="M10 44 H42 C50 22 70 22 78 44 H110 V50 H10 Z" fill="' + COPPER + '"/><path d="M45 50 C51 33 69 33 75 50 Z" fill="' + PAPER + '"/>'],
    pburn: ['brûlure du dépôt : excès sombre et rugueux sur les arêtes et les pointes',
      '<rect x="32" y="26" width="56" height="34" fill="' + METAL + '" ' + sw() + '/><g fill="#3a2a1a"><circle cx="32" cy="26" r="4.4"/><circle cx="88" cy="26" r="4.4"/><circle cx="32" cy="60" r="4.4"/><circle cx="88" cy="60" r="4.4"/><circle cx="27" cy="31" r="2"/><circle cx="93" cy="31" r="2"/><circle cx="27" cy="55" r="2"/><circle cx="93" cy="55" r="2"/><circle cx="38" cy="21" r="2"/><circle cx="82" cy="21" r="2"/></g>']
  };

  const P = location.pathname;
  const SECTOR = /traitement-surface/.test(P) ? 'TS' : /decolletage/.test(P) ? 'DC' : /caoutchouc/.test(P) ? 'CA' : 'TP';
  const RULES = {
    TP: [[/bavure(?!s ou)/i, 'flash'], [/incomplet|manque mati/i, 'short'], [/retassure/i, 'sink'], [/soudure/i, 'weld'], [/givrage/i, 'splay'], [/bulles|poreu/i, 'voids'], [/brûlure|grillée/i, 'burn'], [/déform|voilage/i, 'warp'], [/points noirs/i, 'specks']],
    DC: [[/arête|outil|cratère|usure/i, 'edge'], [/diamètre|cote|conicité|ovalisation|longueur|faux-rond|épaulement/i, 'dia']],
    TS: [[/cloquage|cloques|écaillage/i, 'blister'], [/piqûres/i, 'pits'], [/brûlure|nodules/i, 'pburn'], [/trop forte|irrégulière|cassant/i, 'thick'], [/épaisseur|poids de couche/i, 'thin']]
  };
  RULES.CA = RULES.TP;

  let uid = 0;
  const keyFor = name => { const l = RULES[SECTOR] || []; for (const [rx, k] of l) if (rx.test(name)) return k; return null; };
  const svg = (k, label) => {
    const [desc, body] = S[k]; const id = 's' + (++uid);
    return '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"' + (label ? ' role="img" aria-label="Schéma illustratif : ' + desc + '"' : ' aria-hidden="true" focusable="false"') + '>' + body.replace(/§/g, id) + '</svg>';
  };
  window.VPSchemas = { keyFor, svg, keys: Object.keys(S), desc: k => S[k][0] };

  function decorateCards() {
    document.querySelectorAll('#defs button.dt:not([data-sch])').forEach(b => {
      b.setAttribute('data-sch', '1');
      const t = (b.querySelector('b') || b).textContent.trim(), k = keyFor(t);
      if (!k) return;
      const s = document.createElement('span'); s.className = 'dt-sch'; s.innerHTML = svg(k, false);
      b.appendChild(s); b.classList.add('has-sch');
    });
  }

  function decorateCase() {
    const h = document.getElementById('vp-case-defect'); if (!h) return;
    let f = document.getElementById('vp-case-schema');
    const k = keyFor(h.textContent.trim());
    if (!k) { if (f) f.remove(); return; }
    if (!f) { f = document.createElement('figure'); f.id = 'vp-case-schema'; f.className = 'vp-schema'; h.after(f); }
    if (f.dataset.k !== k) { f.dataset.k = k; f.innerHTML = svg(k, true) + '<figcaption>Schéma illustratif, pas une photo</figcaption>'; }
  }

  function run() { decorateCards(); decorateCase(); }
  function init() {
    run();
    window.addEventListener('vp:enquete-render', run);
    const defs = document.getElementById('defs');
    if (defs) new MutationObserver(() => requestAnimationFrame(decorateCards)).observe(defs, { childList: true });
    const hh = document.getElementById('vp-case-defect');
    if (hh) new MutationObserver(() => requestAnimationFrame(decorateCase)).observe(hh, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
