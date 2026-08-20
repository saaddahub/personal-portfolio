import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PunchlineTransition.css';

gsap.registerPlugin(ScrollTrigger);

import DottedText from './DottedText';

const PunchlineTransition = () => {
  const sectionRef = useRef(null);
  const outgoingRef = useRef(null);
  const incomingRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Fallback for reduced motion
      return;
    }

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=800', // Reduced from 1500px to remove dead space
          scrub: 1,      // buttery smooth scrub
          pin: true,
          anticipatePin: 1,
        },
      });

      // Outgoing text zooming past the camera
      tl.to(outgoingRef.current, {
        scale: 8,
        opacity: 0,
        filter: 'blur(20px)',
        ease: 'power2.in',
      }, 0);

      // Incoming text zooming into focus
      tl.fromTo(incomingRef.current, {
        scale: 0.4,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        ease: 'power2.out',
      }, 0.15); // overlaps with outgoing animation
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="punchline-transition-section" ref={sectionRef}>
      <div className="punchline-sticky-container">
        <h2 className="punchline-outgoing" ref={outgoingRef}>
          Building at the intersection of <br/>
          <DottedText text="data," />
          {' '}systems, and design.
        </h2>
        
        <div className="punchline-incoming" ref={incomingRef}>
          <h2 className="incoming-headline">
            I help founders shape their product.
          </h2>
          <p className="incoming-sub">
            Bridging the gap between AI research and scalable full-stack development.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PunchlineTransition;
