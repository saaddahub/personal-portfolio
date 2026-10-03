import { usePortfolio } from '../context/PortfolioContext';
import './About.css';

const About = () => {
  const { data } = usePortfolio();
  const aboutData = data.about;

  return (
    <section className="about-section" data-reveal id="about-me">
      <div className="container">
        <div 
          className="about-grid"
          style={{
            direction: aboutData.photoOrder === 'right' ? 'rtl' : 'ltr'
          }}
        >
          <div className="about-photo-col" style={{ direction: 'ltr' }}>
            <div className="about-photo"></div>
          </div>
          
          <div className="about-text-col" style={{ direction: 'ltr' }}>
            <h2 className="about-headline">{aboutData.headline}</h2>
            <p className="about-desc">
              {aboutData.desc}
            </p>
            <a href={aboutData.buttonLink || '#contact'} className="btn-secondary btn-icon-shift">
              {aboutData.buttonText || 'More about me'} <span className="icon">→</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;

