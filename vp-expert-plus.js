/* VP Expert · module « réflexes de l’expert » (novembre 2026)
   Ajouts sans modification des moteurs existants (enquete.js, enquete-c.js, vp-expert-consolide.js) :
   1. Jumeaux à écarter (défauts proches et critère qui les sépare)
   2. Est / N’est pas, dernière bonne série, répétabilité : orientations expliquées et, sur option, classement réordonné
   3. Test qui tranche pour chaque cause (règles par mot-clé, premier jet Vella, à valider par les experts)
   4. Protocole d’essai : une variable, série stabilisée, critère écrit avant l’essai
   5. Causes écartées et niveau de preuve pour la mémoire
   6. Mode « puis-je conclure ? » (données insuffisantes)
   7. Coût du défaut dans la synthèse
   Tout reste dans la page : aucune sauvegarde serveur. Démonstrateur, pas une validation métier. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

/* ---------- 1. Jumeaux ---------- */
const TWINS_TP={
 'Incomplet':[['Brûlure','Manque matière avec trace brune ou noire en fin de flux : air piégé (effet diesel), pas un manque de pression.'],['Bulles de vide','La pièce est complète mais creuse à cœur : vide interne, à voir en coupe.']],
 'Retassure':[['Bulles de vide','Couper la pièce : creux en surface (retassure) ou vide à l’intérieur (bulle de vide) ; même famille de causes, remèdes différents.'],['Marques d’éjecteurs','Creux rond exactement sous un éjecteur : éjection, pas compactage.']],
 'Bulles de vide':[['Bulles','Bulles rondes visibles en surface ou sous la peau : gaz ou humidité ; le vide interne n’apparaît qu’en coupe.'],['Retassure','Creux en surface au-dessus d’une section épaisse : retassure.']],
 'Bulles':[['Givrage','Traînées argentées orientées dans le sens du flux : givrage (humidité ou dégradation), pas des bulles rondes.'],['Bulles de vide','Rien en surface, cavité à cœur : bulle de vide.']],
 'Givrage':[['Strie d’air','Stries localisées près du seuil, argentées et nettes : air entraîné au seuil.'],['Dégradation matière','Jaunissement, odeur, perte de propriétés : dégradation thermique plutôt qu’humidité.'],['Strie de couleur','Traînées de teinte différente sans aspect argenté : dispersion du colorant.']],
 'Brûlure':[['Points noirs','Points dispersés sur toute la pièce : contamination ou dépôt dégradé dans le fourreau, pas de l’air piégé en fin de flux.'],['Dégradation matière','Brun généralisé, pièce cassante : température ou temps de séjour.']],
 'Points noirs':[['Brûlure','Toujours au même endroit en fin de flux ou près d’un évent : brûlure par air piégé.'],['Dégradation matière','Brun diffus et pièce fragile : dégradation, pas des particules.']],
 'Ligne de soudure':[['Jet libre','Serpentin qui part du seuil : jet libre, pas la rencontre de deux fronts.'],['Goutte froide','Marque unique près du seuil, matière froide poussée dans l’empreinte : goutte froide.']],
 'Goutte froide':[['Jet libre','Tracé serpentin continu depuis le seuil : jet libre.'],['Ligne de soudure','Ligne droite là où deux fronts se rejoignent, loin du seuil : soudure.']],
 'Jet libre':[['Goutte froide','Une seule marque près du seuil, pas de serpentin : goutte froide.'],['Ligne de soudure','Ligne à la jonction de deux flux : soudure.']],
 'Bavure':[['Cotes pièces non conformes','Pas d’excès de matière au plan de joint mais pièce trop grande partout : sur-compactage, pas bavure.']],
 'Pièces déformées':[['Cotes pièces non conformes','Pièce plane mais hors cote : retrait, pas voilage.'],['Marques d’éjecteurs','Déformation locale sous les éjecteurs seulement : éjection forcée.']],
 'Cotes pièces non conformes':[['Pièces déformées','Pièce voilée, cote variable selon l’endroit : déformation.'],['Retassure','Creux localisés en zone épaisse : retassure plutôt qu’un retrait global.']],
 'Marques d’éjecteurs':[['Pièces déformées','Déformation étendue, pas seulement sous les éjecteurs.'],['Traces brillantes ou mates','Différence d’aspect sans relief : état de surface du moule.']],
 'Pièces cassantes':[['Fissuration sous contrainte','La pièce casse après coup, au montage ou en service, souvent près d’un insert : fissuration différée.'],['Dégradation matière','Pièce cassante et jaunie : matière dégradée.']],
 'Fissuration sous contrainte':[['Pièces cassantes','Casse immédiate au démoulage ou à la manipulation : fragilité, pas fissuration différée.'],['Pièces déformées','Contraintes visibles par voilage avant toute fissure.']],
 'Délaminage':[['Peau d’orange','Surface ondulée sans décollement : peau d’orange.'],['Strie de fibre de verre','Fibres apparentes en surface sans couches qui se décollent.']],
 'Peau d’orange':[['Traces brillantes ou mates','Différence de brillance sans relief : état de surface ou vitesse.'],['Délaminage','Couches qui se séparent à l’ongle : délaminage.']],
 'Traces brillantes ou mates':[['Peau d’orange','Relief granuleux visible au doigt.'],['Rayures','Traces linéaires dans le sens de l’éjection.']],
 'Rayures':[['Marques d’éjecteurs','Marque ronde ou en relief sous éjecteur.'],['Traces brillantes ou mates','Zone mate sans rayure linéaire.']],
 'Strie de couleur':[['Strie d’air','Stries argentées, pas de teinte différente.'],['Givrage','Traînées argentées sur toute la pièce.']],
 'Strie d’air':[['Givrage','Traînées argentées réparties sur la pièce, pas seulement au seuil.'],['Strie de couleur','Teinte différente, sans aspect argenté.']],
 'Strie de fibre de verre':[['Délaminage','Couches qui se décollent.'],['Traces brillantes ou mates','Mat uniforme sans fibres apparentes.']],
 'Dégradation matière':[['Brûlure','Marque localisée en fin de flux : air piégé.'],['Points noirs','Particules isolées, matière saine autour.'],['Givrage','Traînées argentées : plutôt humidité.']]
};
const TWINS_CA={
 '01-MR':[['03-bulles','Manque avec trace brune ou noire en fin de flux : brûlure par air piégé, pas un manque de pression ou de dosage.'],['02-MG','Aspect granuleux, lignes mates, matière déjà réticulée : prévulcanisation, à traiter côté thermique et temps de séjour.']],
 '02-MG':[['03-bulles','Brûlure localisée aux évents ou en fin de flux : air piégé, pas une prévulcanisation diffuse.'],['10-Contamination','Particules étrangères sans zone pré-réticulée : contamination.']],
 '03-bulles':[['04-Sous-vulcanisation','Cloque au cœur des sections épaisses, cœur mou à la coupe : sous-cuisson, pas de l’air.'],['12-Surface poreuse','Porosité diffuse sur toute la surface : volatils ou humidité, variable selon le lot.'],['10-Contamination','Bulles qui varient d’un lot à l’autre : humidité ou pollution du mélange.']],
 '04-Sous-vulcanisation':[['03-bulles','Cloque localisée, répétable au même endroit, qui réagit au vide : air piégé.'],['14-Pièces collantes','Pièce collante mais dure à cœur : agent démoulant ou moule, pas sous-cuisson.'],['05-Déformation','Déformation au démoulage avec dureté conforme : éjection ou géométrie.']],
 '05-Déformation':[['04-Sous-vulcanisation','Cœur mou, dureté sous spécification : sous-cuisson.'],['14-Pièces collantes','La pièce reste dans le moule avant de se déformer : collage.']],
 '06-Ligne soudure':[['01-MR','La jonction n’est pas remplie : manque matière, pas une soudure faible.'],['15-Différence surface','Ligne d’aspect sans faiblesse mécanique à la traction : surface.']],
 '07-Bavure':[['13-Pièces grandes','Pas d’excès au plan de joint mais cote globale trop grande : dosage ou retrait.'],['08-Infiltration inserts','Bavure uniquement autour des inserts : étanchéité insert.']],
 '08-Infiltration inserts':[['07-Bavure','Bavure au plan de joint, pas seulement aux inserts.'],['11-Adhérisation','Infiltration et décollement : adhérisant plutôt qu’étanchéité.']],
 '09-Encrassement moule':[['15-Différence surface','Différence d’aspect sur moule propre : mélange ou thermique.'],['14-Pièces collantes','Collage sans dépôt visible : démoulant ou cuisson.']],
 '10-Contamination':[['03-bulles','Bulles sans particules visibles : vide ou humidité.'],['15-Différence surface','Variation d’aspect sans corps étranger.']],
 '11-Adhérisation':[['08-Infiltration inserts','Matière passée sous l’insert sans décollement : étanchéité.'],['04-Sous-vulcanisation','Décollement avec cœur mou : cuisson insuffisante.']],
 '12-Surface poreuse':[['03-bulles','Bulles localisées et répétables : air piégé.'],['10-Contamination','Porosité qui change avec le lot : volatils ou pollution.']],
 '13-Pièces grandes':[['07-Bavure','Excès au plan de joint, cote hors bavure conforme : bavure.'],['16-Retassures','Pièce trop petite ou creuse : retrait, sens inverse.']],
 '14-Pièces collantes':[['04-Sous-vulcanisation','Collante et molle à cœur : sous-cuisson.'],['09-Encrassement moule','Dépôt visible dans l’empreinte : encrassement.']],
 '15-Différence surface':[['09-Encrassement moule','Dépôt dans les zones mates : encrassement.'],['10-Contamination','Taches avec corps étranger : contamination.']],
 '16-Retassures':[['13-Pièces grandes','Pièce trop grande partout : sens inverse, dosage.'],['04-Sous-vulcanisation','Creux avec cœur mou : cuisson.']]
};

/* ---------- 2. Est / N’est pas, dernière bonne série, répétabilité ---------- */
const QX=[
 ['empr','Où ? Empreintes touchées',[['une','Une seule empreinte'],['plusieurs','Plusieurs, pas toutes'],['toutes','Toutes les empreintes'],['mono','Moule mono-empreinte']]],
 ['repet','Quand ? Répétabilité',[['toujours','Toujours, à chaque cycle'],['bouffees','Par bouffées'],['rare','Un cycle sur n, aléatoire']]],
 ['lot','Depuis la dernière bonne série : la matière',[['meme','Même lot'],['nouveau','Nouveau lot'],['nsp','Je ne sais pas']]],
 ['moule','Depuis la dernière bonne série : le moule',[['non','Rien'],['maint','Intervention ou nettoyage'],['mont','Remontage sur une autre presse']]],
 ['machine','Depuis la dernière bonne série : la machine',[['non','Rien'],['oui','Intervention, périphérique ou réglage changé']]],
 ['equipe','Depuis la dernière bonne série : l’équipe',[['non','Même équipe'],['oui','Autre régleur ou équipe']]],
 ['milieu','Depuis la dernière bonne série : l’atelier',[['non','Rien de notable'],['oui','Plus froid, plus chaud, humide, redémarrage après arrêt']]]
];
const QX_DC=[
 ['empr','Où ? Machines ou postes touchés',[['une','Une seule machine'],['plusieurs','Plusieurs, pas toutes'],['toutes','Toutes']]],
 ['repet','Quand ? Répétabilité',[['toujours','Toujours, à chaque pièce'],['bouffees','Par bouffées'],['rare','Une pièce sur n, aléatoire']]],
 ['lot','Depuis la dernière bonne série : la matière',[['meme','Même lot'],['nouveau','Nouveau lot'],['nsp','Je ne sais pas']]],
 ['moule','Depuis la dernière bonne série : l’outillage',[['non','Rien'],['maint','Changement ou réaffûtage'],['mont','Remontage']]],
 ['machine','Depuis la dernière bonne série : la machine',[['non','Rien'],['oui','Intervention, périphérique ou réglage changé']]],
 ['equipe','Depuis la dernière bonne série : l’équipe',[['non','Même équipe'],['oui','Autre opérateur ou équipe']]],
 ['milieu','Depuis la dernière bonne série : l’atelier',[['non','Rien de notable'],['oui','Température, humidité, redémarrage après arrêt']]]
];
/* Règles : famille → delta, et la phrase affichée. Familles : mat, moule, machine, methode, milieu, mo */
const RULES=[
 [s=>s.empr==='une'||s.empr==='plusieurs',{moule:2,mat:-2,methode:-1},'Défaut limité à certaines empreintes : la matière et les réglages touchent toutes les empreintes de la même façon. Regarder d’abord le moule de ces empreintes (évents, seuils, régulation, usure).'],
 [s=>s.empr==='toutes',{mat:1,methode:1,machine:1},'Toutes les empreintes : cause commune, matière, réglage, machine ou thermique globale.'],
 [s=>s.repet==='toujours',{moule:1,methode:1},'Défaut répétable à chaque cycle : cause stable (moule, réglage, thermique), pas un aléa matière.'],
 [s=>s.repet==='bouffees',{mat:2,milieu:1,machine:1},'Par bouffées : lot, humidité, temps de séjour ou périphérique (séchoir, régulateur). Chercher ce qui varie dans le temps.'],
 [s=>s.repet==='rare',{mat:1,machine:1,mo:1},'Un cycle sur n : dosage instable, clapet, alimentation ou geste opérateur.'],
 [s=>s.lot==='nouveau',{mat:3},'Nouveau lot depuis la dernière bonne série : contrôler le lot avant tout réglage (certificat, rhéologie ou fluidité, humidité, date).'],
 [s=>s.lot==='meme',{mat:-1},'Même lot que la bonne série : la matière reste possible (stockage, humidité) mais n’est plus la première piste.'],
 [s=>s.moule==='maint',{moule:3},'Moule intervenu depuis : évents, seuils, raccordement des circuits, plan de joint, agent démoulant à contrôler en premier.'],
 [s=>s.moule==='mont',{moule:2,machine:1},'Remontage : raccordement de la régulation, équilibrage thermique, parallélisme, force de fermeture.'],
 [s=>s.machine==='oui',{machine:3},'Machine ou périphérique modifié : relire les valeurs réelles face à la fiche de réglage, pas seulement les consignes.'],
 [s=>s.equipe==='oui',{mo:2,methode:1},'Changement d’équipe : fiche de réglage respectée ? Écart de pratique (purge, démoulant, manipulation, cadence).'],
 [s=>s.milieu==='oui',{milieu:2,mat:1},'Conditions d’atelier : température matière et moule au démarrage, humidité, remise en température du mélange.'],
 [s=>s.lot==='meme'&&s.moule==='non'&&s.machine==='non'&&s.equipe==='non'&&s.milieu==='non',{moule:1,machine:1},'Rien n’a changé et le défaut apparaît : chercher la dérive lente (usure, encrassement, sonde, séchoir). C’est le cas que VP Predict repère sur presse connectée.']
];
const famKey=t=>{t=norm(t);if(/mati|melange|lot|granul/.test(t))return 'mat';if(/moule|outil|empreinte|seuil|event|evant|plan de joint|insert/.test(t))return 'moule';if(/machine|presse|moyen|periph|hydraul|vis|fourreau|pot/.test(t))return 'machine';if(/param|regl|method|proc|dosage|vitesse|pression|temps/.test(t))return 'methode';if(/milieu|ambi|atelier/.test(t))return 'milieu';if(/main|oper|regleur|equipe/.test(t))return 'mo';return ''};
const FAMLBL={mat:'Matière',moule:'Moule / outillage',machine:'Machine',methode:'Réglage / méthode',milieu:'Milieu',mo:'Main-d’œuvre'};

/* ---------- 3. Test qui tranche (règles par mot-clé) ---------- */
const TESTS=[
 [/event|evant|degazage/,'Nettoyer les évents de la seule zone concernée, sans toucher aux consignes, puis 20 cycles.','Le défaut disparaît sur cette zone seulement.'],
 [/humid|secha|etuv|hygro/,'Prendre un sac neuf étuvé selon la fiche matière (ou mesurer l’humidité), 20 cycles.','Le défaut disparaît ou s’atténue nettement, sans réglage.'],
 [/lot|certificat|rheolog|mooney|ts2|t90|fluidit/,'Revenir au lot précédent conservé, même réglage, 20 cycles.','Le défaut disparaît avec l’ancien lot : lot en cause, à isoler.'],
 [/seuil|point d.injection|busette|buse/,'Inspecter et nettoyer seuils et busettes de l’empreinte touchée ; comparer leur section au plan.','Empreinte concernée remplie ; les autres inchangées.'],
 [/regul|thermique|temperature du moule|plateau|circuit|surface moulante/,'Mesurer au pyromètre fixe et mobile aux mêmes points, comparer à l’afficheur et à la fiche.','Écart supérieur à la tolérance du site, ou écart afficheur/mesure : sonde ou circuit.'],
 [/dosage|coussin|volume|ebauche|masse/,'Peser 10 pièces consécutives et relever le coussin (ou l’ébauche) sur 10 cycles.','Masse sous recette ou coussin instable : dosage en cause.'],
 [/vitesse|pression d.injection|remplissage|profil/,'Série de pièces incomplètes à 50, 80 et 95 % du dosage pour lire le remplissage ; une seule vitesse modifiée ensuite.','Le front de matière montre où le remplissage s’arrête ; le changement de vitesse déplace le défaut.'],
 [/maintien|commutation|compact/,'Étude de scellement : masse pièce pour 3 temps de maintien croissants, même pression.','La masse plafonne avant le temps réglé : le seuil est figé, le maintien n’agit plus.'],
 [/vide|tirage/,'Un cycle avec vide prolongé puis un cycle sans vide, pièces repérées.','Le défaut réagit au vide : air piégé ou vide insuffisant.'],
 [/fermeture|verrouill/,'Comparer la force réglée à la force calculée (surface projetée × pression) et contrôler le parallélisme.','Force réglée sous le besoin, ou plan de joint ouvert d’un côté.'],
 [/vis|contre.pression|cisaill|rotation|boudineuse|pot/,'Mesurer la température matière réelle à la purge (thermomètre à aiguille) et la comparer à la consigne.','Matière plus chaude que la consigne : cisaillement ou échauffement en cause.'],
 [/refroid|cycle/,'Allonger le temps de refroidissement de 20 % sur 20 cycles, rien d’autre.','Le défaut disparaît : refroidissement ou cuisson en cause ; sinon revenir à la valeur d’origine.'],
 [/ejec|demoul/,'Démouler à la main une pièce (ou éjection lente) et contrôler course, vitesse et équilibre des éjecteurs.','Pièce intacte en manuel : éjection en cause.'],
 [/demoulant|agent/,'Moule nettoyé, sans agent démoulant, 10 cycles.','Surface conforme sans agent : excès ou produit incompatible.'],
 [/insert|adheris/,'Contrôler préparation, séchage et position de l’insert sur 10 pièces repérées.','Défaut corrélé à un insert mal préparé ou mal positionné.'],
 [/vulcan|cuisson|sous.cui/,'Dureté à cœur sur coupe, comparée à la surface ; ratio temps de cuisson sur t90 du lot.','Cœur sous la spécification : cuisson insuffisante au cœur.'],
 [/sejour|purge|attente|arret/,'Noter arrêts et attentes des 2 dernières heures ; purger puis 20 cycles.','Le défaut disparaît après purge et ne revient qu’après un arrêt.'],
 [/colorant|maitre|dispers|melang/,'Essai avec matière non colorée (ou colorant du lot précédent), 20 cycles.','Le défaut disparaît sans le colorant.'],
 [/contam|pollu|propret|encrass/,'Inspecter trémie, canaux et empreintes ; nettoyer ; 20 cycles.','Le défaut disparaît après nettoyage et revient progressivement.'],
 [/usure|surface de l.empreinte|polissage|plan de joint/,'Inspection visuelle et au comparateur de la zone ; empreinte de plan de joint au papier.','Marque d’usure ou jour au plan de joint à l’endroit du défaut.'],
 [/standard|fiche|gamme|identification|equipe|operateur/,'Comparer les valeurs réelles affichées à la fiche de réglage validée, ligne par ligne.','Écart entre fiche et réglage réel : réappliquer le standard avant tout essai.'],
 [/atelier|stockage|ambiance|milieu/,'Relever température et humidité d’atelier et de stockage, comparer au démarrage de la bonne série.','Écart marqué : remise en température de la matière avant essai.']
];
const GEN=['Comparer la valeur réelle à la fiche, puis un seul changement, 20 cycles, retour arrière si sans effet.','Le défaut change de façon nette sur la série ; sinon l’hypothèse n’est pas étayée.'];
const testFor=n=>{const t=norm(n);const r=TESTS.find(x=>x[0].test(t));return r?[r[1],r[2]]:GEN};

/* ---------- état ---------- */
let api=null,X={},costs={};
const key=()=>api?api.KEY():'';
const st=()=>X[key()]||(X[key()]={});

function sector(){return api?api.sector:'TP'}
function defKey(){return api.S.def}
function defName(k){if(sector()==='TP')return k;const d=(window.VELLA_REF_DEFAUTS||[]).find(x=>x.tab===k);return d?d.defect:k}

/* ---------- rendu 1 : jumeaux ---------- */
function drawTwins(){const s0=$('s0');if(!s0)return;let box=$('vpp-twins');if(!box){box=document.createElement('div');box.id='vpp-twins';box.className='vpp';s0.append(box)}
 const T=sector()==='TP'?TWINS_TP:sector()==='CA'?TWINS_CA:null;const list=T&&T[defKey()];
 if(!list){box.hidden=true;return}box.hidden=false;
 box.innerHTML=`<p class="vpp-h"><b>Est-ce bien ce défaut ?</b> <span class="sl">Deux défauts se ressemblent souvent et ne se traitent pas pareil. Le critère qui les sépare :</span></p><ul class="vpp-tw">${list.map(([k,c])=>`<li><button type="button" class="lk" data-vpp-twin="${esc(k)}">C’est plutôt « ${esc(defName(k))} »</button><span>${esc(c)}</span></li>`).join('')}</ul><p class="vpp-note">Jumeaux et critères : premier jet Vella, à valider par nos experts.</p>`;}

/* ---------- rendu 2 : orientations ---------- */
function orient(){const s=st(),fam={},lines=[];RULES.forEach(([cond,d,txt])=>{if(cond(s)){lines.push(txt);for(const f in d)fam[f]=(fam[f]||0)+d[f]}});return {fam,lines}}
function drawOrient(){const s2=$('s2');if(!s2)return;let box=$('vpp-orient');if(!box){box=document.createElement('div');box.id='vpp-orient';box.className='vpp';s2.append(box)}
 const s=st(),Q=sector()==='DC'||sector()==='TS'?QX_DC:QX;
 let {fam,lines}=orient();if(sector()==='DC'||sector()==='TS')lines=lines.map(l=>l.replace(/empreintes?/g,'machines').replace(/moule/g,'outillage').replace(/cycle/g,'pièce'));
 const pill=(k,list)=>`<div class="opts" data-vpp-k="${k}">${list.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${s[k]===v}">${esc(l)}</button>`).join('')}</div>`;
 box.innerHTML=`<p class="vpp-h"><b>Est / N’est pas, et qu’est-ce qui a changé ?</b> <span class="sl">Les deux questions qu’un expert pose avant de regarder la presse. Chaque réponse écarte ou renforce une famille de causes, avec la règle écrite.</span></p>`
 +Q.map(([k,t,l])=>`<div class="q"><span class="ql">${k==='empr'?'Où':k==='repet'?'Quand':'Changé'}</span><div><b>${esc(t)}</b>${pill(k,l)}</div></div>`).join('')
 +`<div class="vpp-or" id="vpp-orlines">${lines.length?`<b>Orientation</b><ul>${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul><p class="vpp-fam">${Object.entries(fam).filter(([,v])=>v).sort((a,b)=>b[1]-a[1]).map(([f,v])=>`<span class="${v>0?'up':'down'}">${esc(f==='moule'&&(sector()==='DC'||sector()==='TS')?'Outillage':FAMLBL[f])} ${v>0?'+':''}${v}</span>`).join(' ')}</p><label class="vpp-tog"><input type="checkbox" id="vpp-apply" ${s.apply===false?'':'checked'}> Appliquer l’orientation à l’ordre des causes de l’étape suivante (l’ordre de l’expert reste visible dans le numéro d’origine)</label>`:'<span class="sl">Répondez pour voir l’orientation. Sans réponse, l’ordre reste celui du référentiel.</span>'}</div>`;}

/* ---------- rendu 3 : cartes de causes (tests, badges, réordonnancement) ---------- */
function decorateCards(){const res=$('res');if(!res)return;const s=st(),{fam,lines}=orient();const apply=lines.length&&s.apply!==false;
 const cards=[...res.querySelectorAll('.cc')];
 cards.forEach(el=>{if(el.querySelector('.vpp-test'))return;const name=el.dataset.name||(el.querySelector('.ch b')||{}).textContent||'';const [t,a]=testFor(name);const p=document.createElement('p');p.className='vpp-test';p.innerHTML=`<b>Test qui tranche :</b> ${esc(t)} <i>Attendu si la cause est vraie :</i> ${esc(a)}`;const act=el.querySelector('.acts,.cst');if(act)el.insertBefore(p,act);else el.append(p)});
 const groups=new Map();cards.forEach(el=>{const p=el.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(el)});
 groups.forEach((list,parent)=>{list.forEach((el,i)=>{if(!el.dataset.vppRank)el.dataset.vppRank=String(i+1);const famTxt=(el.querySelector('.fam')||{}).textContent||'';const f=famKey(famTxt)||famKey(el.dataset.name||'');const sc=lines.length?(fam[f]||0):0;el.dataset.vppScore=String(sc);let b=el.querySelector('.vpp-badge');if(!b){b=document.createElement('span');b.className='vpp-badge';const h=el.querySelector('.ch b');if(h)h.append(b)}b.textContent=sc>0?'Orientation : plus probable':sc<0?'Orientation : moins probable':'';b.className='vpp-badge'+(sc>0?' up':sc<0?' down':'')});
  if(!apply)return;
  const sorted=list.slice().sort((a,b)=>(Number(b.dataset.vppScore)-Number(a.dataset.vppScore))||(Number(a.dataset.vppRank)-Number(b.dataset.vppRank)));
  if(sorted.some((el,i)=>el!==list[i])){sorted.forEach(el=>parent.append(el));}
  sorted.forEach((el,i)=>{const rk=el.querySelector('.rk');if(rk){rk.textContent=String(i+1);if(el.dataset.vppRank!==String(i+1))rk.title='Ordre du référentiel : '+el.dataset.vppRank;else rk.removeAttribute('title')}})});}

/* ---------- rendu 6 : puis-je conclure ? ---------- */
function drawConclude(){const s3=$('s3');if(!s3)return;let box=$('vpp-conclude');if(!box){box=document.createElement('div');box.id='vpp-conclude';box.className='vpp vpp-cc';const res=$('res');s3.insertBefore(box,res)}
 const s=st();const qq=['ou','quand','freq','terme','qui','etendue','combien','pourquoi'].filter(k=>api.S[k]!==undefined).length;
 const ox=QX.map(q=>q[0]).filter(k=>s[k]!==undefined).length;
 let mes=0,mesTot=0;try{const M=api.measures?api.measures():[];mesTot=M.length;mes=M.filter(m=>m&&((m.status&&m.status!=='none')||(m.cur!==null&&m.cur!==undefined))).length}catch(e){}
 const miss=[];if(qq<4)miss.push('QQOQCP : '+(4-qq)+' réponse(s) manquante(s) au moins');if(ox<3)miss.push('Est / N’est pas et changements : '+(3-ox)+' réponse(s) manquante(s) au moins');if(mesTot&&mes<Math.min(2,mesTot))miss.push('Mesures réelles non relevées (valeurs, pas consignes)');
 const out=s.concl?(miss.length?`<div class="vpp-or warn"><b>Données insuffisantes pour conclure.</b><ul>${miss.map(m=>`<li>${esc(m)}</li>`).join('')}</ul><p>Compléter, ou solliciter l’avis de l’expert procédé avant tout réglage. Un constat n’est pas une cause.</p></div>`:`<div class="vpp-or ok"><b>Vous pouvez lancer le premier contrôle</b> de la liste ci-dessous : il est le moins invasif et son test dit s’il faut aller plus loin. Une action à la fois.</div>`):'';
 box.innerHTML=`<button type="button" class="btn ghost sm" id="vpp-concl-btn">Puis-je conclure avec ce que j’ai ?</button> <span class="sl">${qq} réponse(s) QQOQCP · ${ox} réponse(s) Est / N’est pas${mesTot?' · '+mes+'/'+mesTot+' mesure(s)':''}</span>${out}`;}

/* ---------- rendu 4 et 5 : protocole d’essai, causes écartées ---------- */
function causesState(){return [...document.querySelectorAll('#res .cc')].map(el=>({name:el.dataset.name||(el.querySelector('.ch b')||{}).textContent||'',state:el.classList.contains('found')?'nc':el.classList.contains('done')?'ok':el.classList.contains('unver')?'nv':'open',ctl:((el.querySelector('p')||{}).textContent||'').replace(/^.*Contrôle :\s*/,'')}))}
function drawTrial(){const f=$('expert-followup');if(!f)return;let box=$('vpp-trial');const s=st();
 if(!box){box=document.createElement('div');box.id='vpp-trial';box.className='vpp';const first=f.querySelector('details.expert-panel');if(first)f.insertBefore(box,first);else f.append(box);
  box.innerHTML=`<p class="vpp-h"><b>Protocole d’essai : une variable, une série stabilisée, un critère écrit avant.</b> <span class="sl">C’est ce qui distingue un essai d’un bricolage, et ce que la qualité pourra relire.</span></p>
<div class="vpp-grid">
<label>Variable modifiée (une seule)<input data-vpp-t="var" maxlength="80" placeholder="Ex. : temps de maintien"></label>
<label>Valeur d’origine<input data-vpp-t="from" maxlength="30" placeholder="Ex. : 8,5 s"></label>
<label>Valeur d’essai (dans la plage validée)<input data-vpp-t="to" maxlength="30" placeholder="Ex. : 10 s"></label>
<label>Cycles d’attente avant mesure<input data-vpp-t="wait" maxlength="10" placeholder="Valeur du site, ex. : 10"></label>
<label>Pièces mesurées<input data-vpp-t="n" maxlength="10" placeholder="Ex. : 20"></label>
<label>Critère de succès, écrit avant l’essai<input data-vpp-t="crit" maxlength="120" placeholder="Ex. : 0 retassure sur 20 pièces, masse ± 0,2 g"></label>
<label>Effet secondaire à surveiller<input data-vpp-t="side" maxlength="120" placeholder="Ex. : bavure, cycle allongé, masse"></label>
</div><div class="expert-tools"><button type="button" id="vpp-trial-go">Rédiger le protocole dans le dossier</button><span class="sl" id="vpp-trial-st"></span></div>
<div id="vpp-elim"></div>`;}
 const C=causesState(),ok=C.filter(c=>c.state==='ok'),nv=C.filter(c=>c.state==='nv');
 const e=$('vpp-elim');if(e)e.innerHTML=`<p class="vpp-h"><b>Ce que la mémoire gardera aussi : les causes écartées.</b> <span class="sl">Dire pourquoi une piste a été éliminée évite de la refaire la prochaine fois.</span></p>${ok.length||nv.length?`<ul class="vpp-el">${ok.map(c=>`<li><b>Écartée</b> · ${esc(c.name)} · contrôle conforme : ${esc(c.ctl)}</li>`).join('')}${nv.map(c=>`<li><b>Non vérifiée</b> · ${esc(c.name)} · à reprendre si la cause retenue ne tient pas</li>`).join('')}</ul>`:'<p class="sl">Aucune cause écartée pour l’instant : les contrôles « conforme » de l’étape précédente apparaîtront ici.</p>'}
<label class="vpp-lvl">Niveau de preuve de la conclusion <select id="vpp-level"><option value="">Choisir…</option><option ${s.level==='recu'?'selected':''} value="recu">Reçu (déclaré par l’atelier)</option><option ${s.level==='conf'?'selected':''} value="conf">Interprétation à confirmer</option><option ${s.level==='exp'?'selected':''} value="exp">Vérifié avec l’expert</option><option ${s.level==='val'?'selected':''} value="val">Validé pour ce contexte (moule, matière, machine)</option></select></label><p class="vpp-note">Seul le niveau « validé pour ce contexte » devrait remonter en tête des enquêtes suivantes ; les autres restent des déclarations.</p>`;
 box.querySelectorAll('[data-vpp-t]').forEach(i=>{if(s.trial&&s.trial[i.dataset.vppT]!==undefined&&i.value==='')i.value=s.trial[i.dataset.vppT]});}
function setTextarea(group,field,txt){const ta=document.querySelector(`textarea[data-expert-group="${group}"][data-expert-field="${field}"]`);if(!ta)return false;ta.value=txt;ta.dispatchEvent(new Event('input',{bubbles:true}));return true}
function writeTrial(){const s=st(),t=s.trial||{};const miss=['var','from','to','crit'].filter(k=>!t[k]);const stEl=$('vpp-trial-st');if(miss.length){stEl.textContent='À compléter : variable, valeur d’origine, valeur d’essai et critère de succès.';return}
 const p=`Variable isolée : ${t.var}. Valeur d’origine ${t.from} → valeur d’essai ${t.to} (dans la plage validée du site). Aucun autre paramètre modifié. Attente de ${t.wait||'(cycles à définir par le site)'} cycles avant mesure, puis ${t.n||'(n)'} pièces repérées, mêmes conditions de contrôle qu’avant l’essai. Retour à ${t.from} si le critère n’est pas atteint.`;
 const a=`Critère écrit avant l’essai : ${t.crit}. Effet secondaire surveillé : ${t.side||'aucun déclaré'}. Décision à la fin de la série : poursuivre, ajuster ou revenir à l’origine.`;
 const ok1=setTextarea('trial','protocol',p),ok2=setTextarea('trial','acceptance',a);
 stEl.textContent=ok1&&ok2?'Protocole et critère écrits dans « Préparer l’essai pour revue » : ils partent avec le dossier.':'Champs du dossier introuvables sur cette page.';}
function writeLevel(){const s=st();const L={recu:'reçu (déclaré par l’atelier)',conf:'interprétation à confirmer',exp:'vérifié avec l’expert',val:'validé pour ce contexte'};const C=causesState(),ok=C.filter(c=>c.state==='ok');
 const txt=`Niveau de preuve : ${L[s.level]||'non renseigné'}. Causes écartées par contrôle conforme : ${ok.length?ok.map(c=>c.name).join(' ; '):'aucune'}.`;setTextarea('result','assessment',txt);}

/* ---------- rendu 7 : coût ---------- */
function drawCost(){const syn=$('expert-synthese');if(!syn)return;let box=$('vpp-cost');const c=costs[key()]||(costs[key()]={});
 if(!box){box=document.createElement('div');box.id='vpp-cost';box.className='vpp';const body=$('syn-body');syn.insertBefore(box,body);
  box.innerHTML=`<p class="vpp-h"><b>Ce que coûte ce défaut, par jour.</b> <span class="sl">Vos chiffres, vos hypothèses ; rien n’est présumé.</span></p><div class="vpp-grid c4"><label>Pièces rebutées par jour<input data-vpp-c="reb" inputmode="decimal" placeholder="Ex. : 240"></label><label>Prix d’une pièce (€)<input data-vpp-c="prix" inputmode="decimal" placeholder="Ex. : 3,80"></label><label>Heures perdues par jour (réglage, arrêt, tri)<input data-vpp-c="h" inputmode="decimal" placeholder="Ex. : 1,5"></label><label>Coût horaire de la presse (€)<input data-vpp-c="th" inputmode="decimal" placeholder="Ex. : 80"></label></div><p class="vpp-or" id="vpp-cost-out"></p>`;}
 const n=k=>{const v=String(c[k]||'').replace(',','.').replace(/[^0-9.]/g,'');const x=parseFloat(v);return isNaN(x)?null:x};
 const reb=n('reb'),prix=n('prix'),h=n('h'),th=n('th');const out=$('vpp-cost-out');
 const a=reb!==null&&prix!==null?reb*prix:null,b=h!==null&&th!==null?h*th:null;
 if(a===null&&b===null){out.innerHTML='<span class="sl">Saisissez au moins rebuts et prix pièce, ou heures et coût horaire.</span>';return}
 const tot=(a||0)+(b||0);const f=x=>x.toLocaleString('fr-FR',{maximumFractionDigits:0});
 out.innerHTML=`<b>Environ ${f(tot)} € par jour</b> (${a!==null?'rebuts '+f(a)+' €':''}${a!==null&&b!==null?' + ':''}${b!==null?'temps perdu '+f(b)+' €':''}), soit ${f(tot*20)} € par mois à 20 jours. Hypothèses : les vôtres, sans double compte avec VP Scan. À reprendre dans la synthèse pour la direction.`;}

/* ---------- orchestration ---------- */
function drawAll(){if(!api)return;try{drawTwins();drawOrient();drawConclude();decorateCards();drawTrial();drawCost()}catch(e){console.warn('vp-expert-plus',e)}}
function setDef(k){if(sector()==='TP'){const b=document.querySelector(`#defs button[data-def="${CSS.escape(k)}"]`);if(b){b.click();return}}api.S.def=k;api.render();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!api)return;
 if(b.dataset.vppTwin){setDef(b.dataset.vppTwin);window.scrollTo({top:$('s2').offsetTop-20,behavior:'smooth'});return}
 const o=b.closest('[data-vpp-k]');if(o){const k=o.dataset.vppK,s=st();s[k]=s[k]===b.dataset.v?undefined:b.dataset.v;drawOrient();drawConclude();decorateCards();return}
 if(b.id==='vpp-concl-btn'){st().concl=true;drawConclude();return}
 if(b.id==='vpp-trial-go'){writeTrial();return}});
document.addEventListener('change',e=>{const el=e.target;if(el.id==='vpp-apply'){st().apply=el.checked;api.render();return}if(el.id==='vpp-level'){st().level=el.value;writeLevel();return}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.vppT){const s=st();s.trial=s.trial||{};s.trial[el.dataset.vppT]=el.value;return}if(el.dataset&&el.dataset.vppC){(costs[key()]||(costs[key()]={}))[el.dataset.vppC]=el.value;drawCost()}});
window.addEventListener('vp:enquete-render',()=>{api=api||window.VPExpertAPI;drawAll()});
function boot(){api=window.VPExpertAPI;if(!api){setTimeout(boot,150);return}drawAll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
