window.PRESS_P=[
 {id:'dos',n:'Temps de dosage',u:'s',c:3.20,tol:.35,s:.06,dec:2},
 {id:'pre',n:'Pression de commutation',u:'bar',c:850,tol:60,s:12,dec:0},
 {id:'mat',n:'Matelas',u:'mm',c:4.50,tol:1.00,s:.12,dec:2},
 {id:'cyc',n:'Temps de cycle',u:'s',c:28.0,tol:2.0,s:.3,dec:1},
 {id:'tma',n:'Température matière',u:'°C',c:240,tol:8,s:1.2,dec:1},
 {id:'tmo',n:'Température masse outillage',u:'°C',c:60,tol:5,s:.5,dec:1},
 {id:'inj',n:'Temps d’injection',u:'s',c:1.20,tol:.15,s:.02,dec:2},
 {id:'pem',n:'Pression matière empreinte',u:'bar',c:420,tol:40,s:6,dec:0,opt:true},
 {id:'tem',n:'Température empreinte réelle',u:'°C',c:58,tol:5,s:.5,dec:1,opt:true}
];
window.EXPERTISE=[
{ id:'mat_clapet', param:'mat', titre:"Le matelas diminue cycle après cycle",
  effet:{trend:{mat:-0.18}},
  lead:"Le matelas baisse sur plusieurs cycles consécutifs. Tant qu'il reste dans la tolérance, le contrôle final peut ne rien voir ; en dessous, la pièce sera incomplète.",
  causes:[
   {id:'clapet',vraie:true,l:"Usure du clapet anti-retour",d:"Le clapet ne ferme plus complètement : une partie de la matière remonte dans la vis pendant l'injection.",n:14,
    actions:[
      {l:"Augmenter la course de dosage de 1,5 mm",d:"Compense la fuite pour tenir jusqu'à l'arrêt planifié.",ok:true,q:"matelas rétabli en 3 à 5 cycles, aucune perte de production",n:10},
      {l:"Augmenter la contre-pression de 10 bar",d:"Densifie le dosage sans traiter la fuite.",ok:false,q:"accélère l'usure de l'ensemble vis-clapet",n:4}]},
   {id:'temp',l:"Température matière trop élevée",d:"Une matière plus fluide s'écoule davantage à travers les jeux.",n:5,
    actions:[
      {l:"Baisser la température de la buse de 5 °C",d:"",ok:false,q:"risque de bouchon en buse",n:3},
      {l:"Baisser les zones fourreau de 10 °C",d:"",ok:false,q:"couple vis en hausse, dérive maintenue",n:2}]},
   {id:'alim',l:"Alimentation matière irrégulière",d:"Trémie en train de se vider ou voûtage de granulés.",n:3,
    actions:[
      {l:"Contrôler le niveau de la trémie et purger",d:"",ok:false,q:"sans effet si l'alimentation est correcte",n:2},
      {l:"Augmenter le temps de dosage de 0,3 s",d:"",ok:false,q:"allonge le cycle sans corriger le matelas",n:1}]}]},

{ id:'pre_temp', param:'pre', titre:"La pression de commutation se décentre",
  effet:{drift:{pre:-50}},
  lead:"La pression de commutation s'est nettement décalée sous sa moyenne récente. Le remplissage se fait désormais plus tôt en phase de maintien.",
  causes:[
   {id:'visco',vraie:true,l:"Baisse de viscosité de la matière",d:"Matière plus chaude ou plus fluide que la consigne : elle remplit l'empreinte avec moins de résistance.",n:16,
    actions:[
      {l:"Baisser la température matière de 5 °C",d:"Remonte la viscosité vers la valeur de référence.",ok:true,q:"pression recentrée en une dizaine de cycles",n:12},
      {l:"Augmenter la vitesse d'injection de 10 %",d:"Force le remplissage sans traiter la viscosité.",ok:false,q:"risque de bavures, dérive maintenue",n:4}]},
   {id:'fuite',l:"Fuite hydraulique ou clapet fatigué",d:"Perte de pression dans le circuit d'injection.",n:6,
    actions:[
      {l:"Augmenter la consigne de pression de 30 bar",d:"",ok:false,q:"masque la dérive au lieu de la corriger",n:4},
      {l:"Demander un contrôle du circuit hydraulique",d:"",ok:false,q:"nécessaire si la cause est confirmée, sans effet immédiat ici",n:3}]},
   {id:'moule',l:"Encrassement des évents du moule",d:"L'air ne s'échappe plus, la contre-pression dans l'empreinte augmente.",n:4,
    actions:[
      {l:"Nettoyer les évents au prochain arrêt",d:"",ok:false,q:"la pression irait plutôt à la hausse dans ce cas",n:2},
      {l:"Réduire le temps de maintien de 0,5 s",d:"",ok:false,q:"risque de retassures",n:2}]}]},

{ id:'tmo_derive', param:'tmo', titre:"La température masse outillage s'éloigne de sa référence",
  effet:{trend:{tmo:0.35,tem:0.3,cyc:0.05}},
  lead:"La température réelle de l'outillage monte progressivement alors que la consigne n'a pas changé. Le refroidissement de la pièce change : retassures, déformations et cotes hors tolérance deviennent possibles.",
  causes:[
   {id:'circuit',vraie:true,l:"Débit de refroidissement dégradé sur un circuit",d:"Raccord pincé, circuit entartré ou vanne partiellement fermée : la calorie n'est plus évacuée.",n:12,
    actions:[
      {l:"Contrôler débit et raccords du circuit, rétablir le débit nominal",d:"Vérification rapide au prochain changement de bac ou à l'arrêt.",ok:true,q:"température outillage revenue à la référence en quelques cycles",n:9},
      {l:"Allonger le temps de refroidissement de 2 s",d:"Compense l'effet sans traiter la cause.",ok:false,q:"cycle allongé, perte de capacité, dérive maintenue",n:3}]},
   {id:'consigne',l:"Consigne de thermorégulation modifiée",d:"Changement non tracé lors d'un réglage précédent.",n:4,
    actions:[
      {l:"Comparer la consigne au document de réglage",d:"",ok:false,q:"sans effet si la consigne est conforme",n:2}]},
   {id:'atelier',l:"Température atelier ou tour de refroidissement",d:"Eau de refroidissement plus chaude en période estivale.",n:3,
    actions:[
      {l:"Relever la température d'eau en entrée",d:"",ok:false,q:"utile si plusieurs presses dérivent en même temps",n:2}]}]},

{ id:'dos_lot', param:'dos', titre:"Saut brutal du temps de dosage",
  effet:{drift:{dos:0.25}},
  lead:"Le temps de dosage a sauté d'un cycle à l'autre et se maintient à sa nouvelle valeur. Un saut net, sans transition, désigne presque toujours un changement d'entrant.",
  causes:[
   {id:'lot',vraie:true,l:"Changement de lot matière",d:"Nouveau lot plus humide ou d'indice de fluidité différent : la vis met plus de temps à doser.",n:13,
    actions:[
      {l:"Étuver le lot et purger avant reprise",d:"Traite l'humidité résiduelle du nouveau lot.",ok:true,q:"dosage revenu à la consigne, pas de rebut supplémentaire",n:10},
      {l:"Augmenter la vitesse de rotation de la vis de 15 %",d:"Compense le temps sans traiter l'humidité.",ok:false,q:"risque de dégradation matière et de traces d'argent",n:3}]},
   {id:'buse',l:"Buse partiellement obstruée",d:"Bouchon ou dégradation en pointe de buse.",n:5,
    actions:[
      {l:"Purger la buse à 3 reprises",d:"",ok:false,q:"sans effet si la buse est propre",n:3},
      {l:"Augmenter la température de buse de 10 °C",d:"",ok:false,q:"risque de coulée en buse",n:2}]},
   {id:'capteur',l:"Défaut du capteur de course de vis",d:"Mesure fausse, procédé correct.",n:3,
    actions:[
      {l:"Recalibrer le capteur de course",d:"",ok:false,q:"la dérive persiste : les autres paramètres confirment un vrai changement",n:2},
      {l:"Ignorer l'alarme pendant 50 cycles",d:"",ok:false,q:"perte de traçabilité, dérive maintenue",n:1}]}]},

{ id:'cyc_froid', param:'cyc', titre:"Le temps de cycle s'allonge",
  effet:{trend:{cyc:0.45}},
  lead:"Le temps de cycle augmente régulièrement. Quelques dixièmes par cycle passent inaperçus sur une heure ; sur une semaine, c'est plusieurs milliers de pièces de capacité perdue.",
  causes:[
   {id:'refroid',vraie:true,l:"Refroidissement moule insuffisant",d:"Débit ou température du groupe froid dégradé : le temps de refroidissement s'allonge pour tenir la pièce.",n:15,
    actions:[
      {l:"Rétablir le débit du circuit de refroidissement",d:"Contrôle du groupe froid et des raccords rapides.",ok:true,q:"cycle revenu à la consigne, capacité récupérée",n:11},
      {l:"Réduire le temps de refroidissement de 1 s",d:"Gagne du cycle au détriment de la pièce.",ok:false,q:"déformation au démoulage, rebuts en hausse",n:4}]},
   {id:'robot',l:"Ralentissement du préhenseur ou de l'extraction",d:"Temps de dégagement du robot allongé.",n:5,
    actions:[
      {l:"Contrôler la pression d'air du préhenseur",d:"",ok:false,q:"sans effet si l'extraction est nominale",n:3},
      {l:"Réduire la course d'ouverture de 20 mm",d:"",ok:false,q:"gain marginal, dérive maintenue",n:2}]},
   {id:'demoul',l:"Démoulage difficile",d:"Pièce qui colle, éjection incomplète.",n:3,
    actions:[
      {l:"Appliquer un agent de démoulage",d:"",ok:false,q:"contamination de surface, effet temporaire",n:2},
      {l:"Augmenter la force d'éjection de 10 %",d:"",ok:false,q:"risque de marques d'éjecteurs",n:1}]}]}
];
window.DEF={"Incomplet": ["Mb", "Ob", "Ri", "Rl", "Ci", "Cb", "Di", "Yi", "Yr"], "Bavure": ["Mh", "Oh", "Rr", "Ri", "Cf", "Ci", "Di", "Yi", "Yr"], "Givrage": ["Mh", "Mb", "Rr", "Dr", "Di", "Yi", "Yr"], "Retassure": ["Mh", "Oh", "Rr", "Ci", "Cb", "Di", "Yi", "Yr"], "Brûlure": ["Mh", "Oh", "Rr", "Dr", "Di", "Yi", "Yr"], "Ligne de soudure": ["Mb", "Ob", "Rl", "Cb", "Di", "Yr"], "Points noirs": ["Mh", "Di", "Yi", "Yr"], "Rayures": ["Oh", "Yi"], "Jet libre": ["Mb", "Ob", "Rr", "Cf", "Di"], "Goutte froide": ["Mh", "Mb", "Di", "Yi", "Yr"], "Peau d’orange": ["Mb", "Ob", "Ri", "Rl", "Ci", "Di", "Yi"], "Délaminage": ["Mb", "Ob", "Rr", "Ri", "Ci", "Di", "Yi"], "Bulles": ["Mh", "Ob", "Rr", "Cb", "Dr", "Di", "Yi"], "Bulles de vide": ["Mh", "Ob", "Rr", "Ci", "Di", "Yi"], "Dégradation matière": ["Mh", "Rr", "Dr", "Di", "Yi", "Yr"], "Strie de couleur": ["Mb", "Di", "Yi"], "Strie d’air": ["Mb", "Ob", "Rr", "Di", "Yi", "Yr"], "Strie de fibre de verre": ["Mb", "Ob", "Ri", "Rl", "Di", "Yi", "Yr"], "Pièces déformées": ["Mh", "Oh", "Ci", "Yi"], "Marques d’éjecteurs": ["Mh", "Oh", "Ci", "Yi"], "Pièces cassantes": ["Mh", "Mb", "Ob", "Ri", "Rl", "Ci", "Di", "Yi"], "Cotes pièces non conformes": ["Mh", "Mb", "Oh", "Ob", "Ri", "Ci", "Di", "Yi", "Yr"], "Fissuration sous contrainte": ["Mh", "Mb", "Ob", "Ri", "Cf", "Ci", "Di", "Yi"], "Traces brillantes ou mates": ["Mb", "Oh", "Ob", "Ri", "Ci", "Yi"]};
window.DLAB={"Mh": "Température masse matière trop haute", "Mb": "Température masse matière trop basse", "Oh": "Température réelle outillage trop haute", "Ob": "Température réelle outillage trop basse", "Rr": "Temps de remplissage trop rapide", "Ri": "Temps de remplissage irrégulier", "Rl": "Temps de remplissage trop lent", "Cf": "Commutation trop forte", "Ci": "Commutation irrégulière", "Cb": "Commutation trop basse", "Dr": "Temps de dosage trop rapide", "Di": "Temps de dosage irrégulier", "Dl": "Temps de dosage trop lent", "Yi": "Temps de cycle irrégulier", "Yr": "Rupture de cycle"};
window.DTRACK={Ci:'pre',Cf:'pre',Cb:'pre',Di:'dos',Dr:'dos',Dl:'dos',Yi:'cyc',Yr:'cyc',Mh:'tma',Mb:'tma',Oh:'tmo',Ob:'tmo',Ri:'inj',Rr:'inj',Rl:'inj'};
