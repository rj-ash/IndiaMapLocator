import { describe, it, expect } from 'vitest';
import { scoreHybrid } from '../../game/scoring.js';

describe('scoreHybrid', () => {
  const tiers = [5,15,30];

  it('awards max for perfect close + correct district', () => {
    const r = scoreHybrid(1.2, true, tiers);
    expect(r.points).toBe(11); // 5 + 5 + 1
  });

  it('awards distance tier2', () => {
    const r = scoreHybrid(10, true, tiers);
    expect(r.points).toBe(5 + 3 + 0);
  });

  it('awards distance tier3', () => {
    const r = scoreHybrid(20, true, tiers);
    expect(r.points).toBe(5 + 1 + 0);
  });

  it('awards base only when far', () => {
    const r = scoreHybrid(45, true, tiers);
    expect(r.points).toBe(5);
  });

  it('awards distance only when district incorrect', () => {
    const r = scoreHybrid(4, false, tiers);
    expect(r.points).toBe(5); // distance 5, base 0, no perfect
  });

  it('handles NaN distance', () => {
    const r = scoreHybrid(NaN, true, tiers);
    expect(r.points).toBe(0);
  });
});
