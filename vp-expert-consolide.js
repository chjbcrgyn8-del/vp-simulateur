/* VP Expert DEV consolidation. No backend, no permissions, no approval engine.
   The existing enquiry is the only owner of QQOQCP and recorded control outcomes.
   Documentary IDs are namespaced: legacy DC IDs are NOT a join key.
   Révision 2026-11-02 (retours Henry) : dossier et sources déplacés en bas de page, sources réduites aux liens,
   question « Pourquoi » (conséquence, criticité), bilan de l'action, synthèse pour la direction,
   cause ajoutée par l'atelier et mémoire atelier locale (retour d'expérience). */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), clone=x=>JSON.parse(JSON.stringify(x));
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const VERSION='VP-DEV-CONSOLIDE-2026-10-30-1';
 const CONTEXT={caseId:'Référence du dossier',machine:'Machine : référence exacte',equipment:'Moule, outil et montage',material:'Matière, grade et lot',quality:'Critères qualité et règle de décision',measurement:'Moyens, méthode et conditions de mesure',reference:'Notice, gamme et références disponibles',notes:'Chronologie et observations complémentaires'};
 const TRIAL={objective:'Hypothèse à examiner et objectif',before:'Situation initiale et pièces repérées',protocol:'Protocole proposé : variable isolée et comparabilité',acceptance:'Critères de réussite et durée de suivi',stop:'Conditions d’arrêt et risques',authority:'Autorisation à obtenir : responsable et référence',evidence:'Preuves attendues et références'};
 const RESULT={execution:'Intervention déclarée : date, opérateur et conditions',after:'Résultats après : méthode et pièces repérées',effects:'Effets secondaires et autres caractéristiques',followup:'Tenue du résultat et récidives',qualityReview:'Décision qualité déclarée et référence',assessment:'Conclusion déclarée, limites et contre-hypothèses'};
 const BILAN={cause:'',action:'',outcome:''};
 const OUTCOME=[['disparu','Défaut disparu'],['attenue','Défaut atténué'],['sans','Pas d’effet'],['nonverif','Pas encore vérifié']];
 const POURQUOI=[['aspect','Défaut d’aspect, pièce acceptable sous dérogation'],['tri','Tri ou retouche nécessaires'],['fonction','Pièce non fonctionnelle ou non montable'],['securite','Risque sécurité ou réglementaire']];
 const CRIT=[['faible','Faible'],['moyenne','Moyenne'],['forte','Forte']];
 const lab=(l,v)=>(l.find(x=>x[0]===v)||[,''])[1];
 const NOTICE='Démonstration documentaire. Toute saisie est déclarative, non vérifiée. Une publication, un clic ou une référence d’autorisation ne valide aucune action. Aucun réglage automatique, modèle causal calibré ou connexion machine.';
 const blank=()=>({context:Object.fromEntries(Object.keys(CONTEXT).map(k=>[k,''])),trial:Object.fromEntries(Object.keys(TRIAL).map(k=>[k,''])),result:Object.fromEntries(Object.keys(RESULT).map(k=>[k,''])),bilan:{...BILAN},evidence:{},fictional:false});
 const normalize=r=>({...r,collect:r.collect||r.check,closure:r.closure||r.proof,refs:r.refs||r.sources||[],blocked:r.id==='CA01-R03'||!!r.blocked});
 // Explicit semantic crosswalk, not equality with the earlier native rule numbers.
 const DCMAP={M:['DC01-R01'],U:['DC01-R02','DC04-R01'],O:['DC01-R02'],T:['DC01-R03'],C:['DC01-R04'],B:['DC01-R04'],P:['DC01-R04'],N:['DC04-R02'],L:['DC04-R02','DC06-R03'],V:['DC04-R02'],F:['DC04-R04'],G:['DC04-R02','DC06-R02'],A:['DC05-R02','DC04-R03'],E:['DC06-R01','DC06-R03'],I:['DC04-R01'],S:['DC04-R03'],K:['DC01-R04'],R:['DC02-R01','DC02-R02']};
 (window.VPDC?.rules||[]).forEach(r=>{DCMAP['DOC'+r.id]=[r.id]});
 /* Lien seul : le détail (domaine, limites, repère) reste dans l'export et la page Sources et méthode. */
 const linkHTML=s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>${s.type?' <small>('+esc(s.type)+')</small>':''}`;
 /* ---------- Mémoire atelier locale : retours d'expérience et causes ajoutées (ce navigateur uniquement) ---------- */
 const store=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'{}');localStorage.setItem(k,JSON.stringify(v))}catch(e){return {}}};
 window.VPREX={
  all(sector){return (store('vp-expert-rex')[sector]||[])},
  list(sector,def){return this.all(sector).filter(e=>e.def===def)},
  count(sector,def,id){return this.list(sector,def).filter(e=>e.id===id).length},
  add(sector,e){const a=store('vp-expert-rex');(a[sector]=a[sector]||[]).push(e);store('vp-expert-rex',a)},
  clear(sector){const a=store('vp-expert-rex');delete a[sector];store('vp-expert-rex',a)}
 };
 window.VPCustom={
  list(sector,def){return ((store('vp-expert-custom')[sector]||{})[def]||[])},
  add(sector,def,c){const a=store('vp-expert-custom');a[sector]=a[sector]||{};(a[sector][def]=a[sector][def]||[]).push(c);store('vp-expert-custom',a)},
  remove(sector,def,id){const a=store('vp-expert-custom');if(a[sector]?.[def]){a[sector][def]=a[sector][def].filter(x=>x.id!==id);store('vp-expert-custom',a)}}
 };
 function rulesFor(api){
  const ADP=window.VP_SECTOR_ADAPTERS?.[api.sector];if(ADP)return ADP.rulesFor(api);
  if(api.sector!=='DC')return (window.VP_DOC.defects.find(d=>d.legacy===api.S.def)?.rules||[]).map(normalize);
  const ids=new Set();
  api.cands().forEach(c=>(DCMAP[c.id.split('_').pop()]||[]).forEach(id=>ids.add(id)));
  const family=api.S.def==='U05'?'DC02':api.S.def==='U09'?'DC03':api.S.def==='U10'?'DC05':api.S.def==='U11'?'DC06':api.S.def.startsWith('D')?'DC01':'DC04';
  window.VPDC.rules.forEach(r=>{if(r.id.startsWith(family))ids.add(r.id)});
  return window.VPDC.rules.map(normalize).filter(r=>ids.has(r.id));
 }
 function cardRules(api,card,all){
  const ADP=window.VP_SECTOR_ADAPTERS?.[api.sector];if(ADP)return ADP.cardRules(api,card,all);
  if(api.sector==='DC'){
   const k=card.dataset.id?.split('_').pop(),ids=DCMAP[k]||[];
   return all.filter(r=>ids.includes(r.id));
  }
  const text=card.querySelector('.ch b')?.textContent.toLowerCase()||'';
  // This is a thematic association for review, never a claim that a source
  // experimentally validates the complete legacy lever.
  const words={
   'CA01-R01':/matière|mélange|lot/,'CA01-R02':/vide|canaux|injection|moule/,'CA01-R03':/volume|dosage/,'CA01-R04':/température|vitesse/,
   'CA02-R02':/température|vitesse/,'CA02-R03':/matière|stock|lot/,'CA02-R04':/matière|mélange/,
   'CA03-R02':/vide|moule/,'CA03-R03':/matière|stock|lot/,'CA03-R04':/vulcan|température/,
   'TP01-R01':/fermeture|verrou|moule|joint|outillage/,'TP01-R02':/maintien|pression|commutation|vitesse/,'TP01-R03':/température|matière/,
   'TP02-R01':/volume|dose|matelas|clapet/,'TP02-R02':/température|vitesse|canaux|seuil/,'TP02-R03':/air|évent|empreinte/,'TP02-R04':/commutation/,
   'TP03-R02':/maintien|seuil/,'TP03-R03':/matelas|clapet|pression/,'TP03-R04':/température|refroid|géométr/
  };
  return all.filter(r=>words[r.id]?.test(text));
 }
 function cleanObject(x){if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Objet de dossier invalide');for(const k of Object.keys(x))if(['__proto__','prototype','constructor'].includes(k))throw Error('Clé interdite')}
 function textFields(obj,allowed){cleanObject(obj);if(Object.keys(obj).some(k=>!allowed.includes(k))||allowed.some(k=>typeof obj[k]!=='string'||obj[k].length>15000))throw Error('Champs du dossier invalides')}
 window.VPConsolidation={
  bind(api){
   document.body.classList.add('expert-consolide');
   let data=blank(),dirty=false,pending=null,hydrating=false,drafts={},activeKey=api.KEY(),rexSaved={};
   const defaults=clone(api.S),main=document.querySelector('main');
   const ADP=window.VP_SECTOR_ADAPTERS?.[api.sector];
   const sources=ADP?ADP.sources:api.sector==='DC'?Object.fromEntries(window.VPDC.sources.map(s=>[s.id,{...s,name:s.title}])):window.VP_DOC.sources;
   api.choices.pourquoi=POURQUOI.map(x=>x[0]);api.choices.crit=CRIT.map(x=>x[0]);
   const defLabel=()=>api.defectLabel?api.defectLabel():(quoi()||api.S.def);
   function quoi(){const s=[...document.querySelectorAll('#fiche span')].find(x=>(x.querySelector('i')||{}).textContent==='Quoi');if(!s)return '';const i=s.querySelector('i').textContent;return s.textContent.slice(s.textContent.indexOf(i)+i.length).trim()}
   /* ----- Dossier (exports, reprise, sources) : en bas de page, après l'enquête ----- */
   const bar=document.createElement('aside');bar.className='expert-dev';bar.id='expert-toolbar';
   bar.innerHTML=`<strong>Dossier VP Expert</strong><p>Démonstrateur public : les réponses et contrôles restent dans cette page, sans sauvegarde serveur. Exportez le dossier avant de quitter.</p><div class="expert-tools"><button class="expert-primary" id="expert-export">Exporter le dossier JSON</button><button id="expert-report">Télécharger la synthèse</button><button id="expert-import">Reprendre un dossier</button><button id="expert-new">Nouveau dossier</button>${api.sector==='DC'||ADP?.example?'<button id="expert-example">Essayer le cas fictif</button>':''}<a href="${ADP?.sourcesPage||'lot3-documentaire.html'}" data-keep>Sources et méthode</a></div><p id="expert-status" role="status">Le JSON consolidé utilise un nouveau format ; les anciens exports restent lisibles dans les pages historiques.</p><input hidden id="expert-file" type="file" accept=".json,application/json"><div id="expert-more"></div>`;
   const duo=main.querySelector('.vpduo');if(duo)main.insertBefore(bar,duo);else main.append(bar);
   const fields=(group,labels)=>`<div class="expert-grid">${Object.entries(labels).map(([k,t])=>`<label class="expert-field">${esc(t)}<textarea rows="2" maxlength="15000" data-expert-group="${group}" data-expert-field="${k}"></textarea></label>`).join('')}</div>`;
   const context=document.createElement('details');context.className='expert-panel';context.id='expert-context';
   context.innerHTML='<summary>Références du dossier : machine, matière, outillage et qualité</summary><p class="expert-muted">À renseigner une seule fois. Le QQOQCP ci-dessous demeure le seul questionnaire de description du défaut ; ses valeurs initiales sont des exemples, à vérifier.</p>'+fields('context',CONTEXT);
   const guide=window.VP_DOC?.collectionGuide?.[api.sector==='CA'?'Caoutchouc':'Thermoplastique'];
   if(api.sector!=='DC'&&!ADP&&guide)context.innerHTML+='<details class="expert-proof"><summary>Aide à la collecte : conventions et points de vigilance</summary>'+guide.map(g=>`<article><strong>${esc(g.title)}</strong><p>${esc(g.text)}</p><ul>${g.refs.map(id=>sources[id]?'<li>'+linkHTML(sources[id])+'</li>':'').join('')}</ul></article>`).join('')+'</details>';
   $('s2').insertBefore(context,$('qs'));
   /* Sources du défaut : liens seulement, en bas de page */
   const doc=document.createElement('details');doc.id='expert-doc-list';doc.className='expert-panel';
   $('expert-more').append(doc);
   /* ----- Étape « Essai et suivi » + bilan de l'action ----- */
   const steps=document.querySelector('.esteps');
   const nativeSteps=steps?steps.querySelectorAll('li').length:4;
   const nFollow=nativeSteps>=5?4:5,nSyn=nFollow+1;
   const follow=document.createElement('section');follow.id='expert-followup';follow.className='ebox';
   follow.innerHTML=`<h2><span class="num">${nFollow}</span> Essai, action et résultat</h2><p class="sl">Après les contrôles : préparer l’essai, corriger, puis dire ce que l’action a donné. C’est le résultat qui confirme la cause, pas le contrôle seul.</p>
<div class="expert-bilan" id="expert-bilan"><div class="q"><span class="ql">Cause</span><div><b>Cause retenue après contrôle</b><select id="bilan-cause" data-bilan="cause" aria-label="Cause retenue"><option value="">Choisir parmi les causes de l’étape précédente…</option></select><p class="hint">Les causes avec un écart observé apparaissent en premier.</p></div></div>
<div class="q"><span class="ql">Action</span><div><b>Action corrective réalisée</b><input id="bilan-action" data-bilan="action" maxlength="300" placeholder="Ex. : consigne ramenée à la fiche de réglage, circuit nettoyé, pièce remplacée" aria-label="Action réalisée"></div></div>
<div class="q"><span class="ql">Résultat</span><div><b>Résultat après action</b><div class="bopts" data-bilan-k="outcome">${OUTCOME.map(([v,l])=>`<button type="button" data-outcome="${v}" aria-pressed="false">${l}</button>`).join('')}</div><p class="hint" id="bilan-hint">Vérifier sur plusieurs cycles ou pièces avant de conclure.</p></div></div></div>
<details class="expert-panel"><summary>Préparer l’essai pour revue (détail)</summary>${fields('trial',TRIAL)}</details><details class="expert-panel"><summary>Consigner la comparaison avant / après et la décision qualité (détail)</summary>${fields('result',RESULT)}</details>`;
   $('s3').after(follow);
   /* ----- Synthèse pour la direction ----- */
   const syn=document.createElement('section');syn.id='expert-synthese';syn.className='ebox';
   syn.innerHTML=`<h2><span class="num">${nSyn}</span> Synthèse</h2><div id="syn-body"></div><div class="expert-tools syn-tools"><button type="button" class="expert-primary" id="syn-copy">Copier la synthèse</button><button type="button" id="syn-dl">Télécharger (.md)</button><button type="button" id="syn-export">Exporter le dossier JSON</button><button type="button" id="syn-print">Imprimer</button></div><p class="expert-muted">Synthèse générée à partir de vos réponses et constats, sans sauvegarde serveur. La cause est dite « confirmée » uniquement lorsque l’atelier déclare que le défaut a disparu après l’action ; la validation qualité reste nécessaire.</p>`;
   follow.after(syn);
   if(steps){if(nativeSteps<5){const li=document.createElement('li');li.dataset.n=String(nFollow);li.textContent='Essai et suivi';steps.append(li)}if(steps.querySelectorAll('li').length<nSyn){const li2=document.createElement('li');li2.dataset.n=String(nSyn);li2.textContent='Synthèse';steps.append(li2)}document.body.classList.add('steps-'+(nSyn))}
   const dialog=document.createElement('dialog');dialog.id='expert-dialog';dialog.innerHTML='<h2>Remplacer le dossier en cours ?</h2><p>Le contenu actuel sera remplacé. Exportez-le d’abord si vous souhaitez le conserver.</p><div class="expert-tools"><button id="expert-cancel">Annuler</button><button class="expert-primary" id="expert-confirm">Remplacer le dossier</button></div>';document.body.append(dialog);
   const status=t=>$('expert-status').textContent=t;
   /* ----- Lecture de l'état des causes dans la liste rendue ----- */
   function causes(){return [...document.querySelectorAll('#res .cc')].map((el,i)=>({id:el.dataset.id,name:el.dataset.name||nameOf(el),rank:i+1,state:el.classList.contains('found')?'nc':el.classList.contains('done')?'ok':'open',ctl:(el.querySelector('p')?.textContent||'').replace(/^.*Contrôle :\s*/,''),rex:el.classList.contains('rex')}))}
   function nameOf(el){const b=el.querySelector('.ch b');if(!b)return '';return [...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()}
   /* ----- Question « Pourquoi » (QQOQCP) injectée dans l'enquête ----- */
   function pourquoi(){const qs=$('qs');if(!qs||qs.querySelector('[data-k="pourquoi"]'))return;
    const pill=(k,list)=>`<div class="opts" data-k="${k}">`+list.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${api.S[k]===v}">${esc(l)}</button>`).join('')+'</div>';
    const div=document.createElement('div');div.className='q qp';div.innerHTML=`<span class="ql">Pourquoi</span><div><b>Pourquoi est-ce un problème ?</b>${pill('pourquoi',POURQUOI)}<p class="ml">Criticité</p>${pill('crit',CRIT)}<p class="hint">Conséquence et criticité orientent le confinement et la priorité, pas le classement des causes.</p></div>`;
    qs.append(div);
    const f=$('fiche');if(f&&(api.S.pourquoi||api.S.crit)){const sp=document.createElement('span');sp.innerHTML='<i>Pourquoi</i> '+esc([lab(POURQUOI,api.S.pourquoi),api.S.crit?'criticité '+lab(CRIT,api.S.crit).toLowerCase():''].filter(Boolean).join(', '));f.append(sp)}}
   /* ----- Cause ajoutée par l'atelier ----- */
   function addForm(){const res=$('res');if(!res||res.querySelector('.expert-add')||api.S.br==='derive')return;
    const fam=api.families||['Matière','Machine','Outillage','Méthode','Milieu','Main-d’œuvre'];
    const d=document.createElement('details');d.className='expert-add';d.innerHTML=`<summary>Ajouter une cause non listée</summary><div class="expert-addf"><label>Cause<input id="add-n" maxlength="120" placeholder="Ex. : joint de buse fuyard"></label><label>Famille<select id="add-b">${fam.map(f=>`<option>${esc(f)}</option>`).join('')}</select></label><label>Contrôle à faire<input id="add-c" maxlength="200" placeholder="Ex. : inspecter la buse à chaud"></label><button type="button" class="expert-primary" id="add-go">Ajouter à la liste</button></div><p class="expert-muted">La cause est ajoutée à cette enquête, mémorisée dans ce navigateur pour ce défaut et marquée « ajoutée par l’atelier », en attente de validation par l’expert.</p>`;
    const pr=res.querySelector('.pr');if(pr)res.insertBefore(d,pr);else res.append(d);
    if(api.sector!=='TP'){const list=window.VPCustom.list(api.sector,api.S.def);if(list.length){const w=document.createElement('div');w.className='cl expert-custom';w.innerHTML=list.map(c=>`<div class="cc" data-id="${esc(c.id)}" data-name="${esc(c.n)}"><div class="ch"><span class="rk">+</span><b>${esc(c.n)}<span class="tg atelier">Ajoutée par l’atelier</span></b></div><p><span class="fam">${esc(c.b)}</span> <b>Contrôle :</b> ${esc(c.ctl||'à définir')}</p><p class="why">Cause proposée par l’atelier le ${esc(c.date)}, à valider par l’expert. <button type="button" class="lk" data-rmcustom="${esc(c.id)}">Retirer</button></p></div>`).join('');res.insertBefore(w,d)}}}
   document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.id==='add-go'){const n=$('add-n').value.trim();if(!n){$('add-n').focus();return}window.VPCustom.add(api.sector,api.S.def,{id:'x'+Date.now().toString(36),n,b:$('add-b').value,ctl:$('add-c').value.trim(),date:new Date().toLocaleDateString('fr-FR')});api.render();status('Cause ajoutée par l’atelier : elle apparaît dans la liste et sera reproposée pour ce défaut dans ce navigateur.');return}
    if(b.dataset.rmcustom){window.VPCustom.remove(api.sector,api.S.def,b.dataset.rmcustom);api.render();return}
    if(b.dataset.outcome){data.bilan.outcome=data.bilan.outcome===b.dataset.outcome?'':b.dataset.outcome;dirty=true;drawBilan();drawSyn();return}
    if(b.id==='rex-save'){saveRex();return}
    if(b.id==='rex-clear'){if(confirm('Effacer la mémoire atelier de ce navigateur pour ce secteur ?')){window.VPREX.clear(api.sector);api.render();status('Mémoire atelier effacée.')}return}
    if(b.id==='syn-copy'){navigator.clipboard?.writeText(synText()).then(()=>status('Synthèse copiée.'),()=>status('Copie impossible : utilisez le téléchargement.'));return}
    if(b.id==='syn-dl'){download('Vella_Partners_Synthese_VP_Expert_'+api.sector+'.md',synText()+'\n\n---\n\n'+report(snapshot()),'text/markdown');return}
    if(b.id==='syn-export'){$('expert-export').click();return}
    if(b.id==='syn-print'){window.print();return}
   });
   document.addEventListener('input',e=>{const el=e.target;if(el.dataset.bilan){data.bilan[el.dataset.bilan]=el.value;dirty=true;drawSyn()}});
   document.addEventListener('change',e=>{const el=e.target;if(el.dataset.bilan){data.bilan[el.dataset.bilan]=el.value;dirty=true;drawSyn()}});
   function drawBilan(){const sel=$('bilan-cause');if(!sel)return;const C=causes(),cur=data.bilan.cause;
    const opts=[...C.filter(c=>c.state==='nc'),...C.filter(c=>c.state!=='nc')];
    sel.innerHTML='<option value="">Choisir parmi les causes de l’étape précédente…</option>'+opts.map(c=>`<option value="${esc(c.name)}"${c.name===cur?' selected':''}>${c.state==='nc'?'Écart observé · ':''}${esc(c.name)}</option>`).join('')+(cur&&!opts.find(c=>c.name===cur)?`<option value="${esc(cur)}" selected>${esc(cur)}</option>`:'');
    $('bilan-action').value=data.bilan.action||'';
    follow.querySelectorAll('[data-outcome]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.outcome===data.bilan.outcome)));
    const h=$('bilan-hint');h.innerHTML=data.bilan.outcome==='disparu'&&data.bilan.cause?(rexSaved[api.KEY()]?'<b>Retour d’expérience mémorisé</b> : cette cause remontera dans les prochaines enquêtes sur ce défaut (mémoire de ce navigateur). À valider par la qualité et l’expert.':'Défaut disparu après action : <button type="button" class="lk" id="rex-save">mémoriser ce retour d’expérience</button> pour que la cause remonte lors des prochaines enquêtes sur ce défaut. Validation qualité toujours nécessaire.'):data.bilan.outcome==='disparu'?'Indiquez la cause retenue pour pouvoir mémoriser ce retour d’expérience.':'Vérifier sur plusieurs cycles ou pièces avant de conclure.'}
   function saveRex(){const C=causes(),c=C.find(x=>x.name===data.bilan.cause);const def=api.S.br==='derive'?'d|'+api.S.param:api.S.def;
    window.VPREX.add(api.sector,{def,id:c?c.id:'name:'+data.bilan.cause,name:data.bilan.cause,action:data.bilan.action,ctx:{ou:api.S.ou,quand:api.S.quand,freq:api.S.freq,terme:api.S.terme},date:new Date().toLocaleDateString('fr-FR')});
    rexSaved[api.KEY()]=true;api.render();status('Retour d’expérience mémorisé dans ce navigateur. Dans l’espace client, cette mémoire est partagée par site et validée par le responsable.')}
   /* ----- Synthèse ----- */
   function synData(){const C=causes(),nc=C.filter(c=>c.state==='nc'),ok=C.filter(c=>c.state==='ok'),open=C.filter(c=>c.state==='open');
    const M=api.measures?api.measures():[];const b=data.bilan;const def=defLabel();
    const fiche=[...document.querySelectorAll('#fiche span')].map(s=>{const i=s.querySelector('i');return [i?i.textContent:'',s.textContent.replace(i?i.textContent:'','').trim()]});
    const ctx=[data.context.machine&&'machine '+data.context.machine,data.context.material&&'matière '+data.context.material,data.context.equipment&&'outillage '+data.context.equipment].filter(Boolean);
    let probable,statusTxt,statusCls;
    if(b.outcome==='disparu'&&b.cause){probable=[b.cause];statusTxt=`Cause confirmée par l’atelier : « ${b.cause} ». Le défaut a disparu après l’action${b.action?' « '+b.action+' »':''}. À faire valider par la qualité ; ${rexSaved[api.KEY()]?'retour d’expérience mémorisé.':'retour d’expérience à mémoriser (étape '+nFollow+').'}`;statusCls='ok'}
    else if(b.outcome==='attenue'&&b.cause){probable=[b.cause,...nc.filter(c=>c.name!==b.cause).map(c=>c.name)];statusTxt=`Action partiellement efficace : « ${b.cause} » contribue au défaut sans l’expliquer seule. Poursuivre les contrôles${open[0]?' (suivant : '+open[0].name+')':''}.`;statusCls='warn'}
    else if(b.outcome==='sans'&&b.cause){probable=nc.filter(c=>c.name!==b.cause).map(c=>c.name);if(!probable.length)probable=open.slice(0,2).map(c=>c.name);statusTxt=`Action sans effet : « ${b.cause} » écartée pour ce cas. Reprendre avec ${probable[0]?'« '+probable[0]+' »':'le contrôle suivant'}.`;statusCls='warn'}
    else if(nc.length){probable=nc.map(c=>c.name);statusTxt=`${nc.length} écart${nc.length>1?'s':''} observé${nc.length>1?'s':''} : cause${nc.length>1?'s':''} probable${nc.length>1?'s':''} à corriger puis à vérifier sur pièces. Non confirmée tant que le résultat de l’action n’est pas constaté.`;statusCls='warn'}
    else{probable=open.slice(0,2).map(c=>c.name);statusTxt=ok.length?`${ok.length} contrôle${ok.length>1?'s':''} conforme${ok.length>1?'s':''}, aucun écart pour l’instant. Prochain contrôle : ${open[0]?open[0].name:'aucun, solliciter une revue métier'}.`:'Enquête en cours : aucun contrôle encore enregistré. Contrôler en priorité les causes ci-contre.';statusCls=''}
    const mesAlert=M.filter(m=>m.status==='hors'||m.adverse||m.trend==='defav'),mesOk=M.filter(m=>m.status==='ok'&&m.trend!=='defav'),mesNone=M.filter(m=>m.status==='none');
    const done=[...api.HIST.filter(h=>h.key===api.KEY()).slice().reverse().map(h=>h.c+' : '+(h.r==='nc'?'écart observé':'conforme')+' ('+h.t+')'),b.action?'Action : '+b.action+(b.outcome?' → '+lab(OUTCOME,b.outcome).toLowerCase():''):'',data.result.execution?'Intervention : '+data.result.execution:''].filter(Boolean);
    const todo=[];if(!(b.outcome==='disparu'&&b.cause)){nc.forEach(c=>todo.push('Corriger « '+c.name+' » puis vérifier sur pièces'));open.slice(0,2).forEach(c=>todo.push('Contrôler : '+c.name+(c.ctl?' — '+c.ctl:'')));if(mesAlert.length)todo.push('Surveiller : '+mesAlert.map(m=>m.name).join(', '));if(data.trial.objective)todo.push('Essai prévu : '+data.trial.objective)}else{todo.push('Validation qualité de la cause et de l’action');if(data.result.followup)todo.push('Tenue du résultat : '+data.result.followup);else todo.push('Vérifier la tenue du résultat sur les OF suivants')}
    const rex=window.VPREX.list(api.sector,api.S.br==='derive'?'d|'+api.S.param:api.S.def);
    return {def,fiche,ctx,probable,statusTxt,statusCls,M,mesAlert,mesOk,mesNone,done,todo,nc,ok,open,rex,b,C};}
   function drawSyn(){const body=$('syn-body');if(!body)return;const d=synData();
    const li=a=>a.length?'<ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p class="expert-muted">—</p>';
    const fiche=d.fiche.filter(x=>x[0]!=='Quoi').map(([k,v])=>`<span><i>${esc(k)}</i> ${esc(v)}</span>`).join('');
    body.innerHTML=`<div class="syn-head"><p class="syn-def"><b>${esc(d.def)}</b>${d.ctx.length?' · '+esc(d.ctx.join(' · ')):''}</p><p class="fiche syn-fiche">${fiche||'<span class="expert-muted">Décrivez le défaut à l’étape 2.</span>'}</p></div>
<div class="syn-grid">
<div class="syn-card syn-main"><h3>${d.b.outcome==='disparu'&&d.b.cause?'Cause confirmée par l’atelier':d.nc.length||d.b.cause?'Cause(s) probable(s)':'À contrôler en priorité'}</h3>${d.probable.length?'<ol>'+d.probable.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'<p class="expert-muted">Répondez à l’enquête pour classer les causes.</p>'}${d.rex.length?`<p class="syn-rex">Mémoire atelier : ${d.rex.length} retour${d.rex.length>1?'s':''} d’expérience sur ce défaut (${[...new Set(d.rex.map(r=>r.name))].slice(0,3).map(esc).join(', ')}). <button type="button" class="lk" id="rex-clear">Effacer</button></p>`:''}</div>
${api.measures?`<div class="syn-card"><h3>Mesures de la presse</h3>${d.M.length?(d.mesAlert.length?'<p><b>À surveiller :</b> '+d.mesAlert.map(m=>esc(m.name)+' ('+esc(m.txt.toLowerCase())+(m.cur?' : '+esc(m.cur)+' '+esc(m.unit)+' pour '+esc(m.set):'')+')').join(' ; ')+'.</p>':'')+(d.mesOk.length?'<p>Conformes et stables : '+d.mesOk.map(m=>esc(m.name)).join(', ')+'.</p>':'')+(d.mesNone.length?'<p class="expert-muted">Non relevées : '+d.mesNone.map(m=>esc(m.name)).join(', ')+'.</p>':''):'<p class="expert-muted">Aucune mesure reliée à ce défaut ou pas de relevé.</p>'}</div>`:''}
<div class="syn-card"><h3>Actions menées</h3>${li(d.done)}</div>
<div class="syn-card"><h3>Actions à mener</h3>${li(d.todo)}</div>
</div>
<p class="syn-status ${d.statusCls}"><b>Statut :</b> ${esc(d.statusTxt)}</p>`;}
   function synText(){const d=synData();const L=[];L.push('# Synthèse VP Expert — '+d.def);L.push('');L.push('Vella Partners · '+new Date().toLocaleDateString('fr-FR')+(d.ctx.length?' · '+d.ctx.join(' · '):''));L.push('');
    L.push('**Défaut** : '+d.def+(d.fiche.filter(x=>x[0]!=='Quoi').length?' — '+d.fiche.filter(x=>x[0]!=='Quoi').map(([k,v])=>k.toLowerCase()+' : '+v).join(' ; '):''));L.push('');
    L.push('**'+(d.b.outcome==='disparu'&&d.b.cause?'Cause confirmée par l’atelier':d.nc.length||d.b.cause?'Cause(s) probable(s)':'À contrôler en priorité')+'** : '+(d.probable.join(' ; ')||'—'));L.push('');
    L.push('**Statut** : '+d.statusTxt);L.push('');
    if(d.M.length){L.push('**Mesures de la presse** : '+(d.mesAlert.length?'à surveiller — '+d.mesAlert.map(m=>m.name+' ('+m.txt.toLowerCase()+(m.cur?' : '+m.cur+' '+m.unit+' pour '+m.set:'')+')').join(' ; ')+'. ':'')+(d.mesOk.length?'Conformes et stables : '+d.mesOk.map(m=>m.name).join(', ')+'. ':'')+(d.mesNone.length?'Non relevées : '+d.mesNone.map(m=>m.name).join(', ')+'.':''));L.push('')}
    L.push('**Actions menées** :');(d.done.length?d.done:['—']).forEach(x=>L.push('- '+x));L.push('');
    L.push('**Actions à mener** :');(d.todo.length?d.todo:['—']).forEach(x=>L.push('- '+x));L.push('');
    if(d.rex.length)L.push('Mémoire atelier : '+d.rex.length+' retour(s) d’expérience sur ce défaut.');
    L.push('');L.push('Classement indicatif, contrôles déclarés par l’atelier ; validation qualité nécessaire avant toute conclusion.');return L.join('\n')}
   function enhance(){
    if(activeKey!==api.KEY()){
     drafts[activeKey]={trial:clone(data.trial),result:clone(data.result),bilan:clone(data.bilan)};
     activeKey=api.KEY();const saved=drafts[activeKey]||blank();
     data.trial=clone(saved.trial);data.result=clone(saved.result);data.bilan=clone(saved.bilan||BILAN);
     document.querySelectorAll('[data-expert-group="trial"],[data-expert-group="result"]').forEach(el=>el.value=data[el.dataset.expertGroup][el.dataset.expertField]);
     status('Périmètre changé : essai, bilan et résultats séparés pour ce défaut / mode / configuration. Le contexte matériel est conservé, à reconfirmer. Export limité au cas sélectionné.');
    }
    const rules=rulesFor(api),refs=[...new Set(rules.flatMap(r=>r.refs||[]))].filter(id=>sources[id]);
    doc.innerHTML='<summary>Sources consultées pour ce défaut'+(refs.length?' · '+refs.length+' lien'+(refs.length>1?'s':''):'')+'</summary><p class="expert-muted">Liens seulement. Le détail des domaines, limites et repères reste dans la page « Sources et méthode » et dans l’export du dossier.</p>'+(refs.length?'<ul class="expert-links">'+refs.map(id=>'<li>'+linkHTML(sources[id])+'</li>').join('')+'</ul>':'<p class="expert-muted">Pas de source qualifiée dans ce lot pour le défaut sélectionné.</p>');
    pourquoi();addForm();
    document.querySelectorAll('#res .cc').forEach(card=>{
     if(card.querySelector('.expert-proof'))return;
     const id=api.KEY()+'::'+card.dataset.id,related=cardRules(api,card,rules),details=document.createElement('details');
     if(api.sector!=='TP'){const rx=window.VPREX.count(api.sector,api.S.def,card.dataset.id);if(rx&&!card.querySelector('.tg.rex')){card.classList.add('rex');const b=card.querySelector('.ch b');if(b)b.insertAdjacentHTML('beforeend','<span class="tg rex">Retour d’expérience</span>');const w=card.querySelector('.why');if(w)w.insertAdjacentHTML('beforeend',' · <b>retour d’expérience atelier :</b> cause confirmée '+rx+' fois sur ce défaut')}}
     const links=[...new Set(related.flatMap(r=>r.refs||[]))].filter(x=>sources[x]);
     details.className='expert-proof';details.innerHTML='<summary>Noter un constat</summary>'+`<label class="expert-field">Constat, mesure et référence de preuve<textarea rows="2" maxlength="15000" data-expert-evidence="${esc(id)}">${esc(data.evidence[id]||'')}</textarea></label>`+(links.length?'<p class="expert-muted">Sources : '+links.map(x=>linkHTML(sources[x])).join(' · ')+'</p>':'');
     card.append(details);
    });
    drawBilan();drawSyn();
    if(!hydrating)dirty=true;
   }
   function fill(){document.querySelectorAll('[data-expert-group]').forEach(el=>el.value=data[el.dataset.expertGroup][el.dataset.expertField]);document.querySelectorAll('.expert-proof').forEach(el=>el.remove());enhance();bar.querySelector('strong').textContent='Dossier VP Expert'+(data.fictional?' · CAS ENTIÈREMENT FICTIF':'')}
   function snapshot(){
    const key=api.KEY(),native={state:clone(api.S),description:$('fiche')?.textContent.trim()||'',key,nonconforming:clone(api.REC[key]||{}),conforming:clone(api.OK[key]||{}),history:clone(api.HIST.filter(h=>h.key===key))};
    const evidence=Object.fromEntries(Object.entries(data.evidence).filter(([k])=>k.startsWith(key+'::')));
    const rules=rulesFor(api),refs=[...new Set(rules.flatMap(r=>r.refs||[]))];
    return {schema:'vp-expert-consolide',version:1,documentaryVersion:VERSION,sector:api.sector,case:{...clone(data),evidence,native,custom:window.VPCustom.list(api.sector,api.S.def)},measures:api.measures?api.measures():[],synthese:synText(),documentation:{rules:rules.map(r=>({...r,namespace:'documentary',status:r.blocked?'blocked':'candidate'})),sources:refs.filter(id=>sources[id]).map(id=>({id,...sources[id]}))},notice:NOTICE};
   }
   function clearNative(){for(const target of [api.REC,api.OK,api.NUM])for(const key of Object.keys(target))delete target[key];api.HIST.splice(0)}
   function load(x){hydrating=true;data=clone(x.case);const n=data.native;delete data.native;delete data.custom;data.bilan=data.bilan||{...BILAN};clearNative();Object.keys(api.S).forEach(k=>delete api.S[k]);Object.assign(api.S,n.state);drafts={};activeKey=api.KEY();api.REC[api.KEY()]=clone(n.nonconforming);api.OK[api.KEY()]=clone(n.conforming);api.HIST.push(...n.history.map(h=>({...h,key:api.KEY()})));
    // A new native case always starts at revision 0; move its evidence keys too.
    data.evidence=Object.fromEntries(Object.entries(data.evidence).map(([k,v])=>[api.KEY()+'::'+k.split('::').slice(1).join('::'),v]));
    api.render();fill();hydrating=false;dirty=true;status('Dossier repris. Les constats et autorisations restent déclaratifs, non authentifiés.');}
   function validate(x){
    cleanObject(x);if(x.schema!=='vp-expert-consolide'||x.version!==1||x.documentaryVersion!==VERSION||x.sector!==api.sector)throw Error('Format ou secteur incompatible. Ouvrez le bon parcours ; les anciens formats restent dans les pages historiques.');
    const c=x.case;cleanObject(c);if(Object.keys(c).some(k=>!['context','trial','result','bilan','evidence','fictional','native','custom'].includes(k))||typeof c.fictional!=='boolean')throw Error('Structure de dossier invalide');
    textFields(c.context,Object.keys(CONTEXT));textFields(c.trial,Object.keys(TRIAL));textFields(c.result,Object.keys(RESULT));cleanObject(c.evidence);
    if(c.bilan!==undefined){textFields(c.bilan,Object.keys(BILAN));if(c.bilan.outcome&&!OUTCOME.find(o=>o[0]===c.bilan.outcome))throw Error('Résultat invalide')}
    if(Object.entries(c.evidence).some(([k,v])=>k.length>300||typeof v!=='string'||v.length>15000)||Object.keys(c.evidence).length>200)throw Error('Preuves invalides');
    const n=c.native;cleanObject(n);cleanObject(n.state);if(typeof n.key!=='string'||n.key.length>200)throw Error('Clé de cas invalide');
    for(const [k,v] of Object.entries(n.state)){if(v===undefined)continue;if(!Object.hasOwn(api.choices,k))throw Error('Champ enquête inconnu');const a=api.choices[k];if(a==='text'?(typeof v!=='string'||v.length>200):a==='boolean'?typeof v!=='boolean':a==='object'?(typeof v!=='object'||v===null||Array.isArray(v)||Object.keys(v).length>30||Object.values(v).some(z=>!['number','string'].includes(typeof z)||String(z).length>30)):!a.includes(v))throw Error('Valeur enquête invalide : '+k);}
    if(!n.state.def||!n.state.br||!n.state.param||typeof n.state.qd!=='string'||!n.state.fam||((api.sector==='DC'||api.sector==='TS')&&!n.state.mach)||(api.sector!=='TP'&&!n.state.dir))throw Error('Enquête incomplète');
    for(const values of [n.nonconforming,n.conforming]){cleanObject(values);if(Object.keys(values).length>100||Object.entries(values).some(([id,v])=>id.length>100||v!==1))throw Error('Contrôles invalides')}
    if(!Array.isArray(n.history)||n.history.length>200)throw Error('Journal invalide');
    n.history.forEach(h=>{cleanObject(h);if(Object.keys(h).some(k=>!['key','id','r','g','t','d','c'].includes(k))||!['ok','nc'].includes(h.r)||!/^\d{2}:\d{2}$/.test(h.t)||['id','key','d','c'].some(k=>typeof h[k]!=='string'||h[k].length>1000)||(h.g!==undefined&&typeof h.g!=='boolean'))throw Error('Entrée de journal invalide')});
    return x;
   }
   function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
   function report(x){const c=x.case,n=c.native,txt=s=>String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    let m='# Vella Partners | Dossier VP Expert\n\n'+(c.fictional?'CAS ENTIÈREMENT FICTIF. Mesures, interventions, autorisations et conclusions inventées.\n\n':'')+NOTICE+'\n\nSecteur : '+x.sector+' ; défaut : '+n.state.def+'.\n\n## Contexte\n\n';
    for(const [group,labels] of [['context',CONTEXT],['trial',TRIAL],['result',RESULT]]){if(group!=='context')m+='\n## '+(group==='trial'?'Essai proposé, non autorisé par l’application':'Résultats déclarés')+'\n\n';for(const[k,label]of Object.entries(labels))m+='- '+label+' : '+txt(c[group][k]||'Non renseigné')+'\n';}
    m+='\n## Bilan de l’action\n\n- Cause retenue : '+txt(c.bilan?.cause||'Non renseignée')+'\n- Action : '+txt(c.bilan?.action||'Non renseignée')+'\n- Résultat : '+txt(lab(OUTCOME,c.bilan?.outcome)||'Non renseigné')+'\n';
    if(x.measures?.length)m+='\n## Mesures de la presse\n\n'+x.measures.map(me=>'- '+me.name+' : consigne '+me.set+' '+me.unit+(me.cur?' ; valeur '+me.cur+' '+me.unit:' ; pas de relevé')+(me.avg?' ; moyenne OF précédents '+me.avg+' '+me.unit:'')+' ; '+me.txt).join('\n')+'\n';
    m+='\n## Questionnaire et contrôles du cas sélectionné\n\nLes valeurs initiales du questionnaire sont démonstratives : elles doivent être vérifiées. Classement illustratif, pas une probabilité.\n\n'+txt(n.description||'')+'\n\n'+Object.entries(n.state).filter(([k])=>!['fam','qd','more','showall','mes'].includes(k)).map(([k,v])=>'- '+k+' : '+txt(v)).join('\n')+'\n\n';
    m+=n.history.length?n.history.map(h=>'- '+txt(h.c)+' : '+(h.r==='nc'?'écart déclaré, cause non démontrée':'contrôle déclaré conforme, pas une validation de cause')+' ('+h.t+')').join('\n'):'Aucun contrôle enregistré.';
    if(c.custom?.length)m+='\n\n## Causes ajoutées par l’atelier\n\n'+c.custom.map(k=>'- '+txt(k.n)+' ('+txt(k.b)+') : '+txt(k.ctl||'contrôle à définir')+' — ajoutée le '+txt(k.date)+', à valider par l’expert').join('\n');
    m+='\n\n## Constats et références de preuves\n\n'+Object.entries(c.evidence).map(([k,v])=>'- '+txt(k)+' : '+txt(v)).join('\n');
    m+='\n\n## Repères documentaires candidats\n\n'+x.documentation.rules.map(r=>'- '+r.id+' : '+r.title+' ('+r.status+')\n  - À recueillir : '+r.collect+'\n  - Limites : '+r.caution+'\n  - Clôture attendue : '+r.closure+(r.review?'\n  - Complément : '+r.review.finding+'\n  - Portée : '+r.review.limit:'')).join('\n');
    m+='\n\n## Sources, domaines et limites\n\n'+x.documentation.sources.map(s=>'- ['+s.name+']('+s.url+')\n  - Domaine : '+s.scope+'\n  - Limites : '+s.limit).join('\n');
    return m+'\n\nConclusion de l’application : la cause n’est confirmée que par le résultat déclaré de l’action, à valider par la qualité. Aucun gain industriel ni autorisation d’essai certifiés.\n';
   }
   function replace(fn){pending=fn;dialog.showModal();$('expert-cancel').focus()}
   $('expert-cancel').onclick=()=>{pending=null;dialog.close()};
   dialog.addEventListener('cancel',()=>{pending=null});
   $('expert-confirm').onclick=()=>{dialog.close();const fn=pending;pending=null;fn?.()};
   $('expert-export').onclick=()=>{
    download('Vella_Partners_VP_Expert_'+api.sector+'.json',JSON.stringify(snapshot(),null,2),'application/json');
    const key=api.KEY();
    dirty=Object.keys(data.evidence).some(k=>!k.startsWith(key+'::'))||api.HIST.some(h=>h.key!==key)||Object.entries(drafts).some(([k,v])=>k!==key&&[...Object.values(v.trial),...Object.values(v.result)].some(Boolean));
    status('JSON exporté : contexte, contrôles et preuves du cas sélectionné, bilan, synthèse et sources.'+(dirty?' D’autres brouillons existent en mémoire : revenez à chacun pour l’exporter avant de quitter.':''));
   };
   $('expert-report').onclick=()=>download('Vella_Partners_Synthese_VP_Expert_'+api.sector+'.md',synText()+'\n\n---\n\n'+report(snapshot()),'text/markdown');
   $('expert-import').onclick=()=>$('expert-file').click();
   $('expert-file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>1000000)throw Error('Fichier trop volumineux');const x=validate(JSON.parse(await f.text()));replace(()=>load(x))}catch(err){status('Import refusé : '+err.message)}};
   const newCase=()=>replace(()=>{data=blank();drafts={};clearNative();api.S.br='sans';if(api.S.mes)api.S.mes={};delete api.S.pourquoi;delete api.S.crit;activeKey=api.KEY();api.render();fill();dirty=false;status('Nouveau dossier. Aucun constat ou résultat du précédent dossier n’est conservé dans cette enquête.')});
   $('expert-new').onclick=newCase;
   document.addEventListener('click',e=>{if(e.target.closest('[data-new]')){e.preventDefault();e.stopImmediatePropagation();newCase()}},true);
   document.addEventListener('input',e=>{const el=e.target;if(el.dataset.expertGroup){data[el.dataset.expertGroup][el.dataset.expertField]=el.value;dirty=true;drawSyn()}else if(el.dataset.expertEvidence){data.evidence[el.dataset.expertEvidence]=el.value;dirty=true}});
   function resizeFields(){document.querySelectorAll('[data-expert-group],[data-expert-evidence]').forEach(el=>{if(el.offsetParent!==null){el.style.height='auto';el.style.height=Math.min(420,Math.max(80,el.scrollHeight+3))+'px'}})}
   document.addEventListener('toggle',resizeFields,true);
   document.addEventListener('input',e=>{if(e.target.matches('[data-expert-group],[data-expert-evidence]'))resizeFields()});
   window.addEventListener('vp:enquete-render',enhance);
   window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
   const printChanges=[];
   window.addEventListener('beforeprint',()=>{document.querySelectorAll('.expert-panel,.expert-proof').forEach(d=>{printChanges.push([d,d.open]);d.open=true});document.querySelectorAll('[data-expert-group],[data-expert-evidence]').forEach(el=>{const p=document.createElement('p');p.className='expert-saved';p.textContent=el.value||'Non renseigné';el.after(p)})});
   window.addEventListener('afterprint',()=>{printChanges.splice(0).forEach(([d,v])=>d.open=v);document.querySelectorAll('.expert-saved').forEach(e=>e.remove())});
   function example(){
    const f=window.VPDC_COMPLETE.case,d=blank();d.fictional=true;
    Object.assign(d.context,{caseId:f.context.caseId,machine:f.context.machine,equipment:f.context.operation+'\n'+f.context.setup,material:f.context.material,quality:f.context.quality,measurement:f.context.measurement,reference:'Aucune notice réelle ; références F-* entièrement fictives.',notes:[f.context.symptom,f.context.timeline,f.context.fluid,f.context.architecture,'LFV : '+f.context.lfv].filter(Boolean).join('\n')});
    for(const k of Object.keys(TRIAL))d.trial[k]=f.trial[k]||'';for(const k of Object.keys(RESULT))d.result[k]=f.result[k]||'';
    const state={...defaults,def:'D02',br:'sans',mach:'canon',quand:'serie',freq:'chaque',terme:'moyen',ou:'od'},key='p|D02|canon#0';
    for(const [id,o]of Object.entries(f.observations))d.evidence[key+'::'+({ 'DC01-R01':'D02_M','DC01-R02':'D02_U','DC01-R03':'D02_T','DC01-R04':'D02_C'}[id]||id)]=[o.status,o.note,o.reference].filter(Boolean).join('\n');
    load({case:{...d,native:{state,key,conforming:{},nonconforming:{},history:[]}}});
    // No native status is silently promoted from fictional narrative or imported observation.
    $('expert-context').open=true;status('Cas fictif prérempli dans le même parcours. Aucun contrôle marqué automatiquement conforme ; les données et autorisations sont inventées.');
   }
   // Generic fictive example for sectors exposing an adapter (TS). DC keeps its historical loader.
   function exampleADP(){
    const f=ADP.example.spec,d=blank();d.fictional=true;
    for(const k of Object.keys(CONTEXT))d.context[k]=f.context[k]||'';
    for(const k of Object.keys(TRIAL))d.trial[k]=f.trial[k]||'';for(const k of Object.keys(RESULT))d.result[k]=f.result[k]||'';
    const state={...defaults,...f.state};
    for(const [id,o]of Object.entries(f.observations))d.evidence[f.key+'::'+id]=[o.status,o.note,o.reference].filter(Boolean).join('\n');
    load({case:{...d,native:{state,key:f.key,conforming:{},nonconforming:{},history:[]}}});
    $('expert-context').open=true;status('Cas fictif prérempli dans le même parcours. Aucun contrôle marqué automatiquement conforme ; les données et autorisations sont inventées.');
   }
   if(api.sector==='DC')$('expert-example').onclick=()=>replace(example);
   else if(ADP?.example)$('expert-example').onclick=()=>replace(exampleADP);
   hydrating=true;fill();hydrating=false;dirty=false;
   if(api.sector==='DC'&&new URLSearchParams(location.search).get('example')==='wear-thermal')example();
   if(ADP?.example&&new URLSearchParams(location.search).get('example')===ADP.example.query)exampleADP();
  }
 };
})();
