import { useEffect, useRef, useState } from 'react';
import { useState as useReactState } from 'react'; // just in case
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Nav from './components/Nav';
import Hero from './components/Hero';
import SkillsGlobe from './components/SkillsGlobe';
import Stats from './components/Stats';
import Projects from './components/Projects';
import Process from './components/Process';
import CtaSplit from './components/CtaSplit';
import About from './components/About';
import FAQ from './components/FAQ';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';
import Preloader from './components/Preloader';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (loading) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ctx = gsap.context(() => {
      // Global Scroll Reveal for sections
      const reveals = document.querySelectorAll('.reveal-on-scroll');
      
      if (!prefersReducedMotion) {
        reveals.forEach((el) => {
          gsap.fromTo(el, 
            { 
              y: 30, 
              opacity: 0 
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%', // Trigger when top of element hits 85% of viewport height
                toggleActions: 'play none none none' // Play once
              }
            }
          );
        });
      } else {
        // If reduced motion is preferred, just ensure they are visible
        reveals.forEach(el => {
          gsap.set(el, { opacity: 1, y: 0 });
        });
      }
    });

    return () => ctx.revert();
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Nav />
      <main>
        <Hero animationReady={!loading} />
        <SkillsGlobe />
        <Stats />
        <Projects />
        <Process />
        <CtaSplit />
        <About />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

export default App;
