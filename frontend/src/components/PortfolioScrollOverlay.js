import React, { useEffect, useState } from 'react';
import TCAPWordmark from './TCAPWordmark';
import { CLIP } from './three/sceneLayout';

const SCENE_MARKS = [
  { id: 'vc', start: 0, end: CLIP.scene1End },
  { id: 'photos', start: CLIP.scene2Start, end: CLIP.scene2End },
  { id: 'editor', start: CLIP.scene3Start, end: CLIP.scene4Start },
  { id: 'team', start: CLIP.scene4Start, end: 1 },
];

const SIDE_LABELS = [
  { id: 'videos', words: ['Videos'], side: 'left', start: 0, end: CLIP.scene1End + 0.02 },
  { id: 'photos', words: ['Photos'], side: 'right', start: CLIP.scene2Start, end: 0.46 },
  { id: 'social', words: ['Social Media'], side: 'left', start: 0.44, end: CLIP.scene2End },
  {
    id: 'creative-ops',
    words: ['Creatives', 'Logistics', 'Reporting'],
    side: 'right',
    start: CLIP.scene3Start,
    end: CLIP.scene4Start,
  },
  { id: 'team', words: ['Team'], side: 'top', start: CLIP.scene4Start, end: 0.98 },
];

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function segmentVisibility(offset, start, end, pad = 0.035) {
  const fadeIn = smoothstep(start, start + pad, offset);
  const fadeOut = 1 - smoothstep(end - pad, end, offset);
  return fadeIn * fadeOut;
}

function activeSceneIndex(offset) {
  for (let i = SCENE_MARKS.length - 1; i >= 0; i -= 1) {
    if (offset >= SCENE_MARKS[i].start - 0.01) return i;
  }
  return 0;
}

function SideLabel({ label, offset }) {
  const visibility = segmentVisibility(offset, label.start, label.end);
  if (visibility < 0.01) return null;

  const slide = (1 - visibility) * 48;
  const isLeft = label.side === 'left';
  const isTop = label.side === 'top';

  // Inline transform must include translateY(-50%) because it overrides Tailwind translate classes.
  const style = {
    opacity: visibility,
    ...(isTop
      ? { transform: `translate(-50%, ${-slide}px)` }
      : isLeft
        ? { transform: `translateX(${-slide}px) translateY(-50%)` }
        : { transform: `translateX(${slide}px) translateY(-50%)` }),
  };

  const positionClass = isTop
    ? 'top-[18%] left-1/2 text-center max-w-[calc(100%-2rem)]'
    : isLeft
      ? 'top-1/2 left-6 md:left-12 text-left max-w-[min(55vw,20rem)]'
      : 'top-1/2 right-[3.25rem] md:right-16 text-right max-w-[min(55vw,calc(100%-4.5rem))]';

  return (
    <div
      className={`fixed z-20 pointer-events-none transition-none ${positionClass}`}
      style={style}
      aria-hidden={visibility < 0.5}
    >
      <div className="space-y-1 md:space-y-2">
        {label.words.map((word) => (
          <p
            key={word}
            className="font-bold-display text-white/90 text-3xl sm:text-4xl md:text-6xl lg:text-7xl uppercase tracking-wider leading-none"
          >
            {word}
          </p>
        ))}
      </div>
      <div
        className={`mt-2 h-px bg-white/25 ${isTop ? 'mx-auto w-16' : isLeft ? 'w-12' : 'ml-auto w-12'}`}
      />
    </div>
  );
}

function ScrollWheel({ offset }) {
  const activeIdx = activeSceneIndex(offset);
  const fillPct = clamp(offset * 100, 0, 100);

  return (
    <div
      className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
      aria-label={`Scroll progress, scene ${activeIdx + 1} of ${SCENE_MARKS.length}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fillPct)}
    >
      <div className="relative w-[2px] h-44 md:h-56 bg-white/10 rounded-full overflow-visible">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-red-600 via-white/80 to-white rounded-full transition-[height] duration-75"
          style={{ height: `${fillPct}%` }}
        />

        {SCENE_MARKS.map((mark, i) => {
          const isActive = i === activeIdx;
          const isPast = i < activeIdx;
          const markerPct = clamp(((mark.start + mark.end) / 2) * 100, 4, 96);

          return (
            <span
              key={mark.id}
              className={`absolute left-1/2 rounded-full border transition-all duration-200 ${
                isActive
                  ? 'w-2.5 h-2.5 bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                  : isPast
                    ? 'w-2 h-2 bg-white/60 border-white/60'
                    : 'w-1.5 h-1.5 bg-transparent border-white/30'
              }`}
              style={{ bottom: `${markerPct}%`, transform: 'translate(-50%, 50%)' }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PortfolioScrollOverlay({ scrollRef }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!scrollRef) return undefined;

    let frameId;
    const tick = () => {
      setOffset(scrollRef.current?.offset ?? 0);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [scrollRef]);

  const headerOpacity = 1 - smoothstep(0, 0.2, offset);
  const headerY = -smoothstep(0, 0.24, offset) * 72;
  const hideHint = offset > 0.04;

  return (
    <>
      <div
        className="fixed inset-x-0 top-[12%] md:top-[10%] z-20 pointer-events-none flex justify-center px-4"
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        <TCAPWordmark size="hero" subtitle="Official Media Coverage · TCET" />
      </div>

      {SIDE_LABELS.map((label) => (
        <SideLabel key={label.id} label={label} offset={offset} />
      ))}

      <ScrollWheel offset={offset} />

      {!hideHint && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="label-condensed text-white/40 text-xs animate-pulse">Scroll to explore</p>
        </div>
      )}
    </>
  );
}