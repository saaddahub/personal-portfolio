import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createMonitorChassis, disposeMonitorChassis } from '../lib/monitorChassis';

export default function MonitorChassis() {
  const mount = useRef(null);
  useEffect(() => {
    const host = mount.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 20);
    camera.position.z = 8;
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .55;
    room.dispose();
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xffe5c5, 2.2);
    key.position.set(-4, 6, 7);
    const fill = new THREE.DirectionalLight(0xc7d4df, .35);
    fill.position.set(5, -2, 3);
    scene.add(key, fill);

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureCanvas.height = 256;
    const context = textureCanvas.getContext('2d');
    const pixels = context.createImageData(256, 256);
    let seed = 17;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const shade = 100 + (seed % 65);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = shade;
      pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    let chassis;
    let lost = false;
    const render = () => {
      if (!lost && !document.hidden) renderer.render(scene, camera);
    };
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const screen = host.parentElement.querySelector('.crt-screen');
      const inset = screen.offsetLeft;
      const chin = height - screen.offsetTop - screen.offsetHeight;
      if (chassis) { scene.remove(chassis); disposeMonitorChassis(chassis); }
      chassis = createMonitorChassis(width, height, inset, chin, texture);
      scene.add(chassis);
      camera.left = -width / 200; camera.right = width / 200;
      camera.top = height / 200; camera.bottom = -height / 200;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
      host.parentElement.classList.add('has-rendered-chassis');
    });
    resize.observe(host);
    const contextLost = event => {
      event.preventDefault(); lost = true;
      host.parentElement.classList.remove('has-rendered-chassis');
    };
    const contextRestored = () => {
      lost = false; render();
      host.parentElement.classList.add('has-rendered-chassis');
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    document.addEventListener('visibilitychange', render);
    return () => {
      resize.disconnect();
      document.removeEventListener('visibilitychange', render);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
      if (chassis) disposeMonitorChassis(chassis);
      texture.dispose(); environment.dispose(); renderer.dispose();
      renderer.domElement.remove();
      host.parentElement.classList.remove('has-rendered-chassis');
    };
  }, []);
  return <div className="crt-chassis" ref={mount} aria-hidden="true" />;
}
