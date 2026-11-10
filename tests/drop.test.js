import test from 'node:test';
import assert from 'node:assert/strict';
import { RING, blobPath, chase, poke, ripple, stretch } from '../src/drop/physics.js';

test('the drop glides to its target, overshoots a little, and settles there', () => {
  const s = { x: 0, y: 0, vx: 0, vy: 0 };
  let peak = 0;
  for (let i = 0; i < 240; i++) { chase(s, 100, 0, 1 / 60); peak = Math.max(peak, s.x); }
  assert.ok(peak > 100 && peak < 115, `overshoots gently (${peak.toFixed(1)})`);
  assert.ok(Math.abs(s.x - 100) < 0.5 && Math.abs(s.vx) < 1, 'comes to rest on the target');
});

test('stretch grows with speed but never tears the drop', () => {
  assert.equal(stretch(0, 0), 0);
  assert.ok(stretch(600, 0) > 0);
  assert.ok(stretch(1e6, 1e6) <= 0.32);
});

test('a poke ripples round the rim and dies away', () => {
  const w = new Array(RING).fill(0), v = new Array(RING).fill(0);
  poke(v, 0, -4);
  let moved = 0;
  for (let i = 0; i < 30; i++) { ripple(w, v, 1 / 60); moved = Math.max(moved, Math.abs(w[RING / 2])); }
  assert.ok(moved > 0, 'the far side feels it');
  for (let i = 0; i < 600; i++) ripple(w, v, 1 / 60);
  assert.ok(w.every(x => Math.abs(x) < 0.005), 'and it settles round again');
});

test('the rim is a closed path inside its box', () => {
  const d = blobPath(new Array(RING).fill(0), 20, 60);
  assert.match(d, /^M.*Z$/);
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  assert.ok(nums.every(n => n >= 0 && n <= 60));
});
