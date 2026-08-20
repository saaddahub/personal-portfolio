import './Footer.css';

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
            <div className="footer-links">
              <a href="mailto:saadsalam659@email.com" className="btn-secondary">saadsalam659@email.com</a>
              <a href="https://linkedin.com/in/saad-akhtar-9aa695318" target="_blank" rel="noopener noreferrer" className="btn-secondary">LinkedIn</a>
              <a href="https://github.com/saadakhtar" target="_blank" rel="noopener noreferrer" className="btn-secondary">GitHub</a>
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
