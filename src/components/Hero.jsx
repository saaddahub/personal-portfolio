import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ animationReady = true }) => {
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  
  // Spotlight tracking
  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let spotlightX = mouseX;
    let spotlightY = mouseY;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    let animationFrame;
    const updateSpotlight = () => {
      // Lerp
      spotlightX += (mouseX - spotlightX) * 0.1;
      spotlightY += (mouseY - spotlightY) * 0.1;
      
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${spotlightX}px, ${spotlightY}px) translate(-50%, -50%)`;
      }
      
      animationFrame = requestAnimationFrame(updateSpotlight);
    };
    
    updateSpotlight();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!animationReady) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ctx = gsap.context(() => {
      // Intro animations
      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.fromTo('.hero-text-content',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      tl.fromTo('.parallax-layer',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.1, ease: 'power3.out' },
        "-=0.5"
      );

      // Scroll Parallax Logic
      // Each layer moves at a different speed, up to a maximum distance.
      const layers = gsap.utils.toArray('.parallax-layer');
      
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed);
        // We'll move them up to maxTravel pixels
        const maxTravel = parseFloat(layer.dataset.max) || 400;
        
        gsap.to(layer, {
          y: maxTravel,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: `+=${maxTravel / speed}`, // Calculate end distance so it reaches maxTravel exactly when scroll ends
            scrub: true,
          }
        });
      });

    }, heroRef);
    
    return () => ctx.revert();
  }, [animationReady]);

  // Generate random particles
  const [particles] = useState(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const isWord = Math.random() > 0.5;
      const words = ['--radius-md', '--space-lg', '--color-border', 'const', '=>', '0px', 'return'];
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${30 + Math.random() * 70}%`, // Focus on right side
        text: isWord ? words[Math.floor(Math.random() * words.length)] : '+',
        duration: 6 + Math.random() * 4,
        delay: -Math.random() * 5
      };
    });
  });

  return (
    <section className="hero-section" ref={heroRef} id="home">
      
      {/* BACKGROUND: Spotlight and Particles */}
      <div className="parallax-layer parallax-sky" data-speed="0.1" data-max="100">
        <div className="spotlight" ref={spotlightRef}></div>
        <div className="particle-field">
          {particles.map((p) => (
            <div 
              key={p.id} 
              className="particle"
              style={{
                top: p.top,
                left: p.left,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`
              }}
            >
              {p.text}
            </div>
          ))}
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="parallax-layer parallax-text" data-speed="0.4" data-max="350">
        <div className="hero-text-content">
          <div className="hero-eyebrow">
            <span>AI UNDERGRADUATE</span>
            <span className="separator">•</span>
            <span>FULL-STACK DEVELOPER</span>
          </div>
          <h1 className="hero-headline text-gradient">
            Saad Akhtar
          </h1>
          <p className="hero-desc">
            Creative Developer based in Lahore, Pakistan.
          </p>
        </div>
      </div>

      {/* LAYER 5: Foreground Solid Background Transition */}
      <div className="parallax-layer parallax-foreground" data-speed="0.8" data-max="600">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400L0 350Q200 250 400 320T800 280T1200 320L1200 400Z" fill="var(--color-bg)" />
        </svg>
      </div>

      {/* Bottom Gradient Overlay (smooth transition into next section) */}
      <div className="hero-bottom-gradient"></div>
    </section>
  );
};

export default Hero;
