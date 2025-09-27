import { scoreHybrid, scoreThreshold } from './scoring.js';
import { getCityCoordinates, weightedCityPool } from '../data/index.js';
import distance from '@turf/distance';

function createInitialState(rounds, scoringMode) {
  return { round: 0, totalRounds: rounds, currentTargetId: null, guesses: [], score: 0, state: 'idle', lastBreakdown: null, scoringMode };
}

// Simple weighted selection (importance used directly)
function pickTarget(pool, usedIds, allowRepeat, totalRounds, currentRound) {
  // If we still have unseen targets OR repeats not allowed, behave as before.
  const unseen = pool.filter(p => !usedIds.has(p.id));
  let candidates;
  if (unseen.length > 0) {
    candidates = unseen;
  } else if (allowRepeat || currentRound < totalRounds) {
    // All used: allow repeats by resetting used set logic.
    candidates = pool;
  } else {
    return null;
  }
  const total = candidates.reduce((sum, r) => sum + (r.importance || 1), 0);
  let t = Math.random() * total;
  for (const r of candidates) { t -= (r.importance || 1); if (t <= 0) return r.id; }
  return candidates[0].id;
}

export function gameReducer(state, action) {
  switch(action.type) {
    case 'INIT_SESSION': {
      return createInitialState(action.rounds, action.scoringMode);
    }
    case 'NEXT_TARGET': {
      if (state.round >= state.totalRounds) return { ...state, state: 'summary' };
  const pool = weightedCityPool(action.scope, action.stateId);
  const usedIds = new Set(state.guesses.map(g => g.targetId));
  const id = pickTarget(pool, usedIds, action.allowRepeatTargets, state.totalRounds, state.round);
      if (!id) return { ...state, state: 'summary' };
      return { ...state, currentTargetId: id, state: 'await-guess', round: state.round + 1 };
    }
    case 'SUBMIT_GUESS': {
      if (state.state !== 'await-guess' || !state.currentTargetId) return state;
      const actual = getCityCoordinates(state.currentTargetId);
      if (!actual) return { ...state, state: 'reveal' };
      const distKm = distance(action.coords, actual, { units: 'kilometers' });
      let result;
      if (state.scoringMode === 'threshold') {
        result = scoreThreshold(distKm, action.distanceThresholdKm, action.pointsPerCorrect);
      } else {
        result = scoreHybrid(distKm, true, action.distanceTiersKm);
      }
      const { points, breakdown } = result;
      const guess = { targetId: state.currentTargetId, guessCoord: action.coords, actualCoord: actual, distanceKm: distKm, districtCorrect: true, pointsAwarded: points, timestamp: Date.now() };
      return { ...state, guesses: [...state.guesses, guess], score: state.score + points, state: 'reveal', lastBreakdown: breakdown };
    }
    case 'NEXT_ROUND': {
      if (state.round >= state.totalRounds) return { ...state, state: 'summary' };
      return { ...state, state: 'prompt' };
    }
    case 'RESET': {
      return createInitialState(state.totalRounds);
    }
    default:
      return state;
  }
}
