const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const app = require('./index');

test('game API validates attempts, isolates players, and derives scores from history', async () => {
  const savedAttempts = [];
  const savedUsers = new Map();
  app.locals.usersCollection = {
    async insertOne(user) {
      if (savedUsers.has(user._id)) {
        throw Object.assign(new Error('Duplicate key'), { code: 11000 });
      }
      savedUsers.set(user._id, user);
    },
    async findOne({ _id }) {
      return savedUsers.get(_id) ?? null;
    },
  };
  const savedSessions = new Map();
  app.locals.sessionsCollection = {
    async insertOne(session) {
      savedSessions.set(session._id, session);
    },
    async findOne({ _id, expiresAt }) {
      const session = savedSessions.get(_id);
      return session && session.expiresAt > expiresAt.$gt ? session : null;
    },
    async deleteOne({ _id }) {
      savedSessions.delete(_id);
    },
  };
  let databaseUnavailable = false;
  app.locals.attemptsCollection = {
    async insertOne(attempt) {
      if (databaseUnavailable) throw new Error('Database unavailable');
      savedAttempts.push(attempt);
    },
    find({ userKey }) {
      return {
        sort(order) {
          assert.deepEqual(order, { timestamp: 1, _id: 1 });
          return {
            async toArray() {
              return savedAttempts.filter(attempt => userKey === undefined || attempt.userKey === userKey);
            },
          };
        },
      };
    },
  };
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { method = 'GET', cookie, body } = {}) {
    const response = await fetch(origin + path, {
      method,
      headers: { ...(cookie && { Cookie: cookie }), ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = response.status === 204 ? null : response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
    return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  async function registerAndLogin(username) {
    const body = { username, password: 'practice123' };
    assert.equal((await request('/api/auth/register', { method: 'POST', body })).status, 201);
    const login = await request('/api/auth/login', { method: 'POST', body });
    assert.equal(login.status, 200);
    return login.cookie;
  }
  const base = { mode: 'single', targetNote: 'C', guessedNote: 'C', targetOctave: 4, responseTimeMs: 800 };
  try {
    assert.equal((await request('/api/stats')).status, 401);
    assert.equal((await request('/api/attempts', { method: 'POST', body: base })).status, 401);
    assert.deepEqual((await request('/api/leaderboard')).data, []);
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');
    assert.match(savedUsers.get('alice').passwordHash, /^[$]2[aby][$]/);
    assert.equal(Object.hasOwn(savedUsers.get('alice'), 'password'), false);
    const duplicates = await Promise.all(['ALICE', ' alice '].map(username => (
      request('/api/auth/register', { method: 'POST', body: { username, password: 'practice123' } })
    )));
    assert.deepEqual(duplicates.map(response => response.status), [409, 409]);
    const wrongPassword = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'ALICE', password: 'wrong-password' },
    });
    assert.equal(wrongPassword.status, 401);
    assert.equal((await request('/api/stats', { cookie: bob })).data.gamesPlayed, 0);
    // Browser-supplied identity, correctness, streak, and timestamp are ignored.
    const submitted = await request('/api/attempts', { method: 'POST', cookie: alice, body: { ...base, username: 'Bob', isCorrect: false, streakAtAttempt: 999, timestamp: '1900-01-01' } });
    assert.equal(submitted.status, 201);
    assert.equal(submitted.data.profile.bestStreak, 1);
    assert.equal(submitted.data.profile.singleCorrect, 1);
    assert.equal(submitted.data.profile.avgResponseTimeMs, 800);
    assert.deepEqual(savedAttempts, [{
      ...base,
      userKey: 'alice',
      username: 'Alice',
      isCorrect: true,
      timestamp: savedAttempts[0].timestamp,
    }]);
    assert.ok(Number.isFinite(Date.parse(savedAttempts[0].timestamp)));
    assert.notEqual(savedAttempts[0].timestamp, '1900-01-01');
    assert.equal((await request('/api/stats', { cookie: bob })).data.gamesPlayed, 0);
    for (const body of [[], {}, { ...base, targetNote: 'INVALID' }, { ...base, guessedNote: '__proto__' }, { ...base, mode: 'unknown' }, { ...base, targetOctave: 9 }, { ...base, responseTimeMs: -1 }, { ...base, responseTimeMs: '800' }]) {
      assert.equal((await request('/api/attempts', { method: 'POST', cookie: alice, body })).status, 400);
    }
    assert.equal(savedAttempts.length, 1);
    databaseUnavailable = true;
    const failed = await request('/api/attempts', { method: 'POST', cookie: alice, body: base });
    databaseUnavailable = false;
    assert.equal(failed.status, 503);
    assert.equal((await request('/api/stats', { cookie: alice })).data.gamesPlayed, 1);
    await request('/api/attempts', { method: 'POST', cookie: alice, body: { ...base, guessedNote: 'D', responseTimeMs: 1000 } });
    await request('/api/attempts', { method: 'POST', cookie: alice, body: base });
    const stats = (await request('/api/stats', { cookie: alice })).data;
    assert.equal(stats.bestStreak, 1);
    assert.equal(stats.gamesPlayed, 3);
    assert.equal(stats.singleCorrect, 2);
    assert.equal(stats.avgResponseTimeMs, 867);
    assert.equal(stats.noteStats.C.commonMistake, 'D');
    for (let i = 0; i < 2; i++) {
      await request('/api/attempts', { method: 'POST', cookie: bob, body: { ...base, mode: 'chords' } });
    }
    assert.equal((await request('/api/stats', { cookie: bob })).data.chordCorrect, 2);
    savedAttempts.push({ ...savedAttempts[0], userKey: 'oldplayer', username: undefined });
    const board = (await request('/api/leaderboard')).data;
    assert.deepEqual(board.map(row => [row.name, row.highestStreak]), [['Bob', 2], ['Alice', 1], ['oldplayer', 1]]);
    assert.equal(board[0].dateRecorded, new Date().toISOString().slice(0, 10));
    assert.deepEqual(Object.keys(board[0]).sort(), ['dateRecorded', 'highestStreak', 'name']);
    const aliceToken = alice.slice('authToken='.length);
    const aliceSessionId = createHash('sha256').update(aliceToken).digest('hex');
    assert.equal(savedSessions.get(aliceSessionId).userKey, 'alice');
    assert.equal(savedSessions.has(aliceToken), false);

    const bobSession = [...savedSessions.values()].find(session => session.userKey === 'bob');
    bobSession.expiresAt = new Date(0);
    assert.equal((await request('/api/stats', { cookie: bob })).status, 401);

    assert.equal((await request('/api/auth/logout', { method: 'DELETE', cookie: alice })).status, 204);
    assert.equal(savedSessions.has(aliceSessionId), false);
    assert.equal((await request('/api/stats', { cookie: alice })).status, 401);
    assert.equal((await request('/api/attempts', { method: 'POST', cookie: alice, body: base })).status, 401);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
