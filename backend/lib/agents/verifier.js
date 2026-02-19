/**
 * Verifier Agent: re-run tests and confirm pass/fail
 */

const { runTestsOnly } = require('../dockerRunner');

async function verify(repoPath) {
  const result = runTestsOnly(repoPath);
  return {
    passed: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

module.exports = { verify };
