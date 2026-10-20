import React, { useEffect, useState } from 'react';
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
    attemptEvents,
    flashingKey,
    feedback,
    handlePlayChallenge,
    handleGuess,
    handlePlayReference,
    handleGameModeChange
  } = useGameSession(userName);
  const [liveActivity, setLiveActivity] = useState([
    { id: 'seed-sarah', message: 'Sarah just nailed a tritone (Gb5) in 0.8s!', type: 'peer' },
    { id: 'seed-ben', message: 'Ben hit a 15-note streak in Hard Mode!', type: 'peer' },
    { id: 'seed-jordan', message: 'Jordan reached a new personal best!', type: 'peer' }
  ]);

  // Add an occasional peer message to simulate a live activity stream.
  useEffect(() => {
    const peerMessages = [
      'Sarah just nailed a tritone (Gb5) in 0.8s!',
      'Ben hit a 15-note streak in Hard Mode!',
      'Jordan reached a new personal best!',
      'Maya just completed a chord challenge!',
      'Leo is practicing the upper octave.'
    ];
    const intervalId = window.setInterval(() => {
      const message = peerMessages[Math.floor(Math.random() * peerMessages.length)];
      setLiveActivity((events) => [
        { id: `${Date.now()}-${Math.random()}`, message, type: 'peer' },
        ...events
      ].slice(0, 6));
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Turn fast and streak-setting attempts into immediate local activity events.
  useEffect(() => {
    const attempt = attemptEvents[attemptEvents.length - 1];
    if (!attempt || !attempt.isCorrect) {
      return;
    }

    const messages = [];
    if (attempt.responseTimeMs < 1200) {
      messages.push(`⚡ You identified ${attempt.targetNote}${attempt.targetOctave} in under 1.2 seconds!`);
    }
    if (attempt.streakAtAttempt + 1 === 5) {
      messages.push('You just reached a 5-note streak!');
    }

    if (messages.length > 0) {
      setLiveActivity((events) => [
        ...messages.map((message) => ({
          id: `${Date.now()}-${Math.random()}`,
          message,
          type: 'you'
        })),
        ...events
      ].slice(0, 6));
    }
  }, [attemptEvents]);

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

        {/* Simulated activity feed until a live service is connected. */}
        <aside className="col-12 col-xl-4 luxury-panel" aria-labelledby="activity-heading">
          <h2 id="activity-heading">Live Activity Feed</h2>
          <p className="activity-caption">Simulated player updates and your milestones</p>
          <ul className="live-activity" aria-live="polite">
            {liveActivity.map((event) => (
              <li className={`activity-${event.type}`} key={event.id}>
                {event.message}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}