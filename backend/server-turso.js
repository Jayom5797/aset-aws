const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
const ClaimVerifier = require('./claim-verifier');
const { hashPassword, verifyPassword, generateToken, authMiddleware } = require('./auth');
const { initOTPTable, createAndSendOTP, verifyOTP } = require('./otp-service');
const { extractText, extractAtomicClaims } = require('./document-processor');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claim Verifier with dual AI provider (Bedrock + Groq fallback)
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq'; // 'bedrock' or 'groq'
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

if (!GROQ_API_KEY && AI_PROVIDER === 'groq') {
  console.warn('⚠️  GROQ_API_KEY not set - claim verification may fail');
}

const verifier = new ClaimVerifier({
  provider: AI_PROVIDER,
  groqApiKey: GROQ_API_KEY,
  bedrockRegion: AWS_REGION
});

console.log(`✅ Claim verifier initialized (Primary: ${AI_PROVIDER.toUpperCase()}, Fallback: ${AI_PROVIDER === 'bedrock' ? 'Groq' : 'Bedrock'})`);

// Database client - supports both local SQLite (AWS) and Turso (development)
const DATABASE_PATH = process.env.DATABASE_PATH;
const TURSO_URL = process.env.TURSO_DATABASE_URL;

const db = createClient({
  url: DATABASE_PATH ? `file:${DATABASE_PATH}` : TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  intMode: 'number'
});

console.log(`✅ Database initialized: ${DATABASE_PATH ? 'Local SQLite' : 'Turso (remote)'}`);

// Middleware
app.use(cors({
  origin: [
    'https://d3tdxezxcen5k0.cloudfront.net',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
// Static frontend removed - served separately via Vite (ASET frontend)

// Simple health check (fast response for Railway)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Initialize database tables for auth and chat history
async function initAuthTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        chat_id TEXT NOT NULL,
        chat_name TEXT,
        messages TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // OTP table for password reset
    await initOTPTable(db);
    
    console.log('✅ Auth tables initialized');
  } catch (error) {
    console.error('Error initializing auth tables:', error);
  }
}

initAuthTables();

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const passwordHash = await hashPassword(password);
    
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      args: [email, passwordHash, name || null]
    });
    
    const userId = Number(result.lastInsertRowid);
    const token = generateToken(userId, email);
    
    res.json({
      success: true,
      token,
      user: { id: userId, email, name }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await verifyPassword(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.email);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile name
app.post('/api/auth/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    await db.execute({ sql: 'UPDATE users SET name = ? WHERE id = ?', args: [name, req.user.userId] });
    res.json({ success: true, user: { id: req.user.userId, email: req.user.email, name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await db.execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [req.user.userId] });
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const valid = await verifyPassword(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const newHash = await hashPassword(newPassword);
    await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [newHash, req.user.userId] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Reset — Step 1: Request OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Check user exists
    const result = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (result.rows.length === 0) {
      // Don't reveal if email exists — security best practice
      return res.json({ success: true, message: 'If that email exists, a code was sent' });
    }

    await createAndSendOTP(db, email);
    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('[ForgotPassword]', error.message);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Password Reset — Step 2: Verify OTP + set new password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { valid, reason } = await verifyOTP(db, email, otp);
    if (!valid) return res.status(400).json({ error: reason || 'Invalid or expired code' });

    const passwordHash = await hashPassword(newPassword);
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
      args: [passwordHash, email]
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('[ResetPassword]', error.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get user chat history
app.get('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, chat_id, chat_name, created_at, updated_at FROM chat_history WHERE user_id = ? ORDER BY updated_at DESC',
      args: [req.user.userId]
    });
    
    res.json({ success: true, chats: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save chat
app.post('/api/chat/save', authMiddleware, async (req, res) => {
  try {
    const { chatId, chatName, messages } = req.body;
    
    const messagesJson = JSON.stringify(messages);
    
    // Check if chat exists
    const existing = await db.execute({
      sql: 'SELECT id FROM chat_history WHERE user_id = ? AND chat_id = ?',
      args: [req.user.userId, chatId]
    });
    
    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: 'UPDATE chat_history SET chat_name = ?, messages = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND chat_id = ?',
        args: [chatName, messagesJson, req.user.userId, chatId]
      });
    } else {
      // Insert new
      await db.execute({
        sql: 'INSERT INTO chat_history (user_id, chat_id, chat_name, messages) VALUES (?, ?, ?, ?)',
        args: [req.user.userId, chatId, chatName, messagesJson]
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load chat messages
app.get('/api/chat/:chatId', authMiddleware, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT messages, chat_name FROM chat_history WHERE user_id = ? AND chat_id = ?',
      args: [req.user.userId, req.params.chatId]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const chat = result.rows[0];
    res.json({
      success: true,
      messages: JSON.parse(chat.messages),
      chatName: chat.chat_name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chat
app.delete('/api/chat/:chatId', authMiddleware, async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM chat_history WHERE user_id = ? AND chat_id = ?',
      args: [req.user.userId, req.params.chatId]
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detailed health check with database stats
app.get('/health/detailed', async (req, res) => {
  try {
    const result = await db.execute('SELECT COUNT(*) as count FROM papers');
    
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      papers: result.rows[0].count,
      database: DATABASE_PATH ? 'local-sqlite' : 'turso'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Get all topics with counts
app.get('/api/topics', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT 
        topic,
        subtopic,
        COUNT(*) as count
      FROM papers
      GROUP BY topic, subtopic
      ORDER BY topic, subtopic
    `);
    
    // Group by topic
    const topics = {};
    for (const row of result.rows) {
      if (!topics[row.topic]) {
        topics[row.topic] = {
          name: row.topic,
          subtopics: []
        };
      }
      topics[row.topic].subtopics.push({
        name: row.subtopic,
        count: row.count
      });
    }
    
    res.json(Object.values(topics));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search papers
app.get('/api/search', async (req, res) => {
  try {
    const { query, topic, subtopic, year_min, year_max, limit = 50 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    // Sanitize query for FTS - remove special characters that cause issues
    // FTS special chars: " * ? ( ) [ ] { } : ^ $ | \ 
    const sanitizedQuery = query
      .replace(/[?*"()[\]{}:^$|\\]/g, ' ')  // Replace special chars with space
      .replace(/\s+/g, ' ')  // Collapse multiple spaces
      .trim();
    
    if (!sanitizedQuery) {
      return res.status(400).json({ error: 'Invalid query after sanitization' });
    }
    
    let sql = `
      SELECT 
        p.id,
        p.title,
        p.abstract,
        p.authors,
        p.year,
        p.topic,
        p.subtopic,
        p.keywords
      FROM papers_fts
      JOIN papers p ON papers_fts.rowid = p.rowid
      WHERE papers_fts MATCH ?
    `;
    
    const params = [sanitizedQuery];
    
    if (topic) {
      sql += ' AND p.topic = ?';
      params.push(topic);
    }
    
    if (subtopic) {
      sql += ' AND p.subtopic = ?';
      params.push(subtopic);
    }
    
    if (year_min) {
      sql += ' AND p.year >= ?';
      params.push(parseInt(year_min));
    }
    
    if (year_max) {
      sql += ' AND p.year <= ?';
      params.push(parseInt(year_max));
    }
    
    sql += ` ORDER BY rank LIMIT ?`;
    params.push(parseInt(limit));
    
    const result = await db.execute({ sql, args: params });
    
    // Parse JSON fields
    const papers = result.rows.map(row => ({
      ...row,
      authors: JSON.parse(row.authors || '[]'),
      keywords: JSON.parse(row.keywords || '[]')
    }));
    
    res.json({
      query,
      count: papers.length,
      papers
    });
  } catch (error) {
    console.error('[Search] Error:', error.message);
    console.error('[Search] Query:', req.query.query);
    res.status(500).json({ error: error.message });
  }
});

// Get papers by topic/subtopic
app.get('/api/papers/:topic/:subtopic', async (req, res) => {
  try {
    const { topic, subtopic } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await db.execute({
      sql: `
        SELECT 
          id, title, abstract, authors, year, keywords
        FROM papers
        WHERE topic = ? AND subtopic = ?
        ORDER BY year DESC
        LIMIT ? OFFSET ?
      `,
      args: [topic, subtopic, parseInt(limit), parseInt(offset)]
    });
    
    const papers = result.rows.map(row => ({
      ...row,
      authors: JSON.parse(row.authors || '[]'),
      keywords: JSON.parse(row.keywords || '[]')
    }));
    
    res.json({
      topic,
      subtopic,
      count: papers.length,
      papers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [total, topics, years] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM papers'),
      db.execute('SELECT COUNT(DISTINCT topic) as count FROM papers'),
      db.execute('SELECT MIN(year) as min, MAX(year) as max FROM papers WHERE year IS NOT NULL')
    ]);
    
    res.json({
      totalPapers: total.rows[0].count,
      totalTopics: topics.rows[0].count,
      yearRange: {
        min: years.rows[0].min,
        max: years.rows[0].max
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get paper by ID
app.get('/api/paper/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute({
      sql: 'SELECT * FROM papers WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    const paper = {
      ...result.rows[0],
      authors: JSON.parse(result.rows[0].authors || '[]'),
      keywords: JSON.parse(result.rows[0].keywords || '[]')
    };
    
    res.json(paper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate relevance score for a paper
function calculateRelevance(paper, keywords, ftsRank) {
  let score = 0;
  
  // FTS rank contribution (0-5 points, lower rank = higher score)
  const rankScore = Math.max(0, 5 - (ftsRank * 0.1));
  score += rankScore;
  
  // Keyword matches in title (0-3 points)
  const titleLower = (paper.title || '').toLowerCase();
  const titleMatches = keywords.filter(kw => titleLower.includes(kw)).length;
  score += Math.min(3, titleMatches * 0.5);
  
  // Keyword matches in abstract (0-2 points)
  const abstractLower = (paper.abstract || '').toLowerCase();
  const abstractMatches = keywords.filter(kw => abstractLower.includes(kw)).length;
  score += Math.min(2, abstractMatches * 0.3);
  
  // Normalize to 1-10 scale
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

// Legacy endpoint for frontend compatibility with relevance scoring and filters
app.post('/api/get-sources', async (req, res) => {
  try {
    const { 
      claim, 
      limit = 50, 
      offset = 0,
      filters = {} 
    } = req.body;
    
    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input. Provide a claim string.' 
      });
    }
    
    const startTime = Date.now();
    
    // Extract keywords from claim
    const words = claim.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'have', 'been', 'were', 'are', 'for', 'can', 'will', 'but', 'not', 'was', 'has', 'its', 'are', 'also']);
    const keywords = words.filter(word => !stopWords.has(word));

    // Domain detection — route to correct topic area before global FTS
    const domainSignals = {
      'natural-language-processing': /\b(nlp|bert|gpt|transformer|language model|text classification|sentiment|translation|tokeniz|llm|chatgpt|embedding)\b/i,
      'artificial-intelligence': /\b(machine learning|deep learning|neural network|reinforcement learning|generative|diffusion model|gan|cnn|lstm|attention mechanism)\b/i,
      'computer-vision': /\b(image recognition|object detection|segmentation|convolutional|yolo|resnet|vision transformer|opencv)\b/i,
      'genetics-and-genomics': /\b(crispr|gene editing|genome|dna|rna|sequencing|mutation|chromosome|allele|snp|mrna|pcr|epigenetic)\b/i,
      'oncology': /\b(cancer|tumor|carcinoma|chemotherapy|immunotherapy|metastasis|oncology|malignant|biopsy|leukemia|lymphoma)\b/i,
      'cardiology': /\b(heart|cardiac|cardiovascular|myocardial|arrhythmia|hypertension|coronary|stroke|ecg|atrial fibrillation)\b/i,
      'quantum-physics': /\b(quantum|qubit|entanglement|superposition|wave function|decoherence|quantum computing|bell inequality)\b/i,
      'robotics': /\b(robot|autonomous vehicle|slam|navigation|manipulation|drone|uav|path planning|kinematics|actuator)\b/i,
      'pharmacology': /\b(drug|pharmacology|clinical trial|efficacy|dosage|pharmacokinetic|therapeutic|placebo|side effect|medication)\b/i,
      'molecular-biology': /\b(protein|enzyme|folding|ribosome|transcription|translation|amino acid|peptide|antibody|receptor)\b/i,
      'neuroscience': /\b(brain|neuron|synapse|cortex|amygdala|hippocampus|cerebellum|brain stem|dopamine|serotonin|neural|cognitive|memory|alzheimer|parkinson|epilepsy|neurotransmitter)\b/i,
      'evolutionary-biology': /\b(evolution|natural selection|species|phylogen|darwin|adaptation|mutation rate|fossil|extinction)\b/i,
      'microbiology': /\b(bacteria|virus|pathogen|antibiotic|infection|microbiome|fungus|parasite|vaccine|immunity|covid|influenza)\b/i,
      'physical-chemistry': /\b(thermodynamic|entropy|reaction|catalyst|molecule|bond|spectroscopy|polymer|nanomaterial|crystal)\b/i,
      'condensed-matter-physics': /\b(superconductor|semiconductor|transistor|band gap|ferromagnet|topological|phase transition|crystal lattice)\b/i,
      'nuclear-physics': /\b(nuclear|fission|fusion|radioactive|neutron|proton|isotope|radiation|reactor|uranium)\b/i,
      'signal-processing': /\b(signal|filter|fourier|wavelet|noise|compression|modulation|antenna|radar|communication)\b/i,
      'control-systems': /\b(control system|feedback|pid|stability|transfer function|state space|optimal control|mpc)\b/i,
      'epidemiology': /\b(epidemiology|prevalence|incidence|mortality|cohort|risk factor|pandemic|outbreak|public health)\b/i,
      'mental-health': /\b(depression|anxiety|schizophrenia|bipolar|ptsd|mental health|psychiatric|therapy|antidepressant)\b/i,
      'black-holes': /\b(black hole|event horizon|hawking|singularity|accretion|gravitational collapse|neutron star)\b/i,
      'cosmology': /\b(universe|big bang|dark energy|dark matter|cosmic|inflation|hubble|redshift|cmb)\b/i,
      'exoplanets': /\b(exoplanet|habitable zone|transit|radial velocity|kepler|biosignature|extraterrestrial)\b/i,
    };

    let detectedTopic = null;
    for (const [topic, pattern] of Object.entries(domainSignals)) {
      if (pattern.test(claim)) {
        detectedTopic = topic;
        break;
      }
    }
    
    if (keywords.length === 0) {
      return res.json({
        domain: 'Multi-Domain Science',
        topic: null,
        subtopic: null,
        sources: [],
        totalSources: 0,
        hasMore: false,
        queryTime: Date.now() - startTime,
        message: 'No keywords extracted from claim'
      });
    }
    
    // Build SQL query with filters
    const query = keywords.join(' OR ');
    const fetchLimit = 100; // Reduced from 200 to improve response time
    
    let sql = `
      SELECT 
        p.id,
        p.title,
        p.abstract,
        p.authors,
        p.year,
        p.topic,
        p.subtopic,
        p.keywords,
        p.source
      FROM papers_fts
      JOIN papers p ON papers_fts.rowid = p.rowid
      WHERE papers_fts MATCH ?
    `;
    
    const args = [query];

    // If domain detected, prioritize that topic — prevents space science domination
    if (detectedTopic && !filters.topic) {
      sql += ' AND p.topic = ?';
      args.push(detectedTopic);
    }
    
    // Apply filters
    if (filters.yearMin) {
      sql += ' AND p.year >= ?';
      args.push(parseInt(filters.yearMin));
    }
    
    if (filters.yearMax) {
      sql += ' AND p.year <= ?';
      args.push(parseInt(filters.yearMax));
    }
    
    if (filters.topic) {
      sql += ' AND p.topic = ?';
      args.push(filters.topic);
    }
    
    if (filters.subtopic) {
      sql += ' AND p.subtopic = ?';
      args.push(filters.subtopic);
    }
    
    if (filters.source) {
      sql += ' AND p.source = ?';
      args.push(filters.source);
    }
    
    sql += ' ORDER BY rank LIMIT ?';
    args.push(fetchLimit);
    
    const result = await db.execute({ sql, args });
    
    if (result.rows.length === 0) {
      // No local results — fetch from external sources and grow the database
      console.log(`[get-sources] No local results for: "${claim.substring(0, 60)}" — fetching externally`);
      try {
        const { fetchAndStorePapers } = require('./paper-fetcher');
        const externalPapers = await fetchAndStorePapers(claim, db);

        if (externalPapers.length > 0) {
          // Format external papers for frontend
          const sources = externalPapers.map((p, i) => ({
            type: 'paper',
            title: p.title,
            abstract: p.abstract,
            authors: p.authors || 'Unknown',
            year: p.year,
            paperId: p.id,
            url: p.url,
            publicationDate: p.year ? `${p.year}` : null,
            relevance: Math.max(1, 8 - i), // descending relevance
            source: p.source,
            topic: 'external',
            subtopic: 'fetched'
          }));

          return res.json({
            domain: 'Multi-Domain Science',
            topic: 'external',
            subtopic: 'fetched',
            relevance: keywords.length,
            sources,
            totalSources: sources.length,
            returnedSources: sources.length,
            hasMore: false,
            queryTime: Date.now() - startTime,
            message: `Found ${sources.length} papers from external sources — added to ASET database`,
            externallyFetched: true
          });
        }
      } catch (fetchErr) {
        console.error('[get-sources] External fetch failed:', fetchErr.message);
      }

      return res.json({
        domain: detectedTopic ? detectedTopic.replace(/-/g, ' ') : 'Multi-Domain Science',
        topic: null,
        subtopic: null,
        sources: [],
        totalSources: 0,
        hasMore: false,
        queryTime: Date.now() - startTime,
        message: 'No matching papers found in database or external sources'
      });
    }
    
    // Calculate relevance scores and format for frontend
    const sourcesWithRelevance = result.rows.map((row, index) => {
      let authorsStr = '';
      try {
        const authorsData = JSON.parse(row.authors || '[]');
        authorsStr = Array.isArray(authorsData) ? authorsData.join(', ') : String(authorsData);
      } catch {
        authorsStr = row.authors || 'Unknown';
      }
      
      const relevance = calculateRelevance(row, keywords, index);
      const source = row.source || 'arxiv';
      
      // Generate correct URL based on source
      let url, paperId;
      if (source === 'nasa-ads') {
        // NASA ADS bibcode - encode & as %26 for URL
        paperId = row.id;
        url = `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(row.id)}/abstract`;
      } else {
        // arXiv ID
        paperId = row.id;
        url = `https://arxiv.org/abs/${row.id}`;
      }
      
      return {
        type: 'paper',
        title: row.title,
        abstract: row.abstract,
        authors: authorsStr,
        year: row.year,
        paperId: paperId,
        url: url,
        publicationDate: row.year ? `${row.year}` : null,
        relevance: relevance,
        source: source,
        topic: row.topic,
        subtopic: row.subtopic
      };
    });
    
    // Sort by relevance score (highest first)
    sourcesWithRelevance.sort((a, b) => b.relevance - a.relevance);
    
    // Apply relevance filter if specified
    let filteredSources = sourcesWithRelevance;
    if (filters.minRelevance) {
      const minRel = parseFloat(filters.minRelevance);
      filteredSources = sourcesWithRelevance.filter(s => s.relevance >= minRel);
    }
    
    // Paginate results
    const paginatedSources = filteredSources.slice(offset, offset + limit);
    const hasMore = offset + limit < filteredSources.length;
    
    // Get most common topic from results
    const topicCounts = {};
    result.rows.forEach(row => {
      topicCounts[row.topic] = (topicCounts[row.topic] || 0) + 1;
    });
    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Get most common subtopic
    const subtopicCounts = {};
    result.rows.forEach(row => {
      if (row.topic === topTopic[0]) {
        subtopicCounts[row.subtopic] = (subtopicCounts[row.subtopic] || 0) + 1;
      }
    });
    const topSubtopic = Object.entries(subtopicCounts).sort((a, b) => b[1] - a[1])[0];
    
    res.json({
      domain: detectedTopic ? detectedTopic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Multi-Domain Science',
      topic: topTopic[0],
      subtopic: topSubtopic[0],
      relevance: keywords.length,
      sources: paginatedSources,
      totalSources: filteredSources.length,
      returnedSources: paginatedSources.length,
      hasMore: hasMore,
      queryTime: Date.now() - startTime,
      message: `Found ${sourcesWithRelevance.length} source(s) in ${topTopic[0]} → ${topSubtopic[0]}`
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available filter options (hardcoded for performance)
app.get('/api/filters', async (req, res) => {
  try {
    // Hardcoded topics - these don't change often
    const topics = {
      "black-holes": ["mass-limits", "formation", "detection", "other"],
      "neutron-stars": ["mass-limits", "equation-of-state", "pulsars", "other"],
      "exoplanets": ["detection", "atmospheres", "habitability", "other"],
      "dark-matter-and-dark-energy": ["observations", "theory", "simulations", "other"],
      "galaxies": ["formation", "evolution", "structure", "other"],
      "cosmology": ["cmb", "large-scale-structure", "inflation", "other"],
      "stellar-astrophysics": ["evolution", "nucleosynthesis", "binaries", "other"],
      "star-formation": ["molecular-clouds", "protostars", "disks", "other"],
      "solar-physics": ["solar-activity", "corona", "solar-wind", "other"],
      "planetary-science": ["surfaces", "interiors", "atmospheres", "other"],
      "small-bodies": ["asteroids", "comets", "kuiper-belt", "other"],
      "high-energy-astrophysics": ["x-rays", "gamma-rays", "cosmic-rays", "other"],
      "gravitational-waves": ["detection", "sources", "data-analysis", "other"],
      "instrumentation-and-methods": ["telescopes", "detectors", "data-processing", "other"]
    };
    
    res.json({
      topics: topics,
      yearRange: {
        min: 1992,
        max: 2025
      },
      sources: [
        { value: 'arxiv', label: 'arXiv', count: 781980 },
        { value: 'nasa-ads', label: 'NASA ADS', count: 190345 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Add paper
app.post('/api/admin/add-paper', async (req, res) => {
  try {
    const { paperId, topic, subtopic = 'other', source } = req.body;
    
    if (!paperId || !topic) {
      return res.status(400).json({ error: 'paperId and topic are required' });
    }
    
    // Check if paper already exists in staging DB
    const existing = await db.execute({
      sql: 'SELECT id FROM papers WHERE id = ?',
      args: [paperId]
    });
    
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Paper already exists in database' });
    }
    
    // Detect source from paper ID format
    let detectedSource = source;
    if (!detectedSource) {
      // arXiv format: YYMM.NNNNN or archive/YYMMNNN
      // NASA ADS format: YYYYJournal...Volume..Page (contains letters and dots)
      detectedSource = /^(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})$/i.test(paperId) ? 'arxiv' : 'nasa-ads';
    }
    
    // Fetch paper metadata based on source
    let paperData;
    if (detectedSource === 'arxiv') {
      paperData = await fetchArxivMetadata(paperId);
    } else {
      paperData = await fetchNASAADSMetadata(paperId);
    }
    
    if (!paperData) {
      return res.status(404).json({ error: 'Paper not found in source database' });
    }
    
    // Insert paper into staging database
    await db.execute({
      sql: `
        INSERT INTO papers (id, title, abstract, authors, year, topic, subtopic, keywords, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        paperId,
        paperData.title,
        paperData.abstract,
        JSON.stringify(paperData.authors),
        paperData.year,
        topic,
        subtopic,
        JSON.stringify(paperData.keywords || []),
        detectedSource
      ]
    });
    
    res.json({
      success: true,
      message: 'Paper added successfully',
      paper: {
        id: paperId,
        title: paperData.title,
        source: detectedSource,
        topic,
        subtopic
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Get recent papers
app.get('/api/admin/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await db.execute({
      sql: `
        SELECT id, title, topic, subtopic, source, year
        FROM papers
        ORDER BY rowid DESC
        LIMIT ?
      `,
      args: [parseInt(limit)]
    });
    
    res.json({
      papers: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Get statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [total] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM papers')
    ]);
    
    res.json({
      totalPapers: total.rows[0].count,
      todayAdded: 0, // TODO: Track additions with timestamp
      activeUsers: 1  // TODO: Track active sessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Fetch arXiv metadata
async function fetchArxivMetadata(arxivId) {
  try {
    const response = await fetch(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
    const xml = await response.text();
    
    // Check if paper exists (look for entry tag)
    if (!xml.includes('<entry>')) {
      return null;
    }
    
    // Extract entry content (skip feed-level title)
    const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entryMatch) {
      return null;
    }
    
    const entry = entryMatch[1];
    
    // Parse entry fields
    const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
    const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/s);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const authorsMatch = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
    
    if (!titleMatch) {
      return null;
    }
    
    const authors = authorsMatch 
      ? authorsMatch.map(a => a.match(/<name>(.*?)<\/name>/)[1].trim())
      : [];
    
    const year = publishedMatch 
      ? parseInt(publishedMatch[1].substring(0, 4))
      : null;
    
    return {
      title: titleMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
      abstract: summaryMatch ? summaryMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ') : '',
      authors,
      year,
      keywords: []
    };
  } catch (error) {
    console.error('Error fetching arXiv metadata:', error);
    return null;
  }
}

// Helper: Fetch NASA ADS metadata
async function fetchNASAADSMetadata(bibcode) {
  try {
    const apiKey = process.env.NASA_ADS_API_KEY;
    if (!apiKey) {
      throw new Error('NASA_ADS_API_KEY not configured');
    }
    
    const response = await fetch(`https://api.adsabs.harvard.edu/v1/search/query?q=bibcode:${encodeURIComponent(bibcode)}&fl=title,abstract,author,year,keyword`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    
    if (!data.response || data.response.numFound === 0) {
      return null;
    }
    
    const doc = data.response.docs[0];
    
    return {
      title: doc.title ? doc.title[0] : '',
      abstract: doc.abstract || '',
      authors: doc.author || [],
      year: doc.year || null,
      keywords: doc.keyword || []
    };
  } catch (error) {
    console.error('Error fetching NASA ADS metadata:', error);
    return null;
  }
}

// Claim Verification Endpoint (Module 3 - Groq)
app.post('/api/verify-claim', async (req, res) => {
  if (!verifier) {
    return res.status(503).json({ 
      error: 'Claim verification not available - GROQ_API_KEY not configured' 
    });
  }

  try {
    const { claim, papers, maxPapers = 5 } = req.body;

    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ error: 'Claim is required' });
    }

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Papers array is required' });
    }

    console.log(`[Verification] Starting for claim: "${claim}" with ${papers.length} papers`);

    const result = await verifier.verifyClaim(claim, papers, {
      maxPapers,
      batchSize: 10,
      onProgress: (progress) => {
        console.log(`[Verification] ${progress.stage}: ${progress.current}/${progress.total}`);
      }
    });

    console.log(`[Verification] Completed in ${result.processingTimeMs}ms - Score: ${result.verificationScore}%`);

    res.json(result);
  } catch (error) {
    console.error('[Verification] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── File Upload Config (Mode 3) ────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff'
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// ─── Mode 3: Document Upload → Claims → Verify ──────────────────────────────
app.post('/api/process-document', upload.single('file'), async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    console.log(`[Mode3] Processing: ${req.file.originalname} (${req.file.mimetype})`);

    // Step 1: Extract text
    const { text, pages, method } = await extractText(
      filePath,
      req.file.mimetype,
      req.file.originalname
    );

    if (!text || text.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract meaningful text from file' });
    }

    console.log(`[Mode3] Extracted ${text.length} chars via ${method}`);

    // Step 2: Extract atomic claims via Groq
    const claims = await extractAtomicClaims(text, process.env.GROQ_API_KEY);

    if (!claims.length) {
      return res.status(422).json({ error: 'No verifiable claims found in document' });
    }

    console.log(`[Mode3] Extracted ${claims.length} claims`);

    // Step 3: Get sources for each claim from DB
    const claimResults = await Promise.all(claims.map(async (claim) => {
      try {
        const words = claim.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const stopWords = new Set(['the','and','that','this','with','from','have','been','were','are','for','can','will','but','not','was','has']);
        const keywords = words.filter(w => !stopWords.has(w));
        if (!keywords.length) return { claim, sources: [], error: 'no keywords' };

        const query = keywords.slice(0, 8).join(' OR ');
        const result = await db.execute({
          sql: `SELECT p.id, p.title, p.abstract, p.authors, p.year, p.topic, p.subtopic, p.source
                FROM papers_fts
                JOIN papers p ON papers_fts.rowid = p.rowid
                WHERE papers_fts MATCH ?
                ORDER BY rank LIMIT 5`,
          args: [query]
        });

        return { claim, sources: result.rows };
      } catch (e) {
        return { claim, sources: [], error: e.message };
      }
    }));

    // Step 4: Batch verify all claims with sources via Groq
    const verifiedClaims = await Promise.all(claimResults.map(async ({ claim, sources, error }) => {
      if (error || !sources.length) {
        return {
          claim,
          verdict: 'unverifiable',
          score: 0,
          reason: error || 'No relevant papers found in database',
          sources: []
        };
      }

      try {
        const result = await verifier.verifyClaim(claim, sources, { maxPapers: 5 });
        return {
          claim,
          verdict: result.verdict || 'unverifiable',
          score: result.verificationScore || 0,
          reason: result.summary || '',
          sources: sources.slice(0, 3)
        };
      } catch (e) {
        return {
          claim,
          verdict: 'unverifiable',
          score: 0,
          reason: 'Verification service error — claim may be outside scientific literature scope',
          sources: []
        };
      }
    }));

    // Compute overall trust score
    const scoredClaims = verifiedClaims.filter(c => c.score > 0);
    const overallScore = scoredClaims.length
      ? Math.round(scoredClaims.reduce((s, c) => s + c.score, 0) / scoredClaims.length)
      : 0;

    res.json({
      success: true,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      pages,
      extractionMethod: method,
      totalClaims: claims.length,
      verifiedClaims,
      overallTrustScore: overallScore,
      processingTimeMs: Date.now() - startTime
    });

  } catch (err) {
    console.error('[Mode3] Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// ─── Mode 2: YouTube URL → Transcript → Claims → Verify ─────────────────────
app.post('/api/process-youtube', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return res.status(400).json({ error: 'Valid YouTube URL required' });
  }

  try {
    const startTime = Date.now();

    // Extract video ID — handles all YouTube URL formats including share links with ?si= params
    const videoId = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) return res.status(400).json({ error: 'Could not extract video ID. Use a standard YouTube URL like https://youtube.com/watch?v=...' });

    console.log(`[Mode2] Processing YouTube: ${videoId}`);

    // Fetch transcript using Supadata API — works from any server IP, no OAuth needed
    let text;
    try {
      const supadataKey = process.env.SUPADATA_API_KEY;
      if (!supadataKey) throw new Error('SUPADATA_API_KEY not configured');

      const res = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
        { headers: { 'x-api-key': supadataKey } }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Supadata API error: ${res.status}`);
      }

      const data = await res.json();
      text = data.content || data.text || '';

      if (!text || text.length < 100) {
        return res.status(422).json({ error: 'Transcript too short or unavailable for this video' });
      }

    } catch (transcriptErr) {
      console.error('[Mode2] Transcript error:', transcriptErr.message);
      return res.status(422).json({ error: 'Could not extract transcript: ' + transcriptErr.message });
    }

    console.log(`[Mode2] Transcript: ${text.length} chars`);

    // Reuse same pipeline as Mode 3
    const claims = await extractAtomicClaims(text, process.env.GROQ_API_KEY);

    if (!claims.length) {
      return res.status(422).json({ error: 'No verifiable claims found in transcript' });
    }

    const claimResults = await Promise.all(claims.map(async (claim) => {
      try {
        const words = claim.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const stopWords = new Set(['the','and','that','this','with','from','have','been','were','are','for','can','will','but','not','was','has']);
        const keywords = words.filter(w => !stopWords.has(w));
        if (!keywords.length) return { claim, sources: [] };

        const query = keywords.slice(0, 8).join(' OR ');
        const result = await db.execute({
          sql: `SELECT p.id, p.title, p.abstract, p.authors, p.year, p.topic, p.subtopic, p.source
                FROM papers_fts
                JOIN papers p ON papers_fts.rowid = p.rowid
                WHERE papers_fts MATCH ?
                ORDER BY rank LIMIT 5`,
          args: [query]
        });

        return { claim, sources: result.rows };
      } catch (e) {
        return { claim, sources: [], error: e.message };
      }
    }));

    const verifiedClaims = await Promise.all(claimResults.map(async ({ claim, sources, error }) => {
      if (error || !sources.length) {
        return { claim, verdict: 'unverifiable', score: 0, reason: error || 'No relevant papers found', sources: [] };
      }
      try {
        const result = await verifier.verifyClaim(claim, sources, { maxPapers: 5 });
        return { claim, verdict: result.verdict || 'unverifiable', score: result.verificationScore || 0, reason: result.summary || '', sources: sources.slice(0, 3) };
      } catch (e) {
        return { claim, verdict: 'unverifiable', score: 0, reason: 'Claim may be outside scientific literature scope', sources: [] };
      }
    }));

    const scoredClaims = verifiedClaims.filter(c => c.score > 0);
    const overallScore = scoredClaims.length
      ? Math.round(scoredClaims.reduce((s, c) => s + c.score, 0) / scoredClaims.length)
      : 0;

    res.json({
      success: true,
      videoId,
      url,
      transcriptLength: text.length,
      totalClaims: claims.length,
      verifiedClaims,
      overallTrustScore: overallScore,
      processingTimeMs: Date.now() - startTime
    });

  } catch (err) {
    console.error('[Mode2] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${DATABASE_PATH ? 'Local SQLite' : 'Turso (remote)'}`);
  console.log(`🤖 AI Provider: ${AI_PROVIDER.toUpperCase()} (fallback: ${AI_PROVIDER === 'bedrock' ? 'Groq' : 'Bedrock'})`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/search?query=black+holes\n`);
});
