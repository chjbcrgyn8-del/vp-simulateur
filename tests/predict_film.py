"""Verify the English VP Predict walkthrough locally or on Pages."""
import os
from playwright.sync_api import sync_playwright

base = os.getenv("VP_TEST_URL", "http://127.0.0.1:8731/").rstrip("/") + "/"
with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--no-sandbox"])
    for i, path in enumerate(["banc-essai", "presse", "presse-caoutchouc",
                              "machine-decolletage", "machine-traitement-surface"]):
        page = browser.new_page(viewport={"width": 390 if i % 2 == 0 else 1280, "height": 844})
        page.goto(base + path + ".html?lang=en#predict-video")
        page.wait_for_selector("#predict-video[open] video")
        vid = page.locator("#predict-video video")
        vid.evaluate("v => {v.muted=true; return v.play()}")
        page.wait_for_function("""() => {const v=document.querySelector('#predict-video video');
            return v.currentTime > 0.15 && v.textTracks[0].cues?.length===8;}""")
        assert vid.evaluate("v=>v.getBoundingClientRect().right<=innerWidth")
        page.locator("[data-language=fr]").click()
        page.wait_for_selector("#predict-video", state="hidden")
        assert vid.evaluate("v=>v.paused")
        print(path, "passed", flush=True)
        page.close()
    browser.close()
