// Turns the customer's photo into a lithophane map, in the browser only.
// Bright = thin wall (lets light through), dark = thick wall. Nothing is uploaded or stored.
// The map wraps the whole shade: the shade is about 2:1 (circumference : height).
const W = 2048, H = 1024;
const BAND = Math.round(H * 0.035); // thicker printed frame at the top and bottom
const PH = H - 2 * BAND;

export const PLACEMENTS = [
  { id: 'wrap', name: 'De jur împrejur' },
  { id: 'twice', name: 'Față și spate' },
  { id: 'front', name: 'Doar pe față' }
];

// wide photos read well all round; tall ones keep more of the subject front and back
export const suggestPlacement = (img) => (img.width / img.height >= 1.5 ? 'wrap' : 'twice');

function drawCover(g, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height), dw = img.width * s, dh = img.height * s;
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  g.restore();
}

function layout(g, img, mode) {
  // u = 0.5 is the side facing the viewer
  if (mode === 'wrap') { drawCover(g, img, 0, BAND, W, PH); return; }
  if (mode === 'twice') { drawCover(g, img, W / 4, BAND, W / 2, PH); drawCover(g, img, -W / 4, BAND, W / 2, PH); drawCover(g, img, (3 * W) / 4, BAND, W / 2, PH); return; }
  // front: whole photo, height-fitted, on the side facing the viewer; the rest stays plain
  const s = PH / img.height, dw = Math.min(W * 0.62, img.width * s);
  drawCover(g, img, (W - dw) / 2, BAND, dw, PH);
}

const lumOf = (p, i) => 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];

export function lithoMap(img, mode = suggestPlacement(img)) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.fillStyle = '#bdbdbd';
  g.fillRect(0, 0, W, H);
  layout(g, img, mode);

  // local-contrast boost (unsharp mask on a blurred copy) so faces keep their detail through the wall
  let blur = null;
  if ('filter' in g) {
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const bg = b.getContext('2d', { willReadFrequently: true });
    bg.filter = 'blur(10px)';
    bg.drawImage(c, 0, 0);
    blur = bg.getImageData(0, 0, W, H).data;
  }
  const d = g.getImageData(0, 0, W, H), p = d.data, n = W * H;
  const L = new Float32Array(n);
  for (let k = 0, i = 0; k < n; k++, i += 4) {
    let l = lumOf(p, i);
    if (blur) l += 0.9 * (l - lumOf(blur, i));
    L[k] = l;
  }
  // auto levels from the photo area: 1st and 99th percentile
  const hist = new Uint32Array(256);
  for (let y = BAND; y < H - BAND; y += 2) for (let x = 0; x < W; x += 2) hist[Math.max(0, Math.min(255, L[y * W + x] | 0))]++;
  let total = 0; for (const v of hist) total += v;
  let acc = 0, lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.01) { lo = v; break; } }
  acc = 0;
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= total * 0.01) { hi = v; break; } }
  const span = Math.max(24, hi - lo);
  for (let k = 0, i = 0; k < n; k++, i += 4) {
    let t = Math.min(1, Math.max(0, (L[k] - lo) / span));
    t = Math.pow(t, 1.15);
    const v = Math.round(14 + t * 241);
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  // feather the seam at the back so the two edges meet without a hard line
  if (mode === 'wrap') {
    const f = 48;
    for (let y = 0; y < H; y++) for (let x = 0; x < f; x++) {
      const a = (y * W + x) * 4, b = (y * W + (W - 1 - x)) * 4, w = 0.5 * (1 - x / f);
      const m = (p[a] + p[b]) / 2;
      p[a] = p[a + 1] = p[a + 2] = Math.round(p[a] * (1 - w) + m * w);
      p[b] = p[b + 1] = p[b + 2] = Math.round(p[b] * (1 - w) + m * w);
    }
  }
  g.putImageData(d, 0, 0);
  g.fillStyle = '#383838';
  g.fillRect(0, 0, W, BAND);
  g.fillRect(0, H - BAND, W, BAND);
  return c;
}

export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { reject(new Error('type')); return; }
    if (file.size > 12 * 1024 * 1024) { reject(new Error('size')); return; }
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      if (!im.naturalWidth || !im.naturalHeight || im.naturalWidth * im.naturalHeight > 40_000_000) {
        reject(new Error('dimensions')); return;
      }
      resolve(im);
    };
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    im.src = url;
  });
}
