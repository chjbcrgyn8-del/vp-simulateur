/* Navigation par secteur · 4 secteurs × 3 offres.
   1. Accueil : tuiles des secteurs et tableau d'avancement (#sx-tiles, #sx-mx).
   2. Pages secteur (body[data-sx]) : VP Scan → VP Expert → VP Predict pour un secteur.
   3. Démonstrateurs : barre « secteur › offre » sous l'en-tête, pour savoir où l'on est et passer à l'offre suivante. */
(function () {
  const S = window.VP_SECTEURS, O = window.VP_OFFRES;
  if (!S || !O) return;
  const keys = Object.keys(S);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nb = s => esc(s).replace(/ ([?:;!»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;');
  const hub = k => `secteur-${k}.html`;
  const ON = { scan: 'VP Scan', expert: 'VP Expert', predict: 'VP Predict' };
  const VB = { scan: 'Chiffrer', expert: 'Résoudre', predict: 'Anticiper' };
  const badge = (st, l, href) => href ? `<a class="sx-st ${st}" href="${href}">${esc(l)}</a>` : `<span class="sx-st ${st}">${esc(l)}</span>`;
  const $ = id => document.getElementById(id);
  /* anim.js réécrit les liens selon le secteur détecté : nos liens sont explicites, on les protège. */
  const keep = el => el && el.querySelectorAll('a[href]').forEach(a => a.setAttribute('data-keep', ''));

  /* 1. Accueil */
  if ($('sx-tiles')) {
    $('sx-tiles').innerHTML = keys.map(k => {
      const s = S[k];
      return `<a class="sx-tile" href="${hub(k)}"><span class="sx-n">${s.num}</span><span class="sx-go" aria-hidden="true">→</span>
        <h3>${esc(s.nom)}</h3><p>${nb(s.accroche)}</p>
        <ul class="sx-tl">${['expert', 'scan', 'predict'].map(o => `<li><i class="sx-dot ${s[o].statut}"></i><b>${ON[o]}</b><span>${esc(s[o].statutL)}</span></li>`).join('')}</ul>
        <div class="sx-stat"><b>${esc(s.chiffre)}</b><span>${esc(s.chiffreL)}</span></div></a>`;
    }).join('');
    keep($('sx-tiles'));
  }
  if ($('sx-mx')) {
    $('sx-mx').innerHTML = keys.map(k => {
      const s = S[k];
      return `<tr><th scope="row"><a href="${hub(k)}">${esc(s.nom)}</a></th>${['expert', 'scan', 'predict'].map(o => {
        const c = s[o];
        return `<td data-l="${ON[o]}">${badge(c.statut, c.statutL, c.demo)}</td>`;
      }).join('')}</tr>`;
    }).join('');
    keep($('sx-mx'));
  }

  /* 2. Page secteur */
  const cur = document.body.dataset.sx;
  if (cur && S[cur] && $('sx-main')) {
    const s = S[cur], i = keys.indexOf(cur), prev = keys[(i + 3) % 4], nxt = keys[(i + 1) % 4];
    const PRED = [['Anticiper', `Les mesures de la ${s.machine} suivies en continu, chacune comparée à sa référence.`],
                  ['Identifier', 'L’alerte nomme la mesure qui dérive, la règle déclenchée et la valeur mesurée.'],
                  ['Résoudre', 'Les contrôles de VP Expert s’ouvrent dans l’ordre ; l’action est suivie jusqu’au retour à la référence.']];
    const col = (o, n) => {
      const c = s[o.k], pr = o.k === 'predict';
      const body = pr
        ? `<ol class="sx-pp">${PRED.map(([t, d]) => `<li><b>${t}</b><span>${nb(d)}</span></li>`).join('')}</ol>
           <p class="sx-lbl">Ce qui est suivi</p><div class="sx-chips">${c.mesures.map(m => `<span>${esc(m)}</span>`).join('')}</div>
           <p class="sx-lbl">Connexion</p><p class="sx-cx">${esc(c.connexion)}</p>`
        : `<ul class="sx-ul">${c.fait.map(f => `<li>${nb(f)}</li>`).join('')}</ul>`;
      const guide = o.k === 'expert' && c.demo ? `<a class="btn ghost sx-btn" href="${c.demo}${c.demo.indexOf('?') > -1 ? '&' : '?'}demo=1">Démonstration guidée · 90 s</a>` : '';
      const btn = c.demo
        ? `<a class="btn ${pr ? 'primary' : 'ghost'} sx-btn" href="${c.demo}">${esc(c.demoL)}</a>${guide}`
        : `<a class="btn ghost sx-btn" href="pilote.html#rdv">${esc(c.demoL)}</a>`;
      return `<article class="sx-col${pr ? ' pr' : ''}" id="${o.k}">
        <div class="sx-hd"><span class="sx-nm">${n + 1} · ${o.nom}</span>${badge(c.statut, c.statutL)}</div>
        <h2>${pr ? 'Anticiper, identifier, résoudre' : o.verbe}</h2><p class="sx-q">«&nbsp;${nb(c.question)}&nbsp;»</p>
        ${body}<p class="sx-base">${nb(c.base)}</p>${btn}</article>`;
    };
    document.title = `${s.nom} · VP Scan, VP Expert, VP Predict · Vella Partners`;
    $('sx-main').innerHTML = `
      <p class="sx-crumb"><a href="index.html">Accueil</a> / <a href="index.html#secteurs">Secteurs</a> / ${esc(s.nom)}</p>
      <header class="sx-hero"><p class="eyebrow">Secteur ${s.num} · ${esc(s.machines)}</p><h1>${esc(s.nom)}</h1>
        <p class="sx-lead">${nb(s.accroche)}</p><p class="sx-ex"><b>Exemples</b>${nb(s.exemple)}</p>
        <nav class="sx-secnav" aria-label="Changer de secteur">${keys.map(k => `<a href="${hub(k)}"${k === cur ? ' aria-current="page"' : ''}>${esc(S[k].court)}</a>`).join('')}</nav></header>
      <section class="sx-flow" aria-label="Les trois offres pour ce secteur">${O.map(col).join('')}</section>
      <div class="sx-loop"><span class="sx-lk">La boucle</span><p><b>VP Expert</b> guide l’analyse et la résolution du défaut constaté, sur toutes les ${esc(s.machines)}, connectées ou non. <b>VP Scan</b> chiffre les enjeux en amont quand les priorités restent à objectiver. <b>VP Predict</b>, en extension, anticipe la dérive sur les ${esc(s.machines)} connectées, l’identifie, puis ouvre les mêmes contrôles de VP Expert. Chaque essai tracé, validé par vos méthodes, enrichit la mémoire de l’atelier.</p></div>
      <section class="sx-res"><p class="eyebrow">Ressources du secteur</p><h2>Ce sur quoi nous nous appuyons</h2>
        <div class="sx-reslist">${s.ressources.map(r => `<a href="${r[1]}">${esc(r[0])}<span aria-hidden="true">→</span></a>`).join('')}</div>
        <div class="sx-next"><a href="${hub(prev)}">← Secteur précédent<b>${esc(S[prev].nom)}</b></a><a href="${hub(nxt)}">Secteur suivant →<b>${esc(S[nxt].nom)}</b></a></div></section>`;
    keep($('sx-main'));
  }

  /* 3. Barre de parcours sur les démonstrateurs */
  const file = (location.pathname.split('/').pop() || 'index.html');
  let here = null;
  for (const k of keys) for (const o of ['scan', 'expert', 'predict']) {
    const d = S[k][o].demo; if (d && d.split('?')[0] === file && !here) here = [k, o];
  }
  if (here && !cur) {
    const [k, o0] = here, s = S[k];
    const bar = document.createElement('nav');
    bar.className = 'sx-bar'; bar.setAttribute('aria-label', 'Parcours du secteur');
    bar.innerHTML = `<div class="sx-bw"><a class="sx-bs" href="${hub(k)}">${esc(s.nom)}</a><span class="sx-sep" aria-hidden="true">›</span>${['scan', 'expert', 'predict'].map((o, n) => {
      const c = s[o], t = `<span class="sx-bn">${n + 1}</span><b>${ON[o]}</b><em>${VB[o]}</em>`;
      if (o === o0) return `<span class="sx-bo on" aria-current="page">${t}</span>`;
      return c.demo ? `<a class="sx-bo" href="${c.demo}">${t}</a>` : `<span class="sx-bo off" title="${esc(c.statutL)}">${t}<small>à construire</small></span>`;
    }).join('')}</div>`;
    keep(bar);
    const h = document.querySelector('header.top') || document.querySelector('header');
    if (h && h.parentNode) h.parentNode.insertBefore(bar, h.nextSibling); else document.body.prepend(bar);
  }
})();
