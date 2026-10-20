import { useRef, useState } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { projectColor, projectPath } from '../lib/projects';
import './Projects.css';

function WorkPanel({ project, index, active, activate, deactivate }) {
  const [failed, setFailed] = useState('');
  const pointer = useRef('mouse');
  const touchWasActive = useRef(false);
  const hasImage = project.image && failed !== project.image;
  const resetTilt = el => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  return (
    <a href={projectPath(project.id)} className={`work-panel ${active ? 'is-active' : ''}`} style={{ '--work-color': projectColor(project, index) }}
      aria-label={`View project: ${project.client}`} onFocus={() => { if (pointer.current !== 'touch') activate(); }} onBlur={deactivate}
      onPointerDown={event => { pointer.current = event.pointerType; touchWasActive.current = active; }}
      onPointerEnter={event => { if (event.pointerType === 'mouse') activate(); }}
      onPointerLeave={event => { resetTilt(event.currentTarget); if (event.pointerType === 'mouse') deactivate(); }}
      onPointerMove={event => {
        if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        event.currentTarget.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
        event.currentTarget.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
        event.currentTarget.style.setProperty('--shine-x', `${x * 100}%`);
        event.currentTarget.style.setProperty('--shine-y', `${y * 100}%`);
      }}
      onClick={event => { if (pointer.current === 'touch' && !touchWasActive.current) { event.preventDefault(); activate(); } }}
      onKeyDown={event => {
        pointer.current = 'keyboard';
        if (event.key === 'Escape') { deactivate(); resetTilt(event.currentTarget); return; }
        const cards = [...event.currentTarget.parentElement.querySelectorAll('.work-panel')];
        const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : null;
        if (next !== null) { event.preventDefault(); cards[(next + cards.length) % cards.length]?.focus(); }
      }}>
      <div className="work-panel-surface">
        {hasImage && <img className="work-panel-image" src={project.image} alt="" loading="lazy" onError={() => setFailed(project.image)} />}
        <div className={`work-panel-art ${hasImage ? '' : 'is-fallback'}`} aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><i /><i /></div>
        <div className="work-panel-shade" />
        <div className="work-panel-shine" />
        <div className="work-panel-top"><span>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={23} /></div>
        <div className="work-panel-spine"><span>{project.client}</span></div>
        <div className="work-panel-copy"><span className="work-panel-category">{project.tags?.slice(0, 2).join(' / ') || 'Selected project'}</span><h3>{project.client}</h3><p>{project.outcome}</p><span className="work-panel-cta">Explore project <ArrowUpRight size={18} /></span></div>
      </div>
    </a>
  );
}

export default function Projects() {
  const { data } = usePortfolio();
  const projects = data.projects.filter(project => project.visible !== false);
  const [activeId, setActiveId] = useState(null);
  const rail = useRef(null);
  if (!projects.length) return null;
  return (
    <section className="projects-section" id="work" aria-labelledby="work-heading">
      <div className="container">
        <header className="work-heading"><div><span className="work-eyebrow">Selected work / {String(projects.length).padStart(2, '0')}</span><h2 id="work-heading">A spectrum of <em>ideas.</em></h2></div><p>Different challenges. Different colors.<br />A closer look at what I build.</p></header>
        <div className="work-rail-viewport" ref={rail}>
          <div className={`work-rail ${activeId ? 'has-active' : ''}`}>
            {projects.map((project, index) => <WorkPanel key={project.id} project={project} index={index} active={activeId === project.id} activate={() => setActiveId(project.id)} deactivate={() => setActiveId(id => id === project.id ? null : id)} />)}
          </div>
        </div>
        <div className="work-footer"><span className="work-desktop-hint">Hover to uncover. Click to explore.</span><span className="work-touch-hint">Tap to preview. Tap again to explore.</span><div><button aria-label="Scroll projects left" onClick={() => rail.current?.scrollBy({ left: -360, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowLeft size={18} /></button><button aria-label="Scroll projects right" onClick={() => rail.current?.scrollBy({ left: 360, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowRight size={18} /></button><span>Made with intention.</span></div></div>
      </div>
    </section>
  );
}
