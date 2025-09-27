import { describe, it, expect } from 'vitest';
import { gameReducer } from '../../game/gameReducer.js';

function run(actions) {
  let state = { round:0,totalRounds:4,currentTargetId:null,guesses:[],score:0,state:'idle' };
  for (const a of actions) state = gameReducer(state, a);
  return state;
}

describe('gameReducer', () => {
  it('initializes and advances to await-guess', () => {
    const s = run([{ type:'INIT_SESSION', rounds:4 }, { type:'NEXT_TARGET', scope:'mixed' }]);
    expect(s.state).toBe('await-guess');
    expect(s.round).toBe(1);
  });

  it('submits guess and moves to reveal', () => {
    let state = run([{ type:'INIT_SESSION', rounds:2 }, { type:'NEXT_TARGET', scope:'mixed' }]);
    state = gameReducer(state, { type:'SUBMIT_GUESS', coords:[78,30], distanceTiersKm:[5,15,30] });
    expect(state.state).toBe('reveal');
    expect(state.guesses.length).toBe(1);
  });

  it('ends after final round', () => {
    let state = run([{ type:'INIT_SESSION', rounds:1 }, { type:'NEXT_TARGET', scope:'mixed' }]);
    state = gameReducer(state, { type:'SUBMIT_GUESS', coords:[78,30], distanceTiersKm:[5,15,30] });
    state = gameReducer(state, { type:'NEXT_TARGET', scope:'mixed' });
    expect(state.state).toBe('summary');
  });
});
