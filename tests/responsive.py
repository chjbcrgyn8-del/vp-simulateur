import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
from regression import PAGES,URL,OUT,import_case,export

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  rows=[]
  for name in PAGES:
   for width in [1440,768,390]:
    context=await browser.new_context(viewport={'width':width,'height':1000},reduced_motion='reduce')
    page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(URL+name,wait_until='networkidle');sector=await page.evaluate('VPExpertAPI.sector')
    transfer=await page.evaluate("performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0)")
    await page.locator('#vp-next').click()
    for k in ['ou','quand']:
     await page.locator(f'.opts[data-k="{k}"] button').first.click()
    await page.locator('#vp-next').click()
    measure=page.locator('.mesin,.vpmesin').first
    if await measure.count():
     await measure.fill('1,25');await page.wait_for_timeout(220)
     assert await page.evaluate("document.activeElement.matches('.mesin,.vpmesin')")
     await page.locator('.mesin,.vpmesin').first.blur()
    if sector in ['DC','TS']:await page.locator('#res [data-ok$="_M"]').click()
    await page.locator('#res [data-nc]').first.click()
    await page.locator('#vp-next').click()
    await page.locator('#bilan-cause').select_option(index=1)
    await page.locator('#bilan-action').fill('Essai contrôlé à valider')
    await page.locator('[data-outcome="nonverif"]').click()
    for step in range(1,5):
     await page.locator(f'[data-vp-step="{step}"]').click()
     assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth'),(name,width,step)
     await page.evaluate('scrollTo(0,0)')
     if width in [1440,390]:await page.screenshot(path=str(OUT/f'{sector}-{width}-etape-{step}.png'),full_page=True)
    assert not errors,errors
    rows.append({'page':name,'sector':sector,'width':width,'steps':4,'errors':errors,'overflow':False,'transfer_bytes':transfer})
    await context.close()
  page=await browser.new_page();await page.goto(URL+'enquete.html',wait_until='networkidle')
  # Shared measure engine: blank/zero/comma, exact bounds, direction and canonical demo readings.
  assert await page.evaluate("""() => {const S={br:'sans',mes:{}},C=[{id:'a',t:'mes',p:'x',dir:'haut'},{id:'b',t:'mes',p:'x',dir:'bas'}];const m=VPMes.make({S,params:()=>[{id:'x',c:10,tol:2,n:'test',u:'mm'}],cands:()=>C,dirOf:c=>c.dir,key:()=> 'test',render:()=>{}});if(m.stat('x','haut').st!=='none')return false;S.mes.x='0';if(m.stat('x','haut').cur!==0)return false;S.mes.x='11,6';if(m.stat('x','haut').st!=='ok')return false;S.mes.x='12';if(m.stat('x','haut').st!=='limite')return false;S.mes.x='12.001';if(m.stat('x','haut').st!=='hors'||!m.of(C[0]).adverse||m.of(C[1]).adverse)return false;S.mes.x='8';if(m.stat('x','bas').st!=='limite')return false;S.br='conforme';return m.of(C[0]).cur===m.of(C[1]).cur;}""")
  # Plastic drift origins, all eight measures (this mode is entered from the readings table).
  await page.evaluate("Object.assign(VPExpertAPI.S,{ou:'tout',quand:'serie',br:'derive'});VPExpertAPI.render()")
  await page.locator('[data-vp-step="3"]').click()
  n=0
  for value in await page.locator('.opts[data-k="param"] button').evaluate_all('(els)=>els.map(e=>e.dataset.v)'):
   await page.locator(f'.opts[data-k="param"] [data-v="{value}"]').click()
   assert await page.locator('#res .cc').count()>0
   case=await export(page);await import_case(page,case);await page.locator('[data-vp-step="3"]').click();n+=1
  await browser.close()
 (OUT/'responsive.json').write_text(json.dumps({'views':rows,'shared_measure_boundaries':'PASS','plastic_drift_roundtrips':n},indent=2))
 print(json.dumps({'views':rows,'shared_measure_boundaries':'PASS','plastic_drift_roundtrips':n},indent=2))
asyncio.run(main())