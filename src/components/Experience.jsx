import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Experience = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".exp-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center+=100",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="panel stack-panel" ref={containerRef} style={{ zIndex: 3 }}>
      <p className="mono-text" style={{ color: 'var(--primary)', marginBottom: '4rem', letterSpacing: '0.1em' }}>
        03 // EXPERIENCE
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', maxWidth: '800px' }}>
        
        <div className="exp-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-5px', top: '0', width: '9px', height: '9px', background: 'var(--secondary)', borderRadius: '50%' }} />
          <p className="mono-text" style={{ color: 'var(--secondary)' }}>2025 — Present</p>
          <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Private Tutor</h3>
          <p className="serif-text" style={{ marginBottom: '1.5rem', opacity: 0.7, fontStyle: 'italic' }}>Self-employed · Lahore</p>
          <ul className="serif-text" style={{ listStyleType: 'none' }}>
            <li style={{ marginBottom: '0.75rem' }}>— Cultivated English language fluency and advanced vocabulary for primary students.</li>
            <li style={{ marginBottom: '0.75rem' }}>— Architected bespoke, structured lesson plans tailored to individual cognitive paces.</li>
            <li>— Delivered a measurable increase in reading confidence and written expression over a 6-month period.</li>
          </ul>
        </div>

        <div className="exp-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-5px', top: '0', width: '9px', height: '9px', background: 'var(--primary)', borderRadius: '50%' }} />
          <p className="mono-text" style={{ color: 'var(--primary)' }}>2024 — Present</p>
          <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Freelance Developer</h3>
          <p className="serif-text" style={{ marginBottom: '1.5rem', opacity: 0.7, fontStyle: 'italic' }}>Independent · Remote</p>
          <ul className="serif-text" style={{ listStyleType: 'none' }}>
            <li style={{ marginBottom: '0.75rem' }}>— Spearheaded end-to-end full-stack development leveraging the MERN ecosystem.</li>
            <li style={{ marginBottom: '0.75rem' }}>— Architected and delivered 10+ custom web applications, specializing in AI-integrated tools.</li>
            <li>— Pioneered prompt engineering workflows to fine-tune dynamic, AI-driven application features.</li>
          </ul>
        </div>


      </div>
    </section>
  );
};

export default Experience;
