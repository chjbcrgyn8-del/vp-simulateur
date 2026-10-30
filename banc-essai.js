/* Banc d'essai données réelles · Vella Partners
   Deux modes strictement séparés :
   - « Relecture brute » : valeurs d'origine, aucune modification ;
   - « Dérive injectée » : copie des données avec une dérive artificielle, signalée partout.
   Les changements de consigne sont séparés avant le calcul des seuils. Tout est calculé dans le navigateur. */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(v,d)=>v==null||!isFinite(v)?'–':(Math.abs(v)>=1e5?Math.round(v).toLocaleString('fr-FR'):v.toLocaleString('fr-FR',{maximumFractionDigits:d==null?(Math.abs(v)<1?3:Math.abs(v)<100?2:1):d}));
const U=(n)=>S.ds&&S.ds.id==='vicomtech'?(n>1?'segments':'segment'):S.ds&&S.ds.id==='cipdmd'?(n>1?'tiges':'tige'):S.ds&&S.ds.id==='import'?(n>1?'lignes':'ligne'):(n>1?'cycles':'cycle');
const pl=(n,a,b)=>n+' '+(n>1?b:a);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const B=window.VP_BANC||{};

/* ---------- Jeux de données ---------- */
const DS={};
if(window.VELLA_CYCLES&&window.VELLA_CYCLES.rows){
 const C=window.VELLA_CYCLES,types=['meta','set','meas','set','meas','meas','set','meas','set','meas'];
 DS.caoutchouc={id:'caoutchouc',court:'Caoutchouc · 13 527 cycles',titre:'Presse caoutchouc · cycles transmis par l’expert partenaire',
  cols:C.headers.map((h,i)=>({k:h,l:h,u:C.units[i]==='unité'?'':C.units[i],t:types[i]})),rows:C.rows,chrono:true,
  seg:'consigne',defVar:5,tol:1e-9,
  src:'Fichier transmis par l’expert plasturgie partenaire (Exemple-cycles-injection-caoutchouc.xlsx, feuille 2). Usage : démonstration Vella Partners.',
  usage:'Troisième banc d’essai : surveillance cycle à cycle sur une longue série réelle. Les consignes changent plusieurs fois : elles sont séparées avant le calcul des seuils.',
  limite:'Une seule presse, une seule série. Les causes réelles des variations ne sont pas documentées : un signal sur la relecture brute est à qualifier, pas une fausse alerte prouvée.'};
}
if(B.loki){
 const L=B.loki;
 DS.loki={id:'loki',court:'Injection · SKZ LoKI, 68 cycles',titre:L.titre,cols:L.cols,rows:L.rows,chrono:true,seg:'colonne',segCol:1,defVar:6,ref:20,
  src:'SKZ (German Plastics Center), projet LoKI. <a href="https://b2share.eudat.eu/records/fkk68-zyf30" target="_blank" rel="noopener">Jeu de données B2SHARE</a>, licence <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Sélection de 18 colonnes, fusion de deux fichiers, temps convertis de ms en s.',
  usage:'Test d’import : unités, données manquantes, affichage cycle par cycle, puis influence des réglages. 17 réglages × 4 répétitions.',
  limite:'Essais planifiés, pas une production : 4 cycles par réglage ne suffisent pas à calculer un seuil de surveillance. Ce jeu ne teste pas la détection de dérive.',
  note:'Contrôle d’unités : la description du jeu annonce des temps en secondes, les valeurs EUROMAP 77 sont en millisecondes (41 920 pour un cycle de 41,92 s dans la table qualité de la machine). Conversion appliquée et tracée.'};
}
if(B.vicomtech){
 const V=B.vicomtech;
 DS.vicomtech={id:'vicomtech',court:'Tournage · Vicomtech, 2 054 segments',titre:V.titre,cols:V.cols,rows:V.rows,chrono:true,seg:'colonne',segCol:0,defVar:3,qual:12,ref:20,tol:0.05,
  src:'Vicomtech, <a href="https://github.com/Vicomtech/dataset-machine-tool-wear" target="_blank" rel="noopener">dataset-machine-tool-wear</a> (données brutes : Mondragon Unibertsitatea), licence <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. Sélection de 13 colonnes sur 154.',
  usage:'Diagnostic d’usure outil : évolution des signaux face à l’usure mesurée VB, outil par outil.',
  limite:'Tournage CNC conventionnel, segments d’une seconde : un segment n’est pas une pièce. Les conditions de coupe programmées changent aussi au cours de la vie d’un outil. Transfert aux décolleteuses à valider sur machine.'};
}
DS.iguzzini={id:'iguzzini',court:'Injection · iGuzzini, 1 451 pièces',titre:'iGuzzini · Engel E-MAC 310/100, lentilles routières',cols:null,rows:null,chrono:false,seg:'aucune',defVar:10,qual:13,remote:'https://raw.githubusercontent.com/airtlab/machine-learning-for-quality-prediction-in-plastic-injection-molding/master/dataset/data.csv',
 src:'Polenta et al., Information 2022, 13, 272. <a href="https://github.com/airtlab/machine-learning-for-quality-prediction-in-plastic-injection-molding" target="_blank" rel="noopener">Dépôt d’origine</a>, diffusé « pour la recherche et l’enseignement ». Chargé depuis ce dépôt à la demande, non recopié sur ce site.',
 usage:'Analyse qualité : 13 paramètres process face à 4 classes qualité mesurées (uniformité photométrique U0).',
 limite:'Les lignes sont triées par classe qualité (370 rebuts, puis 406 acceptables, 310 cibles, 365 inefficaces), pas par ordre de production, et aucune date n’est fournie : la relecture chronologique et la dérive injectée sont désactivées.',
 note:'Contrôle des effectifs : la description du dépôt annonce 360 pièces « inefficaces », le fichier en contient 365 (total 1 451 cohérent). Écart signalé, données non corrigées.',
 classes:{1:'Rebut (U0 < 0,4)',2:'Acceptable',3:'Cible',4:'Inefficace (U0 > 0,5)'}};
const KS={kassel1:{court:'Injection · Kassel boîtier',piece:'boîtier'},kassel3:{court:'Injection · Kassel bac',piece:'bac empilable'}};
Object.keys(KS).forEach(id=>{const K=B[id];if(!K)return;
 DS[id]={id,court:KS[id].court,titre:K.titre,cols:K.cols,rows:K.rows,chrono:true,seg:'colonne',segCol:1,defVar:2,ref:20,poids:2,cote:3,
  src:'Bogedale, Doerfel, Schrodt, Heim, université de Kassel, <a href="https://doi.org/10.3390/polym15040978" target="_blank" rel="noopener">Polymers 2023, 15, 978</a>. <a href="https://github.com/sc4t1m/scatimdata" target="_blank" rel="noopener">Jeu de données scatimdata</a>, licence <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Sélection de '+K.cols.length+' colonnes ; '+K.removed+' cycles de redémarrage (temps de cycle nul) retirés ; phases ajoutées par Vella Partners.',
  usage:'Surveillance cycle à cycle face à la vraie qualité pièce : poids (balance 2 mg) et cote (projecteur de mesure) relevés sur chaque '+KS[id].piece+'. Les perturbations voulues du plan d’essai (température fourreau, vitesse d’injection, pauses) sont séparées en '+K.phases+' phases avant le calcul des seuils.',
  limite:'Essais pilotés sur quelques jours, pas une production libre. Pas d’horodatage, seulement le compteur de cycles. Les phases sont détectées sur les valeurs mesurées (redémarrages, températures, temps d’injection) : les changements de pression de maintien et de température moule du plan publié n’y apparaissent pas et ressortent donc comme des signaux.',
  note:'Contrôle d’alignement : la numérotation du plan d’essai publié s’écarte du compteur machine d’environ 17 cycles à partir du jour 3. Le plan n’a donc pas servi au découpage ; '+K.trans+' phases de transition (moins de 10 cycles) restent non évaluées.'}});
if(B.cipdmd){const P=B.cipdmd;
 DS.cipdmd={id:'cipdmd',court:'Tournage · CiP-DMD tiges',titre:P.titre,cols:P.cols,rows:P.rows,chrono:true,seg:'colonne',segCol:3,defVar:5,ref:20,tolerances:P.tolerances,
  src:'TU Darmstadt, PTW, <a href="https://zenodo.org/records/8420132" target="_blank" rel="noopener">CiP-DMD (Procedia CIRP 2023)</a>, article sous licence CC BY 4.0. <a href="https://cloud.ptw-darmstadt.de/index.php/s/5Wv34VRZEXBLsZK" target="_blank" rel="noopener">Données d’origine</a> : licence non précisée par le dépôt, reprises ici avec citation. Mesures qualité des tiges, tri chronologique, périodes ajoutées à partir du journal de production.',
  usage:'Suivi des cotes pièce par pièce en décolletage, face aux tolérances et aux changements d’outils datés du journal de production : chaque changement ouvre une nouvelle référence.',
  limite:'Usine-école (learning factory), 8 journées de production, aucune anomalie provoquée sur le tour. Une tige sur quatre seulement change de programme d’usinage selon sa position dans la barre. Les signaux commande (courants, charges) ne sont pas repris : leur corrélation avec les cotes reste faible (|r| ≤ 0,27).',
  note:'Contrôle d’import : 673 tiges mesurées, dont 607 rattachées à un horodatage ; 66 mesures sans fichier process ne peuvent pas être placées dans le temps et sont écartées. L’écart de diamètre, fourni en mm, est converti en µm.'};}
if(B.foxconn){const F=B.foxconn;
 DS.foxconn={id:'foxconn',court:'Injection · Foxconn, 16 600 cycles',titre:F.titre,cols:F.cols,rows:F.rows,chrono:true,seg:'colonne',segCol:2,defVar:10,ref:30,tolerances:F.tolerances,unite:'pièces',
  tolNote:'Tolérance 199,925 à 200,075 mm citée par un brevet qui exploite ce jeu (CN114239378A), appliquée aux deux cotes nominales 200 mm ; aucune tolérance connue pour la cote 1 (300 mm). Une pièce hors tolérance n’est pas forcément signalée par les règles : la surveillance compare à la référence de la période, pas à la tolérance.',
  src:'Foxconn Technology Group, jeu « virtual metrology » du 4e concours chinois d’innovation big data industriel, 2020 (<a href="https://github.com/chuangwang1991/VirtualMeasurement_molding" target="_blank" rel="noopener">description du concours</a>, <a href="https://www.engineering.org.cn/engi/EN/10.1016/j.eng.2022.06.019" target="_blank" rel="noopener">article Engineering 2022</a>). Fichiers repris du <a href="https://github.com/dengxq888/Injection-Molding-Dataset" target="_blank" rel="noopener">miroir GitHub</a>, licence non précisée : usage interne Vella Partners, site non public. Sélection de 21 colonnes ; consignes rattachées à chaque cycle depuis le journal de réglages ('+F.versions+' versions) ; campagnes déduites des arrêts longs du temps MES.',
  usage:'Vraie production sur trois campagnes et environ 75 jours : 3 cotes mesurées au micron sur chaque pièce, 86 variables machine par cycle, horodatage MES et journal des changements de consigne. La cote 2 glisse de 199,95 mm en fin de campagne 1 à 200,13 mm en campagne 3 : 93 % des pièces y sortent de la tolérance citée.',
  limite:'Pièce et usine anonymisées, cotes sans nom ; unités de pression non documentées (« selon source »). Les signaux moule haute fréquence du concours ne sont pas dans le miroir. Les arrêts entre campagnes durent 18 et 39 jours : la référence doit être recalculée à chaque reprise.',
  note:'Contrôle d’import : compteur machine strictement croissant, 75 % des cycles consécutifs et 94 % à 3 cycles près ; le temps MES avance d’un temps de cycle (37 s) entre deux lignes. 216 versions de consignes tombent dans la plage, 97 avec un code motif ; seules 6 consignes qui changent réellement sont reprises comme colonnes.'};}
const IG_FR={'Melt temperature':['Température matière','°C'],'Mold temperature':['Température moule','°C'],'time_to_fill':['Temps de remplissage','s'],'ZDx - Plasticizing time':['Temps de dosage','s'],'ZUx - Cycle time':['Temps de cycle','s'],'SKx - Closing force':['Force de fermeture','N (selon source)'],'SKs - Clamping force peak value':['Force de verrouillage, pic','N (selon source)'],'Ms - Torque peak value current cycle':['Couple vis, pic','N·m'],'Mm - Torque mean value current cycle':['Couple vis, moyen','N·m'],'APSs - Specific back pressure peak value':['Contre-pression spécifique, pic','bar'],'APVs - Specific injection pressure peak value':['Pression d’injection spécifique, pic','bar'],'CPn - Screw position at the end of hold pressure':['Position vis fin de maintien','cm'],'SVo - Shot volume':['Volume injecté','cm³'],'quality':['Classe qualité','']};

/* ---------- État ---------- */
const S={ds:null,v:null,mode:'brut',segMode:null,refN:30,drift:{start:null,amp:2,kind:'rampe',len:150,dir:1},view:'tout',viewSeg:0,res:null};

/* ---------- Lecture CSV ---------- */
function parseCSV(txt){
 txt=txt.replace(/^\uFEFF/,'');
 const first=txt.split(/\r?\n/,1)[0];
 const cnt=c=>first.split(c).length-1;
 const d=[';',',','\t'].sort((a,b)=>cnt(b)-cnt(a))[0];
 const out=[];let row=[],f='',q=false;
 for(let i=0;i<txt.length;i++){const c=txt[i];
  if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true; else if(c===d){row.push(f);f=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&txt[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x!==''))out.push(row);row=[]}
  else f+=c}
 row.push(f);if(row.some(x=>x!==''))out.push(row);
 return {delim:d,head:out[0].map(s=>s.trim()),body:out.slice(1)};
}
function num(s,dec){if(s==null)return NaN;s=String(s).trim();if(s==='')return NaN;if(dec===',')s=s.replace(/\s/g,'').replace(',','.');const v=Number(s);return v}
function fromCSV(txt,meta){
 const P=parseCSV(txt),dec=P.delim===';'?',':'.';
 const n=P.body.length,cols=[],rows=Array.from({length:n},()=>[]);
 P.head.forEach((h,j)=>{
  let ok=0,miss=0;const vals=P.body.map(r=>{const s=r[j];if(s==null||String(s).trim()===''){miss++;return NaN}let v=num(s,dec);if(isNaN(v)&&dec==='.')v=num(s,',');if(!isNaN(v))ok++;return v});
  const numeric=ok>=0.9*(n-miss)&&ok>0;
  const lo=h.toLowerCase();
  let t=numeric?'meas':'cat';
  if(/consigne|set_|setpoint|^sp[_ ]/.test(lo))t='set';
  if(/qualit|label|ok\/nok|^ok|conform|classe/.test(lo))t='qual';
  if(/^cycle|cycle_?no|index|horodat|date|time ?stamp|heure/.test(lo)&&!/temps|time$/.test(lo))t='meta';
  if(/segment|campagne|lot|essai|experiment|outil|tool|of$|^of[_ ]/.test(lo))t='seg';
  cols.push({k:h,l:h,u:'',t,numeric,miss});
  P.body.forEach((r,i)=>rows[i][j]=numeric?vals[i]:(r[j]==null?'':String(r[j]).trim()));
 });
 return Object.assign({cols,rows,delim:P.delim},meta||{});
}

/* ---------- Statistiques ---------- */
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const sd=(a,m)=>{m=m==null?mean(a):m;return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/Math.max(1,a.length-1))};
function resolution(x){const u=[...new Set(x.filter(isFinite))].sort((a,b)=>a-b);let r=Infinity;for(let i=1;i<u.length&&i<5000;i++){const d=u[i]-u[i-1];if(d>0&&d<r)r=d}return isFinite(r)?r:1}
function pearson(a,b){const n=a.length;if(n<3)return NaN;const ma=mean(a),mb=mean(b);let sab=0,sa=0,sb=0;for(let i=0;i<n;i++){const da=a[i]-ma,db=b[i]-mb;sab+=da*db;sa+=da*da;sb+=db*db}return sa&&sb?sab/Math.sqrt(sa*sb):NaN}

/* Segmentation : retourne [{a,b,label,cause}] */
function segments(ds,mode){
 const n=ds.rows.length;
 if(mode==='aucune'||!ds.chrono)return [{a:0,b:n,label:'Série complète',cause:'début'}];
 const segs=[];let a=0;
 const setIdx=ds.cols.map((c,i)=>c.t==='set'?i:-1).filter(i=>i>=0);
 const sc=mode==='colonne'?ds.segCol:null;
 const changed=(i)=>{
  if(sc!=null&&ds.rows[i][sc]!==ds.rows[i-1][sc])return 'colonne';
  if(mode==='consigne'||mode==='colonne'){for(const j of setIdx){const p=ds.rows[i-1][j],q=ds.rows[i][j];if(isFinite(p)&&isFinite(q)&&Math.abs(q-p)>(ds.tol||0.01)*Math.max(Math.abs(p),Math.abs(q),1e-9))return 'consigne'}}
  return null};
 let cause='début';
 for(let i=1;i<n;i++){const c=changed(i);if(c){segs.push({a,b:i,cause});a=i;cause=c}}
 segs.push({a,b:n,cause});
 // une transition d'un ou deux points n'ouvre pas de segment : fusion avec le suivant
 for(let k=0;k<segs.length-1;k++){if(segs[k].b-segs[k].a<3&&segs[k].cause!=='colonne'&&segs[k+1].cause!=='colonne'){segs[k+1].a=segs[k].a;segs[k+1].cause=segs[k].cause;segs.splice(k,1);k--}}
 segs.forEach((s,k)=>{s.label=(sc!=null?ds.cols[sc].l+' '+ds.rows[s.a][sc]:'Segment '+(k+1))});
 return segs;
}

/* Règles VP Predict : hors ±3σ, 7 du même côté, EWMA λ 0,2 L 3 */
function detect(x,segs,refN,floor){
 const n=x.length,al=new Uint8Array(n),ew=new Float64Array(n).fill(NaN),mu=new Float64Array(n).fill(NaN),sg=new Float64Array(n).fill(NaN),evalSeg=[];
 const lam=0.2,Lk=3,kE=Math.sqrt(lam/(2-lam));
 segs.forEach(s=>{
  const len=s.b-s.a;s.ok=len>=refN+5;
  if(!s.ok){evalSeg.push(s);return}
  const ref=[];for(let i=s.a;i<s.a+refN;i++)if(isFinite(x[i]))ref.push(x[i]);
  if(ref.length<Math.max(5,refN*0.8)){s.ok=false;evalSeg.push(s);return}
  const m=mean(ref);let d=sd(ref,m);s.floor=false;if(d<floor){d=floor;s.floor=true}
  s.mu=m;s.sd=d;let z=m,side=0,run=0;
  for(let i=s.a;i<s.b;i++){mu[i]=m;sg[i]=d;const v=x[i];if(!isFinite(v)){ew[i]=z;continue}
   z=lam*v+(1-lam)*z;ew[i]=z;if(i<s.a+refN)continue;
   let r=0;if(Math.abs(v-m)>3*d)r|=1;
   const sd2=v>m?1:v<m?-1:0;if(sd2&&sd2===side)run++;else{side=sd2;run=sd2?1:0}if(run>=7)r|=2;
   if(Math.abs(z-m)>Lk*d*kE)r|=4;al[i]=r}
  evalSeg.push(s)});
 // épisodes : alarmes séparées de plus de 10 points
 const ep=[];let cur=null;
 for(let i=0;i<n;i++){if(al[i]){if(cur&&i-cur.end<=10){cur.end=i;cur.r|=al[i]}else{cur={start:i,end:i,r:al[i]};ep.push(cur)}}}
 return {al,ew,mu,sg,ep,segs:evalSeg};
}

function driftSeries(x,dr,seg,sdv){
 const y=Float64Array.from(x),a=dr.start,b=seg.b,A=dr.amp*sdv*dr.dir;
 for(let i=a;i<b;i++){const k=i-a;const f=dr.kind==='palier'?1:Math.min(1,(k+1)/dr.len);y[i]=x[i]+A*f}
 return y;
}
function firstHit(t,r,a,b){for(let i=a;i<b;i++)if(t[i]&&!r[i])return i;return null}
function segOf(segs,i){return segs.find(s=>i>=s.a&&i<s.b)}

/* ---------- Rendu ---------- */
function colX(ds,j){return ds.rows.map(r=>{const v=r[j];return typeof v==='number'?v:Number(v)})}
function varOptions(ds){return ds.cols.map((c,i)=>({c,i})).filter(o=>o.c.t==='meas'||(o.c.t==='qual'&&ds.id==='vicomtech'))}

function setDataset(id){
 const ds=DS[id];if(!ds)return;
 if(ds.remote&&!ds.rows){loadRemote(ds);return}
 S.ds=ds;S.v=ds.defVar!=null&&ds.cols[ds.defVar]?ds.defVar:varOptions(ds)[0].i;
 S.segMode=ds.seg;S.refN=ds.ref||30;S.mode='brut';S.drift.start=null;S.view='tout';
 $$('.bx-ds button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ds===id));
 renderControls();compute();
}
async function loadRemote(ds){
 $('#bx-status').innerHTML='<span class="bx-pill">Chargement depuis le dépôt d’origine…</span>';
 try{const r=await fetch(ds.remote);if(!r.ok)throw new Error(r.status);const t=await r.text();
  const d=fromCSV(t);ds.cols=d.cols.map(c=>{const f=IG_FR[c.k];return Object.assign(c,f?{l:f[0],u:f[1]}:{}, c.k==='quality'?{t:'qual'}:{t:'meas'})});ds.rows=d.rows;setDataset(ds.id)}
 catch(e){$('#bx-status').innerHTML='<span class="bx-pill bad">Dépôt d’origine inaccessible ('+esc(e.message)+'). Téléchargez data.csv depuis le dépôt puis utilisez « Importer mon fichier ».</span>'}
}

function renderControls(){
 const ds=S.ds;
 $('#bx-src').innerHTML=`<h3>${esc(ds.titre)}</h3><p><b>Source :</b> ${ds.src}</p><p><b>Ce qu’on peut vérifier :</b> ${esc(ds.usage)}</p><p class="bx-lim"><b>Limite :</b> ${esc(ds.limite)}</p>${ds.note?`<p class="bx-note"><b>Constat d’import :</b> ${esc(ds.note)}</p>`:''}`;
 $('#bx-var').innerHTML=varOptions(ds).map(o=>`<option value="${o.i}"${o.i===S.v?' selected':''}>${esc(o.c.l)}${o.c.u?' ('+esc(o.c.u)+')':''}${o.c.t==='set'?' · consigne':''}</option>`).join('');
 const segOpts=[['aucune','Aucune séparation']];
 if(ds.chrono){if(ds.cols.some(c=>c.t==='set'))segOpts.push(['consigne','Aux changements de consigne']);
  const sc=ds.cols.findIndex(c=>c.t==='seg');if(sc>=0){ds.segCol=ds.segCol!=null?ds.segCol:sc;segOpts.push(['colonne','Par '+ds.cols[ds.segCol].l.toLowerCase()+(ds.cols.some(c=>c.t==='set')?' et consigne':'')])}}
 $('#bx-seg').innerHTML=segOpts.map(o=>`<option value="${o[0]}"${o[0]===S.segMode?' selected':''}>${o[1]}</option>`).join('');
 $('#bx-seg').disabled=!ds.chrono;
 $('#bx-ref').value=S.refN;
 $$('.bx-mode button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.mode===S.mode);b.disabled=!ds.chrono&&b.dataset.mode!=='brut'});
 ['#bx-seg','#bx-ref','#bx-view','#bx-export'].forEach(q=>$(q).disabled=!ds.chrono);
 $('.bx-leg').hidden=!ds.chrono;$('.bx-foot').hidden=!ds.chrono;
 $('#bx-modehelp').textContent=ds.chrono?'':'Ordre de production inconnu : seule l’analyse par classe qualité est proposée.';
}

function compute(){
 const ds=S.ds,x=colX(ds,S.v),segs=segments(ds,S.segMode);
 const floor=resolution(x)/2;
 const raw=ds.chrono?detect(x,segs,S.refN,floor):null;
 let y=null,drift=null,segD=null,test=null;
 if(S.mode==='derive'&&raw){
  const ev=raw.segs.filter(s=>s.ok&&s.b-(s.a+S.refN)>=20);
  if(!ev.length){S.mode='brut'}
  else{
   if(S.drift.start==null||!segOf(raw.segs,S.drift.start)||!segOf(raw.segs,S.drift.start).ok||S.drift.start<segOf(raw.segs,S.drift.start).a+S.refN){
    let best=null;ev.forEach(s=>{const lo=s.a+S.refN,hi=s.b-20;for(let st=lo;st<=hi;st+=Math.max(1,Math.floor((hi-lo)/40))){let k=0;for(let i=Math.max(lo,st-50);i<Math.min(s.b,st+50);i++)if(raw.al[i])k++;const room=Math.min(150,s.b-st);const sc=k-room*0.2;if(!best||sc<best.sc)best={sc,st,s}}});const big=best.s;S.drift.start=best.st;S.drift.len=Math.max(5,Math.min(150,Math.floor((big.b-S.drift.start)/2)));const li=$('#bx-len');if(li)li.value=S.drift.len}
   segD=segOf(raw.segs,S.drift.start);
   y=driftSeries(x,S.drift,segD,segD.sd);
   test=detect(y,segments(ds,S.segMode),S.refN,floor);
   const hit=firstHit(test.al,raw.al,S.drift.start,segD.b);
   const before=raw.ep.filter(e=>e.start>=segD.a&&e.start<S.drift.start).length;
   let busy=0;for(let i=Math.max(segD.a+S.refN,S.drift.start-50);i<S.drift.start;i++)if(raw.al[i])busy++;
   let masked=0;for(let i=S.drift.start;i<segD.b;i++)if(raw.al[i])masked++;
   drift={seg:segD,delay:hit!=null?hit-S.drift.start:null,rule:hit!=null?test.al[hit]:0,before,busy,masked,zone:segD.b-S.drift.start};
  }
 }
 S.res={x,y,segs:raw?raw.segs:segs,raw,test,drift,floor};
 render();
}

function rulesTxt(r){const t=[];if(r&1)t.push('hors ±3 σ');if(r&2)t.push('7 du même côté');if(r&4)t.push('tendance lissée');return t.join(', ')}

function render(){
 const ds=S.ds,R=S.res,c=ds.cols[S.v];
 renderStatus();renderChart();renderSide();renderImport();renderQuality();
 $('#bx-drift').hidden=S.mode!=='derive';
 const evOk=ds.chrono&&R.segs.some(s=>s.ok&&s.b-(s.a+S.refN)>=20);const db=$('.bx-mode button[data-mode=derive]');db.disabled=!evOk;db.title=evOk?'':'Aucun segment assez long pour injecter une dérive';
 $('.bx-leg .l-test').parentNode.hidden=S.mode!=='derive';
 if(S.mode==='derive'&&R.drift){$('#bx-start').max=ds.rows.length-1;$('#bx-start').value=S.drift.start;$('#bx-startv').textContent=U(1)+' '+(S.drift.start+1);}
 $('#bx-chart').classList.toggle('isdrift',S.mode==='derive');
 const vs=$('#bx-view');const segsOk=R.segs.length>1;
 vs.innerHTML=`<option value="tout">Toute la série</option>${S.mode==='derive'?'<option value="derive">Autour de la dérive</option>':''}${segsOk?R.segs.map((s,k)=>`<option value="s${k}">${esc(s.label)} · ${s.b-s.a} pts</option>`).join(''):''}`;
 if(S.view==='derive'&&S.mode!=='derive')S.view='tout';
 vs.value=S.view;if(vs.value!==S.view){S.view='tout';vs.value='tout'}
 vs.disabled=!ds.chrono;
}

function renderStatus(){
 const ds=S.ds,R=S.res;
 const badge=S.mode==='derive'?'<span class="bx-pill warn">Dérive artificielle ajoutée par le simulateur</span>':'<span class="bx-pill good">Données réelles non modifiées</span>';
 const segInfo=ds.chrono?` · ${R.segs.length} segment${R.segs.length>1?'s':''}, ${R.segs.filter(s=>s.ok).length} évaluable${R.segs.filter(s=>s.ok).length>1?'s':''}`:'';
 $('#bx-status').innerHTML=`${badge}<span class="bx-meta">${ds.rows.length.toLocaleString('fr-FR')} lignes · ${ds.cols.length} colonnes${segInfo}</span>`;
}

function renderChart(){
 const svg=$('#bx-chart'),ds=S.ds,R=S.res,W=720,H=300,pl=54,pr=12,pt=16,pb=30;
 const c=ds.cols[S.v];
 $('#bx-ctitle').textContent=c.l+(c.u?' ('+c.u+')':'');
 if(!ds.chrono){svg.innerHTML=qualityChart();$('#bx-csub').textContent='Distribution par classe qualité : ordre de production inconnu, pas de courbe chronologique.';return}
 let a=0,b=R.x.length;
 if(S.view==='derive'&&R.drift){a=Math.max(R.drift.seg.a,S.drift.start-200);b=Math.min(R.drift.seg.b,S.drift.start+400)}
 else if(S.view[0]==='s'){const s=R.segs[+S.view.slice(1)];if(s){a=s.a;b=s.b}}
 const xs=R.x,ys=R.y,n=b-a;
 let lo=Infinity,hi=-Infinity;
 for(let i=a;i<b;i++){for(const v of [xs[i],ys?ys[i]:NaN,R.raw.mu[i]+3*R.raw.sg[i],R.raw.mu[i]-3*R.raw.sg[i]])if(isFinite(v)){if(v<lo)lo=v;if(v>hi)hi=v}}
 const tl=ds.tolerances&&ds.tolerances[c.k];if(tl){lo=Math.min(lo,tl[0]);hi=Math.max(hi,tl[1])}
 if(!isFinite(lo)){svg.innerHTML='';return}
 if(hi===lo){hi+=1;lo-=1}const padv=(hi-lo)*0.06;lo-=padv;hi+=padv;
 const X=i=>pl+(i-a)/(Math.max(1,n-1))*(W-pl-pr),Y=v=>pt+(hi-v)/(hi-lo)*(H-pt-pb);
 const step=Math.max(1,Math.floor(n/1400));
 const path=(arr)=>{let d='',pen=false;for(let i=a;i<b;i+=step){let v=arr[i];if(step>1){let mn=Infinity,mx=-Infinity;for(let k=i;k<Math.min(b,i+step);k++){const w=arr[k];if(isFinite(w)){if(w<mn)mn=w;if(w>mx)mx=w}}if(!isFinite(mn)){pen=false;continue}d+=(pen?'L':'M')+X(i).toFixed(1)+','+Y(mn).toFixed(1)+'L'+X(i).toFixed(1)+','+Y(mx).toFixed(1);pen=true;continue}if(!isFinite(v)){pen=false;continue}d+=(pen?'L':'M')+X(i).toFixed(1)+','+Y(v).toFixed(1);pen=true}return d};
 let g='';
 // grille
 for(let k=0;k<=4;k++){const v=lo+(hi-lo)*k/4,yy=Y(v),gd=(hi-lo)<0.5?3:(hi-lo)<5?2:undefined;g+=`<line x1="${pl}" x2="${W-pr}" y1="${yy}" y2="${yy}" class="bx-grid"/><text x="${pl-6}" y="${yy+3}" class="bx-ax" text-anchor="end">${fmt(v,gd)}</text>`}
 g+=`<text x="${pl}" y="${H-8}" class="bx-ax">${(a+1).toLocaleString('fr-FR')}</text><text x="${W-pr}" y="${H-8}" class="bx-ax" text-anchor="end">${b.toLocaleString('fr-FR')}</text><text x="${(pl+W-pr)/2}" y="${H-8}" class="bx-ax" text-anchor="middle">${ds.id==='vicomtech'?'segment d’une seconde':ds.id==='import'?'ligne du fichier':ds.id==='cipdmd'?'tige, ordre de fabrication':'cycle'}</text>`;
 // segments et bandes
 R.segs.forEach(s=>{if(s.b<=a||s.a>=b)return;const x1=X(Math.max(a,s.a)),x2=X(Math.min(b,s.b)-1);
  if(s.a>a&&s.a<b)g+=`<line x1="${X(s.a)}" x2="${X(s.a)}" y1="${pt}" y2="${H-pb}" class="bx-segl"/>`;
  if(!s.ok){g+=`<rect x="${x1}" y="${pt}" width="${Math.max(0,x2-x1)}" height="${H-pt-pb}" class="bx-noeval"/>`;return}
  const r1=X(Math.min(b-1,s.a+S.refN-1));if(s.a>=a)g+=`<rect x="${x1}" y="${pt}" width="${Math.max(0,r1-x1)}" height="${H-pt-pb}" class="bx-refz"/>`;
  g+=`<line x1="${x1}" x2="${x2}" y1="${Y(s.mu)}" y2="${Y(s.mu)}" class="bx-mu"/><line x1="${x1}" x2="${x2}" y1="${Y(s.mu+3*s.sd)}" y2="${Y(s.mu+3*s.sd)}" class="bx-lim"/><line x1="${x1}" x2="${x2}" y1="${Y(s.mu-3*s.sd)}" y2="${Y(s.mu-3*s.sd)}" class="bx-lim"/>`});
 if(tl)tl.forEach((v,k)=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" class="bx-tol"/><text x="${W-pr-4}" y="${Y(v)+(k?-4:11)}" class="bx-ax bx-tolt" text-anchor="end">tolérance ${k?'max':'min'} ${fmt(v,(hi-lo)<0.5?3:(hi-lo)<5?2:undefined)}</text>`});
 // zone dérive
 if(S.mode==='derive'&&R.drift){const s0=Math.max(a,S.drift.start),s1=Math.min(b,R.drift.seg.b)-1;if(s1>s0)g+=`<rect x="${X(s0)}" y="${pt}" width="${X(s1)-X(s0)}" height="${H-pt-pb}" fill="url(#hatch)" class="bx-dz"/><text x="${X(s0)+4}" y="${pt+12}" class="bx-dzt">Dérive artificielle</text>`}
 // séries
 if(ys){g+=`<path d="${path(xs)}" class="bx-orig"/><path d="${path(ys)}" class="bx-test"/>`}else g+=`<path d="${path(xs)}" class="bx-real"/>`;
 const T=S.mode==='derive'&&R.test?R.test:R.raw;
 g+=`<path d="${path(T.ew)}" class="bx-ew"/>`;
 // épisodes
 T.ep.forEach(e=>{if(e.start<a||e.start>=b)return;const inD=S.mode==='derive'&&R.drift&&e.end>=S.drift.start&&e.start<R.drift.seg.b;const v=(ys||xs)[e.start];if(isFinite(v))g+=`<circle cx="${X(e.start)}" cy="${Y(v)}" r="4" class="${inD?'bx-hit':'bx-al'}"><title>Signal ${U(1)} ${e.start+1} : ${rulesTxt(e.r)}</title></circle>`});
 svg.innerHTML=`<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e8841f14"/><line x1="0" y1="0" x2="0" y2="8" stroke="#e8841f55" stroke-width="3"/></pattern></defs>`+g;
 $('#bx-csub').textContent=S.mode==='derive'?'Gris : valeurs réelles d’origine. Orange : copie modifiée par le simulateur à partir du point choisi.':'Chaque point est une valeur réelle du fichier, dans l’ordre du fichier, sans modification.';
}

function qualityChart(){
 const ds=S.ds,x=colX(ds,S.v),q=colX(ds,ds.qual),W=720,H=300,pl=54,pr=12,pt=16,pb=40;
 const cls=[...new Set(q.filter(isFinite))].sort((a,b)=>a-b);
 let lo=Infinity,hi=-Infinity;x.forEach(v=>{if(isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v)}});const p=(hi-lo)*0.06||1;lo-=p;hi+=p;
 const Y=v=>pt+(hi-v)/(hi-lo)*(H-pt-pb),bw=(W-pl-pr)/cls.length;
 let g='';for(let k=0;k<=4;k++){const v=lo+(hi-lo)*k/4;g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" class="bx-grid"/><text x="${pl-6}" y="${Y(v)+3}" class="bx-ax" text-anchor="end">${fmt(v)}</text>`}
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 cls.forEach((cl,k)=>{const cx=pl+bw*(k+.5),vals=x.filter((v,i)=>q[i]===cl&&isFinite(v)).sort((a,b)=>a-b);
  vals.forEach(v=>{g+=`<circle cx="${(cx+(rnd()-.5)*bw*.55).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="1.6" class="${cl===1?'bx-dotbad':'bx-dot'}"/>`});
  const qt=f=>vals[Math.floor(f*(vals.length-1))],q1=qt(.25),q3=qt(.75),md=qt(.5);
  g+=`<rect x="${cx-bw*.2}" y="${Y(q3)}" width="${bw*.4}" height="${Math.max(1,Y(q1)-Y(q3))}" class="bx-box"/><line x1="${cx-bw*.2}" x2="${cx+bw*.2}" y1="${Y(md)}" y2="${Y(md)}" class="bx-med"/>`;
  g+=`<text x="${cx}" y="${H-22}" class="bx-ax bx-axc" text-anchor="middle">${esc((ds.classes&&ds.classes[cl])||('Classe '+cl))}</text><text x="${cx}" y="${H-8}" class="bx-ax" text-anchor="middle">n = ${vals.length}</text>`});
 return g;
}

function renderSide(){
 const ds=S.ds,R=S.res,el=$('#bx-side');
 if(!ds.chrono){el.innerHTML=`<h3>Analyse qualité</h3><p>Chaque point est une pièce réelle. La boîte couvre la moitié centrale des valeurs, le trait la médiane.</p><p class="sl">Une différence entre classes ne prouve pas que ce paramètre cause la qualité : plusieurs réglages ont pu changer en même temps, et les cinq journées de production ne sont pas identifiables dans le fichier.</p>`;return}
 const raw=R.raw,nEval=R.segs.filter(s=>s.ok).reduce((t,s)=>t+(s.b-s.a-S.refN),0);
 const nearSet=raw.ep.filter(e=>R.segs.some(s=>s.a>0&&s.cause!=='début'&&e.start>=s.a&&e.start<s.a+S.refN+10)).length;
 // comparaison sans séparation
 const flat=S.segMode==='aucune'?null:detect(R.x,[{a:0,b:R.x.length}],S.refN,R.floor);
 const flatNear=flat?flat.ep.filter(e=>R.segs.some(s=>s.cause!=='début'&&s.a>0&&e.start>=s.a-2&&e.start<s.a+12)).length:0;
 let h='';
 if(S.mode==='brut'){
  const pct=(al,segsE)=>{let n=0,k=0;segsE.forEach(s=>{if(!s.ok)return;for(let i=s.a+S.refN;i<s.b;i++){n++;if(al[i])k++}});return n?k/n*100:NaN};
  const pSep=pct(raw.al,R.segs);
  h+=nEval?`<h3>Relecture brute</h3><p>${pl(raw.ep.length,'épisode','épisodes')} de signal sur ${nEval.toLocaleString('fr-FR')} points évaluables : <b>${fmt(pSep,1)} %</b> des points en alerte.</p>`:`<h3>Relecture brute</h3><p>Aucun segment assez long pour calculer une référence de ${S.refN} points : pas de seuil de surveillance calculable sur ce jeu.</p>`;
  if(nEval&&pSep>20)h+=`<p class="bx-warnline">Taux d’alerte trop élevé pour un usage en atelier : la référence courte sous-estime la variabilité réelle (variations lentes, cycles corrélés entre eux). Les seuils doivent être recalés et validés sur site avant tout pilote.</p>`;
  h+=`<p class="sl">Sur des données réelles, un signal est à qualifier par un expert : ni vraie ni fausse alerte tant que le contexte n’est pas connu.</p>`;
  if(flat){const pF=pct(flat.al,flat.segs);h+=`<div class="bx-cmp"><p><b>Pourquoi séparer les consignes</b></p><p>Sans séparation, une seule référence pour toute la série : <b>${fmt(pF,1)} %</b> des points en alerte. Avec séparation : <b>${isFinite(pSep)?fmt(pSep,1)+' %':'non évaluable'}</b>.</p>`;}
  if(flat)h+=`<p class="sl">Un changement de réglage voulu n’est pas une dérive spontanée : il ne doit ni déclencher d’alerte, ni entrer dans le calcul des seuils.</p></div>`;
  const bad=R.segs.filter(s=>!s.ok).length;if(bad)h+=`<p class="sl">${pl(bad,'segment trop court','segments trop courts')} pour calculer une référence de ${S.refN} points : zone hachurée grise, non évaluée.</p>`;
  if(R.segs.some(s=>s.floor))h+=`<p class="sl">Mesure très stable sur la référence : σ plancher fixé à la moitié de la résolution du capteur (${fmt(R.floor)}).</p>`;
  if(R.segs.filter(s=>s.ok).length&&ds.chrono)h+=`<button type="button" class="btn primary sm" id="bx-go-drift">Tester avec une dérive injectée</button>`;
 } else if(R.drift){
  const D=R.drift;
  h+=`<h3>Dérive injectée</h3><p class="bx-warnline">Valeurs modifiées par le simulateur à partir ${S.ds.id==="cipdmd"?"de la":"du"} ${U(1)} ${(S.drift.start+1).toLocaleString('fr-FR')}.</p>`;
  h+=D.delay!=null?`<p class="bx-big">${D.delay} <small>${U(D.delay)} entre le début de la dérive et le premier signal qui lui est attribuable</small></p><p>Règle déclenchée : ${rulesTxt(D.rule)}.</p>`:D.masked>D.zone*0.5?`<p class="bx-big">Non attribuable <small>les données d’origine sont déjà en alerte sur ${D.masked} des ${D.zone} points de la zone modifiée</small></p>`:`<p class="bx-big">Non détectée <small>avant la fin du segment</small></p>`;
  h+=`<p>Sur la partie non modifiée de ce segment : ${pl(D.before,'épisode','épisodes')} de signal sur données réelles, à qualifier.</p>`;
  if(D.busy>10)h+=`<p class="bx-warnline">Les données d’origine signalent déjà ${D.busy} des 50 points précédant la dérive : le délai mesuré est peu interprétable ici. Déplacez le début ou allongez la référence.</p>`;
  h+=`<button type="button" class="btn ghost sm" id="bx-campaign">Évaluer sur 40 positions</button><div id="bx-camp"></div>`;
  h+=`<p class="sl">Ce résultat mesure le comportement des règles sur une dérive artificielle. Il ne démontre pas une performance industrielle.</p>`;
 }
 el.innerHTML=h;
 const gd=$('#bx-go-drift');if(gd)gd.onclick=()=>{S.mode='derive';S.drift.start=null;S.view='derive';renderControls();compute()};
 const cp=$('#bx-campaign');if(cp)cp.onclick=campaign;
}

function campaign(){
 const R=S.res,ds=S.ds,ev=R.raw.segs.filter(s=>s.ok&&s.b-(s.a+S.refN)>=80);
 const out=$('#bx-camp');if(!ev.length){out.innerHTML='<p class="sl">Aucun segment assez long (référence + 80 points).</p>';return}
 let seed=20261030;const rnd=()=>(seed=(seed*48271)%2147483647)/2147483647;
 const segsAll=segments(ds,S.segMode),res=[];
 for(let k=0;k<40;k++){const s=ev[Math.floor(rnd()*ev.length)],st=s.a+S.refN+Math.floor(rnd()*(s.b-s.a-S.refN-80));
  const dr=Object.assign({},S.drift,{start:st});const y=driftSeries(R.x,dr,s,s.sd);const t=detect(y,segsAll,S.refN,R.floor);
  const h=firstHit(t.al,R.raw.al,st,s.b);res.push(h!=null?h-st:null)}
 const det=res.filter(v=>v!=null&&v<=50).sort((a,b)=>a-b),med=det.length?det[Math.floor(det.length/2)]:null;
 out.innerHTML=`<p><b>${det.length}/40</b> dérives signalées en 50 ${U(2)} ou moins${med!=null?`, délai médian ${med} ${U(med)}`:''}.</p><p class="sl">Amplitude ${fmt(S.drift.amp,1)} σ, ${S.drift.kind==='palier'?'palier':'rampe sur '+S.drift.len+' '+U(2)}. Positions tirées au hasard (graine fixe, résultat reproductible).</p>`;
}

function renderImport(){
 const ds=S.ds,el=$('#bx-imp');
 const rows=ds.cols.map((c,j)=>{const x=ds.rows.map(r=>r[j]);const nums=x.filter(v=>typeof v==='number'&&isFinite(v));const miss=x.length-x.filter(v=>v!==''&&!(typeof v==='number'&&isNaN(v))).length;
  const mn=nums.length?Math.min(...nums):NaN,mx=nums.length?Math.max(...nums):NaN,cst=nums.length&&mn===mx;
  const role={meas:'mesure',set:'consigne',seg:'segment',qual:'qualité',meta:'repère',cat:'texte'}[c.t];
  return `<tr${miss?' class="bx-miss"':''}><td>${esc(c.l)}${c.k!==c.l?`<br><small>${esc(c.k)}</small>`:''}</td><td>${esc(c.u||'–')}${c.conv?`<br><small>${esc(c.conv)}</small>`:''}</td><td>${role}</td><td class="n">${miss||'0'}</td><td class="n">${fmt(mn)}</td><td class="n">${fmt(mx)}</td><td>${cst?'constante':''}</td></tr>`}).join('');
 let gaps='';ds.cols.forEach((c,j)=>{if(c.t!=='meta'||!/cycle|compteur|counter|index/i.test(c.l+c.k))return;const v=ds.rows.map(r=>r[j]).filter(isFinite);if(v.length<2)return;let back=0,miss=0;for(let i=1;i<v.length;i++){const d=v[i]-v[i-1];if(d<=0)back++;else if(d>1&&Number.isInteger(d))miss+=d-1}if(miss||back)gaps+=`<p class="bx-note"><b>Numérotation « ${esc(c.l)} » :</b> ${miss?miss.toLocaleString('fr-FR')+' numéros absents entre la première et la dernière ligne':''}${miss&&back?', ':''}${back?back+' retours en arrière':''}. Les cycles manquants ne sont pas comblés : la relecture enchaîne les lignes présentes.</p>`});
 const totMiss=ds.cols.reduce((t,c,j)=>t+ds.rows.filter(r=>r[j]===''||(typeof r[j]==='number'&&isNaN(r[j]))).length,0);
 el.innerHTML=`<p>${ds.rows.length.toLocaleString('fr-FR')} lignes, ${ds.cols.length} colonnes, ${totMiss} valeur${totMiss>1?'s':''} manquante${totMiss>1?'s':''}. Ordre chronologique : <b>${ds.chrono?(ds.id==='import'?'supposé (ordre du fichier)':'oui'):'non'}</b>.${ds.delim?` Séparateur détecté : « ${ds.delim==='\t'?'tabulation':ds.delim} ».`:''}</p>${gaps}<div class="tw"><table class="bx-t"><thead><tr><th>Colonne</th><th>Unité</th><th>Rôle</th><th>Manquantes</th><th>Min</th><th>Max</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function R0(){return S.res}
function renderQuality(){
 const ds=S.ds,el=$('#bx-qual'),wrap=$('#bx-qualsec');
 const x=colX(ds,S.v),c=ds.cols[S.v];
 if(ds.qual!=null&&ds.id!=='vicomtech'){
  const q=ds.rows.map(r=>r[ds.qual]),cls=[...new Set(q.filter(v=>v!==''&&!(typeof v==='number'&&isNaN(v))))].sort((a,b)=>a>b?1:-1);
  const st=cls.map(cl=>{const v=x.filter((_,i)=>q[i]===cl&&isFinite(x[i]));const m=mean(v);return {cl,n:v.length,m,s:sd(v,m)}});
  const pooled=Math.sqrt(st.reduce((t,s)=>t+s.s*s.s*(s.n-1),0)/Math.max(1,st.reduce((t,s)=>t+s.n-1,0)));
  const base=st[0];
  el.innerHTML=`<p>Écart de chaque classe à « ${esc((ds.classes&&ds.classes[base.cl])||base.cl)} », en écarts-types intra-classe (${fmt(pooled)} ${esc(c.u||'')}).</p><div class="tw"><table class="bx-t"><thead><tr><th>Classe</th><th>Pièces</th><th>Moyenne</th><th>Écart-type</th><th>Écart à la 1re classe</th></tr></thead><tbody>${st.map(s=>`<tr><td>${esc((ds.classes&&ds.classes[s.cl])||s.cl)}</td><td class="n">${s.n}</td><td class="n">${fmt(s.m)}</td><td class="n">${fmt(s.s)}</td><td class="n">${s===base?'–':fmt((s.m-base.m)/pooled,2)+' σ'}</td></tr>`).join('')}</tbody></table></div><p class="sl">Corrélation, pas causalité. Ces écarts sont calculés sur les données réelles, sans modèle ni calibration.</p>`;
  wrap.hidden=false;return}
 if(ds.id==='vicomtech'){
  const vb=colX(ds,ds.qual),segs=segments(ds,'colonne').length?null:null;
  const tools=[...new Set(ds.rows.map(r=>r[0]))];
  const rs=tools.map(t=>{const idx=ds.rows.map((r,i)=>r[0]===t?i:-1).filter(i=>i>=0);return {t,n:idx.length,r:pearson(idx.map(i=>x[i]),idx.map(i=>vb[i])),vb0:vb[idx[0]],vb1:vb[idx[idx.length-1]]}});
  const pos=rs.filter(o=>o.r>0.5).length,neg=rs.filter(o=>o.r<-0.5).length;
  el.innerHTML=S.v===ds.qual?'<p>La variable choisie est l’usure elle-même : choisissez un signal pour comparer.</p>':`<p>Corrélation de « ${esc(c.l)} » avec l’usure VB, outil par outil : ${pos} outil${pos>1?'s':''} sur ${rs.length} au-dessus de +0,5, ${neg} en dessous de −0,5.</p><div class="tw"><table class="bx-t"><thead><tr><th>Outil</th><th>Segments</th><th>VB début → fin (µm)</th><th>Corrélation avec VB</th></tr></thead><tbody>${rs.map(o=>`<tr><td>${o.t}</td><td class="n">${o.n}</td><td class="n">${fmt(o.vb0,0)} → ${fmt(o.vb1,0)}</td><td class="n${Math.abs(o.r)>0.5?' bx-strong':''}">${fmt(o.r,2)}</td></tr>`).join('')}</tbody></table></div><p class="sl">Un signal qui suit l’usure sur un outil peut aussi suivre un changement des conditions de coupe programmées. À confirmer en séparant les conditions de coupe.</p>`;
  wrap.hidden=false;return}
 if(ds.poids!=null){
  const segs=R0().segs,w=colX(ds,ds.poids),k=colX(ds,ds.cote),cw=ds.cols[ds.poids],ck=ds.cols[ds.cote];
  const self=S.v===ds.poids;
  const rs=segs.map(s=>{const I=[];for(let i=s.a;i<s.b;i++)I.push(i);const xv=I.map(i=>x[i]),wv=I.map(i=>w[i]),kv=I.map(i=>k[i]);const mw=mean(wv);return {s,n:I.length,mx:mean(xv),mw,sw:sd(wv,mw),mk:mean(kv),r:pearson(xv,wv)}});
  const rAll=pearson(x,w);
  el.innerHTML=`<p>${self?'Poids pièce par phase.':`Corrélation de « ${esc(c.l)} » avec le poids pièce sur toute la série : <b>${fmt(rAll,2)}</b>. Détail par phase ci-dessous.`}</p><div class="tw"><table class="bx-t"><thead><tr><th>Phase</th><th>Cycles</th>${self?'':`<th>${esc(c.l)}</th>`}<th>Poids moyen (g)</th><th>Écart-type poids (g)</th><th>${esc(ck.l)} moy. (µm)</th>${self?'':'<th>Corrélation avec le poids</th>'}</tr></thead><tbody>${rs.map(o=>`<tr${o.s.ok?'':' class="bx-miss"'}><td>${esc(ds.rows[o.s.a][1])}</td><td class="n">${o.n}</td>${self?'':`<td class="n">${fmt(o.mx)}</td>`}<td class="n">${fmt(o.mw,3)}</td><td class="n">${fmt(o.sw,3)}</td><td class="n">${fmt(o.mk,0)}</td>${self?'':`<td class="n${Math.abs(o.r)>0.5?' bx-strong':''}">${o.n>=10?fmt(o.r,2):'–'}</td>`}</tr>`).join('')}</tbody></table></div><p class="sl">Corrélation, pas causalité : plusieurs grandeurs varient ensemble quand le plan d’essai change un réglage. Les phases grisées sont des transitions, non évaluées.</p>`;
  wrap.hidden=false;return}
 if(ds.tolerances){
  const segs=R0().segs,keys=Object.keys(ds.tolerances),J=keys.map(kk=>ds.cols.findIndex(cc=>cc.k===kk));
  const out=(j,i)=>{const v=ds.rows[i][j],t=ds.tolerances[ds.cols[j].k];return isFinite(v)&&(v<t[0]||v>t[1])};
  const tot=J.map(j=>ds.rows.filter((_,i)=>out(j,i)).length);
  const UW=ds.unite||'tiges',UW1=UW.charAt(0).toUpperCase()+UW.slice(1),LC=ds.segCol;el.innerHTML=`<p>${UW1} hors tolérance sur ${ds.rows.length.toLocaleString('fr-FR')} : ${J.map((j,m)=>`${esc(ds.cols[j].l.toLowerCase())} ${tot[m].toLocaleString('fr-FR')}`).join(', ')}. Moyenne de « ${esc(c.l)} » et dépassements par période.</p><div class="tw"><table class="bx-t"><thead><tr><th>${ds.id==='foxconn'?'Campagne / réglage':'Période'}</th><th>${UW1}</th><th>Moyenne</th><th>Écart-type</th>${J.map(j=>`<th>Hors tol. ${esc(ds.cols[j].l.toLowerCase())}</th>`).join('')}</tr></thead><tbody>${segs.map(s=>{const v=x.slice(s.a,s.b).filter(isFinite),m=mean(v);return `<tr${s.ok?'':' class="bx-miss"'}><td>${esc(ds.rows[s.a][LC])}${ds.id==='foxconn'?' · cycles '+(s.a+1).toLocaleString('fr-FR')+' à '+s.b.toLocaleString('fr-FR'):''}</td><td class="n">${(s.b-s.a).toLocaleString('fr-FR')}</td><td class="n">${fmt(m,ds.id==='foxconn'?3:undefined)}</td><td class="n">${v.length>2?fmt(sd(v,m),ds.id==='foxconn'?3:undefined):'–'}</td>${J.map(j=>{let k=0;for(let i=s.a;i<s.b;i++)if(out(j,i))k++;return `<td class="n${k?' bx-strong':''}">${k||'–'}</td>`}).join('')}</tr>`}).join('')}</tbody></table></div><p class="sl">${ds.tolNote?esc(ds.tolNote):'Tolérances du jeu d’origine : diamètre ±18 µm, longueur 163,45 à 163,75 mm, coaxialité 0 à 50 µm. Une tige hors tolérance n’est pas forcément signalée par les règles : la surveillance compare à la référence de la période, pas à la tolérance.'}</p>`;
  wrap.hidden=false;return}
 if(ds.id==='loki'){
  const segs=segments(ds,'colonne'),setI=ds.cols.map((c,i)=>c.t==='set'?i:-1).filter(i=>i>=0);
  el.innerHTML=`<p>Moyenne de « ${esc(c.l)} » par réglage (4 cycles chacun) : l’effet des consignes est visible, mais 4 répétitions ne permettent pas de calculer un seuil de surveillance.</p><div class="tw"><table class="bx-t"><thead><tr><th>Essai</th>${setI.map(i=>`<th>${esc(ds.cols[i].l.replace('Consigne ',''))}</th>`).join('')}<th>Moyenne</th><th>Étendue</th></tr></thead><tbody>${segs.map(s=>{const v=x.slice(s.a,s.b).filter(isFinite);return `<tr><td>${ds.rows[s.a][1]}</td>${setI.map(i=>`<td class="n">${fmt(ds.rows[s.a][i])}</td>`).join('')}<td class="n">${fmt(mean(v))}</td><td class="n">${fmt(Math.max(...v)-Math.min(...v))}</td></tr>`}).join('')}</tbody></table></div>`;
  wrap.hidden=false;return}
 wrap.hidden=true;
}

/* ---------- Export ---------- */
function exportCSV(){
 const ds=S.ds,R=S.res,c=ds.cols[S.v];if(!ds.chrono)return;
 const T=S.mode==='derive'&&R.test?R.test:R.raw;
 const lines=[['ligne','segment','valeur_reelle','valeur_testee','origine','reference_moyenne','reference_sigma','tendance_lissee','signal','regles'].join(';')];
 for(let i=0;i<R.x.length;i++){const s=segOf(R.segs,i),mod=S.mode==='derive'&&R.y&&R.y[i]!==R.x[i];
  lines.push([i+1,s?s.label:'',R.x[i],R.y?R.y[i]:R.x[i],mod?'modifiée par le simulateur':'réelle',isFinite(T.mu[i])?T.mu[i]:'',isFinite(T.sg[i])?T.sg[i]:'',isFinite(T.ew[i])?T.ew[i].toFixed(4):'',T.al[i]?1:0,rulesTxt(T.al[i])].map(v=>String(v).replace('.',',')).join(';'))}
 const meta=`# Banc d'essai Vella Partners · ${ds.titre} · variable : ${c.l} · mode : ${S.mode==='derive'?`dérive injectée (${S.drift.kind}, ${S.drift.amp} σ, ${S.drift.dir>0?'hausse':'baisse'}, début ligne ${S.drift.start+1})`:'relecture brute, aucune modification'} · référence ${S.refN} points · séparation : ${S.segMode} · ${new Date().toISOString()}`;
 const blob=new Blob(['\uFEFF'+meta+'\n'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`banc-vp-${ds.id}-${S.mode}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}

/* ---------- Événements ---------- */
function bind(){
 $$('.bx-ds button[data-ds]').forEach(b=>b.onclick=()=>setDataset(b.dataset.ds));
 $('#bx-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{
  try{const d=fromCSV(rd.result,{id:'import',court:'Mon fichier',titre:'Mon fichier · '+f.name,chrono:true,
   src:'Fichier local « '+esc(f.name)+' », lu dans votre navigateur. Rien n’est envoyé ni conservé.',
   usage:'Relecture de vos propres mesures, puis test des règles avec une dérive injectée et signalée.',
   limite:'L’ordre des lignes est supposé chronologique. Vérifiez les unités et les rôles détectés ci-dessous avant toute conclusion.'});
   const sc=d.cols.findIndex(c=>c.t==='seg');d.seg=d.cols.some(c=>c.t==='set')?'consigne':sc>=0?'colonne':'aucune';if(sc>=0)d.segCol=sc;
   const q=d.cols.findIndex(c=>c.t==='qual');if(q>=0)d.qual=q;
   const m=d.cols.findIndex(c=>c.t==='meas');if(m<0)throw new Error('aucune colonne numérique de mesure');d.defVar=m;
   DS.import=d;$('#bx-dsimp').hidden=false;setDataset('import')}catch(err){$('#bx-status').innerHTML='<span class="bx-pill bad">Import impossible : '+esc(err.message)+'</span>'}};rd.readAsText(f)};
 $('#bx-var').onchange=e=>{S.v=+e.target.value;S.drift.start=null;compute()};
 $('#bx-seg').onchange=e=>{S.segMode=e.target.value;S.drift.start=null;S.view='tout';compute()};
 $('#bx-ref').onchange=e=>{S.refN=Math.max(5,Math.min(500,+e.target.value||30));e.target.value=S.refN;S.drift.start=null;compute()};
 $$('.bx-mode button').forEach(b=>b.onclick=()=>{if(b.disabled)return;S.mode=b.dataset.mode;S.view=S.mode==='derive'?'derive':'tout';renderControls();compute()});
 $('#bx-view').onchange=e=>{S.view=e.target.value;renderChart()};
 $('#bx-amp').oninput=e=>{S.drift.amp=+e.target.value;$('#bx-ampv').textContent=fmt(S.drift.amp,1)+' σ'};
 $('#bx-amp').onchange=()=>compute();
 $('#bx-kind').onchange=e=>{S.drift.kind=e.target.value;$('#bx-lenw').hidden=S.drift.kind==='palier';compute()};
 $('#bx-len').onchange=e=>{S.drift.len=Math.max(5,+e.target.value||150);compute()};
 $('#bx-dir').onchange=e=>{S.drift.dir=+e.target.value;compute()};
 $('#bx-start').oninput=e=>{$('#bx-startv').textContent=U(1)+' '+(+e.target.value+1)};
 $('#bx-start').onchange=e=>{const v=+e.target.value,s=segOf(S.res.segs,v);if(s&&s.ok&&v>=s.a+S.refN&&v<s.b-5){S.drift.start=v}else{$('#bx-startv').textContent='hors zone évaluable, position conservée'}compute()};
 $('#bx-export').onclick=exportCSV;
}

bind();
const first=new URLSearchParams(location.search).get('jeu');
setDataset(DS[first]?first:(DS.caoutchouc?'caoutchouc':'loki'));
})();
