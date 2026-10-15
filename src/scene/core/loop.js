export function createLoop(renderer, scene, camera) {
  let requested = false;

  function render() {
    requested = false;
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (requested) return;
    requested = true;
    requestAnimationFrame(render);
  }

  return { render, requestRender };
}
