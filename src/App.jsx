import React from 'react';
import MapView from './components/MapView/MapView.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';
import { defaultConfig } from './game/config.js';
import { listStates } from './data/index.js';
import GamePanel from './components/GamePanel/GamePanel.jsx';

export default function App() {
  const [config, setConfig] = React.useState(defaultConfig);
  const { state, start, submitGuess, next, reset } = useGameEngine(config);

  const skip = React.useCallback(() => {
    // Skip counts as zero-point guess using center of map (dummy) so round advances
    next();
  }, [next]);

  const onChangeScope = e => setConfig(c => ({ ...c, targetScope: e.target.value }));
  const onChangeRounds = e => setConfig(c => ({ ...c, rounds: e.target.value === 'auto' ? 'auto' : Number(e.target.value) }));
  const onChangeState = e => setConfig(c => ({ ...c, stateId: e.target.value }));
  const onToggleRepeat = e => setConfig(c => ({ ...c, allowRepeatTargets: e.target.checked }));
  const onToggleOutlines = e => setConfig(c => ({ ...c, showDistrictOutlines: e.target.checked }));

  const lastGuess = state.guesses[state.guesses.length - 1];

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800">
  <h1 className="text-lg font-semibold tracking-wide">MapLocator – {config.stateId.replace('_',' ')} Practice</h1>
        <div className="text-sm opacity-80">Score: {state.score} / {state.round * 11}</div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-slate-900">
          <MapView
            state={state}
            showOutlines={config.showDistrictOutlines}
            onGuess={submitGuess}
            stateId={config.stateId}
          />
          {state.state === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto bg-slate-900/80 p-6 rounded-lg border border-slate-700 w-80 text-center space-y-4">
                <h2 className="font-medium text-lg">Start a Session</h2>
                <p className="text-sm opacity-80">You will be shown a city name. Click where you believe it is located in the selected State/UT.</p>
                <button onClick={start} className="px-4 py-2 bg-success/80 hover:bg-success rounded text-sm font-medium w-full">Start</button>
              </div>
            </div>
          )}
        </div>
        <aside className="w-[var(--panel-width)] border-l border-slate-800 bg-slate-900 p-4 flex flex-col gap-6 overflow-y-auto">
          <GamePanel state={state} config={config} lastGuess={lastGuess} start={start} next={next} reset={reset} skip={skip} />
          <section>
            <h2 className="font-medium mb-2">Settings</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block mb-1">State</label>
                <select value={config.stateId} onChange={onChangeState} className="w-full bg-slate-800 rounded px-2 py-1 mb-3">
                  {listStates().map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <label className="block mb-1">Target Scope</label>
                <select value={config.targetScope} onChange={onChangeScope} className="w-full bg-slate-800 rounded px-2 py-1">
                  <option value="mixed">Mixed</option>
                  <option value="district-hqs">District HQs</option>
                  <option value="cities">All Cities</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Rounds</label>
                <select value={config.rounds} onChange={onChangeRounds} className="w-full bg-slate-800 rounded px-2 py-1">
                  <option value="auto">Auto</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input id="outlines" type="checkbox" checked={config.showDistrictOutlines} onChange={onToggleOutlines} className="accent-success" />
                <label htmlFor="outlines">Show District Outlines</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="repeats" type="checkbox" checked={config.allowRepeatTargets} onChange={onToggleRepeat} className="accent-success" />
                <label htmlFor="repeats">Allow Repeats (if needed)</label>
              </div>
            </div>
          </section>
          <section className="mt-auto text-xs opacity-70">
            © OpenStreetMap contributors | Educational use only
          </section>
        </aside>
      </main>
    </div>
  );
}
