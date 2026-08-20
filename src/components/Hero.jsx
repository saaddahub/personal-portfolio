import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ animationReady = true }) => {
  const heroRef = useRef(null);

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

  return (
    <section className="hero-section" ref={heroRef} id="home">
      
      {/* LAYER 1: Background Gradient / Sky */}
      <div className="parallax-layer parallax-sky" data-speed="0.1" data-max="100">
        <div className="sky-gradient"></div>
      </div>

      {/* LAYER 2: Sun / Moon */}
      <div className="parallax-layer parallax-sun" data-speed="0.15" data-max="150">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="var(--color-accent-pastel-a)" opacity="0.8" />
        </svg>
      </div>

      {/* LAYER 3: Distant Mountains */}
      <div className="parallax-layer parallax-distant" data-speed="0.3" data-max="300">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400L0 250L150 120L300 200L500 50L750 180L1000 80L1200 220L1200 400Z" fill="var(--color-bg-card)" opacity="0.4" />
        </svg>
      </div>

      {/* LAYER 4: Midground Hills */}
      <div className="parallax-layer parallax-mid" data-speed="0.5" data-max="450">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400L0 300Q150 150 350 250T750 150T1200 280L1200 400Z" fill="var(--color-bg-raised)" opacity="0.7" />
        </svg>
      </div>

      {/* TEXT CONTENT: Placed between Mid and Fore layers */}
      <div className="parallax-layer parallax-text" data-speed="0.4" data-max="350">
        <div className="hero-text-content">
          <div className="hero-eyebrow">
            <span className="pill-tag tag-a">AI UNDERGRADUATE</span>
            <span className="pill-tag tag-b">A FULL-STACK DEVELOPER</span>
          </div>
          <h1 className="hero-headline text-gradient">
            Saad Akhtar
          </h1>
          <p className="hero-desc">
            Creative Developer based in Lahore, Pakistan.
          </p>
        </div>
      </div>

      {/* LAYER 5: Foreground Silhouette */}
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
