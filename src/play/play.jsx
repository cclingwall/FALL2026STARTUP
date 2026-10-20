import React, { useEffect, useRef, useState } from 'react';
import { noteFrequencies, playChord, playNote, playReferenceC } from './sound.js';
import './play.css';

const semitoneMap = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11
};
const naturalPitchClasses = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const sharpFlatPitchClasses = [
  { note: 'Db', boundary: 1 },
  { note: 'Eb', boundary: 2 },
  { note: 'Gb', boundary: 4 },
  { note: 'Ab', boundary: 5 },
  { note: 'Bb', boundary: 6 }
];
const playableNotes = Object.keys(noteFrequencies);

function splitTargetNote(noteName) {
  const match = noteName.match(/^([A-G](?:b)?)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid target note "${noteName}".`);
  }

  return { note: match[1], octave: Number(match[2]) };
}

export function Play() {
  const [gameMode, setGameMode] = useState('single');
  const [hardMode, setHardMode] = useState(false);
  const [targetNote, setTargetNote] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [attemptEvents, setAttemptEvents] = useState([]);
  const [flashingKey, setFlashingKey] = useState(null);
  const [feedback, setFeedback] = useState('Choose a mode, then play a challenge.');
  const toneStartTime = useRef(null);
  const referenceUsed = useRef(false);
  const keyFlashTimeout = useRef(null);

  useEffect(() => () => window.clearTimeout(keyFlashTimeout.current), []);

  // Choose a random root from all three octaves for either game mode.
  const handlePlayChallenge = async () => {
    const selectedNote = playableNotes[Math.floor(Math.random() * playableNotes.length)];
    const quality = gameMode === 'chords' ? (Math.random() < 0.5 ? 'major' : 'minor') : null;
    const targetPitch = { ...splitTargetNote(selectedNote), quality };

    toneStartTime.current = Date.now();
    referenceUsed.current = false;
    setTargetNote(targetPitch);
    setFeedback(gameMode === 'chords' ? 'Listen to the chord, then guess its root.' : 'Listen to the note.');

    try {
      if (quality) {
        await playChord(selectedNote, quality);
      } else {
        await playNote(selectedNote);
      }
    } catch (error) {
      setTargetNote(null);
      toneStartTime.current = null;
      setFeedback(`Could not play audio: ${error.message}`);
    }
  };

  // Record the answer and its timing before clearing the active challenge.
  const handleGuess = async (guessedNote) => {
    if (!targetNote || toneStartTime.current === null) {
      setFeedback('Play a challenge before choosing a note.');
      return;
    }

    const responseTimeMs = Date.now() - toneStartTime.current;
    const isCorrect = targetNote.note === guessedNote;
    const attemptEvent = {
      timestamp: new Date().toISOString(),
      mode: gameMode,
      hardMode,
      targetNote: targetNote.note,
      targetOctave: targetNote.octave,
      guessedNote,
      isCorrect,
      semitonesFromC: semitoneMap[targetNote.note],
      errorSemitones: semitoneMap[guessedNote] - semitoneMap[targetNote.note],
      responseTimeMs,
      usedReferenceC: referenceUsed.current,
      streakAtAttempt: currentStreak
    };
    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    const targetLabel = `${targetNote.note}${targetNote.octave}`;
    const responseSeconds = (responseTimeMs / 1000).toFixed(1);

    setAttemptEvents((events) => [...events, attemptEvent]);
    setCurrentStreak(nextStreak);
    setFlashingKey({ note: guessedNote, result: isCorrect ? 'key-correct' : 'key-wrong' });
    window.clearTimeout(keyFlashTimeout.current);
    keyFlashTimeout.current = window.setTimeout(() => setFlashingKey(null), 700);
    setTargetNote(null);
    toneStartTime.current = null;
    referenceUsed.current = false;

    setFeedback(
      isCorrect
        ? `Correct! ${targetLabel} identified in ${responseSeconds}s (+1 Streak).`
        : `Not quite. It was ${targetLabel}; your response took ${responseSeconds}s.`
    );

    try {
      await playNote(`${guessedNote}${targetNote.octave}`);
    } catch (error) {
      setFeedback((currentFeedback) => `${currentFeedback} Could not play your guess: ${error.message}`);
    }
  };

  // Do not play the reference pitch while Hard Mode is enabled.
  const handlePlayReference = async () => {
    if (hardMode) {
      return;
    }

    try {
      if (targetNote && toneStartTime.current !== null) {
        referenceUsed.current = true;
      }
      await playReferenceC();
      setFeedback('Reference pitch: C4 (261.63 Hz).');
    } catch (error) {
      setFeedback(`Could not play audio: ${error.message}`);
    }
  };

  // Switching modes clears the previous challenge so it cannot be answered in the new mode.
  const handleGameModeChange = (nextMode) => {
    setGameMode(nextMode);
    setTargetNote(null);
    toneStartTime.current = null;
    referenceUsed.current = false;
    setFeedback(
      nextMode === 'chords'
        ? 'Chord mode selected. Play a challenge.'
        : 'Single-note mode selected. Play a challenge.'
    );
  };

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
            <div className="piano-keyboard" role="group" aria-label="Pitch class guesses">
              <div className="natural-keys">
                {naturalPitchClasses.map((pitchClass) => (
                  <button
                    type="button"
                    key={pitchClass}
                    className={[
                      'pitch-class-key',
                      'natural-key',
                      flashingKey?.note === pitchClass ? flashingKey.result : ''
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleGuess(pitchClass)}
                    aria-label={`Guess ${pitchClass}`}
                  >
                    {pitchClass}
                  </button>
                ))}
              </div>
              {sharpFlatPitchClasses.map(({ note, boundary }) => (
                <button
                  type="button"
                  key={note}
                  className={[
                    'pitch-class-key',
                    'sharp-flat-key',
                    flashingKey?.note === note ? flashingKey.result : ''
                  ].filter(Boolean).join(' ')}
                  style={{ left: `${(boundary / naturalPitchClasses.length) * 100}%` }}
                  onClick={() => handleGuess(note)}
                  aria-label={`Guess ${note}`}
                >
                  {note}
                </button>
              ))}
            </div>
            <div className="game-feedback">
              <p aria-live="polite">{feedback}</p>
              <span className="current-streak" aria-live="polite">Streak: {currentStreak}</span>
            </div>
            <p className="attempt-count">Attempts this session: {attemptEvents.length}</p>
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