import * as THREE from 'three';

/** Each scene is a separate set piece along the scroll path */
export const SCENE_Z = {
  videographer: 0,
  photographer: -28,
  editor: -56,
  team: -84,
};

export const CLIP = {
  scene1End: 0.26,
  scene2Start: 0.22,
  scene2End: 0.62,
  flashPeak: 0.64,
  scene3Start: 0.58,
  scene4Start: 0.82,
};

export function activeFloorZ(offset) {
  if (offset < CLIP.scene2Start + 0.06) return SCENE_Z.videographer;
  if (offset < CLIP.scene3Start + 0.06) return SCENE_Z.photographer;
  if (offset < CLIP.scene4Start) return SCENE_Z.editor;
  return SCENE_Z.team;
}

/** Soft fade when crossing clip boundaries */
export function clipOpacity(offset, start, end, pad = 0.04) {
  const fadeIn = THREE.MathUtils.smoothstep(offset, start, start + pad);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(offset, end - pad, end);
  return THREE.MathUtils.clamp(fadeIn * fadeOut, 0, 1);
}

export function scene1Opacity(offset) {
  // The first model must be visible immediately at scroll offset 0.
  return 1 - THREE.MathUtils.smoothstep(offset, CLIP.scene1End - 0.06, CLIP.scene1End);
}

export function scene2Opacity(offset) {
  return clipOpacity(offset, CLIP.scene2Start, CLIP.scene2End, 0.06);
}

export function scene3Opacity(offset) {
  const fadeIn = THREE.MathUtils.smoothstep(offset, CLIP.scene3Start, CLIP.scene3Start + 0.08);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(offset, CLIP.scene4Start - 0.04, CLIP.scene4Start);
  return THREE.MathUtils.clamp(fadeIn * fadeOut, 0, 1);
}

export function scene4Opacity(offset) {
  return THREE.MathUtils.smoothstep(offset, CLIP.scene4Start, CLIP.scene4Start + 0.08);
}
