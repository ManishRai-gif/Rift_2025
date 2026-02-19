/**
 * Ripple DevOps Backend
 * Express REST API; POST /api/run-agent runs the multi-agent pipeline.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runAgentHandler } = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ripple-devops' });
});

app.post('/api/run-agent', runAgentHandler);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Ripple DevOps backend listening on port ${PORT}`);
});
