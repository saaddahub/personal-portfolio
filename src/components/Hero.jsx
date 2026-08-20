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
      
      // Eyebrows
      tl.fromTo('.hero-eyebrow span', 
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
      
      // Headline
      tl.fromTo(['.hero-name-huge', '.hero-headline'],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.1 },
        "-=0.2"
      );
      
      // Paragraph & Button
      tl.fromTo(['.hero-desc', '.hero-cta'],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' },
        "-=0.2"
      );

      // Scroll Zoom Transition Logic
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=1500', 
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Outgoing text zooming past the camera
        st.to('.hero-content', {
          scale: 8,
          opacity: 0,
          filter: 'blur(20px)',
          ease: 'power2.in',
        }, 0);

        // Incoming text zooming into focus
        st.fromTo('.punchline-incoming', {
          scale: 0.4,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          ease: 'power2.out',
        }, 0.15);
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
        <div className="hero-eyebrow">
          <span>AI UNDERGRADUATE</span>
          <span className="separator">•</span>
          <span>FULL-STACK DEVELOPER</span>
        </div>
        
        <h1 className="hero-name-huge text-gradient" style={{ fontSize: 'clamp(4rem, 8vw, 8rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
          Saad Akhtar
        </h1>

        <h2 className="hero-headline" style={{ marginTop: 'var(--space-sm)' }}>
          Building at the intersection of <br/>
          <DottedText text="data," />
          {' '}systems, and design.
        </h2>
        
        <p className="hero-desc">
          I'm an AI undergraduate and full-stack developer based in Lahore, Pakistan. Open to internships, research roles, and collaborative projects.
        </p>
        
        <div className="hero-cta">
          <a href="#contact" className="btn-primary btn-icon-shift">
            Book a call <span className="icon">→</span>
          </a>
        </div>
      </div>

      <div className="punchline-incoming">
        <h2 className="incoming-headline">
          I help founders shape their product.
        </h2>
        <p className="incoming-sub">
          Bridging the gap between AI research and scalable full-stack development.
        </p>
      </div>
    </section>
  );
};

export default Hero;
