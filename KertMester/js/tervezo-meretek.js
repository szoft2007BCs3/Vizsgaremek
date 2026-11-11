const footprintsLayer = document.getElementById('footprintsLayer');
const matureToggle = document.getElementById('matureToggle');
const matureLabel = document.getElementById('matureLabel');

const NS_DEFS = `<defs>
  <radialGradient id="canopy-shadow">
    <stop offset="0" stop-color="#0F2A17" stop-opacity="0.62"/>
    <stop offset="0.7" stop-color="#143B23" stop-opacity="0.42"/>
    <stop offset="1" stop-color="#143B23" stop-opacity="0.12"/>
  </radialGradient>
</defs>`;

function plantFootprint(size) {
  if (!isMature()) {
    return `<circle r="${size.sapling / 2}" fill="${size.color}" fill-opacity="0.55" stroke="${size.color}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  const radius = size.mature / 2;
  if (size.kind === 'flower') {
    return `<circle r="${radius}" fill="${size.color}" fill-opacity="0.35" stroke="${size.color}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  return `<circle r="${radius}" fill="url(#canopy-shadow)" stroke="#0F2A17" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
    <circle r="${Math.max(size.trunk, 0.1) / 2}" fill="#5A3E24" stroke="#2E1E10" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
}

function objectFootprint(size) {
  if (size.coverage) {
    return `<circle r="${size.coverage}" fill="#6EB5E8" fill-opacity="0.18" stroke="#3F8FC9" stroke-dasharray="6 4" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  if (size.shape === 'round') {
    return `<circle r="${size.width / 2}" fill="${size.color}" fill-opacity="0.85" stroke="#4A3B2A" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  return `<rect x="${-size.width / 2}" y="${-size.height / 2}" width="${size.width}" height="${size.height}" rx="${Math.min(size.width, size.height) * 0.08}" fill="${size.color}" fill-opacity="0.88" stroke="#4A3B2A" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
}

function footprintMarkup(item) {
  const inner = getPlantSize(item.productId) ? plantFootprint(getPlantSize(item.productId)) : OBJECT_SIZES[item.productId] ? objectFootprint(OBJECT_SIZES[item.productId]) : '';
  if (!inner) return '';
  return `<g class="footprint" data-id="${item.id}" transform="translate(${item.x} ${item.y})">${inner}</g>`;
}

function renderFootprints() {
  const { length, width } = getGarden();
  footprintsLayer.setAttribute('viewBox', `0 0 ${length} ${width}`);
  footprintsLayer.innerHTML = `${NS_DEFS}${getPlacedItems().map(footprintMarkup).join('')}<g class="spacing-guides" id="spacingGuides"></g>`;
}

function moveFootprint(id, x, y) {
  const group = footprintsLayer.querySelector(`.footprint[data-id="${id}"]`);
  if (group) group.setAttribute('transform', `translate(${x} ${y})`);
}

function findCrowdedTrees(product, x, y, ignoredId) {
  return getPlacedItems().filter((other) => {
    if (other.id === ignoredId || !isWoody(other.productId)) return false;
    return Math.hypot(other.x - x, other.y - y) < getSpacingRadius(other.productId, product.ID);
  });
}

function showSpacingGuides(product, x, y, ignoredId) {
  if (!isWoody(product.ID)) return false;
  const guides = footprintsLayer.querySelector('#spacingGuides');
  const crowded = findCrowdedTrees(product, x, y, ignoredId);
  const circles = getPlacedItems()
    .filter((other) => other.id !== ignoredId && isWoody(other.productId))
    .map((other) => {
      const isCrowded = crowded.includes(other);
      return `<circle class="${isCrowded ? 'guide-blocked' : 'guide-free'}" cx="${other.x}" cy="${other.y}" r="${getSpacingRadius(other.productId, product.ID)}"/>`;
    });
  const own = `<circle class="guide-own" cx="${x}" cy="${y}" r="${getPlantSize(product.ID).mature / 2}"/>`;
  guides.innerHTML = circles.join('') + own;
  return crowded.length > 0;
}

function hideSpacingGuides() {
  const guides = footprintsLayer.querySelector('#spacingGuides');
  if (guides) guides.innerHTML = '';
}

function showMatureState() {
  matureToggle.setAttribute('aria-pressed', String(isMature()));
  matureToggle.classList.toggle('active', isMature());
  matureLabel.textContent = isMature() ? 'Kifejlett méret' : 'Csemete méret';
}

matureToggle.addEventListener('click', () => {
  setMature(!isMature());
  showMatureState();
  renderFootprints();
});

window.addEventListener('plan-changed', showMatureState);
showMatureState();
