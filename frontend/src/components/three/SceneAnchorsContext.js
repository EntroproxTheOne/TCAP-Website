import React, { createContext, useContext, useRef } from 'react';
import * as THREE from 'three';
import { SCENE_Z } from './sceneLayout';

const SceneAnchorsContext = createContext(null);

export function SceneAnchorsProvider({ children }) {
  const editorMonitor = useRef(new THREE.Vector3(0, 1.05, SCENE_Z.editor + 0.25));

  return (
    <SceneAnchorsContext.Provider value={{ editorMonitor }}>
      {children}
    </SceneAnchorsContext.Provider>
  );
}

export function useSceneAnchors() {
  const ctx = useContext(SceneAnchorsContext);
  if (!ctx) throw new Error('useSceneAnchors must be used within SceneAnchorsProvider');
  return ctx;
}
