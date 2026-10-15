import * as THREE from 'three';
import { orientationFor } from './views.js';

const DEFAULT_DURATION = 2200;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function fitDistance(w, h, fovDeg, aspect) {
  const tan = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2);
  return Math.max(h / 2 / tan, w / 2 / (tan * aspect));
}

export function createCameraRig({ camera, scene, views, onChange }) {
  const state = { target: new THREE.Vector3(), phi: 0.001, theta: 0, radius: 5, fov: camera.fov };
  let currentView = null;
  let frame = null;
  let settle = null;

  function resolveView(name) {
    const v = views[orientationFor(camera.aspect)][name];
    if (!v) throw new Error(`Unknown camera view "${name}"`);
    return {
      target: new THREE.Vector3(...v.target),
      phi: v.phi,
      theta: v.theta,
      fov: v.fov,
      radius: fitDistance(v.fit[0], v.fit[1], v.fov, camera.aspect),
    };
  }

  function apply() {
    camera.position.setFromSphericalCoords(state.radius, state.phi, state.theta).add(state.target);
    camera.lookAt(state.target);
    camera.fov = state.fov;
    camera.updateProjectionMatrix();
    if (scene.fog) {
      scene.fog.near = state.radius + 1.5;
      scene.fog.far = state.radius + 9;
    }
    onChange();
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    settle?.(false);
    settle = null;
  }

  function goTo(name, { duration = DEFAULT_DURATION } = {}) {
    stop();
    currentView = name;
    const to = resolveView(name);

    if (duration === 0 || reduceMotion.matches) {
      Object.assign(state, { phi: to.phi, theta: to.theta, radius: to.radius, fov: to.fov });
      state.target.copy(to.target);
      apply();
      return Promise.resolve(true);
    }

    const from = { ...state, target: state.target.clone() };
    const start = performance.now();
    const lerp = THREE.MathUtils.lerp;

    return new Promise(resolve => {
      settle = resolve;
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        const k = easeInOutCubic(t);
        state.phi = lerp(from.phi, to.phi, k);
        state.theta = lerp(from.theta, to.theta, k);
        state.radius = lerp(from.radius, to.radius, k);
        state.fov = lerp(from.fov, to.fov, k);
        state.target.lerpVectors(from.target, to.target, k);
        apply();
        if (t < 1) {
          frame = requestAnimationFrame(step);
        } else {
          frame = null;
          settle = null;
          resolve(true);
        }
      };
      frame = requestAnimationFrame(step);
    });
  }

  function refit() {
    if (currentView && !frame) goTo(currentView, { duration: 0 });
  }

  return {
    goTo,
    refit,
    stop,
    get view() { return currentView; },
    get isMoving() { return frame !== null; },
  };
}
