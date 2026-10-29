(function(){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.vpFicheLitterature=function(nom){
  const B=window.VP_BIBLIO;
  const f=B&&B.fiches.find(x=>x.defaut===nom);
  if(!f)return '<p>La fiche documentaire est momentanément indisponible.</p>';
  const anchor=k=>{
   const s=B.sources[k];
   return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)}</a>`:'';
  };
  const complements=f.complements_documentaires||[];
  const keys=[...new Set([...f.sources,...complements.map(c=>c.source)])];
  const links=keys.map(k=>B.sources[k]).filter(Boolean);
  return `<article class="bib-fiche" data-bib-version="${esc(B.version)}">
   <p class="bib-label"><strong>Selon la littérature publiée</strong> · version ${esc(B.version)} · non validé par nos experts</p>
   ${B.diffusion==='apercu-public'?'<p class="bib-label bib-dev">Aperçu documentaire public · validation métier en attente</p>':''}
   ${f.symptome?`<section class="bib-symptome"><h3>Reconnaître le défaut</h3><p>${esc(f.symptome)}</p><p class="bib-label">Repère descriptif ; ne confirme pas la cause.</p></section>`:''}
   <p>${esc(f.lecture).replace(/\.$/,'')} (${f.sources.map(anchor).join(' ; ')}).</p>
   <p class="bib-label">${esc(f.statut)}.</p>
   <div class="bib-fields">
    <section><h3>Mesures et contrôles proposés</h3><ul>${f.mesures.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></section>
    <section><h3>Conditions d’interprétation</h3><p>${esc(f.condition)}</p></section>
    <section><h3>À ne pas conclure</h3><p>${esc(f.interdit)}</p></section>
    <section><h3>Vérification attendue</h3><p>${esc(f.preuve)}</p></section>
    ${(f.precautions_vp||[]).length?`<section class="bib-precaution"><h3>Précaution additionnelle</h3><p class="bib-label">Proposition VP à valider avec le site, non validée par nos experts.</p><ul>${f.precautions_vp.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section>`:''}
   </div>
   ${complements.map(c=>`<section class="bib-complement"><h3>Complément documentaire</h3><p>${esc(c.texte).replace(/\.$/,'')} (${anchor(c.source)}).</p><p><strong>Portée et limite :</strong> ${esc(c.limite)} (${anchor(c.source)}).</p></section>`).join('')}
   <details class="bib-sources"><summary>Références et passages utilisés</summary>
    <p>${esc(f.localisateur)}</p>
    ${complements.map(c=>`<p>${anchor(c.source)} : ${esc(c.localisateur)}</p>`).join('')}
    <ul>${links.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)}</a><br>${esc(s.type)}<span class="bib-url">${esc(s.url)}</span></li>`).join('')}</ul>
   </details>
  </article>`;
 };
})();
