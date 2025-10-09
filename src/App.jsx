import React from 'react';
import MapView from './components/MapView/MapView.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';
import { defaultConfig } from './game/config.js';
import { listStates } from './data/index.js';
import GamePanel from './components/GamePanel/GamePanel.jsx';

export default function App() {
  const [config, setConfig] = React.useState(defaultConfig);
  const { state, start, submitGuess, next, reset } = useGameEngine(config);
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);
  // When mobile panel toggles, trigger a window resize so MapLibre recalculates dimensions (MapView listens for resize)
  React.useEffect(() => {
    // Slight delay to allow transition start
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    return () => clearTimeout(t);
  }, [mobilePanelOpen]);

  const skip = React.useCallback(() => {
    // Skip counts as zero-point guess using center of map (dummy) so round advances
    next();
  }, [next]);

  const onChangeScope = e => setConfig(c => ({ ...c, targetScope: e.target.value }));
  const onChangeRounds = e => setConfig(c => ({ ...c, rounds: e.target.value === 'auto' ? 'auto' : Number(e.target.value) }));
  const onChangeState = e => setConfig(c => ({ ...c, stateId: e.target.value }));
  const onToggleRepeat = e => setConfig(c => ({ ...c, allowRepeatTargets: e.target.checked }));
  const onToggleOutlines = e => setConfig(c => ({ ...c, showDistrictOutlines: e.target.checked }));
  const onToggleShowAll = e => setConfig(c => ({ ...c, showAllLocations: e.target.checked }));

  const lastGuess = state.guesses[state.guesses.length - 1];

  return (
  <div className="flex flex-col h-dvh max-h-dvh" data-mobile-panel={mobilePanelOpen ? 'open' : 'closed'}>
      <header className="flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 shrink-0">
  <h1 className="text-sm sm:text-lg font-semibold tracking-wide line-clamp-1">MapLocator – {config.stateId ? config.stateId.replace('_',' ') + ' Practice' : 'Select a State'}</h1>
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-sm opacity-80">Score: {state.score}</div>
          <button onClick={() => setMobilePanelOpen(o => !o)} className="px-2 py-1 text-xs sm:text-sm rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">
            {mobilePanelOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 relative bg-slate-900">
            <MapView
              state={state}
              showOutlines={config.showDistrictOutlines}
              onGuess={submitGuess}
              stateId={config.stateId}
              showAllLocations={config.showAllLocations}
            />
            {/* Persistent session bar (now for all sizes) */}
            {state.state !== 'idle' && (
              <div className="absolute left-0 top-14 z-20 px-2 sm:pl-4 sm:pt-2 w-full pointer-events-none">
                <div className="max-w-xs sm:max-w-sm bg-slate-900/90 backdrop-blur rounded-md border border-slate-700 px-3 py-2 flex flex-col gap-1 shadow-sm pointer-events-auto">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide opacity-80">
                    <span>Round {state.round}{state.totalRounds ? ` / ${state.totalRounds}` : ''}</span>
                    <span className="font-mono">{state.score}</span>
                  </div>
                  {state.state === 'await-guess' && state.currentTargetId && (
                    <div className="text-xs mb-1"><span className="opacity-70">Locate:</span> <span className="font-semibold">{state.currentTargetId}</span></div>
                  )}
                  {state.state === 'reveal' && lastGuess && (
                    <div className="text-[11px] mb-1 flex items-center gap-2"><span className="font-semibold">Result</span><span>{lastGuess.distanceKm.toFixed(1)} km</span><span className="opacity-70">+{lastGuess.pointsAwarded}</span></div>
                  )}
                  <div className="flex items-center gap-2">
                    {state.state === 'await-guess' && (
                      <button onClick={skip} className="flex-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] py-1">Skip</button>
                    )}
                    {state.state === 'reveal' && state.round < (state.totalRounds || 0) && (
                      <button onClick={next} className="flex-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] py-1">Next</button>
                    )}
                    {state.state === 'reveal' && state.round >= (state.totalRounds || 0) && (
                      <button onClick={reset} className="flex-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] py-1">Restart</button>
                    )}
                  </div>
                  <div className="mt-1 h-1.5 bg-slate-800 rounded overflow-hidden">
                    <span className="block h-full bg-gradient-to-r from-success via-warn to-error" style={{ width: `${state.totalRounds ? (state.round / state.totalRounds) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            )}
            {state.state === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto bg-slate-900/80 p-4 sm:p-6 rounded-lg border border-slate-700 w-72 sm:w-80 text-center space-y-4">
                  <h2 className="font-medium text-base sm:text-lg">Start a Session</h2>
                  <p className="text-xs sm:text-sm opacity-80">Select a state in Settings, then press Start to begin.</p>
                  <button onClick={start} disabled={!config.stateId} className={`px-4 py-2 rounded text-sm font-medium w-full ${config.stateId ? 'bg-success/80 hover:bg-success' : 'bg-slate-700 cursor-not-allowed opacity-70'}`}>Start</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Unified slide-over panel for all breakpoints */}
        <div className={`fixed inset-y-0 right-0 w-[min(340px,90vw)] bg-slate-900 border-l border-slate-800 z-30 transform transition-transform duration-300 flex flex-col ${mobilePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-3 h-12 border-b border-slate-800 pt-[env(safe-area-inset-top)]">
            <span className="text-sm font-medium">Menu</span>
            <button onClick={() => setMobilePanelOpen(false)} className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-700">Close</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-[env(safe-area-inset-bottom)]">
            <GamePanel state={state} config={config} lastGuess={lastGuess} start={start} next={next} reset={reset} skip={skip} />
            <SettingsSection {...{ config, onChangeState, onChangeScope, onChangeRounds, onToggleOutlines, onToggleRepeat, onToggleShowAll }} />
            <FooterSection />
          </div>
        </div>
        {mobilePanelOpen && <div onClick={() => setMobilePanelOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-20" />}
      </main>
    </div>
  );
}

function SettingsSection({ config, onChangeState, onChangeScope, onChangeRounds, onToggleOutlines, onToggleRepeat, onToggleShowAll }) {
  return (
    <section>
      <h2 className="font-medium mb-2">Settings</h2>
      <div className="space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block mb-1">State</label>
          <select value={config.stateId} onChange={onChangeState} className="w-full bg-slate-800 rounded px-2 py-1 mb-3 text-xs sm:text-sm">
            <option value="">— Select a state —</option>
            {listStates().map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <label className="block mb-1">Target Scope</label>
          <select value={config.targetScope} onChange={onChangeScope} className="w-full bg-slate-800 rounded px-2 py-1 text-xs sm:text-sm">
            <option value="mixed">Mixed</option>
            <option value="district-hqs">District HQs</option>
            <option value="cities">All Cities</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Rounds</label>
          <select value={config.rounds} onChange={onChangeRounds} className="w-full bg-slate-800 rounded px-2 py-1 text-xs sm:text-sm">
            <option value="auto">Auto</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="outlines" type="checkbox" checked={config.showDistrictOutlines} onChange={onToggleOutlines} className="accent-success" />
          <label htmlFor="outlines" className="cursor-pointer">Show District Outlines</label>
        </div>
        <div className="flex items-center gap-2">
          <input id="repeats" type="checkbox" checked={config.allowRepeatTargets} onChange={onToggleRepeat} className="accent-success" />
          <label htmlFor="repeats" className="cursor-pointer">Allow Repeats (if needed)</label>
        </div>
        <div className="flex items-center gap-2">
          <input id="showAll" type="checkbox" checked={config.showAllLocations} onChange={onToggleShowAll} className="accent-success" />
          <label htmlFor="showAll" className="cursor-pointer">Show All Locations</label>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <section className="mt-auto text-[10px] sm:text-xs opacity-70 pb-6 sm:pb-0">
      © OpenStreetMap contributors | Educational use only
    </section>
  );
}
