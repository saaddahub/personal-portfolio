import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTree, stepPetal, SEED } from '../src/blossom.js';

test('the same seed grows the same tree', () => {
  const a = generateTree(1440, 900), b = generateTree(1440, 900);
  assert.deepEqual(a.segments.slice(0, 20), b.segments.slice(0, 20));
  assert.equal(a.dots.length, b.dots.length);
});

test('the tree is rooted at the base, blooms, and grows in distance order', () => {
  const t = generateTree(1440, 900);
  assert.equal(t.segments[0].d0, 0);
  assert.equal(t.segments[0].y1, 900);
  assert.ok(t.dots.length > 2000, 'canopy has blossoms');
  assert.ok(t.dots.every((d, i) => i === 0 || t.dots[i - 1].dist <= d.dist));
  assert.ok(t.dots.every(d => d.dist <= t.maxDist));
  const top = Math.min(...t.dots.map(d => d.y));
  assert.ok(top > 0 && top < 450, `canopy reaches the upper half (top ${top})`);
});

test('a phone-shaped viewport still fits the trunk on screen', () => {
  const t = generateTree(390, 844, 11, 0.7);
  assert.ok(t.baseX > 0 && t.baseX < 390);
  assert.ok(Math.min(...t.dots.map(d => d.y)) > 0);
});

// Follow each main limb from the fork as a chain of connected segments.
const limbs = tree => {
  const segs = tree.segments.filter(s => s.depth === 1);
  const fork = Math.min(...segs.map(s => s.d0));
  return segs.filter(s => s.d0 === fork).map(start => {
    const chain = [start];
    for (let s = start, next; (next = segs.find(n => n.x1 === s.x2 && n.y1 === s.y2)); s = next) chain.push(next);
    return chain;
  });
};
const crosses = (p, q) => {
  const side = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  const [a, b, c, d] = [{ x: p.x1, y: p.y1 }, { x: p.x2, y: p.y2 }, { x: q.x1, y: q.y1 }, { x: q.x2, y: q.y2 }];
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
};

test('the two main limbs never cross', () => {
  for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080], [390, 844], [768, 1024]]) {
    const [left, right] = limbs(generateTree(w, h, SEED, w < 760 ? 0.7 : 1));
    assert.ok(left && right, `${w}x${h} forks into two limbs`);
    assert.ok(!left.some(p => right.some(q => crosses(p, q))), `${w}x${h} limbs cross`);
  }
});

test('petals drift with the wind and fall', () => {
  const p = { x: 500, y: 100, vx: 0, vy: 0, z: 1, rot: 0, vr: 0.5, flip: 0, vf: 2 };
  for (let i = 0; i < 120; i++) stepPetal(p, 1 / 60, -34, 0);
  assert.ok(p.x < 500, 'carried left by the wind');
  assert.ok(p.y > 100, 'falls under gravity');
  assert.ok(Math.abs(p.vy) < 60, 'falls gently, not like a stone');
});
