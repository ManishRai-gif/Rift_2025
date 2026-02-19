/**
 * GitHub API: repo visibility check and branch name generation
 * Never log or store tokens.
 */

const axios = require('axios');

/**
 * Check if repo is accessible. Returns { public: true } or { public: false, needToken: true }.
 * On 401/404 we treat as private and require token.
 */
async function checkRepoAccess(repoUrl, githubToken) {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (!match) return { public: false, error: 'Invalid GitHub URL' };
  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');
  const url = `https://api.github.com/repos/${owner}/${cleanRepo}`;
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (githubToken) headers.Authorization = `token ${githubToken}`;

  try {
    const res = await axios.get(url, { headers, timeout: 10000 });
    if (res.status === 200) return { public: true, owner, repo: cleanRepo };
    return { public: false, needToken: true };
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 404) {
      return { public: false, needToken: true };
    }
    return { public: false, error: err.message || 'GitHub request failed' };
  }
}

/**
 * Generate branch name: TEAMNAME_LEADERNAME_AI_Fix
 * Uppercase, spaces -> underscores, remove special characters
 */
function generateBranchName(teamName, leaderName) {
  const clean = (s) =>
    String(s)
      .replace(/\s+/g, '_')
      .replace(/[^A-Za-z0-9_]/g, '')
      .toUpperCase();
  const team = clean(teamName) || 'TEAM';
  const leader = clean(leaderName) || 'LEADER';
  return `${team}_${leader}_AI_Fix`;
}

module.exports = { checkRepoAccess, generateBranchName };
