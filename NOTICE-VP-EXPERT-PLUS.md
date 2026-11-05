# VP Expert · module « réflexes de l’expert » (5 novembre 2026)

Fichiers : `vp-expert-plus.js`, `vp-expert-plus.css`, et une ligne ajoutée avant `</body>` dans
`enquete.html`, `enquete-caoutchouc.html`, `enquete-decolletage.html`, `enquete-traitement-surface.html`.
Aucun moteur existant modifié. Testé dans Chromium sur les 4 pages : aucune erreur de script.

Ajouts, par étape :
1. Jumeaux à écarter (plastique 24 défauts, caoutchouc 16) : défauts proches et critère qui les sépare ; un clic bascule l’enquête.
2. Est / N’est pas + dernière bonne série + répétabilité : 7 questions, règles affichées, orientation par famille 5M ;
   case « appliquer l’orientation » qui réordonne les causes (numéro d’origine conservé en infobulle).
3. « Test qui tranche » et résultat attendu sous chaque cause (règles par mot-clé, premier jet Vella).
   Bouton « Puis-je conclure avec ce que j’ai ? » : données insuffisantes → liste des manques, avis expert.
4. Protocole d’essai (variable unique, origine, essai, cycles d’attente, pièces, critère écrit avant, effet secondaire)
   qui rédige les champs « Préparer l’essai pour revue » du dossier.
5. Causes écartées (contrôles conformes) et niveau de preuve, écrits dans « Conclusion déclarée ».
6. Coût du défaut par jour dans la synthèse (rebuts × prix + heures × coût horaire), hypothèses de l’utilisateur.

Tout reste dans le navigateur. Contenus métier (jumeaux, tests) à faire relire par les experts partenaires ;
mention « premier jet Vella, à valider » affichée. Reste à faire (priorité 1) : localisation sur croquis.
