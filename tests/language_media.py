"""English/French release checks. Set VP_TEST_URL to test the published site."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('VP_TEST_URL', 'http://127.0.0.1:8731/').rstrip('/') + '/'
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1400, 'height': 900})
    errors = []
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    page.set_default_timeout(25000)
    page.goto(URL + '?lang=en', wait_until='domcontentloaded')
    page.wait_for_selector('html[lang=en]')
    visited = set()

    def inspect(button, english):
        name = button.get_attribute('data-film').split('/')[-1]
        prefix = 'video/en/' if english else 'video/'
        assert button.locator('img').get_attribute('src').endswith(prefix + name + '.jpg')
        label = button.inner_text()
        button.click()
        page.wait_for_function("""() =>{const v=document.querySelector('#g-video video');return v.readyState>=2 && v.currentTime>0;}""")
        video = page.locator('#g-video video')
        assert video.evaluate('v=>v.currentSrc').endswith(prefix+name+'.mp4')
        if english:
            page.wait_for_function("""()=>{const t=document.querySelector('#g-video video').textTracks[0];return t&&t.cues&&t.cues.length>0}""")
            assert video.evaluate("v=>v.textTracks[0].language==='en' && v.textTracks[0].mode==='showing'")
            secs=round(video.evaluate('v=>v.duration'))
            assert f'{secs//60}:{secs%60:02}' in label,(name,secs,label)
            visited.add(name)
        else:
            assert video.locator('track').count()==0
        page.locator('.gv-close').click()

    inspect(page.locator('#g-hero button'),True)
    for k in ('plastique','caoutchouc'):
        page.locator('#g-sect button[data-k="'+k+'"]').click()
        for btn in page.locator('#g-cards [data-film]').all():inspect(btn,True)
    assert len(visited)==6
    page.locator('[data-language=fr]').click()
    inspect(page.locator('#g-cards [data-film]').first,False)
    page.locator('[data-language=en]').click()
    assert page.locator('#g-cards [data-film] img').first.get_attribute('src').startswith('video/en/')
    page.goto(URL+'coulisses.html',wait_until='domcontentloaded')
    page.wait_for_selector('html[lang=en]')
    clip=page.locator('[data-vp-operator]')
    clip.evaluate("v=>{v.scrollIntoView();v.muted=true;return v.play()}")
    page.wait_for_function("""()=>{const v=document.querySelector('[data-vp-operator]');return v.currentTime>0&&v.textTracks[0]?.cues?.length>0}""")
    assert clip.evaluate("v=>v.controls && v.currentSrc.endsWith('video/en/regleur-extrait.mp4') && v.textTracks[0].language==='en'")
    page.locator('[data-language=fr]').click()
    assert clip.evaluate("v=>!v.controls && v.src.endsWith('video/regleur-extrait.mp4') && !v.querySelector('track')")
    page.set_viewport_size({'width':375,'height':812})
    page.goto(URL+'?lang=en',wait_until='domcontentloaded')
    page.wait_for_selector('html[lang=en]')
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    assert not errors,errors
    print('All seven English films, posters, captions, durations, French playback and mobile entry passed.')
