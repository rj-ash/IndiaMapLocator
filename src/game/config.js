// Game configuration (runtime mutable via settings panel)
export const defaultConfig = {
  targetScope: 'mixed',              // 'district-hqs' | 'cities' | 'mixed'
  scoringMode: 'threshold',          // 'threshold' | 'hybrid'
  rounds: 'auto',                    // 'auto' -> size of pool (no repeats)
  distanceTiersKm: [5, 15, 30],      // legacy (hybrid mode)
  distanceThresholdKm: 50,           // threshold mode radius (km)
  pointsPerCorrect: 10,              // points when within threshold
  allowRepeatTargets: false,
  showDistrictOutlines: true,
  stateId: '',                       // selected state key (empty means none)
  showAllLocations: false            // show all cities & districts overlay
};

const STORAGE_KEY = 'ml_config_v1';

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultConfig };
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch (e) {
    console.warn('Failed to load config, using defaults', e);
    return { ...defaultConfig };
  }
}

export function saveConfig(cfg) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
}
