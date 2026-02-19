/**
 * Apply minimal patch from Gemini (unified diff or "REPLACE line X" style)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse simple unified diff (single file) and return edits { start, end, newLines }
 */
function parseUnifiedDiff(diffText) {
  const edits = [];
  const lines = diffText.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunkMatch) {
      const startLine = parseInt(hunkMatch[1], 10);
      const count = hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1;
      const newLines = [];
      i++;
      while (i < lines.length) {
        const l = lines[i];
        if (l.startsWith('---') || l.startsWith('+++')) {
          i++;
          continue;
        }
        if (l.startsWith('@@')) break;
        if (l.startsWith('+') && !l.startsWith('+++')) {
          newLines.push(l.slice(1));
        } else if (l.startsWith('-')) {
          // removed line - we'll replace range with newLines
        } else if (l.startsWith(' ') || l === '') {
          newLines.push(l.startsWith(' ') ? l.slice(1) : l);
        }
        i++;
      }
      edits.push({ start: startLine, end: startLine + count - 1, newLines });
      continue;
    }
    i++;
  }
  return edits;
}

/**
 * "REPLACE line X with: ..." or "Line X: ..." style
 */
function parseReplaceInstructions(diffText) {
  const edits = [];
  const lineRe = /(?:replace\s+)?line\s+(\d+)\s*(?:with)?:?\s*([\s\S]*?)(?=(?:replace\s+line|\n\n|$)/gi;
  let m;
  while ((m = lineRe.exec(diffText)) !== null) {
    const lineNum = parseInt(m[1], 10);
    let content = m[2].trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    }
    edits.push({
      start: lineNum,
      end: lineNum,
      newLines: content.split('\n'),
    });
  }
  return edits;
}

function applyEditsToContent(content, edits) {
  const lines = content.split('\n');
  // Sort by start line desc so we can apply from bottom up
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  for (const { start, end, newLines } of sorted) {
    const before = lines.slice(0, Math.max(0, start - 1));
    const after = lines.slice(end);
    lines.length = 0;
    lines.push(...before, ...newLines, ...after);
  }
  return lines.join('\n');
}

/**
 * Apply Gemini patch to file at repoPath. Returns true if applied.
 */
function applyPatch(repoPath, filePath, patchText) {
  const fullPath = path.join(repoPath, filePath);
  if (!fs.existsSync(fullPath)) return false;
  let content = fs.readFileSync(fullPath, 'utf8');
  let edits = parseUnifiedDiff(patchText);
  if (edits.length === 0) edits = parseReplaceInstructions(patchText);
  if (edits.length === 0) return false;
  const newContent = applyEditsToContent(content, edits);
  fs.writeFileSync(fullPath, newContent, 'utf8');
  return true;
}

module.exports = { applyPatch, parseUnifiedDiff, parseReplaceInstructions };
