/* Rejeu de cycles réels dans les simulateurs VP Predict (injection plastique, décolletage).
   Les mesures sont rejouées dans l'ordre, sans aucune dérive ajoutée. Les règles d'alerte sont celles du simulateur.
   À chaque alerte : identification (mesure, règle, valeur, référence), ce qui a bougé en même temps,
   pistes VP Expert classées (illustratives), choix du régleur, puis comparaison avec le journal de l'essai
   et avec l'effet mesuré du changement suivant. Le jeu de données ne contient pas de cause validée. */
(function () {
  const host = document.getElementById('rr');
  if (!host) return;
  const KIND = host.dataset.rr;

  const PL_PISTES = {
    temp: ['Température matière (fourreau)', 'Contrôler la consigne et la régulation des zones du fourreau ; une matière plus chaude remplit davantage et alourdit la pièce.'],
    vitesse: ['Vitesse d’injection et commutation', 'Contrôler le profil de vitesse et le point de commutation ; le temps d’injection a changé.'],
    pression: ['Pression et viscosité matière', 'Contrôler la pression à la commutation et l’état de la matière (lot, humidité).'],
    matelas: ['Matelas et clapet anti-retour', 'Contrôler la stabilité du matelas et l’étanchéité du clapet.'],
    dosage: ['Dosage et contre-pression', 'Contrôler le temps de dosage, la contre-pression et l’alimentation matière.'],
    moule: ['Thermorégulation du moule', 'Contrôler les débits et températures des circuits du moule.'],
    redem: ['Redémarrage et mise en température', 'Après un arrêt, attendre la stabilisation thermique avant de juger les pièces.'],
    huile: ['Température de l’huile hydraulique', 'Contrôler le refroidissement de la centrale hydraulique.']
  };
  const PL_VAR = { zylinderheizzone_1: 'temp', zylinderheizzone_4: 'temp', zylinderheizzone_8: 'temp', einspritzzeit: 'vitesse', umschaltvolumen: 'vitesse', maximaler_spritzdruck: 'pression', umschaltspritzdruck: 'pression', massepolster: 'matelas', dosierzeit: 'dosage', staudruck_ist: 'dosage', werkzeugheizkreis_1: 'moule', oeil_temperatur_ist: 'huile', cycle_time: 'redem' };
  const DC_PISTES = {
    usure: ['Usure de la plaquette de finition', 'Compenser l’usure en correcteur d’outil, ou changer la plaquette si la correction cumulée dépasse la limite de l’atelier.'],
    thermique: ['Mise en température après un arrêt', 'Après un arrêt, la broche et la barre se dilatent : surveiller les premières pièces avant de corriger.'],
    neuve: ['Plaquette neuve, correction à reprendre', 'Après un changement de plaquette, contrôler la correction d’outil et le rodage des premières pièces.'],
    serrage: ['Serrage et guidage de la barre', 'Contrôler la pince, le canon de guidage et l’embarreur.'],
    butee: ['Butée et tronçonnage', 'Contrôler la butée barre et l’usure de l’outil de tronçonnage.']
  };
  const TAGS = [[/température/i, 'temp'], [/vitesse/i, 'vitesse'], [/redémarrage/i, 'redem'], [/plaquette/i, 'outil'], [/fileteuse/i, 'outil'], [/début de journée/i, 'thermique']];
  const MATCH = { temp: ['temp'], vitesse: ['vitesse'], redem: ['redem'], usure: ['outil'], neuve: ['outil'], thermique: ['thermique'] };

  const CFG = {
    plastique: {
      sets: { kassel1: 'Boîtier PA6 GF30 · 1 159 cycles', kassel3: 'Bac empilable PA6 GF30 · 1 320 cycles' },
      file: 'banc-data-kassel.js?v=1', refN: 40, warm: 20, recent: 60, unitL: 'Cycle', machine: 'Presse Arburg 520E',
      src: 'Bogedale, Doerfel, Schrodt, Heim, Université de Kassel, <a href="https://doi.org/10.3390/polym15040978" target="_blank" rel="noopener">Polymers 2023</a> · données <a href="https://github.com/sc4t1m/scatimdata" target="_blank" rel="noopener">scatimdata</a>, licence CC BY 4.0. Cycles de redémarrage à temps nul retirés ; ordre conservé.',
      watch: k => ['weight', 'distanceA', 'distanceB'].includes(k),
      journal: 'Le journal de l’essai décrit des changements de consigne volontaires (température, vitesse d’injection) et des redémarrages.',
      expert: 'enquete.html'
    },
    decolletage: {
      sets: { cipdmd: 'Tiges de vérin inox · 607 pièces' },
      file: 'banc-data-cipdmd.js?v=1', refN: 12, warm: 0, recent: 15, unitL: 'Pièce', machine: 'Tour Index C65',
      src: 'TU Darmstadt, PTW, <a href="https://zenodo.org/records/8420132" target="_blank" rel="noopener">CiP-DMD, Procedia CIRP 2023</a>. Article sous licence CC BY 4.0 ; licence des données non précisée par le dépôt, réutilisation à confirmer auprès des auteurs. Pièces mesurées et horodatées uniquement.',
      watch: k => ['diam_um', 'coaxiality', 'length'].includes(k),
      journal: 'Le journal de production indique les changements de plaquette, de fileteuse et les reprises de début de journée.',
      expert: 'enquete-decolletage.html'
    }
  }[KIND];
  if (!CFG) return;

  const LAMBDA = .2, L = 3, WIN = 120, NFC = {}, nf = d => { const f = NFC[d] || (NFC[d] = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })); return x => f.format(x); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nb = s => String(s).replace(/ ([?:;!%])/g, '\u00a0$1');
  let D, C = {}, SEG, M, W, setId = Object.keys(CFG.sets)[0], S, timer = null, speed = 1, HIST = [];

  host.innerHTML = `
  <div class="rr-head"><div><p class="eyebrow">VP Predict · cycles réels</p><h2>Une dérive réelle, rejouée dans l’ordre</h2>
    <p class="rr-lead">Chaque point est un ${CFG.unitL.toLowerCase()} réel, rejoué sans dérive ajoutée. Quand une règle se déclenche, vous identifiez la dérive, choisissez une piste VP Expert, puis comparez avec le journal de l’essai.</p></div>
    <p class="rr-badge">Dérive réelle · résolution proposée à vérifier</p></div>
  <div class="rr-bar">
    <label class="rr-sel">Jeu de données <select id="rr-set">${Object.entries(CFG.sets).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
    <span class="rr-st" id="rr-st"><i></i><span>Chargement des cycles…</span></span>
    <span class="rr-cy">${CFG.unitL} <b id="rr-cy">–</b></span>
    <div class="rr-ctl"><button type="button" class="btn ghost sm" id="rr-play">Lecture</button>
      <div class="speed" role="group" aria-label="Vitesse">${[1, 5, 20].map(v => `<button type="button" data-rv="${v}" aria-pressed="${v === 1}">×${v}</button>`).join('')}</div>
      <button type="button" class="btn primary sm" id="rr-next">Aller à la prochaine alerte</button>
      <button type="button" class="btn ghost sm" id="rr-reset">Recommencer</button></div>
  </div>
  <div class="rr-grid">
    <aside class="rr-tiles" id="rr-tiles" aria-label="Mesures suivies"></aside>
    <div class="rr-chart"><div class="rr-ch"><h3 id="rr-ct"></h3><p id="rr-cs"></p></div>
      <svg id="rr-svg" viewBox="0 0 720 300" role="img" aria-label="Courbe de la mesure choisie"></svg>
      <ul class="legend"><li><i class="l-ref"></i>Référence</li><li><i class="l-tol"></i>Limite</li><li><i class="l-ew"></i>Tendance lissée</li><li><i class="rr-l-seg"></i>Changement du journal</li></ul></div>
    <div class="rr-side" id="rr-side" aria-live="polite"></div>
  </div>
  <section class="rr-hist"><h3>Dérives réelles traitées</h3>
    <div class="tw"><table><thead><tr><th>${CFG.unitL}</th><th>Dérive identifiée</th><th>Piste retenue</th><th>Journal de l’essai</th><th>Concordance</th></tr></thead><tbody id="rr-hist"><tr><td colspan="5" class="empty">Aucune dérive traitée pour l’instant.</td></tr></tbody></table></div>
    <p class="legal"><b>Source.</b> ${CFG.src}</p>
    <p class="legal">${nb(CFG.journal)} Les pistes et leur ordre sont illustratifs, issus du référentiel de démonstration et non validés pour cette machine. Le journal décrit ce qui a été fait, pas une cause démontrée. Un rejeu n’est pas un gain client.</p>
  </section>`;
  const $ = id => document.getElementById(id);

  function load(cb) {
    if (window.VP_BANC && window.VP_BANC[setId]) return cb();
    const s = document.createElement('script'); s.src = CFG.file; s.onload = cb;
    s.onerror = () => { $('rr-st').querySelector('span').textContent = 'Données indisponibles'; };
    document.head.appendChild(s);
  }
  function init() {
    D = window.VP_BANC[setId]; C = {};
    D.cols.forEach((c, i) => C[c.k] = i);
    const si = D.cols.findIndex(c => c.t === 'seg'); SEG = D.rows.map(r => r[si]);
    M = D.cols.filter(c => c.t === 'meas').map(c => {
      const i = C[c.k], vals = D.rows.map(r => r[i]).filter(v => typeof v === 'number');
      const step = Math.min(...vals.slice(0, 200).map((v, j, a) => j ? Math.abs(v - a[j - 1]) : Infinity).filter(x => x > 0));
      const dec = Math.min(4, Math.max(0, Math.ceil(-Math.log10(step || 1))));
      return { ...c, i, dec, w: CFG.watch(c.k), tol: D.tolerances && D.tolerances[c.k] };
    });
    W = M.filter(m => m.w);
    reset();
  }
  function reset() {
    stop();
    S = { i: CFG.warm, ref: {}, refFrom: CFG.warm, ew: {}, alert: null, focus: W[0].k, cool: {}, step: 'run', pick: null };
    computeRef(CFG.warm);
    S.i = CFG.warm + CFG.refN;
    M.forEach(m => { let e = null; for (let j = CFG.warm; j < S.i; j++) { const x = v(j, m); if (x == null) continue; e = e == null ? x : LAMBDA * x + (1 - LAMBDA) * e; } S.ew[m.k] = e; });
    HIST.length = 0; renderHist(); render();
  }
  const v = (j, m) => { const x = D.rows[j] && D.rows[j][m.i]; return typeof x === 'number' ? x : null; };
  function computeRef(from) {
    M.forEach(m => {
      const xs = []; for (let j = from; j < Math.min(D.rows.length, from + CFG.refN); j++) { const x = v(j, m); if (x != null) xs.push(x); }
      const mu = xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
      const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / Math.max(1, xs.length - 1));
      S.ref[m.k] = { m: mu, sd: Math.max(sd, Math.abs(mu) * 2e-4, 10 ** -m.dec), from, to: from + CFG.refN - 1 };
    });
    S.refFrom = from;
  }
  function limits(m) {
    const r = S.ref[m.k];
    if (m.tol) return { lo: m.tol[0], hi: m.tol[1], c: r.m, sd: r.sd, kind: 'Tolérance' };
    return { lo: r.m - 3 * r.sd, hi: r.m + 3 * r.sd, c: r.m, sd: r.sd, kind: 'Référence ± 3 σ' };
  }
  function check(j) {
    for (const m of W) {
      if ((S.cool[m.k] || 0) > j) continue;
      const x = v(j, m); if (x == null) continue;
      const b = limits(m), r = S.ref[m.k], e = S.ew[m.k], lim = L * r.sd * Math.sqrt(LAMBDA / (2 - LAMBDA));
      let why = null, rule = null;
      if (x > b.hi || x < b.lo) { why = m.tol ? 'Hors tolérance' : 'Hors limite ± 3 σ'; rule = 'seuil'; }
      else {
        const last = []; for (let k = j; k >= 0 && last.length < 7; k--) { const y = v(k, m); if (y != null) last.push(y); }
        if (last.length === 7 && (last.every(y => y > r.m + r.sd) || last.every(y => y < r.m - r.sd))) { why = '7 valeurs de suite du même côté de la référence'; rule = 'cote'; }
        else if (e != null && Math.abs(e - r.m) > lim) { why = 'Tendance lissée hors zone (EWMA)'; rule = 'ewma'; }
      }
      if (why) return { m, x, why, rule, j, dir: x > r.m ? 'haut' : 'bas' };
    }
    return null;
  }
  function advance() {
    if (S.i >= D.rows.length) { stop(); S.step = 'end'; render(); return false; }
    const j = S.i++;
    M.forEach(m => { const x = v(j, m); if (x != null) S.ew[m.k] = S.ew[m.k] == null ? x : LAMBDA * x + (1 - LAMBDA) * S.ew[m.k]; });
    if (S.step === 'reref') { if (j >= S.refFrom + CFG.refN - 1) { computeRef(S.refFrom); M.forEach(m => S.ew[m.k] = S.ref[m.k].m); S.step = 'run'; } return true; }
    const a = check(j);
    if (a) { S.alert = a; S.focus = a.m.k; S.step = 'alert'; S.pick = null; stop(); analyse(a); return false; }
    return true;
  }
  function analyse(a) {
    const j = a.j, n = 10;
    const z = M.filter(m => !m.w).map(m => {
      const xs = []; for (let k = Math.max(S.refFrom, j - n + 1); k <= j; k++) { const x = v(k, m); if (x != null) xs.push(x); }
      const mu = xs.reduce((s, x) => s + x, 0) / (xs.length || 1), r = S.ref[m.k];
      return { m, d: mu - r.m, z: (mu - r.m) / r.sd };
    }).filter(o => isFinite(o.z)).sort((p, q) => Math.abs(q.z) - Math.abs(p.z));
    a.moved = z.slice(0, 3).filter(o => Math.abs(o.z) >= 2);
    let P = [];
    if (KIND === 'plastique') {
      const seen = new Set();
      a.moved.forEach(o => { const t = PL_VAR[o.m.k]; if (t && !seen.has(t)) { seen.add(t); P.push({ t, why: `${o.m.l} : ${o.d > 0 ? '+' : ''}${nf(o.m.dec)(o.d)} ${o.m.u} par rapport à la référence` }); } });
      const ps = periodStart(j), since = j - ps;
      if (since <= CFG.recent && /redémarrage/i.test(SEG[j]) && !seen.has('redem')) { seen.add('redem'); P.unshift({ t: 'redem', why: `Redémarrage il y a ${since} cycles` }); }
      ['temp', 'vitesse', 'matelas', 'redem'].forEach(t => { if (!seen.has(t)) { seen.add(t); P.push({ t, why: 'Piste générique du référentiel' }); } });
    } else {
      const ps = periodStart(j), since = j - ps, gap = gapMin(j);
      const sl = slope(ps, j, a.m);
      const sc = { usure: since > 15 && Math.sign(sl) === Math.sign(a.x - S.ref[a.m.k].m) ? 3 : 1, thermique: gap > 30 ? 3.5 : .5, neuve: since <= 6 ? 3 : .2, serrage: a.m.k === 'coaxiality' ? 3 : .3, butee: a.m.k === 'length' ? 3 : .2 };
      const why = { usure: `${since} pièces depuis le début de la période, pente ${nf(1)(sl * 10)} ${a.m.u} pour 10 pièces`, thermique: gap > 30 ? `Arrêt de ${Math.round(gap)} min avant les dernières pièces` : 'Pas d’arrêt récent', neuve: `${since} pièce${since > 1 ? 's' : ''} depuis le début de la période`, serrage: 'Piste générique du référentiel', butee: 'Piste générique du référentiel' };
      P = Object.keys(sc).sort((p, q) => sc[q] - sc[p]).map(t => ({ t, why: why[t] }));
    }
    a.pistes = P.slice(0, 4);
    const cur = SEG[j]; let nx = j + 1; while (nx < SEG.length && SEG[nx] === cur) nx++;
    a.cur = cur; a.next = nx < SEG.length ? SEG[nx] : null; a.nextAt = nx;
    const before = [], after = [];
    for (let k = Math.max(j - 9, 0); k <= j; k++) { const x = v(k, a.m); if (x != null) before.push(x); }
    for (let k = nx; k < Math.min(SEG.length, nx + 10); k++) { const x = v(k, a.m); if (x != null) after.push(x); }
    a.before = before.length ? before.reduce((s, x) => s + x, 0) / before.length : null;
    a.after = after.length ? after.reduce((s, x) => s + x, 0) / after.length : null;
  }
  function periodStart(j) { let k = j; while (k > 0 && SEG[k - 1] === SEG[j]) k--; return k; }
  function gapMin(j) {
    if (C.h == null) return 0; let g = 0;
    for (let k = Math.max(1, j - 3); k <= j; k++) { const t1 = pd(D.rows[k - 1][C.h]), t2 = pd(D.rows[k][C.h]); if (t1 && t2 && SEG[k] === SEG[j]) g = Math.max(g, (t2 - t1) / 6e4); }
    return g;
  }
  function pd(s) { const m = /^(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d):(\d\d)$/.exec(s || ''); return m ? new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5], +m[6]).getTime() : null; }
  function slope(a, b, m) {
    const xs = [], ys = []; for (let k = a; k <= b; k++) { const y = v(k, m); if (y != null) { xs.push(k); ys.push(y); } }
    if (xs.length < 3) return 0; const mx = xs.reduce((s, x) => s + x, 0) / xs.length, my = ys.reduce((s, y) => s + y, 0) / ys.length;
    let n = 0, d = 0; xs.forEach((x, i) => { n += (x - mx) * (ys[i] - my); d += (x - mx) ** 2; }); return d ? n / d : 0;
  }
  const tagsOf = s => TAGS.filter(([re]) => re.test(s || '')).map(([, t]) => t);
  /* Changements documentés à proximité de l'alerte : début de la période en cours (si récent),
     et en décolletage, changement d'outil suivant le même jour. */
  function events(a) {
    const since = a.j - periodStart(a.j), E = [];
    if (since <= CFG.recent) tagsOf(a.cur).filter(t => !(t === 'thermique' && since > 15)).forEach(t => E.push(t));
    if (KIND === 'decolletage' && a.next && a.cur.split(' · ')[0] === a.next.split(' · ')[0]) tagsOf(a.next).filter(t => t === 'outil').forEach(t => E.push(t));
    a.since = since; return [...new Set(E)];
  }
  function concord(a, t) {
    const E = events(a);
    if (!E.length) return ['na', 'Aucun changement documenté à ce moment : cause non tranchée'];
    return (MATCH[t] || []).some(x => E.includes(x)) ? ['ok', 'Concorde avec le journal'] : ['ko', 'Le journal documente un autre changement'];
  }
  const PI = t => (KIND === 'plastique' ? PL_PISTES : DC_PISTES)[t];
  const fmt = (m, x) => x == null ? '–' : nf(m.dec)(x) + (m.u ? '\u00a0' + m.u : '');

  function play() { if (timer || S.step === 'alert' || S.step === 'end') return; $('rr-play').textContent = 'Pause'; tickLoop(); }
  function tickLoop() { timer = setTimeout(() => { timer = null; let ok = true; for (let k = 0; k < speed && ok; k++) ok = advance(); render(); if (ok) { $('rr-play').textContent = 'Pause'; tickLoop(); } }, 220); }
  function stop() { if (timer) clearTimeout(timer); timer = null; const b = $('rr-play'); if (b) b.textContent = 'Lecture'; }
  function next() { stop(); let ok = true, n = 0; while (ok && n < 5000) { ok = advance(); n++; } render(); }

  function render() {
    if (!D) return;
    const j = Math.max(0, S.i - 1), a = S.alert;
    $('rr-cy').textContent = String(D.rows[j][0]).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const st = $('rr-st'); let c = 'ok', t = 'Mesures dans la référence';
    if (S.step === 'alert') { c = a.rule === 'seuil' ? 'bad' : 'warn'; t = a.rule === 'seuil' ? 'Alerte : limite franchie' : 'Alerte préventive'; }
    else if (S.step === 'reref') { c = 'off'; t = 'Calcul de la nouvelle référence'; }
    else if (S.step === 'end') { c = 'off'; t = 'Fin du jeu de données'; }
    st.className = 'rr-st ' + c; st.querySelector('span').textContent = t;
    $('rr-tiles').innerHTML = M.map(m => {
      const x = v(j, m), b = limits(m), out = x != null && m.w && (x > b.hi || x < b.lo);
      return `<button type="button" class="rr-tile${S.focus === m.k ? ' sel' : ''}${a && a.m.k === m.k ? ' al' : ''}${out ? ' out' : ''}" data-f="${m.k}" aria-pressed="${S.focus === m.k}"><span>${m.w ? '<i class="rr-q">Qualité</i>' : ''}${esc(m.l)}</span><b>${fmt(m, x)}</b></button>`;
    }).join('');
    $('rr-tiles').querySelectorAll('[data-f]').forEach(b => b.onclick = () => { S.focus = b.dataset.f; render(); });
    chart(); side();
  }
  function chart() {
    const m = M.find(x => x.k === S.focus), to = S.i, from = Math.max(0, to - WIN), b = limits(m), r = S.ref[m.k];
    const pts = []; for (let k = from; k < to; k++) pts.push([k, v(k, m)]);
    const ys = pts.map(p => p[1]).filter(x => x != null).concat(m.w ? [b.lo, b.hi] : [r.m - 3 * r.sd, r.m + 3 * r.sd]);
    let lo = Math.min(...ys), hi = Math.max(...ys); const pad = (hi - lo) * .12 || 1; lo -= pad; hi += pad;
    const X = k => 46 + (k - from) / Math.max(1, WIN - 1) * 660, Y = y => 280 - (y - lo) / (hi - lo) * 262;
    let g = '';
    for (let q = 0; q <= 4; q++) { const y = lo + (hi - lo) * q / 4; g += `<line x1="46" x2="706" y1="${Y(y)}" y2="${Y(y)}" class="rr-grid-l"/><text x="40" y="${Y(y) + 4}" class="rr-ax" text-anchor="end">${nf(m.dec)(y)}</text>`; }
    for (let k = from + 1; k < to; k++) if (SEG[k] !== SEG[k - 1]) g += `<line x1="${X(k)}" x2="${X(k)}" y1="14" y2="282" class="rr-seg"/><text x="${X(k) + 4}" y="26" class="rr-ax">${esc(String(SEG[k]).split(' · ')[0])}</text>`;
    if (m.w || true) {
      g += `<line x1="46" x2="706" y1="${Y(b.hi)}" y2="${Y(b.hi)}" class="rr-tol"/><line x1="46" x2="706" y1="${Y(b.lo)}" y2="${Y(b.lo)}" class="rr-tol"/>`;
      g += `<line x1="46" x2="706" y1="${Y(r.m)}" y2="${Y(r.m)}" class="rr-ref"/>`;
    }
    const line = pts.filter(p => p[1] != null).map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
    g += `<polyline points="${line}" class="rr-line"/>`;
    let e = null; const ew = []; for (let k = from; k < to; k++) { const x = v(k, m); if (x == null) continue; e = e == null ? x : LAMBDA * x + (1 - LAMBDA) * e; ew.push(`${X(k).toFixed(1)},${Y(e).toFixed(1)}`); }
    g += `<polyline points="${ew.join(' ')}" class="rr-ew"/>`;
    if (S.alert && S.alert.m.k === m.k && S.alert.j >= from) g += `<circle cx="${X(S.alert.j)}" cy="${Y(S.alert.x)}" r="6" class="rr-al"/>`;
    $('rr-svg').innerHTML = g;
    $('rr-ct').textContent = `${m.l}${m.u ? ' (' + m.u + ')' : ''}`;
    $('rr-cs').textContent = `${CFG.machine} · ${CFG.sets[setId]} · référence : ${CFG.unitL.toLowerCase()}s ${D.rows[r.from][0]} à ${D.rows[Math.min(D.rows.length - 1, r.to)][0]}${m.tol ? ' · limites : tolérance du plan' : ' · limites : référence ± 3 σ, pas une tolérance produit'}`;
  }
  function side() {
    const el = $('rr-side'), a = S.alert, set = h => { if (el._h === h) return false; el._h = h; el.innerHTML = h; return true; };
    if (S.step === 'end') { set(`<div class="pane"><h3>Fin du jeu de données</h3><p class="sl">${HIST.length} dérive${HIST.length > 1 ? 's' : ''} traitée${HIST.length > 1 ? 's' : ''}. Recommencez ou choisissez un autre jeu.</p></div>`); return; }
    if (S.step !== 'alert') {
      set(`<div class="pane"><h3>${S.step === 'reref' ? 'Nouvelle référence en cours' : 'Surveillance en cours'}</h3><p class="sl">${S.step === 'reref' ? `La référence est recalculée sur les ${CFG.refN} prochains ${CFG.unitL.toLowerCase()}s, sans alerte pendant ce temps.` : `Les mesures qualité sont comparées à leur référence ${CFG.unitL.toLowerCase()} après ${CFG.unitL.toLowerCase()}. Lancez la lecture, ou allez directement à la prochaine alerte.`}</p>
        <p class="sl"><b>Rien n’est ajouté aux données.</b> Les dérives que vous verrez sont celles de l’essai réel.</p></div>`);
      return;
    }
    const m = a.m, r = S.ref[m.k], picked = S.pick != null;
    if (!set(`<div class="pane al"><p class="rr-step">1 · Anticiper</p><h3>${esc(a.why)}</h3>
      <dl class="rr-dl"><dt>Mesure</dt><dd>${esc(m.l)}</dd><dt>Valeur</dt><dd>${fmt(m, a.x)}</dd><dt>Référence</dt><dd>${fmt(m, r.m)} · σ ${nf(m.dec)(r.sd)}</dd><dt>${CFG.unitL}</dt><dd>${esc(D.rows[a.j][0])}</dd></dl></div>
    <div class="pane"><p class="rr-step">2 · Identifier</p><h3>Ce qui a bougé en même temps</h3>
      ${KIND === 'plastique' ? (a.moved.length ? `<ul class="rr-mv">${a.moved.map(o => `<li><b>${esc(o.m.l)}</b><span>${o.d > 0 ? '+' : ''}${fmt(o.m, o.d)} · ${nf(1)(o.z)} σ</span></li>`).join('')}</ul>` : '<p class="sl">Aucun paramètre process ne s’écarte de plus de 2 σ sur les 10 derniers cycles.</p>') : `<p class="sl">Ce jeu ne contient pas de paramètres de la commande numérique : le contexte (pièces depuis le début de la période, arrêts, pente) sert à classer les pistes.</p>`}
    </div>
    <div class="pane"><p class="rr-step">3 · Résoudre</p><h3>Pistes VP Expert, dans l’ordre</h3>
      <div class="rr-pistes" role="radiogroup" aria-label="Piste retenue">${a.pistes.map((p, i) => `<label class="rr-p${S.pick === i ? ' on' : ''}"><input type="radio" name="rr-p" value="${i}"${S.pick === i ? ' checked' : ''}${picked ? ' disabled' : ''}><span><b>${i + 1}. ${esc(PI(p.t)[0])}</b><small>${esc(nb(p.why))}</small><em>${esc(nb(PI(p.t)[1]))}</em></span></label>`).join('')}</div>
      ${picked ? reveal(a) : `<button type="button" class="btn primary sm" id="rr-cmp" disabled>Comparer au journal de l’essai</button><p class="sl rr-n">Choisissez d’abord la piste que vous contrôleriez, le journal s’affiche ensuite.</p>`}
    </div>`)) return;
    el.querySelectorAll('input[name=rr-p]').forEach(i => i.onchange = () => { $('rr-cmp').disabled = false; S.tmp = +i.value; });
    const cmp = $('rr-cmp'); if (cmp) cmp.onclick = () => { S.pick = S.tmp; const p = a.pistes[S.pick], c = concord(a, p.t); a.conc = c; HIST.unshift({ at: D.rows[a.j][0], d: `${m.l} ${a.dir === 'haut' ? 'en hausse' : 'en baisse'} · ${a.why}`, p: PI(p.t)[0], j: a.cur + (KIND === 'decolletage' && a.next ? ' → ' + a.next : ''), c }); renderHist(); side(); };
    const nr = $('rr-nr'); if (nr) nr.onclick = () => { S.alert = null; S.step = 'reref'; S.refFrom = S.i; render(); play(); };
    const ig = $('rr-ig'); if (ig) ig.onclick = () => { S.cool[a.m.k] = S.i + 30; S.alert = null; S.step = 'run'; render(); play(); };
    if (window.vpTips) try { window.vpTips(el); } catch (e) {}
  }
  function reveal(a) {
    const m = a.m, c = a.conc;
    const eff = a.next && a.before != null && a.after != null ? `<p class="sl">Effet mesuré du changement suivant (${esc(a.next.split(' · ').slice(1).join(' · ') || a.next)}) : moyenne des 10 ${CFG.unitL.toLowerCase()}s avant ${fmt(m, a.before)}, des 10 suivants ${fmt(m, a.after)}.</p>` : `<p class="sl">Pas de changement suivant dans le journal.</p>`;
    return `<div class="rr-j"><p class="rr-k">Journal de l’essai</p><p><b>Période en cours :</b> ${esc(a.cur)} <span class="rr-since">(depuis ${a.since} ${CFG.unitL.toLowerCase()}s)</span></p>${a.next ? `<p><b>Changement suivant :</b> ${esc(a.next)}</p>` : ''}
      <p class="rr-c ${c[0]}">${c[1]}</p>${eff}
      <p class="sl rr-n">Le journal dit ce qui a été fait ; il ne démontre pas la cause. Sur une vraie presse ou machine, le régleur vérifie et valide.</p></div>
      <div class="rr-act"><button type="button" class="btn primary sm" id="rr-nr">Action faite : nouvelle référence</button><button type="button" class="btn ghost sm" id="rr-ig">Ignorer 30 ${CFG.unitL.toLowerCase()}s</button></div>`;
  }
  function renderHist() {
    const t = $('rr-hist');
    t.innerHTML = HIST.length ? HIST.map(h => `<tr><td>${esc(h.at)}</td><td>${esc(h.d)}</td><td>${esc(h.p)}</td><td>${esc(h.j)}</td><td><span class="rr-c ${h.c[0]}">${h.c[1]}</span></td></tr>`).join('') : `<tr><td colspan="5" class="empty">Aucune dérive traitée pour l’instant.</td></tr>`;
  }

  $('rr-play').onclick = () => timer ? stop() : play();
  $('rr-next').onclick = () => { if (S.step === 'alert') return; next(); };
  $('rr-reset').onclick = () => reset();
  host.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => { speed = +b.dataset.rv; host.querySelectorAll('[data-rv]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('rr-set').onchange = e => { setId = e.target.value; load(init); };
  /* Onglets « Dérive simulée / Cycles réels » */
  const tabs = document.querySelector('.rr-tabs');
  function setBase(b, push) {
    const real = b === 'reel';
    document.querySelectorAll('[data-base]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.base === b)));
    document.querySelectorAll('.rr-simonly').forEach(x => x.hidden = real);
    host.hidden = !real;
    if (real) { const pb = document.getElementById('play'); if (pb && /pause/i.test(pb.textContent)) pb.click(); if (!D) load(init); }
    else stop();
    if (push) try { const u = new URL(location.href); real ? u.searchParams.set('base', 'reel') : u.searchParams.delete('base'); history.replaceState(null, '', u); } catch (e) {}
  }
  if (tabs) tabs.querySelectorAll('[data-base]').forEach(b => b.onclick = () => setBase(b.dataset.base, true));
  setBase(new URLSearchParams(location.search).get('base') === 'reel' ? 'reel' : 'sim', false);
})();
