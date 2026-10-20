import React from 'react';
import { NavLink } from 'react-router-dom';
import './home.css';

export function Home({ userName, onAuthChange }) {
  // Pass the submitted username to App after trimming any extra spaces.
  const handleSubmit = (event) => {
    event.preventDefault();
    const submittedName = new FormData(event.currentTarget).get('username');
    const normalizedName = submittedName?.toString().trim();

    if (normalizedName) {
      onAuthChange(normalizedName);
    }
  };

  return (
    <main className="home-page container py-5">
      <div className="row g-4">
        {/* Hero Carousel */}
        <section
          className="col-12 p-0 overflow-hidden carousel slide"
          id="heroCarousel"
          data-bs-ride="carousel"
          aria-label="Pitch Royale highlights"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80"
                alt="Warmly lit grand piano keys"
                width="1200"
                height="400"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption">
                <h2>Master Every Note</h2>
                <p>Refine your ear in an atmosphere built for focused listening.</p>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80"
                alt="Warm recording studio equipment"
                width="1200"
                height="400"
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption">
                <h2>Listen With Precision</h2>
                <p>Enter the studio and build your musical instinct one challenge at a time.</p>
              </div>
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="prev"
            aria-label="Previous slide"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="next"
            aria-label="Next slide"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </section>

        {/* Login Panel */}
        <section className="col-12 col-lg-6 d-flex" aria-labelledby="login-heading">
          <div className="luxury-panel w-100">
            <h2 id="login-heading">Account Login</h2>
            <form className="row g-3" onSubmit={handleSubmit}>
              <label htmlFor="username">Username</label>
              {/* Prefill the field so returning users do not need to retype their name. */}
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                defaultValue={userName || ''}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
              />

              <button type="submit">Login</button>
              <NavLink to="/play">Create Account</NavLink>
            </form>
          </div>
        </section>

        {/* Trivia Panel */}
        <section className="col-12 col-lg-6 d-flex" aria-labelledby="trivia-heading">
          <div className="luxury-panel w-100">
            <h2 id="trivia-heading">Daily Music Trivia</h2>
            <p id="daily-trivia">A daily music fact from an external API will appear here.</p>
          </div>
        </section>
      </div>
    </main>
  );
}