(function(){const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;const NB='\u00a0';
const fmt=n=>Math.round(n).toLocaleString('fr-FR').replace(/\s/g,NB);
// Count-up
function count(el){if(el.dataset.done)return;el.dataset.done=1;const txt=el.textContent,m=txt.replace(/[\s\u00a0\u202f]/g,'').match(/-?\d+/);if(!m||RM)return;const end=+m[0],suf=txt.replace(/^[-\d\s\u00a0\u202f]+/,'');const t0=performance.now(),D=1100;
 (function f(t){const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);el.textContent=(end<0?'':'')+fmt(end*e)+(suf.trim()?NB+suf.trim():'');if(p<1)requestAnimationFrame(f);else el.textContent=txt;})(t0);}
// Reveal
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');e.target.querySelectorAll('[data-count]').forEach(count);io.unobserve(e.target);}),{threshold:.05,rootMargin:"0px 0px -5% 0px"}):null;
function arm(root){root.querySelectorAll('.hsec,.rv,.proof').forEach(s=>{if(s.dataset.rv)return;s.dataset.rv=1;if(RM||!io){s.classList.add('in');return;}s.classList.add('rvx');io.observe(s);});
 root.querySelectorAll('.hero .big:not([data-done])').forEach(count);}
arm(document);function showHash(){const h=location.hash&&document.querySelector(location.hash);if(!h)return;h.classList.add('in');h.querySelectorAll('.rvx').forEach(e=>e.classList.add('in'));h.querySelectorAll('[data-count]').forEach(count);}showHash();addEventListener('hashchange',showHash);new MutationObserver(()=>arm(document)).observe(document.body,{childList:true,subtree:true});
if(RM)document.querySelectorAll('video[autoplay]').forEach(v=>{v.removeAttribute('autoplay');v.pause();v.controls=true;});
// Hero live
const H=document.getElementById('livehero');if(!H)return;
const svg=H.querySelector('svg'),line=svg.querySelector('.lv-raw'),ew=svg.querySelector('.lv-ew'),dot=svg.querySelector('.lv-dot'),ph=H.querySelector('.lv-phone'),badge=H.querySelector('.lv-badge'),cyc=H.querySelector('.lv-cyc');
const W=560,Hh=220,N=90,ref=110;let pts=[],e=ref,k=0,seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
function step(){k++;const drift=k>40?(k-40)*1.05:0;const v=ref+(rnd()-.5)*16+drift;e=.2*v+.8*e;pts.push([v,e]);if(pts.length>N)pts.shift();
 const X=i=>20+i*(W-40)/(N-1),Y=v=>Hh-v;line.setAttribute('points',pts.map((p,i)=>X(i)+','+Y(p[0])).join(' '));const ewp=pts.map((p,i)=>X(i)+','+Y(p[1]));ew.setAttribute('points',ewp.join(' '));const area=svg.querySelector('.lv-area');if(area&&pts.length>1)area.setAttribute('points',ewp.join(' ')+' '+X(pts.length-1)+','+Y(ref)+' '+X(0)+','+Y(ref));
 const l=pts.length-1;dot.setAttribute('cx',X(l));dot.setAttribute('cy',Y(pts[l][1]));const ring=svg.querySelector('.lv-ring');if(ring){ring.setAttribute('cx',X(l));ring.setAttribute('cy',Y(pts[l][1]));}cyc.textContent='cycle '+(200+k);
 const al=e-ref>9;H.classList.toggle('alert',al);if(al&&!ph.classList.contains('show')){ph.classList.add('show');badge.textContent='Alerte préventive';}
 if(k>95){k=0;pts=[];e=ref;ph.classList.remove('show');badge.textContent='Process stable';for(let i=0;i<40;i++)step();}}
if(RM){for(let i=0;i<70;i++)step();}else{for(let i=0;i<55;i++)step();setInterval(step,170);}
})();
(function(){const h=document.querySelector('.hhero.h2'),f=document.querySelector('.fcta');if(!h||!f||!('IntersectionObserver' in window))return;new IntersectionObserver(([e])=>f.classList.toggle('show',!e.isIntersecting&&e.boundingClientRect.top<0),{threshold:0}).observe(h);})();
(function(){const t=document.querySelector('.top');if(!t)return;const f=()=>t.classList.toggle('sc',scrollY>8);addEventListener('scroll',f,{passive:true});f();})();
(function(){if(document.querySelector('.sitefoot'))return;const f=document.createElement('footer');f.className='sitefoot';
f.innerHTML='<div class="in"><div><img class=\"flogo\" src=\"img/logo-vella-partners.png\" alt=\"Vella Partners\" width=\"517\" height=\"150\"><p>Assistant de réglage et détection des dérives pour l’injection plastique et le moulage caoutchouc. L’outil propose, le régleur décide.</p></div><div><h4>Le site</h4><a href="index.html">Accueil</a><a href="index.html#offres">Nos offres</a><a href="index.html#essayer">Essayer</a><a href="savoir.html">Savoir technique</a></div><div><h4>Passer à l’action</h4><a href="gains.html">Estimer mes gains</a><a data-keep href="presse.html">Simulateur presse plastique</a><a data-keep href="presse-caoutchouc.html">Simulateur presse caoutchouc</a><a href="pilote.html">Préparer mon pilote</a><a href="st-sources.html">Sources et niveaux de preuve</a></div></div><div class="bot">Vos données restent votre propriété · Démonstrateur : chiffres indicatifs, à valider dans la proposition</div>';
document.body.appendChild(f);})();
/* Cohérence secteur : sur une page caoutchouc, tous les liens internes restent en caoutchouc (sauf le sélecteur de secteur) */
(function(){
const MAP={'gains.html':'caoutchouc.html','presse.html':'presse-caoutchouc.html','enquete.html':'enquete-caoutchouc.html'};
const BACK={'caoutchouc.html':'gains.html','presse-caoutchouc.html':'presse.html','enquete-caoutchouc.html':'enquete.html'};
function isRub(){return /caoutchouc/.test(location.pathname)||new URLSearchParams(location.search).get('secteur')==='caoutchouc';}
window.vpSector=function(rub){if(rub===undefined)rub=isRub();
 document.querySelectorAll('a[href]').forEach(a=>{if(a.closest('.sector')||a.hasAttribute('data-keep'))return;
  const h=a.getAttribute('href');const m=h.match(/^([a-z-]+\.html)(\?[^#]*)?(#.*)?$/);if(!m)return;let [,f,q,hs]=m;q=q||'';hs=hs||'';
  if(rub){if(MAP[f])f=MAP[f];if(['index.html','savoir.html','pilote.html'].includes(f)&&!/secteur=/.test(q))q='?secteur=caoutchouc';}
  else{if(BACK[f])f=BACK[f];if(['index.html','savoir.html','pilote.html'].includes(f))q=q.replace(/\??secteur=caoutchouc/,'');}
  a.setAttribute('href',f+q+hs);});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>vpSector());else vpSector();
setTimeout(()=>vpSector(),400);
})();
