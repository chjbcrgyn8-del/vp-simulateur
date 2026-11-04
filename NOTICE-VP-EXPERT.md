# VP Expert — livraison des quatre parcours optimisés

**Version du 4 novembre 2026.** Les quatre enquêtes ont été améliorées dans le projet HTML/CSS/JavaScript existant. Aucune publication, aucun push GitHub : le site public n’a pas été modifié par cette intervention.

## Ce qui change

- **Quatre étapes communes** : défaut → contexte → contrôles → essai & synthèse. Navigation directe, boutons précédent/suivant, dossier latéral sur ordinateur et disposition en une colonne sur mobile.
- **Formulaires clairs sur fond sombre**, titres blancs, accent violet, états d’avertissement explicites. Inspiration visuelle fournie, sans reprise du contenu NFT.
- **Réponses initiales vierges** : une information inconnue n’est plus une observation présélectionnée. Focus conservé après un choix de contexte ; champs décimaux adaptés à la saisie française.
- **Mesures plus robustes** : vide ≠ zéro ; virgule acceptée ; `Infinity`, `NaN`, hexadécimal et notation scientifique refusés ; traitement cohérent des limites et des directions opposées.
- **Reprise JSON renforcée** : secteur, paramètres, identifiants, journal, cohérence des contrôles et clés dangereuses vérifiés. Les causes atelier accompagnent le dossier exporté et sont restaurées dans un navigateur vierge, sans doublons lors d’une deuxième reprise.
- **Garde-fous décolletage et traitement de surface maintenus et renforcés** : contre-mesure fiable avant les leviers correctifs verrouillés. Corriger la saisie de cette contre-mesure annule aussi les contrôles correctifs qui en dépendaient. Les imports incohérents avec ce verrou sont refusés.
- **Niveaux de preuve clarifiés** : disparition déclarée du défaut ≠ cause certifiée. Le REX local ne bonifie plus le classement ; les sources et les références métier restent présentes.
- **Chargement allégé** : suppression, sur ces quatre entrées uniquement, des styles et scripts décoratifs devenus inutiles et des polices externes. Ces fichiers restent disponibles pour les autres pages du site.

Les référentiels techniques et leurs pondérations de base n’ont pas été réécrits. Le retrait du bonus issu du REX déclaratif est volontaire. Les consignes et tolérances restent des exemples, pas des recommandations machine.

## Vérifications effectuées

Tests automatisés avec Playwright et Chrome Linux sur serveur HTTP local. Scripts et résultats bruts inclus dans `tests/`.

| Vérification | Résultat |
|---|---|
| 4 parcours × 3 largeurs : 1 440, 768, 390 px | 12 vues validées, navigation des 4 étapes, sans débordement horizontal du document ni erreur JavaScript |
| Balayage des défauts/configurations/modes disponibles | 937 combinaisons de rendu, sans erreur JavaScript |
| Dérive plastique | 8 mesures : rendu et aller-retour JSON validés |
| Recherche, choix de contexte, mesures, enregistrement/correction | Validés sur les 4 parcours |
| Export JSON et reprise dans un contexte navigateur vierge | Contrôles et causes atelier conservés ; deuxième reprise sans doublon |
| Imports invalides | 34 refus vérifiés : mauvais secteur, clés interdites, paramètres inconnus, journal incohérent, doublons, périmètre falsifié et contournement du verrou |
| Contre-mesure | Verrou initial, moyen douteux, déverrouillage et annulation des contrôles dépendants vérifiés en DC et TS |
| Synthèse et REX | Téléchargement Markdown, formulation prudente et absence de reclassement après mémorisation vérifiés |
| Stockage local indisponible | Avertissement explicite, aucune fausse confirmation d’ajout |
| Impression | Les 4 étapes deviennent visibles dans les styles d’impression |
| Syntaxe | `node --check` sur les 7 fichiers JavaScript concernés ; `git diff --check` sans erreur |

Les 937 combinaisons sont un balayage du **rendu**, pas 937 diagnostics industriels validés. Les tests fonctionnels suivent des cas représentatifs. Les captures montrent des données de test, pas un dossier client réel.

### Poids des ressources chargées

Mesure locale sans compression : somme des `transferSize` des ressources du navigateur, hors document HTML principal, avec le même protocole avant/après. Les chiffres ne représentent pas une mesure de temps de chargement en production.

| Parcours | Avant | Après | Réduction |
|---|---:|---:|---:|
| Injection plastique | 396 583 octets | 349 094 octets | 12,0 % |
| Caoutchouc | 375 514 octets | 328 032 octets | 12,6 % |
| Décolletage | 357 648 octets | 318 083 octets | 11,1 % |
| Traitement de surface | 416 857 octets | 377 432 octets | 9,5 % |

## Contenu livré

1. **`vp-expert-optimise-20261104.zip`** : projet complet, sans `.git`, avec les autres pages et actifs conservés ; notice, tests et captures inclus.
2. **`vp-expert-20261104.patch`** : modifications des quatre entrées HTML, quatre moteurs, couche de consolidation ; nouveaux fichiers communs, documentation et scripts de test.
3. Cette notice et deux captures de lecture rapide. Les 32 captures complètes ordinateur/mobile des quatre étapes et quatre métiers sont dans `tests/results/` de l’archive.

Base du patch : dépôt `chjbcrgyn8-del/vp-simulateur`, branche `main`, commit **`f6786a6e6295974fe6779e8a604497aeccbaf322`**. Le patch doit être vérifié avant application sur une version plus récente.

## Tester sans publier

Décompresser l’archive, ouvrir un terminal dans son dossier racine :

```bash
python -m http.server 8080
```

Ouvrir `http://localhost:8080/enquete.html`, puis les trois liens métier. Pour reproduire les tests :

```bash
pip install playwright
python tests/regression.py
python tests/responsive.py
```

Les scripts utilisent Chrome à `/usr/bin/google-chrome`. Adapter `executable_path` si votre navigateur est installé ailleurs. Pour un autre port serveur, définir `VP_TEST_URL` avec une URL finissant par `/`.

## Intégrer dans votre dépôt GitHub

**Ne pas remplacer tout le dépôt par l’archive si des changements ont été faits depuis le commit de base.** Préférer une branche de travail et le patch :

```bash
git clone https://github.com/chjbcrgyn8-del/vp-simulateur.git
cd vp-simulateur
git switch -c optimisation-vp-expert
git apply --check /chemin/vp-expert-20261104.patch
git apply /chemin/vp-expert-20261104.patch
```

Si `git apply --check` échoue, arrêter et comparer les changements récents ; ne pas forcer le patch. Tester localement les quatre parcours, vérifier `git diff`, puis créer le commit sur cette branche. La fusion vers la branche publiée et le push sont **à votre décision** : aucune de ces opérations n’a été exécutée ici. Conserver la configuration GitHub Pages actuelle ; les noms des pages et leurs liens sont inchangés.

Avant la mise en ligne, exporter les dossiers de test utiles. Après la mise en ligne, vérifier les quatre pages avec un rechargement complet pour éliminer un ancien cache.

## Limites et points de vigilance

- Pas de test sur appareil physique ni Safari/iOS ; pas d’audit complet d’accessibilité WCAG ou de cybersécurité. Les largeurs mobile/tablette sont simulées dans Chrome.
- L’impression a été vérifiée par émulation CSS ; pas de vérification sur imprimante ou de pagination PDF exhaustive.
- Pas de serveur, d’authentification ou de connexion machine ajoutés. Les observations sont déclaratives. Le REX et les causes atelier utilisent le stockage de ce navigateur ; le dossier actif doit être exporté avant de quitter.
- Un JSON ne peut pas authentifier un contrôle ou une autorisation. Les contrôles de structure limitent les dossiers incohérents, pas la falsification volontaire d’une déclaration.
- Les imports consolidés acceptent le format/version documentaire compatible. Les anciennes variantes d’export non consolidées ne sont pas converties automatiquement.
- Export limité au cas sélectionné ; les autres brouillons en mémoire doivent être exportés séparément. La reprise des causes atelier exige un stockage local disponible.
- Les autres simulateurs VP Scan/VP Predict et les référentiels documentaires n’ont pas été refondus. Les liens vers eux sont conservés.
- Validation industrielle finale à réaliser avec vos experts et votre qualité : aucun test logiciel ne valide une correction machine, un bain, un outillage ou une cause industrielle.

**État de livraison : code testé localement, prêt à examiner et intégrer ; site public inchangé par cette intervention.**
## Intégration dans le dépôt (4 novembre 2026)

Les fichiers de cette livraison ont été appliqués tels quels sur `main` (commit de base `f6786a6`), à deux exceptions près :

- **Ajout de `vp-expert-a11y.css`**, chargée après `vp-expert-ui.css` dans les quatre pages d'enquête. Elle ne modifie aucune règle de la livraison. Elle corrige : les pastilles « VP Expert » / « VP Predict » (violet sur violet, 1,2:1 ; gris-lilas sur orange, 1,3:1), les textes de 8 à 11,5 px (relevés à 12 px, aucune taille réduite) et quelques gris sous 4,5:1. Sur écran étroit : résumés dépliables et liens à 44 px.
- **Captures d'écran non versionnées** : `tests/results/*.png` (18 Mo) ne sont pas dans le dépôt ; les scripts et fichiers JSON de `tests/` y sont.

Contrôles refaits après intégration : `tests/regression.py` (937 combinaisons rendues, 34 imports invalides refusés, 4 parcours PASS) et `tests/responsive.py` (12 vues, sans erreur ni débordement) ; contraste, textes sous 12 px et débordements mesurés sur les 4 étapes de chaque parcours, en 1 440 et 390 px.

La mention « aucune publication » ci-dessus décrit l'état de la livraison, avant cette intégration.

## Identité Vella (5 novembre 2026)

Les 4 enquêtes chargent désormais `vp-expert-vella.css` : la structure de `vp-expert-ui.css` avec l'identité Vella Partners (crème, graphite, cuivre, Instrument Serif), comme l'accueil et les secteurs. `vp-expert-ui.css` (violet) reste dans le dépôt comme référence mais n'est plus chargée. Les polices (IBM Plex Mono, Instrument Serif, Switzer) sont les mêmes que sur l'accueil et viennent de Google Fonts et Fontshare.

## Export PDF (4 novembre 2026)

Les synthèses et dossiers se téléchargent aussi en PDF, en plus du `.md` et du JSON : « Synthèse (PDF) » et « Dossier complet (PDF) » dans la section Synthèse, « Dossier complet (PDF) » dans la barre « Dossier VP Expert ». Le contenu est celui du téléchargement `.md` ; le PDF est généré dans le navigateur par `vp-expert-pdf.js`, sans bibliothèque ni service externe (A4, polices standard, adresses des sources cliquables, en-tête et pagination). Aucune donnée ne quitte la page.

## Contrôle « non vérifié » (5 novembre 2026)

Chaque contrôle peut maintenant être marqué « Non vérifié » (contrôle impossible, non réalisé ou non concluant), en plus de « Conforme » et « Non conforme ». Ce troisième état ne change ni le classement, ni les causes retenues ; il apparaît dans le journal, la synthèse (« Reprendre le contrôle non vérifié ») et l'export JSON (champ `native.unverified`, facultatif : les anciens exports restent lisibles). « Corriger la saisie » l'annule. Pour le contrôle de moyen de mesure (décolletage, traitement de surface), « non vérifié » laisse les corrections verrouillées.

## Démonstration guidée de 90 secondes (5 novembre 2026)

Le bouton « Démonstration guidée · 90 s » (sous les étapes de chaque enquête, ou lien `?demo=1` depuis les pages secteur) rejoue, sur un cas fictif et avec les vrais boutons, le parcours complet : défaut, contexte, contrôles (conforme, non conforme, non vérifié), essai et résultat, mémoire d'atelier, synthèse. Avance automatique (environ 80 secondes), pause, étape suivante, Échap pour quitter ; sans animation pour les personnes qui demandent moins de mouvement. Rien n'est enregistré dans la mémoire d'atelier. Script : `vp-expert-demo.js` ; aucun moteur modifié.

Retours d'Henry (introduction trop lourde) : le bandeau d'introduction est compact à l'étape 1 et réduit au titre (lisible par les lecteurs d'écran) aux étapes 2 à 4 ; la note « Démonstration : consignes et tolérances d'exemple » passe en pied d'étape.

## Schémas illustratifs des défauts (5 novembre 2026)

En attendant des photos réelles validées par les experts, 16 schémas dessinés (`vp-expert-schemas.js`) illustrent les principales familles de défauts : bavure, incomplet, retassure, ligne de soudure, brûlure, givrage, déformation, points noirs, bulles (plastique et caoutchouc) ; cote hors tolérance, arête de coupe (décolletage) ; épaisseur trop faible ou trop forte, piqûres, cloquage, brûlure du dépôt (traitement de surface). Ils apparaissent sur les cartes de l'étape 1 et dans le dossier en cours, toujours légendés « Schéma illustratif, pas une photo ». 50 défauts sur 100 en ont un ; les autres n'en ont pas, plutôt qu'un dessin approximatif. Les photos remplaceront les schémas quand elles seront disponibles ; les schémas sont à valider par un expert de chaque métier.

## Mode Focus refondu et aperçu téléphone (5 novembre 2026)

Le mode Focus (vue du régleur au poste) reprend la charte Vella : défaut, carte sombre du contrôle prioritaire avec sa progression (« Contrôle 2 sur 5 »), trois réponses (Conforme, Non conforme, Non vérifié) avec icône, puis l'action suivante. Sur téléphone étroit, il masque la barre d'étapes pour que le contrôle et les premiers boutons tiennent dans le premier écran. Un bouton « Aperçu téléphone » (écrans larges) l'affiche dans un cadre de téléphone. La démonstration guidée passe maintenant par ce mode, dans un téléphone, à l'étape 5 sur 10 (environ 95 secondes). Aucun moteur modifié ; fichiers : `vp-focus.js`, `vp-focus.css`, `vp-expert-demo.js`.
