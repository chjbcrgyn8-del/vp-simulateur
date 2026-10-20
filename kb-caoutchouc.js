/* Base de causes et d'actions · moulage caoutchouc
   Sources : ordre de contrôle de notre expert caoutchouc, référentiel 16 défauts et leurs leviers, scénarios du simulateur.
   n = nombre de cas dans l'expertise initiale, sert au classement par probabilité. Valeurs de démonstration à relire. */
window.SIM_CFG={
 sector:'caoutchouc',press:'Presse C4',
 params:[
  {id:'p',n:'Pression d’injection dynamique',u:'bar',c:200,tol:10,s:2,dec:0},
  {id:'pot',n:'Température du pot d’injection',u:'°C',c:70.3,tol:3,s:.4,dec:1},
  {id:'bcr',n:'Température des busettes BCR',u:'°C',c:85.4,tol:3,s:.5,dec:1},
  {id:'mo',n:'Température moule plateau fixe',u:'°C',c:180,tol:5,s:.5,dec:1},
  {id:'vu',n:'Temps de vulcanisation',u:'s',c:360,tol:15,s:1.5,dec:0}],
 kb:{
  p:{up:[
    {l:'Mélange plus visqueux : ML du lot au-dessus de la fiche matière',n:12,a:[{l:'Isoler le lot et passer au lot suivant contrôlé conforme',n:8},{l:'Ajuster la vitesse d’injection par un pas franc, avec l’accord du responsable process',n:4}]},
    {l:'Température du pot ou de la matière trop basse',n:6,a:[{l:'Revenir à la consigne du pot et contrôler sa régulation',n:4}]},
    {l:'Encrassement des busettes BCR ou des canaux du moule',n:5,a:[{l:'Nettoyer les busettes ou les canaux au prochain arrêt',n:4}]},
    {l:'Début de pré-vulcanisation du mélange (grillage)',n:4,a:[{l:'Purger et contrôler le Ts2 du lot au rhéomètre',n:3}]}],
   down:[
    {l:'Mélange moins visqueux : ML du lot sous la fiche matière',n:8,a:[{l:'Contrôler le ML du lot au rhéomètre et isoler le lot',n:5}]},
    {l:'Température du pot trop haute',n:5,a:[{l:'Revenir à la consigne du pot',n:4}]},
    {l:'Fuite dans l’unité d’injection',n:3,a:[{l:'Demander un contrôle de l’unité d’injection par la maintenance',n:2}]}]},
  pot:{up:[
    {l:'Circuit de thermorégulation du pot en défaut',n:10,a:[{l:'Revenir à la consigne, contrôler le thermorégulateur et purger la matière restée chaude',n:8}]},
    {l:'Vitesse de rotation de la boudineuse trop haute (échauffement)',n:4,a:[{l:'Revenir à la vitesse de rotation de la fiche',n:3}]},
    {l:'Consigne modifiée sans être tracée',n:4,a:[{l:'Revenir à la consigne validée',n:3}]}],
   down:[
    {l:'Circuit de thermorégulation du pot : débit ou résistance',n:7,a:[{l:'Contrôler débit et résistance du thermorégulateur',n:5}]},
    {l:'Redémarrage après un arrêt prolongé',n:3,a:[{l:'Attendre la stabilisation du pot avant de produire',n:3}]},
    {l:'Consigne baissée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}]},
  bcr:{up:[
    {l:'Refroidissement des busettes insuffisant (débit d’eau)',n:8,a:[{l:'Rétablir le débit d’eau du bloc BCR',n:6}]},
    {l:'Régulation du bloc BCR en défaut',n:5,a:[{l:'Contrôler la régulation et le thermocouple du BCR',n:4}]},
    {l:'Consigne modifiée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}],
   down:[
    {l:'Débit d’eau trop fort ou régulation instable',n:6,a:[{l:'Revenir au débit nominal et contrôler la régulation',n:4}]},
    {l:'Consigne baissée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}]},
  mo:{up:[
    {l:'Régulateur ou thermocouple du plateau en défaut',n:6,a:[{l:'Contrôler la zone de chauffe et le thermocouple par la maintenance',n:4}]},
    {l:'Consigne modifiée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}],
   down:[
    {l:'Zone de chauffe du plateau fixe qui ne suit plus (résistance ou thermocouple)',n:11,a:[{l:'Faire contrôler la zone de chauffe, revenir à la consigne et bloquer les pièces depuis le début de la dérive',n:8}]},
    {l:'Moule resté ouvert longtemps : arrêts ou démoulage lent',n:4,a:[{l:'Attendre la stabilisation thermique avant de produire',n:3}]},
    {l:'Consigne baissée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}]},
  vu:{up:[
    {l:'Temps allongé pour compenser un moule plus froid',n:6,a:[{l:'Traiter la cause côté température moule, puis revenir au temps de la fiche',n:4}]},
    {l:'Consigne allongée sans être tracée',n:4,a:[{l:'Revenir au temps de vulcanisation de la fiche',n:3}]}],
   down:[
    {l:'Temps raccourci pour gagner du cycle, sans validation',n:7,a:[{l:'Revenir au temps de la fiche et bloquer les pièces pour contrôle de cuisson',n:5}]},
    {l:'Changement de mélange plus rapide (T90 plus court) non pris en compte',n:3,a:[{l:'Valider le nouveau temps avec le rhéomètre et mettre à jour la fiche',n:2}]}]}
 },
 /* Ordre de contrôle de l'expert caoutchouc, proposé pour « Je ne sais pas » */
 checks:{_all:['Lot de mélange au rhéomètre : ML, puis Ts2 ou T10, puis T90','Température matière en sortie de buse, ou aux busettes si la presse a un BCR','Unité d’injection : température et vitesse de la boudineuse, puis température du pot et vitesse d’injection','Température réelle du moule','Encrassement : busettes si BCR, sinon canaux du moule']}
};
/* Cycles réels : colonnes du fichier exemple (cycles-caoutchouc.js) pour les 5 paramètres suivis,
   colonnes de consigne servant à repérer les changements de réglage, référence sur 500 cycles. */
window.SIM_CFG.real={cols:{p:21,pot:14,bcr:18,mo:28,vu:34},sets:[13,17,27,33],refN:500,
 refNote:'Calculée sur les 500 cycles réels qui précèdent le point de départ, puis recalculée au lancement de chaque dérive. Tolérances de recette appliquées autour de cette référence. Busettes BCR : la mesure réelle tourne autour de 89,9 °C pour une consigne de 85 °C, écart à confirmer avec notre expert caoutchouc.'};
