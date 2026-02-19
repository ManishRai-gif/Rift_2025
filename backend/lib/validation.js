/**
 * Input validation for run-agent request
 */

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

function validateRunAgentBody(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  const { repoUrl, teamName, leaderName } = body;
  if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.trim()) {
    errors.push('repoUrl is required and must be a non-empty string');
  } else if (!GITHUB_URL_REGEX.test(repoUrl.trim())) {
    errors.push('repoUrl must be a valid GitHub repository URL');
  }
  if (!teamName || typeof teamName !== 'string' || !teamName.trim()) {
    errors.push('teamName is required and must be a non-empty string');
  }
  if (!leaderName || typeof leaderName !== 'string' || !leaderName.trim()) {
    errors.push('leaderName is required and must be a non-empty string');
  }
  if (body.githubToken != null && typeof body.githubToken !== 'string') {
    errors.push('githubToken must be a string if provided');
  }
  const retryLimit = body.retryLimit;
  const parsed = retryLimit != null ? (typeof retryLimit === 'number' ? retryLimit : parseInt(retryLimit, 10)) : null;
  if (retryLimit != null && (isNaN(parsed) || parsed < 1 || parsed > 10)) {
    errors.push('retryLimit must be a number between 1 and 10 if provided');
  }
  if (errors.length) {
    return { valid: false, error: errors.join('; ') };
  }
  return {
    valid: true,
    repoUrl: repoUrl.trim(),
    teamName: teamName.trim(),
    leaderName: leaderName.trim(),
    githubToken: typeof body.githubToken === 'string' ? body.githubToken.trim() : undefined,
    retryLimit: parsed != null ? Math.round(parsed) : undefined,
  };
}

module.exports = { validateRunAgentBody };
