import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createLoop } from './core/loop.js';
import { observeResize } from './core/resize.js';
import { createViews } from './camera/views.js';
import { createCameraRig } from './camera/rig.js';
import { createTable } from './objects/table.js';
import { createTurntable } from './objects/turntable.js';
import { getStation } from './stations.js';

const BACKGROUND = '#efe9d8';

function addLights(scene) {
  scene.add(new THREE.HemisphereLight('#fffbea', '#b9b394', 1.3));
  const sun = new THREE.DirectionalLight('#fff6e0', 1.5);
  sun.position.set(-3, 5, 4);
  scene.add(sun);
}

function addFloor(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshLambertMaterial({ color: '#d9d4bf' })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

export async function initScene(canvas) {
  const renderer = createRenderer(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.Fog(BACKGROUND, 6, 14);
  addLights(scene);
  addFloor(scene);

  const table = createTable({ anisotropy: renderer.capabilities.getMaxAnisotropy() });
  scene.add(table);

  const turntable = createTurntable();
  turntable.position.set(0, table.userData.surfaceY, 0);
  scene.add(turntable);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  const loop = createLoop(renderer, scene, camera);
  const rig = createCameraRig({
    camera,
    scene,
    views: createViews(table.userData),
    onChange: loop.requestRender,
  });

  function resize(width, height) {
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    rig.refit();
    loop.requestRender();
  }
  resize(canvas.clientWidth, canvas.clientHeight);
  const stopObserving = observeResize(canvas, resize);

  if (import.meta.env?.DEV && new URLSearchParams(location.search).has('debug')) {
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, table.userData.surfaceY, 0);
    controls.addEventListener('change', loop.requestRender);
  }

  function goToStation(id, { instant = false } = {}) {
    const station = getStation(id);
    return rig.goTo(station.view, { duration: instant ? 0 : undefined });
  }

  function dispose() {
    rig.stop();
    stopObserving();
    scene.traverse(obj => {
      obj.geometry?.dispose();
      for (const material of [].concat(obj.material ?? [])) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
        material.dispose();
      }
    });
    renderer.dispose();
  }

  return { goToStation, dispose, scene, camera };
}
