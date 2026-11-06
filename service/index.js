const express = require('express');

const app = express();
const port = 4000;
const path = require('node:path');

const bcrypt = require('bcryptjs');

// Temporary storage: accounts disappear when the server restarts.
const users = new Map();

app.use(express.json());

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