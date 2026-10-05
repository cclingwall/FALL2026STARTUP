import React from 'react';
import Button from 'react-bootstrap/Button';
import './play.css';
export function Play() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <div className="players">
        Player
        <span className="player-name">Mystery player</span>
        <div id="player-messages">
          <div className="event"><span className="player-event">Linus</span> scored 377</div>
          <div className="event"><span className="player-event">Linus</span> started a new game</div>
          <div className="event"><span className="system-event">game</span> connected</div>
        </div>
      </div>

      <div className="game">
        <div className="button-container">
          <Button type="button" variant="link" className="button-top-left" aria-label="Green" />
          <Button type="button" variant="link" className="button-top-right" aria-label="Red" />
          <Button type="button" variant="link" className="button-bottom-left" aria-label="Yellow" />
          <Button type="button" variant="link" className="button-bottom-right" aria-label="Blue" />
          <div className="controls center">
            <div className="game-name">Simon<sup>&reg;</sup></div>
            <div className="score center">--</div>
            <Button type="button" variant="primary">Reset</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
