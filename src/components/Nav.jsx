import { useState, useEffect, useRef } from 'react';
import './Nav.css';
import ThemeToggle from './ThemeToggle';
import ContactButton from './ContactButton';

const Nav = ({ onMenuChange }) => {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 40);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    onMenuChange?.(mobileMenuOpen);
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const toggle = toggleRef.current;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector('a')?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const selector = 'a[href], button, input';
      const controls = [
        ...headerRef.current.querySelectorAll(selector),
        ...menuRef.current.querySelectorAll(selector),
      ].filter((element) => element.getClientRects().length > 0);
      const index = controls.indexOf(document.activeElement);
      const nextIndex = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[nextIndex]?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      onMenuChange?.(false);
      toggle?.focus({ preventScroll: true });
    };
  }, [mobileMenuOpen, onMenuChange]);

  return (
    <>
      <header className={`site-nav ${isScrolled ? 'is-scrolled' : ''}`} ref={headerRef}>
        <div className="nav-inner">
          <div className="nav-logo">
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Saad Akhtar</a>
          </div>
          
          <nav className="nav-links desktop-only" aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
          </nav>
          
          <div className="nav-cta">
            <ContactButton href="#contact" className="desktop-only" />
            
            <button 
              className="hamburger mobile-only" 
              ref={toggleRef}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <div className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
              <div className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-navigation"
        ref={menuRef}
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        inert={!mobileMenuOpen}
        aria-hidden={!mobileMenuOpen}
        data-lenis-prevent
      >
        <nav className="mobile-nav-links" aria-label="Mobile navigation" onClick={(event) => {
          if (event.target.closest('a')) setMobileMenuOpen(false);
        }}>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <ContactButton href="#contact" />
        </nav>
      </div>
    </>
  );
};

export default Nav;
