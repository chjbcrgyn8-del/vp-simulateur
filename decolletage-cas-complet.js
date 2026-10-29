/* Toutes les mesures et décisions de ce fichier sont INVENTÉES pour la démonstration.
   Aucune photographie, signature, production ou approbation réelle n'est alléguée. */
window.VPDC_COMPLETE={
 title:'Usure outil ou dérive thermique ?',
 verdict:'Conclusion rédigée du scénario : l’usure de l’arête est l’explication privilégiée après les contrôles et l’essai fictifs. Une influence thermique résiduelle n’est pas exclue. Ce n’est ni une inférence automatique ni une validation industrielle.',
 steps:[
 ['Observer et contenir','Un diamètre augmente progressivement dans une série historique fictive. Les dernières pièces dépassent la tolérance de l’exemple. Le scénario prévoit la mise à l’écart des pièces après le dernier contrôle retenu comme acceptable, sans poursuivre sur la seule base d’une compensation.'],
 ['Vérifier la mesure','La pièce 280 est relue trois fois : 10,025 / 10,024 / 10,025 mm. Un second moyen donne 10,025 mm. Les conditions de mesure et une incertitude élargie fictive de 0,002 mm sont documentées ; ces seuls résultats ne constituent pas une étude MSA réelle.'],
 ['Départager les hypothèses','Les températures fictives évoluent peu pendant la dérive. L’ancienne arête est décrite comme usée en dépouille, sans dépôt ni ébréchure observés dans le scénario. Aucun changement de lot, programme, guidage ou offset n’est déclaré. La thermique devient moins étayée, sans être définitivement exclue.'],
 ['Faire un essai encadré','Le scénario remplace uniquement l’insert par une référence identique, vérifie la position de référence et conserve les conditions de coupe. Aucun offset correctif n’est calculé par VP. L’autorisation, les contrôles de sécurité et la décision qualité sont fictifs, pas utilisables pour intervenir sur une machine.'],
 ['Comparer puis surveiller','Les 20 premières pièces fictives après intervention se situent entre 10,004 et 10,007 mm. Neuf contrôles supplémentaires, de la pièce 40 à la pièce 200, restent dans cette plage. La revue fictive retient l’amélioration, mais ni une durée de vie outil ni un gain de production ne sont démontrés.']
 ],
 readings:[
 {piece:180,diameter:'10,006',spindle:'32,1',fluid:'21,2'},
 {piece:200,diameter:'10,010',spindle:'32,2',fluid:'21,3'},
 {piece:220,diameter:'10,014',spindle:'32,2',fluid:'21,3'},
 {piece:240,diameter:'10,018',spindle:'32,3',fluid:'21,4'},
 {piece:260,diameter:'10,022',spindle:'32,2',fluid:'21,3'},
 {piece:280,diameter:'10,025',spindle:'32,3',fluid:'21,3'}
 ],
 after:[10.004,10.005,10.006,10.005,10.006,10.004,10.005,10.006,10.007,10.005,10.006,10.005,10.004,10.006,10.005,10.007,10.006,10.005,10.006,10.005],
 followup:[{piece:40,value:10.005},{piece:60,value:10.006},{piece:80,value:10.005},{piece:100,value:10.007},{piece:120,value:10.006},{piece:140,value:10.006},{piece:160,value:10.007},{piece:180,value:10.006},{piece:200,value:10.007}],
 case:{
 family:'DC01',fictional:true,
 context:{
 caseId:'FICTIF-DC01-USURE-THERMIQUE-02',
 machine:'Machine entièrement fictive M-DC-F02 : tour à poupée mobile. Notice et habilitations évoquées uniquement dans le scénario, aucune notice réelle fournie.',
 architecture:'Poupée mobile, canon conventionnel',
 operation:'Finition extérieure fictive Ø10 mm ; insert carbure A, programme P-F02. Aucun paramètre numérique de coupe prescrit. Référence de position outil vérifiée dans le scénario ; aucun offset modifié.',
 material:'Acier inoxydable 316L fictif, barre Ø12 mm, lot F-L01. Même lot avant/après ; certificat fictif F-MAT-01. Ces valeurs caractérisent uniquement l’exemple.',
 setup:'Montage, canon et serrage déclarés inchangés dans la fiction ; contrôle visuel fictif sans anomalie. Aucune valeur de jeu ni instruction de réglage.',
 lfv:'Absente selon déclaration',
 fluid:'Même fluide et même alimentation fictifs avant/après ; températures 21,2 à 21,4 °C. Aucun débit ou niveau de pression proposé.',
 quality:'EXEMPLE FICTIF : diamètre 10,000 ±0,020 mm. Règle de décision choisie uniquement pour ce scénario : [x−U ; x+U] strictement inclus dans [9,980 ; 10,020] mm, avec U fictif = 0,002 mm. Une valeur à la frontière n’est pas libérée. Ce critère n’est pas une recommandation universelle.',
 measurement:'Tout est inventé : micromètre M1 fictivement qualifié, conditions pièce/moyen 20,0 ±0,3 °C ; méthode identique. Pièce 280 : 10,025 / 10,024 / 10,025 mm ; second moyen M2 : 10,025 mm. U élargie supposée 0,002 mm (k=2), non évaluée réellement. Pas d’étude MSA ni d’incertitude certifiée.',
 timeline:'FICTIF, avant intervention : pièces 180/200/220/240/260/280 = 10,006/10,010/10,014/10,018/10,022/10,025 mm. Températures broche = 32,1/32,2/32,2/32,3/32,2/32,3 °C ; fluide = 21,2/21,3/21,3/21,4/21,3/21,3 °C. Machine déjà en régime décrit comme stabilisé, sans modification d’offset. À l’analyse historique, pièces 221 à 280 mises à l’écart dans le scénario, car 220 est le dernier contrôle satisfaisant strictement la règle fictive.',
 symptom:'FICTIF : diamètre croissant en finition extérieure. Pièces 260 et 280 hors tolérance nominale de l’exemple ; pièce 240 à la frontière de la règle de décision choisie. Confinement et examen qualité simulés, pas lancement automatique d’une correction.'
 },
 observations:{
 'DC01-R01':{status:'Constat déclaré',note:'FICTIF : relectures et second moyen cohérents avec le dépassement. La mesure paraît assez cohérente pour poursuivre l’enquête dans ce scénario. Pas de validation métrologique réelle ; aucune méthode universelle déduite de trois relectures.',reference:'F-MES-01, registre entièrement inventé ; contrôleur fictif Q1, J0.'},
 'DC01-R02':{status:'Constat déclaré',note:'FICTIF : usure en dépouille décrite sur l’arête A ; pas d’arête rapportée ni d’ébréchure décrites. Description pédagogique inventée, aucune photo réelle jointe. Progression avec le nombre de pièces et absence de saut d’offset. L’amélioration après remplacement renforce cette piste dans la narration, sans prouver une causalité universelle.',reference:'F-OUT-01 et F-ESSAI-01, notes inventées ; régleur fictif R1, J0.'},
 'DC01-R03':{status:'Contre-indice déclaré',note:'FICTIF : broche 32,1–32,3 °C et fluide 21,2–21,4 °C sur la séquence, pas de redémarrage avant la dérive. Après remplacement, températures dans les mêmes plages. Cela affaiblit la piste thermique dans le scénario, mais ne mesure pas toutes les déformations et ne l’exclut pas absolument.',reference:'F-THERM-01, relevés inventés et synchronisés aux pièces ; technicien fictif T1, J0.'},
 'DC01-R04':{status:'Contre-indice déclaré',note:'FICTIF : même barre, lot, canon et serrage ; aucun événement de support relevé. Constat fictif de contrôle selon notice, sans valeur de jeu. Ce contre-indice ne prouve pas l’absence de défaut mécanique.',reference:'F-SUPPORT-01, compte rendu inventé ; responsable fictif M1, J0.'}
 },
 trial:{
 target:'DC01-R02',
 objective:'FICTIF : comparer la cote avant/après remplacement de l’arête, à régime thermique et conditions de coupe déclarés comparables. Distinguer l’hypothèse d’usure de celle d’une dérive thermique dominante.',
 before:'FICTIF : six mesures historiques (pièce : mm) : 180 : 10,006 ; 200 : 10,010 ; 220 : 10,014 ; 240 : 10,018 ; 260 : 10,022 ; 280 : 10,025. Ne pas traiter cette petite série comme un calcul de capabilité. Dernier contrôle répondant strictement à la règle fictive : pièce 220.',
 protocol:'ESSAI ENTIÈREMENT FICTIF : après mise en sécurité prévue par le scénario, remplacement de l’insert par une référence identique et vérification de la référence outil. Même lot, programme, géométrie nominale, conditions de coupe et régime thermique. Aucun changement d’offset, aucune modification numérique proposée par VP. Arrêt et redémarrage d’intervention consignés comme facteurs possibles ; pas de causalité garantie.',
 acceptance:'FICTIF : contrôler les 20 premières pièces, puis une pièce toutes les 20 de 40 à 200. Appliquer la règle qualité fictive du contexte. Examiner aussi surface, bavure et autres cotes selon le plan fictif. Limite de preuve : suivi de 200 pièces seulement, pas durée de vie outil.',
 stop:'FICTIF : à toute mesure ne satisfaisant pas la règle choisie, nouvelle dérive, casse, bruit anormal ou doute qualité, arrêt selon procédure locale et mise à l’écart depuis le dernier contrôle acceptable. Dans une usine, le responsable habilité définit ces règles ; ce texte n’autorise aucune intervention.',
 authority:'F-AUT-01 : autorisation inventée du responsable de production P1 et du responsable qualité Q1, J0. Aucune personne réelle, signature ou habilitation validée. Le scénario suppose une intervention autorisée ; le démonstrateur ne l’autorise pas.',
 evidence:'Documents fictifs F-MES-01, F-OUT-01, F-THERM-01, F-SUPPORT-01, F-ESSAI-01 et F-Q-01. Ce sont des références pédagogiques, pas des fichiers de preuve existants. Les valeurs inventées figurent dans ce dossier.'
 },
 result:{
 execution:'FICTIF : R1 remplace l’insert A par A-neuf de même référence sous l’autorisation inventée F-AUT-01, J0. Position de référence contrôlée, pas d’offset modifié. Aucun essai physique réalisé par Vella Partners.',
 after:'FICTIF, pièces 1 à 20 après intervention, mm : 10,004 ; 10,005 ; 10,006 ; 10,005 ; 10,006 ; 10,004 ; 10,005 ; 10,006 ; 10,007 ; 10,005 ; 10,006 ; 10,005 ; 10,004 ; 10,006 ; 10,005 ; 10,007 ; 10,006 ; 10,005 ; 10,006 ; 10,005. Plage 10,004–10,007 mm. Ces nombres inventés satisfont la règle fictive avec U=0,002 mm ; ce n’est pas une conformité industrielle acquise.',
 effects:'FICTIF : aucune nouvelle anomalie de surface, bavure ou autres cotes décrite dans la revue F-Q-01. Observations inventées, sans résultats réels de laboratoire. Températures broche et fluide déclarées comparables. Consommation d’un insert et temps d’arrêt non chiffrés ; aucun gain net calculé.',
 followup:'FICTIF : pièces 40/60/80/100/120/140/160/180/200 = 10,005/10,006/10,005/10,007/10,006/10,006/10,007/10,006/10,007 mm. Neuf contrôles supplémentaires, sans récidive dans cette narration. Aucune extrapolation au-delà des 200 pièces simulées.',
 qualityReview:'F-Q-01, revue inventée de Q1, J0. Conclusion pédagogique : usure de l’arête privilégiée ; thermique moins étayée, non absolument exclue. Dans la fiction, résultat accepté sur le périmètre contrôlé, avec suivi à prolonger et pièces 221–280 du lot initial à traiter séparément. Ni cause réelle confirmée, ni libération réelle, ni action approuvée par VP.',
 assessment:'Amélioration déclarée à revoir'
 }
 }
};
