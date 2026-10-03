import { usePortfolio } from '../context/PortfolioContext';
import './CtaSplit.css';

const CtaSplit = () => {
  const { data } = usePortfolio();
  const ctaData = data.ctaSplit;

  const cardA = ctaData.swapped ? ctaData.right : ctaData.left;
  const cardB = ctaData.swapped ? ctaData.left : ctaData.right;

  return (
    <section className="cta-split-section" data-reveal style={{ paddingBlock: 0, position: 'relative' }}>
      <div className="section-glow"></div>
      <div className="cta-split-container">
        
        <div className="cta-split-half cta-left">
          <div className="cta-split-content">
            <h2>{cardA.title}</h2>
            <p>{cardA.description}</p>
            <a href={cardA.buttonLink || '#contact'} className="btn-split btn-split-left btn-icon-shift">
              {cardA.buttonText || 'Contact me'} <span className="icon">→</span>
            </a>
          </div>
        </div>

        <div className="cta-split-half cta-right">
          <div className="cta-split-content">
            <h2>{cardB.title}</h2>
            <p>{cardB.description}</p>
            <a href={cardB.buttonLink || '#contact'} className="btn-split btn-split-right btn-icon-shift">
              {cardB.buttonText || 'Hire me'} <span className="icon">→</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CtaSplit;
