import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { createVintageLens } from '../src/lib/vintageLens.js';

test('procedural lens has finite, camera-sized geometry and independently moving optics', () => {
  const { lens, focusRing, aperture } = createVintageLens();
  const resources = new Set();
  lens.updateMatrixWorld(true);
  try {
    assert.equal(aperture.children.length, 8);
    assert.ok(lens.children.includes(focusRing) && lens.children.includes(aperture));
    lens.traverse(object => {
      if (!object.geometry) return;
      resources.add(object.geometry);
      resources.add(object.material);
      for (const value of object.geometry.attributes.position.array) assert.ok(Number.isFinite(value));
    });
    const bounds = new Box3().setFromObject(lens);
    for (const value of [...bounds.min.toArray(), ...bounds.max.toArray()]) assert.ok(Number.isFinite(value));
    assert.ok(bounds.max.x - bounds.min.x < 3, 'Lens fits the hero camera framing');
    const barrel = lens.children[0].rotation.toArray();
    focusRing.rotation.z += .7;
    aperture.children[0].rotation.z += .3;
    assert.deepEqual(lens.children[0].rotation.toArray(), barrel, 'Focusing does not move the barrel');
  } finally {
    resources.forEach(resource => resource.dispose());
  }
});
