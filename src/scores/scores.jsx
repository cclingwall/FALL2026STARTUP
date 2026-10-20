import React, { useEffect, useState } from 'react';
import { getLeaderboardScores, getTelemetryProfile } from '../utils/telemetryStorage.js';
import './scores.css';

const intervalsFromC = {
  C: 'Unison',
  Db: 'Minor 2nd',
  D: 'Major 2nd',
  Eb: 'Minor 3rd',
  E: 'Major 3rd',
  F: 'Perfect 4th',
  Gb: 'Tritone',
  G: 'Perfect 5th',
  Ab: 'Minor 6th',
  A: 'Major 6th',
  Bb: 'Minor 7th',
  B: 'Major 7th'
};

function getAccuracy(correct, total) {
  return total === 0 ? '—' : `${Math.round((correct / total) * 100)}%`;
}

function getStrongestNote(noteStats) {
  return Object.entries(noteStats)
    .filter(([, stats]) => stats.attempts > 0)
    .sort(([, statsA], [, statsB]) =>
      (statsB.correct / statsB.attempts) - (statsA.correct / statsA.attempts)
    )[0]?.[0] || null;
}

function getMostChallengingNote(noteStats) {
  return Object.entries(noteStats)
    .filter(([, stats]) => stats.attempts > 0)
    .sort(([, statsA], [, statsB]) =>
      (statsA.correct / statsA.attempts) - (statsB.correct / statsB.attempts)
    )[0] || null;
}

function getMostChallengingOctave(octaveStats) {
  return Object.entries(octaveStats)
    .filter(([, stats]) => stats.attempts > 0)
    .sort(([, statsA], [, statsB]) => statsA.accuracy - statsB.accuracy)[0] || null;
}

export function generateMockAICoachResponse(telemetry) {
  if (telemetry.gamesPlayed === 0) {
    return 'Play a few challenges first. Once you have some attempts, I can highlight your strongest intervals and suggest what to practice next.';
  }

  const strongestNote = getStrongestNote(telemetry.noteStats);
  const challengingNote = getMostChallengingNote(telemetry.noteStats);
  const challengingOctave = getMostChallengingOctave(telemetry.octaveStats);
  const averageSeconds = (telemetry.avgResponseTimeMs / 1000).toFixed(1);
  const strengths = strongestNote
    ? `You are strongest on ${intervalsFromC[strongestNote]}s (${strongestNote}), with ${getAccuracy(
      telemetry.noteStats[strongestNote].correct,
      telemetry.noteStats[strongestNote].attempts
    )} accuracy`
    : 'There is not enough note-specific practice yet to identify a strongest interval';
  const challenges = [];

  if (challengingNote) {
    const [note, stats] = challengingNote;
    challenges.push(
      `${getAccuracy(stats.correct, stats.attempts)} on ${note} (${intervalsFromC[note]} from C)`
    );
  }
  if (challengingOctave) {
    const [octave, stats] = challengingOctave;
    challenges.push(`${stats.accuracy}% in Octave ${octave}`);
  }

  const practiceSuggestion = challengingOctave?.[0] === '3'
    ? ' Try singing from Reference C4 down to the root before guessing low-octave notes.'
    : ' Keep alternating focused interval practice with mixed challenges to reinforce recognition.';

  return `Your average reaction time is ${averageSeconds}s. ${strengths}.${challenges.length
    ? ` Your current challenges are ${challenges.join(' and ')}.`
    : ''}${practiceSuggestion}`;
}

export async function getAICoachInsights(telemetryPayload) {
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  return generateMockAICoachResponse(telemetryPayload);
}

export function Scores({ userName }) {
  const displayName = userName || 'Guest';
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachInsight, setCoachInsight] = useState('');
  const [coachError, setCoachError] = useState('');

  useEffect(() => {
    setProfile(null);
    setCoachInsight('');
    setCoachError('');
    try {
      setProfile(getTelemetryProfile(displayName));
      setLeaderboard(
        [...getLeaderboardScores()].sort((scoreA, scoreB) =>
          scoreB.highestStreak - scoreA.highestStreak
        )
      );
      setStorageError('');
    } catch (error) {
      setProfile(null);
      setStorageError(`Could not load saved stats: ${error.message}`);
    }
  }, [displayName]);

  const handleCoachAnalysis = async () => {
    if (!profile) {
      return;
    }

    setIsAnalyzing(true);
    setCoachError('');
    try {
      const insight = await getAICoachInsights(profile);
      setCoachInsight(insight);
    } catch (error) {
      setCoachError(`Could not analyze your stats: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const strongestNote = profile ? getStrongestNote(profile.noteStats) : null;
  const challengingNote = profile ? getMostChallengingNote(profile.noteStats) : null;
  const challengingOctave = profile ? getMostChallengingOctave(profile.octaveStats) : null;

  return (
    <main className="scores-page container py-5">
      <div className="row g-4">
        {/* Leaderboard table */}
        <section className="col-12 col-xl-8 luxury-panel" aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading">Leaderboard</h2>
          <div className="img-zoom-wrapper">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
              alt="Warmly lit concert stage representing the leaderboard top ranks"
              width="1200"
              height="300"
              style={{
                height: '300px',
                objectFit: 'cover',
                filter: 'brightness(0.62) sepia(0.18)'
              }}
              loading="lazy"
            />
          </div>
          <table>
            <caption>Highest recorded player streaks</caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player Name</th>
                <th scope="col">Highest Streak</th>
                <th scope="col">Date Recorded</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((score, index) => (
                <tr key={score.name}>
                  <td>{index + 1}</td>
                  <td>{score.name}</td>
                  <td>{score.highestStreak}</td>
                  <td><time dateTime={score.dateRecorded}>{score.dateRecorded}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Personal stats summary */}
        <section className="col-12 col-xl-4 luxury-panel" aria-labelledby="personal-stats-heading">
          <h2 id="personal-stats-heading">{displayName}&apos;s Personal Stats</h2>
          {storageError && <p role="alert">{storageError}</p>}
          {profile && (
            <>
              <ul>
                <li>Best streak: {profile.bestStreak}</li>
                <li>Single-note accuracy: {getAccuracy(profile.singleCorrect, profile.singleTotal)}</li>
                <li>Chord accuracy: {getAccuracy(profile.chordCorrect, profile.chordTotal)}</li>
                <li>Games played: {profile.gamesPlayed}</li>
                <li>Average reaction speed: {(profile.avgResponseTimeMs / 1000).toFixed(1)} s</li>
                <li>
                  Strongest interval from C:{' '}
                  {strongestNote
                    ? `${intervalsFromC[strongestNote]} (${strongestNote})`
                    : 'Not enough attempts'}
                </li>
                <li>
                  Most challenging note/octave:{' '}
                  {challengingNote || challengingOctave
                    ? [
                      challengingNote
                        ? `${challengingNote[0]} (${getAccuracy(
                          challengingNote[1].correct,
                          challengingNote[1].attempts
                        )})`
                        : null,
                      challengingOctave
                        ? `Octave ${challengingOctave[0]} (${challengingOctave[1].accuracy}%)`
                        : null
                    ].filter(Boolean).join(' / ')
                    : 'Not enough attempts'}
                </li>
                <li>
                  Fastest correct response:{' '}
                  {profile.fastestCorrectMs === null ? '—' : `${profile.fastestCorrectMs} ms`}
                </li>
              </ul>
              <details className="stats-breakdown">
                <summary>Note and octave breakdown</summary>
                <h3>Pitch classes</h3>
                <ul>
                  {Object.entries(profile.noteStats).map(([note, stats]) => (
                    <li key={note}>
                      {note}: {stats.correct}/{stats.attempts} correct, avg {stats.avgTimeMs} ms
                      {stats.commonMistake ? `, often guessed as ${stats.commonMistake}` : ''}
                    </li>
                  ))}
                </ul>
                <h3>Octaves</h3>
                <ul>
                  {Object.entries(profile.octaveStats).map(([octave, stats]) => (
                    <li key={octave}>
                      Octave {octave}: {stats.correct}/{stats.attempts} correct ({stats.accuracy}%)
                    </li>
                  ))}
                </ul>
              </details>
              <section className="ai-coach" aria-labelledby="ai-coach-heading">
                <h3 id="ai-coach-heading">AI Ear-Training Coach</h3>
                <p>Get practice suggestions based on your saved session telemetry.</p>
                <button type="button" onClick={handleCoachAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing session telemetry...' : 'Analyze My Ear (AI Coach)'}
                </button>
                {coachInsight && <p className="coach-insight" role="status">{coachInsight}</p>}
                {coachError && <p role="alert">{coachError}</p>}
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}