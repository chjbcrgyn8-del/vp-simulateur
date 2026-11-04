/* vp-expert-pdf.js : PDF de la synthèse et du dossier VP Expert.
   Sans dépendance ni réseau : le PDF (A4, texte) est construit dans le navigateur, avec les polices
   standard Helvetica (encodage WinAnsi, accents français inclus). Entrée : le texte de la synthèse ou du
   dossier, au format Markdown simplifié (titres #, ##, ###, listes « - », **gras**, [texte](lien), ---).
   Sortie : un Blob application/pdf. window.VPExpertPDF.build(texte,{titre,secteur,type}) */
(function(){
'use strict';
const PW=595.28,PH=841.89,ML=54,MR=54,MT=80,MB=66,CW=PW-ML-MR;
const NAVY=[.078,.141,.231],COPPER=[.604,.357,.122],TEXT=[.10,.13,.19],GREY=[.35,.40,.46],LINK=[.114,.31,.57];

/* Largeurs Helvetica / Helvetica-Bold (millièmes d'em) pour les codes 32 à 126. */
const WR=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const WB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
/* Caractères hors ASCII : largeur propre, sinon celle de la lettre de base (é = e, ç = c...). */
const SPECIAL={R:{'Œ':1000,'œ':944,'Æ':1000,'æ':889,'Ø':778,'ø':611,'ß':611,'€':556,'…':1000,'–':556,'—':1000,'’':222,'‘':222,'“':333,'”':333,'«':556,'»':556,'°':400,'±':584,'×':584,'÷':584,'·':278,'•':350,'™':1000,'©':737,'®':737,'§':556,'¶':537,'µ':556,'¿':611,'¡':333},
 B:{'Œ':1000,'œ':944,'Æ':1000,'æ':889,'Ø':778,'ø':611,'ß':611,'€':556,'…':1000,'–':556,'—':1000,'’':278,'‘':278,'“':500,'”':500,'«':556,'»':556,'°':400,'±':584,'×':584,'÷':584,'·':278,'•':350,'™':1000,'©':737,'®':737,'§':556,'¶':556,'µ':611,'¿':611,'¡':333}};
const CP1252={0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};
const NBSP=' ';
const REPL={' ':NBSP,' ':NBSP,' ':NBSP,' ':' ',' ':' ','→':'->','←':'<-','↔':'<->','≥':'>=','≤':'<=','≈':'~','≠':'!=','−':'-','‑':'-','‐':'-','⌀':'Ø','∅':'Ø','✓':'OK','✔':'OK','✅':'OK','⚠':'(!)','​':'','️':'','­':''};

/* Texte → chaîne ne contenant que des caractères encodables en WinAnsi (le reste devient « ? »). */
function norm(s){
 let out='';
 for(const ch of String(s==null?'':s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\r/g,'')){
  if(ch in REPL){out+=REPL[ch];continue}
  const c=ch.codePointAt(0);
  if(ch==='\n'){out+='\n';continue}
  if(ch==='\t'){out+=' ';continue}
  if(c<32)continue;
  if(c===0xa0){out+=NBSP;continue}
  if(c<=0x7e||(c>=0xa1&&c<=0xff)||CP1252[c]){out+=ch;continue}
  if(c>0xffff)continue;
  out+='?';
 }
 return out;
}
function byteOf(ch){const c=ch.charCodeAt(0);if(ch===NBSP)return 0x20;if(CP1252[c])return CP1252[c];return c<=0xff?c:0x3f}
function esc(s){let o='';for(const ch of s){const b=byteOf(ch);const x=String.fromCharCode(b);o+=(x==='\\'||x==='('||x===')')?'\\'+x:x}return o}
function cw(ch,bold){
 if(ch===NBSP)ch=' ';
 const c=ch.charCodeAt(0);
 if(c>=32&&c<=126)return(bold?WB:WR)[c-32];
 const sp=SPECIAL[bold?'B':'R'][ch];if(sp)return sp;
 const base=ch.normalize('NFD')[0];const b=base.charCodeAt(0);
 if(b>=32&&b<=126)return(bold?WB:WR)[b-32];
 return bold?611:556;
}
const SAFE=1.015;
function measure(t,size,bold,extra){let w=0;for(const ch of t)w+=cw(ch,bold);return(w*size/1000)*SAFE+(extra||0)*t.length}

/* Inline : **gras** et [texte](https://lien) → suite de segments {t,b,url}. */
function inline(s){
 const runs=[];let i=0,buf='',bold=false;
 const flush=()=>{if(buf){runs.push({t:buf,b:bold});buf=''}};
 while(i<s.length){
  if(s.startsWith('**',i)){flush();bold=!bold;i+=2;continue}
  if(s[i]==='['){
   const m=/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/.exec(s.slice(i));
   if(m){flush();runs.push({t:m[1],b:bold,url:m[2]});runs.push({t:' ('+m[2]+')',b:false,url:m[2],g:true});i+=m[0].length;continue}
  }
  buf+=s[i++];
 }
 flush();return runs;
}

/* Découpe des segments en lignes qui tiennent dans « width ». */
function wrap(runs,width,size,baseBold){
 const toks=[];
 for(const r of runs){
  const parts=r.t.split(' ');
  parts.forEach((p,k)=>{if(k>0)toks.push({sp:true,b:r.b||baseBold});if(p!=='')toks.push({t:p,b:r.b||baseBold,url:r.url,g:r.g})});
 }
 const lines=[];let line=[],x=0,pend=0;
 const push=()=>{lines.push(line);line=[];x=0;pend=0};
 for(const tk of toks){
  if(tk.sp){if(line.length)pend=measure(' ',size,tk.b);continue}
  let t=tk.t,w=measure(t,size,tk.b);
  if(line.length&&x+pend+w>width)push();
  while(w>width){ /* mot plus large que la ligne (adresse web) : coupe caractère par caractère */
   let n=1;while(n<t.length&&measure(t.slice(0,n+1),size,tk.b)<=width)n++;
   if(line.length)push();
   line.push({t:t.slice(0,n),b:tk.b,url:tk.url,g:tk.g,x:0,w:measure(t.slice(0,n),size,tk.b)});push();
   t=t.slice(n);w=measure(t,size,tk.b);
  }
  if(t==='')continue;
  line.push({t,b:tk.b,url:tk.url,g:tk.g,x:x+(line.length?pend:0),w});x=x+(line.length>1?pend:0)+w;pend=0;
 }
 if(line.length)lines.push(line);
 return lines;
}

const f2=n=>(Math.round(n*100)/100).toString();
const rg=c=>c.map(f2).join(' ');
const pdfStr=s=>'('+esc(s)+')';
const hex16=s=>{let h='FEFF';for(const ch of String(s)){const c=ch.codePointAt(0);if(c>0xffff){const d=c-0x10000;h+=(0xd800+(d>>10)).toString(16).padStart(4,'0')+(0xdc00+(d&0x3ff)).toString(16).padStart(4,'0')}else h+=c.toString(16).padStart(4,'0')}return'<'+h+'>'};
const uriEsc=u=>encodeURI(u).replace(/[()\\]/g,m=>'\\'+m);

function build(source,opt){
 opt=opt||{};
 const sectorName=opt.secteur||'',kind=opt.type==='synthese'?'Synthèse':'Dossier';
 const pages=[];let cur=null,y=0;
 const newPage=()=>{cur={ops:[],links:[]};pages.push(cur);y=MT};
 const ensure=h=>{if(!cur||y+h>PH-MB)newPage()};
 const font=b=>b?'/F2':'/F1';
 /* Dessine une ligne de segments à la position x0, ligne de base basée sur y (haut de la ligne). */
 function drawLine(line,x0,size,leading,color,bold){
  const base=PH-(y+size*.82);
  for(const it of line){
   const x=x0+it.x,named=it.url&&!it.g,col=named?LINK:it.g?GREY:color;
   cur.ops.push('BT '+rg(col)+' rg '+font(it.b||bold)+' '+f2(size)+' Tf 1 0 0 1 '+f2(x)+' '+f2(base)+' Tm '+pdfStr(it.t)+' Tj ET');
   if(named)cur.ops.push(rg(LINK)+' RG .5 w '+f2(x)+' '+f2(base-1.6)+' m '+f2(x+it.w)+' '+f2(base-1.6)+' l S');
   if(it.url)cur.links.push({rect:[x,base-3,x+it.w,base+size*.85],url:it.url});
  }
  y+=leading;
 }
 function para(text,o){
  o=o||{};const size=o.size||10,leading=o.leading||size*1.42,indent=o.indent||0,color=o.color||TEXT;
  const lines=wrap(inline(text),CW-indent,size,!!o.bold);
  const minKeep=o.keep?Math.min(lines.length,o.keep):1;
  ensure(leading*minKeep+(o.before||0));
  y+=(o.before||0);
  lines.forEach((ln,k)=>{ensure(leading);if(o.bullet&&k===0){cur.ops.push('BT '+rg(color)+' rg /F1 '+f2(size)+' Tf 1 0 0 1 '+f2(ML+indent-(o.bw||10))+' '+f2(PH-(y+size*.82))+' Tm '+pdfStr(o.bullet)+' Tj ET')}drawLine(ln,ML+indent,size,leading,color,!!o.bold)});
  y+=(o.after||0);
 }
 function rule(c,w){ensure(8);cur.ops.push(rg(c)+' RG '+f2(w)+' w '+f2(ML)+' '+f2(PH-y)+' m '+f2(PW-MR)+' '+f2(PH-y)+' l S')}

 const src=norm(source).split('\n');
 let prevBlank=true,first=true;
 for(const raw of src){
  const line=raw.replace(/\s+$/,'');
  if(line.trim()===''){if(!prevBlank){y+=3}prevBlank=true;continue}
  prevBlank=false;
  let m;
  if((m=/^#\s+(.*)$/.exec(line))){para(m[1].replace(/\*\*/g,''),{size:17,leading:22,bold:true,color:NAVY,before:first?0:14,after:4,keep:2});first=false;continue}
  if((m=/^##\s+(.*)$/.exec(line))){ensure(70);para(m[1].replace(/\*\*/g,''),{size:12.5,leading:17,bold:true,color:COPPER,before:14,after:0,keep:2});y+=3;rule([.82,.74,.62],.6);y+=7;first=false;continue}
  if((m=/^###\s+(.*)$/.exec(line))){para(m[1].replace(/\*\*/g,''),{size:10.5,leading:15,bold:true,color:NAVY,before:9,after:2,keep:2});first=false;continue}
  if(/^-{3,}\s*$/.test(line)){y+=4;rule([.82,.82,.84],.6);y+=9;continue}
  first=false;
  if((m=/^(\s*)[-*]\s+(.*)$/.exec(line))){
   const lvl=m[1].length>=2?2:1;
   para(m[2],{size:10,indent:lvl===1?16:32,bullet:lvl===1?'•':'–',bw:lvl===1?10:10,after:1.5,keep:2});continue;
  }
  para(line.replace(/^>\s?/,''),{size:10,after:2.5,keep:2});
 }
 if(!pages.length)newPage();

 /* En-tête et pied de page, une fois le nombre de pages connu. */
 const N=pages.length;
 const dateTxt=new Date().toLocaleDateString('fr-FR');
 pages.forEach((pg,i)=>{
  const top=PH-44,hdr=kind+' VP Expert'+(sectorName?' · '+sectorName:'');
  const right=norm(hdr);
  pg.ops.push('BT '+rg(NAVY)+' rg /F2 8.5 Tf 1.6 Tc 1 0 0 1 '+f2(ML)+' '+f2(top)+' Tm '+pdfStr('VELLA PARTNERS')+' Tj 0 Tc ET');
  pg.ops.push('BT '+rg(GREY)+' rg /F1 8.5 Tf 1 0 0 1 '+f2(PW-MR-measure(right,8.5,false))+' '+f2(top)+' Tm '+pdfStr(right)+' Tj ET');
  pg.ops.push(rg(COPPER)+' RG 1 w '+f2(ML)+' '+f2(top-9)+' m '+f2(PW-MR)+' '+f2(top-9)+' l S');
  const fy=MB-24;
  pg.ops.push(rg([.82,.82,.84])+' RG .5 w '+f2(ML)+' '+f2(fy+14)+' m '+f2(PW-MR)+' '+f2(fy+14)+' l S');
  const note=norm('Démonstrateur public. Document déclaratif : il ne valide aucune cause ni autorisation d’essai.');
  pg.ops.push('BT '+rg(GREY)+' rg /F1 7.5 Tf 1 0 0 1 '+f2(ML)+' '+f2(fy)+' Tm '+pdfStr(note)+' Tj ET');
  const pn=norm('Généré le '+dateTxt+' · page '+(i+1)+' / '+N);
  pg.ops.push('BT '+rg(GREY)+' rg /F1 7.5 Tf 1 0 0 1 '+f2(PW-MR-measure(pn,7.5,false))+' '+f2(fy)+' Tm '+pdfStr(pn)+' Tj ET');
 });

 /* Assemblage : 1 catalogue, 2 pages, 3-4 polices, 5 informations, puis (contenu, liens, page) par page. */
 const objs=[];
 const set=(id,body)=>{objs[id]=body};
 let next=6;const kids=[];
 set(1,'<< /Type /Catalog /Pages 2 0 R /Lang (fr-FR) /ViewerPreferences << /DisplayDocTitle true >> >>');
 set(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 set(4,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 const now=new Date(),p2=n=>String(n).padStart(2,'0');
 const cd='D:'+now.getUTCFullYear()+p2(now.getUTCMonth()+1)+p2(now.getUTCDate())+p2(now.getUTCHours())+p2(now.getUTCMinutes())+p2(now.getUTCSeconds())+'Z';
 const title=opt.titre||(kind+' VP Expert'+(sectorName?' · '+sectorName:''));
 set(5,'<< /Title '+hex16(title)+' /Author '+hex16('Vella Partners')+' /Subject '+hex16('VP Expert, démonstrateur public : document déclaratif')+' /Creator '+hex16('VP Expert')+' /Producer '+hex16('Vella Partners, générateur PDF intégré')+' /CreationDate ('+cd+') >>');
 pages.forEach(pg=>{
  const cid=next++,annots=pg.links.map(()=>next++),pid=next++;
  const stream=pg.ops.join('\n');
  set(cid,'<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream');
  pg.links.forEach((l,k)=>set(annots[k],'<< /Type /Annot /Subtype /Link /Rect ['+l.rect.map(f2).join(' ')+'] /Border [0 0 0] /A << /S /URI /URI ('+uriEsc(l.url)+') >> >>'));
  set(pid,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+f2(PW)+' '+f2(PH)+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+cid+' 0 R'+(annots.length?' /Annots ['+annots.map(a=>a+' 0 R').join(' ')+']':'')+' >>');
  kids.push(pid+' 0 R');
 });
 set(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+kids.length+' >>');

 let out='%PDF-1.4\n%âãÏÓ\n';const offs=[];
 for(let id=1;id<objs.length;id++){offs[id]=out.length;out+=id+' 0 obj\n'+objs[id]+'\nendobj\n'}
 const xref=out.length;
 out+='xref\n0 '+objs.length+'\n0000000000 65535 f \n'+offs.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
 out+='trailer\n<< /Size '+objs.length+' /Root 1 0 R /Info 5 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
 const bytes=new Uint8Array(out.length);for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;
 return new Blob([bytes],{type:'application/pdf'});
}
window.VPExpertPDF={build};
})();
