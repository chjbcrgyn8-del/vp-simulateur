# Lot « lanceur et navigation » · 24 novembre 2026

Recentrage sur le pilote « dossier de preuve ». Aucun fichier supprimé ; les pages et films retirés des menus restent en ligne à leur adresse.

## Lanceur (index.html, garde.js, garde.css, secteurs-data.js)
- Deux secteurs proposés, caoutchouc (01) puis injection plastique (02). Décolletage et traitement de surface portent `masque: true` dans `secteurs-data.js` : ils ne sont plus listés.
- Écran d'accueil : la promesse (« Pour chaque moule, ce qui a été constaté, essayé et validé ») et les trois situations datées (moule qui change de presse ou de site, réclamation client ouverte, régleur expérimenté qui s'en va).
- Un pilote en trois temps : étape 1 VP Scan (inclus dans le pilote), VP Expert, le dossier du moule (fiche de transfert, pré-rapport de réclamation). La carte VP Predict est remplacée par la carte du pilote ; la touche P ouvre le pilote.
- VP Predict n'est plus proposé. Une ligne indique qu'un diagnostic de stabilité ponctuel peut être proposé sur exports, après un premier dossier résolu, sur devis.
- Aucun prix sur le lanceur.
- Films : le film général (« VP Scan, VP Expert, VP Predict ») et les films VP Predict ne sont plus proposés. Les deux films VP Expert sont servis en version `-v2`, identique à l'original moins la diapositive « Sans connexion aujourd'hui, connectée demain » (environ 11 s, annonce de VP Predict). Originaux conservés dans `video/`.
- « Cycles réels » n'est plus employé : les 2 479 cycles d'injection sont des essais universitaires publics, les 13 527 cycles caoutchouc viennent d'une presse, fichier d'un expert partenaire, hors client.
- `index.html?changer=1#secteurs` efface le secteur mémorisé ; l'ancre `#secteurs` existe de nouveau.

## Navigation commune (secteurs.js, secteur-choix.js, anim.js)
- Pages secteur : trois colonnes (1 VP Scan, 2 VP Expert, 3 Le dossier du moule), encadré « Le dossier de preuve », plus de colonne VP Predict.
- Barre de parcours des démonstrateurs : secteur › 1 VP Scan › 2 VP Expert › 3 Le pilote. Sur les simulateurs de dérive : « Démonstration technique · surveillance d'une dérive · hors pilote ».
- Masquage des secteurs par adresse du lien (et plus par rang dans le menu) : les liens vers le décolletage et le traitement de surface sont toujours retirés des menus ; une fois un secteur choisi, l'autre est retiré. Ouvrir une page de secteur non proposé ne change plus le secteur mémorisé.
- Pied de page : caoutchouc et injection plastique, plus de lien vers les simulateurs de dérive, « Le pilote » renvoie à `presentation.html#offres`.

## Pages (secteur-caoutchouc.html, secteur-plastique.html, 404.html, sitemap.xml)
- Titres et descriptions sans VP Predict ni « quatre métiers » ; onglets de secteur réduits à deux.
- 404 : accès rapides vers VP Expert, le chiffrage et le pilote (8 semaines) ; plus de lien « Mes presses dérivent ».
- Plan du site : 14 adresses décolletage et traitement de surface retirées (fichiers conservés).

## Correction d'un défaut existant (vp-premium.css)
- Les règles `.stp` visaient des boutons mais s'appliquaient aussi au `<body class="stp">` de 14 pages de savoir technique. Elles sont limitées à `button.stp`.

## Non fait
- Aucun film réenregistré. Le film VP Scan est conservé tel quel (il présente déjà VP Scan comme une étape courte sur site).
- `secteur-decolletage.html` et `secteur-traitement-surface.html` restent consultables par adresse directe, avec la mention « Secteur non proposé aujourd'hui ».
