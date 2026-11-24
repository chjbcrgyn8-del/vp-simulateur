# Journal des changements · lot « offre et chiffrage » (branche dp/offre)

Référence : offre_v2/BRIEF.md. Une ligne par changement, « avant → après ».

## presentation.html
- Titre et description : offre VP Expert / VP Predict → « Le dossier de preuve de l’atelier, pour chaque moule » et description du pilote dossier de preuve.
- Menu Secteurs : injection, caoutchouc, décolletage, traitement de surface → caoutchouc puis injection plastique.
- Menu Démonstrateurs : groupes dont « VP Predict · Voir une dérive » → trois groupes « Étape 1 du pilote · Chiffrer », « VP Expert · Résoudre un défaut », « Pilote dossier de preuve ».
- Lien « Banc d’essai, données réelles » → « Banc d’essai, données publiques ».
- Lien de menu « Nos offres » → « Le pilote » (presentation.html#offres, ancre conservée).
- Hero : ancien titre → promesse du brief « Pour chaque moule, la preuve de ce qui a été constaté, essayé et validé. », texte du brief, surtitre « Constater · Résoudre · Prouver ».
- Sélecteur de métier (.pick-g) : quatre secteurs → 01 Caoutchouc, 02 Injection plastique.
- Section #offres : trois offres (VP Scan 4 900 €, VP Expert, VP Predict) → une seule offre, le Pilote dossier de preuve en trois temps (VP Scan inclus ; VP Expert, cœur ; le dossier du moule avec fiche de transfert et pré-8D).
- Carte VP Predict → mention du diagnostic de stabilité (texte du brief, sur devis).
- « Comment démarrer » → s’ouvre sur « trois situations qui ont une date » (textes du brief), parcours en huit semaines, validation à deux.
- Engagement « Déjà établi / À prouver » : « cycles réels » → « cycles d’essais publics (université de Kassel) » et « cycles d’une presse caoutchouc (fichier d’un expert partenaire, hors client) » ; ajout « Nous garantissons des livrables, pas un gain. » ; mémoire partagée « pas encore testée en production ».
- FAQ : réponses vendant la connexion machine et VP Predict → « Aucune connexion machine » + diagnostic de stabilité sur devis ; ajout « Que garantissez-vous ? » ; durée → huit semaines ; coût → 8 900 € HT, 3 115 € HT si arrêt après qualification, abonnement 300 à 800 € HT par mois, indicatif, à confirmer par devis.
- Appel final → « Commençons par une situation qui a une date. »

## coulisses.html
- Menus : mêmes changements que presentation.html (secteurs, démonstrateurs, banc d’essai « données publiques »).
- Boutons d’en-tête #demo → presentation.html#demo.
- Compteurs : 32 674 « cycles réels » → « cycles rejoués au banc d’essai : jeux d’essais publics et cycles d’une presse caoutchouc (fichier d’un expert partenaire, hors client) » ; caoutchouc avant injection.
- Liens sources : décolletage et traitement de surface retirés → banc d’essai, données publiques.
- État des référentiels : réécrit selon l’état réel du brief (relus par aucun tiers, aucun résultat client).
- Comparatif des offres (VP Scan / VP Expert / VP Predict) → « Les trois temps du pilote, point par point » ; titre « Le pilote et les autres solutions ».
- Section technologie VP Predict (schéma SVG et figure vidéo) → « Démonstration technique : la stabilité d’une presse » (texte du diagnostic de stabilité, liens presse-caoutchouc.html et presse.html). La vidéo n’est pas supprimée du dépôt, seulement plus intégrée dans la page.
- Contenu : lien unique « Démonstration technique, caoutchouc · injection plastique » → paragraphe « Surveillance d’une dérive · démonstration technique » vers presse-caoutchouc.html, presse.html, banc-essai.html.
- Section finale : texte et boutons alignés (« chiffrage de l’étape 1 du pilote »).

## pilote.html
- Titre et descriptions : « Préparer mon pilote VP Predict », « pilote de 3 mois sur 2 à 3 presses critiques » → « Pilote dossier de preuve », un moule, un ou deux défauts, une à trois presses, huit semaines.
- Sélecteur de secteur : injection puis caoutchouc → caoutchouc puis injection plastique.
- Deux cartes « VP Expert / VP Predict » → une seule offre « Pilote dossier de preuve » (8 900 € HT indicatif, à confirmer par devis ; 3 115 € HT si arrêt après qualification) et « Abonnement par site » (300 à 800 € HT par mois, sans reconduction tacite la 1re année, export complet).
- Proposition chiffrée : périmètre « presses connectables », prix 15 000 €, 150 €/presse/mois, 890 €, extrapolation → périmètre du brief, prix du brief, situation de départ (presses du pilote), critères de réussite écrits au devis, poursuivre / ajuster / arrêter.
- Encadré KPI « objectifs prudents » de gains → critères de réussite (temps constat → retour au conforme, réglages tentés, cas réutilisés par une autre équipe) ; le gain du simulateur reste affiché comme estimation, avec « ne garantit ni un taux de rebut, ni un gain, ni un retour sur investissement ».
- Cartes « Ce que le pilote connecté teste » et déroulé VP Predict → livrables garantis, ce qui n’est pas garanti, critères, ce que le pilote ne fait pas, diagnostic de stabilité, trois situations.
- Déroulé : « pilote VP Expert seul, 6 à 8 semaines » → huit semaines du brief (questionnaire 20 min, S1–2 qualification VP Scan, S3–6 enquête guidée, S7–8 validation et dossier du moule).
- Données à préparer : mesures cycle à cycle pour VP Predict → fiches du moule, rebuts, réclamations, exports si disponibles.
- Liste avant lancement : éléments Predict / adaptateurs 890 € → moule et défauts, deux validateurs, questionnaire, historique, informatique, éligibilité aide.
- Formulaire : champs « Pilote souhaité » (Predict) et « Presses connectables » retirés → « Votre situation » (trois situations datées, défaut récurrent, autre) et « Secteur » ; récapitulatif SMS aligné.
- Aides : « Peut financer le pilote » → « Peut financer une partie du pilote si le dossier est accepté » ; note « jamais acquises d’avance et jamais déduites des prix affichés ».
- Ancres #poc, #rdv, #qf conservées.

## app.js (simulateur)
- Moteur : C = VellaCalc → enveloppe qui force connMode = 'none' à chaque calcul (calc.js inchangé côté calcul).
- Étape « Connexion des presses / Vos presses peuvent-elles transmettre leurs mesures ? » → « Données des presses / Vos presses exportent-elles leurs mesures ? », pour le diagnostic de données seulement.
- Champs c77/c63/c0 : « Prêtes à connecter · 0 € de matériel », « avec un adaptateur · 890 € », « mise à niveau 3 000 à 6 000 € » → « Export moderne (OPC UA) », « Export de fichiers », « Sans sortie de données : vos relevés suffisent ».
- Choix A–D VP Predict, tarif VP Predict, champ « Presses sous VP Predict », case aide « du pilote VP Predict » → retirés ; note « Ce simulateur est l’étape 1 du pilote dossier de preuve ».
- Lien vers le pilote : forçait le scénario 'critical' (VP Predict) → chiffre sans connexion, identique au chiffre affiché.
- Bouton « Préparer mon pilote VP Predict » → « Préparer mon pilote dossier de preuve ».
- Hypothèses / détail : « Pilote VP Expert (mise en place) 6 à 8 semaines » → « Pilote dossier de preuve : huit semaines, VP Scan inclus, 3 115 € HT si arrêt après qualification » ; « Abonnement VP Expert » → « Abonnement par site, au prix écrit dans le devis ».
- Carte « Avec VP Predict · Non simulée… 15 000 € / 150 € » → carte diagnostic de stabilité (texte du brief, nombre de presses avec export déclaré).

## pdf.js
- En-tête « Synthèse d’estimation · VP Expert (+ VP Predict) » → « Synthèse d’estimation · Étape 1 du pilote dossier de preuve ».
- « Puis un pilote de 3 mois mesure le reste. » → « Puis le pilote, en huit semaines, vérifie le reste. »

## calc.js
- Commentaire d’en-tête : grille VP Expert / VP Predict → grille du pilote dossier de preuve ; mention que les constantes de connexion sont conservées mais non proposées.

## gains.html, caoutchouc.html
- Titre : « Estimer vos gains » → « Étape 1 du pilote · Estimer vos gains ».
- Sélecteur de secteur : injection, caoutchouc, décolletage, traitement de surface → caoutchouc puis injection plastique.
- Versions de scripts : calc.js, app.js, pdf.js → nouvelles valeurs ?v= pour forcer le rechargement.

## vp-scan/
- app.js : conseil « VP Expert, puis étude VP Predict » → « VP Expert sans connexion ; diagnostic de stabilité sur ces exports possible après un premier dossier résolu, sur devis ».
- index.html : app.js?v=henry-1 → henry-2.

## style.css
- Fin de fichier : aucune règle → `body .syn` en minmax(0,1fr) et `.cash3` resserré sous 480 px (débordement de 21 px du résultat caoutchouc à 375 px, préexistant). Packs CSS non reconstruits (propriété du chef d’équipe).

## Recette (25/11/2026)
- pdf.js, page 2 : notes des lignes tarifaires non imprimées → imprimées sous « Abonnement par site » et « Pilote dossier de preuve » (3 115 € HT si arrêt après qualification, grille 300 à 800 € HT par mois, indicatif, à confirmer par devis).
- app.js / pdf.js : « Abonnement par site · 13 à 25 presses… après le pilote, au prix écrit dans le devis » → « Palier correspondant aux N presses de l’estimation (…) · grille de 300 à 800 € HT par mois · indicatif, à confirmer par devis ».
- app.js : ligne « Presses » marquée « Vous · Répartition saisie » par défaut (S.profile vaut 'custom' dès l’ouverture, préexistant depuis 8a4e352) → « Vous » seulement si le nombre de presses a été saisi ou un profil choisi, sinon « Valeur type · Répartition type, à remplacer ».
- app.js / pdf.js : « 0 valeur sur 10 vient de vous » → « 0 valeur clé sur 10 vient de vous », complété par « · nombre de presses saisi » si le parc a été saisi (le nombre de presses ne fait pas partie des 10 valeurs clés).
- app.js / pdf.js : « Seuil d’engagement 2 × », badges « Objectif atteint / Seuil d’engagement / Sous le seuil » → « Repère : gain brut estimé ÷ abonnement », « Repère interne indicatif : 2 × », badges « Au-dessus du repère / Au niveau du repère / Sous le repère ».
- calc.js (texte d’avertissement seul) : « Vella Partners ne propose l’abonnement que si le gain mesuré atteint au moins 2 fois son prix annuel. » → « Repère interne indicatif : 2 fois au moins, à vérifier au pilote ; ce n’est pas un engagement de résultat. »
- gains.html, caoutchouc.html : calc.js?v=20261125-repere, app.js?v=20261125-repere2, pdf.js?v=7.
