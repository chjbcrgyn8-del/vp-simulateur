/* VP Expert — façade commune progressive. Les moteurs métier restent propriétaires des règles. */
(() => {
 'use strict';
 const api=window.VPExpertAPI;
 if(!api) return; // Le parcours historique reste lisible en cas de moteur absent.
 const $=id=>document.getElementById(id);
 const sector={TP:['Injection plastique','Référentiel expert'],CA:['Caoutchouc','Référentiel expert'],DC:['Décolletage','Référentiel candidat'],TS:['Traitement de surface','Référentiel candidat']}[api.sector];
 const labels=['Le défaut','Le contexte','Les contrôles','Essai & synthèse'];
 const descriptions=['Choisissez ce que vous observez.','Décrivez les faits, pas encore la cause.','Mesurez, puis notez chaque constat.','Tracez l’action et vérifiez le résultat.'];
 const main=document.querySelector('main');
 document.body.classList.add('vp-ui');
 const hero=main.querySelector('.ehero');
 hero.innerHTML='<div class="vp-eyebrow"><span class="vp-dot"></span> VP EXPERT <span class="vp-slash">/</span> '+sector[0]+'</div><h1>Un défaut qui revient ?<br><span>Traitez-le avec méthode.</span></h1><p class="lead">Du défaut constaté à la solution validée : des contrôles dans le bon ordre,<br class="vp-desktop"> des essais tracés, un savoir capitalisé.</p><div class="vp-hero-meta"><span>Sans connexion machine</span><span>Sans inscription</span><span>'+sector[1]+'</span></div>';
 const nav=main.querySelector('.esteps');
 nav.setAttribute('aria-label','Parcours VP Expert');
 nav.innerHTML=labels.map((l,i)=>'<li><button type="button" data-vp-step="'+(i+1)+'"><span class="vp-step-number">0'+(i+1)+'</span><span>'+l+'</span></button></li>').join('');
 const layout=document.createElement('div');layout.className='vp-workbench';
 const work=document.createElement('div');work.className='vp-work';layout.append(work);
 nav.after(layout);
 const groups=labels.map((_,i)=>{const g=document.createElement('div');g.className='vp-stage';g.id='vp-step-'+(i+1);g.hidden=i!==0;work.append(g);return g});
 groups[0].append($('s0'));
 groups[1].append($('s2'));
 if($('s1'))groups[2].append($('s1'));
 groups[2].append($('s3'));
 const ishi=document.createElement('details');ishi.className='vp-advanced';
 ishi.innerHTML='<summary>Diagramme d’Ishikawa · toutes les familles</summary>';
 ishi.append($('s4'));groups[2].append(ishi);
 const history=document.createElement('details');history.className='vp-advanced';history.id='vp-history';
 history.innerHTML='<summary>Historique des contrôles</summary>';history.append($('hist'));groups[2].append(history);
 groups[3].append($('expert-followup'),$('expert-synthese'),$('expert-toolbar'));
 const foot=document.createElement('div');foot.className='vp-stage-footer';
 foot.innerHTML='<button type="button" id="vp-prev">← Précédent</button><p id="vp-footer-note"></p><button type="button" id="vp-next">Continuer <span aria-hidden="true">→</span></button>';
 work.append(foot);
 const sidebar=document.createElement('aside');sidebar.className='vp-case';sidebar.setAttribute('aria-label','Dossier en cours');
 sidebar.innerHTML='<div class="vp-case-top"><span class="vp-dot"></span><span>DOSSIER EN COURS</span><span class="vp-local">LOCAL</span></div><p class="vp-case-sector">'+sector[0]+'</p><h2 id="vp-case-defect"></h2><span class="vp-proof-level">'+sector[1]+' · à contextualiser</span><div class="vp-case-divider"></div><div class="vp-case-stat"><span>Contexte renseigné</span><strong id="vp-context-count">0 / 7</strong></div><div class="vp-meter"><i id="vp-context-meter"></i></div><div class="vp-case-stat"><span>Contrôles enregistrés</span><strong id="vp-controls-count">0</strong></div><div class="vp-case-stat"><span>Écarts observés</span><strong id="vp-nc-count">0</strong></div><p class="vp-case-notice">Un constat n’est pas une cause démontrée. Les méthodes ou la qualité valident la conclusion.</p><div class="vp-case-divider"></div><h3>Votre dossier, avec vous.</h3><p class="vp-case-help">Pas de sauvegarde serveur. Exportez pour conserver vos réponses et reprendre l’enquête.</p><button type="button" class="vp-case-primary" data-vp-action="expert-export">Exporter le dossier <span aria-hidden="true">↗</span></button><button type="button" data-vp-action="expert-import">Reprendre un dossier</button><button type="button" class="vp-case-reset" data-vp-action="expert-new">Nouveau dossier</button><p id="vp-status" role="status" aria-live="polite">Réponses vierges · dossier dans cette page.</p><a class="vp-case-source" href="'+(api.sector==='DC'?'sources-decolletage.html':api.sector==='TS'?'sources-traitement-surface.html':'lot3-documentaire.html')+'">Sources et méthode <span aria-hidden="true">↗</span></a>';
 layout.append(sidebar);
 const intro=document.createElement('p');intro.className='vp-context-intro';intro.textContent='Renseignez ce que vous savez. Une réponse inconnue reste vide : elle ne sera pas interprétée comme un fait.';
 $('s2').querySelector('h2').after(intro);
 const note=document.createElement('p');note.className='vp-reference-note';note.textContent='Démonstration : consignes et tolérances d’exemple. La fiche validée de votre machine, de votre matière et de votre outillage prime. Aucune valeur de réglage à recopier.';
 $('s3').querySelector('h2').after(note);
 const initialCopy=document.createElement('div');initialCopy.className='vp-panel-topline';initialCopy.innerHTML='<span>OBSERVATION TERRAIN</span><span id="vp-defect-total"></span>';$('s0').prepend(initialCopy);
 const num=($('s0').querySelector('h2 .num'));if(num)num.textContent='01';
 const qsnum=$('s2').querySelector('h2 .num');if(qsnum)qsnum.textContent='02';
 const mesnum=$('s1')?.querySelector('h2 .num');if(mesnum)mesnum.textContent='03';
 const resnum=$('s3').querySelector('h2 .num');if(resnum)resnum.textContent='03';
 const follnum=$('expert-followup').querySelector('h2 .num');if(follnum)follnum.textContent='04';
 $('expert-synthese').querySelector('h2 .num')?.remove();
 let step=1,lastFocus=null,lastSans=null;
 function focusHeading(){const target=groups[step-1].querySelector('h2');if(target){target.tabIndex=-1;target.focus({preventScroll:true})}}
 function go(next,focus=true){
  step=Math.max(1,Math.min(4,next));groups.forEach((g,i)=>g.hidden=i!==step-1);document.body.dataset.vpStage=String(step);
  nav.querySelectorAll('[data-vp-step]').forEach((b,i)=>{if(i===step-1)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  $('vp-prev').disabled=step===1;
  $('vp-next').hidden=step===4;
  $('vp-next').innerHTML=(step===3?'Préparer l’essai':'Continuer')+' <span aria-hidden="true">→</span>';
  $('vp-footer-note').textContent=descriptions[step-1];
  if(focus){focusHeading();nav.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  update();
 }
 function annotateTables(){
  document.querySelectorAll('.mest table').forEach(t=>{
   const labels=[...t.querySelectorAll('thead th')].map(h=>h.innerText.replace(/\s+/g,' ').trim());
   t.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>{cell.dataset.label=labels[i]||''}));
  });
  document.querySelectorAll('.mesin,.vpmesin').forEach(el=>{const invalid=String(el.value).trim()!==''&&window.VPNumber.parse(el.value)===null;el.setAttribute('aria-invalid',String(invalid));});
 }
 /* Étape « Les contrôles ». Par défaut (relevé à la main) la liste des leviers passe en premier : la question sur les
    mesures et le tableau de saisie suivent. Les deux autres modes (avec les mesures, une dérive) commencent par une saisie
    nécessaire et gardent leur ordre. On déplace les nœuds eux-mêmes, pas seulement leur affichage : l'ordre de tabulation
    suit l'ordre visuel. Rien ici ne touche aux règles ni aux classements des moteurs. */

 /* Plastique : même principe, mais les cartes de situation et le tableau des mesures sont dans #mes, à l'intérieur de #s3.
    En relevé à la main, #mes passe après la liste des leviers (#res). Avec VP Predict ou en dérive, il reste en tête. */
 function arrangePlastic(s3,res){
  const mes=$('mes'),sit=$('sit');
  const sans=!!sit.querySelector('[data-b="sans"][aria-pressed="true"]');
  const mesFirst=!!(mes.compareDocumentPosition(res)&Node.DOCUMENT_POSITION_FOLLOWING);
  if(sans&&mesFirst)res.after(mes);
  if(!sans&&!mesFirst)s3.insertBefore(mes,res);
  if(lastSans!==null&&lastSans!==sans&&!groups[2].hidden){
   (sans?res:mes).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   sit.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  }
  lastSans=sans;
 }
 function arrangeControls(){
  const s1=$('s1'),s3=$('s3'),res=$('res');
  if(!s1&&s3&&res&&$('mes')&&$('sit')){arrangePlastic(s3,res);return}
  if(!s1||!s3||!res)return;
  const sans=!!s1.querySelector('[data-b="sans"][aria-pressed="true"]');
  const stage=groups[2],table=res.querySelector(':scope > .vpmes');
  const s3First=!!(s3.compareDocumentPosition(s1)&Node.DOCUMENT_POSITION_FOLLOWING);
  if(sans&&!s3First)stage.insertBefore(s3,s1);
  if(!sans&&s3First)stage.insertBefore(s1,s3);
  if(table){if(sans&&res.lastElementChild!==table)res.append(table);if(!sans&&res.firstElementChild!==table)res.prepend(table)}
  /* Changement de mode après coup : on amène à l'écran le bloc qui vient de changer de place, focus sur le choix fait. */
  if(lastSans!==null&&lastSans!==sans&&!stage.hidden){
   (sans?s3:s1).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   s1.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  }
  lastSans=sans;
 }
 function update(){
  arrangeControls();
  const fiche=[...document.querySelectorAll('#fiche span')].find(s=>s.querySelector('i')?.textContent==='Quoi');
  $('vp-case-defect').textContent=fiche?fiche.textContent.replace(/^Quoi\s*/,'').trim():api.S.def;
  const questions=['qui','ou','quand','freq','terme','combien','pourquoi'];const n=questions.filter(k=>api.S[k]).length;
  $('vp-context-count').textContent=n+' / '+questions.length;
  $('vp-context-meter').style.width=(100*n/questions.length)+'%';
  const K=api.KEY(),nc=Object.keys(api.REC[K]||{}).length,ok=Object.keys(api.OK[K]||{}).length;
  $('vp-controls-count').textContent=nc+ok;$('vp-nc-count').textContent=nc;
  history.hidden=!api.HIST.length;history.querySelector('summary').textContent='Historique des contrôles · '+api.HIST.length;
  ishi.hidden=$('s4').hidden;
  $('vp-defect-total').textContent=(api.choices.def?.length||'')+' défauts référencés';
  annotateTables();
  const fictional=$('expert-toolbar').querySelector('strong').textContent.includes('FICTIF');
  sidebar.classList.toggle('vp-fictional',fictional);
  sidebar.querySelector('.vp-local').textContent=fictional?'FICTIF':'LOCAL';
  $('s2').querySelector('.vp-context-intro').textContent=fictional?'Cas fictif prérempli : toutes les observations, références et conclusions sont inventées.':'Renseignez ce que vous savez. Une réponse inconnue reste vide : elle ne sera pas interprétée comme un fait.';
 }
 // Preserve keyboard focus on a context choice after native re-render.
 document.addEventListener('click',e=>{const b=e.target.closest('.opts button');if(b)lastFocus={k:b.closest('.opts').dataset.k,v:b.dataset.v};else lastFocus=null},true);
 window.addEventListener('vp:enquete-render',()=>{
  update();
  if(lastFocus){const {k,v}=lastFocus;const target=[...document.querySelectorAll('.opts')].find(o=>o.dataset.k===k)?.querySelector('[data-v="'+CSS.escape(v)+'"]');target?.focus({preventScroll:true});lastFocus=null}
 });
 const source=$('expert-status');new MutationObserver(()=>{$('vp-status').textContent=source.textContent;update()}).observe(source,{childList:true,characterData:true,subtree:true});
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.vpStep){go(+b.dataset.vpStep);return}
  if(b.id==='vp-next'){go(step+1);return}
  if(b.id==='vp-prev'){go(step-1);return}
  if(b.dataset.vpAction){$(b.dataset.vpAction)?.click();return}
  if(b.dataset.def&&step===1)go(2);
  if(b.dataset.drift||b.dataset.go)go(3);
  if(b.dataset.outcome)update();
  if(b.id==='expert-confirm'){go(2);update()}
 });
 document.addEventListener('change',update);
 const printState=[];
 window.addEventListener('beforeprint',()=>{document.querySelectorAll('.vp-advanced').forEach(d=>{printState.push([d,d.open]);d.open=true})});
 window.addEventListener('afterprint',()=>printState.splice(0).forEach(([d,v])=>d.open=v));
 go(1,false);
})();