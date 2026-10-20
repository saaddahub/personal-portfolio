import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowRight, Check, Link as LinkIcon } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { externalLink, projectColor, projectPath } from '../lib/projects';
import ThemeToggle from './ThemeToggle';
import './ProjectPage.css';

export default function ProjectPage({ id }) {
  const { data, cloudReady, cloudError, retryLoad } = usePortfolio();
  const [failedImage, setFailedImage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const projects = data.projects.filter(project => project.visible !== false);
  const index = projects.findIndex(project => project.id === id);
  const project = projects[index];
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  useEffect(() => {
    const previous = document.title;
    document.title = project ? `${project.client} — ${data.hero.nameFirst} ${data.hero.nameLast}` : 'Project — Portfolio';
    return () => { document.title = previous; };
  }, [project, data.hero.nameFirst, data.hero.nameLast]);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopyMessage('Link copied'); }
    catch { setCopyMessage('Copy this page’s address from your browser.'); }
  };
  return (
    <div className="case-page" style={{ '--case-color': projectColor(project || {}, Math.max(index, 0)) }}>
      <nav className="case-nav container" aria-label="Project navigation"><a href="/#work"><ArrowLeft size={17} /> All work</a><span>{data.hero.nameFirst} {data.hero.nameLast}<small> / Selected work</small></span><ThemeToggle /></nav>
      {!cloudReady ? <main className="case-message container"><h1>{cloudError ? 'This project couldn’t load.' : 'Opening the project…'}</h1>{cloudError && <><p>Please try again in a moment.</p><button onClick={retryLoad}>Try again</button></>}</main> : !project ? <main className="case-message container"><h1>Project not available.</h1><p>This project may have moved or is no longer public.</p><a href="/#work">Return to selected work <ArrowRight size={18} /></a></main> : (
        <main className="container">
          <header className="case-heading"><div className="case-eyebrow"><span><i /> Project {String(index + 1).padStart(2, '0')}</span><span>{project.year || 'Selected work'}</span></div><h1>{project.client}</h1><p>{project.outcome}</p><div className="case-actions">{externalLink(project.liveUrl) && <a href={externalLink(project.liveUrl)} target="_blank" rel="noopener noreferrer">Visit live project <ArrowUpRight size={18} /></a>}{externalLink(project.sourceUrl) && <a className="case-secondary" href={externalLink(project.sourceUrl)} target="_blank" rel="noopener noreferrer">View source <ArrowUpRight size={18} /></a>}<button className="case-secondary" onClick={copyLink}>{copyMessage === 'Link copied' ? <Check size={16} /> : <LinkIcon size={16} />} {copyMessage || 'Copy link'}</button></div></header>
          <div className="case-cover">{project.image && failedImage !== project.image ? <img src={project.image} alt={`${project.client} project preview`} onError={() => setFailedImage(project.image)} /> : <div className="case-cover-art"><span>{String(index + 1).padStart(2, '0')}</span><p>{project.client}</p></div>}<span className="case-cover-label">{project.tags?.[0] || 'Project'}</span></div>
          <div className="case-body"><aside className="case-facts">{project.role && <div><h2>My role</h2><p>{project.role}</p></div>}<div><h2>Built with</h2><div className="case-tags">{project.tags?.map((tag,i) => <span key={`${tag}-${i}`}>{tag}</span>)}</div></div>{project.year && <div><h2>Year</h2><p>{project.year}</p></div>}</aside><div className="case-story">{[{ title:'The project', text:project.overview || project.outcome },{ title:'The challenge', text:project.challenge },{ title:'What I built', text:project.approach },{ title:'The result', text:project.results }].filter(section=>section.text?.trim()).map((section,i)=><section key={section.title}><span className="case-section-number">0{i+1}</span><div><h2>{section.title}</h2><p>{section.text}</p></div></section>)}</div></div>
          {next && <a className="case-next" href={projectPath(next.id)} style={{ '--next-color':projectColor(next,(index+1)%projects.length) }}><div><span>Next project</span><h2>{next.client}</h2></div><ArrowRight size={36} /></a>}
          <footer className="case-footer"><a href="/#work"><ArrowLeft size={15} /> Back to all work</a><span>{data.hero.nameFirst} {data.hero.nameLast} / Portfolio</span></footer>
        </main>
      )}
    </div>
  );
}
