const pitchClasses = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const supportedModes = ['single', 'chords'];
const octaveNumbers = [3, 4, 5];

function createEmptyProfile() {
  return {
    bestStreak: 0,
    singleCorrect: 0,
    singleTotal: 0,
    chordCorrect: 0,
    chordTotal: 0,
    gamesPlayed: 0,
    avgResponseTimeMs: 0,
    fastestCorrectMs: null,
    noteStats: Object.fromEntries(
      pitchClasses.map((note) => [
        note,
        { attempts: 0, correct: 0, avgTimeMs: 0, commonMistake: null }
      ])
    ),
    octaveStats: Object.fromEntries(
      octaveNumbers.map((octave) => [octave, { attempts: 0, correct: 0, accuracy: 0 }])
    )
  };
}

function calculateAverage(total, count) {
  return count === 0 ? 0 : Math.round(total / count);
}

function calculateProfile(attempts) {
  const profile = createEmptyProfile();
  let responseTimeTotal = 0;
  let streak = 0;
  const noteResponseTotals = Object.fromEntries(pitchClasses.map((note) => [note, 0]));
  const noteMistakes = Object.fromEntries(pitchClasses.map((note) => [note, {}]));

  for (const attempt of attempts) {
    const isChord = attempt.mode === 'chords';
    const totalKey = isChord ? 'chordTotal' : 'singleTotal';
    const correctKey = isChord ? 'chordCorrect' : 'singleCorrect';
    const noteStats = profile.noteStats[attempt.targetNote];
    const octaveStats = profile.octaveStats[attempt.targetOctave];

    if (!supportedModes.includes(attempt.mode) || !noteStats || !octaveStats) {
      throw new Error('Saved attempt contains an unsupported mode, note, or octave.');
    }

    profile[totalKey] += 1;
    profile.gamesPlayed += 1;
    responseTimeTotal += attempt.responseTimeMs;
    noteStats.attempts += 1;
    noteResponseTotals[attempt.targetNote] += attempt.responseTimeMs;
    octaveStats.attempts += 1;

    if (attempt.isCorrect) {
      profile[correctKey] += 1;
      noteStats.correct += 1;
      octaveStats.correct += 1;
      streak += 1;
      profile.bestStreak = Math.max(profile.bestStreak, streak);
      profile.fastestCorrectMs =
        profile.fastestCorrectMs === null
          ? attempt.responseTimeMs
          : Math.min(profile.fastestCorrectMs, attempt.responseTimeMs);
    } else {
      streak = 0;
      const mistakeCounts = noteMistakes[attempt.targetNote];
      mistakeCounts[attempt.guessedNote] = (mistakeCounts[attempt.guessedNote] || 0) + 1;
    }
  }

  profile.avgResponseTimeMs = calculateAverage(responseTimeTotal, attempts.length);

  for (const note of pitchClasses) {
    const stats = profile.noteStats[note];
    stats.avgTimeMs = calculateAverage(noteResponseTotals[note], stats.attempts);
    const mistakes = Object.entries(noteMistakes[note]).sort(
      ([noteA, countA], [noteB, countB]) => countB - countA || pitchClasses.indexOf(noteA) - pitchClasses.indexOf(noteB)
    );
    stats.commonMistake = mistakes[0]?.[0] || null;
  }

  for (const octave of octaveNumbers) {
    const stats = profile.octaveStats[octave];
    stats.accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
  }

  return profile;
}


module.exports = { pitchClasses, supportedModes, octaveNumbers, calculateProfile };
