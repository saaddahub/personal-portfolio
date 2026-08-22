import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOrReducedMotion, setIsMobileOrReducedMotion] = useState(false);

  useEffect(() => {
    // Check for mobile/touch devices or reduced motion
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const checkConstraints = () => {
      if (pointerQuery.matches || motionQuery.matches) {
        setIsMobileOrReducedMotion(true);
      } else {
        setIsMobileOrReducedMotion(false);
      }
    };

    checkConstraints();
    
    // Add listeners for dynamic changes
    pointerQuery.addEventListener('change', checkConstraints);
    motionQuery.addEventListener('change', checkConstraints);

    return () => {
      pointerQuery.removeEventListener('change', checkConstraints);
      motionQuery.removeEventListener('change', checkConstraints);
    };
  }, []);

  useEffect(() => {
    if (isMobileOrReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Physics variables
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const points = [];
    const NUM_POINTS = 15;
    const SPRING = 0.15;
    
    // Initialize points
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({ x: pos.x, y: pos.y });
    }

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };
    
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spring physics for main position
      pos.x += (mouse.x - pos.x) * SPRING;
      pos.y += (mouse.y - pos.y) * SPRING;

      // Update points array
      points[0].x = pos.x;
      points[0].y = pos.y;

      for (let i = 1; i < NUM_POINTS; i++) {
        // Each point follows the one before it with a slight spring
        points[i].x += (points[i - 1].x - points[i].x) * 0.4;
        points[i].y += (points[i - 1].y - points[i].y) * 0.4;
      }

      // Draw ribbon/tail
      if (isVisible) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < NUM_POINTS - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.lineTo(points[NUM_POINTS - 1].x, points[NUM_POINTS - 1].y);
        
        // Ribbon styling
        ctx.strokeStyle = 'rgba(201, 182, 247, 0.6)'; // Pastel purple accent
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Taper effect using stroke pattern is complex in raw canvas, 
        // we'll draw individual segments for taper & fade
        for (let i = 0; i < NUM_POINTS - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[i+1].x, points[i+1].y);
          
          // Taper width from 6 down to 0
          ctx.lineWidth = 6 * (1 - i / NUM_POINTS);
          
          // Fade opacity
          const alpha = 0.6 * (1 - i / NUM_POINTS);
          ctx.strokeStyle = `rgba(201, 182, 247, ${alpha})`;
          
          ctx.stroke();
        }

        // Draw main dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.shadowColor = 'rgba(201, 182, 247, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);
    
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobileOrReducedMotion, isVisible]);

  if (isMobileOrReducedMotion) return null;

  return (
    <>
      <style>
        {`
          * {
            cursor: none !important;
          }
        `}
      </style>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          background: 'transparent'
        }}
      />
    </>
  );
};

export default CustomCursor;
