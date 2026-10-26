import test from 'node:test';
import assert from 'node:assert/strict';
import { linkHash, parseLink } from '../js/links.js';

test('default configuration gives a short link', () => {
  assert.equal(linkHash({ product: 'wave', base: 'galet', color: 'alb', ring: 'champagne' }), '#lampa/wave');
});

test('custom configuration round-trips', () => {
  const c = { product: 'ribbed', base: 'con', color: 'champagne', ring: 'champagne' };
  assert.deepEqual(parseLink(linkHash(c)), c);
});

test('short link opens with the model defaults', () => {
  assert.deepEqual(parseLink('#lampa/twist'), { product: 'twist', base: 'monolit', color: 'negru', ring: 'champagne' });
});

test('unknown ids are rejected or replaced by defaults', () => {
  assert.equal(parseLink('#lampa/nu-exista'), null);
  assert.equal(parseLink('#colectie'), null);
  assert.equal(parseLink(''), null);
  assert.equal(parseLink(undefined), null);
  assert.deepEqual(parseLink('#lampa/wave/<script>/x/y'), { product: 'wave', base: 'galet', color: 'alb', ring: 'champagne' });
  assert.equal(parseLink('#lampa/%E0%A4%A'), null); // malformed escape must not throw
});
