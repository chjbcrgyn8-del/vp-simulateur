(function(){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.vpFicheLitterature=function(nom){
  const B=window.VP_BIBLIO;
  const f=B&&B.fiches.find(x=>x.defaut===nom);
  if(!f)return '<p>La fiche documentaire est momentanément indisponible.</p>';
  const links=f.sources.map(k=>B.sources[k]).filter(Boolean);
  const anchors=links.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)}</a>`).join(' ; ');
  return `<article class="bib-fiche" data-bib-version="${esc(B.version)}">
   <p class="bib-label"><strong>Selon la littérature publiée</strong> · version ${esc(B.version)} · non validé par nos experts</p>
   <p>${esc(f.lecture).replace(/\.$/,'')} (${anchors}).</p>
   <p class="bib-label">${esc(f.statut)}.</p>
   <div class="bib-fields">
    <section><h3>Mesures et contrôles proposés</h3><ul>${f.mesures.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></section>
    <section><h3>Conditions d’interprétation</h3><p>${esc(f.condition)}</p></section>
    <section><h3>À ne pas conclure</h3><p>${esc(f.interdit)}</p></section>
    <section><h3>Vérification attendue</h3><p>${esc(f.preuve)}</p></section>
   </div>
   <details class="bib-sources"><summary>Références et passages utilisés</summary>
    <p>${esc(f.localisateur)}</p>
    <ul>${links.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.nom)}</a><br>${esc(s.type)}<span class="bib-url">${esc(s.url)}</span></li>`).join('')}</ul>
   </details>
  </article>`;
 };
})();
