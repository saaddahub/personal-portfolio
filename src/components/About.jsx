import './About.css';

const About = () => {
  return (
    <section className="about-section" data-reveal id="about-me">
      <div className="container">
        <div className="about-grid">
          
          <div className="about-photo-col">
            <div className="about-photo"></div>
          </div>
          
          <div className="about-text-col">
            <h2 className="about-headline">BS Artificial Intelligence at UMT, Lahore.</h2>
            <p className="about-desc">
              Currently pursuing my degree (2024-2028) with a 3.4 CGPA. My interests lie in AI Research, Machine Learning, Fashion, and Content Creation. I have a strong foundation in OOP and Data Structures, and a proven track record in web development and competitive speaking.
            </p>
            <a href="#contact" className="btn-secondary btn-icon-shift">
              More about me <span className="icon">→</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
