import cities from './cities.geo.json';
import districts from './districts.geo.json';

const cityById = new Map(cities.features.map(f => [f.properties.id, f]));

export function getStateMetadata() {
  return {
    id: 'india:haryana',
    name: 'Haryana',
    bounds: [74.6, 27.8, 77.7, 30.95],
    center: [76.2, 29.2],
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
