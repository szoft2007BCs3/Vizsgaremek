import { useSyncExternalStore } from 'react';

function subscribe(listener) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = hash.split('?');
  return { path: path || 'fooldal', params: new URLSearchParams(query) };
}

let cached = null;
let cachedHash = null;

function getSnapshot() {
  if (cachedHash !== window.location.hash) {
    cachedHash = window.location.hash;
    cached = getRoute();
  }
  return cached;
}

export function useRoute() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function navigate(path) {
  window.location.hash = `/${path}`;
}
