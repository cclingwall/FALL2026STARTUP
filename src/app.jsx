import React, { useState, useEffect } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { Home } from './home/home.jsx';
import { Play } from './play/play.jsx';
import { Scores } from './scores/scores.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Remember the overlay dismissal for this tab, including after refreshes.
  const [introDismissed, setIntroDismissed] = useState(
    () => sessionStorage.getItem('introDismissed') === 'true'
  );
  
  const [userName, setUserName] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Hide the intro and save that choice for the rest of this tab's session.
  const dismissIntro = () => {
    sessionStorage.setItem('introDismissed', 'true');
    setIntroDismissed(true);
  };

  // Update the shared name after a successful server response.
  const handleAuthChange = (name) => {
    setUserName(name);
  };

  useEffect(() => {
  const controller = new AbortController();

  async function restoreSession() {
    try {
      const response = await fetch('/api/user/me', {
        signal: controller.signal,
      });

      if (response.status === 401) {
        return; // No active session; stay logged out.
      }

      if (!response.ok) {
        throw new Error('Could not check your login session.');
      }

      const user = await response.json();

      if (!controller.signal.aborted) {
        setUserName(user.username);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setAuthError('Could not check your session. Please refresh to retry.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setAuthLoading(false);
      }
    }
  }

  restoreSession();

  return () => controller.abort();
}, []);

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

if (authLoading) {
  return <main className="container py-5">Checking your session...</main>;
}

if (authError) {
  return (
    <main className="container py-5">
      <p role="alert">{authError}</p>
      <button type="button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </main>
  );
}

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
          onClick={dismissIntro}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              dismissIntro();
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
          <span>Logged in as: {userName || 'Guest'}</span>
          {/* Use the user's first letter as the avatar label. */}
          <span className="user-avatar" aria-hidden="true">
            {(userName || 'Guest').charAt(0).toUpperCase()}
          </span>
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
      {/* Give each page the current username and a way to update it. */}
      <Routes>
        <Route
          path="/"
          element={<Home userName={userName} onAuthChange={handleAuthChange} />}
        />
        <Route
          path="/play"
          element={<Play userName={userName} onAuthChange={handleAuthChange} />}
        />
        <Route
          path="/scores"
          element={<Scores userName={userName} onAuthChange={handleAuthChange} />}
        />
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