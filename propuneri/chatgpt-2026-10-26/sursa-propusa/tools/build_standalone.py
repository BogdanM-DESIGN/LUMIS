"""Builds ../LUMIS-deschide.html: the whole site in one file that opens with a double click (file://).

    python3 tools/build_standalone.py [output.html]

Browsers refuse to load separate module files from file://, so every module becomes a data: URL behind an
import map, and images and fonts are inlined. The output is for showing the site, not for hosting: the
folder stays the source and the hosted version keeps its CSP headers (netlify.toml).
"""
import base64
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'LUMIS-deschide.html'
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.js': 'text/javascript'}


def data_url(path, text=None):
    raw = text.encode('utf-8') if text is not None else path.read_bytes()
    return f'data:{MIME[path.suffix]};base64,' + base64.b64encode(raw).decode('ascii')


def inline_assets(text):
    """img/... and ../fonts/... references become data: URLs."""
    def img(m):
        return data_url(ROOT / 'img' / m.group(1))
    text = re.sub(r'(?<![\w/.])img/([\w.-]+\.(?:webp|png|jpg))', img, text)
    return re.sub(r'url\((?:\.\./)?fonts/([\w.-]+\.woff2)\)', lambda m: f"url({data_url(ROOT / 'fonts' / m.group(1))})", text)


# every module under js/, data/ and vendor/ gets a bare name; relative imports are rewritten to those names
modules = sorted(p for d in ('js', 'data', 'vendor') for p in (ROOT / d).glob('*.js'))
name = {p: 'lumis:' + p.relative_to(ROOT).as_posix() for p in modules}


def rewrite_imports(p, src):
    def to_bare(m):
        target = (p.parent / m.group(2)).resolve()
        if target not in name:
            raise SystemExit(f'{p.name}: import {m.group(2)} not found')
        return f'{m.group(1)}{name[target]}{m.group(3)}'
    return re.sub(r"""((?:from|import)\s*\(?\s*['"])(\.{1,2}/[^'"]+)(['"])""", to_bare, src)


imports = {}
for p in modules:
    src = p.read_text(encoding='utf-8')
    if p.parent.name != 'vendor':
        src = inline_assets(rewrite_imports(p, src))
    imports[name[p]] = data_url(p, src)

html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = '\n'.join(inline_assets((ROOT / 'css' / f).read_text(encoding='utf-8')) for f in ('fonts.css', 'site.css'))
html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="css/fonts.css">', '')
html = html.replace('<link rel="stylesheet" href="css/site.css">', f'<style>\n{css}\n</style>')
html = html.replace('<script type="module" src="js/main.js"></script>',
                    f'<script type="importmap">{json.dumps({"imports": imports})}</script>\n'
                    f'<script type="module">import "{name[ROOT / "js" / "main.js"]}";</script>')
html = inline_assets(html)
left = re.findall(r'(?:src|href)="(?!data:|#|https?:|mailto:)[^"]+"', html)
if left:
    raise SystemExit(f'unresolved references: {left[:5]}')
OUT.write_text(html, encoding='utf-8')
print(f'{OUT}  {OUT.stat().st_size / 1e6:.1f} MB')
