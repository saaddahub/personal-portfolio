import { useEffect, useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import AdminPortal from './admin/AdminPortal';
import ProjectPage from './components/ProjectPage';
import AnalogEdges from './components/AnalogEdges';
import VintageMonitor from './components/VintageMonitor';
import PortfolioMain from './PortfolioMain.jsx';
import './vintage.css';

function App() {
  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || hash === '#admin';
  };

  const [pathname, setPathname] = useState(window.location.pathname);
  const projectId = (() => { try { return pathname.startsWith('/work/') ? decodeURIComponent(pathname.slice(6)) : null; } catch { return ''; } })();
  const [isAdmin, setIsAdmin] = useState(checkIsAdmin);

  useEffect(() => {
    const onLocationChange = () => {
      setIsAdmin(checkIsAdmin());
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  if (!isAdmin && !window.frameElement?.hasAttribute('data-portfolio-screen')) return <VintageMonitor />;

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
        <div className="portfolio-surface">
          <AnalogEdges />
          {projectId !== null ? <ProjectPage id={projectId} /> : <PortfolioMain />}
        </div>
      )}
    </PortfolioProvider>
  );
}

export default App;

export { default as PortfolioMain } from './PortfolioMain.jsx';
