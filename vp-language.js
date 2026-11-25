/* Presentation only: never translate form values, storage records or simulation data. */
(()=>{
  'use strict';
  const source=document.currentScript.src, key='vp-simulateur:language';
  const norm=s=>s.replace(/\s+/g,' ').trim();
  const attrs=['title','aria-label','alt','placeholder','aria-description'];
  const skip='script,style,noscript,textarea,[contenteditable]:not([contenteditable=false]),.vp-langbar,[translate=no],code,pre';
  const originals=new WeakMap(), attributes=new WeakMap();
  let dict,phrases,request,language='fr',version=0;
  const stockTitle=document.title;
  const bar=document.createElement('nav');
  bar.className='vp-langbar';bar.setAttribute('aria-label','Langue / Language');
  const fr='<svg viewBox="0 0 30 20" aria-hidden="true"><path fill="#fff" d="M0 0h30v20H0z"/><path fill="#153e87" d="M0 0h10v20H0z"/><path fill="#ed3445" d="M20 0h10v20H20z"/></svg>';
  const en='<svg viewBox="0 0 60 40" aria-hidden="true"><path fill="#173b75" d="M0 0h60v40H0z"/><path d="m0 0 60 40m0-40L0 40" stroke="white" stroke-width="8"/><path d="m0 0 60 40m0-40L0 40" stroke="#c32b40" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="white" stroke-width="13"/><path d="M30 0v40M0 20h60" stroke="#c32b40" stroke-width="7"/></svg>';
  bar.innerHTML=`<span role="status"></span><button type="button" lang="fr" aria-label="Français" title="Français" aria-pressed="true" data-language="fr">${fr} FR</button><button type="button" lang="en" aria-label="English" title="English" aria-pressed="false" data-language="en">${en} EN</button>`;
  document.body.prepend(bar);
  const words=s=>s.match(/[\p{L}\p{M}\d]+(?:[’'-][\p{L}\p{M}\d]+)*|[^\s]/gu)||[];
  function prepare(d){
    dict=Object.assign(Object.create(null),d);phrases=new Map();
    for(const k of Object.keys(dict)){
      const w=words(k);if(!w.length||w.length>100||(!/\s/u.test(k)&&k.length<4))continue;
      const arr=phrases.get(w[0])||[];arr.push(k);phrases.set(w[0],arr);
    }
    for(const arr of phrases.values())arr.sort((a,b)=>b.length-a.length);
  }
  function translate(raw){
    const k=norm(raw);if(!k||!/\p{L}/u.test(k))return raw;
    let v=dict[k];
    if(v===undefined){
      // Compose newly rendered counters, labels and sentences from known source fragments.
      const re=/[\p{L}\p{M}\d]+(?:[’'-][\p{L}\p{M}\d]+)*|[^\s]/gu;
      let m,last=0,text='',changed=false;
      while((m=re.exec(k))){
        const candidates=phrases.get(m[0]);if(!candidates)continue;
        const match=candidates.find(x=>k.startsWith(x,m.index)&&!(/[\p{L}\d]/u.test(x.slice(-1))&&/^[\p{L}\d]/u.test(k.slice(m.index+x.length))));
        if(!match)continue;
        text+=k.slice(last,m.index)+dict[match];last=m.index+match.length;re.lastIndex=last;changed=true;
      }
      if(!changed)return raw;v=text+k.slice(last);
    }
    return raw.match(/^\s*/)[0]+v+raw.match(/\s*$/)[0];
  }
  window.vpSearchLabel=(...xs)=>xs.map(s=>language==='en'&&s?translate(s):s).join(' ');
  function pair(old,current){
    const original=old&&old[1]===current?old[0]:current;
    return [original,language==='en'?translate(original):original];
  }
  function node(n){
    const e=n.parentElement;if(!e||e.closest(skip)||!n.data.trim())return;
    const a=pair(originals.get(n),n.data);
    if(a[1]!==n.data){
      if(e.tagName==='OPTION'&&!e.hasAttribute('value'))e.value=e.value;
      n.data=a[1];
    }
    originals.set(n,a);
  }
  function props(e){
    if(e.closest(skip))return;
    for(const k of attrs){if(!e.hasAttribute(k))continue;
      let store=attributes.get(e);if(!store){store={};attributes.set(e,store);}
      const current=e.getAttribute(k),a=pair(store[k],current);
      if(a[1]!==current)e.setAttribute(k,a[1]);store[k]=a;
    }
  }
  function walk(root){
    if(root.nodeType===3){node(root);return;}if(root.nodeType!==1||root.closest(skip))return;
    props(root);
    const t=document.createTreeWalker(root,5,{acceptNode:n=>n.nodeType===1&&n.matches(skip)?2:1});let n;
    while((n=t.nextNode())){if(n.nodeType===3)node(n);else if(attrs.some(k=>n.hasAttribute(k)))props(n);}
  }
  const observer=new MutationObserver(ms=>{
    observer.disconnect();
    try{for(const m of ms){
      if(m.type==='characterData')node(m.target);else if(m.type==='attributes')props(m.target);
      else for(const n of m.addedNodes)walk(n);
    }}finally{watch();}
  });
  function watch(){if(language==='en')observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});}
  window.vpOriginalLabel=e=>{if(!e)return '';const t=document.createTreeWalker(e,4);let n,s='';while(n=t.nextNode()){const p=originals.get(n);s+=p&&p[1]===n.data?p[0]:n.data;}return s;};
  async function choose(next,save){
    const id=++version, msg=bar.firstChild;
    if(next==='en'&&!dict){
      msg.textContent='Loading English…';
      try{request||=fetch(new URL('vp-language-en.json',source)).then(r=>{if(!r.ok)throw Error();return r.json()});const d=await request;if(!dict)prepare(d);}
      catch{request=null;if(id===version)msg.textContent='English unavailable. Please try again.';return;}
    }
    if(id!==version)return;msg.textContent='';observer.disconnect();
    language=next;document.documentElement.lang=next;
    walk(document.body);document.title=next==='en'?translate(stockTitle):stockTitle;
    bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===next)));
    if(save){try{localStorage.setItem(key,next)}catch{}
      const u=new URL(location.href);
      if(u.searchParams.has('lang')){u.searchParams.set('lang',next);history.replaceState(history.state,'',u);}
    }
    watch();
  }
  bar.addEventListener('click',e=>{const b=e.target.closest('button');if(b)choose(b.dataset.language,true);});
  let saved;try{saved=localStorage.getItem(key)}catch{}
  const direct=new URLSearchParams(location.search).get('lang');
  if(direct==='en'||direct==='fr')choose(direct,true);
  else if(saved==='en')choose('en',false);
})();
