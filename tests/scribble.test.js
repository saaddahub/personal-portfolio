import test from 'node:test';
import assert from 'node:assert/strict';
import { arrow, loop, rng, underline } from '../src/scribble/ink.js';

test('crayon marks are seeded: same seed, same mark; finite closed outlines that land on target', () => {
  const draw = seed => arrow([0, 0], [120, 40], rng(seed), { bend: 0.3, width: 3 });
  assert.deepEqual(draw(5), draw(5));
  assert.notEqual(draw(5)[0].fill, draw(6)[0].fill);
  const marks = [...draw(5), ...loop({ x: 0, y: 0, w: 120, h: 50 }, rng(2)), ...underline({ x: 0, y: 0, w: 80, h: 20 }, rng(3))];
  for (const s of marks) {
    assert.match(s.fill, /^M[^NaInfity]+Z$/);
    assert.ok(s.len > 0 && s.width > 0 && s.box.every(Number.isFinite));
  }
  const [shaft, w1, w2] = draw(5);
  assert.ok(shaft.box[2] >= 105 && shaft.box[2] <= 125, 'shaft reaches the tip');
  assert.ok(w1.len > 6 && w2.len > 6, 'two head flicks');
});
