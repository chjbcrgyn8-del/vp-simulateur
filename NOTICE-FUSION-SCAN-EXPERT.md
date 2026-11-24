# Fusion de VP Scan dans VP Expert · 24 novembre 2026

Demande : « Fusionne VP Scan dans VP Expert : deux offres seulement, organisation du site conservée ».

- Branche : `fusion/scan-dans-expert`
- Version de référence avant modification : tag `ref-avant-fusion-scan-expert-2026-11-24`
- Retour arrière : republier le tag de référence, ou `git revert` du commit de fusion (pas de réécriture d'historique).

## Principe

Le démonstrateur présente deux offres : **VP Expert** et **VP Predict**. Le chiffrage des pertes (ancien VP Scan) devient la première étape de VP Expert : étape 1 « Chiffrer », étape 2 « Résoudre ». Aucun fichier supprimé, aucune adresse modifiée, aucun prix ni chiffre changé. L'ordre des rubriques, des secteurs et des menus est inchangé.

## Ce qui change

| Endroit | Avant | Après |
|---|---|---|
| Lanceur (`index.html`, `garde.js`, `garde.css`) | Trois cartes : VP Scan, VP Expert, VP Predict | Deux cartes : VP Expert (étapes 1 Chiffrer et 2 Résoudre, chacune avec son film et son bouton), VP Predict. Raccourcis S, E, P conservés (S ouvre le chiffrage). Sous 1 180 px, VP Predict passe sous VP Expert. |
| Pages secteur (`secteurs.js`, `secteurs.css`, `secteur-*.html`) | Trois colonnes | Deux blocs : « 1 · VP Expert » (étapes 1 et 2) et « 2 · VP Predict ». Titre d'onglet et paragraphe « La boucle » réécrits. |
| Barre de parcours des démonstrateurs | 1 VP Scan · 2 VP Expert · 3 VP Predict | Groupe « VP Expert » (1 Chiffrer, 2 Résoudre), puis VP Predict |
| Présentation, « Nos offres » | Trois cartes | Deux cartes ; le chiffrage, le lien « Chiffrer mes pertes · 3 min » et l'outil de diagnostic terrain sont dans la carte VP Expert |
| Présentation, « Comment démarrer » | Fourche « Entrée directe » / « VP Scan d'abord » | Une étape « Pertes chiffrées » avant le pilote |
| Présentation, rôles et questions fréquentes | Mentions de VP Scan | « Diagnostic de départ inclus dans le pilote VP Expert » |
| Menus (présentation, coulisses) | Groupe « VP Scan · Chiffrer » | Groupe « VP Expert · Chiffrer », mêmes liens, même place |
| Coulisses, tableau comparatif | Trois colonnes | Deux colonnes : les lignes de chiffrage sont cochées pour VP Expert |
| Pilote et simulateur (`pilote.html`, `app.js`) | « VP Scan est inclus » | « Le diagnostic de départ est inclus » |
| Calculateurs décolletage et traitement de surface (`scan-*.html`, `scan-secteur.js`) | « VP Scan · secteur », « Préparer un VP Scan » | « VP Expert · Chiffrer · secteur », « Préparer un diagnostic » |
| Banc d'essai (`banc-essai.js`) | « livrable VP Scan » | « livrable du diagnostic de départ de VP Expert » |
| Outil de diagnostic terrain (`vp-scan/`) | Marque « VP Scan », « Rapport VP Scan » | « Diagnostic », « Rapport de diagnostic VP Expert » |

## Ce qui ne change pas, et pourquoi

- **Les films** (`video/*.mp4` et leurs vignettes) nomment encore « VP Scan » et « trois outils » : ils ne peuvent être corrigés qu'en les réenregistrant. Une mention l'indique sous le film d'accueil et dans le lecteur.
- **Les adresses** : le dossier `vp-scan/`, les pages `scan-decolletage.html` et `scan-traitement-surface.html`, la clé interne `scan` des données et les noms des fichiers téléchargés (`VP-Scan-mission-…`) sont conservés pour ne casser aucun lien ni aucun fichier de mission déjà exporté.
- **Code inactif** : les branches `r.scan` / `P.scan` de `app.js`, `calc.js` et `pilote.html` (ancien forfait séparé, déjà désactivé) sont laissées en l'état ; elles n'affichent rien.
- Les prix, durées, chiffres de cycles, référentiels, secteurs et tous les autres contenus.

## Technique

- Versions de cache relevées : `secteurs-data.js?v=6`, `secteurs.js?v=6`, `garde.js?v=5`, `garde.css?v=4`, `secteurs.css?v=4`, `home-v3.css?v=5`, `scan-secteur.js`, `banc-essai.js`, `vp-scan/app.js`.
- Packs CSS régénérés avec `python3 tools/css-packs.py build` (mêmes noms de fichiers, contenu et numéro de version mis à jour).
- Tests du dépôt : `tests/regression.py`, `tests/responsive.py`, `tests/capitaliser.py`.
