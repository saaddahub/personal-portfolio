import test from 'node:test';
import assert from 'node:assert/strict';
import { specularMap } from '../src/glass.js';

test('the reflection is brightest on the rim facing the light and empty in the middle', () => {
  const w = 120, h = 80, d = specularMap(w, h, 20, 20);
  const alpha = (x, y) => d[(y * w + x) * 4 + 3];
  assert.ok(alpha(3, 40) > alpha(116, 40), 'left rim (toward the light) outshines the right rim');
  assert.ok(alpha(60, 2) > alpha(60, 77), 'top rim outshines the bottom rim');
  assert.ok(alpha(60, 60) < 10, 'the flat centre stays clear');
  assert.equal(alpha(0, 0), 0, 'nothing outside the rounded corner');
});
