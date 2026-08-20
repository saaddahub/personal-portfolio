import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const skillCategories = [
  { title: "LANGUAGES", items: ["C++", "Python", "SQL", "HTML/CSS", "JavaScript", "Urdu", "English", "German"] },
  { title: "FRAMEWORKS", items: ["React", "Node.js", "Express.js", "MongoDB"] },
  { title: "TOOLS", items: ["MySQL", "Git", "GitHub", "Antigravity", "Canva Pro", "Cisco"] },
  { title: "CONCEPTS", items: ["OOP", "Database Design", "AI Fundamentals", "Web Dev", "Data Structures", "Full-Stack Dev"] }
];

const Skills = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".skill-pill", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center+=200",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="panel stack-panel" ref={containerRef} style={{ zIndex: 4, minHeight: '100vh', paddingBottom: '10rem' }}>
       <p className="mono-text" style={{ color: 'var(--primary)', marginBottom: '4rem', letterSpacing: '0.1em' }}>
        04 // SKILLS
      </p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', width: '100%' }}>
        {skillCategories.map((cat, idx) => (
          <div key={idx}>
            <h3 className="mono-text" style={{ color: 'var(--text-primary)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              {cat.title}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {cat.items.map((skill, i) => (
                <div 
                  key={i} 
                  className="skill-pill"
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    backgroundColor: 'rgba(15, 15, 19, 0.4)',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.3s, border-color 0.3s, transform 0.3s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
       </div>
    </section>
  );
};

export default Skills;
