import React from 'react';

/**
 * Ultra-condensed TCAP wordmark — Muhaqu / Finals-style tall display type.
 */
export default function TCAPWordmark({ size = 'hero', subtitle, className = '' }) {
  const sizeClass =
    size === 'hero'
      ? 'tcap-wordmark-hero'
      : size === 'lg'
        ? 'tcap-wordmark-lg'
        : 'tcap-wordmark-sm';

  return (
    <div className={`text-center select-none ${className}`}>
      <h2 className={`tcap-wordmark ${sizeClass}`} aria-label="TCAP">
        TCAP
      </h2>
      {subtitle && (
        <p className="font-condensed text-sm md:text-base text-white/50 uppercase tracking-[0.35em] mt-2 md:mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}
