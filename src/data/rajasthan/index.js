import districts from './districts.geo.json';
import cities from './cities.geo.json';

const districtById = new Map(districts.features.map(f => [f.properties.id, f]));
const cityById = new Map(cities.features.map(f => [f.properties.id, f]));

export function getDistricts() { return districts; }
export function getCities() { return cities; }
export function findDistrict(id) { return districtById.get(id); }
export function findCity(id) { return cityById.get(id); }
export function getStateMetadata() { return { id: 'india:rajasthan', name: 'Rajasthan', bounds: [69.5,23.0,76.5,30.5], center:[73.5,26.9], citiesCount: cities.features.length, districtsCount: districts.features.length }; }
export function weightedCityPool(scope='mixed') { let feats = cities.features; if (scope === 'district-hqs') feats = feats.filter(c => c.properties.type === 'district_hq'); return feats.map(f => ({ id: f.properties.id, importance: f.properties.importance, districtId: f.properties.districtId, type: f.properties.type })); }
export function getCityCoordinates(id) { const f = cityById.get(id); return f ? f.geometry.coordinates.slice() : null; }

// Optional overlays: Sambhar Lake (polygon) and Indira Gandhi Canal (line) simplified
export function getOverlays() {
  return {
    type: 'FeatureCollection',
    features: [
      // Sambhar Lake (very rough polygon)
      { type: 'Feature', properties: { id: 'rj:sambhar_lake', kind: 'lake', name: 'Sambhar Lake' }, geometry: { type: 'Polygon', coordinates: [ [ [75.07,26.95],[75.35,26.95],[75.35,26.83],[75.07,26.83],[75.07,26.95] ] ] } }
    ]
  };
}
