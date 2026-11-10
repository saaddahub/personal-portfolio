import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { startScene } from './blossom.js';
import Nav from './Nav.jsx';
import Drop from './drop/Drop.jsx';
import { afterNavigate, loaders, usePath } from './router.jsx';
import { scene } from './scene.js';
import Home from './pages/Home.jsx';
import Work from './pages/Work.jsx';
import Story, { loadStory } from './pages/Story.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';

const PAGE = { '/': Home, '/work': Work, '/story': Story, '/about': About, '/contact': Contact };
loaders['/story'] = loadStory;

// The shell: the tree and its petals stay on screen across every page; the pages change in front of them.
export default function App() {
  const treeCanvas = useRef(null), petalCanvas = useRef(null);
  const path = usePath();
  const [dawn, setDawn] = useState(false);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scene.current = startScene({ treeCanvas: treeCanvas.current, petalCanvas: petalCanvas.current, reduced });
    const lenis = reduced ? null : new Lenis({ autoRaf: true, lerp: 0.085 });

    let frame = 0;
    const update = () => {
      frame = 0;
      // The nav takes the dawn's colours once the lighter half of the sunrise (14rem in) is behind it.
      const field = document.querySelector('[data-dawn]');
      setDawn(!!field && field.getBoundingClientRect().top + 224 < 72);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });

    // Every page opens at its top, with a gust of petals carried across the change.
    const off = afterNavigate(() => {
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else scrollTo(0, 0);
      scene.current?.navigated();
      update();
    });
    if (!reduced) (window.requestIdleCallback || setTimeout)(() => loadStory()); // so Story opens without a wait

    return () => {
      scene.current.stop();
      lenis?.destroy();
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      off();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.page = path;
    document.title = path === '/' ? 'Saad Akhtar — Full-stack developer in Lahore' : `${PAGE_TITLES[path]} — Saad Akhtar`;
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => reveal.observe(el));
    return () => reveal.disconnect();
  }, [path]);

  const Page = PAGE[path];
  return (
    <>
      <canvas ref={treeCanvas} className="tree" aria-hidden="true" />
      <canvas ref={petalCanvas} className="petals" aria-hidden="true" />
      <Nav dawn={dawn} />
      <Drop />
      <main className="page" key={path}><Page /></main>
    </>
  );
}

const PAGE_TITLES = { '/work': 'Selected work', '/story': 'Story', '/about': 'About', '/contact': 'Contact' };
