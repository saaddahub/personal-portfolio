import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { usePortfolio } from './context/PortfolioContext';

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

const sectionForHash = hash => ({ projects: 'work', experience: 'services' }[hash.slice(1)] || hash.slice(1) || 'home');

export default function PortfolioMain({ scroller }) {
  const [loading, setLoading] = useState(!scroller);
  const { data, cloudReady } = usePortfolio();
  const visibility = data.sectionVisibility || {};
  const lenisRef = useRef(null);
  const finishLoading = useCallback(() => setLoading(false), []);
  const handleMenuChange = useCallback((isOpen) => {
    if (isOpen) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [scroller]);

  // Initialize Lenis for smooth scroll on portfolio
  useEffect(() => {
    if (scroller) scroller.scrollTop = 0;
    else window.scrollTo(0, 0);

    const lenis = new Lenis({
      ...(scroller ? { wrapper: scroller, content: scroller.firstElementChild } : {}),
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const navigate = event => {
      const target = (scroller || document).querySelector(`#${CSS.escape(event.detail)}`);
      if (target) lenis.scrollTo(target);
    };
    window.addEventListener('portfolio:navigate', navigate);
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);



  return () => {
      lenis.destroy();
      window.removeEventListener('portfolio:navigate', navigate);
      lenisRef.current = null;
      gsap.ticker.remove(tickerCallback);
    };
  }, [scroller]);

  // Tune to a requested section after the intro and cloud content are ready.
  useEffect(() => {
    if (loading || !cloudReady) return;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const target = sectionForHash(window.location.hash);
      const section = (scroller || document).querySelector(`#${target}`);
      if (section) lenisRef.current?.scrollTo(section, { immediate: true });

    });
    return () => cancelAnimationFrame(frame);
  }, [loading, cloudReady]);

  // Universal Scroll Reveal & Section Glow
  useEffect(() => {
    if (loading) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Universal Reveal
    const initScrollReveal = () => {
      const items = (scroller || document).querySelectorAll('[data-reveal]');

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
      }, { root: scroller || null, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      items.forEach((el) => observer.observe(el));
    };

    // 2. Section Glow
    const initGlowReveal = () => {
      if (prefersReducedMotion) return;

      const glowSections = (scroller || document).querySelectorAll('.section-glow');
      const glowObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const glowEl = entry.target;
            glowEl.classList.add('is-active');
            setTimeout(() => glowEl.classList.remove('is-active'), 1500);
            glowObserver.unobserve(glowEl);
          }
        });
      }, { root: scroller || null, threshold: 0.3 });

      glowSections.forEach((el) => glowObserver.observe(el));
    };

    initScrollReveal();
    initGlowReveal();
  }, [loading]);

  useEffect(() => {
    const navigate = () => {
      const section = (scroller || document).querySelector(`#${sectionForHash(window.location.hash)}`);
      if (section) lenisRef.current?.scrollTo(section, { offset: -80, immediate: true });
    };
    const frame = requestAnimationFrame(navigate);
    window.addEventListener('hashchange', navigate);
    const resize = scroller ? new ResizeObserver(() => { lenisRef.current?.resize(); ScrollTrigger.refresh(); }) : null;
    if (scroller) resize.observe(scroller);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', navigate); resize?.disconnect(); };
  }, [scroller]);

  return (
    <>
      {loading && <Preloader onComplete={finishLoading} />}
      <CustomCursor />

      <div>
        <Nav scroller={scroller} onMenuChange={handleMenuChange} />
        <main>
          {visibility.hero !== false && <Hero animationReady={!loading} />}
          {visibility.punchline !== false && (
            <PunchlineTransition
              animationReady={!loading}
              showGlobe={visibility.skillsGlobe !== false}
            />
          )}
          {visibility.punchline === false && visibility.skillsGlobe !== false && <SkillsGlobe />}
          {visibility.stats !== false && <Stats />}
          {visibility.githubActivity !== false && <GitHubActivity />}
          {visibility.projects !== false && <Projects animationReady={!loading} />}
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
