import { useRef, useState } from 'react';
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
        <div className="work-panel-shine" aria-hidden="true" />
      </div>
    </a>
  );
}

export default function Projects() {
  const { data } = usePortfolio();
  const projects = data.projects.filter(project => project.visible !== false);
  const [activeId, setActiveId] = useState(null);
  if (!projects.length) return null;
  return (
    <section className="projects-section" id="work" aria-label="Selected projects">
      <div className="container">
        <div className="work-rail-viewport">
          <div className={`work-rail ${activeId ? 'has-active' : ''}`}>
            {projects.map((project, index) => <WorkPanel key={project.id} project={project} index={index} active={activeId === project.id} activate={() => setActiveId(project.id)} deactivate={() => setActiveId(id => id === project.id ? null : id)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
