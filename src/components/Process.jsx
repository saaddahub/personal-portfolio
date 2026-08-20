import './Process.css';

const Process = () => {
  const steps = [
    {
      id: '01',
      title: 'Private Tutor',
      description: 'Tutoring students in English language, fluency, and vocabulary development with structured lesson plans.'
    },
    {
      id: '02',
      title: 'Freelance Developer',
      description: 'Full-stack development using the MERN stack. Delivered 10+ freelance projects including AI-powered tools.'
    },
    {
      id: '03',
      title: 'Clothing Brand Founder',
      description: 'Launched and managed an aesthetic clothing brand with a curated Instagram presence and handled end-to-end brand operations.'
    },
    {
      id: '04',
      title: 'AI Enthusiast',
      description: 'Applied prompt engineering to build and fine-tune AI-driven features and workflows across multiple projects.'
    }
  ];

  return (
    <section className="process-section reveal-on-scroll" id="services">
      <div className="container">
        <div className="process-header">
          <p className="text-caption text-muted">Experience</p>
          <h2 className="process-headline">
            My professional journey<br />
            and entrepreneurial ventures.
          </h2>
        </div>

        <div className="process-grid">
          {steps.map((step) => (
            <div key={step.id} className="process-card">
              <div className="process-tag">
                <span className="process-num">{step.id}</span>
                <span className="process-title">{step.title}</span>
              </div>
              <p className="process-desc text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
