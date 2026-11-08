import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ArrowDown, ArrowUpRight, Check, Copy, Plus } from 'lucide-react';
import { startScene } from './blossom.js';
import { content } from './content.js';
import Showcase from './Showcase.jsx';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lahoreTime = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' }).format(new Date());

export default function App() {
  const treeCanvas = useRef(null), petalCanvas = useRef(null), scene = useRef(null), heroCopy = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [dawn, setDawn] = useState(false);

  useEffect(() => {
    const reduced = reducedMotion();
    scene.current = startScene({ treeCanvas: treeCanvas.current, petalCanvas: petalCanvas.current, reduced });
    const lenis = reduced ? null : new Lenis({ autoRaf: true, anchors: true, lerp: 0.085 });

    const dawnField = document.querySelector('[data-dawn]');
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(scrollY > 40);
      // The nav takes the dawn's colours once the lighter half of the sunrise (14rem in) is behind it.
      setDawn(dawnField.getBoundingClientRect().top + 224 < 72);
      if (reduced) return;
      // Hero copy clears out before it scrolls up into the lingering canopy.
      heroCopy.current.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * 0.35)).toFixed(3);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    update();

    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => reveal.observe(el));

    return () => {
      scene.current.stop();
      lenis?.destroy();
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      reveal.disconnect();
    };
  }, []);

  return (
    <>
      <canvas ref={petalCanvas} className="petals" aria-hidden="true" />
      <Nav scrolled={scrolled} dawn={dawn} />
      <main>
        <section id="top" className="hero" aria-labelledby="name">
          <canvas ref={treeCanvas} className="tree" aria-hidden="true" />
          <div className="wrap hero-copy" ref={heroCopy}>
            <h1 id="name" className="hero-name">
              {content.name.map((part, i) => <span className="line" key={part}><span style={{ '--i': i }}>{part}</span></span>)}
            </h1>
            <p className="hero-role">{content.role} {content.pitch}</p>
            <div className="hero-actions">
              <a className="action action-primary" href="#work">See the work <ArrowDown aria-hidden="true" /></a>
              <a className="action" href="#contact">Get in touch</a>
            </div>
            <p className="hero-hint" aria-hidden="true"><span className="fine">Move to stir the wind</span><span className="coarse">Scroll to stir the wind</span></p>
          </div>
        </section>

        <Showcase />

        <Work onGust={y => scene.current?.gust(y)} />
        <About />
        <Contact />
      </main>
    </>
  );
}

function Nav({ scrolled, dawn }) {
  return (
    <header className="nav" data-scrolled={scrolled} data-dawn-tone={dawn}>
      <nav className="nav-bar" aria-label="Main">
        <a className="nav-mark" href="#top">Saad<span> Akhtar</span></a>
        <ul>
          <li><a href="#work">Work</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

function Work({ onGust }) {
  const [open, setOpen] = useState(null);
  return (
    <section id="work" className="work wrap" aria-labelledby="work-title">
      <h2 id="work-title" className="section-title" data-reveal="fade">Selected work</h2>
      <ul className="work-list">
        {content.projects.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className="work-row" data-open={isOpen} data-reveal="fade" style={{ '--i': i }}>
              <h3>
                <button
                  type="button"
                  className="work-head"
                  aria-expanded={isOpen}
                  aria-controls={`panel-${p.id}`}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') { const b = e.currentTarget.getBoundingClientRect(); onGust(b.top + b.height / 2); } }}
                >
                  <span className="work-title">{p.title}</span>
                  <span className="work-meta"><span>{p.year}</span><span>{p.status}</span></span>
                  <Plus className="work-icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`panel-${p.id}`} className="work-panel" {...(!isOpen && { inert: '' })}>
                <div className="work-panel-inner">
                  <div className="work-detail">
                    <p className="work-description">{p.description}</p>
                    <dl className="work-facts">
                      <div><dt>Role</dt><dd>{p.role}</dd></div>
                      <div><dt>Built with</dt><dd>{p.stack.join(', ')}</dd></div>
                    </dl>
                    {p.liveUrl && <a className="action action-primary" href={p.liveUrl} target="_blank" rel="noreferrer">Visit the live project <ArrowUpRight aria-hidden="true" /></a>}
                  </div>
                  {p.image && <img className="work-image" src={p.image} alt={p.alt} loading="lazy" width="1416" height="797" />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about wrap" aria-labelledby="about-title">
      <h2 id="about-title" className="section-title about-title" data-reveal="fade">About</h2>
      <div className="about-body">
        {content.about.map(text => <p className="about-text" data-reveal="fade" key={text.slice(0, 16)}>{text}</p>)}
        <dl className="currently" data-reveal="fade">
          {content.currently.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}
        </dl>
        <ol className="timeline">
          {content.experience.map((e, i) => (
            <li key={e.title} data-reveal="fade" style={{ '--i': i }}>
              <span className="timeline-years">{e.years}</span>
              <div>
                <h3>{e.title}</h3>
                <p className="timeline-place">{e.place}</p>
                <p>{e.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(lahoreTime);
  useEffect(() => {
    const id = setInterval(() => setTime(lahoreTime()), 20000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(content.email); setCopied(true); }
    catch { location.href = `mailto:${content.email}`; }
  };

  return (
    <section id="contact" className="dawn" data-dawn aria-labelledby="contact-title">
      <div className="wrap dawn-inner">
        <h2 id="contact-title" className="dawn-title" data-reveal="bloom">Say hello.</h2>
        <p className="dawn-text" data-reveal="fade">{content.availability}</p>
        <div className="mail" data-reveal="fade">
          <a className="mail-link" href={`mailto:${content.email}`}>{content.email}</a>
          <button type="button" className="mail-copy" onClick={copy} aria-label={copied ? 'Email address copied' : 'Copy email address'}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </button>
          <span className="sr-only" role="status">{copied ? 'Email address copied' : ''}</span>
        </div>
        <ul className="links" data-reveal="fade">
          {content.links.map(l => <li key={l.label}><a className="action" href={l.url} target="_blank" rel="noreferrer">{l.label} <ArrowUpRight aria-hidden="true" /></a></li>)}
        </ul>
      </div>
      <footer className="wrap footer">
        <p>© {new Date().getFullYear()} Saad Akhtar</p>
        <p><span className="tabular">{time}</span> in Lahore, where the kachnar trees bloom pink each spring.</p>
      </footer>
      <div className="ground" data-ground aria-hidden="true" />
    </section>
  );
}
