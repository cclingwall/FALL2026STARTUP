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

## Startup DB connection

Pitch Royale shares the Atlas cluster with Simon DB. Pitch Royale selects the
`pitch_royale` database and Simon selects `simon`. The Node driver manages a
connection pool, so the service can reuse one MongoClient across requests.

Copy `service/dbConfig.example.json` to `service/dbConfig.json` and fill in the
Atlas hostname and database user credentials. The database user needs read and
write access to `pitch_royale`, and Atlas must allow the machine's outbound IP.
The real config stays out of Git and must be provisioned separately at
`~/services/startup/service/dbConfig.json` on the deployment server.

Run `npm start` and check for the database connection message before opening
`http://localhost:4000/api/health`. Startup pings Atlas before opening port 4000.
Atlas shows the new database after its first write.

### Saving game attempts

The attempt endpoint validates the guess, takes the player identity from their
session, and writes the result to MongoDB's `attempts` collection. It waits for
MongoDB to acknowledge the write before updating the in-memory history or
returning the updated profile. A failed write returns HTTP 503 and leaves the
in-memory history alone. Stats and leaderboard still read the in-memory history
until the read paths are switched to MongoDB.

### Reading game attempts

MongoDB is now the source for player stats, the profile returned after a
guess, and the leaderboard. Sort by timestamp and then document ID so streaks
use a consistent order. New records include the display username so the
leaderboard can show it after a restart. Older records fall back to the
normalized username when no display name is available.

Accounts still live in memory at this point. Complete account persistence
before deploying these database-backed stats to production.

### Saving player accounts

The `users` collection stores each display username and a bcrypt password hash.
The lowercase username is the document ID, so MongoDB's unique ID constraint
also handles duplicate sign-ups that arrive at the same time. Login reads the
account from MongoDB and compares the submitted password with its hash.
Protected requests fetch the account identified by the session.

Accounts created with this version survive a restart. Existing in-memory
accounts are not migrated, and session cookies still require a fresh sign-in
after a restart.
