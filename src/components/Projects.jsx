import './Projects.css';

const Projects = () => {
  const projects = [
    {
      id: 1,
      client: 'Hotel Management System (C++)',
      outcome: 'Modular C++ project with separate headers for rooms, bookings, customers, and services. Implemented OOP principles including inheritance, encapsulation, and file I/O operations.',
      type: 'standard'
    },
    {
      id: 2,
      client: 'Hospital Management System DB (MySQL)',
      outcome: 'Designed complete relational schema with ERD covering patients, staff, appointments, and billing. Applied normalization principles and wrote complex multi-join queries.',
      type: 'browser' // Uses the browser-chrome variant
    },
    {
      id: 3,
      client: 'AI Interviewer (Python)',
      outcome: 'Built an AI-driven interviewer that generates role-specific questions and evaluates candidate responses using prompt engineering for dynamic flows.',
      type: 'standard'
    },
    {
      id: 4,
      client: 'Demo Website / Portfolio (MERN)',
      outcome: 'Built and deployed a full-stack demo site integrating a React frontend with a Node.js/Express backend connected to MongoDB.',
      type: 'browser'
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
                    <div className="browser-url">example.com</div>
                  </div>
                  <div className="project-image browser-content"></div>
                </div>
              ) : (
                <div className="project-image-wrapper standard-image">
                  <div className="project-image"></div>
                </div>
              )}
              
              <div className="project-details" style={{ marginTop: '1rem' }}>
                <span className="text-caption text-muted">{project.client}</span>
                <h3 className="project-title" style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.4, opacity: 0.9 }}>{project.outcome}</h3>
                <a href="#" className="project-link">View case →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
