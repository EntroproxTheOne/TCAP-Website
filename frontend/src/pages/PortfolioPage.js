import React, { Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import ScrollExperience from '../components/three/ScrollExperience';
import { ThreeErrorBoundary } from '../components/three/ThreeErrorBoundary';
import LoadingScreen from '../components/three/LoadingScreen';
import MinimalNavbar from '../components/MinimalNavbar';
import TCAPWordmark from '../components/TCAPWordmark';
import PortfolioScrollOverlay from '../components/PortfolioScrollOverlay';
import TeamProfileModal from '../components/TeamProfileModal';
import { TeamSelectionProvider } from '../context/TeamSelectionContext';

export default function PortfolioPage() {
  const flashRef = useRef(null);
  const contactRef = useRef(null);
  const scrollRef = useRef({ offset: 0 });

  return (
    <TeamSelectionProvider>
      <div className="portfolio-root relative h-screen w-screen overflow-hidden">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, #ff2222 0%, #ff0000 30%, #e60000 55%, #b30000 100%)',
          }}
        />

        <MinimalNavbar overlay />

        <LoadingScreen />

        <PortfolioScrollOverlay scrollRef={scrollRef} />

        <ThreeErrorBoundary>
          <Suspense fallback={null}>
            <ScrollExperience flashRef={flashRef} contactRef={contactRef} scrollRef={scrollRef} />
          </Suspense>
        </ThreeErrorBoundary>

        <TeamProfileModal />

        <div
          ref={flashRef}
          className="fixed inset-0 z-30 bg-white pointer-events-none"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        <div
          ref={contactRef}
          id="contact"
          className="fixed bottom-0 left-0 right-0 z-40 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pb-8 pt-20 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
            <div className="mb-8 md:mb-12 border-b border-white/5 pb-8 md:pb-10">
              <TCAPWordmark
                size="hero"
                subtitle="Official Media Coverage · TCET"
              />
              <p className="font-condensed text-center text-white/30 text-xs md:text-sm uppercase tracking-[0.5em] mt-4">
                Power Behind The Picture
              </p>
            </div>

            <div className="frosted-glass p-8 md:p-12 border border-white/10 grid md:grid-cols-2 gap-8 pointer-events-auto">
              <div>
                <h2 className="section-heading-bold text-2xl md:text-3xl text-primary mb-4">
                  Initialize Production
                </h2>
                <p className="font-body text-on-surface-variant mb-6">
                  TCAP — The Official Media Coverage Team of TCET. Reach out for event coverage and collaborations.
                </p>
                <div className="space-y-3 font-condensed text-sm tracking-widest text-on-surface uppercase">
                  <p className="text-accent-red">TCAP@TCET.EDU</p>
                  <p>TCET Campus, Stage 4</p>
                </div>
                <div className="flex gap-6 mt-6">
                  <a
                    href="https://www.instagram.com/tcet_capture/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-condensed text-on-surface-variant hover:text-accent-red transition-colors text-sm"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCECgbLhYnj75f_OGXPr2adQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-condensed text-on-surface-variant hover:text-accent-red transition-colors text-sm"
                  >
                    YouTube
                  </a>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-4">
                <Link
                  to="/gallery"
                  className="inline-block text-center bg-primary text-background px-8 py-4 label-condensed text-sm hover:bg-accent-red hover:text-white transition-all"
                >
                  View Archives
                </Link>
                <p className="font-mono text-xs text-outline/50 uppercase tracking-widest text-center">
                  © {new Date().getFullYear()} TCAP Media. System Active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeamSelectionProvider>
  );
}
