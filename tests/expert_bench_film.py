"""Test the direct Expert link, playback, captions and language switch on the bench."""
import os
from playwright.sync_api import sync_playwright

base = os.getenv("VP_TEST_URL", "http://127.0.0.1:8731/").rstrip("/")
with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--no-sandbox"])
    for width in (390, 1280):
        page = browser.new_page(viewport={"width": width, "height": 844})
        page.goto(base + "/banc-essai.html?lang=en#expert-video")
        video = page.locator("#expert-video[open] video")
        video.wait_for()
        video.evaluate("v=>{v.muted=true;return v.play()}")
        page.wait_for_function("""() => {const v=document.querySelector('#expert-video video');
          return v.currentTime>0.5 && v.textTracks[0].activeCues?.length>0}""")
        assert video.evaluate("v=>v.duration>90 && v.textTracks[0].language==='en' && v.getBoundingClientRect().right<=innerWidth")
        page.evaluate("location.hash='expert-plastics-video'")
        plastics = page.locator("#expert-plastics-video[open] video")
        plastics.wait_for()
        plastics.evaluate("v=>{v.muted=true;return v.play()}")
        page.wait_for_function("""()=>{const v=document.querySelector('#expert-plastics-video video');
          return v.currentTime>0.5 && v.textTracks[0].activeCues?.length>0}""")
        assert plastics.evaluate("v=>v.currentSrc.endsWith('vp-expert-plastique.mp4') && v.textTracks[0].language==='en' && v.getBoundingClientRect().right<=innerWidth")
        page.locator("#predict-video summary").click()
        page.wait_for_function("()=> document.querySelector('#expert-plastics-video video').paused && !document.querySelector('#expert-plastics-video').open")
        page.wait_for_function("()=> document.querySelector('#expert-video video').paused && !document.querySelector('#expert-video').open")
        page.locator("[data-language=fr]").click()
        page.wait_for_selector("#expert-video", state="hidden")
        page.wait_for_selector("#expert-plastics-video", state="hidden")
        page.wait_for_selector("#predict-video", state="hidden")
        page.close()
        print(width, "passed", flush=True)
    browser.close()
