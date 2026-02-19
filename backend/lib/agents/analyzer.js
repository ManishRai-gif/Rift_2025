/**
 * Analyzer Agent: detect bug type, extract file and line number from test output
 */

const path = require('path');

const BUG_TYPES = [
  'LINTING',
  'SYNTAX',
  'LOGIC',
  'TYPE_ERROR',
  'IMPORT',
  'INDENTATION',
];

// Patterns to extract file path and line number (Jest, Mocha, Node assert, generic)
const FILE_LINE_PATTERNS = [
  /at\s+.*?\s+\(([^)]+):(\d+):\d+\)/g,
  /^\s*at\s+\(([^)]+):(\d+):\d+\)/gm,
  /\(([^)]+):(\d+):(\d+)\)/g,
  /(\S+\.(?:js|ts|jsx|tsx|mjs|cjs)):(\d+)/gi,
  /at\s+(\S+):(\d+)/g,
];

// Keywords to classify bug type
const TYPE_HINTS = {
  SyntaxError: 'SYNTAX',
  'Unexpected token': 'SYNTAX',
  'is not defined': 'LOGIC',
  'Cannot find module': 'IMPORT',
  'Module not found': 'IMPORT',
  'is not a function': 'TYPE_ERROR',
  'is not a constructor': 'TYPE_ERROR',
  'Cannot read propert': 'TYPE_ERROR',
  'Expected': 'LOGIC',
  'Received': 'LOGIC',
  'AssertionError': 'LOGIC',
  'ReferenceError': 'LOGIC',
  'TypeError': 'TYPE_ERROR',
  'IndentationError': 'INDENTATION',
  'indent': 'INDENTATION',
  'ESLint': 'LINTING',
  'Lint': 'LINTING',
};

function extractFileLinePairs(output) {
  const pairs = new Map(); // file -> min line
  const text = (output || '') + '';
  for (const re of FILE_LINE_PATTERNS) {
    let m;
    const regex = new RegExp(re.source, re.flags);
    while ((m = regex.exec(text)) !== null) {
      const file = m[1].trim();
      const line = parseInt(m[2], 10);
      if (!isNaN(line) && line > 0) {
        const key = path.normalize(file).replace(/^.*[\\/]/, '');
        if (!pairs.has(key) || pairs.get(key) > line) pairs.set(key, line);
      }
    }
  }
  return Array.from(pairs.entries()).map(([file, line]) => ({ file, line }));
}

function classifyBugType(output) {
  const text = (output || '').toLowerCase();
  for (const [keyword, type] of Object.entries(TYPE_HINTS)) {
    if (text.includes(keyword.toLowerCase())) return type;
  }
  return 'LOGIC';
}

/**
 * Analyze test failure output. Returns array of { file, line, bugType, rawSnippet }
 */
function analyze(output, repoPath) {
  const pairs = extractFileLinePairs(output);
  const bugType = classifyBugType(output);
  const rawSnippet = (output || '').slice(0, 4000);
  if (pairs.length === 0) {
    return [{ file: null, line: null, bugType, rawSnippet }];
  }
  return pairs.map(({ file, line }) => ({
    file,
    line,
    bugType,
    rawSnippet,
  }));
}

module.exports = { analyze, BUG_TYPES };
