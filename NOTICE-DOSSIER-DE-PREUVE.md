# Démonstrateur Vella Partners : passage à l'offre « dossier de preuve »

Date : 24 novembre 2026. Branche d'intégration : `integration/dossier-de-preuve`, fusionnée dans `main`.
Version de référence avant modification : étiquette `ref-avant-dossier-de-preuve-2026-11-24` (commit `8a4e352`).

## Ce qui change

1. VP Expert est présenté comme un dossier de preuve : constaté, essayé, validé par deux personnes, pièces à l'appui.
2. Trois situations datées ouvrent le discours : un moule qui change de presse ou de site, une réclamation client ouverte, un régleur qui part.
3. VP Scan devient l'étape 1 du pilote de huit semaines.
4. VP Predict n'est plus une offre. La surveillance d'une dérive reste visible comme démonstration technique ; un diagnostic de stabilité ponctuel sur exports est proposé sur devis, après un premier dossier résolu.
5. Deux livrables nommés : fiche de transfert de moule, pré-rapport de réclamation.
6. Le caoutchouc passe en premier ; l'injection plastique vise l'aéronautique, le médical et la connectique.
7. Décolletage et traitement de surface ne figurent plus dans la navigation. Les essais publics ne sont plus appelés « cycles réels ». Une seule grille tarifaire, absente du lanceur.

## Journaux détaillés

- `CHANGEMENTS-lanceur.md` : lanceur, navigation, pages secteur, films, page 404, plan du site.
- `CHANGEMENTS-offre.md` : présentation, pilote, simulateurs de pertes, synthèse PDF, coulisses.
- `CHANGEMENTS-donnees.md` : VP Expert, banc d'essai, presses, savoir technique, sources.

## Corrections issues de la recette indépendante

- Page 404 illisible (texte clair sur fond clair) et icône manquante : corrigé. Défaut antérieur à ce chantier.
- Pilote et savoir technique : le secteur de l'adresse fait foi, sinon le secteur mémorisé.
- Menus : entrée « Banc d'essai » retirée ; bibliothèque documentaire limitée au caoutchouc et au thermoplastique (catalogue inchangé).
- Coulisses : les 32 674 cycles du banc sont détaillés par origine. Aucun ne vient d'un client de Vella Partners.
- Synthèse PDF : 3 115 € HT dus si arrêt après la qualification, palier d'abonnement et grille de 300 à 800 € HT par mois, à confirmer par devis.
- Compteur des valeurs saisies cohérent entre l'écran, le détail et le PDF. Défaut antérieur à ce chantier.
- Le « seuil d'engagement 2 × » devient un repère interne indicatif, pas un engagement de résultat.

## Rien n'est supprimé

Aucun fichier n'a été supprimé. Les pages VP Predict, décolletage et traitement de surface, les films d'origine et le film général restent dans le dépôt, sans lien depuis la navigation.

## Vérifications

- Trois suites automatiques du dépôt (`tests/capitaliser.py`, `tests/regression.py`, `tests/responsive.py`) : réussies sur la branche d'intégration.
- Recette indépendante au navigateur : 23 pages à 1280 et 375 px, parcours de chiffrage, 12 synthèses PDF relues, films ouverts, formulaires sans envoi. Aucun défaut bloquant ni important restant.
- Non vérifié : chaque branche de chaque défaut de VP Expert, l'audio complet des films, l'import manuel d'un fichier au banc.

## Revenir à la version précédente

```
git checkout main
git revert -m 1 6924dd1     # annule la fusion sans réécrire l'historique
git push origin main
```

La version de référence reste consultable : `git checkout ref-avant-dossier-de-preuve-2026-11-24`.

## Points à valider par Vella Partners

- Jeu de données Foxconn (16 600 cycles) : le droit de redistribution n'est pas attesté ; la mention de licence a été retirée.
- Film VP Predict retiré de Coulisses ; les deux films VP Expert sont raccourcis d'environ 11 secondes, originaux conservés.
- Barre de parcours à 375 px sur VP Expert : le lien du secteur est masqué (comportement antérieur).
