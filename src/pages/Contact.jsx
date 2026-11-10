import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';
import { content } from '../content.js';
import { Link } from '../router.jsx';
import './pages.css';

const lahoreTime = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' }).format(new Date());
// The shell re-checks the nav's dawn tone on scroll, so the sunrise nudges it while the sky moves.
const nudgeNav = () => dispatchEvent(new Event('scroll'));
const pageChanging = () => document.getAnimations().some(a => a.effect?.pseudoElement?.startsWith('::view-transition'));

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(lahoreTime);
  const root = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(lahoreTime()), 20000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(id);
  }, [copied]);

  // The page opens at night; once the page change has settled, the sun comes up behind the tree.
  // Without motion the dawn is simply there (it is the default state in CSS).
  useEffect(() => {
    const el = root.current;
    if (!document.documentElement.classList.contains('motion')) { nudgeNav(); return; }
    let raf = 0, wait = 0, tick = 0, frames = 0;
    // The page-change animations only exist a frame or two after this page renders.
    const rise = () => {
      if (++frames < 3 || pageChanging()) { raf = requestAnimationFrame(rise); return; }
      wait = setTimeout(() => { el.dataset.sun = 'up'; tick = setInterval(nudgeNav, 100); }, 200);
    };
    const risen = e => { if (e.target.dataset.dawn !== undefined && e.propertyName === 'transform') { clearInterval(tick); nudgeNav(); } };
    raf = requestAnimationFrame(rise);
    el.addEventListener('transitionend', risen);
    return () => { cancelAnimationFrame(raf); clearTimeout(wait); clearInterval(tick); el.removeEventListener('transitionend', risen); };
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(content.email); setCopied(true); }
    catch { location.href = `mailto:${content.email}`; }
  };

  return (
    <section className="contact" ref={root} aria-labelledby="contact-title">
      <div className="sky" data-dawn aria-hidden="true" />
      <div className="sun" aria-hidden="true" />

      <div className="wrap contact-main">
        <div className="contact-lead">
          <h1 id="contact-title" className="dawn-title page-title" data-drop="contact">Say hello.</h1>
          <div data-reveal="rise">
            <p className="dawn-text">{content.availability}</p>
          </div>
          <div className="mail" data-reveal="rise" style={{ '--i': 1 }}>
            <a className="mail-link" href={`mailto:${content.email}`}>{content.email}</a>
            <button type="button" className="mail-copy" onClick={copy} aria-label={copied ? 'Email address copied' : 'Copy email address'}>
              <Copy aria-hidden="true" data-on={!copied} />
              <Check aria-hidden="true" data-on={copied} />
            </button>
            <span className="sr-only" role="status">{copied ? 'Email address copied' : ''}</span>
          </div>
        </div>

        <section className="socials" aria-labelledby="socials-title" data-reveal="rise" style={{ '--i': 2 }}>
          <h2 id="socials-title" className="socials-title">Socials</h2>
          <ul>
            {content.socials.map(s => (
              <li key={s.url}>
                <a className="social" href={s.url} {...(s.url.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}>
                  <span className="social-label">{s.label}</span>
                  <span className="social-handle">{s.handle}</span>
                  <span className="social-go" aria-hidden="true"><ArrowUpRight /></span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav className="page-next wrap" aria-label="Next page">
        <Link to="/story"><span className="page-next-kicker">Story</span><span className="page-next-title">Prefer it told as a story?</span><ArrowRight aria-hidden="true" /></Link>
      </nav>

      <footer className="wrap footer">
        <p>© {new Date().getFullYear()} Saad Akhtar</p>
        <p><span className="tabular">{time}</span> in Lahore, where the kachnar trees bloom pink each spring.</p>
      </footer>
      <div className="ground" data-ground aria-hidden="true" />
    </section>
  );
}
