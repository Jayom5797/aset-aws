/**
 * arXiv OAI-PMH bulk harvest ingestor
 * Used for: Chemistry, Physics, CS, Engineering
 *
 * OAI-PMH is arXiv's OFFICIAL bulk harvest protocol — different endpoint
 * from the search API. Designed for exactly this use case.
 * Endpoint: https://export.arxiv.org/oai2
 * Rate limit: 1 req/20sec (enforced via resumptionToken flow)
 * No IP bans when used correctly with resumptionToken
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOPICS_DIR = path.join(__dirname, '../../database/topics');
const OAI_BASE = 'oaipmh.arxiv.org';
const OAI_PATH = '/oai';
// OAI-PMH requires 20s between requests — this is their stated policy
const RATE_LIMIT_MS = 21000;

function httpsGet(hostname, urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { hostname, path: urlPath, headers: { 'User-Agent': 'ASET-OAI-Harvester/1.0 (mailto:aset@research.org)' } },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

/**
 * Fetch one OAI-PMH page for a set category
 * Returns papers + resumptionToken (null if last page)
 */
async function fetchOAIPage(setSpec, resumptionToken = null) {
  let urlPath;

  if (resumptionToken) {
    urlPath = `${OAI_PATH}?verb=ListRecords&resumptionToken=${encodeURIComponent(resumptionToken)}`;
  } else {
    urlPath = `${OAI_PATH}?verb=ListRecords&metadataPrefix=arXiv&set=${encodeURIComponent(setSpec)}`;
  }

  const { status, body } = await httpsGet(OAI_BASE, urlPath);

  if (status === 503) {
    // OAI-PMH 503 means "retry after X seconds"
    const retryAfter = body.match(/Retry-After: (\d+)/)?.[1] || 30;
    throw new Error(`RETRY:${retryAfter}`);
  }

  if (status !== 200) throw new Error(`OAI HTTP ${status}`);

  const papers = parseOAIXML(body);
  const tokenMatch = body.match(/<resumptionToken[^>]*>([^<]+)<\/resumptionToken>/);
  const nextToken = tokenMatch ? tokenMatch[1].trim() : null;

  return { papers, nextToken };
}

/**
 * Parse OAI-PMH arXiv XML into paper objects
 */
function parseOAIXML(xml) {
  const papers = [];
  const records = xml.match(/<record>([\s\S]*?)<\/record>/g) || [];

  for (const record of records) {
    try {
      // Skip deleted records
      if (record.includes('status="deleted"')) continue;

      const id = (record.match(/<identifier>([\s\S]*?)<\/identifier>/) || [])[1]
        ?.replace('oai:arXiv.org:', '').trim();
      if (!id) continue;

      const title = (record.match(/<title>([\s\S]*?)<\/title>/) || [])[1]
        ?.replace(/\s+/g, ' ').trim();

      const abstract = (record.match(/<abstract>([\s\S]*?)<\/abstract>/) || [])[1]
        ?.replace(/\s+/g, ' ').trim();

      if (!title || !abstract) continue;

      const authors = (record.match(/<authors>([\s\S]*?)<\/authors>/) || [])[1]
        ?.replace(/<[^>]+>/g, ', ').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim() || '';

      const created = (record.match(/<created>([\s\S]*?)<\/created>/) || [])[1]?.trim();
      const year = created ? parseInt(created.substring(0, 4)) : null;

      const doi = (record.match(/<doi>([\s\S]*?)<\/doi>/) || [])[1]?.trim() || null;
      const journal = (record.match(/<journal-ref>([\s\S]*?)<\/journal-ref>/) || [])[1]?.trim() || 'arXiv preprint';

      papers.push({
        type: 'paper',
        title,
        authors,
        arxiv: id,
        doi,
        journal,
        publicationDate: created || null,
        year,
        citationCount: 0,
        abstract,
        url: `https://arxiv.org/abs/${id}`,
        source: 'arxiv'
      });
    } catch (e) {
      // skip malformed
    }
  }

  return papers;
}

/**
 * Classify paper into topic/subtopic
 */
function classifyPaper(title, abstract, topicPatterns, subtopicPatterns, defaultTopic) {
  const text = `${title} ${abstract || ''}`;
  let bestTopic = defaultTopic;
  let maxScore = 0;

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    const score = matches ? matches.length : 0;
    if (score > maxScore) { maxScore = score; bestTopic = topic; }
  }

  let bestSubtopic = 'Other';
  for (const [subtopic, pattern] of Object.entries(subtopicPatterns[bestTopic] || {})) {
    if (new RegExp(pattern, 'i').test(text)) { bestSubtopic = subtopic; break; }
  }

  return { topic: bestTopic, subtopic: bestSubtopic };
}

/**
 * Save papers to database/topics structure
 */
function savePapers(papersByTopicSubtopic, domainName) {
  let totalSaved = 0;

  for (const [topicName, subtopics] of Object.entries(papersByTopicSubtopic)) {
    const topicSlug = topicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const topicDir = path.join(TOPICS_DIR, topicSlug);
    if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

    const subtopicFiles = [];

    for (const [subtopicName, papers] of Object.entries(subtopics)) {
      const subtopicSlug = subtopicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const subtopicFile = path.join(topicDir, `${subtopicSlug}.json`);
      subtopicFiles.push(`${subtopicSlug}.json`);

      let existing = { topic: topicName, subtopic: subtopicName, keywords: [], sources: [] };
      if (fs.existsSync(subtopicFile)) existing = JSON.parse(fs.readFileSync(subtopicFile, 'utf8'));

      const existingIds = new Set(existing.sources.map(s => s.arxiv || s.id).filter(Boolean));
      const newPapers = papers.filter(p => !existingIds.has(p.arxiv || p.id));
      existing.sources.push(...newPapers);
      totalSaved += newPapers.length;

      fs.writeFileSync(subtopicFile, JSON.stringify(existing, null, 2));
    }

    fs.writeFileSync(path.join(topicDir, '_topic.json'), JSON.stringify({
      topic: topicName,
      totalPapers: Object.values(subtopics).reduce((s, p) => s + p.length, 0),
      subtopicCount: subtopicFiles.length,
      subtopicFiles,
      createdAt: new Date().toISOString()
    }, null, 2));

    console.log(`  [${domainName}] Saved: ${topicName} (${subtopicFiles.length} subtopics)`);
  }

  return totalSaved;
}

/**
 * Main OAI-PMH ingestion runner
 * Harvests one arXiv set at a time, respects resumptionToken flow
 */
async function ingestArxivOAI({ domainName, sets, topicPatterns, subtopicPatterns, defaultTopic, targetTotal = 5000 }) {
  console.log(`\n=== [${domainName}] arXiv OAI-PMH ingestion ===`);
  console.log(`  Sets: ${sets.join(', ')}`);
  console.log(`  Target: ${targetTotal} papers`);
  console.log(`  Note: 21s between requests (OAI-PMH policy)\n`);

  const papersByTopicSubtopic = {};
  const seenIds = new Set();
  let totalFetched = 0;

  for (const setSpec of sets) {
    if (totalFetched >= targetTotal) break;

    console.log(`  [${domainName}] Harvesting set: ${setSpec}`);
    let resumptionToken = null;
    let pageCount = 0;
    const maxPages = Math.ceil(targetTotal / sets.length / 1000) + 2; // OAI returns ~1000/page

    do {
      try {
        const { papers, nextToken } = await fetchOAIPage(setSpec, resumptionToken);
        pageCount++;

        for (const paper of papers) {
          if (seenIds.has(paper.arxiv)) continue;
          seenIds.add(paper.arxiv);

          const { topic, subtopic } = classifyPaper(
            paper.title, paper.abstract, topicPatterns, subtopicPatterns, defaultTopic
          );

          if (!papersByTopicSubtopic[topic]) papersByTopicSubtopic[topic] = {};
          if (!papersByTopicSubtopic[topic][subtopic]) papersByTopicSubtopic[topic][subtopic] = [];
          papersByTopicSubtopic[topic][subtopic].push(paper);
          totalFetched++;
        }

        resumptionToken = nextToken;
        process.stdout.write(`  [${domainName}] Page ${pageCount}: +${papers.length} papers (total: ${totalFetched})\r`);

        if (totalFetched >= targetTotal) {
          console.log(`\n  [${domainName}] Target reached`);
          break;
        }

        if (resumptionToken) {
          // Must wait 21s between OAI requests — this is their policy
          await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
        }

      } catch (err) {
        if (err.message.startsWith('RETRY:')) {
          const wait = parseInt(err.message.split(':')[1]) * 1000;
          console.log(`\n  [${domainName}] Server asked to retry in ${wait / 1000}s...`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          console.error(`\n  [${domainName}] Error: ${err.message}`);
          break;
        }
      }
    } while (resumptionToken && pageCount < maxPages);

    console.log(`\n  [${domainName}] Set ${setSpec} done — ${totalFetched} total so far`);
  }

  console.log(`\n  [${domainName}] Total: ${totalFetched} unique papers`);
  console.log(`  [${domainName}] Saving...`);
  const saved = savePapers(papersByTopicSubtopic, domainName);
  console.log(`  [${domainName}] ✓ Complete — ${saved} new papers saved\n`);
  return { domain: domainName, total: totalFetched, saved };
}

module.exports = { ingestArxivOAI };
