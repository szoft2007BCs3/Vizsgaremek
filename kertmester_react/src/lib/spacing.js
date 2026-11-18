import { getSpacingRadius, isWoody } from './meretek.js';
import { getPlacedItems } from './store.js';

export function findCrowdedTrees(productId, x, y, ignoredId) {
  return getPlacedItems().filter((other) => {
    if (other.id === ignoredId || !isWoody(other.productId)) return false;
    return Math.hypot(other.x - x, other.y - y) < getSpacingRadius(other.productId, productId);
  });
}
