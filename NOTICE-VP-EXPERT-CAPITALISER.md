# VP Expert · scène « Capitaliser » (19 novembre 2026)

Statut : proposition sur la branche `vp-expert-scene-capitaliser`, non fusionnée dans `main`, donc absente du site publié.
À valider par Vella Partners avant toute publication.

## Ce que la scène montre

Le quatrième temps de la méthode (Constater, Comprendre, Résoudre, Capitaliser), que le simulateur ne montrait pas :
ce qui se passe une fois le défaut disparu. Trois moments, trois rôles :

1. Clôturer (régleur, J). La fiche est lue dans le dossier affiché : défaut, cause retenue, contrôle qui a tranché,
   action, résultat, causes écartées. Rien n'est ressaisi. Seul l'outillage est demandé, parce que c'est par lui que le
   cas sera retrouvé. Statut : « Cas résolu · non validé ».
2. Valider (méthodes ou qualité, J + 2). La revue voit ce qui étaye le cas et ce qui manque : écart constaté ou non sur
   la cause, causes écartées, contrôles non vérifiés, niveau de preuve déclaré, domaine de validité. Trois décisions :
   valider par les méthodes, valider par la qualité, renvoyer pour complément. Une validation malgré des manques écrit
   les réserves sur la fiche.
3. Réutiliser (régleur de nuit, J + 21). Le même défaut revient sur le même outillage : la fiche propose d'abord le
   contrôle qui a tranché, puis la cause et l'action, et rappelle ce qui a déjà été écarté. Deux questions de condition
   (machine, matière et lot), sans réponse présélectionnée : une condition différente, inconnue ou sans réponse renvoie
   au contrôle avant l'action. Puis « Ça a marché ? » : la reprise est comptée, sans taux en dessous de cinq reprises.
   Une reprise sans effet signale la méthode « à revoir ».

À droite, la fiche de mémoire par outillage suit le statut et tient le journal (J, J + 2, J + 21).

## Fichiers

- `vp-capitaliser.js`, `vp-capitaliser.css` : la scène.
- `tests/capitaliser.py` : test navigateur, n'écrit aucun fichier.
- Deux lignes ajoutées avant `</body>` dans `enquete.html`, `enquete-caoutchouc.html`, `enquete-decolletage.html`,
  `enquete-traitement-surface.html`.

Aucun moteur existant modifié, aucun fichier existant retouché en dehors de ces deux lignes par page.

## Entrées

- Bouton « Scène Capitaliser » sous les étapes, à côté de « Mode Focus ».
- Carte « Et ensuite : capitaliser. » à l'étape 04, visible seulement quand une cause est retenue et que le résultat
  est « Défaut disparu ».
- Lien direct : ajouter `?capitaliser=1` à l'adresse d'une page d'enquête.

Sur un dossier incomplet, la scène propose de jouer un cas d'exemple : elle clique les vrais boutons de la page, comme
la démonstration guidée, et ne remplit que ce qui manque. Les références d'exemple portent la mention « exemple fictif ».

## Ce que la scène écrit, et n'écrit pas

- Rien n'est enregistré : ni serveur, ni stockage du navigateur. Fermer la scène efface la clôture, la validation et la
  reprise. Le retour d'expérience existant (« Mémoriser ce retour d'expérience ») n'est ni lu ni modifié.
- Une seule écriture dans la page : l'outillage ou la machine saisis dans la scène sont recopiés dans les références
  du dossier si elles étaient vides, pour éviter une seconde saisie. Les références fictives ne sont jamais recopiées.
- L'export JSON du dossier n'est pas modifié.

## Limites

- C'est une scène de démonstration : elle montre le périmètre visé pour un pilote, pas une fonction livrée.
- Aucun chiffre de performance, aucun gain : le décompte affiché est celui de la scène (une reprise).
- Les délais (J + 2, J + 21) et le seuil de cinq reprises sont des choix de mise en scène. Le seuil reprend la règle du
  document d'architecture de capitalisation ; la périodicité de revue d'une méthode reste à convenir avec chaque site.
- Les textes sont un premier jet Vella Partners, à faire relire par les experts partenaires, en particulier le
  vocabulaire par métier (moule et presse, outil et tour, montage et ligne).

## Tests

Avec un serveur local à la racine (`python -m http.server 8080`) :

- `python tests/capitaliser.py` : 4 pages × 3 largeurs (1440, 768, 390 px), parcours complet, clavier, stockage,
  requêtes, débordement, cibles de 44 px, texte de 12 px au moins. Résultat du 19 novembre 2026 : 410 contrôles, 0 échec.
- `python tests/regression.py` et `python tests/responsive.py` : scripts inchangés, relancés avant et après l'ajout.
  Résultats identiques : 4 métiers « PASS », mêmes combinaisons affichées (48, 112, 399, 378), aucune erreur, aucun
  débordement à 1440, 768 et 390 px.

Poids ajouté par page : 46 ko (environ 13 ko une fois compressés par le serveur).

## Retirer la scène

Supprimer les deux lignes `vp-capitaliser` dans les quatre pages d'enquête, puis les fichiers `vp-capitaliser.js`,
`vp-capitaliser.css`, `tests/capitaliser.py` et cette notice. Rien d'autre n'en dépend.
