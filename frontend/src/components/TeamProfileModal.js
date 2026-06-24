import React, { useCallback, useEffect } from 'react';
import { FiExternalLink, FiX } from 'react-icons/fi';
import { useTeamSelection } from '../context/TeamSelectionContext';

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'Twitter',
};

export default function TeamProfileModal() {
  const { selectedMember, clearMember } = useTeamSelection();
  const isOpen = Boolean(selectedMember);

  const handleClose = useCallback(() => {
    clearMember();
  }, [clearMember]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !selectedMember) return null;

  const socialEntries = Object.entries(selectedMember.social || {}).filter(([, url]) => Boolean(url));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-profile-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close profile"
      />

      <div className="relative w-full max-w-lg frosted-glass-dark border border-white/10 shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <FiX size={22} />
        </button>

        <div className="grid md:grid-cols-[140px_1fr] gap-0">
          <div className="bg-black/40 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
            {selectedMember.photoUrl ? (
              <img
                src={selectedMember.photoUrl}
                alt={selectedMember.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div
                className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-b from-neutral-800 to-black border-2 border-white/15 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="font-bold-display text-4xl text-white/30">
                  {selectedMember.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <p className="font-condensed text-[10px] uppercase tracking-[0.35em] text-red-400 mb-2">
              TCAP Crew
            </p>
            <h2 id="team-profile-title" className="section-heading-bold text-2xl md:text-3xl text-white mb-1">
              {selectedMember.name}
            </h2>
            <p className="font-condensed text-sm uppercase tracking-[0.2em] text-white/50 mb-4">
              {selectedMember.role}
            </p>

            {selectedMember.quote && (
              <blockquote className="font-body text-white/75 text-sm md:text-base italic border-l-2 border-red-500/60 pl-4 mb-6">
                &ldquo;{selectedMember.quote}&rdquo;
              </blockquote>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
              {socialEntries.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[44px] px-4 label-condensed text-xs text-white/80 hover:text-white border border-white/15 hover:border-red-500/50 transition-colors"
                >
                  {SOCIAL_LABELS[key] || key}
                  <FiExternalLink className="ml-2 opacity-60" size={12} />
                </a>
              ))}
            </div>

            {selectedMember.portfolioUrl && (
              <a
                href={selectedMember.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] px-5 bg-white text-black label-condensed text-xs hover:bg-red-500 hover:text-white transition-colors"
              >
                View Portfolio
                <FiExternalLink className="ml-2" size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
