import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { content } from '../content.js';
import { Link } from '../router.jsx';
import Showcase from '../Showcase.jsx';
import Scribble, { useOnce } from '../scribble/Scribble.jsx';

export default function Home() {
  const heroCopy = useRef(null);
  const name = useOnce('name'), story = useOnce('story'), sound = useOnce('sound'), next = useOnce('next');
  const [at, setAt] = useState({ top: true, intro: false, past: false, end: false });
  const [soundOff, setSoundOff] = useState(true);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    // Hero copy clears out before it scrolls up into the lingering canopy.
    const update = () => { frame = 0; heroCopy.current.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * 0.35)).toFixed(3); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  // Where the visitor is, for the crayon notes: still at the top, inside the Showcase's opening chapter, past it,
  // or at the link to the work. And whether the narration pill still offers "Sound on".
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const h = innerHeight, intro = document.querySelector('.sc-intro')?.getBoundingClientRect(), end = document.querySelector('.page-next')?.getBoundingClientRect();
      const now = { top: scrollY < h * 0.3, intro: !!intro && intro.top < h / 2 && intro.bottom > h / 2, past: !!intro && intro.bottom <= h / 2, end: !!end && end.top < h * 0.75 };
      setAt(was => (Object.keys(now).every(k => now[k] === was[k]) ? was : now));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    check();
    const pill = document.querySelector('.sound');
    const read = () => setSoundOff(!!pill && pill.dataset.shown === 'true' && pill.textContent.includes('Sound on'));
    const watch = new MutationObserver(read);
    if (pill) watch.observe(pill, { attributes: true, childList: true, subtree: true });
    read();
    const tab = document.querySelector('.nav-tabs a[href="/story"]');
    tab?.addEventListener('click', story.finish);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame); watch.disconnect(); tab?.removeEventListener('click', story.finish); };
  }, [story.finish]);

  // Moving on dismisses a note for the rest of the session.
  const { finish: nameDone } = name, { finish: storyDone } = story, { finish: soundDone } = sound, { finish: nextDone } = next;
  useEffect(() => { if (!at.top) { nameDone(); storyDone(); } }, [at.top, nameDone, storyDone]);
  useEffect(() => { if (at.past || (at.intro && !soundOff)) soundDone(); }, [at.past, at.intro, soundOff, soundDone]);
  useEffect(() => { if (at.end) nextDone(); }, [at.end, nextDone]);

  return (
    <>
      <section className="hero" aria-labelledby="name">
        <div className="wrap hero-copy" ref={heroCopy}>
          <h1 id="name" className="hero-name">
            {content.name.map((part, i) => <span className="line" key={part}><span style={{ '--i': i }}>{part}</span></span>)}
          </h1>
          <p className="hero-role">{content.role} {content.pitch}</p>
          <div className="hero-actions">
            <Link className="action action-primary" to="/work">See the work <ArrowRight aria-hidden="true" /></Link>
            <Link className="action" to="/contact">Get in touch</Link>
          </div>
          <p className="hero-hint" aria-hidden="true"><span className="fine">Move to stir the wind</span><span className="coarse">Scroll to stir the wind</span></p>
          <Scribble anchor=".hero-name .line:last-child > span" text="that’s him" side="e" gap={[56, -78]} bend={0.35} seed={11} delay={3} avoid=".hero-role" show={name.on && at.top} />
        </div>
      </section>

      <Showcase />

      <nav className="page-next wrap" aria-label="Next page" data-reveal="fade">
        <Link to="/work"><span className="page-next-kicker">Next</span><span className="page-next-title">Selected work</span><ArrowRight aria-hidden="true" /></Link>
      </nav>

      {/* A curiosity gap: name something the visitor can't get anywhere else, and make it feel slightly private. */}
      <Scribble anchor='.nav-tabs a[href="/story"]' text={'psst. the part that\nisn’t on his CV'} side="s" gap={[-150, 46]} bend={-0.3} seed={4} delay={3.9} accent show={story.on && at.top} />
      <Scribble anchor=".sound" kind="circle" text={'I talk,\nif you let me'} side="nw" gap={[22, 42]} bend={0.3} seed={7} delay={0.6} avoid=".sc-intro .sc-caption" media="(min-width: 1120px)" show={sound.on && at.intro && soundOff} />
      <Scribble anchor=".page-next a" text={'quiet now, as promised.\nmostly.'} side="e" gap={[56, -34]} bend={0.3} seed={23} delay={0.4} show={next.fresh && at.end} />
    </>
  );
}
