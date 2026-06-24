import React, { useState } from 'react';
import { useScroll, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TEAM_ROSTER } from '../../data/teamRoster';
import { useTeamSelection } from '../../context/TeamSelectionContext';
import { scene4Opacity } from './sceneLayout';

const SPACING = 1.05;
const SILHOUETTE_W = 0.52;
const SILHOUETTE_H = 0.68;

function SilhouetteCutout({ url }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, SILHOUETTE_H / 2 + 0.06, 0]}>
      <planeGeometry args={[SILHOUETTE_W, SILHOUETTE_H]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} />
    </mesh>
  );
}

function TeamHeadCard({ member, labelVisible, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const silhouetteSrc = member.silhouetteUrl;

  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.08, 24]} />
        <meshStandardMaterial color="#050505" roughness={0.9} metalness={0.05} />
      </mesh>

      {silhouetteSrc && <SilhouetteCutout url={silhouetteSrc} />}

      <Html
        position={[0, SILHOUETTE_H / 2 + 0.1, 0.02]}
        center
        distanceFactor={9}
        style={{ pointerEvents: labelVisible ? 'auto' : 'none' }}
      >
        <button
          type="button"
          onClick={() => onSelect(member)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className={`min-w-[48px] min-h-[48px] rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
            hovered
              ? 'border-white/70 bg-white/10 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.25)]'
              : 'border-transparent bg-transparent'
          }`}
          aria-label={`View profile: ${member.name}, ${member.role}`}
        />
      </Html>

      {labelVisible && (
        <Html position={[0, -0.08, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="text-center whitespace-nowrap min-w-[72px]">
            <p className="font-condensed text-[9px] md:text-[10px] text-white uppercase tracking-[0.12em] font-bold">
              {member.name}
            </p>
            <p className="font-condensed text-[7px] md:text-[8px] text-red-400 uppercase tracking-[0.18em] mt-0.5">
              {member.role}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Scene4TeamRoster() {
  const scroll = useScroll();
  const { selectMember } = useTeamSelection();
  const opacity = scene4Opacity(scroll.offset);
  const reveal = THREE.MathUtils.smoothstep(scroll.offset, 0.86, 0.96);
  const count = TEAM_ROSTER.length;
  const startX = -((count - 1) * SPACING) / 2;

  if (opacity <= 0.001) return null;

  return (
    <group>
      {TEAM_ROSTER.map((member, i) => {
        const x = startX + i * SPACING;
        const stagger = THREE.MathUtils.smoothstep(reveal, i * 0.07, i * 0.07 + 0.28);
        const s = Math.max(0.01, stagger);
        return (
          <group key={member.id} position={[x, 0, 0]} scale={s}>
            <TeamHeadCard
              member={member}
              labelVisible={stagger > 0.2}
              onSelect={selectMember}
            />
          </group>
        );
      })}
    </group>
  );
}
