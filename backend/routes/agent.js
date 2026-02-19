/**
 * POST /api/run-agent
 * Body: { repoUrl, teamName, leaderName, githubToken? }
 */

const { validateRunAgentBody } = require('../lib/validation');
const { runAgent } = require('../lib/runAgent');

async function runAgentHandler(req, res) {
  const validation = validateRunAgentBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const results = await runAgent({
      repoUrl: validation.repoUrl,
      teamName: validation.teamName,
      leaderName: validation.leaderName,
      githubToken: validation.githubToken,
      retryLimit: validation.retryLimit,
    });
    return res.status(200).json(results);
  } catch (err) {
    if (err.code === 'PRIVATE_REPO') {
      return res.status(401).json({ error: 'PRIVATE_REPO' });
    }
    const message = err.message || 'Run failed';
    return res.status(500).json({ error: message });
  }
}

module.exports = { runAgentHandler };
