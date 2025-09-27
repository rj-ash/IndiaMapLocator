import React from 'react';
import { gameReducer } from '../game/gameReducer.js';
import { defaultConfig } from '../game/config.js';
import { weightedCityPool } from '../data/index.js';

export function useGameEngine(config = defaultConfig) {
  const [state, dispatch] = React.useReducer(gameReducer, undefined, () => ({ round:0,totalRounds:config.rounds,currentTargetId:null,guesses:[],score:0,state:'idle'}));

  const start = React.useCallback(() => {
    // Auto rounds: number of unique targets in pool (no repeats)
    const pool = weightedCityPool(config.targetScope, config.stateId);
    const rounds = config.rounds === 'auto' ? pool.length : config.rounds;
  dispatch({ type: 'INIT_SESSION', rounds, scoringMode: config.scoringMode, stateId: config.stateId });
    dispatch({ type: 'NEXT_TARGET', scope: config.targetScope, stateId: config.stateId, allowRepeatTargets: config.allowRepeatTargets });
  }, [config.rounds, config.targetScope, config.scoringMode, config.stateId, config.allowRepeatTargets]);

  const submitGuess = React.useCallback((lngLat) => {
    dispatch({
      type: 'SUBMIT_GUESS',
      coords: [lngLat.lng, lngLat.lat],
      distanceTiersKm: config.distanceTiersKm,
      distanceThresholdKm: config.distanceThresholdKm,
      pointsPerCorrect: config.pointsPerCorrect,
      stateId: config.stateId
    });
  }, [config.distanceTiersKm, config.distanceThresholdKm, config.pointsPerCorrect, config.stateId]);

  const next = React.useCallback(() => {
    dispatch({ type: 'NEXT_TARGET', scope: config.targetScope, stateId: config.stateId, allowRepeatTargets: config.allowRepeatTargets });
  }, [config.targetScope, config.stateId, config.allowRepeatTargets]);

  const reset = React.useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, start, submitGuess, next, reset };
}
