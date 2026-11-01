import assert from 'node:assert/strict';
import { FPS, DURATION, FRAME_COUNT, shotAt, handoffAt, ease } from './sequence.mjs';

assert.equal(FPS, 60);
assert.equal(FRAME_COUNT, DURATION * FPS);
for (let frame = 0; frame < FRAME_COUNT; frame++) {
  const s = shotAt(frame / FPS);
  assert.ok(s.progress >= 0 && s.progress <= 1);
  assert.ok(s.chooser >= 0 && s.chooser <= 1);
  if (frame) assert.ok(Math.abs(s.progress - shotAt((frame - 1) / FPS).progress) < .05, `Camera discontinuity at ${frame}`);
}
assert.equal(shotAt(3.65).era, 0);
assert.equal(shotAt(3.65).progress, 1);
assert.equal(shotAt(6.15).progress, 0);
assert.equal(shotAt(9.15).era, 1);
assert.equal(shotAt(9.15).progress, 1);
assert.equal(handoffAt(.8), 0);
assert.equal(handoffAt(1), 1);
assert.ok(ease(.0001) < 1e-10);
assert.ok(1 - ease(.9999) < 1e-10);
console.log('720-frame timeline: continuity, both destinations, handoff and easing checks passed.');
