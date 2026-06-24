import React from 'react';
import { VideographerSilhouette } from './SilhouetteModel';
import { SCENE_Z } from './sceneLayout';

export default function Scene1Videographer() {
  return (
    <group position={[0, 0, SCENE_Z.videographer]}>
      <VideographerSilhouette position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
    </group>
  );
}
