// Unified registry using inline helpers for each state
import * as uk from './uttarakhand/index.js';
import hpCities from './himachal_pradesh/cities.geo.json';
import hpDistricts from './himachal_pradesh/districts.geo.json';
import dlCities from './delhi/cities.geo.json';
import dlDistricts from './delhi/districts.geo.json';
import * as up from './uttar_pradesh/index.js';
import * as mp from './madhya_pradesh/index.js';
import * as bihar from './bihar/index.js';
import * as punjab from './punjab/index.js';
import * as haryana from './haryana/index.js';
import * as odisha from './odisha/index.js';
import * as karnataka from './karnataka/index.js';
import * as west_bengal from './west_bengal/index.js';
import * as chhattisgarh from './chhattisgarh/index.js';
import * as rajasthan from './rajasthan/index.js';

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
    getDistricts: () => districts,
    getCities: () => cities
  };
}

const hp = buildSimpleState(hpCities, hpDistricts, { id:'india:himachal_pradesh', name:'Himachal Pradesh', bounds:[75.5,30.3,79.0,33.2], center:[77.2,31.7] });
const dl = buildSimpleState(dlCities, dlDistricts, { id:'india:delhi', name:'Delhi / NCR', bounds:[76.9,28.3,77.6,28.9], center:[77.2,28.6] });

const registry = { uttarakhand: uk, himachal_pradesh: hp, delhi: dl, uttar_pradesh: up, madhya_pradesh: mp, bihar, punjab, haryana, odisha, karnataka, west_bengal, chhattisgarh, rajasthan };

// Null module for "no state selected" to avoid accidental fallback
const nullModule = {
  getStateMetadata: () => ({ id: 'none', name: 'No State Selected' }),
  weightedCityPool: () => [],
  getCityCoordinates: () => null,
  findCity: () => null,
  getDistricts: () => ({ type:'FeatureCollection', features:[] }),
  getCities: () => ({ type:'FeatureCollection', features:[] }),
  getOverlays: () => ({ type:'FeatureCollection', features:[] })
};

export function listStates() {
  return [
    { id: 'uttarakhand', label: 'Uttarakhand', meta: uk.getStateMetadata() },
    { id: 'himachal_pradesh', label: 'Himachal Pradesh', meta: hp.getStateMetadata() },
    { id: 'delhi', label: 'Delhi / NCR', meta: dl.getStateMetadata() },
    { id: 'uttar_pradesh', label: 'Uttar Pradesh', meta: up.getStateMetadata() },
    { id: 'madhya_pradesh', label: 'Madhya Pradesh', meta: mp.getStateMetadata() },
    { id: 'bihar', label: 'Bihar', meta: bihar.getStateMetadata() },
    { id: 'punjab', label: 'Punjab', meta: punjab.getStateMetadata() },
    { id: 'haryana', label: 'Haryana', meta: haryana.getStateMetadata() },
    { id: 'odisha', label: 'Odisha', meta: odisha.getStateMetadata() },
    { id: 'karnataka', label: 'Karnataka', meta: karnataka.getStateMetadata() },
    { id: 'west_bengal', label: 'West Bengal', meta: west_bengal.getStateMetadata() },
    { id: 'chhattisgarh', label: 'Chhattisgarh', meta: chhattisgarh.getStateMetadata() }
    ,{ id: 'rajasthan', label: 'Rajasthan', meta: rajasthan.getStateMetadata() }
  ];
}

export function getStateModule(id) { if (!id) return nullModule; return registry[id] || uk; }
export function weightedCityPool(scope='mixed', stateId) { if (!stateId) return []; return getStateModule(stateId).weightedCityPool(scope); }
export function getCityCoordinates(id, stateId) { if (!stateId) return null; return getStateModule(stateId).getCityCoordinates(id); }
export function findCity(id, stateId) { if (!stateId) return null; return getStateModule(stateId).findCity(id); }
export function getStateMetadata(stateId) { return getStateModule(stateId).getStateMetadata(); }
export function getDistricts(stateId) { return getStateModule(stateId).getDistricts ? getStateModule(stateId).getDistricts() : { type:'FeatureCollection', features:[] }; }
export function getCities(stateId) { return getStateModule(stateId).getCities ? getStateModule(stateId).getCities() : { type:'FeatureCollection', features:[] }; }
export function getOverlays(stateId) { const m = getStateModule(stateId); return m.getOverlays ? m.getOverlays() : { type:'FeatureCollection', features:[] }; }
