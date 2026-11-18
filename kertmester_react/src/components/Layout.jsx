import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { path: 'fooldal', label: 'Főoldal' },
  { path: 'tervezo', label: 'Tervező' },
  { path: 'webshop', label: 'Webshop' },
  { path: 'profil', label: 'Profil' }
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return undefined;
    const timer = window.setTimeout(() => closeRef.current && closeRef.current.focus(), 300);
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openNav() {
    lastFocused.current = document.activeElement;
    setOpen(true);
  }

  function closeNav() {
    setOpen(false);
    if (lastFocused.current) lastFocused.current.focus();
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#/fooldal" className="brand" aria-label="Kertmester — kezdőlap">
            <img className="brand-mark logo-img" src="imgs/icon.png" alt="Logo" />
            <span className="brand-name">Kertmester</span>
          </a>

          <button className="hamburger" aria-expanded={open} aria-controls="siteNav" aria-label="Menü megnyitása" onClick={() => (open ? closeNav() : openNav())}>
            <span className="hamburger-box">
              <span className="hamburger-line line1"></span>
              <span className="hamburger-line line2"></span>
              <span className="hamburger-line line3"></span>
            </span>
            <span className="hamburger-label">Menü</span>
          </button>
        </div>
      </header>

      <div className={`nav-overlay${open ? ' is-visible' : ''}`} onClick={closeNav}></div>

      <nav className={`site-nav${open ? ' is-open' : ''}`} id="siteNav" aria-hidden={!open}>
        <div className="nav-top">
          <span className="nav-brand">Kertmester</span>
          <button className="nav-close" ref={closeRef} aria-label="Menü bezárása" onClick={closeNav}>
            <span></span>
            <span></span>
          </button>
        </div>

        <ol className="nav-list">
          {LINKS.map((link, i) => (
            <li key={link.path} style={{ '--i': i }}>
              <a href={`#/${link.path}`} onClick={closeNav}>{link.label}</a>
            </li>
          ))}
        </ol>

        <div className="nav-foliage" aria-hidden="true">
          <img className="logo-img logo-img--ghost" src="imgs/icon.png" alt="Logo" />
        </div>
      </nav>

      {children}

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-name">Kertmester</span>
          </div>

          <div className="footer-col">
            <h3>Navigáció</h3>
            <ul>
              {LINKS.map((link) => (
                <li key={link.path}><a href={`#/${link.path}`}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Elérhetőség</h3>
            <ul>
              <li><a href="mailto:hello@kertmester.hu">hello@kertmester.hu</a></li>
              <li><a href="tel:+36301234567">+36 30 123 4567</a></li>
              <li>Pósfa, Vas vármegye</li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" aria-hidden="true"></div>

        <div className="footer-bottom">
          <span>© 2026 Kertmester</span>
        </div>
      </footer>
    </>
  );
}
