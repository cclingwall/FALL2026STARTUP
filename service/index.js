const express = require('express');
const { randomBytes } = require('node:crypto');
const app = express();
const port = 4000;
const path = require('node:path');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

// Temporary storage: accounts disappear when the server restarts.
const users = new Map();
const sessions = new Map();
const sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours


app.use(express.json());
app.use(cookieParser());

function requireAuth(req, res, next) {
  const token = req.cookies.authToken;
  const session = sessions.get(token);

  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);

    return res.status(401).json({
      message: 'Please log in to continue.',
    });
  }

  const user = users.get(session.userKey);

  if (!user) {
    sessions.delete(token);

    return res.status(401).json({
      message: 'Please log in to continue.',
    });
  }

  req.user = user;
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

  if (users.has(userKey)) {
    return res.status(409).json({
      message: 'That username is already registered.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Another request could register this name while hashing was running.
  if (users.has(userKey)) {
    return res.status(409).json({
      message: 'That username is already registered.',
    });
  }

  users.set(userKey, {
    username: name,
    passwordHash,
  });

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
  const user = users.get(userKey);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      message: 'Incorrect username or password.',
    });
  }

  const token = randomBytes(32).toString('hex');

  sessions.set(token, {
    userKey,
    expiresAt: Date.now() + sessionDurationMs,
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

app.delete('/api/auth/logout', (req, res) => {
  const token = req.cookies.authToken;
  sessions.delete(token);

  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.sendStatus(204);
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

app.listen(port, () => {
  console.log(`Pitch Royale service running at http://localhost:${port}`);
});