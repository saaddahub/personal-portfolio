import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import AdminPortal from './admin/AdminPortal';

import Nav from './components/Nav';
import Hero from './components/Hero';
import PunchlineTransition from './components/PunchlineTransition';
import SkillsGlobe from './components/SkillsGlobe';
import Stats from './components/Stats';
import GitHubActivity from './components/GitHubActivity';
import Projects from './components/Projects';
import Process from './components/Process';
import CtaSplit from './components/CtaSplit';
import About from './components/About';
import FAQ from './components/FAQ';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import MusicPlayer from './components/MusicPlayer';
import SocialMenu from './components/SocialMenu';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function PortfolioMain() {
  const [loading, setLoading] = useState(true);
  const { data } = usePortfolio();
  const visibility = data.sectionVisibility || {};

  // Initialize Lenis for smooth scroll on portfolio
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash && window.location.hash !== '#admin') {
      window.history.replaceState('', document.title, window.location.pathname + window.location.search);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  // Universal Scroll Reveal & Section Glow
  useEffect(() => {
    if (loading) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Universal Reveal
    const initScrollReveal = () => {
      const items = document.querySelectorAll('[data-reveal]');
      
      if (prefersReducedMotion) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || 0;
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      items.forEach((el) => observer.observe(el));
    };

    // 2. Section Glow
    const initGlowReveal = () => {
      if (prefersReducedMotion) return;
      
      const glowSections = document.querySelectorAll('.section-glow');
      const glowObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const glowEl = entry.target;
            glowEl.classList.add('is-active');
            setTimeout(() => glowEl.classList.remove('is-active'), 1500);
            glowObserver.unobserve(glowEl);
          }
        });
      }, { threshold: 0.3 });

      glowSections.forEach((el) => glowObserver.observe(el));
    };

    initScrollReveal();
    initGlowReveal();
  }, [loading]);

  return (
    <>
      <Preloader onComplete={() => setLoading(false)} />
      <CustomCursor />
      
      <div className={`app-wrapper ${!loading ? 'is-ready' : ''}`}>
        <Nav />
        <main>
          {visibility.hero !== false && <Hero animationReady={!loading} />}
          {visibility.punchline !== false && <PunchlineTransition />}
          {visibility.skillsGlobe !== false && <SkillsGlobe />}
          {visibility.stats !== false && <Stats />}
          {visibility.githubActivity !== false && <GitHubActivity />}
          {visibility.projects !== false && <Projects />}
          {visibility.process !== false && <Process />}
          {visibility.ctaSplit !== false && <CtaSplit />}
          {visibility.about !== false && <About />}
          {visibility.faq !== false && <FAQ />}
          {visibility.finalCta !== false && <FinalCta />}
        </main>
        <Footer />
        <MusicPlayer />
        <SocialMenu />
      </div>
    </>
  );
}

function App() {
  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || hash === '#admin';
  };

  const [isAdmin, setIsAdmin] = useState(checkIsAdmin);

  useEffect(() => {
    const onLocationChange = () => {
      setIsAdmin(checkIsAdmin());
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  return (
    <PortfolioProvider>
      {isAdmin ? (
        <AdminPortal
          onExit={() => {
            window.history.pushState({}, '', '/');
            setIsAdmin(false);
          }}
        />
      ) : (
        <PortfolioMain />
      )}
    </PortfolioProvider>
  );
}

export default App;
