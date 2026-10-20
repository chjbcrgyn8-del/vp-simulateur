/* Vella Partners · Signature : titres serif pour les grands titres, cadre atelier sur la photo d'accueil */
(function(){function run(){
document.querySelectorAll('h2').forEach(function(h){if(h.closest('.hsec,.final'))return;var s=parseFloat(getComputedStyle(h).fontSize);if(s>=28)h.classList.add('ser');});
var img=document.querySelector('.hhero > .himg');
if(img&&!img.parentNode.classList.contains('hframe')){var f=document.createElement('div');f.className='hframe';img.parentNode.insertBefore(f,img);f.appendChild(img);
f.insertAdjacentHTML('beforeend','<span class="hscan" aria-hidden="true"></span><span class="hlab tl" aria-hidden="true">CAM 01 · VUE ATELIER</span><span class="hlab br" aria-hidden="true"><i></i>SUIVI CYCLE À CYCLE</span>');}
}
if(document.readyState!=='loading')run();else document.addEventListener('DOMContentLoaded',run);})();
