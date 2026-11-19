"""Test navigateur de la scène « Capitaliser » (vp-capitaliser.js). N'écrit aucun fichier.
Démarrer python -m http.server 8080 à la racine, puis : python tests/capitaliser.py
Prérequis : pip install playwright ; Chrome /usr/bin/google-chrome (ou variable VP_CHROME).
Adresse testée : variable VP_TEST_URL, par défaut http://localhost:8080/.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get('VP_TEST_URL', 'http://localhost:8080/')
CHROME = os.environ.get('VP_CHROME', '/usr/bin/google-chrome')
PAGES = {'TP': 'enquete.html', 'CA': 'enquete-caoutchouc.html', 'DC': 'enquete-decolletage.html', 'TS': 'enquete-traitement-surface.html'}
WIDTHS = [1440, 768, 390]
checks = []


def chk(name, ok, info=''):
    checks.append({'check': name, 'ok': bool(ok), 'info': str(info)[:300]})


LAYOUT = """()=>{const w=document.querySelector('#vc-win'),r=w.getBoundingClientRect(),b=w.querySelector('.vc-body');
const out=[...w.querySelectorAll('*')].filter(e=>{const x=e.getBoundingClientRect();return x.width&&(x.right>r.right+1||x.left<r.left-1)}).length;
const small=[...w.querySelectorAll('button,input')].filter(e=>{const x=e.getBoundingClientRect();return x.width&&x.height<43.5}).length;
const tiny=[...w.querySelectorAll('*')].filter(e=>!e.children.length&&e.textContent.trim()&&e.getBoundingClientRect().width&&parseFloat(getComputedStyle(e).fontSize)<12).length;
return{page:document.documentElement.scrollWidth-innerWidth,body:b.scrollWidth-b.clientWidth,out,small,tiny}}"""


def layout(page, tag):
    o = page.evaluate(LAYOUT)
    chk(tag + ' sans débordement', o['page'] <= 0 and o['body'] <= 0 and not o['out'], o)
    chk(tag + ' cibles de 44 px et texte de 12 px au moins', not o['small'] and not o['tiny'], o)


def run(browser, sector, name, width):
    tag = f'{sector} {width}px'
    ctx = browser.new_context(viewport={'width': width, 'height': 900})
    page = ctx.new_page(); errors = []; writes = []; dialogs = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('request', lambda r: writes.append(r.method + ' ' + r.url) if r.method != 'GET' or not r.url.startswith(URL) else None)
    page.on('dialog', lambda d: (dialogs.append(d.message), d.dismiss()))
    page.goto(URL + name); page.wait_for_timeout(900)
    store = lambda: page.evaluate('JSON.stringify(Object.assign({},localStorage))')
    before = store()
    launch = page.locator('#vp-capi-launch')
    chk(tag + ' bouton « Scène Capitaliser »', launch.count() == 1 and launch.is_visible())
    chk(tag + ' carte masquée tant que le cas n’est pas résolu', not page.locator('#vp-capi-cta').is_visible())
    # entrée sur un dossier incomplet, clavier
    launch.focus(); page.keyboard.press('Enter'); page.wait_for_timeout(200)
    chk(tag + ' écran d’entrée', page.locator('#vp-capi .vc-q').inner_text().startswith('Cette scène part'))
    layout(page, tag + ' entrée')
    page.keyboard.press('Escape'); page.wait_for_timeout(100)
    chk(tag + ' Échap ferme et rend le focus', page.locator('#vp-capi').is_hidden() and page.evaluate('document.activeElement.id') == 'vp-capi-launch')
    chk(tag + ' rien dans le stockage après ouverture', store() == before)
    # cas d'exemple
    launch.click(); page.locator('[data-a="example"]').click(); page.wait_for_timeout(400)
    chk(tag + ' 1 Clôturer', 'non clôturé' in page.locator('.vc-status').inner_text() and page.locator('.vc-tag').count() == 1)
    tool = page.locator('#vc-tool').input_value()
    chk(tag + ' références d’exemple signalées fictives', 'exemple fictif' in tool and 'exemple fictif' in page.locator('#vc-machine').input_value())
    layout(page, tag + ' clôturer')
    page.locator('#vc-tool').fill(''); page.locator('[data-a="do-close"]').click(); page.wait_for_timeout(100)
    chk(tag + ' outillage obligatoire', page.locator('#vc-err').count() == 1 and page.evaluate('document.activeElement.id') == 'vc-tool')
    page.locator('#vc-tool').fill(tool); page.keyboard.press('Enter'); page.wait_for_timeout(150)
    chk(tag + ' 2 Valider', 'non validé' in page.locator('.vc-status').inner_text())
    chk(tag + ' cause reliée à un écart constaté', page.locator('.vc-checks li').first.get_attribute('class') == 'ok')
    chk(tag + ' 3 Réutiliser verrouillé avant validation', page.locator('.vc-steps button').nth(2).is_disabled())
    layout(page, tag + ' valider')
    page.locator('[data-a="renvoi"]').click(); page.wait_for_timeout(80)
    chk(tag + ' renvoi pour complément', 'complément demandé' in page.locator('.vc-status').inner_text())
    page.locator('[data-a="undo"]').click(); page.locator('[data-a="valide"]').first.click(); page.wait_for_timeout(80)
    chk(tag + ' méthode validée, réserves écrites', page.locator('.vc-status .vc-badge').inner_text() == 'Méthode validée' and page.locator('.vc-res').count() == 1)
    page.locator('.vc-main [data-a="goto"][data-v="reuse"]').click(); page.wait_for_timeout(120)
    chk(tag + ' aucune condition présélectionnée', page.locator('.vc-seg button[aria-pressed="true"]').count() == 0 and page.locator('.vc-cond.idle').count() == 1)
    chk(tag + ' fiche : contrôle qui a tranché renseigné', page.locator('.vc-fiche .vc-row').nth(1).locator('dd.none').count() == 0)
    layout(page, tag + ' réutiliser')
    page.locator('[data-a="cond"][data-k="machine"][data-v="diff"]').click(); page.wait_for_timeout(60)
    chk(tag + ' condition différente : contrôle à refaire', page.locator('.vc-cond.warn').count() == 1)
    page.locator('[data-a="cond"][data-k="machine"][data-v="same"]').click()
    page.locator('[data-a="cond"][data-k="material"][data-v="same"]').click(); page.wait_for_timeout(60)
    chk(tag + ' conditions identiques', page.locator('.vc-cond.ok').count() == 1)
    page.locator('[data-a="reuse"][data-v="efficace"]').click(); page.wait_for_timeout(80)
    chk(tag + ' décompte sans taux', '1 reprise · 1 efficace' in page.locator('.vc-count').inner_text() and page.locator('.vc-log li').count() == 3)
    layout(page, tag + ' reprise notée')
    page.locator('[data-a="reuse"][data-v="inefficace"]').click(); page.wait_for_timeout(80)
    chk(tag + ' sans effet : à revoir', 'à revoir' in page.locator('.vc-status').inner_text() and '1 reprise · 0 efficace' in page.locator('.vc-count').inner_text())
    page.locator('.vc-x').click(); page.wait_for_timeout(100)
    # carte à l'étape 4, puis disparition si le résultat change
    card = page.locator('#vp-capi-cta')
    chk(tag + ' carte « Et ensuite : capitaliser » à l’étape 4', card.count() == 1 and card.is_visible())
    page.locator('[data-outcome="attenue"]').first.click(); page.wait_for_timeout(120)
    chk(tag + ' carte retirée si le défaut n’a pas disparu', not card.is_visible())
    chk(tag + ' aucune clé de stockage ajoutée', sorted(json.loads(store())) == sorted(json.loads(before)), store()[:200])
    chk(tag + ' aucune requête d’écriture ni externe', not writes, writes[:3])
    chk(tag + ' aucune boîte native, aucune erreur', not dialogs and not errors, (dialogs + errors)[:3])
    ctx.close()


def link(browser):
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto(URL + 'enquete.html?capitaliser=1'); page.wait_for_timeout(1600)
    chk('lien ?capitaliser=1 ouvre la scène', page.locator('#vp-capi').is_visible())
    page.emulate_media(media='print')
    chk('impression : scène et bouton masqués', page.evaluate("getComputedStyle(document.querySelector('#vp-capi')).display") == 'none')
    page.close()


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    for sector, name in PAGES.items():
        for width in WIDTHS:
            run(browser, sector, name, width)
    link(browser)
    browser.close()

failed = [c for c in checks if not c['ok']]
print(json.dumps({'checks': len(checks), 'failed': failed, 'capitaliser': 'FAIL' if failed else 'PASS'}, ensure_ascii=False, indent=2))
sys.exit(1 if failed else 0)
