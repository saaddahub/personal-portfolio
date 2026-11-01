import * as THREE from 'three';

// This aperture is shared with the DOM: the reference finish never paints the live desktop.
export const CLASSIC_APERTURE = { left: .097, right: .097, top: .097, bottom: .18 };

function contour(bounds, height, radiusX, radiusY) {
  const x = -4 + bounds.left * 8, y = height / 2 - bounds.bottom * height;
  const w = (bounds.right - bounds.left) * 8, h = (bounds.bottom - bounds.top) * height;
  const rx = Math.min(radiusX, w / 2), ry = Math.min(radiusY, h / 2);
  const p = new THREE.Shape();
  p.moveTo(x + rx, y); p.lineTo(x + w - rx, y); p.quadraticCurveTo(x + w, y, x + w, y + ry);
  p.lineTo(x + w, y + h - ry); p.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
  p.lineTo(x + rx, y + h); p.quadraticCurveTo(x, y + h, x, y + h - ry);
  p.lineTo(x, y + ry); p.quadraticCurveTo(x, y, x + rx, y);
  return p;
}

export function createClassicChassis(height, texture) {
  if (!Number.isFinite(height) || height <= 0) throw new RangeError('A positive chassis height is required');
  const group = new THREE.Group(), resources = [];
  // Preserve physical top/chin proportions on phones instead of stretching the dial and legends.
  const finishHeight = height > 8 ? 5 : height;
  const fromTop = value => value * finishHeight / height;
  const fromBottom = value => 1 - (1 - value) * finishHeight / height;
  const outer = { left: .006, right: .994, top: .006, bottom: .99 };
  const mouth = { left: .045, right: .955, top: fromTop(.052), bottom: fromBottom(.855) };
  const aperture = { left: CLASSIC_APERTURE.left, right: 1 - CLASSIC_APERTURE.right, top: fromTop(CLASSIC_APERTURE.top), bottom: fromBottom(1 - CLASSIC_APERTURE.bottom) };
  const skin = new THREE.MeshPhysicalMaterial({ map: texture, color: '#e0e4ee', roughness: .85, metalness: 0, specularIntensity: .12, emissiveMap: texture, emissive: '#ffffff', emissiveIntensity: .08 });
  resources.push(skin);
  function ring(outside, inside, depth, bevel, z, material, rx, ry, innerRx, innerRy) {
    const shape = contour(outside, height, rx, ry);
    shape.holes.push(contour(inside, height, innerRx, innerRy));
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 5, curveSegments: 24, steps: 1 });
    const positions = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i), bottom = y + height / 2, top = height / 2 - y;
      const v = height <= 8 ? bottom / height : top < finishHeight * .15 ? 1 - top / finishHeight : bottom < finishHeight * .22 ? bottom / finishHeight : .22 + (bottom - finishHeight * .22) / (height - finishHeight * .37) * .63;
      uv.setXY(i, (positions.getX(i) + 4) / 8, v);
    }
    const mesh = new THREE.Mesh(geo, material); mesh.position.z = z;
    resources.push(geo); group.add(mesh); return mesh;
  }
  ring(outer, mouth, 1.35, .045, -1.35, skin, .22, Math.min(.22, height * .04), .40, finishHeight * .055);
  const recessMaterial = skin.clone(); recessMaterial.roughness = .65; resources.push(recessMaterial);
  const recess = ring(mouth, aperture, .11, .025, -.12, recessMaterial, .40, finishHeight * .055, .45, finishHeight * .087);

  // Four batched material regions retain the existing content-driven rim approximation.
  const geometry = recess.geometry, position = geometry.attributes.position;
  const buckets = Array.from({ length: 4 }, () => ({ position: [], normal: [], uv: [] }));
  for (let i = 0; i < position.count; i += 3) {
    const x = (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
    const y = (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3 - height * .04;
    const side = Math.abs(x / 3.4) > Math.abs(y / (height * .38)) ? (x < 0 ? 0 : 1) : (y > 0 ? 2 : 3);
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      for (let vertex = i; vertex < i + 3; vertex++) for (let component = 0; component < attribute.itemSize; component++) buckets[side][name].push(attribute.array[vertex * attribute.itemSize + component]);
    }
  }
  const batched = new THREE.BufferGeometry(); let start = 0;
  for (const name of ['position', 'normal', 'uv']) batched.setAttribute(name, new THREE.Float32BufferAttribute(buckets.flatMap(bucket => bucket[name]), name === 'uv' ? 2 : 3));
  const rimMaterials = buckets.map(() => { const m = recessMaterial.clone(); resources.push(m); return m; });
  buckets.forEach((bucket, i) => { batched.addGroup(start, bucket.position.length / 3, i); start += bucket.position.length / 3; });
  resources.push(batched); recess.geometry = batched; recess.material = rimMaterials;
  const previewMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const previewGeometry = new THREE.PlaneGeometry(8, height);
  const screen = new THREE.Mesh(previewGeometry, previewMaterial); screen.position.z = .06; group.add(screen);
  resources.push(previewMaterial, previewGeometry);
  return { group, screen, rims: rimMaterials.map(material => ({ material })), resources };
}
