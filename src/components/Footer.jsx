import './Footer.css';
import SocialMenu from './SocialMenu';
const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-big-text-wrapper">
            <h1 className="footer-ghost-name">SAAD AKHTAR</h1>
          </div>
          
          <div className="footer-info">
            <p className="footer-tagline">AI undergraduate and full-stack developer.</p>
            <div className="footer-social-wrapper">
              <SocialMenu />
            </div>
          </div>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom">
            <p className="text-caption text-muted">© {new Date().getFullYear()} Saad Akhtar. All rights reserved.</p>
            <p className="text-caption text-muted">Lahore, Pakistan</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
