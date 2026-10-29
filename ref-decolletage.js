/* Référentiel candidat décolletage · 16 défauts (8 en v2.0, 8 ajoutés en v2.1) (DC-01 dérives dimensionnelles, DC-04 usure / ébréchure / casse)
   Ordre de contrôle : proposé par Vella Partners à partir du dossier « Enrichissement mondial décolletage v2.0 ».
   Statut : RECHERCHE_DOCUMENTAIRE_NON_VALIDEE. À relire par un expert décolletage avant tout usage atelier. */
window.VELLA_REF_DEC={
 defects:[
  {tab:'D01',fam:'dim',defect:'Diamètre hors tolérance',hint:'Ø extérieur ou alésage',levers:['M','U','O','T','C','B','A','N']},
  {tab:'D02',fam:'dim',defect:'Cote qui dérive au fil de la série',hint:'dérive progressive',levers:['M','U','T','O','L','F','C']},
  {tab:'D03',fam:'dim',defect:'Cote instable après redémarrage',hint:'mise en température',levers:['M','T','L','O','C']},
  {tab:'D04',fam:'dim',defect:'Longueur ou épaulement hors cote',hint:'cote axiale',levers:['M','P','O','U','T','A']},
  {tab:'U01',fam:'out',defect:'Usure rapide de l’arête',hint:'durée de vie raccourcie',levers:['I','G','V','L','N','F','E']},
  {tab:'U02',fam:'out',defect:'Ébréchure d’arête',hint:'éclat brutal',levers:['I','A','G','N','E','V','C']},
  {tab:'U03',fam:'out',defect:'Casse d’outil',hint:'arrêt, pièces à trier',levers:['I','A','E','N','V','F']},
  {tab:'U04',fam:'out',defect:'Arête rapportée',hint:'matière collée',levers:['I','L','V','G','N']},
  /* Ajouts v2.1 (recherche mondiale RM-D01 à RM-D33), candidats non validés */
  {tab:'D05',fam:'dim',defect:'Conicité sur une portée',hint:'Ø différent d’un bout à l’autre',levers:['M','C','B','A','T','U','O']},
  {tab:'D06',fam:'dim',defect:'Ovalisation ou défaut de circularité',hint:'forme, pas seulement taille',levers:['M','C','B','P','A','T']},
  {tab:'D07',fam:'dim',defect:'Faux-rond entre usinage principal et reprise',hint:'coaxialité, contre-broche',levers:['M','K','P','C','B','O']},
  {tab:'D08',fam:'dim',defect:'Cote décalée juste après un changement d’arête',hint:'palier au changement',levers:['M','O','S','G','A','I']},
  {tab:'U05',fam:'out',defect:'Rugosité dégradée',hint:'état de surface lié à l’arête',levers:['M','R','I','U','A','C','L','E','G']},
  {tab:'U06',fam:'out',defect:'Déformation plastique de l’arête',hint:'arête affaissée, chaleur',levers:['I','V','L','G','N','F']},
  {tab:'U07',fam:'out',defect:'Usure en cratère ou en entaille',hint:'face de coupe ou limite de passe',levers:['I','V','G','N','L']},
  {tab:'U08',fam:'out',defect:'Durée de vie qui varie d’un lot à l’autre',hint:'compteur d’arête instable',levers:['N','B','I','L','G','V','S']}],
 /* Leviers : famille Ishikawa, mesure machine éventuelle, indices QQOQC, contrôle, règle candidate.
    gate = contre-mesure ; adj = correction de réglage, verrouillée tant que la contre-mesure n'est pas faite (DC-01). */
 levers:{
  M:{n:'Moyen de mesure et contre-mesure',b:'Mesure',p:null,ind:{freq:['alea'],quand:['demar']},ctl:'Contre-mesurer 3 pièces sur le moyen de référence ; vérifier étalonnage, température de la pièce et répétabilité du moyen.',r:'DC01-R01',gate:true},
  U:{n:'Usure de l’arête de finition',b:'Outil',p:'ch',ind:{terme:['moyen'],quand:['serie'],freq:['chaque']},ctl:'Inspecter l’arête à la loupe, la comparer au compteur de pièces et au repère de durée de vie de la fiche.',r:'DC04-R01'},
  O:{n:'Correction d’usure ou offset',b:'Programme et réglages',p:null,ind:{quand:['outil','regl'],terme:['court']},ctl:'Comparer l’offset actif à la dernière valeur tracée et à la fiche de changement d’arête.',r:'DC01-R02',adj:true},
  T:{n:'Croissance thermique : machine, huile, broche',b:'Machine et thermique',p:'th',ind:{quand:['demar'],terme:['moyen']},ctl:'Relever le temps depuis le redémarrage et les températures disponibles ; comparer pièces du début et pièces stabilisées.',r:'DC01-R03'},
  C:{n:'Canon de guidage et jeu avec la barre',b:'Machine et thermique',p:null,ind:{freq:['barre'],ou:['od']},ctl:'Contrôler le réglage et l’usure du canon selon la notice constructeur.',r:'DC01-R04',canon:true},
  B:{n:'Diamètre et rectitude du lot de barre',b:'Barre et matière',p:null,ind:{quand:['lot'],freq:['barre']},ctl:'Mesurer diamètre et rectitude du lot de barre ; relire le certificat matière.',r:'DC01-R04'},
  P:{n:'Serrage de la pince et avance de la barre',b:'Machine et thermique',p:null,ind:{ou:['long'],freq:['alea','barre']},ctl:'Vérifier la pression de serrage, l’usure de la pince et la butée de l’embarreur.',r:'DC01-R02'},
  N:{n:'Nuance et état métallurgique du lot',b:'Barre et matière',p:null,ind:{quand:['lot'],terme:['court']},ctl:'Comparer le certificat du lot à la fiche matière ; isoler les pièces depuis le changement de lot.',r:'DC04-R02'},
  L:{n:'Lubrification : débit, concentration, buses',b:'Machine et thermique',p:'th',ind:{terme:['moyen'],ou:['tout']},ctl:'Vérifier débit, pression, concentration et orientation des buses par rapport à la fiche.',r:'DC04-R02'},
  V:{n:'Conditions de coupe du programme',b:'Programme et réglages',p:null,ind:{quand:['regl']},ctl:'Comparer vitesse et avance du programme actif à la version validée ; aucune modification sans accord des méthodes.',r:'DC04-R02',adj:true},
  F:{n:'Charge broche ou effort de coupe',b:'Mesure',p:'ch',ind:{terme:['moyen']},ctl:'Comparer la charge broche de l’opération à sa référence, en vérifiant la phase de programme associée.',r:'DC04-R04'},
  G:{n:'Référence, nuance et brise-copeaux de la plaquette',b:'Outil',p:null,ind:{quand:['outil'],terme:['court']},ctl:'Vérifier que la plaquette montée correspond à la fiche outil : référence, nuance, rayon, brise-copeaux.',r:'DC04-R01'},
  A:{n:'Montage et porte-à-faux de l’outil',b:'Outil',p:null,ind:{quand:['outil','regl']},ctl:'Contrôler le serrage du porte-outil, le porte-à-faux et la hauteur de pointe.',r:'DC04-R01'},
  E:{n:'Évacuation des copeaux',b:'Machine et thermique',p:null,ind:{freq:['alea']},ctl:'Observer les copeaux : fragmentation, enroulement autour de l’outil ou de la pièce (famille DC-06, hors démonstrateur).',r:'DC04-R02'},
  I:{n:'Inspection de l’arête et compteur de pièces',b:'Outil',p:null,ind:{terme:['moyen','court']},ctl:'Observer l’arête (loupe, photo si possible) : usure progressive, ébréchure ou matière collée ; noter le compteur et le motif du dernier remplacement.',r:'DC04-R03'},
  S:{n:'Siège et serrage de la plaquette',b:'Outil',p:null,ind:{quand:['outil'],terme:['court']},ctl:'Nettoyer le siège, contrôler son état et resserrer la vis au couple de la notice outil avant toute correction.',r:'DC04-R05'},
  K:{n:'Reprise en contre-broche : pince et alignement',b:'Machine et thermique',p:null,ind:{ou:['od','id'],quand:['regl','serie']},ctl:'Contrôler l’état et le serrage de la pince de contre-broche, puis l’alignement selon la notice constructeur ; comparer avant et après reprise.',r:'DC01-R04'},
  R:{n:'Rugosité théorique et rugosité mesurée',b:'Mesure',p:'ra',ind:{terme:['moyen','court']},ctl:'Calculer f² / (32 rε) avec l’avance et le rayon de la fiche ; une Ra mesurée nettement au-dessus oriente vers usure, arête rapportée ou vibrations.',r:'DC04-R01'}}
};
