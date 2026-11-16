const express = require('express');
const { createHash, randomBytes } = require('node:crypto');
const app = express();
const port = 4000;
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { parseEnv } = require('node:util');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { pitchClasses, supportedModes, octaveNumbers, calculateProfile } = require('./telemetry');

const sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours
const geminiKeyPath = path.join(__dirname, '../keys/api_key.env');
const coachInstructions = [
  'You are the Pitch Royale ear-training coach. The game asks players to identify a single note or the root of a chord.',
  'Use only the supplied aggregate practice stats. Base observations on notes and octaves with attempts, and acknowledge small samples.',
  'In 2–4 sentences, point out a supported pattern and give one concrete listening drill. Use friendly plain text.',
].join(' ');


app.use(express.json());
app.use(cookieParser());

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getSessionId(req) {
  const token = req.cookies.authToken;
  return typeof token === 'string' && /^[0-9a-f]{64}$/.test(token)
    ? hashSessionToken(token)
    : null;
}

async function requireAuth(req, res, next) {
  const sessionId = getSessionId(req);
  const session = sessionId && await app.locals.sessionsCollection.findOne({
    _id: sessionId,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {

    return res.status(401).json({
      message: 'Please log in to continue.',
    });
  }

  const user = await app.locals.usersCollection.findOne(
    { _id: session.userKey },
    { projection: { username: 1 } },
  );

  if (!user) {
    return res.status(401).json({
      message: 'Please log in to continue.',
    });
  }

  req.user = {
    userKey: user._id,
    username: user.username,
  };
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== 'string' ||
    !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())
  ) {
    return res.status(400).json({
      message: 'Username must be 3–30 letters, numbers, or underscores.',
    });
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and at most 72 bytes.',
    });
  }

  const name = username.trim();
  const userKey = name.toLowerCase();

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await app.locals.usersCollection.insertOne({
      _id: userKey,
      username: name,
      passwordHash,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That username is already registered.' });
    }

    console.error('Could not save account to MongoDB.');
    return res.status(503).json({ message: 'Could not create your account.' });
  }

  return res.status(201).json({ username: name });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    password.length === 0 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      message: 'A valid username and password are required.',
    });
  }

  const userKey = username.trim().toLowerCase();
  const user = await app.locals.usersCollection.findOne({ _id: userKey });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      message: 'Incorrect username or password.',
    });
  }

  const token = randomBytes(32).toString('hex');

  await app.locals.sessionsCollection.insertOne({
    _id: hashSessionToken(token),
    userKey,
    expiresAt: new Date(Date.now() + sessionDurationMs),
  });

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: sessionDurationMs,
  });

  return res.json({ username: user.username });
});


app.get('/api/user/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

app.delete('/api/auth/logout', async (req, res) => {
  const sessionId = getSessionId(req);
  if (sessionId) {
    await app.locals.sessionsCollection.deleteOne({ _id: sessionId });
  }

  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.sendStatus(204);
});

// Identity comes from the session, not a username in the request body.
function loadAttempts(filter) {
  return app.locals.attemptsCollection.find(filter).sort({ timestamp: 1, _id: 1 }).toArray();
}

app.post('/api/attempts', requireAuth, async (req, res) => {
  const { mode, targetNote, guessedNote, targetOctave, responseTimeMs } = req.body ?? {};

  if (
    !supportedModes.includes(mode) ||
    !pitchClasses.includes(targetNote) ||
    !pitchClasses.includes(guessedNote) ||
    !octaveNumbers.includes(targetOctave) ||
    !Number.isFinite(responseTimeMs) ||
    responseTimeMs < 0
  ) {
    return res.status(400).json({ message: 'Invalid game attempt.' });
  }

  const { userKey, username } = req.user;
  const attempt = {
    mode, targetNote, guessedNote, targetOctave, responseTimeMs,
    isCorrect: targetNote === guessedNote,
    timestamp: new Date().toISOString(),
  };

  try {
    await app.locals.attemptsCollection.insertOne({ userKey, username, ...attempt });
  } catch {
    console.error('Could not save game attempt to MongoDB.');
    return res.status(503).json({ message: 'Could not save your game attempt.' });
  }

  const attempts = await loadAttempts({ userKey });
  res.status(201).json({ profile: calculateProfile(attempts) });
});

app.get('/api/stats', requireAuth, async (req, res) => {
  const { userKey } = req.user;
  const attempts = await loadAttempts({ userKey });
  res.json(calculateProfile(attempts));
});

app.post('/api/coach', requireAuth, async (req, res) => {
  const profile = calculateProfile(await loadAttempts({ userKey: req.user.userKey }));
  if (profile.gamesPlayed === 0) {
    return res.json({ insight: 'Play a few challenges first so I can suggest what to practice next.' });
  }

  try {
    let apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      const secretFile = await readFile(geminiKeyPath, 'utf8').catch(error => {
        if (error.code === 'ENOENT') return '';
        throw error;
      });
      // Also accept the existing file format, which contains just the key.
      const bareKey = secretFile.trim();
      console.log('Using Gemini API key from keys/api_key.env');
      apiKey = parseEnv(secretFile).GEMINI_API_KEY?.trim()
        || (/^(?:AQ\.|AIza)[A-Za-z0-9_-]+$/.test(bareKey) ? bareKey : '');
    }
    if (!apiKey) {
      return res.status(503).json({ message: 'The AI coach has not been configured yet.' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: coachInstructions }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(profile) }] }],
          generationConfig: { maxOutputTokens: 512 },
        }),
        signal: AbortSignal.timeout(15000),
      },
    );

    if (response.status === 429) {
      return res.status(429).json({ message: 'The AI coach has reached its usage limit. Try again later.' });
    }
    if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}`);

    const result = await response.json();
    const insight = result.candidates?.[0]?.content?.parts
      ?.filter(part => !part.thought)
      .map(part => part.text ?? '')
      .join('')
      .trim();
    if (!insight) throw new Error('Gemini returned no coaching feedback');
    return res.json({ insight });
  } catch {
    return res.status(503).json({ message: 'The AI coach is temporarily unavailable. Try again later.' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const attemptsByPlayer = new Map();
  for (const attempt of await loadAttempts({})) {
    const { userKey } = attempt;
    if (!attemptsByPlayer.has(userKey)) attemptsByPlayer.set(userKey, []);
    attemptsByPlayer.get(userKey).push(attempt);
  }

  const scores = [];
  for (const [userKey, attempts] of attemptsByPlayer) {
    const profile = calculateProfile(attempts);
    if (profile.bestStreak === 0) continue;

    let streak = 0;
    let dateRecorded = '';
    for (const attempt of attempts) {
      streak = attempt.isCorrect ? streak + 1 : 0;
      if (streak === profile.bestStreak) {
        dateRecorded = attempt.timestamp.slice(0, 10);
        break;
      }
    }

    // Earlier attempt records only stored the normalized username.
    let name = attempts.find(attempt => attempt.username)?.username;
    if (!name) {
      const user = await app.locals.usersCollection.findOne({ _id: userKey }, { projection: { username: 1 } });
      name = user?.username ?? userKey;
    }
    scores.push({ name, highestStreak: profile.bestStreak, dateRecorded });
  }
  scores.sort((a, b) => b.highestStreak - a.highestStreak || a.name.localeCompare(b.name));
  res.json(scores);
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const frontendPath = path.join(__dirname, '../dist');

app.use(express.static(frontendPath));

// Let React Router handle page URLs such as /play and /scores.
app.get('/{*page}', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Importing the app for tests does not start the normal port-4000 server.
if (require.main === module) {
  const { connectDatabase } = require('./database');

  connectDatabase()
    .then(async database => {
      app.locals.attemptsCollection = database.collection('attempts');
      app.locals.usersCollection = database.collection('users');
      app.locals.sessionsCollection = database.collection('sessions');
      await app.locals.sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      console.log('Connected to the Pitch Royale database.');
      app.listen(port, () => {
        console.log(`Pitch Royale service running at http://localhost:${port}`);
      });
    })
    .catch(() => {
      console.error('MongoDB connection failed. Check service/dbConfig.json and Atlas network access.');
      process.exit(1);
    });
}

module.exports = app;
