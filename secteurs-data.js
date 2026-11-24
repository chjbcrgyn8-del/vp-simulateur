/* Structure du site par secteur.
   Recentrage du 24 novembre 2026 (version de référence : tag ref-avant-dossier-de-preuve-2026-11-24) :
   - une seule offre, le pilote « dossier de preuve », en trois temps : étape 1 (VP Scan, inclus), VP Expert, le dossier du moule ;
   - caoutchouc en premier, puis injection plastique ; décolletage et traitement de surface sont masqués (masque: true) :
     leurs pages restent dans le dépôt et s'ouvrent par leur adresse, mais aucun menu n'y renvoie plus ;
   - la clé « predict » ne décrit plus une offre : c'est la démonstration technique de surveillance d'une dérive,
     accessible depuis « Dossier & sources », hors premier rendez-vous.
   Statuts : ok = démonstrateur en ligne ; cand = en ligne, référentiel candidat à valider par un expert. */
window.VP_SECTEURS = {
  caoutchouc: {
    nom: 'Caoutchouc', court: 'Caoutchouc', num: '01',
    machines: 'presses', machine: 'presse',
    accroche: 'Vulcanisation, matières qui varient d’un lot à l’autre, savoir concentré sur quelques régleurs.',
    exemple: 'Manques de matière, bulles, sous-vulcanisation.',
    chiffre: '16', chiffreL: 'défauts documentés',
    scan: {
      statut: 'ok', statutL: 'Inclus dans le pilote',
      question: 'Où vos presses perdent-elles de l’argent, et par quel moule commencer ?',
      fait: ['Rebuts, ébavurage et arrêts chiffrés en euros', 'Le moule et les défauts du pilote choisis sur ces chiffres', 'Si vous vous arrêtez là, seule cette étape est due'],
      base: 'Grille terrain à adapter au moulage caoutchouc avec notre expert',
      demo: 'caoutchouc.html', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'ok', statutL: 'Référentiel expert',
      question: 'Que contrôler face à ce défaut, dans quel ordre, et qu’en reste-t-il ensuite ?',
      fait: ['16 défauts, leviers classés dans l’ordre de contrôle de notre expert caoutchouc', 'Chaque essai tracé : ce qui a été constaté, essayé, obtenu', 'Cas clos par le régleur, validé par les méthodes ou la qualité'],
      base: 'Référentiel construit avec notre expert caoutchouc, non relu par un tiers. La démonstration n’enregistre rien.',
      demo: 'enquete-caoutchouc.html', demoL: 'Diagnostiquer un défaut'
    },
    predict: {
      statut: 'ok', statutL: 'Démonstration technique',
      question: 'Quelle presse commence à dériver, et que faire ?',
      mesures: ['Température des plateaux', 'Temps de vulcanisation', 'Pression d’injection', 'Température du pot'],
      connexion: 'Aucune connexion machine n’est nécessaire pour le pilote',
      base: '13 527 cycles d’une presse caoutchouc rejoués (fichier d’un expert partenaire, hors client), sans dérive ajoutée',
      demo: 'presse-caoutchouc.html', demoL: 'Ouvrir la démonstration technique'
    },
    pilote: {
      statut: 'ok', statutL: 'Pilote · 8 semaines',
      question: 'Que reste-t-il quand le moule change de presse, qu’un client réclame ou qu’un régleur s’en va ?',
      fait: ['Un moule, un ou deux défauts, une à trois presses', 'Cas validés, fiche de transfert, pré-rapport de réclamation (pré-8D)', 'Des livrables garantis ; aucun gain garanti'],
      base: 'Livrables du pilote, établis avec vos équipes. À prouver dans votre atelier.',
      demo: 'pilote.html?secteur=caoutchouc', demoL: 'Voir le pilote'
    },
    ressources: [['Mesures d’une presse caoutchouc', 'st-mesures-caoutchouc.html'], ['Repères techniques', 'st-reperes-caoutchouc.html'], ['Registre des sources mondiales', 'st-sources-mondiales.html']]
  },
  plastique: {
    nom: 'Injection plastique', court: 'Plastique', num: '02',
    machines: 'presses', machine: 'presse',
    accroche: 'Pièces techniques : aéronautique, médical, connectique. Rebuts, réglages qui varient d’un régleur à l’autre.',
    exemple: 'Retassures, bavures, pièces incomplètes, brûlures.',
    chiffre: '24', chiffreL: 'défauts documentés',
    scan: {
      statut: 'ok', statutL: 'Inclus dans le pilote',
      question: 'Où vos presses perdent-elles de l’argent, et par quel moule commencer ?',
      fait: ['Rebuts et arrêts chiffrés en euros, presse par presse', 'Le moule et les défauts du pilote choisis sur ces chiffres', 'Si vous vous arrêtez là, seule cette étape est due'],
      base: 'Grille d’audit terrain de 32 points, issue de la méthode de notre expert injection',
      demo: 'gains.html', demoL: 'Chiffrer mes pertes · 3 min'
    },
    expert: {
      statut: 'ok', statutL: 'Référentiel expert',
      question: 'Que contrôler face à ce défaut, dans quel ordre, et qu’en reste-t-il ensuite ?',
      fait: ['24 défauts, causes classées, contrôles dans l’ordre', 'Chaque essai tracé, retour au réglage d’origine si l’action échoue', 'Cas clos par le régleur, validé par les méthodes ou la qualité'],
      base: 'Référentiel construit avec notre expert injection, sources publiées, non relu par un tiers. La démonstration n’enregistre rien.',
      demo: 'enquete.html', demoL: 'Diagnostiquer un défaut'
    },
    predict: {
      statut: 'ok', statutL: 'Démonstration technique',
      question: 'Quelle presse commence à dériver, et que faire ?',
      mesures: ['Température matière', 'Pression de commutation', 'Matelas', 'Temps de dosage'],
      connexion: 'Aucune connexion machine n’est nécessaire pour le pilote',
      base: '2 479 cycles d’essais universitaires publics rejoués (université de Kassel), sans dérive ajoutée ; dérive simulée au choix. Ni cycles de production, ni données de client.',
      demo: 'presse.html', demoL: 'Ouvrir la démonstration technique'
    },
    pilote: {
      statut: 'ok', statutL: 'Pilote · 8 semaines',
      question: 'Que reste-t-il quand le moule change de presse, qu’un client réclame ou qu’un régleur s’en va ?',
      fait: ['Un moule, un ou deux défauts, une à trois presses', 'Cas validés, fiche de transfert, pré-rapport de réclamation (pré-8D)', 'Des livrables garantis ; aucun gain garanti'],
      base: 'Livrables du pilote, établis avec vos équipes. À prouver dans votre atelier.',
      demo: 'pilote.html', demoL: 'Voir le pilote'
    },
    ressources: [['Mesures d’une presse', 'st-mesures-plastique.html'], ['Audit AMDEC', 'st-amdec.html'], ['Sources et niveaux de preuve', 'st-sources.html']]
  },
  decolletage: {
    nom: 'Décolletage', court: 'Décolletage', num: '03', masque: true,
    machines: 'tours et décolleteuses', machine: 'machine',
    accroche: 'Cotes qui dérivent avec l’usure d’outil, contrôles tardifs, séries perdues.',
    exemple: 'Diamètre hors tolérance, rugosité qui se dégrade, bavures, longueur qui varie.',
    chiffre: '607', chiffreL: 'pièces réelles rejouées',
    scan: {
      statut: 'cand', statutL: 'Calculateur · valeurs d’exemple',
      question: 'Où vos machines perdent-elles de l’argent ?',
      fait: ['Six postes chiffrés en euros : arrêts, réglages, rebuts, lots bloqués, tri, outils', 'Données existantes et machines connectables', 'Trois priorités, chacune reliée à VP Expert'],
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
      statut: 'cand', statutL: 'Rejeu de pièces réelles',
      question: 'Quelle machine commence à dériver, et que faire ?',
      mesures: ['Diamètre extérieur', 'Longueur totale', 'Rugosité Ra', 'Charge broche', 'Température huile'],
      connexion: 'Commande numérique et moyens de mesure, selon l’équipement',
      base: '607 pièces réelles rejouées (TU Darmstadt), sans dérive ajoutée ; dérive simulée au choix ; jeux de tournage Vicomtech et CiP-DMD au banc d’essai',
      demo: 'machine-decolletage.html', demoL: 'Voir une dérive détectée'
    },
    ressources: [['Mesures d’un tour', 'st-mesures-decolletage.html'], ['Repères techniques', 'st-reperes-decolletage.html'], ['Règles candidates et sources', 'sources-decolletage.html']]
  },
  'traitement-surface': {
    nom: 'Traitement de surface', court: 'Traitement de surface', num: '04', masque: true,
    machines: 'lignes et bains', machine: 'ligne',
    accroche: 'Bains qui dérivent entre deux analyses, épaisseurs hors spécification, retouches et décapages.',
    exemple: 'Épaisseur de zinc-nickel trop faible, colmatage insuffisant, piqûres de chromage, manques de galvanisation, peau d’orange en peinture poudre.',
    chiffre: '41', chiffreL: 'défauts documentés',
    scan: {
      statut: 'cand', statutL: 'Calculateur · valeurs d’exemple',
      question: 'Où vos lignes perdent-elles de l’argent ?',
      fait: ['Six postes chiffrés en euros : retouches, arrêts, réclamations, vidanges, corrections de bain, chimie', 'Analyses de bain, épaisseurs et lignes connectables', 'Trois priorités, chacune reliée à VP Expert'],
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

/* Secteurs affichés dans les menus et sur la page de garde (les secteurs masqués gardent leurs pages). */
window.VP_SECTEURS_VISIBLES = Object.keys(window.VP_SECTEURS).filter(function (k) { return !window.VP_SECTEURS[k].masque; });

/* Les trois temps du pilote « dossier de preuve ». VP Scan n'est plus vendu à part : c'est l'étape 1 du pilote. */
window.VP_OFFRES = [
  { k: 'scan', nom: 'VP Scan', etape: 'Étape 1 du pilote', verbe: 'Chiffrer et choisir', q: 'Où perdons-nous de l’argent, et par quel moule commencer ?', d: 'Les pertes chiffrées, le moule et les défauts du pilote choisis sur des chiffres. Inclus dans le pilote.' },
  { k: 'expert', nom: 'VP Expert', etape: 'Cœur du pilote', verbe: 'Résoudre et prouver', q: 'Que faire face à ce défaut, et qu’en reste-t-il ensuite ?', d: 'Les contrôles dans l’ordre, chaque essai tracé, le cas clos par le régleur puis validé par les méthodes ou la qualité. Sans connexion machine.' },
  { k: 'pilote', nom: 'Le dossier du moule', etape: 'Livrables du pilote', verbe: 'Garder et transmettre', q: 'Que reste-t-il après le défaut ?', d: 'Les cas validés, la fiche de transfert du moule et le pré-rapport de réclamation (pré-8D), établis avec vos équipes.' }
];

/* Trois situations qui ont une date : ce sont elles qui déclenchent un pilote. */
window.VP_SITUATIONS = [
  { t: 'Un moule change de presse ou de site', d: 'Transfert, démarrage ou retour de maintenance : les réglages qui fonctionnaient ne se retrouvent pas et la mise au point recommence. Le dossier du moule part avec lui.' },
  { t: 'Une réclamation client est ouverte', d: 'Il faut répondre vite et montrer ce qui a été fait. Constats, essais et validations sont déjà rangés, prêts à alimenter votre rapport 8D.' },
  { t: 'Un régleur expérimenté s’en va', d: 'Départ en retraite, mutation, nuit sans lui : ce qu’il sait de chaque moule n’est écrit nulle part. Le pilote le recueille cas par cas, avant la date.' }
];
