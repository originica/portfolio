import * as THREE from 'three';

const deg = THREE.MathUtils.degToRad;

export function createViews({ width: TW, depth: TD, height: TH }) {
  return {
    landscape: {
      front: { target: [0, TH * 0.62, 0], phi: deg(76), theta: 0, fov: 30, fit: [TW * 1.3, TH * 1.9] },
      top: { target: [0, TH, 0], phi: 0.001, theta: 0, fov: 18, fit: [TW * 1.08, TD * 1.12] },
    },
    portrait: {
      front: { target: [0, TH * 0.62, 0], phi: deg(74), theta: deg(90), fov: 32, fit: [TD * 1.35, TH * 1.9] },
      top: { target: [0, TH, 0], phi: 0.001, theta: deg(90), fov: 18, fit: [TD * 1.12, TW * 1.06] },
    },
  };
}

export function orientationFor(aspect) {
  return aspect >= 1 ? 'landscape' : 'portrait';
}
