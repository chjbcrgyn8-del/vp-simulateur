/* ux.js : l'en-tête se range quand on descend, revient dès qu'on remonte (mobile uniquement). */
(function(){
 var h=document.querySelector('.top');if(!h||!window.matchMedia)return;
 var mq=matchMedia('(max-width:640px)'),last=0,busy=false;
 function run(){
  var y=Math.max(0,window.pageYOffset||0),dy=y-last;busy=false;
  if(!mq.matches||y<80||dy<-6){h.classList.remove('away');last=y;return}
  if(dy>8&&!h.contains(document.activeElement)){h.classList.add('away');last=y}
 }
 addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(run)}},{passive:true});
 h.addEventListener('focusin',function(){h.classList.remove('away')});
})();

/* Le bouton flottant « Estimer mes gains » masquerait la mention légale du bas de page. */
(function(){
 var f=document.querySelector('.fcta'),ends=document.querySelectorAll('.final,.sitefoot');
 if(!f||!ends.length||!('IntersectionObserver' in window))return;
 var seen=new Set(),io=new IntersectionObserver(function(es){
  es.forEach(function(e){e.isIntersecting?seen.add(e.target):seen.delete(e.target)});
  f.classList.toggle('off',seen.size>0);
 });
 ends.forEach(function(e){io.observe(e)});
})();
