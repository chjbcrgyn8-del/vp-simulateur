(() => {
'use strict';
const D = window.VP, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = v => { if (v == null || String(v).trim() === '') return null; const n = Number(String(v).replace(/\s/g,'').replace(',','.')); return Number.isFinite(n) && n >= 0 ? n : NaN; };
const ok = n => n != null && !Number.isNaN(n);
const fmt = n => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n);
const money = n => ok(n) ? fmt(n) + ' €' : '—';
const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

/* ---------- Référentiel ---------- */
const MODES = [['acc','Connectée · données accessibles'],['verif','Connectée · accès à vérifier'],['non','Non connectée'],['?','Inconnue']];
const MODE_L = Object.fromEntries(MODES);
const SOURCES = ['MES','Excel','Papier','Observation'];
const DOC = [['recu','Reçu','c-ok'],['partiel','Partiel','c-mid'],['absent','Absent','c-bad'],['na','N.A.','c-na']];
const GR = [[1,'Réactive','c-bad'],[2,'Partielle','c-mid'],[3,'Préventive','c-ok'],[4,'N.A.','c-na']];
const GR_L = {0:'Non évalué',1:'Réactive',2:'Partiellement préventive',3:'Préventive',4:'Non applicable'};
const PREUVES = ['Mesuré','Estimé','Déclaratif'];
const STEPS = [
  ['mission','Mission','Cadrage et coûts'],
  ['parc','Parc & données','Presses, connexion, documents'],
  ['pertes','Pertes','Rebuts, arrêts, réglages'],
  ['terrain','Visite terrain','Grille, maturité, entretiens'],
  ['restitution','Restitution','Décision et rapport'],
];

/* ---------- État ---------- */
const blankPress = () => ({id:uid(),nom:'',mode:'?',source:'',defaut:'',note:'',preuve:'Estimé',mois:'',represent:false,rebutes:'',recup:'',hArret:'',hReglage:'',demarrage:'',coutH:'',coutPiece:'',nsp:{rebutes:false,hArret:false,hReglage:false}});
const blank = () => ({
  mission:{nbPresses:'',client:'',site:'',secteur:'Injection thermoplastique',consultant:'Henry Bernard',sponsor:'',dates:'',objective:'',perimetre:'',mois:'12',periode:'',represent:false,coutH:'',coutPiece:'',coutsValides:false},
  presses:[],
  donnees:Object.fromEntries(D.donnees.map(d => [d[0], ''])),
  grille:D.grille.map(() => ({d:0,note:''})),
  axes:Object.fromEntries(D.axes.map(a => [a[0], ''])),
  entretiens:Object.fromEntries(D.entretiens.map(e => [e[0], {fait:false,notes:''}])),
  rapport:{decision:'',justification:'',pistes:[0,1,2].map(() => ({titre:'',action:''})),
    route:[['Tout de suite (0–3 mois)'],['Fiabiliser les données'],['Étape suivante']].map(([h]) => ({horizon:h,action:'',qui:'',quand:''})),
    reserves:'',relu:false,reluPar:''}
});
let S = blank(), dirty = false, lastExport = '';
const get = p => p.split('.').reduce((o,k) => o?.[k], S);
function set(p, v){ const a = p.split('.'), k = a.pop(); let o = S; for (const x of a) o = o[x]; o[k] = v; dirty = true; saveBadge(); }

/* ---------- Composants ---------- */
const input = (p, ph = '', type = 'text', unit = '') => { const h = `<input type="${type==='number'?'text':type}" data-k="${p}" value="${esc(get(p))}" placeholder="${esc(ph)}"${type==='number'?' inputmode="decimal" autocomplete="off"':''}>`; return unit ? `<span class="unit">${h}<em>${unit}</em></span>` : h; };
const area = (p, ph = '', rows = 3) => `<textarea data-k="${p}" rows="${rows}" placeholder="${esc(ph)}">${esc(get(p))}</textarea>`;
const field = (l, h, hint = '', req = false, cls = '') => `<label class="field ${cls}"><span>${l}${req?'<span class="req" aria-label="obligatoire">*</span>':''}</span>${h}${hint?`<small>${hint}</small>`:''}</label>`;
const check = (p, l, rer = false) => `<label class="check"><input type="checkbox" data-k="${p}"${get(p)?' checked':''}${rer?' data-rerender':''}><span>${l}</span></label>`;
const chips = (p, opts, {sm = false, rer = false, label = ''} = {}) => `<div class="chips${sm?' sm':''}" role="group"${label?` aria-label="${esc(label)}"`:''}>${opts.map(o => { const [v,l,c] = Array.isArray(o) ? o : [o,o,'']; const on = String(get(p)) === String(v); return `<button type="button" class="chip ${c||''}${on?' on':''}" data-chip data-k="${p}" data-v="${esc(v)}" aria-pressed="${on}"${rer?' data-rerender':''}>${esc(l)}</button>`; }).join('')}</div>`;
const head = (step, title, text) => `<header class="vhead"><div class="eyebrow">Étape ${step} sur 5</div><h1>${title}</h1><p>${text}</p></header>`;
const card = (title, body, kicker = '') => `<section class="card">${kicker?`<div class="eyebrow">${kicker}</div>`:''}${title?`<h2>${title}</h2>`:''}${body}</section>`;

/* ---------- Calculs (formules VP Scan inchangées) ---------- */
function costs(p){ const ch = num(p.coutH) ?? num(S.mission.coutH), cp = num(p.coutPiece) ?? num(S.mission.coutPiece); return {ch, cp}; }
function factor(p){ const own = p && String(p.mois ?? '').trim() !== ''; const m = num(own ? p.mois : S.mission.mois); if (!ok(m) || m <= 0 || m > 12) return null; if (m < 12 && !(own ? p.represent : S.mission.represent)) return null; return 12 / m; }
function calc(p){
  const {ch, cp} = costs(p), r = num(p.rebutes), rec = num(p.recup), h = num(p.hArret), hr = num(p.hReglage), dm = num(p.demarrage);
  const errors = [];
  for (const [k,l] of [['rebutes','pièces rebutées'],['recup','valeur récupérée'],['hArret','heures d’arrêt'],['hReglage','heures de réglage'],['demarrage','pièces de démarrage'],['coutH','coût horaire'],['coutPiece','coût unitaire']]) if (Number.isNaN(num(p[k]))) errors.push('Valeur invalide : ' + l + '.');
  let rebuts = ok(r) && ok(cp) ? r * cp - (ok(rec) ? rec : 0) : null;
  if (rebuts != null && rebuts < 0) { errors.push('La valeur récupérée dépasse le coût brut des rebuts.'); rebuts = null; }
  const arrets = ok(h) && ok(ch) ? h * ch : null;
  const reglage = ok(hr) && ok(ch) && (!(dm > 0) || ok(cp)) ? hr * ch + (ok(dm) ? dm : 0) * (ok(cp) ? cp : 0) : null;
  const parts = [rebuts, arrets, reglage], known = parts.filter(v => v != null).reduce((s,v) => s + v, 0);
  const complete = parts.every(v => v != null) && !errors.length, f = factor(p);
  return {rebuts, arrets, reglage, known, complete, errors, nKnown: parts.filter(v => v != null).length,
    annualKnown: f ? known * f : null, annual: f && complete ? known * f : null, f};
}
function totals(){
  const c = S.presses.map(calc), f = c.length ? (c.every(x => x.f != null) ? 1 : null) : factor();
  const cat = k => f ? c.reduce((s,x) => s + (x[k] ?? 0) * x.f, 0) : null;
  const annual = f ? c.reduce((s,x) => s + x.annualKnown, 0) : null;
  return {c, f, rebuts:cat('rebuts'), arrets:cat('arrets'), reglage:cat('reglage'), annual, nComplete:c.filter(x => x.complete).length, n:c.length, complete:c.length > 0 && c.every(x => x.complete && x.f != null)};
}
function ranking(){
  const t = totals();
  const rows = S.presses.map((p,i) => ({p, i, c:t.c[i], a:t.c[i].annualKnown ?? 0})).sort((a,b) => b.a - a.a);
  rows.forEach((r,k) => { const share = t.annual ? r.a / t.annual : 0; r.share = share; r.level = r.a <= 0 ? 'À chiffrer' : (k === 0 || share >= .25) ? 'Critique' : share >= .1 ? 'À surveiller' : 'Secondaire'; });
  return rows;
}
function advice(p, level){
  if (p.mode === 'non') return 'Relevés manuels et standards ; VP Expert possible sans connexion.';
  if (p.mode === '?') return 'Qualifier la connexion et la source avant toute suite.';
  if (p.mode === 'verif') return 'Obtenir un export autorisé et vérifier sa qualité ; VP Expert sans attendre.';
  return level === 'Critique' ? 'Données accessibles : VP Expert, puis étude VP Predict à envisager.' : 'Données accessibles : VP Expert ; VP Predict si la presse devient critique.';
}

/* ---------- Contrôles automatiques ---------- */
function checks(){
  const m = S.mission, t = totals(), docs = Object.values(S.donnees), gr = S.grille, ent = Object.values(S.entretiens).filter(e => e.fait).length;
  return [
    ['mission', !!(m.client && m.site && m.objective), 'Client, site et objectif renseignés'],
    ['mission', ok(num(m.coutH)) && ok(num(m.coutPiece)) && m.coutsValides, 'Coût horaire et coût unitaire validés avec le contrôle de gestion'],
    ['mission', S.presses.length ? S.presses.every(p => factor(p) != null) : factor() != null, 'Période de référence de 12 mois, ou période courte jugée représentative'],
    ['parc', S.presses.length > 0 && S.presses.every(p => p.nom && p.mode !== '?' && p.source), 'Toutes les presses identifiées, avec connexion et source qualifiées'],
    ['parc', docs.every(v => v), 'Disponibilité de chaque document préalable examinée'],
    ['pertes', S.presses.length > 0 && S.presses.every(p => ['rebutes','hArret','hReglage'].every(f => nsp(p,f) || String(p[f] ?? '').trim() !== '')), 'Chaque chiffre de perte saisi ou déclaré non disponible'],
    ['pertes', t.complete, 'Rebuts, arrêts et réglages chiffrés sur toutes les presses'],
    ['terrain', gr.every(g => g.d), 'Les ' + gr.length + ' points de la grille terrain évalués'],
    ['terrain', D.axes.every(([k]) => S.axes[k] !== ''), 'Maturité notée sur les 6 axes'],
    ['terrain', ent >= 3 && S.entretiens.regleurs.fait, 'Au moins 3 entretiens, dont les régleurs'],
    ['restitution', !!(S.rapport.decision && S.rapport.justification.trim()), 'Décision et justification rédigées'],
    ['restitution', S.rapport.route.some(r => r.action && r.qui && r.quand), 'Au moins une action datée et attribuée'],
    ['restitution', S.rapport.relu && !!S.rapport.reluPar.trim(), 'Restitution relue avec le sponsor'],
  ];
}
function stepDone(k){ const c = checks().filter(x => x[0] === k); return c.length && c.every(x => x[1]); }

/* ---------- Navigation ---------- */
function nav(cur){ $('#nav').innerHTML = STEPS.map(([k,l,s],i) => `<a href="#${k}" class="${cur===k?'on ':''}${stepDone(k)?'done':''}"${cur===k?' aria-current="step"':''}><span class="n">${stepDone(k)?'✓':i+1}</span><span class="lbl">${l}<small>${s}</small></span></a>`).join(''); }
function saveBadge(){ const e = $('#save-state'); if (e) e.textContent = dirty ? 'Modifications à exporter' : lastExport ? 'Exporté à ' + lastExport : 'Mémoire temporaire'; const n = $('#mission-name'); if (n) n.textContent = [S.mission.client, S.mission.site].filter(Boolean).join(' · ') || 'Nouvelle mission'; }
function foot(k){ const i = STEPS.findIndex(s => s[0] === k); return `<div class="step-foot">${i>0?`<a class="btn ghost" href="#${STEPS[i-1][0]}">← ${STEPS[i-1][1]}</a>`:'<span></span>'}${i<STEPS.length-1?`<a class="btn" href="#${STEPS[i+1][0]}">${STEPS[i+1][1]} →</a>`:''}</div>`; }
const V = Object.create(null);
function current(){ const k = (location.hash || '#mission').slice(1); return V[k] ? k : 'mission'; }
function render(keepScroll = false){ const y = window.scrollY, k = current(); const open = $$('details[data-id]').filter(d => d.open).map(d => d.dataset.id); $('#view').innerHTML = V[k]() + foot(k); open.forEach(id => { const d = document.querySelector(`details[data-id="${id}"]`); if (d) d.open = true; }); nav(k); saveBadge(); if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0); const on = $('#nav a.on'), nv = $('#nav'); if (on && nv.scrollWidth > nv.clientWidth) nv.scrollLeft = on.offsetLeft - 12; }

/* ---------- Étape 1 : Mission ---------- */
V.mission = () => `${head(1,'Cadrer la mission','Qui, où, sur quelle période, avec quels coûts de référence. Les coûts saisis ici s’appliquent à toutes les presses.')}
${!S.mission.client && !S.presses.length ? `<div class="intro">${STEPS.map(([k,l,s],i) => `<div><i>0${i+1}</i><b>${l}</b><span>${s}</span></div>`).join('')}</div>
<div class="notice"><p><b>Ce que VP Scan livre au client :</b> arrêts et rebuts chiffrés en euros presse par presse, qualité des données et presses connectables, presses critiques désignées et feuille de route. Les champs marqués <span class="req">*</span> sont nécessaires au rapport.</p></div>` : ''}
${card('Client et site', `<div class="form">${field('Client', input('mission.client','Raison sociale'), '', true)}${field('Site', input('mission.site','Ville, atelier'), '', true)}${field('Sponsor client', input('mission.sponsor','Nom, fonction'))}${field('Consultant VP', input('mission.consultant'))}${field('Dates de la visite', input('mission.dates','Ex. 14–15 janvier 2027'))}<div class="field"><span>Secteur</span>${chips('mission.secteur',['Injection thermoplastique','Moulage caoutchouc'],{rer:true,label:'Secteur'})}</div>
${field('Objectif prioritaire du client', area('mission.objective','Quel problème objectiver ? Quel résultat rendra le diagnostic utile ?',2), '', true, 'span2')}${field('Périmètre et exclusions', area('mission.perimetre','Ateliers, presses, familles de pièces incluses ; ce qui est exclu',2), '', false, 'span2')}</div>
${S.mission.secteur === 'Moulage caoutchouc' ? '<div class="notice warn" style="margin:14px 0 0"><p>Référentiel caoutchouc provisoire : le bloc écosystème de la grille est adapté, sa validation par l’expert métier reste nécessaire.</p></div>' : ''}`)}
${card('Coûts et période de référence', `<div class="form f3">${field('Coût horaire presse', input('mission.coutH','Ex. 85','number','€/h'), 'Charges incluses à valider.', true)}${field('Coût unitaire moyen d’une pièce', input('mission.coutPiece','Ex. 1,80','number','€/pièce'), 'Coût de revient, pas prix de vente.', true)}${field('Période observée', input('mission.mois','12','number','mois'), 'Les pertes sont ramenées à l’année.', true)}</div>
<div class="form" style="margin-top:6px">${field('Période (libellé)', input('mission.periode','Ex. janvier–décembre 2026'))}<div>${num(S.mission.mois) < 12 ? check('mission.represent','Période courte jugée représentative (mix, charge, saison) : annualisation autorisée', true) : ''}${check('mission.coutsValides','Coûts validés avec le contrôle de gestion du site')}</div></div>
<p class="small muted" style="margin:8px 0 0">Un coût différent peut être saisi presse par presse à l’étape Pertes.</p>`)}`;

/* ---------- Étape 2 : Parc & données ---------- */
function pressParc(p, i){ const k = 'presses.' + i; return `<div class="press"><div class="press-head"><span class="num">${i+1}</span>${input(k+'.nom','Presse : identifiant, marque, tonnage (ex. P12 · Engel 180 t)')}<button class="btn del no-print" data-act="delPress" data-i="${i}" aria-label="Retirer la presse ${i+1}">Retirer</button></div>
<div class="press-grid"><div><span class="lab">Connexion</span>${chips(k+'.mode', MODES, {sm:true,label:'Connexion'})}</div><div><span class="lab">Source des chiffres</span>${chips(k+'.source', SOURCES, {sm:true,label:'Source'})}</div>
${field('Problème principal observé', input(k+'.defaut','Ex. bulles, arrêts thermorégulateur, réglages longs'), '', false, 'span2')}</div></div>`; }
V.parc = () => `${head(2,'Parc et données','Une ligne par presse, connectée ou non. Puis l’état des documents demandés au client. Un clic par information.')}
${card('Presses du périmètre', `<div class="bulk"><label class="field"><span>Nombre de presses du périmètre</span>${input('mission.nbPresses','Ex. 12','number','presses')}<small>Toutes les presses, connectées ou non.</small></label><button class="btn" data-act="bulkPress">Créer les fiches</button></div>${S.presses.length ? S.presses.map(pressParc).join('') : '<p class="muted">Aucune presse pour l’instant. Toutes les presses du périmètre comptent, même sans données.</p>'}<div class="actions" style="margin-top:6px"><button class="btn ghost" data-act="addPress">+ Ajouter une presse</button><a class="btn link" href="VP-Scan-Fiche-Releve-Terrain-Presses-Non-Connectees.pdf" target="_blank" rel="noopener">Fiche papier de secours (presses non connectées) ↗</a></div>`, S.presses.length + ' presse' + (S.presses.length > 1 ? 's' : ''))}
${card('Documents préalables', `<div class="rows">${D.donnees.map(([id,t,desc,per]) => `<div class="row"><div><b>${t}</b><small>${desc} · ${per}</small></div>${chips('donnees.'+id, DOC, {sm:true,label:t})}</div>`).join('')}</div>`, '<span data-live="docs"></span>')}`;

/* ---------- Étape 3 : Pertes ---------- */
function resBox(i){ const p = S.presses[i], c = calc(p), cell = (l,v,f) => `<div><span>${l}</span>${v==null?(nsp(p,f)?'<b class="unk nsp">non disponible</b>':'<b class="unk">à renseigner</b>'):`<b>${money(v)}</b>`}</div>`;
  return `<div class="result">${cell('Rebuts',c.rebuts,'rebutes')}${cell('Arrêts',c.arrets,'hArret')}${cell('Réglages et démarrages',c.reglage,'hReglage')}<div class="tot"><span>Pertes annuelles${c.f && c.f !== 1 ? ' (période ×' + String(Math.round(c.f*100)/100).replace('.',',') + ')' : ''} ${c.complete?'':'· partiel'}</span>${c.annualKnown==null||!c.nKnown?`<b class="unk">${c.f==null?'période à justifier':'à renseigner'}</b>`:`<b>${money(c.annualKnown)}</b>`}</div></div>${c.errors.map(e => `<p class="calc-err">${esc(e)}</p>`).join('')}`; }
const NSP_L = {rebutes:'pièces rebutées', hArret:'heures d’arrêt', hReglage:'heures de réglage'};
const nsp = (p, f) => !!(p.nsp && p.nsp[f]);
function lossField(p, i, f, l, u, hint){ const k = 'presses.' + i + '.' + f, on = nsp(p, f);
  return `<div class="field lossf${on?' is-nsp':''}"><span>${l}</span>${on ? `<span class="nsp-val">Non disponible sur le site</span>` : input(k,'À renseigner','number',u)}<small>${hint} <button type="button" class="nsp-btn" data-act="nsp" data-i="${i}" data-f="${f}" aria-pressed="${on}">${on ? 'Finalement, saisir une valeur' : 'Je ne sais pas'}</button></small></div>`; }
function pressLoss(p, i){ const k = 'presses.' + i, {ch, cp} = costs(p), m = num(S.mission.mois);
  return `<div class="press"><div class="press-head"><span class="num">${i+1}</span><div style="flex:1;min-width:0"><b>${esc(p.nom || 'Presse ' + (i+1))}</b><div class="small muted">${esc(MODE_L[p.mode])}${p.source?' · '+esc(p.source):''}</div></div></div>
<div class="loss-grid">${lossField(p,i,'rebutes','Pièces rebutées','pièces','Hors pièces de démarrage.')}${lossField(p,i,'hArret','Arrêts non planifiés','h','Hors temps de réglage.')}${lossField(p,i,'hReglage','Réglage au-delà du standard','h','Seulement le dépassement.')}</div>
<details class="more" data-id="more-${p.id}"><summary>Valeur récupérée, pièces de démarrage, coûts propres à cette presse</summary><div class="inner loss-grid">${field('Valeur matière récupérée', input(k+'.recup','0','number','€'), 'Laisser vide si aucune.')}${field('Pièces perdues au démarrage', input(k+'.demarrage','0','number','pièces'))}${field('Coût horaire spécifique', input(k+'.coutH', ok(num(S.mission.coutH))?String(S.mission.coutH):'', 'number','€/h'), 'Vide = coût de la mission.')}${field('Coût unitaire spécifique', input(k+'.coutPiece', ok(num(S.mission.coutPiece))?String(S.mission.coutPiece):'', 'number','€/pièce'), 'Vide = coût de la mission.')}${field('Période spécifique', input(k+'.mois', String(S.mission.mois||''), 'number','mois'), 'Vide = période de la mission.')}${num(p.mois) < 12 && String(p.mois).trim() ? check(k+'.represent','Période courte représentative : annualiser') : ''}</div></details>
<div style="margin-top:12px"><span class="lab small" style="font-weight:600;display:block;margin-bottom:6px">Niveau de preuve</span>${chips(k+'.preuve', PREUVES, {sm:true,label:'Niveau de preuve'})}</div>
<div data-live="res:${i}">${resBox(i)}</div></div>`; }
function progress(){ const t = totals(), n = S.presses.length, todo = [], nd = [];
  S.presses.forEach((p,i) => ['rebutes','hArret','hReglage'].forEach(f => { if (nsp(p,f)) nd.push(1); else if (String(p[f] ?? '').trim() === '') todo.push(1); }));
  return `<div class="notice prog"><p><b>Avancement :</b> presses entièrement chiffrées ${t.nComplete}/${n} · ${todo.length} chiffre${todo.length>1?'s':''} à renseigner · ${nd.length} non disponible${nd.length>1?'s':''}. Le total des pertes s’affiche à l’<a href="#restitution">étape Restitution</a>, une fois les presses passées : on ne s’ancre pas sur un premier chiffre.</p></div>`; }
function metrics(){ const t = totals(); return `<div class="metrics"><div class="hl"><span>Pertes annuelles estimées</span><strong>${t.annual==null?'—':money(t.annual)}</strong><small>${t.complete?'Toutes les presses chiffrées':t.f==null?'Période à justifier (étape 1)':t.nComplete+'/'+t.n+' presses complètes · partiel'}</small></div><div><span>Rebuts</span><strong>${money(t.rebuts)}</strong></div><div><span>Arrêts</span><strong>${money(t.arrets)}</strong></div><div><span>Réglages et démarrages</span><strong>${money(t.reglage)}</strong></div></div>`; }
V.pertes = () => `${head(3,'Chiffrer les pertes','Trois chiffres par presse sur la période observée. Si le site ne connaît pas un chiffre, choisissez « Je ne sais pas » : il reste inconnu, jamais compté comme zéro. Le montant de chaque presse sert à contrôler la saisie ; le total est donné à la restitution.')}
<div data-live="progress">${progress()}</div>
${!ok(num(S.mission.coutH)) || !ok(num(S.mission.coutPiece)) ? '<div class="notice warn"><p>Renseignez le coût horaire et le coût unitaire à l’<a href="#mission">étape Mission</a> pour obtenir les montants.</p></div>' : ''}
${S.presses.length ? S.presses.map(pressLoss).join('') : '<div class="card"><p>Ajoutez d’abord les presses à l’<a href="#parc">étape Parc & données</a>.</p></div>'}
<details class="more card" data-id="formules"><summary>Formules et règles</summary><div class="inner small muted"><p>Rebuts = pièces rebutées × coût unitaire − valeur récupérée. Arrêts = heures non planifiées × coût horaire. Réglages = heures au-delà du standard × coût horaire + pièces de démarrage × coût unitaire.</p><p>Une case vide reste inconnue : elle n’est jamais comptée comme zéro et le total est signalé partiel. Ce sont des pertes initiales estimées, pas des gains promis.</p></div></details>`;

/* ---------- Étape 4 : Visite terrain ---------- */
function gridItems(){ const rubber = S.mission.secteur === 'Moulage caoutchouc'; return D.grille.map((g,i) => rubber && g[0] === 0 && D.rubber[i] ? [0, D.rubber[i][0], D.rubber[i][1]] : g); }
function blockCount(b){ const items = gridItems(); let n = 0, done = 0; items.forEach((g,i) => { if (g[0] === b) { n++; if (S.grille[i].d) done++; } }); return `<span class="tag ${done===n?'ok':''}">${done}/${n}</span>`; }
V.terrain = () => { const items = gridItems(); return `${head(4,'Visite terrain','Un clic par point de la grille, une note seulement en cas d’écart. Puis la maturité et les entretiens réalisés.')}
${D.blocs.map((b,bi) => `<details class="block" data-id="bloc-${bi}"${bi===0?' open':''}><summary><h2>${esc(b)}</h2><span data-live="bloc:${bi}">${blockCount(bi)}</span><span class="chev">+</span></summary><div class="body">${items.map((g,i) => g[0] !== bi ? '' : `<div class="pt"><div><b>${esc(g[1])}</b><small>${esc(g[2])}</small></div>${chips('grille.'+i+'.d', GR, {sm:true,label:g[1]})}<div class="note">${S.grille[i].note ? input('grille.'+i+'.note','Constat ou écart') : `<button type="button" class="btn link small" data-act="note" data-i="${i}">+ Noter un constat</button>`}</div></div>`).join('')}</div></details>`).join('')}
${card('Maturité process', `<p class="small muted">Note de 0 à 3 par axe, à partir des constats de la visite.</p>${D.axes.map(([k,t,d]) => `<div class="axis"><div><b class="small" style="font-weight:650">${t}</b><small class="muted" style="display:block;font-size:12px">${d}</small></div>${chips('axes.'+k, D.niveaux.map((l,i) => [String(i), i+' · '+l]), {sm:true,label:t})}</div>`).join('')}`)}
${card('Entretiens', `<p class="small muted">Cochez les entretiens réalisés. Les questions clés sont dans chaque fiche ; notez les faits marquants seulement.</p>${D.entretiens.map(([id,t,role,dur,obj,qs]) => `<details class="block" data-id="ent-${id}" style="margin:8px 0 0"><summary><input type="checkbox" data-k="entretiens.${id}.fait"${S.entretiens[id].fait?' checked':''} aria-label="Entretien ${esc(t)} réalisé" onclick="event.stopPropagation()" style="width:20px;height:20px;min-height:20px;flex:0 0 20px;accent-color:#1d3f70"><h2>${t}</h2><span class="small muted">${dur}</span><span class="chev">+</span></summary><div class="body"><p class="small muted">${role} · ${obj}</p><ol class="small" style="padding-left:18px;margin:0 0 10px">${qs.map(q => `<li>${q}</li>`).join('')}</ol>${area('entretiens.'+id+'.notes','Faits, exemples, verbatims',3)}</div></details>`).join('')}`, 'Observer')}`; };

/* ---------- Étape 5 : Restitution ---------- */
function reportHTML(){
  const m = S.mission, t = totals(), rk = ranking(), dec = D.decisions.find(d => d[0] === S.rapport.decision), items = gridItems();
  const modeCount = MODES.map(([k,l]) => [l, S.presses.filter(p => p.mode === k).length]).filter(x => x[1]);
  const docCount = DOC.map(([k,l]) => [l, Object.values(S.donnees).filter(v => v === k).length]);
  const docMissing = D.donnees.filter(([id]) => S.donnees[id] === 'absent' || S.donnees[id] === 'partiel').map(d => d[1] + ' (' + (S.donnees[d[0]] === 'absent' ? 'absent' : 'partiel') + ')');
  const preuveCount = PREUVES.map(pr => [pr, S.presses.filter(p => p.preuve === pr).length]).filter(x => x[1]);
  const reactive = items.map((g,i) => [g, S.grille[i]]).filter(([,v]) => v.d === 1);
  const pistes = S.rapport.pistes.filter(p => p.titre.trim());
  const route = S.rapport.route.filter(r => r.action.trim());
  const reserves = checks().filter(c => !c[1]).map(c => c[2]);
  const pct = (a,b) => b ? Math.round(a / b * 100) : 0;
  return `<article class="report" id="report">
<div class="rep-head"><div><div class="eyebrow">Vella Partners · Rapport VP Scan</div><h1>${esc(m.client || 'Client')} — ${esc(m.site || 'Site')}</h1><div class="small muted">${esc(m.secteur)}${m.dates?' · Visite : '+esc(m.dates):''}${m.periode?' · Période : '+esc(m.periode):''}</div></div><div class="small muted" style="text-align:right">Consultant : ${esc(m.consultant || '—')}<br>Sponsor : ${esc(m.sponsor || '—')}<br>${new Date().toLocaleDateString('fr-FR')}</div></div>
${m.objective ? `<p><b>Objectif :</b> ${esc(m.objective)}</p>` : ''}${m.perimetre ? `<p class="small muted">Périmètre : ${esc(m.perimetre)}</p>` : ''}
<h2>1. Pertes chiffrées</h2>
<div class="kpis"><div><span>Pertes annuelles estimées</span><b>${t.annual==null?'—':money(t.annual)}</b></div><div><span>Rebuts</span><b>${money(t.rebuts)}</b></div><div><span>Arrêts</span><b>${money(t.arrets)}</b></div><div><span>Réglages et démarrages</span><b>${money(t.reglage)}</b></div></div>
<p class="small muted" style="margin-top:8px">${t.nComplete}/${t.n} presses entièrement chiffrées${preuveCount.length?' · Preuves : '+preuveCount.map(([l,n]) => n+' '+l.toLowerCase()).join(', '):''}. Coûts : ${ok(num(m.coutH))?fmt(num(m.coutH))+' €/h':'—'}, ${ok(num(m.coutPiece))?String(m.coutPiece).replace('.',',')+' €/pièce':'—'}${m.coutsValides?' (validés)':' (à valider)'}${num(m.mois)<12&&ok(num(m.mois))?' · Annualisé depuis '+m.mois+' mois':''}.</p>
${(() => { const l = S.presses.map((p,i) => [p,i]).flatMap(([p,i]) => ['rebutes','hArret','hReglage'].filter(f => nsp(p,f)).map(f => esc(p.nom || 'Presse '+(i+1)) + ' : ' + NSP_L[f])); return l.length ? `<p class="small"><b>Chiffres non disponibles sur le site</b> (non comptés, total partiel) : ${l.join(' ; ')}.</p>` : ''; })()}
<h2>2. Presses critiques</h2>
${rk.length ? `<div class="tbl"><table><thead><tr><th>Presse</th><th>Connexion</th><th class="num">Pertes / an</th><th>Part</th><th>Niveau</th><th>Suite proposée</th></tr></thead><tbody>${rk.map(r => `<tr><td><b>${esc(r.p.nom || 'Presse '+(r.i+1))}</b>${r.p.defaut?`<br><span class="small muted">${esc(r.p.defaut)}</span>`:''}</td><td class="small">${esc(MODE_L[r.p.mode])}</td><td class="num">${r.c.annualKnown==null?'—':money(r.c.annualKnown)}${r.c.complete?'':'<br><span class="small muted">partiel</span>'}</td><td><div class="bar"><i style="width:${Math.round(r.share*100)}%"></i></div><span class="small muted">${Math.round(r.share*100)} %</span></td><td><span class="tag ${r.level==='Critique'?'bad':r.level==='À surveiller'?'warn':''}">${r.level}</span></td><td class="small">${advice(r.p, r.level)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Aucune presse saisie.</p>'}
<h2>3. Données et connectivité</h2>
<p>${modeCount.length ? modeCount.map(([l,n]) => `<span class="tag">${n} · ${esc(l)}</span>`).join(' ') : '—'}</p>
<p class="small">Documents : ${docCount.map(([l,n]) => n+' '+(l==='N.A.'?'non applicable':l.toLowerCase())).join(' · ')}.${docMissing.length?` À fiabiliser : ${esc(docMissing.join(', '))}.`:''}</p>
<h2>4. Maturité process</h2>
<div class="tbl"><table><tbody>${D.axes.map(([k,l]) => { const v = S.axes[k]; return `<tr><td style="width:40%">${l}</td><td><div class="bar y"><i style="width:${v===''?0:pct(Number(v),3)}%"></i></div></td><td class="num small">${v===''?'non noté':v+'/3 · '+D.niveaux[Number(v)]}</td></tr>`; }).join('')}</tbody></table></div>
<p class="small" style="margin-top:10px">Grille terrain : ${D.blocs.map((b,bi) => { const its = items.map((g,i) => [g,S.grille[i]]).filter(([g]) => g[0] === bi); const pr = its.filter(([,v]) => v.d === 3).length, rea = its.filter(([,v]) => v.d === 1).length; return `<b>${esc(b)}</b> ${pr} préventif${pr>1?'s':''}, ${rea} réactif${rea>1?'s':''} sur ${its.length}`; }).join(' · ')}.</p>
${reactive.length ? `<p class="small"><b>Points réactifs :</b> ${reactive.map(([g,v]) => esc(g[1]) + (v.note ? ' — ' + esc(v.note) : '')).join(' ; ')}.</p>` : ''}
<h2>5. Pistes prioritaires</h2>
${pistes.length ? `<ol>${pistes.map(p => `<li><b>${esc(p.titre)}</b>${p.action?' — '+esc(p.action):''}</li>`).join('')}</ol>` : '<p class="muted">À compléter.</p>'}
<h2>6. Recommandation</h2>
<div class="decision-box"><b>${dec ? esc(dec[1]) : 'Décision à prendre'}</b>${S.rapport.justification ? `<p style="margin:6px 0 0">${esc(S.rapport.justification)}</p>` : ''}</div>
<h2>7. Feuille de route</h2>
${route.length ? `<div class="tbl"><table><thead><tr><th>Horizon</th><th>Action</th><th>Responsable</th><th>Échéance</th></tr></thead><tbody>${route.map(r => `<tr><td class="small">${esc(r.horizon)}</td><td>${esc(r.action)}</td><td>${esc(r.qui)}</td><td>${esc(r.quand)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">À compléter.</p>'}
${reserves.length || S.rapport.reserves ? `<h2>Réserves</h2><ul class="small">${reserves.map(r => `<li>À compléter : ${esc(r.toLowerCase())}</li>`).join('')}${S.rapport.reserves ? `<li>${esc(S.rapport.reserves)}</li>` : ''}</ul>` : ''}
<p class="disclaimer">Estimations de pertes initiales établies à partir des sources du site, pas des gains promis. Les montants restent à confirmer avec le site. Ce diagnostic ne remplace ni un audit réglementaire, ni un audit de sécurité machine ou de cybersécurité.${S.rapport.relu ? ' Restitution relue avec ' + esc(S.rapport.reluPar || 'le sponsor') + '.' : ''}</p>
</article>`;
}
function checksHTML(){ return `<ul class="checks">${checks().map(([k,v,l]) => `<li class="${v?'ok':'ko'}"><span class="ic">${v?'✓':'!'}</span><span>${l}</span>${v?'':`<a href="#${k}">Compléter</a>`}</li>`).join('')}</ul>`; }
V.restitution = () => `${head(5,'Restitution','Choisissez la suite, trois pistes au plus et la feuille de route. Le rapport se construit à partir des étapes précédentes.')}
<div class="no-print">
${card('Pertes chiffrées', `<div data-live="metrics">${metrics()}</div>`, 'Calculées avec les chiffres saisis')}
${card('Contrôles avant restitution', `<div data-live="checks">${checksHTML()}</div>`, 'Calculés automatiquement')}
${card('Recommandation', `<div class="decision-grid">${D.decisions.map(([k,l,d]) => `<button type="button" class="dec${S.rapport.decision===k?' on':''}" data-chip data-k="rapport.decision" data-v="${k}" data-rerender aria-pressed="${S.rapport.decision===k}"><b>${l}</b><span>${d}</span></button>`).join('')}</div>${field('Justification', area('rapport.justification','Pourquoi cette suite, à quelles conditions',2), '', true)}`)}
${card('Pistes prioritaires (3 au plus)', S.rapport.pistes.map((p,i) => `<div class="piste">${input('rapport.pistes.'+i+'.titre','Piste '+(i+1)+' : constat (ex. arrêts thermorégulation P12)')}${input('rapport.pistes.'+i+'.action','Action proposée')}</div>`).join(''))}
${card('Feuille de route', S.rapport.route.map((r,i) => `<div class="route"><span class="h">${esc(r.horizon)}</span>${input('rapport.route.'+i+'.action','Action')}${input('rapport.route.'+i+'.qui','Responsable')}${input('rapport.route.'+i+'.quand','Échéance')}</div>`).join('') + `<div style="margin-top:10px">${field('Réserves complémentaires', area('rapport.reserves','Limites de la mission, données non vues…',2))}</div><div class="form" style="margin-top:10px">${field('Relu avec', input('rapport.reluPar','Nom du sponsor ou de l’expert'))}<div style="align-self:end">${check('rapport.relu','Restitution relue et validée avec le client')}</div></div>`)}
<div class="actions" style="margin:6px 0 22px"><button class="btn" data-act="print">Imprimer ou enregistrer en PDF</button><button class="btn ghost" data-act="dlReport">Télécharger le rapport (HTML)</button><button class="btn ghost" data-act="export">Exporter la mission (JSON)</button></div>
</div>
<div data-live="report">${reportHTML()}</div>`;

/* ---------- Mises à jour en direct ---------- */
function live(){
  $$('[data-live]').forEach(el => { const [t, a] = el.dataset.live.split(':');
    if (t === 'res') el.innerHTML = resBox(Number(a));
    else if (t === 'metrics') el.innerHTML = metrics();
    else if (t === 'progress') el.innerHTML = progress();
    else if (t === 'checks') el.innerHTML = checksHTML();
    else if (t === 'report') el.innerHTML = reportHTML();
    else if (t === 'bloc') el.innerHTML = blockCount(Number(a));
    else if (t === 'docs') { const n = Object.values(S.donnees).filter(Boolean).length; el.textContent = n + '/' + D.donnees.length + ' examinés'; }
  });
  nav(current()); saveBadge();
}

/* ---------- Exemple fictif ---------- */
function example(){
  S = blank();
  Object.assign(S.mission, {client:'Exemple fictif · Atelier Horizon', site:'Site de démonstration', sponsor:'Directeur de site (fictif)', dates:'Deux jours sur site', objective:'Objectiver les pertes et la qualité des données avant tout investissement.', perimetre:'Trois presses d’injection, atelier A. Aucune donnée réelle.', mois:'12', periode:'Janvier–décembre (exemple)', coutH:'85', coutPiece:'1.8', coutsValides:true});
  S.presses = [
    {...blankPress(), nom:'P12 · 180 t', mode:'acc', source:'MES', defaut:'Arrêts thermorégulation', preuve:'Mesuré', rebutes:'14000', recup:'1200', hArret:'260', hReglage:'90', demarrage:'2500'},
    {...blankPress(), nom:'P07 · 120 t', mode:'verif', source:'Excel', defaut:'Bulles sur pièce B', preuve:'Estimé', rebutes:'6000', hArret:'110', hReglage:'40'},
    {...blankPress(), nom:'P03 · 80 t', mode:'non', source:'Papier', defaut:'Réglages longs au démarrage', preuve:'Déclaratif', rebutes:'2500', hArret:'70'},
  ];
  D.donnees.forEach(([id],i) => S.donnees[id] = ['recu','recu','recu','partiel','partiel','absent','recu','partiel','recu','absent','recu'][i] || '');
  S.grille.forEach((g,i) => { g.d = i < 26 ? [3,2,1,2,3,2,1][i % 7] : 0; });
  S.grille[6].note = 'Débits thermorégulation non mesurés.';
  Object.assign(S.axes, {process:'1', stops:'2', preventive:'1', qualification:'2', data:'1', team:'2'});
  ['direction','production','regleurs'].forEach(k => S.entretiens[k].fait = true);
  S.entretiens.regleurs.notes = 'Ordre de contrôle différent d’une équipe à l’autre.';
  Object.assign(S.rapport, {decision:'fiabiliser', justification:'Compléter les relevés de P03 et obtenir un export autorisé de P07 avant d’engager VP Expert sur tout le parc.'});
  S.rapport.pistes[0] = {titre:'Arrêts thermorégulation P12', action:'Mesurer débits et écarts entrée/sortie, plan préventif thermorégulateurs'};
  S.rapport.route[0] = {...S.rapport.route[0], action:'Relevés arrêts P03 sur 4 semaines', qui:'Référent production', quand:'Fin février'};
  dirty = false; lastExport = ''; render();
  toast('Exemple fictif chargé. Les chiffres ne correspondent à aucun client.');
}

/* ---------- Import / export ---------- */
const slug = () => [S.mission.client, S.mission.site].filter(Boolean).join('-').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,60) || 'mission';
function download(name, content, type){ const b = new Blob([content], {type}), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800); }
function exportMission(){ download('VP-Scan-mission-' + slug() + '.json', JSON.stringify({app:'vp-scan', version:4, exportedAt:new Date().toISOString(), data:S}, null, 1), 'application/json'); dirty = false; lastExport = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); saveBadge(); toast('Mission exportée. Conservez le fichier dans le dossier sécurisé de la mission.'); }
function merge(base, src){ if (!src || typeof src !== 'object') return base; for (const k of Object.keys(base)) { if (!(k in src)) continue; const b = base[k], v = src[k]; if (Array.isArray(b)) { if (Array.isArray(v)) base[k] = b.length && typeof b[0] === 'object' ? b.map((x,i) => merge(x, v[i])) : v; } else if (b && typeof b === 'object') merge(b, v); else if (typeof v === typeof b) base[k] = v; } return base; }
function fromV3(o){
  const n = blank(), m = o.mission || {}, modeMap = {'Connectée : données accessibles':'acc','Connectée : accès indisponible':'verif','Connectable : non raccordée':'verif','Non connectée':'non'};
  Object.assign(n.mission, {client:m.client||'', site:m.site||'', secteur:m.secteur==='Moulage caoutchouc'?'Moulage caoutchouc':'Injection thermoplastique', consultant:m.equipe||'', sponsor:m.sponsor||'', dates:m.dates||'', objective:m.objective||'', perimetre:[m.perimetre,m.exclusions].filter(Boolean).join(' — '), periode:m.periode||''});
  const ps = Array.isArray(o.presses) ? o.presses : [];
  const first = ps.find(p => p.coutH || p.coutPiece) || {};
  n.mission.coutH = String(first.coutH || ''); n.mission.coutPiece = String(first.coutPiece || ''); n.mission.mois = String(ps[0]?.months || '12'); n.mission.represent = !!ps[0]?.annual; n.mission.coutsValides = ps.length > 0 && ps.every(p => p.costApproved);
  n.presses = ps.map(p => ({...blankPress(), nom:p.nom||'', mode:modeMap[p.mode]||'?', source:'', note:p.source||'', defaut:p.defaut||'', preuve:PREUVES.includes(p.preuve)?p.preuve:'Estimé',
    mois:String(p.months??'')===n.mission.mois?'':String(p.months??''), represent:!!p.annual, rebutes:String(p.rebutes??''), recup:String(p.recup??''), hArret:String(p.hArret??''), hReglage:String(p.hReglage??''), demarrage:String(p.demarrage??''),
    coutH:String(p.coutH)===n.mission.coutH?'':String(p.coutH??''), coutPiece:String(p.coutPiece)===n.mission.coutPiece?'':String(p.coutPiece??'')}));
  if (Array.isArray(o.grille)) o.grille.forEach((g,i) => { if (n.grille[i]) { n.grille[i].d = [0,1,2,3].includes(g.d) ? g.d : 0; n.grille[i].note = g.obs || g.donnees || ''; } });
  if (o.axes) for (const k of Object.keys(n.axes)) { const v = o.axes[k]?.n; n.axes[k] = v === '' || v == null ? '' : String(v); }
  if (o.entretiens) for (const k of Object.keys(n.entretiens)) { const e = o.entretiens[k]; if (e) n.entretiens[k] = {fait:!!e.fait, notes:e.notes||''}; }
  if (o.donnees) for (const k of Object.keys(n.donnees)) { const st = o.donnees[k]?.statut; n.donnees[k] = st === 'Reçu' ? 'recu' : st === 'Non applicable' ? 'na' : st === 'Partiel' ? 'partiel' : st === 'Indisponible' || st === 'Absent' ? 'absent' : ''; }
  const r = o.rapport || {};
  n.rapport.decision = r.decision || ''; n.rapport.justification = r.justification || ''; n.rapport.reserves = r.limites || '';
  if (Array.isArray(r.pistes)) r.pistes.slice(0,3).forEach((p,i) => n.rapport.pistes[i] = {titre:p.titre||'', action:p.action||''});
  if (Array.isArray(r.route)) r.route.slice(0,3).forEach((x,i) => Object.assign(n.rapport.route[i], {action:x.action||'', qui:x.qui||'', quand:x.quand||''}));
  return n;
}

/* ---------- Divers ---------- */
let tt; function toast(m){ const e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('show'), 3200); }
function ask(msg, info = false, title = 'Confirmer'){ return new Promise(res => { const d = $('#ask'); $('#ask-title').textContent = info ? 'Information' : title; $('#ask-msg').textContent = msg; $('#ask-cancel').hidden = info; $('#ask-ok').textContent = info ? 'Compris' : 'Confirmer'; d.onclose = () => res(d.returnValue === 'ok'); d.returnValue = ''; d.showModal(); }); }
function standaloneReport(){ const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; } }).join('\n'); return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport VP Scan · ${esc(S.mission.client)}</title><style>${css}body{background:#fff}main{max-width:960px;margin:0 auto;padding:32px 20px}</style></head><body><main>${reportHTML()}</main></body></html>`; }

/* ---------- Événements ---------- */
document.addEventListener('input', e => { const el = e.target; if (!el.dataset.k || el.type === 'checkbox') return; set(el.dataset.k, el.value); if (el.dataset.k.endsWith('.mois')) { const rk = el.dataset.k.replace(/mois$/,'represent'); const need = String(el.value).trim() !== '' && num(el.value) < 12; if (need !== !!$(`[data-k="${rk}"]`)) { clearTimeout(window._rr); window._rr = setTimeout(() => { const id = el.dataset.k; render(true); const n = $(`[data-k="${id}"]`); if (n) { n.focus(); n.setSelectionRange?.(n.value.length, n.value.length); } }, 500); } } live(); });
document.addEventListener('change', e => { const el = e.target; if (el.type !== 'checkbox' || !el.dataset.k) return; set(el.dataset.k, el.checked); if (el.hasAttribute('data-rerender')) render(true); else live(); });
document.addEventListener('click', async e => {
  const c = e.target.closest('[data-chip]');
  if (c) { const k = c.dataset.k; let v = c.dataset.v; const cur = get(k); if (typeof cur === 'number') v = Number(v);
    const nv = String(cur) === String(v) && !k.endsWith('.mode') && !k.endsWith('.preuve') && k !== 'mission.secteur' ? (typeof cur === 'number' ? 0 : '') : v; // re-cliquer désélectionne
    set(k, nv);
    if (c.hasAttribute('data-rerender')) { render(true); return; }
    c.parentElement.querySelectorAll('[data-chip]').forEach(b => { const on = String(get(k)) === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    live(); return; }
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'note') { const i = b.dataset.i, w = b.parentElement; w.innerHTML = input('grille.'+i+'.note','Constat ou écart'); w.querySelector('input').focus(); return; }
  if (a === 'menu') { document.body.classList.toggle('menu-open'); b.setAttribute('aria-expanded', document.body.classList.contains('menu-open')); return; }
  if (a !== 'menu') document.body.classList.remove('menu-open');
  if (a === 'export') exportMission();
  if (a === 'import') $('#file').click();
  if (a === 'bulkPress') { const n = Math.round(num(S.mission.nbPresses) ?? NaN);
    if (!(n >= 1 && n <= 300)) { toast('Indiquez un nombre de presses entre 1 et 300.'); $('[data-k="mission.nbPresses"]')?.focus(); return; }
    if (n <= S.presses.length) { toast(S.presses.length + ' fiche' + (S.presses.length>1?'s':'') + ' déjà créée' + (S.presses.length>1?'s':'') + ' : retirez les presses en trop une à une si besoin.'); return; }
    const add = n - S.presses.length; for (let k = 0; k < add; k++) S.presses.push(blankPress()); dirty = true; render(true); toast(add + ' fiche' + (add>1?'s':'') + ' créée' + (add>1?'s':'') + ' : nommez chaque presse et qualifiez sa connexion.'); return; }
  if (a === 'nsp') { const p = S.presses[Number(b.dataset.i)], f = b.dataset.f; if (!p.nsp) p.nsp = {rebutes:false,hArret:false,hReglage:false}; p.nsp[f] = !p.nsp[f]; if (p.nsp[f]) p[f] = ''; dirty = true; render(true); if (!p.nsp[f]) $(`[data-k="presses.${b.dataset.i}.${f}"]`)?.focus(); return; }
  if (a === 'addPress') { S.presses.push(blankPress()); dirty = true; render(true); const ins = $$('.press-head input'); ins[ins.length-1]?.focus(); }
  if (a === 'delPress') { const i = Number(b.dataset.i); if (await ask('Retirer « ' + (S.presses[i].nom || 'Presse ' + (i+1)) + ' » et ses pertes saisies ?')) { S.presses.splice(i,1); dirty = true; render(true); } }
  if (a === 'reset' && (!dirty || await ask('Effacer la mission en cours ? Exportez-la d’abord si nécessaire.'))) { S = blank(); dirty = false; lastExport = ''; location.hash = '#mission'; render(); }
  if (a === 'exemple' && (!dirty || await ask('Remplacer la saisie par l’exemple fictif ? Exportez-la d’abord si nécessaire.'))) { if (location.hash !== '#mission') location.hash = '#mission'; example(); }
  if (a === 'print') { try { window.print(); } catch { toast('Impression indisponible ici : utilisez « Télécharger le rapport ».'); } }
  if (a === 'dlReport') { download('VP-Scan-rapport-' + slug() + '.html', standaloneReport(), 'text/html'); toast('Rapport téléchargé. Ouvrez-le puis imprimez-le en PDF si besoin.'); }
});
$('#file').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return;
  try { if (f.size > 10e6) throw Error('Fichier trop volumineux.'); const j = JSON.parse(await f.text()); if (j.app !== 'vp-scan' || ![1,2,3,4].includes(j.version)) throw Error('Ce fichier n’est pas une mission VP Scan.');
    const next = j.version === 4 ? merge(blank(), j.data) : fromV3(j.data || {});
    if (j.version === 4) next.presses = (j.data.presses || []).map(p => merge(blankPress(), p));
    if (dirty && !await ask('Remplacer la mission en cours ? Exportez-la d’abord si nécessaire.')) return;
    S = next; dirty = false; lastExport = ''; render(); toast(j.version === 4 ? 'Mission importée.' : 'Ancienne mission importée : vérifiez sources et coûts, les détails non repris restent dans le fichier d’origine.');
  } catch (err) { await ask('Import refusé, mission actuelle conservée. ' + err.message, true); } finally { e.target.value = ''; } });
window.addEventListener('hashchange', () => render());
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
render();
})();
