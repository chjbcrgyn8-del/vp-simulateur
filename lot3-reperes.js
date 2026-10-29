/* Repères Lot 3 dans les enquêtes plastique et caoutchouc : « À ne pas conclure » et « Clôture attendue ».
   Lecture seule ; s'ajoute sous les causes sans modifier le questionnaire. */
(function(){
 const L=window.LOT3;if(!L)return;
 const sec=/caoutchouc/.test(location.pathname)?'c':'p';
 const N=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function code(q){const t=N(q);if(!t||/derive|en hausse|en baisse/.test(t))return null;
  if(sec==='p'){if(/^bavure( |$)/.test(t))return 'TP01';if(/^incomplet( |$)/.test(t))return 'TP02';if(/^retassures?( |$)/.test(t))return 'TP03';return null}
  if(/^manque matiere/.test(t))return 'CA01';if(/^matiere grillee/.test(t))return 'CA02';if(/^bulles/.test(t))return 'CA03';return null}
 function quoi(){const s=[...document.querySelectorAll('#fiche span')].find(x=>N((x.querySelector('i')||{}).textContent)==='quoi');if(!s)return '';const i=s.querySelector('i').textContent;return s.textContent.slice(s.textContent.indexOf(i)+i.length)}
 const st=document.createElement('style');st.textContent=`
#lot3{margin:18px 0 0;border:1px solid #e6dcc8;border-left:3px solid #b7791f;border-radius:0 10px 10px 0;background:#fffdf8}
#lot3>summary{cursor:pointer;list-style:none;padding:12px 14px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
#lot3>summary::-webkit-details-marker{display:none}
#lot3>summary b{font-weight:600;color:#1d2433;font-size:15px}
#lot3>summary span{font:500 11px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:#7a4e0e}
#lot3>summary:after{content:'+';margin-left:auto;font:500 18px var(--mono,monospace);color:#7a4e0e}#lot3[open]>summary:after{content:'–'}
#lot3 .l3b{padding:0 14px 12px}#lot3 .l3i{font-size:12.5px;color:#4a5262;margin:0 0 10px;line-height:1.5}
#lot3 ol{list-style:none;margin:0;padding:0;display:grid;gap:12px}
#lot3 li{padding:10px 0 0;border-top:1px solid #eee4d2}
#lot3 h4{margin:0;font-size:14px;font-weight:600;color:#1d2433;line-height:1.4}
#lot3 .l3q{margin:3px 0 0;font-size:12.5px;color:#5a6270;line-height:1.45}
#lot3 .ncl{margin:8px 0 0;padding:9px 11px;border-left:3px solid #b7791f;background:#fbf6ec;border-radius:0 6px 6px 0;font-size:13px;line-height:1.5;color:#2b2f36}
#lot3 .ncl p{margin:0}#lot3 .ncl p+p{margin-top:6px}
#lot3 .ncl b{display:block;font:600 11.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:#7a4e0e;margin-bottom:2px}
#lot3 .ncl .cl b{color:#0f6b5c}
#lot3 .l3t{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:5px;background:#eef0f4;color:#173a6b;font:500 10.5px var(--mono,monospace);vertical-align:1px;white-space:nowrap}
#lot3 .l3s{margin:6px 0 0;font-size:11.5px;color:#5a6270}#lot3 .l3s a{color:#173a6b}
#lot3 .l3f{margin:10px 0 0;font-size:11.5px;color:#5a6270}`;document.head.appendChild(st);
 let last=null;
 function draw(){const res=document.getElementById('res');if(!res)return;const c=code(quoi());if(c===last&&document.getElementById('lot3'))return;last=c;
  let el=document.getElementById('lot3');if(!c){if(el)el.remove();return}
  const R=L.r.filter(r=>r.d===c);if(!R.length)return;
  const open=el?el.open:false;if(!el){el=document.createElement('details');el.id='lot3';res.insertAdjacentElement('afterend',el)}
  el.innerHTML=`<summary><b>Avant de conclure sur « ${E(L.n[c])} » : 4 repères</b><span>Lot 3 · candidats non validés</span></summary><div class="l3b"><p class="l3i">Ce qu’un contrôle ne prouve pas, et la preuve attendue pour clore. Repères documentaires en cours de relecture par nos experts : ce ne sont ni des actions, ni des réglages, ni une autorisation d’essai.</p><ol>`+
  R.map(r=>`<li><h4>${E(r.t)}${r.p?'<span class="l3t">relecture prioritaire</span>':''}${r.b?'<span class="l3t">blocage à lever</span>':''}</h4><p class="l3q">Quand : ${E(r.q)}</p><div class="ncl"><p class="nc"><b>À ne pas conclure</b>${E(r.nc)}</p><p class="cl"><b>Clôture attendue</b>${E(r.cl)}</p></div><p class="l3s">${r.id}${r.x?' · s’appuie aussi sur l’expérience d’un expert partenaire':''}${r.s.length?' · Sources : '+r.s.map(([k,u])=>`<a href="${E(u)}" target="_blank" rel="noopener">${E(k)}</a>`).join(', '):''}</p></li>`).join('')+
  `</ol><p class="l3f">Référentiel ${L.v} · <a href="st-sources-mondiales.html">sources mondiales et leurs limites</a></p></div>`;el.open=open;}
 function boot(){const f=document.getElementById('fiche'),r=document.getElementById('res');if(!f||!r)return;draw();new MutationObserver(draw).observe(f,{childList:true,subtree:true,characterData:true});new MutationObserver(()=>{if(!document.getElementById('lot3'))last=null,draw()}).observe(r.parentNode,{childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
