import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidCursorBackground.css';

const VERTEX_SHADER = `
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_rippleStrength;
uniform vec2 u_resolution;

void main() {
    vec3 pos = position;
    
    // Convert to aspect-corrected coordinates for perfectly circular ripples
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = pos.xy;
    st.x *= aspect;
    vec2 mouseSt = u_mouse;
    mouseSt.x *= aspect;
    
    // Distance from point to mouse
    float dist = distance(st, mouseSt);
    
    // Smooth falloff based on distance
    float falloff = exp(-dist * dist * 10.0);
    
    // Wavy ripple effect propagating outward
    float wave = sin(dist * 25.0 - u_time * 8.0);
    
    // Displace outward
    vec2 dir = normalize(st - mouseSt);
    if (dist > 0.001) {
        // Displace the vertex. Since coordinates are -1 to 1, small multiplier
        pos.xy += dir * wave * falloff * u_rippleStrength * 0.05;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Scale point size by resolution so it looks consistent
    gl_PointSize = (u_resolution.y * 0.003) + 1.0; 
    gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
uniform vec3 u_color;

void main() {
    // Make points circular instead of square
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    
    // Soft anti-aliased edge
    float alpha = smoothstep(0.5, 0.4, ll);
    
    // Very subtle base opacity so it's a background texture
    gl_FragColor = vec4(u_color, alpha * 0.3);
}
`;

const LiquidCursorBackground = ({ 
  density = 60, 
  color = '#868e96', // A nice muted gray that works on both dark and light modes
  rippleStrength = 1.0, 
  className = '' 
}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Don't even mount WebGL to save battery

    let renderer, scene, camera, material, geometry, points;
    let animationFrameId;
    let isActive = true;

    // Mouse tracking variables
    const targetMouse = new THREE.Vector2(0, 0); // NDC coords: -1 to 1
    const currentMouse = new THREE.Vector2(0, 0);
    
    let handleResize, handlePointerMove, handleVisibilityChange;

    // Initialization wrapped in try/catch for WebGL support fallback
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      
      // Orthographic camera for a simple 2D fullscreen overlay
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      // Geometry: Grid of points
      // Adjust horizontal density based on aspect ratio to keep spacing uniform
      const aspect = width / height;
      const cols = Math.floor(density * aspect);
      const rows = density;
      
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(cols * rows * 3);
      
      let i = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Map to NDC coordinates (-1 to 1)
          const px = (x / (cols - 1)) * 2 - 1;
          const py = (y / (rows - 1)) * 2 - 1;
          positions[i++] = px;
          positions[i++] = py;
          positions[i++] = 0;
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Material
      const colorObj = new THREE.Color(color);
      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          u_time: { value: 0 },
          u_mouse: { value: new THREE.Vector2(0, 0) },
          u_resolution: { value: new THREE.Vector2(width, height) },
          u_rippleStrength: { value: rippleStrength },
          u_color: { value: colorObj }
        },
        transparent: true,
        depthWrite: false,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      // Event Listeners
      handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        material.uniforms.u_resolution.value.set(w, h);
      };

      handlePointerMove = (e) => {
        // Convert screen pixel coordinates to NDC (-1 to +1)
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      handleVisibilityChange = () => {
        isActive = !document.hidden;
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Animation Loop
      const clock = new THREE.Clock();
      
      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        
        if (!isActive) return; // Pause rendering if tab is hidden

        // Lerp mouse for that "fluid" trailing effect
        currentMouse.lerp(targetMouse, 0.08);

        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_mouse.value.copy(currentMouse);

        renderer.render(scene, camera);
      };

      render();
    } catch (e) {
      console.warn("LiquidCursorBackground: WebGL initialization failed.", e);
    }

    // Full Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [density, color, rippleStrength]); // Re-init only if core config changes

  return (
    <div 
      ref={mountRef} 
      className={`lcb-container ${className}`}
      aria-hidden="true"
    />
  );
};

export default LiquidCursorBackground;
