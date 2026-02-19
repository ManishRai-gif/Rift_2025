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

// Root: show that API is running (avoids "blank" when opening Render URL in browser)
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Ripple DevOps API</title></head>
      <body style="font-family: system-ui; max-width: 600px; margin: 2rem auto; padding: 1rem;">
        <h1>Ripple DevOps API</h1>
        <p>Backend is running. Use the <strong>frontend app</strong> (Netlify/Vercel) to run the agent.</p>
        <p><a href="/health">/health</a> &rarr; JSON health check</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ripple-devops' });
});

app.post('/api/run-agent', runAgentHandler);

app.use((err, req, res, next   ) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Ripple DevOps backend listening on port ${PORT}`);
});
