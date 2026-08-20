import { useState, useEffect } from 'react';
import './Nav.css';
import ThemeToggle from './ThemeToggle';
import ContactButton from './ContactButton';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`site-nav ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo">
            <a href="#">Saad Akhtar</a>
          </div>
          
          <nav className="nav-links desktop-only">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
          </nav>
          
          <div className="nav-cta">
            <ThemeToggle />
            <ContactButton href="#contact" className="desktop-only" />
            
            <button 
              className="hamburger mobile-only" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
              <div className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <div onClick={() => setMobileMenuOpen(false)}>
            <ContactButton href="#contact" />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Nav;
