import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { projectColor, projectPath } from '../lib/projects';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

function ProjectImage({ project, index }) {
  const [failed, setFailed] = useState('');
  if (project.image && failed !== project.image) {
    return <img src={project.image} alt={`${project.client} project preview`} loading={index === 0 ? 'eager' : 'lazy'} onError={() => setFailed(project.image)} />;
  }
  return <div className="work-image-fallback" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><div /><small>{project.tags?.slice(0, 2).join(' / ') || 'Selected project'}</small></div>;
}

function ScrollWork({ projects, animationReady }) {
  const section = useRef(null);
  const timeline = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const ids = projects.map(project => project.id).join('|');

  useEffect(() => {
    if (!animationReady) return;
    let disposed = false;
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 800px) and (min-height: 620px)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      const { desktop, reduced } = context.conditions;
      const root = section.current;
      const articles = [...root.querySelectorAll('.work-entry')];
      if (!desktop || reduced || projects.length < 2) {
        root.classList.remove('is-pinned');
        setPinned(false);
        if (!reduced) articles.forEach(article => {
          gsap.fromTo(article.querySelector('.work-visual'), { y: 36, opacity: 0.35 }, {
            y: 0, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: article, start: 'top 90%', end: 'top 45%', scrub: true },
          });
        });
        return;
      }
      root.classList.add('is-pinned');
      setPinned(true);
      const visuals = articles.map(article => article.querySelector('.work-visual'));
      const copy = articles.map(article => article.querySelector('.work-entry-copy'));
      const length = projects.length - 0.35;
      activeRef.current = 0;
      setActive(0);
      gsap.set(visuals.slice(1), { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 8 });
      gsap.set(copy.slice(1), { autoAlpha: 0, y: 24 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + Math.round((projects.length - 1) * window.innerHeight * 0.9 + window.innerHeight * 0.4),
          pin: root.querySelector('.work-pin'),
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          const current = Math.min(projects.length - 1, Math.floor(this.time() + 0.1));
          if (current !== activeRef.current) { activeRef.current = current; setActive(current); }
        },
      });
      tl.to(root.querySelector('.work-progress-fill'), { scaleX: 1, duration: length, ease: 'none' }, 0);
      for (let i = 1; i < projects.length; i++) {
        tl.to(copy[i - 1], { autoAlpha: 0, y: -24, duration: 0.22, ease: 'power1.in' }, i - 0.35);
        tl.to(visuals[i - 1].querySelector('.work-image-inner'), { scale: 0.94, opacity: 0.7, duration: 0.6, ease: 'none' }, i - 0.35);
        tl.to(visuals[i], { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 0.6, ease: 'power2.inOut' }, i - 0.35);
        tl.to(copy[i], { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out' }, i - 0.1);
      }
      timeline.current = tl;
      return () => { timeline.current = null; root.classList.remove('is-pinned'); };
    }, section);
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; media.revert(); };
  // The animation geometry depends on project order/count, not on edited copy.
  }, [animationReady, ids, projects.length]);

  const jumpTo = index => {
    const trigger = timeline.current?.scrollTrigger;
    if (!trigger) return;
    const length = projects.length - 0.35;
    window.scrollTo({ top: trigger.start + (index / length) * (trigger.end - trigger.start), behavior: 'instant' });
  };

  return (
    <section id="work" ref={section} className="projects-section" aria-labelledby="work-heading">
      <div className="work-pin">
        <div className="container work-layout">
          <header className="work-section-heading"><div><span className="work-kicker">Portfolio / Selected projects</span><h2 id="work-heading">Selected work<span>.</span></h2></div><span className="work-section-note">Development, data &amp; applied AI</span></header>
          <div className="work-entries">
            {projects.map((project, index) => {
              const inactive = pinned && active !== index;
              return <article key={project.id} className="work-entry" style={{ '--work-accent': projectColor(project, index), '--work-order': index }} aria-hidden={inactive || undefined}>
                <div className="work-entry-copy">
                  <span className="work-entry-number">{String(index + 1).padStart(2, '0')} <i /> {project.tags?.[0] || 'Project'}</span>
                  <h3>{project.client}</h3>
                  <p>{project.outcome}</p>
                  <div className="work-technologies">{project.tags?.slice(0, 4).map((tag, i) => <span key={`${tag}-${i}`}>{tag}</span>)}</div>
                  <a className="work-case-link" href={projectPath(project.id)} tabIndex={inactive ? -1 : undefined}>Explore project <ArrowUpRight size={18} /></a>
                </div>
                <a className="work-visual" href={projectPath(project.id)} tabIndex={inactive ? -1 : undefined} aria-label={`View ${project.client}`}>
                  <div className="work-image-inner"><ProjectImage project={project} index={index} /></div>
                  <span className="work-visual-open"><ArrowUpRight size={22} /></span>
                </a>
              </article>;
            })}
          </div>
          <footer className="work-scroll-footer" aria-hidden={!pinned || undefined}>
            <span className="work-scroll-prompt"><ArrowDown size={13} /> Scroll to explore</span>
            <div className="work-chapters" aria-label="Jump to project">{projects.map((project, index) => <button key={project.id} aria-label={`Scroll to ${project.client}`} aria-current={index === active ? 'step' : undefined} tabIndex={pinned ? 0 : -1} onClick={() => jumpTo(index)} style={{ '--chapter-color': projectColor(project, index) }}><span /><small>{String(index + 1).padStart(2, '0')}</small></button>)}</div>
            <span className="work-scroll-count">{String(active + 1).padStart(2, '0')} <span>/ {String(projects.length).padStart(2, '0')}</span></span>
          </footer>
          <div className="work-progress" aria-hidden="true"><div className="work-progress-fill" /></div>
        </div>
      </div>
    </section>
  );
}

export default function Projects({ animationReady = true }) {
  const { data } = usePortfolio();
  const projects = data.projects.filter(project => project.visible !== false);
  return projects.length ? <ScrollWork projects={projects} animationReady={animationReady} /> : null;
}
