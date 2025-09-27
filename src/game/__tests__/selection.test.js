import { describe, it, expect } from 'vitest';
import { weightedCityPool } from '../../data/uttarakhand/index.js';

describe('weightedCityPool', () => {
  it('filters district headquarters only when scope = district-hqs', () => {
    const pool = weightedCityPool('district-hqs');
    const hasTown = pool.some(p => p.type === 'town');
    expect(hasTown).toBe(false);
  });

  it('returns mixed list when scope = mixed', () => {
    const pool = weightedCityPool('mixed');
    expect(pool.length).toBeGreaterThan(5);
  });
});
