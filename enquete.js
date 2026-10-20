(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lab=(l,v)=>(l.find(x=>x[0]===v)||[,''])[1];
const LBL={};[QUI,OU,QUAND,ETENDUE,FREQ,VIS,TERME,COMBIEN,PROC].forEach(l=>l.forEach(([v,t])=>LBL[v]=LBL[v]||t));
const TOP=['Bavure','Incomplet','Retassure','Givrage','Brûlure','Pièces déformées','Cotes pièces non conformes','Points noirs','Ligne de soudure'];
const S={more:false,def:'Bavure',fam:'all',qd:'',br:'sans',param:'to',ou:'meme',quand:'serie',freq:'chaque',terme:'moyen',vis:'demoul',qui:'op',etendue:undefined,combien:undefined};
const CONF={},HIST=[];
/* v9.5 : un seul résultat « non conforme » par enquête, contrôles « conformes » écartés, saisie corrigeable */
const REC={},OK={},NUM={};
const base=()=>S.br==='derive'?'d|'+S.param:'p|'+S.def;
const KEY=()=>base()+'#'+(NUM[base()]||0);
const isPF=()=>POSTFAB.includes(S.qui);
const LATE=['Pièces déformées','Pièces cassantes','Bulles de vide','Fissuration sous contrainte'];
const famOf=n=>{const d=DEFS.find(x=>x[0]===n);return d?lab(FAM,d[1]):''};
const SIT=[['sans','Pas de mesures','Le défaut est vu par une personne. Toutes les causes sont à vérifier.'],['conforme','Mesures conformes','Les 8 mesures sont dans leur plage, mais la pièce est mauvaise.'],['derive','Une mesure dérive','On cherche l’origine de la dérive : presse, outillage, périphérique…']];
const isB=()=>S.def==='Bavure';
function cands(){if(isB())return ISHI.map(c=>({...c,src:'exp'}));
 const out=(DMAP[S.def]||[]).map(k=>({id:k,...LIB[k],src:'add'}));
 const seen={};((window.DEF||{})[S.def]||[]).forEach(code=>{const m=MCODE[code[0]];if(!m||seen[code])return;seen[code]=1;const irr=/i$/.test(code)||code==='Yr';
  out.unshift({id:'m_'+code,b:m[1],n:(window.DLAB||{})[code]||m[2],t:'mes',p:m[0],src:'exp',ctl:'Relever '+m[2].toLowerCase()+' sur les derniers cycles et la comparer à la référence de la fiche de réglage.',ind:irr?{freq:['alea','cycl'],quand:['serie']}:{freq:['chaque'],terme:['moyen']}})});
 return out;}
const nMesOf=()=>cands().filter(c=>c.t==='mes').length;

function pills(k,list){return `<div class="opts" data-k="${k}">`+list.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${S[k]===v}">${esc(l)}</button>`).join('')+'</div>';}
function q(lbl,title,body){return `<div class="q"><span class="ql">${lbl}</span><div><b>${title}</b>${body}</div></div>`;}

function draw0(){
 const f=S.fam,qd=S.qd.trim().toLowerCase();
 $('fams').innerHTML='<span class="famlab nv">3 thématiques</span>'+[['all','Tous',24],...FAM.map(([k,l])=>[k,l,DEFS.filter(x=>x[1]===k).length])].map(([k,l,n])=>`<button type="button" class="${k==='all'?'':'f-'+k}" data-fam="${k}" aria-pressed="${f===k}">${l} <small>${n}</small></button>`).join('');
 const L=DEFS.filter(([n,fa])=>(f==='all'||fa===f)&&(!qd||(n+' '+(DHINT[n]||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(qd.normalize('NFD').replace(/[\u0300-\u036f]/g,''))));
 let V=L;const cut=f==='all'&&!qd&&!S.more;if(cut){V=TOP.map(n=>L.find(x=>x[0]===n));if(!TOP.includes(S.def))V.push(L.find(x=>x[0]===S.def));}
 $('defs').innerHTML=(V.length?V.map(([n,fa])=>`<button type="button" class="dt ${fa}" data-def="${esc(n)}" aria-pressed="${S.def===n}"><b>${esc(n)}</b>${DHINT[n]?`<small>${DHINT[n]}</small>`:''}</button>`).join(''):'<p class="sl">Aucun défaut trouvé. Essayez un autre mot.</p>')+(cut?`<button type="button" class="dt more" id="more"><b>Voir les 24 défauts</b><small>${24-V.length} autres</small></button>`:'');
}
function draw1(){
 const nMes=nMesOf(),NT=cands().length;
 $('sit').innerHTML=SIT.map(([v,t,d])=>`<button type="button" class="sc" data-b="${v}" aria-pressed="${S.br===v}"><em class="stag ${v==='sans'?'ex':'pr'}">${v==='sans'?'VP Expert seul':'Avec VP Predict'}</em><b>${t}</b><span>${d}</span></button>`).join('');
 $('drv').innerHTML=S.br==='derive'?'<p class="ml">Quelle mesure dérive ?</p>'+pills('param',PROC):'';
 $('msg').innerHTML=S.br==='sans'?`<b>Détection humaine :</b> l’enquête passe en revue les ${NT} causes, y compris les ${nMes} liées aux mesures, à relever à la main.`
  :S.br==='conforme'?`<b>Mesures conformes :</b> ${nMes} cause${nMes>1?'s':''} liée${nMes>1?'s':''} aux mesures ${nMes>1?'passent':'passe'} en fin de liste. Une mesure conforme les rend moins probables sans les exclure : capteur ou étalonnage restent à vérifier.`
  :`<b>${esc(lab(PROC,S.param))} dérive :</b> le défaut en est probablement la conséquence. On cherche l’origine de la dérive.`;
 $('msg').className='emsg'+(S.br==='conforme'?' win':'');
}
function draw2(){
 const d=S.br==='derive';
 $('t2').textContent=d?'Enquête QQOQC sur la dérive':'Enquête QQOQC : '+S.def.toLowerCase();
 let h='';
 if(d){
  h+=q('Quoi','Quelle mesure dérive ?',`<p class="qv">${esc(lab(PROC,S.param))}</p><p class="hint">Détectée par VP Predict sur la presse.</p>`);
  h+=q('Quand','Quand la dérive apparaît-elle ?',pills('quand',QUAND));
  h+=q('Comment','À quelle fréquence ?',pills('freq',FREQ));
  h+=q('Depuis','Sur quelle durée ?',pills('terme',TERME));
 }else{
  h+=q('Quoi','Quel défaut ?',`<p class="qv">${esc(S.def)} <span class="tfam f-${(DEFS.find(x=>x[0]===S.def)||[])[1]} nv">${esc(famOf(S.def))}</span></p>`);
  h+=`<div class="nv">`+q('Qui','Qui l’a détecté ?',pills('qui',QUI)+'<p class="hint">Ne change pas les causes, mais décide du confinement. Le service qualité ou le client détectent après fabrication.</p>')+`</div>`;
  h+=q('Où','Où est le défaut sur la pièce ?',pills('ou',OU));
  if(isPF()){
   h+=`<div class="nv">`+q('Quand','Sur quelle partie de la série ?',pills('etendue',ETENDUE)+(S.etendue==='partie'?'<p class="ml">À quel moment de la série ?</p>'+pills('quand',QUAND):'')+'<p class="hint">Défaut détecté après fabrication : on situe d’abord les pièces touchées dans la série.</p>')+`</div>`;
  }else h+=q('Quand','Quand apparaît-il ?',pills('quand',QUAND));
  h+=q('Comment','À quelle fréquence ?',pills('freq',FREQ)+`<div class="nv"><p class="ml">À quel moment le défaut apparaît-il ?</p>`+pills('vis',VIS)+(LATE.includes(S.def)?`<p class="hint warn">${esc(S.def)} : ce défaut peut n’apparaître qu’après le démoulage ou le refroidissement de la pièce.</p>`:'')+`</div>`);
  h+=q('Depuis','Sur quelle durée ?',pills('terme',TERME));
  h+=q('Combien','Combien de pièces ?',pills('combien',COMBIEN));
 }
 $('qs').innerHTML=h;
 const L=d?[['Quoi',lab(PROC,S.param)+' dérive']]:[['Quoi',S.def+' ('+famOf(S.def).toLowerCase()+')'],['Qui',S.qui&&lab(QUI,S.qui)],['Où',S.ou&&lab(OU,S.ou)]];
 const qd=d||!isPF()?(S.quand&&lab(QUAND,S.quand)):[S.etendue&&lab(ETENDUE,S.etendue),S.etendue==='partie'&&S.quand&&lab(QUAND,S.quand).toLowerCase()].filter(Boolean).join(', ');
 L.push(['Quand',qd],['Comment',[S.freq&&lab(FREQ,S.freq),!d&&S.vis&&lab(VIS,S.vis).split(' (')[0].toLowerCase(),S.terme&&lab(TERME,S.terme).split(' (')[0].toLowerCase()].filter(Boolean).join(', ')]);
 if(!d&&S.combien)L.push(['Combien',lab(COMBIEN,S.combien)]);
 $('fiche').innerHTML='<b>Fiche d’enquête QQOQC</b> '+L.filter(x=>x[1]).map(([k,v])=>`<span><i>${k}</i> ${esc(v)}</span>`).join('');
}
const why=ind=>{const w=[];for(const k in ind){if(k==='quand'&&S.br!=='derive'&&isPF()&&S.etendue!=='partie')continue;if(S[k]&&ind[k].includes(S[k]))w.push(LBL[S[k]].split(' (')[0].toLowerCase());}return w};
const TAG={mes:'<span class="tg mes">Donnée de mesure</span>'};
function card(c,i,st,nx){const n=c.w.length,cf=CONF[c.id]||0;
 let act;
 if(st==='nc')act=`<div class="cst nc nv"><b>Non conforme après contrôle :</b> cause retenue pour cette enquête, comptée une fois dans les statistiques du site. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else if(st==='ok')act=`<div class="cst ok nv"><b>Conforme après contrôle :</b> cause écartée. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else if(st==='lock')act='<p class="sl lockt">Cause déjà trouvée pour cette enquête : pas de second enregistrement.</p>';
 else act=`<div class="acts nv"><button type="button" class="btn sm bnc" data-nc="${c.id}">Non conforme après contrôle</button><button type="button" class="btn ghost sm bok" data-ok="${c.id}">Conforme après contrôle</button></div>`;
 return `<div class="cc${i===0?' best':''}${st==='ok'?' done':''}${st==='lock'?' lock':''}${st==='nc'?' found':''}${nx?' next':''}" data-id="${c.id}"><div class="ch"><span class="rk">${i+1}</span><b>${nx?'<span class="tg nxt nv">Contrôle suivant</span>':''}${esc(c.n)}${TAG[c.t]||''}${c.src==='add'?'<span class="tg add" title="Cause issue des tableaux de dépannage publiés, recoupée par Vella Partners. Relecture par l’expert plasturgie partenaire en cours.">Guide de dépannage</span>':''}</b><span class="ind" title="Score de pertinence, pas une probabilité">${c.pct}<small> pts</small></span></div><div class="bar"><i style="width:${c.pct}%"></i></div><p><span class="fam">${esc(c.z)}</span> <b>Contrôle :</b> ${esc(c.ctl)}</p><p class="why">${c.lo?'<b>Mesure conforme : moins probable</b>, vérifier le capteur · ':''}${n} indice${n>1?'s':''} concordant${n>1?'s':''} : ${esc(c.w.join(' · ')||'aucun')}${cf?` · <b>${cf} cas confirmé${cf>1?'s':''} sur le site</b>`:''}</p>${act}</div>`;}
function draw3(){
 const d=S.br==='derive';let h='<p class="vpx">VP Expert · dit quoi faire</p>',list;
 $('t3').textContent=d?'Origines à contrôler, dans l’ordre':'Causes à contrôler, dans l’ordre';
 if(d){list=DRV.map((c,k)=>({...c,id:'d'+k})).filter(c=>c.p.includes(S.param)).map(c=>({...c,z:lab(ORIG,c.o),w:why(c.ind)}));}
 else list=cands().map(c=>({...c,z:c.b,w:why(c.ind),lo:S.br==='conforme'&&c.t==='mes'}));
 list.forEach(c=>c.s=Math.pow(2.2,c.w.length+(CONF[c.id]||0))*(c.lo?.2:1));
 const tot=list.reduce((a,c)=>a+c.s,0)||1;list.forEach(c=>c.pct=Math.max(1,Math.round(c.s/tot*100)));
 list.sort((a,b)=>b.s-a.s||(CONF[b.id]||0)-(CONF[a.id]||0));
 const ans=['ou','quand','freq','terme','vis','etendue'].filter(k=>S[k]).length;
 const K=KEY(),R=REC[K],O=OK[K]||{};
 const stOf=c=>R&&R.id===c.id?'nc':O[c.id]?'ok':R?'lock':'open';
 const nxi=R?-1:list.findIndex(c=>stOf(c)==='open');
 const nShow=Math.max(5,nxi+1,R?list.findIndex(c=>c.id===R.id)+1:0);
 const nOk=Object.keys(O).length;
 let head='';
 if(ans>=2&&list.length){
  head=R?`<div class="emsg win nv"><b>Cause trouvée :</b> ${esc(list.find(c=>c.id===R.id)?.n||'')}. Les autres contrôles sont verrouillés pour cette enquête, afin de ne pas fausser les statistiques des causes. <button type="button" class="lk" data-new="1">Nouvelle enquête sur ce défaut</button></div>`
   :nOk?`<div class="emsg nv">${nOk} contrôle${nOk>1?'s':''} conforme${nOk>1?'s':''}, cause${nOk>1?'s':''} écartée${nOk>1?'s':''}. ${nxi>=0?'Passez au contrôle suivant, n° '+(nxi+1)+'.':'Toutes les causes listées sont écartées : c’est un cas à ajouter à la base du site.'}</div>`
   :'<p class="sl nv">Après chaque contrôle, indiquez le résultat. Une seule cause peut être retenue par enquête ; une erreur de saisie se corrige.</p>';
 }
 h+=ans<2?'<p class="sl">Répondez à au moins deux questions pour classer les causes.</p>':list.length?head+'<div class="cl">'+list.slice(0,nShow).map((c,i)=>card(c,i,stOf(c),i===nxi)).join('')+'</div>':'<p class="sl">Aucune cause ne correspond encore à ces réponses : c’est un cas à ajouter à la base du site.</p>';
 if(ans>=2&&list.length>nShow)h+=`<p class="sl">${list.length-nShow} autre${list.length-nShow>1?'s':''} cause${list.length-nShow>1?'s':''} possible${list.length-nShow>1?'s':''}, voir le diagramme. Score de pertinence sur 100, calculé à partir des indices et des cas confirmés sur le site : ce n’est pas une probabilité. Une cause n’est confirmée qu’après contrôle.</p>`;
 const out=[];
 if(!d){if(S.qui==='qual')out.push('<b>Détecté par le service qualité après fabrication :</b> bloquer le lot concerné'+(S.etendue==='partie'?', retrouver par la traçabilité (heure, ordre de fabrication) la partie de série touchée':S.etendue==='tot'?' et trier la totalité de la série':'')+'.');
  if(S.qui==='client')out.push('<b>Détecté chez le client :</b> lancer le confinement (tri des stocks et en-cours) et informer la qualité.');
  if(S.qui==='aval')out.push('<b>Détecté en finition :</b> bloquer les en-cours entre presse et finition, prévenir le régleur.');
  if(S.combien==='toutes')out.push('<b>Toutes les pièces :</b> arrêt ou tri à 100 % le temps du contrôle.');
  if(S.vis==='refroid'&&isB())out.push('<b>Visible après refroidissement :</b> inhabituel pour une bavure, vérifier qu’il ne s’agit pas d’un retrait.');
  if(S.br==='sans'&&nMesOf())out.push(`<span class="vpx vpp">VP Predict</span> <b>Avec VP Predict</b>, ${nMesOf()} cause(s) liée(s) aux mesures passeraient en fin de liste si les mesures sont conformes, sans relevé manuel. <button type="button" class="lk" data-go="conforme">Voir avec les mesures</button>`);}
 else out.push('Une fois l’origine corrigée, vérifiez que le défaut disparaît. S’il persiste avec une mesure revenue dans sa plage : <button type="button" class="lk" data-go="conforme">enquête sur le défaut, mesures conformes</button>.');
 h+=out.map(o=>`<div class="emsg">${o}</div>`).join('');
 if(S.br==='conforme'&&!d&&nMesOf())h+=`<p class="sl"><b>Moins probables, mesures conformes :</b> ${cands().filter(c=>c.t==='mes').map(c=>c.n.toLowerCase()).join(', ')}.</p>`;
 h+='<p class="pr"><button type="button" class="btn ghost sm" id="print">Imprimer la fiche d’enquête</button></p>';
 $('res').innerHTML=h;
 $('s4').hidden=d;
 if(!d){$('ihint').textContent=S.br==='conforme'?'Les causes grisées sont rendues moins probables par les mesures, sans être exclues. Les autres sont colorées selon le nombre d’indices.':'Sans mesures, toutes les causes restent possibles.';
  const C=cands();$('ititle').textContent='Diagramme d’Ishikawa · '+S.def.toLowerCase();$('ishi').innerHTML=['Matière','Outillage','Moyen','Paramètres'].map(B=>`<section><h3>${B}</h3><ul>`+C.filter(c=>c.b===B).map(c=>{const n=why(c.ind).length,x=S.br==='conforme'&&c.t==='mes';return `<li class="${x?'x':n>=3?'s3':n===2?'s2':n===1?'s1':''}">${esc(c.n)}</li>`}).join('')+'</ul></section>').join('');}
}
function drawH(){$('hist').hidden=!HIST.length;$('hb').innerHTML=HIST.map((r,ix)=>`<tr class="${r.r}"><td>${r.t}</td><td>${esc(r.d)}</td><td>${esc(r.c)}</td><td><span class="res ${r.r}">${r.r==='nc'?'Non conforme : cause retenue':'Conforme : cause écartée'}</span></td><td><button type="button" class="lk" data-hfix="${ix}">Corriger</button></td></tr>`).join('');}
function undo(ix){const r=HIST[ix];if(!r)return;HIST.splice(ix,1);
 if(r.r==='nc'){CONF[r.id]=Math.max(0,(CONF[r.id]||0)-1);if(REC[r.key]&&REC[r.key].id===r.id)delete REC[r.key];}
 else if(OK[r.key])delete OK[r.key][r.id];}
function record(id,res){const K=KEY();if(REC[K])return;OK[K]=OK[K]||{};if(OK[K][id])return;
 const c=/^d\d/.test(id)?DRV[+id.slice(1)]:cands().find(x=>x.id===id);if(!c)return;
 if(res==='nc'){REC[K]={id};CONF[id]=(CONF[id]||0)+1;}else OK[K][id]=1;
 HIST.unshift({key:K,id,r:res,t:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),d:S.br==='derive'?lab(PROC,S.param)+' dérive':S.def,c:c.n});}
function render(){draw0();draw1();draw2();draw3();drawH();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.def){S.def=b.dataset.def;if(LATE.includes(S.def)&&S.vis==='demoul')S.vis=undefined;render();if(innerWidth<760)$('s1').scrollIntoView({behavior:'smooth'});return}
 if(b.id==='more'){S.more=true;draw0();return}
 if(b.dataset.fam){S.fam=b.dataset.fam;draw0();return}
 if(b.dataset.b){S.br=b.dataset.b;render();return}
 if(b.dataset.go){S.br=b.dataset.go;render();$('s1').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.nc){record(b.dataset.nc,'nc');render();return}
 if(b.dataset.ok){record(b.dataset.ok,'ok');render();const n=document.querySelector('.cc.next');if(n)n.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(b.dataset.fix){const K=KEY(),ix=HIST.findIndex(r=>r.key===K&&r.id===b.dataset.fix);undo(ix);render();return}
 if(b.dataset.hfix){undo(+b.dataset.hfix);render();return}
 if(b.dataset.new){NUM[base()]=(NUM[base()]||0)+1;render();return}
 if(b.id==='print'){window.print();return}
 const o=b.closest('.opts');if(o){const k=o.dataset.k,v=b.dataset.v;S[k]=(S[k]===v&&k!=='param')?undefined:v;render();}
});
$('dq').addEventListener('input',e=>{S.qd=e.target.value;draw0()});
if(/[?&]revue\b/.test(location.search))document.body.classList.add('revue');
render();
})();
