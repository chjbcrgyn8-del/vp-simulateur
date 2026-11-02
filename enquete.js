(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lab=(l,v)=>(l.find(x=>x[0]===v)||[,''])[1];
const LBL={};[QUI,OU,QUAND,ETENDUE,FREQ,VIS,TERME,COMBIEN,PROC].forEach(l=>l.forEach(([v,t])=>LBL[v]=LBL[v]||t));
const TOP=['Bavure','Incomplet','Retassure','Givrage','Brûlure','Pièces déformées','Cotes pièces non conformes','Points noirs','Ligne de soudure'];
const S={more:false,def:'Bavure',fam:'all',qd:'',br:'sans',param:'to',ou:'meme',quand:'serie',freq:'chaque',terme:'moyen',vis:'demoul',qui:'op',etendue:undefined,combien:undefined,mes:{}};
const CONF={},HIST=[];
/* Révision retours Henry (2026-11-02) : les mesures sont intégrées à l'étape des causes (consigne, valeur, moyenne des OF précédents, tendance) ;
   la cause peut être ajoutée par l'atelier ; un retour d'expérience mémorisé localement remonte la cause lors des enquêtes suivantes.
   Constats multiples, corrigeables ; aucune causalité déduite d'un simple clic. */
const REC={},OK={},NUM={};
const base=()=>S.br==='derive'?'d|'+S.param:'p|'+S.def;
const KEY=()=>base()+'#'+(NUM[base()]||0);
const isPF=()=>POSTFAB.includes(S.qui);
const LATE=['Pièces déformées','Pièces cassantes','Bulles de vide','Fissuration sous contrainte'];
const famOf=n=>{const d=DEFS.find(x=>x[0]===n);return d?lab(FAM,d[1]):''};
/* 'sans' = mesures relevées à la main (VP Expert seul) ; 'conforme' = mesures fournies par VP Predict (démonstration) ; 'derive' = recherche de l'origine d'une dérive */
const SIT=[['sans','Relevé à la main','Le régleur saisit les mesures qu’il relève sur la presse. Sans valeur saisie, toutes les causes restent à vérifier.'],['conforme','Mesures de la presse','Consigne, valeur actuelle, moyenne des OF précédents et tendance arrivent de la presse. Valeurs de démonstration.'],['derive','Une mesure dérive','On cherche l’origine de la dérive : presse, outillage, périphérique…']];
const isB=()=>S.def==='Bavure';
/* Fiche de réglage d'exemple : consigne, tolérance et unité par mesure. Valeurs illustratives, à remplacer par la fiche validée de la presse. */
const MES={to:{u:'°C',c:60,t:5,d:1},tm:{u:'°C',c:235,t:10,d:1},ti:{u:'s',c:1.20,t:0.15,d:2},com:{u:'bar',c:850,t:60,d:0},td:{u:'s',c:8.5,t:0.8,d:1},tc:{u:'s',c:32.0,t:1.5,d:1},mat:{u:'mm',c:5.0,t:1.5,d:1},visc:{u:'bar·s',c:100,t:12,d:0}};
const fmt=(p,v)=>Number(v).toFixed(MES[p].d).replace('.',',');
/* Sens défavorable d'une cause liée à une mesure, lu dans son libellé */
const dirOf=n=>/trop haute|trop forte|trop lent|trop élevé/i.test(n)?'haut':/trop basse|trop rapide|trop faible|insuffisant/i.test(n)?'bas':'var';
const hash=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
/* Valeurs de démonstration VP Predict : déterministes par défaut et par mesure. La première mesure liée au défaut est « conforme mais limite » avec tendance défavorable. */
function demo(p,dir,rank){const m=MES[p],h=hash(S.def+p),j=(h%7-3)/10;
 const sgn=dir==='bas'?-1:1;
 if(rank===0)return {avg:m.c+sgn*m.t*0.25+j*m.t*0.1,cur:m.c+sgn*m.t*0.82};
 if(rank===1)return {avg:m.c+sgn*m.t*0.15,cur:m.c+sgn*m.t*0.45};
 return {avg:m.c+j*m.t*0.2,cur:m.c+j*m.t*0.3};}
function mesCauses(){return cands().filter(c=>c.t==='mes'&&c.p&&MES[c.p]).reduce((a,c)=>{if(!a.find(x=>x.p===c.p))a.push({p:c.p,dir:dirOf(c.n),n:c.n});return a},[]);}
/* Statut d'une mesure : none (pas de valeur) · ok · limite · hors ; tendance : stable · defav · fav */
function mstat(p,dir){const m=MES[p];let cur,avg;
 if(S.br==='conforme'){const r=mesCauses().findIndex(x=>x.p===p),d=demo(p,dir,r<0?9:r);cur=d.cur;avg=d.avg}
 else{const v=S.mes[p];if(v===undefined||v===''||isNaN(+v))return {st:'none',trend:'none',cur:undefined,avg:undefined,txt:'Pas de valeur relevée'};cur=+v;avg=undefined}
 const dev=(cur-m.c)/m.t,ad=Math.abs(dev);
 const st=ad>1?'hors':ad>0.6?'limite':'ok';
 const side=dev>0?'haut':'bas';
 let trend='none';if(avg!==undefined){const tr=(cur-avg)/m.t;trend=Math.abs(tr)<0.3?'stable':(dir==='var'||(tr>0?'haut':'bas')===dir)?'defav':'fav'}
 /* adverse : l'écart va dans le sens de la cause (ou cause de type variation) */
 const adverse=st!=='ok'&&(dir==='var'||side===dir);
 const txt=st==='hors'?'Hors plage ('+(side==='haut'?'trop haut':'trop bas')+')':st==='limite'?'Conforme mais limite '+(side==='haut'?'haute':'basse'):'Conforme';
 return {st,trend,cur,avg,dev,side,adverse,txt};}
function cands(){let out;
 if(isB())out=ISHI.map(c=>({...c,src:'exp'}));
 else{out=(DMAP[S.def]||[]).map(k=>({id:k,...LIB[k],src:'add'}));
  const seen={};((window.DEF||{})[S.def]||[]).forEach(code=>{const m=MCODE[code[0]];if(!m||seen[code])return;seen[code]=1;const irr=/i$/.test(code)||code==='Yr';
   out.unshift({id:'m_'+code,b:m[1],n:(window.DLAB||{})[code]||m[2],t:'mes',p:m[0],src:'exp',ctl:'Relever '+m[2].toLowerCase()+' sur les derniers cycles et la comparer à la référence de la fiche de réglage.',ind:irr?{freq:['alea','cycl'],quand:['serie']}:{freq:['chaque'],terme:['moyen']}})});}
 /* Causes ajoutées par l'atelier (mémoire locale du navigateur) */
 (window.VPCustom?.list('TP',S.def)||[]).forEach(x=>out.push({id:x.id,b:x.b,n:x.n,t:'cust',src:'atelier',ctl:x.ctl||'Contrôle à définir par le régleur.',ind:{},date:x.date}));
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
/* Étape 3, bloc « Mesures de la presse » : source des mesures puis tableau consigne / valeur / moyenne OF / tendance / statut */
function draw1(){
 const d=S.br==='derive',MC=mesCauses();
 const mh=document.querySelector('#mes .mesh');if(mh)mh.hidden=d;
 if(d){$('sit').innerHTML='';$('drv').innerHTML=`<div class="emsg"><b>Recherche de l’origine d’une dérive :</b> ${esc(lab(PROC,S.param))}. Le défaut en est probablement la conséquence ; on cherche d’où vient la dérive. <button type="button" class="lk" data-go="conforme">Revenir aux causes du défaut</button></div><p class="ml">Quelle mesure dérive ?</p>`+pills('param',PROC);$('msg').innerHTML='';$('msg').className='emsg';$('msg').hidden=true;return}
 $('msg').hidden=false;
 $('sit').innerHTML=SIT.filter(x=>x[0]!=='derive').map(([v,t,dd])=>`<button type="button" class="sc" data-b="${v}" aria-pressed="${S.br===v}"><em class="stag ${v==='sans'?'ex':'pr'}">${v==='sans'?'VP Expert seul':'Avec VP Predict'}</em><b>${t}</b><span>${dd}</span></button>`).join('');
 if(!MC.length){$('drv').innerHTML='';$('msg').innerHTML='<b>Aucune mesure de presse n’est reliée à ce défaut</b> dans le référentiel : les causes se classent d’après le QQOQCP.';$('msg').className='emsg';return}
 const rows=MC.map(({p,dir,n})=>{const m=MES[p],s=mstat(p,dir);
  const cls=s.st==='none'?'':s.adverse?(s.st==='hors'?'hors':'lim'):s.st==='ok'?'ok':'okl';
  const trend=s.trend==='none'?(S.br==='conforme'?'—':'<span class="sl">avec VP Predict</span>'):s.trend==='stable'?'Stable':s.trend==='defav'?'<b>Défavorable</b> '+(s.cur>s.avg?'↗':'↘'):'Favorable';
  const val=S.br==='conforme'?`<b>${fmt(p,s.cur)}</b> ${m.u}`:`<input type="number" step="any" inputmode="decimal" class="mesin" data-mes="${p}" value="${S.mes[p]??''}" aria-label="Valeur relevée, ${esc(lab(PROC,p))}" placeholder="relevé"> ${m.u}`;
  const avg=S.br==='conforme'?fmt(p,s.avg)+' '+m.u:'<span class="sl">avec VP Predict</span>';
  const stat=s.st==='none'?'<span class="mst">À relever</span>':`<span class="mst ${cls}">${s.txt}${s.trend==='defav'?' · tendance défavorable':''}</span>`;
  const link=(s.st==='hors'||(s.st==='limite'&&s.trend==='defav'))?` <button type="button" class="lk" data-drift="${p}">Chercher l’origine</button>`:'';
  return `<tr class="${cls}"><th scope="row">${esc(lab(PROC,p))}<small>${dir==='haut'?'défavorable si trop haute':dir==='bas'?'défavorable si trop basse':'défavorable si instable'}</small></th><td>${fmt(p,m.c)} ± ${fmt(p,m.t)} ${m.u}</td><td>${val}</td><td>${avg}</td><td>${trend}</td><td>${stat}${link}</td></tr>`}).join('');
 $('drv').innerHTML=`<div class="tw mest"><table><thead><tr><th>Mesure</th><th>Consigne<small>fiche de réglage</small></th><th>Valeur actuelle</th><th>Moyenne<small>7 OF précédents</small></th><th>Tendance</th><th>Lecture</th></tr></thead><tbody>${rows}</tbody></table></div>`;
 const st=MC.map(x=>mstat(x.p,x.dir)),nOk=st.filter(s=>s.st==='ok'&&s.trend!=='defav').length,nLim=st.filter(s=>s.adverse&&s.st==='limite'||s.trend==='defav').length,nHors=st.filter(s=>s.st==='hors').length,nNone=st.filter(s=>s.st==='none').length;
 $('msg').innerHTML=S.br==='sans'?(nNone===MC.length?`<b>Relevé à la main :</b> saisissez les valeurs que vous relevez sur la presse. Sans valeur, les ${nMesOf()} causes liées aux mesures restent à vérifier comme les autres. Consignes : fiche de réglage d’exemple.`
   :`<b>${MC.length-nNone} mesure(s) relevée(s) :</b> ${nOk} conforme(s), ${nLim} en limite ou tendance défavorable, ${nHors} hors plage. Une mesure conforme rend ses causes moins probables sans les exclure ; une mesure en limite ou hors plage les fait remonter.`)
  :`<b>Lecture VP Predict (démonstration) :</b> ${nOk} mesure(s) conforme(s) et stable(s), ${nLim} conforme(s) mais limite ou en tendance défavorable, ${nHors} hors plage. On peut être dans la plage et pourtant favoriser le défaut : les causes concernées remontent dans la liste.`;
 $('msg').className='emsg'+(nLim||nHors?' warnm':' win');
}
function draw2(){
 const d=S.br==='derive';
 $('t2').textContent=d?'Enquête QQOQCP sur la dérive':'Enquête QQOQCP : '+S.def.toLowerCase();
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
 $('fiche').innerHTML='<b>Fiche d’enquête QQOQCP</b> '+L.filter(x=>x[1]).map(([k,v])=>`<span><i>${k}</i> ${esc(v)}</span>`).join('');
}
const why=ind=>{const w=[];for(const k in ind){if(k==='quand'&&S.br!=='derive'&&isPF()&&S.etendue!=='partie')continue;if(S[k]&&ind[k].includes(S[k]))w.push(LBL[S[k]].split(' (')[0].toLowerCase());}return w};
const TAG={mes:'<span class="tg mes">Donnée de mesure</span>',cust:'<span class="tg atelier">Ajoutée par l’atelier</span>'};
/* Phrase « pourquoi cette cause est classée ici », lisible par un régleur */
function whyText(c){const parts=[];
 if(c.w.length)parts.push(`vos réponses « ${c.w.join(' », « ')} » vont dans le sens de cette cause`);
 if(c.ms){if(c.ms.st==='hors')parts.push(`<b>mesure hors plage</b> (${esc(lab(PROC,c.p))} ${fmt(c.p,c.ms.cur)} ${MES[c.p].u})`);
  else if(c.ms.adverse&&c.ms.st==='limite')parts.push(`<b>mesure conforme mais limite ${c.ms.side==='haut'?'haute':'basse'}</b>${c.ms.trend==='defav'?', tendance défavorable sur les OF précédents':''}`);
  else if(c.ms.trend==='defav')parts.push('<b>mesure conforme, mais tendance défavorable</b> sur les OF précédents');
  else if(c.lo)parts.push('<b>mesure conforme et stable : moins probable</b>, vérifier tout de même capteur et étalonnage');}
 if(c.rx)parts.push(`<b>retour d’expérience atelier :</b> cause confirmée ${c.rx} fois sur ce défaut`);
 if(c.src==='atelier')parts.push('cause proposée par l’atelier'+(c.date?' le '+c.date:'')+', à valider par l’expert');
 if(!parts.length)return 'Aucune de vos réponses ne pointe vers cette cause : elle reste possible, à contrôler après les autres.';
 return 'Pourquoi ici : '+parts.join(' · ')+'.';}
function card(c,i,st,nx){const cf=CONF[c.id]||0;
 let act;
 if(st==='nc')act=`<div class="cst nc nv"><b>Écart observé :</b> hypothèse à vérifier, cause non démontrée tant que l’action corrective n’a pas fait disparaître le défaut. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else if(st==='ok')act=`<div class="cst ok nv"><b>Contrôle conforme :</b> hypothèse non étayée par ce contrôle. <button type="button" class="lk" data-fix="${c.id}">Corriger la saisie</button></div>`;
 else act=`<div class="acts nv"><button type="button" class="btn sm bnc" data-nc="${c.id}">Non conforme après contrôle</button><button type="button" class="btn ghost sm bok" data-ok="${c.id}">Conforme après contrôle</button></div>`;
 return `<div class="cc${i===0?' best':''}${st==='ok'?' done':''}${st==='lock'?' lock':''}${st==='nc'?' found':''}${nx?' next':''}${c.rx?' rex':''}" data-id="${c.id}" data-name="${esc(c.n)}"><div class="ch"><span class="rk">${i+1}</span><b>${nx?'<span class="tg nxt nv">Contrôle suivant</span>':''}${esc(c.n)}${TAG[c.t]||''}${c.src==='add'?'<span class="tg add" title="Cause issue des tableaux de dépannage publiés, recoupée par Vella Partners. Relecture par l’expert plasturgie partenaire en cours.">Guide de dépannage</span>':''}${c.rx?'<span class="tg rex" title="Cause confirmée lors d’enquêtes précédentes sur ce défaut, dans la mémoire atelier de ce navigateur">Retour d’expérience</span>':''}</b><span class="ind" title="Score de pertinence, pas une probabilité">${c.pct}<small> pts</small></span></div><div class="bar"><i style="width:${c.pct}%"></i></div><p><span class="fam">${esc(c.z)}</span> <b>Contrôle :</b> ${esc(c.ctl)}</p><p class="why">${whyText(c)}${cf?` · <b>Écart observé dans cette démonstration, cause non démontrée</b>`:''}</p>${act}</div>`;}
function draw3(){
 const d=S.br==='derive';let h='',list;
 $('t3').textContent=d?'Origines à contrôler, dans l’ordre':'Mesures et causes à contrôler';
 if(d){list=DRV.map((c,k)=>({...c,id:'d'+k})).filter(c=>c.p.includes(S.param)).map(c=>({...c,z:lab(ORIG,c.o),w:why(c.ind)}));}
 else list=cands().map(c=>{const ms=c.t==='mes'&&c.p&&MES[c.p]?mstat(c.p,dirOf(c.n)):null;return {...c,z:c.b,w:why(c.ind),ms:ms&&ms.st!=='none'?ms:null,lo:!!(ms&&ms.st==='ok'&&ms.trend!=='defav')}});
 list.forEach(c=>{c.rx=window.VPREX?.count('TP',d?'d|'+S.param:S.def,c.id)||0;
  let s=Math.pow(2.2,c.src==='atelier'?2:c.w.length);
  if(c.lo)s*=.2;
  if(c.ms){if(c.ms.st==='hors'&&c.ms.adverse)s*=2.2*2.2;else if(c.ms.adverse||c.ms.trend==='defav')s*=2.2;else if(c.ms.st!=='ok'&&!c.ms.adverse)s*=.3}
  s*=Math.pow(1.8,Math.min(c.rx,3));
  c.s=s});
 const tot=list.reduce((a,c)=>a+c.s,0)||1;list.forEach(c=>c.pct=Math.max(1,Math.round(c.s/tot*100)));
 list.sort((a,b)=>b.s-a.s||(CONF[b.id]||0)-(CONF[a.id]||0));
 const ans=['ou','quand','freq','terme','vis','etendue'].filter(k=>S[k]).length;
 const K=KEY(),R=REC[K]||{},O=OK[K]||{};
 const stOf=c=>R[c.id]?'nc':O[c.id]?'ok':'open';
 const nxi=list.findIndex(c=>stOf(c)==='open');
 const nShow=Math.max(5,nxi+1,...list.map((c,i)=>R[c.id]?i+1:0));
 const nOk=Object.keys(O).length;
 let head='<p class="vpx">VP Expert · guide les contrôles</p>';
 if(ans>=2&&list.length){
  head+=Object.keys(R).length?`<div class="emsg win nv"><b>${Object.keys(R).length} écart(s) observé(s).</b> Plusieurs écarts peuvent coexister : poursuivre les contrôles pertinents, corriger, puis indiquer le résultat à l’étape 4. La synthèse (étape 5) se met à jour. <button type="button" class="lk" data-new="1">Nouvelle enquête sur ce défaut</button></div>`
   :nOk?`<div class="emsg nv">${nOk} contrôle(s) conforme(s). ${nxi>=0?'Passez au contrôle suivant, n° '+(nxi+1)+'.':'Aucune hypothèse étayée : solliciter une revue métier, sans conclure à une cause.'}</div>`
   :'<p class="sl nv">Contrôlez dans l’ordre proposé et indiquez chaque constat. Plusieurs écarts peuvent être relevés ; la cause se confirme quand l’action corrective fait disparaître le défaut (étape 4).</p>';
 }
 const shown=S.showall?list:list.filter((c,i)=>i<nShow||c.src==='atelier');
 h+=ans<2?'<p class="sl">Répondez à au moins deux questions de l’enquête pour classer les causes.</p>':list.length?head+'<div class="cl">'+shown.map(c=>{const i=list.indexOf(c);return card(c,i,stOf(c),i===nxi)}).join('')+'</div>':'<p class="sl">Aucune cause ne correspond encore à ces réponses : ajoutez-la ci-dessous, elle sera proposée à l’expert.</p>';
 if(ans>=2&&list.length>shown.length)h+=`<p class="sl">${list.length-shown.length} autre(s) cause(s) possible(s), voir le diagramme en bas de page. <button type="button" class="lk" id="showall">Afficher toutes les causes</button></p>`;
 const out=[];
 if(!d){if(S.qui==='qual')out.push('<span class="nvm"></span><b>Détecté par le service qualité après fabrication :</b> bloquer le lot concerné'+(S.etendue==='partie'?', retrouver par la traçabilité (heure, ordre de fabrication) la partie de série touchée':S.etendue==='tot'?' et trier la totalité de la série':'')+'.');
  if(S.qui==='client')out.push('<b>Détecté chez le client :</b> lancer le confinement (tri des stocks et en-cours) et informer la qualité.');
  if(S.qui==='aval')out.push('<b>Détecté en finition :</b> bloquer les en-cours entre presse et finition, prévenir le régleur.');
  if(S.combien==='toutes')out.push('<b>Toutes les pièces :</b> arrêt ou tri à 100 % le temps du contrôle.');
  if(S.vis==='refroid'&&isB())out.push('<b>Visible après refroidissement :</b> inhabituel pour une bavure, vérifier qu’il ne s’agit pas d’un retrait.');}
 else out.push('Une fois l’origine corrigée, vérifiez que le défaut disparaît. S’il persiste avec une mesure revenue dans sa plage : <button type="button" class="lk" data-go="conforme">revenir aux causes du défaut</button>.');
 h+=out.map(o=>`<div class="emsg${o.startsWith('<span class="nvm">')?' nv':''}">${o}</div>`).join('');
 h+='<p class="pr"><button type="button" class="btn ghost sm" id="print">Imprimer la fiche d’enquête</button></p>';
 $('res').innerHTML=h;
 $('s4').hidden=d;
 if(!d){$('ihint').textContent=S.br==='conforme'||Object.keys(S.mes).length?'Les causes grisées sont rendues moins probables par des mesures conformes et stables, sans être exclues. Les autres sont colorées selon le nombre d’indices.':'Sans mesures, toutes les causes restent possibles.';
  const C=cands();$('ititle').textContent='Diagramme d’Ishikawa · '+S.def.toLowerCase();$('ishi').innerHTML=['Matière','Outillage','Moyen','Paramètres'].map(B=>`<section><h3>${B}</h3><ul>`+C.filter(c=>c.b===B).map(c=>{const n=why(c.ind).length,ms=c.t==='mes'&&c.p&&MES[c.p]?mstat(c.p,dirOf(c.n)):null,x=ms&&ms.st==='ok'&&ms.trend!=='defav';return `<li class="${x?'x':n>=3?'s3':n===2?'s2':n===1?'s1':''}">${esc(c.n)}</li>`}).join('')+'</ul></section>').join('');}
}
function drawH(){$('hist').hidden=!HIST.length;$('hb').innerHTML=HIST.map((r,ix)=>`<tr class="${r.r}"><td>${r.t}</td><td>${esc(r.d)}</td><td>${esc(r.c)}</td><td><span class="res ${r.r}">${r.r==='nc'?'Écart observé : cause non démontrée':'Contrôle conforme : hypothèse non étayée'}</span></td><td><button type="button" class="lk" data-hfix="${ix}">Corriger</button></td></tr>`).join('');}
function undo(ix){const r=HIST[ix];if(!r)return;HIST.splice(ix,1);
 if(r.r==='nc'){if(REC[r.key])delete REC[r.key][r.id];}
 else if(OK[r.key])delete OK[r.key][r.id];}
function record(id,res){const K=KEY();REC[K]=REC[K]||{};OK[K]=OK[K]||{};if(REC[K][id]||OK[K][id])return;
 const c=/^d\d/.test(id)?DRV[+id.slice(1)]:cands().find(x=>x.id===id);if(!c)return;
 if(res==='nc')REC[K][id]=1;else OK[K][id]=1;
 HIST.unshift({key:K,id,r:res,t:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),d:S.br==='derive'?lab(PROC,S.param)+' dérive':S.def,c:c.n});}
function render(){draw0();draw1();draw2();draw3();drawH();window.dispatchEvent(new Event('vp:enquete-render'));}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.def){S.def=b.dataset.def;S.showall=false;if(LATE.includes(S.def)&&S.vis==='demoul')S.vis=undefined;render();if(innerWidth<760)$('s2').scrollIntoView({behavior:'smooth'});return}
 if(b.id==='more'){S.more=true;draw0();return}
 if(b.id==='showall'){S.showall=true;draw3();window.dispatchEvent(new Event('vp:enquete-render'));return}
 if(b.dataset.fam){S.fam=b.dataset.fam;draw0();return}
 if(b.dataset.b){S.br=b.dataset.b;render();return}
 if(b.dataset.drift){S.br='derive';S.param=b.dataset.drift;render();$('s3').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.go){S.br=b.dataset.go;render();$('s3').scrollIntoView({behavior:'smooth'});return}
 if(b.dataset.nc){record(b.dataset.nc,'nc');render();return}
 if(b.dataset.ok){record(b.dataset.ok,'ok');render();const n=document.querySelector('.cc.next');if(n)n.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(b.dataset.fix){const K=KEY(),ix=HIST.findIndex(r=>r.key===K&&r.id===b.dataset.fix);undo(ix);render();return}
 if(b.dataset.hfix){undo(+b.dataset.hfix);render();return}
 if(b.dataset.new){NUM[base()]=(NUM[base()]||0)+1;render();return}
 if(b.id==='print'){window.print();return}
 const o=b.closest('.opts');if(o){const k=o.dataset.k,v=b.dataset.v;S[k]=(S[k]===v&&k!=='param')?undefined:v;render();}
});
/* Saisie manuelle d'une valeur relevée : le classement se met à jour sans perdre le focus */
document.addEventListener('input',e=>{const el=e.target;if(!el.matches('.mesin'))return;const p=el.dataset.mes;if(el.value==='')delete S.mes[p];else S.mes[p]=el.value;
 draw3();const row=el.closest('tr'),dir=mesCauses().find(x=>x.p===p)?.dir||'var',s=mstat(p,dir);
 if(row){row.className=s.st==='none'?'':s.adverse?(s.st==='hors'?'hors':'lim'):s.st==='ok'?'ok':'okl';const cell=row.querySelector('.mst');if(cell){cell.textContent=s.st==='none'?'À relever':s.txt;cell.className='mst '+row.className}}
 window.dispatchEvent(new Event('vp:enquete-render'))});
document.addEventListener('change',e=>{if(e.target.matches('.mesin'))draw1()});
$('dq').addEventListener('input',e=>{S.qd=e.target.value;draw0()});
if(/[?&]revue\b/.test(location.search))document.body.classList.add('revue');
render();
window.VPConsolidation?.bind({sector:'TP',S,REC,OK,NUM,HIST,render,cands,KEY,
 /* Lecture des mesures pour la synthèse */
 measures:()=>S.br==='derive'?[]:mesCauses().map(({p,dir,n})=>{const s=mstat(p,dir),m=MES[p];return {name:lab(PROC,p),unit:m.u,set:fmt(p,m.c)+' ± '+fmt(p,m.t),cur:s.cur===undefined?null:fmt(p,s.cur),avg:s.avg===undefined?null:fmt(p,s.avg),status:s.st,trend:s.trend,adverse:!!s.adverse,txt:s.st==='none'?'Pas de valeur relevée':s.txt+(s.trend==='defav'?', tendance défavorable':'')}}),
 defectLabel:()=>S.br==='derive'?lab(PROC,S.param)+' (dérive)':S.def,
 families:['Matière','Outillage','Moyen','Paramètres'],
 choices:{def:DEFS.map(d=>d[0]),fam:['all',...FAM.map(x=>x[0])],qd:'text',more:'boolean',showall:'boolean',mes:'object',br:SIT.map(x=>x[0]),param:PROC.map(p=>p[0]),...Object.fromEntries(Object.entries({ou:OU,quand:QUAND,freq:FREQ,terme:TERME,qui:QUI,combien:COMBIEN,vis:VIS,etendue:ETENDUE}).map(([k,v])=>[k,v.map(x=>x[0])]))}});
})();
