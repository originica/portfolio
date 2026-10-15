import * as THREE from 'three';

export function makeGinghamTexture({
  base = '#e6ecc8',
  stripe = 'rgba(150, 172, 104, .42)',
  thread = 'rgba(255, 255, 240, .35)',
  size = 256,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, half, size);
  ctx.fillRect(0, 0, size, half);

  ctx.fillStyle = thread;
  ctx.fillRect(half - 2, 0, 3, size);
  ctx.fillRect(0, half - 2, size, 3);

  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
