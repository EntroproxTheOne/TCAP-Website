import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const LOGO_URL = `${process.env.PUBLIC_URL}/assets/tcet-capture-logo.png`;

export default function MinimalNavbar({ overlay = false }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const baseClass = overlay
    ? 'bg-transparent border-transparent'
    : 'frosted-glass-dark border-b border-white/10';

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${baseClass} py-4`}>
        <div className="max-w-container mx-auto flex justify-between items-center px-margin-mobile md:px-margin-desktop">
          <Link to="/" className="flex items-center shrink-0">
            <img src={LOGO_URL} alt="TCET Capture" className="h-9 md:h-11 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-6 md:gap-8">
            <Link
              to="/gallery"
              className="label-condensed text-sm text-white/70 hover:text-accent-red transition-colors"
            >
              Gallery
            </Link>
            {currentUser && userRole === 'admin' && (
              <Link
                to="/admin"
                className="label-condensed text-sm text-white/70 hover:text-accent-red transition-colors"
              >
                Admin
              </Link>
            )}
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="label-condensed text-sm text-white/70 hover:text-accent-red transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="label-condensed text-sm text-white/70 hover:text-accent-red transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
