import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createClassicChassis } from './classicChassis';
import classicFinish from '../../docs/concepts/rowan-98-crt.png';

// World units: the focused chassis spans eight units across the viewport.
export default function HardwareScene({ era, phase, skip, brightness, scenePreset, emission, onReady, onFallback }) {
  const host = useRef(null), api = useRef(null), latest = useRef({ era, phase, skip, brightness, scenePreset, emission, onReady, onFallback });
  latest.current = { era, phase, skip, brightness, scenePreset, emission, onReady, onFallback };
  useEffect(() => {
    const container = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
    catch { latest.current.onFallback(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor('#111714'); renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
    const ambient = new THREE.HemisphereLight('#e8e7de', '#19231b', 1.5); scene.add(ambient);
    const key = new THREE.DirectionalLight('#fff0d7', 3); key.position.set(-5, 8, 9); scene.add(key);
    const fill = new THREE.DirectionalLight('#b8cee4', 1.5); fill.position.set(8, 3, 4); scene.add(fill);
    const objects = [], resources = [];
    const material = (color, roughness = .65, metalness = 0) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); resources.push(m); return m; };
    const metal = material('#343b3b', .32, .8);
    let needsRender = true;
    const finish = new THREE.TextureLoader().load(classicFinish, () => { needsRender = true; }); finish.colorSpace = THREE.SRGBColorSpace;
    finish.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); resources.push(finish);
    const previewCanvas = document.createElement('canvas'); previewCanvas.width = 1440; previewCanvas.height = 900;
    const ctx = previewCanvas.getContext('2d');
    ctx.fillStyle = '#e9e7df'; ctx.fillRect(0, 0, 1440, 900);
    ctx.fillStyle = '#425c49'; ctx.beginPath(); ctx.moveTo(980, 0); ctx.lineTo(1440, 0); ctx.lineTo(1440, 900); ctx.lineTo(1230, 900); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f3f3eb'; ctx.fillRect(0, 0, 76, 900); ctx.fillRect(76, 0, 1364, 42);
    ctx.fillStyle = '#667d65'; for (let i = 0; i < 7; i++) { ctx.strokeStyle = '#667d65'; ctx.lineWidth = 2; ctx.strokeRect(26, 35 + i * 72, 24, 24); }
    ctx.fillStyle = '#46684e'; ctx.font = '18px sans-serif'; ctx.fillText('Rowan', 104, 28); ctx.fillText('Desk', 1250, 28);
    ctx.shadowColor = '#17261d35'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#f8f7ef'; ctx.beginPath(); ctx.roundRect(205, 140, 850, 588, 16); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#d2d7c9'; ctx.beginPath(); ctx.moveTo(205, 184); ctx.lineTo(1055, 184); ctx.stroke();
    ctx.fillStyle = '#63725f'; ctx.font = '16px sans-serif'; ctx.fillText('Welcome', 230, 168); ctx.fillText('—    □    ×', 951, 168);
    ctx.fillStyle = '#9d4d36'; ctx.font = 'italic 52px Georgia'; ctx.fillText('r.', 265, 275);
    ctx.fillStyle = '#66745e'; ctx.font = '22px sans-serif'; ctx.fillText('Make yourself at home.', 265, 333);
    ctx.fillStyle = '#263c2f'; ctx.font = '76px sans-serif'; ctx.fillText('Saad', 262, 428); ctx.font = 'italic 76px Georgia'; ctx.fillText('Akhtar.', 454, 428);
    ctx.fillStyle = '#5c6f5d'; ctx.font = '23px sans-serif'; ctx.fillText('A personal workspace. Room for possibility.', 265, 482);
    ctx.fillStyle = '#31533e'; ctx.beginPath(); ctx.roundRect(265, 535, 230, 55, 7); ctx.fill(); ctx.fillStyle = '#fff9e5'; ctx.font = '20px sans-serif'; ctx.fillText('Explore my work', 295, 571);
    ctx.fillStyle = '#5c6f5d'; ctx.fillText('Look around', 530, 571); ctx.font = '16px sans-serif'; ctx.fillText('Lahore, Pakistan', 265, 685); ctx.fillText('Open Terminal', 870, 685);
    const modernPreview = new THREE.CanvasTexture(previewCanvas); modernPreview.colorSpace = THREE.SRGBColorSpace; resources.push(modernPreview);
    const mesh = (group, w, h, d, x, y, z, mat, radius = .05) => { const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w / 3, h / 3, d / 3)); resources.push(geo); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m); return m; };
    const staticResourceCount = resources.length;
    let aspect = 1, height = 5.4;
    const build = () => {
      for (const obj of objects) scene.remove(obj.group); objects.length = 0;
      while (resources.length > staticResourceCount) resources.pop().dispose();
      const h = height;
      for (const vintage of [true, false]) {
        const classic = vintage ? createClassicChassis(h, finish) : null;
        if (classic) resources.push(...classic.resources);
        const group = classic?.group || new THREE.Group(); group.position.x = vintage ? -4.75 : 4.75; scene.add(group);
        const pad = vintage ? .40 : .075, bottom = vintage ? .62 : .12, depth = vintage ? 1.8 : .25;
        const body = metal;
        if (!vintage) mesh(group, 8, h, depth, 0, 0, -depth / 2 - .08, body, .1);
        // Four framing solids leave a real aperture for the semantic DOM plane.
        if (!vintage) {
        mesh(group, pad, h, .22, -4 + pad / 2, 0, .03, body);
        mesh(group, pad, h, .22, 4 - pad / 2, 0, .03, body);
        mesh(group, 8 - pad * 2, pad, .22, 0, h / 2 - pad / 2, .03, body);
        mesh(group, 8 - pad * 2, bottom, .22, 0, -h / 2 + bottom / 2, .03, body);
        }
        const screenMat = new THREE.MeshBasicMaterial({ color: '#ffffff', map: vintage ? null : modernPreview, toneMapped: false }); resources.push(screenMat);
        const screen = classic?.screen || mesh(group, 8 - 2 * pad, h - pad - bottom, .02, 0, (bottom - pad) / 2, .04, screenMat);
        const finishHeight = h > 8 ? 5 : h;
        const displayWidth = vintage ? 8 * .806 : 8 - 2 * pad, displayHeight = vintage ? h - .277 * finishHeight : h - pad - bottom;
        const centerY = vintage ? finishHeight * .0415 : (bottom - pad) / 2;
        const rx = vintage ? displayWidth * .07 : .04, ry = vintage ? finishHeight * .087 : .04;
        const x = -displayWidth / 2, y = centerY - displayHeight / 2, shape = new THREE.Shape();
        shape.moveTo(x + rx, y); shape.lineTo(x + displayWidth - rx, y); shape.quadraticCurveTo(x + displayWidth, y, x + displayWidth, y + ry);
        shape.lineTo(x + displayWidth, y + displayHeight - ry); shape.quadraticCurveTo(x + displayWidth, y + displayHeight, x + displayWidth - rx, y + displayHeight);
        shape.lineTo(x + rx, y + displayHeight); shape.quadraticCurveTo(x, y + displayHeight, x, y + displayHeight - ry);
        shape.lineTo(x, y + ry); shape.quadraticCurveTo(x, y, x + rx, y);
        const handoffGeometry = new THREE.ShapeGeometry(shape), handoffMaterial = new THREE.MeshBasicMaterial({ color: vintage ? '#008080' : '#e9e7df', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
        const handoff = new THREE.Mesh(handoffGeometry, handoffMaterial); handoff.position.z = .075; group.add(handoff); resources.push(handoffGeometry, handoffMaterial);
        const lipMat = material(vintage ? '#3b4541' : '#78847d', vintage ? .68 : .25, vintage ? 0 : .9);
        const rims = classic?.rims || [mesh(group, .06, h - bottom - pad, .05, -4 + pad, (bottom - pad) / 2, .12, lipMat.clone()), mesh(group, .06, h - bottom - pad, .05, 4 - pad, (bottom - pad) / 2, .12, lipMat.clone()), mesh(group, 8 - 2 * pad, .06, .05, 0, h / 2 - pad, .12, lipMat.clone()), mesh(group, 8 - 2 * pad, .06, .05, 0, -h / 2 + bottom, .12, lipMat.clone())]; if (!vintage) rims.forEach(r => resources.push(r.material));
        objects.push({ group, screen, rims, handoff, vintage });
      }
    };
    const resize = () => { const w = container.clientWidth, h = container.clientHeight; if (w < 1 || h < 1) return; aspect = w / h; height = 8 / aspect; camera.aspect = aspect; camera.updateProjectionMatrix(); renderer.setSize(w, h); build(); needsRender = true; };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    let raf, lastPhase = '', progress = 0, notified = false, lastTime = performance.now(), overviewWeight = 1, weightFrom = 1, lastRenderKey = '';
    const entranceStart = performance.now();
    const origin = new THREE.Vector3(), target = new THREE.Vector3();
    const frame = now => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(now - lastTime, 50); lastTime = now; if (document.hidden) return;
      const s = latest.current;
      const renderKey = [s.era, s.phase, s.brightness, s.scenePreset, height, ...(s.emission || [])].join('/');
      if (!needsRender && (s.phase === 'focused' || s.phase === 'overview' && now - entranceStart > 2200) && renderKey === lastRenderKey) return;
      lastRenderKey = renderKey;
      if (s.phase !== lastPhase) { lastPhase = s.phase; progress = 0; origin.copy(camera.position); weightFrom = overviewWeight; notified = false; }
      const overview = s.phase === 'overview' || s.phase === 'returning';
      const zFocus = height / 2 / Math.tan(THREE.MathUtils.degToRad(19));
      const zOverview = Math.max(20, 34 / aspect);
      target.set(overview ? 0 : s.era === '98' ? -4.75 : 4.75, overview ? -zOverview * Math.tan(THREE.MathUtils.degToRad(19)) * .18 : 0, overview ? zOverview : zFocus);
      if (s.phase === 'overview' || s.phase === 'focused' || s.skip) { camera.position.copy(target); progress = 1; overviewWeight = overview ? 1 : 0; }
      else { progress = Math.min(1, progress + dt / (overview ? 900 : 1800)); const ease = progress * progress * progress * (progress * (progress * 6 - 15) + 10); camera.position.lerpVectors(origin, target, ease); overviewWeight = THREE.MathUtils.lerp(weightFrom, overview ? 1 : 0, ease); }
      camera.rotation.set(0, 0, 0);
      const room = s.scenePreset === 'screen' ? .02 : s.scenePreset === 'evening' ? .35 : 1;
      key.intensity = 3 * room; fill.intensity = 1.5 * room; ambient.intensity = 1.3 * room;
      for (const obj of objects) {
        const selected = obj.vintage === (s.era === '98'); obj.screen.visible = s.phase !== 'focused' || !selected;
        obj.handoff.visible = selected && s.phase === 'approaching';
        obj.handoff.material.opacity = Math.max(0, Math.min(1, (progress - .68) / .24));
        obj.handoff.material.color.set(obj.vintage ? '#008080' : '#e9e7df').multiplyScalar(s.brightness / 100);
        const intro = s.skip ? 1 : Math.min(1, Math.max(0, (now - entranceStart - 220) / 1650));
        const arrive = 1 - Math.pow(1 - intro, 4), side = obj.vintage ? -1 : 1;
        obj.group.position.set(side * (4.75 + (1 - arrive) * 3 * overviewWeight), -(1 - arrive) * 2.3 * overviewWeight, -(1 - arrive) * 4 * overviewWeight);
        obj.group.rotation.set(overviewWeight * (1 - arrive) * .2, -side * overviewWeight * (.10 + (1 - arrive) * .4), side * (1 - arrive) * .07 * overviewWeight);
        obj.group.scale.set(1 - .25 * overviewWeight, (1 + (5 / height - 1) * overviewWeight) * (1 - .25 * overviewWeight), 1);
        obj.screen.material.color.set('#ffffff').multiplyScalar(s.brightness / 100);
        // Balanced regional approximation; full transport/reflection calibration remains a release gate.
        obj.rims.forEach((rim, i) => { rim.material.emissive.set(s.emission?.[i] || (obj.vintage ? '#008080' : '#e9e7df')); rim.material.emissiveIntensity = selected ? s.brightness / 100 * (obj.vintage ? .12 : .38) : .05; });
      }
      renderer.render(scene, camera);
      needsRender = false;
      if (progress === 1 && !notified && ['approaching', 'returning'].includes(s.phase)) { notified = true; s.onReady(); }
    };
    camera.position.set(0, -1.1, Math.max(25, 20 / aspect)); raf = requestAnimationFrame(frame);
    const lost = e => { e.preventDefault(); latest.current.onFallback(); }; renderer.domElement.addEventListener('webglcontextlost', lost);
    api.current = renderer;
    return () => { cancelAnimationFrame(raf); observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', lost); resources.forEach(r => r.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div className="os-hardware-canvas" ref={host} aria-hidden="true" />;
}
