export function observeResize(canvas, onResize) {
  const observer = new ResizeObserver(() => onResize(canvas.clientWidth, canvas.clientHeight));
  observer.observe(canvas);
  return () => observer.disconnect();
}
