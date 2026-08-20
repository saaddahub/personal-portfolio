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
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!prefersReducedMotion) {
              document.querySelectorAll('.stat-num-val').forEach((el, index) => {
                const targetVal = parseFloat(el.dataset.target);
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: targetVal,
                  duration: 1.8,
                  delay: index * 0.1,
                  ease: 'power3.out',
                  onUpdate: () => {
                    el.textContent = Math.floor(obj.val);
                  }
                });
              });
            } else {
              document.querySelectorAll('.stat-num-val').forEach(el => {
                el.textContent = el.dataset.target;
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });
      
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="stats-section" data-reveal ref={containerRef} id="about">
      {/* Background Glow for value prop */}
      <div className="section-glow"></div>
      
      <div className="stats-bg-texture"></div>
      
      <div className="container">
        <div className="stats-header">
          <p className="text-caption text-muted">About me</p>
          <h2 className="stats-headline">My Focus</h2>
        </div>
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
