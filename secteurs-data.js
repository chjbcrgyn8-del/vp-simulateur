/* Structure du site par secteur · 4 secteurs × 3 offres (VP Scan, VP Expert, VP Predict).
   Statuts : ok = démonstrateur en ligne ; cand = en ligne, référentiel candidat à valider par un expert ; todo = à construire.
   Les liens ouvrent les démonstrateurs existants du site. Mise en place le 31 octobre 2026 ; version de référence : tag ref-avant-secteurs-2026-10-31. */
window.VP_SECTEURS = {
  plastique: {
    nom: 'Injection plastique', court: 'Plastique', num: '01',
    machines: 'presses', machine: 'presse',
    accroche: 'Rebuts, réglages qui varient d’un régleur à l’autre, dérives repérées trop tard.',
    exemple: 'Retassures, bavures, pièces incomplètes, dérive de la température matière.',
    chiffre: '24', chiffreL: 'défauts documentés',
    scan: {
      statut: 'ok', statutL: 'Calculateur en ligne',
      question: 'Où vos presses perdent-elles de l’argent ?',
      fait: ['Rebuts et arrêts chiffrés en euros, presse par presse', 'Qualité des données et presses connectables', 'Presses critiques et feuille de route'],
      base: 'Grille d’audit terrain de 32 points, issue de la méthode de notre expert injection',
      demo: 'gains.html?express=1', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'ok', statutL: 'Référentiel expert',
      question: 'Que contrôler face à ce défaut, et dans quel ordre ?',
      fait: ['24 défauts, dont 20 reliés à une mesure', 'Causes classées, contrôles dans l’ordre', 'Retour au réglage d’origine si l’action échoue'],
      base: 'Référentiel construit avec notre expert injection, sources publiées',
      demo: 'enquete.html', demoL: 'Diagnostiquer un défaut'
    },
    predict: {
      statut: 'ok', statutL: 'Simulateur · cycles simulés et rejeu réel',
      question: 'Quelle presse commence à dériver, et que faire ?',
      mesures: ['Température matière', 'Pression de commutation', 'Matelas', 'Temps de dosage'],
      connexion: 'Euromap 77 (OPC UA), Euromap 63 avec adaptateur, ou votre MES',
      base: 'Cycles simulés ; mode « cycles réels » : essais Kassel (CC BY 4.0) rejoués dans l’ordre, résolution proposée comparée au journal de l’essai ; 19 147 cycles réels de jeux publics (SKZ LoKI, Kassel, Foxconn) au banc d’essai',
      demo: 'presse.html', demoL: 'Voir une dérive détectée'
    },
    ressources: [['Mesures d’une presse', 'st-mesures-plastique.html'], ['Audit AMDEC', 'st-amdec.html'], ['Sources et niveaux de preuve', 'st-sources.html']]
  },
  caoutchouc: {
    nom: 'Caoutchouc', court: 'Caoutchouc', num: '02',
    machines: 'presses', machine: 'presse',
    accroche: 'Vulcanisation, matières qui varient d’un lot à l’autre, savoir concentré sur quelques régleurs.',
    exemple: 'Manques de matière, bulles, sous-vulcanisation, dérive de la température des plateaux.',
    chiffre: '13 527', chiffreL: 'cycles réels rejoués',
    scan: {
      statut: 'ok', statutL: 'Calculateur en ligne',
      question: 'Où vos presses perdent-elles de l’argent ?',
      fait: ['Rebuts, ébavurage et arrêts chiffrés en euros', 'Qualité des données et presses connectables', 'Presses critiques et feuille de route'],
      base: 'Grille terrain à adapter au moulage caoutchouc avec notre expert',
      demo: 'caoutchouc.html', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'ok', statutL: 'Référentiel expert',
      question: 'Que contrôler face à ce défaut, et dans quel ordre ?',
      fait: ['16 défauts, leviers classés', 'Ordre de contrôle de notre expert caoutchouc', 'Enquête QQOQC et diagramme d’Ishikawa'],
      base: 'Référentiel construit avec notre expert caoutchouc',
      demo: 'enquete-caoutchouc.html', demoL: 'Diagnostiquer un défaut'
    },
    predict: {
      statut: 'ok', statutL: 'Rejeu de cycles réels',
      question: 'Quelle presse commence à dériver, et que faire ?',
      mesures: ['Température des plateaux', 'Temps de vulcanisation', 'Pression d’injection', 'Température du pot'],
      connexion: 'Euromap, supervision du constructeur ou votre MES',
      base: '13 527 cycles réels rejoués, sans dérive ajoutée',
      demo: 'presse-caoutchouc.html', demoL: 'Voir une dérive détectée'
    },
    ressources: [['Mesures d’une presse caoutchouc', 'st-mesures-caoutchouc.html'], ['Repères techniques', 'st-reperes-caoutchouc.html'], ['Registre des sources mondiales', 'st-sources-mondiales.html']]
  },
  decolletage: {
    nom: 'Décolletage', court: 'Décolletage', num: '03',
    machines: 'tours et décolleteuses', machine: 'machine',
    accroche: 'Cotes qui dérivent avec l’usure d’outil, contrôles tardifs, séries perdues.',
    exemple: 'Diamètre hors tolérance, rugosité qui se dégrade, bavures, longueur qui varie.',
    chiffre: '16', chiffreL: 'défauts documentés',
    scan: {
      statut: 'cand', statutL: 'Calculateur · valeurs d’exemple',
      question: 'Où vos machines perdent-elles de l’argent ?',
      fait: ['Six postes chiffrés en euros : arrêts, réglages, rebuts, lots bloqués, tri, outils', 'Données existantes et machines connectables', 'Trois priorités, chacune reliée à VP Expert ou VP Predict'],
      base: 'Valeurs de départ illustratives et objectifs Vella Partners ; grille à valider avec un expert décolletage',
      demo: 'scan-decolletage.html', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'cand', statutL: 'Référentiel candidat',
      question: 'Que contrôler face à cette dérive, et dans quel ordre ?',
      fait: ['16 défauts, contrôles dans l’ordre', 'Cas complet fictif, de la réclamation au dossier', 'Constats distingués des causes démontrées'],
      base: 'Recherche documentaire et sources publiques ; relecture par un expert à venir',
      demo: 'enquete-decolletage.html', demoL: 'Diagnostiquer une dérive'
    },
    predict: {
      statut: 'cand', statutL: 'Simulateur · simulé et pièces réelles',
      question: 'Quelle machine commence à dériver, et que faire ?',
      mesures: ['Diamètre extérieur', 'Longueur totale', 'Rugosité Ra', 'Charge broche', 'Température huile'],
      connexion: 'Commande numérique et moyens de mesure, selon l’équipement',
      base: 'Dérive simulée ; mode « pièces réelles » : 607 pièces TU Darmstadt CiP-DMD rejouées, résolution proposée comparée au journal ; jeux publics de tournage (Vicomtech, CiP-DMD) au banc d’essai',
      demo: 'machine-decolletage.html', demoL: 'Voir une dérive détectée'
    },
    ressources: [['Mesures d’un tour', 'st-mesures-decolletage.html'], ['Repères techniques', 'st-reperes-decolletage.html'], ['Règles candidates et sources', 'sources-decolletage.html']]
  },
  'traitement-surface': {
    nom: 'Traitement de surface', court: 'Traitement de surface', num: '04',
    machines: 'lignes et bains', machine: 'ligne',
    accroche: 'Bains qui dérivent entre deux analyses, épaisseurs hors spécification, retouches et décapages.',
    exemple: 'Épaisseur de zinc-nickel trop faible, colmatage insuffisant, piqûres de chromage, manques de galvanisation, peau d’orange en peinture poudre.',
    chiffre: '41', chiffreL: 'défauts documentés',
    scan: {
      statut: 'cand', statutL: 'Calculateur · valeurs d’exemple',
      question: 'Où vos lignes perdent-elles de l’argent ?',
      fait: ['Six postes chiffrés en euros : retouches, arrêts, réclamations, vidanges, corrections de bain, chimie', 'Analyses de bain, épaisseurs et lignes connectables', 'Trois priorités, chacune reliée à VP Expert ou VP Predict'],
      base: 'Valeurs de départ illustratives et objectifs Vella Partners ; grille à valider avec un expert traitement de surface',
      demo: 'scan-traitement-surface.html', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'cand', statutL: 'Référentiel candidat',
      question: 'Que contrôler face à ce défaut, et dans quel ordre ?',
      fait: ['41 défauts sur 8 procédés : zinc-nickel, anodisation, nickel chimique, chromage dur, phosphatation, électropolissage, galvanisation à chaud, peinture poudre', 'Contre-mesure exigée avant toute correction de bain', 'Cas complet fictif : rouille rouge prématurée sur zinc-nickel'],
      base: '45 règles candidates et 86 sources ; relecture par un expert à venir',
      demo: 'enquete-traitement-surface.html', demoL: 'Diagnostiquer un défaut'
    },
    predict: {
      statut: 'cand', statutL: 'Simulateur · données simulées',
      question: 'Quelle ligne commence à dériver, et que faire ?',
      mesures: ['Épaisseur ZnNi (XRF)', 'Taux de nickel du dépôt', 'Zinc du bain', 'pH et température', 'Densité de courant'],
      connexion: 'Redresseurs, sondes de bain, analyses de laboratoire et mesure d’épaisseur',
      base: 'Trois lignes simulées (zinc-nickel au tonneau, anodisation, nickel chimique) ; pas encore de données réelles de ligne ; les cinq autres procédés ne sont pas simulés',
      demo: 'machine-traitement-surface.html', demoL: 'Voir une dérive détectée'
    },
    ressources: [['Mesures d’une ligne', 'st-mesures-traitement-surface.html'], ['Repères et calculateur de cycle', 'st-reperes-traitement-surface.html'], ['Règles candidates et sources', 'sources-traitement-surface.html']]
  }
};

window.VP_OFFRES = [
  { k: 'scan', nom: 'VP Scan', verbe: 'Chiffrer', q: 'Où perdons-nous de l’argent ?', d: 'Une intervention courte sur site : pertes chiffrées, données évaluées, priorités désignées.' },
  { k: 'expert', nom: 'VP Expert', verbe: 'Résoudre', q: 'Que faire face à ce défaut ?', d: 'Le savoir des meilleurs experts du métier, rangé en contrôles dans l’ordre. Sans connexion machine.' },
  { k: 'predict', nom: 'VP Predict', verbe: 'Anticiper', q: 'Qu’est-ce qui commence à dériver ?', d: 'Les mesures suivies en continu : la dérive est anticipée, identifiée, puis résolue avec les contrôles de VP Expert.' }
];
