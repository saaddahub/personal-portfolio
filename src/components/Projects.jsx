import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { projectColor, projectPath } from '../lib/projects';
import './Projects.css';

function ProjectArtwork({ project, index }) {
  const [failedImage, setFailedImage] = useState('');
  return project.image && failedImage !== project.image ? (
    <img src={project.image} alt={`${project.client} preview`} draggable="false" onError={() => setFailedImage(project.image)} />
  ) : (
    <div className="showcase-artwork" aria-hidden="true">
      <span>{String(index + 1).padStart(2, '0')}</span>
      <div className="showcase-artwork-window"><i /><i /><i /><div /><div /><div /></div>
      <div className="showcase-artwork-orbit" />
    </div>
  );
}

function WorkShowcase({ projects }) {
  const [selection, setSelection] = useState({ id: null, direction: 1 });
  const index = Math.max(0, projects.findIndex(project => project.id === selection.id));
  const project = projects[index];
  const color = projectColor(project, index);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const frame = useRef(null);
  const palette = useRef(null);
  const dragged = useRef(false);
  const inView = useInView(frame, { amount: 0.15 });
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 100, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 100, damping: 24 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);

  const select = target => {
    const resolved = (target + projects.length) % projects.length;
    if (resolved === index) return;
    setSelection({ id: projects[resolved].id, direction: target > index ? 1 : -1 });
    const swatch = palette.current?.children[resolved];
    if (swatch) palette.current.scrollTo({ left: Math.max(0, swatch.offsetLeft - palette.current.offsetLeft - palette.current.clientWidth / 2 + swatch.clientWidth / 2), behavior: reduced ? 'instant' : 'smooth' });
  };
  const resetTilt = () => { pointerX.set(0); pointerY.set(0); };
  const transition = reduced ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 23, mass: 0.8 };
  return (
    <motion.div ref={frame} className={`work-showcase ${inView ? 'is-inview' : ''}`} style={{ '--showcase-color': color }}
      initial={reduced ? false : { opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduced ? 0 : 0.8 }}>
      <div className="showcase-grain" aria-hidden="true" />
      <AnimatePresence initial={false}>
        <motion.div key={color} className="showcase-atmosphere" style={{ background: `radial-gradient(ellipse at 50% 48%, ${color}38, transparent 65%)` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.9 }} aria-hidden="true" />
      </AnimatePresence>
      <header className="showcase-header"><div><span className="showcase-eyebrow"><i /> A few things I've built</span><h2 id="work-heading">Ideas into<br /><em>interfaces.</em></h2></div><span className="showcase-counter"><motion.b key={index} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{String(index + 1).padStart(2, '0')}</motion.b><span>/ {String(projects.length).padStart(2, '0')}</span></span></header>

      <div className="showcase-stage" onPointerMove={event => {
        if (reduced || event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
      }} onPointerLeave={resetTilt}>
        <div className="showcase-orbits" aria-hidden="true"><i /><i /><i /></div>
        <div className="showcase-floor" aria-hidden="true" />
        <motion.div className="showcase-deck" style={reduced ? {} : { rotateX, rotateY }}>
          {projects.length > 1 && <>
            <motion.button className="showcase-ghost showcase-ghost-left" aria-label={`Previous project: ${previous.client}`} onClick={() => select(index - 1)} style={{ background: projectColor(previous, (index - 1 + projects.length) % projects.length) }} animate={{ rotate: -10, x: '-8%', y: '5%' }} whileHover={reduced ? {} : { rotate: -13, x: '-12%' }} transition={transition}><span aria-hidden="true">{previous.tags?.[0] || 'Project'}</span></motion.button>
            <motion.button className="showcase-ghost showcase-ghost-right" aria-label={`Next project: ${next.client}`} onClick={() => select(index + 1)} style={{ background: projectColor(next, (index + 1) % projects.length) }} animate={{ rotate: 8, x: '8%', y: '3%' }} whileHover={reduced ? {} : { rotate: 12, x: '12%' }} transition={transition}><span aria-hidden="true">{next.tags?.[0] || 'Project'}</span></motion.button>
          </>}
          <AnimatePresence initial={false} mode="popLayout" custom={selection.direction}>
            <motion.div key={project.id} className="showcase-card-position" custom={selection.direction}
              variants={{ enter: direction => ({ opacity: 0, x: reduced ? 0 : direction * 65, y: reduced ? 0 : 20, rotate: reduced ? 0 : direction * 5, scale: reduced ? 1 : 0.9 }), center: { opacity: 1, x: 0, y: 0, rotate: -2, scale: 1 }, exit: direction => ({ opacity: 0, x: reduced ? 0 : direction * -75, rotate: reduced ? 0 : direction * -7, scale: reduced ? 1 : 0.92 }) }} initial="enter" animate="center" exit="exit" transition={transition}>
              <motion.div className="showcase-card-float" animate={!reduced && inView ? { y: [0, -9, 0] } : { y: 0 }} transition={{ duration: 5, repeat: !reduced && inView ? Infinity : 0, ease: 'easeInOut' }}>
                <motion.div className="showcase-card" style={{ '--card-color': color }} drag={!reduced && projects.length > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragStart={() => { dragged.current = true; }} onDragEnd={(_event, info) => { if (Math.abs(info.offset.x) > 40 || Math.abs(info.velocity.x) > 400) select(index + (info.offset.x < 0 || info.velocity.x < -400 ? 1 : -1)); }}>
                  <a href={projectPath(project.id)} aria-label={`Explore ${project.client}`} onPointerDown={() => { dragged.current = false; }} onClick={event => { if (dragged.current) event.preventDefault(); }} draggable="false">
                    <div className="showcase-browser"><span><i /><i /><i /></span><small>{project.url || project.tags?.slice(0, 2).join(' / ') || 'Selected project'}</small><ArrowUpRight size={13} /></div>
                    <div className="showcase-image"><ProjectArtwork project={project} index={index} /><div className="showcase-glass" /><span className="showcase-open"><ArrowUpRight size={22} /></span></div>
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="showcase-caption" aria-live="polite" aria-atomic="true"><AnimatePresence mode="wait" initial={false}><motion.div key={project.id} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: reduced ? 0 : 0.18 }}><span>{project.tags?.slice(0, 3).join(' / ') || 'Selected work'}</span><h3><a href={projectPath(project.id)}>{project.client}<ArrowUpRight size={20} /></a></h3></motion.div></AnimatePresence></div>
      <footer className="showcase-controls"><button className="showcase-arrow" disabled={projects.length < 2} onClick={() => select(index - 1)} aria-label="Previous project"><ArrowLeft size={18} /></button><div className="showcase-palette" ref={palette} aria-label="Choose a project">{projects.map((item, i) => <button key={item.id} className={`showcase-swatch ${i === index ? 'is-selected' : ''}`} style={{ '--swatch-color': projectColor(item, i) }} aria-label={`Preview ${item.client}`} aria-pressed={i === index} onPointerEnter={event => { if (event.pointerType === 'mouse') select(i); }} onClick={() => select(i)} onKeyDown={event => {
        const target = event.key === 'ArrowRight' ? i + 1 : event.key === 'ArrowLeft' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : null;
        if (target === null) return;
        event.preventDefault(); select(target); palette.current?.children[(target + projects.length) % projects.length]?.focus();
      }}><span />{i === index && <motion.i layoutId="work-swatch-indicator" transition={transition} />}</button>)}</div><button className="showcase-arrow" disabled={projects.length < 2} onClick={() => select(index + 1)} aria-label="Next project"><ArrowRight size={18} /></button></footer>
      <span className="showcase-signature" aria-hidden="true">Selected work · Designed to be explored</span>
    </motion.div>
  );
}

export default function Projects() {
  const { data } = usePortfolio();
  const projects = data.projects.filter(project => project.visible !== false);
  if (!projects.length) return null;
  return <section className="projects-section" id="work" aria-labelledby="work-heading"><div className="container"><WorkShowcase projects={projects} /></div></section>;
}
