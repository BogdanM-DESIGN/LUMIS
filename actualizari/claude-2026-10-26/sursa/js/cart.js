// Cart state: pure functions plus a defensive localStorage adapter.
// A line is { product, base, color, ring, qty }. Photos and file names are never part of a line.
import { PRODUCTS, BASES, COLORS, RINGS, MAX_QTY, byId } from '../data/catalog.js';

export const STORAGE_KEY = 'lumis.cart.v1';

export const lineKey = (l) => [l.product, l.base, l.color, l.ring].join('|');

const clampQty = (q) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(q)) || 1));

export function isValidLine(l) {
  return !!l && typeof l === 'object'
    && !!byId(PRODUCTS, l.product) && !!byId(BASES, l.base)
    && !!byId(COLORS, l.color) && !!byId(RINGS, l.ring)
    && Number.isFinite(Number(l.qty)) && Number(l.qty) >= 1;
}

const clean = (l) => ({ product: l.product, base: l.base, color: l.color, ring: l.ring, qty: clampQty(l.qty) });

// Identical configurations merge into one line; the total per line never exceeds MAX_QTY.
export function addLine(lines, item, qty = 1) {
  const next = lines.map((l) => ({ ...l }));
  const k = lineKey(item);
  const hit = next.find((l) => lineKey(l) === k);
  if (hit) hit.qty = clampQty(hit.qty + qty);
  else next.push(clean({ ...item, qty }));
  return next;
}

export function setQty(lines, key, qty) {
  return lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(qty) } : { ...l }));
}

export const removeLine = (lines, key) => lines.filter((l) => lineKey(l) !== key);

export const count = (lines) => lines.reduce((n, l) => n + l.qty, 0);

// Prices may be unknown (null). Report what is known and how many items lack a price.
export function subtotal(lines) {
  let known = 0, unpriced = 0;
  for (const l of lines) {
    const p = byId(PRODUCTS, l.product)?.price;
    if (typeof p === 'number') known += p * l.qty; else unpriced += l.qty;
  }
  return { known, unpriced };
}

export function restore(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    let lines = [];
    for (const l of data) if (isValidLine(l)) lines = addLine(lines, l, clampQty(l.qty));
    return lines;
  } catch {
    return [];
  }
}

export function persist(storage, lines) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(lines.map(clean)));
    return true;
  } catch {
    return false;
  }
}

// Human-readable selection the owner can receive by e-mail or message. No photo, no file name.
export function exportSelection(lines, now = new Date()) {
  return JSON.stringify({
    format: 'lumis-selectie',
    versiune: 1,
    creat: now.toISOString(),
    produse: lines.map((l) => ({
      model: byId(PRODUCTS, l.product).name,
      soclu: byId(BASES, l.base).name,
      culoare: byId(COLORS, l.color).name,
      inel: byId(RINGS, l.ring).name,
      cantitate: l.qty,
      fotografie: byId(PRODUCTS, l.product).personal ? 'se trimite separat, după confirmare' : undefined
    }))
  }, null, 2);
}
