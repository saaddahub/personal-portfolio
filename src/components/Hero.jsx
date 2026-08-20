import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Hero.css';
import DottedText from './DottedText';

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
      tl.fromTo('.hero-eyebrow .pill-tag', 
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
      
      // Headline
      tl.fromTo('.hero-headline',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        "-=0.2"
      );
      
      // Scribble SVG (Removed for DottedText)
      
      // Paragraph & Button
      tl.fromTo(['.hero-desc', '.hero-cta'],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' },
        "-=0.2"
      );
      
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
    <section className="hero-section" ref={containerRef} id="home">
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
          <span className="pill-tag tag-a">AI UNDERGRADUATE</span>
          <span className="pill-tag tag-b">· FULL-STACK DEVELOPER</span>
        </div>
        
        <h1 className="hero-headline">
          Building at the intersection of <br/>
          <DottedText text="data," />
          {' '}systems, and design.
        </h1>
        
        <p className="hero-desc">
          I'm an AI undergraduate and full-stack developer based in Lahore, Pakistan. Open to internships, research roles, and collaborative projects.
        </p>
        
        <div className="hero-cta">
          <a href="#contact" className="btn-primary btn-icon-shift">
            Book a call <span className="icon">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
