import * as THREE from 'three';

let blobTexture = null;

function getBlobTexture() {
  if (blobTexture) return blobTexture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(40, 50, 30, .45)');
  g.addColorStop(0.6, 'rgba(40, 50, 30, .18)');
  g.addColorStop(1, 'rgba(40, 50, 30, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  blobTexture = new THREE.CanvasTexture(canvas);
  return blobTexture;
}

export function makeBlobShadow(width, depth, { y = 0.002 } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}
