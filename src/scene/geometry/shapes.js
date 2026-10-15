import * as THREE from 'three';

/** Rounded rectangle centred on the origin, starting at the BACK so the UV seam is hidden. */
export function roundedRectShape(w, d, r) {
    const x = w / 2, y = d / 2;
    const s = new THREE.Shape();
    s.moveTo(0, y); // back centre (world -Z)
    s.lineTo(-x + r, y); s.quadraticCurveTo(-x, y, -x, y - r);
    s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y);
    s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r);
    s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y);
    s.lineTo(0, y);
    return s;
}
