import * as THREE from 'three';

export function createVintageLens() {
  const lens = new THREE.Group();
  const focusRing = new THREE.Group();
  const aperture = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0xb7955e, metalness: .88, roughness: .32 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x24231e, metalness: .7, roughness: .38 });
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x6b6654, metalness: .85, roughness: .42, side: THREE.DoubleSide });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x2c4038, metalness: .25, roughness: .12, clearcoat: 1, transparent: true, opacity: .3, side: THREE.DoubleSide });

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.16, .76, 80, 1, true), ink);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -.35;
  lens.add(barrel);

  for (const [radius, depth, thickness] of [[1.3, -.68, .045], [1.32, -.35, .025], [1.34, .04, .07], [1.12, .08, .028], [.97, .09, .018]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 12, 96), brass);
    ring.position.z = depth;
    lens.add(ring);
  }
  const bezel = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.34, 96), brass);
  bezel.position.z = .04;
  lens.add(bezel);

  const grip = new THREE.InstancedMesh(new THREE.BoxGeometry(.026, .105, .3), brass, 72);
  const transform = new THREE.Object3D();
  for (let index = 0; index < grip.count; index++) {
    const angle = index / grip.count * Math.PI * 2;
    transform.position.set(Math.cos(angle) * 1.3, Math.sin(angle) * 1.3, -.32);
    transform.rotation.z = angle - Math.PI / 2;
    transform.updateMatrix();
    grip.setMatrixAt(index, transform.matrix);
  }
  focusRing.add(grip);
  lens.add(focusRing);

  const backing = new THREE.Mesh(new THREE.CircleGeometry(1.1, 80), ink);
  backing.position.z = -.21;
  lens.add(backing);

  const shape = new THREE.Shape();
  shape.moveTo(0, .06);
  shape.lineTo(-.72, .14);
  shape.quadraticCurveTo(-1.02, -.04, -.82, -.38);
  shape.lineTo(-.22, -.5);
  shape.lineTo(.08, -.2);
  shape.closePath();
  const bladeGeometry = new THREE.ShapeGeometry(shape, 12);
  for (let index = 0; index < 8; index++) {
    const angle = index / 8 * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(angle) * .93, Math.sin(angle) * .93, -.12 + index * .001);
    pivot.rotation.z = angle;
    pivot.add(new THREE.Mesh(bladeGeometry, bladeMaterial));
    aperture.add(pivot);
  }
  lens.add(aperture);
  const element = new THREE.Mesh(new THREE.SphereGeometry(.98, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  element.rotation.x = Math.PI / 2;
  element.scale.y = .16;
  element.position.z = .01;
  lens.add(element);

  return { lens, focusRing, aperture };
}
