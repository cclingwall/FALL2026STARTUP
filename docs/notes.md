# CS 260 Notes

This file represents what I have learned about web programming.
I love Web Programming!

- [My startup](https://startup.curtislingwall.click)
- [My simon](https://simon.curtislingwall.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

Interesting things I have learned about AWS

## HTML

Interesting things I have learned about HTML

## React

React lets the application describe its interface as components. Each component receives props from its parent and renders from the current state.

### Pitch Royale components

- `App` in `src/app.jsx` owns the shared username and the main routes.
- `Home` in `src/home/home.jsx` contains the username form, rotating hero content, and local music trivia.
- `Play` in `src/play/play.jsx` assembles the game controls, piano keyboard, feedback, and activity feed.
- `PianoKeyboard` in `src/play/PianoKeyboard.jsx` renders seven white natural-note keys and five black sharp/flat keys. Clicking a key reports a guess to the game session.
- `Scores` in `src/scores/scores.jsx` presents leaderboard and profile data and the mock AI Ear-Training Coach.

### React state and effects

- `useState` stores values that change the rendered interface: username, game mode, Hard Mode, target pitch, streak, answer feedback, activity events, loaded stats, and AI Coach output.
- `useEffect` handles work associated with rendering, such as rotating slides, adding timed simulated peer updates, and loading saved stats. Effects that start timers return cleanup functions so those timers stop when their component unmounts.
- `useGameSession` in `src/play/useGameSession.js` is a custom hook. It groups the Play page's challenge selection, timer, reference-pitch tracking, guesses, streak, and telemetry handling.
- Props and callback functions connect these pieces. For example, `Play` passes key guesses into `useGameSession`, and `App` passes the current username to `Scores`.

### Browser audio and keyboard

`src/play/sound.js` uses the Web Audio API to create oscillator tones on demand. It derives twelve pitch classes across octaves 3, 4, and 5, so single-note challenges cover C3 through B5. It can also play major or minor triads and a C4 reference tone. A short gain envelope fades tones in and out to reduce clicks.

The visual keyboard shows one octave of pitch classes, while a challenge can come from any of the three octaves. The answer checks the pitch class. Correct and incorrect guesses briefly flash green or red; the normal white and black key colors remain for hover and focus.

### Local telemetry and leaderboard

`src/utils/telemetryStorage.js` saves each attempt and updates aggregated profile data in browser `localStorage`, using the username as part of the telemetry key. The profile includes best streak, single-note and chord accuracy, average and fastest response times, common pitch-class mistakes, and accuracy by octave. Leaderboard scores are stored locally as well.

This is a browser-only prototype: data is specific to the browser and is not shared across devices or users. The username flow is not server-backed authentication, and the storage is not a database service.

### Simulated live activity

The Live Activity Feed in `src/play/play.jsx` begins with sample player messages and adds another sample message on a timer. It also adds events for a fast correct answer or a five-note streak. The feed is intentionally mocked; it does not open a WebSocket connection or receive updates from other players.

### Mock AI Ear-Training Coach

The Scores page passes the player's aggregated telemetry to a local mock coach function. It waits briefly to show a loading state, then derives coaching text from the player's reaction time, strongest interval, and areas to practice. No AI model, external endpoint, or API key is used. The async function is shaped so it can later be replaced by a backend request.
