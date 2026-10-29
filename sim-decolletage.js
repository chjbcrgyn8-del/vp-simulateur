/* Simulateur décolleteuse · même parcours que le simulateur presse (sim2.js)
   Je simule une dérive → mesure en hausse ou en baisse → contre-mesure (cotes) → causes classées → actions → vérification → historique.
   Spécificités décolletage, issues des tests de non-transposition du dossier v2.0 :
   - cote hors tolérance : aucune correction d'outil proposée avant contre-mesure (DC01-R01) ;
   - machine sans canon : la branche canon est masquée (DC01-R04) ;
   - donnée CNC non exposée : « donnée absente », jamais zéro (DC04-R04) ;
   - contexte tracé avec chaque alerte : pièce, position dans la barre, compteur d'arête, temps depuis le redémarrage (DC01-R02).
   Signal simulé : aucune donnée réelle de décolleteuse n'est utilisée. */
(function(){'use strict';
const CFG=window.SIM_CFG,P=CFG.params,PK=Object.fromEntries(P.map(p=>[p.id,p])),RU=CFG.rules||{};
const $=id=>document.getElementById(id);
const fmt=(v,d)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DIRL={up:'en hausse',down:'en baisse'};
const STEP_MS=900,REF_N=30,WIN=70,LAMBDA=.2,L=3,CYC_S=45,BAR_N=16,LIFE=2500;
const noise=()=>{let z;do{z=Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());}while(Math.abs(z)>2.4);return z;};
Object.values(CFG.kb).forEach(o=>['up','down'].forEach(d=>(o[d]||[]).forEach(c=>{c.a.forEach(a=>a.h=0);})));
const HIST=[];let S;
const canon=()=>((document.querySelector('input[name=canon]:checked')||{}).value||'avec')==='avec';
const avail=p=>!p.opc||!!(document.querySelector('[data-opc]')||{checked:true}).checked;
const meth=()=>(document.querySelector('input[name=meth]:checked')||{}).value||'recette';
const rule=k=>{const x=document.querySelector(`[data-r=${k}]`);return !x||x.checked;};
function fresh(){S={cycle:0,running:true,hist:{},ew:{},ref:{},focus:P[0].id,drift:null,alert:null,cause:null,dunno:false,newCause:false,newAct:false,tool:1240,restart:-260,cm:null};
 P.forEach(p=>{S.hist[p.id]=[];S.ew[p.id]=[];});}
function band(p){const r=S.ref[p.id];if(meth()==='stat'&&r)return {lo:r.m-3*r.sd,hi:r.m+3*r.sd,c:r.m,sd:r.sd};return {lo:p.c-p.tol,hi:p.c+p.tol,c:r?r.m:p.c,sd:r?r.sd:p.s};}
/* ---------- Forme de la dérive, selon la cause tirée au sort ---------- */
function offset(d,p){const t=S.cycle-d.start,tol=p.tol,sh=(d.truth&&d.truth.shape)||'ramp';let o;
 if(sh==='expo')o=tol*1.5*(1-Math.exp(-t/9));
 else if(sh==='step')o=t<3?0:tol*1.22;
 else if(sh==='bar')o=((t%BAR_N)/(BAR_N-1))*tol*1.3+t*tol*.006;
 else o=Math.min(t*tol*.06,tol*1.7);
 o*=(d.dir==='up'?1:-1);if(d.fixedAt!=null)o*=Math.max(0,1-(S.cycle-d.fixedAt)/5);return o;}
/* ---------- Pièce ---------- */
function tick(){S.cycle++;S.tool++;const d=S.drift;
 P.forEach(p=>{const off=d&&d.p===p.id?offset(d,p):0;let x=p.c+off+noise()*p.s;if(p.dirs&&p.dirs.length===1&&p.dirs[0]==='up')x=Math.max(p.c-p.tol*.9,x);
  S.hist[p.id].push(x);const prev=S.ew[p.id].at(-1);S.ew[p.id].push(prev==null?x:LAMBDA*x+(1-LAMBDA)*prev);
  if(S.hist[p.id].length>400){S.hist[p.id].shift();S.ew[p.id].shift();}});
 if(S.cycle===REF_N)P.forEach(p=>{const a=S.hist[p.id].slice(-REF_N),m=a.reduce((x,y)=>x+y,0)/a.length,sd=Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));S.ref[p.id]={m,sd:Math.max(sd,.9*p.s)};});
 if(S.verify){if(S.cycle-S.verify.at<=6)renderSide();}
 else if(d&&d.fixedAt!=null&&S.cycle-d.fixedAt>6){S.drift=null;renderSide();}
 if(S.cycle>REF_N&&d&&d.fixedAt==null&&!S.alert&&!S.verify&&avail(PK[d.p]))detect(d);
 draw();}
function detect(d){const p=PK[d.p],h=S.hist[p.id],b=band(p),x=h.at(-1),e=S.ew[p.id].at(-1),r=S.ref[p.id];let why=null;
 if(rule('seuil')&&(x>b.hi||x<b.lo))why=meth()==='stat'?'Seuil statistique franchi (moyenne ± 3 σ)':(p.dim?'Tolérance plan franchie':'Plage de réglage franchie');
 else if(rule('cote')&&h.length>=7&&S.cycle-d.start>=7&&(h.slice(-7).every(v=>v>b.c+b.sd)||h.slice(-7).every(v=>v<b.c-b.sd)))why='Alerte préventive : 7 pièces du même côté de la référence';
 else if(rule('ewma')&&r){const lim=L*r.sd*Math.sqrt(LAMBDA/(2-LAMBDA));if(Math.abs(e-r.m)>lim)why='Alerte préventive : la tendance lissée sort de sa zone';}
 if(why){S.failed=false;S.cm=null;S.alert={p:p.id,dir:d.dir,why,cycle:S.cycle,at:new Date(),ctx:ctx()};S.focus=p.id;renderSide();}}
function ctx(){const mn=Math.round((S.cycle-S.restart)*CYC_S/60);return {piece:S.cycle,bar:((S.cycle-1)%BAR_N)+1,tool:S.tool,since:mn<90?mn+' min':Math.floor(mn/60)+' h '+String(mn%60).padStart(2,'0')};}
/* ---------- Classement ---------- */
function mult(x){const a=S.alert;if(!a||!PK[a.p].dim||!S.cm)return 1;if(S.cm.res==='nc')return x.meas?4:.5;return x.meas?.15:1;}
const w=x=>x.n*mult(x);
function ranked(list){const tot=list.reduce((s,x)=>s+w(x),0)||1;return list.map(x=>({x,pc:Math.max(1,Math.round(100*w(x)/tot))})).sort((a,b)=>w(b.x)-w(a.x));}
const causesOf=(p,dir)=>((CFG.kb[p]&&CFG.kb[p][dir])||[]).filter(c=>canon()||!c.canon);
const hiddenOf=(p,dir)=>canon()?0:((CFG.kb[p]&&CFG.kb[p][dir])||[]).filter(c=>c.canon).length;
const checksOf=(p,dir)=>(CFG.checks[p+'_'+dir]||(PK[p].dim?CFG.checks._dim:CFG.checks._all)).filter(t=>canon()||!/canon/i.test(t));
function srcTxt(x){return x.n?`poids illustratif ${x.n}, non calibré`:'ajout de démonstration, non validé';}
const rtag=r=>r&&RU[r]?`<span class="rtag" title="${esc(RU[r].t)} · sources ${esc(RU[r].s.join(', '))}">${esc(r)}</span>`:'';
/* ---------- Affichage ---------- */
function tiles(){$('tiles').innerHTML=P.map(p=>{if(!avail(p))return `<button type="button" class="tile absent" disabled aria-disabled="true"><span class="tn"><i class="sd"></i>${p.n}</span><span class="tv na">Donnée absente</span><small class="nas">Non exposée par la CNC : ni zéro, ni conforme</small></button>`;
 const x=S.hist[p.id].at(-1),b=band(p);
 const st=x==null?'':(x>b.hi||x<b.lo)?'bad':(S.alert&&S.alert.p===p.id)?'warn':'';
 const v=S.ew[p.id].slice(-30);let sp='';if(v.length>1){const lo=Math.min(b.lo,...v),hi=Math.max(b.hi,...v);sp=`<svg class="spk" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="${v.map((y,i)=>(i?'L':'M')+(i*100/29).toFixed(1)+' '+(22-20*(y-lo)/(hi-lo||1)).toFixed(1)).join('')}"/></svg>`;}
 return `<button type="button" class="tile ${st}${S.focus===p.id?' sel':''}" data-f="${p.id}" aria-pressed="${S.focus===p.id}"><span class="tn"><i class="sd"></i>${p.n}</span><span class="tv">${x==null?'–':fmt(x,p.dec)} <small>${p.u}</small></span>${sp}</button>`;}).join('');
 $('tiles').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.focus=b.dataset.f;draw();});}
function chart(){if(!avail(PK[S.focus]))S.focus=P[0].id;const p=PK[S.focus],h=S.hist[p.id],e=S.ew[p.id],n=h.length,from=Math.max(0,n-WIN),v=h.slice(from),ev=e.slice(from),b=band(p);
 $('ctitle').textContent=p.n+' ('+p.u+')';
 const W=720,H=300,pl=60,pr=12,pt=14,pb=26;const lo0=Math.min(b.lo,...v),hi0=Math.max(b.hi,...v),pad=(hi0-lo0)*.15||1,lo=lo0-pad,hi=hi0+pad;
 const X=i=>pl+(W-pl-pr)*i/(WIN-1),Y=y=>pt+(H-pt-pb)*(1-(y-lo)/(hi-lo));
 const line=a=>a.map((y,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(y).toFixed(1)).join('');
 let g=`<rect x="${pl}" y="${Y(b.hi)}" width="${W-pl-pr}" height="${Y(b.lo)-Y(b.hi)}" class="zone"/>`;
 [b.hi,b.lo].forEach(y=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(y)}" y2="${Y(y)}" class="tol"/><text x="${pl-6}" y="${Y(y)+4}" class="ax">${fmt(y,p.dec)}</text>`);
 g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(b.c)}" y2="${Y(b.c)}" class="ref"/><text x="${pl-6}" y="${Y(b.c)+4}" class="ax">${fmt(b.c,p.dec)}</text>`;
 const bandName=meth()==='stat'?'limite statistique':(p.dim?'tolérance plan':'plage de réglage');
 const legend=document.querySelector('.l-tol');if(legend&&legend.parentElement)legend.parentElement.innerHTML='<i class="l-tol"></i>'+(meth()==='stat'?'Bande statistique':'Tolérance plan ou plage');
 g+=`<text x="${W-pr-4}" y="${Y(b.hi)-5}" class="tl">${bandName} haute</text><text x="${W-pr-4}" y="${Y(b.lo)+14}" class="tl">${bandName} basse</text>`;
 if(v.length>1){const k=ev.length-1;g+=`<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--orange)" stop-opacity=".22"/><stop offset="1" stop-color="var(--orange)" stop-opacity="0"/></linearGradient></defs><path d="${line(ev)}L${X(k)} ${Y(lo)}L${X(0)} ${Y(lo)}Z" fill="url(#ga)"/><path d="${line(v)}" class="raw"/><path d="${line(ev)}" class="ew"/><circle cx="${X(k)}" cy="${Y(ev[k])}" r="9" class="halo"/><circle cx="${X(k)}" cy="${Y(ev[k])}" r="4.5" class="head"/>`;}
 if(S.alert&&S.alert.p===p.id){const i=S.alert.cycle-1-(S.cycle-n)-from;if(i>=0&&i<v.length)g+=`<circle cx="${X(i)}" cy="${Y(v[i])}" r="6" class="dot"/>`;}
 $('chart').innerHTML=g;
 $('csub').textContent=S.cycle<REF_N?`Calcul de la référence : pièce ${S.cycle} sur ${REF_N}`:(p.dim?'Chaque point est une pièce mesurée en post-process (signal simulé).':'Chaque point est la valeur relevée pour une pièce (signal simulé).');}
function status(){const st=$('status');let c='ok',t='Usinage stable';
 if(S.cycle<REF_N){c='';t='Calcul de la référence en cours';}
 if(S.alert){c='warn';t=`Dérive détectée · ${PK[S.alert.p].sn} ${DIRL[S.alert.dir]}`;}
 if(S.drift&&S.drift.fixedAt!=null){c='ok';t=S.verify?'Action simulée : vérification en cours':'Action simulée : retour dans la bande';}
 st.className='status '+c;const tl=$('tlight');if(tl)tl.dataset.s=c||'off';st.querySelector('span').textContent=t;$('cycle').textContent=S.cycle.toLocaleString('fr-FR');
 const tc=$('toolc');if(tc){tc.textContent=S.tool.toLocaleString('fr-FR');tc.parentElement.classList.toggle('late',S.tool>LIFE*.9);}
 $('play').textContent=S.running?'Pause':'Reprendre';$('drift').disabled=S.cycle<REF_N||!!S.drift;
 const fs=document.querySelectorAll('.cfgfs');fs.forEach(f=>f.disabled=!!(S.drift||S.alert||S.verify));}
function draw(){status();tiles();chart();}
function shapeNote(){return `<details class="shape"><summary>Lire la forme de la courbe</summary><ul><li><b>Progressive</b> : usure d’arête probable</li><li><b>Palier brutal</b> : ébréchure, offset, changement de lot</li><li><b>Qui se stabilise</b> : croissance thermique</li><li><b>En dents de scie</b> : position dans la barre, canon ou pince</li></ul><p class="sl">Un indice pour orienter les contrôles, jamais une preuve (DC04-R01).</p></details>`;}
function ctxPane(c){return `<div class="ctx" aria-label="Contexte tracé avec la mesure"><p class="kick">Contexte tracé avec la mesure ${rtag('DC01-R02')}</p><dl><div><dt>Pièce</dt><dd>n° ${c.piece.toLocaleString('fr-FR')}</dd></div><div><dt>Position dans la barre</dt><dd>${c.bar} / ${BAR_N}</dd></div><div><dt>Arête T03</dt><dd>${c.tool.toLocaleString('fr-FR')} pcs <small>repère ${LIFE.toLocaleString('fr-FR')}</small></dd></div><div><dt>Depuis le redémarrage</dt><dd>${c.since}</dd></div></dl><p class="sl">Indices, pas preuves : un compteur élevé ne démontre pas l’usure.</p></div>`;}
function cmPane(a){const p=PK[a.p];
 if(!S.cm)return `<div class="pane cmgate"><p class="vpx">VP Expert · avant toute correction d’outil</p><h4>Contre-mesure obligatoire ${rtag('DC01-R01')}</h4><p class="sl">Une cote hors tolérance peut venir du moyen de mesure. Aucun offset ni changement d’arête n’est proposé avant de remesurer sur le moyen de référence.</p><button type="button" class="btn primary sm" id="cmgo">Contre-mesurer 3 pièces sur le moyen de référence</button></div>`;
 const v=S.cm.v.map(x=>fmt(x,p.dec)).join(' · ');
 return S.cm.res==='nc'?`<div class="pane cmgate nc"><p class="kick">Contre-mesure faite ${rtag('DC01-R01')}</p><h4>Écart non confirmé sur le moyen de référence</h4><p class="sl">${v} ${p.u}. Le capteur post-process et le moyen d’atelier deviennent la première piste ; aucune correction d’outil tant que le moyen n’est pas fiable.</p></div>`
 :`<div class="pane cmgate ok"><p class="kick">Contre-mesure faite ${rtag('DC01-R01')}</p><h4>Écart confirmé sur le moyen de référence</h4><p class="sl">${v} ${p.u}. Le moyen de mesure devient une piste moins probable ; les causes outil, thermique et barre restent à départager.</p></div>`;}
function renderSide(){const el=$('side');const a=S.alert;
 if(S.verify){el.innerHTML=verifyPane();bindVerify();return;}
 if(!a){el.innerHTML=S.cycle<REF_N?`<div class="pane"><h3>La machine démarre</h3><p class="sl">Le simulateur calcule la référence de chaque mesure sur les ${REF_N} premières pièces.</p></div>`:
  S.drift&&S.drift.fixedAt==null?`<div class="pane"><h3>Dérive en cours</h3><p class="sl">${esc(PK[S.drift.p].sn)} ${DIRL[S.drift.dir]}. La simulation surveille les règles sélectionnées ; aucune avance de détection réelle n’est garantie.</p>${shapeNote()}</div>`:
  `<div class="pane"><h3>Usinage stable</h3><p class="sl">Le tour produit une pièce toutes les ${CYC_S} s. Cliquez sur « Je simule une dérive », choisissez une mesure et son sens : la cause est tirée au sort, pas forcément la première de la liste.</p><button type="button" class="btn primary" id="drift2">Je simule une dérive</button></div>`;
  const d2=$('drift2');if(d2)d2.onclick=openModal;return;}
 const p=PK[a.p],list=causesOf(a.p,a.dir),out=/franchie|franchi/.test(a.why)&&!/préventive/.test(a.why),stat=/statistique/.test(a.why),outL=stat?'Limite statistique franchie':(p.dim?'Hors tolérance plan':'Hors plage de réglage');const hm=a.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 const gate=p.dim&&!S.cm;
 let h=`<div class="phone2${S.seen===a?' nz':''}" aria-label="Notification reçue par le régleur"><div class="pt"><span>VP Predict</span><span>${hm}</span></div><div class="pn"><b>${esc(CFG.press)} · ${esc(p.sn)} ${DIRL[a.dir]}</b><span>${out?outL:'Alerte préventive · encore dans la tolérance'} · ${list.length} pistes à contrôler</span></div>${S.taken?`<p class="pok">Pris en charge par le régleur</p>`:`<button type="button" id="take">Je prends en charge</button><p class="pesc">Sans réponse sous 5 min : chef d’équipe prévenu (simulé dans la démonstration)</p>`}</div>`;
 S.seen=a;
 h+=`<div class="pane alertp${out?' hors':''}"><p class="vpx vpp">VP Predict · repère la dérive</p><p class="kick">${out?outL:'Alerte préventive'} · pièce ${a.cycle.toLocaleString('fr-FR')} · ${hm}</p><h3>${esc(p.sn)} ${DIRL[a.dir]}</h3><p class="sl">${out?(stat?'La valeur est sortie de la zone moyenne ± 3 σ de la référence : ce n’est pas une tolérance plan, mais un signal fort.':(p.dim?'La cote mesurée est sortie de la tolérance plan : isoler les pièces depuis l’alerte, puis contre-mesurer.':'La valeur est sortie de sa plage de réglage : contrôler et agir.')):esc(a.why)+'. La valeur reste dans sa bande.'+' Ce signal ne démontre ni un défaut pièce ni une avance de détection réelle.'}</p>${ctxPane(a.ctx)}</div>`;
 if(p.dim&&!S.cause)h+=cmPane(a);
 if(!S.cause){const hid=hiddenOf(a.p,a.dir);
  h+=`<div class="pane${gate?' locked':''}"><p class="vpx">VP Expert · guide les contrôles <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="VP Expert classe les causes et les actions à partir de poids de démonstration, sans apprentissage de votre historique. Il fonctionne aussi sur les machines non connectées : le régleur saisit la cote qui bouge."></span></button></p><h4>Causes à contrôler, par priorité <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="Score de pertinence sur 100, et non une probabilité : classement issu de poids illustratifs, non calibré, ajusté par la contre-mesure. Les clics de démonstration ne modifient pas les poids."></span></button></h4>${gate?'<p class="lockt sl">Verrouillé jusqu’à la contre-mesure.</p>':''}<ol class="rank">`+
   ranked(list).map(({x,pc})=>`<li><button type="button" class="rk" data-c="${list.indexOf(x)}"${gate?' disabled':''}><span class="rl">${esc(x.l)} ${rtag(x.r)}</span><span class="bar"><i style="width:${pc}%"></i></span><span class="pc">${pc}<small class="pt"> pts</small></span><small>${srcTxt(x)}${S.cm&&x.meas?(S.cm.res==='nc'?' · remonté par la contre-mesure':' · moins probable après contre-mesure'):''}</small></button></li>`).join('')+`</ol>`+
   (hid?`<p class="sl hidnote">${hid} piste${hid>1?'s':''} canon masquée${hid>1?'s':''} : machine configurée sans canon ${rtag('DC01-R04')}.</p>`:'')+
   (gate?'':`<div class="alt"><button type="button" class="btn ghost sm" id="dunno" aria-expanded="${S.dunno}">Je ne sais pas</button><button type="button" class="btn ghost sm" id="newc" aria-expanded="${S.newCause}">Nouvelle cause</button></div>`);
  if(S.dunno&&!gate)h+=`<div class="chk"><p><b>Vérifications suggérées</b>, dans l’ordre :</p><ol>${checksOf(a.p,a.dir).map(t=>`<li>${esc(t)}</li>`).join('')}</ol><p class="sl">Choisissez une hypothèse pour explorer le scénario, sans la considérer comme démontrée.</p></div>`;
  if(S.newCause)h+=`<form class="newf" id="fc"><label>Nouvelle cause<input id="ic" required maxlength="120" placeholder="ex. Plaquette d’une autre nuance montée"></label><button class="btn primary sm">Valider</button></form>`;
  if(!gate)h+=shapeNote();
  h+='</div>';
 }else{const c=S.cause;
  h+=`<div class="pane"><p class="vpx">VP Expert · guide les contrôles</p><p class="kick">Hypothèse du scénario <button type="button" class="lnk" id="back">changer</button></p><h4 class="cr">${esc(c.l)} ${rtag(c.r)}</h4>${ncl(c.r,'nc')}${S.failed?'<p class="emsgf">Action sans effet, non enregistrée : revenez au réglage d’origine, puis essayez une autre action ou changez de cause.</p>':''}<h4>Actions du scénario, non approuvées en atelier <button type="button" class="tip" data-g aria-label="Explication"><span class="tipbox" role="tooltip" data-t="Score de pertinence sur 100, et non une probabilité. Une seule action à la fois, avec retour au réglage d’origine si elle échoue. Aucune valeur d’offset, d’avance ou de vitesse n’est proposée : elles dépendent de la machine, de la matière et de la notice du site."></span></button></h4>`;
  if(c.a.length)h+=`<ol class="rank">`+ranked(c.a).map(({x,pc})=>`<li><button type="button" class="rk act" data-a="${c.a.indexOf(x)}"><span class="rl">${esc(x.l)}</span><span class="bar"><i style="width:${pc}%"></i></span><span class="pc">${pc}<small class="pt"> pts</small></span><small>${srcTxt(x)}${x.reset?' · remet le compteur d’arête à zéro':''}</small></button></li>`).join('')+`</ol>`;
  else h+=`<p class="sl">Aucune action en mémoire pour cette cause : décrivez la vôtre.</p>`;
  h+=c.a.length&&!S.newAct?`<div class="alt"><button type="button" class="btn ghost sm" id="newa">Nouvelle action</button></div>`:`<form class="newf" id="fa"><label>Nouvelle action<input id="ia" required maxlength="140" placeholder="ex. Remonter la plaquette de la fiche outil"></label><button class="btn primary sm">Simuler</button></form>`;
  h+='</div>';}
 el.innerHTML=h;bind();}
function bind(){const el=$('side'),q=s=>el.querySelector(s),a=S.alert;
 el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.failed=false;S.cause=causesOf(a.p,a.dir)[+b.dataset.c];S.newAct=false;renderSide();});
 el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>apply(S.cause.a[+b.dataset.a]));
 if(q('#cmgo'))q('#cmgo').onclick=()=>{const p=PK[a.p],t=S.drift&&S.drift.truth,meas=!!(t&&t.meas),last=S.hist[p.id].at(-1);
  S.cm={res:meas?'nc':'ok',v:[0,1,2].map(()=>meas?p.c+noise()*p.s*.8:last+noise()*p.s*.6)};renderSide();};
 if(q('#dunno'))q('#dunno').onclick=()=>{S.dunno=!S.dunno;renderSide();};
 if(q('#newc'))q('#newc').onclick=()=>{S.newCause=!S.newCause;renderSide();setTimeout(()=>q('#ic')&&q('#ic').focus(),0);};
 if(q('#newa'))q('#newa').onclick=()=>{S.newAct=true;renderSide();setTimeout(()=>q('#ia')&&q('#ia').focus(),0);};
 if(q('#take'))q('#take').onclick=()=>{S.taken=true;renderSide();};
 if(q('#back'))q('#back').onclick=()=>{S.failed=false;S.cause=null;renderSide();};
 if(q('#fc'))q('#fc').onsubmit=e=>{e.preventDefault();const t=q('#ic').value.trim();if(!t)return;const c={l:t,n:0,a:[],nouv:true};CFG.kb[a.p][a.dir].push(c);S.cause=c;S.newCause=false;S.newAct=true;renderSide();};
 if(q('#fa'))q('#fa').onsubmit=e=>{e.preventDefault();const t=q('#ia').value.trim();if(!t)return;const x={l:t,n:0};S.cause.a.push(x);apply(x);};}
/* La dérive simulée a une cause tirée au sort parmi les causes visibles (pondérée, pas forcément la première). */
function pickTruth(p,dir){const l=causesOf(p,dir);if(!l.length)return null;const tot=l.reduce((s,x)=>s+x.n+1,0);let r=Math.random()*tot;for(const x of l){r-=x.n+1;if(r<=0)return x;}return l.at(-1);}
function effective(c){const t=S.drift&&S.drift.truth;return !t||c===t||!!c.nouv;}
function apply(act){const a=S.alert,c=S.cause;
 S.verify={a,c,act,at:S.cycle,ok:effective(c)};if(act.reset)S.tool=0;
 if(S.verify.ok)S.drift.fixedAt=S.cycle;S.alert=null;S.cause=null;S.taken=false;S.dunno=false;S.newAct=false;S.running=true;
 renderSide();draw();}
function ncl(r,mode){const u=RU[r];if(!u||!u.nc)return '';const o=`<span class="ncl-o">${esc(u.o||'')}</span>`;
 return mode==='nc'?`<p class="ncl nc"><b>À ne pas conclure</b> ${rtag(r)} ${esc(u.nc)} ${o}</p>`
  :`<div class="ncl"><p class="nc"><b>À ne pas conclure</b> ${rtag(r)} ${esc(u.nc)}</p><p class="cl"><b>Clôture attendue</b> ${esc(u.cl)} ${o}</p></div>`;}
function verifyPane(){const v=S.verify,n=S.cycle-v.at,ready=n>=6;
 return `<div class="pane vrf"><p class="kick">Vérification simulée</p><h3>Action simulée : ${esc(v.act.l)}</h3><p class="sl">Le scénario calcule un retour simulé. Aucune pièce réelle n’est contrôlée ici ; les réglages ne sont pas transférables à une machine sans validation.</p>${CFG.verif&&CFG.verif[v.a.p]?`<p class="sl"><b>Sur site, la vérification du retour se fait</b> ${esc(CFG.verif[v.a.p])} <span class="rtag">DC01-R05</span></p>`:''}${ncl(v.c.r)}${v.c.r!=='DC01-R05'?ncl('DC01-R05'):''}${ready?`<p class="q"><b>La mesure simulée est-elle revenue dans sa zone ? La conformité réelle des pièces reste à vérifier sur site.</b></p>${v.ok?'':'<p class="sl">Lisez la courbe : la mesure continue de s’écarter. Une action qui ne touche pas la vraie cause ne corrige rien.</p>'}${S.badOk?'<p class="emsgf">La mesure n’est pas revenue dans sa zone : l’action ne peut pas être déclarée efficace. Choisissez « Non, pas d’effet », revenez au réglage d’origine, puis changez de cause.</p>':''}<div class="alt"><button type="button" class="btn primary sm" id="vok">Enregistrer le résultat simulé</button><button type="button" class="btn ghost sm" id="vko">Non, pas d’effet</button></div>`:`<p class="sl wait">Observation des pièces suivantes : ${n} / 6</p>`}</div>`;}
function bindVerify(){const q=s=>$('side').querySelector(s);
 if(q('#vok'))q('#vok').onclick=()=>{if(!S.verify.ok){S.badOk=true;renderSide();return;}S.badOk=false;const {a,c,act}=S.verify;
  HIST.unshift({at:new Date(),p:PK[a.p].sn,dir:DIRL[a.dir],c:c.l,a:act.l,r:c.r||'—',cm:PK[a.p].dim});S.verify=null;S.drift=null;S.cm=null;renderHist();
  $('side').innerHTML=`<div class="pane done"><h3>Résultat simulé enregistré</h3><p class="sl">Ce résultat illustre le parcours de vérification. Il ne prouve ni une cause réelle ni l’efficacité industrielle de l’action, et ne modifie pas le classement.</p></div>`;};
 if(q('#vko'))q('#vko').onclick=()=>{const {a,c}=S.verify;S.badOk=false;S.verify=null;S.drift.fixedAt=null;S.alert=a;S.cause=c;S.failed=true;renderSide();};}
function renderHist(){const t=$('hist');if(!HIST.length){t.innerHTML=`<tr><td colspan="6" class="empty">Aucune dérive traitée pour l’instant. Chaque dérive traitée s’ajoute ici.</td></tr>`;return;}
 t.innerHTML=HIST.map((r,i)=>`<tr${i===0?' class="new"':''}><td>${r.at.toLocaleDateString('fr-FR')}</td><td>${r.at.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</td><td><b>${esc(r.p)}</b> ${r.dir}${r.cm?' <small>· contre-mesure faite</small>':''}</td><td>${esc(r.c)}</td><td>${esc(r.a)}</td><td>${esc(r.r)}</td></tr>`).join('');}
/* ---------- Fenêtre « Je simule une dérive » ---------- */
let pick={p:null,dir:null};
function openModal(){pick={p:null,dir:null};const m=$('modal');
 m.querySelector('.mp').innerHTML=P.filter(avail).map(p=>`<button type="button" class="choice" data-mp="${p.id}">${p.sn}</button>`).join('');
 m.querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>{pick.p=b.dataset.mp;m.querySelectorAll('[data-mp]').forEach(x=>x.setAttribute('aria-pressed',x===b));const ds=PK[pick.p].dirs||['up','down'];
  m.querySelectorAll('[data-md]').forEach(x=>{const okd=ds.includes(x.dataset.md);x.disabled=!okd;if(!okd&&pick.dir===x.dataset.md){pick.dir=null;x.setAttribute('aria-pressed','false');}});$('mdn').textContent=ds.length===1?'Une rugosité qui baisse n’est pas un défaut : seule la hausse est proposée.':'';ok();});
 m.querySelectorAll('[data-md]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed','false');b.onclick=()=>{pick.dir=b.dataset.md;m.querySelectorAll('[data-md]').forEach(x=>x.setAttribute('aria-pressed',x===b));ok();};});
 $('mdn').textContent='';ok();m.hidden=false;m.querySelector('[data-mp]').focus();}
function ok(){$('go').disabled=!(pick.p&&pick.dir);}
function closeModal(){$('modal').hidden=true;}
/* ---------- Démarrage ---------- */
fresh();renderHist();
$('play').onclick=()=>{S.running=!S.running;status();};
$('drift').onclick=openModal;
$('mclose').onclick=closeModal;$('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
$('go').onclick=()=>{const truth=pickTruth(pick.p,pick.dir);
 /* Contexte cohérent avec la cause tirée au sort : un indice, pas la réponse */
 if(truth){if(truth.shape==='expo'&&/arrêt|redémarrage/i.test(truth.l))S.restart=S.cycle-6;else S.restart=S.cycle-240-Math.round(Math.random()*120);
  if(/^Usure/.test(truth.l))S.tool=2200+Math.round(Math.random()*250);else if(/changement d’arête/.test(truth.l))S.tool=8+Math.round(Math.random()*10);else S.tool=500+Math.round(Math.random()*900);}
 S.drift={p:pick.p,dir:pick.dir,start:S.cycle,fixedAt:null,truth};S.focus=pick.p;S.running=true;closeModal();renderSide();draw();};
document.querySelectorAll('[data-r],input[name=meth]').forEach(x=>x.onchange=()=>draw());
document.querySelectorAll('input[name=canon],[data-opc]').forEach(x=>x.onchange=()=>{draw();renderSide();});
for(let i=0;i<8;i++)tick();renderSide();
let SPEED=1;
(function run(){if(S.running){const was=S.cycle<REF_N;tick();if(was&&S.cycle>=REF_N)renderSide();}setTimeout(run,STEP_MS/SPEED);})();
document.querySelectorAll('.speed button').forEach(bt=>bt.onclick=()=>{SPEED=+bt.dataset.v||1;document.querySelectorAll('.speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===bt)));});
})();
