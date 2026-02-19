/**
 * Fixer Agent: call Gemini to generate minimal patch for failing code
 * Patch targets exact failing lines; does not rewrite whole file.
 */

const axios = require('axios');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function getGeminiPatch(apiKey, context) {
  const { filePath, line, bugType, rawSnippet, fileContent } = context;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  const prompt = `You are a code fixer. The test output shows a failure. Provide ONLY a minimal patch.

Bug type: ${bugType}
File: ${filePath}
Failing line (approx): ${line}

Test/error snippet:
\`\`\`
${(rawSnippet || '').slice(0, 3000)}
\`\`\`

Current file content (relevant part around line ${line}):
\`\`\`
${(fileContent || '').slice(0, 6000)}
\`\`\`

Rules:
- Output ONLY a minimal patch: use unified diff format (lines starting with - or +) or explicit "REPLACE line X with: ...".
- Do NOT rewrite the whole file. Change only the minimal lines needed to fix the bug.
- Match the exact test/assertion expectations if shown.
- Keep existing code style and indentation.
- If you use diff format, make it a valid small unified diff for the single file.`;

  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      },
      { timeout: 30000 }
    );

    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned no text');
    }
    return text;
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error('Gemini rate limit exceeded. Please try again later.');
    }
    throw err;
  }
}

module.exports = { getGeminiPatch };
