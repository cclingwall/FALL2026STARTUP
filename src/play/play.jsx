import React from 'react';
import { PianoKeyboard } from './PianoKeyboard.jsx';
import { useGameSession } from './useGameSession.js';
import './play.css';

export function Play({ userName }) {
  const {
    gameMode,
    hardMode,
    setHardMode,
    currentStreak,
    attemptCount,
    flashingKey,
    feedback,
    handlePlayChallenge,
    handleGuess,
    handlePlayReference,
    handleGameModeChange
  } = useGameSession(userName);

  return (
    <main className="play-page container py-5">
      <div className="row g-4">
        <section className="col-12 col-xl-8 luxury-panel" aria-labelledby="trainer-heading">
          <h2 id="trainer-heading">Ear Training Arena</h2>

          {/* Game mode and tone playback controls */}
          <section className="game-section" aria-labelledby="controls-heading">
            <h3 id="controls-heading">Game Controls</h3>
            <div className="control-toolbar">
              <div className="mode-selector" role="group" aria-label="Game mode">
                <button
                  type="button"
                  className={gameMode === 'single' ? 'is-selected' : ''}
                  aria-pressed={gameMode === 'single'}
                  onClick={() => handleGameModeChange('single')}
                >
                  Single
                </button>
                <button
                  type="button"
                  className={gameMode === 'chords' ? 'is-selected' : ''}
                  aria-pressed={gameMode === 'chords'}
                  onClick={() => handleGameModeChange('chords')}
                >
                  Chords
                </button>
              </div>
              <div className="play-actions">
                <button type="button" onClick={handlePlayChallenge}>
                  Play {gameMode === 'chords' ? 'Chord' : 'Note'}
                </button>
                <button
                  className="reference-pitch"
                  type="button"
                  onClick={handlePlayReference}
                  disabled={hardMode}
                  title={hardMode ? 'Reference Pitch Disabled in Hard Mode' : 'Play C4 at 261.63 Hz'}
                >
                  Play Reference C4
                </button>
              </div>
              <label className="hard-mode-toggle">
                <input
                  type="checkbox"
                  checked={hardMode}
                  onChange={(event) => setHardMode(event.target.checked)}
                />
                Hard Mode
              </label>
            </div>
            {hardMode && (
              <span className="hard-mode-badge" role="status">
                Reference pitch disabled
              </span>
            )}
          </section>

          {/* Piano-note guess buttons and result feedback area */}
          <section className="game-section" aria-labelledby="guess-heading">
            <h3 id="guess-heading">Which pitch class did you hear?</h3>
            <PianoKeyboard flashingKey={flashingKey} onGuess={handleGuess} />
            <div className="game-feedback">
              <p aria-live="polite">{feedback}</p>
              <span className="current-streak" aria-live="polite">Streak: {currentStreak}</span>
            </div>
            <p className="attempt-count">Attempts this session: {attemptCount}</p>
          </section>
        </section>

        {/* WebSocket placeholder: live activity feed */}
        <aside className="col-12 col-xl-4 luxury-panel" aria-labelledby="activity-heading">
          <h2 id="activity-heading">Live Activity Feed</h2>
          <ul>
            <li>&quot;Sarah just hit a 5-note streak!&quot;</li>
            <li>&quot;Ben connected&quot;</li>
            <li>&quot;Jordan reached a new personal best!&quot;</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}