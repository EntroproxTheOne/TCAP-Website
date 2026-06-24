import React from 'react';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { EditorSilhouette } from './SilhouetteModel';
import { SCENE_Z } from './sceneLayout';
import { useSceneAnchors } from './SceneAnchorsContext';

export default function Scene3Workflow() {
  const scroll = useScroll();
  const { editorMonitor } = useSceneAnchors();
  const glow = THREE.MathUtils.smoothstep(scroll.offset, 0.72, 0.82);

  return (
    <group position={[0, 0, SCENE_Z.editor]}>
      <EditorSilhouette
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
        monitorGlow={glow}
        onMonitorWorldPos={(pos) => editorMonitor.current.copy(pos)}
      />
    </group>
  );
}
