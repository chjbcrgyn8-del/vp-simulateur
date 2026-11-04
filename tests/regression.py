"""Tests navigateur du projet existant. Démarrer python -m http.server 8080 à la racine.
Prérequis : pip install playwright ; Chrome /usr/bin/google-chrome.
"""
import asyncio, copy, json, os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests'/'results';OUT.mkdir(exist_ok=True)
PAGES=['enquete.html','enquete-caoutchouc.html','enquete-decolletage.html','enquete-traitement-surface.html']
URL=os.environ.get('VP_TEST_URL','http://localhost:8080/')
results=[]

async def export(page):
 async with page.expect_download() as d:
  await page.locator('[data-vp-action="expert-export"]').click()
 download=await d.value
 return json.loads(Path(await download.path()).read_text())

async def import_case(page,case,good=True):
 await page.locator('#expert-file').set_input_files({'name':'case.json','mimeType':'application/json','buffer':json.dumps(case).encode()})
 if good:
  await page.locator('#expert-dialog').wait_for(state='visible')
  await page.locator('#expert-confirm').click()
  await page.locator('#expert-dialog').wait_for(state='hidden')
  assert 'Dossier repris' in await page.locator('#expert-status').inner_text()
 else:
  await page.wait_for_function("document.querySelector('#expert-status').textContent.startsWith('Import refusé')")
  assert not await page.locator('#expert-dialog').is_visible()

async def context_answers(page):
 await page.locator('[data-vp-step="2"]').click()
 for k in ['ou','quand']:
  b=page.locator(f'.opts[data-k="{k}"] button').first
  await b.click()
  assert await page.evaluate("document.activeElement.closest('.opts')?.dataset.k")==k

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  for name in PAGES:
   ctx=await browser.new_context(viewport={'width':1440,'height':1000})
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(URL+name,wait_until='networkidle')
   sector=await page.evaluate('VPExpertAPI.sector')
   assert await page.locator('#qs [aria-pressed="true"]').count()==0
   assert await page.evaluate("VPNumber.parse('')===null&&VPNumber.parse('0')===0&&VPNumber.parse('1,25')===1.25&&['NaN','Infinity','0x12','1e3','1 000','--2'].every(x=>VPNumber.parse(x)===null)")
   await page.locator('#dq').fill('zzzz-introuvable')
   assert await page.locator('#defs [data-def]').count()==0
   await page.locator('#dq').fill('')
   await context_answers(page)
   await page.locator('[data-vp-step="3"]').click()
   if await page.locator('#showall').count():await page.locator('#showall').click()
   assert await page.locator('#res .cc').count()>0
   measure=page.locator('.mesin,.vpmesin').first
   if await measure.count():
    for val,invalid in [('Infinity',True),('0x10',True),('1e3',True),('',False),('0',False),('1,25',False)]:
     await measure.fill(val)
     await page.wait_for_timeout(220)
     measure=page.locator('.mesin,.vpmesin').first
     assert await measure.get_attribute('aria-invalid')==str(invalid).lower(),(sector,val)
    await measure.fill('');await measure.blur()
   if sector in ['DC','TS']:
    assert await page.locator('#res .cc.lock').count()>0
    assert await page.locator('#res .cc.lock [data-nc],#res .cc.lock [data-ok]').count()==0
    gate=await page.locator('#res [data-ok$="_M"]').get_attribute('data-ok')
    await page.locator(f'[data-nc="{gate}"]').click()
    assert await page.locator('#res .cc.lock').count()>0
    await page.locator(f'[data-fix="{gate}"]').click()
    await page.locator(f'[data-ok="{gate}"]').click()
    assert await page.locator('#res .cc.lock').count()==0
    # Resetting the reference measurement invalidates dependent correction records.
    spec=await page.evaluate('VPExpertAPI.nativeSpec(VPExpertAPI.S)')
    adj=next(c['id'] for c in spec['candidates'] if c.get('adj'))
    if await page.locator('#showall').count():await page.locator('#showall').click()
    await page.locator(f'[data-nc="{adj}"]').click()
    await page.locator(f'[data-fix="{gate}"]').click()
    assert await page.evaluate("Object.keys(VPExpertAPI.REC[VPExpertAPI.KEY()]||{}).length")==0
    await page.locator(f'[data-ok="{gate}"]').click()
   b=page.locator('#res [data-nc]').first;cid=await b.get_attribute('data-nc');await b.click()
   assert await page.evaluate('(VPExpertAPI.REC[VPExpertAPI.KEY()]||{})["'+cid+'"]')==1
   await page.locator(f'[data-fix="{cid}"]').click()
   assert not await page.evaluate('(VPExpertAPI.REC[VPExpertAPI.KEY()]||{})["'+cid+'"]')
   await page.locator(f'[data-nc="{cid}"]').click()
   await page.locator('.expert-add summary').click()
   await page.locator('#add-n').fill('Cause test <atelier>')
   await page.locator('#add-c').fill('Mesurer sans modifier le réglage')
   await page.locator('#add-go').click()
   assert 'Cause test <atelier>' in await page.locator('#res').inner_text()
   case=await export(page)
   assert case['case']['custom'][0]['n']=='Cause test <atelier>'
   assert case['case']['native']['history']
   # New isolated browser: export must carry all custom causes and recorded controls.
   fresh=await browser.new_context();q=await fresh.new_page();await q.goto(URL+name,wait_until='networkidle')
   await import_case(q,case)
   restored=await export(q)
   assert restored['case']['custom']==case['case']['custom']
   assert restored['case']['native']['nonconforming']==case['case']['native']['nonconforming']
   await import_case(q,restored)
   assert len((await export(q))['case']['custom'])==1
   mutations=[]
   bad=copy.deepcopy(case);bad['sector']='WRONG';mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['context']['__proto__']={};mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['native']['state']['mes']={'unknown':'1'};mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['native']['history'][0]['id']='unknown';mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['native']['key']='fake#0';mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['native']['state']['mes']={next(iter(case['case']['native']['state'].get('mes',{})),'unknown'):'Infinity'};mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['native']['history']=[];mutations.append(bad)
   bad=copy.deepcopy(case);bad['case']['custom'].append(copy.deepcopy(bad['case']['custom'][0]));mutations.append(bad)
   if sector in ['DC','TS']:
    bad=copy.deepcopy(case);n=bad['case']['native'];n['conforming'].pop(gate,None);n['history']=[h for h in n['history'] if h['id']!=gate]
    n['nonconforming'][adj]=1;n['history'].insert(0,{'id':adj,'r':'nc','key':n['key'],'t':'12:00','d':'test','c':'test'});mutations.append(bad)
   for bad in mutations:await import_case(q,bad,False)
   await fresh.close()
   # All referenced defects, available configurations, modes and drift parameters render.
   sweep=await page.evaluate("""() => {const a=VPExpertAPI,initial={...a.S},out=[];for(const def of a.choices.def){a.S.def=def;a.S.br='sans';a.S.qd='';a.S.fam='all';a.render();for(const mach of (a.choices.mach||[null])){if(mach&&!document.querySelector('.opts[data-k="mach"] [data-v="'+mach+'"]'))continue;if(mach)a.S.mach=mach;a.render();for(const br of a.choices.br){const b=document.querySelector('[data-b="'+br+'"]');if(!b)continue;b.click();if(br==='derive'){for(const p of document.querySelectorAll('.opts[data-k="param"] button')){const v=p.dataset.v;const live=document.querySelector('.opts[data-k="param"] [data-v="'+v+'"]');live.click();out.push([def,mach,br,v]);}}else out.push([def,mach,br]);}}}Object.keys(a.S).forEach(k=>delete a.S[k]);Object.assign(a.S,initial);a.render();return out.length;}""")
   await page.locator('[data-vp-step="4"]').click()
   options=await page.locator('#bilan-cause option').all_text_contents()
   if len(options)>1:
    await page.locator('#bilan-cause').select_option(index=1)
    await page.locator('#bilan-action').fill('Essai déclaré')
    await page.locator('[data-outcome="disparu"]').click()
    assert 'Hypothèse étayée' in await page.locator('#syn-body').inner_text()
    assert 'Cause confirmée' not in await page.locator('#syn-body').inner_text()
    order=await page.locator('#res .cc').evaluate_all('(els)=>els.map(e=>e.dataset.id)')
    await page.locator('#rex-save').click()
    assert order==await page.locator('#res .cc').evaluate_all('(els)=>els.map(e=>e.dataset.id)')
   async with page.expect_download() as d:await page.locator('#syn-dl').click()
   assert '# Synthèse VP Expert' in Path(await (await d.value).path()).read_text()
   await page.emulate_media(media='print')
   assert all([await page.locator(f'#vp-step-{i}').is_visible() for i in range(1,5)])
   await page.emulate_media(media='screen')
   if sector in ['DC','TS']:
    await page.locator('#expert-example').click();await page.locator('#expert-confirm').click()
    assert 'CAS ENTIÈREMENT FICTIF' in await page.locator('#expert-toolbar strong').inner_text()
    assert await page.evaluate('VPExpertAPI.HIST.length')==0
   await page.locator('[data-vp-action="expert-new"]').click();await page.locator('#expert-confirm').click()
   assert await page.locator('#qs [aria-pressed="true"]').count()==0
   assert await page.evaluate('VPExpertAPI.HIST.length')==0
   # Storage denial: no false success and no phantom custom cause.
   await page.evaluate("() => {Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')};}")
   await context_answers(page);await page.locator('[data-vp-step="3"]').click()
   await page.locator('.expert-add summary').click();await page.locator('#add-n').fill('Non conservable');await page.locator('#add-go').click()
   assert 'Stockage local indisponible' in await page.locator('#expert-status').inner_text()
   assert 'Non conservable' not in await page.locator('#res').inner_text()
   assert not errors,(name,errors)
   results.append({'sector':sector,'page':name,'rendered_combinations':sweep,'invalid_imports_rejected':len(mutations),'errors':errors,'functional':'PASS'})
   await ctx.close()
  await browser.close()
 (OUT/'functional.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print(json.dumps(results,ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(main())