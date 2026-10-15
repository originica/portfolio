import * as THREE from 'three';

let gradient = null;

export function getToonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([140, 185, 225, 255]);
  gradient = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

export function toonMaterial(params = {}) {
  return new THREE.MeshToonMaterial({ gradientMap: getToonGradient(), ...params });
}
