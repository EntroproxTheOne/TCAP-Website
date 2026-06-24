import React from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress, active } = useProgress();

  if (!active && progress >= 100) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #ff2222 0%, #ff0000 30%, #cc0000 100%)',
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/assets/tcet-capture-logo.png`}
        alt="TCAP"
        className="h-16 mb-8 animate-pulse"
      />
      <p className="font-display text-xl text-primary uppercase tracking-[0.3em] mb-4">TCAP</p>
      <div className="w-48 h-[2px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-accent-red transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="font-mono text-mono-technical text-outline mt-3">{Math.round(progress)}%</p>
    </div>
  );
}
