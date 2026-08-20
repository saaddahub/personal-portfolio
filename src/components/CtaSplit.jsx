import './CtaSplit.css';

const CtaSplit = () => {
  return (
    <section className="cta-split-section reveal-on-scroll" style={{ paddingBlock: 0 }}>
      <div className="cta-split-container">
        
        <div className="cta-split-half cta-left">
          <div className="cta-split-content">
            <h2>Interested in AI Research?</h2>
            <p>I am currently exploring Machine Learning and seeking opportunities to collaborate on research projects.</p>
            <a href="#contact" className="btn-split btn-split-left btn-icon-shift">
              Contact me <span className="icon">→</span>
            </a>
          </div>
        </div>

        <div className="cta-split-half cta-right">
          <div className="cta-split-content">
            <h2>Need a Full-Stack Developer?</h2>
            <p>Proficient in the MERN stack and Python. I've delivered over 10 freelance and personal web applications.</p>
            <a href="#contact" className="btn-split btn-split-right btn-icon-shift">
              Hire me <span className="icon">→</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CtaSplit;
