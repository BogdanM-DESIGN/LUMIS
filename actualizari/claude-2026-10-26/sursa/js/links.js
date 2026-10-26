// Direct links to a lamp: #lampa/<model>[/<soclu>/<culoare>/<inel>]. Pure functions, no DOM.
// A link never carries the customer's photo or anything personal, only catalogue ids.
import { PRODUCTS, BASES, COLORS, RINGS, byId } from '../data/catalog.js';

const PREFIX = '#lampa/';

export function linkHash({ product, base, color, ring }) {
  const p = byId(PRODUCTS, product);
  if (!p) return '';
  const d = p.defaults;
  const same = base === d.base && color === d.color && ring === d.ring;
  return PREFIX + (same ? product : [product, base, color, ring].join('/'));
}

// Returns { product, base, color, ring } or null; unknown ids fall back to the model's defaults.
export function parseLink(hash) {
  if (typeof hash !== 'string' || !hash.startsWith(PREFIX)) return null;
  let path;
  try { path = decodeURIComponent(hash.slice(PREFIX.length)); } catch { return null; }
  const [product, base, color, ring] = path.split('/');
  const p = byId(PRODUCTS, product);
  if (!p) return null;
  const pick = (list, id, def) => (byId(list, id) ? id : def);
  return {
    product,
    base: pick(BASES, base, p.defaults.base),
    color: pick(COLORS, color, p.defaults.color),
    ring: pick(RINGS, ring, p.defaults.ring)
  };
}
