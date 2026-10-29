/* DEV: a single Expert entry, not another documentary product. */
(()=>{
 const path=location.pathname.split('/').pop();
 if(!path||path==='index.html'||path.startsWith('enquete'))return;
 const main=document.querySelector('main');if(!main)return;
 const page=path.includes('caoutchouc')?'enquete-caoutchouc.html':path.includes('decolletage')?'enquete-decolletage.html':'enquete.html';
 const p=document.createElement('p');p.className='sl';p.style.cssText='margin:16px 0;padding:12px;border-bottom:1px solid #d0d5da';
 p.innerHTML=`VP Expert consolidé · <a data-keep href="${page}">Ouvrir VP Expert</a> · <a data-keep href="lot3-documentaire.html">Sources et méthode</a>`;
 main.prepend(p);
})();
