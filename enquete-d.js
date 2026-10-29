(function(){
/* Enquête défaut décolletage · même parcours que l'enquête caoutchouc (enquete-c.js) : défaut → mesures → QQOQC → leviers → Ishikawa.
   Référentiel candidat de 8 défauts DC-01 / DC-04, ordre de contrôle proposé par Vella Partners, à valider par un expert décolletage.
   Tests de non-transposition repris du dossier v2.0 : contre-mesure avant correction, branche canon masquée sans canon,
   donnée absente ≠ conforme. */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=window.VELLA_REF_DEC,REF=R.defects,LV=R.levers,CFG=window.SIM_CFG,RU=CFG.rules||{};
const FAM=[['dim','Dérives dimensionnelles · DC-01'],['out','Usure, ébréchure, casse · DC-04']];
const OU=[['od','Diamètre extérieur'],['id','Alésage ou perçage'],['long','Longueur ou épaulement'],['fil','Filetage ou gorge'],['tout','Toutes les cotes']];
const QUAND=[['demar','Au démarrage ou après un arrêt'],['serie','En cours de série'],['outil','Après un changement d’arête'],['lot','Après un changement de barre ou de lot'],['regl','Après un réglage ou une correction']];
const FREQ=[['chaque','À chaque pièce'],['barre','Selon la position dans la barre'],['alea','Aléatoire']];
const TERME=[['court','Apparu d’un coup'],['moyen','Progressif sur la série'],['long','Depuis longtemps']];
const QUI=[['op','Opératrice / opérateur'],['regl','Régleur'],['qual','Service qualité'],['client','Client']];
const COMBIEN=[['rare','Quelques pièces'],['part','Une part régulière'],['toutes','Toutes les pièces']];
const MACH=[['canon','Poupée mobile avec canon'],['sans','Poupée mobile sans canon'],['fixe','Poupée fixe ou multibroche']];
const LBL={};[OU,QUAND,FREQ,TERME,QUI,COMBIEN].forEach(l=>l.forEach(([v,t])=>LBL[v]=LBL[v]||t));
const lab=(l,v)=>(l.find(x=>x[0]===v)||[,''])[1];
const BR=['Mesure','Outil','Machine et thermique','Barre et matière','Programme et réglages'];
const S={def:'D01',fam:'all',qd:'',br:'sans',mach:'canon',param:'d',dir:'up',ou:'od',quand:'serie',freq:'chaque',terme:'moyen',qui:'op',combien:undefined};
const HIST=[],REC={},OK={},NUM={};
const base=()=>S.br==='derive'?'d|'+S.param+S.dir+'|'+S.mach:'p|'+S.def+'|'+S.mach;
const KEY=()=>base()+'#'+(NUM[base()]||0);
const DEF=()=>REF.find(d=>d.tab===S.def);
const famOf=t=>lab(FAM,(REF.find(d=>d.tab===t)||{}).fam);
const isDim=()=>S.br!=='derive'?DEF().fam==='dim':!!(CFG.params.find(p=>p.id===S.param)||{}).dim;
const canonOn=()=>S.mach==='canon';
const rtag=r=>r&&RU[r]?`<span class="rtag" title="${esc(RU[r].t)} · sources ${esc(RU[r].s.join(', '))}">${esc(r)}</span>`:'';
function cands(){const d=DEF(),all=d.levers.filter(k=>canonOn()||!LV[k].canon),N=all.length;
 return all.map((k,i)=>{const x=LV[k];return {id:S.def+'_'+k,k,rank:i+1,n:x.n,b:x.b,t:x.p?'mes':'',p:x.p,ind:x.ind,ctl:x.ctl,r:x.r,gate:!!x.gate,adj:!!x.adj,prior:1+(N-i)/N}});}
const hiddenN=()=>canonOn()?0:DEF().levers.filter(k=>LV[k].canon).length;
const nMesOf=()=>cands().filter(c=>c.t).length;
const why=ind=>{const w=[];for(const k in ind)if(S[k]&&ind[k].includes(S[k]))w.push(LBL[S[k]].toLowerCase());return w};
const pills=(k,l)=>`<div class="opts" data-k="${k}">`+l.map(([v,t])=>`<button type="button" data-v="${v}" aria-pressed="${S[k]===v}">${esc(t)}</button>`).join('')+'</div>';
const q=(a,t,b)=>`<div class="q"><span class="ql">${a}</span><div><b>${t}</b>${b}</div></div>`;
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function draw0(){const f=S.fam,qd=norm(S.qd.trim());
 $('fams').innerHTML='<span class="famlab nv">2 familles</span>'+[['all','Tous',REF.length],...FAM.map(([k,l])=>[k,l,REF.filter(d=>d.fam===k).length])].map(([k,l,n])=>`<button type="button" class="${k==='all'?'':'f-'+(k==='dim'?'dim':'vul')}" data-fam="${k}" aria-pressed="${f===k}">${l} <small>${n}</small></button>`).join('');
 const L=REF.filter(d=>(f==='all'||d.fam===f)&&(!qd||norm(d.defect+' '+d.hint).includes(qd)));
 $('defs').innerHTML=L.length?L.map(d=>`<button type="button" class="dt ${d.fam==='dim'?'dim':'vul'}" data-def="${d.tab}" aria-pressed="${S.def===d.tab}"><b>${esc(d.defect)}</b><small>${esc(d.hint)}</small></button>`).join(''):'<p class="sl">Aucun défaut trouvé. Essayez un autre mot.</p>';
 $('mach').innerHTML='<p class="ml">Type de machine</p>'+pills('mach',MACH)+(canonOn()?'':`<p class="sl hidnote">Pistes canon masquées pour ce type de machine ${rtag('DC01-R04')}.</p>`);}
const SIT=[['sans','Pas de données CNC','Le défaut est vu par une personne : contrôle pièce, calibre, micromètre. Tous les leviers sont à vérifier.'],['conforme','Mesures conformes','Charge broche, température d’huile et cote post-process dans leur plage.'],['derive','Une mesure dérive','On cherche l’origine de la dérive, dans l’ordre de contrôle candidat.']];
function draw1(){const nM=nMesOf(),NT=cands().length;
 $('sit').innerHTML=SIT.map(([v,t,d])=>`<button type="button" class="sc" data-b="${v}" aria-pressed="${S.br===v}"><em class="stag ${v==='sans'?'ex':'pr'}">${v==='sans'?'VP Expert seul':'Avec VP Predict'}</em><b>${t}</b><span>${d}</span></button>`).join('');
 const PS=CFG.params.filter(p=>!p.opc||S.br!=='derive'||true);
 $('drv').innerHTML=S.br==='derive'?'<p class="ml">Quelle mesure dérive ?</p>'+pills('param',PS.map(p=>[p.id,p.sn]))+'<p class="ml">Dans quel sens ?</p>'+pills('dir',(CFG.params.find(p=>p.id===S.param).dirs||['up','down']).map(d=>[d,d==='up'?'En hausse':'En baisse'])):'';
 const P=CFG.params.find(p=>p.id===S.param);
 $('msg').className='emsg'+(S.br==='conforme'?' win':'');
 $('msg').innerHTML=S.br==='sans'?`<b>Détection humaine :</b> l’enquête passe en revue les ${NT} leviers de ce défaut${nM?`, y compris les ${nM} liés aux mesures, à relever à la main`:''}.`
  :S.br==='conforme'&&!nM?`<b>Mesures conformes :</b> aucun levier de ce défaut n’est lié aux mesures exposées, le classement ne change pas. Une donnée que la CNC n’expose pas reste « absente », jamais « conforme ».`
  :S.br==='conforme'?`<b>Mesures conformes :</b> ${nM} levier${nM>1?'s':''} lié${nM>1?'s':''} aux mesures ${nM>1?'passent':'passe'} en fin de liste, sans être exclu${nM>1?'s':''}. Une donnée que la CNC n’expose pas reste « absente », jamais « conforme ».`
  :`<b>${esc(P.sn)} ${S.dir==='up'?'en hausse':'en baisse'} :</b> le défaut en est probablement la conséquence. On cherche l’origine de la dérive.`;}
function draw2(){const d=S.br==='derive';
 $('t2').textContent=d?'Enquête QQOQC sur la dérive':'Enquête QQOQC : '+DEF().defect.toLowerCase();
 const P=CFG.params.find(p=>p.id===S.param);
 $('qs').innerHTML=d?q('Quoi','Quelle mesure dérive ?',`<p class="qv">${esc(P.sn)} ${S.dir==='up'?'en hausse':'en baisse'}</p><p class="hint">Détectée par VP Predict sur la machine.</p>`)+`<p class="sl">Pour une dérive, l’ordre candidat suffit${P.dim?' : contre-mesure d’abord, puis contexte tracé (pièce, barre, arête, redémarrage), puis outil, thermique et barre':' : arête et compteur d’abord, puis lubrification, matière et conditions de coupe'}. Une seule variable d’essai à la fois.</p>`:
  q('Quoi','Quel défaut ?',`<p class="qv">${esc(DEF().defect)} <span class="tfam f-${DEF().fam==='dim'?'dim':'vul'} nv">${esc(famOf(S.def))}</span></p>`)
  +`<div class="nv">`+q('Qui','Qui l’a détecté ?',pills('qui',QUI)+'<p class="hint">Ne change pas les causes, mais décide du confinement.</p>')+`</div>`
  +q('Où','Sur quelle cote ?',pills('ou',OU))+q('Quand','Quand apparaît-il ?',pills('quand',QUAND))+q('Comment','À quelle fréquence ?',pills('freq',FREQ))+q('Depuis','Sur quelle durée ?',pills('terme',TERME))
  +`<div class="nv">`+q('Combien','Combien de pièces ?',pills('combien',COMBIEN))+`</div>`;
 const L=d?[['Quoi',P.sn+(S.dir==='up'?' en hausse':' en baisse')],['Machine',lab(MACH,S.mach)]]:[['Quoi',DEF().defect+' ('+famOf(S.def).toLowerCase()+')'],['Machine',lab(MACH,S.mach)],['Qui',S.qui&&lab(QUI,S.qui)],['Où',S.ou&&lab(OU,S.ou)],['Quand',S.quand&&lab(QUAND,S.quand)],['Comment',[S.freq&&lab(FREQ,S.freq),S.terme&&lab(TERME,S.terme).toLowerCase()].filter(Boolean).join(', ')]];
 if(!d&&S.combien)L.push(['Combien',lab(COMBIEN,S.combien)]);
 $('fiche').innerHTML='<b>Fiche d’enquête QQOQC</b> '+L.filter(x=>x[1]).map(([k,v])=>`<span><i>${k}</i> ${esc(v)}</span>`).join('');}
function gateState(){const K=KEY(),id=S.def+'_M';if(S.br==='derive'||!isDim())return 'none';if((REC[K]||{})[id])return 'bad';if((OK[K]||{})[id])return 'ok';return 'open';}
function card(c,i,st,nx){
 let act;
 if(st==='lock')act=`<p class="lockt">Verrouillé : contre-mesure d’abord ${rtag('DC01-R01')}${gateState()==='bad'?' · moyen de mesure douteux, aucune correction d’outil avant une mesure fiable':''}</p>`;
 else if(st==='nc')act=`<div class="cst nc nv"><b>${c.gate?'Moyen douteux ou écart non confirmé :':'Écart observé :'}</b> ${c.gate?'aucune correction d’outil tant que la mesure n’est pas fiable.':'hypothèse à vérifier, cause non démontrée. Aucun apprentissage à partir de ce clic.'} <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else if(st==='ok')act=`<div class="cst ok nv"><b>${c.gate?'Écart confirmé, moyen fiable :':'Contrôle conforme :'}</b> ${c.gate?'les leviers de réglage sont déverrouillés.':'hypothèse non étayée par ce contrôle.'} <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else act=c.gate?`<div class="acts nv"><button type="button" class="btn sm bok" data-ok="${c.id}">Écart confirmé sur le moyen de référence</button><button type="button" class="btn ghost sm bnc" data-nc="${c.id}">Écart non confirmé ou moyen douteux</button></div>`
  :`<div class="acts nv"><button type="button" class="btn sm bnc" data-nc="${c.id}">Non conforme après contrôle</button><button type="button" class="btn ghost sm bok" data-ok="${c.id}">Conforme après contrôle</button></div>`;
 return `<div class="cc${i===0?' best':''}${st==='ok'?' done':''}${st==='lock'?' lock':''}${st==='nc'?' found':''}${nx?' next':''}" data-id="${c.id}"><div class="ch"><span class="rk">${i+1}</span><b>${nx?'<span class="tg nxt nv">Contrôle suivant</span>':''}${esc(c.n)}${c.t?'<span class="tg mes">Donnée de mesure</span>':''}${c.gate?'<span class="tg mes">Avant toute correction</span>':''}${rtag(c.r)}</b><span class="ind" title="Score de pertinence, pas une probabilité">${c.pct}<small> pts</small></span></div><div class="bar"><i style="width:${c.pct}%"></i></div><p><span class="fam">${esc(c.b)}</span> <b>Contrôle :</b> ${esc(c.ctl)}</p><p class="why">${c.lo?'<b>Mesure conforme : moins probable</b>, vérifier le capteur · ':''}${c.rank?`Rang ${c.rank} dans l’ordre candidat · ${esc((RU[c.r]||{}).t||'')}`:esc(c.x||'')}${c.w&&c.w.length?' · indices : '+esc(c.w.join(' · ')):''}</p>${act}</div>`;}
let LAST=[];
function draw3(){const d=S.br==='derive';let h='<p class="vpx">VP Expert · guide les contrôles</p>',list;
 $('t3').textContent=d?'Origines à contrôler, dans l’ordre':'Leviers à contrôler, dans l’ordre';
 if(d){list=((CFG.kb[S.param]||{})[S.dir]||[]).filter(c=>canonOn()||!c.canon).map((c,k)=>({id:'d'+S.param+S.dir+k,n:c.l,b:'Expertise',r:c.r,ctl:(c.a&&c.a[0]?c.a[0].l:''),x:'Pondération illustrative, sans fréquence terrain vérifiée'+(c.r&&RU[c.r]?' · '+RU[c.r].t:''),s:c.n}));}
 else{list=cands().map(c=>{const w=why(c.ind),lo=S.br==='conforme'&&!!c.t;return {...c,w,lo,s:(c.gate&&isDim()?1e3:1)*c.prior*Math.pow(2.2,w.length)*(lo?.2:1)}});}
 const tot=list.filter(c=>!c.gate).reduce((a,c)=>a+c.s,0)||1;list.forEach(c=>c.pct=c.gate&&isDim()?100:Math.max(1,Math.round(c.s/tot*100)));
 list.sort((a,b)=>b.s-a.s);LAST=list;
 const K=KEY(),Rc=REC[K]||{},O=OK[K]||{},gs=gateState();
 const stOf=c=>Rc[c.id]?'nc':O[c.id]?'ok':(c.adj&&(gs==='open'||gs==='bad'))?'lock':'open';
 const nxi=list.findIndex(c=>stOf(c)==='open');
 const nShow=Math.max(5,nxi+1,...list.map((c,i)=>Rc[c.id]?i+1:0));
 const nNc=Object.keys(Rc).filter(id=>!(id.endsWith('_M'))).length,nOk=Object.keys(O).filter(id=>!(id.endsWith('_M'))).length;
 if(d&&isDim())h+=`<div class="emsg nv"><b>Avant toute action sur l’outil ou l’offset :</b> contre-mesurer sur le moyen de référence ${rtag('DC01-R01')}. Si le moyen dérive, la cote réelle peut être bonne.</div>`;
 if(gs==='open')h+=`<div class="emsg nv"><b>Cote hors tolérance : contre-mesure d’abord</b> ${rtag('DC01-R01')}. Tant qu’elle n’est pas faite, les corrections de réglage restent verrouillées.</div>`;
 if(gs==='bad')h+=`<div class="emsg nv"><b>Moyen de mesure douteux.</b> Réétalonner ou changer de moyen, puis recommencer l’enquête. Aucune correction d’outil n’est proposée.</div>`;
 if(list.length&&gs!=='bad')h+=nNc?`<div class="emsg win nv"><b>${nNc} écart(s) observé(s).</b> Cause non déterminée. Plusieurs écarts peuvent coexister : poursuivre les contrôles pertinents, puis faire valider la causalité et l’action dans le contexte machine, matière et outil. <button type="button" class="lk" data-new="1">Nouvelle enquête sur ce défaut</button></div>`
  :nOk?`<div class="emsg nv">${nOk} contrôle(s) conforme(s). ${nxi>=0?'Passez au contrôle suivant, n° '+(nxi+1)+'.':'Aucune hypothèse étayée : solliciter une revue métier, sans conclure à une cause.'}</div>`
  :'<p class="sl nv">Après chaque contrôle, indiquez le constat. Plusieurs écarts peuvent être relevés ; aucun ne démontre seul la cause. Une erreur de saisie se corrige.</p>';
 h+=list.length?'<div class="cl">'+list.slice(0,nShow).map((c,i)=>card(c,i,stOf(c),i===nxi)).join('')+'</div>':'<p class="sl">Aucune cause ne correspond : c’est un cas à ajouter à la base du site.</p>';
 if(list.length>nShow)h+=`<p class="sl">${list.length-nShow} autre(s) levier(s) possible(s), voir le diagramme. Score illustratif calculé à partir de l’ordre candidat et des indices : ce n’est ni une probabilité, ni une fréquence terrain. Les clics ne modifient pas le classement.</p>`;
 if(hiddenN()&&!d)h+=`<p class="sl hidnote">${hiddenN()} levier canon masqué pour une machine « ${esc(lab(MACH,S.mach).toLowerCase())} » ${rtag('DC01-R04')}.</p>`;
 const out=[];
 if(!d){if(S.qui==='qual')out.push('<span class="nvm"></span><b>Détecté par le service qualité :</b> bloquer le lot concerné et retrouver par la traçabilité (heure, ordre de fabrication, lot de barre) les pièces touchées.');
  if(S.qui==='client')out.push('<b>Détecté chez le client :</b> lancer le confinement (tri des stocks et en-cours) et informer la qualité.');
  if(S.combien==='toutes')out.push('<b>Toutes les pièces :</b> arrêt ou tri à 100 % le temps du contrôle.');
  if(S.br==='sans'&&nMesOf())out.push(`<span class="vpx vpp">VP Predict</span> <b>Avec VP Predict</b>, les ${nMesOf()} leviers liés aux mesures passeraient en fin de liste si les mesures sont conformes. <button type="button" class="lk" data-go="conforme">Voir avec les mesures</button>`);
  out.push('<b>Règle de méthode :</b> une seule variable d’essai à la fois, retour au réglage d’origine si elle ne corrige pas le défaut, et aucune valeur d’offset, d’avance ou de vitesse recopiée sans la notice de la machine.');}
 else out.push('Une fois l’origine corrigée, vérifiez que le défaut disparaît. S’il persiste avec une mesure revenue dans sa plage : <button type="button" class="lk" data-go="conforme">enquête sur le défaut, mesures conformes</button>.');
 h+=out.map(o=>`<div class="emsg${o.startsWith('<span class="nvm">')?' nv':''}">${o}</div>`).join('');
 if(S.br==='conforme'&&!d&&nMesOf())h+=`<p class="sl"><b>Moins probables, mesures conformes :</b> ${cands().filter(c=>c.t).map(c=>c.n.toLowerCase()).join(', ')}.</p>`;
 h+='<p class="pr"><button type="button" class="btn ghost sm" id="print">Imprimer la fiche d’enquête</button></p>';
 $('res').innerHTML=h;$('s4').hidden=d;
 if(!d){$('ititle').textContent='Diagramme d’Ishikawa · '+DEF().defect.toLowerCase();$('ihint').textContent=S.br==='conforme'?'Les leviers grisés sont rendus moins probables par les mesures, sans être exclus. Les autres sont colorés selon le nombre d’indices.':'Sans mesures, tous les leviers restent possibles.';
  const C=cands();$('ishi').innerHTML=BR.map(B=>`<section><h3>${B}</h3><ul>`+(C.filter(c=>c.b===B).map(c=>{const n=why(c.ind).length,x=S.br==='conforme'&&c.t;return `<li class="${x?'x':n>=3?'s3':n===2?'s2':n===1?'s1':''}">${esc(c.n)}</li>`}).join('')||'<li class="x">aucun levier pour ce défaut</li>')+'</ul></section>').join('');}}
function drawH(){$('hist').hidden=!HIST.length;$('hb').innerHTML=HIST.map((r,ix)=>`<tr class="${r.r}"><td>${r.t}</td><td>${esc(r.d)}</td><td>${esc(r.c)}</td><td><span class="res ${r.r}">${r.g?(r.r==='nc'?'Moyen douteux ou écart non confirmé':'Écart confirmé, moyen fiable'):(r.r==='nc'?'Écart observé : cause non démontrée':'Contrôle conforme : hypothèse non étayée')}</span></td><td><button type="button" class="lk" data-hfix="${ix}">Corriger</button></td></tr>`).join('');}
function undo(ix){const r=HIST[ix];if(!r)return;HIST.splice(ix,1);
 if(r.r==='nc'){if(REC[r.key])delete REC[r.key][r.id];}
 else if(OK[r.key])delete OK[r.key][r.id];}
function record(id,res){const K=KEY();REC[K]=REC[K]||{};OK[K]=OK[K]||{};if(REC[K][id]||OK[K][id])return;
 const c=LAST.find(x=>x.id===id);if(!c)return;
 if(res==='nc')REC[K][id]=1;else OK[K][id]=1;
 HIST.unshift({key:K,id,r:res,g:c.gate,t:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),d:S.br==='derive'?CFG.params.find(p=>p.id===S.param).sn+(S.dir==='up'?' en hausse':' en baisse'):DEF().defect,c:c.n});}
function render(){draw0();draw1();draw2();draw3();drawH();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.fam){S.fam=b.dataset.fam;draw0();return}
 if(b.dataset.def){S.def=b.dataset.def;render();if(innerWidth<760)$('s1').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.b){S.br=b.dataset.b;render();return}
 if(b.dataset.go){S.br=b.dataset.go;render();$('s1').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.nc){record(b.dataset.nc,'nc');render();return}
 if(b.dataset.ok){record(b.dataset.ok,'ok');render();const n=document.querySelector('.cc.next');if(n)n.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(b.dataset.fix){const K=KEY(),ix=HIST.findIndex(r=>r.key===K&&r.id===b.dataset.fix);undo(ix);render();return}
 if(b.dataset.hfix){undo(+b.dataset.hfix);render();return}
 if(b.dataset.new){NUM[base()]=(NUM[base()]||0)+1;render();return}
 if(b.id==='print'){window.print();return}
 const o=b.closest('.opts');if(o){const k=o.dataset.k,v=b.dataset.v;S[k]=(S[k]===v&&!['param','dir','mach'].includes(k))?undefined:v;
  if(k==='param'){const ds=CFG.params.find(p=>p.id===v).dirs||['up','down'];if(!ds.includes(S.dir))S.dir=ds[0];}render();}});
$('dq').addEventListener('input',e=>{S.qd=e.target.value;draw0()});
document.body.classList.add('rc');
render();
})();
