import React, { useState } from 'react';
import { noteFrequencies, playChord, playNote, playReferenceC } from './sound.js';
import './play.css';

const pitchClasses = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const playableNotes = Object.keys(noteFrequencies);

function getPitchClass(noteName) {
  return noteName.replace(/\d+$/, '');
}

export function Play() {
  const [mode, setMode] = useState('single');
  const [challenge, setChallenge] = useState(null);
  const [feedback, setFeedback] = useState('Choose a mode, then play a challenge.');

  // Choose a random root from all three octaves for either game mode.
  const handlePlayChallenge = async () => {
    const noteName = playableNotes[Math.floor(Math.random() * playableNotes.length)];
    const quality = mode === 'chord' ? (Math.random() < 0.5 ? 'major' : 'minor') : null;

    setChallenge({ noteName, quality });
    setFeedback(mode === 'chord' ? 'Listen to the chord, then guess its root.' : 'Listen to the note.');

    try {
      if (quality) {
        await playChord(noteName, quality);
      } else {
        await playNote(noteName);
      }
    } catch (error) {
      setChallenge(null);
      setFeedback(`Could not play audio: ${error.message}`);
    }
  };

  // Score the selected pitch class and wait for the next challenge.
  const handleGuess = (pitchClass) => {
    if (!challenge) {
      setFeedback('Play a challenge before choosing a note.');
      return;
    }

    const correct = getPitchClass(challenge.noteName) === pitchClass;
    const chordDescription = challenge.quality ? ` ${challenge.quality} chord` : '';
    setFeedback(
      correct
        ? `Correct! It was ${challenge.noteName}${chordDescription}.`
        : `Not quite. It was ${challenge.noteName}${chordDescription}.`
    );
    setChallenge(null);
  };

  // Keep the reference pitch available without changing the current challenge.
  const handlePlayReference = async () => {
    try {
      await playReferenceC();
      setFeedback('Reference pitch: C4 (261.63 Hz).');
    } catch (error) {
      setFeedback(`Could not play audio: ${error.message}`);
    }
  };

  return (
    <main className="play-page container py-5">
      <div className="row g-4">
        <section className="col-12 col-xl-8 luxury-panel" aria-labelledby="trainer-heading">
          <h2 id="trainer-heading">Ear Training Arena</h2>

          {/* Game mode and tone playback controls */}
          <section className="game-section" aria-labelledby="controls-heading">
            <h3 id="controls-heading">Game Controls</h3>
            <button
              type="button"
              aria-pressed={mode === 'single'}
              onClick={() => {
                setMode('single');
                setChallenge(null);
                setFeedback('Single-note mode selected. Play a challenge.');
              }}
            >
              Single Notes
            </button>
            <button
              type="button"
              aria-pressed={mode === 'chord'}
              onClick={() => {
                setMode('chord');
                setChallenge(null);
                setFeedback('Chord mode selected. Play a challenge.');
              }}
            >
              Chords
            </button>
            <button type="button" onClick={handlePlayChallenge}>
              Play {mode === 'chord' ? 'Chord' : 'Note'}
            </button>
          </section>

          {/* Piano-note guess buttons and result feedback area */}
          <section className="game-section" aria-labelledby="guess-heading">
            <h3 id="guess-heading">Which pitch class did you hear?</h3>
            <button className="reference-pitch" type="button" onClick={handlePlayReference}>
              Play Reference C4 (261.63 Hz)
            </button>
            <ul aria-label="Pitch class guesses">
              {pitchClasses.map((pitchClass) => (
                <li key={pitchClass}>
                  <button type="button" onClick={() => handleGuess(pitchClass)}>
                    {pitchClass}
                  </button>
                </li>
              ))}
            </ul>
            <p aria-live="polite">{feedback}</p>
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