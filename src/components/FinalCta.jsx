import { usePortfolio } from '../context/PortfolioContext';
import './FinalCta.css';

const FinalCta = () => {
  const { data } = usePortfolio();
  const ctaData = data.finalCta;

  return (
    <section className="final-cta-section" data-reveal id="contact">
      <div className="section-glow"></div>
      {/* Reusing particle texture idea for ambient background */}
      <div className="final-cta-bg"></div>
      
      <div className="container">
        <div className="final-cta-content">
          <h2 className="final-cta-headline">{ctaData.headline}</h2>
          <p className="final-cta-desc">
            {ctaData.desc}
          </p>
          <a href={`mailto:${ctaData.email || 'saadsalam659@email.com'}`} className="btn-primary btn-icon-shift">
            {ctaData.buttonText || 'Get in touch'} <span className="icon">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
