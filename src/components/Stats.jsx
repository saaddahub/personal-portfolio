import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Stats.css';

const Stats = () => {
  const containerRef = useRef(null);

  const stats = [
    { value: 10, suffix: '+', label: 'Projects Completed' },
    { value: 5, suffix: '+', label: 'Frameworks Mastered' },
    { value: 4, suffix: '', label: 'Languages' },
    { value: 2028, suffix: '', label: 'Graduation Year' }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Counter animation triggered on scroll
      gsap.fromTo('.stat-num-val', 
        {
          textContent: 0
        },
        {
          textContent: (i, target) => target.dataset.target,
          duration: 1.8,
          ease: 'power3.out',
          snap: { textContent: 1 }, // snap to whole numbers
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            once: true
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="stats-section reveal-on-scroll" ref={containerRef} id="about">
      {/* Optional: faint background texture reused from hero */}
      <div className="stats-bg-texture"></div>
      
      <div className="container">
        <div className="stats-value-prop">
          <p>
            I am passionate about Object-Oriented Programming, Database Design, AI Fundamentals, and Web Development. I'm currently expanding my skill set by diving deep into Machine Learning.
          </p>
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-number">
                <span className="stat-num-val" data-target={stat.value}>0</span>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
