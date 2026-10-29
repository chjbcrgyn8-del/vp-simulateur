/* Base de causes et d'actions · décolletage (tour à poupée mobile)
   Périmètre : DC-01 dérives dimensionnelles et DC-04 usure / ébréchure / casse d'outil.
   Sources : dossier « Enrichissement mondial décolletage v2.0 » du 29/10/2026 (INT-D19 à INT-D51),
   complété le 29/10/2026 par la recherche mondiale v2.1 (RM-D01 à RM-D33, voir sources-decolletage.html),
   statut RECHERCHE_DOCUMENTAIRE_NON_VALIDEE. Aucune règle approuvée par un expert décolletage.
   n = poids illustratif, non calibré, sans fréquence terrain. r = règle candidate concernée.
   shape = forme de la dérive simulée quand cette cause est la cause tirée au sort :
   ramp (progressive), expo (qui se stabilise), step (palier), bar (dents de scie selon la position dans la barre).
   meas = la dérive vient du moyen de mesure ; canon = branche masquée sur machine sans canon. */
window.SIM_CFG={
 sector:'decolletage',press:'Tour T7',machine:'Tour T7 · poupée mobile',
 params:[
  {id:'d',n:'Ø extérieur 6,000 (finition)',sn:'Ø extérieur',u:'mm',c:6.000,tol:.010,s:.0016,dec:3,dim:true},
  {id:'l',n:'Longueur totale 12,00',sn:'Longueur totale',u:'mm',c:12.000,tol:.030,s:.0045,dec:3,dim:true},
  {id:'ra',n:'Rugosité Ra (prélèvement)',sn:'Rugosité Ra',u:'µm',c:.80,tol:.40,s:.05,dec:2,dirs:['up']},
  {id:'ch',n:'Charge broche principale',sn:'Charge broche',u:'%',c:38,tol:8,s:1.1,dec:0,opc:true},
  {id:'th',n:'Température huile de coupe',sn:'Température huile',u:'°C',c:31,tol:3,s:.22,dec:1}],
 kb:{
  d:{up:[
    {l:'Usure en dépouille progressive de l’arête de finition',n:14,r:'DC04-R01',shape:'ramp',a:[{l:'Inspecter l’arête à la loupe, la comparer au compteur, puis changer l’arête si l’usure est confirmée',n:9,reset:true},{l:'Appliquer la correction d’usure selon la procédure du site, valeur tracée',n:5}]},
    {l:'Croissance thermique : machine ou huile pas encore stabilisée après un arrêt',n:7,r:'DC01-R03',shape:'expo',a:[{l:'Relever la température d’huile et le temps depuis le redémarrage, produire après stabilisation selon la procédure du site',n:5},{l:'Bloquer et recontrôler les pièces produites pendant la mise en température',n:3}]},
    {l:'Moyen de mesure qui dérive : capteur post-process, étalonnage ou pièce mesurée chaude',n:6,r:'DC01-R01',shape:'ramp',meas:true,a:[{l:'Réétalonner le moyen sur la bague étalon, puis remesurer les pièces suspectes',n:5}]},
    {l:'Jeu ou usure du canon de guidage, barre en limite de tolérance de diamètre',n:5,r:'DC01-R04',shape:'bar',canon:true,a:[{l:'Contrôler le diamètre du lot de barre, puis le réglage du canon selon la notice constructeur',n:4}]},
    {l:'Ébréchure de l’arête de finition',n:4,r:'DC04-R01',shape:'step',a:[{l:'Arrêter, inspecter et changer l’arête, trier depuis la dernière pièce conforme',n:4,reset:true}]},
    {l:'Siège de plaquette encrassé ou vis de serrage desserrée',n:4,r:'DC04-R05',shape:'step',a:[{l:'Nettoyer le siège, resserrer la vis au couple de la notice outil, puis contre-mesurer',n:4}]}],
   down:[
    {l:'Correction d’usure non remise à zéro après un changement d’arête',n:9,r:'DC01-R02',shape:'step',a:[{l:'Comparer l’offset actif à la fiche de changement d’outil et revenir à la valeur tracée',n:7}]},
    {l:'Correction d’offset saisie deux fois ou avec le mauvais signe, non tracée',n:6,r:'DC01-R02',shape:'step',a:[{l:'Revenir à la dernière correction tracée et la faire valider par le régleur titulaire',n:5}]},
    {l:'Croissance thermique de la broche ou des chariots en cours de série',n:5,r:'DC01-R03',shape:'expo',a:[{l:'Relever températures et cadence, recontrôler après stabilisation',n:4}]},
    {l:'Moyen de mesure : zéro décalé du capteur post-process ou du micromètre',n:5,r:'DC01-R01',shape:'ramp',meas:true,a:[{l:'Réétalonner sur la bague étalon et remesurer les pièces suspectes',n:4}]},
    {l:'Changement de lot de barre : nuance ou état métallurgique différent',n:3,r:'DC04-R02',shape:'step',a:[{l:'Comparer le certificat du lot à la fiche matière et isoler les pièces depuis le changement',n:3}]},
    {l:'Plaquette montée différente de la fiche outil : rayon de bec ou nuance',n:3,r:'DC04-R05',shape:'step',a:[{l:'Comparer la plaquette à la fiche outil et monter la référence validée',n:3,reset:true}]}]},
  l:{up:[
    {l:'Glissement de la barre dans la pince : serrage insuffisant ou pince usée',n:8,r:'DC01-R02',shape:'bar',a:[{l:'Vérifier la pression de serrage et l’usure de la pince, selon la notice',n:6}]},
    {l:'Usure de l’outil de tronçonnage ou de dressage',n:6,r:'DC04-R01',shape:'ramp',a:[{l:'Inspecter l’outil de tronçonnage, le changer si l’usure est confirmée',n:5,reset:true}]},
    {l:'Croissance thermique selon l’axe Z',n:4,r:'DC01-R03',shape:'expo',a:[{l:'Relever le temps depuis le redémarrage et recontrôler après stabilisation',n:3}]},
    {l:'Moyen de mesure de longueur : butée ou zéro décalé',n:4,r:'DC01-R01',shape:'ramp',meas:true,a:[{l:'Remettre le moyen à zéro sur la cale étalon et remesurer',n:3}]}],
   down:[
    {l:'Butée ou poussée de l’embarreur mal réglée',n:6,r:'DC01-R02',shape:'step',a:[{l:'Contrôler la butée et la poussée de l’embarreur selon la fiche de réglage',n:5}]},
    {l:'Correction Z modifiée sans être tracée',n:5,r:'DC01-R02',shape:'step',a:[{l:'Revenir à la dernière correction tracée',n:4}]},
    {l:'Croissance thermique selon l’axe Z',n:4,r:'DC01-R03',shape:'expo',a:[{l:'Relever le temps depuis le redémarrage et recontrôler après stabilisation',n:3}]},
    {l:'Moyen de mesure de longueur : butée ou zéro décalé',n:3,r:'DC01-R01',shape:'ramp',meas:true,a:[{l:'Remettre le moyen à zéro sur la cale étalon et remesurer',n:3}]}]},
  ra:{up:[
    {l:'Usure de l’arête de finition : rayon de bec dégradé',n:10,r:'DC04-R01',shape:'ramp',a:[{l:'Inspecter l’arête et la changer si l’usure est confirmée',n:7,reset:true}]},
    {l:'Arête rapportée : matière collée sur l’arête',n:6,r:'DC04-R01',shape:'step',a:[{l:'Inspecter et nettoyer l’arête, vérifier débit et concentration d’huile',n:4},{l:'Changer l’arête si le collage persiste',n:3,reset:true}]},
    {l:'Lubrification insuffisante : débit, concentration ou buse déplacée',n:5,r:'DC04-R02',shape:'ramp',a:[{l:'Remettre débit, pression et orientation des buses aux valeurs de la fiche',n:4}]},
    {l:'Vibrations liées au canon ou au porte-à-faux de la barre',n:3,r:'DC01-R04',shape:'bar',canon:true,a:[{l:'Contrôler le réglage du canon selon la notice constructeur',n:3}]},
    {l:'Porte-à-faux ou serrage du porte-outil',n:3,r:'DC04-R01',shape:'step',a:[{l:'Resserrer le porte-outil et vérifier le porte-à-faux de la fiche',n:3}]},
    {l:'Déformation plastique de l’arête : chaleur et pression trop élevées',n:3,r:'DC04-R01',shape:'ramp',a:[{l:'Changer l’arête et signaler aux méthodes : conditions de coupe et arrosage à revoir',n:3,reset:true}]}]},
  ch:{up:[
    {l:'Usure progressive de l’outil : l’effort de coupe augmente',n:10,r:'DC04-R04',shape:'ramp',a:[{l:'Inspecter l’arête, la comparer au compteur et la changer si l’usure est confirmée',n:7,reset:true}]},
    {l:'Lot de barre plus dur ou nuance différente',n:5,r:'DC04-R02',shape:'step',a:[{l:'Comparer le certificat du lot à la fiche matière et isoler les pièces depuis le changement',n:4}]},
    {l:'Lubrification insuffisante : débit, concentration ou buse déplacée',n:5,r:'DC04-R02',shape:'ramp',a:[{l:'Remettre débit, pression et orientation des buses aux valeurs de la fiche',n:4}]},
    {l:'Arête rapportée ou début d’ébréchure',n:3,r:'DC04-R01',shape:'step',a:[{l:'Arrêter, inspecter et changer l’arête',n:3,reset:true}]}],
   down:[
    {l:'Arête cassée : l’outil ne coupe plus',n:7,r:'DC04-R01',shape:'step',a:[{l:'Arrêter la machine, inspecter l’outil, trier depuis la dernière pièce conforme',n:6,reset:true}]},
    {l:'Fin de barre ou barre mal engagée',n:4,r:'DC01-R02',shape:'step',a:[{l:'Contrôler l’engagement de la barre et le chargement de l’embarreur',n:3}]},
    {l:'Mesure non synchronisée avec la bonne phase du programme',n:3,r:'DC04-R04',shape:'step',a:[{l:'Vérifier la phase de programme associée à la mesure avant toute conclusion',n:3}]}]},
  th:{up:[
    {l:'Refroidisseur d’huile ou échangeur en défaut',n:7,r:'DC01-R03',shape:'ramp',a:[{l:'Faire contrôler le refroidisseur par la maintenance et recontrôler les cotes',n:5}]},
    {l:'Niveau ou débit d’huile insuffisant',n:5,r:'DC04-R02',shape:'ramp',a:[{l:'Rétablir niveau et débit d’huile selon la fiche',n:4}]},
    {l:'Cadence augmentée sans validation',n:3,r:'DC01-R03',shape:'step',a:[{l:'Revenir à la cadence validée',n:3}]}],
   down:[
    {l:'Redémarrage après un arrêt prolongé : machine encore froide',n:8,r:'DC01-R03',shape:'expo',a:[{l:'Attendre la stabilisation thermique selon la procédure du site avant de produire',n:6}]},
    {l:'Consigne de refroidissement modifiée sans être tracée',n:3,r:'DC01-R03',shape:'step',a:[{l:'Revenir à la consigne validée',n:3}]}]}
 },
 /* Ordres de contrôle par dérive (v2, recherche mondiale RM-D01 à RM-D33) : « contrôle → signe qui départage ».
    Candidats Vella Partners, à relire par un expert décolletage. Aucune valeur de réglage imposée. */
 checks:{
  d_up:['Contre-mesurer 3 pièces au moyen de référence, après contrôle sur la bague étalon et pièce revenue à température ambiante → si l’écart disparaît, c’est la mesure, pas la machine (DC01-R01)',
   'Lire la forme de la courbe depuis le dernier changement d’arête → hausse régulière qui suit le compteur : usure ; saut net : ébréchure ou siège ; hausse qui ralentit puis se stabilise après un redémarrage : thermique (DC01-R03)',
   'Inspecter l’arête à la loupe et la comparer au compteur → usure en dépouille régulière : cohérente avec une hausse progressive ; ébréchure ou matière collée : changer l’arête, ne pas compenser (DC04-R01)',
   'Contrôler le siège et le serrage de la plaquette → copeau ou dépôt sous la plaquette, vis non serrée au couple : nettoyer et resserrer avant toute correction (DC04-R05)',
   'Si la machine travaille avec canon : relier l’écart à la position dans la barre et mesurer le lot en plusieurs points → écart qui se répète à chaque barre : couple canon / barre, pas l’outil (DC01-R04)',
   'En dernier seulement : une correction d’usure, tracée, selon la procédure du site, puis vérification du retour (DC01-R05)'],
  d_down:['Contre-mesurer 3 pièces au moyen de référence, après contrôle sur la bague étalon → si l’écart disparaît, c’est la mesure (DC01-R01)',
   'Relire l’offset actif et l’historique des corrections → correction non remise à zéro après un changement d’arête, saisie double ou signe inversé : revenir à la dernière valeur tracée (DC01-R02)',
   'Lire la forme de la courbe → palier net juste après une intervention : réglage ou plaquette ; baisse qui ralentit en cours de série : thermique (DC01-R03)',
   'Comparer la plaquette montée à la fiche outil : référence, rayon, nuance → plaquette différente : palier dès le changement (DC04-R05)',
   'Relier le début de la dérive au changement de lot de barre → palier qui coïncide avec le lot : matière, isoler les pièces depuis le changement (DC04-R02)',
   'Après action : vérifier sur les pièces suivantes que la cote revient sans nouvelle correction (DC01-R05)'],
  l_up:['Remettre le moyen de mesure de longueur à zéro sur la cale étalon et remesurer → si l’écart disparaît, c’est la mesure (DC01-R01)',
   'Relier l’écart à la position dans la barre → écart aléatoire ou en dents de scie : glissement dans la pince, serrage ou usure de la pince (DC01-R02)',
   'Inspecter l’outil de tronçonnage ou de dressage → usure progressive ou bavure qui grossit : outil ; saut net : ébréchure (DC04-R01)',
   'Temps depuis le redémarrage → longueur qui dérive puis se stabilise : croissance thermique selon Z (DC01-R03)',
   'Après action : vérifier le retour sur les pièces suivantes avant de clore (DC01-R05)'],
  l_down:['Remettre le moyen de mesure de longueur à zéro sur la cale étalon et remesurer (DC01-R01)',
   'Contrôler la butée et la poussée de l’embarreur → palier après un chargement ou un réglage : butée ou poussée (DC01-R02)',
   'Relire la correction Z active et son historique → correction non tracée ou de signe inversé : revenir à la valeur tracée (DC01-R02)',
   'Temps depuis le redémarrage → dérive qui se stabilise : thermique selon Z (DC01-R03)',
   'Après action : vérifier le retour sur les pièces suivantes avant de clore (DC01-R05)'],
  ra_up:['Confirmer la mesure : même rugosimètre, même zone de la pièce, même longueur d’évaluation (DC01-R01)',
   'Inspecter l’arête → usure en dépouille ou en entaille : rayures ; matière collée : arrachements, aspect mat ; arête affaissée : déformation plastique (DC04-R01)',
   'Comparer à la valeur théorique f² / (32 rε) calculée avec l’avance et le rayon de la fiche → Ra proche de la valeur théorique : avance ou plaquette changée ; Ra nettement au-dessus : usure, arête rapportée ou vibrations (DC04-R01)',
   'Observer la surface → stries régulières de vibration : canon, porte-à-faux ou serrage du porte-outil (DC01-R04)',
   'Contrôler la lubrification → buse qui ne vise plus la pointe de l’outil, débit faible, filtration encrassée (DC04-R02)',
   'Observer les copeaux → copeaux qui frottent ou marquent la surface : évacuation (DC04-R02)'],
  ch_up:['Vérifier que la charge lue correspond à la bonne opération du programme → mauvaise phase : pas de conclusion (DC04-R04)',
   'Comparer au compteur de l’arête → hausse régulière qui suit le compteur : usure ; saut : ébréchure ou arête rapportée (DC04-R01)',
   'Relier le début de la hausse au changement de lot de barre → saut au changement : matière plus dure (DC04-R02)',
   'Contrôler la lubrification : débit, niveau, orientation des buses (DC04-R02)',
   'Croiser avec la cote et l’état de surface → charge qui monte sans dérive de cote : surveiller, ne pas corriger l’offset (DC04-R04)'],
  ch_down:['Chute brutale : arrêter, inspecter l’outil → arête cassée : trier depuis la dernière pièce conforme (DC04-R01)',
   'Contrôler l’engagement de la barre et la fin de barre (DC01-R02)',
   'Vérifier la phase de programme associée à la mesure (DC04-R04)',
   'Relire les alarmes machine disponibles, par exemple un détecteur de casse de l’outil de tronçonnage s’il existe (DC04-R04)'],
  th_up:['Comparer à une mesure indépendante de la température d’huile → si elles divergent, c’est la sonde (DC01-R01)',
   'Faire contrôler le refroidisseur ou l’échangeur par la maintenance (DC01-R03)',
   'Contrôler le niveau, le débit et la filtration de l’huile (DC04-R02)',
   'Relire la cadence : cadence augmentée sans validation (DC01-R03)',
   'Croiser avec le Ø et la longueur → cotes qui suivent la température : croissance thermique confirmée (DC01-R03)'],
  th_down:['Relever le temps depuis le redémarrage → machine encore froide : produire après stabilisation, selon la procédure du site (DC01-R03)',
   'Relire la consigne du refroidisseur : consigne modifiée sans être tracée (DC01-R03)',
   'Pendant la mise en température, ne pas corriger les offsets, ou tracer la correction comme provisoire (DC01-R02)'],
  _dim:['Contre-mesurer 3 pièces sur le moyen de référence avant toute correction (DC01-R01)','Relire le contexte tracé : pièce, position dans la barre, compteur d’arête, dernier offset (DC01-R02)','Temps depuis le redémarrage et températures disponibles (DC01-R03)','Inspecter l’arête à la loupe et la comparer au compteur (DC04-R03)','Si la machine travaille avec canon : jeu canon / barre et diamètre du lot (DC01-R04)'],
  _all:['Inspecter l’arête : usure progressive, ébréchure ou arête rapportée (DC04-R01)','Compteur de pièces et motif du dernier changement d’arête (DC04-R03)','Croiser avec la cote et l’état de surface (DC04-R01)','Lubrification, lot de barre et conditions de coupe de la fiche (DC04-R02)','Vérifier que la donnée CNC correspond à la bonne opération (DC04-R04)']},
 /* Vérification du retour, affichée après l'action simulée (DC01-R05) */
 verif:{
  d:'au moyen de référence, sur les pièces suivantes : le Ø revient vers le nominal sans nouvelle correction, et l’écart ne réapparaît pas à la barre suivante. Tracer la cote, la cause et l’action.',
  l:'au moyen de référence remis à zéro, sur les pièces suivantes : la longueur revient vers le nominal, quelle que soit la position dans la barre.',
  ra:'au rugosimètre, même zone et même longueur d’évaluation : Ra revient vers sa valeur de référence ; inspecter de nouveau l’arête.',
  ch:'la charge revient vers sa référence pour la même opération, et la cote comme l’état de surface restent stables.',
  th:'la température d’huile revient dans sa plage, puis les cotes se stabilisent ; contrôler les pièces produites pendant l’écart.'},
 /* Règles candidates : intitulés de travail Vella Partners déduits du dossier v2.0, à confirmer contre le lot 2 */
 rules:{
  'DC01-R01':{t:'Contre-mesurer avant de corriger',s:['INT-D28','INT-D44','INT-D45','RM-D12','RM-D17','RM-D33']},
  'DC01-R02':{t:'Tracer la cote avec son contexte',s:['INT-D44','INT-D45','INT-D46','INT-D47']},
  'DC01-R03':{t:'Séparer croissance thermique et usure',s:['INT-D25','INT-D26','INT-D27','INT-D31','INT-D43','RM-D11','RM-D13','RM-D14','RM-D15']},
  'DC01-R04':{t:'Canon de guidage et barre',s:['INT-D19','INT-D20','INT-D24','RM-D06','RM-D07','RM-D08','RM-D09','RM-D31','RM-D32']},
  'DC04-R01':{t:'Distinguer usure, ébréchure et arête rapportée',s:['INT-D29','INT-D39','INT-D42','RM-D01','RM-D02','RM-D04','RM-D05','RM-D22']},
  'DC04-R02':{t:'Matière, conditions et lubrification',s:['INT-D34','INT-D35','INT-D36','INT-D43','INT-D50','RM-D15','RM-D16']},
  'DC04-R03':{t:'Inspection outil et compteur d’abord',s:['INT-D20','INT-D45']},
  'DC04-R04':{t:'Capteurs en lecture seule, donnée absente ≠ zéro',s:['INT-D30','INT-D33','INT-D41','INT-D42','INT-D46','INT-D47','INT-D49','INT-D50','RM-D10','RM-D23','RM-D24','RM-D25','RM-D26']},
  'DC01-R05':{t:'Vérifier le retour à la cote avant de clore',s:['RM-D18','RM-D19','RM-D20','RM-D21']},
  'DC04-R05':{t:'Siège, serrage et référence de la plaquette',s:['RM-D01','RM-D03']}}
};
