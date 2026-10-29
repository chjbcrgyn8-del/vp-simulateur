(function(){'use strict';
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={caoutchouc:'Caoutchouc',plasturgie:'Thermoplastique',decolletage:'Décolletage'};
let D,selected='',view='rules',notes={},dirty=false;
const safeURL=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const link=(u,t)=>safeURL(u)?`<a href="${esc(safeURL(u))}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`:esc(t);
const sourceBy=id=>D.devSources[id]||D.sources.find(s=>s.id===id);
const currentCase=()=>view==='rules'?D.rules.find(r=>r.id===selected):null;
const caseRules=r=>r?D.rules.filter(x=>x.sector===r.sector&&x.defectCode===r.defectCode):[];
function sourceHTML(id){const s=sourceBy(id);if(!s)return '<p>Référence non disponible.</p>';return `<div class="source"><p>${link(s.url,s.id+' · '+s.title)}</p><p class="l3-muted">${esc(s.status)}${s.private?'':'. Droits : '+esc(s.rights||'à qualifier dans le domaine')}</p>${s.private?'':`<p>Domaine : ${esc(s.scope||'Non précisé')}</p><p>Limites : ${esc(s.limits||'À instruire')}</p>`}</div>`;}
function filteredRules(){const sector=$('l3-sector').value,q=$('l3-search').value.trim().toLocaleLowerCase(),priority=$('l3-priority').value;return D.rules.filter(r=>(!sector||r.sector===sector)&&(!priority||r.priority===priority)&&(!q||[r.id,r.title,r.defect,r.hypothesis,r.check].join(' ').toLocaleLowerCase().includes(q)));}
function detail(){
 const r=D.rules.find(x=>x.id===selected);
 if(!r){$('rule-detail').innerHTML='<h2>Aucun résultat</h2><p>Modifiez les filtres ; aucune règle n’est supprimée.</p>';return;}
 const x=r.review;
 $('rule-detail').innerHTML=`<p class="l3-print-note" hidden>Vella Partners · Lot 3 DEV · Préparation documentaire, non opérationnelle.</p><p class="eyebrow">${esc(r.id)} · ${esc(labels[r.sector])}</p><h2>${esc(r.title)}</h2><p>${esc(r.defect)} · ${esc(r.version)} · ${r.priority==='P1_REVIEW'?'Priorité de revue proposée':'Revue à préparer'}</p>
 <div class="l3-decision"><strong>${r.blocked?'Contenu bloqué, non intégré':'Hypothèse documentaire candidate'}</strong><span>Décision : en attente. Action approuvée : aucune. Exécution : impossible.</span></div>
 <p class="l3-muted">${esc(r.origin)}. ${r.privateDependency?'L’archive cite une contribution privée : son texte n’est pas repris.':''}</p>
 ${r.existingDefect?`<p><a href="expertise-documentaire.html?defect=${esc(r.existingDefect)}">Ouvrir la fiche publique DEV correspondante, avec ses compléments</a></p>`:''}
 <h3>Situation à documenter</h3><p>${esc(r.trigger)}</p><h3>Hypothèses, pas causes démontrées</h3><p>${esc(r.hypothesis)}</p>
 <div class="ref-links">${r.refs.map(id=>{const s=sourceBy(id);return s?link(s.url,s.id+' · '+s.title):esc(id);}).join('')}</div>
 <h3>Contrôle candidat à faire valider</h3><p>${esc(r.check)}</p><p class="l3-muted">Tout accès, mesure ou intervention nécessite la procédure et les habilitations du site.</p>
 <h3>Limites et contre-preuves</h3><p>${esc(r.limits)}</p><h3>Preuve de clôture à définir</h3><p>${esc(r.closure)}</p>
 ${x?`<details class="l3-dev-review"><summary>Complément documentaire de la DEV précédente</summary><p><strong>${esc(x.status)}</strong></p><p>${esc(x.finding)}</p><p>Limite : ${esc(x.limit)}</p><p>Collecte proposée : ${esc(x.collect)}</p><div class="ref-links">${x.refs.map(id=>link(D.devSources['DEV:'+id].url,D.devSources['DEV:'+id].title)).join('')}</div></details>`:''}
 <details><summary>Sources, domaine et limites</summary>${r.refs.map(sourceHTML).join('')}<p class="l3-muted">Associations règle–source fournies ou conservées du corpus DEV, sans nouvelle vérification exhaustive.</p></details>
 <details><summary>Blocages et contexte à qualifier</summary><p>${r.blockers.length?'Blocages explicites : '+esc(r.blockers.join(' ; ')):'Aucun blocage spécifique listé ne vaut autorisation.'}</p><ul>${r.requirements.map(k=>`<li>${esc(k)}</li>`).join('')}</ul><p>Approbation expert, droits, autorisation du site et preuve terrain : non acquis.</p></details>
 <h3>Question de revue</h3><p>${esc(r.question)}</p><label for="l3-note">Note préparatoire pour ${esc(r.id)} · sans signature ni décision</label><textarea id="l3-note" maxlength="4000" placeholder="Question, document à obtenir, contradiction à examiner. Données fictives ou anonymisées seulement.">${esc(notes[r.id]||'')}</textarea><p class="l3-print-note" hidden>${esc(notes[r.id]||'Aucune note préparatoire.')}</p>
 <p class="l3-muted">Aucun bouton ne permet d’approuver une action. Exportez vos notes avant de quitter cette page.</p>`;
 $('l3-note').oninput=e=>{notes[r.id]=e.target.value;dirty=true;$('l3-feedback').textContent='Note en mémoire seulement ; aucune décision modifiée.';};
}
function render(){
 $('l3-print').disabled=view!=='rules';
 $('priority-filter').hidden=view!=='rules';
 for(const v of ['rules','sources','coverage'])$(v+'-view').hidden=view!==v;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 const sector=$('l3-sector').value,q=$('l3-search').value.trim().toLocaleLowerCase();
 if(view==='rules'){
  const list=filteredRules();if(!list.some(r=>r.id===selected))selected=list[0]?.id||'';
  $('filter-result').textContent=`${list.length} / 48 règles candidates affichées · 0 action activée`;
  $('rule-list').innerHTML=list.map(r=>`<button data-rule-id="${esc(r.id)}" aria-pressed="${r.id===selected}"><strong>${esc(r.id)} · ${esc(r.title)}</strong><small>${esc(labels[r.sector])} · ${r.priority==='P1_REVIEW'?'Revue prioritaire proposée':'Candidate'}${r.blocked?' · Bloquée':''}</small></button>`).join('');
  detail();$('l3-print').disabled=!selected;
 }else if(view==='sources'){
  const list=D.sources.filter(s=>(!sector||s.sector===sector)&&(!q||[s.id,s.title,s.scope,s.doi].join(' ').toLocaleLowerCase().includes(q)));
  $('filter-result').textContent=`${list.length} / 178 notices affichées · 5 références privées réservées dans le registre complet`;
  $('source-list').innerHTML=list.map(s=>`<article class="l3-source"><h3>${link(s.url,s.id+' · '+s.title)}</h3><p>${esc(s.status)}</p>${s.private?'<p>Ni contenu, ni titre privé, ni document expert embarqué.</p>':`<p>Nature fournie : ${esc(s.nature)} · ${esc(labels[s.sector]||s.sector)}</p><p>Domaine : ${esc(s.scope)}</p><p>Limites : ${esc(s.limits)}</p><p class="l3-muted">Accès : ${esc(s.access)}. Droits : ${esc(s.rights)}.</p>${s.doi?`<p>DOI fourni : ${esc(s.doi)}</p>`:''}`}</article>`).join('')||'<p>Aucune notice pour ces filtres.</p>';
 }else{
  const list=Object.keys(labels).flatMap(sec=>(D.coverage[sec]||[]).map(x=>({...x,sector:sec}))).filter(x=>(!sector||x.sector===sector)&&(!q||JSON.stringify(x).toLocaleLowerCase().includes(q)));
  $('filter-result').textContent=`${list.length} entrées de couverture affichées · aucune couverture opérationnelle validée`;
  $('coverage-list').innerHTML=list.map(x=>`<article class="l3-source"><h3>${esc(x.code)} · ${esc(x.defect||x.title)}</h3><p>${esc(labels[x.sector])} · inventaire documentaire</p>${x.scope?`<p>${esc(x.scope)}</p>`:''}${x.linked_rules_as_supplied?`<p>Rapprochement fourni, à revoir : ${esc(x.linked_rules_as_supplied)}</p>`:''}<p class="l3-muted">Les liens de couverture ne prouvent ni exhaustivité ni efficacité d’un diagnostic.</p></article>`).join('')||'<p>Aucune entrée pour ces filtres.</p>';
 }
 const active=currentCase(),family=caseRules(active);
 $('l3-export-case').disabled=!active;
 $('l3-case-scope').textContent=active?`Cas sélectionné : ${active.defectCode} · ${labels[active.sector]} · ${active.defect}. Export : ${family.length} règles de cette famille et leurs notes uniquement, indépendamment des filtres.`:'Sélectionnez une règle dans « Règles candidates » pour exporter son cas.';
}
function download(text,name,type){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}
const md=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\\`*_[\]#]/g,c=>'\\'+c);
function markdown(active=null){
 const list=active?caseRules(active):D.rules.filter(r=>r.priority==='P1_REVIEW'||notes[r.id]?.trim());
 const scope=active?`Cas sélectionné : ${md(active.defectCode)} · ${md(labels[active.sector])} · ${md(active.defect)}.\n\nPérimètre : ${list.length} règles de cette famille et leurs notes uniquement. Les filtres d’écran ne réduisent pas cette famille ; les priorités des autres familles sont exclues. Cet export documentaire n’est pas un dossier client identifié.`:'Neuf priorités proposées et règles annotées ; les filtres d’écran ne limitent pas cet export.';
 return `# Vella Partners | ${active?'Cas documentaire '+md(active.defectCode):'Préparation de revue Lot 3'}\n\n${D.version}\n\nDEV documentaire uniquement. 48 candidats ; 178 notices dont 5 réservées. Aucun texte privé ni action candidate repris. Sources non toutes revérifiées, droits non acquis. Aucun résultat terrain validé.\n\n${scope}\n\n`+list.map(r=>`## ${r.id} | ${md(r.title)}\n\nDécision : EN ATTENTE. Action approuvée : AUCUNE. ${r.blocked?'CONTENU BLOQUÉ.':''}\n\nOrigine : ${md(r.origin)}.\n\nHypothèse : ${md(r.hypothesis)}\n\nContrôle candidat à faire valider : ${md(r.check)}\n\nLimites : ${md(r.limits)}\n\nClôture à définir : ${md(r.closure)}\n\n${r.review?`Complément DEV : ${md(r.review.finding)}\n\nLimite du complément : ${md(r.review.limit)}\n\n`:''}Question : ${md(r.question)}\n\nNote préparatoire : ${md(notes[r.id]||'Non renseignée')}\n\nSources :\n${r.refs.map(id=>{const s=sourceBy(id);return `- ${safeURL(s.url)?`[${md(s.id+' · '+s.title)}](${safeURL(s.url)})`:md(s.id+' · '+s.title)}. ${md(s.status)}. Domaine : ${md(s.scope||'réservé')}. Limites : ${md(s.limits||'à instruire')}.`;}).join('\n')}\n`).join('\n')+'\n## Décision globale\n\nAucune signature, validation expert ou autorisation d’essai créée. Aucun réglage prescrit. Les notes sont déclaratives.\n';
}
function confirmImport(){return new Promise(resolve=>{const d=document.createElement('dialog');d.className='vp-confirm';d.innerHTML='<h2>Remplacer les notes en mémoire ?</h2><p>Exportez les notes actuelles si vous souhaitez les conserver. Aucune décision ni règle ne sera modifiée.</p><div class="actions"><button data-cancel>Annuler</button><button data-confirm>Remplacer les notes</button></div>';const end=v=>{d.close();d.remove();resolve(v);};d.querySelector('[data-cancel]').onclick=()=>end(false);d.querySelector('[data-confirm]').onclick=()=>end(true);d.oncancel=e=>{e.preventDefault();end(false);};document.body.appendChild(d);d.showModal();d.querySelector('[data-cancel]').focus();});}
function validateNotes(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!['schema','version','notes'].includes(k))||x.schema!=='vp-l3-review-notes-1'||![D.version,'VP-DEV-L3-2026-10-29-1'].includes(x.version)||!x.notes||typeof x.notes!=='object'||Array.isArray(x.notes))throw Error('Format de notes inconnu ; les fichiers bruts et signatures sont refusés.');
 const result={};for(const [id,text]of Object.entries(x.notes)){if(!D.rules.some(r=>r.id===id)||typeof text!=='string'||text.length>4000)throw Error('Identifiant ou note invalide.');result[id]=text;}return result;
}
async function start(){
 try{
 const res=await fetch('lot3-catalog.json');if(!res.ok)throw Error('Catalogue indisponible');D=await res.json();
 if(D.rules.length!==48||D.sources.length!==178||D.rules.some(r=>r.canExecute!==false||r.approvedAction!==null||r.decision!=='PENDING'))throw Error('Catalogue non conforme : consultation bloquée');
 selected=D.rules[0].id;$('lot3-version').textContent=D.version;$('catalog-status').textContent='48 candidats : 12 caoutchouc · 12 thermoplastique · 24 décolletage. 9 priorités proposées. 178 notices, dont 5 réservées. 0 action approuvée.';
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
 $('l3-sector').onchange=render;$('l3-priority').onchange=render;$('l3-search').oninput=render;
 $('rule-list').onclick=e=>{const b=e.target.closest('[data-rule-id]');if(b){selected=b.dataset.ruleId;render();if(innerWidth<=760)$('rule-detail').scrollIntoView({block:'start'});}};
 for(const id of ['l3-export-md','l3-export-json','l3-import','l3-print'])$(id).disabled=false;
 $('l3-export-md').onclick=()=>{download(markdown(),'VP_Lot3_Preparation_Revue.md','text/markdown;charset=utf-8');$('l3-feedback').textContent='Préparation exportée ; aucune décision signée.';};
 $('l3-export-case').onclick=()=>{const active=currentCase();if(!active)return;download(markdown(active),'VP_Lot3_Cas_'+active.defectCode+'.md','text/markdown;charset=utf-8');$('l3-feedback').textContent=`Cas ${active.defectCode} exporté : ${caseRules(active).length} règles uniquement. Les autres notes restent en mémoire ; aucune décision signée.`;};
 $('l3-export-json').onclick=()=>{download(JSON.stringify({schema:'vp-l3-review-notes-1',version:D.version,notes},null,2),'VP_Lot3_Notes_Revue.json','application/json');dirty=false;$('l3-feedback').textContent='Notes exportées pour reprise. Les règles et décisions ne sont pas modifiées.';};
 $('l3-import').onchange=async e=>{const f=e.target.files[0];try{if(!f)return;if(f.size>500000)throw Error('Fichier trop volumineux.');const next=validateNotes(JSON.parse(await f.text()));if(dirty&&!await confirmImport()){$('l3-feedback').textContent='Import annulé ; notes conservées.';return;}notes=next;dirty=false;render();$('l3-feedback').textContent='Notes reprises ; aucun statut expert ou droit importé.';}catch(err){$('l3-feedback').textContent='Import refusé : '+err.message+' Notes actuelles conservées.';}finally{e.target.value='';}};
 $('l3-print').onclick=()=>{view='rules';if(!selected)selected=D.rules[0].id;detail();render();if(!selected){$('l3-feedback').textContent='Choisissez une règle avant impression.';return;}document.querySelectorAll('#rule-detail details').forEach(d=>d.open=true);window.print();};
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 render();
 }catch(err){$('catalog-status').textContent='Chargement bloqué : '+err.message+'. Aucune action disponible.';}
}
start();
})();
