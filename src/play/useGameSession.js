import { useEffect, useRef, useState } from 'react';
import { noteFrequencies, playChord, playNote, playReferenceC } from './sound.js';
import { saveAttemptEvent } from '../utils/telemetryStorage.js';

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
const playableNotes = Object.keys(noteFrequencies);

function splitTargetNote(noteName) {
  const match = noteName.match(/^([A-G](?:b)?)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid target note "${noteName}".`);
  }

  return { note: match[1], octave: Number(match[2]) };
}

export function useGameSession(userName) {
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

  // Play a random note or chord from the full three-octave range.
  const handlePlayChallenge = async () => {
    const selectedNote = playableNotes[Math.floor(Math.random() * playableNotes.length)];
    const quality = gameMode === 'chords' ? (Math.random() < 0.5 ? 'major' : 'minor') : null;
    const nextTarget = { ...splitTargetNote(selectedNote), quality };

    toneStartTime.current = Date.now();
    referenceUsed.current = false;
    setTargetNote(nextTarget);
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

  // Record each guess, update the streak, and replay the guessed pitch.
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
    const targetLabel = `${targetNote.note}${targetNote.octave}`;
    const responseSeconds = (responseTimeMs / 1000).toFixed(1);
    const resultMessage = isCorrect
      ? `Correct! ${targetLabel} identified in ${responseSeconds}s (+1 Streak).`
      : `Not quite. It was ${targetLabel}; your response took ${responseSeconds}s.`;
    let telemetryError = '';

    setAttemptEvents((events) => [...events, attemptEvent]);
    try {
      saveAttemptEvent(userName, attemptEvent);
    } catch (error) {
      telemetryError = ` Could not save telemetry: ${error.message}`;
    }

    setCurrentStreak(isCorrect ? currentStreak + 1 : 0);
    setFlashingKey({ note: guessedNote, result: isCorrect ? 'key-correct' : 'key-wrong' });
    window.clearTimeout(keyFlashTimeout.current);
    keyFlashTimeout.current = window.setTimeout(() => setFlashingKey(null), 700);
    setTargetNote(null);
    toneStartTime.current = null;
    referenceUsed.current = false;
    setFeedback(`${resultMessage}${telemetryError}`);

    try {
      await playNote(`${guessedNote}${targetNote.octave}`);
    } catch (error) {
      setFeedback((currentFeedback) => `${currentFeedback} Could not play your guess: ${error.message}`);
    }
  };

  // The reference pitch is unavailable in Hard Mode and is tracked per challenge.
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

  // Changing modes cancels the active challenge and its timing data.
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

  return {
    gameMode,
    hardMode,
    setHardMode,
    currentStreak,
    attemptCount: attemptEvents.length,
    attemptEvents,
    flashingKey,
    feedback,
    handlePlayChallenge,
    handleGuess,
    handlePlayReference,
    handleGameModeChange
  };
}
