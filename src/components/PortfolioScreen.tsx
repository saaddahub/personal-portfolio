import { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortfolioProvider } from '../context/PortfolioContext.jsx';
import PortfolioMain from '../PortfolioMain.jsx';
import ProjectPage from './ProjectPage.jsx';
import { useMonitor } from '../store/useMonitor';
import '../index.css';
import '../vintage.css';

export default function PortfolioScreen() {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'dark');
  const { colourMode } = useMonitor();
  useLayoutEffect(() => {
    if (!scroller) return;
    const previous = { ...ScrollTrigger.defaults({}) };
    ScrollTrigger.defaults({ scroller });
    return () => { ScrollTrigger.defaults({ ...previous, scroller: previous.scroller || window }); };
  }, [scroller]);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(document.documentElement.dataset.theme || 'dark'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  let projectId: string | null = null;
  if (location.pathname.startsWith('/work/')) { try { projectId = decodeURIComponent(location.pathname.slice(6)); } catch { projectId = ''; } }
  return <div id="tube-content" className={`portfolio-viewport portfolio-colour-${colourMode}`} ref={setScroller} tabIndex={-1}>
    <div className="portfolio-surface" data-theme={theme}>
      {scroller && <PortfolioProvider>{projectId === null ? <PortfolioMain scroller={scroller} /> : <ProjectPage id={projectId} />}</PortfolioProvider>}
    </div>
  </div>;
}
