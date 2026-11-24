/* DEV: a single Expert entry, not another documentary product. */
(()=>{
 const path=location.pathname.split('/').pop();
 if(!path||path==='index.html'||path.startsWith('enquete'))return;
 const main=document.querySelector('main');if(!main)return;
 const page=path.includes('caoutchouc')?'enquete-caoutchouc.html':path.includes('decolletage')?'enquete-decolletage.html':path.includes('traitement-surface')?'enquete-traitement-surface.html':'enquete.html';
 const p=document.createElement('p');p.className='sl vp-xlink';
 p.innerHTML=`<b>Aller plus loin</b><a data-keep href="${page}">Ouvrir VP Expert</a><a data-keep href="lot3-documentaire.html">Sources et méthode</a>`;
 /* Premium 2026-11-24 : placé après le contenu, hors de la grille de main (il tombait dans une colonne vide). */
 if(/^(presse|machine-)/.test(path)){p.classList.add('end');main.append(p);}else main.parentNode.insertBefore(p,main.nextSibling);
})();
