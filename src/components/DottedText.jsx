import { useEffect, useRef } from 'react';

const DottedText = ({ text = "data", className = "" }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Animation config
  const step = 5;
  const repelRadius = 70;
  const maxPushDistance = 20;
  const springBack = 0.08;
  const idleAmplitude = 2.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // We will render text on an offscreen canvas to get pixel data
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    
    // Setup dimensions. We'll make it big enough for a display word.
    const width = 400;
    const height = 150;
    
    canvas.width = width;
    canvas.height = height;
    offscreen.width = width;
    offscreen.height = height;

    // Draw text to offscreen
    offCtx.fillStyle = 'white';
    // Use the site's font if possible, or sans-serif
    offCtx.font = '900 120px Inter, system-ui, sans-serif';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, 10, height / 2);

    // Get pixel data
    const imgData = offCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    
    const dots = [];
    
    // Sample pixels
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 128) {
          dots.push({
            homeX: x,
            homeY: y,
            pushX: 0,
            pushY: 0,
            r: 2 + Math.random() * 3.5,
            color: '#ffffff',
            // Random phase between 0 and 2PI
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            // Random frequency between 0.0007 and 0.0015
            freqX: 0.0007 + Math.random() * 0.0008,
            freqY: 0.0007 + Math.random() * 0.0008,
          });
        }
      }
    }
    
    // Trim canvas to fit the actual dots to remove excessive whitespace
    let minX = width, maxX = 0, minY = height, maxY = 0;
    dots.forEach(d => {
      if (d.homeX < minX) minX = d.homeX;
      if (d.homeX > maxX) maxX = d.homeX;
      if (d.homeY < minY) minY = d.homeY;
      if (d.homeY > maxY) maxY = d.homeY;
    });
    
    // Add some padding
    const pad = 30;
    const finalWidth = maxX - minX + pad * 2;
    const finalHeight = maxY - minY + pad * 2;
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    
    // Adjust dots to new bounding box
    dots.forEach(d => {
      d.homeX = d.homeX - minX + pad;
      d.homeY = d.homeY - minY + pad;
    });

    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      // Calculate mouse position relative to canvas and scale to internal resolution
      mouseX = (e.clientX - rect.left) * scaleX;
      mouseY = (e.clientY - rect.top) * scaleY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let animationFrame;
    let isVisible = false;
    
      let currentFillStyle = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#ffffff';
      
      const themeObserver = new MutationObserver(() => {
        currentFillStyle = getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim() || '#ffffff';
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      const render = (time) => {
        if (!isVisible && !prefersReducedMotion) {
          // If not visible, we can just request next frame and return early without drawing
          animationFrame = requestAnimationFrame(render);
          return;
        }

        ctx.clearRect(0, 0, finalWidth, finalHeight);

        dots.forEach(dot => {
          // 1. Idle Jitter (Layer 1)
          let idleX = 0;
          let idleY = 0;
          
          if (!prefersReducedMotion) {
            idleX = Math.sin(time * dot.freqX + dot.phaseX) * idleAmplitude;
            idleY = Math.cos(time * dot.freqY + dot.phaseY) * idleAmplitude;
          }

          // Current position before mouse push
          const currentX = dot.homeX + idleX + dot.pushX;
          const currentY = dot.homeY + idleY + dot.pushY;

          // 2. Mouse Proximity Scatter (Layer 2)
          if (!prefersReducedMotion) {
            const dx = currentX - mouseX;
            const dy = currentY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < repelRadius) {
              const force = (repelRadius - dist) / repelRadius;
              const dirX = dx / (dist || 1);
              const dirY = dy / (dist || 1);
              
              dot.pushX += dirX * force * maxPushDistance;
              dot.pushY += dirY * force * maxPushDistance;
            }
          }
          
          // 3. Spring Back for the push offset
          dot.pushX += (0 - dot.pushX) * springBack;
          dot.pushY += (0 - dot.pushY) * springBack;
          
          // 4. Final Position
          const finalX = dot.homeX + idleX + dot.pushX;
          const finalY = dot.homeY + idleY + dot.pushY;

          // Draw
          ctx.beginPath();
          ctx.arc(finalX, finalY, dot.r, 0, Math.PI * 2);
          ctx.fillStyle = currentFillStyle;
          ctx.fill();
        });
        
        if (!prefersReducedMotion) {
          animationFrame = requestAnimationFrame(render);
        }
      };
      
      // Initial render
      render(performance.now());
    
    // Use IntersectionObserver to pause animation when out of view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        isVisible = true;
      } else {
        isVisible = false;
      }
    });
    
    observer.observe(canvas);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`dotted-text-container ${className}`}
      style={{ display: 'inline-flex', verticalAlign: 'middle' }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          height: 'auto',
          maxHeight: '1.2em' 
        }} 
      />
    </div>
  );
};

export default DottedText;
