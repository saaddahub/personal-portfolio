import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Raycaster, Vector3 } from 'three';
import { createMonitorChassis, disposeMonitorChassis } from '../src/lib/monitorChassis.js';

test('desktop and phone chassis fit the viewport and leave the live screen unobstructed', () => {
  for (const [width, height, inset, chin] of [[1200, 760, 34, 104], [340, 700, 18, 122], [720, 360, 18, 82]]) {
    const chassis = createMonitorChassis(width, height, inset, chin);
    try {
      chassis.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(chassis);
      assert.ok(bounds.max.x - bounds.min.x <= width / 100);
      assert.ok(bounds.max.y - bounds.min.y <= height / 100);
      chassis.traverse(object => {
        if (object.geometry) for (const value of object.geometry.attributes.position.array) assert.ok(Number.isFinite(value));
      });
      const screenY = (chin - inset) / 200;
      const ray = new Raycaster(new Vector3(0, screenY, 8), new Vector3(0, 0, -1));
      assert.equal(ray.intersectObject(chassis, true).length, 0, 'The glass opening must not cover the iframe');
      ray.ray.origin.y = -height / 200 + chin / 200;
      assert.ok(ray.intersectObject(chassis, true).length > 0, 'The control panel has a solid physical surface');
    } finally { disposeMonitorChassis(chassis); }
  }
});
