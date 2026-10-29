(function(root){
  // Grille 2026 v2 (octobre 2026) : pilote 20 000 € + 7 000 € par presse pilote (2 en plastique, 3 en caoutchouc), dont 50 % crédités sur l'abonnement VP Predict de la première année ;
  // abonnement VP Predict hybride : 250 €/mois par site + 100 €/presse/mois (part fixe) + 25 % des économies de rebuts vérifiées attribuées à VP Predict (part variable), 3 presses minimum ;
  // presses ajoutées après le pilote : 4 000 € + 600 € par presse ; VP Scan 10 000 € HT (8 000 € en collectif), mise en place VP Expert offerte après un VP Scan.
  const PREDICT_PRICE=100,PREDICT_PRICE_11=100,PREDICT_SITE=250,PREDICT_MIN=3,PREDICT_SUCCESS=.25,PILOT_BASE=20000,PILOT_PER=7000,PILOT_CREDIT=.5,EXT_BASE=4000,EXT_PER=600,SCAN_PRICE=10000,FOCUS_EXP=.5;
  // Pack Usine retiré de la grille publique (sur devis pour les groupes) : constantes conservées, non utilisées.
  const PACK=[{add:18000,cap:12},{add:24000,cap:25},{add:30000,cap:40}],PACK_C=[{add:18000,cap:8},{add:24000,cap:20},{add:30000,cap:32}],PACK_EXTRA=100;
  const defaults={
    activity:'plasturgie',process:'thermoplastique',material:'PA / PP / ABS',series:'Mix de petites et moyennes séries',
    presses:[{label:'Moins de 100 t',n:6,h:5000},{label:'100 à < 250 t',n:8,h:5000},{label:'250 à < 500 t',n:4,h:5000},{label:'500 t et plus',n:2,h:5000}],
    changes:900,changeDuration:90,preventive:1000,tech:5,org:3,proc:2,performance:92,reject:3,trsDeclared:null,occupation:null,occupationBasis:'required',
    costMode:'euros',scrapCost:200000,scrapRate:3,productionCost:7000000,avoidable:60,
    targetTech:25,targetOrg:15,targetProc:20,targetChange:70,targetPerformance:94,targetQuality:20,
    addressTech:40,addressOrg:25,addressProc:70,addressChange:40,addressPerf:60,addressQuality:60,
    financeMode:'benchmark',caHour:null,contribution:80,revenue:6000000,margin:45,monetization:60,investment:8000,internalCost:6000,annualCost:18000,priceAuto:true,startMonth:3,rampMonths:6,
    offer:'option',diagHours:30,techRate:45,targetDiag:30,aidPilot:false,entry:'direct',predictFocus:'critiques',scenario:'prudent',connMode:'none',c77:null,c63:null,c0:null,dataStatus:'illustrative',siteRotation:'unknown',siteCauses:'unknown',siteRejects:'unknown',tonnage:null
  };
  // Repères terrain : CA / heure de fonctionnement presse, données réelles transmises par un expert plasturgie partenaire (2 sites de plasturgie, avec accord).
  // Site A, presses 15–150 t, part matière 18 % : ≈ 80 €/h. Site B, presses 50–1 400 t, part matière 33 % : 84 €/h (2014) à 140 €/h (2019).
  // Valeurs par classe interpolées entre ces deux sites : ordre de grandeur, pas une norme.
  const defaultsC=Object.assign(JSON.parse(JSON.stringify(defaults)),{activity:'caoutchouc',process:'injection caoutchouc',material:'EPDM / NBR / FKM',
    presses:[{label:'Moins de 100 t',n:5,h:5000},{label:'100 à < 250 t',n:6,h:5000},{label:'250 à < 500 t',n:4,h:5000},{label:'500 t et plus',n:1,h:5000}],
    changes:200,changeDuration:360,targetChange:120,preventive:800,performance:88,reject:8,scrapCost:240000,
    cureTime:6,cureTarget:5.4,handling:2,addressCure:50,mixIssues:40,mixHours:3,targetMix:40,addressMix:60,deflashHours:8000,deflashCost:35,targetDeflash:25,addressDeflash:60,
    financeMode:'direct',contribution:40,margin:45,monetization:50});
  const BENCH_CA=[80,95,120,140];
  const TON_CA=[24, 27, 33, 33, 36, 36, 48, 44, 48, 59, 59, 75, 75, 83, 83, 98, 98, 124, 124, 149, 149, 176, 224];
  function benchmarkCA(presses,tonnage){if(Array.isArray(tonnage)){let n=0,t=0;tonnage.forEach((k,i)=>{k=+k||0;n+=k;t+=k*(TON_CA[i]||0);});if(n>0)return t/n;}let w=0,t=0;presses.forEach((p,i)=>{const h=(+p.n||0)*(+p.h||0);w+=h;t+=h*(BENCH_CA[i]??BENCH_CA.at(-1));});return w>0?t/w:null;}
  // Tarif VP Expert par tranche de presses (plasturgie) — business plan v5.2
  const PRICE_TIERS=[{max:6,price:7200,label:'jusqu’à 6 presses'},{max:12,price:12000,label:'7 à 12 presses'},{max:25,price:18000,label:'13 à 25 presses'},{max:Infinity,price:24000,label:'plus de 25 presses'}];
  const PRICE_TIERS_C=[{max:5,price:7200,label:'jusqu’à 5 presses'},{max:8,price:12000,label:'6 à 8 presses'},{max:20,price:18000,label:'9 à 20 presses'},{max:Infinity,price:24000,label:'plus de 20 presses'}];
  function priceTier(n,act){return (act==='caoutchouc'?PRICE_TIERS_C:PRICE_TIERS).find(t=>n<=t.max);}
  const scenarioFactors={prudent:.5,central:.75,cible:1};
  const MODEL_VERSION='VP-PUBLIC-2026-10-29-R1';
  const ASSUMPTIONS_ID='base-depot-principal-20-60-illustrative';
  function calculate(s){
    if(!s||typeof s!=='object'||Array.isArray(s)||!Array.isArray(s.presses)||!s.presses.length||s.presses.some(p=>!p||typeof p!=='object'||Array.isArray(p)))return {errors:['Structure des données invalide : renseigner le parc de presses.']};
    const errors=[];const finite=(v)=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
    const required=(key,label,min=0,max=Infinity,integer=false)=>{const v=s[key];if(!finite(v)||+v<min||+v>max||(integer&&!Number.isInteger(+v)))errors.push(`${label} : saisir ${integer?'un entier':'une valeur'} entre ${min} et ${max===Infinity?'une limite positive':max}.`);};
    const RUB=s.activity==='caoutchouc';if(!RUB&&(s.activity!=='plasturgie'||s.process!=='thermoplastique'))return {unsupported:true,errors:[]};
    if(!['prudent','central','cible'].includes(s.scenario))errors.push('Scénario non reconnu.');
    if(!['euros','rate','unknown'].includes(s.costMode))errors.push('Mode de coût non reconnu.');
    if(!['direct','derived','benchmark','unknown'].includes(s.financeMode))errors.push('Mode financier non reconnu.');
    if(s.connMode&&!['none','all','critical','ready'].includes(s.connMode))errors.push('Mode de connexion non reconnu.');
    ['diagHours','techRate'].forEach(k=>required(k,k,0));
    required('targetDiag','Part de temps de diagnostic évitée',0,100);
    if(+s.reject===100)errors.push('Rebuts à 100 % : la valorisation économique exige une référence de production conforme. Aucun gain global calculé.');
    if(RUB){
      required('cureTime','Temps de vulcanisation actuel',Number.MIN_VALUE);
      required('cureTarget','Temps de vulcanisation visé',Number.MIN_VALUE);
      ['handling','mixHours','deflashHours','deflashCost'].forEach(k=>required(k,k,0));
      required('mixIssues','Nombre de lots concernés',0,Infinity,true);
      ['addressCure','targetMix','addressMix','targetDeflash','addressDeflash'].forEach(k=>required(k,k,0,100));
    }
    ['c77','c63','c0','predictK'].forEach(k=>{if(s[k]!==null&&s[k]!==undefined&&s[k]!=='')required(k,k,0,Infinity,true);});
    s.presses.forEach((p,i)=>{if(!finite(p.n)||p.n<0||!Number.isInteger(+p.n))errors.push(`Classe ${i+1} : nombre de presses entier positif ou nul requis.`);if(!finite(p.h)||p.h<0||p.h>8760||(+p.n>0&&+p.h===0))errors.push(`Classe ${i+1} : heures requises entre 1 et 8 760 pour une presse active.`);});
    ['changes','changeDuration','preventive','targetChange','investment','internalCost','annualCost'].forEach(k=>required(k,{changes:'Nombre de changements',changeDuration:'Durée des changements',preventive:'Préventif',targetChange:'Durée cible',investment:'Investissement',internalCost:'Temps interne',annualCost:'Coûts récurrents'}[k],0,Infinity,k==='changes'));
    ['tech','org','proc','reject','avoidable','targetTech','targetOrg','targetProc','targetQuality','addressTech','addressOrg','addressProc','addressChange','addressPerf','addressQuality','monetization'].forEach(k=>required(k,labels[k]||k,0,100));
    required('startMonth','Mois de démarrage',1,36,true);required('rampMonths','Montée en charge',1,36,true);
    if(s.performance!==null&&s.performance!=='')required('performance','Performance',.01,100);
    required('targetPerformance','Performance cible',.01,100);
    if(s.costMode==='euros'&&s.scrapCost!==null&&s.scrapCost!=='')required('scrapCost','Coût des rebuts',0);
    if(s.costMode==='rate'){required('scrapRate','Taux de rebuts en coût',0,100);required('productionCost','Coût de production',0);}
    if(s.financeMode==='direct'&&s.contribution!==null&&s.contribution!=='')required('contribution','Contribution horaire',0);
    if(s.financeMode==='derived'){required('revenue','CA du périmètre',0);required('margin','Marge sur coûts variables',0,100);}
    if(s.financeMode==='benchmark'){required('margin','Marge sur coûts variables',0,100);if(finite(s.caHour))required('caHour','CA par heure de presse',1);}
    if(s.financeMode==='benchmark'&&s.caHour!==null&&s.caHour!==undefined&&s.caHour!==''&&!finite(s.caHour))errors.push('CA horaire invalide.');
    if(s.tonnage!==null&&s.tonnage!==undefined&&(!Array.isArray(s.tonnage)||s.tonnage.length!==TON_CA.length||s.tonnage.some(v=>!finite(v)||+v<0||!Number.isInteger(+v))))errors.push('Répartition par tonnage invalide.');
    ['trsDeclared','occupation'].forEach(k=>{if(s[k]!==null&&s[k]!=='')required(k,k==='trsDeclared'?'TRS déclaré':'Occupation déclarée',0,100);});
    const n=s.presses.reduce((a,p)=>a+(+p.n||0),0);if(s.priceAuto!==false&&n>0)s.annualCost=priceTier(n,s.activity).price;const H=s.presses.reduce((a,p)=>a+(+p.n||0)*(+p.h||0),0);
    if(n<1||H<=0)errors.push('Ajoutez au moins une presse et des heures requises.');
    if(['c77','c63','c0'].some(k=>finite(s[k]))){
      const split=[Math.round(n*.5),Math.round(n*.3)];
      const counts=[finite(s.c77)?+s.c77:split[0],finite(s.c63)?+s.c63:split[1],finite(s.c0)?+s.c0:Math.max(0,n-split[0]-split[1])];
      if(counts.reduce((a,b)=>a+b,0)>n)errors.push('Le nombre de presses par connexion dépasse le parc déclaré.');
    }
    const changeH=s.changes*s.changeDuration/60,techH=H*s.tech/100,orgH=H*s.org/100,procH=H*s.proc/100;
    const mixH=RUB?(+s.mixIssues||0)*(+s.mixHours||0):0;const stopH=mixH+changeH+(+s.preventive)+techH+orgH+procH;
    if(stopH>=H)errors.push('Les arrêts doivent rester inférieurs aux heures requises. Vérifiez les doublons et les dénominateurs.');
    if(errors.length)return {errors,n,H};
    const D=1-stopH/H,P=finite(s.performance)?+s.performance/100:null,Q=1-s.reject/100;
    const f=scenarioFactors[s.scenario]??.5;
    const targetP=P===null?null:Math.max(P,+s.targetPerformance/100);
    const rows=[
      {name:'Changements de fabrication',loss:changeH,technical:s.changes*Math.max(0,s.changeDuration-s.targetChange)/60*f,address:s.addressChange/100},
      {name:'Aléas techniques',loss:techH,technical:techH*s.targetTech/100*f,address:s.addressTech/100},
      {name:'Aléas organisationnels',loss:orgH,technical:orgH*s.targetOrg/100*f,address:s.addressOrg/100},
      {name:'Aléas process',loss:procH,technical:procH*s.targetProc/100*f,address:s.addressProc/100}
    ].concat(RUB?[{name:'Lots de mélange non conformes',loss:mixH,technical:mixH*s.targetMix/100*f,address:s.addressMix/100}]:[]).map(r=>({...r,addressable:r.technical*r.address}));
    const techRecovery=rows.reduce((a,r)=>a+r.technical,0),addressRecovery=rows.reduce((a,r)=>a+r.addressable,0);
    const D1=D+addressRecovery/H;
    const perfDelta=P===null?null:(targetP-P)*f;
    const perfTechnical=P===null?null:H*(D+techRecovery/H)*perfDelta*Q;
    const perfAddressable=P===null?null:H*D1*perfDelta*(s.addressPerf/100)*Q;
    const equivalentStops=P===null?null:addressRecovery*P*Q;
    const cycle0=RUB?+s.cureTime+(+s.handling):1,cureT=RUB?Math.min(+s.cureTime,+s.cureTarget):0,cycle1=RUB?+s.handling+(+s.cureTime)-(s.cureTime-cureT)*f:1;
    const cureTechnical=!RUB||P===null||cycle1<=0?0:H*D1*P*Q*(cycle0/cycle1-1),cureAddressable=cureTechnical*(RUB?s.addressCure/100:0);
    const deflashGain=RUB?(+s.deflashHours||0)*(+s.deflashCost||0)*s.targetDeflash/100*f*s.addressDeflash/100:0;
    const equivalent=P===null?null:equivalentStops+perfAddressable+cureAddressable;
    const equivalentTechnical=P===null?null:techRecovery*P*Q+perfTechnical;
    const currentEquivalent=P===null?null:H*D*P*Q;
    const benchCA=RUB?null:benchmarkCA(s.presses,s.tonnage);const caHourUsed=s.financeMode==='benchmark'?(finite(s.caHour)?+s.caHour:benchCA):s.financeMode==='derived'&&H*D>0?s.revenue/(H*D):null;
    const contribution=s.financeMode==='unknown'?null:s.financeMode==='benchmark'?(P===null||caHourUsed===null?null:caHourUsed*(s.margin/100)/(P*Q)):s.financeMode==='derived'?(currentEquivalent>0?s.revenue*(s.margin/100)/currentEquivalent:null):finite(s.contribution)?+s.contribution:null;
    const impliedCA=contribution===null||P===null?null:contribution*P*Q;
    const scrapCost=s.costMode==='unknown'?null:s.costMode==='rate'?s.productionCost*s.scrapRate/100:finite(s.scrapCost)?+s.scrapCost:null;
    const qualityTechnical=scrapCost===null?null:scrapCost*s.avoidable/100*s.targetQuality/100*f;
    const qualityGain=qualityTechnical===null?null:qualityTechnical*s.addressQuality/100;
    const capacityGain=equivalent===null||contribution===null?null:equivalent*contribution*s.monetization/100;
    const diagGain=n*(+s.diagHours||0)*(+s.techRate||0)*(+s.targetDiag||0)/100*f;
    const gross=capacityGain===null||qualityGain===null?null:capacityGain+qualityGain+deflashGain+diagGain;
    // Option VP Predict : hypothèses du business plan (simulateur V14), pondérées par le scénario comme VP Expert (rebuts, énergie et heures) — 25 % des rebuts restant après VP Expert, 1 000 € d'énergie et capacité calculée sur les aléas restants ; abonnement et pilote selon la grille 2026 ; connexion payée par le client.
    const split=[Math.round(n*.5),Math.round(n*.3)];const c77=finite(s.c77)?+s.c77:split[0],c63=finite(s.c63)?+s.c63:split[1],c0=finite(s.c0)?+s.c0:Math.max(0,n-split[0]-split[1]);
    let conn=null;
    const scan=s.entry==='scan'?SCAN_PRICE:0,setup=s.entry==='scan'?0:+s.investment;
    // Aide Région AURA « Industrie du Futur » : 50 % d'un accompagnement plafonné à 32 000 €, soit 16 000 € au plus, sur VP Scan + pilote réunis.
    const aidOf=base=>s.aidPilot&&base>0?Math.min(16000,.5*Math.min(base,32000)):0;
    if(s.connMode&&s.connMode!=='none'){const kc=c77+c63,k=s.connMode==='all'?kc+c0:s.connMode==='critical'?Math.min(kc,Math.max(PREDICT_MIN,Math.round(+s.predictK||PREDICT_MIN))):kc;const share=n>0?Math.min(1,k/n):0;
      // Concentration des pertes : les presses placées sous VP Predict sont choisies parmi les plus critiques (rebuts chers, dérives fréquentes, heure chère).
      // Hypothèse Pareto modérée : k presses sur n portent (k/n)^0,5 des pertes restantes, et non k/n. Exemple : 3 presses sur 20 portent 39 % des pertes, pas 15 %. À mesurer au pilote.
      const focus=s.predictFocus!=='uniforme'&&share>0&&share<1,lossShare=focus?Math.pow(share,FOCUS_EXP):share;
      const remaining=scrapCost===null?0:Math.max(0,scrapCost*s.avoidable/100-(qualityGain||0));
      const rp=rows.find(r=>r.name==='Aléas process'),rt=rows.find(r=>r.name==='Aléas techniques');
      const predH=((procH-(rp?rp.addressable:0))*.30+(techH-(rt?rt.addressable:0))*.10)*lossShare*f;
      const scrap=remaining*.25*lossShare*f,energy=1000*k*f,other=(P===null||contribution===null)?0:predH*P*Q*contribution*s.monetization/100,grossC=scrap+energy+other,ti=(RUB?PRICE_TIERS_C:PRICE_TIERS).findIndex(t=>n<=t.max),pk=(RUB?PACK_C:PACK)[Math.max(0,Math.min(2,ti-1))],isPack=false,extra=0,billed=k>0?Math.max(PREDICT_MIN,k):0;
      const aboFixed=k>0?12*(PREDICT_SITE+PREDICT_PRICE*billed):0,aboVar=k>0?PREDICT_SUCCESS*scrap:0,abo=aboFixed+aboVar;
      const pilotN=Math.min(k,RUB?3:2),pocBase=k>0?PILOT_BASE+PILOT_PER*pilotN:0,ext=k>pilotN?EXT_BASE+EXT_PER*(k-pilotN):0;
      const aidAll=aidOf(scan+pocBase),aidScan=Math.min(aidAll,.5*scan),aid=aidAll-aidScan,poc=pocBase-aid;
      const credit=k>0?Math.min(aboFixed,PILOT_CREDIT*pocBase):0;
      const a63=s.connMode==='critical'?Math.max(0,k-c77):c63,r0=s.connMode==='all'?c0:0,hw=[a63*890+r0*3000+(k?3*408:0),a63*890+r0*4500+(k?4*475:0),a63*890+r0*6000+(k?5*652:0)];
      conn={k,c77,c63,c0,a63,retro:r0,share,lossShare,focus,scrap,energy,other,predH,gross:grossC,abo,aboFixed,aboVar,credit,billed,pilotN,ext,poc,pocBase,aid,aidScan,hw,remaining,ratio:abo>0?grossC/abo:null,ratioFixed:aboFixed>0?grossC/aboFixed:null,pack:isPack,packAdd:pk.add,packCap:pk.cap,extra,perPress:k>0?grossC/k:null};}
    const aidScanOnly=conn?0:Math.min(aidOf(scan),.5*scan);
    const grossAll=gross===null?null:gross+(conn?conn.gross:0),costAll=+s.annualCost+(conn?conn.abo:0);
    const upfront=setup+(+s.internalCost)+scan-(conn?conn.aidScan:aidScanOnly)+(conn?conn.poc+conn.ext+conn.hw[1]:0);const cash=[-upfront],monthly=[];const credit=conn?conn.credit:0;
    let payback=null;
    if(gross!==null){for(let month=1;month<=36;month++){const ramp=month<s.startMonth?0:Math.min(1,(month-s.startMonth+1)/s.rampMonths),gain=grossAll/12*ramp,cost=month>=s.startMonth?costAll/12-(month<s.startMonth+12?credit/12:0):0;monthly.push({month,ramp,gain,cost});cash.push(cash.at(-1)+gain-cost);if(payback===null&&cash.at(-1)>=0)payback=month;}}
    const warnings=[];if(RUB){if(+s.cureTarget>+s.cureTime)warnings.push('Le temps de cuisson cible dépasse le temps actuel : aucun gain de cuisson.');if(+s.cureTarget<+s.cureTime)warnings.push('Réduire le temps de cuisson se valide au rhéomètre (T90) et sur pièces, lot par lot : c’est un objectif à confirmer, pas un réglage automatique.');}
    if(finite(s.trsDeclared)&&P!==null&&Math.abs(s.trsDeclared-D*P*Q*100)>2)warnings.push('Le TRS déclaré diffère de plus de 2 points du TRS calculé. Vérifiez les périodes et conventions.');
    if(finite(s.occupation)&&s.occupationBasis==='required'&&Math.abs(s.occupation-D*100)>2)warnings.push('L’occupation déclarée et la disponibilité calculée diffèrent de plus de 2 points.');
    if(finite(s.occupation)&&s.occupationBasis!=='required')warnings.push('Votre occupation n’a pas le même dénominateur : elle n’est pas substituée à la disponibilité.');
    if(s.targetChange>s.changeDuration)warnings.push('La durée cible de changement dépasse la durée actuelle : aucun gain sur ce poste.');
    if(P!==null&&s.targetPerformance<s.performance)warnings.push('La performance cible est inférieure à l’actuelle : aucun gain de performance.');
    if(s.monetization===0)warnings.push('Capacité vendable nulle : aucune marge additionnelle de production. Seules les économies de rebuts documentées subsistent.');
    if(s.dataStatus!=='declared')warnings.push('Les valeurs de départ sont illustratives. Elles ne constituent pas des références sectorielles.');
    if(P===null)warnings.push('Performance inconnue : TRS et valorisation globale non calculables.');
    if(benchCA!==null&&s.financeMode==='direct'&&impliedCA!==null){if(impliedCA>benchCA)warnings.push(`La contribution saisie (${Math.round(contribution)} €/h) dépasse le CA par heure de presse observé sur le terrain pour ce parc (≈ ${Math.round(benchCA)} €/h). Une marge ne peut pas dépasser le CA : vérifiez la valeur, ou utilisez le repère terrain.`);else if(impliedCA>0.6*benchCA)warnings.push(`La contribution saisie représente ${Math.round(impliedCA/benchCA*100)} % du CA horaire de référence (≈ ${Math.round(benchCA)} €/h). C’est élevé pour une marge sur coûts variables : à justifier.`);}
    if(benchCA!==null&&s.financeMode==='derived'&&caHourUsed!==null&&(caHourUsed>1.6*benchCA||caHourUsed<0.5*benchCA))warnings.push(`Votre CA par heure de fonctionnement ressort à ${Math.round(caHourUsed)} €/h, loin du repère terrain (≈ ${Math.round(benchCA)} €/h pour ce parc). Vérifiez que le CA et les heures portent sur le même périmètre.`);
    if(gross!==null&&s.annualCost>0&&gross/s.annualCost<2)warnings.push(`Le gain brut ne représente que ${(gross/s.annualCost).toFixed(1)} fois l’abonnement annuel. Vella Partners vise au moins 2,5 fois, avec un seuil d’engagement à 2 fois.`);
    if(conn&&conn.pack&&grossAll/costAll<2)warnings.push(`Le Pack Usine rapporte ${(grossAll/costAll).toFixed(1)} fois son prix, sous le seuil de 2 fois.`);
    if(conn&&!conn.pack&&conn.ratio!==null&&conn.ratio<2)warnings.push(`VP Predict rapporte ${conn.ratio.toFixed(1)} fois son abonnement, sous le seuil de 2 fois : ${conn.k>PREDICT_MIN?'réduisez le périmètre aux presses critiques (forte valeur horaire, rebuts coûteux, dérives fréquentes)':'le pilote doit d’abord confirmer que ces presses concentrent bien les pertes'}. Sans gain mesuré d’au moins 2 fois, l’abonnement VP Predict ne démarre pas.`);
    if(conn&&conn.focus)warnings.push(`Les ${conn.k} presses sous VP Predict sont supposées porter ${Math.round(conn.lossShare*100)} % des pertes restantes (choix des presses les plus critiques), et non ${Math.round(conn.share*100)} % : hypothèse à vérifier au pilote, sur vos relevés de rebuts par presse.`);
    if(scan>0)warnings.push('Démarrage par VP Scan : la mise en place VP Expert (8 000 €) est offerte, le diagnostic chiffre vos priorités avant tout abonnement.');
    if(gross===null)warnings.push('Données économiques incomplètes : aucun retour sur investissement global n’est affiché.');
    const modeledLosses=P===null||contribution===null||scrapCost===null?null:(changeH+techH+orgH+procH)*P*Q*contribution+H*D*(1-P)*Q*contribution+scrapCost*s.avoidable/100;
    const result={errors:[],warnings,modelVersion:MODEL_VERSION,assumptionsId:ASSUMPTIONS_ID,scan,setup,aidScan:conn?conn.aidScan:aidScanOnly,credit,year1Cost:costAll-credit,netPerPress:n>0&&grossAll!==null?(grossAll-costAll)/n:null,diagGain,RUB,mixH,cycle0,cycle1,cureAddressable,deflashGain,n,H,D,P,Q,trs:P===null?null:D*P*Q*100,changeH,stopH,rows,f,techRecovery,addressRecovery,equivalent,equivalentTechnical,perfAddressable,contribution,benchCA,caHourUsed,scrapCost,qualityTechnical,qualityGain,capacityGain,gross,grossAll,costAll,conn,c77,c63,c0,netRA:gross===null?null:gross-s.annualCost,net:grossAll===null?null:grossAll-costAll,upfront,cash,monthly,payback,year1:gross===null?null:cash[12],modeledLosses,remainingD:D1,projectedTrs:P===null?null:D1*(P+perfDelta*s.addressPerf/100)*Q*100};
    const invalid=v=>typeof v==='number'?!Number.isFinite(v):v&&typeof v==='object'?Object.values(v).some(invalid):false;
    if(invalid(result))return {errors:['Calcul impossible : valeurs hors domaine numérique. Vérifier les entrées avant toute estimation.'],modelVersion:MODEL_VERSION,assumptionsId:ASSUMPTIONS_ID};
    return result;
  }
  const labels={tech:'Aléas techniques',org:'Aléas organisationnels',proc:'Aléas process',reject:'Rebuts en pièces',avoidable:'Part de coût évitable',targetTech:'Réduction des aléas techniques',targetOrg:'Réduction des aléas organisationnels',targetProc:'Réduction des aléas process',targetQuality:'Réduction du coût évitable des rebuts',addressTech:'Part adressable technique',addressOrg:'Part adressable organisation',addressProc:'Part adressable process',addressChange:'Part adressable changements',addressPerf:'Part adressable performance',addressQuality:'Part adressable qualité',monetization:'Capacité commercialisable'};
  root.VellaCalc={MODEL_VERSION,ASSUMPTIONS_ID,PREDICT_PRICE_11,PREDICT_MIN,PREDICT_SUCCESS,PILOT_CREDIT,EXT_BASE,EXT_PER,SCAN_PRICE,FOCUS_EXP,defaultsC,PRICE_TIERS_C,PRICE_TIERS,priceTier,BENCH_CA,TON_CA,benchmarkCA,defaults,PACK,PACK_C,PREDICT_PRICE,PREDICT_SITE,PILOT_BASE,PILOT_PER,calculate,scenarioFactors,labels};
  if(typeof module!=='undefined')module.exports=root.VellaCalc;
})(typeof window!=='undefined'?window:globalThis);
