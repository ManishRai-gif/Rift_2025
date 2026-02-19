/**
 * Main run flow: clone -> branch -> install -> test -> (analyze -> fix -> verify)* -> commit -> push
 * Generates results.json structure. Never stores or logs githubToken.
 */

const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const { checkRepoAccess, generateBranchName } = require('./github');
const { runInDocker } = require('./dockerRunner');
const { analyze } = require('./agents/analyzer');
const { getGeminiPatch } = require('./agents/fixer');
const { verify } = require('./agents/verifier');
const { applyPatch } = require('./patchApplicator');

const RETRY_LIMIT = Math.max(1, Math.min(10, parseInt(process.env.RETRY_LIMIT, 10) || 5));

function getCloneUrl(repoUrl, githubToken) {
  if (!githubToken) return repoUrl;
  try {
    const u = new URL(repoUrl);
    u.username = githubToken;
    u.password = 'x-oauth-basic';
    return u.toString();
  } catch {
    return repoUrl;
  }
}

function findFileInRepo(repoPath, fileOrBasename) {
  const full = path.join(repoPath, fileOrBasename);
  if (fs.existsSync(full)) return fileOrBasename;
  const base = path.basename(fileOrBasename);
  function search(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = path.relative(repoPath, path.join(dir, e.name));
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
        const found = search(path.join(dir, e.name));
        if (found) return found;
      } else if (e.isFile() && e.name === base) return rel;
    }
    return null;
  }
  return search(repoPath);
}

function getFileContent(repoPath, filePath) {
  const resolved = findFileInRepo(repoPath, filePath) || filePath;
  const full = path.join(repoPath, resolved);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

/**
 * Compute score: base 100, +10 if < 5 min, -2 per commit over 20
 */
function computeScore(timeTakenMs, totalCommits) {
  const base = 100;
  const fiveMin = 5 * 60 * 1000;
  const speedBonus = timeTakenMs < fiveMin ? 10 : 0;
  const over = Math.max(0, totalCommits - 20);
  const penalty = -2 * over;
  const final = Math.max(0, base + speedBonus + penalty);
  return { base, speedBonus, penalty, final };
}

async function runAgent(payload) {
  const { repoUrl, teamName, leaderName, githubToken, retryLimit: payloadRetry } = payload;
  const effectiveRetryLimit = payloadRetry != null ? Math.max(1, Math.min(10, payloadRetry)) : RETRY_LIMIT;
  const runId = uuidv4();
  const startTime = Date.now();
  const results = {
    repoUrl,
    teamName,
    leaderName,
    branch: '',
    totalFailures: 0,
    totalFixes: 0,
    iterations: 0,
    retryLimit: effectiveRetryLimit,
    status: 'PASSED',
    timeTaken: '',
    score: { base: 100, speedBonus: 0, penalty: 0, final: 100 },
    fixes: [],
    timeline: [],
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const defaultToken = process.env.GITHUB_TOKEN;
  const token = githubToken || defaultToken;

  const access = await checkRepoAccess(repoUrl, token);
  if (!access.public) {
    if (access.needToken) {
      const err = new Error('PRIVATE_REPO');
      err.code = 'PRIVATE_REPO';
      throw err;
    }
    throw new Error(access.error || 'Repository not accessible');
  }

  const branchName = generateBranchName(teamName, leaderName);
  results.branch = branchName;

  const baseDir = path.join(process.cwd(), 'clones', runId);
  fs.mkdirSync(path.dirname(baseDir), { recursive: true });
  const cloneUrl = getCloneUrl(repoUrl, token);

  const git = simpleGit(baseDir);
  try {
    await git.clone(cloneUrl, baseDir, ['--depth', '1']);
  } catch (err) {
    if (err.message && (err.message.includes('Authentication') || err.message.includes('401'))) {
      const e = new Error('PRIVATE_REPO');
      e.code = 'PRIVATE_REPO';
      throw e;
    }
    throw new Error('Clone failed: ' + (err.message || 'Unknown error'));
  }

  try {
    await git.checkoutLocalBranch(branchName);
  } catch (e) {
    await git.checkoutBranch(branchName, 'HEAD');
  }

  let iteration = 0;
  let allPassed = false;

  while (iteration < effectiveRetryLimit) {
    iteration++;
    results.iterations = iteration;
    const timelineEntry = {
      iteration,
      pass: false,
      timestamp: new Date().toISOString(),
      retryCounter: `${iteration}/${effectiveRetryLimit}`,
    };

    const runResult = runInDocker(baseDir);
    timelineEntry.pass = runResult.success;
    results.timeline.push(timelineEntry);

    if (runResult.success) {
      allPassed = true;
      break;
    }

    results.totalFailures++;
    const analyses = analyze(runResult.stdout + '\n' + runResult.stderr, baseDir);
    const first = analyses[0];
    if (!first.file || !apiKey) {
      timelineEntry.error = 'Could not extract file/line or no Gemini API key';
      continue;
    }

    const filePath = findFileInRepo(baseDir, first.file) || first.file;
    const fileContent = getFileContent(baseDir, filePath);
    let patchText;
    try {
      patchText = await getGeminiPatch(apiKey, {
        filePath: first.file,
        line: first.line,
        bugType: first.bugType,
        rawSnippet: first.rawSnippet,
        fileContent,
      });
    } catch (geminiErr) {
      timelineEntry.error = geminiErr.message || 'Gemini request failed';
      continue;
    }

    const applied = applyPatch(baseDir, filePath, patchText);
    if (!applied) {
      timelineEntry.error = 'Patch could not be applied';
      continue;
    }

    const verifierResult = await verify(baseDir);
    const fixStatus = verifierResult.passed ? 'Fixed' : 'Failed';
    results.fixes.push({
      file: filePath,
      bugType: first.bugType,
      line: first.line,
      commitMessage: `[AI-AGENT] Fix: ${first.bugType} in ${filePath}`,
      status: fixStatus,
    });
    if (verifierResult.passed) results.totalFixes++;

    const commitMsg = `[AI-AGENT] Fix: ${first.bugType} at ${filePath}:${first.line || '?'}`;
    try {
      await git.add(filePath);
      await git.commit(commitMsg);
    } catch (_) {
      timelineEntry.error = 'Commit failed';
    }
  }

  const timeTakenMs = Date.now() - startTime;
  results.timeTaken = `${(timeTakenMs / 1000).toFixed(2)}s`;
  results.status = allPassed ? 'PASSED' : 'FAILED';
  results.score = computeScore(timeTakenMs, results.fixes.length);

  try {
    await git.push('origin', branchName);
  } catch (_) {
    results.pushFailed = true;
  }

  try {
    fs.writeFileSync(
      path.join(baseDir, 'results.json'),
      JSON.stringify(results, null, 2),
      'utf8'
    );
  } catch (_) {}

  try {
    fs.rmSync(baseDir, { recursive: true, force: true });
  } catch (_) {}

  return results;
}

module.exports = { runAgent, RETRY_LIMIT };
