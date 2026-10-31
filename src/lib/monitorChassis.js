import * as THREE from 'three';

function roundedRect(path, x, y, width, height, radius) {
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

export function createMonitorChassis(width, height, inset, chin, texture = null) {
  const w = width / 100, h = height / 100, pad = inset / 100, bottom = chin / 100;
  const screenW = w - pad * 2, screenH = h - pad - bottom;
  const screenY = (bottom - pad) / 2;
  const bevel = Math.min(.10, pad * .25);
  const chassis = new THREE.Group();
  const plastic = new THREE.MeshStandardMaterial({ color: 0xa8a393, roughness: .68, metalness: .06, bumpMap: texture, bumpScale: .008 });
  const seam = new THREE.MeshStandardMaterial({ color: 0x49483e, roughness: .82 });
  const lip = new THREE.MeshStandardMaterial({ color: 0x252b27, roughness: .37, metalness: .15 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x777469, roughness: .48, metalness: .7 });

  const ring = (outerW, outerH, radius, innerW, innerH, innerRadius, y, depth, bevel, material, z) => {
    const shape = roundedRect(new THREE.Shape(), -outerW / 2, -outerH / 2 + y, outerW, outerH, radius);
    shape.holes.push(roundedRect(new THREE.Path(), -innerW / 2, screenY - innerH / 2, innerW, innerH, innerRadius));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 12 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    chassis.add(mesh);
  };

  ring(w - .16, h - .16, .34, screenW + .16, screenH + .16, .31, 0, .12, .04, seam, -.24);
  ring(w - bevel * 2 - .04, h - bevel * 2 - .04, .32, screenW + .12, screenH + .12, .29, 0, .18, bevel, plastic, -.12);
  ring(screenW + .18, screenH + .18, .31, screenW - .02, screenH - .02, .24, screenY, .10, .035, lip, .02);

  const screwGeometry = new THREE.CylinderGeometry(.038, .038, .018, 20);
  screwGeometry.rotateX(Math.PI / 2);
  const slotGeometry = new THREE.BoxGeometry(.046, .008, .006);
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const screw = new THREE.Mesh(screwGeometry, metal);
    screw.position.set(x * (w / 2 - .23), y * (h / 2 - .23), .18);
    const slot = new THREE.Mesh(slotGeometry, seam);
    slot.position.copy(screw.position);
    slot.position.z += .013;
    slot.rotation.z = x * y * .55;
    chassis.add(screw, slot);
  }
  return chassis;
}

export function disposeMonitorChassis(chassis) {
  const resources = new Set();
  chassis.traverse(object => {
    if (object.geometry) resources.add(object.geometry);
    if (object.material) resources.add(object.material);
  });
  resources.forEach(resource => resource.dispose());
}
