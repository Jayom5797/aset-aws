/**
 * Shared arXiv API ingestion library for domain expansion
 * All domain scripts use this — zero duplication
 *
 * KEY FIX: Query by category only, not keyword+category combo.
 * arXiv API silently returns 0 results for complex boolean queries.
 * Category-only pagination is reliable and yields maximum papers.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOPICS_DIR = path.join(__dirname, '../../database/topics');
const RATE_LIMIT_MS = 350; // ~3 req/sec, safe under arXiv limit
const PAPERS_PER_REQUEST = 100;

/**
 * Fetch a page of papers from arXiv API by category only
 */
function fetchArxiv(categories, start = 0) {
  return new Promise((resolve, reject) => {
    const catFilter = categories.map(c => `cat:${c}`).join('+OR+');
    const url = `/api/query?search_query=${catFilter}&start=${start}&max_results=${PAPERS_PER_REQUEST}&sortBy=submittedDate&sortOrder=descending`;

    const options = {
      hostname: 'export.arxiv.org',
      path: url,
      method: 'GET',
      headers: { 'User-Agent': 'ASET-Domain-Ingestor/1.0' }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

/**
 * Parse arXiv Atom XML response into paper objects
 */
function parseArxivXML(xml) {
  const papers = [];
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

  for (const entry of entries) {
    try {
      const id = (entry.match(/<id>https?:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/) || [])[1];
      if (!id) continue;

      const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]
        ?.replace(/\s+/g, ' ').trim();

      const abstract = (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]
        ?.replace(/\s+/g, ' ').trim();

      const published = (entry.match(/<published>([\s\S]*?)<\/published>/) || [])[1];
      const year = published ? parseInt(published.substring(0, 4)) : null;

      const authorMatches = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g) || [];
      const authors = authorMatches
        .map(a => (a.match(/<name>([\s\S]*?)<\/name>/) || [])[1]?.trim())
        .filter(Boolean)
        .join(', ');

      const doiMatch = entry.match(/arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/i) ||
                       entry.match(/doi\.org\/([^<\s"]+)/);
      const doi = doiMatch ? doiMatch[1].trim() : null;

      if (title && abstract) {
        papers.push({
          type: 'paper',
          title,
          authors,
          arxiv: id.trim(),
          doi,
          journal: 'arXiv preprint',
          publicationDate: published || null,
          year,
          citationCount: 0,
          abstract,
          url: `https://arxiv.org/abs/${id.trim()}`
        });
      }
    } catch (e) {
      // skip malformed entry
    }
  }

  return papers;
}

/**
 * Classify a paper into topic/subtopic using pattern maps
 */
function classifyPaper(title, abstract, topicPatterns, subtopicPatterns, defaultTopic) {
  const text = `${title} ${abstract || ''}`;

  let bestTopic = defaultTopic;
  let maxScore = 0;

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    const score = matches ? matches.length : 0;
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  let bestSubtopic = 'Other';
  for (const [subtopic, pattern] of Object.entries(subtopicPatterns[bestTopic] || {})) {
    if (new RegExp(pattern, 'i').test(text)) {
      bestSubtopic = subtopic;
      break;
    }
  }

  return { topic: bestTopic, subtopic: bestSubtopic };
}

/**
 * Save papers to the database/topics structure
 * Matches exact format of existing space science data
 */
function savePapers(papersByTopicSubtopic, domainName) {
  let totalSaved = 0;

  for (const [topicName, subtopics] of Object.entries(papersByTopicSubtopic)) {
    const topicSlug = topicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const topicDir = path.join(TOPICS_DIR, topicSlug);

    if (!fs.existsSync(topicDir)) {
      fs.mkdirSync(topicDir, { recursive: true });
    }

    const subtopicFiles = [];

    for (const [subtopicName, papers] of Object.entries(subtopics)) {
      const subtopicSlug = subtopicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const subtopicFile = path.join(topicDir, `${subtopicSlug}.json`);
      subtopicFiles.push(`${subtopicSlug}.json`);

      // Load existing if present (incremental ingestion support)
      let existing = { topic: topicName, subtopic: subtopicName, keywords: [], sources: [] };
      if (fs.existsSync(subtopicFile)) {
        existing = JSON.parse(fs.readFileSync(subtopicFile, 'utf8'));
      }

      // Deduplicate by arxiv ID
      const existingIds = new Set(existing.sources.map(s => s.arxiv).filter(Boolean));
      const newPapers = papers.filter(p => !existingIds.has(p.arxiv));

      existing.sources.push(...newPapers);
      totalSaved += newPapers.length;

      fs.writeFileSync(subtopicFile, JSON.stringify(existing, null, 2));
    }

    // Write _topic.json
    const topicMeta = {
      topic: topicName,
      totalPapers: Object.values(subtopics).reduce((s, p) => s + p.length, 0),
      subtopicCount: subtopicFiles.length,
      subtopicFiles,
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(topicDir, '_topic.json'), JSON.stringify(topicMeta, null, 2));

    console.log(`  [${domainName}] Saved: ${topicName} (${subtopicFiles.length} subtopics)`);
  }

  return totalSaved;
}

/**
 * Main ingestion runner — called by each domain script
 * Paginates by category for maximum yield. No keyword filtering at API level.
 */
async function ingestDomain({ domainName, categories, topicPatterns, subtopicPatterns, defaultTopic, targetTotal = 5000 }) {
  console.log(`\n=== [${domainName}] Starting ingestion ===`);
  console.log(`  Categories: ${categories.join(', ')}`);
  console.log(`  Target: ${targetTotal} papers\n`);

  const papersByTopicSubtopic = {};
  let totalFetched = 0;
  let totalDupes = 0;
  const seenIds = new Set();
  let start = 0;

  while (totalFetched < targetTotal) {
    try {
      const xml = await fetchArxiv(categories, start);
      const papers = parseArxivXML(xml);

      if (papers.length === 0) {
        console.log(`\n  [${domainName}] No more papers at offset ${start}`);
        break;
      }

      for (const paper of papers) {
        if (seenIds.has(paper.arxiv)) { totalDupes++; continue; }
        seenIds.add(paper.arxiv);

        const { topic, subtopic } = classifyPaper(
          paper.title, paper.abstract,
          topicPatterns, subtopicPatterns, defaultTopic
        );

        if (!papersByTopicSubtopic[topic]) papersByTopicSubtopic[topic] = {};
        if (!papersByTopicSubtopic[topic][subtopic]) papersByTopicSubtopic[topic][subtopic] = [];
        papersByTopicSubtopic[topic][subtopic].push(paper);
        totalFetched++;
      }

      start += PAPERS_PER_REQUEST;
      process.stdout.write(`  [${domainName}] Fetched: ${totalFetched}/${targetTotal} (offset: ${start})\r`);

      if (papers.length < PAPERS_PER_REQUEST) {
        console.log(`\n  [${domainName}] Reached end of category results`);
        break;
      }

      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));

    } catch (err) {
      if (err.message === 'TIMEOUT') {
        console.log(`\n  [${domainName}] Timeout, retrying in 5s...`);
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error(`\n  [${domainName}] Error: ${err.message}`);
        break;
      }
    }
  }

  console.log(`\n  [${domainName}] Fetched: ${totalFetched} unique (${totalDupes} dupes skipped)`);
  console.log(`  [${domainName}] Saving to database/topics/...`);

  const saved = savePapers(papersByTopicSubtopic, domainName);
  console.log(`  [${domainName}] ✓ Complete — ${saved} new papers saved\n`);
  return { domain: domainName, total: totalFetched, saved };
}

module.exports = { ingestDomain };
