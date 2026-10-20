import React from 'react';

const naturalPitchClasses = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const sharpFlatPitchClasses = [
  { note: 'Db', boundary: 1 },
  { note: 'Eb', boundary: 2 },
  { note: 'Gb', boundary: 4 },
  { note: 'Ab', boundary: 5 },
  { note: 'Bb', boundary: 6 }
];

export function PianoKeyboard({ flashingKey, onGuess }) {
  const getKeyClassName = (note, keyType) => [
    'pitch-class-key',
    keyType,
    flashingKey?.note === note ? flashingKey.result : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="piano-keyboard" role="group" aria-label="Pitch class guesses">
      <div className="natural-keys">
        {naturalPitchClasses.map((pitchClass) => (
          <button
            type="button"
            key={pitchClass}
            className={getKeyClassName(pitchClass, 'natural-key')}
            onClick={() => onGuess(pitchClass)}
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
          className={getKeyClassName(note, 'sharp-flat-key')}
          style={{ left: `${(boundary / naturalPitchClasses.length) * 100}%` }}
          onClick={() => onGuess(note)}
          aria-label={`Guess ${note}`}
        >
          {note}
        </button>
      ))}
    </div>
  );
}
