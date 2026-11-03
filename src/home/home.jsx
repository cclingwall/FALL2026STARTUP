import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80',
    alt: 'Warmly lit grand piano keys',
    heading: 'Master Every Note',
    description: 'Refine your ear in an atmosphere built for focused listening.'
  },
  {
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Warm recording studio equipment',
    heading: 'Listen With Precision',
    description: 'Enter the studio and build your musical instinct one challenge at a time.'
  }
];

// Local examples until the third-party trivia API is connected.
const triviaQuestions = [
  { question: 'What frequency is the standard tuning pitch A above middle C?', answer: '440 Hz.' },
  { question: 'What is the interval between two notes one octave apart?', answer: 'An octave spans twelve semitones.' },
  { question: 'Which intervals form a major chord?', answer: 'A root, a major third, and a perfect fifth.' },
  { question: 'What is the ability to identify a note without a reference tone called?', answer: 'Absolute pitch, also called perfect pitch.' },
  { question: 'Why is the piano classified as a percussion instrument?', answer: 'Hammers strike its strings to produce sound.' },
];

function chooseTriviaQuestion(currentQuestion) {
  const others = triviaQuestions.filter((item) => item !== currentQuestion);
  return others[Math.floor(Math.random() * others.length)];
}

export function Home({ userName, onAuthChange }) {
  const [usernameInput, setUsernameInput] = useState(userName || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [trivia, setTrivia] = useState(() => chooseTriviaQuestion(null));
  const [answerVisible, setAnswerVisible] = useState(false);
  const navigate = useNavigate();

  // Rotate the hero slides every six seconds and stop the timer when Home unmounts.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Keep the typed values in React state and send a non-empty name to App.
  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedName = usernameInput.trim();

    if (normalizedName) {
      onAuthChange(normalizedName);
    }
  };

  // Clear the shared login and local form values when the user logs out.
  const handleLogout = () => {
    onAuthChange('');
    setUsernameInput('');
    setPasswordInput('');
  };

  return (
    <main className="home-page container py-5">
      <div className="row g-4">
        {/* Hero Carousel */}
        <section
          className="col-12 p-0 overflow-hidden carousel slide"
          id="heroCarousel"
          aria-label="Pitch Royale highlights"
        >
          <div className="carousel-inner">
            {heroSlides.map((slide, index) => (
              <div
                className={`carousel-item ${activeSlide === index ? 'active' : ''}`}
                key={slide.heading}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  width="1200"
                  height="400"
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                <div className="carousel-caption">
                  <h2>{slide.heading}</h2>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setActiveSlide((currentSlide) =>
                (currentSlide - 1 + heroSlides.length) % heroSlides.length
              )
            }
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            aria-label="Next slide"
            onClick={() =>
              setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length)
            }
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </section>

        {/* Login Panel */}
        <section className="col-12 col-lg-6 d-flex" aria-labelledby="login-heading">
          <div className="luxury-panel w-100">
            <h2 id="login-heading">{userName ? 'Welcome' : 'Account Login'}</h2>
            {userName ? (
              <div className="row g-3">
                <p>Welcome to the stage, {userName}</p>
                <button type="button" onClick={() => navigate('/play')}>
                  Enter Ear Training Arena
                </button>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <form className="row g-3" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  required
                />

                {/* Both actions currently save a local username; credentials are not verified yet. */}
                <button type="submit">Login</button>
                <button type="submit">Create Account</button>
              </form>
            )}
          </div>
        </section>

        {/* Trivia Panel */}
        <section className="col-12 col-lg-6 d-flex" aria-labelledby="trivia-heading">
          <div className="luxury-panel w-100">
            <h2 id="trivia-heading">Daily Music Trivia</h2>
            <p id="daily-trivia" aria-live="polite">{trivia.question}</p>
            <button
              type="button"
              aria-expanded={answerVisible}
              aria-controls="trivia-answer"
              onClick={() => setAnswerVisible((visible) => !visible)}
            >
              {answerVisible ? 'Hide Answer' : 'Reveal Answer'}
            </button>
            <div id="trivia-answer" aria-live="polite">
              {answerVisible && <p><strong>Answer:</strong> {trivia.answer}</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setTrivia((current) => chooseTriviaQuestion(current));
                setAnswerVisible(false);
              }}
            >
              Next Question
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}