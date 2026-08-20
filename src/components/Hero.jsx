import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';
import DottedText from './DottedText';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ animationReady = true }) => {
  const containerRef = useRef(null);
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

  // GSAP animations
  useEffect(() => {
    if (!animationReady) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      
      // Headline Intro
      tl.fromTo('.hero-name-huge',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      // Scroll Zoom Transition Logic
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=1000', 
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // "Saad Akhtar" subtly fades and moves up slightly
        st.to('.hero-content', {
          y: -100,
          opacity: 0.2,
          filter: 'blur(5px)',
          ease: 'power1.inOut',
        }, 0);

        // "Building at the intersection..." slides up from bottom to top of Saad Akhtar
        st.fromTo('.punchline-incoming', {
          y: '50vh',
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }, 0);
      }
      
    }, containerRef);
    
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
    <section className="hero-section" ref={containerRef} id="home" style={{ minHeight: '100vh' }}>
      {/* Background Effects */}
      <div className="section-glow"></div>
      <div className="hero-background">
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
      
      {/* Content */}
      <div className="container hero-content">
        <h1 className="hero-name-huge text-gradient" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
          Saad Akhtar
        </h1>
      </div>

      <div className="punchline-incoming">
        <h2 className="incoming-headline">
          Building at the intersection of <br/>
          <DottedText text="data," />
          {' '}systems, and design.
        </h2>
      </div>
    </section>
  );
};

export default Hero;
