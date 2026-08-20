import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import './SkillsGlobe.css';

const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'SQL', 'React', 'Node.js',
  'Three.js', 'Machine Learning', 'TensorFlow', 'Figma', 'PostgreSQL',
  'AWS', 'Docker', 'GraphQL', 'Next.js', 'C++', 'C', 'OpenCV',
  'HTML5', 'CSS3', 'Git', 'MongoDB', 'Express', 'Tailwind CSS',
  'Keras', 'Scikit-Learn', 'REST APIs', 'Vite', 'Redux', 'Linux'
];

// Fibonacci sphere point distribution
function fibonacciSphere(count, radius) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;         // -1 to 1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

const SkillsGlobe = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      container.clientWidth / container.clientHeight, 
      1, 
      2000
    );
    // Position camera far enough to see the whole sphere
    camera.position.z = 500;
    
    // WebGL Renderer (for the subtle dot shell)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // CSS2D Renderer (for the HTML text labels)
    const cssRenderer = new CSS2DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    // Let pointer events pass through empty space to allow dragging
    cssRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(cssRenderer.domElement);
    
    // Main Group to hold everything and rotate together
    const group = new THREE.Group();
    scene.add(group);
    
    // --- 2. Add Wireframe/Dot Shell ---
    const radius = 180;
    
    // Read theme color for the dots
    const getThemeColor = () => {
      const colorStr = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#ffffff';
      return new THREE.Color(colorStr);
    };
    
    // Faint dot shell
    const shellGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const shellMaterial = new THREE.PointsMaterial({
      color: getThemeColor(),
      size: 1.5,
      transparent: true,
      opacity: 0.15,
    });
    const shell = new THREE.Points(shellGeometry, shellMaterial);
    group.add(shell);
    
    // Observe theme changes to update color dynamically
    const themeObserver = new MutationObserver(() => {
      shellMaterial.color = getThemeColor();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    // --- 3. Add Labels ---
    const points = fibonacciSphere(SKILLS.length, radius);
    const labelObjects = [];
    
    SKILLS.forEach((skill, i) => {
      // Create HTML element
      const div = document.createElement('div');
      div.className = 'globe-label';
      div.textContent = skill;
      
      // Make labels individually interactive
      div.style.pointerEvents = 'auto';
      
      // Hover effects
      div.addEventListener('mouseenter', () => {
        div.classList.add('hovered');
      });
      div.addEventListener('mouseleave', () => {
        div.classList.remove('hovered');
      });
      
      // Create CSS2DObject
      const label = new CSS2DObject(div);
      label.position.copy(points[i]);
      group.add(label);
      labelObjects.push({ object: label, element: div });
    });
    
    // --- 4. Interaction Physics ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Momentum velocity
    let velocity = { x: 0, y: 0 };
    
    // Ambient auto-rotate speeds (radians per second)
    const AUTO_SPEED_X = 0.05;
    const AUTO_SPEED_Y = 0.1;
    
    // Pointer Events on the container for dragging
    // We attach it to a highly z-indexed transparent div or the cssRenderer
    const handlePointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      // Cancel any ongoing momentum
      velocity = { x: 0, y: 0 };
      container.style.cursor = 'grabbing';
    };
    
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      // Drag sensitivity
      const dragFactor = 0.005;
      
      group.rotation.y += deltaX * dragFactor;
      group.rotation.x += deltaY * dragFactor;
      
      // Store velocity for momentum (delta per frame roughly)
      velocity = { 
        x: deltaY * dragFactor, // Y movement affects X rotation
        y: deltaX * dragFactor  // X movement affects Y rotation
      };
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    
    const handlePointerUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };
    
    // Attach a separate interaction layer to catch drags without blocking labels
    const interactionLayer = document.createElement('div');
    interactionLayer.style.position = 'absolute';
    interactionLayer.style.inset = '0';
    interactionLayer.style.zIndex = '1';
    interactionLayer.style.cursor = 'grab';
    container.appendChild(interactionLayer);
    
    // Ensure CSS renderer sits above interaction layer so hover works
    cssRenderer.domElement.style.zIndex = '2';
    
    interactionLayer.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    // --- 5. Render Loop ---
    let animationFrameId;
    let lastTime = performance.now();
    let isVisible = false;
    
    const vector = new THREE.Vector3();
    
    const animate = (now) => {
      // We still request frame even if offscreen, but we skip rendering
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = (now - lastTime) / 1000; // seconds
      lastTime = now;
      
      if (!isVisible) return; // Skip heavy work when offscreen
      
      // Physics Update
      if (!isDragging) {
        // Apply momentum
        group.rotation.y += velocity.y;
        group.rotation.x += velocity.x;
        
        // Decay momentum
        velocity.x *= 0.95;
        velocity.y *= 0.95;
        
        // Lerp towards auto-rotation when momentum is low
        if (Math.abs(velocity.x) < 0.001 && Math.abs(velocity.y) < 0.001) {
          group.rotation.y += AUTO_SPEED_Y * delta;
          group.rotation.x += AUTO_SPEED_X * delta;
        }
      }
      
      // Update label opacity/scale based on facing (Z position in world space)
      labelObjects.forEach(({ object, element }) => {
        // Get the world position of the label
        object.getWorldPosition(vector);
        
        // The camera is at +Z looking down -Z. 
        // vector.z is the depth. Higher Z is closer to camera.
        // Range is roughly -radius to +radius.
        
        // Normalize Z to a 0-1 range roughly: 1 is front, 0 is back
        const normalizedZ = (vector.z + radius) / (2 * radius);
        
        // If it's hovered, we force full visibility in CSS, but we can also handle base opacity here
        if (!element.classList.contains('hovered')) {
          // Sharp falloff towards the back
          // If normalizedZ > 0.75 (front half), near full opacity
          // If normalizedZ < 0.5 (back half), fade out
          let opacity = 0;
          let scale = 0.5;
          
          if (normalizedZ > 0.8) {
            opacity = 1;
            scale = 1;
          } else if (normalizedZ > 0.4) {
            // Smooth fade between 0.4 and 0.8
            const t = (normalizedZ - 0.4) / 0.4;
            opacity = t; // 0 to 1
            scale = 0.7 + (t * 0.3); // 0.7 to 1.0
          } else {
            opacity = 0; // completely hidden on back
          }
          
          element.style.opacity = opacity;
          element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
      });
      
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
    };
    
    // Start loop
    animate(performance.now());
    
    // --- 6. Intersection Observer ---
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(container);
    
    // --- 7. Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cssRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    
    // --- Cleanup ---
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      interactionLayer.removeEventListener('pointerdown', handlePointerDown);
      observer.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      // Dispose Three.js memory
      shellGeometry.dispose();
      shellMaterial.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(cssRenderer.domElement)) container.removeChild(cssRenderer.domElement);
      if (container.contains(interactionLayer)) container.removeChild(interactionLayer);
    };
  }, []);

  return (
    <section className="skills-globe-section" id="skills">
      <div className="container">
        <div className="skills-globe-header">
          <p className="text-caption text-muted">Tools & technologies</p>
          <h2 className="skills-globe-headline">What I work with</h2>
        </div>
        <div className="skills-globe-canvas-wrapper" ref={mountRef}></div>
      </div>
    </section>
  );
};

export default SkillsGlobe;
