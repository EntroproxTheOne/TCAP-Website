import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => (
  <footer className="w-full py-stack-lg bg-background border-t border-white/5">
    <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter">
      <Link to="/" className="flex items-center">
        <img
          src={`${process.env.PUBLIC_URL}/assets/tcet-capture-logo.png`}
          alt="TCET Capture"
          className="h-8 w-auto object-contain"
        />
      </Link>

      <div className="flex flex-wrap justify-center gap-8">
        <Link to="/" className="font-mono text-mono-technical text-outline hover:text-primary transition-colors hover:underline decoration-accent-red underline-offset-4">
          Home
        </Link>
        <Link to="/gallery" className="font-mono text-mono-technical text-outline hover:text-primary transition-colors hover:underline decoration-accent-red underline-offset-4">
          Gallery
        </Link>
        <Link to="/team" className="font-mono text-mono-technical text-outline hover:text-primary transition-colors hover:underline decoration-accent-red underline-offset-4">
          Team
        </Link>
        <a
          href="https://www.instagram.com/tcet_capture/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-mono-technical text-outline hover:text-primary transition-colors flex items-center gap-2"
        >
          <FiInstagram size={16} /> Instagram
        </a>
        <a
          href="https://www.youtube.com/channel/UCECgbLhYnj75f_OGXPr2adQ"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-mono-technical text-outline hover:text-primary transition-colors flex items-center gap-2"
        >
          <FiYoutube size={16} /> YouTube
        </a>
      </div>

      <div className="font-mono text-mono-technical text-outline/50 uppercase tracking-widest text-center">
        © {new Date().getFullYear()} TCAP Media. System Active.
      </div>
    </div>
  </footer>
);

export default Footer;
