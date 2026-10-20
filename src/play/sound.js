const octaveFourFrequencies = {
  C: 261.63,
  Db: 277.18,
  D: 293.66,
  Eb: 311.13,
  E: 329.63,
  F: 349.23,
  Gb: 369.99,
  G: 392.0,
  Ab: 415.3,
  A: 440.0,
  Bb: 466.16,
  B: 493.88
};

const noteNames = Object.keys(octaveFourFrequencies);

// Build C3-B5 frequencies by shifting the known C4-B4 pitches by octaves.
export const noteFrequencies = Object.fromEntries(
  [3, 4, 5].flatMap((octave) =>
    noteNames.map((noteName) => [
      `${noteName}${octave}`,
      octaveFourFrequencies[noteName] * 2 ** (octave - 4)
    ])
  )
);

let audioContext;

function getFrequency(noteName) {
  if (!Object.prototype.hasOwnProperty.call(noteFrequencies, noteName)) {
    throw new Error(`Unknown note "${noteName}". Choose a note from C3 through B5.`);
  }
  return noteFrequencies[noteName];
}

export function getNoteFrequency(noteName) {
  return getFrequency(noteName);
}

function validateDuration(duration) {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('Note duration must be a positive number of seconds.');
  }
}

// Create the browser audio engine only when a sound is requested.
async function getReadyAudioContext() {
  if (!audioContext) {
    if (typeof window === 'undefined' || !window.AudioContext) {
      throw new Error('Web Audio is not supported in this browser.');
    }
    audioContext = new window.AudioContext();
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
}

// Schedule a smooth envelope so each tone starts and stops without clicks.
async function playTone(frequency, duration, waveform, volume = 0.2) {
  validateDuration(duration);

  const context = await getReadyAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime;
  const endTime = startTime + duration;
  const attackTime = Math.min(0.02, duration / 3);
  const releaseTime = Math.min(0.12, duration / 3);
  const quietGain = 0.0001;

  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(quietGain, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attackTime);
  gain.gain.setValueAtTime(volume, endTime - releaseTime);
  gain.gain.linearRampToValueAtTime(quietGain, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime);
}

// Play one note from C3 through B5; duration is measured in seconds.
export function playNote(noteName, duration = 1) {
  return playTone(getFrequency(noteName), duration, 'triangle');
}

// Play a major or minor triad using the requested note as its root.
export function playChord(rootNote, quality = 'major', duration = 1) {
  const rootFrequency = getFrequency(rootNote);
  validateDuration(duration);

  if (quality !== 'major' && quality !== 'minor') {
    throw new Error('Chord quality must be "major" or "minor".');
  }

  const thirdSemitones = quality === 'major' ? 4 : 3;
  const chordFrequencies = [
    rootFrequency,
    rootFrequency * 2 ** (thirdSemitones / 12),
    rootFrequency * 2 ** (7 / 12)
  ];

  return Promise.all(
    chordFrequencies.map((frequency) => playTone(frequency, duration, 'triangle', 0.12))
  );
}

// Play a sustained, clear C4 sine tone as a pitch reference.
export function playReferenceC(duration = 1.5) {
  return playTone(noteFrequencies.C4, duration, 'sine', 0.25);
}
