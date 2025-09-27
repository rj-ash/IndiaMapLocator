// Unified registry using inline helpers for each state
import * as uk from './uttarakhand/index.js';
import hpCities from './himachal_pradesh/cities.geo.json';
import hpDistricts from './himachal_pradesh/districts.geo.json';
import dlCities from './delhi/cities.geo.json';
import dlDistricts from './delhi/districts.geo.json';

function buildSimpleState(cities, districts, meta) {
  const cityById = new Map(cities.features.map(f => [f.properties.id, f]));
  return {
    getStateMetadata: () => ({ ...meta, citiesCount: cities.features.length, districtsCount: districts.features.length }),
    weightedCityPool: (scope='mixed') => {
      let feats = cities.features;
      if (scope === 'district-hqs') feats = feats.filter(c => c.properties.type === 'district_hq');
      return feats.map(f => ({ id: f.properties.id, importance: f.properties.importance, districtId: f.properties.districtId, type: f.properties.type }));
    },
    getCityCoordinates: (id) => { const f = cityById.get(id); return f ? f.geometry.coordinates.slice() : null; },
    findCity: (id) => cityById.get(id),
    getDistricts: () => districts
  };
}

const hp = buildSimpleState(hpCities, hpDistricts, { id:'india:himachal_pradesh', name:'Himachal Pradesh', bounds:[75.5,30.3,79.0,33.2], center:[77.2,31.7] });
const dl = buildSimpleState(dlCities, dlDistricts, { id:'india:delhi', name:'Delhi / NCR', bounds:[76.9,28.3,77.6,28.9], center:[77.2,28.6] });

const registry = { uttarakhand: uk, himachal_pradesh: hp, delhi: dl };

export function listStates() {
  return [
    { id: 'uttarakhand', label: 'Uttarakhand', meta: uk.getStateMetadata() },
    { id: 'himachal_pradesh', label: 'Himachal Pradesh', meta: hp.getStateMetadata() },
    { id: 'delhi', label: 'Delhi / NCR', meta: dl.getStateMetadata() }
  ];
}

export function getStateModule(id='uttarakhand') { return registry[id] || uk; }
export function weightedCityPool(scope='mixed', stateId='uttarakhand') { return getStateModule(stateId).weightedCityPool(scope); }
export function getCityCoordinates(id, stateId='uttarakhand') { return getStateModule(stateId).getCityCoordinates(id); }
export function findCity(id, stateId='uttarakhand') { return getStateModule(stateId).findCity(id); }
export function getStateMetadata(stateId='uttarakhand') { return getStateModule(stateId).getStateMetadata(); }
export function getDistricts(stateId='uttarakhand') { return getStateModule(stateId).getDistricts ? getStateModule(stateId).getDistricts() : { type:'FeatureCollection', features:[] }; }
