import * as THREE from 'three';
import { toonMaterial } from '../materials/toon.js';
import { roundedRectShape } from '../geometry/shapes.js';

export const TURNTABLE_DEFAULTS = {
    // shared by the base and the lid
    width: 0.42,       // X
    depth: 0.40,       // Z
    corner: 0.03,      // corner radius seen from above

    // base
    height: 0.12,      // cloth to the top of the base (the deck)
    bevel: 0.006,      // rounded edge on the base

    // lid
    lidHeight: 0.07,   // deck to the top of the closed lid
    lidWall: 0.01,     // thickness of the lid's walls and top panel
    lidBevel: 0.004,     // rounded edge on the lid
};

export function createTurntable(options = {}) {
    const group = makeBase(options);
    group.add(makeLid(options));
    return group;
}

function extrudeUp(shape, height, bevel) {
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth: height - 2 * bevel,
        bevelOffset: -bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: 16,
    });

    geo.rotateX(-Math.PI / 2)
    geo.translate(0, bevel, 0)

    return geo;
}

function makeLid(options = {}) {
    const o = { ...TURNTABLE_DEFAULTS, ...options };
    const group = new THREE.Group();
    group.name = 'lid';

    group.position.set(0, o.height, 0); // on top of the base, centred; move to the hinge once the box is done

    const outline = roundedRectShape(o.width, o.depth, o.corner);
    const lid = extrudeUp(outline, o.lidHeight, o.lidBevel);

    const color = toonMaterial({ color: '#9DAF89' });
    const mesh = new THREE.Mesh(lid, color);
    group.add(mesh);

    return group;
}

function makeBase(options = {}) {
    const o = { ...TURNTABLE_DEFAULTS, ...options };
    const group = new THREE.Group();
    group.name = 'turntable';

    const shape = roundedRectShape(o.width, o.depth, o.corner);
    const geo = extrudeUp(shape, o.height, o.bevel);
    const color = toonMaterial({ color: '#9DAF89' });
    const mesh = new THREE.Mesh(geo, color);
    group.add(mesh);

    return group;
}
