(function(){const NB='\u00a0';
function fix(t){return t.replace(/[ \u202f]([?!:;€»])/g,NB+'$1').replace(/([A-Za-zÀ-ÿ0-9’)%])([?!;])(?=\s|$|<)/g,'$1'+NB+'$2').replace(/(\d)€/g,'$1'+NB+'€').replace(/« /g,'«'+NB).replace(/(\d) (\d{3})(?!\d)/g,'$1'+NB+'$2');}
const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,CODE:1};
function walk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&SKIP[n.parentNode.nodeName]?2:1});let n;while(n=w.nextNode()){const v=n.nodeValue,f=fix(v);if(f!==v)n.nodeValue=f;}
 root.querySelectorAll&&root.querySelectorAll('[data-t].tipbox').forEach(e=>{const v=e.getAttribute('data-t'),f=fix(v);if(f!==v)e.setAttribute('data-t',f);});}
let busy=false;const run=()=>{if(busy)return;busy=true;walk(document.body);busy=false;};
run();new MutationObserver(()=>{if(!busy)requestAnimationFrame(run);}).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
