(function(){
const C=window.VellaCalc;
const RUB=document.body.dataset.secteur==='caoutchouc';const S=JSON.parse(JSON.stringify(RUB?C.defaultsC:C.defaults));
S.profile='type';S.sector=null;const KNOWN=new Set();const DEF0=JSON.parse(JSON.stringify(RUB?C.defaultsC:C.defaults));
const CORE=RUB?['changes','changeDuration','tech','org','proc','performance','reject','scrapCost','cureTime','contribution']:['changes','changeDuration','tech','org','proc','performance','reject','scrapCost','caHour','margin'];
const SECTORS=['Automobile','Emballage','Médical','Biens de consommation','Électrique et électronique','Autre'];
/* D : la fourchette reste à ± 35 % tant que les valeurs n'ont pas été vérifiées avec le client. Saisir des valeurs ne les valide pas. */
const U_UNVERIFIED=.35;
function rel(){const k=CORE.filter(x=>KNOWN.has(x)).length,s=k/CORE.length;return s>=.7?{l:'élevée',c:'good',u:U_UNVERIFIED,k}:s>=.3?{l:'partielle',c:'mid',u:U_UNVERIFIED,k}:{l:'faible',c:'bad',u:U_UNVERIFIED,k};}
function noSale(){const z=JSON.parse(JSON.stringify(S));z.monetization=0;return C.calculate(z);}
function range(r,s){const u=rel().u;return [r.grossAll*(1-u)-r.costAll,r.grossAll*(1+u)-r.costAll];}
const PROFILES={
  petit:{label:'Petit site',n:12,d:'Environ 12 presses, moyenne nationale',dist:[4,5,2,1]},
  type:{label:'Site type',n:20,d:'20 presses, PME de plasturgie courante',dist:[6,8,4,2]},
  grand:{label:'Grand site',n:30,d:'30 presses et plus, plusieurs équipes',dist:[9,12,6,3]}
};
if(RUB){PROFILES.petit={label:'Petit site',n:8,d:'Jusqu’à 8 presses caoutchouc',dist:[3,3,2,0]};PROFILES.type={label:'Site type',n:16,d:'16 presses, mouleur caoutchouc courant',dist:[5,6,4,1]};PROFILES.grand={label:'Grand site',n:25,d:'Plus de 20 presses, plusieurs équipes',dist:[8,9,6,2]};}
const SL={prudent:'prudent',central:'central',cible:'ambitieux'};
const eur=v=>v==null?'—':Math.round(v).toLocaleString('fr-FR')+' €';
const num=(v,d=0)=>v==null?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d});

const LIM={c77:[0,500],c63:[0,500],c0:[0,500],changeDuration:[1,1440],targetChange:[0,1440],tech:[0,100],org:[0,100],proc:[0,100],performance:[1,100],reject:[0,100],avoidable:[0,100],margin:[0,100],monetization:[0,100],hours:[1,8760]};
const TIPS={
 changeDuration:'Du dernier bon produit de la série précédente au premier bon produit de la suivante, réglages et purges compris.',
 tech:'Pannes de presse, de moule ou de périphérique, en part des heures où la presse devait produire.',
 proc:'Arrêts dus au procédé : dérive de réglage, démarrage difficile, attente d’un réglage.',
 performance:'Cadence réelle ÷ cadence nominale. Une presse prévue à 100 cycles par heure qui en fait 92 est à 92 %.',
 avoidable:'Part des rebuts qu’un meilleur réglage aurait évitée. Les défauts venant de la matière ou du moule n’en font pas partie.',
 monetization:'Une heure gagnée ne rapporte que si vous pouvez la vendre. Carnet plein : proche de 100 %. Sinon, plus bas.',
 margin:'Ce qui reste du chiffre d’affaires après les coûts qui varient avec la production : matière, énergie, sous-traitance.',
 contribution:'Ce que rapporte une heure de presse en plus, une fois la matière et l’énergie payées.',
 cureTarget:'Le temps de cuisson se raccourcit seulement si le rhéomètre (T90) et les pièces le confirment, lot par lot.',
 deflashHours:'Heures passées à retirer les bavures à la main ou en reprise, sur un an.',
 mixIssues:'Lots de mélange qui ont bloqué une presse ou l’ont fait dériver, sur un an.'};
const F=(key,label,unit,hint,opt={})=>({key,label,unit,hint,...opt});
const fmt=v=>v==null||v===''?'':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:2});
const parse=t=>{t=String(t).replace(/[\s\u202f\u00a0]/g,'').replace(',','.');return t===''?null:(isFinite(+t)?+t:NaN);};
function check(k,v){if(v===null)return k==='caHour'?'':'Valeur requise.';if(Number.isNaN(v))return 'Saisissez un nombre.';if(v<0)return 'La valeur doit être positive.';const l=LIM[k]||(k.startsWith('presses.')?[0,500]:null);if(l&&(v<l[0]||v>l[1]))return `Entre ${fmt(l[0])} et ${fmt(l[1])}.`;return '';}
const steps=[
 {id:'intro'},
 {id:'parc',eyebrow:'Votre atelier',title:'Quelle est la taille de votre parc de presses ?',lead:'Choisissez le profil le plus proche. Vous pourrez détailler par classe de tonnage.',
  choices:Object.entries(PROFILES).map(([k,p])=>({value:k,label:p.label,big:p.n+' presses',d:p.d})),choiceKey:'profile',
  more:'Détailler par classe de tonnage',
  moreFields:()=>S.presses.map((p,i)=>F('presses.'+i+'.n',p.label,'presses','Nombre de presses de cette classe.'))
    .concat([F('hours','Heures requises par presse','h/an','5 000 h correspond à deux équipes. Appliqué à toutes les classes.')])},
 {id:'connect',eyebrow:'Connexion des presses',title:'Vos presses peuvent-elles transmettre leurs mesures ?',lead:'VP Expert dit quoi faire, sur toutes vos presses, sans connexion. VP Predict repère la dérive en direct, sur les presses qui transmettent leurs mesures : il rapporte le plus sur les presses critiques, celles qui concentrent rebuts chers et dérives. Deux questions : l’état de votre parc, puis ce que vous voulez simuler. Touchez « ? » pour savoir comment reconnaître vos presses.',
  choices:[{value:'none',label:'VP Expert seul',big:'Sans connexion',d:'Toutes les presses, aucun matériel'},{value:'critical',label:'Avec VP Predict',big:'3 presses critiques',d:'Là où les pertes se concentrent. Recommandé pour démarrer'},{value:'ready',label:'Avec VP Predict',big:'Presses connectables',d:'Euromap 77 et Euromap 63 seulement'},{value:'all',label:'Avec VP Predict',big:'Tout le parc',d:'Y compris les presses à mettre à niveau'}],choiceKey:'connMode',
  fields:[F('c77','Prêtes à connecter','presses','Sortie de données moderne : 0 € de matériel.',{tip:'<b>Euromap 77 (OPC UA)</b><br>Presses récentes, en général depuis 2016 à 2018 : écran tactile, prise réseau, option « OPC UA » ou « Euromap 77 » dans la commande. Exemples : Engel CC300, Arburg Gestica, KraussMaffei MC6.'}),
          F('c63','Connectables avec un adaptateur','presses','Environ 890 € par presse.',{tip:'<b>Euromap 63</b><br>Presses des années 2000 à 2015 : la commande sait exporter des fichiers de données, mais pas en OPC UA. Un boîtier adaptateur suffit. Exemples : Engel CC100 à CC200, Arburg Selogica récentes.'}),
          F('c0','Sans sortie de données','presses','Mise à niveau de 3 000 à 6 000 € par presse.',{tip:'<b>Sans interface</b><br>Presses anciennes ou commandes sans port réseau : il faut ajouter des capteurs et un boîtier. Si vous ne savez pas, gardez les valeurs proposées, nous vérifierons avec vous.'})],cols:true},
 {id:'changes',eyebrow:'Changements de série',title:'Combien de temps perdez-vous en changements de série ?',lead:'C’est souvent le premier gisement de capacité dans un atelier d’injection.',
  fields:[F('changes','Changements de série par an','par an','Total sur le parc. Exemple : 900 par an pour 20 presses.'),
          F('changeDuration','Durée moyenne d’un changement','min','Du dernier bon produit au premier bon produit suivant.'),
          F('targetChange','Durée visée après accompagnement','min','Objectif réaliste avec des réglages standardisés.')],cols:true},
 {id:'arrets',eyebrow:'Arrêts',title:'Quels autres arrêts pèsent sur vos presses ?',lead:'En pourcentage des heures requises. Si vous ne savez pas, gardez les valeurs proposées.',
  fields:[F('preventive','Maintenance préventive','h/an','Heures planifiées sur l’ensemble du parc.'),
          F('tech','Aléas techniques','%','Pannes, moules, périphériques.'),
          F('org','Aléas organisationnels','%','Attente matière, opérateur, planning.'),
          F('proc','Aléas process','%','Dérives de réglage, arrêts pour réajuster.')],cols:true,
  more:'Temps des régleurs pour trouver la cause',moreFields:()=>[F('diagHours','Temps de recherche de cause','h / presse / an','Heures passées par les régleurs et techniciens à chercher l’origine d’un défaut ou d’une dérive.',{tip:'<b>Temps de recherche de cause</b><br>Essais, réglages successifs, appels à un expert. 30 h par presse et par an, soit environ 2 h 30 par mois. VP Expert vise à en réduire une partie, le temps est réaffecté à d’autres tâches.'}),F('techRate','Coût horaire régleur','€/h','Coût chargé d’une heure de régleur ou de technicien.'),F('targetDiag','Temps de recherche évité','%','Part du temps de recherche que VP Expert permet d’éviter, avant scénario.')]},
 {id:'qualite',eyebrow:'Cadence et qualité',title:'Comment tournent vos presses quand elles produisent ?',lead:'La performance compare la cadence réelle à la cadence nominale.',
  fields:[F('performance','Performance (cadence réelle ÷ nominale)','%','92 % est un bon niveau sans pilotage fin.'),
          F('reject','Rebuts en nombre de pièces','%','Pièces jetées ou rebroyées.'),
          F('scrapCost','Coût annuel des rebuts','€/an','Au coût variable : matière, énergie, reprise. Sans les frais fixes.'),
          F('avoidable','Part de ce coût évitable par le réglage','%','La part liée au process, hors défauts matière ou moule.')],cols:true},
 {id:'valeur',eyebrow:'Valeur d’une heure',title:'Que vaut une heure de presse gagnée ?',lead:'Par défaut, nous partons du chiffre d’affaires observé sur le terrain pour votre parc.',
  fields:()=>[F('caHour','Chiffre d’affaires par heure de presse','€/h',`Laissez vide pour utiliser le repère terrain : environ ${num(C.benchmarkCA(S.presses))} €/h pour ce parc.`,{placeholder:num(C.benchmarkCA(S.presses))}),
          F('margin','Marge sur coûts variables','%','45 % est l’hypothèse prudente retenue, à valider avec vos chiffres.'),
          F('monetization','Part de la capacité gagnée réellement vendue','%','Si vos carnets sont pleins, montez vers 100 %.')],cols:false},
 {id:'scenario',eyebrow:'Ambition',title:'Quel scénario voulez-vous afficher ?',lead:'Le scénario prudent ne retient que la moitié des objectifs. C’est celui que nous recommandons pour une première discussion.',
  choices:[{value:'prudent',label:'Prudent',big:'50 %',d:'des objectifs retenus. Recommandé'},{value:'central',label:'Central',big:'75 %',d:'des objectifs retenus'},{value:'cible',label:'Ambitieux',big:'100 %',d:'des objectifs atteints'}],choiceKey:'scenario'},
 {id:'result'}
];

if(RUB){const g=id=>steps.find(x=>x.id===id);
 Object.assign(g('changes'),{lead:'En moulage caoutchouc, un changement de moule demande aussi la remise en température : c’est un gros gisement.',fields:[F('changes','Changements de moule par an','par an','Total sur le parc. Exemple : 200 par an pour 16 presses.'),F('changeDuration','Durée moyenne d’un changement','min','Remise en température comprise, jusqu’à la première bonne pièce.'),F('targetChange','Durée visée après accompagnement','min','Objectif réaliste avec préchauffage et réglages standardisés.')]});
 Object.assign(g('qualite'),{fields:[F('performance','Performance (cadence réelle ÷ nominale)','%','88 % est un niveau courant en caoutchouc.'),F('reject','Rebuts en nombre de pièces','%','Pièces rebutées, hors ébavurage.'),F('scrapCost','Coût annuel des rebuts','€/an','Au coût variable : mélange, énergie, reprise. Sans les frais fixes.'),F('avoidable','Part de ce coût évitable par le réglage','%','Hors défauts du mélange ou du moule.')]});
 steps.splice(steps.findIndex(x=>x.id==='valeur'),0,{id:'cuisson',eyebrow:'Cuisson, mélange, ébavurage',title:'Où partent les minutes propres au caoutchouc ?',lead:'Trois postes que la plasturgie n’a pas. Si vous ne savez pas, gardez les valeurs proposées.',
  fields:[F('cureTime','Temps de vulcanisation actuel','min','Temps de cuisson dans le moule, par cycle.'),F('cureTarget','Temps de vulcanisation visé','min','À valider au rhéomètre (T90) et sur pièces.'),F('handling','Manutention par cycle','min','Ouverture, démoulage, chargement.'),F('mixIssues','Lots de mélange non conformes','par an','Lots qui bloquent ou font dériver la presse.'),F('mixHours','Heures perdues par lot','h','Arrêt, purge, réglages de reprise.'),F('deflashHours','Heures d’ébavurage','h/an','Main-d’œuvre de reprise des bavures.'),F('deflashCost','Coût horaire de l’ébavurage','€/h','Chargé.')],cols:true});
 Object.assign(g('valeur'),{lead:'En caoutchouc, saisissez directement la marge dégagée par une heure de presse.',fields:()=>[F('contribution','Marge par heure de presse','€/h','40 €/h est une valeur d’exemple, pas un repère sectoriel : à remplacer par votre chiffre.'),F('monetization','Part de la capacité gagnée réellement vendue','%','Si vos carnets sont pleins, montez vers 100 %.')]});
}
const TOUCH=(navigator.maxTouchPoints||0)>0||matchMedia('(pointer:coarse)').matches;let i=0;const app=document.getElementById('app'),prev=document.getElementById('prev'),next=document.getElementById('next'),bar=document.getElementById('bar'),cnt=document.getElementById('stepcount'),nav=document.getElementById('nav');

function get(k){if(k==='hours')return S.presses[0].h;if(k.startsWith('presses.')){const[,a,b]=k.split('.');return S.presses[a][b];}return S[k];}
function set(k,v){if(k==='hours'){S.presses.forEach(p=>p.h=v);return;}if(k.startsWith('presses.')){const[,a,b]=k.split('.');S.presses[a][b]=v;S.profile='custom';return;}S[k]=v;}

function fieldHTML(f){const v=get(f.key),kn=KNOWN.has(f.key);return `<div class="field"><div class="flab"><label for="f-${f.key}">${f.label}${(f.tip=f.tip||TIPS[f.key])?`<button type="button" class="tip" aria-label="Explication"><span class="tipbox" role="tooltip" data-t="${f.tip}"></span></button>`:''}</label><span class="fb ${kn?'mine':''}">${kn?'Votre valeur':'Valeur type'}</span></div>
 <div class="inputrow"><input id="f-${f.key}" data-k="${f.key}" type="text" inputmode="decimal" autocomplete="off" value="${fmt(v)}" placeholder="${f.placeholder||''}"><span class="unit">${f.unit}</span></div>
 <p class="hint">${f.hint}  <button type="button" class="idk" data-idk="${f.key}"${kn?'':' hidden'}>Je ne sais pas, revenir à la valeur type</button></p><p class="ferr" role="alert"></p></div>`;}

function render(){
 const st=steps[i],total=steps.length-2;
 bar.style.width=(i/(steps.length-1)*100)+'%';
 cnt.textContent=i>0&&i<steps.length-1?`${i} / ${total}`:'';
 prev.style.visibility=i===0?'hidden':'visible';
 nav.style.display='flex';
 if(st.id==='intro')return renderIntro();
 if(st.id==='result')return renderResult();
 if(st.id==='connect'){const n=S.presses.reduce((a,p)=>a+(+p.n||0),0);if((+S.c77||0)+(+S.c63||0)+(+S.c0||0)!==n){S.c77=Math.round(n*.5);S.c63=Math.round(n*.3);S.c0=n-S.c77-S.c63;['c77','c63','c0'].forEach(k=>KNOWN.delete(k));}}
 let h=`<section class="screen${st.id==='connect'?' connect':''}"><p class="eyebrow"><b>${i}</b>${st.eyebrow}</p><h2>${st.title}</h2><p class="lead">${st.lead}</p>`;
 if(st.id==='connect'){h+=connectHTML();}else if(st.choices){h+=`<div class="choices">${st.choices.map((c,j)=>`<button type="button" class="choice" data-v="${c.value}" aria-pressed="${S[st.choiceKey]===c.value}"><span class="key">${String.fromCharCode(65+j)}</span><strong>${c.big}</strong><span class="n">${c.label}</span><span class="d">${c.d}</span></button>`).join('')}</div>`;}
 if(st.id==='parc')h+=`<div class="sect"><span class="sl">Votre secteur <i>(facultatif)</i></span><div class="chips">${SECTORS.map(x=>`<button type="button" class="chip" data-sec="${x}" aria-pressed="${S.sector===x}">${x}</button>`).join('')}</div></div>`;
 const fs=typeof st.fields==='function'?st.fields():st.fields;
 if(fs&&st.id!=='connect')h+=`<div class="fields ${st.id==='connect'?'three':st.cols?'two':''}">${fs.map(fieldHTML).join('')}</div>`;
 if(st.moreFields){h+=`<details class="more"${S.profile==='custom'?' open':''}><summary>${st.more}</summary><div class="fields two">${st.moreFields().map(fieldHTML).join('')}</div></details>`;
   const n=S.presses.reduce((a,p)=>a+(+p.n||0),0),t=C.priceTier(Math.max(n,1),S.activity);h+=`<p class="note">${n} presses au total · abonnement VP Expert : ${eur(t.price)} HT par an (${t.label}).</p>`;}
 h+=`<div id="err"></div></section>`;h+=`<aside class="live" id="live" aria-live="polite"></aside>`;
 app.innerHTML=h;next.textContent=i===steps.length-2?'Voir mes gains':'Continuer';
 app.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{if(st.id==='connect'){S.connMode=b.dataset.v;connUpd();return;}S[st.choiceKey]=b.dataset.v;if(st.choiceKey==='profile'){PROFILES[b.dataset.v].dist.forEach((n,k)=>S.presses[k].n=n);}render();if(!st.moreFields&&!st.fields)setTimeout(go,180);});
 app.querySelectorAll('[data-sec]').forEach(b=>b.onclick=()=>{S.sector=S.sector===b.dataset.sec?null:b.dataset.sec;app.querySelectorAll('[data-sec]').forEach(x=>x.setAttribute('aria-pressed',S.sector===x.dataset.sec));});
 app.querySelectorAll('.tip').forEach(t=>t.onclick=e=>{e.preventDefault();const o=t.classList.contains('open');app.querySelectorAll('.tip.open').forEach(x=>x.classList.remove('open'));if(!o)t.classList.add('open');});
 if(st.id==='connect')connUpd();
 app.querySelectorAll('[data-idk]').forEach(b=>b.onclick=()=>{const k=b.dataset.idk;KNOWN.delete(k);set(k,k==='hours'?DEF0.presses[0].h:DEF0[k]);render();});
 app.querySelectorAll('input:not([type=checkbox])').forEach(inp=>inp.onblur=()=>{const v=parse(inp.value);if(!Number.isNaN(v)&&v!==null)inp.value=fmt(v);});
 app.querySelectorAll('input:not([type=checkbox])').forEach(inp=>inp.oninput=()=>{const v=parse(inp.value),e=check(inp.dataset.k,v),box=inp.closest('.field');box.querySelector('.ferr').textContent=e;box.classList.toggle('bad',!!e);if(!e){const k=inp.dataset.k;set(k,v);const d=k==='hours'?DEF0.presses[0].h:k.startsWith('presses.')?undefined:DEF0[k],same=d!==undefined&&(v===d||(v===null&&d==null));if(same)KNOWN.delete(k);else KNOWN.add(k);const fb=box.querySelector('.fb');fb.textContent=same?'Valeur type':'Votre valeur';fb.classList.toggle('mine',!same);box.querySelector('.idk').hidden=same;}live();if(st.id==='connect')connUpd();if(st.moreFields){const n=S.presses.reduce((a,p)=>a+(+p.n||0),0),t=C.priceTier(Math.max(n,1),S.activity);app.querySelector('.note').textContent=`${n} presses au total · abonnement VP Expert : ${eur(t.price)} HT par an (${t.label}).`;}});
 live();const first=app.querySelector('.fields:not(details .fields) input');if(first&&window.innerWidth>640&&!TOUCH)first.focus({preventScroll:true});
}

function connectHTML(){const fs=steps.find(x=>x.id==='connect').fields;
 return `<h3 class="qh"><span>1</span>Combien de vos presses sont de chaque type ?</h3><div class="fields three">${fs.map(fieldHTML).join('')}</div><p class="note" id="cnote"></p>
 <h3 class="qh"><span>2</span>Que voulez-vous simuler ?</h3><div class="choices" id="cchoices"></div><div class="offerchk" id="offerchk" style="margin:14px 0 4px"></div><h3 class="qh"><span>3</span>Comment voulez-vous démarrer ?</h3><label class="aidchk" style="display:flex;gap:10px;align-items:flex-start;margin:10px 0 4px;font-size:.95em"><input type="checkbox" id="entryScan" ${S.entry==='scan'?'checked':''} style="width:20px;height:20px;margin-top:2px"><span><b>Commencer par un VP Scan</b> (10 000 € HT, 2 jours sur site) : vos pertes chiffrées presse par presse et vos priorités avant tout abonnement. La mise en place VP Expert (8 000 €) est alors offerte.</span></label><label class="aidchk" style="display:flex;gap:10px;align-items:flex-start;margin:10px 0 4px;font-size:.95em"><input type="checkbox" id="aidPilot" ${S.aidPilot?'checked':''} style="width:20px;height:20px;margin-top:2px"><span>Usine en Auvergne-Rhône-Alpes : déduire l’aide « Industrie du Futur » (50 % de l’accompagnement, jusqu’à 16 000 €) du VP Scan et du pilote VP Predict, sous réserve d’éligibilité.</span></label><div class="csum" id="csum" aria-live="polite"></div>`;}
function connUpd(){const n=S.presses.reduce((a,p)=>a+(+p.n||0),0),a=+S.c77||0,b=+S.c63||0,c=+S.c0||0,t=a+b+c;
 const note=document.getElementById('cnote');if(!note)return;note.textContent=`${t} presses réparties sur ${n} dans votre parc${t!==n?' : corrigez la répartition':''}.`;note.classList.toggle('warn',t!==n);
 const kc=Math.min(a+b,Math.max(3,Math.round(+S.predictK||3)));const opts=[{v:'none',tag:'ex',t:'VP Expert seul',big:'Sans connexion',d:`Dit quoi faire, sur vos ${n} presses, sans matériel ni connexion.`},{v:'critical',tag:'pr',t:'Avec VP Predict',big:`+ VP Predict sur ${kc} presses critiques`,d:`Les presses qui concentrent rebuts chers et dérives : le meilleur rendement de l’abonnement. ${a+b<3?'Il faut au moins 3 presses connectables.':'Recommandé pour démarrer.'}`},{v:'ready',tag:'pr',t:'Avec VP Predict',big:`+ VP Predict sur ${a+b} presses`,d:`Repère la dérive sur les presses prêtes et celles avec adaptateur. Matériel : ${b} adaptateurs.`},{v:'all',tag:'pr',t:'Avec VP Predict',big:`+ VP Predict sur ${t} presses`,d:`Repère la dérive sur tout le parc, dont ${c} presses à mettre à niveau.`}];
 const box=document.getElementById('cchoices');box.innerHTML=opts.map((o,k)=>`<button type="button" class="choice" data-v="${o.v}" aria-pressed="${S.connMode===o.v}"><span class="key">${'ABCD'[k]}</span><em class="stag ${o.tag}">${o.t}</em><strong>${o.big}</strong><span class="d">${o.d}</span></button>`).join('');
 box.querySelectorAll('.choice').forEach(x=>x.onclick=()=>{S.connMode=x.dataset.v;connUpd();});const oc=document.getElementById('offerchk');if(oc){oc.style.display=S.connMode==='none'?'none':'';oc.innerHTML=`<p style="margin:0 0 6px;font-weight:600">Tarif VP Predict</p><p class="note" style="margin-top:6px">En plus de VP Expert. Pilote de 3 mois : 20 000 € + 7 000 € par presse pilote (${RUB?'3':'2'} conseillées), dont <b>50 % crédités sur l’abonnement de la première année</b> si vous poursuivez. Ensuite, abonnement hybride : 250 € par mois pour le site + 100 € par presse connectée et par mois, 3 presses minimum, plus 25 % des économies de rebuts vérifiées que VP Predict vous fait réaliser. L’abonnement ne démarre que si le pilote mesure un gain d’au moins 2 fois son prix. Presses ajoutées après le pilote : 4 000 € + 600 € par presse.</p>${S.connMode==='critical'?`<div class="fields" style="margin-top:10px"><div class="field" style="max-width:320px"><div class="flab"><label for="f-predictK">Presses sous VP Predict</label><span class="fb ${S.predictK?'mine':''}">${S.predictK?'Votre valeur':'Valeur type'}</span></div><div class="inputrow"><input id="f-predictK" type="text" inputmode="numeric" autocomplete="off" value="${kc}"><span class="unit">presses</span></div><p class="hint">Vos presses les plus critiques, parmi les ${a+b} connectables. 3 au minimum.</p></div></div>`:''}`;const pk=document.getElementById('f-predictK');if(pk)pk.onchange=()=>{S.predictK=Math.max(3,Math.round(+pk.value||3));connUpd();};}const es=document.getElementById('entryScan');if(es)es.onchange=()=>{S.entry=es.checked?'scan':'direct';connUpd();};const ak=document.getElementById('aidPilot');if(ak)ak.onchange=()=>{S.aidPilot=ak.checked;connUpd();};
 const r=C.calculate(JSON.parse(JSON.stringify(S)));const sum=document.getElementById('csum');
 if(r.errors&&r.errors.length||r.net==null){sum.innerHTML='';return;}
 sum.innerHTML=r.conn?`<b>Avec ce choix :</b> gain net ${eur(r.net)} par an (dont ${eur(r.net-r.netRA)} apportés par VP Predict, soit ${num(r.conn.ratio,1)} × son abonnement) · démarrage ${eur(r.upfront)}, dont ${r.scan?`VP Scan ${eur(r.scan-r.aidScan)}, `:''}pilote ${eur(r.conn.poc)}${r.conn.aid?' après aide':''}${r.conn.ext?`, mise en service des autres presses ${eur(r.conn.ext)}`:''} et connexion ${eur(r.conn.hw[1])} · ${eur(r.conn.credit)} du pilote crédités sur la première année · rentabilisé en ${r.payback?r.payback+' mois':'plus de 36 mois'}.`:`<b>Avec ce choix :</b> gain net ${eur(r.net)} par an · démarrage ${eur(r.upfront)}${r.scan?` dont VP Scan ${eur(r.scan-r.aidScan)}, mise en place offerte`:''} · rentabilisé en ${r.payback?r.payback+' mois':'plus de 36 mois'}. Aucun pilote ni matériel.`;
 live();}

function live(){const el=document.getElementById('live');if(!el)return;const r=C.calculate(JSON.parse(JSON.stringify(S)));
 if(r.errors&&r.errors.length||r.net==null){el.innerHTML='<span class="ll">Estimation en cours</span><strong>—</strong>';return;}
 const q=rel(),[lo,hi]=range(r,S);el.innerHTML=`<span class="ll">Gain net estimé · scénario ${SL[S.scenario]}</span><strong>${eur(r.net)}<small> / an</small></strong><span class="lp">Fourchette ${eur(lo)} à ${eur(hi)} · rentabilisé en ${r.payback?r.payback+' mois':'plus de 36 mois'}</span><span class="rel ${q.c}">${q.k}/${CORE.length} valeurs saisies · fourchette ± ${Math.round(q.u*100)} % avant vérification avec vous</span>${(()=>{const z=noSale();return z&&z.net!=null?`<span class="lp nosale">Sans vente de la capacité récupérée : ${eur(z.net)} / an</span>`:'';})()}`;}
function saveSum(r){const a=document.getElementById('topoc');if(!a)return;const q=new URLSearchParams();if(RUB)q.set('secteur','caoutchouc');q.set('n',r.n);q.set('net',Math.round(r.net));q.set('c77',+S.c77||0);q.set('c63',+S.c63||0);q.set('scen',S.scenario);q.set('mode',S.connMode||'none');q.set('k',r.conn?r.conn.k:0);if(S.entry==='scan')q.set('scan','1');if(S.aidPilot)q.set('aid','1');
 try{const x=JSON.parse(JSON.stringify(S));x.scenario='prudent';const k0=(+r.c77||0)+(+r.c63||0);if(k0>0&&(!x.connMode||x.connMode==='none'))x.connMode=k0>=3?'critical':'ready';const z=C.calculate(x);
  if(!(z.errors&&z.errors.length)&&z.grossAll!=null&&z.n>0){const c=z.conn,R=v=>Math.round(v*10)/10;
   q.set('pn',Math.round(z.net));q.set('pr',R(z.grossAll/z.costAll));q.set('pc',Math.round(z.costAll));if(c){q.set('pk',c.k);q.set('ls',Math.round(c.lossShare*100));q.set('pa',Math.round(c.abo));q.set('pf',Math.round(c.aboFixed));q.set('pv',Math.round(c.aboVar));q.set('pg',Math.round(c.gross));q.set('cr',Math.round(c.credit));}
   q.set('e1',Math.round((z.qualityGain||0)/z.n));q.set('e2',c&&c.k?Math.round(c.scrap/c.k):0);
   q.set('h1',R((z.equivalent||0)/z.n+(c&&c.k&&z.P!=null?c.predH*z.P*z.Q/c.k:0)));
   q.set('d1',R((+x.diagHours||0)*(+x.targetDiag||0)/100*z.f));
   q.set('i1',Math.round((z.scrapCost||0)/z.n));q.set('i2',R(z.H*((+x.tech||0)+(+x.proc||0))/100/z.n));q.set('i3',R(+x.diagHours||0));q.set('rj',+x.reject||0);q.set('trs',R(z.trs||0));}}catch(e){}
 a.href='pilote.html?'+q;}
function renderIntro(){
 app.innerHTML=`<section class="screen"><p class="eyebrow">Simulateur · ${RUB?'Moulage caoutchouc':'Injection thermoplastique'}</p>
 <h1>Combien votre atelier peut‑il gagner avec VP Expert ?</h1>
 <p class="lead">${RUB?'Huit':'Sept'} questions sur votre parc, vos arrêts et vos rebuts. Tout est prérempli avec des valeurs types : corrigez seulement ce que vous connaissez. La fourchette reste large (± 35 %) tant que les chiffres n’ont pas été vérifiés avec vous.</p>
 <div class="intro-meta"><span>3 minutes</span><span>Calcul dans votre navigateur, rien n’est envoyé</span><span>Formules visibles</span></div>
<ol class="gflow" aria-label="Déroulé de l’estimation"><li><span class="gi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V9l4 3V9l4 3V9l4 3v8M17 6h2v3"/></svg></span><b>Votre parc</b><small>presses, équipes, cadence</small></li><li><span class="gi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18l5-6 4 3 7-9M15 6h5v5"/></svg></span><b>Vos pertes</b><small>arrêts, rebuts, changements</small></li><li><span class="gi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M17 7H9.5a3 3 0 000 6h5a3 3 0 010 6H6"/></svg></span><b>Votre gain net</b><small>fourchette et retour sur investissement</small></li></ol>
 <div class="btns" style="display:flex;flex-wrap:wrap;gap:10px"><button class="btn primary" id="start" type="button">Commencer l’estimation</button><button class="btn ghost" id="express" type="button">Estimation express : voir un cas type en 10 secondes</button></div>
 <div class="shortcut"><span>Vous avez un défaut sur une presse en ce moment ?</span><a class="btn ghost" href="${RUB?'enquete-caoutchouc.html':'enquete.html'}">J’ai un défaut : trouver la cause</a></div></section>`;
 nav.style.display='none';document.getElementById('start').onclick=go;document.getElementById('express').onclick=()=>{i=steps.length-1;render();window.scrollTo(0,0);};
}

function validateStep(){
 const st=steps[i];if(app.querySelector('.field.bad')){app.querySelector('.field.bad input').focus();return false;}if(!st.fields&&!st.moreFields)return true;
 const r=C.calculate(JSON.parse(JSON.stringify(S)));
 if(r.errors&&r.errors.length&&i>=steps.length-3){document.getElementById('err').innerHTML=`<div class="err">${r.errors[0]}</div>`;return false;}
 return true;
}
function go(){if(i>0&&i<steps.length-1&&!validateStep())return;if(i<steps.length-1){i++;render();window.scrollTo(0,0);}}
function back(){if(i>0){i--;render();window.scrollTo(0,0);}}
prev.onclick=back;next.onclick=go;
[[prev,back],[next,go]].forEach(([el,fn])=>{let y0=null;el.addEventListener('touchstart',e=>{y0=e.touches[0].clientY;},{passive:true});el.addEventListener('touchend',e=>{const t=e.changedTouches[0];if(y0===null||Math.abs(t.clientY-y0)>12)return;y0=null;e.preventDefault();const a=document.activeElement;if(a&&a.blur)a.blur();fn();},{passive:false});});
document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&steps[i].id!=='result'&&!e.target.matches('button,summary')){e.preventDefault();go();}
 const st=steps[i];if(st.choices&&/^[a-dA-D]$/.test(e.key)&&e.target.tagName!=='INPUT'){const b=app.querySelectorAll('.choice')[e.key.toUpperCase().charCodeAt(0)-65];b&&b.click();}
});

function chart(cash){
 const W=520,H=210,p=30,pt=22,min=Math.min(...cash,0),max=Math.max(...cash,1),x=k=>p+k*(W-2*p)/36,y=v=>H-p-(v-min)/(max-min||1)*(H-p-pt);
 const pts=cash.map((v,k)=>`${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
 const z=y(0);let pb=cash.findIndex(v=>v>=0);const lo=cash.reduce((m,v,k)=>v<cash[m]?k:m,0);
 const area=`${x(0).toFixed(1)},${z.toFixed(1)} ${pts} ${x(36).toFixed(1)},${z.toFixed(1)}`;
 return `<svg class="chart c2" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trésorerie cumulée sur 36 mois">
 <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b4f" stop-opacity=".28"/><stop offset="1" stop-color="#2f6b4f" stop-opacity="0"/></linearGradient><clipPath id="cpos"><rect x="0" y="0" width="${W}" height="${z}"/></clipPath><clipPath id="cneg"><rect x="0" y="${z}" width="${W}" height="${H-z}"/></clipPath></defs>
 <g stroke="#0b111c" stroke-opacity=".07">${[12,24].map(m=>`<line x1="${x(m)}" x2="${x(m)}" y1="${pt}" y2="${H-p}"/>`).join('')}</g>
 <polygon points="${area}" fill="url(#cg)" clip-path="url(#cpos)"/><polygon points="${area}" fill="#aa352b" fill-opacity=".10" clip-path="url(#cneg)"/>
 <line x1="${p}" x2="${W-p}" y1="${z}" y2="${z}" stroke="#8e98a8" stroke-dasharray="3 5"/>
 <polyline points="${pts}" fill="none" stroke="#aa352b" stroke-width="2.5" stroke-linejoin="round" clip-path="url(#cneg)"/>
 <polyline points="${pts}" fill="none" stroke="#2f6b4f" stroke-width="3" stroke-linejoin="round" clip-path="url(#cpos)"/>
 ${lo>0&&cash[lo]<0?`<text x="${x(lo)+16}" y="${y(cash[lo])+14}" text-anchor="middle" font-size="11" fill="#aa352b" font-family="IBM Plex Mono">${eur(cash[lo])}</text>`:''}
 ${pb>0?`<circle cx="${x(pb)}" cy="${y(cash[pb])}" r="9" fill="#2f6b4f" fill-opacity=".18"/><circle cx="${x(pb)}" cy="${y(cash[pb])}" r="4.5" fill="#2f6b4f" stroke="#fff" stroke-width="2"/><text x="${x(pb)-12}" y="${y(cash[pb])-10}" text-anchor="end" font-size="12" fill="#2f6b4f" font-family="General Sans, IBM Plex Sans" font-weight="600">Rentabilisé · mois ${pb}</text>`:''}
 ${[0,12,24,36].map(m=>`<text x="${x(m)}" y="${H-8}" font-size="11" fill="#5a6676" text-anchor="${m===0?'start':m===36?'end':'middle'}" font-family="IBM Plex Mono">${m===0?'Mois 0':m}</text>`).join('')}
 <text x="${W-p}" y="${y(cash[36])-10}" font-size="13" fill="#173a6b" text-anchor="end" font-family="General Sans, IBM Plex Sans" font-weight="600">${eur(cash[36])}</text></svg>`;
}

let HYPD=null;
async function makePDF(r,s,G){
 if(!window.VellaPDF)throw new Error('pdf');
 const b=document.getElementById('pdf');if(b){b.disabled=true;b.textContent='Préparation du PDF…';}
 try{
  const scenarios=['prudent','central','cible'].map(k=>{const x=JSON.parse(JSON.stringify(S));x.scenario=k;const q=C.calculate(x);return {k,name:SL[k][0].toUpperCase()+SL[k].slice(1),f:C.scenarioFactors[k],net:q.net,payback:q.payback,ratio:q.grossAll/q.costAll};});
  await window.VellaPDF({r,s,G,eur,num,SL,RUB,CORE:CORE.length,relK:rel().k,range:range(r,s),groups:HYPD||[],scenarios,factors:C.scenarioFactors});
 }finally{if(b){b.disabled=false;b.textContent='Télécharger la synthèse (PDF)';}}
}
function hypHTML(r,s,G){if(r.grossAll==null)return '';
 const kn=k=>KNOWN.has(k),O={v:['vous','Vous'],t:['type','Valeur type'],b:['bench','Repère terrain'],h:['vella','Hypothèse Vella Partners'],p:['tarif','Tarif Vella Partners'],c:['calc','Calculé']};
 const o=(k,d)=>kn(k)?'v':d,pc=v=>num(v,v%1?1:0)+' %',row=(l,v,src,f='')=>({l,v,src,f});
 const parc=[row('Presses',r.n+' presses',s.profile==='custom'||kn('presses')?'v':'t',s.profile==='custom'?'Répartition saisie':'Profil '+(PROFILES[s.profile]?PROFILES[s.profile].label.toLowerCase():'type')),
  row('Heures requises par presse',num(s.presses[0].h)+' h/an',o('hours','t')),
  row(RUB?'Changements de moule':'Changements de série',num(s.changes)+' par an',o('changes','t')),
  row('Durée d’un changement',num(s.changeDuration)+' min',o('changeDuration','t')),
  row('Maintenance préventive',num(s.preventive)+' h/an',o('preventive','t')),
  row('Aléas techniques · organisationnels · process',`${pc(s.tech)} · ${pc(s.org)} · ${pc(s.proc)}`,['tech','org','proc'].every(kn)?'v':['tech','org','proc'].some(kn)?'v':'t',['tech','org','proc'].every(kn)||!['tech','org','proc'].some(kn)?'':'En partie saisis'),
  row('Performance',pc(s.performance),o('performance','t')),
  row('Rebuts en pièces',pc(s.reject),o('reject','t'))];
 if(RUB)parc.push(row('Vulcanisation · manutention',`${num(s.cureTime,1)} min · ${num(s.handling,1)} min`,kn('cureTime')?'v':'t'),row('Lots de mélange non conformes',`${num(s.mixIssues)} lots × ${num(s.mixHours,1)} h`,kn('mixIssues')?'v':'t'),row('Ébavurage',`${num(s.deflashHours)} h × ${num(s.deflashCost)} €/h`,kn('deflashHours')?'v':'t'));
 const eco=[row('Coût annuel des rebuts',eur(r.scrapCost),o('scrapCost','t')),row('Part évitable par le réglage',pc(s.avoidable),o('avoidable','t'))];
 if(!RUB){eco.push(row('Chiffre d’affaires par heure de presse',num(r.caHourUsed)+' €/h',kn('caHour')?'v':'b',kn('caHour')?'':'Moyenne pondérée par classe de presses'),row('Marge sur coûts variables',pc(s.margin),o('margin','t')));}
 eco.push(row('Marge par heure de presse',num(r.contribution)+' €/h',RUB?o('contribution','t'):'c',RUB?'':'CA horaire × marge ÷ (performance × qualité)'),
  row('Part de la capacité gagnée réellement vendue',pc(s.monetization),o('monetization','t'),'Hypothèse la plus sensible : voir le test ci-dessous'),
  row('Recherche de cause · coût régleur',`${num(s.diagHours)} h/presse · ${num(s.techRate)} €/h`,kn('diagHours')||kn('techRate')?'v':'t'));
 const obj=[row('Scénario',`${SL[s.scenario][0].toUpperCase()+SL[s.scenario].slice(1)} : ${num(r.f*100)} % des objectifs`,'h','Appliqué à chaque objectif'),
  row('Durée de changement visée',num(s.targetChange)+' min',o('targetChange','h')),
  row('Réduction des aléas techniques · organisationnels · process',`${pc(s.targetTech)} · ${pc(s.targetOrg)} · ${pc(s.targetProc)}`,'h'),
  row('Performance visée',pc(s.targetPerformance),'h'),
  row('Réduction du coût évitable des rebuts',pc(s.targetQuality),'h'),
  row('Temps de recherche de cause évité',pc(s.targetDiag),o('targetDiag','h'))];
 if(RUB)obj.push(row('Vulcanisation visée',num(s.cureTarget,1)+' min',o('cureTarget','h'),'À valider au rhéomètre'),row('Réduction lots de mélange · ébavurage',`${pc(s.targetMix)} · ${pc(s.targetDeflash)}`,'h'));
 obj.push(row('Part adressable par VP Expert',`changements ${s.addressChange} · techniques ${s.addressTech} · organisation ${s.addressOrg} · process ${s.addressProc} · performance ${s.addressPerf} · qualité ${s.addressQuality}${RUB?` · cuisson ${s.addressCure} · mélange ${s.addressMix} · ébavurage ${s.addressDeflash}`:''} (%)`,'h','Ce que l’outil peut traiter, le reste dépend d’autres leviers'));
 const cal=[row('Abonnement VP Expert',eur(s.annualCost)+' / an','p','Tranche de '+r.n+' presses, facturé à la mise en service'),
  row('Mise en place VP Expert',r.scan?'offerte après VP Scan':eur(s.investment),'p'),row('Temps interne au démarrage',eur(s.internalCost),'t'),
  row('Premiers gains et début de l’abonnement','Mois '+s.startMonth,'h'),row('Montée en charge',s.rampMonths+' mois','h','Gain linéaire jusqu’à la pleine charge')];
 if(r.conn)cal.push(row('VP Predict · rebuts restants évités','25 %','h'),row('VP Predict · énergie','1 000 € par presse connectée','h','Forfait, à mesurer au pilote'),row('VP Predict · aléas restants traités','30 % process · 10 % techniques','h'),row('VP Predict · presses critiques',r.conn.focus?`${r.conn.k} presses portent ${num(r.conn.lossShare*100)} % des pertes restantes`:`${r.conn.k} presses sur ${r.n}, au prorata`,'h','Hypothèse Pareto modérée : (k ÷ n)^0,5, à mesurer au pilote'),row('Abonnement VP Predict',`${eur(r.conn.aboFixed)} fixe + ${eur(r.conn.aboVar)} variable / an`,'p','250 €/mois site + 100 €/presse/mois + 25 % des rebuts évités vérifiés'),row('Pilote VP Predict',eur(r.conn.pocBase)+(r.conn.aid?` − ${eur(r.conn.aid)} d’aide`:'')+` · ${eur(r.conn.credit)} crédités en année 1`,'p'),row('Connexion des presses',eur(r.conn.hw[1]),'t','Valeur centrale'));
 if(r.scan)cal.unshift(row('VP Scan',eur(r.scan)+(r.aidScan?` − ${eur(r.aidScan)} d’aide`:''),'p','Diagnostic chiffré du site, 2 jours sur place'));
 const groups=[['Votre parc et vos pertes',parc],['Valeur économique',eco],['Objectifs d’amélioration',obj],['Coûts et calendrier',cal]];HYPD=groups;
 const all=groups.flatMap(g=>g[1]),cnt=k=>all.filter(x=>x.src===k).length;
 // calendrier du retour (lecture de la trésorerie déjà calculée)
 const st=s.startMonth,full=Math.min(36,st+s.rampMonths-1),pb=r.payback;let lo=0,lm=0;r.cash.forEach((v,m)=>{if(v<lo){lo=v;lm=m;}});
 const seg=m=>m<st?'w':m<=full?'r':'f';
 const bar=Array.from({length:36},(_,j)=>{const m=j+1;return `<i class="${seg(m)}${m===pb?' pb':''}${m===lm&&lm>0?' lo':''}" title="Mois ${m}"></i>`;}).join('');
 const steps=[[0,'Démarrage',`${eur(r.upfront)} payés une fois`],[st,'Premiers gains',`L’abonnement de ${eur(r.costAll)} par an commence aussi`],[full,'Pleine charge',`Après ${s.rampMonths} mois de montée progressive`],[lm,'Trésorerie au plus bas',eur(lo)],[pb,'Retour sur investissement',pb?'Trésorerie cumulée repassée à zéro':'Pas atteint en 36 mois']].filter(x=>x[0]!==null).sort((a,b)=>(a[0]??99)-(b[0]??99));
 // test capacité vendue nulle (même moteur, seule la part vendue passe à 0)
 const z=JSON.parse(JSON.stringify(S));z.monetization=0;const q=C.calculate(z),capFull=s.monetization>0?G.cap/(s.monetization/100):0,needSold=capFull>0?Math.max(0,(r.costAll-G.eco-G.op)/capFull*100):null;
 const zt=q.net>=0&&q.payback?['good','Rentable même sans vente']:q.net>=0?['mid','Couvre l’abonnement, pas le démarrage en 3 ans']:['bad','Dépend de la vente de capacité'];
 return `<div class="card hyp"><div class="behead"><h3>Fiche des hypothèses et du retour</h3><span class="cap" style="margin:0">Chaque valeur utilisée, son origine, et le chemin jusqu’au retour</span></div>
 <h4 class="hyh">Le chemin du retour</h4>
 <div class="tl" role="img" aria-label="Calendrier sur 36 mois">${bar}</div>
 <div class="tlax"><span style="grid-column:1">Mois 1</span><span style="grid-column:12">12</span><span style="grid-column:24">24</span><span style="grid-column:36">36</span></div>
 <div class="tlleg"><span><i class="w"></i>Mise en place, sans gain</span><span><i class="r"></i>Montée en charge</span><span><i class="f"></i>Pleine charge</span>${pb?'<span><i class="pbk"></i>Retour</span>':''}${lm>0?'<span><i class="lod"></i>Trésorerie au plus bas</span>':''}</div>
 <ol class="tls">${steps.map(x=>`<li><b>${x[0]===0?'Mois 0':'Mois '+x[0]}</b><span>${x[1]}</span><small>${x[2]}</small></li>`).join('')}</ol>
 <div class="tlc">${[12,24,36].map(m=>`<div><span>Trésorerie cumulée à ${m} mois</span><b class="${r.cash[m]<0?'neg':''}">${eur(r.cash[m])}</b></div>`).join('')}</div>
 <h4 class="hyh">Test : aucune heure récupérée n’est vendue</h4>
 <div class="zt"><div><p>Si la capacité retrouvée ne se transforme pas en ventes, il reste les économies et le temps libéré.</p><span class="badge ${zt[0]}">${zt[1]}</span></div>
  <div class="ztv"><div><span>Gain net annuel</span><b class="${q.net<0?'neg':''}">${eur(q.net)}</b></div><div><span>Délai de retour</span><b>${q.payback?q.payback+' mois':'> 36 mois'}</b></div><div><span>Part vendue nécessaire pour couvrir l’abonnement</span><b>${needSold==null?'—':needSold<=0?'Aucune':num(needSold)+' %'}</b><small>Hypothèse actuelle : ${s.monetization} %</small></div></div></div>
 <details class="hyd"${matchMedia('(min-width:761px)').matches?' open':''}><summary><span class="hyh">Les ${all.length} hypothèses utilisées</span><span class="hyt">Afficher ou masquer</span></summary>
 <div class="hyleg">${['v','t','b','h','p','c'].filter(k=>cnt(k)).map(k=>`<span class="og ${O[k][0]}">${O[k][1]} · ${cnt(k)}</span>`).join('')}</div>
 <div class="hyg">${groups.map(g=>`<div class="hygr"><h5>${g[0]}</h5>${g[1].map(x=>`<div class="hyr"><div><span class="hl">${x.l}</span>${x.f?`<small>${x.f}</small>`:''}</div><div class="hv"><b>${x.v}</b><span class="og ${O[x.src][0]}">${O[x.src][1]}</span></div></div>`).join('')}</div>`).join('')}</div></details>
 <p class="cap" style="margin:12px 0 0">Vous : saisi dans ce simulateur. Valeur type : valeur de départ illustrative, à remplacer. ${RUB?'':'Repère terrain : CA horaire observé chez des industriels de la plasturgie. '}Hypothèse Vella Partners : objectif ou paramètre de méthode, mesuré pendant le pilote. Aucune de ces lectures ne modifie le calcul.</p>
 </div>`;}
function renderResult(){
 nav.style.display='none';
 const s=JSON.parse(JSON.stringify(S)),r=C.calculate(s);if(!r.errors||!r.errors.length)setTimeout(()=>saveSum(r),0);
 if(r.errors&&r.errors.length){app.innerHTML=`<section class="screen"><h2>Il manque une information</h2><div class="err">${r.errors.join('<br>')}</div></section>`;return;}
 const ratio=r.grossAll/r.costAll,cls=ratio>=3?'good':ratio>=2?'mid':'bad',rtxt=ratio>=3?'Objectif atteint':ratio>=2?'Seuil d’engagement':'Sous le seuil';const mtxt=ratio>2.5?['good','Marge confortable']:ratio>=2?['mid','Marge réduite']:['bad','Marge faible'];
 const contrib=r.contribution;
 const G=(()=>{const c=r.conn||{scrap:0,energy:0,other:0,predH:0},eco=(r.qualityGain||0)+c.scrap+c.energy,op=(r.diagGain||0)+(r.deflashGain||0),cap=(r.capacityGain||0)+c.other,capH=(r.equivalent||0)+(r.conn&&r.P!=null?c.predH*r.P*r.Q:0);
  const pb=g=>{let cash=-r.upfront;for(let m=1;m<=36;m++){const ramp=m<s.startMonth?0:Math.min(1,(m-s.startMonth+1)/s.rampMonths);cash+=g/12*ramp-(m>=s.startMonth?r.costAll/12-(m<s.startMonth+12?(r.credit||0)/12:0):0);if(cash>=0)return m;}return null;};
  const lv=[{k:'Économies évitables seules',g:eco},{k:'+ gains opérationnels',g:eco+op},{k:'+ capacité récupérée et vendue',g:eco+op+cap}].map(x=>({...x,net:x.g-r.costAll,pb:pb(x.g),cov:r.costAll>0?x.g/r.costAll*100:null}));
  return {eco,op,cap,capH,lv};})();
 app.innerHTML=`<section class="screen wide">
 <p class="printhead">Vella Partners · Estimation VP Expert · ${new Date().toLocaleDateString("fr-FR")}</p><p class="eyebrow">Votre estimation · scénario ${SL[s.scenario]}</p>
 <div class="scen" role="group" aria-label="Scénario affiché en détail">${['prudent','central','cible'].map(k=>`<button type="button" data-s="${k}" aria-pressed="${s.scenario===k}">${SL[k][0].toUpperCase()+SL[k].slice(1)}</button>`).join('')}</div>
 <div class="hero h3">
  <div><p class="lbl">Gain net annuel, en année pleine</p><p class="big">${eur(r.net)}</p>
   <p class="sub">Soit <b>${eur(r.netPerPress)} par presse et par an</b>, après ${r.conn?`les abonnements de ${eur(r.costAll)} HT par an`:`l’abonnement de ${eur(s.annualCost)} HT par an`}, pour ${r.n} presses${r.conn?` dont ${r.conn.k} en VP Predict`:''}. Montants HT, avant impôt.</p>
   <p class="rng">Fourchette : <b>${eur(range(r,s)[0])}</b> à <b>${eur(range(r,s)[1])}</b> par an · ± 35 % avant vérification de vos chiffres</p>${(()=>{const z=noSale();if(!z||z.net==null)return '';const ratio=r.costAll>0?(z.net+r.costAll)/r.costAll:null;return `<p class="nosale"><b>Sans vente de la capacité récupérée :</b> ${eur(z.net)} net par an${ratio!=null?` (${num(ratio,1)} × l’abonnement)`:''} · ${z.net>=0?'économies et temps libéré couvrent l’abonnement':'dépend de la vente de capacité'}.</p>`;})()}
   <p class="relbox"><span class="rel ${rel().c}">${rel().k} valeur${rel().k>1?'s':''} sur ${CORE.length} ${rel().k>1?'viennent':'vient'} de vous</span>${rel().k<CORE.length?' <button type="button" class="idk" id="tighten">Préciser mes valeurs</button>':''}</p></div>
  <div class="kpis k3">
   <div class="kpi"><div class="v">${r.payback?r.payback+' mois':'> 36 mois'}</div><div class="k">Délai de retour, démarrage de ${eur(r.upfront)} compris</div></div>
   <div class="kpi"><div class="v">${num(ratio,1)} ×</div><div class="k">Gain brut ÷ abonnement${r.conn?"s":""}</div><span class="badge ${cls}">${rtxt}</span></div>
   <div class="kpi"><div class="v">${num(r.projectedTrs,1)} %</div><div class="k">TRS projeté, contre ${num(r.trs,1)} % aujourd’hui</div></div>
  </div>
 </div>
${(()=>{if(r.grossAll==null)return '';const g=r.grossAll,w=v=>Math.max(0,v/g*100),am=Math.min(100,r.costAll/g*100);
 return `<div class="syn">
 <div class="card orig"><div class="behead"><h3>D’où vient le gain</h3><span class="cap" style="margin:0">Du plus sûr au plus dépendant de vos ventes</span></div>
  <div class="obar" role="img" aria-label="Répartition du gain brut"><i class="e" style="width:${w(G.eco)}%"></i><i class="o" style="width:${w(G.op)}%"></i><i class="c" style="width:${w(G.cap)}%"></i><b class="abo" style="left:${am}%"><span>Abonnement${r.conn?'s':''} ${eur(r.costAll)}</span></b></div>
  <div class="orow"><i class="e"></i><div><b>Économies évitables</b><small>Rebuts, matière${r.conn?', énergie':''} : des dépenses en moins</small></div><span>${eur(G.eco)}</span></div>
  <div class="orow"><i class="o"></i><div><b>Temps régleur libéré</b><small>Recherche de cause évitée, à réaffecter</small></div><span>${eur(G.op)}</span></div>
  <div class="orow"><i class="c"></i><div><b>Capacité récupérée et vendue</b><small>${num(G.capH)} h de presse retrouvées, ${s.monetization} % vendues</small></div><span>${eur(G.cap)}</span></div>
  <div class="osum"><span>Gain brut <b>${eur(r.grossAll)}</b></span><span>− abonnement${r.conn?'s':''} <b>${eur(r.costAll)}</b></span><span class="net">= <b>${eur(r.net)}</b> net par an</span></div>
 </div>
 <div class="card cashc"><div class="behead"><h3>Trésorerie cumulée sur 3 ans</h3><span class="cap" style="margin:0">Démarrage ${eur(r.upfront)}, gains à partir du mois ${s.startMonth}</span></div>
  ${chart(r.cash)}
  <div class="cash3">${[12,24,36].map(m=>`<div><span>À ${m} mois</span><b class="${r.cash[m]<0?'neg':''}">${eur(r.cash[m])}</b></div>`).join('')}</div>
 </div>
 </div>`;})()}
 ${(()=>{if(r.grossAll==null)return '';const K=['prudent','central','cible'],R=K.map(k=>{const x=JSON.parse(JSON.stringify(S));x.scenario=k;return C.calculate(x);});if(R.some(q=>q.errors&&q.errors.length||q.grossAll==null))return '';
 return `<div class="sc3" role="group" aria-label="Trois scénarios"><p class="sc3h">Trois scénarios, mêmes données : seule change la part des objectifs atteinte</p>${K.map((k,j)=>`<button type="button" class="scc${k===s.scenario?' on':''}" data-s="${k}" aria-pressed="${k===s.scenario}"><span class="scn">${SL[k][0].toUpperCase()+SL[k].slice(1)}<small>${num(C.scenarioFactors[k]*100)} % des objectifs${k==='prudent'?' · recommandé':''}</small></span><b>${eur(R[j].net)}<small>gain net par an</small></b><span class="scm"><span>${R[j].payback?R[j].payback+' mois':'> 36 mois'}<small>retour</small></span><span>${num(R[j].grossAll/R[j].costAll,1)} ×<small>gain ÷ abonnement</small></span></span></button>`).join('')}</div>`;})()}
 <div class="cta cta2"><p><strong>Validons ces chiffres avec vos données réelles.</strong><br>En 30 minutes, nous remplaçons les hypothèses par les relevés de votre atelier.</p>
  <div class="btns"><button class="btn primary" type="button" id="pdf">Télécharger la synthèse (PDF)</button><a class="btn ghost" href="tel:+33622154362">Appeler le 06 22 15 43 62</a><a class="btn ghost" href="pilote.html${RUB?'?secteur=caoutchouc':''}" id="topoc">Préparer mon pilote VP Predict</a><a class="btn ghost" id="mailme" href="#">Recevoir par e-mail</a><button class="btn ghost" type="button" id="edit">Modifier mes réponses</button></div></div>
 <details class="rdet hyd" id="rdet"><summary><span><b>Tout le détail des calculs</b><small>Scénarios ligne à ligne, seuil de rentabilité, fiche des hypothèses, formule de chaque gain, pertes analysées, points de vigilance</small></span><span class="hyt">Afficher</span></summary>
${(()=>{if(r.grossAll==null)return '';const K=['prudent','central','cible'];const R=K.map(k=>{const x=JSON.parse(JSON.stringify(S));x.scenario=k;const q=C.calculate(x);if(q.errors&&q.errors.length||q.grossAll==null)return null;const c=q.conn||{scrap:0,energy:0,predH:0},eco=(q.qualityGain||0)+c.scrap+c.energy;let cash=-q.upfront,pe=null;for(let m=1;m<=36;m++){const ramp=m<x.startMonth?0:Math.min(1,(m-x.startMonth+1)/x.rampMonths);cash+=eco/12*ramp-(m>=x.startMonth?q.costAll/12-(m<x.startMonth+12?(q.credit||0)/12:0):0);if(cash>=0){pe=m;break;}}return {q,eco,pe,h:(q.equivalent||0)+(q.conn&&q.P!=null?c.predH*q.P*q.Q:0)};});if(R.some(v=>!v))return '';
 const row=(lbl,f,sub='')=>`<div class="scrow"><span class="scl">${lbl}${sub?`<small>${sub}</small>`:''}</span>${R.map((v,i)=>`<span class="${K[i]===s.scenario?'on':''}">${f(v)}</span>`).join('')}</div>`;
 return `<div class="card scmp"><div class="behead"><h3>Trois scénarios côte à côte</h3><span class="cap" style="margin:0">Mêmes données, seule change la part des objectifs d’amélioration atteinte</span></div>
  <div class="scrow sch"><span class="scl"></span>${K.map(k=>`<button type="button" data-s="${k}" class="${k===s.scenario?'on':''}" aria-pressed="${k===s.scenario}">${SL[k][0].toUpperCase()+SL[k].slice(1)}<small>${num(C.scenarioFactors[k]*100)} % des objectifs</small>${k==='prudent'?'<em>Recommandé</em>':''}</button>`).join('')}</div>
  ${row('Gain net annuel',v=>`<b>${eur(v.q.net)}</b>`,'Après abonnement'+(r.conn?'s':''))}
  ${row('Délai de retour',v=>v.q.payback?v.q.payback+' mois':'> 36 mois','Démarrage compté')}
  ${row('Gain brut ÷ abonnement',v=>num(v.q.grossAll/v.q.costAll,1)+' ×','Seuil d’engagement : 2 ×')}
  ${row('Économies évitables seules',v=>eur(v.eco),'Dépenses en moins, par an')}
  ${row('Retour sur économies seules',v=>v.pe?v.pe+' mois':'> 36 mois','Sans capacité ni temps libéré')}
  ${row('Heures de presse récupérées',v=>num(v.h)+' h','Équivalentes, par an')}
  ${row('TRS projeté',v=>num(v.q.projectedTrs,1)+' %',`Actuel : ${num(r.trs,1)} %`)}
  <p class="cap" style="margin:12px 0 0">Le détail ci-dessous suit le scénario sélectionné. Nous recommandons de présenter le prudent et de laisser le pilote mesurer le reste.</p>
 </div>`;})()}
 ${(()=>{if(r.grossAll==null)return '';const L=G.lv;return `<div class="card stair"><div class="behead"><h3>Ce que couvre chaque nature de gain</h3><span class="badge ${L[0].cov>=100?'good':L[1].cov>=100?'mid':'bad'}">${L[0].cov>=100?'Économies seules suffisantes':L[1].cov>=100?'Couvert avec le temps libéré':'Repose sur la capacité vendue'}</span></div>
  <p class="bebig">Les économies évitables couvrent <b>${num(L[0].cov)} %</b> ${r.conn?'des abonnements':'de l’abonnement'} de ${eur(r.costAll)} par an.</p>
  <div class="strow sth"><span>Niveau de gain</span><span>Gain brut</span><span>Net après ${r.conn?'abonnements':'abonnement'}</span><span>Retour</span></div>
  ${L.map((x,i)=>`<div class="strow${i===2?' tot':''}"><span>${x.k}</span><span>${eur(x.g)}</span><span class="${x.net<0?'neg':''}">${eur(x.net)}</span><span>${x.pb?x.pb+' mois':'> 36 mois'}</span></div>`).join('')}
  <p class="cap" style="margin:10px 0 0">Même calcul de trésorerie que le délai de retour : démarrage ${eur(r.upfront)}, gains à partir du mois ${s.startMonth}, pleine charge en ${s.rampMonths} mois. La dernière ligne correspond au gain net affiché en haut.</p>
 </div>`;})()}
 ${(()=>{if(r.grossAll==null||!(r.grossAll>0))return '';const need=r.costAll,pct=need/r.grossAll*100,h=r.contribution&&s.monetization>0?need/(r.contribution*s.monetization/100):null,need3=(3*r.costAll+r.upfront),pct3=need3/(3*r.grossAll)*100;
 return `<div class="card be"><div class="behead"><h3>Seuil de rentabilité</h3><span class="badge ${mtxt[0]}">${mtxt[1]}</span></div>
  <p class="bebig">Il faut obtenir <b>${num(pct)} %</b> du gain estimé pour couvrir ${r.conn?'les abonnements':'l’abonnement'}.</p>
  <div class="line"><div><div class="n">Gain minimum par an</div><div class="f">${r.conn?'Abonnements VP Expert + VP Predict':'Abonnement annuel'}</div></div><div class="a">${eur(need)}</div></div>
  ${h?`<div class="line"><div><div class="n">Soit en capacité seule</div><div class="f">Heures de presse à récupérer : ${eur(need)} ÷ (${num(r.contribution)} €/h × ${s.monetization} % vendus), soit ${num(h/r.n/12,1)} h par presse et par mois</div></div><div class="a">${num(h)} h par an</div></div>`:''}
  <div class="line"><div><div class="n">Part du gain sur 3 ans qui couvre les coûts</div><div class="f">(3 × ${eur(r.costAll)} + ${eur(r.upfront)} de démarrage) ÷ 3 ans de gain estimé</div></div><div class="a">${num(pct3)} %</div></div>
 </div>`;})()}
 ${hypHTML(r,s,G)}
 <div class="grid2">
  <div class="card"><h3>Calcul détaillé du gain</h3><p class="cap">Trois natures de gain, de la plus sûre à la plus dépendante de vos ventes. Chaque montant affiche sa formule.</p>
   <div class="gk eco"><div class="gkh"><span class="gkt">1 · Économies évitables</span><span class="gks">Dépenses en moins : rebuts, matière, énergie</span></div>
   <div class="line"><div><div class="n">Rebuts évités</div><div class="f">${num(r.scrapCost>0?r.qualityGain/r.scrapCost*100:0,1)} % de vos ${eur(r.scrapCost)} de rebuts annuels<details class="fx"><summary>Voir le calcul</summary>${eur(r.scrapCost)} × ${s.avoidable} % évitables × ${s.targetQuality} % visés × ${s.addressQuality} % adressables par VP Expert × ${r.f*100} % (scénario)</details></div></div><div class="a">${eur(r.qualityGain)}</div></div>
   ${r.conn?`<div class="line"><div><div class="n">VP Predict · rebuts évités en plus</div><div class="f">${eur(r.conn.remaining)} de rebuts évitables restants × 25 % × ${num(r.conn.lossShare*100)} % portés par les ${r.conn.k} presses sous VP Predict${r.conn.focus?' (presses critiques : (k ÷ n)^0,5)':''} × ${r.f*100} % (scénario)</div></div><div class="a">${eur(r.conn.scrap)}</div></div><div class="line"><div><div class="n">VP Predict · énergie</div><div class="f">${r.conn.k} presses × 1 000 € (10 % d’une facture de 10 000 € par presse) × ${r.f*100} % (scénario) · hypothèse forfaitaire, à mesurer au pilote</div></div><div class="a">${eur(r.conn.energy)}</div></div>`:''}
   <div class="line gsub"><div><div class="n">Sous-total économies évitables</div></div><div class="a">${eur(G.eco)}</div></div></div>
   <div class="gk op"><div class="gkh"><span class="gkt">2 · Gains opérationnels</span><span class="gks">Temps libéré, à réaffecter : une économie seulement s’il évite heures supplémentaires, intérim ou sous-traitance</span></div>
   <div class="line"><div><div class="n">Temps régleurs réaffecté</div><div class="f">${r.n} presses × ${num(s.diagHours)} h de recherche de cause × ${num(s.techRate)} €/h × ${s.targetDiag} % évités × ${r.f*100} % (scénario)</div></div><div class="a">${eur(r.diagGain)}</div></div>
   ${r.RUB?`<div class="line"><div><div class="n">Ébavurage évité</div><div class="f">${num(s.deflashHours)} h × ${num(s.deflashCost)} €/h × ${s.targetDeflash} % × ${s.addressDeflash} % adressables × ${r.f*100} % (scénario)</div></div><div class="a">${eur(r.deflashGain)}</div></div>`:''}
   <div class="line gsub"><div><div class="n">Sous-total gains opérationnels</div></div><div class="a">${eur(G.op)}</div></div></div>
   <div class="gk capk"><div class="gkh"><span class="gkt">3 · Capacité de production récupérée</span><span class="gks">Heures de presse retrouvées : valeur réelle seulement si elles sont vendues</span></div>
   <div class="line"><div><div class="n">Capacité récupérée</div><div class="f">${num(r.equivalent)} h équivalentes × ${num(contrib)} €/h × ${s.monetization} % vendus</div></div><div class="a">${eur(r.capacityGain)}</div></div>
   ${r.RUB?`<div class="line"><div><div class="n">Dont cuisson raccourcie</div><div class="f">Cycle ${num(r.cycle0,1)} → ${num(r.cycle1,2)} min · ${s.addressCure} % adressable · inclus dans la capacité</div></div><div class="a">${num(r.cureAddressable)} h</div></div>`:''}
   ${r.conn?`<div class="line"><div><div class="n">VP Predict · capacité récupérée</div><div class="f">${num(r.conn.predH)} h : 30 % des aléas process et 10 % des aléas techniques restant après VP Expert, × ${num(r.conn.lossShare*100)} % portés par les ${r.conn.k} presses sous VP Predict, × ${r.f*100} % (scénario) · valorisées à ${num(contrib)} €/h × ${s.monetization} % vendus</div></div><div class="a">${eur(r.conn.other)}</div></div>`:''}
   <div class="line gsub"><div><div class="n">Sous-total capacité · ${num(G.capH)} h équivalentes</div></div><div class="a">${eur(G.cap)}</div></div></div>
   ${r.conn?`<div class="line"><div><div class="n">VP Predict · ratio propre</div><div class="f">Gains VP Predict ${eur(r.conn.gross)} ÷ abonnement ${eur(r.conn.abo)} · ${eur(r.conn.perPress)} de gain par presse surveillée${r.conn.ratio<2?' · sous le seuil de 2 fois : l’abonnement ne démarre pas tant que le pilote ne mesure pas ce niveau':''}</div></div><div class="a">${num(r.conn.ratio,1)} ×</div></div>`:''}
   <div class="line"><div><div class="n">Gain brut annuel</div><div class="f">Capacité + rebuts + temps régleurs${r.RUB?' + ébavurage':''}${r.conn?' + gains VP Predict':''}</div></div><div class="a">${eur(r.grossAll)}</div></div>
   ${r.modeledLosses>0?`<p class="cap" style="margin:6px 0 10px">Gain brut = <b>${num(r.grossAll/r.modeledLosses*100,1)} %</b> des ${eur(r.modeledLosses)} de pertes analysées.</p>`:''}
   <div class="line"><div><div class="n">Abonnement VP Expert</div><div class="f">Tarif par tranche de presses</div></div><div class="a">− ${eur(s.annualCost)}</div></div>
   ${r.conn?`<div class="line"><div><div class="n">Abonnement VP Predict</div><div class="f">Part fixe ${eur(r.conn.aboFixed)} : 250 € × 12 mois pour le site + ${r.conn.billed} presses × 100 € × 12 mois${r.conn.billed>r.conn.k?' (3 presses minimum)':''} · part variable ${eur(r.conn.aboVar)} : 25 % des ${eur(r.conn.scrap)} de rebuts évités vérifiés</div></div><div class="a">− ${eur(r.conn.abo)}</div></div><div class="line"><div><div class="n">Crédit pilote, première année seulement</div><div class="f">50 % du pilote (${eur(r.conn.pocBase)}) déduits de l’abonnement VP Predict de l’année 1, dans la limite de la part fixe · coût année 1 : ${eur(r.year1Cost)}</div></div><div class="a">+ ${eur(r.conn.credit)}</div></div>`:''}
   <div class="line total"><div><div class="n">Gain net annuel</div><div class="f">Brut − abonnement${r.conn?'s':''}</div></div><div class="a">${eur(r.net)}</div></div>
   <h3 style="margin-top:22px">Coûts de démarrage, payés une fois</h3>
   ${r.scan?`<div class="line"><div><div class="n">VP Scan</div><div class="f">2 jours sur site : pertes chiffrées presse par presse, qualité des données, priorités${r.aidScan?` · aide Région AURA déduite : − ${eur(r.aidScan)}`:''}</div></div><div class="a">${eur(r.scan-r.aidScan)}</div></div>`:''}
   <div class="line"><div><div class="n">Mise en place VP Expert</div><div class="f">${r.scan?'Offerte après un VP Scan (valeur 8 000 €)':'Paramétrage et formation'}</div></div><div class="a">${r.scan?'0 €':eur(s.investment)}</div></div>
   <div class="line"><div><div class="n">Temps interne</div><div class="f">Vos équipes pendant le démarrage</div></div><div class="a">${eur(s.internalCost)}</div></div>
   ${r.conn?`<div class="line"><div><div class="n">Pilote VP Predict</div><div class="f">3 mois, dont environ 6 semaines de mesure · 20 000 € + ${r.conn.pilotN} presse${r.conn.pilotN>1?'s':''} pilote${r.conn.pilotN>1?'s':''} × 7 000 € · 50 % crédités sur l’abonnement de l’année 1 si vous poursuivez · aide Région AURA « Industrie du Futur » possible, jusqu’à 16 000 €</div></div><div class="a">${eur(r.conn.pocBase)}</div></div>
   ${r.conn.ext?`<div class="line"><div><div class="n">Mise en service des autres presses</div><div class="f">Après le pilote : 4 000 € + ${r.conn.k-r.conn.pilotN} presses × 600 €</div></div><div class="a">${eur(r.conn.ext)}</div></div>`:''}
   ${r.conn.aid?`<div class="line"><div><div class="n">Aide Industrie du Futur</div><div class="f">Région Auvergne-Rhône-Alpes, 50 % de 32 000 €, sous réserve d’éligibilité</div></div><div class="a">− ${eur(r.conn.aid)}</div></div>`:''}
   <div class="line"><div><div class="n">Connexion des presses</div><div class="f">Payée par le client, valeur centrale</div></div><div class="a">${eur(r.conn.hw[1])}</div></div>`:''}
   <div class="line total"><div><div class="n">Total démarrage</div><div class="f">Compté dans le délai de retour</div></div><div class="a">${eur(r.upfront)}</div></div>
  </div>
  <div class="card"><h3>Détail du démarrage et de la trésorerie</h3><p class="cap">Démarrage ${eur(r.upfront)} (${r.scan?`${eur(r.scan-r.aidScan)} de VP Scan, mise en place offerte`:`${eur(s.investment)} de mise en place`} + ${eur(s.internalCost)} de temps interne${r.conn?` + ${eur(r.conn.poc)} de pilote VP Predict${r.conn.ext?` + ${eur(r.conn.ext)} de mise en service des autres presses`:''} + ${eur(r.conn.hw[1])} de connexion des presses`:''}), gains à partir du mois ${s.startMonth}, pleine charge en ${s.rampMonths} mois${r.conn&&r.conn.credit?`, ${eur(r.conn.credit)} de crédit pilote déduits la première année`:''}.</p>
   ${chart(r.cash)}
  </div>
 </div>
 <div class="grid2">
  <div class="card"><h3>Pertes analysées</h3><p class="cap">Heures d’arrêt sur ${num(r.H)} heures requises par an.</p>
   ${r.rows.map(x=>`<div class="line"><div><div class="n">${x.name}</div><div class="f">${num(x.loss)} h perdues · ${num(x.addressable)} h récupérables</div></div><div class="a">${num(x.loss/r.H*100,1)} %</div></div>`).join('')}
  </div>
  <div class="card"><h3>Points de vigilance</h3><p class="cap">À vérifier avant de présenter ce résultat.</p>
   <ul class="warns">${r.warnings.map(w=>`<li>${w}</li>`).join('')||'<li>Aucun point particulier.</li>'}</ul>
  </div>
 </div>
 ${r.conn?`<div class="card conn"><h3><span class="stag pr">Avec VP Predict</span> Ce qu’il faut prévoir</h3><p class="cap">Parc déclaré : ${r.c77} presses Euromap 77, ${r.c63} Euromap 63, ${r.c0} sans interface. VP Predict sur ${r.conn.k} presses${r.conn.retro?`, dont ${r.conn.retro} à mettre à niveau`:''}.</p>
  <div class="line"><div><div class="n">Pilote VP Predict</div><div class="f">3 mois · 20 000 € + ${r.conn.pilotN} × 7 000 € par presse pilote · ${eur(r.conn.credit)} crédités sur l’abonnement de l’année 1 si vous poursuivez · aide Région AURA « Industrie du Futur » possible, jusqu’à 16 000 €</div></div><div class="a">${eur(r.conn.pocBase)} HT</div></div>${r.conn.ext?`
  <div class="line"><div><div class="n">Mise en service des autres presses</div><div class="f">Après le pilote, ${r.conn.k-r.conn.pilotN} presses : 4 000 € + 600 € par presse</div></div><div class="a">${eur(r.conn.ext)} HT</div></div>`:''}
  <div class="line"><div><div class="n">Connexion des presses, payée par le client</div><div class="f">${r.conn.c63} × 890 € d’adaptateur${r.conn.retro?` · ${r.conn.retro} × 3 000 à 6 000 € de mise à niveau`:''} · 3 à 5 jours de mise en service · valeur centrale ${eur(Math.round(r.conn.hw[1]/100)*100)}, comptée dans le démarrage</div></div><div class="a">${eur(Math.round(r.conn.hw[0]/100)*100)} à ${eur(Math.round(r.conn.hw[2]/100)*100)}</div></div>
  <p class="cap" style="margin-top:8px"><span class="stag ex">VP Expert seul</span> Gain : ${eur(r.netRA)} net par an. Hypothèses VP Predict prudentes, à confirmer par le pilote sur vos presses (3 mois, dont environ 6 semaines de mesure).</p>
 </div>`:`<div class="card conn"><h3><span class="stag pr">Avec VP Predict</span> Repère la dérive, sur presses connectées</h3><p class="cap">Non simulée : pilote de 3 mois (20 000 € + 7 000 € par presse pilote, 50 % crédités sur la première année) et abonnement hybride (250 € par mois pour le site + 100 € par presse et par mois + 25 % des rebuts évités vérifiés) non comptés. ${r.c77+r.c63} de vos presses sont connectables sans mise à niveau : revenez à l’étape « Connexion des presses » et choisissez « 3 presses critiques » pour voir le gain avec VP Predict là où il rapporte le plus.</p></div>`}
 </details>
 <p class="legal">Estimation non contractuelle, calculée dans votre navigateur. Les valeurs de départ sont illustratives et ne constituent pas des références sectorielles.${RUB?' En caoutchouc, la marge horaire est à saisir : aucun repère de CA terrain n’est utilisé.':' Repères de CA par heure de presse transmis par des industriels de la plasturgie.'}</p>
 </section>`;
 app.querySelectorAll('.scen button,.scmp .sch button,.sc3 .scc').forEach(b=>b.onclick=()=>{S.scenario=b.dataset.s;renderResult();});
 document.getElementById('pdf').onclick=()=>makePDF(r,s,G).catch(()=>{document.querySelectorAll('details.hyd').forEach(d=>d.open=true);window.print();});const rd=document.getElementById('rdet');if(rd)rd.addEventListener('toggle',()=>{rd.querySelector('.hyt').textContent=rd.open?'Masquer':'Afficher';});window.onbeforeprint=()=>document.querySelectorAll('details.hyd').forEach(d=>d.open=true);
 const tg=document.getElementById('tighten');if(tg)tg.onclick=()=>{i=2;render();window.scrollTo(0,0);};
 const mm=document.getElementById('mailme');if(mm){const body=`Bonjour,\n\nVoici mon estimation Vella Partners (${RUB?'caoutchouc':'injection plastique'}, scénario ${SL[s.scenario]}, ${new Date().toLocaleDateString('fr-FR')}) :\n- Parc : ${r.n} presses${r.conn?`, dont ${r.conn.k} sous VP Predict`:''}\n- Gain net annuel : ${eur(r.net)} (${eur(r.netPerPress)} par presse)\n- Économies sûres : ${eur(G.eco)} · temps régleur : ${eur(G.op)} · capacité vendue : ${eur(G.cap)}\n- Abonnement${r.conn?'s':''} : ${eur(r.costAll)} par an · démarrage : ${eur(r.upfront)} · retour : ${r.payback?r.payback+' mois':'plus de 36 mois'}\n\nMerci de me renvoyer cette estimation et de me proposer un créneau de 30 minutes pour la vérifier avec mes chiffres.\n\nSociété :\nNom :\nTéléphone :`;mm.href='mailto:fvella@vella-partners.com?subject='+encodeURIComponent('Mon estimation Vella Partners · '+r.n+' presses')+'&body='+encodeURIComponent(body);}
 document.getElementById('edit').onclick=()=>{i=1;render();window.scrollTo(0,0);};
}
prev.addEventListener('click',()=>{next.style.visibility='visible';});
if(new URLSearchParams(location.search).get('express')){i=steps.length-1;}
render();
})();
