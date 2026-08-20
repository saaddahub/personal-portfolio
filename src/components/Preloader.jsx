import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const skillsRef = useRef(null);
  const [count, setCount] = useState(0);
  
  const skills = [
    "Machine Learning",
    "Software Development",
    "App Development",
    "Artificial Intelligence",
    "Data Systems"
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let ctx = gsap.context(() => {
      // 1. Text stagger animation
      if (!prefersReducedMotion) {
        gsap.fromTo('.preloader-skill', 
          { opacity: 0, x: 12 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
      } else {
        gsap.set('.preloader-skill', { opacity: 1, x: 0 });
      }

      // 2. Counter animation object
      const counterObj = { value: 1 }; // Start at 1
      let tl;
      
      if (!prefersReducedMotion) {
        tl = gsap.timeline();
        tl.to(counterObj, {
          value: 100,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            setCount(Math.round(counterObj.value));
          }
        });
      } else {
        setCount(100);
        tl = Promise.resolve(); // Fake timeline for Promise.all
      }

      // 3. Check for asset loading
      const checkAssetsLoaded = () => {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });
      };

      // When both timer AND actual window.load are complete:
      Promise.all([tl, checkAssetsLoaded()]).then(() => {
        // Fade out the preloader with slight upward exit
        const exitTl = gsap.timeline({
          delay: 0.2, // Tiny pause at 100%
          onStart: () => {
            // Signal the app to start revealing hero content *now*, before we finish fading
            onComplete();
          },
          onComplete: () => {
            // Physically hide this container when done fading out
            if (containerRef.current) {
              containerRef.current.style.display = 'none';
            }
          }
        });
        
        if (!prefersReducedMotion) {
          exitTl.to([skillsRef.current, counterRef.current], {
            y: -12,
            duration: 0.5,
            ease: 'power2.inOut'
          }, 0);
        }
        
        exitTl.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className="preloader-container" ref={containerRef} aria-hidden="false">
      <div className="preloader-skills" ref={skillsRef}>
        {skills.map((skill, i) => (
          <div key={i} className="preloader-skill">{skill}</div>
        ))}
      </div>
      
      <div 
        className="preloader-counter" 
        ref={counterRef} 
        aria-live="polite" 
        aria-atomic="true"
      >
        {count}
      </div>
    </div>
  );
};

export default Preloader;
