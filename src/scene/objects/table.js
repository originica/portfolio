// src/scene/objects/table.js
// The table: hidden tabletop + legs, gingham cloth with a folded drape, blob shadow.
// Units: 1 unit = 1 metre.

import * as THREE from 'three';
import { toonMaterial } from '../materials/toon.js';
import { makeGinghamTexture } from '../materials/gingham.js';
import { makeBlobShadow } from '../materials/shadows.js';
import { roundedRectShape } from '../geometry/shapes.js';

export const TABLE_DEFAULTS = {
  width: 2.4,        // X
  depth: 1.4,        // Z
  height: 0.75,      // floor to tabletop
  drop: 0.28,        // how far the cloth hangs over the edge
  corner: 0.12,      // corner radius of the cloth
  tile: 0.12,        // size of one gingham repeat in metres
  anisotropy: 1,     // pass renderer.capabilities.getMaxAnisotropy()
};


/** Flat top of the cloth, with UVs in world units so the pattern scale is predictable. */
function makeClothTop(shape, tile) {
  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / tile, pos.getY(i) / tile);
  geo.rotateX(-Math.PI / 2); // shape XY → world XZ
  return geo;
}

/**
 * The hanging part of the cloth: one continuous strip around the perimeter,
 * pushed outward with sine waves that grow toward the hem = soft folds.
 */
function makeClothDrape(shape, { drop, tile, segments = 320, rows = 14, folds = 34 }) {
  const pts = shape.getSpacedPoints(segments); // segments + 1 points, last == first
  const perimeter = shape.getLength();
  const positions = [], uvs = [], index = [];

  for (let i = 0; i <= segments; i++) {
    const p = pts[i];
    const prev = pts[(i - 1 + segments) % segments];
    const next = pts[(i + 1) % segments];
    // outward normal in shape space, made to point away from the centre
    let nx = next.y - prev.y, ny = -(next.x - prev.x);
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    if (nx * p.x + ny * p.y < 0) { nx = -nx; ny = -ny; }

    const s = (i / segments) * perimeter;
    const a = (s / perimeter) * Math.PI * 2; // periodic → no crack at the seam
    const fold = Math.sin(a * folds) * 0.6 + Math.sin(a * folds * 2.3 + 1.7) * 0.4;

    for (let j = 0; j <= rows; j++) {
      const t = j / rows; // 0 at the edge, 1 at the hem
      const out = 0.004 + t * 0.025 + fold * 0.018 * Math.pow(t, 1.4);
      const y = -t * drop + Math.sin(a * folds * 1.5) * 0.006 * t;
      // shape (x, y) → world (x, -z)
      positions.push(p.x + nx * out, y, -(p.y + ny * out));
      uvs.push(s / tile, y / tile);
    }
  }

  const stride = rows + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < rows; j++) {
      const a = i * stride + j, b = (i + 1) * stride + j;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export function createTable(options = {}) {
  const o = { ...TABLE_DEFAULTS, ...options };
  const group = new THREE.Group();
  group.name = 'table';

  // --- legs + hidden tabletop (the cloth covers it) ---
  const wood = toonMaterial({ color: '#8a5d3d' });
  const top = new THREE.Mesh(new THREE.BoxGeometry(o.width - 0.04, 0.04, o.depth - 0.04), wood);
  top.position.y = o.height - 0.02;
  group.add(top);

  const legGeo = new THREE.CylinderGeometry(0.045, 0.032, o.height - 0.04, 16);
  const lx = o.width / 2 - 0.16, lz = o.depth / 2 - 0.14;
  for (const [x, z] of [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]]) {
    const leg = new THREE.Mesh(legGeo, wood);
    leg.position.set(x, (o.height - 0.04) / 2, z);
    group.add(leg);
  }

  // --- tablecloth ---
  const gingham = makeGinghamTexture();
  gingham.anisotropy = o.anisotropy; // keeps the pattern sharp at low camera angles
  const cloth = toonMaterial({ map: gingham, side: THREE.DoubleSide });
  const shape = roundedRectShape(o.width + 0.02, o.depth + 0.02, o.corner);

  const clothTop = new THREE.Mesh(makeClothTop(shape, o.tile), cloth);
  clothTop.position.y = o.height + 0.001;
  clothTop.name = 'tabletop'; // objects sit on this surface
  group.add(clothTop);

  const drape = new THREE.Mesh(makeClothDrape(shape, o), cloth);
  drape.position.y = o.height + 0.001;
  group.add(drape);

  group.add(makeBlobShadow(o.width * 1.5, o.depth * 1.9));

  group.userData = {
    width: o.width,
    depth: o.depth,
    height: o.height,
    surfaceY: o.height + 0.001, // y position to place objects on the cloth
  };
  return group;
}
