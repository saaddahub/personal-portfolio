import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createVintageLens } from '../lib/vintageLens';
import './VintageLens.css';

export default function VintageLens({ animationReady }) {
  const mount = useRef(null);
  const control = useRef(null);
  const playback = useRef(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => { pausedRef.current = paused; playback.current?.(); }, [paused]);

  useEffect(() => {
    if (!animationReady) return;
    const host = mount.current;
    const hero = host.closest('.hero-section');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, .1, 40);
    camera.position.z = 7;
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    const environment = generator.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .7;
    room.dispose();
    generator.dispose();
    const light = new THREE.DirectionalLight(0xffdfaa, 1.8);
    light.position.set(-3, 4, 5);
    scene.add(light);
    const { lens, focusRing, aperture } = createVintageLens();
    lens.rotation.set(-.16, -.56, -.2);
    scene.add(lens);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0, y: 0 };
    let visible = false;
    let lost = false;
    let elapsed = 0;
    let previous = 0;

    const render = (time = 0) => {
      const delta = Math.min((time - previous) / 1000, .05);
      previous = time;
      if (!reduced.matches && !pausedRef.current) elapsed += Math.max(0, delta);
      const progress = reduced.matches ? 0 : THREE.MathUtils.clamp(-hero.getBoundingClientRect().top / window.innerHeight, 0, 1.4);
      lens.rotation.x += ((reduced.matches ? -.16 : -.16 + pointer.y * .15 + progress * .5) - lens.rotation.x) * .07;
      lens.rotation.y += ((reduced.matches ? -.56 : -.56 + pointer.x * .22 + Math.sin(elapsed * .24) * .12 + progress * .2) - lens.rotation.y) * .07;
      lens.rotation.z = -.2 + elapsed * .018;
      lens.position.y = Math.sin(elapsed * .55) * .07 - progress * .25;
      lens.scale.setScalar(1 + progress * .38);
      focusRing.rotation.z = elapsed * .07 + progress * 1.4;
      host.style.setProperty('--lens-glint', String(.08 + Math.max(0, 1 - Math.abs(lens.rotation.y + .4) * 3) * .18));
      aperture.children.forEach((pivot, index) => { pivot.rotation.z = index / 8 * Math.PI * 2 + .12 + Math.sin(elapsed * .35) * .12 + progress * .45; });
      renderer.render(scene, camera);
    };
    const updatePlayback = () => {
      previous = 0;
      renderer.setAnimationLoop(visible && !document.hidden && !reduced.matches && !pausedRef.current && !lost ? render : null);
      control.current.disabled = reduced.matches;
      if (!lost && !document.hidden) render();
    };
    playback.current = updatePlayback;
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!lost) render();
    });
    resize.observe(host);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }, { threshold: 0 });
    observer.observe(host);
    const move = event => {
      const bounds = hero.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      pointer.y = (event.clientY - bounds.top) / window.innerHeight * 2 - 1;
    };
    const leave = () => { pointer.x = 0; pointer.y = 0; };
    const contextLost = event => { event.preventDefault(); lost = true; host.classList.remove('is-rendered'); updatePlayback(); };
    const contextRestored = () => { lost = false; host.classList.add('is-rendered'); updatePlayback(); };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', updatePlayback);
    reduced.addEventListener('change', updatePlayback);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    host.classList.add('is-rendered');

    return () => {
      playback.current = null;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      resize.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', updatePlayback);
      reduced.removeEventListener('change', updatePlayback);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
      const resources = new Set();
      lens.traverse(object => { if (object.geometry) resources.add(object.geometry); if (object.material) resources.add(object.material); });
      resources.forEach(resource => resource.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      host.classList.remove('is-rendered');
    };
  }, [animationReady]);

  return (
    <div className="vintage-lens" ref={mount}>
      <div className="vintage-lens-flare" aria-hidden="true" />
      <button ref={control} type="button" className="vintage-lens-control"
        aria-label={paused ? 'Resume lens animation' : 'Pause lens animation'}
        aria-pressed={paused} onClick={() => setPaused(value => !value)}>
        {paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </div>
  );
}
