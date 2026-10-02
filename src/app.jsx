import React, { useState, useEffect } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { Home } from './home/home.jsx';
import { Play } from './play/play.jsx';
import { Scores } from './scores/scores.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <BrowserRouter>
      {/* Intro Overlay */}
      {!introDismissed && (
        <div
          id="intro-overlay"
          role="button"
          tabIndex={0}
          aria-label="Click anywhere to begin"
          onClick={() => setIntroDismissed(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIntroDismissed(true);
            }
          }}
        >
          <span>Click anywhere to begin</span>
        </div>
      )}

      {/* Semantic Header */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3">
        <button
          className="sidebar-toggle"
          type="button"
          aria-controls="page-sidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
        >
          <span aria-hidden="true">&#9776;</span>
          <span className="visually-hidden">Open navigation menu</span>
        </button>
        <h1>
          <NavLink to="/" onClick={closeSidebar}>Pitch Royale</NavLink>
        </h1>
        <div className="user-status">
          <span>Logged in as:</span>
          <span className="user-avatar" aria-hidden="true"></span>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <aside
        id="page-sidebar"
        className={`page-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Main navigation"
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar-heading">
          <h2>Navigate</h2>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
          >
            &times;
          </button>
        </div>
        <nav>
          <NavLink to="/" end onClick={closeSidebar}>
            Home / Login
          </NavLink>
          <NavLink to="/play" onClick={closeSidebar}>
            Play Game
          </NavLink>
          <NavLink to="/scores" onClick={closeSidebar}>
            Leaderboard &amp; Stats
          </NavLink>
        </nav>
      </aside>

      {/* Backdrop for closing sidebar when clicked outside */}
      <button
        className={`sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Close navigation menu"
        onClick={closeSidebar}
      />

      {/* Dynamic View Router */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Footer */}
      <footer>
        <p>
          Created by Curtis Lingwall |{' '}
          <a
            href="https://github.com/cclingwall/FALL2026STARTUP"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pitch Royale GitHub Repository
          </a>
        </p>
      </footer>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container text-center py-5">
      <h2>404: Page Not Found</h2>
      <p>The stage you are looking for does not exist.</p>
      <NavLink to="/" className="btn btn-outline-light">
        Return Home
      </NavLink>
    </main>
  );
}