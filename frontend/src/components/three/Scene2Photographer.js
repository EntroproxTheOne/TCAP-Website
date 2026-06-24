import React from 'react';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { PhotographerSilhouette } from './SilhouetteModel';
import { SCENE_Z } from './sceneLayout';

function CameraPreviewScreen({ intensity = 1 }) {
  return (
    <group position={[0.1, 1.38, 0.14]} rotation={[0, -0.35, 0]}>
      <mesh>
        <planeGeometry args={[0.09, 0.06]} />
        <meshStandardMaterial color="#050505" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.075, 0.048]} />
        <meshStandardMaterial
          color="#111122"
          emissive="#4466cc"
          emissiveIntensity={0.35 * intensity}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export default function Scene2Photographer() {
  const scroll = useScroll();
  const glow = THREE.MathUtils.smoothstep(scroll.offset, 0.46, 0.56);

  return (
    <group position={[0, 0, SCENE_Z.photographer]}>
      <PhotographerSilhouette position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <CameraPreviewScreen intensity={0.4 + glow * 1.2} />
      </PhotographerSilhouette>
    </group>
  );
}
