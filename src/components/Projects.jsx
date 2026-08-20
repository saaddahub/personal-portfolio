import './Projects.css';

const Projects = () => {
  const projects = [
    {
      id: 1,
      client: 'Netflix Data Visualiser (Python & Data Science)',
      outcome: 'Interactive exploratory data analysis and visualization dashboard for Netflix movies and TV shows. Analyzes genre distribution, release trends, content ratings, and international analytics.',
      image: '/images/netflix-visualiser.png',
      url: 'netflix-data-visualiser.demo',
      type: 'browser',
      tags: ['Python', 'Pandas', 'Data Science', 'Streamlit']
    },
    {
      id: 2,
      client: 'Hotel Management System (C++)',
      outcome: 'Modular C++ project with separate headers for rooms, bookings, customers, and services. Implemented OOP principles including inheritance, encapsulation, and file I/O operations.',
      type: 'standard',
      tags: ['C++', 'OOP', 'Data Structures']
    },
    {
      id: 3,
      client: 'Hospital Management System DB (MySQL)',
      outcome: 'Designed complete relational schema with ERD covering patients, staff, appointments, and billing. Applied normalization principles and wrote complex multi-join queries.',
      url: 'hospital-db.mysql',
      type: 'browser',
      tags: ['MySQL', 'Relational DB', 'ERD']
    },
    {
      id: 4,
      client: 'AI Interviewer (Python)',
      outcome: 'Built an AI-driven interviewer that generates role-specific questions and evaluates candidate responses using prompt engineering for dynamic flows.',
      type: 'standard',
      tags: ['Python', 'AI/LLM', 'Prompt Eng']
    },
    {
      id: 5,
      client: 'Demo Website / Portfolio (MERN)',
      outcome: 'Built and deployed a full-stack demo site integrating a React frontend with a Node.js/Express backend connected to MongoDB.',
      url: 'mern-portfolio.demo',
      type: 'browser',
      tags: ['React', 'Node.js', 'MongoDB']
    }
  ];

  return (
    <section className="projects-section" id="work">
      <div className="container" data-reveal>
        <h2 className="text-caption text-muted projects-label">Selected work</h2>
      </div>

      <div className="projects-scroll-container">
        <div className="projects-rail">
          {projects.map((project, index) => (
            <div key={project.id} className="project-card" data-reveal data-reveal-delay={index * 100}>
              {project.type === 'browser' ? (
                <div className="project-image-wrapper browser-chrome">
                  <div className="browser-topbar">
                    <div className="browser-dots">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <div className="browser-url">{project.url || 'example.com'}</div>
                  </div>
                  <div className="project-image browser-content">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.client} 
                        className="project-preview-img" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-placeholder-pattern"></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="project-image-wrapper standard-image">
                  <div className="project-image">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.client} 
                        className="project-preview-img" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-placeholder-pattern"></div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="project-details" style={{ marginTop: '1rem' }}>
                <span className="text-caption text-muted">{project.client}</span>
                <h3 className="project-title" style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.4, opacity: 0.9 }}>{project.outcome}</h3>
                <div className="project-tags-row">
                  {project.tags && project.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="project-tag-pill">{tag}</span>
                  ))}
                </div>
                <a href="#contact" className="project-link">View case →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
