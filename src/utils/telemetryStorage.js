const pitchClasses = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const supportedModes = ['single', 'chords'];
const octaveNumbers = [3, 4, 5];
const leaderboardStorageKey = 'leaderboardScores';

const seedLeaderboard = [
  { name: 'Sarah', highestStreak: 24, dateRecorded: '2026-09-14' },
  { name: 'Alex', highestStreak: 18, dateRecorded: '2026-09-14' },
  { name: 'Ben', highestStreak: 15, dateRecorded: '2026-09-13' },
  { name: 'Jordan', highestStreak: 12, dateRecorded: '2026-09-12' }
];

function getTelemetryKey(userName) {
  const normalizedName = userName?.trim() || 'Guest';
  return `pitchRoyale_telemetry_${normalizedName}`;
}

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

function parseStoredValue(rawValue, description) {
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`Could not read saved ${description}: ${error.message}`);
  }
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
    profile.avgResponseTimeMs += attempt.responseTimeMs;
    responseTimeTotal += attempt.responseTimeMs;
    noteStats.attempts += 1;
    noteResponseTotals[attempt.targetNote] += attempt.responseTimeMs;
    octaveStats.attempts += 1;

    if (attempt.isCorrect) {
      profile[correctKey] += 1;
      noteStats.correct += 1;
      octaveStats.correct += 1;
      streak = attempt.streakAtAttempt + 1;
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

export function getTelemetryProfile(userName) {
  const storedValue = localStorage.getItem(getTelemetryKey(userName));
  if (!storedValue) {
    return createEmptyProfile();
  }

  const savedData = parseStoredValue(storedValue, 'player telemetry');
  if (!Array.isArray(savedData.attempts)) {
    throw new Error('Saved player telemetry does not contain an attempts list.');
  }
  return savedData.profile || calculateProfile(savedData.attempts);
}

export function getLeaderboardScores() {
  const storedScores = localStorage.getItem(leaderboardStorageKey);
  if (!storedScores) {
    localStorage.setItem(leaderboardStorageKey, JSON.stringify(seedLeaderboard));
    return seedLeaderboard;
  }

  const scores = parseStoredValue(storedScores, 'leaderboard scores');
  if (!Array.isArray(scores)) {
    throw new Error('Saved leaderboard scores are not a list.');
  }
  return scores;
}

function updateLeaderboard(userName, bestStreak, attemptEvent, streakEnded, newPersonalBest) {
  if (!streakEnded && !newPersonalBest) {
    return;
  }

  const normalizedName = userName?.trim() || 'Guest';
  const scores = getLeaderboardScores();
  const existingScore = scores.find(
    (score) => score.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (!existingScore && bestStreak === 0) {
    return;
  }

  const recordedDate = attemptEvent.timestamp.slice(0, 10);
  if (existingScore) {
    if (bestStreak > existingScore.highestStreak) {
      existingScore.highestStreak = bestStreak;
      existingScore.dateRecorded = recordedDate;
    }
  } else {
    scores.push({ name: normalizedName, highestStreak: bestStreak, dateRecorded: recordedDate });
  }

  scores.sort((scoreA, scoreB) => scoreB.highestStreak - scoreA.highestStreak);
  localStorage.setItem(leaderboardStorageKey, JSON.stringify(scores));
}

export function saveAttemptEvent(userName, attemptEvent) {
  if (
    !supportedModes.includes(attemptEvent.mode) ||
    !pitchClasses.includes(attemptEvent.targetNote) ||
    !pitchClasses.includes(attemptEvent.guessedNote) ||
    !octaveNumbers.includes(attemptEvent.targetOctave) ||
    typeof attemptEvent.isCorrect !== 'boolean' ||
    !Number.isInteger(attemptEvent.streakAtAttempt) ||
    attemptEvent.streakAtAttempt < 0 ||
    !Number.isFinite(attemptEvent.responseTimeMs) ||
    attemptEvent.responseTimeMs < 0
  ) {
    throw new Error('The game attempt has invalid telemetry data and was not saved.');
  }

  const storageKey = getTelemetryKey(userName);
  const storedValue = localStorage.getItem(storageKey);
  const savedData = storedValue
    ? parseStoredValue(storedValue, 'player telemetry')
    : { attempts: [] };

  if (!Array.isArray(savedData.attempts)) {
    throw new Error('Saved player telemetry does not contain an attempts list.');
  }

  const oldBestStreak = calculateProfile(savedData.attempts).bestStreak;
  const attempts = [...savedData.attempts, attemptEvent];
  const profile = calculateProfile(attempts);
  localStorage.setItem(storageKey, JSON.stringify({ attempts, profile }));

  const streakEnded = !attemptEvent.isCorrect && attemptEvent.streakAtAttempt > 0;
  updateLeaderboard(
    userName,
    profile.bestStreak,
    attemptEvent,
    streakEnded,
    profile.bestStreak > oldBestStreak
  );

  return profile;
}
