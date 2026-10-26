// Lamp shapes for the website, in millimetres. Mirrors lampa/geom.py line by line;
// tests/geometry.test.mjs checks both give the same radii on samples written by lampa/generate.py.
import { LAMP } from '../data/lamp-spec.js';

export { LAMP };

const smooth01 = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

// Corner cutting; with maxCut (mm) each corner is rounded by at most about 2 * maxCut (same rule as lampa/geom.py).
export function chaikin(pts, it, closed = false, maxCut = null) {
  let p = pts.map((q) => q.slice());
  for (let s = 0; s < it; s++) {
    const out = closed ? [] : [p[0]];
    const n = closed ? p.length : p.length - 1;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const f = maxCut == null ? 0.25 : Math.min(0.25, maxCut * 0.5 ** s / Math.max(len, 1e-9));
      out.push([a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])], [b[0] - f * (b[0] - a[0]), b[1] - f * (b[1] - a[1])]);
    }
    if (!closed) out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}

function ribbedProfile(z, pts) {
  for (let k = 0; k < pts.length - 1; k++) {
    const [a0, a1] = pts[k], [b0, b1] = pts[k + 1];
    if (z >= a0 && z <= b0) { const t = (1 - Math.cos(Math.PI * (z - a0) / (b0 - a0))) / 2; return a1 + (b1 - a1) * t; }
  }
  return 1;
}

// Outer radius (mm) at angle th (rad) and normalised height zn in [0, 1] of the visible shade.
export function shadeRadius(kind, th, zn) {
  const S = LAMP.shade, R = S.radius;
  if (kind === 'litho') return R;
  const p = S.shapes[kind];
  const env = smooth01((zn - p.env_in[0]) / p.env_in[1]) * smooth01((1 - zn) / p.env_out);
  if (kind === 'wave') return R * (1 + p.amplitude * env * Math.cos(p.lobes * (th + (p.twist_deg * Math.PI / 180) * zn)));
  if (kind === 'twist') {
    const phi = p.ribs * (th + (p.twist_deg * Math.PI / 180) * zn);
    const tri = 1 - 2 * Math.acos(Math.max(-1, Math.min(1, Math.cos(phi)))) / Math.PI;
    return R * (1 + p.amplitude * env * (0.75 * tri + 0.25 * Math.cos(phi)));
  }
  if (kind === 'ribbed') {
    const rib = 0.5 + 0.5 * Math.cos(p.ribs * th);
    return R * ribbedProfile(zn, p.profile) * (1 + p.amplitude * env * (Math.pow(rib, 0.6) - 0.5));
  }
  throw new Error(kind);
}

export const baseProfile = (kind) => chaikin(LAMP.base.profiles[kind], LAMP.base.chaikin, false, LAMP.base.corner);

// The body sits on a recessed plinth (the bottom plate), so it seems to float on a line of shadow.
export const bodyBottomR = (kind) => Math.max(...baseProfile(kind).filter(([, z]) => z <= LAMP.plinth.height + 1e-6).map(([r]) => r));
export const plinthR = (kind) => bodyBottomR(kind) - LAMP.plinth.inset;

export function ringProfile() {
  const R = LAMP.ring, top = R.height + R.seat_depth;
  return chaikin([[R.r_in, 0], [R.r_out, 0], [R.r_out, top], [R.r_in, top]], 2, true)
    .map(([r, z]) => [r, z + LAMP.base.height - R.seat_depth]);
}
