import districts from './districts.geo.json';
import cities from './cities.geo.json';

const districtById = new Map(districts.features.map(f => [f.properties.id, f]));
const cityById = new Map(cities.features.map(f => [f.properties.id, f]));

export function getDistricts() { return districts; }
export function getCities() { return cities; }
export function findDistrict(id) { return districtById.get(id); }
export function findCity(id) { return cityById.get(id); }
export function getStateMetadata() { return { id: 'india:uttarakhand', name: 'Uttarakhand', bounds: [77.5,28.8,80.7,31.2], center:[79.0,30.0], citiesCount: cities.features.length, districtsCount: districts.features.length }; }
export function weightedCityPool(scope='mixed') { let feats = cities.features; if (scope === 'district-hqs') feats = feats.filter(c => c.properties.type === 'district_hq'); return feats.map(f => ({ id: f.properties.id, importance: f.properties.importance, districtId: f.properties.districtId, type: f.properties.type })); }
export function getCityCoordinates(id) { const f = cityById.get(id); return f ? f.geometry.coordinates.slice() : null; }
