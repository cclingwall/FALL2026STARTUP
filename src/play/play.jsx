import React from 'react';
import './play.css';

export function Play() {
  return (
    <main className="play-page container py-5">
      <div className="row g-4">
        <section className="col-12 col-xl-8 luxury-panel" aria-labelledby="trainer-heading">
          <h2 id="trainer-heading">Ear Training Arena</h2>

          {/* Game mode and tone playback controls */}
          <section className="game-section" aria-labelledby="controls-heading">
            <h3 id="controls-heading">Game Controls</h3>
            <button type="button">Single Notes</button>
            <button type="button">Chords</button>
            <button type="button">Play Tone</button>
          </section>

          {/* Piano-note guess buttons and result feedback area */}
          <section className="game-section" aria-labelledby="guess-heading">
            <h3 id="guess-heading">What did you hear?</h3>
            <ul aria-label="Piano note guesses">
              <li><button type="button" value="C">C</button></li>
              <li><button type="button" value="Db">Db</button></li>
              <li><button type="button" value="D">D</button></li>
              <li><button type="button" value="Eb">Eb</button></li>
              <li><button type="button" value="E">E</button></li>
              <li><button type="button" value="F">F</button></li>
              <li><button type="button" value="Gb">Gb</button></li>
              <li><button type="button" value="G">G</button></li>
              <li><button type="button" value="Ab">Ab</button></li>
              <li><button type="button" value="A">A</button></li>
              <li><button type="button" value="Bb">Bb</button></li>
              <li><button type="button" value="B">B</button></li>
            </ul>
            <p aria-live="polite">Correct! +1</p>
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