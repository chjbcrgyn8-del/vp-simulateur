/* Cas complet traitement de surface · ENTIÈREMENT FICTIF.
   Toutes les mesures, interventions, autorisations et conclusions sont inventées pour la démonstration.
   Aucune entreprise, ligne, production ou approbation réelle n'est alléguée. */
window.VPTS_COMPLETE={
 title:'Rouille rouge prématurée sur ZnNi : épaisseur, taux de nickel ou passivation ?',
 verdict:'Conclusion rédigée du scénario : une épaisseur locale insuffisante dans les creux, liée à une surcharge du tonneau, est l’explication privilégiée. Le taux de nickel et la passivation sont dans la plage de l’exemple. Ce n’est ni une inférence automatique ni une validation industrielle.',
 case:{
  family:'TS05',fictional:true,
  key:'p|F03|tonneau#0',
  state:{def:'F03',fam:'perf',br:'sans',mach:'tonneau',param:'e',dir:'down',ou:'lcd',quand:'lot',freq:'charge',terme:'moyen',qui:'client',combien:'part',qd:''},
  context:{
   caseId:'FICTIF-TS05-ROUILLE-ROUGE-01',
   machine:'Ligne entièrement fictive L-TS-F01 : zinc-nickel alcalin au tonneau, anodes à membrane, 4 tonneaux. Aucune notice réelle fournie.',
   equipment:'Tonneau fictif T3, charge nominale de l’exemple 40 kg ; passivation Cr(III) épaisse et top-coat déclarés inchangés.',
   material:'Vis acier fictives M8 à empreinte creuse, lot F-L07 (nouveau fournisseur de visserie dans le scénario). Dureté déclarée inférieure à 320 HV : pas de dégazage requis dans l’exemple.',
   quality:'EXEMPLE FICTIF : épaisseur locale minimale 8 µm sur la surface significative définie au plan, Ni 12–16 %, 720 h au brouillard salin neutre sans rouille rouge. Critère choisi uniquement pour ce scénario, non universel.',
   measurement:'FICTIF : XRF de laboratoire, collimateur adapté, étalons ZnNi vérifiés le jour J ; 5 pièces × 3 points (tête, fût, fond d’empreinte). Brouillard salin réalisé par un laboratoire fictif LAB-F2.',
   reference:'Aucune fiche fournisseur réelle ; références F-* entièrement fictives. Normes citées en méthode : ISO 3497, ISO 9227, ISO 4042.',
   notes:'FICTIF : réclamation client après 240 h de brouillard salin (rouille rouge en fond d’empreinte sur 3 pièces sur 10). Les charges précédentes du même article passaient 720 h. Changement de lot de visserie et charge du tonneau portée de 40 à 52 kg pour tenir le débit la même semaine.'
  },
  trial:{
   objective:'FICTIF : vérifier si le retour à la charge nominale du tonneau rétablit l’épaisseur minimale en fond d’empreinte.',
   before:'FICTIF : charge 52 kg ; fond d’empreinte 4,8 / 5,2 / 5,5 / 4,9 / 5,1 µm ; tête 11,2 à 12,0 µm ; Ni 13,6 à 14,4 %.',
   protocol:'ESSAI ENTIÈREMENT FICTIF : une seule variable modifiée (charge 40 kg), même bain, même redresseur, même temps et même passivation. Densité de courant recalculée sur la surface réelle chargée. Aucune quantité d’ajout proposée par VP.',
   acceptance:'FICTIF : épaisseur minimale ≥ 8 µm sur 5 pièces × 3 points pour 3 charges consécutives, puis brouillard salin 720 h sur 10 pièces.',
   stop:'FICTIF : arrêt à toute brûlure, épaisseur hors plage ou doute sur la mesure ; décision qualité requise avant libération.',
   authority:'F-AUT-03 : autorisation inventée du responsable de ligne P2 et du responsable qualité Q2. Aucune autorisation réelle.',
   evidence:'Documents fictifs F-XRF-07, F-BAIN-07, F-NSS-07 et F-Q-07.'
  },
  result:{
   execution:'FICTIF : 3 charges de 40 kg, J+1, opérateur O3, mêmes réglages déclarés.',
   after:'FICTIF : fond d’empreinte 8,4 à 9,6 µm ; tête 11,0 à 11,8 µm ; Ni 13,8 à 14,3 %.',
   effects:'FICTIF : débit du tonneau réduit ; aucun effet d’aspect observé dans le scénario.',
   followup:'FICTIF : brouillard salin 720 h sans rouille rouge sur 10 pièces ; suivi de l’épaisseur en fond d’empreinte ajouté au plan de contrôle.',
   qualityReview:'FICTIF : revue F-Q-07, libération des lots suivants ; lots à 52 kg isolés.',
   assessment:'FICTIF : explication privilégiée = épaisseur locale insuffisante par surcharge. Contre-hypothèses non exclues : géométrie du nouveau lot de vis, rinçage avant passivation. Pas de preuve industrielle.'
  },
  observations:{
   F03_M:{status:'Constat déclaré',note:'FICTIF : étalons XRF vérifiés, deux opérateurs concordants à ±0,3 µm. La mesure paraît assez cohérente pour poursuivre dans ce scénario.',reference:'F-XRF-07'},
   F03_X:{status:'Constat déclaré',note:'FICTIF : le minimum local se situe en fond d’empreinte, zone incluse dans la surface significative du plan de l’exemple.',reference:'F-PLAN-07'},
   F03_N:{status:'Constat déclaré',note:'FICTIF : Ni du dépôt 13,6 à 14,4 %, dans la plage de l’exemple ; analyses de bain dans la fiche fictive.',reference:'F-BAIN-07'},
   F03_V:{status:'Constat déclaré',note:'FICTIF : pH, température et temps de passivation relevés dans la plage de la fiche fictive.',reference:'F-PASS-07'},
   F03_O:{status:'Constat déclaré',note:'FICTIF : préparation et lecture du brouillard salin conformes à la méthode citée par le laboratoire fictif.',reference:'F-NSS-07'}
  }
 }
};
