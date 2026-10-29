(function(){'use strict';
const D=window.VP_DOC,$=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const states={'unknown':'Non examinée','pending':'Informations à recueillir','supported':'Hypothèse étayée, à revoir','unsupported':'Non étayée par les éléments disponibles','conflict':'Éléments contradictoires'};
const fields=[
 ['machine','Machine / référence',true],['mold','Moule / empreinte(s)',true],['material','Grade ou mélange exact',true],['lot','Lot matière',true],['architecture','Architecture / notice',true],['recipe','Recette / indice',true],
 ['process','Procédé déclaré',true,'select'],['quality','Critère et méthode qualité',true],['event','Date / heure / référence cycle',false],
 ['symptoms','Défaut observé, localisation et fréquence',true,'wide'],['measure','Mesures disponibles : valeur, unité, point, consigne ou réel',false,'wide']
];
const processes=['','Injection caoutchouc vulcanisable','Injection thermoplastique conventionnelle','Autre / procédé spécial'];
const availabilityLabels={unknown:'Non qualifiée',missing:'Absente',partial:'Partielle',available:'Disponible (déclarée)'};
const emptyProof=()=>({availability:'unknown',reference:'',reviewer:'',date:'',review:'unverified'});
const blank=()=>({context:Object.fromEntries(fields.map(([k])=>[k,''])),documentation:Object.fromEntries(fields.map(([k])=>[k,emptyProof()])),observations:{},note:''});
let dossiers=Object.fromEntries(D.defects.map(d=>[d.id,blank()])),selected=new URLSearchParams(location.search).get('defect')||'CA-01',dirty=false;
if(!D.defects.some(d=>d.id===selected))selected='CA-01';
const current=()=>D.defects.find(d=>d.id===selected),doc=()=>dossiers[selected];
function refs(ids){return ids.map(id=>{const s=D.sources[id];return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(id)} · ${esc(s.name)}</a>`}).join('');}
function source(id){const s=D.sources[id];return `<div class="source"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(id+' · '+s.name)}</a><p><strong>${esc(s.type)}</strong> · ${esc(s.locator)}</p><p>Domaine : ${esc(s.scope)}</p><p>Limites : ${esc(s.limit)}</p></div>`;}
function reviewHtml(r){const x=r.review;return x?`<div class="review-complement"><h4>Complément documentaire · ${esc(D.reviewed)}</h4><p><strong>${esc(x.status)}</strong></p><p>${esc(x.finding)}</p><div class="ref-links">${refs(x.refs)}</div><p><strong>À recueillir :</strong> ${esc(x.collect)}</p><p><strong>Limite :</strong> ${esc(x.limit)}</p><p class="muted">Concerne les publications, pas les preuves du cas saisi. Aucune approbation métier.</p></div>`:'';}
function missing(){return fields.filter(([k,,req])=>req&&!doc().context[k].trim()).map(([,label])=>label);}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s&&s<=new Date().toISOString().slice(0,10);}
function reviewReady(p,text){return p.availability==='available'&&text.trim()&&p.reference.trim()&&p.reviewer.trim()&&validDate(p.date);}
function documentaryCounts(){const req=fields.filter(x=>x[2]);return {total:req.length,filled:req.filter(([k])=>doc().context[k].trim()).length,available:req.filter(([k])=>doc().documentation[k].availability==='available').length,reviewed:req.filter(([k])=>doc().documentation[k].review==='declared').length};}
function documentaryHtml(){
 const c=documentaryCounts(),req=fields.filter(x=>x[2]);
 return `<p><strong>${c.filled} / ${c.total} champs remplis</strong> · ${c.available} / ${c.total} informations disponibles (déclarées) · ${c.reviewed} / ${c.total} vérifications déclarées</p><p>Compteurs des champs requis uniquement. Aucune preuve authentifiée par l’application.</p><ul>${req.map(([k,l])=>{const p=doc().documentation[k];return `<li><strong>${esc(l)}</strong> : ${esc(availabilityLabels[p.availability])} ; ${p.review==='declared'?'vérification déclarée, non authentifiée':'preuve non vérifiée'}${!doc().context[k].trim()?' ; champ vide':''}.</li>`;}).join('')}</ul>`;
}
function proofControls(k,p){return `<div class="proof-controls"><label for="availability-${k}">Disponibilité de l’information</label><select id="availability-${k}" data-proof="${k}" data-property="availability">${Object.entries(availabilityLabels).map(([v,l])=>`<option value="${v}"${p.availability===v?' selected':''}>${esc(l)}</option>`).join('')}</select><details><summary id="proof-summary-${k}">${p.review==='declared'?'Vérification déclarée, non authentifiée':'Preuve non vérifiée'}</summary><label for="reference-${k}">Référence / version du document ou relevé</label><input id="reference-${k}" data-proof="${k}" data-property="reference" maxlength="300" value="${esc(p.reference)}"><label for="reviewer-${k}">Auteur déclaré de la vérification</label><input id="reviewer-${k}" data-proof="${k}" data-property="reviewer" maxlength="120" value="${esc(p.reviewer)}"><label for="date-${k}">Date déclarée de vérification</label><input id="date-${k}" data-proof="${k}" data-property="date" type="date" max="${new Date().toISOString().slice(0,10)}" value="${esc(p.date)}"><label for="review-${k}">État de vérification documentaire</label><select id="review-${k}" data-proof="${k}" data-property="review"><option value="unverified"${p.review==='unverified'?' selected':''}>Non vérifiée</option><option value="declared"${p.review==='declared'?' selected':''}>Vérification déclarée, non authentifiée</option></select><p class="muted">Sans signature expert ni validation de la règle. Un texte libre seul ne suffit pas.</p></details><p id="proof-feedback-${k}" role="status" class="rule-feedback"></p></div>`;}
function compatible(){const p=doc().context.process;return !p||p===(current().sector==='Caoutchouc'?processes[1]:processes[2]);}
function updateSummary(){
 const miss=missing(),n=fields.filter(x=>x[2]).length;
 $('completion').textContent=`${n-miss.length} / ${n} champs requis remplis · pas une validation`;
 $('documentary-status').innerHTML=documentaryHtml();
 $('gate').textContent=!compatible()?'Procédé déclaré hors du périmètre de cette fiche : revue spécifique nécessaire. Ne pas transposer ses pistes.':miss.length?'Contexte incomplet : '+miss.join(', ')+'. Lecture documentaire uniquement.':'Contexte renseigné, non validé : l’applicabilité des sources, les notices et les critères doivent encore être revus. Aucune action autorisée.';
 $('scope-status').textContent=current().sector+' · 4 identifiants · aucune action approuvée';
 $('report-summary').innerHTML=current().rules.map(r=>`<div class="report-row"><span>${esc(r.id+' · '+r.title)}</span><span>${r.blocked?'Contenu bloqué':esc(states[doc().observations[r.id]?.status||'unknown'])}</span></div>`).join('')+documentaryHtml()+`<p class="muted">Cause non déterminée ; efficacité terrain non démontrée.</p>`;
}
function render(){
 const d=current(),s=doc();
 $('defect').value=selected;$('defect-id').textContent=d.id+' / '+d.sector;$('defect-title').textContent=d.name;$('summary').textContent=d.summary;$('scope').textContent=d.scope;$('exclude').textContent=d.exclude;$('summary-sources').innerHTML='<div class="ref-links">'+refs(d.refs)+'</div>';
 $('legacy').href=d.sector==='Caoutchouc'?'enquete-caoutchouc.html':'enquete.html';
 $('collection-items').innerHTML=(D.collectionGuide[d.sector]||[]).map(x=>`<div class="collection-item"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="ref-links">${refs(x.refs)}</div></div>`).join('');
 $('context-form').innerHTML=fields.map(([k,label,req,kind])=>`<div class="${kind==='wide'?'wide':''}"><label for="ctx-${k}">${esc(label)} ${req?'<small>(requis pour la revue)</small>':'<small>(si disponible)</small>'}</label>${kind==='select'?`<select id="ctx-${k}" data-field="${k}">${processes.map(p=>`<option value="${esc(p)}"${p===s.context[k]?' selected':''}>${esc(p||'Non renseigné')}</option>`).join('')}</select>`:kind==='wide'?`<textarea rows="2" maxlength="1200" id="ctx-${k}" data-field="${k}" placeholder="Non renseigné">${esc(s.context[k])}</textarea>`:`<input id="ctx-${k}" data-field="${k}" maxlength="1200" value="${esc(s.context[k])}" placeholder="Non renseigné">`}</div>`).join('');
 fields.forEach(([k])=>$('ctx-'+k).insertAdjacentHTML('afterend',proofControls(k,s.documentation[k])));
 $('rules').innerHTML=d.rules.map(r=>{
 const o=s.observations[r.id]||{status:'unknown',evidence:''};
 return `<article class="rule${r.blocked?' blocked':''}" data-rule="${r.id}"><div class="rule-head"><div><p class="eyebrow">${r.id}</p><h3>${esc(r.title)}</h3></div><span class="status-chip">${r.blocked?'Bloquée · non intégrée':'Candidate documentaire · non approuvée'}</span></div>
 <p class="muted">À examiner lorsque : ${esc(r.signal)}</p><p>${esc(r.hypothesis)}</p><div class="ref-links">${refs(r.refs)}</div>
 <div class="rule-grid"><p><strong>Éléments à recueillir · proposition VP</strong>${esc(r.collect)}</p><p><strong>Limites et contre-preuves</strong>${esc(r.caution)}</p></div>
 ${r.review?'<p class="review-marker">Complément documentaire disponible dans « Pourquoi cette piste ? » ; règle toujours non approuvée.</p>':''}
 <details><summary>Pourquoi cette piste ? Domaine et limites des sources</summary><div>${reviewHtml(r)}${r.refs.length?r.refs.map(source).join(''):'<p>Pas de fondement public suffisant intégré pour cette règle. Le contenu privé et les prescriptions sont volontairement absents.</p>'}<p class="muted">Clôture à préparer : ${esc(r.closure)}</p><p class="muted">Le fondement documentaire ne valide ni le cas client ni le protocole de collecte proposé par Vella Partners.</p></div></details>
 ${r.blocked?'<p class="muted">Aucune observation ni activation possible pour cet emplacement. Demander une revue documentaire autorisée.</p>':`<div class="observation"><div><label for="status-${r.id}">État des éléments disponibles</label><select id="status-${r.id}" data-status="${r.id}">${Object.entries(states).map(([v,t])=>`<option value="${v}"${v===o.status?' selected':''}>${esc(t)}</option>`).join('')}</select><p>Ce choix ne confirme pas une cause.</p></div><div><label for="evidence-${r.id}">Constat / référence de preuve (requis pour changer l’état)</label><textarea rows="2" maxlength="2000" id="evidence-${r.id}" data-evidence="${r.id}" placeholder="Décrire le constat, sa date et ses limites ; aucune pièce jointe confidentielle.">${esc(o.evidence)}</textarea><div id="feedback-${r.id}" class="rule-feedback" role="status"></div></div></div>`}</article>`;
 }).join('');
 $('review-note').value=s.note;updateSummary();
}
$('defect').innerHTML=['Caoutchouc','Thermoplastique'].map(sec=>`<optgroup label="${sec}">${D.defects.filter(d=>d.sector===sec).map(d=>`<option value="${d.id}">${d.id} · ${esc(d.name)}</option>`).join('')}</optgroup>`).join('');
$('version').textContent=D.version;
$('defect').onchange=e=>{selected=e.target.value;render();$('feedback').textContent='Les observations de chaque fiche sont conservées en mémoire jusqu’au rechargement.';};
$('context-form').onsubmit=e=>e.preventDefault();
$('context-form').oninput=e=>{
 const k=e.target.dataset.field,pkey=e.target.dataset.proof,property=e.target.dataset.property;
 if(k){doc().context[k]=e.target.value;const p=doc().documentation[k];p.availability='unknown';p.review='unverified';$('availability-'+k).value='unknown';$('review-'+k).value='unverified';$('proof-summary-'+k).textContent='Preuve non vérifiée';$('proof-feedback-'+k).textContent='Texte modifié : disponibilité à requalifier ; preuve non vérifiée.';}
 else if(pkey&&['reference','reviewer','date'].includes(property)){const p=doc().documentation[pkey];p[property]=e.target.value;p.review='unverified';$('review-'+pkey).value='unverified';$('proof-summary-'+pkey).textContent='Preuve non vérifiée';$('proof-feedback-'+pkey).textContent='Métadonnée modifiée : une nouvelle déclaration est nécessaire.';}
 else return;
 dirty=true;updateSummary();
};
$('context-form').onchange=e=>{
 const k=e.target.dataset.proof,property=e.target.dataset.property;if(!k||!['availability','review'].includes(property))return;
 const p=doc().documentation[k];let message='';
 if(property==='availability'){if(['available','partial'].includes(e.target.value)&&!doc().context[k].trim()){e.target.value=p.availability;message='Renseignez d’abord le contexte correspondant.';}else{p.availability=e.target.value;p.review='unverified';message='Disponibilité déclarative ; preuve non vérifiée.';}}
 else if(e.target.value==='declared'&&!reviewReady(p,doc().context[k])){e.target.value='unverified';p.review='unverified';message='Déclaration refusée : information disponible, contexte, référence, auteur et date valide non future requis.';}
 else{p.review=e.target.value;message='Déclaration documentaire uniquement ; ni authentification ni validation métier.';}
 $('review-'+k).value=p.review;$('proof-summary-'+k).textContent=p.review==='declared'?'Vérification déclarée, non authentifiée':'Preuve non vérifiée';$('proof-feedback-'+k).textContent=message;dirty=true;updateSummary();
};
$('rules').oninput=e=>{const id=e.target.dataset.evidence;if(!id)return;const o=doc().observations[id]||(doc().observations[id]={status:'unknown',evidence:''});o.evidence=e.target.value;dirty=true;if(!o.evidence.trim()&&o.status!=='unknown'){o.status='unknown';$('status-'+id).value='unknown';$('feedback-'+id).textContent='Constat effacé : état remis à « Non examinée ».';}else $('feedback-'+id).textContent='';updateSummary();};
$('rules').onchange=e=>{const id=e.target.dataset.status;if(!id)return;const o=doc().observations[id]||(doc().observations[id]={status:'unknown',evidence:''});if(e.target.value!=='unknown'&&!o.evidence.trim()){e.target.value=o.status;$('feedback-'+id).textContent='Décrivez d’abord les éléments disponibles ou les informations manquantes.';$('evidence-'+id).focus();return;}o.status=e.target.value;dirty=true;$('feedback-'+id).textContent='État documentaire uniquement, sans confirmation de cause.';updateSummary();};
$('review-note').oninput=e=>{doc().note=e.target.value;dirty=true;};
const md=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\\`*_[\]#]/g,c=>'\\'+c);
function reportLegacy(){
 const d=current(),s=doc(),miss=missing(),ids=[...new Set([...d.refs,...d.rules.flatMap(r=>r.refs)])];
 return `# Vella Partners | Synthèse documentaire ${d.id}\n\nVersion ${D.version} | Générée le ${new Date().toISOString()}\n\nDÉVELOPPEMENT. Aucune validation expert, autorisation d’essai ou action opérationnelle. Cause non déterminée. Données déclaratives de démonstration, non vérifiées.\n\n## Défaut et domaine\n\n${d.name}\n\n${d.summary}\n\n${d.scope}\n\n${d.exclude}\n\n## Contexte déclaré\n\n${fields.map(([k,l])=>`- ${l} : ${md(s.context[k]||'Non renseigné')}`).join('\n')}\n\nInformations requises manquantes : ${miss.length?miss.join(', '):'aucune ; complétude déclarative seulement, applicabilité non validée'}.\nProcédé déclaré : ${compatible()?'pas de contradiction déclarée ; adéquation restant à valider':'HORS PÉRIMÈTRE, revue spécifique nécessaire'}.\n\n## Hypothèses et constats\n\n${d.rules.map(r=>{const o=s.observations[r.id]||{status:'unknown',evidence:''};return `### ${r.id} | ${r.title}\n\nStatut de règle : ${r.blocked?'BLOQUÉE, contenu non intégré':'candidate documentaire, non approuvée'}.\n\n${r.hypothesis}\n\nCollecte proposée par VP, non autorisée par ce document : ${r.collect}\n\nLimites : ${r.caution}\n\nÉtat saisi : ${r.blocked?'non disponible':states[o.status]}.\n\nConstat déclaré : ${md(o.evidence||'Non renseigné')}.\n\nClôture à préparer : ${r.closure}\n\nFondements : ${r.refs.length?r.refs.map(id=>`[${id}](${D.sources[id].url})`).join(' ; '):'aucun fondement public suffisant intégré'}.\n`;}).join('\n')}\n## Questions pour la revue\n\n${md(s.note||'Non renseigné')}\n\n## Références et limites de transposition\n\n${ids.map(id=>{const x=D.sources[id];return `- [${id} | ${x.name}](${x.url}) : ${x.type}. Repère : ${x.locator}. Domaine : ${x.scope} Limite : ${x.limit}`}).join('\n')}\n\n## Décision\n\nCause non déterminée. Aucun réglage prescrit. Aucun résultat terrain validé. Toute intervention relève des procédures et habilitations du site.\n`;
}
function download(text,name,type){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}
function report(){
 const c=documentaryCounts(),s=doc();
 const summary=`## Disponibilité et preuves\n\n${c.filled}/${c.total} champs requis remplis ; ${c.available}/${c.total} informations disponibles (déclarées) ; ${c.reviewed}/${c.total} vérifications déclarées. Aucune preuve authentifiée par l’application. Ces compteurs ne valent pas validation métier.\n\n`+fields.map(([k,l,req])=>{const p=s.documentation[k];return `- ${l}${req?' (requis)':' (facultatif, hors compteurs)'} : ${availabilityLabels[p.availability]} ; ${p.review==='declared'?'vérification déclarée, non authentifiée':'preuve non vérifiée'}. Référence : ${md(p.reference||'absente')}. Auteur déclaré : ${md(p.reviewer||'absent')}. Date : ${md(p.date||'absente')}.`;}).join('\n')+'\n\n';
 const cited=ids=>ids.map(id=>`[${D.sources[id].name}](${D.sources[id].url})`).join(' ; ');
 const supplements=current().rules.filter(r=>r.review).map(r=>{const x=r.review;return `### ${r.id} | ${x.status}\n\n${x.finding}\n\nFondements : ${cited(x.refs)}.\n\nCollecte proposée : ${x.collect}\n\nLimites : ${x.limit}\n`;}).join('\n');
 const guide=(D.collectionGuide[current().sector]||[]).map(x=>`- ${x.title} : ${x.text} (${cited(x.refs)})`).join('\n');
 return reportLegacy().replace(/Informations requises manquantes : [^\n]*\n/,summary).replace('## Décision',`## Compléments documentaires du ${D.reviewed}\n\nCes constats portent sur les publications, pas sur le cas saisi. Règles toujours candidates ; aucune approbation métier.\n\n${supplements||'Pas de complément spécifique pour ces règles.'}\n\n## Précisions de collecte proposées\n\n${guide}\n\n## Décision`);
}
$('export-md').onclick=()=>{download(report(),`VP_Lot2bis_${selected}_synthese.md`,'text/markdown;charset=utf-8');$('feedback').textContent='Synthèse Markdown générée pour cette fiche. Elle ne vaut pas validation métier.';};
$('export-json').onclick=()=>{const payload={schema:'vp-l2bis-draft-2',version:D.version,selected,dossiers};try{validateDraft(payload);}catch(err){$('feedback').textContent='Export refusé : '+err.message+' Vérifiez notamment les dates ; vos saisies restent en mémoire.';return;}download(JSON.stringify(payload,null,2),'VP_Lot2bis_brouillon.json','application/json');dirty=false;$('feedback').textContent='Brouillon JSON v2 généré pour les six dossiers. Conservez le fichier avant de fermer la page ; cette version ne se réimporte pas dans l’ancienne DEV v1.';};
const isObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
function askConfirmation(message){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='vp-confirm';dialog.setAttribute('aria-labelledby','vp-confirm-title');
  dialog.innerHTML='<h2 id="vp-confirm-title">Confirmer cette opération</h2><p></p><div class="actions"><button type="button" data-cancel>Annuler</button><button type="button" data-confirm>Confirmer</button></div>';
  dialog.querySelector('p').textContent=message;
  const finish=value=>{dialog.close();dialog.remove();resolve(value);};
  dialog.querySelector('[data-cancel]').onclick=()=>finish(false);dialog.querySelector('[data-confirm]').onclick=()=>finish(true);
  dialog.oncancel=e=>{e.preventDefault();finish(false);};document.body.appendChild(dialog);dialog.showModal();dialog.querySelector('[data-cancel]').focus();
 });
}
function validateDraft(x){
 const legacy=isObj(x)&&x.schema==='vp-l2bis-draft-1'&&x.version==='VP-DEV-L2B-2026-10-29-1';
 if(!isObj(x)||(!legacy&&(x.schema!=='vp-l2bis-draft-2'||![D.version,'VP-DEV-L2B-2026-10-29-2'].includes(x.version)))||!D.defects.some(d=>d.id===x.selected)||!isObj(x.dossiers))throw Error('Format ou version du brouillon non reconnu.');
 if(Object.keys(x.dossiers).some(k=>!D.defects.some(d=>d.id===k)))throw Error('Identifiant de fiche inconnu.');
 const out={};
 for(const d of D.defects){
  const c=x.dossiers[d.id];if(!isObj(c)||!isObj(c.context)||!isObj(c.observations)||typeof c.note!=='string'||c.note.length>2000)throw Error('Dossier incomplet ou types incorrects.');
  const n=blank();for(const [k]of fields){if(typeof c.context[k]!=='string'||c.context[k].length>1200)throw Error('Contexte invalide.');n.context[k]=c.context[k];}
  if(!processes.includes(n.context.process))throw Error('Procédé non reconnu.');
  if(!legacy){
   if(!isObj(c.documentation)||Object.keys(c.documentation).some(k=>!fields.some(f=>f[0]===k)))throw Error('Registre documentaire invalide.');
   for(const [k]of fields){const p=c.documentation[k];if(!isObj(p)||!Object.hasOwn(availabilityLabels,p.availability)||!['unverified','declared'].includes(p.review)||typeof p.reference!=='string'||p.reference.length>300||typeof p.reviewer!=='string'||p.reviewer.length>120||typeof p.date!=='string'||(p.date&&!validDate(p.date))||(['available','partial'].includes(p.availability)&&!n.context[k].trim())||(p.review==='declared'&&!reviewReady(p,n.context[k])))throw Error('Disponibilité ou déclaration de vérification invalide.');n.documentation[k]={availability:p.availability,reference:p.reference,reviewer:p.reviewer,date:p.date,review:p.review};}
  }
  for(const [id,o]of Object.entries(c.observations)){
   const r=d.rules.find(r=>r.id===id);if(!r||r.blocked||!isObj(o)||!Object.hasOwn(states,o.status)||typeof o.evidence!=='string'||o.evidence.length>2000||(o.status!=='unknown'&&!o.evidence.trim()))throw Error('Observation, statut ou identifiant de règle invalide.');
   n.observations[id]={status:o.status,evidence:o.evidence};
  }
  n.note=c.note;out[d.id]=n;
 }return out;
}
$('import-json').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{if(f.size>200000)throw Error('Fichier trop volumineux (limite 200 Ko).');const x=JSON.parse(await f.text()),next=validateDraft(x);
 if(dirty&&!await askConfirmation('Remplacer les six dossiers en mémoire par ce brouillon ? Exportez les saisies à conserver avant de continuer.'))return;
 dossiers=next;selected=x.selected;dirty=false;render();$('feedback').textContent='Brouillon repris. '+(x.schema==='vp-l2bis-draft-1'?'Ancien format v1 : textes et constats conservés ; disponibilités non qualifiées, preuves non vérifiées. ':'')+(x.version!==D.version?'Corpus documentaire enrichi : réexaminer les constats conservés à la lumière des compléments. ':'')+'Les statuts sont déclaratifs ; aucune validation expert importée.';
 }catch(err){$('feedback').textContent='Import refusé : '+err.message+' Les saisies actuelles sont conservées.';}finally{e.target.value='';}
};
$('reset').onclick=async()=>{if(!await askConfirmation('Effacer uniquement cette enquête ? Les autres fiches seront conservées.'))return;dossiers[selected]=blank();dirty=true;render();$('feedback').textContent='Enquête effacée en mémoire. Les fichiers déjà exportés restent inchangés.';};
function preparePrint(){
 document.querySelectorAll('.print-value').forEach(x=>x.remove());
 document.querySelectorAll('.rule details,.proof-controls details,#collection-guide').forEach(x=>x.open=true);
 document.querySelectorAll('#context-form input,#context-form select,#context-form textarea,#rules select,#rules textarea,#review-note').forEach(el=>{
  const text=document.createElement('div');text.className='print-value';text.textContent=(el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:el.value)||'Non renseigné';el.after(text);
 });
}
addEventListener('beforeprint',preparePrint);
addEventListener('afterprint',()=>document.querySelectorAll('.print-value').forEach(x=>x.remove()));
$('print-doc').onclick=()=>{preparePrint();window.print();};
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
render();
})();
