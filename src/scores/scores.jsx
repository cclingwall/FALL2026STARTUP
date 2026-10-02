import React from 'react';
import './scores.css';

export function Scores() {
  return (
    <main className="container py-5">
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
              <tr>
                <td>1</td>
                <td>Sarah</td>
                <td>24</td>
                <td><time dateTime="2026-09-14">2026-09-14</time></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Alex</td>
                <td>18</td>
                <td><time dateTime="2026-09-14">2026-09-14</time></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Ben</td>
                <td>15</td>
                <td><time dateTime="2026-09-13">2026-09-13</time></td>
              </tr>
              <tr>
                <td>4</td>
                <td>Jordan</td>
                <td>12</td>
                <td><time dateTime="2026-09-12">2026-09-12</time></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Personal stats summary */}
        <section className="col-12 col-xl-4 luxury-panel" aria-labelledby="personal-stats-heading">
          <h2 id="personal-stats-heading">Alex&apos;s Personal Stats</h2>
          <ul>
            <li>Personal best streak: 18 notes</li>
            <li>Best single-note score: 92%</li>
            <li>Best chord score: 78%</li>
            <li>Total games played: 34</li>
          </ul>
        </section>
      </div>
    </main>
  );
}