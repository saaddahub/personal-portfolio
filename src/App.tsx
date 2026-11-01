import { lazy, Suspense, useEffect, useState } from 'react';
import { Room } from './components/Room';
import { ui } from './data/content';

const Legacy = lazy(() => import('./Legacy'));
const Rowan = lazy(() => import('./os/Rowan.jsx'));
const Portfolio = lazy(() => import('./components/PortfolioScreen'));
export default function App() {
  const [location, setLocation] = useState(window.location.pathname + window.location.hash);
  useEffect(() => {
    const update = () => setLocation(window.location.pathname + window.location.hash);
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('hashchange', update); };
  }, []);
  return location.startsWith('/admin') || location.endsWith('#admin')
    ? <Suspense fallback={<p>{ui.openingArchive}</p>}><Legacy /></Suspense>
    : location.startsWith('/read')
      ? <Suspense fallback={<p>Opening portfolio…</p>}><Portfolio /></Suspense>
      : location.startsWith('/monitor') || location.includes('#story')
        ? <Room />
        : <Suspense fallback={<p style={{ padding: 32 }}>Opening Rowan…</p>}><Rowan /></Suspense>;
}
