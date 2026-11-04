/* The three documentary families absent from the original defect picker are
   now candidates in that same picker. No new scientific rule is invented.
   DOC-prefixed lever IDs cannot collide with legacy native rule IDs. */
(()=>{
 const ref=window.VELLA_REF_DEC,data=window.VPDC;
 for(const [tab,family,defect]of [['U09','DC03','Bavures ou téton'],['U10','DC05','Vibrations ou broutement'],['U11','DC06','Copeaux longs ou mauvaise évacuation']]){
  const rules=data.rules.filter(r=>r.id.startsWith(family)&&!r.blocked);
  for(const r of rules)ref.levers['DOC'+r.id]={n:r.title,b:'Expertise documentaire',p:null,ind:{},ctl:r.check,r:'DOC:'+r.id};
  ref.defects.push({tab,fam:'out',defect,hint:'Complément documentaire candidat, à valider',levers:rules.map(r=>'DOC'+r.id)});
 }
})();
