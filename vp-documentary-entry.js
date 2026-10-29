(()=>{
 if(document.getElementById('vp-documentary-entry'))return;
 const main=document.querySelector('main');if(!main)return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='vp-documentary-entry.css?v=20261029-r2';document.head.append(css);
 const bar=document.createElement('aside');bar.id='vp-documentary-entry';bar.setAttribute('aria-label','Dossiers documentaires et cas fictif');
 bar.innerHTML='<div><strong>Enquêter, comparer, documenter</strong><span>Démonstrations non opérationnelles, aucune action approuvée.</span></div><nav aria-label="Parcours documentaires"><a data-keep class="vp-doc-primary" href="decolletage.html?example=wear-thermal">Cas complet : usure ou thermique</a><a data-keep href="decolletage.html">Six dossiers décolletage</a><a data-keep href="expertise-documentaire.html">Caoutchouc / plastique</a><a data-keep href="lot3-documentaire.html">Bibliothèque documentaire</a></nav>';
 main.before(bar);
 const map={'01-MR':'CA-01','02-MG':'CA-02','03-bulles':'CA-03','Bavure':'TP-01','Incomplet':'TP-02','Retassure':'TP-03'};
 const path=location.pathname.split('/').pop();
 if(!['enquete.html','enquete-caoutchouc.html'].includes(path))return;
 const slot=document.createElement('section');slot.className='vp-doc-entry';
 function update(){const active=document.querySelector('[data-def][aria-pressed="true"]'),id=map[active?.dataset.def];
 slot.innerHTML=id?`<strong>Fiche documentaire ${id}</strong><p>Préparer les contrôles et la revue métier. Aucun classement ni constat historique n’est transféré automatiquement.</p><a data-keep href="expertise-documentaire.html?defect=${id}">Ouvrir la fiche documentaire de ce défaut</a>`:'<strong>Périmètre documentaire</strong><p>Ce défaut ne fait pas partie des six fiches de ce lot.</p><a data-keep href="expertise-documentaire.html">Consulter les six fiches documentaires</a>'}
 main.prepend(slot);update();
 const defs=document.getElementById('defs');if(defs)new MutationObserver(update).observe(defs,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});
})();
