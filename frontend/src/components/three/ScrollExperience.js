import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import CameraRig, { getScrollEffects } from './CameraRig';
import Scene1Videographer from './Scene1Videographer';
import Scene2Photographer from './Scene2Photographer';
import Scene3Workflow from './Scene3Workflow';
import Scene4TeamRoster from './Scene4TeamRoster';
import { SceneAnchorsProvider } from './SceneAnchorsContext';
import { ModelPreloader } from './SilhouetteModel';
import { SCENE_Z, scene4Opacity } from './sceneLayout';

const BG_GRADIENT =
  'radial-gradient(ellipse at 50% 45%, #ff2222 0%, #ff0000 30%, #e60000 55%, #b30000 100%)';

const VIVID_RED = '#e60000';

/** Three separate set pieces — camera pans Z axis between them */
function SceneManager() {
  const scroll = useScroll();
  const show4 = scene4Opacity(scroll.offset) > 0.01;

  return (
    <>
      <Scene1Videographer />
      <Scene2Photographer />
      <Scene3Workflow />

      {show4 && (
        <group position={[0, 0, SCENE_Z.team]}>
          <Scene4TeamRoster />
        </group>
      )}
    </>
  );
}

function ScrollBridge({ scrollRef }) {
  const scroll = useScroll();

  useFrame(() => {
    if (scrollRef?.current) {
      scrollRef.current.offset = scroll.offset;
    }
  });

  return null;
}

function FlashAndContact({ flashRef, contactRef }) {
  const scroll = useScroll();

  useFrame(() => {
    const { flashIntensity, contactReveal } = getScrollEffects(scroll.offset);
    if (flashRef?.current) flashRef.current.style.opacity = String(flashIntensity);
    if (contactRef?.current) contactRef.current.style.opacity = String(contactReveal);
  });

  return null;
}

function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.45} luminanceThreshold={0.45} mipmapBlur />
      <Vignette eskil={false} offset={0.35} darkness={0.42} />
    </EffectComposer>
  );
}

function World({ flashRef, contactRef, scrollRef }) {
  const { gl } = useThree();

  useFrame(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  return (
    <SceneAnchorsProvider>
      <color attach="background" args={[VIVID_RED]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 6, 2]} intensity={1.6} color="#ffaa88" />
      <directionalLight position={[2, 4, -8]} intensity={0.8} color="#ff6644" />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#ff3300" distance={80} />

      <CameraRig />

      <Suspense fallback={null}>
        <ModelPreloader />
        <SceneManager />
      </Suspense>

      <ScrollBridge scrollRef={scrollRef} />
      <FlashAndContact flashRef={flashRef} contactRef={contactRef} />
      <PostEffects />
    </SceneAnchorsProvider>
  );
}

export default function ScrollExperience({ flashRef, contactRef, scrollRef }) {
  return (
    <Canvas
      gl={{
        alpha: false,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 50, near: 0.1, far: 400, position: [0.5, 1.6, 5.5] }}
      style={{ position: 'fixed', inset: 0, background: BG_GRADIENT }}
      dpr={[1, 2]}
    >
      <ScrollControls pages={8} damping={0.2}>
        <World flashRef={flashRef} contactRef={contactRef} scrollRef={scrollRef} />
      </ScrollControls>
    </Canvas>
  );
}
