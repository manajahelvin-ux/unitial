#!/usr/bin/env python3
"""Audit SEO / GEO du site ComparateurPro (statique)."""
import json, re, sys, pathlib, xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent
PAGES = [ROOT / 'index.html'] + sorted((ROOT / 'assurance-tns').glob('*/index.html'))
PROD = 'https://www.comparateurpro.fr'

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Doc(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors, self.ids, self.imgs = [], [], set(), []
        self.heads, self.links, self.title, self.metas = [], [], '', {}
        self._cur_head, self._in_title = None, False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in VOID:
            if tag == 'img':
                self.imgs.append(a)
            if tag == 'meta':
                key = a.get('name') or a.get('property') or ''
                if key: self.metas[key] = a.get('content', '')
            return
        self.stack.append(tag)
        if tag in ('h1','h2','h3','h4','h5','h6'):
            self._cur_head = [tag, '']
            self.heads.append(self._cur_head)
        if tag == 'title': self._in_title = True
        if tag == 'a' and a.get('href') is not None: self.links.append(a['href'])
        if 'id' in a:
            if a['id'] in self.ids: self.errors.append(f'id dupliqué: {a["id"]}')
            self.ids.add(a['id'])
    def handle_endtag(self, tag):
        if tag in VOID: return
        if self.stack and self.stack[-1] == tag: self.stack.pop()
        else:
            self.errors.append(f'balise fermée hors ordre: </{tag}> (pile={self.stack[-3:]})')
            if tag in self.stack:
                while self.stack and self.stack[-1] != tag: self.stack.pop()
                if self.stack: self.stack.pop()
        if tag == 'title': self._in_title = False
        if self._cur_head and tag == self._cur_head[0]: self._cur_head = None
    def handle_data(self, data):
        if self._in_title: self.title += data
        if self._cur_head: self._cur_head[1] += data

def rel(p): return str(p.relative_to(ROOT))

problems, notes = [], []
parsed = {}
for p in PAGES:
    html = p.read_text(encoding='utf-8')
    d = Doc(); d.feed(html)
    parsed[p] = (html, d)
    tag = rel(p)

    # --- Structure HTML ---
    if d.stack: problems.append(f'{tag}: balises non fermées {d.stack}')
    problems += [f'{tag}: {e}' for e in d.errors]

    # --- Title / meta description ---
    t = d.title.strip()
    if not t: problems.append(f'{tag}: <title> manquant')
    elif not (30 <= len(t) <= 65): problems.append(f'{tag}: title {len(t)} car. (cible 30-65) -> "{t}"')
    desc = d.metas.get('description','')
    if not desc: problems.append(f'{tag}: meta description manquante')
    elif not (70 <= len(desc) <= 165): problems.append(f'{tag}: meta description {len(desc)} car. (cible 70-165)')
    if 'À COMPLÉTER' in html: problems.append(f'{tag}: contient encore "[À COMPLÉTER]"')

    # --- canonical / robots ---
    can = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not can: problems.append(f'{tag}: canonical manquant')
    if not d.metas.get('robots'): problems.append(f'{tag}: meta robots manquante')

    # --- Hn ---
    h1 = [h for h in d.heads if h[0]=='h1']
    if len(h1) != 1: problems.append(f'{tag}: {len(h1)} <h1> (attendu 1)')
    body = html.split('<footer', 1)[0]
    seq = [int(h[0][1]) for h in d.heads if h[0] in ('h1','h2','h3') or True]
    heads_main = [h for h in d.heads if h[0] in ('h1','h2','h3')]
    seq = [int(h[0][1]) for h in heads_main]
    for a,b in zip(seq, seq[1:]):
        if b - a > 1:
            problems.append(f'{tag}: saut de niveau h{a} -> h{b}'); break
    words = len(re.sub(r'<[^>]+>',' ', re.sub(r'(?s)<script.*?</script>|<style.*?</style>','',html)).split())
    notes.append(f'{tag}: mots≈{words} | h1={len(h1)} h2={sum(1 for h in d.heads if h[0]=="h2")} h3={sum(1 for h in d.heads if h[0]=="h3")} | title={len(t)} | desc={len(desc)} | FAQ={html.count(chr(34)+"Question"+chr(34))}')

    # --- Images ---
    for img in d.imgs:
        if not img.get('alt'): problems.append(f'{tag}: img sans alt -> {img.get("src","?")[:60]}')
        elif len(img['alt']) < 5: problems.append(f'{tag}: alt trop court -> {img.get("src","?")[:60]}')

    # --- Liens internes ---
    for href in d.links:
        if href.startswith(('http://','https://','mailto:','tel:','javascript:')): continue
        if href.startswith('#'):
            if href[1:] and href[1:] not in d.ids and href[1:] != 'top':
                problems.append(f'{tag}: ancre morte {href}')
            continue
        path, _, frag = href.partition('#')
        target = (p.parent / path).resolve()
        if not target.exists(): problems.append(f'{tag}: lien cassé -> {href}')

    # --- JSON-LD ---
    for i, block in enumerate(re.findall(r'(?s)<script type="application/ld\+json">(.*?)</script>', html)):
        try:
            data = json.loads(block)
        except Exception as e:
            problems.append(f'{tag}: JSON-LD #{i+1} invalide -> {e}'); continue
        graph = data.get('@graph', [data])
        types = [g.get('@type') for g in graph]
        notes.append(f'{tag}: JSON-LD #{i+1} OK -> {types}')
        if p == ROOT/'index.html':
            if 'WebSite' not in types: problems.append(f'{tag}: schema WebSite absent')
            if 'Organization' not in types: problems.append(f'{tag}: schema Organization absent')
        if 'FAQPage' in types:
            faq = [g for g in graph if g.get('@type')=='FAQPage'][0]
            qs = [q['name'] for q in faq.get('mainEntity',[])]
            for q in qs:
                if q not in html: problems.append(f'{tag}: question FAQ du schema absente du HTML -> {q[:50]}')
            if len(qs) < 3: problems.append(f'{tag}: FAQPage avec seulement {len(qs)} questions (GEO: viser 5+)')
        if 'Article' in types:
            art = [g for g in graph if g.get('@type')=='Article'][0]
            if not art.get('author'): problems.append(f'{tag}: Article sans author (E-E-A-T)')
            if not art.get('dateModified') and not art.get('datePublished'):
                problems.append(f'{tag}: Article sans datePublished/dateModified')

# --- Sitemap ---
sm = ROOT/'sitemap.xml'
try:
    root = ET.parse(sm).getroot()
    ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    locs = [l.text for l in root.findall('.//s:loc', ns)]
    for l in locs:
        if not l or not l.startswith(PROD): problems.append(f'sitemap.xml: URL hors domaine -> {l}')
    notes.append(f'sitemap.xml: XML valide, {len(locs)} URL')
    # cohérence canonical <-> sitemap
    cans = {re.search(r'<link rel="canonical" href="([^"]+)"', parsed[p][0]).group(1) for p in PAGES}
    for c in sorted(cans - set(locs)): problems.append(f'sitemap.xml: canonical absent du sitemap -> {c}')
    for l in locs:
        if l not in cans and l != PROD+'/': problems.append(f'sitemap.xml: URL sans page correspondante -> {l}')
except ET.ParseError as e:
    problems.append(f'sitemap.xml: XML invalide -> {e}')

# --- robots.txt ---
rb = (ROOT/'robots.txt').read_text(encoding='utf-8')
if 'Sitemap:' not in rb: problems.append('robots.txt: directive Sitemap absente')
for crawler in ['GPTBot','ClaudeBot','PerplexityBot']:
    if crawler not in rb: notes.append(f'robots.txt: {crawler} non cité explicitement (autorisé par défaut via User-agent: *)')

print('\n'.join('· ' + n for n in notes))
print('\n=== PROBLÈMES (' + str(len(problems)) + ') ===')
print('\n'.join('✗ ' + x for x in problems) if problems else 'aucun')
sys.exit(1 if problems else 0)
