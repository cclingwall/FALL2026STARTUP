const express = require('express');

const app = express();
const port = 4000;
const path = require('node:path');

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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