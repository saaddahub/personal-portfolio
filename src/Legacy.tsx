import { PortfolioProvider } from './context/PortfolioContext.jsx';
import AdminPortal from './admin/AdminPortal.jsx';
import ProjectPage from './components/ProjectPage.jsx';
import './index.css';
export default function Legacy() {
  const admin = location.pathname.startsWith('/admin') || location.hash === '#admin';
  let id = ''; try { id = decodeURIComponent(location.pathname.slice(6)); } catch { /* Invalid paths show the archive's missing-project state. */ }
  return <div className="portfolio-surface"><PortfolioProvider>{admin ? <AdminPortal onExit={() => { location.href = '/#home'; }} /> : <ProjectPage id={id} />}</PortfolioProvider></div>;
}
