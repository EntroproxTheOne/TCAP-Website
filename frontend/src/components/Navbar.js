import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const LOGO_URL = `${process.env.PUBLIC_URL}/assets/tcet-capture-logo.png`;

const navLinks = [
  { to: '/', label: 'Home', hash: null },
  { to: '/gallery', label: 'Gallery', hash: null },
  { to: '/team', label: 'Team', hash: null },
  { to: '/', label: 'Contact', hash: '#contact' },
];

const Navbar = ({ darkBackground = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavClick = (link) => {
    if (link.hash && location.pathname === '/') {
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    } else if (link.hash) {
      navigate('/');
      setTimeout(() => {
        document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setMobileOpen(false);
  };

  const navBgClass = scrolled || darkBackground
    ? 'frosted-glass-dark border-b border-white/10'
    : 'bg-background/90 backdrop-blur-md border-b border-white/5';

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBgClass} ${scrolled ? 'py-3' : 'py-4'}`}
        id="navbar"
      >
        <div className="max-w-container mx-auto flex justify-between items-center px-margin-mobile md:px-margin-desktop relative">
          <Link to="/" className="flex items-center shrink-0 z-10">
            <img
              src={LOGO_URL}
              alt="TCET Capture"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) =>
              link.hash ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link)}
                  className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors whitespace-nowrap"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`font-label text-label-caps uppercase transition-colors whitespace-nowrap ${
                    location.pathname === link.to
                      ? 'text-accent-red'
                      : 'text-on-surface-variant hover:text-accent-red'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            {currentUser && userRole === 'admin' && (
              <Link
                to="/admin"
                className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors whitespace-nowrap"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 z-10">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors"
              >
                Login
              </button>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-primary p-2 z-10"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 frosted-glass-dark md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-72 z-50 frosted-glass border-l border-white/10 md:hidden flex flex-col pt-24 px-8 gap-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {navLinks.map((link) =>
                link.hash ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNavClick(link)}
                    className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red text-left transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              {currentUser && userRole === 'admin' && (
                <Link to="/admin" className="font-label text-label-caps uppercase text-on-surface-variant hover:text-accent-red">
                  Admin
                </Link>
              )}
              {currentUser ? (
                <button type="button" onClick={handleLogout} className="font-label text-label-caps uppercase text-accent-red text-left">
                  Logout
                </button>
              ) : (
                <button type="button" onClick={() => { setLoginOpen(true); setMobileOpen(false); }} className="font-label text-label-caps uppercase text-accent-red text-left">
                  Login
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
