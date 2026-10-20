/* Enquête défauts plastique : les 23 défauts hors bavure.
   Causes liées aux mesures : matrice des 24 défauts types établie avec l’expert plasturgie partenaire (expertise.js, DEF).
   Autres causes : premier jet Vella à partir des tableaux de dépannage courants, recoupé avec les tableaux de dépannage publiés (MBPlastiPro), en relecture par l’expert plasturgie partenaire. */
var FAM=[['rem','Remplissage'],['asp','Aspect'],['dim','Dimensions et tenue']];
var DEFS=[
 ['Bavure','rem'],['Incomplet','rem'],['Retassure','rem'],['Bulles de vide','rem'],['Jet libre','rem'],['Ligne de soudure','rem'],['Goutte froide','rem'],
 ['Givrage','asp'],['Brûlure','asp'],['Points noirs','asp'],['Rayures','asp'],['Peau d’orange','asp'],['Délaminage','asp'],['Bulles','asp'],['Dégradation matière','asp'],['Strie de couleur','asp'],['Strie d’air','asp'],['Strie de fibre de verre','asp'],['Traces brillantes ou mates','asp'],
 ['Pièces déformées','dim'],['Marques d’éjecteurs','dim'],['Pièces cassantes','dim'],['Cotes pièces non conformes','dim'],['Fissuration sous contrainte','dim']];
var DHINT={'Givrage':'traînées argentées','Incomplet':'manque matière','Jet libre':'serpentin visible','Goutte froide':'marque près du seuil','Peau d’orange':'surface granuleuse','Délaminage':'couches qui se décollent','Bulles de vide':'vide interne','Pièces déformées':'voilage'};
var LIB={
 humid:{b:'Matière',n:'Séchage matière insuffisant (humidité du granulé)',ctl:'Mesurer l’humidité du granulé et vérifier temps et température d’étuvage par rapport à la fiche matière.',ind:{quand:['demar'],terme:['court'],freq:['alea','cycl']}},
 lot:{b:'Matière',n:'Changement de lot matière (fluidité différente)',ctl:'Comparer l’indice de fluidité du nouveau lot au précédent sur certificat ; vérifier la date du changement.',ind:{terme:['court'],freq:['chaque'],ou:['tout']}},
 broye:{b:'Matière',n:'Taux de broyé trop élevé ou mal mélangé',ctl:'Vérifier le taux de broyé réel et le mélangeur.',ind:{freq:['alea','cycl'],terme:['court']}},
 contam:{b:'Matière',n:'Matière polluée (autre matière, poussière, purge)',ctl:'Inspecter la trémie et le granulé ; purger et vérifier la propreté après changement de matière.',ind:{freq:['alea'],terme:['court'],quand:['demar','maint'],ou:['alea']}},
 colorant:{b:'Matière',n:'Colorant ou mélange-maître mal dosé ou mal dispersé',ctl:'Vérifier le dosage du colorant et son mélange avec le granulé.',ind:{freq:['cycl','alea'],terme:['court'],ou:['alea','tout']}},
 fibre:{b:'Matière',n:'Fibres de verre mal réparties ou cassées',ctl:'Vérifier le taux de fibres du lot et le taux de broyé.',ind:{ou:['tout'],freq:['chaque']}},
 etuve:{b:'Matière',n:'Étuvage trop long ou trop chaud (matière jaunie)',ctl:'Comparer temps et température d’étuvage à la fiche matière.',ind:{quand:['demar'],terme:['court'],ou:['tout']}},
 events:{b:'Outillage',n:'Évents bouchés ou insuffisants',ctl:'Nettoyer les évents de la zone et mesurer leur profondeur par rapport au plan.',ind:{ou:['fin'],freq:['chaque'],terme:['moyen','long']}},
 seuil:{b:'Outillage',n:'Seuil d’alimentation trop petit, usé ou mal placé',ctl:'Mesurer le seuil et le comparer au plan ; relire la dernière intervention outillage.',ind:{ou:['seuil','fin'],freq:['chaque'],terme:['long'],quand:['maint']}},
 regul:{b:'Outillage',n:'Circuit de régulation bouché, inversé ou mal raccordé',ctl:'Vérifier débit et température de chaque circuit de la zone ; comparer le raccordement à la fiche moule.',ind:{ou:['meme','autre'],terme:['moyen'],quand:['maint','serie']}},
 bloc:{b:'Outillage',n:'Problème de bloc chaud (zone, buse, thermocouple)',ctl:'Contrôler chaque zone du bloc chaud : résistances, thermocouples, fuite à la buse.',ind:{ou:['seuil'],quand:['demar','serie'],freq:['chaque','cycl']}},
 surf:{b:'Outillage',n:'État de surface de l’empreinte (usure, polissage)',ctl:'Inspecter l’empreinte en lumière rasante et la comparer à l’état de référence.',ind:{ou:['meme','tout'],terme:['long']}},
 depot:{b:'Outillage',n:'Dépôts ou agent de démoulage sur l’empreinte',ctl:'Nettoyer l’empreinte ; vérifier l’usage de l’agent de démoulage.',ind:{ou:['meme','alea'],terme:['moyen'],quand:['serie']}},
 eject:{b:'Outillage',n:'Éjection mal équilibrée ou éjecteurs grippés',ctl:'Observer l’éjection au ralenti ; vérifier la course et l’état des éjecteurs.',ind:{ou:['meme'],freq:['chaque'],terme:['moyen']}},
 depouille:{b:'Outillage',n:'Dépouille insuffisante ou contre-dépouille',ctl:'Contrôler la dépouille de la zone sur le plan et sur l’empreinte.',ind:{ou:['meme'],freq:['chaque'],terme:['long']}},
 froid:{b:'Outillage',n:'Goutte froide non piégée (buse ou canal froid)',ctl:'Vérifier la température de la buse et la présence d’un puits de goutte froide.',ind:{ou:['seuil'],quand:['demar'],freq:['cycl','alea']}},
 usure:{b:'Outillage',n:'Usure ou réfection de l’empreinte',ctl:'Mesurer l’empreinte aux cotes critiques ; relire l’historique outillage.',ind:{terme:['long'],quand:['maint'],ou:['meme']}},
 paroi:{b:'Outillage',n:'Épaisseur de paroi forte ou irrégulière (conception pièce)',ctl:'Repérer la zone sur le plan pièce : surépaisseur, nervure ou changement brusque d’épaisseur.',ind:{ou:['meme'],freq:['chaque'],terme:['long']}},
 clapet:{b:'Moyen',n:'Usure de la vis ou du clapet anti-retour',ctl:'Test d’étanchéité du clapet (matelas qui chute en maintien) ; mesurer la vis.',ind:{terme:['long','moyen'],freq:['alea'],quand:['serie']}},
 fourreau:{b:'Moyen',n:'Collier chauffant ou thermocouple du fourreau défaillant',ctl:'Contrôler chaque zone du fourreau : intensité des colliers, thermocouples.',ind:{freq:['alea','cycl'],terme:['court'],quand:['serie']}},
 manip:{b:'Moyen',n:'Manutention ou stockage des pièces (chocs, empilage)',ctl:'Suivre une pièce de la presse au carton : robot, tapis, bac, empilage.',ind:{quand:['serie'],freq:['alea'],vis:['refroid','apres']}},
 chimique:{b:'Moyen',n:'Contact avec un produit agressif (graisse, solvant, agent de démoulage)',ctl:'Lister les produits en contact avec la pièce après moulage et pendant l’assemblage.',ind:{vis:['refroid','apres'],quand:['maint','serie'],freq:['alea']}},
 condit:{b:'Moyen',n:'Pièces mesurées trop tôt ou mal conditionnées',ctl:'Vérifier le délai et la température de conditionnement avant mesure.',ind:{vis:['refroid'],quand:['demar']}},
 sejour:{b:'Paramètres',n:'Temps de séjour trop long dans le fourreau',ctl:'Comparer le volume injecté à la capacité du fourreau ; vérifier les arrêts récents.',ind:{quand:['demar','serie'],freq:['chaque'],terme:['moyen']}},
 maintien_b:{b:'Paramètres',n:'Pression ou temps de maintien insuffisant',ctl:'Comparer pression et temps de maintien à la fiche ; vérifier que le seuil est figé.',ind:{ou:['meme','tout'],freq:['chaque']}},
 maintien_h:{b:'Paramètres',n:'Pression de maintien trop forte (surcompactage)',ctl:'Comparer la pression de maintien à la fiche ; observer la zone du seuil.',ind:{ou:['seuil','tout'],freq:['chaque']}},
 refroid:{b:'Paramètres',n:'Temps de refroidissement trop court',ctl:'Comparer le temps de refroidissement à la fiche et mesurer la température de la pièce à l’éjection.',ind:{ou:['tout'],freq:['chaque'],quand:['demar']}},
 vit_h:{b:'Paramètres',n:'Vitesse d’injection trop élevée au passage du seuil',ctl:'Lire le profil de vitesse ; ralentir le premier palier au passage du seuil.',ind:{ou:['seuil'],freq:['chaque']}},
 vit_b:{b:'Paramètres',n:'Vitesse d’injection trop lente',ctl:'Comparer la vitesse d’injection et les paliers à la fiche de réglage.',ind:{ou:['fin','tout'],freq:['chaque']}},
 contrep:{b:'Paramètres',n:'Contre-pression trop faible au dosage',ctl:'Comparer la contre-pression à la fiche ; observer l’homogénéité de la purge.',ind:{freq:['alea','cycl'],ou:['alea','tout']}},
 decomp:{b:'Paramètres',n:'Décompression trop forte (aspiration d’air)',ctl:'Réduire la course de décompression et observer la purge.',ind:{ou:['seuil','alea'],freq:['cycl','alea']}},
 rotation:{b:'Paramètres',n:'Vitesse de rotation de vis trop élevée (cisaillement)',ctl:'Comparer la vitesse de rotation à la fiche matière.',ind:{ou:['tout'],freq:['chaque']}},
 contrainte:{b:'Paramètres',n:'Contraintes internes (moule trop froid, injection forcée)',ctl:'Contrôler les contraintes (test solvant ou lumière polarisée) ; relire températures et maintien.',ind:{ou:['seuil','meme'],terme:['moyen'],vis:['refroid']}},
 retrait:{b:'Paramètres',n:'Retrait inégal entre les deux parties du moule',ctl:'Mesurer la température des deux parties du moule ; équilibrer la régulation.',ind:{ou:['tout'],vis:['refroid'],terme:['moyen']}}
};
var DMAP={
 'Incomplet':['events','seuil','vit_b','clapet','lot','froid','bloc','paroi'],
 'Givrage':['humid','decomp','contrep','sejour','vit_h','contam'],
 'Retassure':['maintien_b','paroi','seuil','clapet','refroid','regul'],
 'Brûlure':['events','vit_h','sejour','rotation','decomp'],
 'Ligne de soudure':['vit_b','events','seuil','lot','regul'],
 'Points noirs':['contam','sejour','fourreau','clapet','broye','etuve'],
 'Rayures':['depouille','eject','surf','manip','depot'],
 'Jet libre':['vit_h','seuil','paroi','froid'],
 'Goutte froide':['froid','bloc','decomp','vit_h'],
 'Peau d’orange':['vit_b','surf','regul','maintien_b','depot'],
 'Délaminage':['contam','humid','colorant','vit_h'],
 'Bulles':['humid','decomp','contrep','events','contam'],
 'Bulles de vide':['maintien_b','paroi','seuil','refroid','clapet'],
 'Dégradation matière':['sejour','fourreau','rotation','etuve','contam'],
 'Strie de couleur':['colorant','contrep','broye','contam','rotation'],
 'Strie d’air':['decomp','contrep','vit_h','humid'],
 'Strie de fibre de verre':['vit_b','regul','fibre','maintien_b'],
 'Pièces déformées':['retrait','refroid','eject','maintien_h','paroi','regul'],
 'Marques d’éjecteurs':['eject','depouille','refroid','maintien_h'],
 'Pièces cassantes':['humid','sejour','broye','contam','contrainte','fibre'],
 'Cotes pièces non conformes':['lot','retrait','maintien_b','condit','usure','regul','clapet'],
 'Fissuration sous contrainte':['contrainte','chimique','maintien_h','eject','depouille'],
 'Traces brillantes ou mates':['surf','depot','regul','vit_b','maintien_b']
};
/* Écarts de mesure de la matrice expert : code → donnée de mesure */
var MCODE={M:['tm','Matière','Température matière'],O:['to','Outillage','Température outillage'],R:['ti','Paramètres','Temps d’injection'],C:['com','Paramètres','Variable de commutation'],D:['td','Paramètres','Temps de dosage'],Y:['tc','Paramètres','Temps de cycle']};

/* Utilités (écosystème de la presse, présentation de l'expert plasturgie partenaire) · à valider */
LIB.air={b:'Moyen',n:'Air comprimé instable (pression ou humidité)',ctl:'Relever la pression d’air au poste (éjection par air, soufflage, préhenseur du robot) et la purge des filtres ; comparer à l’heure d’apparition du défaut.',ind:{freq:['alea'],ou:['tout']}};
LIB.secheur_air={b:'Moyen',n:'Sécheur d’air défaillant (point de rosée trop haut)',ctl:'Contrôler le point de rosée du sécheur et l’état du dessiccant ; mesurer l’humidité du granulé.',ind:{terme:['court','long'],freq:['alea','cycl']}};
LIB.tour_froid={b:'Moyen',n:'Eau de refroidissement instable (tour ou groupe froid)',ctl:'Relever température et débit d’eau en entrée et sortie de moule ; comparer à l’heure du défaut et à la météo.',ind:{terme:['long'],freq:['cycl','chaque']}};
[['Marques d’éjecteurs','air'],['Pièces déformées','air'],['Givrage','secheur_air'],['Bulles','secheur_air'],['Pièces cassantes','secheur_air'],['Retassure','tour_froid'],['Pièces déformées','tour_froid'],['Cotes pièces non conformes','tour_froid'],['Traces brillantes ou mates','tour_froid']].forEach(([d,c])=>{(DMAP[d]=DMAP[d]||[]).push(c);});
