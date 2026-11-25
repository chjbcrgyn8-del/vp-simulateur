"""Check the English rubber-specific Predict film on the rubber Expert page."""
import os
from playwright.sync_api import sync_playwright

url = os.getenv("VP_TEST_URL", "http://127.0.0.1:8731/").rstrip("/") + "/enquete-caoutchouc.html"
with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--no-sandbox"])
    for width in (390, 1280):
        page = browser.new_page(viewport={"width": width, "height": 850})
        page.goto(url + "?lang=en#predict-video")
        video = page.locator("#predict-video[open] video")
        video.wait_for()
        video.evaluate("v=>{v.muted=true;return v.play()}")
        page.wait_for_function("""()=>{const v=document.querySelector('#predict-video video');
          return v.currentTime>.5 && v.textTracks[0].activeCues?.length>0}""")
        assert video.evaluate("""v=>v.currentSrc.endsWith('/en/vp-predict-caoutchouc.mp4') &&
          v.textTracks[0].language==='en' && v.duration===99 && v.getBoundingClientRect().right<=innerWidth""")
        page.locator('[data-language=fr]').click()
        page.wait_for_selector('#predict-video',state='hidden')
        assert page.locator('#predict-video video').evaluate('v=>v.paused')
        page.close()
        print(width, "passed", flush=True)
    browser.close()
