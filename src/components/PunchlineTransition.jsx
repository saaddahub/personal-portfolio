import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../context/PortfolioContext';
import SkillsGlobe from './SkillsGlobe';
import './PunchlineTransition.css';

gsap.registerPlugin(ScrollTrigger);

import DottedText from './DottedText';

const PunchlineTransition = ({ animationReady = true, showGlobe = true }) => {
  const { data } = usePortfolio();
  const punchlineData = data.punchline;

  const sectionRef = useRef(null);
  const outgoingRef = useRef(null);
  const incomingRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!animationReady) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${showGlobe
            ? Math.max(1600, window.innerHeight + window.innerWidth)
            : 800}`,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Outgoing text zooming past the camera
      tl.to(outgoingRef.current, {
        scale: 8,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 0.5,
        ease: 'power2.in',
      }, 0);

      // Incoming text zooming into focus
      tl.fromTo(incomingRef.current, {
        scale: 0.4,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, 0.15); // overlaps with outgoing animation

      if (showGlobe) {
        // Let the headline settle before moving both panels as one continuous slide.
        tl.to(trackRef.current, {
          xPercent: -50,
          duration: 1.35,
          ease: 'power2.inOut',
          force3D: true,
        }, 0.95);
        // Arrive fully before releasing the pin into the next section.
        tl.to({}, { duration: 0.2 });
      }
    }, sectionRef);

    // Refresh after fonts have settled, without retaining callbacks after unmount.
    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh();
    });

    return () => {
      disposed = true;
      media.revert();
    };
  }, [animationReady, showGlobe]);

  return (
    <section className={`punchline-transition-section ${showGlobe ? 'has-globe' : ''}`} ref={sectionRef}>
      <div className="punchline-sticky-container">
        <h2 className="punchline-outgoing" ref={outgoingRef}>
          {punchlineData.outgoingPrefix} <br/>
          <DottedText text={punchlineData.outgoingHighlight || 'data,'} />
          {punchlineData.outgoingSuffix}
        </h2>
        
        <div className="punchline-horizontal-track" ref={trackRef}>
          <div className="punchline-panel">
            <div className="punchline-incoming" ref={incomingRef}>
              <h2 className="incoming-headline">
                {punchlineData.incomingHeadline}
              </h2>
              <p className="incoming-sub">
                {punchlineData.incomingSub}
              </p>
            </div>
          </div>
          {showGlobe && (
            <div className="punchline-panel punchline-globe-panel">
              <SkillsGlobe embedded />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PunchlineTransition;
