import React from 'react';

function DistanceBadge({ km }) {
  let color = 'bg-slate-700';
  if (km < 5) color = 'bg-success/80';
  else if (km < 15) color = 'bg-warn/70';
  else if (km < 30) color = 'bg-slate-600';
  else color = 'bg-error/70';
  return <span className={`text-xs px-2 py-0.5 rounded ${color}`}>{km.toFixed(1)} km</span>;
}

export default function GamePanel({ state, config, lastGuess, start, next, reset, skip }) {
  const liveRef = React.useRef(null);
  React.useEffect(() => {
    if (!liveRef.current) return;
    if (state.state === 'await-guess' && state.currentTargetId) {
      liveRef.current.textContent = `Locate ${state.currentTargetId}`;
    } else if (state.state === 'reveal' && lastGuess) {
      liveRef.current.textContent = `Result ${lastGuess.distanceKm.toFixed(1)} kilometers; ${lastGuess.pointsAwarded} points.`;
    }
  }, [state.state, state.currentTargetId, lastGuess]);

  const total = state.totalRounds || config.rounds || 0;
  const progressPct = total ? Math.min(state.round / total, 1) * 100 : 0;

  return (
    <div className="space-y-4">
      <div aria-live="polite" className="sr-only" ref={liveRef} />
      <section>
        <h2 className="font-medium mb-2">Session</h2>
        <div className="text-sm space-y-3">
          <div className="progress-bar"><span style={{ width: `${progressPct}%` }} /></div>
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>Round</span><span>{state.round} / {total}</span>
          </div>
          {state.state === 'idle' && (
            <button onClick={start} className="px-3 py-2 bg-success/80 hover:bg-success rounded text-sm w-full">Start</button>
          )}
          {state.state === 'await-guess' && (
            <div className="p-2 rounded bg-slate-800 text-xs">
              Locate: <span className="font-semibold text-slate-100">{state.currentTargetId}</span>
            </div>
          )}
          {state.state === 'await-guess' && (
            <button onClick={skip} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs w-full">Skip</button>
          )}
          {state.state === 'reveal' && lastGuess && (
            <div className="p-2 rounded bg-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">Result</span><DistanceBadge km={lastGuess.distanceKm} /></div>
              <div>Points: {lastGuess.pointsAwarded}</div>
            </div>
          )}
          {state.state === 'reveal' && state.round < total && (
            <button onClick={next} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm w-full">Next</button>
          )}
          {state.state === 'reveal' && state.round >= total && (
            <div className="p-2 rounded bg-slate-800 text-xs space-y-2">
              <div className="font-semibold">Session Complete</div>
              <div>Total Score: {state.score}</div>
              <button onClick={reset} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs w-full">Restart</button>
            </div>
          )}
          {state.state !== 'idle' && state.state !== 'reveal' && (
            <button onClick={reset} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs w-full">Reset</button>
          )}
        </div>
      </section>
    </div>
  );
}
