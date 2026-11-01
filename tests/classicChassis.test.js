import test from 'node:test';
import assert from 'node:assert/strict';
import { Texture } from 'three';
import { createClassicChassis } from '../src/os/classicChassis.js';

test('classic casing has a real open display and finite geometry at desktop and phone aspects', () => {
  for (const height of [4.16, 5, 14.5]) {
    const texture = new Texture();
    const chassis = createClassicChassis(height, texture);
    assert.equal(chassis.rims.length, 4);
    assert.equal(new Set(chassis.rims.map(rim => rim.material)).size, 4);
    for (const mesh of chassis.group.children) {
      if (mesh === chassis.screen) continue;
      const { position, normal, uv } = mesh.geometry.attributes;
      assert.ok([...position.array, ...normal.array, ...uv.array].every(Number.isFinite));
      for (let i = 0; i < position.count; i += 3) {
        if (normal.getZ(i) < .9) continue;
        const x = (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
        const y = (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3;
        assert.ok(!(Math.abs(x) < 2.3 && Math.abs(y - height * .04) < height * .20), 'Casing must not paint over the live display');
      }
    }
    assert.equal(chassis.screen.material.map, texture);
    new Set(chassis.resources).forEach(resource => resource.dispose()); texture.dispose();
  }
  assert.throws(() => createClassicChassis(0), /positive/);
});
