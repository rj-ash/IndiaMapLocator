import React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ukDistricts from '../../data/uttarakhand/districts.geo.json';
import hpDistricts from '../../data/himachal_pradesh/districts.geo.json';
import dlDistricts from '../../data/delhi/districts.geo.json';
import { findCity, getStateMetadata } from '../../data/index.js';
// India state boundaries fetched at runtime (see load handler) – authoritative dataset.
// Dataset source (ODbL via OSM derived): https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson

const DISTRICT_OUTLINE_LAYER_ID = 'district-outline-layer';
const DISTRICT_SOURCE_ID = 'districts-active';
const GUESS_SOURCE_ID = 'guess-src';
const GUESS_LAYER_ID = 'guess-layer';
const TARGET_LAYER_ID = 'target-layer';
const LINE_LAYER_ID = 'guess-line';

export default function MapView({ state, showOutlines, onGuess, stateId='uttarakhand' }) {
  const mapRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const popupRef = React.useRef(null);
  const stateRef = React.useRef(state);
  const onGuessRef = React.useRef(onGuess);

  React.useEffect(() => { stateRef.current = state; onGuessRef.current = onGuess; });

  const fitSelectedState = React.useCallback(() => {
    if (!mapRef.current) return;
    const meta = getStateMetadata(stateId);
    if (meta?.bounds) {
      mapRef.current.fitBounds([[meta.bounds[0], meta.bounds[1]],[meta.bounds[2], meta.bounds[3]]], { padding: 30, duration: 700 });
    }
  }, [stateId]);

  const fitIndia = React.useCallback(() => {
    if (!mapRef.current) return;
    // Rough India bbox (W,S,E,N)
    mapRef.current.fitBounds([[68.0, 7.5],[97.5, 37.5]], { padding: 30, duration: 900 });
  }, []);

  React.useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [79.0, 30.0],
      zoom: 6.5,
      attributionControl: false
    });
    mapRef.current = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('load', () => {
      // Fetch accurate India state boundaries
      fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
        .then(r => r.json())
        .then(data => {
          if (!map.getSource('india-states-full')) {
            map.addSource('india-states-full', { type: 'geojson', data });
            map.addLayer({
              id: 'india-states-full-outline',
              type: 'line',
              source: 'india-states-full',
              paint: {
                'line-color': '#475569',
                'line-width': 1
              }
            });
          }
        })
        .catch(err => {
          // Silent fallback (keeps app functional even if fetch blocked)
          // console.warn('Failed to load India states dataset', err);
        });
  // Add Uttarakhand districts source
  map.addSource(DISTRICT_SOURCE_ID, { type: 'geojson', data: { type:'FeatureCollection', features: [] } });
  map.addLayer({ id: DISTRICT_OUTLINE_LAYER_ID, type: 'line', source: DISTRICT_SOURCE_ID, paint: { 'line-color': '#64748b', 'line-width': 1 } });

      // Guess / target source & layers
      map.addSource(GUESS_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: GUESS_LAYER_ID, type: 'circle', source: GUESS_SOURCE_ID, filter: ['==', ['get','role'], 'guess'], paint: { 'circle-radius': 6, 'circle-color': '#f59e0b', 'circle-stroke-width': 2, 'circle-stroke-color': '#000' } });
      map.addLayer({ id: TARGET_LAYER_ID, type: 'circle', source: GUESS_SOURCE_ID, filter: ['==', ['get','role'], 'target'], paint: { 'circle-radius': 7, 'circle-color': '#16a34a', 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-opacity': 0.9 } });
      map.addLayer({ id: LINE_LAYER_ID, type: 'line', source: GUESS_SOURCE_ID, filter: ['==', ['get','role'], 'line'], paint: { 'line-color': '#f8fafc', 'line-width': 2, 'line-dasharray': [2,2] } });
      fitIndia();
    });

    map.on('click', (e) => {
      const s = stateRef.current;
      if (s.state === 'await-guess') {
        onGuessRef.current(e.lngLat);
      }
    });

    return () => { if (popupRef.current) popupRef.current.remove(); map.remove(); };
  }, [fitIndia]);
  // Reveal / update effect
  React.useEffect(() => {
    const map = mapRef.current; if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(GUESS_SOURCE_ID); if (!src) return;
    if (state.state === 'reveal') {
      const last = state.guesses[state.guesses.length - 1]; if (!last) return;
      const guessPt = { type: 'Feature', properties: { id: 'guess', role: 'guess' }, geometry: { type: 'Point', coordinates: last.guessCoord } };
      const targetPt = { type: 'Feature', properties: { id: 'target', role: 'target' }, geometry: { type: 'Point', coordinates: last.actualCoord } };
      const line = { type: 'Feature', properties: { id: 'line', role: 'line' }, geometry: { type: 'LineString', coordinates: [ last.guessCoord, last.actualCoord ] } };
      src.setData({ type: 'FeatureCollection', features: [guessPt, targetPt, line] });

      // Fit bounds around guess & target (if reasonably close)
      const minLng = Math.min(last.guessCoord[0], last.actualCoord[0]);
      const minLat = Math.min(last.guessCoord[1], last.actualCoord[1]);
      const maxLng = Math.max(last.guessCoord[0], last.actualCoord[0]);
      const maxLat = Math.max(last.guessCoord[1], last.actualCoord[1]);
      if (Math.hypot(maxLng - minLng, maxLat - minLat) < 0.8) {
        map.fitBounds([[minLng, minLat],[maxLng, maxLat]], { padding: 60, duration: 700 });
      }

  const effectiveStateId = state.stateId || stateId;
  const city = findCity(state.currentTargetId, effectiveStateId);
      if (city) {
        if (popupRef.current) popupRef.current.remove();
        const [lng, lat] = city.geometry.coordinates;
        popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
          .setLngLat([lng, lat])
          .setHTML(`<div style='font-size:12px'><strong>${city.properties.name}</strong><br/>${lng.toFixed(3)}, ${lat.toFixed(3)}</div>`)
          .addTo(map);
      }
    } else if (state.state === 'await-guess') {
      src.setData({ type: 'FeatureCollection', features: [] });
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    } else if (state.state === 'idle') {
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    }
  }, [state]);

  // Update districts for selected state
  React.useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const src = map.getSource(DISTRICT_SOURCE_ID); if (!src) return;
    if (!showOutlines) {
      if (map.getLayer(DISTRICT_OUTLINE_LAYER_ID)) map.setLayoutProperty(DISTRICT_OUTLINE_LAYER_ID, 'visibility', 'none');
      return;
    }
    let data;
    if (stateId === 'uttarakhand') data = ukDistricts;
    else if (stateId === 'himachal_pradesh') data = hpDistricts;
    else if (stateId === 'delhi') data = dlDistricts;
    else data = { type:'FeatureCollection', features:[] };
    src.setData(data);
    if (map.getLayer(DISTRICT_OUTLINE_LAYER_ID)) map.setLayoutProperty(DISTRICT_OUTLINE_LAYER_ID, 'visibility', 'visible');
  }, [showOutlines, stateId]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button onClick={fitIndia} className="bg-slate-900/70 hover:bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700">India</button>
        <button onClick={fitSelectedState} className="bg-slate-900/70 hover:bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700">State</button>
      </div>
    </div>
  );
}
