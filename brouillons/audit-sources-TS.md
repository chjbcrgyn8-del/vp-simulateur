# Audit des 68 sources du référentiel traitement de surface

Date : 31 octobre 2026. Périmètre : `sources-traitement-surface.html` (TS-S01 à TS-S68) du dépôt `vp-simulateur`.

Méthode : chaque URL a été ouverte une par une ; le titre, l'éditeur et chaque chiffre de la fiche ont été comparés au contenu de la page. Les écarts relevés ont ensuite été relus manuellement. Limite : pour les normes payantes, seule la fiche ou l'aperçu public est vérifiable.

## Synthèse

- Confirmée : 34
- Confirmée, libellé à corriger : 25
- Accès partiel (aperçu de norme) : 7
- À remplacer / fusionner : 2

Aucune page morte : les 68 URL répondent. Aucun chiffre contredit sur le fond ; les écarts portent sur des libellés (titre, auteur, éditeur, pays), sur des précisions de plage (TS-S15, TS-S34) et sur des formulations VP présentées comme si elles venaient de la source.

Points à traiter en priorité :

1. TS-S21 : ISO 2081:2018 est annulée. ISO 2081:2025 ne couvre plus que les traitements Cr(VI) ; les passivations Cr(III) utilisées sur nos lignes ZnNi relèvent d'ISO 19598 ([AFNOR](https://www.boutique.afnor.org/fr-fr/norme/iso-20812025/revetements-metalliques-et-autres-revetements-inorganiques-depots-electroly/xs146359/453090), [aperçu ISO 2081:2025](https://cdn.standards.iteh.ai/samples/iso/iso-2081-2025/47f98e37c65843dd8e302e8f4f1d824c/iso-2081-2025.pdf)).
2. TS-S34 : la densité de courant Qualanod dépend de la classe (AA15 1,4–2,0 ; AA25 1,5–3,0 A/dm²), le repère unique 1,2–2,0 A/dm² est trop large.
3. TS-S67 : copie Scribd d'un article Techniques de l'Ingénieur, à remplacer par la référence officielle.
4. TS-S68 : doublon de TS-S01.
5. TS-S32, TS-S37, TS-S44, TS-S49 : retirer les éléments non présents dans la source ou les rattacher à la bonne source.

## Détail par source

| ID | Source | Statut | Correction ou remarque |
|---|---|---|---|
| TS-S01 | [Lindner, Duckstein, Herrmann (TU Braunschweig, Fraunhofer IST) · From Lab to Plant: Data-D](https://finishingandcoating.com/index.php/plating/3058-from-lab-to-plant-data-driven-modelling-of-an-electroplating-process) | Confirmée |  |
| TS-S02 | [Vieira, Van den Bossche, Rose et al. (Elsyca) · Characterization of a Zn/Ni bath, rapport ](https://apps.dtic.mil/sti/tr/pdf/ADA636989.pdf) | Confirmée, libellé à corriger | Pays : le rapport porte l'adresse d'Elsyca Inc. (Géorgie, États-Unis) ; écrire « États-Unis (Elsyca) ». Retirer « dépendances propres à cette chimie » (formulation VP, à placer en limite VP). |
| TS-S03 | [Columbia Chemical · The Art of Zinc Nickel: Deposit Alloy Control](https://www.columbiachemical.com/wp-content/uploads/Zinc-Nickel-Deposit-Alloy-Control.pdf) | Confirmée, libellé à corriger | Titre exact : « The Art of Zinc Nickel » (Columbia Chemical, réimpression Products Finishing, janv. 2017). |
| TS-S04 | [Products Finishing · Better Alloy Control of Alkaline Zinc-Nickel Baths](https://www.pfonline.com/articles/better-alloy-control-of-alkaline-zinc-nickel-baths) | Confirmée |  |
| TS-S05 | [Products Finishing · Solving the Challenge of Carbonate Buildup in Zinc-Nickel Plating Bat](https://www.pfonline.com/articles/solving-the-challenge-of-carbonate-buildup-in-zinc-nickel-plating-baths) | Confirmée |  |
| TS-S06 | [Products Finishing · Improving Alkaline Zinc-Nickel Plating Performance with Membrane Anod](https://www.pfonline.com/articles/improving-alkaline-zinc-nickel-plating-performance-with-membrane-anodes) | Confirmée |  |
| TS-S07 | [Columbia Chemical · Ask the Expert: Troubleshooting Alkaline Zinc](https://www.columbiachemical.com/ask-the-expert-troubleshooting-alkaline-zinc/) | Confirmée |  |
| TS-S08 | [Products Finishing · The Hull Cell: Key to Better Electroplating, Part II](https://www.pfonline.com/articles/the-hull-cell-key-to-better-electroplating-part-ii) | Confirmée |  |
| TS-S09 | [Pavco · Hull Cell Test](https://pavco.com/blog/hull-cell-test) | Confirmée |  |
| TS-S10 | [Leuze Verlag (Galvanotechnik) · Two-dimensional simulation of Hull cells](https://www.leuze-verlag.de/en/essays/two-dimensional-simulation-of-hull-cells) | Confirmée |  |
| TS-S11 | [Products Finishing · Hull Cell 101](https://www.pfonline.com/articles/hull-cell-101) | Confirmée |  |
| TS-S12 | [Leuze Verlag · Haftfestigkeitsprobleme und Rauheiten von Zink-Nickel-Schichten](https://www.leuze-verlag.de/aus-der-praxis-fuer-die-praxis/haftfestigkeitsprobleme-und-rauheiten-von-zink-nickel-schichten) | Confirmée, libellé à corriger | Titre : orthographe exacte de la page Leuze. |
| TS-S13 | [Leuze Verlag · Optimization of the layer thickness distribution](https://www.leuze-verlag.de/en/from-practice-for-practice/optimization-of-the-layer-thickness-distribution) | Confirmée |  |
| TS-S14 | [Krauss · Zink-Nickel sauer oder alkalisch, WOMag 2013](https://www.wotech-technical-media.de/womag/ausgabe/2013/02/24_w_krauss_zinknickel_02j2013/24_w_krauss_zinknickel_02j2013.php) | Confirmée |  |
| TS-S15 | [TU Dortmund · thèse sur les dépôts zinc-nickel (Eldorado)](https://eldorado.tu-dortmund.de/server/api/core/bitstreams/e0ebf2e1-9008-4e53-8fbc-04e31d192511/content) | Confirmée, libellé à corriger | Remplacer « 40–85 % » par « 40–80 % (section 2.3) et 45–85 % selon la densité de courant (introduction) ». Thèse de Bert Gysen, travaux chez Lufthansa Technik. |
| TS-S16 | [CECRI (Inde) · bain zinc-nickel alcalin, 2006](http://krc.cecri.res.in/ro_2006/040-2006.pdf) | Confirmée |  |
| TS-S17 | [Transactions of the IMF · prédiction de l’épaisseur et du taux de Ni par apprentissage aut](https://www.tandfonline.com/doi/abs/10.1080/00202967.2021.1898183) | Confirmée, libellé à corriger | Seul le résumé est accessible ; la limite « laboratoire, sans validation ligne » est une appréciation VP à signaler comme telle. |
| TS-S18 | [Leuze Verlag · Predictive modelling for the optimization of Cr(VI)-free electroplating pro](https://www.leuze-verlag.de/en/essays/predictive-modelling-for-the-optimization-of-cr-vi-free-electroplating-processes) | Confirmée |  |
| TS-S19 | [Ahmadkhaniha, Sieber, Zanella et al. · simulation de la distribution d’épaisseur, Int. J. ](https://link.springer.com/article/10.1007/s00170-024-14337-6) | Confirmée, libellé à corriger | Titre abrégé : reprendre le titre complet (Ahmadkhaniha, Sieber, Zanella ; géométrie en T, bain de nickel). |
| TS-S20 | [Ohara et al. · distribution du courant en dépôt électrolytique, Hyomen Gijutsu 68(11), 201](https://www.jstage.jst.go.jp/article/sfj/68/11/68_617/_article/-char/ja/) | Confirmée, libellé à corriger | Auteur unique : Katsuhiko Ohara (retirer « et al. ») ; type « 解説 » (article de synthèse) ; fiche bibliographique sans résumé consultable. |
| TS-S21 | [ISO 2081:2018 · Revêtements électrolytiques de zinc avec traitements supplémentaires sur f](https://www.iso.org/standard/66374.html) | Accès partiel (aperçu de norme) | ISO 2081:2018 est annulée : remplacée par ISO 2081:2025 (novembre 2025), désormais limitée aux traitements Cr(VI) ; les passivations Cr(III) relèvent d'ISO 19598. Détails (désignation, dégazage) non vérifiables sur l'extrait public. |
| TS-S22 | [ISO 19598:2016 · Revêtements électrolytiques de zinc et d’alliages de zinc sur fer ou acie](https://webstore.ansi.org/preview-pages/ISO/preview_ISO+19598-2016.pdf) | Accès partiel (aperçu de norme) | La fiche publique parle de « zinc et alliages de zinc » ; ZnNi inclus par interprétation. |
| TS-S23 | [ISO 4042:2022 · Fixations, systèmes de revêtement électrolytique](https://cdn.standards.iteh.ai/samples/77913/0e6aa290d2a54e5993d8d2b8902f4425/ISO-4042-2022.pdf) | Confirmée |  |
| TS-S24 | [ISO 9587:2007 · Prétraitements du fer ou de l’acier pour réduire le risque de fragilisatio](https://cdn.standards.iteh.ai/samples/45971/22d39574966b40e4becd2cbebca9fec1/ISO-9587-2007.pdf) | Confirmée, libellé à corriger | Titre français exact : « … visant à réduire … ». La complémentarité avec ISO 9588 est un ajout VP. |
| TS-S25 | [ISO 9227:2022 · Essais de corrosion en atmosphères artificielles, brouillard salin](https://www.iso.org/standard/81744.html) | Confirmée |  |
| TS-S26 | [Erichsen · Salt spray test according to DIN EN ISO 9227](https://erichsen.de/en/service/erichsen-academy/knowledge-base/corrosion-testing/salt-spray-test-according-to-din-en-iso-9227/) | Confirmée |  |
| TS-S27 | [Ascott Analytical · Test methodology VDA 233-102](https://www.ascott-analytical.com/wp-content/uploads/2022/11/Test-Methodology-VDA-233-102-1.pdf) | Confirmée |  |
| TS-S28 | [GMW4700 · Zinc-Nickel Electroplate (copie publique non officielle)](http://dms.mmileme.net/doxbox/Documents/06.MMI.RECUBRIMIENTO%20MET%C3%81LICO/04.MMI.ESPECIFICACIONES%20DEL%20CLIENTE/01.MMI.QIS%20REYNOSA/ZINC%20NIQUEL/TESLA/GMW4700.pdf) | Confirmée, libellé à corriger | Titre exact : GMW4700 « Zinc Alloy Plating ». |
| TS-S29 | [ISO 2931:2017 · Anodisation de l’aluminium, qualité du colmatage par mesure d’admittance](https://www.iso.org/standard/70155.html) | Confirmée |  |
| TS-S30 | [ISO 2819:2017 · Revêtements métalliques sur substrats métalliques, essais d’adhérence](https://www.iso.org/standard/70830.html) | Accès partiel (aperçu de norme) | Essais cités (pliage, choc thermique, quadrillage) non visibles sur le résumé : à confirmer sur texte intégral. |
| TS-S31 | [ISO 3497:2000 · Revêtements métalliques, mesurage de l’épaisseur par spectrométrie de rayo](https://www.iso.org/fr/standard/20319.html) | Accès partiel (aperçu de norme) | « Incertitude à établir avec les étalons du site » : recommandation VP, pas un énoncé de la norme. |
| TS-S32 | [ISO 2360:2017 · Mesurage de l’épaisseur par courants de Foucault sensible aux variations d](https://cdn.standards.iteh.ai/samples/69943/a6932a23657246ad8f45381e96b7c80c/ISO-2360-2017.pdf) | Accès partiel (aperçu de norme) | L'incertitude ±1 µm n'est pas dans ISO 2360 : la rattacher à la source Qualanod (TS-S34) ou la retirer. |
| TS-S33 | [ISO 7599:2018 · Anodisation de l’aluminium, spécifications générales](https://cdn.standards.iteh.ai/samples/70156/8be5ace87a7f44649dbf50a77b146843/ISO-7599-2018.pdf) | Confirmée, libellé à corriger | Titre officiel français complet à reprendre. |
| TS-S34 | [Qualanod · Specifications for the Qualanod quality label, édition au 1er janvier 2026](https://www.qualital.net/q1119/wp-content/uploads/QUALANOD-Specifications_20260101.pdf) | Confirmée, libellé à corriger | Densité de courant par classe : AA5–AA10 1,2–2,0 ; AA15 1,4–2,0 ; AA20 1,5–2,0 ; AA25 1,5–3,0 A/dm². T max 21 °C (AA5–AA10), 20 °C (AA15–AA25). Analyse du bain : « au moins quotidienne » pour l'anodisation. Le document couvre 4 types d'anodisation, pas seulement l'architectural. |
| TS-S35 | [MIL-PRF-8625 · Anodic coatings for aluminum and aluminum alloys (résumé Anoplex)](https://www.anoplex.com/references/MIL-PRF-8625.html) | Confirmée |  |
| TS-S36 | [Products Finishing · Calculating Anodizing Rate for Type II and Type III Coatings (règle d](https://www.pfonline.com/articles/calculating-anodizing-rate-for-type-ii-and-type-iii-coatings) | Confirmée |  |
| TS-S37 | [Products Finishing · Parts burning during hard anodizing](https://www.pfonline.com/articles/anodizing-qa-parts-burning-during-hard-anodizing) | Confirmée, libellé à corriger | La page traite surtout d'agitation par air (spargers) ; retirer « évacuation de la chaleur à l'interface » et « rampe de courant » ou les sourcer ailleurs. |
| TS-S38 | [Leuze Verlag · Anodizing, a process with character](https://www.leuze-verlag.de/en/essays/anodizing-a-process-with-character) | Confirmée |  |
| TS-S39 | [CASF · Troubleshooting Electroless Nickel Plating Solutions](https://www.casf.ca/wp-content/uploads/2014/04/Troubleshooting-Electroless-Nickel-Plating-Solutions.pdf) | Confirmée, libellé à corriger | Auteur : Michael J. Aleksinas. « Seuils à confirmer avec le fournisseur » : limite VP. |
| TS-S40 | [Products Finishing · Balancing an Electroless Nickel Bath to Optimize Performance](https://www.pfonline.com/articles/balancing-an-electroless-nickel-bath-to-optimize-performance) | Confirmée |  |
| TS-S41 | [NBS (NIST) · effets des variables du procédé de nickel chimique](https://govinfo.gov/content/pkg/GOVPUB-C13-87537e1fd753a3737532b730aebf7244/pdf/GOVPUB-C13-87537e1fd753a3737532b730aebf7244.pdf) | Confirmée |  |
| TS-S42 | [Nickel Institute · Nickel Plating Handbook (copie ION, Pays-Bas)](https://vereniging-ion.nl/sites/default/files/files/Nickel%20Plating%20Handbook.pdf) | Confirmée |  |
| TS-S43 | [Pullizzi · Bright nickel troubleshooting (finishing.com)](https://www.finishing.com/library/pullizzi/brightnickel.html) | Confirmée |  |
| TS-S44 | [NMFRC · Hard chromium plating troubleshooting, 2002](https://www.nmfrc.org/pdf/psf2002/040210.pdf) | Confirmée, libellé à corriger | La restriction Cr(VI) dans l'UE n'est pas dans cet article (2002) : la sourcer par TS-S59 (ECHA). |
| TS-S45 | [Plating & Surface Finishing · Controlling Chrome Bath Impurities](https://finishingandcoating.com/index.php/plating/1766-controlling-chrome-bath-impurities) | Confirmée, libellé à corriger | Éditeur : FinishingAndCoating.com, pas Plating & Surface Finishing. Chiffres confirmés. |
| TS-S46 | [Products Finishing · The move toward effective colorless zinc-nickel passivates](https://www.pfonline.com/articles/the-move-toward-effective-colorless-zinc-nickel-passivates) | Confirmée |  |
| TS-S47 | [Pavco · White rust](https://pavco.com/blog/white-rust) | Confirmée, libellé à corriger | Titre exact : « Common Causes of White Rust (And How to Fix Them) » ; la manipulation n'est pas abordée. |
| TS-S48 | [Brahimi · Hydrogen Embrittlement in Steel Fasteners, IBECA, 2014](https://www.boltcouncil.org/files/HydrogenEmbrittlementInSteelFasteners-Brahimi.pdf) | Confirmée |  |
| TS-S49 | [APP Czech · How to prevent surface defects in cathodic electrocoating](https://www.appcz.eu/en/how-to-prevent-surface-defects-in-cathodic-electrocoating/) | Confirmée, libellé à corriger | L'ultrafiltrat n'est pas mentionné (la page parle de conductivité de l'eau déminéralisée) ; guide à visée commerciale. |
| TS-S50 | [P2 InfoHouse · guide de la phosphatation](https://p2infohouse.org/ref/31/30441.pdf) | Confirmée, libellé à corriger | Aucune date de publication : indiquer « non daté ». |
| TS-S51 | [Plating Club · Rectifier selection, calibration, ampere-hour metering](https://www.platingclub.com/pl/blog/plating-rectifier-selection-calibration-ampere-hour-metering-voltage-control) | Confirmée, libellé à corriger | Titre complet à reprendre. |
| TS-S52 | [INRS · Traitement de surface des métaux, fiche TS865](https://www.inrs.fr/dam/inrs/CataloguePapier/TS/TI-TS865page12.pdf) | Confirmée, libellé à corriger | Page INRS du dossier Travail & Sécurité n° 865. |
| TS-S53 | [UITS · Union des industries des technologies de surfaces](https://www.uits-france.org/) | Confirmée |  |
| TS-S54 | [Observatoire de la métallurgie · Traitement des matériaux, besoins en compétences, 2019](https://www.observatoire-metallurgie.fr/sites/default/files/documents/2019-05/obsm-etude_traitement_materiaux-besoins_competences-rapport_final2019_05_06.pdf) | Confirmée |  |
| TS-S55 | [L’Usine Nouvelle · Les mutations du traitement de surface](https://www.usinenouvelle.com/article/les-mutations-du-traitement-de-surface.N293913) | Confirmée |  |
| TS-S56 | [ZVO · Wirtschaftsfaktor Oberflächentechnik](https://www.zvo.org/branche/wirtschaftsfaktor) | Confirmée, libellé à corriger | Titre de page : « Wirtschaftsfaktor ». Le caractère déclaratif des chiffres est une précaution VP. |
| TS-S57 | [Oberfläche · ZVO-Jahresbericht 2025](https://oberflaeche.de/news/alle-news/artikel/zvo-jahresbericht-2025-schrumpfung-abwanderung-und-regulatorische-ueberlastung) | Confirmée |  |
| TS-S58 | [JRC · BREF Surface Treatment of Metals and Plastics](https://bureau-industrial-transformation.jrc.ec.europa.eu/reference/surface-treatment-metals-and-plastics) | Confirmée, libellé à corriger | Le contenu ne mentionne pas explicitement le JRC ; pas d'échéance de révision affichée. |
| TS-S59 | [ECHA · Restriction proposal on chromium (VI) substances](https://echa.europa.eu/-/restriction-proposal-on-chromium-vi-to-cover-more-substances) | Confirmée, libellé à corriger | Titre ECHA légèrement différent ; l'état de la procédure REACH est à revérifier à chaque usage. |
| TS-S60 | [GB/T 9799-2024 · Revêtements électrolytiques de zinc sur fer ou acier (Chine)](https://www.codeofchina.com/standard/GBT9799-2024.html) | Accès partiel (aperçu de norme) | Fiche catalogue (Code of China) : l'adaptation d'ISO 2081 n'est pas indiquée ; la vérifier ou la retirer. |
| TS-S61 | [JIS H 8610:1999 · Revêtements électrolytiques de zinc (Japon)](https://www.intertekinform.com/en-gb/standards/jis-h-8610-1999-632910_saig_jsa_jsa_1451588/) | Accès partiel (aperçu de norme) | Classes 2–25 µm absentes de la fiche catalogue : à confirmer sur texte intégral. |
| TS-S62 | [GitHub · Anodising Digital Twin (vybhav345)](https://github.com/vybhav345/Anodising-Digital-Twin) | Confirmée |  |
| TS-S63 | [Vietnam Journal of Science and Technology · teneur en nickel des dépôts ZnNi selon la dens](https://vjs.ac.vn/jst/article/download/19131/2543256423/2543287601) | Confirmée, libellé à corriger | Titre complet (inclut les caractéristiques du film passif Cr(III)). |
| TS-S64 | [DBpia · nickelage, densité de courant et cellule de Hull (Corée du Sud)](https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE10067956) | Confirmée, libellé à corriger | Titre paraphrasé ; résumé seul (DBpia). |
| TS-S65 | [Journal of Electrochemistry (Xiamen) · zinc-nickel alcalin brillant](https://jelectrochem.xmu.edu.cn/journal/vol1/iss3/20/) | Confirmée |  |
| TS-S66 | [Université de Southampton · Electrodeposited Zn-Ni coatings for the replacement of cadmium](https://eprints.soton.ac.uk/499866/1/Electrodeposited_Zn-Ni_Coatings_for_the_Replacement_of_Cadmium.pdf) | Confirmée |  |
| TS-S67 | [Scribd · Cataphorèse, paramètres du procédé (document de formation)](https://fr.scribd.com/document/642718895/Cataphorese-pdf) | À remplacer / fusionner | Document Scribd = copie d'un article Techniques de l'Ingénieur « Cataphorèse » (10 mars 2000). Remplacer par la référence officielle Techniques de l'Ingénieur ; ne pas lier une copie non autorisée. |
| TS-S68 | [Plating & Surface Finishing · data-driven ZnNi, résumé du programme de recherche (Fraunhof](https://finishingandcoating.com/index.php/plating/3058-from-lab-to-plant-data-driven-modelling-of-an-electroplating-process) | À remplacer / fusionner | Même article que TS-S01 : fusionner en une seule source et garder la leçon de traçabilité dans TS-S01. |
