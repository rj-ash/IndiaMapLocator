import cities from './cities.geo.json';

const cityById = new Map(cities.features.map(f => [f.properties.id, f]));

export function getCities() { return cities; }
export function findCity(id) { return cityById.get(id); }
export function weightedCityPool(scope='mixed') {
  let feats = cities.features;
  if (scope === 'district-hqs') feats = feats.filter(c => c.properties.type === 'district_hq');
  return feats.map(f => ({ id: f.properties.id, importance: f.properties.importance, districtId: f.properties.districtId, type: f.properties.type }));
}
export function getStateMetadata() {
  return { id: 'india:delhi', name: 'Delhi NCR', bounds: [76.8,28.3,77.7,28.9], center:[77.2,28.6], citiesCount: cities.features.length, districtsCount: 0 };
}
export function getCityCoordinates(id) { const f = cityById.get(id); return f ? f.geometry.coordinates.slice() : null; }
