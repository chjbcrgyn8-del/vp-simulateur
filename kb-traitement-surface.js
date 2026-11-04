/* Base de causes et d'actions · traitement de surface (simulateur VP Predict / VP Expert)
   Deux lignes fictives : zinc-nickel alcalin au tonneau, anodisation sulfurique à l'attache.
   Plages de réglage reprises des sources publiques (traitement-surface-data.js, TS-S01, TS-S34…) ;
   statut RECHERCHE_DOCUMENTAIRE_NON_VALIDEE. Aucune règle approuvée par un expert traitement de surface.
   n = poids illustratif, non calibré, sans fréquence terrain. r = règle candidate concernée.
   shape = forme de la dérive simulée quand cette cause est tirée au sort :
   ramp (progressive), expo (qui se stabilise), step (palier), bar (dents de scie selon le tonneau ou la cuve).
   meas = la dérive vient du moyen de mesure ; memb = mécanisme masqué si la ligne a des anodes à membrane ;
   reset = l'action comprend une analyse de bain (remet à zéro le compteur de charges depuis l'analyse). */
(function(){
const V=window.VPTS||{rules:[]};
const RULES=Object.fromEntries(V.rules.map(r=>[r.id,{t:r.title,s:r.sources,nc:r.caution,cl:r.proof,o:r.id==='TS01-R04'?'Proposition VP · hors référentiel candidat':'Référentiel candidat VP · non validé'}]));
const A=(l,n,reset)=>reset?{l,n,reset:true}:{l,n};
const XRF='Vérifier le XRF sur l’étalon ZnNi certifié, puis remesurer 3 pièces en zone significative, loin des contacts';
const FOU='Vérifier l’appareil à courants de Foucault sur les cales étalons, puis remesurer 3 profilés en zone significative';
const COMMON={sector:'traitement-surface',rules:RULES,
 ui:{close:'TS01-R04',cm:'TS01-R01',ctx:'TS07-R01',memb:'TS02-R03',shape:'TS01-R01'}};
const znni={...COMMON,line:'znni',press:'Ligne ZnNi L2',machine:'Ligne zinc-nickel alcalin · tonneau',
 pname:'Ligne L2 · zinc-nickel alcalin au tonneau · vis M8 acier · Fe/ZnNi10',
 cycS:720,barN:4,barL:'Tonneau',life:24,counterL:'Charges depuis l’analyse labo',counterS:'Analyse labo',counterU:'charges',
 unit:'charge',units:'charges',stable:'Ligne stable',
 opcL:'Analyseur de bain en ligne (Zn, Ni)',opcAbs:'Pas d’analyseur en ligne : analyse labo seulement',
 membL:'Anodes à membrane',
 params:[
  {id:'e',n:'Épaisseur ZnNi (XRF, zone significative)',sn:'Épaisseur ZnNi',u:'µm',c:10.0,tol:2.0,s:.32,dec:1,dim:true},
  {id:'ni',n:'Taux de nickel du dépôt (XRF)',sn:'Taux de Ni du dépôt',u:'%',c:14.0,tol:2.0,s:.28,dec:1,dim:true},
  {id:'zn',n:'Zinc métal dans le bain',sn:'Zinc du bain',u:'g/L',c:7.5,tol:1.0,s:.10,dec:2,opc:true},
  {id:'nib',n:'Nickel dans le bain',sn:'Nickel du bain',u:'g/L',c:1.05,tol:.15,s:.018,dec:2,opc:true},
  {id:'t',n:'Température du bain',sn:'Température du bain',u:'°C',c:30,tol:3,s:.25,dec:1},
  {id:'rc',n:'Rendement cathodique estimé (XRF et Ah)',sn:'Rendement cathodique',u:'%',c:72,tol:12,s:1.4,dec:0,dirs:['down']}],
 kb:{
  e:{down:[
    {l:'Rendement en baisse : carbonates et produits de dégradation des additifs accumulés',n:9,r:'TS02-R03',shape:'ramp',memb:true,a:[A('Faire analyser carbonates et rendement (essai en cellule de Hull), décider du traitement avec le fournisseur',7,true),A('Comparer l’historique des Ah au rendement calculé sur les dernières charges',3)]},
    {l:'Zinc métal bas dans le bain : dissolution inférieure à la consommation',n:7,r:'TS02-R02',shape:'ramp',a:[A('Analyser zinc et soude, corriger selon la fiche du fournisseur et tracer l’ajout',6,true)]},
    {l:'Courant réel inférieur à l’affiché : ampèremètre ou compteur Ah décalé',n:6,r:'TS03-R01',shape:'step',a:[A('Contrôler le redresseur à la pince ampèremétrique de référence, recaler ampèremètre et compteur Ah',6)]},
    {l:'Charge plus grande que la gamme : densité de courant réelle plus faible',n:6,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface réelle de la charge et revenir au poids de charge de la gamme',6)]},
    {l:'Brillanteur en excès : dépôt freiné',n:5,r:'TS02-R04',shape:'step',a:[A('Suspendre le dosage, faire une cellule de Hull et traiter selon le fournisseur',5,true)]},
    {l:'Contact défaillant dans un tonneau : danglers usés ou encrassés',n:4,r:'TS03-R03',shape:'bar',a:[A('Inspecter et nettoyer les contacts du tonneau signalé, remplacer les danglers usés',5)]},
    {l:'XRF qui dérive : étalon, calibration alliage ou positionnement',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Recalibrer le XRF sur l’étalon ZnNi certifié et remesurer les charges suspectes',5)]}],
   up:[
    {l:'Charge plus petite que la gamme : densité de courant plus élevée',n:6,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface de la charge et revenir au poids de charge de la gamme',6)]},
    {l:'Temps de dépôt allongé ou programme de ligne modifié sans trace',n:5,r:'TS03-R02',shape:'step',a:[A('Comparer le programme actif à la gamme et revenir au temps tracé',5)]},
    {l:'Courant réel supérieur à l’affiché',n:4,r:'TS03-R01',shape:'step',a:[A('Contrôler le redresseur à la pince de référence et recaler l’ampèremètre',4)]},
    {l:'XRF : étalon ou calibration décalé',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Recalibrer le XRF sur l’étalon certifié et remesurer',5)]},
    {l:'Mesure prise sur une arête ou près d’un contact, hors zone significative',n:4,r:'TS01-R02',shape:'step',meas:true,a:[A('Remesurer aux points du plan de mesure, en zone significative',4)]}]},
  ni:{up:[
    {l:'Nickel du bain trop haut : ajout excessif ou pompe doseuse déréglée',n:9,r:'TS02-R01',shape:'step',a:[A('Analyser le nickel du bain, suspendre le dosage et corriger selon la fiche du fournisseur',7,true)]},
    {l:'Densité de courant plus forte que la gamme',n:6,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface de la charge et revenir à la densité de la gamme',5)]},
    {l:'Zinc bas dans le bain : rapport zinc / nickel déséquilibré',n:5,r:'TS02-R02',shape:'ramp',a:[A('Analyser zinc et nickel, corriger le zinc selon le fournisseur',5,true)]},
    {l:'Température du bain au-dessus de son domaine',n:3,r:'TS02-R08',shape:'expo',a:[A('Contrôler la sonde et le refroidissement, revenir dans le domaine avant production',3)]},
    {l:'XRF : calibration alliage ou étalon ZnNi décalé',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Recalibrer le XRF sur l’étalon ZnNi certifié et remesurer',5)]}],
   down:[
    {l:'Nickel du bain bas : consommation non compensée par le réapprovisionnement',n:10,r:'TS02-R01',shape:'ramp',a:[A('Analyser le nickel, ajuster le réapprovisionnement aux Ah selon le fournisseur',7,true)]},
    {l:'Densité de courant faible : charge trop grande',n:5,r:'TS03-R02',shape:'step',a:[A('Revenir au poids de charge de la gamme',5)]},
    {l:'Rotation du tonneau ou agitation modifiée',n:3,r:'TS03-R03',shape:'step',a:[A('Comparer la rotation et l’agitation à la gamme et revenir au réglage de référence',3)]},
    {l:'Zinc trop haut après une correction',n:3,r:'TS02-R02',shape:'step',a:[A('Analyser le zinc et vérifier le dernier ajout tracé',3,true)]},
    {l:'XRF : calibration alliage décalée',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Recalibrer le XRF sur l’étalon ZnNi certifié et remesurer',5)]}]},
  zn:{up:[
    {l:'Anodes de zinc ou module de dissolution ajoutés sans trace',n:8,r:'TS07-R01',shape:'ramp',a:[A('Relire le journal des anodes et du module de dissolution, analyser et corriger',6,true)]},
    {l:'Évaporation : niveau de bain bas',n:4,r:'TS02-R02',shape:'ramp',a:[A('Contrôler le niveau, compléter selon la procédure et réanalyser',4,true)]},
    {l:'Ajout de zinc mal dosé',n:4,r:'TS02-R02',shape:'step',a:[A('Comparer l’ajout à la fiche, réanalyser et tracer',4,true)]},
    {l:'Analyseur en ligne qui dérive',n:4,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Comparer l’analyseur à un titrage labo et le réétalonner',4)]}],
   down:[
    {l:'Module de dissolution à l’arrêt ou anodes épuisées',n:8,r:'TS02-R02',shape:'ramp',a:[A('Contrôler le module de dissolution, analyser et corriger le zinc',6,true)]},
    {l:'Dilution : entraînement ou eau de rinçage retournée au bain',n:5,r:'TS04-R03',shape:'step',a:[A('Contrôler niveaux et retours de rinçage, réanalyser',4,true)]},
    {l:'Analyseur en ligne qui dérive',n:4,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Comparer l’analyseur à un titrage labo et le réétalonner',4)]}]},
  nib:{up:[
    {l:'Dosage automatique de nickel déréglé',n:8,r:'TS02-R01',shape:'step',a:[A('Contrôler la pompe doseuse et sa consigne aux Ah, réanalyser',6,true)]},
    {l:'Évaporation : niveau de bain bas',n:3,r:'TS02-R02',shape:'ramp',a:[A('Contrôler le niveau, compléter et réanalyser',3,true)]},
    {l:'Analyseur en ligne qui dérive',n:3,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Comparer à un titrage labo et réétalonner',3)]}],
   down:[
    {l:'Réapprovisionnement de nickel en retard sur la consommation (Ah)',n:9,r:'TS02-R01',shape:'ramp',a:[A('Recalculer le réapprovisionnement aux Ah, analyser et corriger',7,true)]},
    {l:'Pompe doseuse ou cuve de réapprovisionnement vide',n:5,r:'TS02-R04',shape:'step',a:[A('Contrôler la pompe et la cuve de réapprovisionnement',5)]},
    {l:'Dilution par retour de rinçage',n:3,r:'TS04-R03',shape:'step',a:[A('Contrôler les retours de rinçage et réanalyser',3,true)]}]},
  t:{up:[
    {l:'Échangeur ou groupe froid en défaut',n:6,r:'TS02-R08',shape:'ramp',a:[A('Contrôler l’échangeur et la régulation, produire après retour dans le domaine',5)]},
    {l:'Puissance dissipée plus forte : charge ou densité augmentée',n:4,r:'TS03-R02',shape:'expo',a:[A('Comparer la charge et le courant à la gamme',4)]},
    {l:'Sonde de température décalée',n:3,r:'TS02-R08',shape:'ramp',meas:true,a:[A('Comparer la sonde à un thermomètre de référence',3)]}],
   down:[
    {l:'Chauffage ou régulation en défaut',n:6,r:'TS02-R08',shape:'ramp',a:[A('Contrôler le chauffage et la régulation',5)]},
    {l:'Redémarrage après un arrêt : bain pas encore à température',n:6,r:'TS02-R08',shape:'expo',a:[A('Attendre le retour dans le domaine avant de charger, isoler les charges produites à froid',5)]},
    {l:'Sonde de température décalée',n:3,r:'TS02-R08',shape:'ramp',meas:true,a:[A('Comparer la sonde à un thermomètre de référence',3)]}]},
  rc:{down:[
    {l:'Carbonates et produits de dégradation organique accumulés',n:9,r:'TS02-R03',shape:'ramp',memb:true,a:[A('Faire analyser carbonates et rendement, décider du traitement avec le fournisseur',7,true)]},
    {l:'Surdosage de brillanteur',n:6,r:'TS02-R04',shape:'step',a:[A('Suspendre le dosage, cellule de Hull, traitement selon le fournisseur',5,true)]},
    {l:'Zinc métal bas',n:6,r:'TS02-R02',shape:'ramp',a:[A('Analyser zinc et soude, corriger selon la fiche',5,true)]},
    {l:'Contamination métallique ou organique',n:4,r:'TS02-R05',shape:'ramp',a:[A('Analyser les impuretés, électrolyse sélective sur plaque factice selon le fournisseur',4,true)]},
    {l:'Compteur Ah ou ampèremètre décalé : rendement calculé faux',n:4,r:'TS03-R01',shape:'step',meas:true,a:[A('Contrôler le courant à la pince de référence et recaler le compteur Ah',4)]}]}},
 checks:{
  _dim:[XRF+' → si l’écart disparaît, c’est la mesure, pas le bain (TS01-R01)',
   'Lire la forme de la courbe → baisse progressive au fil des charges : rendement ou bain qui s’épuise ; palier : ajout, poids de charge, redresseur ; dents de scie : un tonneau ou un contact (TS03-R03)',
   'Relire le journal du bain : dernier ajout, dernière analyse, Ah, anodes, filtration (TS07-R01)',
   'Contrôler le courant réel à la pince de référence et la surface de charge → densité de courant réelle (TS03-R01, TS03-R02)',
   'Faire une cellule de Hull pour voir les zones de forte et faible densité avant toute correction (TS02-R06)',
   'Après action : suivre plusieurs charges sur moyen vérifié avant de clore (TS01-R04)'],
  _all:['Comparer la valeur à une analyse labo ou un instrument de référence (TS01-R01)',
   'Relire le journal du bain : ajouts, analyses, niveaux, retours de rinçage (TS07-R01)',
   'Lire la forme de la courbe : progressive, palier ou qui se stabilise',
   'Après action : suivre plusieurs charges avant de clore (TS01-R04)']},
 verif:{e:'en remesurant au XRF vérifié plusieurs charges consécutives, et en isolant les charges produites pendant l’écart.',ni:'en remesurant le taux de Ni au XRF vérifié sur plusieurs charges, bain réanalysé.',rc:'en comparant le rendement calculé sur plusieurs charges à l’analyse du bain.'},
 mdn:{rc:'Un rendement qui monte n’est pas un défaut : seule la baisse est proposée.'},
 shapes:['<b>Progressive</b> : bain qui s’épuise, carbonates, additif qui se dégrade','<b>Palier brutal</b> : ajout, poids de charge, redresseur, programme','<b>Qui se stabilise</b> : température, redémarrage','<b>En dents de scie</b> : un tonneau ou un contact sur quatre']};

const anod={...COMMON,line:'anod',press:'Ligne ANO1',machine:'Ligne d’anodisation sulfurique · attache',
 pname:'Ligne ANO1 · anodisation sulfurique à l’attache · profilés 6060 · classe AA15',
 cycS:1200,barN:3,barL:'Cuve d’anodisation',life:3,counterL:'Barres depuis l’analyse du bain',counterS:'Analyse bain',counterU:'barres',
 unit:'barre',units:'barres',stable:'Ligne stable',
 opcL:'Analyses de bain en ligne (acide, aluminium)',opcAbs:'Pas d’analyse en ligne : titrage labo seulement',
 membL:null,
 params:[
  {id:'ea',n:'Épaisseur anodique (courants de Foucault)',sn:'Épaisseur anodique',u:'µm',c:17.5,tol:2.5,s:.45,dec:1,dim:true},
  {id:'ac',n:'Acide sulfurique libre',sn:'Acide libre',u:'g/L',c:180,tol:10,s:1.4,dec:0,opc:true},
  {id:'al',n:'Aluminium dissous',sn:'Aluminium dissous',u:'g/L',c:10,tol:5,s:.25,dec:1,opc:true,dirs:['up']},
  {id:'ta',n:'Température du bain d’anodisation',sn:'Température anodisation',u:'°C',c:18.5,tol:1.5,s:.14,dec:1},
  {id:'cd',n:'Densité de courant moyenne (courant / surface déclarée)',sn:'Densité de courant',u:'A/dm²',c:1.6,tol:.3,s:.025,dec:2},
  {id:'adm',n:'Admittance de colmatage corrigée',sn:'Admittance colmatage',u:'µS',c:11,tol:9,s:.8,dec:0,dirs:['up']}],
 kb:{
  ea:{down:[
    {l:'Densité de courant réelle plus faible : surface d’attache sous-estimée',n:8,r:'TS06-R02',shape:'step',a:[A('Recalculer la surface de la barre et le courant de consigne, selon la règle de la ligne',6)]},
    {l:'Contacts d’attache encrassés ou mal serrés',n:6,r:'TS03-R03',shape:'bar',a:[A('Décaper et resserrer les contacts de la cuve signalée',5)]},
    {l:'Bain trop chaud : redissolution de la couche',n:5,r:'TS06-R02',shape:'expo',a:[A('Contrôler refroidissement et agitation, revenir dans le domaine',5)]},
    {l:'Lot d’alliage différent : vitesse d’anodisation modifiée',n:4,r:'TS06-R01',shape:'step',a:[A('Comparer le certificat matière au lot précédent et adapter la gamme validée',4)]},
    {l:'Courant réel inférieur à l’affiché',n:4,r:'TS03-R01',shape:'step',a:[A('Contrôler le redresseur à la pince de référence',4)]},
    {l:'Appareil à courants de Foucault décalé',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Réétalonner sur les cales étalons et remesurer',5)]}],
   up:[
    {l:'Charge réduite : densité plus élevée',n:5,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface de la barre et revenir au courant de la gamme',5)]},
    {l:'Temps d’anodisation allongé',n:5,r:'TS06-R02',shape:'step',a:[A('Comparer le temps au programme de la gamme',5)]},
    {l:'Appareil à courants de Foucault décalé',n:5,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Réétalonner sur les cales étalons et remesurer',5)]},
    {l:'Mesure près d’un contact ou d’une arête',n:3,r:'TS01-R02',shape:'step',meas:true,a:[A('Remesurer en zone significative, selon le plan',3)]}]},
  ac:{up:[
    {l:'Ajout d’acide excessif',n:6,r:'TS06-R02',shape:'step',a:[A('Titrer, comparer à l’ajout tracé, corriger',5,true)]},
    {l:'Évaporation',n:4,r:'TS06-R02',shape:'ramp',a:[A('Contrôler le niveau, compléter et titrer',4,true)]},
    {l:'Titrage ou analyseur décalé',n:3,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Refaire le titrage avec une solution étalon',3)]}],
   down:[
    {l:'Entraînement non compensé',n:7,r:'TS06-R02',shape:'ramp',a:[A('Titrer et compléter selon la procédure, tracer l’ajout',6,true)]},
    {l:'Dilution par l’eau de rinçage',n:5,r:'TS04-R03',shape:'step',a:[A('Contrôler les retours d’eau et titrer',4,true)]}]},
  al:{up:[
    {l:'Aluminium dissous accumulé : bain à régénérer ou à purger',n:10,r:'TS06-R02',shape:'ramp',a:[A('Analyser, planifier purge partielle ou régénération selon la procédure',7,true)]},
    {l:'Pièces tombées dans la cuve',n:4,r:'TS06-R02',shape:'step',a:[A('Inspecter le fond de cuve et retirer les pièces',4)]},
    {l:'Récupération d’acide en défaut',n:3,r:'TS06-R02',shape:'ramp',a:[A('Contrôler l’unité de récupération',3)]}]},
  ta:{up:[
    {l:'Refroidissement insuffisant pour la charge',n:8,r:'TS02-R08',shape:'ramp',a:[A('Contrôler groupe froid, échangeur et consigne',6)]},
    {l:'Agitation insuffisante',n:5,r:'TS03-R04',shape:'step',a:[A('Contrôler soufflage d’air et circulation',4)]},
    {l:'Sonde décalée',n:3,r:'TS02-R08',shape:'ramp',meas:true,a:[A('Comparer à un thermomètre de référence',3)]}],
   down:[
    {l:'Consigne de refroidissement modifiée',n:4,r:'TS02-R08',shape:'step',a:[A('Revenir à la consigne tracée',4)]},
    {l:'Sonde décalée',n:3,r:'TS02-R08',shape:'ramp',meas:true,a:[A('Comparer à un thermomètre de référence',3)]}]},
  cd:{up:[
    {l:'Surface déclarée trop faible pour la barre',n:6,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface de la barre',5)]},
    {l:'Consigne de courant modifiée',n:4,r:'TS03-R01',shape:'step',a:[A('Revenir à la consigne de la gamme',4)]}],
   down:[
    {l:'Surface déclarée trop grande',n:6,r:'TS03-R02',shape:'step',a:[A('Recalculer la surface de la barre',5)]},
    {l:'Contacts résistifs sur une cuve',n:5,r:'TS03-R03',shape:'bar',a:[A('Décaper et resserrer les contacts',5)]},
    {l:'Limite de tension du redresseur atteinte',n:4,r:'TS03-R01',shape:'ramp',a:[A('Contrôler la tension en fin de cycle et l’état du redresseur',4)]}]},
  adm:{up:[
    {l:'Température du colmatage à chaud sous 96 °C',n:9,r:'TS05-R03',shape:'ramp',a:[A('Contrôler chauffage et sonde du colmatage',6)]},
    {l:'pH du colmatage hors 5,8–6,2',n:6,r:'TS05-R03',shape:'ramp',a:[A('Mesurer le pH et corriger selon la procédure',5,true)]},
    {l:'Temps de colmatage inférieur à 2 min/µm',n:5,r:'TS05-R03',shape:'step',a:[A('Comparer le temps au programme et à l’épaisseur',5)]},
    {l:'Eau de colmatage polluée (phosphates, silicates)',n:4,r:'TS05-R03',shape:'ramp',a:[A('Analyser l’eau, renouveler le bain si nécessaire',4,true)]},
    {l:'Admittance mesurée hors délai ou sans correction d’épaisseur',n:3,r:'TS01-R03',shape:'step',meas:true,a:[A('Remesurer selon la méthode normalisée',3)]}]}},
 checks:{
  _dim:[FOU+' → si l’écart disparaît, c’est la mesure (TS01-R01)',
   'Recalculer la densité réelle : courant / surface de la barre, et le temps théorique ≈ 3,12 × µm / (A/dm²) (TS06-R02)',
   'Relier l’écart à une cuve ou à une position de contact → dents de scie : contacts, pas le bain (TS03-R03)',
   'Relever température, acide libre et aluminium dissous, comparer au domaine du référentiel (TS06-R02)',
   'Comparer l’alliage et le lot au précédent (TS06-R01)',
   'Après action : suivre plusieurs barres avant de clore (TS01-R04)'],
  _all:['Comparer la valeur à un titrage ou un instrument de référence (TS01-R01)',
   'Relire le journal du bain : ajouts, purges, niveaux (TS07-R01)',
   'Lire la forme de la courbe : progressive, palier ou qui se stabilise',
   'Après action : suivre plusieurs barres avant de clore (TS01-R04)']},
 verif:{ea:'en remesurant aux courants de Foucault vérifiés plusieurs barres, selon le plan de mesure de la classe.',adm:'par admittance corrigée sur plusieurs barres, perte de masse en arbitrage.'},
 mdn:{al:'Un aluminium dissous qui baisse n’est pas un défaut : seule la hausse est proposée.',adm:'Une admittance qui baisse n’est pas un défaut : seule la hausse est proposée.'},
 shapes:['<b>Progressive</b> : aluminium qui s’accumule, refroidissement qui faiblit','<b>Palier brutal</b> : surface de barre, consigne, lot d’alliage','<b>Qui se stabilise</b> : température du bain','<b>En dents de scie</b> : une cuve ou un contact sur trois']};


const chim={...COMMON,line:'chim',press:'Ligne NiP1',machine:'Ligne de nickel chimique · paniers',
 pname:'Ligne NiP1 · nickel chimique moyen phosphore · paniers · pièces acier',
 cycS:1800,barN:2,barL:'Cuve de nickel chimique',life:6,counterL:'Charges depuis l’analyse du bain',counterS:'Analyse bain',counterU:'charges',
 unit:'charge',units:'charges',stable:'Ligne stable',
 opcL:'Analyseur de bain en ligne (Ni, pH)',opcAbs:'Pas d’analyse en ligne : titrage labo seulement',membL:null,
 params:[
  {id:'vit',n:'Vitesse de dépôt (éprouvette)',sn:'Vitesse de dépôt',u:'µm/h',c:15,tol:3,s:.35,dec:1},
  {id:'ph',n:'pH du bain',sn:'pH du bain',u:'',c:4.8,tol:.2,s:.02,dec:2},
  {id:'tc',n:'Température du bain de nickel chimique',sn:'Température Ni chimique',u:'°C',c:88,tol:2,s:.2,dec:1},
  {id:'nic',n:'Nickel dans le bain',sn:'Nickel du bain',u:'g/L',c:6,tol:.6,s:.06,dec:2,opc:true}],
 kb:{
  vit:{down:[
    {l:'Température du bain basse : la vitesse chute fortement (environ ×2 par 10 °C)',n:8,r:'TS02-R07',shape:'expo',a:[A('Contrôler chauffage et sonde, revenir à la température de la gamme',6)]},
    {l:'Nickel ou réducteur sous la marge du fournisseur',n:8,r:'TS02-R07',shape:'ramp',a:[A('Titrer nickel et hypophosphite, réapprovisionner selon la fiche',6,true)]},
    {l:'pH bas',n:6,r:'TS02-R07',shape:'ramp',a:[A('Mesurer le pH à température contrôlée et corriger selon la fiche',5,true)]},
    {l:'Bain âgé : nombre de MTO élevé, orthophosphites accumulés',n:5,r:'TS02-R07',shape:'ramp',a:[A('Relire le nombre de MTO et planifier le renouvellement selon le fournisseur',4)]},
    {l:'Contamination par plomb, cadmium ou entraînement',n:4,r:'TS02-R05',shape:'step',a:[A('Analyser les impuretés et rechercher la source',4,true)]}],
   up:[
    {l:'Température haute : risque de décomposition',n:7,r:'TS02-R07',shape:'expo',a:[A('Revenir à la température de la gamme et surveiller la stabilité',5)]},
    {l:'pH haut après correction',n:5,r:'TS02-R07',shape:'step',a:[A('Mesurer le pH et vérifier la dernière correction tracée',4,true)]},
    {l:'Surcharge de surface ou particules : bain instable',n:4,r:'TS02-R07',shape:'step',a:[A('Contrôler la surface chargée et la filtration',4)]}]},
  ph:{down:[
    {l:'Consommation non compensée en cours de production',n:7,r:'TS02-R07',shape:'ramp',a:[A('Corriger le pH selon la fiche et tracer',5,true)]},
    {l:'Électrode de pH décalée',n:4,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Étalonner l’électrode sur tampons',4)]}],
   up:[
    {l:'Ajout de correcteur excessif',n:6,r:'TS02-R07',shape:'step',a:[A('Mesurer et revenir au pH de la gamme',5,true)]},
    {l:'Électrode de pH décalée',n:4,r:'TS01-R01',shape:'ramp',meas:true,a:[A('Étalonner l’électrode sur tampons',4)]}]},
  tc:{down:[
    {l:'Chauffage ou régulation en défaut',n:6,r:'TS02-R08',shape:'ramp',a:[A('Contrôler chauffage et régulation',5)]},
    {l:'Redémarrage : bain pas encore à température',n:6,r:'TS02-R08',shape:'expo',a:[A('Attendre la température avant de charger',5)]}],
   up:[
    {l:'Régulation de température en défaut',n:6,r:'TS02-R08',shape:'ramp',a:[A('Contrôler la régulation et la sonde',5)]},
    {l:'Sonde décalée',n:3,r:'TS02-R08',shape:'ramp',meas:true,a:[A('Comparer à un thermomètre de référence',3)]}]},
  nic:{down:[
    {l:'Réapprovisionnement en retard sur la surface traitée',n:8,r:'TS02-R07',shape:'ramp',a:[A('Titrer le nickel et réapprovisionner selon la surface traitée',6,true)]},
    {l:'Pompe doseuse ou réserve vide',n:5,r:'TS02-R04',shape:'step',a:[A('Contrôler la pompe et la réserve',5)]}],
   up:[
    {l:'Évaporation non compensée',n:4,r:'TS02-R07',shape:'ramp',a:[A('Contrôler le niveau, compléter et titrer',4,true)]},
    {l:'Ajout excessif',n:4,r:'TS02-R07',shape:'step',a:[A('Titrer et vérifier le dernier ajout tracé',4,true)]}]}},
 checks:{_dim:[],_all:['Comparer la valeur à un titrage labo ou une éprouvette de référence (TS01-R01)',
   'Relever température, pH, nickel, réducteur, surface chargée et MTO (TS02-R07)',
   'Rechercher une contamination : plomb, cadmium, entraînement, filtration (TS02-R05)',
   'Après action : suivre plusieurs charges avant de clore (TS01-R04)']},
 verif:{vit:'en mesurant la vitesse sur une éprouvette de référence, sur plusieurs charges.'},
 mdn:{},
 shapes:['<b>Progressive</b> : consommation non compensée, bain qui vieillit','<b>Palier brutal</b> : ajout, contamination','<b>Qui se stabilise</b> : température, redémarrage','<b>En dents de scie</b> : une cuve sur deux']};

window.SIM_CFGS={znni,anod,chim};
const q=new URLSearchParams(location.search).get('ligne');
window.SIM_CFG=q==='anod'?anod:q==='chim'?chim:znni;
})();
