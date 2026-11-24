#!/usr/bin/env python3
"""Regroupe les feuilles de style de l'en-tête de chaque page en « packs ».

Les fichiers CSS sources ne sont pas modifiés : chaque pack est la simple
concaténation, dans le même ordre, des feuilles que la page chargeait.
Les séries de <link rel="stylesheet"> du <head> sont fusionnées tant
qu'aucun bloc <style> ne les sépare (l'ordre de la cascade est conservé).

Chaque pack est précédé d'un commentaire HTML qui liste ses sources :
  <!-- vp-pack: fonts.css?v=2 style.css ... -->
Ce commentaire permet de reconstruire ou d'annuler l'opération.

Usage (à la racine du dépôt) :
  python3 tools/css-packs.py build    # crée/rafraîchit les packs et les liens
  python3 tools/css-packs.py check    # échoue si un pack n'est plus à jour
  python3 tools/css-packs.py revert   # remet les <link> d'origine
Après toute modification d'un fichier CSS source : lancer « build ».
"""
import glob, hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {'404.html'}  # liens absolus, page autonome
LINK = re.compile(r'<link rel="stylesheet" href="([^"]+)">')
PACKED = re.compile(r'<!-- vp-pack: ([^>]*?) -->\s*<link rel="stylesheet" href="(vp-pack-[0-9a-f]+\.css)\?v=[0-9a-f]+">')
TOKEN = re.compile(r'<!--.*?-->|<style\b.*?</style>|<script\b[^>]*>.*?</script>|<[^>]+>|[^<]+', re.S)

def src_file(href):
    return href.split('?')[0]

def pack_css(hrefs):
    parts = []
    for h in hrefs:
        with open(os.path.join(ROOT, src_file(h)), encoding='utf-8') as f:
            parts.append('/* === %s === */\n%s\n' % (h, f.read().rstrip()))
    return '\n'.join(parts)

def pack_name(hrefs):
    return 'vp-pack-%s.css' % hashlib.sha1(' '.join(src_file(h) for h in hrefs).encode()).hexdigest()[:8]

def tag(hrefs):
    css = pack_css(hrefs)
    v = hashlib.sha1(css.encode()).hexdigest()[:8]
    return '<!-- vp-pack: %s -->\n<link rel="stylesheet" href="%s?v=%s">' % (' '.join(hrefs), pack_name(hrefs), v), pack_name(hrefs), css

def unpack(html):
    return PACKED.sub(lambda m: '\n'.join('<link rel="stylesheet" href="%s">' % h for h in m.group(1).split()), html)

def pack_head(head):
    out, run, packs = [], [], {}
    def flush():
        if len(run) >= 2:
            t, name, css = tag(run)
            packs[name] = css
            out.append(t)
        elif run:
            out.append('<link rel="stylesheet" href="%s">' % run[0])
        run.clear()
    pending = []  # éléments neutres rencontrés au milieu d'une série
    for tok in TOKEN.findall(head):
        m = LINK.fullmatch(tok)
        if m:
            run.append(m.group(1)); continue
        if tok.startswith('<style'):
            flush(); out.append(tok); continue
        if run:  # élément neutre (script, meta, preload, espace) : reporté après le pack
            pending.append(tok); continue
        out.append(tok)
        continue
    flush()
    return out, pending, packs

def process(path, mode):
    html = open(path, encoding='utf-8').read()
    base = unpack(html)
    if mode == 'revert':
        return base, {}
    if PACKED.search(html):  # déjà regroupée : on rafraîchit les packs sur place
        packs = {}
        def retag(m):
            t, name, css = tag(m.group(1).split())
            packs[name] = css
            return t
        return PACKED.sub(retag, html), packs
    i = base.index('<head>') + 6; j = base.index('</head>')
    head = base[i:j]
    # On fusionne sans déplacer les éléments neutres : chaque série de liens
    # est remplacée sur place par le pack, à la position de son premier lien.
    toks = TOKEN.findall(head)
    groups, cur = [], []
    for k, tok in enumerate(toks):
        if LINK.fullmatch(tok):
            cur.append(k)
        elif tok.startswith('<style'):
            if cur: groups.append(cur); cur = []
    if cur: groups.append(cur)
    packs = {}
    for g in groups:
        if len(g) < 2: continue
        hrefs = [LINK.fullmatch(toks[k]).group(1) for k in g]
        t, name, css = tag(hrefs)
        packs[name] = css
        toks[g[0]] = t
        for k in g[1:]:
            toks[k] = ''
            if k + 1 < len(toks) and toks[k + 1].strip() == '': toks[k + 1] = ''
    new_head = ''.join(toks)
    return base[:i] + new_head + base[j:], packs

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'build'
    pages = sorted(p for p in glob.glob(os.path.join(ROOT, '*.html')) if os.path.basename(p) not in SKIP)
    allpacks, bad = {}, []
    for p in pages:
        new, packs = process(p, mode)
        allpacks.update(packs)
        if mode == 'check':
            if new != open(p, encoding='utf-8').read(): bad.append(os.path.basename(p))
        else:
            open(p, 'w', encoding='utf-8').write(new)
    existing = set(os.path.basename(f) for f in glob.glob(os.path.join(ROOT, 'vp-pack-*.css')))
    if mode == 'check':
        for name, css in allpacks.items():
            f = os.path.join(ROOT, name)
            if not os.path.exists(f) or open(f, encoding='utf-8').read() != css: bad.append(name)
        bad += sorted(existing - set(allpacks))
        if bad: print('Packs à reconstruire :', ', '.join(bad)); sys.exit(1)
        print('Packs à jour :', len(allpacks)); return
    for name in existing - set(allpacks): os.remove(os.path.join(ROOT, name))
    for name, css in allpacks.items():
        open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(css)
    print('%s : %d pages, %d packs' % (mode, len(pages), len(allpacks)))

if __name__ == '__main__':
    main()
