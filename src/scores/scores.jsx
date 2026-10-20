import React, { useEffect, useState } from 'react';
import { getLeaderboardScores, getTelemetryProfile } from '../utils/telemetryStorage.js';
import './scores.css';

function getAccuracy(correct, total) {
  return total === 0 ? '—' : `${Math.round((correct / total) * 100)}%`;
}

export function Scores({ userName }) {
  const displayName = userName || 'Guest';
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      setProfile(getTelemetryProfile(displayName));
      setLeaderboard(getLeaderboardScores());
      setStorageError('');
    } catch (error) {
      setStorageError(`Could not load saved stats: ${error.message}`);
    }
  }, [displayName]);

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
                <li>Average response: {profile.avgResponseTimeMs} ms</li>
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
            </>
          )}
        </section>
      </div>
    </main>
  );
}