/* Base de causes et d'actions · injection thermoplastique
   Sources : référentiel V21 (13 causes : signature, contrôle, action) et scénarios de l'expert plasturgie partenaire.
   n = nombre de cas dans l'expertise initiale, sert au classement par probabilité. Valeurs de démonstration à relire. */
window.SIM_CFG={
 sector:'plastique',press:'Presse 12',
 params:[
  {id:'dos',n:'Temps de dosage',u:'s',c:3.2,tol:.35,s:.06,dec:2},
  {id:'pre',n:'Pression de commutation',u:'bar',c:850,tol:60,s:12,dec:0},
  {id:'mat',n:'Matelas',u:'mm',c:4.5,tol:1,s:.12,dec:2},
  {id:'cyc',n:'Temps de cycle',u:'s',c:28,tol:2,s:.3,dec:1},
  {id:'tma',n:'Température matière',u:'°C',c:240,tol:8,s:1.2,dec:1},
  {id:'tmo',n:'Température masse outillage',u:'°C',c:60,tol:5,s:.5,dec:1},
  {id:'inj',n:'Temps d’injection',u:'s',c:1.2,tol:.15,s:.02,dec:2}],
 kb:{
  dos:{up:[
    {l:'Changement de lot matière (plus humide ou indice de fluidité différent)',n:13,a:[{l:'Étuver le lot selon la fiche matière et purger avant reprise',n:10},{l:'Comparer le numéro de lot et l’indice de fluidité au certificat',n:4}]},
    {l:'Broyé hétérogène (granulométrie instable)',n:8,a:[{l:'Régler la vanne de broyé au taux prescrit et isoler le broyé non conforme',n:6},{l:'Tamiser un échantillon en trémie et contrôler la fraction 2–4 mm',n:3}]},
    {l:'Contre-pression modifiée sans être tracée',n:5,a:[{l:'Revenir à la contre-pression de la fiche de réglage validée',n:4}]},
    {l:'Résistance de chauffe du fourreau défaillante',n:4,a:[{l:'Contrôler chaque zone de chauffe et remplacer la résistance, puis purger',n:3}]},
    {l:'Alimentation irrégulière : trémie basse ou voûtage des granulés',n:3,a:[{l:'Contrôler le niveau et l’écoulement en trémie, puis purger',n:2}]}],
   down:[
    {l:'Nouveau lot de matière plus fluide',n:7,a:[{l:'Vérifier le certificat du lot ; appliquer la recette validée pour ce grade après accord',n:5}]},
    {l:'Température fourreau trop haute (dégradation thermique)',n:5,a:[{l:'Revenir aux températures de la recette et purger',n:4}]},
    {l:'Contre-pression baissée sans être tracée',n:4,a:[{l:'Revenir à la contre-pression de la fiche de réglage validée',n:3}]},
    {l:'Capteur de course de vis déréglé',n:2,a:[{l:'Recalibrer le capteur de course',n:2}]}]},
  pre:{up:[
    {l:'Matière plus visqueuse : zone de chauffe du fourreau froide',n:12,a:[{l:'Contrôler les zones de chauffe et remplacer la résistance défaillante',n:8},{l:'Revenir aux températures de la recette',n:3}]},
    {l:'Moule plus froid : thermorégulateur défaillant',n:8,a:[{l:'Remettre le thermorégulateur en état (débit, résistance, encrassement)',n:6}]},
    {l:'Buse ou filtre partiellement obstrué',n:4,a:[{l:'Purger et nettoyer la buse',n:3}]},
    {l:'Évents encrassés : l’air reste piégé',n:3,a:[{l:'Nettoyer les évents selon la procédure moule',n:2}]}],
   down:[
    {l:'Baisse de viscosité : matière plus chaude ou lot plus fluide',n:16,a:[{l:'Baisser la température matière de 5 °C',n:12},{l:'Comparer le lot et son indice de fluidité au certificat',n:4}]},
    {l:'Séchage matière insuffisant (humidité du granulé)',n:9,a:[{l:'Étuver le lot selon la fiche matière avant de reprendre',n:7}]},
    {l:'Fuite hydraulique ou clapet anti-retour fatigué',n:6,a:[{l:'Demander un contrôle du circuit hydraulique',n:3},{l:'Faire un test d’étanchéité du clapet en maintien',n:3}]}]},
  mat:{up:[
    {l:'Course de dosage modifiée sans être tracée',n:5,a:[{l:'Revenir à la course de dosage de la fiche de réglage',n:4}]},
    {l:'Point d’injection figé trop tôt : l’empreinte prend moins de matière',n:4,a:[{l:'Purger la buse et contrôler la température du seuil',n:3}]},
    {l:'Nouveau lot de matière de densité différente',n:3,a:[{l:'Comparer le lot au certificat matière',n:2}]}],
   down:[
    {l:'Clapet anti-retour usé (fuite en fin de vis)',n:14,a:[{l:'Augmenter la course de dosage de 1,5 mm pour tenir jusqu’à l’arrêt planifié',n:10},{l:'Faire remplacer le clapet par la maintenance',n:8}]},
    {l:'Température matière trop élevée',n:5,a:[{l:'Revenir aux températures de la recette',n:3}]},
    {l:'Alimentation matière irrégulière',n:3,a:[{l:'Contrôler le niveau de la trémie et purger',n:2}]}]},
  cyc:{up:[
    {l:'Refroidissement du moule insuffisant (débit ou groupe froid)',n:15,a:[{l:'Rétablir le débit du circuit : groupe froid et raccords rapides',n:11}]},
    {l:'Ralentissement du préhenseur ou de l’extraction',n:5,a:[{l:'Contrôler la pression d’air du préhenseur',n:3}]},
    {l:'Dosage plus long que le refroidissement',n:4,a:[{l:'Traiter la cause du dosage long (lot, broyé, chauffe)',n:3}]},
    {l:'Démoulage difficile : la pièce colle',n:3,a:[{l:'Contrôler l’éjection et l’état des surfaces moulantes',n:2}]}],
   down:[
    {l:'Temps de refroidissement raccourci sans être tracé',n:8,a:[{l:'Revenir au temps de refroidissement de la recette',n:6}]},
    {l:'Cycle interrompu : sécurité porte ou robot',n:3,a:[{l:'Contrôler la sécurité porte et la prise de pièce du robot',n:2}]}]},
  tma:{up:[
    {l:'Consigne de température modifiée sans être tracée',n:9,a:[{l:'Revenir à la consigne validée ; si la modification était justifiée, mettre à jour la fiche',n:7}]},
    {l:'Échauffement par cisaillement : vitesse de vis ou contre-pression trop haute',n:6,a:[{l:'Revenir à la vitesse de vis et à la contre-pression de la recette',n:4}]},
    {l:'Thermocouple défaillant ou mal positionné',n:4,a:[{l:'Contrôler le thermocouple et le comparer à une mesure au pyromètre',n:3}]}],
   down:[
    {l:'Résistance de chauffe du fourreau hors service',n:12,a:[{l:'Remplacer la résistance défaillante, puis purger avant de reprendre',n:9}]},
    {l:'Thermocouple décalé',n:4,a:[{l:'Contrôler le thermocouple et le remplacer si besoin',n:3}]},
    {l:'Consigne baissée sans être tracée',n:3,a:[{l:'Revenir à la consigne validée',n:2}]}]},
  tmo:{up:[
    {l:'Débit de refroidissement dégradé sur un circuit',n:12,a:[{l:'Contrôler débit et raccords du circuit, rétablir le débit nominal',n:9}]},
    {l:'Consigne de thermorégulation modifiée sans être tracée',n:4,a:[{l:'Comparer la consigne à la fiche de réglage et y revenir',n:2}]},
    {l:'Eau de refroidissement plus chaude (tour, été)',n:3,a:[{l:'Relever la température d’eau en entrée, comparer aux autres presses',n:2}]}],
   down:[
    {l:'Thermorégulateur du moule défaillant',n:10,a:[{l:'Remettre le thermorégulateur en état puis attendre la stabilisation',n:7}]},
    {l:'Redémarrage après arrêt : moule pas encore à température',n:4,a:[{l:'Attendre la stabilisation thermique avant de produire',n:3}]},
    {l:'Consigne de thermorégulation modifiée sans être tracée',n:4,a:[{l:'Revenir à la consigne de la fiche de réglage',n:3}]}]},
  inj:{up:[
    {l:'Matière plus visqueuse : température matière trop basse',n:6,a:[{l:'Contrôler les zones de chauffe et revenir aux températures recette',n:4}]},
    {l:'Buse ou filtre partiellement obstrué',n:4,a:[{l:'Purger et nettoyer la buse',n:3}]},
    {l:'Pression d’injection en limite : la vitesse n’est plus tenue',n:3,a:[{l:'Vérifier la limite de pression réglée et la marge machine',n:2}]},
    {l:'Vitesse d’injection modifiée sans être tracée',n:3,a:[{l:'Revenir à la vitesse de la fiche de réglage',n:2}]}],
   down:[
    {l:'Changement de lot : matière plus fluide',n:8,a:[{l:'Revenir à un lot conforme ou appliquer la recette validée pour ce grade',n:6}]},
    {l:'Température matière trop haute',n:4,a:[{l:'Revenir aux températures de la recette',n:3}]},
    {l:'Clapet anti-retour usé',n:3,a:[{l:'Faire un test d’étanchéité du clapet en maintien',n:2}]}]}
 },
 checks:{
  dos:['Humidité du granulé à l’hygromètre et température d’étuve','Numéro de lot et indice de fluidité du certificat','Taux de broyé et granulométrie en trémie','Intensité de chaque zone de chauffe du fourreau'],
  pre:['Températures réelles du fourreau, zone par zone','Lot et humidité de la matière','Température réelle du moule au pyromètre','Propreté de la buse et des évents'],
  mat:['Test d’étanchéité du clapet en maintien','Course de dosage comparée à la fiche','Niveau et écoulement en trémie'],
  cyc:['Débit et température du groupe froid','Temps de dosage comparé au refroidissement','Temps de prise du robot ou du préhenseur'],
  tma:['Consignes comparées à la fiche de réglage validée','Mesure au pyromètre comparée au thermocouple','Intensité absorbée par zone de chauffe'],
  tmo:['Température des surfaces moulantes au pyromètre','Débit et température d’eau en entrée et sortie','Consigne du thermorégulateur'],
  inj:['Températures fourreau et buse','Lot et indice de fluidité','Pression d’injection atteinte comparée à la limite réglée']}
};
