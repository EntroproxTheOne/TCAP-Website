import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { SCENE_Z, CLIP } from './sceneLayout';
import { useSceneAnchors } from './SceneAnchorsContext';

const Z = SCENE_Z;

const KF = [
  // Scene 1 — videographer at Z=0, pass near shoulder/camera height (not mid-body)
  { t: 0.0, pos: [0.5, 1.65, 5.5], look: [0, 1.48, Z.videographer] },
  { t: 0.10, pos: [0.25, 1.58, 3.2], look: [0, 1.46, Z.videographer] },
  { t: 0.18, pos: [0.05, 1.52, 1.5], look: [0, 1.44, Z.videographer] },
  { t: 0.24, pos: [0, 1.48, 0.5], look: [0, 1.42, Z.videographer] },

  // Travel to photographer set at Z=-28
  { t: 0.30, pos: [0.1, 1.25, -10], look: [0, 1.35, Z.photographer] },
  { t: 0.36, pos: [0, 1.45, -20], look: [0, 1.42, Z.photographer] },

  // Scene 2 — photographer
  { t: 0.42, pos: [0, 1.52, -24], look: [0, 1.45, Z.photographer] },
  { t: 0.48, pos: [0, 1.55, -25.5], look: [0, 1.46, Z.photographer] },

  // Zoom into DSLR LCD (local offset on photographer model)
  { t: 0.52, pos: [0.12, 1.4, -26.8], look: [0.1, 1.38, Z.photographer + 0.14] },
  { t: 0.56, pos: [0.105, 1.355, -27.5], look: [0.1, 1.38, Z.photographer + 0.14] },
  { t: 0.60, pos: [0.102, 1.35, -27.65], look: [0.1, 1.38, Z.photographer + 0.14] },

  // Travel to editor set at Z=-56
  { t: 0.64, pos: [0.2, 1.35, -38], look: [0, 1.1, Z.editor] },
  { t: 0.70, pos: [0, 1.3, -48], look: [0, 1.05, Z.editor] },

  // Scene 3 — editor back view, zoom into built-in monitor
  { t: 0.74, pos: [0, 1.45, -52], look: [0, 1.12, Z.editor] },
  { t: 0.78, pos: [0.1, 1.25, -54], look: [0, 1.06, Z.editor + 0.2] },
  { t: 0.82, pos: [0.06, 1.15, -55.2], look: [0, 1.04, Z.editor + 0.25] },

  // Scene 4 — team roster at Z=-84 (hold forward, no return to editor)
  { t: 0.86, pos: [0, 1.55, -68], look: [0, 1.2, Z.team] },
  { t: 0.92, pos: [0, 1.75, -76], look: [0, 1.35, Z.team] },
  { t: 1.0, pos: [0, 1.95, -81], look: [0, 1.45, Z.team] },
];

function lerpKF(t) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  let i = 0;
  while (i < KF.length - 2 && c > KF[i + 1].t) i++;
  const a = KF[i];
  const b = KF[Math.min(i + 1, KF.length - 1)];
  const range = b.t - a.t || 1;
  const alpha = THREE.MathUtils.clamp((c - a.t) / range, 0, 1);
  const ease = alpha * alpha * (3 - 2 * alpha);
  return {
    pos: a.pos.map((v, j) => THREE.MathUtils.lerp(v, b.pos[j], ease)),
    look: a.look.map((v, j) => THREE.MathUtils.lerp(v, b.look[j], ease)),
  };
}

export default function CameraRig() {
  const scroll = useScroll();
  const { camera } = useThree();
  const { editorMonitor } = useSceneAnchors();
  const currentPos = useRef(new THREE.Vector3(0.5, 1.6, 5.5));
  const currentLook = useRef(new THREE.Vector3(0, 1.48, Z.videographer));
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const offset = scroll.offset;
    const { pos, look } = lerpKF(offset);
    const targetPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    lookTarget.current.set(look[0], look[1], look[2]);

    const monitorZoomIn = THREE.MathUtils.smoothstep(offset, 0.76, 0.84);
    const monitorZoomOut = 1 - THREE.MathUtils.smoothstep(offset, 0.82, 0.86);
    const monitorZoom = monitorZoomIn * monitorZoomOut;
    if (monitorZoom > 0) {
      lookTarget.current.lerp(editorMonitor.current, monitorZoom);
      targetPos.lerp(
        new THREE.Vector3(
          editorMonitor.current.x + 0.05,
          editorMonitor.current.y + 0.03,
          editorMonitor.current.z + 0.3
        ),
        monitorZoom * 0.9
      );
    }

    const damp = 1 - Math.exp(-8 * delta);
    currentPos.current.lerp(targetPos, damp);
    currentLook.current.lerp(lookTarget.current, damp);
    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);

    const previewZoom = THREE.MathUtils.smoothstep(offset, 0.48, 0.60);
    const zoom = Math.max(previewZoom, monitorZoom);
    camera.fov = THREE.MathUtils.lerp(50, 28, zoom);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function getScrollEffects(offset) {
  const flashIntensity =
    THREE.MathUtils.smoothstep(offset, CLIP.scene2End - 0.02, CLIP.scene2End + 0.02) *
    (1 - THREE.MathUtils.smoothstep(offset, CLIP.flashPeak, CLIP.flashPeak + 0.04));
  const contactReveal = THREE.MathUtils.smoothstep(offset, 0.9, 1);
  return { flashIntensity, contactReveal };
}
