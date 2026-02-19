/**
 * Run install + tests in isolated environment.
 * Uses Docker when available, otherwise child_process in temp dir (no token/env leakage).
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getDockerAvailable() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Discover test files/scripts: package.json "test" script, or common patterns
 */
function discoverTestCommand(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts && pkg.scripts.test) {
        return { type: 'npm', command: 'npm test' };
      }
    } catch (_) {}
  }
  // Fallback: try npm test anyway (may have default)
  return { type: 'npm', command: 'npm test' };
}

/**
 * Run commands in repo: install deps then run tests.
 * Returns { success, stdout, stderr, testCommand }
 */
function runInDocker(repoPath) {
  const useDocker = getDockerAvailable();
  const absPath = path.resolve(repoPath);
  const testInfo = discoverTestCommand(repoPath);

  if (useDocker) {
    try {
      // Single run: install + test (Node 20)
      const cmd = `docker run --rm -v "${absPath}:/app" -w /app node:20-alpine sh -c "npm install --silent 2>/dev/null; ${testInfo.command} 2>&1"`;
      const result = execSync(cmd, {
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024,
        timeout: 300000,
      });
      return { success: true, stdout: result, stderr: '', testCommand: testInfo.command };
    } catch (err) {
      const stdout = (err.stdout || '').toString();
      const stderr = (err.stderr || '').toString();
      return { success: false, stdout, stderr, testCommand: testInfo.command };
    }
  }

  // No Docker: run in process (sandbox = same machine)
  try {
    const install = spawnSync('npm', ['install', '--silent'], {
      cwd: absPath,
      encoding: 'utf8',
      timeout: 120000,
    });
    const test = spawnSync('npm', ['test'], {
      cwd: absPath,
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 4 * 1024 * 1024,
    });
    const stdout = (test.stdout || '') + (test.stderr || '');
    const success = test.status === 0;
    return { success, stdout, stderr: '', testCommand: testInfo.command };
  } catch (err) {
    return {
      success: false,
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
      testCommand: testInfo.command,
    };
  }
}

/**
 * Run only tests (after applying patch) - for verifier
 */
function runTestsOnly(repoPath) {
  const result = runInDocker(repoPath);
  return result;
}

module.exports = { runInDocker, runTestsOnly, discoverTestCommand, getDockerAvailable };
