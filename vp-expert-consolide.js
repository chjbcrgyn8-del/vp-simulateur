/* VP Expert DEV consolidation. No backend, no permissions, no approval engine.
   The existing enquiry is the only owner of QQOQC and recorded control outcomes.
   Documentary IDs are namespaced: legacy DC IDs are NOT a join key. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), clone=x=>JSON.parse(JSON.stringify(x));
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const VERSION='VP-DEV-CONSOLIDE-2026-10-30-1';
 const CONTEXT={caseId:'Référence du dossier',machine:'Machine : référence exacte',equipment:'Moule, outil et montage',material:'Matière, grade et lot',quality:'Critères qualité et règle de décision',measurement:'Moyens, méthode et conditions de mesure',reference:'Notice, gamme et références disponibles',notes:'Chronologie et observations complémentaires'};
 const TRIAL={objective:'Hypothèse à examiner et objectif',before:'Situation initiale et pièces repérées',protocol:'Protocole proposé : variable isolée et comparabilité',acceptance:'Critères de réussite et durée de suivi',stop:'Conditions d’arrêt et risques',authority:'Autorisation à obtenir : responsable et référence',evidence:'Preuves attendues et références'};
 const RESULT={execution:'Intervention déclarée : date, opérateur et conditions',after:'Résultats après : méthode et pièces repérées',effects:'Effets secondaires et autres caractéristiques',followup:'Tenue du résultat et récidives',qualityReview:'Décision qualité déclarée et référence',assessment:'Conclusion déclarée, limites et contre-hypothèses'};
 const NOTICE='Démonstration documentaire. Toute saisie est déclarative, non vérifiée. Une publication, un clic ou une référence d’autorisation ne valide aucune action. Aucun réglage automatique, modèle causal calibré ou connexion machine.';
 const blank=()=>({context:Object.fromEntries(Object.keys(CONTEXT).map(k=>[k,''])),trial:Object.fromEntries(Object.keys(TRIAL).map(k=>[k,''])),result:Object.fromEntries(Object.keys(RESULT).map(k=>[k,''])),evidence:{},fictional:false});
 const normalize=r=>({...r,collect:r.collect||r.check,closure:r.closure||r.proof,refs:r.refs||r.sources||[],blocked:r.id==='CA01-R03'||!!r.blocked});
 // Explicit semantic crosswalk, not equality with the earlier native rule numbers.
 const DCMAP={M:['DC01-R01'],U:['DC01-R02','DC04-R01'],O:['DC01-R02'],T:['DC01-R03'],C:['DC01-R04'],B:['DC01-R04'],P:['DC01-R04'],N:['DC04-R02'],L:['DC04-R02','DC06-R03'],V:['DC04-R02'],F:['DC04-R04'],G:['DC04-R02','DC06-R02'],A:['DC05-R02','DC04-R03'],E:['DC06-R01','DC06-R03'],I:['DC04-R01'],S:['DC04-R03'],K:['DC01-R04'],R:['DC02-R01','DC02-R02']};
 (window.VPDC?.rules||[]).forEach(r=>{DCMAP['DOC'+r.id]=[r.id]});
 function sourceHTML(s){return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>. ${esc(s.type||'')}<br>Domaine : ${esc(s.scope||'non précisé')}<br>Limites : ${esc(s.limit||'à qualifier')}${s.locator?'<br>Repère : '+esc(s.locator):''}</li>`}
 function rulesFor(api){
  if(api.sector!=='DC')return (window.VP_DOC.defects.find(d=>d.legacy===api.S.def)?.rules||[]).map(normalize);
  const ids=new Set();
  api.cands().forEach(c=>(DCMAP[c.id.split('_').pop()]||[]).forEach(id=>ids.add(id)));
  const family=api.S.def==='U05'?'DC02':api.S.def==='U09'?'DC03':api.S.def==='U10'?'DC05':api.S.def==='U11'?'DC06':api.S.def.startsWith('D')?'DC01':'DC04';
  window.VPDC.rules.forEach(r=>{if(r.id.startsWith(family))ids.add(r.id)});
  return window.VPDC.rules.map(normalize).filter(r=>ids.has(r.id));
 }
 function cardRules(api,card,all){
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
   let data=blank(),dirty=false,pending=null,hydrating=false,drafts={},activeKey=api.KEY();
   const defaults=clone(api.S),main=document.querySelector('main');
   const sources=api.sector==='DC'?Object.fromEntries(window.VPDC.sources.map(s=>[s.id,{...s,name:s.title}])):window.VP_DOC.sources;
   const bar=document.createElement('aside');bar.className='expert-dev';bar.id='expert-toolbar';
   bar.innerHTML=`<strong>VP Expert · un seul dossier, du défaut au suivi</strong><p>Démonstrateur public. Les réponses et contrôles restent dans cette enquête. Les sources détaillent le raisonnement, sans créer d’action approuvée.</p><div class="expert-tools"><button class="expert-primary" id="expert-export">Exporter le dossier JSON</button><button id="expert-report">Synthèse du dossier</button><button id="expert-import">Reprendre un dossier</button><button id="expert-new">Nouveau dossier</button>${api.sector==='DC'?'<button id="expert-example">Essayer le cas fictif</button>':''}<a href="lot3-documentaire.html" data-keep>Sources et méthode</a></div><p id="expert-status" role="status">Pas de sauvegarde serveur. Exportez avant de quitter. Le JSON consolidé utilise un nouveau format ; les anciens exports restent lisibles dans les pages historiques.</p><input hidden id="expert-file" type="file" accept=".json,application/json">`;
   main.prepend(bar);
   // Keep dossier management secondary; the main task is still the enquiry.
   const actions=document.createElement('details');actions.id='expert-dossier-actions';
   const actionTitle=document.createElement('summary');actionTitle.textContent='Dossier : exports, reprise, exemple et sources';actions.append(actionTitle);
   actions.append(bar.querySelector('.expert-tools'),$('expert-status'),$('expert-file'));bar.append(actions);
   const fields=(group,labels)=>`<div class="expert-grid">${Object.entries(labels).map(([k,t])=>`<label class="expert-field">${esc(t)}<textarea rows="2" maxlength="15000" data-expert-group="${group}" data-expert-field="${k}"></textarea></label>`).join('')}</div>`;
   const context=document.createElement('details');context.className='expert-panel';context.id='expert-context';
   context.innerHTML='<summary>Références du dossier : machine, matière, outillage et qualité</summary><p class="expert-muted">À renseigner une seule fois. Le QQOQC ci-dessous demeure le seul questionnaire de description du défaut ; ses valeurs initiales sont des exemples, à vérifier.</p>'+fields('context',CONTEXT);
   const guide=window.VP_DOC?.collectionGuide?.[api.sector==='CA'?'Caoutchouc':'Thermoplastique'];
   if(api.sector!=='DC'&&guide)context.innerHTML+='<details class="expert-proof"><summary>Aide à la collecte : conventions et points de vigilance</summary>'+guide.map(g=>`<article><strong>${esc(g.title)}</strong><p>${esc(g.text)}</p><ul>${g.refs.map(id=>sourceHTML(sources[id])).join('')}</ul></article>`).join('')+'</details>';
   $('s2').insertBefore(context,$('qs'));
   const doc=document.createElement('details');doc.id='expert-doc-list';doc.className='expert-panel';
   $('s3').insertBefore(doc,$('res'));
   const follow=document.createElement('section');follow.id='expert-followup';follow.className='ebox';
   follow.innerHTML='<h2><span class="num">5</span> Préparer un essai et suivre le résultat</h2><p class="expert-muted">'+NOTICE+'</p><details class="expert-panel"><summary>Préparer l’essai pour revue, sans autorisation automatique</summary>'+fields('trial',TRIAL)+'</details><details class="expert-panel"><summary>Comparer les résultats et consigner la décision qualité</summary>'+fields('result',RESULT)+'</details><p class="expert-warning">Conclusion de l’application : cause non démontrée. L’outil conserve vos constats, mais ne certifie ni une cause, ni une autorisation, ni la conformité produit.</p>';
   $('s3').after(follow);
   const steps=document.querySelector('.esteps');if(steps){const li=document.createElement('li');li.dataset.n='5';li.textContent='Essai et suivi';steps.append(li)}
   const dialog=document.createElement('dialog');dialog.id='expert-dialog';dialog.innerHTML='<h2>Remplacer le dossier en cours ?</h2><p>Le contenu actuel sera remplacé. Exportez-le d’abord si vous souhaitez le conserver.</p><div class="expert-tools"><button id="expert-cancel">Annuler</button><button class="expert-primary" id="expert-confirm">Remplacer le dossier</button></div>';document.body.append(dialog);
   const status=t=>$('expert-status').textContent=t;
   const renderRule=r=>`<article><strong>${esc(r.id)} · ${esc(r.title)}</strong>${r.blocked?'<p class="expert-warning">Réservée / bloquée : aucune proposition d’essai issue de cette règle.</p>':''}<p>Hypothèse : ${esc(r.hypothesis||r.signal||'')}</p><p>À recueillir : ${esc(r.collect)}</p><p>Limites : ${esc(r.caution)}</p>${r.review?`<p>Complément vérifié documentairement : ${esc(r.review.finding)}</p><p>À préciser : ${esc(r.review.collect)} ${esc(r.review.limit)}</p>`:''}<p>Preuve de clôture attendue : ${esc(r.closure)}</p><ul>${(r.refs||[]).map(id=>sources[id]?sourceHTML(sources[id]):'<li>Référence non disponible : '+esc(id)+'</li>').join('')}</ul></article>`;
   function enhance(){
    if(activeKey!==api.KEY()){
     drafts[activeKey]={trial:clone(data.trial),result:clone(data.result)};
     activeKey=api.KEY();const saved=drafts[activeKey]||blank();
     data.trial=clone(saved.trial);data.result=clone(saved.result);
     document.querySelectorAll('[data-expert-group="trial"],[data-expert-group="result"]').forEach(el=>el.value=data[el.dataset.expertGroup][el.dataset.expertField]);
     status('Périmètre changé : essai et résultats séparés pour ce défaut / mode / configuration. Le contexte matériel est conservé, à reconfirmer. Export limité au cas sélectionné.');
    }
    const rules=rulesFor(api);
    doc.innerHTML='<summary>Sources et limites pour ce défaut'+(rules.length?' · '+rules.length+' pistes candidates':'')+'</summary><p class="expert-muted">Compléments documentaires, distincts des anciens identifiants de règles. Ces rapprochements thématiques ne valident pas automatiquement chaque contrôle historique, son rang ou son domaine machine.</p>'+(rules.length?rules.map(renderRule).join(''):'<p>Pas de fiche documentaire qualifiée dans ce lot pour le défaut sélectionné. Aucune couverture scientifique complète n’est revendiquée.</p>');
    document.querySelectorAll('#res .cc').forEach(card=>{
     if(card.querySelector('.expert-proof'))return;
     const id=api.KEY()+'::'+card.dataset.id,related=cardRules(api,card,rules),details=document.createElement('details');
     details.className='expert-proof';details.innerHTML='<summary>Pourquoi ce contrôle ? Sources et constat</summary>'+(related.length?related.map(renderRule).join(''):'<p>Pas de correspondance documentaire précise établie pour ce contrôle. Les pistes générales du défaut sont accessibles ci-dessus ; ne pas en déduire une validation de ce levier.</p>')+`<label class="expert-field">Constat, mesure et référence de preuve<textarea rows="2" maxlength="15000" data-expert-evidence="${esc(id)}">${esc(data.evidence[id]||'')}</textarea></label><p class="expert-muted">La déclaration « conforme / non conforme » se fait uniquement avec les boutons du contrôle existant. Ce commentaire ne confirme pas une cause.</p>`;
     card.append(details);
    });
    if(!hydrating)dirty=true;
   }
   function fill(){document.querySelectorAll('[data-expert-group]').forEach(el=>el.value=data[el.dataset.expertGroup][el.dataset.expertField]);document.querySelectorAll('.expert-proof').forEach(el=>el.remove());enhance();bar.querySelector('strong').textContent='VP Expert · '+(data.fictional?'CAS ENTIÈREMENT FICTIF':'un seul dossier, du défaut au suivi')}
   function snapshot(){
    const key=api.KEY(),native={state:clone(api.S),description:$('fiche')?.textContent.trim()||'',key,nonconforming:clone(api.REC[key]||{}),conforming:clone(api.OK[key]||{}),history:clone(api.HIST.filter(h=>h.key===key))};
    const evidence=Object.fromEntries(Object.entries(data.evidence).filter(([k])=>k.startsWith(key+'::')));
    const rules=rulesFor(api),refs=[...new Set(rules.flatMap(r=>r.refs||[]))];
    return {schema:'vp-expert-consolide',version:1,documentaryVersion:VERSION,sector:api.sector,case:{...clone(data),evidence,native},documentation:{rules:rules.map(r=>({...r,namespace:'documentary',status:r.blocked?'blocked':'candidate'})),sources:refs.filter(id=>sources[id]).map(id=>({id,...sources[id]}))},notice:NOTICE};
   }
   function clearNative(){for(const target of [api.REC,api.OK,api.NUM])for(const key of Object.keys(target))delete target[key];api.HIST.splice(0)}
   function load(x){hydrating=true;data=clone(x.case);const n=data.native;delete data.native;clearNative();Object.keys(api.S).forEach(k=>delete api.S[k]);Object.assign(api.S,n.state);drafts={};activeKey=api.KEY();api.REC[api.KEY()]=clone(n.nonconforming);api.OK[api.KEY()]=clone(n.conforming);api.HIST.push(...n.history.map(h=>({...h,key:api.KEY()})));
    // A new native case always starts at revision 0; move its evidence keys too.
    data.evidence=Object.fromEntries(Object.entries(data.evidence).map(([k,v])=>[api.KEY()+'::'+k.split('::').slice(1).join('::'),v]));
    api.render();fill();hydrating=false;dirty=true;status('Dossier repris. Les constats et autorisations restent déclaratifs, non authentifiés.');}
   function validate(x){
    cleanObject(x);if(x.schema!=='vp-expert-consolide'||x.version!==1||x.documentaryVersion!==VERSION||x.sector!==api.sector)throw Error('Format ou secteur incompatible. Ouvrez le bon parcours ; les anciens formats restent dans les pages historiques.');
    const c=x.case;cleanObject(c);if(Object.keys(c).some(k=>!['context','trial','result','evidence','fictional','native'].includes(k))||typeof c.fictional!=='boolean')throw Error('Structure de dossier invalide');
    textFields(c.context,Object.keys(CONTEXT));textFields(c.trial,Object.keys(TRIAL));textFields(c.result,Object.keys(RESULT));cleanObject(c.evidence);
    if(Object.entries(c.evidence).some(([k,v])=>k.length>300||typeof v!=='string'||v.length>15000)||Object.keys(c.evidence).length>200)throw Error('Preuves invalides');
    const n=c.native;cleanObject(n);cleanObject(n.state);if(typeof n.key!=='string'||n.key.length>200)throw Error('Clé de cas invalide');
    for(const [k,v] of Object.entries(n.state)){if(!Object.hasOwn(api.choices,k))throw Error('Champ enquête inconnu');const a=api.choices[k];if(a==='text'?(typeof v!=='string'||v.length>200):a==='boolean'?typeof v!=='boolean':!a.includes(v))throw Error('Valeur enquête invalide : '+k);}
    if(!n.state.def||!n.state.br||!n.state.param||typeof n.state.qd!=='string'||!n.state.fam||(api.sector==='DC'&&!n.state.mach)||(api.sector!=='TP'&&!n.state.dir))throw Error('Enquête incomplète');
    for(const values of [n.nonconforming,n.conforming]){cleanObject(values);if(Object.keys(values).length>100||Object.entries(values).some(([id,v])=>id.length>100||v!==1))throw Error('Contrôles invalides')}
    if(!Array.isArray(n.history)||n.history.length>200)throw Error('Journal invalide');
    n.history.forEach(h=>{cleanObject(h);if(Object.keys(h).some(k=>!['key','id','r','g','t','d','c'].includes(k))||!['ok','nc'].includes(h.r)||!/^\d{2}:\d{2}$/.test(h.t)||['id','key','d','c'].some(k=>typeof h[k]!=='string'||h[k].length>1000)||(h.g!==undefined&&typeof h.g!=='boolean'))throw Error('Entrée de journal invalide')});
    return x;
   }
   function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
   function report(x){const c=x.case,n=c.native,txt=s=>String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    let m='# Vella Partners | Dossier VP Expert\n\n'+(c.fictional?'CAS ENTIÈREMENT FICTIF. Mesures, interventions, autorisations et conclusions inventées.\n\n':'')+NOTICE+'\n\nSecteur : '+x.sector+' ; défaut : '+n.state.def+'.\n\n## Contexte\n\n';
    for(const [group,labels] of [['context',CONTEXT],['trial',TRIAL],['result',RESULT]]){if(group!=='context')m+='\n## '+(group==='trial'?'Essai proposé, non autorisé par l’application':'Résultats déclarés')+'\n\n';for(const[k,label]of Object.entries(labels))m+='- '+label+' : '+txt(c[group][k]||'Non renseigné')+'\n';}
    m+='\n## Questionnaire et contrôles du cas sélectionné\n\nLes valeurs initiales du questionnaire sont démonstratives : elles doivent être vérifiées. Classement illustratif, pas une probabilité.\n\n'+txt(n.description||'')+'\n\n'+Object.entries(n.state).filter(([k])=>!['fam','qd','more'].includes(k)).map(([k,v])=>'- '+k+' : '+txt(v)).join('\n')+'\n\n';
    m+=n.history.length?n.history.map(h=>'- '+txt(h.c)+' : '+(h.r==='nc'?'écart déclaré, cause non démontrée':'contrôle déclaré conforme, pas une validation de cause')+' ('+h.t+')').join('\n'):'Aucun contrôle enregistré.';
    m+='\n\n## Constats et références de preuves\n\n'+Object.entries(c.evidence).map(([k,v])=>'- '+txt(k)+' : '+txt(v)).join('\n');
    m+='\n\n## Repères documentaires candidats\n\n'+x.documentation.rules.map(r=>'- '+r.id+' : '+r.title+' ('+r.status+')\n  - À recueillir : '+r.collect+'\n  - Limites : '+r.caution+'\n  - Clôture attendue : '+r.closure+(r.review?'\n  - Complément : '+r.review.finding+'\n  - Portée : '+r.review.limit:'')).join('\n');
    m+='\n\n## Sources, domaines et limites\n\n'+x.documentation.sources.map(s=>'- ['+s.name+']('+s.url+')\n  - Domaine : '+s.scope+'\n  - Limites : '+s.limit).join('\n');
    return m+'\n\nConclusion de l’application : cause non démontrée. Aucun gain industriel ni autorisation d’essai certifiés.\n';
   }
   function replace(fn){pending=fn;dialog.showModal();$('expert-cancel').focus()}
   $('expert-cancel').onclick=()=>{pending=null;dialog.close()};
   dialog.addEventListener('cancel',()=>{pending=null});
   $('expert-confirm').onclick=()=>{dialog.close();const fn=pending;pending=null;fn?.()};
   $('expert-export').onclick=()=>{
    download('Vella_Partners_VP_Expert_'+api.sector+'.json',JSON.stringify(snapshot(),null,2),'application/json');
    const key=api.KEY();
    dirty=Object.keys(data.evidence).some(k=>!k.startsWith(key+'::'))||api.HIST.some(h=>h.key!==key)||Object.entries(drafts).some(([k,v])=>k!==key&&[...Object.values(v.trial),...Object.values(v.result)].some(Boolean));
    status('JSON exporté : contexte, contrôles et preuves du cas sélectionné, essai, suivi et sources.'+(dirty?' D’autres brouillons existent en mémoire : revenez à chacun pour l’exporter avant de quitter.':''));
   };
   $('expert-report').onclick=()=>download('Vella_Partners_Synthese_VP_Expert_'+api.sector+'.md',report(snapshot()),'text/markdown');
   $('expert-import').onclick=()=>$('expert-file').click();
   $('expert-file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>1000000)throw Error('Fichier trop volumineux');const x=validate(JSON.parse(await f.text()));replace(()=>load(x))}catch(err){status('Import refusé : '+err.message)}};
   const newCase=()=>replace(()=>{data=blank();drafts={};clearNative();api.S.br='sans';activeKey=api.KEY();api.render();fill();dirty=false;status('Nouveau dossier. Aucun constat ou résultat du précédent dossier n’est conservé dans cette enquête.')});
   $('expert-new').onclick=newCase;
   document.addEventListener('click',e=>{if(e.target.closest('[data-new]')){e.preventDefault();e.stopImmediatePropagation();newCase()}},true);
   document.addEventListener('input',e=>{const el=e.target;if(el.dataset.expertGroup){data[el.dataset.expertGroup][el.dataset.expertField]=el.value;dirty=true}else if(el.dataset.expertEvidence){data.evidence[el.dataset.expertEvidence]=el.value;dirty=true}});
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
   if(api.sector==='DC')$('expert-example').onclick=()=>replace(example);
   hydrating=true;fill();hydrating=false;dirty=false;
   if(api.sector==='DC'&&new URLSearchParams(location.search).get('example')==='wear-thermal')example();
  }
 };
})();
