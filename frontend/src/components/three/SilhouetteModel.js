import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Per plan: dedicated GLB per scene */
export const MODELS = {
  videographer: '/assets/photographer+3d+model.glb',
  photographer: '/assets/photographer+silhouette+3d+model.glb',
  editor: '/assets/office+worker+3d+model.glb',
  standing: '/assets/low_poly_male_base.glb',
};

const SILHOUETTE = '#080808';
const DEFAULT_HEIGHT = 1.85;

function makeSilhouetteObject(scene, targetHeight = DEFAULT_HEIGHT) {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshBasicMaterial({
      color: SILHOUETTE,
      side: THREE.DoubleSide,
    });
    child.castShadow = false;
    child.receiveShadow = false;
  });

  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const normalScale = size.y > 0.001 ? targetHeight / size.y : 1;

  const reflection = clone.clone(true);
  reflection.traverse((child) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshBasicMaterial({
      color: '#010000',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    child.renderOrder = -1;
  });

  return {
    object: clone,
    reflection,
    offset: [
      -center.x * normalScale,
      -box.min.y * normalScale,
      -center.z * normalScale,
    ],
    normalScale,
  };
}

function findMonitorMesh(object) {
  let best = null;
  let bestScore = 0;
  const MONITOR = /monitor|screen|display|lcd|computer|imac|pc|tv/i;

  object.traverse((child) => {
    if (!child.isMesh) return;
    const name = (child.name || '').toLowerCase();
    const box = new THREE.Box3().setFromObject(child);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const score = size.x * size.y;
    const named = MONITOR.test(name);
    const likely = center.y > 0.78 && center.y < 1.32 && size.x > 0.08;
    if ((named || likely) && score > bestScore) {
      bestScore = score;
      best = child;
    }
  });
  return best;
}

/** Load all scene GLBs once up front */
export function ModelPreloader() {
  useGLTF(MODELS.videographer);
  useGLTF(MODELS.photographer);
  useGLTF(MODELS.editor);
  return null;
}

export function GLBSilhouette({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  targetHeight = DEFAULT_HEIGHT,
  opacity = 1,
  children,
}) {
  const { scene } = useGLTF(url);
  const { object, reflection, offset, normalScale } = useMemo(
    () => makeSilhouetteObject(scene, targetHeight),
    [scene, targetHeight]
  );

  useLayoutEffect(() => {
    object.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.visible = opacity > 0.02;
    });
    reflection.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.visible = opacity > 0.02;
    });
  }, [object, reflection, opacity]);

  return (
    <group position={position} rotation={rotation} scale={scale} visible={opacity > 0.02}>
      <group position={[offset[0], -offset[1] - 0.015, offset[2]]} scale={[normalScale, -normalScale, normalScale]}>
        <primitive object={reflection} />
      </group>
      <group position={offset} scale={normalScale}>
        <primitive object={object} />
        {children}
      </group>
    </group>
  );
}

/** Scene 1 — photographer+3d+model.glb (videographer behind camera) */
export function VideographerSilhouette(props) {
  return <GLBSilhouette url={MODELS.videographer} targetHeight={1.9} {...props} />;
}

/** Scene 2 — photographer+silhouette+3d+model.glb */
export function PhotographerSilhouette({ children, ...props }) {
  return (
    <GLBSilhouette url={MODELS.photographer} targetHeight={1.85} {...props}>
      {children}
    </GLBSilhouette>
  );
}

/** Scene 3 — office+worker+3d+model.glb (editor + desk) */
export function EditorSilhouette({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  opacity = 1,
  monitorGlow = 0,
  onMonitorWorldPos,
}) {
  const { scene } = useGLTF(MODELS.editor);
  const rootRef = useRef();
  const monitorRef = useRef(null);
  const worldPos = useRef(new THREE.Vector3());

  const { object, reflection, offset, normalScale, monitorMesh } = useMemo(() => {
    const data = makeSilhouetteObject(scene, 1.75);
    const monitor = findMonitorMesh(data.object);
    if (monitor) {
      monitor.material = new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        emissive: '#2244aa',
        emissiveIntensity: 0.08,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });
    }
    return { ...data, monitorMesh: monitor };
  }, [scene]);

  monitorRef.current = monitorMesh;

  useLayoutEffect(() => {
    object.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      if (child === monitorRef.current) {
        if (child.material.emissive) {
          child.material.emissiveIntensity = 0.08 + monitorGlow * 0.5;
        }
        child.visible = opacity > 0.02;
        return;
      }
      child.visible = opacity > 0.02;
    });
    reflection.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.visible = opacity > 0.02;
    });
  }, [object, reflection, opacity, monitorGlow]);

  useFrame(() => {
    if (!onMonitorWorldPos || !monitorRef.current) return;
    monitorRef.current.getWorldPosition(worldPos.current);
    onMonitorWorldPos(worldPos.current);
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale} visible={opacity > 0.02}>
      <group position={[offset[0], -offset[1] - 0.015, offset[2]]} scale={[normalScale, -normalScale, normalScale]}>
        <primitive object={reflection} />
      </group>
      <group position={offset} scale={normalScale}>
        <primitive object={object} />
      </group>
    </group>
  );
}

export function StandingSilhouette(props) {
  return <GLBSilhouette url={MODELS.standing} targetHeight={1.85} {...props} />;
}

useGLTF.preload(MODELS.videographer);
useGLTF.preload(MODELS.photographer);
useGLTF.preload(MODELS.editor);
useGLTF.preload(MODELS.standing);

export default GLBSilhouette;
