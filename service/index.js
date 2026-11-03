const express = require('express');

const app = express();
const port = 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(port, () => {
  console.log(`Pitch Royale service running at http://localhost:${port}`);
});