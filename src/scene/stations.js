export const STATIONS = {
  intro: { view: 'front', path: '/' },
  about: { view: 'top', path: '/about' },
  // projects: { view: 'projects', path: '/projects' },  ← add a matching entry in camera/views.js
};

export const DEFAULT_STATION = 'intro';

export function getStation(id) {
  return STATIONS[id] ?? STATIONS[DEFAULT_STATION];
}
