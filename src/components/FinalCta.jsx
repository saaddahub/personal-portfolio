import './FinalCta.css';

const FinalCta = () => {
  return (
    <section className="final-cta-section" data-reveal id="contact">
      <div className="section-glow"></div>
      {/* Reusing particle texture idea for ambient background */}
      <div className="final-cta-bg"></div>
      
      <div className="container">
        <div className="final-cta-content">
          <h2 className="final-cta-headline">Ready to collaborate?</h2>
          <p className="final-cta-desc">
            I'm currently open to internships, research roles, and collaborative projects. If you're looking for an AI enthusiast or a full-stack developer to join your team, let's talk.
          </p>
          <a href="mailto:saadsalam659@email.com" className="btn-primary btn-icon-shift">
            Get in touch <span className="icon">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
