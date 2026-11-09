#!/usr/bin/env python3
"""Harmonisation visuelle du simulateur sur la charte de la vitrine Lovable.
Apparence uniquement (CSS + <style>/style="" des pages) : aucun fichier JS, aucune donnée.
Usage (depuis la racine) : python3 outils/harmonisation-vitrine.py [--apply]
"""
import re, sys, glob, collections

APPLY = '--apply' in sys.argv

# Palette vitrine (vella-partners.lovable.app)
INK = '#1b1e22'        # fond sombre / en-têtes (inverse)
INK2 = '#222629'       # texte principal / boutons primaires sombres
AMBER = '#f5af20'      # accent de marque
AMBER_D = '#e09a12'    # accent soutenu (survol, boutons)
AMBER_TXT = '#9a6a12'  # accent lisible sur fond clair
AMBER_SOFT = '#fdf3dc' # surlignage doux
WHITE = '#ffffff'
MUTED_BG = '#f1f5f9'
BORDER = '#e2e8f0'
MUTED_FG = '#62676b'
GRAY_L = '#9aa0a6'
GRAY_XL = '#cbd5e1'

HEX_MAP = {
    # nuits / marine -> graphite
    '#0b111c': INK, '#0a0f19': INK, '#0a1320': INK, '#0f1b2d': INK, '#111a29': INK,
    '#1a2535': INK, '#1a2230': INK, '#131d2b': INK, '#0f1a2c': INK, '#0d1421': INK,
    '#1d2433': INK, '#160d04': INK, '#1a1206': INK, '#140c03': INK, '#1b2d4a': '#2b2f36',
    '#173a6b': INK2, '#1f3a60': INK2, '#14243b': INK2, '#152c42': INK2, '#1f2b3d': INK2,
    '#333a47': '#2b2f36', '#49647f': MUTED_FG,
    # cuivre / or -> ambre
    '#e3b47c': AMBER, '#d9b88a': AMBER, '#e0b07a': AMBER, '#e7a15a': AMBER, '#f5b26b': AMBER,
    '#e0a64a': AMBER, '#c78a10': AMBER_D,
    '#c98a4b': AMBER_D, '#b47a3e': AMBER_D, '#b77a3d': AMBER_D, '#e8841f': AMBER_D,
    '#e0752d': AMBER_D, '#b7792a': AMBER_D,
    '#9a5f28': AMBER_TXT, '#8a4a0c': AMBER_TXT, '#7a4a1a': AMBER_TXT, '#6b3d12': AMBER_TXT,
    '#7a4e0e': AMBER_TXT, '#86520f': AMBER_TXT,
    # crèmes -> blanc / gris très clair
    '#fffdf9': WHITE, '#fffefb': WHITE, '#fffdf8': WHITE,
    '#f4f4f1': MUTED_BG, '#f4f2ed': MUTED_BG, '#f3efe7': MUTED_BG, '#f4efe6': MUTED_BG,
    '#f5f2eb': MUTED_BG, '#f1ece2': MUTED_BG, '#faf8f3': MUTED_BG, '#faf7f1': MUTED_BG,
    '#f8f0e5': AMBER_SOFT, '#f4e9db': AMBER_SOFT, '#f9f1e6': AMBER_SOFT, '#f8eedb': AMBER_SOFT,
    '#fff4e0': AMBER_SOFT, '#fff5d5': AMBER_SOFT, '#fff0cb': AMBER_SOFT,
    # lignes beiges -> bordure
    '#e4ded2': BORDER, '#cfc6b6': BORDER, '#d9d3c7': BORDER,
    # gris bleutés -> gris neutres
    '#5a6270': MUTED_FG, '#566273': MUTED_FG, '#5a6676': MUTED_FG, '#6b7480': MUTED_FG,
    '#6b7b8c': MUTED_FG, '#9aa3ad': GRAY_L,
    '#9aa7b8': GRAY_L, '#aeb8c6': GRAY_L,
    '#c3ccd8': GRAY_XL, '#c4d0e0': GRAY_XL, '#bfccd9': GRAY_XL,
    '#e8eef7': MUTED_BG, '#eef3f9': MUTED_BG, '#e7eef6': MUTED_BG, '#eef0f4': MUTED_BG,
    '#f8f9fc': MUTED_BG, '#edf2f8': MUTED_BG, '#fcfdfe': WHITE,
    # bleu accent du questionnaire -> ambre lisible
    '#2f6fa3': AMBER_TXT,
    # reliquats (2e passe)
    '#0f1828': INK, '#172b40': INK, '#1a2130': INK2, '#2c3645': '#2b2f36', '#2a3342': '#2b2f36',
    '#3b4a5e': '#3d4248', '#3a4658': '#3d4248', '#172b42': INK, '#141d2d': INK, '#21283a': INK,
    '#d9b48c': AMBER, '#e8c7a3': AMBER, '#ffdb95': AMBER, '#d08a1f': AMBER_D, '#d9772b': AMBER_D, '#ff9d3d': AMBER_D,
    '#f0a020': AMBER, '#e89a4f': AMBER_D, '#c08d48': AMBER_D, '#b8732f': AMBER_D, '#b77c31': AMBER_D, '#b7773a': AMBER_D,
    '#b5701a': AMBER_D, '#b48b51': AMBER_D, '#8a4d17': AMBER_TXT, '#9b5d1d': AMBER_TXT, '#9a5b1f': AMBER_TXT,
    '#8f5a22': AMBER_TXT, '#8c3e18': AMBER_TXT, '#8b541f': AMBER_TXT, '#815d16': AMBER_TXT, '#7b421c': AMBER_TXT,
    '#765019': AMBER_TXT, '#d8c3a5': BORDER, '#dec5a7': BORDER, '#c8b99c': BORDER, '#dcdfd8': BORDER,
    '#fff8ec': AMBER_SOFT, '#fdebd6': AMBER_SOFT, '#fbefd9': AMBER_SOFT, '#f7ebd9': AMBER_SOFT, '#f6e6d2': AMBER_SOFT,
    '#f3e5d3': AMBER_SOFT, '#fff1dc': AMBER_SOFT, '#fff0d2': AMBER_SOFT, '#fff4e8': AMBER_SOFT,
    '#fbf3ea': MUTED_BG, '#f8f4ec': MUTED_BG, '#f7f7f4': MUTED_BG, '#f7f5f1': MUTED_BG, '#f4f2ee': MUTED_BG, '#eef0ea': MUTED_BG,
    '#f08a24': AMBER_D, '#d9873a': AMBER_D, '#7a3d0b': AMBER_TXT, '#7a4817': AMBER_TXT,
    '#192032': INK, '#0f2340': INK2, '#0e1626': INK, '#fbeadb': AMBER_SOFT, '#fbf0de': AMBER_SOFT,
    '#f6ead9': AMBER_SOFT, '#d7deea': BORDER, '#9aa1ad': GRAY_L, '#4a5160': MUTED_FG, '#3d4756': '#2b2f36',
}

RGB_MAP = {
    (11, 17, 28): (27, 30, 34), (10, 15, 25): (27, 30, 34), (10, 19, 32): (27, 30, 34),
    (23, 58, 107): (34, 38, 41),
    (227, 180, 124): (245, 175, 32), (201, 138, 75): (224, 154, 18),
}

FONT_MAP = [
    (re.compile(r"'Geist'"), "'Inter'"),
    (re.compile(r"\bGeist,"), "Inter,"),
    (re.compile(r"'IBM Plex Sans'"), "'Inter'"),
    (re.compile(r"'Barlow Semi Condensed'"), "'Inter'"),
]

hex_re = re.compile(r'#([0-9a-fA-F]{6})\b')
rgb_re = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')
radius_re = re.compile(r'(border-radius\s*:\s*)(\d+)px(?![^;}]*\d+px)')


def radius(m):
    n = int(m.group(2))
    if 10 <= n <= 20:
        return f'{m.group(1)}6px'
    if 21 <= n <= 60:
        return f'{m.group(1)}8px'
    return m.group(0)


def transform(txt, do_fonts=True):
    stats = collections.Counter()

    def hx(m):
        k = '#' + m.group(1).lower()
        if k in HEX_MAP:
            stats['hex'] += 1
            return HEX_MAP[k]
        return m.group(0)

    def rg(m):
        key = tuple(int(x) for x in m.groups())
        if key in RGB_MAP:
            stats['rgb'] += 1
            r, g, b = RGB_MAP[key]
            return m.group(0)[:m.group(0).index('(') + 1] + f'{r},{g},{b}'
        return m.group(0)

    txt = hex_re.sub(hx, txt)
    txt = rgb_re.sub(rg, txt)
    if do_fonts:
        for pat, rep in FONT_MAP:
            txt, n = pat.subn(rep, txt)
            stats['font'] += n
    txt, n = radius_re.subn(radius, txt)
    stats['radius'] += n
    return txt, stats


files = sorted(glob.glob('*.css') + glob.glob('*.html') + glob.glob('vp-scan/*.css') + ['vp-scan/index.html'])
files = [f for f in files if f not in ('fonts.css', 'theme-vitrine.css')]
total = collections.Counter()
for f in files:
    src = open(f, encoding='utf-8').read()
    out, st = transform(src, do_fonts=not f.startswith('vp-scan/'))
    if st:
        print(f'{f:40s}', dict(st))
        total.update(st)
    if APPLY and out != src:
        open(f, 'w', encoding='utf-8').write(out)
print('TOTAL', dict(total), 'APPLIED' if APPLY else 'DRY RUN')
