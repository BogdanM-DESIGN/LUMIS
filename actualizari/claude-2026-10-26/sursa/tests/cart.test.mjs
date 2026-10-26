// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { addLine, setQty, removeLine, count, subtotal, restore, persist, exportSelection, lineKey, STORAGE_KEY } from '../js/cart.js';
import { MAX_QTY } from '../data/catalog.js';

const a = { product: 'wave', base: 'galet', color: 'alb', ring: 'champagne' };
const b = { ...a, color: 'negru' };

const memory = (init = {}) => {
  const m = { ...init };
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, dump: () => m };
};

test('identical configurations merge, different ones stay separate', () => {
  let lines = addLine([], a);
  lines = addLine(lines, a, 2);
  lines = addLine(lines, b);
  assert.equal(lines.length, 2);
  assert.equal(lines.find((l) => lineKey(l) === lineKey(a)).qty, 3);
  assert.equal(count(lines), 4);
});

test('quantity is clamped to 1..MAX_QTY, including when merging', () => {
  let lines = addLine([], a, MAX_QTY);
  lines = addLine(lines, a, 5);
  assert.equal(lines[0].qty, MAX_QTY);
  lines = setQty(lines, lineKey(a), 0);
  assert.equal(lines[0].qty, 1);
  lines = setQty(lines, lineKey(a), 'abc');
  assert.equal(lines[0].qty, 1);
});

test('adding does not mutate the previous state', () => {
  const first = addLine([], a);
  addLine(first, a);
  assert.equal(first[0].qty, 1);
});

test('remove drops only the matching line', () => {
  const lines = removeLine(addLine(addLine([], a), b), lineKey(a));
  assert.deepEqual(lines.map(lineKey), [lineKey(b)]);
});

test('subtotal reports unpriced items instead of inventing a total', () => {
  const s = subtotal(addLine([], a, 3));
  assert.equal(s.known, 0);
  assert.equal(s.unpriced, 3);
});

test('restore survives corrupt, foreign and missing storage', () => {
  assert.deepEqual(restore(memory({ [STORAGE_KEY]: '{not json' })), []);
  assert.deepEqual(restore(memory({ [STORAGE_KEY]: '{"a":1}' })), []);
  assert.deepEqual(restore(null), []);
  assert.deepEqual(restore({ getItem() { throw new Error('blocked'); } }), []);
  const mixed = JSON.stringify([a, { ...a, product: 'nu-exista' }, { ...a, qty: 99 }, { ...b, qty: 2 }]);
  const lines = restore(memory({ [STORAGE_KEY]: mixed }));
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.qty <= MAX_QTY));
});

test('persist never stores photos or file names, and reports failure', () => {
  const s = memory();
  persist(s, addLine([], { ...a, photo: 'data:image/png;base64,xxx', fileName: 'familia.jpg' }));
  const saved = s.dump()[STORAGE_KEY];
  assert.ok(!saved.includes('photo') && !saved.includes('familia'));
  assert.equal(persist({ setItem() { throw new Error('quota'); } }, []), false);
});

test('export lists the selection without personal data', () => {
  const out = JSON.parse(exportSelection(addLine([], { product: 'litofanie', base: 'con', color: 'grafit', ring: 'lumina', fileName: 'eu.jpg' })));
  assert.equal(out.produse[0].model, 'Litofanie');
  assert.equal(out.produse[0].soclu, 'Con');
  assert.ok(!JSON.stringify(out).includes('eu.jpg'));
});
