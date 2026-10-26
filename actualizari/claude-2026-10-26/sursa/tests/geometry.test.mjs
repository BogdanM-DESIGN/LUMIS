// The website preview and the printed lamp must have the same shapes.
// Samples come from lampa/generate.py (Python); this checks the JavaScript gives the same numbers.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shadeRadius, baseProfile } from '../js/geometry.js';

const S = JSON.parse(readFileSync(new URL('./fixtures/shape-samples.json', import.meta.url)));

for (const kind of Object.keys(S.shades)) {
  test(`shade ${kind}: site radius equals print radius`, () => {
    let worst = 0;
    S.zn.forEach((zn, i) => S.theta.forEach((th, j) => {
      worst = Math.max(worst, Math.abs(shadeRadius(kind, th, zn) - S.shades[kind][i][j]));
    }));
    assert.ok(worst < 1e-4, `largest difference ${worst} mm`);
  });
}

for (const kind of Object.keys(S.base_profiles)) {
  test(`base ${kind}: site profile equals print profile`, () => {
    const js = baseProfile(kind), py = S.base_profiles[kind];
    assert.equal(js.length, py.length);
    js.forEach(([r, z], i) => { assert.ok(Math.abs(r - py[i][0]) < 1e-4 && Math.abs(z - py[i][1]) < 1e-4); });
  });
}
