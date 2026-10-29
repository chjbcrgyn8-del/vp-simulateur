(function(){
/* Enquête défaut caoutchouc · ordre des leviers de notre expert caoutchouc, 16 défauts.
   Indices de contexte (Où, Quand, Comment) : premier jet Vella Partners, à valider avec notre expert caoutchouc. */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const REF=window.VELLA_REF_DEFAUTS,CFG=window.SIM_CFG;
const NAME=d=>d.defect.replace(/\s*\(.*\)$/,'').replace(' + Brûlures',' et brûlures');
const FAMC={'01-MR':'rem','06-Ligne soudure':'rem','16-Retassures':'rem','03-bulles':'asp','02-MG':'asp','12-Surface poreuse':'asp','15-Différence surface':'asp','09-Encrassement moule':'asp','10-Contamination':'asp','04-Sous-vulcanisation':'vul','05-Déformation':'dim','07-Bavure':'dim','08-Infiltration inserts':'dim','11-Adhérisation':'vul','13-Pièces grandes':'dim','14-Pièces collantes':'dim'};
const FAM=[['rem','Remplissage'],['asp','Aspect'],['vul','Vulcanisation et adhérence'],['dim','Dimensions et démoulage']];
const HINT={'01-MR':'défaut de remplissage','02-MG':'pré-vulcanisation','06-Ligne soudure':'jonction de flux','09-Encrassement moule':'dépôts sur empreinte','11-Adhérisation':'caoutchouc-métal'};
const TOP=['01-MR','03-bulles','04-Sous-vulcanisation','07-Bavure','02-MG','16-Retassures','05-Déformation','11-Adhérisation','14-Pièces collantes'];
const OU=[['meme','Toujours dans la même zone'],['inj','Près d’un point d’injection'],['fin','Loin des points d’injection (fin de remplissage)'],['joint','Au plan de joint'],['ins','Autour de l’insert'],['alea','Aléatoire'],['tout','Sur toute la pièce']];
const QUAND=[['demar','Au démarrage'],['serie','En cours de série'],['lot','Après un changement de lot'],['maint','Après nettoyage ou intervention moule']];
const FREQ=[['chaque','À chaque cycle'],['cycl','Certaines empreintes ou cycles'],['alea','Aléatoire']];
const TERME=[['court','Apparu d’un coup'],['moyen','Progressif sur la série'],['long','Depuis longtemps (usure)']];
const QUI=[['op','Opératrice / opérateur'],['regl','Régleur'],['qual','Service qualité'],['client','Client']];
const COMBIEN=[['rare','Quelques pièces'],['part','Une part régulière'],['toutes','Toutes les pièces']];
const LBL={};[OU,QUAND,FREQ,TERME,QUI,COMBIEN].forEach(l=>l.forEach(([v,t])=>LBL[v]=LBL[v]||t));
const lab=(l,v)=>(l.find(x=>x[0]===v)||[,''])[1];
/* Lever → famille, mesure presse éventuelle, indices de contexte, contrôle */
const RULES=[
 [/^Matière caoutchouc/,'Matière',null,{quand:['lot','demar'],terme:['court'],ou:['tout']},'Contrôler le lot au rhéomètre : ML, puis Ts2 ou T10, puis T90, par rapport à la fiche mélange.'],
 [/^Points d'injection/,'Moule',null,{ou:['inj'],terme:['moyen'],quand:['serie']},'Inspecter et nettoyer les points d’injection, busettes BCR ou canaux.'],
 [/^Propreté du moule/,'Moule',null,{ou:['meme','alea'],terme:['moyen'],quand:['serie']},'Inspecter l’empreinte et les canaux : encrassement, excès ou péremption de l’agent démoulant.'],
 [/^Tirage de vide/,'Presse et réglages',null,{ou:['fin','alea'],freq:['cycl','alea']},'Vérifier le niveau de vide atteint et le temps de tirage avant injection ; contrôler les joints de la cloche.'],
 [/^Pression de maintien/,'Presse et réglages','p',{ou:['fin','tout'],freq:['chaque']},'Comparer pression, temps de maintien et point de commutation à la fiche de réglage.'],
 [/^Vitesse\(s\)/,'Presse et réglages','p',{ou:['fin','inj'],freq:['chaque']},'Comparer les vitesses d’injection et la pression résultante, consigne et réelle.'],
 [/^Vitesse de rotation/,'Presse et réglages',null,{freq:['cycl'],terme:['moyen']},'Comparer vitesse de rotation et température de la boudineuse à la fiche.'],
 [/^Température du pot/,'Presse et réglages','pot',{freq:['cycl'],terme:['moyen'],ou:['inj']},'Relever la température matière en sortie de buse, du pot et des busettes BCR.'],
 [/^Force de fermeture/,'Presse et réglages',null,{ou:['joint'],quand:['maint'],freq:['chaque']},'Vérifier la force de fermeture réelle et le verrouillage.'],
 [/^Ouverture du moule/,'Moule',null,{ou:['joint'],quand:['maint']},'Contrôler l’ouverture au plan de joint (point de sécurité) et l’état du plan de joint.'],
 [/^Température du moule/,'Moule','mo',{ou:['tout','meme'],quand:['demar']},'Mesurer la température réelle du moule au pyromètre de contact et la comparer aux sondes.'],
 [/^Volume d'injection/,'Presse et réglages',null,{ou:['fin'],freq:['alea']},'Comparer volume injecté et dosage à la fiche ; vérifier le matelas.'],
 [/^Inserts/,'Pièce et inserts',null,{ou:['ins'],freq:['alea'],quand:['lot']},'Contrôler les inserts du lot : géométrie, dimensions, préparation.'],
 [/^Géométrie de la pièce/,'Pièce et inserts',null,{ou:['meme'],terme:['long'],freq:['chaque']},'Repérer la zone sur le plan pièce : épaisseur, angle, accès matière.'],
 [/^Défaut de conception/,'Moule',null,{ou:['meme'],terme:['long'],freq:['chaque']},'Relire avec l’outilleur la conception de la zone : évents, canaux, équilibrage.'],
 [/^Temps de vulcanisation/,'Presse et réglages','vu',{ou:['tout'],freq:['chaque']},'Comparer le temps de vulcanisation à la fiche et au T90 du lot.'],
 [/^Agent d'adhérisation/,'Pièce et inserts',null,{ou:['ins'],quand:['lot'],terme:['court']},'Vérifier l’application et la date de l’agent d’adhérisation sur les inserts.'],
 [/^Temps/,'Presse et réglages',null,{freq:['chaque'],quand:['demar']},'Comparer le temps et la vitesse d’ouverture du moule à la fiche (cinématique de démoulage).']
];
const BR=['Matière','Moule','Presse et réglages','Pièce et inserts'];
const S={def:'01-MR',fam:'all',qd:'',more:false,br:'sans',param:'p',dir:'up',ou:'fin',quand:'serie',freq:'chaque',terme:'moyen',qui:'op',combien:undefined};
const CONF={},HIST=[];
/* v9.6 : formalisme QQOQC et résultat « non conforme / conforme après contrôle » repris du simulateur plastique */
const REC={},OK={},NUM={};
const base=()=>S.br==='derive'?'d|'+S.param+S.dir:'p|'+S.def;
const KEY=()=>base()+'#'+(NUM[base()]||0);
const famOf=t=>lab(FAM,FAMC[t]);
const DEF=()=>REF.find(d=>d.tab===S.def);
function cands(){const d=DEF(),N=d.levers.length;return d.levers.map(([r,n,dir],i)=>{const R=RULES.find(x=>x[0].test(n))||[null,'Moule',null,{},'Contrôler ce levier selon la fiche.'];return {id:S.def+'_'+i,rank:r,n,dir,b:R[1],t:R[2]?'mes':'',p:R[2],ind:R[3],ctl:R[4],prior:1+(N-r)/N}});}
const nMesOf=()=>cands().filter(c=>c.t).length;
const why=ind=>{const w=[];for(const k in ind)if(S[k]&&ind[k].includes(S[k]))w.push(LBL[S[k]].toLowerCase());return w};
const pills=(k,l)=>`<div class="opts" data-k="${k}">`+l.map(([v,t])=>`<button type="button" data-v="${v}" aria-pressed="${S[k]===v}">${esc(t)}</button>`).join('')+'</div>';
const q=(a,t,b)=>`<div class="q"><span class="ql">${a}</span><div><b>${t}</b>${b}</div></div>`;
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function draw0(){const f=S.fam,qd=norm(S.qd.trim());
 $('fams').innerHTML='<span class="famlab nv">4 thématiques</span>'+[['all','Tous',16],...FAM.map(([k,l])=>[k,l,REF.filter(d=>FAMC[d.tab]===k).length])].map(([k,l,n])=>`<button type="button" class="${k==='all'?'':'f-'+k}" data-fam="${k}" aria-pressed="${f===k}">${l} <small>${n}</small></button>`).join('');
 let L=REF.filter(d=>(f==='all'||FAMC[d.tab]===f)&&(!qd||norm(NAME(d)+' '+(HINT[d.tab]||'')).includes(qd)));
 const cut=f==='all'&&!qd&&!S.more;if(cut){L=TOP.map(t=>REF.find(d=>d.tab===t));if(!TOP.includes(S.def))L.push(DEF());}
 $('defs').innerHTML=(L.length?L.map(d=>`<button type="button" class="dt ${FAMC[d.tab]}" data-def="${d.tab}" aria-pressed="${S.def===d.tab}"><b>${esc(NAME(d))}</b>${HINT[d.tab]?`<small>${HINT[d.tab]}</small>`:''}</button>`).join(''):'<p class="sl">Aucun défaut trouvé. Essayez un autre mot.</p>')+(cut?`<button type="button" class="dt more" id="more"><b>Voir les 16 défauts</b><small>${16-L.length} autres</small></button>`:'');}
const SIT=[['sans','Pas de mesures','Le défaut est vu par une personne. Tous les leviers sont à vérifier.'],['conforme','Mesures conformes','Pression, températures pot, BCR, moule et temps de vulcanisation dans leur plage.'],['derive','Une mesure dérive','On cherche l’origine de la dérive, dans l’ordre de contrôle de notre expert caoutchouc.']];
function draw1(){const nM=nMesOf(),NT=cands().length;
 $('sit').innerHTML=SIT.map(([v,t,d])=>`<button type="button" class="sc" data-b="${v}" aria-pressed="${S.br===v}"><em class="stag ${v==='sans'?'ex':'pr'}">${v==='sans'?'VP Expert seul':'Avec VP Predict'}</em><b>${t}</b><span>${d}</span></button>`).join('');
 $('drv').innerHTML=S.br==='derive'?'<p class="ml">Quelle mesure dérive ?</p>'+pills('param',CFG.params.map(p=>[p.id,p.n]))+'<p class="ml">Dans quel sens ?</p>'+pills('dir',[['up','En hausse'],['down','En baisse']]):'';
 const P=CFG.params.find(p=>p.id===S.param);
 $('msg').className='emsg'+(S.br==='conforme'?' win':'');
 $('msg').innerHTML=S.br==='sans'?`<b>Détection humaine :</b> l’enquête passe en revue les ${NT} leviers de ce défaut, y compris les ${nM} liés aux mesures, à relever à la main.`
  :S.br==='conforme'?`<b>Mesures conformes :</b> ${nM} levier${nM>1?'s':''} lié${nM>1?'s':''} aux mesures ${nM>1?'passent':'passe'} en fin de liste. Une mesure conforme les rend moins probables sans les exclure : capteur ou étalonnage restent à vérifier.`
  :`<b>${esc(P.n)} ${S.dir==='up'?'en hausse':'en baisse'} :</b> le défaut en est probablement la conséquence. On cherche l’origine de la dérive.`;}
function draw2(){const d=S.br==='derive';
 $('t2').textContent=d?'Enquête QQOQC sur la dérive':'Enquête QQOQC : '+NAME(DEF()).toLowerCase();
 const P=CFG.params.find(p=>p.id===S.param);
 $('qs').innerHTML=d?q('Quoi','Quelle mesure dérive ?',`<p class="qv">${esc(P.n)} ${S.dir==='up'?'en hausse':'en baisse'}</p><p class="hint">Détectée par VP Predict sur la presse.</p>`)+'<p class="sl">Pour une dérive, l’ordre de contrôle de notre expert caoutchouc suffit : lot et recette d’abord, puis fiabilité des mesures et équipement. Une seule variable d’essai à la fois.</p>':
  q('Quoi','Quel défaut ?',`<p class="qv">${esc(NAME(DEF()))} <span class="tfam f-${FAMC[S.def]} nv">${esc(famOf(S.def))}</span></p>`)
  +`<div class="nv">`+q('Qui','Qui l’a détecté ?',pills('qui',QUI)+'<p class="hint">Ne change pas les causes, mais décide du confinement.</p>')+`</div>`
  +q('Où','Où est le défaut sur la pièce ?',pills('ou',OU))+q('Quand','Quand apparaît-il ?',pills('quand',QUAND))+q('Comment','À quelle fréquence ?',pills('freq',FREQ))+q('Depuis','Sur quelle durée ?',pills('terme',TERME))
  +`<div class="nv">`+q('Combien','Combien de pièces ?',pills('combien',COMBIEN))+`</div>`;
 const L=d?[['Quoi',P.n+(S.dir==='up'?' en hausse':' en baisse')]]:[['Quoi',NAME(DEF())+' ('+famOf(S.def).toLowerCase()+')'],['Qui',S.qui&&lab(QUI,S.qui)],['Où',S.ou&&lab(OU,S.ou)],['Quand',S.quand&&lab(QUAND,S.quand)],['Comment',[S.freq&&lab(FREQ,S.freq),S.terme&&lab(TERME,S.terme).toLowerCase()].filter(Boolean).join(', ')]];
 if(!d&&S.combien)L.push(['Combien',lab(COMBIEN,S.combien)]);
 $('fiche').innerHTML='<b>Fiche d’enquête QQOQC</b> '+L.filter(x=>x[1]).map(([k,v])=>`<span><i>${k}</i> ${esc(v)}</span>`).join('');}
const DIRT={'hausse':'Levier à augmenter','baisse':'Levier à baisser','hausse ou baisse':'Levier à ajuster dans un sens ou l’autre (lecture de « ↑↓ », à confirmer par l’expert)','AV / hausse':'AV / hausse (à confirmer par l’expert)','AV /hausse':'AV / hausse (à confirmer par l’expert)','à vérifier':'À vérifier'};
const TOCONF=t=>/commutation/i.test(t)?t+' (libellé à confirmer par l’expert)':t;
function card(c,i,st,nx){const cf=CONF[c.id]||0;
 let act;
 if(st==='nc')act=`<div class="cst nc nv"><b>Écart observé :</b> hypothèse à vérifier, cause non démontrée. Aucun apprentissage à partir de ce clic. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else if(st==='ok')act=`<div class="cst ok nv"><b>Contrôle conforme :</b> hypothèse non étayée par ce contrôle. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else act=`<div class="acts nv"><button type="button" class="btn sm bnc" data-nc="${c.id}">Non conforme après contrôle</button><button type="button" class="btn ghost sm bok" data-ok="${c.id}">Conforme après contrôle</button></div>`;
 return `<div class="cc${i===0?' best':''}${st==='ok'?' done':''}${st==='lock'?' lock':''}${st==='nc'?' found':''}${nx?' next':''}" data-id="${c.id}"><div class="ch"><span class="rk">${i+1}</span><b>${nx?'<span class="tg nxt nv">Contrôle suivant</span>':''}${esc(TOCONF(c.n))}${c.t?'<span class="tg mes">Donnée de mesure</span>':''}</b><span class="ind" title="Score de pertinence, pas une probabilité">${c.pct}<small> pts</small></span></div><div class="bar"><i style="width:${c.pct}%"></i></div><p><span class="fam">${esc(c.b)}</span> <b>Contrôle :</b> ${esc(c.ctl)}</p><p class="why">${c.lo?'<b>Mesure conforme : moins probable</b>, vérifier le capteur · ':''}${c.rank?`Rang ${c.rank} dans l’ordre de notre expert caoutchouc · ${esc(DIRT[c.dir]||c.dir)}`:esc(c.x||'')}${c.w&&c.w.length?' · indices : '+esc(c.w.join(' · ')):''}${cf?` · <b>Écart observé dans cette démonstration, cause non démontrée</b>`:''}</p>${act}</div>`;}
let LAST=[];
function draw3(){const d=S.br==='derive';let h='<p class="vpx">VP Expert · guide les contrôles</p>',list;
 $('t3').textContent=d?'Origines à contrôler, dans l’ordre':'Leviers à contrôler, dans l’ordre';
 if(d){list=((CFG.kb[S.param]||{})[S.dir]||[]).map((c,k)=>({id:'d'+S.param+S.dir+k,n:c.l,b:'Expertise',ctl:(c.a&&c.a[0]?c.a[0].l:''),x:'Pondération illustrative du référentiel, sans fréquence terrain vérifiée',s:c.n}));}
 else{list=cands().map(c=>{const w=why(c.ind),lo=S.br==='conforme'&&!!c.t;return {...c,w,lo,s:c.prior*Math.pow(2.2,w.length)*(lo?.2:1)}});}
 const tot=list.reduce((a,c)=>a+c.s,0)||1;list.forEach(c=>c.pct=Math.max(1,Math.round(c.s/tot*100)));
 list.sort((a,b)=>b.s-a.s);LAST=list;
 const K=KEY(),Rc=REC[K]||{},O=OK[K]||{};
 const stOf=c=>Rc[c.id]?'nc':O[c.id]?'ok':'open';
 const nxi=list.findIndex(c=>stOf(c)==='open');
 const nShow=Math.max(5,nxi+1,...list.map((c,i)=>Rc[c.id]?i+1:0));
 const nOk=Object.keys(O).length;
 if(list.length)h+=Object.keys(Rc).length?`<div class="emsg win nv"><b>${Object.keys(Rc).length} écart(s) observé(s).</b> Cause non déterminée. Plusieurs écarts peuvent coexister : poursuivre les contrôles pertinents, puis faire valider la causalité et l’action dans le contexte machine et matière. <button type="button" class="lk" data-new="1">Nouvelle enquête sur ce défaut</button></div>`
  :nOk?`<div class="emsg nv">${nOk} contrôle(s) conforme(s). ${nxi>=0?'Passez au contrôle suivant, n° '+(nxi+1)+'.':'Aucune hypothèse étayée : solliciter une revue métier, sans conclure à une cause.'}</div>`
  :'<p class="sl nv">Après chaque contrôle, indiquez le constat. Plusieurs écarts peuvent être relevés ; aucun ne démontre seul la cause. Une erreur de saisie se corrige.</p>';
 h+=list.length?'<div class="cl">'+list.slice(0,nShow).map((c,i)=>card(c,i,stOf(c),i===nxi)).join('')+'</div>':'<p class="sl">Aucune cause ne correspond : c’est un cas à ajouter à la base du site.</p>';
 if(list.length>nShow)h+=`<p class="sl">${list.length-nShow} autre(s) levier(s) possible(s), voir le diagramme. Score illustratif calculé à partir du référentiel et des indices : ce n’est ni une probabilité, ni une fréquence terrain. Les clics de cette démonstration ne modifient pas le classement.</p>`;
 const out=[];
 if(!d){if(S.qui==='qual')out.push('<span class="nvm"></span><b>Détecté par le service qualité :</b> bloquer le lot concerné et retrouver par la traçabilité (heure, ordre de fabrication) les pièces touchées.');
  if(S.qui==='client')out.push('<b>Détecté chez le client :</b> lancer le confinement (tri des stocks et en-cours) et informer la qualité.');
  if(S.combien==='toutes')out.push('<b>Toutes les pièces :</b> arrêt ou tri à 100 % le temps du contrôle.');
  if(S.br==='sans'&&nMesOf())out.push(`<span class="vpx vpp">VP Predict</span> <b>Avec VP Predict</b>, les ${nMesOf()} leviers liés aux mesures passeraient en fin de liste si les mesures sont conformes. <button type="button" class="lk" data-go="conforme">Voir avec les mesures</button>`);
  out.push('<b>Règle de notre expert caoutchouc :</b> une seule variable d’essai à la fois, et retour au réglage d’origine si elle ne corrige pas le défaut.');}
 else out.push('Une fois l’origine corrigée, vérifiez que le défaut disparaît. S’il persiste avec une mesure revenue dans sa plage : <button type="button" class="lk" data-go="conforme">enquête sur le défaut, mesures conformes</button>.');
 h+=out.map(o=>`<div class="emsg${o.startsWith('<span class="nvm">')?' nv':''}">${o}</div>`).join('');
 if(S.br==='conforme'&&!d&&nMesOf())h+=`<p class="sl"><b>Moins probables, mesures conformes :</b> ${cands().filter(c=>c.t).map(c=>c.n.toLowerCase()).join(', ')}.</p>`;
 h+='<p class="pr"><button type="button" class="btn ghost sm" id="print">Imprimer la fiche d’enquête</button></p>';
 $('res').innerHTML=h;$('s4').hidden=d;
 if(!d){$('ititle').textContent='Diagramme d’Ishikawa · '+NAME(DEF()).toLowerCase();$('ihint').textContent=S.br==='conforme'?'Les leviers grisés sont rendus moins probables par les mesures, sans être exclus. Les autres sont colorés selon le nombre d’indices.':'Sans mesures, tous les leviers restent possibles.';
  const C=cands();$('ishi').innerHTML=BR.map(B=>`<section><h3>${B}</h3><ul>`+C.filter(c=>c.b===B).map(c=>{const n=why(c.ind).length,x=S.br==='conforme'&&c.t;return `<li class="${x?'x':n>=3?'s3':n===2?'s2':n===1?'s1':''}">${esc(c.n)}</li>`}).join('')+'</ul></section>').join('');}}
function drawH(){$('hist').hidden=!HIST.length;$('hb').innerHTML=HIST.map((r,ix)=>`<tr class="${r.r}"><td>${r.t}</td><td>${esc(r.d)}</td><td>${esc(r.c)}</td><td><span class="res ${r.r}">${r.r==='nc'?'Écart observé : cause non démontrée':'Contrôle conforme : hypothèse non étayée'}</span></td><td><button type="button" class="lk" data-hfix="${ix}">Corriger</button></td></tr>`).join('');}
function undo(ix){const r=HIST[ix];if(!r)return;HIST.splice(ix,1);
 if(r.r==='nc'){if(REC[r.key])delete REC[r.key][r.id];}
 else if(OK[r.key])delete OK[r.key][r.id];}
function record(id,res){const K=KEY();REC[K]=REC[K]||{};OK[K]=OK[K]||{};if(REC[K][id]||OK[K][id])return;
 const c=LAST.find(x=>x.id===id);if(!c)return;
 if(res==='nc')REC[K][id]=1;else OK[K][id]=1;
 HIST.unshift({key:K,id,r:res,t:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),d:S.br==='derive'?CFG.params.find(p=>p.id===S.param).n+(S.dir==='up'?' en hausse':' en baisse'):NAME(DEF()),c:c.n});}
function render(){draw0();draw1();draw2();draw3();drawH();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.id==='more'){S.more=true;draw0();return}
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
 const o=b.closest('.opts');if(o){const k=o.dataset.k,v=b.dataset.v;S[k]=(S[k]===v&&!['param','dir'].includes(k))?undefined:v;render();}});
$('dq').addEventListener('input',e=>{S.qd=e.target.value;draw0()});
document.body.classList.add('rc');
if(/[?&]revue\b/.test(location.search))document.body.classList.add('revue');
render();
})();
