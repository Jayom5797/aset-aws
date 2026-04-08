/**
 * Mode 3: Document Processing Pipeline
 * PDF / DOCX / Image → text → atomic claims → batch verify
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // v1.1.1 — simple function API
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * Extract raw text from uploaded file based on mimetype
 */
async function extractText(filePath, mimetype, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  // PDF
  if (mimetype === 'application/pdf' || ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return { text: data.text, pages: data.numpages, method: 'pdf-parse' };
  }

  // DOCX / DOC
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === '.docx' || ext === '.doc'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value, pages: null, method: 'mammoth' };
  }

  // Images — OCR via Tesseract
  if (
    mimetype.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'].includes(ext)
  ) {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {} // suppress progress logs
    });
    return { text, pages: 1, method: 'tesseract-ocr' };
  }

  // Plain text fallback
  if (mimetype === 'text/plain' || ext === '.txt') {
    const text = fs.readFileSync(filePath, 'utf8');
    return { text, pages: 1, method: 'plaintext' };
  }

  throw new Error(`Unsupported file type: ${mimetype} (${ext})`);
}

/**
 * Split text into atomic factual claims using Groq
 * Returns array of claim strings
 */
async function extractAtomicClaims(text, groqApiKey) {
  const truncated = text.length > 8000 ? text.substring(0, 8000) + '\n[truncated]' : text;

  const KEYS = [groqApiKey, process.env.GROQ_API_KEY_2].filter(Boolean);

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = KEYS[attempt];
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `You are a claim extraction system. Extract all factual, verifiable claims from the provided text.\nRules:\n- Each claim must be a single, atomic, self-contained factual statement\n- Include only claims that can be verified against scientific literature\n- Exclude opinions, questions, and vague statements\n- Maximum 25 claims\n- Return ONLY a JSON array of strings, no other text\nExample output: ["Aspirin reduces fever by inhibiting COX enzymes", "The human genome contains approximately 3 billion base pairs"]` },
            { role: 'user', content: `Extract atomic factual claims from this text:\n\n${truncated}` }
          ],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      if (response.status === 429 && attempt < KEYS.length - 1) {
        console.log(`[Groq] Key ${attempt + 1} rate limited, trying key ${attempt + 2}`);
        continue; // try next key
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error: ${response.status} — ${err}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response from Groq');

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Groq did not return a JSON array');

      const claims = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(claims)) throw new Error('Parsed result is not an array');
      return claims.filter(c => typeof c === 'string' && c.trim().length > 10);

    } catch (err) {
      if (attempt < KEYS.length - 1) continue;
      throw err;
    }
  }

  throw new Error('All Groq API keys exhausted');
}

module.exports = { extractText, extractAtomicClaims };
