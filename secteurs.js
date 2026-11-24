/* Navigation par secteur. Recentrage du 24 novembre 2026 : un pilote en trois temps
   (étape 1 VP Scan, VP Expert, le dossier du moule) ; les secteurs masqués (masque: true) n'apparaissent dans aucun menu.
   1. Tuiles des secteurs et tableau d'avancement (#sx-tiles, #sx-mx), si la page les contient.
   2. Pages secteur (body[data-sx]) : les trois temps du pilote pour un secteur.
   3. Démonstrateurs : barre « secteur › temps » sous l'en-tête, pour savoir où l'on est et passer au temps suivant.
      Sur les simulateurs de dérive, la barre indique « démonstration technique » : ce n'est pas une offre. */
(function () {
  const S = window.VP_SECTEURS, O = window.VP_OFFRES;
  if (!S || !O) return;
  const all = Object.keys(S);
  const keys = all.filter(k => !S[k].masque);
  const T = ['scan', 'expert', 'pilote'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nb = s => esc(s).replace(/ ([?:;!»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;');
  const hub = k => `secteur-${k}.html`;
  const ON = { scan: 'VP Scan', expert: 'VP Expert', pilote: 'Le pilote' };
  const VB = { scan: 'Étape 1 · chiffrer', expert: 'Résoudre et prouver', pilote: 'Dossier du moule' };
  /* Un secteur masqué garde sa page : elle s'affiche seule, sans renvoi vers les autres. */
  const tools = s => T.filter(o => s[o]);
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
        <ul class="sx-tl">${['expert', 'scan', 'pilote'].filter(o => s[o]).map(o => `<li><i class="sx-dot ${s[o].statut}"></i><b>${ON[o]}</b><span>${esc(s[o].statutL)}</span></li>`).join('')}</ul>
        <div class="sx-stat"><b>${esc(s.chiffre)}</b><span>${esc(s.chiffreL)}</span></div></a>`;
    }).join('');
    keep($('sx-tiles'));
  }
  if ($('sx-mx')) {
    $('sx-mx').innerHTML = keys.map(k => {
      const s = S[k];
      return `<tr><th scope="row"><a href="${hub(k)}">${esc(s.nom)}</a></th>${['expert', 'scan', 'pilote'].filter(o => s[o]).map(o => {
        const c = s[o];
        return `<td data-l="${ON[o]}">${badge(c.statut, c.statutL, c.demo)}</td>`;
      }).join('')}</tr>`;
    }).join('');
    keep($('sx-mx'));
  }

  /* 2. Page secteur */
  const cur = document.body.dataset.sx;
  if (cur && S[cur] && $('sx-main')) {
    const s = S[cur], vis = keys.indexOf(cur) > -1, i = keys.indexOf(cur);
    const prev = vis ? keys[(i + keys.length - 1) % keys.length] : null, nxt = vis ? keys[(i + 1) % keys.length] : null;
    const SIT = window.VP_SITUATIONS || [];
    const col = (o, n) => {
      const c = s[o.k]; if (!c) return '';
      const core = o.k === 'expert';
      const body = `<ul class="sx-ul">${(c.fait || []).map(f => `<li>${nb(f)}</li>`).join('')}</ul>` +
        (o.k === 'pilote' && SIT.length ? `<p class="sx-lbl">Quand le proposer</p><ol class="sx-pp">${SIT.map(x => `<li><b>${esc(x.t)}</b></li>`).join('')}</ol>` : '');
      const q = c.demo && c.demo.indexOf('?') > -1 ? '&' : '?';
      const guide = core && c.demo ? `<a class="btn ghost sx-btn" href="${c.demo}${q}demo=1">Démonstration guidée · 2 min</a><a class="btn ghost sx-btn" href="${c.demo}${q}app=1">Parcours téléphone</a>` : '';
      const btn = c.demo
        ? `<a class="btn ${core ? 'primary' : 'ghost'} sx-btn" href="${c.demo}">${esc(c.demoL)}</a>${guide}`
        : `<a class="btn ghost sx-btn" href="pilote.html#rdv">${esc(c.demoL)}</a>`;
      return `<article class="sx-col${core ? ' pr' : ''}" id="${o.k}">
        <div class="sx-hd"><span class="sx-nm">${n + 1} · ${esc(o.nom)}</span>${badge(c.statut, c.statutL)}</div>
        <h2>${esc(o.verbe)}</h2><p class="sx-q">«&nbsp;${nb(c.question)}&nbsp;»</p>
        ${body}<p class="sx-base">${nb(c.base)}</p>${btn}</article>`;
    };
    document.title = vis ? `${s.nom} · Pilote dossier de preuve · Vella Partners` : `${s.nom} · Vella Partners`;
    const others = vis && keys.length > 1;
    $('sx-main').innerHTML = `
      <p class="sx-crumb"><a href="index.html">Accueil</a> / <a href="index.html#secteurs">Secteurs</a> / ${esc(s.nom)}</p>
      <header class="sx-hero"><p class="eyebrow">Secteur ${s.num} · ${esc(s.machines)}</p><h1>${esc(s.nom)}</h1>
        <p class="sx-lead">${nb(s.accroche)}</p><p class="sx-ex"><b>Exemples</b>${nb(s.exemple)}</p>
        ${others ? `<nav class="sx-secnav" aria-label="Changer de secteur">${keys.map(k => `<a href="${hub(k)}"${k === cur ? ' aria-current="page"' : ''}>${esc(S[k].court)}</a>`).join('')}</nav>` : ''}</header>
      <section class="sx-flow" aria-label="${vis ? 'Le pilote en trois temps pour ce secteur' : 'Démonstrateurs de ce secteur'}">${O.map(col).join('')}</section>
      ${vis ? '' : '<p class="sx-base"><b>Secteur non proposé aujourd’hui.</b> Référentiel en construction, à valider avec un expert du métier avant tout pilote. Les démonstrateurs ci-dessus restent consultables.</p>'}
      <div class="sx-loop"${vis ? '' : ' hidden'}><span class="sx-lk">Le dossier de preuve</span><p>Pour chaque moule, ce qui a été constaté, essayé et validé. <b>L’étape 1 (VP Scan)</b> chiffre les pertes et désigne le moule et les défauts du pilote. <b>VP Expert</b> guide l’analyse et la résolution du défaut constaté, sur toutes les ${esc(s.machines)}, sans connexion machine. Chaque cas, clos par le régleur puis validé par vos méthodes ou votre qualité, rejoint <b>le dossier du moule</b>, qui le suit d’une presse, d’une équipe ou d’un site à l’autre. L’outil propose, vos équipes décident.</p></div>
      <section class="sx-res"><p class="eyebrow">Ressources du secteur</p><h2>Ce sur quoi nous nous appuyons</h2>
        <div class="sx-reslist">${s.ressources.map(r => `<a href="${r[1]}">${esc(r[0])}<span aria-hidden="true">→</span></a>`).join('')}</div>
        ${others ? `<div class="sx-next"><a href="${hub(prev)}">← Secteur précédent<b>${esc(S[prev].nom)}</b></a><a href="${hub(nxt)}">Secteur suivant →<b>${esc(S[nxt].nom)}</b></a></div>` : ''}</section>`;
    keep($('sx-main'));
  }

  /* 3. Barre de parcours sur les démonstrateurs */
  const file = (location.pathname.split('/').pop() || 'index.html');
  let here = null;
  for (const k of all) for (const o of ['scan', 'expert', 'pilote', 'predict']) {
    const c = S[k][o], d = c && c.demo; if (d && d.split('?')[0] === file && !here) here = [k, o];
  }
  /* pilote.html sert aux deux secteurs : le secteur vient de l'adresse (?secteur=caoutchouc) ou du choix mémorisé. */
  if (here && here[1] === 'pilote') {
    const q = new URLSearchParams(location.search).get('secteur'), mem = document.documentElement.getAttribute('data-sec');
    const k = q && S[q] ? q : (mem && S[mem] && S[mem].pilote ? mem : null);
    here = k ? [k, 'pilote'] : null;
  }
  if (here && !cur) {
    const [k, o0] = here, s = S[k], vis = keys.indexOf(k) > -1;
    const bar = document.createElement('nav');
    bar.className = 'sx-bar'; bar.setAttribute('aria-label', 'Parcours du secteur');
    const steps = tools(s).map((o, n) => {
      const c = s[o], t = `<span class="sx-bn">${n + 1}</span><b>${ON[o]}</b><em>${VB[o]}</em>`;
      if (o === o0) return `<span class="sx-bo on" aria-current="page">${t}</span>`;
      return c.demo ? `<a class="sx-bo" href="${c.demo}">${t}</a>` : `<span class="sx-bo off" title="${esc(c.statutL)}">${t}</span>`;
    }).join('');
    const tech = o0 === 'predict' ? `<span class="sx-bo on" aria-current="page"><b>Démonstration technique</b><em>surveillance d’une dérive · hors pilote</em></span>` : '';
    bar.innerHTML = `<div class="sx-bw">${vis ? `<a class="sx-bs" href="${hub(k)}">${esc(s.nom)}</a>` : `<span class="sx-bs">${esc(s.nom)}</span>`}<span class="sx-sep" aria-hidden="true">›</span>${tech}${steps}</div>`;
    keep(bar);
    const h = document.querySelector('header.top') || document.querySelector('header');
    if (h && h.parentNode) h.parentNode.insertBefore(bar, h.nextSibling); else document.body.prepend(bar);
  }
})();
