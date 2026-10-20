/* Données de l’enquête QQOQC bavure (repris de qqoqcc.pplx.app, règles à valider par l’expert plasturgie partenaire) */
var QDEF=[['bavure','Bavures'],['givrage','Givrage',1],['retass','Retassures',1],['cotes','Cotes pièces non conformes',1],['incomp','Pièces incomplètes',1],['autres','… 24 défauts types',1]];
var QUI=[['op','Opératrice / opérateur'],['regl','Régleur'],['aval','Service interne aval (finition)'],['qual','Service qualité (après fabrication)'],['client','Client']];
var OU=[['meme','Toujours dans la même zone'],['seuil','Au niveau du seuil d’alimentation'],['fin','Au niveau de la fin de remplissage'],['autre','Dans une autre zone, toujours identique'],['alea','Aléatoire sur la pièce'],['tout','Sur l’ensemble de la moulée']];
var QUAND=[['demar','Au démarrage'],['serie','En cours de série'],['maint','Après une intervention maintenance']];
var FREQ=[['chaque','À chaque cycle'],['cycl','Cyclique'],['alea','Aléatoire']];
var VIS=[['demoul','Visible dès le démoulage'],['apres','Apparaît après le démoulage (manipulation, stockage)'],['refroid','Apparaît après le refroidissement de la pièce']];
/* Variante du QUAND pour un défaut détecté après fabrication (qualité, aval, client) : remarque C. Pletty */
var ETENDUE=[['tot','Sur la totalité de la série'],['partie','Sur une partie de la série']];
var POSTFAB=['aval','qual','client'];
var TERME=[['court','Court terme (changement de lot matière, fabrication, maintenance)'],['moyen','Moyen terme (dérive progressive)'],['long','Long terme (vieillissement)']];
var COMBIEN=[['rare','Quelques pièces'],['part','Une part régulière'],['toutes','Toutes les pièces']];
var PROC=[['to','Température outillage'],['tm','Température matière'],['ti','Temps d’injection'],['com','Variable de commutation'],['td','Temps de dosage'],['tc','Temps de cycle'],['mat','Matelas'],['visc','Viscosité apparente']];
var ORIG=[['presse','Presse','usure, étalonnage…'],['outil','Outillage','usure, casse…'],['peri','Périphérique','usure, inadapté…'],['mode','Mode opératoire',''],['std','Standard','fiche de réglage, consignes'],['env','Environnement','eau, air, atelier'],['mati','Matière','ajout à valider']];
var LBL={};[QDEF,QUI,OU,QUAND,ETENDUE,FREQ,VIS,TERME,COMBIEN,PROC].forEach(l=>l.forEach(([v,t])=>LBL[v]=LBL[v]||t));
var lab=(list,v)=>(list.find(x=>x[0]===v)||[,''])[1];

/* ---------- Causes bavure (Ishikawa niveau 2) ----------
 t: mes = donnée de mesure (bleu), reg = paramètre de réglage (gris), cmp = paramètre compensable (*), add = complément Vella à valider */
var ISHI=[
 {id:'m1',b:'Matière',n:'Viscosité matière (lot plus fluide)',t:'cmp',ctl:'Comparer l’indice de fluidité du lot au précédent sur certificat fournisseur. Compenser par la température matière si le lot est conforme.',ind:{ou:['tout','fin'],terme:['court'],freq:['chaque']}},
 {id:'m2',b:'Matière',n:'Température matière trop haute',t:'mes',p:'tm',ctl:'Relever la température matière réelle (sonde ou purge) et la comparer à la fiche de réglage.',ind:{ou:['tout','fin'],freq:['chaque'],terme:['moyen']}},
 {id:'o1',b:'Outillage',n:'Affaissement du moule',ctl:'Contrôler la planéité des plaques et l’appui central du moule, à chaud.',ind:{ou:['meme','tout'],freq:['chaque'],terme:['long']}},
 {id:'o2',b:'Outillage',n:'Seuil d’alimentation usé ou après réfection',ctl:'Mesurer le seuil et le comparer au plan ; relire la dernière intervention outillage.',ind:{ou:['seuil'],quand:['maint'],freq:['chaque'],terme:['long','court']}},
 {id:'o3',b:'Outillage',n:'Empreinte endommagée',ctl:'Inspecter l’empreinte à la loupe dans la zone de la bavure (choc, coup d’éjecteur, pièce coincée).',ind:{ou:['meme','autre'],freq:['chaque'],terme:['court']}},
 {id:'o4',b:'Outillage',n:'Température outillage trop haute',t:'mes',p:'to',ctl:'Relever la température des deux parties du moule (pyromètre) et l’état du thermorégulateur.',ind:{ou:['meme','fin'],quand:['serie'],terme:['moyen']}},
 {id:'o5',b:'Outillage',n:'Plan de joint sale',ctl:'Nettoyer et inspecter le plan de joint : résidu de matière, graisse, copeau.',ind:{ou:['alea','meme'],quand:['serie','maint'],freq:['alea'],terme:['court']}},
 {id:'o6',b:'Outillage',n:'Problème local de régulation excessive',ctl:'Vérifier débit et température de chaque circuit de la zone touchée (circuit bouché, inversé, débit trop fort).',ind:{ou:['meme','autre'],freq:['chaque'],terme:['moyen']}},
 {id:'o7',b:'Outillage',n:'Problème de bloc chaud',ctl:'Contrôler les zones du bloc chaud (résistances, thermocouples, fuite à la buse).',ind:{ou:['seuil'],quand:['demar','serie'],freq:['chaque','cycl'],terme:['court']}},
 {id:'o8',b:'Outillage',n:'Déformation de la partie moulante',ctl:'Contrôler la partie moulante (empreinte, noyau) à la cote et au bleu.',ind:{ou:['meme'],freq:['chaque'],terme:['long']}},
 {id:'o9',b:'Outillage',n:'Jeux importants entre l’éjecteur et le logement',ctl:'Mesurer le jeu des éjecteurs de la zone et le comparer à la tolérance d’ajustement.',ind:{ou:['autre','meme'],freq:['chaque'],terme:['long','moyen']}},
 {id:'o10',b:'Outillage',n:'Plan de joint écrasé',ctl:'Contrôler le plan de joint au bleu de Prusse ou en lumière rasante.',ind:{ou:['meme','autre'],quand:['maint'],freq:['chaque'],terme:['long','court']}},
 {id:'o11',b:'Outillage',n:'Évents creusés',ctl:'Mesurer la profondeur des évents de la zone et la comparer au plan d’outillage.',ind:{ou:['fin'],freq:['chaque'],terme:['long']}},
 {id:'o12',b:'Outillage',n:'Matière écrasée dans le plan de joint',ctl:'Rechercher une pièce ou une carotte mal éjectée qui a marqué le plan de joint.',ind:{ou:['alea','meme'],freq:['alea'],terme:['court'],combien:['rare']}},
 {id:'o13',b:'Outillage',n:'Arrachement de plastique au plan de joint',ctl:'Inspecter le plan de joint pour des dépôts arrachés ; nettoyer et polir si besoin.',ind:{ou:['meme'],freq:['alea','cycl'],terme:['court']}},
 {id:'y1',b:'Moyen',n:'Conditions d’étuvage',ctl:'Vérifier le temps et la température d’étuvage, le point de rosée du dessiccateur, l’humidité résiduelle.',ind:{ou:['tout'],quand:['demar'],freq:['alea','cycl'],terme:['court']}},
 {id:'y2',b:'Moyen',n:'Force de fermeture insuffisante ou parallélisme des plateaux',t:'add',ctl:'Vérifier la force de fermeture réelle (pas la consigne), puis le parallélisme des plateaux.',ind:{ou:['tout','seuil'],quand:['maint','demar'],freq:['chaque'],terme:['long'],combien:['toutes']}},
 {id:'p1',b:'Paramètres',n:'Température bloc chaud non conforme',t:'reg',ctl:'Comparer chaque zone du bloc chaud à la fiche de réglage.',ind:{ou:['seuil'],quand:['demar','maint'],freq:['chaque']}},
 {id:'p2',b:'Paramètres',n:'Pic de pression au passage du seuil',t:'reg',ctl:'Lire la courbe de pression d’injection au passage du seuil et lisser le profil de vitesse.',ind:{ou:['seuil'],freq:['chaque']}},
 {id:'p3',b:'Paramètres',n:'Variation importante du temps de cycle',t:'mes',p:'tc',ctl:'Relever les temps de cycle sur la dernière heure (arrêts, cycles semi-automatiques).',ind:{freq:['alea','cycl'],terme:['moyen']}},
 {id:'p4',b:'Paramètres',n:'Recul de la vis au passage en maintien',t:'reg',ctl:'Vérifier la course de la vis à la commutation et la pression de maintien.',ind:{ou:['fin','tout'],freq:['chaque','alea']}},
 {id:'p5',b:'Paramètres',n:'Réglage de la vitesse d’injection',t:'reg',ctl:'Comparer la vitesse d’injection à la fiche de réglage validée.',ind:{ou:['fin','tout'],quand:['demar','maint'],freq:['chaque']}},
 {id:'p6',b:'Paramètres',n:'Pression de commutation trop forte',t:'mes',p:'com',ctl:'Relever la pression à la commutation et la comparer à la plage validée.',ind:{ou:['fin'],freq:['chaque']}},
 {id:'p7',b:'Paramètres',n:'Variation importante du temps de dosage',t:'mes',p:'td',ctl:'Relever les temps de dosage sur 50 cycles et calculer l’écart.',ind:{freq:['alea','cycl'],terme:['moyen']}},
 {id:'p8',b:'Paramètres',n:'Réglage des paliers de vitesse d’injection',t:'reg',ctl:'Vérifier les paliers de vitesse : la fin de remplissage doit être plus lente.',ind:{ou:['fin'],freq:['chaque'],quand:['demar','maint']}},
 {id:'p9',b:'Paramètres',n:'Vitesse d’injection trop rapide',t:'mes',p:'ti',ctl:'Relever le temps d’injection réel et le comparer au temps validé.',ind:{ou:['fin','tout'],freq:['chaque']}},
 {id:'p10',b:'Paramètres',n:'Limite de pression atteinte',t:'reg',ctl:'Vérifier sur la courbe que la pression d’injection n’atteint pas sa limite (vitesse non tenue).',ind:{ou:['tout'],freq:['chaque'],terme:['moyen']}},
 {id:'p11',b:'Paramètres',n:'Positionnement des paliers de vitesse',t:'reg',ctl:'Vérifier les positions de changement de palier par rapport au remplissage réel (pièces incomplètes progressives).',ind:{ou:['fin','meme'],freq:['chaque']}}
];
var BRANCHES=['Matière','Outillage','Moyen','Paramètres'];

/* ---------- Causes de dérive (branche C) ---------- */
var DRV=[
 {p:['to'],o:'peri',n:'Thermorégulateur défaillant (pompe, résistance, échangeur)',ctl:'Comparer consigne et retour du thermorégulateur ; contrôler pompe et résistance.',ind:{quand:['serie'],terme:['court','moyen'],freq:['chaque']}},
 {p:['to'],o:'outil',n:'Canaux de régulation entartrés ou partiellement bouchés',ctl:'Mesurer le débit de chaque circuit ; détartrer si débit faible.',ind:{terme:['long','moyen'],quand:['serie']}},
 {p:['to','tm'],o:'env',n:'Température de l’eau de refroidissement (réseau, tour)',ctl:'Relever la température de l’eau d’arrivée ; comparer selon l’heure ou la saison.',ind:{terme:['moyen'],freq:['cycl'],quand:['serie']}},
 {p:['to'],o:'mode',n:'Circuits raccordés différemment après changement de moule',ctl:'Comparer le raccordement au schéma de la fiche moule.',ind:{quand:['maint','demar'],terme:['court']}},
 {p:['to','tm','ti','com'],o:'std',n:'Consigne non conforme à la fiche de réglage',ctl:'Comparer les consignes de la presse à la fiche de réglage validée.',ind:{quand:['demar','maint'],terme:['court'],freq:['chaque']}},
 {p:['tm'],o:'presse',n:'Collier chauffant ou thermocouple du fourreau défaillant',ctl:'Contrôler chaque zone du fourreau (intensité des colliers, thermocouples).',ind:{quand:['serie'],terme:['court'],freq:['alea','cycl']}},
 {p:['tm','com'],o:'presse',n:'Étalonnage des capteurs de la presse',ctl:'Vérifier la date du dernier étalonnage ; contrôler avec un capteur de référence.',ind:{terme:['long']}},
 {p:['td','mat'],o:'presse',n:'Usure de la vis ou du clapet anti-retour',ctl:'Test d’étanchéité du clapet (matelas qui chute en maintien) ; mesurer la vis.',ind:{terme:['long','moyen'],freq:['alea'],quand:['serie']}},
 {p:['td','visc'],o:'peri',n:'Séchage insuffisant (dessiccateur, temps d’étuvage)',ctl:'Contrôler le point de rosée et le temps de séjour ; mesurer l’humidité résiduelle.',ind:{quand:['demar'],terme:['court','moyen'],freq:['alea','cycl']}},
 {p:['td'],o:'peri',n:'Alimentation trémie irrégulière (chargeur, mélangeur, broyé)',ctl:'Vérifier le niveau de trémie, le chargeur et le taux de broyé.',ind:{freq:['alea','cycl'],quand:['serie']}},
 {p:['td','visc','ti','com'],o:'mati',n:'Changement de lot matière (fluidité, taux de broyé)',ctl:'Comparer l’indice de fluidité du nouveau lot au précédent ; vérifier la date du changement.',ind:{terme:['court'],quand:['serie','demar'],freq:['chaque']}},
 {p:['mat'],o:'outil',n:'Fuite à la buse ou au bloc chaud',ctl:'Rechercher de la matière autour de la buse ; vérifier l’appui buse.',ind:{quand:['serie'],terme:['moyen','court'],freq:['chaque']}},
 {p:['mat'],o:'mode',n:'Appui buse ou centrage mal repris après intervention',ctl:'Vérifier l’appui et le rayon de buse après remontage.',ind:{quand:['maint'],terme:['court']}},
 {p:['ti','com'],o:'presse',n:'Huile hydraulique trop froide ou trop chaude',ctl:'Relever la température d’huile ; vérifier l’échangeur huile.',ind:{quand:['demar'],terme:['court','moyen'],freq:['cycl']}},
 {p:['ti','com'],o:'presse',n:'Usure de la servo-valve ou de la pompe',ctl:'Comparer vitesse réelle et consigne ; contrôler la réponse de la servo-valve.',ind:{terme:['long'],freq:['alea']}},
 {p:['tc'],o:'mode',n:'Interventions opérateur (porte ouverte, cycles semi-automatiques)',ctl:'Relire le journal de la presse : ouvertures de porte, passages en semi-automatique.',ind:{freq:['alea'],quand:['serie']}},
 {p:['tc'],o:'peri',n:'Robot ou convoyeur de prise de pièce',ctl:'Comparer le temps robot au temps de cycle ; vérifier les attentes de signal.',ind:{freq:['alea','cycl'],quand:['serie','maint']}},
 {p:['tc'],o:'outil',n:'Éjection difficile (pièce collante, éjecteur grippé)',ctl:'Observer l’éjection ; vérifier les éjecteurs et le dépouillement.',ind:{freq:['alea','cycl'],terme:['moyen']}},
 {p:['visc'],o:'env',n:'Humidité ambiante (matière stockée hors étuve)',ctl:'Vérifier le stockage et le temps d’exposition de la matière.',ind:{terme:['moyen'],freq:['cycl']}}
];

