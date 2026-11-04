window.VP.audit = [
 ['scope','Cadrage et échantillonnage','Ateliers, presses, moules, références, équipes, volumes et exclusions sont-ils identifiés ? L’échantillon couvre-t-il les situations critiques et les différents modes de collecte ?'],
 ['safety','Conditions de visite et sécurité','Accueil sécurité, accompagnement, équipements et autorisations d’observation sont-ils confirmés ? Aucun réglage ni accès machine sans autorisation du site. Une situation dangereuse est escaladée au responsable du site.'],
 ['quality','Exigences client et qualité','Critères pièce, contrôles, métrologie, étalonnages, traçabilité des lots et gestion des non-conformités sont-ils documentés ? Un audit réglementaire spécialisé reste hors du périmètre VP Scan.'],
 ['context','Contexte de fabrication','Peut-on relier un constat à une presse, un moule, une référence, un lot matière, un OF et une équipe ? Les changements matière/outillage et les redémarrages sont-ils identifiables ?'],
 ['data','Fiabilité des enregistrements','Vérifier un échantillon : complétude, unités, horodatage, doublons, valeurs aberrantes, codification des causes et rapprochement avec les relevés terrain. Cela vaut aussi pour le papier et Excel.'],
 ['it','Accès, droits et confidentialité','Propriétaire des données, autorisation d’export, hébergement, accès en lecture seule, confidentialité et durée de conservation sont-ils convenus avec le client ? Ne pas demander de mot de passe dans cet outil.'],
 ['tech','Faisabilité de collecte','Pour chaque presse : mode réel, protocole, variables disponibles, fréquence, historique, export testé et restrictions. Pour une presse non connectée : relevé intégré ou secours papier et responsable désigné.'],
 ['process','Process, outillage et utilités','Observer les conditions réelles, les références de réglage, les fenêtres process, l’entretien moule/presse, la thermique et les utilités. Relever les écarts sans modifier les consignes.'],
 ['people','Compétences et organisation','Référent, régleurs de plusieurs équipes, habilitations, passations, disponibilité et responsables des actions sont-ils identifiés ?'],
 ['economics','Périmètre économique','Coûts validés, périodes comparables, couverture des pertes et exclusions explicites ? Reprises, réclamations, énergie, temps de cycle : chiffrer séparément seulement si non déjà inclus.'],
 ['baseline','État initial et mesure future','Indicateurs, période de référence, production/mix, objectif et méthode de comparaison sont-ils définis ? Une projection n’est pas un gain réalisé.'],
 ['review','Restitution contradictoire','Les faits, réserves, priorités, responsables, échéances et prochaines étapes ont-ils été revus avec le sponsor et l’expert métier ? AMDEC approfondie : à convenir séparément.']
];
window.VP.rubber = [
 ['Mélange et lots','Certificat mélange, durée et conditions de stockage, péremption et traçabilité ?'],
 ['Préparation et alimentation','Préformes, masse, température, propreté et conditions de préparation maîtrisées ?'],
 ['Dosage et préparation matière','Régularité du dosage, contrôles adaptés au mélange et absence de contamination ?'],
 ['Plastification et injection','Temps de séjour, échauffement, stabilité du dosage et état des organes vérifiés ?'],
 ['Transfert et alimentation du moule','Écoulement, canaux, buse et risques de prévulcanisation examinés ?'],
 ['Moule et démoulage','Évents, empreintes, plan de joint, démoulage et maintenance documentés ?'],
 ['Cycle de vulcanisation','Temps, température, pression et validation du cycle documentés ?'],
 ['Homogénéité thermique','Mesure, régulation et homogénéité thermique moule/plateaux vérifiées ?'],
 ['Déchets et tri','Déchets crus et vulcanisés distingués, filières documentées ?'],
 ['Réemploi éventuel','Uniquement si autorisé et validé pour la matière et la pièce ; sinon non applicable.'],
 ['Air comprimé','Pression, qualité, disponibilité et surveillance adaptées ?'],
 ['Utilités spécifiques','Vide, vapeur, fluide thermique ou autre utilité : conditions suivies ?'],
 ['Refroidissement','Débits, températures, entretien et surveillance documentés ?']
];
window.VP.connectionModes = ['À vérifier','Connectée : données accessibles','Connectée : accès indisponible','Connectable : non raccordée','Non connectée'];
window.VP.losses = [
 ['rebutes','Pièces rebutées','pièces','Hors pièces de démarrage comptées séparément.'],
 ['coutPiece','Coût unitaire','€/pièce','Coût de revient pertinent, pas le prix de vente. Documenter la pondération des références selon le mix.'],
 ['recup','Valeur matière récupérée','€','Valeur récupérée sur la période ; zéro uniquement si vérifié.'],
 ['hArret','Arrêts non planifiés','h','Exclure les heures déjà comptées dans les réglages.'],
 ['coutH','Coût horaire presse','€/h','Valider avec le contrôle de gestion les charges incluses. Ce n’est pas un gain de trésorerie garanti.'],
 ['hReglage','Réglage au-delà du standard','h','Uniquement le dépassement du standard validé.'],
 ['demarrage','Pièces perdues au démarrage','pièces','Exclure ces pièces des rebuts saisis plus haut.']
];
