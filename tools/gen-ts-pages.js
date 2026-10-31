/* Génère les pages documentaires traitement de surface à partir de traitement-surface-data.js.
   Usage : node tools/gen-ts-pages.js (depuis la racine du dépôt). */
const fs=require('fs');global.window={};require('../traitement-surface-data.js');
const V=window.VPTS,S=Object.fromEntries(V.sources.map(s=>[s.id,s]));
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const L=(id,txt)=>`<a href="${esc(S[id].url)}" target="_blank" rel="noopener noreferrer">${esc(txt||S[id].title.split(' · ')[0])}</a>`;
const fr=(x,d=2)=>x.toLocaleString('fr-FR',{maximumFractionDigits:d});
function shell(file,title,desc,crumb,eyebrow,h1,lead,body,extraScript=''){
fs.writeFileSync(file,`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Vella Partners</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0a1320">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Vella Partners">
<meta property="og:title" content="${esc(title)} · Vella Partners">
<meta property="og:description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="st.css">
<link rel="stylesheet" href="premium.css?v=9">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="signature.css?v=2">
<link rel="stylesheet" href="industrie.css?v=5">
<link rel="stylesheet" href="decolletage.css?v=4">
<link rel="stylesheet" href="traitement-surface.css?v=2">
<link rel="stylesheet" href="ux.css?v=20261029-dec">
<link rel="icon" type="image/png" href="img/favicon.png">
</head>
<body class="stp">
<a class="skip" href="#main">Aller au contenu</a>
<header class="top">
  <a class="brand" href="index.html" aria-label="Vella Partners, accueil"><img src="img/logo-vella-partners.png" alt="Vella Partners" width="517" height="150"></a>
  <nav class="tabs menu" aria-label="Menu"><a href="index.html">Accueil</a><a href="index.html#offres">Nos offres</a><a href="index.html#essayer">Essayer</a><a href="savoir.html" aria-current="page">Savoir technique</a></nav>
</header>
<main id="main" class="st"><p class="crumb"><a href="savoir.html">Savoir technique</a> › ${esc(crumb)}</p>
<header class="ds-hero"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(h1)}</h1><p class="ds-lead">${lead}</p></header>
<nav class="tslines" aria-label="Pages traitement de surface"><span>Traitement de surface :</span><a href="machine-traitement-surface.html">Simulateur de ligne</a><a href="enquete-traitement-surface.html">Enquête défaut</a><a href="st-reperes-traitement-surface.html"${file.includes('reperes')?' aria-current="page"':''}>Repères et cycles</a><a href="st-mesures-traitement-surface.html"${file.includes('mesures')?' aria-current="page"':''}>Mesures d’une ligne</a><a href="sources-traitement-surface.html"${file.includes('sources')?' aria-current="page"':''}>Règles et sources</a></nav>
<div class="tsdoc">
${body}
</div>
</main>
<script src="tips.js"></script>
<script src="typo.js"></script>
<script src="ux.js?v=20261029-ux"></script>
${extraScript}
</body>
</html>
`);}

/* ---------- graphiques SVG ---------- */
function chart({w=620,h=300,xs,ys,xlab,ylab,series,band,logy=false,xt,yt}){
 const m={l:52,r:16,t:16,b:44},W=w-m.l-m.r,H=h-m.t-m.b;
 const fy=v=>logy?Math.log10(v):v;
 const X=v=>m.l+(v-xs[0])/(xs[1]-xs[0])*W,Y=v=>m.t+H-(fy(v)-fy(ys[0]))/(fy(ys[1])-fy(ys[0]))*H;
 let g='';
 if(band)g+=`<rect x="${m.l}" y="${Y(band[1])}" width="${W}" height="${Y(band[0])-Y(band[1])}" fill="#e8f4ef"/><text class="ax" x="${m.l+W-4}" y="${Y(band[0])-6}" text-anchor="end">${esc(band[2])}</text>`;
 for(const v of yt)g+=`<line class="gl" x1="${m.l}" x2="${m.l+W}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${m.l-6}" y="${Y(v)+4}" text-anchor="end">${fr(v)}</text>`;
 for(const v of xt)g+=`<text class="ax" x="${X(v)}" y="${m.t+H+16}" text-anchor="middle">${fr(v)}</text>`;
 g+=`<line x1="${m.l}" x2="${m.l+W}" y1="${m.t+H}" y2="${m.t+H}" stroke="#9aa3ad"/><line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${m.t+H}" stroke="#9aa3ad"/>`;
 g+=`<text class="ax" x="${m.l+W/2}" y="${h-6}" text-anchor="middle">${esc(xlab)}</text><text class="ax" transform="translate(13 ${m.t+H/2}) rotate(-90)" text-anchor="middle">${esc(ylab)}</text>`;
 series.forEach((s,i)=>{g+=`<polyline class="ln" stroke="${s.c}" points="${s.p.map(([x,y])=>X(x)+','+Y(y)).join(' ')}"/>`+s.p.map(([x,y])=>`<circle class="pt" cx="${X(x)}" cy="${Y(y)}" r="4" fill="${s.c}"><title>${fr(x)} ; ${fr(y)}</title></circle>`).join('');
  g+=`<rect x="${m.l+10}" y="${m.t+6+i*17}" width="12" height="3" fill="${s.c}"/><text class="lb" x="${m.l+28}" y="${m.t+11+i*17}" fill="#1d2433">${esc(s.n)}</text>`;});
 return `<svg class="tsch" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(ylab+' selon '+xlab)}">${g}</svg>`;}
const ASF=9.2903;
const cdA=[2,8,20,40,80].map(x=>x/ASF);
const niChart=chart({xs:[0,9],ys:[11.5,16],xlab:'Densité de courant (A/dm², converti depuis A/ft²)',ylab:'Nickel dans le dépôt (%)',xt:[0,1,2,3,4,5,6,7,8,9],yt:[12,13,14,15,16],band:[12,15,'Cible 12–15 % citée'],
 series:[{n:'Soude 75 g/L',c:'#173a6b',p:cdA.map((x,i)=>[x,[12.38,12.89,13.63,14.51,15.09][i]])},{n:'Soude 110 g/L',c:'#e0752d',p:cdA.map((x,i)=>[x,[12.09,12.59,13.27,14.49,15.23][i]])},{n:'Soude 150 g/L',c:'#0f5e46',p:cdA.map((x,i)=>[x,[12.26,12.89,13.61,14.62,15.29][i]])}]});
const carbChart=chart({xs:[0,9],ys:[11.5,17],xlab:'Densité de courant (A/dm², converti depuis A/ft²)',ylab:'Nickel dans le dépôt (%)',xt:[0,1,2,3,4,5,6,7,8,9],yt:[12,13,14,15,16,17],band:[12,15,'Cible 12–15 % citée'],
 series:[{n:'Carbonate 0 g/L',c:'#173a6b',p:cdA.map((x,i)=>[x,[11.92,12.37,13.26,14.16,15.06][i]])},{n:'Carbonate 22 g/L',c:'#e0752d',p:cdA.map((x,i)=>[x,[12.7,13.25,13.8,14.48,15.24][i]])},{n:'Carbonate 67 g/L',c:'#8a1c1c',p:cdA.map((x,i)=>[x,[12.9,14.25,15.14,15.99,16.81][i]])}]});
const enChart=chart({xs:[45,100],ys:[0.5,20],logy:true,xlab:'Température du bain (°C)',ylab:'Vitesse de dépôt (µm/h, échelle log)',xt:[50,60,70,80,90,100],yt:[0.5,1,2,5,10,20],
 series:[{n:'Bain de Brenner, mesures NBS 1974',c:'#173a6b',p:[[50,.71],[60,1.45],[70,2.85],[80,5.3],[95,15.7]]}]});

/* ---------- Repères ---------- */
const reperes=`
<div class="note"><b>Statut.</b> Recherche documentaire Vella Partners du 31 octobre 2026 (registre ${esc(V.version)}, ${V.sources.length} sources TS-S01 à TS-S${V.sources.length}), non relue par un expert traitement de surface. Chaque valeur est rattachée à sa source et à ses conditions. Aucune n’est une consigne de bain, de courant ou de temps : la fiche du fournisseur du bain et la gamme du site priment.</div>

<h2>La filière en chiffres publiés</h2>
<div class="grid2">
<div class="card"><h3>France</h3><p>Plus de 2 400 entreprises enregistrées en « traitement et revêtement de matériaux » en 2021, près de 24 000 salariés (${L('TS-S52','INRS, Travail & Sécurité n° 865, décembre 2024')}).</p><p>Pour la seule sous-traitance : environ 300 entreprises de plus de 20 personnes, plus de 1 000 de moins de 20, 21 000 salariés et 3 milliards d’euros de chiffre d’affaires selon l’${L('TS-S53','UITS')}.</p></div>
<div class="card"><h3>Allemagne</h3><p>973 établissements de plus de 20 salariés, 62 000 salariés et environ 8,6 milliards d’euros de chiffre d’affaires en 2018 (catégorie 25.61), selon le ${L('TS-S56','ZVO')}, qui estime l’emploi européen à environ 440 000 personnes et attribue au zinc et à ses alliages environ 40 % de la valeur des revêtements électrolytiques.</p><p class="src">Les périmètres diffèrent (codes d’activité, seuils d’effectif) : ces chiffres ne s’additionnent pas et ne se comparent qu’en ordre de grandeur.</p></div>
</div>

<h2>Zinc-nickel : le taux de nickel suit la densité de courant</h2>
<p>Le taux de nickel du dépôt augmente avec la densité de courant locale : une arête (forte densité) et un creux (faible densité) n’ont pas la même composition. Les essais publiés par ${L('TS-S03','Columbia Chemical')} donnent, pour trois teneurs en soude, une progression d’environ 12,1–12,4 % à 0,2 A/dm² jusqu’à 15,1–15,3 % à 8,6 A/dm².</p>
${niChart}
<p class="src">Données : ${L('TS-S03','Columbia Chemical, The Art of Zinc Nickel, tableau 3')} (2 à 80 A/ft², converties à raison de 1 A/dm² = 9,29 A/ft² ; soude exprimée en g/L à partir des mg/L publiés). Bain propriétaire du fournisseur : la pente vaut pour ce bain, pas pour tous.</p>
<p>Le carbonate qui s’accumule déplace aussi la composition : à 67 g/L de carbonate, le même fournisseur mesure 16,8 % de nickel à 8,6 A/dm², hors de la cible 12–15 %. C’est l’une des raisons du suivi des carbonates (règle TS02-R03) et de l’intérêt des anodes à membrane décrit par ${L('TS-S06','Products Finishing')}.</p>
${carbChart}
<p class="src">Données : ${L('TS-S03','Columbia Chemical, tableau 5')}. Le même document indique qu’un bain sous 500 ppm de nickel ne peut pas atteindre 12–15 % en masse, et qu’un maintien vers 850 mg/L de nickel permet la cible entre 20 et 60 A/ft².</p>

<h2>Une ligne ZnNi instrumentée : ce qu’une étude a mesuré</h2>
<p>L’étude ${L('TS-S01','Lindner, Duckstein et Herrmann (TU Braunschweig, Fraunhofer IST)')} est la référence la plus proche d’un projet VP Predict : 186 essais de laboratoire, 151 charges suivies sur une ligne industrielle au tonneau, mesure XRF environ toutes les 15 minutes.</p>
<div class="tw"><table><thead><tr><th>Grandeur</th><th>Plage ou valeur publiée</th><th>Ce que cela n’est pas</th></tr></thead><tbody>
<tr><td>Zinc du bain</td><td>6,5 à 8,5 g/L</td><td>Une consigne universelle : chaque fournisseur fixe sa fenêtre</td></tr>
<tr><td>Nickel du bain</td><td>0,9 à 1,2 g/L</td><td>Idem</td></tr>
<tr><td>Épaisseur visée</td><td>8 à 12 µm</td><td>La classe client (voir ISO 19598, GMW4700)</td></tr>
<tr><td>Nickel du dépôt</td><td>12 à 16 %</td><td>Une garantie de tenue en corrosion</td></tr>
<tr><td>Point de fonctionnement retenu</td><td>0,8 A/dm², 30 °C, 65 à 80 min de dépôt</td><td>Un réglage transférable à une autre ligne</td></tr>
<tr><td>Transfert laboratoire vers usine</td><td>R² épaisseur 61 % → 74 %, R² nickel 35 % → 74 % après recalage sur données d’usine</td><td>Une performance garantie : les données de l’étude ne sont pas partageables</td></tr>
</tbody></table></div>
<p class="src">Source : ${L('TS-S01','Plating & Surface Finishing, 2026')}. Les simulateurs Vella Partners reprennent ces ordres de grandeur pour la ligne zinc-nickel simulée ; ce sont des données simulées, pas des données de cette ligne.</p>

<h2>Nickel chimique : la température domine la vitesse</h2>
<p>Les mesures du ${L('TS-S41','NBS (aujourd’hui NIST), Ogburn et Johnson, 1974')} sur un bain de Brenner montrent une vitesse de 0,71 µm/h à 50 °C et de 15,7 µm/h à 95 °C, cohérente avec la règle « ×2 par 10 °C » citée dans le rapport. Le même document indique qu’une baisse de nickel, d’hypophosphite, de pH ou de température réduit la vitesse, et qu’un pH plus bas donne plus de phosphore (10,1 % contre 8,7 % dans ses deux essais).</p>
${enChart}
<p class="src">Données : ${L('TS-S41','NBS, Effects of electroless nickel process variables on quality requirements, 1974')}. Bain historique : les bains commerciaux actuels sont plus rapides et stabilisés ; la tendance reste, pas les valeurs.</p>

<h2>Anodisation : limites du label Qualanod</h2>
<div class="tw"><table><thead><tr><th>Exigence</th><th>Valeur publiée</th><th>Section</th></tr></thead><tbody>
<tr><td>Classes d’épaisseur (moyenne / locale minimale)</td><td>AA5 5/4 µm · AA10 10/8 · AA15 15/12 · AA20 20/16 · AA25 25/20</td><td>§12.4.4, §14.4.4</td></tr>
<tr><td>Acide sulfurique libre</td><td>200 g/L au plus, ±10 g/L autour de la valeur choisie</td><td>§11.6.3</td></tr>
<tr><td>Aluminium dissous</td><td>20 g/L au plus, de préférence 5 à 15 g/L</td><td>§11.6.3</td></tr>
<tr><td>Température du bain</td><td>Maîtrise à ±1,5 °C ; maximum 21 °C (AA5, AA10) ou 20 °C (AA15 à AA25)</td><td>§11.6.3</td></tr>
<tr><td>Densité de courant moyenne</td><td>1,2–2,0 A/dm² (AA5, AA10) · 1,4–2,0 (AA15) · 1,5–2,0 (AA20) · 1,5–3,0 (AA25)</td><td>§11.6.3</td></tr>
<tr><td>Colmatage à l’eau chaude</td><td>96 °C minimum, mesurés 10 min après immersion ; eau déminéralisée pH 5,8–6,2 ; au moins 2 min par µm</td><td>§11.6.5.2, §12.8.6</td></tr>
<tr><td>Admittance corrigée</td><td>20 µS au plus, sinon perte de masse ou recolmatage</td><td>§12.7.4.3</td></tr>
<tr><td>Tache de colorant / perte de masse</td><td>Note 2 au plus / 30 mg/dm² au plus</td><td>§12.7.4</td></tr>
</tbody></table></div>
<p class="src">Source : ${L('TS-S34','Qualanod, spécifications au 1er janvier 2026')}. Ce sont les exigences d’un label pour l’anodisation architecturale et décorative ; elles ne s’appliquent pas telles quelles à l’anodisation dure.</p>

<h2>Calculateur de cycle</h2>
<p>Trois calculs d’ordre de grandeur pour discuter un temps de cycle avec un industriel. Ils ne remplacent ni une mesure, ni la fiche du fournisseur.</p>
<div class="card" id="calc">
<div class="filters" role="group" aria-label="Procédé"><button type="button" data-m="znni" aria-pressed="true">Zinc-nickel (Faraday)</button><button type="button" data-m="anod" aria-pressed="false">Anodisation (règle 312)</button><button type="button" data-m="en" aria-pressed="false">Nickel chimique</button></div>
<div class="calc" id="cin"></div>
<p class="out" id="cout" aria-live="polite"></p>
<p class="src" id="cnote"></p>
</div>

<h2>Normes et spécifications citées</h2>
<div class="tw"><table><thead><tr><th>Référence</th><th>Objet</th></tr></thead><tbody>
${['TS-S21','TS-S22','TS-S23','TS-S24','TS-S25','TS-S27','TS-S28','TS-S29','TS-S30','TS-S31','TS-S32','TS-S33','TS-S35','TS-S60','TS-S61'].map(id=>{let [a,...b]=S[id].title.split(' · ');if(id==='TS-S27'){a='VDA 233-102';b=['Essai de corrosion cyclique (méthode décrite par Ascott Analytical)']}return `<tr><td>${L(id,a)}</td><td>${esc(b.join(' · ')||S[id].scope)}</td></tr>`}).join('\n')}
</tbody></table></div>
<p class="src">Les liens renvoient vers la notice officielle ou un extrait public. GMW4700 est une copie publique non officielle : à remplacer par la version client lors d’une mission.</p>

<h2>Ce qui n’est pas repris</h2>
<ul><li><b>Quantités d’ajout</b> : elles dépendent du bain propriétaire et restent dans la fiche du fournisseur.</li><li><b>Réglages de redresseur et temps de passivation</b> : propres à chaque ligne et à chaque client.</li><li><b>Fréquences de défauts</b> : aucune source publique ne donne une répartition industrielle fiable ; les classements de l’enquête sont illustratifs.</li></ul>
<p><a class="btn primary" href="machine-traitement-surface.html">Ouvrir le simulateur de ligne</a> <a class="btn" href="enquete-traitement-surface.html">Enquête défaut</a> <a class="btn" href="sources-traitement-surface.html">Règles et sources</a></p>`;
const calcJS=`<script>
(()=>{const M={
znni:{f:[['cd','Densité de courant moyenne (A/dm²)',0.8,0.1],['e','Épaisseur visée (µm)',10,0.5],['eta','Rendement cathodique (%)',60,1]],
 run:v=>{const r=0.278*v.cd*v.eta/100;return [r>0?'Temps de dépôt estimé : '+(v.e/r).toFixed(0)+' min':'—','Vitesse : '+r.toFixed(2).replace('.',',')+' µm/min. Hypothèse VP : alliage à 14 % de nickel, masse volumique 7,2 g/cm³, soit environ 0,278 µm/min par A/dm² à 100 % de rendement (loi de Faraday). Contrôle : 0,8 A/dm², 75 min et 10 µm correspondent à un rendement d’environ 60 %. Le rendement réel est à mesurer sur la ligne (ampères-heures et XRF).']}},
anod:{f:[['cd','Densité de courant (A/dm²)',1.6,0.1],['e','Épaisseur visée (µm)',17.5,0.5],['col','Colmatage (min par µm, 0 si aucun)',2,0.5]],
 run:v=>{const t=v.e*3.12/v.cd;return [v.cd>0?'Anodisation : '+t.toFixed(0)+' min'+(v.col?' · colmatage : '+(v.col*v.e).toFixed(0)+' min':''):'—','Règle publiée par Products Finishing : minutes = µm × 3,12 / (A/dm²), pour 12–20 % d’acide sulfurique, 4–27 °C, 2–20 g/L d’aluminium ; les alliages de la série 2000 peuvent s’en écarter. Colmatage : au moins 2 min par µm selon Qualanod.']}},
en:{f:[['r0','Vitesse mesurée à la température de référence (µm/h)',15,0.5],['t0','Température de référence (°C)',88,1],['t','Température réelle (°C)',85,1],['e','Épaisseur visée (µm)',25,1]],
 run:v=>{const r=v.r0*Math.pow(2,(v.t-v.t0)/10);return [r>0?'Vitesse estimée : '+r.toFixed(1)+' µm/h · temps : '+(60*v.e/r).toFixed(0)+' min':'—','Extrapolation par la règle « ×2 par 10 °C » citée par le NBS (1974). À n’utiliser que près de la température de référence ; la vitesse dépend aussi du pH, du nickel, du réducteur et de l’âge du bain.']}}};
let m='znni';const $=id=>document.getElementById(id);
function draw(){$('cin').innerHTML=M[m].f.map(([k,l,d,s])=>'<label>'+l+'<input type="number" step="'+s+'" value="'+d+'" data-k="'+k+'"></label>').join('');run();}
function run(){const v={};document.querySelectorAll('#cin input').forEach(i=>v[i.dataset.k]=parseFloat(i.value)||0);const [o,n]=M[m].run(v);$('cout').textContent=o.replace(/(\d)\.(\d)/g,'$1,$2');$('cnote').textContent=n;}
document.querySelectorAll('#calc [data-m]').forEach(b=>b.onclick=()=>{m=b.dataset.m;document.querySelectorAll('#calc [data-m]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();});
$('cin').addEventListener('input',run);draw();})();
</script>`;
shell('st-reperes-traitement-surface.html','Repères traitement de surface · Savoir technique','Données publiées sur le zinc-nickel, le nickel chimique et l’anodisation, limites Qualanod, normes et calculateur de cycle. Références de contexte, jamais des consignes.','Repères traitement de surface','TRAITEMENT DE SURFACE · REPÈRES PUBLIÉS','Des chiffres publiés, et leurs conditions.','Taux de nickel selon la densité de courant, vitesse du nickel chimique selon la température, limites du label Qualanod, ligne zinc-nickel instrumentée et calculateur de cycle. Chaque valeur est sourcée ; aucune n’est une consigne à recopier.',reperes,calcJS);

/* ---------- Mesures ---------- */
const rows=[
['Redresseur','Courant, tension, ampères-heures cumulés','En continu (automate ou redresseur communicant)','pub','sim','Le compteur d’ampères-heures sert au dosage des additifs ; l’étalonnage de l’ampèremètre se vérifie périodiquement',L('TS-S51','Plating Club')],
['Redresseur','Ondulation résiduelle','Rarement enregistrée','pub','no','Utile pour expliquer certains aspects, mais peu de lignes l’exposent',L('TS-S51','Plating Club')],
['Bain','Température','En continu, sonde de régulation','pub','sim','Une sonde unique ne voit pas les écarts près des pièces (Qualanod : 2 °C au plus près des pièces en anodisation)',L('TS-S34','Qualanod')],
['Bain','pH, conductivité','En continu sur certaines lignes, sinon relevé manuel','pub','sim','Électrode à étalonner ; la valeur dépend de la température de mesure',L('TS-S40','Products Finishing')],
['Bain','Zinc, nickel, soude, carbonates','Titrage ou spectrométrie au laboratoire, 1 à quelques fois par poste','pub','sim','Donnée discontinue : une dérive entre deux analyses n’est pas vue',L('TS-S01','Lindner et al.')],
['Bain','Additifs et brillanteurs','Cellule de Hull, analyse fournisseur','pub','no','Lecture d’éprouvette : à photographier et tracer pour devenir exploitable',L('TS-S08','Products Finishing')],
['Pièces','Épaisseur et nickel du dépôt','XRF de laboratoire ou en ligne ; environ toutes les 15 min dans l’étude de référence','pub','sim','La mesure dépend de la zone, de l’étalon et du collimateur',L('TS-S31','ISO 3497')],
['Pièces','Épaisseur d’anodisation','Courants de Foucault','pub','sim','Sensible à la géométrie et au substrat',L('TS-S32','ISO 2360')],
['Pièces','Qualité de colmatage','Admittance, tache de colorant, perte de masse','pub','sim','Admittance limitée à 20 µS ; non applicable à certains colorés foncés',L('TS-S34','Qualanod')],
['Produit','Tenue au brouillard salin','Essai de laboratoire, 240 à 720 h ou plus','pub','no','Résultat très tardif : un indicateur de fin de chaîne, pas un signal de pilotage',L('TS-S25','ISO 9227')],
['Traçabilité','Charge, tonneau ou barre, temps, ordre de fabrication','Automate de ligne ou papier','pub','sim','Sans lien charge–analyse–mesure, aucune corrélation n’est possible',L('TS-S01','Lindner et al.')]];
const tag={sim:'<span class="tag sim">simulé</span>',pub:'<span class="tag pub">publié</span>',no:'<span class="tag no">non simulé</span>'};
const mesures=`
<div class="note"><b>Ce que cette page distingue.</b> « Publié » : la grandeur et sa méthode sont décrites dans une source. « Simulé » : le simulateur Vella Partners la génère. « Non simulé » : elle existe en usine mais n’est pas reproduite. Aucune donnée réelle de ligne n’est utilisée sur ce site.</div>
<h2>Ce qu’une ligne expose, et à quel rythme</h2>
<div class="tw"><table><thead><tr><th>Origine</th><th>Grandeur</th><th>Fréquence habituelle</th><th>Statut</th><th>Limite</th><th>Source</th></tr></thead><tbody>
${rows.map(r=>`<tr><td>${r[0]}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${tag[r[3]]}${tag[r[4]]}</td><td>${esc(r[5])}</td><td>${r[6]}</td></tr>`).join('\n')}
</tbody></table></div>
<h2>Données ouvertes : état des lieux</h2>
<div class="grid2">
<div class="card"><h3>Pas de jeu de données industriel public</h3><p>La recherche documentaire n’a trouvé aucun jeu de données de ligne de traitement de surface publié avec les analyses de bain, le courant et les mesures de dépôt reliés par charge. L’étude ${L('TS-S01','Lindner et al.')} précise que ses données ne sont pas partageables.</p></div>
<div class="card"><h3>Un jumeau numérique synthétique</h3><p>Le dépôt ${L('TS-S62','Anodising Digital Twin')} sur GitHub génère des données d’anodisation synthétiques. Utile pour tester un code, pas pour démontrer une performance.</p></div>
<div class="card"><h3>Des modèles publiés</h3><p>Prédiction de l’épaisseur et du taux de nickel par apprentissage automatique (${L('TS-S17','Transactions of the IMF')}), modélisation prédictive de procédés sans chrome hexavalent (${L('TS-S18','Leuze Verlag')}), simulation de la répartition d’épaisseur (${L('TS-S19','Ahmadkhaniha et al.')}).</p></div>
<div class="card"><h3>Conséquence pour un pilote</h3><p>Le premier livrable d’un pilote VP Predict est la jonction charge – analyse de bain – courant – mesure de dépôt sur l’historique du site. Sans elle, le simulateur reste une démonstration.</p></div>
</div>
<h2>Ce que fait le simulateur</h2>
<ul><li>Ligne zinc-nickel au tonneau : épaisseur et nickel du dépôt mesurés par XRF, zinc et nickel du bain, température, rendement cathodique.</li><li>Ligne d’anodisation : épaisseur, acide libre, aluminium dissous, température, densité de courant, admittance de colmatage.</li><li>Ligne de nickel chimique : vitesse de dépôt, pH, température et nickel du bain, utilisés par l’enquête défaut.</li></ul>
<p class="src">Valeurs centrales et tolérances : ordres de grandeur tirés des sources de la page Repères ; bruit et dérives inventés pour la démonstration.</p>
<p><a class="btn primary" href="machine-traitement-surface.html">Ouvrir le simulateur de ligne</a> <a class="btn" href="st-reperes-traitement-surface.html">Repères et cycles</a></p>`;
shell('st-mesures-traitement-surface.html','Mesures d’une ligne de traitement de surface · Savoir technique','Ce qu’une ligne de traitement de surface expose : redresseur, bain, laboratoire, XRF, traçabilité. Grandeurs publiées, simulées ou non simulées, et état des données ouvertes.','Mesures d’une ligne de traitement de surface','TRAITEMENT DE SURFACE · DONNÉES DE LIGNE','Ce que la ligne mesure, et ce qu’elle ne voit pas.','Redresseur, sondes, laboratoire, XRF et traçabilité des charges : fréquence, limites et statut dans le simulateur. Aucun jeu de données industriel public n’a été trouvé.',mesures);

/* ---------- Sources ---------- */
const cat=t=>{const a=t.split(' · ')[0];
 if(/^(Norme|Spécification|Référentiel)/.test(a))return 'Normes et spécifications';
 if(/scientifique|Thèse|Étude expérimentale/.test(a))return 'Publications scientifiques';
 if(/Organisme|Organisation|branche|Presse|réglementaire|Agence|^Étude$/.test(a))return 'Filière et réglementation';
 if(/Code/.test(a))return 'Code et données';
 return 'Guides et articles techniques';};
const rulesH=Object.entries(V.families).map(([f,n])=>`<h3>${f} · ${esc(n)}</h3>`+V.rules.filter(r=>r.id.startsWith(f)).map(r=>`<div class="card" id="${r.id}"><h3>${r.id} · ${esc(r.title)}${r.blocked?' <span class="tag no">bloquée</span>':' <span class="tag">candidate</span>'}</h3>
<p><b>Hypothèse.</b> ${esc(r.hypothesis)}</p><p><b>Contrôle.</b> ${esc(r.check)}</p><p><b>Proposition.</b> ${esc(r.proposal)}</p><p><b>Prudence.</b> ${esc(r.caution)}</p><p><b>Preuve de clôture.</b> ${esc(r.proof)}</p>
<p class="src">Sources : ${r.sources.map(id=>L(id,id)).join(', ')}</p></div>`).join('')).join('\n');
const cats=[...new Set(V.sources.map(s=>cat(s.type)))];
const srcH=`<div class="filters" role="group" aria-label="Filtrer par type"><button type="button" data-c="" aria-pressed="true">Toutes (${V.sources.length})</button>${cats.map(c=>`<button type="button" data-c="${esc(c)}" aria-pressed="false">${esc(c)} (${V.sources.filter(s=>cat(s.type)===c).length})</button>`).join('')}</div>
<ol class="srcl">${V.sources.map(s=>`<li data-c="${esc(cat(s.type))}" id="${s.id}"><b>${s.id}</b> · ${L(s.id,s.title)}<small>${esc(s.type)} · Domaine : ${esc(s.scope)} · Limite : ${esc(s.limit)}</small></li>`).join('\n')}</ol>`;
const blocked=V.rules.filter(r=>r.blocked).map(r=>r.id).join(', ');
const sources=`
<div class="note"><b>Statut.</b> ${V.rules.length} règles candidates, rédigées par Vella Partners à partir de ${V.sources.length} sources (registre ${esc(V.version)}). Aucune n’est validée par un expert traitement de surface. ${blocked?`Règle bloquée tant qu’une source primaire n’est pas obtenue : ${blocked}.`:''} Une règle candidate oriente un contrôle ; elle ne prouve pas une cause et ne remplace ni la fiche du fournisseur, ni la gamme du site.</div>
<h2>Règles candidates par famille</h2>
${rulesH}
<h2>Registre des sources</h2>
<p>Normes, fournisseurs de bains, publications scientifiques et retours d’expérience d’Europe, d’Amérique du Nord et d’Asie. Pour chaque source : le type, le domaine couvert et la limite d’usage.</p>
${srcH}`;
const srcJS=`<script>document.querySelectorAll('.filters [data-c]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters [data-c]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('ol.srcl li').forEach(li=>li.hidden=!!b.dataset.c&&li.dataset.c!==b.dataset.c)});</script>`;
shell('sources-traitement-surface.html','Règles candidates et sources traitement de surface · Savoir technique',`${V.rules.length} règles candidates et ${V.sources.length} sources mondiales sur le zinc-nickel, l’anodisation, le nickel chimique, la passivation et la fragilisation par l’hydrogène.`,'Règles et sources traitement de surface','TRAITEMENT DE SURFACE · REGISTRE DOCUMENTAIRE','Chaque contrôle renvoie à ses sources.',`${V.rules.length} règles candidates en 7 familles, ${V.sources.length} sources avec leur domaine et leurs limites. Recherche documentaire non validée, à relire par un expert traitement de surface.`,sources,srcJS);
console.log('ok',V.rules.length,V.sources.length,cats);
