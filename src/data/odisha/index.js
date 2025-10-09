import cities from './cities.geo.json';
import districts from './districts.geo.json';

const cityById = new Map(cities.features.map(f => [f.properties.id, f]));

export function getStateMetadata() {
  return {
    id: 'india:odisha',
    name: 'Odisha',
    bounds: [81.5, 17.9, 87.6, 22.5],
    center: [85.1, 20.3],
    citiesCount: cities.features.length,
    districtsCount: districts.features.length
  };
}

export function weightedCityPool(scope='mixed') {
  let feats = cities.features;
  if (scope === 'district-hqs') feats = feats.filter(f => f.properties.type === 'district_hq');
  return feats.map(f => ({ id: f.properties.id, importance: f.properties.importance, districtId: f.properties.districtId, type: f.properties.type }));
}

export function getCityCoordinates(id) { const f = cityById.get(id); return f ? f.geometry.coordinates.slice() : null; }
export function findCity(id) { return cityById.get(id); }
export function getDistricts() { return districts; }
export function getCities() { return cities; }
