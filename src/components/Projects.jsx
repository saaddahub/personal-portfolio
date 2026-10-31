import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { externalLink, projectPath } from '../lib/projects';
import './Projects.css';

function ProjectMedia({ project, index, playing }) {
  const [failedVideo, setFailedVideo] = useState('');
  const [failedImage, setFailedImage] = useState('');
  const video = useRef(null);
  const source = externalLink(project.videoUrl);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (!playing) { player.pause(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        player.muted = true;
        player.play().catch(error => { if (error.name !== 'AbortError') setFailedVideo(source); });
      } else player.pause();
    }, { threshold: 0.05 });
    observer.observe(player);
    return () => { observer.disconnect(); player.pause(); };
  }, [playing, source, failedVideo]);

  if (source && failedVideo !== source) {
    return <video ref={video} src={source} poster={project.image || undefined} muted playsInline loop preload="metadata" aria-label={`${project.client} video preview`} onError={() => setFailedVideo(source)} />;
  }
  if (project.image && failedImage !== project.image) {
    return <img src={project.image} alt={`${project.client} preview`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} onError={() => setFailedImage(project.image)} />;
  }
  return (
    <div className="work-reel-cover" aria-hidden="true">
      <span>{String(index + 1).padStart(2, '0')}</span>
      <strong>{project.tags?.[0] || 'Project'}</strong>
      <small>{project.tags?.slice(1, 3).join(' / ') || 'Project overview'}</small>
    </div>
  );
}

function WorkReel({ projects, animationReady }) {
  const viewport = useRef(null);
  const [paused, setPaused] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const running = eligible && !paused && !keyboard;
  const items = Array.from({ length: Math.ceil(4 / projects.length) }, () => projects).flat();

  useEffect(() => {
    if (!animationReady) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      setReduced(preference.matches);
      setEligible(visible && !document.hidden && !preference.matches);
    };
    const changeMotion = () => { viewport.current.scrollLeft = 0; update(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      update();
    }, { threshold: 0.1 });
    observer.observe(viewport.current);
    document.addEventListener('visibilitychange', update);
    preference.addEventListener('change', changeMotion);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      preference.removeEventListener('change', changeMotion);
    };
  }, [animationReady]);

  const focusProject = event => {
    const link = event.target.closest('.work-reel-link');
    if (!link || !link.matches(':focus-visible')) return;
    setKeyboard(true);
    requestAnimationFrame(() => {
      if (!viewport.current) return;
      const item = link.closest('.work-reel-item');
      viewport.current.scrollTo({ left: item.offsetLeft - (viewport.current.clientWidth - item.clientWidth) / 2, behavior: 'instant' });
    });
  };

  return (
    <section id="work" className={`projects-section work-reel${running ? ' is-running' : ''}${keyboard ? ' is-keyboard' : ''}`} aria-labelledby="work-heading" style={{ '--loop-duration': `${items.length * 8}s` }}>
      <header className="container work-section-heading">
        <h2 id="work-heading">Selected work<span>.</span></h2>
        <div className="work-reel-actions">
          <p>Development, data &amp; applied AI</p>
          <button type="button" className="work-reel-toggle" aria-label={reduced ? 'Motion disabled by reduced-motion setting' : paused ? 'Resume continuous gallery' : 'Pause continuous gallery'} aria-controls="work-reel-track" disabled={reduced} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
        </div>
      </header>

      <div ref={viewport} className="work-reel-window" role="region" aria-label="Continuously scrolling project images and videos" onFocusCapture={focusProject} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { event.currentTarget.scrollLeft = 0; setKeyboard(false); } }}>
        <div id="work-reel-track" className="work-reel-track">
          {[0, 1].map(copy => (
            <div key={copy} className="work-reel-group" role="list" aria-hidden={copy === 1 || undefined}>
              {items.map((project, index) => {
                const duplicate = copy === 1 || index >= projects.length;
                return (
                  <article key={`${copy}-${project.id}-${index}`} className="work-reel-item" role="listitem" aria-hidden={duplicate || undefined}>
                    <a className="work-reel-link" href={projectPath(project.id)} tabIndex={duplicate ? -1 : 0} aria-label={`View ${project.client}`}>
                      <div className="work-reel-media"><ProjectMedia project={project} index={index % projects.length} playing={running} /></div>
                      <div className="work-reel-caption">
                        <div><h3>{project.client.replace(/\s+\([^()]*\)$/, '')}</h3><p>{project.tags?.slice(0, 3).join(' / ')}</p></div>
                        <ArrowUpRight size={20} aria-hidden="true" />
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Projects({ animationReady = true }) {
  const { data } = usePortfolio();
  const projects = data.projects.filter(project => project.visible !== false);
  return projects.length ? <WorkReel key={projects.map(project => project.id).join('|')} projects={projects} animationReady={animationReady} /> : null;
}
