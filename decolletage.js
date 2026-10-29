(()=>{
'use strict';
const D=window.VPDC,$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields={
 context:[
 ['caseId','Identifiant anonymisé du cas'],['machine','Machine, commande et version de notice'],
 ['architecture','Architecture et support','select',['','Inconnue','Poupée mobile, canon conventionnel','Poupée mobile, canon adaptatif','Poupée mobile, sans canon','Poupée fixe','Multibroche','Autre configuration à préciser']],
 ['operation','Opération, outil et programme de référence'],['material','Matière, lot, barre et certificat'],
 ['setup','Montage, serrage et support réels'],['lfv','Oscillation volontaire / LFV','select',['','Non renseignée','Absente selon déclaration','Présente et active selon déclaration','Installée mais inactive selon déclaration']],
 ['fluid','Fluide et alimentation, référence de procédure'],['quality','Caractéristique, unités, tolérances et règle de décision qualité','textarea'],
 ['measurement','Moyen, méthode, validité métrologique et températures','textarea'],['timeline','Chronologie : démarrage, arrêts, outils, offsets, lots','textarea'],
 ['symptom','Symptôme, localisation et circonstances','textarea']
 ],
 trial:[
 ['objective','Question discriminante à tester','textarea'],['before','Référence avant essai : valeurs, unités, échantillon, dates','textarea'],
 ['protocol','Protocole proposé, variable isolée et paramètres maintenus','textarea'],['acceptance','Critères qualité et durée de suivi proposés','textarea'],
 ['stop','Conditions d’arrêt et traitement des pièces à définir','textarea'],['authority','Responsable habilité et référence d’autorisation déclarée','textarea'],
 ['evidence','Références des mesures et documents à recueillir','textarea']
 ],
 result:[
 ['execution','Intervention réellement déclarée, opérateur et date','textarea'],['after','Mesures après : valeurs, unités, échantillon et dates','textarea'],
 ['effects','Autres cotes, surface, usure, sécurité et effets secondaires','textarea'],['followup','Durée / volume suivi et éventuelle réapparition','textarea'],
 ['qualityReview','Référence de la revue qualité et des preuves','textarea'],
 ['assessment','Appréciation déclarée, non validée','select',['Non déterminée','Amélioration déclarée à revoir','Sans amélioration déclarée','Dégradation déclarée','Récidive déclarée']]
 ]
};
const statuses=['Non renseigné','À recueillir','Constat déclaré','Contre-indice déclaré','Non applicable déclaré'];
const rules=id=>D.rules.filter(r=>r.id.startsWith(id+'-'));
const blank=id=>({family:id,fictional:false,context:Object.fromEntries(fields.context.map(f=>[f[0],''])),trial:{target:'',...Object.fromEntries(fields.trial.map(f=>[f[0],'']))},result:Object.fromEntries(fields.result.map(f=>[f[0],f[0]==='assessment'?'Non déterminée':''])),observations:Object.fromEntries(rules(id).map(r=>[r.id,{status:statuses[0],note:'',reference:''}]))});
const cases=Object.fromEntries(D.families.map(f=>[f.id,blank(f.id)]));
let selected=D.families.some(f=>f.id===new URLSearchParams(location.search).get('family'))?new URLSearchParams(location.search).get('family'):'DC01',dirty=false;
const current=()=>cases[selected],family=()=>D.families.find(f=>f.id===selected);
const COMPLETE=window.VPDC_COMPLETE;
function renderStory(){
 const panel=$('#dc-case-story');
 panel.hidden=!(COMPLETE&&current().fictional&&current().context.caseId===COMPLETE.case.context.caseId);
 if(panel.hidden){panel.innerHTML='';return}
 const number=x=>x.toFixed(3).replace('.',',');
 panel.innerHTML=`<p class="eyebrow">Cas complet entièrement fictif · Scénario de référence</p><h2>${esc(COMPLETE.title)}</h2><p>Toutes les valeurs, observations, autorisations et décisions ci-dessous sont inventées. Ce récit n’est pas une résolution réelle.</p><div class="dc-story-steps">${COMPLETE.steps.map(([title,text],i)=>`<article class="dc-story-step"><span class="dc-rule-id">ÉTAPE ${i+1}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div><h3>Historique avant intervention fictive</h3><div class="dc-table-wrap"><table class="dc-table"><caption>Mesures inventées, pas de données client</caption><thead><tr><th>Pièce</th><th>Diamètre (mm)</th><th>Broche (°C)</th><th>Fluide (°C)</th></tr></thead><tbody>${COMPLETE.readings.map(r=>`<tr><td>${r.piece}</td><td>${r.diameter}</td><td>${r.spindle}</td><td>${r.fluid}</td></tr>`).join('')}</tbody></table></div><p class="dc-numbers"><strong>Après intervention, 20 pièces fictives (mm) :</strong> ${COMPLETE.after.map(number).join(' ; ')}.</p><p class="dc-numbers"><strong>Suivi fictif (pièce : mm) :</strong> ${COMPLETE.followup.map(r=>r.piece+' : '+number(r.value)).join(' ; ')}.</p><aside class="doc-warning">${esc(COMPLETE.verdict)}</aside><p class="privacy">Récit fixe de référence. Les champs du dossier ci-dessous sont modifiables : si vous les changez ou importez d’autres observations, ce récit ne recalcule pas sa conclusion. Les exports reprennent les champs du dossier, pas une nouvelle conclusion automatique.</p>`;
}
function ask(message){return new Promise(resolve=>{const dialog=$('#dc-confirm');$('#dc-confirm-message').textContent=message;const finish=value=>{dialog.oncancel=null;dialog.close();resolve(value)};$('#dc-confirm-yes').onclick=()=>finish(true);$('#dc-confirm-no').onclick=()=>finish(false);dialog.oncancel=e=>{e.preventDefault();finish(false)};dialog.showModal()})}
function sourceHTML(s){return `<article class="dc-source" data-source="${s.id}"><strong>${esc(s.id)} · ${esc(s.title)}</strong><p>${esc(s.type)}</p><p>${esc(s.scope)}</p><p><strong>Limite :</strong> ${esc(s.limit)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consulter le document public</a></article>`}
function inputHTML(group,f){const [key,label,type='text',options]=f,id=`dc-${group}-${key}`,value=current()[group][key];return `<div${type==='textarea'?' class="wide"':''}><label for="${id}">${esc(label)}</label>${type==='select'?`<select id="${id}" data-group="${group}" data-key="${key}">${options.map(o=>`<option value="${esc(o)}"${o===value?' selected':''}>${esc(o||'À renseigner')}</option>`).join('')}</select>`:type==='textarea'?`<textarea id="${id}" data-group="${group}" data-key="${key}" maxlength="10000">${esc(value)}</textarea>`:`<input id="${id}" data-group="${group}" data-key="${key}" maxlength="10000" value="${esc(value)}">`}</div>`}
function render(){
 $('#dc-family').value=selected;$('#dc-focus').textContent=family().focus;
 for(const group of ['context','trial','result']) $('#dc-'+group).innerHTML=fields[group].map(f=>inputHTML(group,f)).join('');
 $('#dc-rules').innerHTML=rules(selected).map(r=>{const o=current().observations[r.id];return `<article class="rule" data-dc-rule="${r.id}"><div class="rule-head"><div><span class="dc-rule-id">${r.id}</span><h3>${esc(r.title)}</h3></div><span class="dc-pill${r.blocked?' blocked':''}">${r.blocked?'Réservée · preuve spécifique manquante':'Piste documentaire, non approuvée'}</span></div><p>${esc(r.hypothesis)}</p><div class="rule-grid"><div><h4>Contrôle discriminant à faire autoriser</h4><p>${esc(r.check)}</p></div><div><h4>Limites et contre-indications</h4><p>${esc(r.caution)}</p></div></div><div class="dc-proposal"><strong>Suite candidate à soumettre à l’expert</strong><p>${esc(r.proposal)}</p></div><p><strong>Éléments attendus pour la revue :</strong> ${esc(r.proof)}</p><details><summary>Fondements documentaires et limites (${r.sources.length})</summary>${r.sources.map(id=>sourceHTML(D.sources.find(s=>s.id===id))).join('')}</details><div class="dc-observation"><label for="state-${r.id}">État de collecte, pas état de validation</label><select id="state-${r.id}" data-rule="${r.id}" data-observation="status">${statuses.map(s=>`<option${o.status===s?' selected':''}>${s}</option>`).join('')}</select><div class="context-grid"><div class="wide"><label for="note-${r.id}">Constat, contre-indice ou motif de non-applicabilité</label><textarea id="note-${r.id}" data-rule="${r.id}" data-observation="note" maxlength="10000">${esc(o.note)}</textarea></div><div class="wide"><label for="ref-${r.id}">Référence de mesure/document, auteur et date déclarés</label><input id="ref-${r.id}" data-rule="${r.id}" data-observation="reference" maxlength="10000" value="${esc(o.reference)}"></div></div><p data-obs-feedback="${r.id}"></p></div></article>`}).join('');
 $('#dc-target').innerHTML='<option value="">Aucune piste sélectionnée</option>'+rules(selected).map(r=>`<option value="${r.id}"${r.blocked?' disabled':''}>${r.id} · ${esc(r.title)}${r.blocked?' (réservée)':''}</option>`).join('');
 $('#dc-target').value=current().trial.target;$('#dc-outcome-criteria').textContent='Critère de clôture proposé, à préciser et approuver localement : '+family().outcome;
 updateSummary();renderStory();
}
function updateSummary(){
 const c=current(),entries=Object.entries(c.observations);
 entries.forEach(([id,o])=>{const completed=o.note.trim()&&o.reference.trim();$(`[data-obs-feedback="${id}"]`).textContent=statuses.indexOf(o.status)>1?(completed?'Déclaration renseignée, non vérifiée. Aucune cause démontrée.':'Déclaration incomplète : préciser le constat/motif et sa référence. Aucun changement de statut de preuve.'):'Aucun constat étayé déclaré.'});
 const documented=entries.filter(([,o])=>statuses.indexOf(o.status)>1&&o.note.trim()&&o.reference.trim()).length;
 const filled=Object.values(c.context).filter(v=>v.trim()).length;
 const proposed=D.rules.find(r=>r.id===c.trial.target);
 $('#dc-trial-proposal').textContent=proposed?'Proposition documentaire, pas instruction : '+proposed.proposal:'Sélectionner une piste ne constitue ni un diagnostic ni une autorisation d’essai.';
 $('#dc-summary').innerHTML=`<p><strong>Dossier :</strong> ${esc(selected)} · ${esc(c.context.caseId||'Identifiant non renseigné')}.</p><p>${filled}/${fields.context.length} rubriques de contexte renseignées, non vérifiées. ${documented}/4 déclarations avec note et référence, non vérifiées.</p><p><strong>Cause :</strong> non déterminée par l’application. Aucun constat ne devient automatiquement une cause démontrée.</p><p><strong>Essai :</strong> ${proposed?'piste '+esc(proposed.id)+' sélectionnée pour préparation':'non sélectionné'}. Autorisation non vérifiée par ce démonstrateur.</p><p><strong>Résultat :</strong> ${esc(c.result.assessment)}. Résolution industrielle non validée ; revue qualité et métier nécessaire.</p><p><strong>Export :</strong> ce dossier ${selected} uniquement, ses quatre pistes, observations, essai, résultat et sources associées.</p>`;
 $('#dc-fiction').hidden=!c.fictional;
 const warnings=[];
 if(!c.context.architecture||c.context.architecture==='Inconnue')warnings.push('Architecture inconnue : ne pas appliquer de règle de guidage spécifique.');
 if(c.context.architecture.includes('sans canon'))warnings.push('Mode sans canon déclaré : les conseils de réglage d’un canon ne s’appliquent pas. Revoir les supports réellement utilisés.');
 if(c.context.architecture.includes('adaptatif'))warnings.push('Canon adaptatif déclaré : utiliser sa notice ; aucune tolérance de barre ou de jeu générique.');
 if(c.context.lfv==='Présente et active selon déclaration')warnings.push('Oscillation volontaire déclarée : distinguer le signal programmé d’une instabilité avant de conclure au broutement.');
 $('#dc-context-warning').hidden=!warnings.length;$('#dc-context-warning').textContent=warnings.join(' ');
}
document.addEventListener('input',e=>{
 const t=e.target;if(t.dataset.group){current()[t.dataset.group][t.dataset.key]=t.value;dirty=true;updateSummary()}
 if(t.dataset.observation){current().observations[t.dataset.rule][t.dataset.observation]=t.value;dirty=true;updateSummary()}
});
$('#dc-family').addEventListener('change',e=>{selected=e.target.value;render();$('#dc-feedback').textContent='Dossier changé ; les autres dossiers restent en mémoire jusqu’au rechargement.'});
$('#dc-target').addEventListener('change',e=>{current().trial.target=e.target.value;dirty=true;updateSummary()});
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#dc-feedback').textContent='Export du seul dossier '+selected+' préparé. Les autres dossiers ne sont pas sauvegardés dans ce fichier.'}
function md(){
 const c=current(),rs=rules(selected),ss=D.sources.filter(s=>rs.some(r=>r.sources.includes(s.id)));
 const group=g=>fields[g].map(([k,l])=>`### ${l}\n\n${esc(c[g][k])||'Non renseigné.'}\n`).join('\n');
 return `# Vella Partners | ${selected} : ${family().title}\n\nVersion ${D.version}. Export documentaire DEV. ${c.fictional?'CAS FICTIF : données inventées, aucune preuve industrielle.':''}\n\nAucune action approuvée, aucune autorisation vérifiée, aucune cause démontrée par l’application. Saisies déclaratives ; les liens scientifiques ne valident pas ce cas. Export limité au dossier sélectionné.\n\n## Contexte déclaré\n\n${group('context')}\n## Contrôles et observations\n\n${rs.map(r=>{let o=c.observations[r.id];return `### ${r.id} | ${r.title}\n\nStatut documentaire : ${r.blocked?'RÉSERVÉE, preuve spécifique insuffisante':'candidate non approuvée'}.\n\n${r.hypothesis}\n\nContrôle à faire autoriser : ${r.check}\n\nSuite à soumettre : ${r.proposal}\n\nLimites : ${r.caution}\n\nÉléments attendus : ${r.proof}\n\nFondements : ${r.sources.map(id=>{const s=D.sources.find(s=>s.id===id);return `[${s.title}](${s.url})`}).join(' ; ')}.\n\nCollecte : ${o.status}. Déclaration ${o.note.trim()&&o.reference.trim()?'renseignée, non vérifiée':'incomplète ou non renseignée'}.\n\nConstat : ${esc(o.note)||'Non renseigné.'}\n\nRéférence, auteur et date déclarés : ${esc(o.reference)||'Non renseignés.'}\n`}).join('\n')}\n## Essai proposé, non autorisé par VP\n\nPiste : ${c.trial.target||'Aucune'}.\n\n${group('trial')}\n## Résultat déclaré, non validé\n\nCritère proposé : ${family().outcome}\n\n${group('result')}\nCause non déterminée par l’application. Aucune résolution industrielle validée.\n\n## Registre documentaire et limites\n\nConsultation le 29 octobre 2026. Ce sous-ensemble ne valide pas les 178 notices du Lot 3.\n\n${ss.map(s=>`### ${s.id} | ${s.title}\n\n${s.type}. ${s.scope}\n\nLimite : ${s.limit}\n\n[Document public](${s.url})\n`).join('\n')}`;
}
$('#dc-export-md').onclick=()=>download(`VP_${selected}_Dossier_DEV.md`,md(),'text/markdown;charset=utf-8');
$('#dc-export-json').onclick=()=>download(`VP_${selected}_Dossier_DEV.json`,JSON.stringify({schema:'vp-dc-dossier',version:1,documentaryVersion:D.version,case:current()},null,2),'application/json');
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
function validate(raw){
 if(!exact(raw,['schema','version','documentaryVersion','case'])||raw.schema!=='vp-dc-dossier'||raw.version!==1||!['VP-DEV-DC-2026-10-29-1',D.version].includes(raw.documentaryVersion))throw Error('Format ou version non pris en charge. Les fichiers Lot 2 bis/Lot 3 ne sont pas convertis automatiquement.');
 const c=raw.case;
 if(!exact(c,['family','fictional','context','trial','result','observations'])||!D.families.some(f=>f.id===c.family)||typeof c.fictional!=='boolean')throw Error('Dossier invalide.');
 for(const g of ['context','trial','result']){
  const keys=fields[g].map(f=>f[0]);if(g==='trial')keys.push('target');
  if(!exact(c[g],keys)||Object.values(c[g]).some(v=>typeof v!=='string'||v.length>10000))throw Error('Champs invalides ou trop longs.');
  for(const f of fields[g])if(f[2]==='select'&&!f[3].includes(c[g][f[0]]))throw Error('Valeur de sélection inconnue.');
 }
 if(c.trial.target&&!rules(c.family).some(r=>r.id===c.trial.target&&!r.blocked))throw Error('Piste d’essai hors périmètre ou réservée.');
 const ids=rules(c.family).map(r=>r.id);
 if(!exact(c.observations,ids))throw Error('Périmètre des observations invalide.');
 for(const o of Object.values(c.observations))if(!exact(o,['status','note','reference'])||!statuses.includes(o.status)||typeof o.note!=='string'||typeof o.reference!=='string'||o.note.length>10000||o.reference.length>10000)throw Error('Observation invalide.');
 return c;
}
$('#dc-import').onchange=async e=>{
 try{const file=e.target.files[0];if(!file)return;if(file.size>512000)throw Error('Fichier trop volumineux (maximum 500 Ko).');
 const c=validate(JSON.parse(await file.text()));if(!await ask(`Remplacer le dossier ${c.family} en mémoire par ce fichier ? Les autres dossiers sont conservés.`)){$('#dc-feedback').textContent='Import annulé ; dossiers conservés.';return}
 cases[c.family]=c;selected=c.family;dirty=true;render();$('#dc-feedback').textContent='Dossier repris. Aucune preuve, autorisation ou résolution validée par cet import.';
 }catch(err){$('#dc-feedback').textContent='Import refusé : '+err.message}finally{e.target.value=''}
};
$('#dc-reset').onclick=async()=>{if(await ask(`Effacer uniquement le dossier ${selected} ? Exportez-le d’abord si nécessaire.`)){cases[selected]=blank(selected);dirty=true;render();$('#dc-feedback').textContent='Dossier effacé ; les autres dossiers sont conservés.'}};
$('#dc-example').onclick=async()=>{
 if(!await ask('Charger un cas inventé dans DC01 en remplaçant ce dossier ? Les autres dossiers restent intacts.'))return;
 const c=blank('DC01');c.fictional=true;
 Object.assign(c.context,{caseId:'FICTIF-DC01-MONDE-01',machine:'Tour anonymisé fictif ; notice non fournie',architecture:'Poupée mobile, canon adaptatif',operation:'Finition diamètre extérieur ; programme fictif P01',material:'Lot fictif B, matière et certificat à préciser',quality:'Exemple fictif Ø10,000 ±0,020 mm. Règle de décision et incertitude non fournies.',measurement:'Même micromètre déclaré ; température pièce et répétabilité non documentées.',timeline:'Mesures inventées après démarrage : 10,006 puis 10,010 puis 10,014 mm. Pas de modification d’offset déclarée. Arête non inspectée.',symptom:'Tendance croissante déclarée ; pas de cause déterminée.'});
 Object.assign(c.observations['DC01-R01'],{status:'À recueillir',note:'Vérifier répétabilité et conditions thermiques de mesure.',reference:'Scénario fictif, pas de preuve terrain'});
 Object.assign(c.observations['DC01-R02'],{status:'Constat déclaré',note:'Trois valeurs croissantes inventées. Cette pente ne suffit pas à démontrer une usure.',reference:'Jeu fictif F01, auteur : démonstrateur, 29/10/2026'});
 Object.assign(c.observations['DC01-R03'],{status:'À recueillir',note:'Collecter régime thermique et température pièce pour départager thermique et outil.',reference:'Scénario fictif, pas de relevé réel'});
 c.trial.target='DC01-R01';c.trial.objective='Établir d’abord si les mesures sont comparables avant de préparer une modification de réglage.';
 cases.DC01=c;selected='DC01';dirty=true;render();$('#dc-feedback').textContent='Cas fictif chargé : incertitude, thermique et état d’arête restent à instruire. Aucun offset proposé.';
};
function loadComplete(){cases.DC01=structuredClone(COMPLETE.case);selected='DC01';dirty=true;render();$('#dc-feedback').textContent='Cas complet fictif chargé : observations, essai, résultats et suivi inventés. Aucune action réelle ni cause validée.'}
$('#dc-complete-case').onclick=async()=>{if(await ask('Remplacer uniquement DC01 par le cas fictif complet usure / thermique ? Les autres dossiers restent intacts.')){loadComplete();$('#dc-case-story').scrollIntoView({behavior:'smooth',block:'start'})}};
let detailsBeforePrint=[],printActive=false;
window.addEventListener('beforeprint',()=>{if(printActive)return;printActive=true;detailsBeforePrint=[...document.querySelectorAll('details')].map(d=>[d,d.open]);detailsBeforePrint.forEach(([d])=>d.open=true);document.querySelectorAll('input:not([type=file]),textarea,select').forEach(t=>{const s=document.createElement('div');s.className='print-value';s.textContent=t.tagName==='SELECT'?t.selectedOptions[0]?.textContent:t.value;t.after(s)})});
window.addEventListener('afterprint',()=>{document.querySelectorAll('.print-value').forEach(s=>s.remove());detailsBeforePrint.forEach(([d,open])=>d.open=open);printActive=false});
$('#dc-print').onclick=()=>window.print();
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
$('#dc-version').textContent=D.version;
$('#dc-family').innerHTML=D.families.map(f=>`<option value="${f.id}">${f.id} · ${esc(f.title)}</option>`).join('');
$('#dc-sources').innerHTML=D.sources.map(sourceHTML).join('');
render();
if(new URLSearchParams(location.search).get('example')==='wear-thermal')loadComplete();
})();
