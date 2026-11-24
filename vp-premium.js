/* vp-premium.js · finitions d'ergonomie (24 novembre 2026). Aucun calcul modifié.
   1. En-tête : un seul « Changer de secteur » (celui de la pastille secteur).
   2. Images : chargement différé et décodage asynchrone hors premier écran. */
(function(){
 function run(){
  document.querySelectorAll('.top').forEach(function(top){
   var sec=top.querySelector('nav.tabs.sector .sec-change');
   if(!sec)return;
   top.querySelectorAll('nav.tabs.menu a').forEach(function(a){if(a.textContent.trim()==='Changer de secteur')a.classList.add('vp-dup')});
  });
  document.querySelectorAll('img:not([loading])').forEach(function(im){
   var r=im.getBoundingClientRect();if(r.top>innerHeight*1.2){im.loading='lazy'}im.decoding='async';
  });
 }
 if(document.readyState==='complete')run();else document.addEventListener('DOMContentLoaded',function(){setTimeout(run,0)});
})();
