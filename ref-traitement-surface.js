/* Référentiel candidat traitement de surface · 24 défauts, 4 familles, 4 types de ligne.
   Ordre de contrôle : proposé par Vella Partners à partir de la recherche documentaire mondiale
   du 30–31 octobre 2026 (sources TS-S01 à TS-S68, voir sources-traitement-surface.html).
   Statut : RECHERCHE_DOCUMENTAIRE_NON_VALIDEE. À relire par un expert traitement de surface avant tout usage atelier.
   lines = types de ligne concernés (tonneau, attache, anod, chim) ; mes = défaut mesuré (épaisseur, composition) :
   contre-mesure avant toute correction de bain (TS01-R01). */
(function(){
const EL=['tonneau','attache'],ALL=['tonneau','attache','anod','chim'],ST=['tonneau','attache','chim'];
window.VELLA_REF_TS={
 defects:[
  {tab:'E01',fam:'dep',mes:true,lines:EL,defect:'Épaisseur trop faible',hint:'zinc, zinc-nickel, nickel',levers:['M','X','R','D','B','G','Z','K','A','T','N']},
  {tab:'E02',fam:'dep',mes:true,lines:EL,defect:'Épaisseur trop forte ou irrégulière',hint:'surépaisseur, cotes, distribution',levers:['M','X','D','G','B','R']},
  {tab:'E03',fam:'dep',mes:true,lines:EL,defect:'Taux de nickel du ZnNi hors plage',hint:'alliage hors 12–16 %',levers:['M','N','D','Z','T','K','H','B']},
  {tab:'E04',fam:'dep',lines:EL,defect:'Brûlure sur arêtes et pointes',hint:'zones de forte densité de courant',levers:['D','G','T','A','Z','H','R']},
  {tab:'E05',fam:'dep',lines:EL,defect:'Mauvaise couverture des creux',hint:'zones de faible densité, alésages',levers:['H','K','A','D','Z','G','B','C']},
  {tab:'E06',fam:'dep',lines:EL,defect:'Piqûres',hint:'pitting, petits cratères',levers:['C','P','W','A','G','H']},
  {tab:'E07',fam:'dep',lines:EL,defect:'Rugosité, nodules, aspérités',hint:'dépôt rugueux au toucher',levers:['C','W','P','S','G','H']},
  {tab:'E08',fam:'dep',lines:EL,defect:'Taches, voile ou aspect terne',hint:'aspect non uniforme',levers:['A','C','H','T','W','V']},
  {tab:'E09',fam:'dep',lines:EL,defect:'Rendement qui chute, temps de dépôt allongé',hint:'il faut plus d’Ah pour la même épaisseur',levers:['K','A','Z','R','T','C','H']},
  {tab:'A01',fam:'anod',mes:true,lines:['anod'],defect:'Épaisseur anodique trop faible',hint:'classe AA non atteinte',levers:['M','X','J','Q','U','R','G']},
  {tab:'A02',fam:'anod',lines:['anod'],defect:'Brûlure en anodisation',hint:'zones noires, piqûres, dure ou sulfurique',levers:['Y','J','U','Q','G']},
  {tab:'A03',fam:'anod',lines:['anod'],defect:'Colmatage insuffisant',hint:'admittance ou perte de masse hors limite',levers:['L','O2','W','Q','X']},
  {tab:'A04',fam:'anod',lines:['anod'],defect:'Teinte non uniforme ou variable',hint:'d’un lot ou d’une barre à l’autre',levers:['U','Q','J','W','L','G']},
  {tab:'A05',fam:'anod',lines:['anod'],defect:'Farinage ou couche poudreuse',hint:'couche tendre, qui marque',levers:['Q','J','L','Y']},
  {tab:'N01',fam:'chim',lines:['chim'],defect:'Vitesse de nickel chimique trop lente',hint:'épaisseur longue à obtenir',levers:['F','C','W','P']},
  {tab:'N02',fam:'chim',lines:['chim'],defect:'Décomposition du bain ou dépôt sur cuve',hint:'bain qui « part », plate-out',levers:['F','C','W']},
  {tab:'N03',fam:'chim',mes:true,lines:['chim'],defect:'Taux de phosphore hors spécification',hint:'bas, moyen ou haut phosphore',levers:['M','F','C']},
  {tab:'N04',fam:'chim',lines:['chim'],defect:'Cloquage du nickel chimique',hint:'adhérence sur acier ou aluminium',levers:['P','W','C','F','S']},
  {tab:'F01',fam:'perf',lines:ST,defect:'Cloquage ou écaillage du dépôt',hint:'adhérence, souvent après étuvage',levers:['P','W','S','A','C','E']},
  {tab:'F02',fam:'perf',lines:EL,defect:'Rouille blanche prématurée',hint:'brouillard salin ou stockage',levers:['V','I','O','M','X','N']},
  {tab:'F03',fam:'perf',mes:true,lines:EL,defect:'Rouille rouge prématurée',hint:'tenue NSS insuffisante',levers:['M','X','N','V','O','S']},
  {tab:'F04',fam:'perf',lines:ST,defect:'Rupture différée',hint:'fragilisation par l’hydrogène soupçonnée',levers:['E','P','S','D','A']},
  {tab:'F05',fam:'perf',lines:ALL,defect:'Cratères ou cloques sur cataphorèse',hint:'peinture électrophorétique après traitement',levers:['W','P','C','G']},
  {tab:'F06',fam:'perf',lines:ALL,defect:'Phosphatation poudreuse ou incomplète',hint:'avant peinture ou cataphorèse',levers:['P','W','C','I']}],
 /* Leviers : famille Ishikawa, mesure de ligne éventuelle (p), indices QQOQC, contrôle, règle candidate.
    gate = contre-mesure ; adj = correction de bain ou de courant, verrouillée tant que la contre-mesure n'est pas faite. */
 levers:{
  M:{n:'Moyen de mesure et contre-mesure',b:'Mesure',p:null,gate:true,ind:{freq:['alea'],quand:['entretien']},ctl:'Vérifier le XRF (ou l’appareil à courants de Foucault) sur un étalon certifié de même nature, remesurer 3 pièces en zone significative, loin des contacts ; coupe micrographique en arbitrage.',r:'TS01-R01'},
  X:{n:'Surface significative, minimum local et plan de mesure',b:'Mesure',p:null,ind:{ou:['lcd','contact']},ctl:'Relire la désignation (ex. Fe/ZnNi8, AA15), la surface significative du plan et les points de mesure ; relever le minimum local, pas seulement la moyenne.',r:'TS01-R02'},
  O2:{n:'Méthode de contrôle du colmatage',b:'Mesure',p:'adm',ind:{freq:['alea']},ctl:'Admittance corrigée de l’épaisseur, dans le délai du référentiel ; perte de masse en arbitrage.',r:'TS01-R03'},
  O:{n:'Essai de corrosion : enceinte, préparation, lecture',b:'Mesure',p:null,ind:{freq:['alea'],terme:['court']},ctl:'Contrôler NaCl, pH, collecte et température de l’enceinte, délai entre passivation et essai, manipulation, critère de lecture ; comparer à un lot témoin.',r:'TS06-R03'},
  N:{n:'Nickel du bain et réapprovisionnement',b:'Bain et chimie',p:'nib',adj:true,lines:['tonneau','attache'],ind:{terme:['moyen'],quand:['serie','ajout']},ctl:'Analyser le nickel du bain, relire le réapprovisionnement aux Ah et le dernier ajout ; comparer à la table alliage / densité du fournisseur.',r:'TS02-R01'},
  Z:{n:'Zinc métal, soude et dissolution',b:'Bain et chimie',p:'zn',adj:true,lines:['tonneau','attache'],ind:{terme:['moyen'],quand:['serie']},ctl:'Analyser zinc et soude, contrôler le module de dissolution ou les anodes de zinc et leur journal.',r:'TS02-R02'},
  K:{n:'Carbonates et produits de dégradation',b:'Bain et chimie',p:null,lines:['tonneau','attache'],ind:{terme:['long'],quand:['serie']},ctl:'Analyse des carbonates, rendement calculé sur les Ah, anodes à membrane ou non, date du dernier traitement.',r:'TS02-R03'},
  A:{n:'Additifs et brillanteurs, dosage aux Ah',b:'Bain et chimie',p:null,adj:true,ind:{quand:['ajout'],terme:['court']},ctl:'Vérifier compteur Ah, pompe doseuse et consommation théorique ; plaque de Hull comparée à la référence.',r:'TS02-R04'},
  C:{n:'Contaminations métalliques ou organiques',b:'Bain et chimie',p:null,ind:{terme:['moyen','long'],ou:['lcd']},ctl:'Analyser les impuretés, examiner filtration et charbon, rechercher pièces tombées et entraînements ; électrolyse sélective si le fournisseur la prévoit.',r:'TS02-R05'},
  H:{n:'Cellule de Hull : plage de densité de courant',b:'Bain et chimie',p:null,ind:{ou:['hcd','lcd']},ctl:'Plaque de Hull dans les conditions du fournisseur (ex. 267 mL, 2 A, 10 min), comparée à une plaque de référence, avant tout ajout en cuve.',r:'TS02-R06'},
  T:{n:'Température du bain',b:'Bain et chimie',p:'t',ind:{quand:['demar']},ctl:'Comparer la sonde de régulation à un thermomètre de référence et relire l’historique de température.',r:'TS02-R08'},
  F:{n:'Nickel chimique : température, pH, charge, âge du bain',b:'Bain et chimie',p:null,lines:['chim'],ind:{quand:['ajout','demar'],terme:['moyen']},ctl:'Relever température, pH, nickel et réducteur, surface chargée et MTO ; examiner le dépôt sur cuve et la filtration.',r:'TS02-R07'},
  Q:{n:'Bain d’anodisation : acide libre et aluminium dissous',b:'Bain et chimie',p:'al',lines:['anod'],ind:{terme:['moyen'],quand:['serie']},ctl:'Titrer acide libre et aluminium dissous, comparer au domaine du référentiel (ex. Qualanod : H2SO4 ≤200 g/L ±10, Al ≤20 g/L).',r:'TS06-R02'},
  R:{n:'Redresseur, ampèremètre et compteur Ah',b:'Courant et montage',p:null,ind:{quand:['entretien'],ou:['tout']},ctl:'Mesurer le courant à la pince de référence, comparer à l’affichage, contrôler l’ondulation et la date d’étalonnage.',r:'TS03-R01'},
  D:{n:'Densité de courant réelle et surface de charge',b:'Courant et montage',p:null,adj:true,ind:{ou:['hcd','lcd'],quand:['lot']},ctl:'Recalculer la surface réelle de la charge (pièces × surface unitaire), comparer courant et densité à la gamme.',r:'TS03-R02'},
  J:{n:'Densité de courant et temps (règle des 720)',b:'Courant et montage',p:'cd',adj:true,lines:['anod'],ind:{ou:['tout']},ctl:'Recalculer la densité réelle et le temps théorique ≈ 3,12 × µm / (A/dm²) ; vérifier la rampe et la tension en fin de cycle.',r:'TS06-R02'},
  G:{n:'Montage, contacts, anodes et écrans',b:'Courant et montage',p:null,ind:{ou:['contact','hcd'],freq:['charge']},ctl:'Inspecter contacts, crochets et danglers, état et position des anodes, écrans ; mesurer la chute de tension aux contacts.',r:'TS03-R03'},
  B:{n:'Tonneau : charge, rotation, perforations',b:'Courant et montage',p:null,lines:['tonneau'],ind:{freq:['charge'],ou:['lcd']},ctl:'Contrôler le poids de charge, la vitesse de rotation, l’état des perforations et des contacts du tonneau signalé.',r:'TS03-R03'},
  Y:{n:'Agitation et évacuation de la chaleur',b:'Courant et montage',p:'ta',lines:['anod'],ind:{ou:['local','hcd']},ctl:'Contrôler soufflage d’air, circulation et refroidissement près des pièces ; rampe de démarrage du courant.',r:'TS03-R04'},
  P:{n:'Dégraissage, décapage et activation',b:'Préparation et substrat',p:null,ind:{quand:['lot'],ou:['tout']},ctl:'Test de rupture du film d’eau, concentrations, températures et temps de préparation, temps de transfert entre cuves.',r:'TS04-R01'},
  W:{n:'Rinçages, eau et entraînements',b:'Préparation et substrat',p:null,ind:{freq:['alea'],ou:['local']},ctl:'Conductivité et débit des rinçages, cascade, égouttage, qualité de l’eau du dernier rinçage.',r:'TS04-R03'},
  S:{n:'Acier ou état de surface difficile',b:'Préparation et substrat',p:null,ind:{quand:['lot'],terme:['court']},ctl:'Identifier nuance, dureté, lot et état d’usinage ; comparer au lot précédent ; vérifier si la gamme prévoit une préparation spécifique.',r:'TS04-R02'},
  U:{n:'Alliage d’aluminium et lot matière',b:'Préparation et substrat',p:null,lines:['anod'],ind:{quand:['lot'],terme:['court']},ctl:'Comparer certificat matière, alliage et état au lot précédent ; alliages riches en cuivre plus sensibles.',r:'TS06-R01'},
  V:{n:'Passivation Cr(III) : pH, température, temps',b:'Post-traitement',p:null,lines:['tonneau','attache'],ind:{quand:['ajout','serie']},ctl:'Mesurer pH, température, temps et concentration de la passivation, contaminations fer et zinc ; vérifier le séchage.',r:'TS05-R01'},
  E:{n:'Dégazage : dureté, durée, délai, ordre',b:'Post-traitement',p:null,ind:{quand:['lot']},ctl:'Relever dureté réelle, classe de dégazage exigée, enregistrement du four, délai entre dépôt et four, ordre dégazage / passivation.',r:'TS05-R02'},
  L:{n:'Colmatage : température, pH, temps, eau',b:'Post-traitement',p:'adm',lines:['anod'],ind:{quand:['serie']},ctl:'Contrôler température (≥96 °C en colmatage à chaud), pH, temps (2 min/µm) et qualité de l’eau.',r:'TS05-R03'},
  I:{n:'Stockage, séchage et emballage',b:'Post-traitement',p:null,ind:{terme:['long'],ou:['local']},ctl:'Vérifier séchage, condensation, emballage, durée et conditions de stockage avant expédition ou essai.',r:'TS06-R03'}}
};
})();
