# Données exploitables pour un cas traitement de surface

Date : 31 octobre 2026. Objectif : trouver des données de ligne réelles, l'équivalent des cycles de presse rejoués en caoutchouc et en injection.

## Constat

Aucun jeu public de ligne d'électrodéposition ou d'anodisation en production, avec analyses de bain, paramètres de courant et mesures d'épaisseur pièce par pièce, n'a été trouvé en accès libre. Les industriels ne publient pas ces journaux ; l'étude la plus proche (Fraunhofer / TU Braunschweig) indique que ses données ne sont pas partageables.

## Jeux et tableaux repérés

| Source | Procédé | Contenu | Réel ou non | Accès | Usage possible |
|---|---|---|---|---|---|
| [IEEE DataPort · Hot-Dip Galvanizing Line Dataset](https://ieee-dataport.org/documents/hot-dip-galvanizing-line-dataset-zinc-coating-prediction-and-air-knife-control) (DOI 10.21227/4yhs-er78) | Galvanisation à chaud en continu (bobines) | 420 768 enregistrements à 5 min, 2022–2024 : vitesse, largeur, épaisseur, pression et distance des lames d'air, température du bain et du snout, zinc consommé | Réel (niveau 1 de la ligne) ; la masse de revêtement est la consigne client, la jauge XRF était indisponible | Abonnement IEEE DataPort ; licence non indiquée | Le plus proche d'un rejeu réel ; procédé sidérurgique continu, pas un atelier de traitement à façon |
| [Fraunhofer IST / TU Braunschweig, ZnNi au tonneau](https://finishingandcoating.com/index.php/plating/3058-from-lab-to-plant-data-driven-modelling-of-an-electroplating-process) | Zinc-nickel alcalin au tonneau | 151 charges industrielles (43 pièces, cuve 13 000 L, XRF en ligne toutes les 15 min) + 186 essais en cuve de 20 L | Réel | Données non partageables | Fourchettes et structure de journal à reproduire |
| [Química Nova 2025, zinc alcalin et cellule de Hull](https://www.scielo.br/j/qn/a/nPDKTDtRDcpsy8j8fKbKbWq/?format=pdf&lang=en) | Zinc alcalin | Plan d'expériences, épaisseurs XRF ; tableau avec électrolyte industriel | Laboratoire | Tableaux publiés ; données « disponibles sur demande » | Calibrer un modèle épaisseur = f(temps, ZnO, NaOH) |
| [Université de Lettonie · Real-time PAAO](https://research.lu.lv/en/datasets/real-time-paao/) | Anodisation (alumine poreuse) | Courant et épaisseur en fonction du temps, paramètres (tension, température) par essai | Laboratoire | Jeu publié, licence à vérifier | Courbes de croissance pour l'anodisation |
| [Academia · Electroless Nickel, base de données qualité](https://www.academia.edu/171209052/Database_Development_and_Metric_Analysis_for_Quality_Control_in_Electroless_Nickel_Plating) | Nickel chimique | Concentration Ni, pH, MTO, retouches ; défauts en hausse à partir du 3e MTO | Industriel annoncé | Disponibilité des données incertaine | Repère de vieillissement du bain |
| [Kaggle · Corrosion Rate](https://www.kaggle.com/datasets/bobinsajigeorge/corrosion-rate/data) | Cu / Ni / Cr | Vitesses de corrosion de tiges revêtues | Origine à vérifier | Libre | Faible pour la conduite de ligne |
| [Kaggle · Anodic Aluminum Oxide for ML](https://www.kaggle.com/datasets/muhammadwaseemashraf/anodic-aluminum-oxide-for-ml) | Anodisation | 500 lignes | Généré par formules, non mesuré | Libre | À exclure : ce sont des données synthétiques |

## Recommandation

1. Ne pas présenter de « cycles réels » en traitement de surface tant qu'aucun jeu réel n'est rejoué.
2. Option rapide : un cas reconstruit à partir des fourchettes publiées (Fraunhofer : Zn 6,5–8,5 g/L, Ni 0,9–1,2 g/L, 8–12 µm, Ni 12–16 % ; rapport Elsyca : 100–300 A/m² à l'attache, 10–150 A/m² au tonneau), présenté explicitement comme « reconstruit, non mesuré ».
3. Option la plus solide : obtenir chez un atelier volontaire 3 à 6 mois de journal de bain (analyses, ajouts, Ah) et de contrôle épaisseur. C'est la donnée qui manque aussi à l'étude Fraunhofer (ajouts de zinc non enregistrés).
4. Option à étudier : l'accès IEEE DataPort au jeu de galvanisation continue, à condition de vérifier la licence avant tout usage commercial.
