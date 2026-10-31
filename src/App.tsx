import { lazy, Suspense, useEffect, useState } from 'react';
import { Room } from './components/Room';
import { ui } from './data/content';

const Legacy = lazy(() => import('./Legacy'));
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
    : <Room />;
}
