"""Customer photo -> printable lithophane shade (STL / 3MF).

Same processing as js/litho.js (placement, local contrast, auto levels, gamma, printed frame),
so the website preview and the printed shade come from the same map.

    python lampa/litofanie.py foto.jpg                     # placement chosen like on the site
    python lampa/litofanie.py foto.jpg --asezare fata      # wrap | twice | front  (or: imprejur | fata-spate | fata)
    python lampa/litofanie.py foto.jpg -o comanda-123.3mf
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

sys.path.insert(0, str(Path(__file__).parent))
import geom  # noqa: E402

W, H = 2048, 1024
BAND = round(H * geom.SPEC['shade']['shapes']['litho']['band'])
PH = H - 2 * BAND
ALIASES = {'imprejur': 'wrap', 'fata-spate': 'twice', 'fata': 'front'}


def suggest(img):
    return 'wrap' if img.width / img.height >= 1.5 else 'twice'


def _cover(img, w, h):
    s = max(w / img.width, h / img.height)
    r = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


def litho_map(img, mode):
    """Greyscale map, 0..255: bright = thin wall. u = 0.5 (x = W/2) faces the viewer."""
    img = ImageOps.exif_transpose(img).convert('RGB')
    canvas = Image.new('RGB', (W, H), (189, 189, 189))
    if mode == 'wrap':
        canvas.paste(_cover(img, W, PH), (0, BAND))
    elif mode == 'twice':
        half = _cover(img, W // 2, PH)
        canvas.paste(half, (W // 4, BAND))
        canvas.paste(half.crop((W // 4, 0, W // 2, PH)), (0, BAND))      # back copy, split across the seam
        canvas.paste(half.crop((0, 0, W // 4, PH)), (3 * W // 4, BAND))
    else:
        dw = min(round(W * 0.62), round(img.width * PH / img.height))
        canvas.paste(_cover(img, dw, PH), ((W - dw) // 2, BAND))
    lum = lambda im: np.asarray(im, dtype=np.float32) @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    L = lum(canvas)
    L = L + 0.9 * (L - lum(canvas.filter(ImageFilter.GaussianBlur(10))))   # local contrast
    sample = L[BAND:H - BAND:2, ::2]
    lo, hi = np.percentile(sample, 1), np.percentile(sample, 99)
    t = np.clip((L - lo) / max(24.0, hi - lo), 0, 1) ** 1.15
    v = 14 + t * 241
    if mode == 'wrap':                                                    # feather the seam at the back
        f = 48
        w = 0.5 * (1 - np.arange(f) / f)
        m = (v[:, :f] + v[:, ::-1][:, :f]) / 2
        v[:, :f] = v[:, :f] * (1 - w) + m * w
        v[:, -f:][:, ::-1] = v[:, ::-1][:, :f] * (1 - w) + m * w
    v[:BAND] = 56
    v[H - BAND:] = 56
    return v


def thickness_fn(v):
    L = geom.SPEC['shade']['shapes']['litho']
    tmin, tmax = L['t_min'], L['t_max']
    Hh, Ww = v.shape

    def f(TH, ZN):
        # u matches the website mapping: the side facing the viewer (theta = 270 deg) is u = 0.5
        u = ((TH / (2 * np.pi)) - 0.25) % 1.0
        x = np.clip((u * Ww).astype(int), 0, Ww - 1)
        y = np.clip(((1 - ZN) * (Hh - 1)).astype(int), 0, Hh - 1)       # image row 0 is the top of the shade
        return tmin + (1 - v[y, x] / 255.0) * (tmax - tmin)
    return f


def make(photo_path, mode=None, nth=1024, nz=512):
    with Image.open(photo_path) as source:
        img = ImageOps.exif_transpose(source).convert('RGB')
    mode = ALIASES.get(mode, mode) or suggest(img)
    v = litho_map(img, mode)
    body = geom.shade_body('litho', nth=nth, nz=nz, thickness=thickness_fn(v))
    return geom.union(body, geom.collar()), mode


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('foto')
    ap.add_argument('--asezare', choices=['wrap', 'twice', 'front', *ALIASES])
    ap.add_argument('-o', '--out')
    a = ap.parse_args()
    mesh, mode = make(a.foto, a.asezare)
    out = Path(a.out or Path(a.foto).with_suffix('.3mf').name.replace('.3mf', '-litofanie.3mf'))
    mesh.export(out)
    print(f'{out}  ({mode}, {len(mesh.faces)} triunghiuri, închis: {mesh.is_watertight})')
