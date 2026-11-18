import { useSyncExternalStore } from 'react';
import { subscribe, getVersion } from './store.js';

export function usePlan() {
  return useSyncExternalStore(subscribe, getVersion);
}
