/* Simulateur presse simplifié · parcours validé en relecture fonctionnelle
   Je simule une dérive → paramètre en hausse ou en baisse → causes classées → actions classées → retour dans les clous → historique. */
(function(){'use strict';
const CFG=window.SIM_CFG,P=CFG.params,PK=Object.fromEntries(P.map(p=>[p.id,p]));
const $=id=>document.getElementById(id);
const fmt=(v,d)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DIRL={up:'en hausse',down:'en baisse'};
const STEP_MS=900,REF_N=30,WIN=70,LAMBDA=.2,L=3;
const noise=()=>{let z;do{z=Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());}while(Math.abs(z)>2.4);return z;};
/* ---------- Cycles réels (caoutchouc) : base réelle + dérive ajoutée ---------- */
const RD=CFG.real&&window.VELLA_CYCLES&&window.VELLA_CYCLES.rows&&window.VELLA_CYCLES.rows.length?Object.assign({},CFG.real,{rows:window.VELLA_CYCLES.rows}):null;
const REFW=RD?(RD.refN||500):0,LOOK=60;let MODE=RD?'real':'sim',START=null;
const SEG=[];if(RD){let id=0;RD.rows.forEach((r,i)=>{if(i&&RD.sets.some(c=>r[c]!==RD.rows[i-1][c]))id++;SEG.push(id);});}
const val=(i,p)=>RD.rows[i][RD.cols[p.id]];
function refP(s,p){let a=0;for(let i=s-REFW;i<s;i++)a+=val(i,p);const m=a/REFW;let q=0;for(let i=s-REFW;i<s;i++)q+=(val(i,p)-m)**2;return {m,sd:Math.max(.5,Math.sqrt(q/(REFW-1)))};}
function calmFor(s,p,H){if(s-REFW<0||s+H>RD.rows.length||SEG[s-REFW]!==SEG[s+H-1])return false;
 const {m,sd}=refP(s,p),st=meth()==='stat',lo=st?m-3*sd:m-p.tol,hi=st?m+3*sd:m+p.tol,lim=L*sd*Math.sqrt(LAMBDA/(2-LAMBDA));let e=m,up=0,dn=0;
 for(let i=s-WIN;i<s+H;i++){const x=val(i,p);e=LAMBDA*x+(1-LAMBDA)*e;up=x>m+sd?up+1:0;dn=x<m-sd?dn+1:0;if(i<s){if(x>hi||x<lo)return false;continue;}
  if(x>hi||x<lo||Math.abs(e-m)>lim||up>=7||dn>=7)return false;}return true;}
function findStart(from,ps,H){const N=RD.rows.length;for(let k=0;k<N;k+=5){const i=(from+k)%N;if(ps.every(p=>calmFor(i,p,H)))return i;}
 for(let k=0;k<N;k+=5){const i=(from+k)%N;if(i>=REFW&&i+H<=N&&SEG[i-REFW]===SEG[i+H-1])return i;}return Math.max(REFW,from%N);}
function seekTo(i){S.ri=i;P.forEach(p=>{const h=[],e=[],b=[];let ew=null;for(let k=i-WIN;k<i;k++){const x=val(k,p);ew=ew==null?x:LAMBDA*x+(1-LAMBDA)*ew;h.push(x);e.push(ew);b.push(x);}
 S.hist[p.id]=h;S.ew[p.id]=e;S.base[p.id]=b;S.ref[p.id]=refP(i,p);});S.fc=RD.rows[i-1][0];}
// Historique de démonstration uniquement : aucun clic ne modifie les poids initiaux.
Object.values(CFG.kb).forEach(o=>['up','down'].forEach(d=>(o[d]||[]).forEach(c=>{c.h=0;c.a.forEach(a=>a.h=0);})));
const HIST=[];
let S;
function fresh(){S={cycle:0,running:true,hist:{},ew:{},ref:{},focus:P[0].id,drift:null,alert:null,cause:null,dunno:false,newCause:false,newAct:false};
 S.base={};P.forEach(p=>{S.hist[p.id]=[];S.ew[p.id]=[];S.base[p.id]=[];});
 if(MODE==='real'){if(START==null)START=findStart(REFW,P,LOOK);S.cycle=REF_N;seekTo(START);}}
function band(p){const r=S.ref[p.id];if(meth()==='stat'&&r)return {lo:r.m-3*r.sd,hi:r.m+3*r.sd,c:r.m,sd:r.sd};const c0=MODE==='real'&&r?r.m:p.c;return {lo:c0-p.tol,hi:c0+p.tol,c:r?r.m:p.c,sd:r?r.sd:p.s};}
const meth=()=>(document.querySelector('input[name=meth]:checked')||{}).value||'recette';
const rule=k=>{const x=document.querySelector(`[data-r=${k}]`);return !x||x.checked;};

/* ---------- Cycle ---------- */
function tick(){S.cycle++;const d=S.drift;let ri=-1;
 if(MODE==='real'){if(S.ri>=RD.rows.length||(!d&&S.ri>0&&SEG[S.ri]!==SEG[S.ri-1]))seekTo(findStart(S.ri%RD.rows.length,P,LOOK));ri=S.ri++;S.fc=RD.rows[ri][0];}
 P.forEach(p=>{let off=0;
  if(d&&d.p===p.id){const t=S.cycle-d.start;off=(d.dir==='up'?1:-1)*Math.min(t*p.tol*.07,p.tol*1.6);if(d.fixedAt!=null)off*=Math.max(0,1-(S.cycle-d.fixedAt)/5);}
  const b0=ri>=0?val(ri,p):null,x=ri>=0?Math.round(b0+off):p.c+off+noise()*p.s;S.hist[p.id].push(x);S.base[p.id].push(b0);
  const prev=S.ew[p.id].at(-1);S.ew[p.id].push(prev==null?x:LAMBDA*x+(1-LAMBDA)*prev);
  if(S.hist[p.id].length>400){S.hist[p.id].shift();S.ew[p.id].shift();S.base[p.id].shift();}});
 if(MODE==='sim'&&S.cycle===REF_N)P.forEach(p=>{const a=S.hist[p.id].slice(-REF_N),m=a.reduce((x,y)=>x+y,0)/a.length,sd=Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));S.ref[p.id]={m,sd:Math.max(sd,.9*p.s)};});
 if(S.verify){if(S.cycle-S.verify.at<=6)renderSide();}
 else if(d&&d.fixedAt!=null&&S.cycle-d.fixedAt>6){S.drift=null;renderSide();}
 if(S.cycle>REF_N&&d&&d.fixedAt==null&&!S.alert&&!S.verify)detect(d);
 draw();}
function detect(d){const p=PK[d.p],h=S.hist[p.id],b=band(p),x=h.at(-1),e=S.ew[p.id].at(-1),r=S.ref[p.id];let why=null;
 if(rule('seuil')&&(x>b.hi||x<b.lo))why=meth()==='stat'?'Seuil statistique franchi (moyenne ± 3 σ)':'Seuil de tolérance franchi';
 else if(rule('cote')&&h.length>=7&&(MODE!=='real'||S.cycle-d.start>=7)&&(h.slice(-7).every(v=>v>b.c+b.sd)||h.slice(-7).every(v=>v<b.c-b.sd)))why='Alerte préventive : 7 cycles du même côté de la référence';
 else if(rule('ewma')&&r){const lim=L*r.sd*Math.sqrt(LAMBDA/(2-LAMBDA));if(Math.abs(e-r.m)>lim)why='Alerte préventive : la tendance lissée sort de sa zone';}
 if(why){S.failed=false;S.alert={p:p.id,dir:d.dir,why,cycle:S.cycle,fc:MODE==='real'?S.fc:S.cycle,at:new Date()};S.focus=p.id;renderSide();}}

/* ---------- Probabilités ---------- */
const w=x=>x.n;
function ranked(list){const tot=list.reduce((s,x)=>s+w(x),0)||1;return list.map(x=>({x,pc:Math.round(100*w(x)/tot)})).sort((a,b)=>w(b.x)-w(a.x));}
const causesOf=(p,dir)=>(CFG.kb[p]&&CFG.kb[p][dir])||[];
const checksOf=p=>(CFG.checks[p]||CFG.checks._all||[]);
function srcTxt(x){return x.n?`poids illustratif ${x.n}, non calibré`:'ajout de démonstration, non validé';}

/* ---------- Affichage ---------- */
function tiles(){$('tiles').innerHTML=P.map(p=>{const x=S.hist[p.id].at(-1),b=band(p);
 const st=x==null?'':(x>b.hi||x<b.lo)?'bad':(S.alert&&S.alert.p===p.id)?'warn':'';
 const v=S.ew[p.id].slice(-30);let sp='';if(v.length>1){const lo=Math.min(b.lo,...v),hi=Math.max(b.hi,...v);sp=`<svg class="spk" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="${v.map((y,i)=>(i?'L':'M')+(i*100/29).toFixed(1)+' '+(22-20*(y-lo)/(hi-lo||1)).toFixed(1)).join('')}"/></svg>`;}
 return `<button type="button" class="tile ${st}${S.focus===p.id?' sel':''}" data-f="${p.id}" aria-pressed="${S.focus===p.id}"><span class="tn"><i class="sd"></i>${p.n}</span><span class="tv">${x==null?'–':fmt(x,MODE==='real'?0:p.dec)} <small>${p.u}</small></span>${sp}</button>`;}).join('');
 $('tiles').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.focus=b.dataset.f;draw();});}
function chart(){const p=PK[S.focus],h=S.hist[p.id],e=S.ew[p.id],n=h.length,from=Math.max(0,n-WIN),v=h.slice(from),ev=e.slice(from),b=band(p);
 $('ctitle').textContent=p.n+' ('+p.u+')';
 const W=720,H=300,pl=54,pr=12,pt=14,pb=26;const lo0=Math.min(b.lo,...v),hi0=Math.max(b.hi,...v),pad=(hi0-lo0)*.15||1,lo=lo0-pad,hi=hi0+pad;
 const X=i=>pl+(W-pl-pr)*i/(WIN-1),Y=y=>pt+(H-pt-pb)*(1-(y-lo)/(hi-lo));
 const line=a=>a.map((y,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(y).toFixed(1)).join('');
 let g=`<rect x="${pl}" y="${Y(b.hi)}" width="${W-pl-pr}" height="${Y(b.lo)-Y(b.hi)}" class="zone"/>`;
 [b.hi,b.lo].forEach(y=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(y)}" y2="${Y(y)}" class="tol"/><text x="${pl-6}" y="${Y(y)+4}" class="ax">${fmt(y,p.dec)}</text>`);
 g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(b.c)}" y2="${Y(b.c)}" class="ref"/><text x="${pl-6}" y="${Y(b.c)+4}" class="ax">${fmt(b.c,p.dec)}</text>`;
 const bandName=meth()==='stat'?'limite statistique':'tolérance recette';
 const legend=document.querySelector('.l-tol');if(legend&&legend.parentElement)legend.parentElement.innerHTML='<i class="l-tol"></i>'+(meth()==='stat'?'Bande statistique':'Tolérance recette');
 g+=`<text x="${W-pr-4}" y="${Y(b.hi)-5}" class="tl">${bandName} haute</text><text x="${W-pr-4}" y="${Y(b.lo)+14}" class="tl">${bandName} basse</text>`;
 if(v.length>1){const k=ev.length-1;g+=`<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--orange)" stop-opacity=".22"/><stop offset="1" stop-color="var(--orange)" stop-opacity="0"/></linearGradient></defs><path d="${line(ev)}L${X(k)} ${Y(lo)}L${X(0)} ${Y(lo)}Z" fill="url(#ga)"/>${MODE==='real'?(()=>{const bv=S.base[p.id].slice(from);return bv.some((y,i)=>y!=null&&Math.abs(y-v[i])>1e-9)?`<path d="${line(bv)}" class="base"/>`:''})():''}<path d="${line(v)}" class="raw"/><path d="${line(ev)}" class="ew"/><circle cx="${X(k)}" cy="${Y(ev[k])}" r="9" class="halo"/><circle cx="${X(k)}" cy="${Y(ev[k])}" r="4.5" class="head"/>`;}
 if(S.alert&&S.alert.p===p.id){const i=S.alert.cycle-1-(S.cycle-n)-from;if(i>=0&&i<v.length)g+=`<circle cx="${X(i)}" cy="${Y(v[i])}" r="6" class="dot"/>`;}
 $('chart').innerHTML=g;
 $('csub').textContent=MODE==='real'?(S.drift?'Cycles réels + dérive ajoutée · pointillés : valeur réelle sans la dérive':'Chaque point est un cycle réel de presse caoutchouc, rejoué dans l’ordre.'):S.cycle<REF_N?`Calcul de la référence : cycle ${S.cycle} sur ${REF_N}`:'Chaque point est un cycle.';}
function status(){const st=$('status');let c='ok',t='Process stable';
 if(S.cycle<REF_N){c='';t='Calcul de la référence…';}
 if(S.drift&&S.drift.fixedAt==null&&!S.alert){c='ok';t='Process stable';}
 if(S.alert){c='warn';t=`Dérive détectée · ${PK[S.alert.p].n} ${DIRL[S.alert.dir]}`;}
 if(S.drift&&S.drift.fixedAt!=null){c='ok';t=S.verify?'Action simulée : vérification en cours':'Action simulée : retour dans la bande';}
 st.className='status '+c;const tl=$('tlight');if(tl)tl.dataset.s=c||'off';st.querySelector('span').textContent=t;$('cycle').textContent=MODE==='real'?S.fc.toLocaleString('fr-FR'):S.cycle;
 $('play').textContent=S.running?'Pause':'Reprendre';$('drift').disabled=S.cycle<REF_N||!!S.drift;}
function draw(){status();tiles();chart();}

function renderSide(){const el=$('side');const a=S.alert;
 if(S.verify){el.innerHTML=verifyPane();bindVerify();return;}
 if(!a){el.innerHTML=S.cycle<REF_N?`<div class="pane"><h3>La presse démarre</h3><p class="sl">Le simulateur calcule la référence de chaque paramètre sur les ${REF_N} premiers cycles.</p></div>`:
  S.drift&&S.drift.fixedAt==null?`<div class="pane"><h3>Dérive en cours</h3><p class="sl">${esc(PK[S.drift.p].n)} ${DIRL[S.drift.dir]}${MODE==='real'?', ajoutée aux valeurs réelles':''}. La simulation surveille les règles sélectionnées ; aucune avance de détection réelle n’est garantie.</p>${MODE==='real'&&S.jump?`<p class="sl srcnote">Reprise au cycle réel n° ${S.jump.toLocaleString('fr-FR')}, sur une plage stable de ce paramètre : l’alerte vient bien de la dérive ajoutée.</p>`:''}</div>`:
  `<div class="pane"><h3>Process stable</h3><p class="sl">${MODE==='real'?'Les mesures sont les cycles réels d’une presse caoutchouc, rejoués dans l’ordre. Cliquez sur « Je simule une dérive » : elle s’ajoute au paramètre réel choisi.':'Cliquez sur « Je simule une dérive », choisissez un paramètre et son sens.'}</p><button type="button" class="btn primary" id="drift2">Je simule une dérive</button></div>`;
  const d2=$('drift2');if(d2)d2.onclick=openModal;return;}
 const p=PK[a.p],list=causesOf(a.p,a.dir),out=/^Seuil/.test(a.why),stat=/statistique/.test(a.why),outL=stat?'Limite statistique franchie':'Hors tolérance';const hm=a.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 let h=`<div class="phone2${S.seen===a?' nz':''}" aria-label="Notification reçue par le régleur"><div class="pt"><span>VP Predict</span><span>${hm}</span></div><div class="pn"><b>${esc(CFG.press)} · ${esc(p.n)} ${DIRL[a.dir]}</b><span>${out?outL:'Alerte préventive · encore dans la tolérance'} · ${list.length} pistes à contrôler</span></div>${S.taken?`<p class="pok">Pris en charge par le régleur</p>`:`<button type="button" id="take">Je prends en charge</button><p class="pesc">Sans réponse sous 5 min : chef d’équipe prévenu (simulé dans la démonstration)</p>`}</div>`;
 S.seen=a;
 h+=`<div class="pane alertp${out?' hors':''}"><p class="vpx vpp">VP Predict · repère la dérive</p><p class="kick">${out?outL:'Alerte préventive'} · cycle ${a.fc||a.cycle} · ${a.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p><h3>${esc(p.n)} ${DIRL[a.dir]}</h3><p class="sl">${out?(stat?'La valeur mesurée est sortie de la zone moyenne ± 3 σ de la référence : ce n’est pas une tolérance produit, mais un signal fort. Contrôler les pièces et agir.':'La valeur mesurée est sortie de sa tolérance : agir maintenant et contrôler les pièces produites depuis l’alerte.'):esc(a.why)+(stat?'. La valeur reste dans la bande statistique.':'. La valeur reste dans la tolérance de recette.')+' Ce signal ne démontre ni un défaut pièce ni une avance de détection réelle.'}</p></div>`;
 if(!S.cause){
  h+=`<div class="pane"><p class="vpx">VP Expert · guide les contrôles <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="VP Expert classe les causes et les actions à partir de poids de démonstration, sans apprentissage de votre historique. Il fonctionne aussi sur les presses non connectées : le régleur saisit le paramètre qui bouge."></span></button></p><h4>Causes à contrôler, par priorité <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="Score de pertinence sur 100, et non une probabilité : classement issu de poids illustratifs initiaux, non calibré ; les clics de démonstration ne modifient pas les poids."></span></button></h4><ol class="rank">`+
   ranked(list).map(({x,pc},i)=>`<li><button type="button" class="rk" data-c="${list.indexOf(x)}"><span class="rl">${esc(x.l)}</span><span class="bar"><i style="width:${pc}%"></i></span><span class="pc">${pc}<small class="pt"> pts</small></span><small>${srcTxt(x)}</small></button></li>`).join('')+`</ol>
   <div class="alt"><button type="button" class="btn ghost sm" id="dunno" aria-expanded="${S.dunno}">Je ne sais pas</button><button type="button" class="btn ghost sm" id="newc" aria-expanded="${S.newCause}">Nouvelle cause</button></div>`;
  if(S.dunno)h+=`<div class="chk"><p><b>Vérifications suggérées</b>, dans l’ordre :</p><ol>${checksOf(a.p).map(t=>`<li>${esc(t)}</li>`).join('')}</ol><p class="sl">Choisissez une hypothèse pour explorer le scénario, sans la considérer comme démontrée.</p></div>`;
  if(S.newCause)h+=`<form class="newf" id="fc"><label>Nouvelle cause<input id="ic" required maxlength="120" placeholder="ex. Thermocouple débranché"></label><button class="btn primary sm">Valider</button></form>`;
  h+='</div>';
 }else{const c=S.cause;
  h+=`<div class="pane"><p class="vpx">VP Expert · guide les contrôles</p><p class="kick">Hypothèse du scénario <button type="button" class="lnk" id="back">changer</button></p><h4 class="cr">${esc(c.l)}</h4>${S.failed?'<p class="emsgf">Action sans effet, non enregistrée : revenez au réglage d’origine, puis essayez une autre action ou changez de cause.</p>':''}<h4>Actions du scénario, non approuvées en atelier <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="Score de pertinence sur 100, et non une probabilité : classement illustratif initial, sans apprentissage par clic. Une seule action à la fois, avec retour au réglage d’origine si elle échoue."></span></button></h4>`;
  if(c.a.length)h+=`<ol class="rank">`+ranked(c.a).map(({x,pc})=>`<li><button type="button" class="rk act" data-a="${c.a.indexOf(x)}"><span class="rl">${esc(x.l)}</span><span class="bar"><i style="width:${pc}%"></i></span><span class="pc">${pc}<small class="pt"> pts</small></span><small>${srcTxt(x)}</small></button></li>`).join('')+`</ol>`;
  else h+=`<p class="sl">Aucune action en mémoire pour cette cause : décrivez la vôtre.</p>`;
  h+=c.a.length&&!S.newAct?`<div class="alt"><button type="button" class="btn ghost sm" id="newa">Nouvelle action</button></div>`:`<form class="newf" id="fa"><label>Nouvelle action<input id="ia" required maxlength="140" placeholder="ex. Rebrancher le thermocouple"></label><button class="btn primary sm">Simuler</button></form>`;
  h+='</div>';}
 el.innerHTML=h;bind();}
function bind(){const el=$('side'),q=s=>el.querySelector(s),a=S.alert;
 el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.failed=false;S.cause=causesOf(a.p,a.dir)[+b.dataset.c];S.newAct=false;renderSide();});
 el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>apply(S.cause.a[+b.dataset.a]));
 if(q('#dunno'))q('#dunno').onclick=()=>{S.dunno=!S.dunno;renderSide();};
 if(q('#newc'))q('#newc').onclick=()=>{S.newCause=!S.newCause;renderSide();setTimeout(()=>q('#ic')&&q('#ic').focus(),0);};
 if(q('#newa'))q('#newa').onclick=()=>{S.newAct=true;renderSide();setTimeout(()=>q('#ia')&&q('#ia').focus(),0);};
 if(q('#take'))q('#take').onclick=()=>{S.taken=true;renderSide();};
 if(q('#back'))q('#back').onclick=()=>{S.failed=false;S.cause=null;renderSide();};
 if(q('#fc'))q('#fc').onsubmit=e=>{e.preventDefault();const t=q('#ic').value.trim();if(!t)return;const c={l:t,n:0,h:0,a:[],nouv:true};causesOf(a.p,a.dir).push(c);S.cause=c;S.newCause=false;S.newAct=true;renderSide();};
 if(q('#fa'))q('#fa').onsubmit=e=>{e.preventDefault();const t=q('#ia').value.trim();if(!t)return;const x={l:t,n:0,h:0};S.cause.a.push(x);apply(x);};}
/* B : la dérive simulée a une cause réelle, tirée au sort parmi les causes connues (pondérée, pas forcément la première). */
function pickTruth(p,dir){const l=causesOf(p,dir);if(!l.length)return null;const tot=l.reduce((s,x)=>s+w(x)+1,0);let r=Math.random()*tot;for(const x of l){r-=w(x)+1;if(r<=0)return x;}return l.at(-1);}
function effective(c){const t=S.drift&&S.drift.truth;return !t||c===t||!!c.nouv;}
function apply(act){const a=S.alert,c=S.cause;
 S.verify={a,c,act,at:S.cycle,ok:effective(c)};
 if(S.verify.ok)S.drift.fixedAt=S.cycle;S.alert=null;S.cause=null;S.taken=false;S.dunno=false;S.newAct=false;
 if(!S.running){S.running=true;}
 renderSide();draw();}
function verifyPane(){const v=S.verify,n=S.cycle-v.at,ready=n>=6;
 return `<div class="pane vrf"><p class="kick">Étape 4 · vérification simulée</p><h3>Action simulée : ${esc(v.act.l)}</h3><p class="sl">Ce scénario calcule un retour simulé. Aucune pièce réelle n’est contrôlée ici ; les résultats et réglages ne sont pas transférables à une machine sans validation.</p>${ready?`<p class="q"><b>Le signal simulé est-il revenu dans sa zone ? La conformité réelle des pièces reste à vérifier sur site.</b></p>${v.ok?'':'<p class="sl">Lisez la courbe : la mesure continue de s’écarter. Une action qui ne touche pas la vraie cause ne corrige rien.</p>'}${S.badOk?'<p class="emsgf">La mesure n’est pas revenue dans sa zone : l’action ne peut pas être déclarée efficace. Choisissez « Non, pas d’effet », revenez au réglage d’origine, puis changez de cause.</p>':''}<div class="alt"><button type="button" class="btn primary sm" id="vok">Enregistrer le résultat simulé</button><button type="button" class="btn ghost sm" id="vko">Non, pas d’effet</button></div>`:`<p class="sl wait">Observation des cycles suivants : ${n} / 6</p>`}</div>`;}
function bindVerify(){const q=s=>$('side').querySelector(s);
 if(q('#vok'))q('#vok').onclick=()=>{if(!S.verify.ok){S.badOk=true;renderSide();return;}S.badOk=false;const {a,c,act}=S.verify;
  HIST.unshift({at:new Date(),p:PK[a.p].n,dir:DIRL[a.dir],c:c.l,a:act.l,nc:!!c.nouv});S.verify=null;S.drift=null;renderHist();
  $('side').innerHTML=`<div class="pane done"><h3>Résultat simulé enregistré</h3><p class="sl">Ce résultat illustre le parcours de vérification. Il ne prouve ni une cause réelle ni l’efficacité industrielle de l’action, et ne modifie pas le classement.</p></div>`;};
 if(q('#vko'))q('#vko').onclick=()=>{const {a,c}=S.verify;S.badOk=false;S.verify=null;S.drift.fixedAt=null;S.alert=a;S.cause=c;S.failed=true;renderSide();};}
function renderHist(){const t=$('hist');if(!HIST.length){t.innerHTML=`<tr><td colspan="5" class="empty">Aucune dérive traitée pour l’instant. Chaque dérive traitée s’ajoute ici.</td></tr>`;return;}
 t.innerHTML=HIST.map((r,i)=>`<tr${i===0?' class="new"':''}><td>${r.at.toLocaleDateString('fr-FR')}</td><td>${r.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</td><td><b>${esc(r.p)}</b> ${r.dir}</td><td>${esc(r.c)}</td><td>${esc(r.a)}</td></tr>`).join('');}

/* ---------- Fenêtre « Je simule une dérive » ---------- */
let pick={p:null,dir:null};
function openModal(){pick={p:null,dir:null};const m=$('modal');
 m.querySelector('.mp').innerHTML=P.map(p=>`<button type="button" class="choice" data-mp="${p.id}">${p.n}</button>`).join('');
 m.querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>{pick.p=b.dataset.mp;m.querySelectorAll('[data-mp]').forEach(x=>x.setAttribute('aria-pressed',x===b));ok();});
 m.querySelectorAll('[data-md]').forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>{pick.dir=b.dataset.md;m.querySelectorAll('[data-md]').forEach(x=>x.setAttribute('aria-pressed',x===b));ok();};});
 ok();m.hidden=false;m.querySelector('[data-mp]').focus();}
function ok(){$('go').disabled=!(pick.p&&pick.dir);}
function closeModal(){$('modal').hidden=true;}

/* ---------- Base des mesures (cycles réels ou signal simulé) ---------- */
function srcInfo(){const t=$('srcinfo');if(t)t.textContent=MODE==='real'?`${RD.rows.length.toLocaleString('fr-FR')} cycles réels · référence : ${REFW} cycles précédents`:(CFG.sector==='plastique'?'Valeurs de référence et tolérances réelles · variation cycle à cycle reproduite':'Signal simulé autour des valeurs nominales');
 const n=$('nextstart');if(n)n.hidden=MODE!=='real';const rt=$('reftxt');if(rt)rt.innerHTML=MODE==='real'?(RD.refNote||''):`Calculée sur les ${REF_N} premiers cycles stables.`;
 document.querySelectorAll('[data-src]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.src===MODE)));const lg=$('lgbase');if(lg)lg.hidden=MODE!=='real';}
function restart(){fresh();if(MODE==='sim')for(let i=0;i<8;i++)tick();srcInfo();renderSide();draw();}
if(RD){const bar=document.createElement('fieldset');bar.className='srcfs';bar.innerHTML=`<legend>Base des mesures</legend><div class="segc" role="group" aria-label="Base des mesures"><button type="button" data-src="real">Cycles réels</button><button type="button" data-src="sim">Signal simulé</button></div><p class="sl sinfo" id="srcinfo"></p><button type="button" class="lnk" id="nextstart">Autre point de départ</button>`;
 const sg=document.querySelector('.setgrid');sg.prepend(bar);bar.querySelectorAll('[data-src]').forEach(b=>b.onclick=()=>{if(MODE===b.dataset.src)return;MODE=b.dataset.src;restart();});
 $('nextstart').onclick=()=>{START=findStart((START+LOOK*3)%RD.rows.length,P,LOOK);restart();};
 const lg=document.querySelector('.legend');if(lg)lg.insertAdjacentHTML('beforeend','<li id="lgbase"><i class="l-base"></i>Réel sans dérive</li>');}
/* ---------- Analyse des cycles réels sans dérive ajoutée ---------- */
function scanReal(){const N=RD.rows.length,st=meth()==='stat',lim0=L*Math.sqrt(LAMBDA/(2-LAMBDA)),R={seuil:0,cote:0,ewma:0},per=[];let n=0;
 P.forEach((p,j)=>{let ref=null,e=null,up=0,dn=0,cool=0,c=0;
  for(let i=REFW;i<N;i++){if(SEG[i]!==SEG[i-REFW]){ref=null;e=null;up=dn=cool=0;continue;}
   if(!ref||i%100===0)ref=refP(i,p);const {m,sd}=ref,x=val(i,p);e=e==null?m:LAMBDA*x+(1-LAMBDA)*e;up=x>m+sd?up+1:0;dn=x<m-sd?dn+1:0;if(j===0)n++;
   if(cool>0){cool--;continue;}
   const lo=st?m-3*sd:m-p.tol,hi=st?m+3*sd:m+p.tol;let k=null;
   if(rule('seuil')&&(x>hi||x<lo))k='seuil';else if(rule('cote')&&(up>=7||dn>=7))k='cote';else if(rule('ewma')&&Math.abs(e-m)>lim0*sd)k='ewma';
   if(k){R[k]++;c++;cool=LOOK;}}
  per.push([p.n,c]);});
 const tot=R.seuil+R.cote+R.ewma,f=v=>v.toLocaleString('fr-FR',{maximumFractionDigits:1});
 return `<p class="sl"><b>${n.toLocaleString('fr-FR')} cycles réels analysés</b>, sans aucune dérive ajoutée, avec les règles et la méthode de seuil cochées ci-dessus. Une alerte au plus toutes les ${LOOK} cycles par paramètre.</p>
 <div class="rsk"><div><b>${tot}</b><span>alertes au total</span></div><div><b>${f(tot/n*1000)}</b><span>pour 1 000 cycles</span></div><div><b>${R.seuil}</b><span>${st?'hors bande statistique':'hors tolérance de recette'}</span></div><div><b>${R.cote+R.ewma}</b><span>de tendance</span></div></div>
 <p class="sl">Par paramètre : ${per.map(([a,b])=>`${esc(a)} ${b}`).join(' · ')}.</p>
 <p class="sl note">Sans relevé de la qualité des pièces sur la même période, on ne peut pas dire lesquelles de ces alertes sont fondées et lesquelles sont fausses. Ce taux se qualifie avec le régleur pendant le pilote : alerte utile, alerte sans suite, défaut non vu.</p>`;}
if(RD){const hh=$('hh');if(hh){const sc=document.createElement('section');sc.className='pane rscan';sc.setAttribute('aria-labelledby','rsh');
 sc.innerHTML=`<p class="kick">Alertes sur historique sans dérive ajoutée</p><h2 id="rsh">Cycles réels, sans dérive ajoutée</h2><p class="sl">La démonstration ajoute une dérive pour montrer l’alerte. Ici, on rejoue les mêmes règles sur toutes les mesures réelles, telles quelles, pour voir combien d’alertes elles déclenchent d’elles-mêmes.</p><button type="button" class="btn ghost sm" id="rsgo">Analyser les ${RD.rows.length.toLocaleString('fr-FR')} cycles</button><div id="rsout" aria-live="polite"></div>`;
 hh.before(sc);$('rsgo').onclick=()=>{$('rsout').innerHTML='<p class="sl">Analyse en cours…</p>';setTimeout(()=>{$('rsout').innerHTML=scanReal();$('rsgo').textContent='Relancer avec les règles cochées';},30);};}}
/* ---------- Démarrage ---------- */
fresh();renderHist();srcInfo();
$('play').onclick=()=>{S.running=!S.running;status();};
$('drift').onclick=openModal;
$('mclose').onclick=closeModal;$('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
$('go').onclick=()=>{S.jump=null;if(MODE==='real'){const p=PK[pick.p];if(!calmFor(S.ri,p,LOOK)){const i=findStart(S.ri,[p],LOOK);seekTo(i);S.jump=RD.rows[i][0];}else P.forEach(q=>S.ref[q.id]=refP(S.ri,q));}
 S.drift={p:pick.p,dir:pick.dir,start:S.cycle,fixedAt:null,truth:pickTruth(pick.p,pick.dir)};S.focus=pick.p;S.running=true;closeModal();renderSide();draw();};
document.querySelectorAll('[data-r],input[name=meth]').forEach(x=>x.onchange=()=>draw());
for(let i=0;i<8;i++)tick();renderSide();
let SPEED=1;window.vpSpeed=()=>SPEED;
(function run(){if(S.running){const was=S.cycle<REF_N;tick();if(was&&S.cycle>=REF_N)renderSide();}setTimeout(run,STEP_MS/SPEED);})();
document.querySelectorAll('.speed button').forEach(bt=>bt.onclick=()=>{SPEED=+bt.dataset.v||1;document.querySelectorAll('.speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===bt)));});
})();
