export const CART_KEY = 'lumis-selection-v1';
const safeQuantity = value => Math.min(99, Math.max(1, Math.trunc(Number(value) || 1)));

export function normalizeCart(raw, catalog) {
  if (!Array.isArray(raw)) return [];
  const valid = (list, id) => list.some(option => option.id === id);
  return raw.slice(0, 100).flatMap(item => {
    if (!item || !catalog.products.some(p => p.id === item.productId)) return [];
    if (!valid(catalog.bases, item.base) || !valid(catalog.colors, item.color) || !valid(catalog.rings, item.ring)) return [];
    // Customer photographs, filenames and image data are never persisted.
    return [{productId:item.productId,base:item.base,color:item.color,ring:item.ring,quantity:safeQuantity(item.quantity)}];
  });
}

export function createCart(catalog, storage = globalThis.localStorage) {
  let items = [];
  try { items = normalizeCart(JSON.parse(storage.getItem(CART_KEY) || '[]'), catalog); } catch { /* Storage may be blocked or corrupt. */ }
  const listeners = new Set();
  const changed = () => {
    try { storage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* In-memory shopping still works. */ }
    for (const listener of listeners) listener(items);
  };
  return {
    get items() { return items; },
    get count() { return items.reduce((total, item) => total + item.quantity, 0); },
    subscribe(listener) { listeners.add(listener); },
    add(configuration) {
      const [item] = normalizeCart([configuration], catalog);
      if (!item) return;
      const existing = items.find(i => ['productId','base','color','ring'].every(key => i[key] === item[key]));
      if (existing) existing.quantity = safeQuantity(existing.quantity + item.quantity);
      else items.push(item);
      changed();
    },
    change(index, delta) { if (!items[index]) return; items[index].quantity = safeQuantity(items[index].quantity + delta); changed(); },
    remove(index) { items.splice(index, 1); changed(); }
  };
}

export function getSubtotal(items, catalog) {
  let total = 0;
  for (const item of items) {
    const product = catalog.products.find(p => p.id === item.productId);
    if (product?.price == null) return null;
    total += product.price * item.quantity;
  }
  return total;
}
