/**
 * PubMed E-utilities ingestion library
 * Used for: Biology, Medicine
 *
 * Strategy for 50K+ papers per domain:
 * - esearch with usehistory=y → server stores result set, returns WebEnv+query_key
 * - efetch paginates through full result set in batches of 200
 * - Multiple broad queries per domain, deduplicated by PMID
 * - No [Title/Abstract] field restrictions — broad MeSH/keyword search
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOPICS_DIR = path.join(__dirname, '../../database/topics');
const BASE = 'eutils.ncbi.nlm.nih.gov';
const FETCH_BATCH = 100;   // smaller batches = smaller XML = fewer socket hangups
const RATE_LIMIT_MS = 400; // 2.5 req/sec — safe under 3/sec limit

function httpsGet(hostname, urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname,
        path: urlPath,
        headers: { 'User-Agent': 'ASET-Ingestor/2.0 (mailto:aset@research.org)' }
      },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

/**
 * esearch — returns WebEnv + query_key for server-side pagination
 * usehistory=y is critical: stores result set on NCBI server
 */
async function esearch(query, retmax = 100000) {
  const q = encodeURIComponent(query);
  const url = `/entrez/eutils/esearch.fcgi?db=pubmed&term=${q}&retmax=${retmax}&retmode=json&usehistory=y`;
  const { status, body } = await httpsGet(BASE, url);
  if (status !== 200) throw new Error(`esearch HTTP ${status}`);
  const data = JSON.parse(body);
  const result = data.esearchresult;
  return {
    count: parseInt(result.count || 0),
    webenv: result.webenv,
    querykey: result.querykey
  };
}

/**
 * efetch — fetch a batch of records using WebEnv cursor
 */
async function efetch(webenv, querykey, retstart, retmax = FETCH_BATCH) {
  // Use medline format — much smaller than XML, fewer socket hangups
  const url = `/entrez/eutils/efetch.fcgi?db=pubmed&WebEnv=${webenv}&query_key=${querykey}&retstart=${retstart}&retmax=${retmax}&retmode=text&rettype=medline`;
  const { status, body } = await httpsGet(BASE, url);
  if (status !== 200) throw new Error(`efetch HTTP ${status}`);
  return parseMedline(body);
}

/**
 * Parse MEDLINE flat-file format into paper objects
 * Much smaller than XML — fewer network errors on large batches
 */
function parseMedline(text) {
  const papers = [];
  const records = text.split(/\n\nPMID- /).map((r, i) => i === 0 ? r : 'PMID- ' + r).filter(r => r.includes('PMID-'));

  for (const record of records) {
    try {
      const pmidMatch = record.match(/^PMID- (\d+)/m);
      if (!pmidMatch) continue;
      const pmid = pmidMatch[1];

      const titleLines = [];
      const abstractLines = [];
      const authorLines = [];
      let inTitle = false, inAbstract = false;

      for (const line of record.split('\n')) {
        if (line.startsWith('TI  - ')) { inTitle = true; inAbstract = false; titleLines.push(line.substring(6)); }
        else if (line.startsWith('AB  - ')) { inAbstract = true; inTitle = false; abstractLines.push(line.substring(6)); }
        else if (line.startsWith('AU  - ')) { inTitle = false; inAbstract = false; authorLines.push(line.substring(6).trim()); }
        else if (line.startsWith('      ')) { // continuation line
          if (inTitle) titleLines.push(line.trim());
          else if (inAbstract) abstractLines.push(line.trim());
        } else { inTitle = false; inAbstract = false; }
      }

      const title = titleLines.join(' ').trim();
      const abstract = abstractLines.join(' ').trim();
      if (!title || !abstract || abstract.length < 50) continue;

      const dpMatch = record.match(/^DP  - (\d{4})/m);
      const year = dpMatch ? parseInt(dpMatch[1]) : null;

      const journal = (record.match(/^JT  - (.+)/m) || [])[1]?.trim() || 'PubMed';
      const doi = (record.match(/^LID - (10\.\S+) \[doi\]/m) || [])[1]?.trim();

      const meshLines = record.match(/^MH  - (.+)/gm) || [];
      const keywords = meshLines.map(l => l.substring(6).replace(/\*/, '').trim()).slice(0, 10);

      papers.push({
        type: 'paper',
        title,
        authors: authorLines.join(', '),
        arxiv: null,
        doi: doi || null,
        journal,
        publicationDate: year ? `${year}-01-01` : null,
        year,
        citationCount: 0,
        abstract,
        keywords,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: 'pubmed',
        id: `pmid-${pmid}`
      });
    } catch (e) {
      // skip malformed
    }
  }
  return papers;
}

/**
 * Parse PubMed XML into paper objects
 */
function parsePubMedXML(xml) {
  const papers = [];
  const articles = xml.match(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g) || [];

  for (const article of articles) {
    try {
      const pmid = (article.match(/<PMID[^>]*>(\d+)<\/PMID>/) || [])[1];
      if (!pmid) continue;

      const title = (article.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/) || [])[1]
        ?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

      // Handle structured abstracts (multiple AbstractText elements)
      const abstractParts = [];
      const abstractMatches = article.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g) || [];
      for (const part of abstractMatches) {
        const text = part.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (text) abstractParts.push(text);
      }
      const abstract = abstractParts.join(' ');

      if (!title || !abstract || abstract.length < 50) continue;

      // Authors
      const authorMatches = article.match(/<Author[^>]*>([\s\S]*?)<\/Author>/g) || [];
      const authors = authorMatches.map(a => {
        const last = (a.match(/<LastName>([\s\S]*?)<\/LastName>/) || [])[1] || '';
        const fore = (a.match(/<ForeName>([\s\S]*?)<\/ForeName>/) || [])[1] || '';
        return `${last}${fore ? ' ' + fore : ''}`.trim();
      }).filter(Boolean).join(', ');

      // Year — try multiple locations
      const yearMatch =
        article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/) ||
        article.match(/<ArticleDate[^>]*>[\s\S]*?<Year>(\d{4})<\/Year>/) ||
        article.match(/<MedlineDate>(\d{4})/) ;
      const year = yearMatch ? parseInt(yearMatch[1]) : null;

      // Journal
      const journal = (article.match(/<Title>([\s\S]*?)<\/Title>/) || [])[1]
        ?.replace(/<[^>]+>/g, '').trim() || 'PubMed';

      // DOI
      const doi = (article.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/) || [])[1]?.trim();

      // MeSH keywords
      const meshMatches = article.match(/<DescriptorName[^>]*>([\s\S]*?)<\/DescriptorName>/g) || [];
      const keywords = meshMatches
        .map(k => k.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .slice(0, 10);

      papers.push({
        type: 'paper',
        title,
        authors,
        arxiv: null,
        doi: doi || null,
        journal,
        publicationDate: year ? `${year}-01-01` : null,
        year,
        citationCount: 0,
        abstract,
        keywords,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: 'pubmed',
        id: `pmid-${pmid}`
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

      const existingIds = new Set(existing.sources.map(s => s.id || s.arxiv).filter(Boolean));
      const newPapers = papers.filter(p => !existingIds.has(p.id || p.arxiv));
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
 * Main PubMed ingestion runner
 * Uses server-side history (WebEnv) for efficient pagination of large result sets
 */
async function ingestPubMed({ domainName, queries, topicPatterns, subtopicPatterns, defaultTopic, targetPerQuery = 10000 }) {
  console.log(`\n=== [${domainName}] PubMed ingestion ===`);
  console.log(`  Queries: ${queries.length} | Target per query: ${targetPerQuery.toLocaleString()}`);
  console.log(`  Estimated total: ~${(queries.length * targetPerQuery).toLocaleString()} papers\n`);

  const papersByTopicSubtopic = {};
  const seenIds = new Set();
  let totalFetched = 0;

  for (const query of queries) {
    console.log(`\n  [${domainName}] Searching: "${query}"`);

    try {
      // Step 1: esearch to get count + WebEnv
      const { count, webenv, querykey } = await esearch(query, targetPerQuery);
      const toFetch = Math.min(count, targetPerQuery);
      console.log(`    Total available: ${count.toLocaleString()} | Fetching: ${toFetch.toLocaleString()}`);

      if (toFetch === 0) continue;

      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));

      // Step 2: paginate through results using WebEnv
      let fetched = 0;
      while (fetched < toFetch) {
        try {
          const papers = await efetch(webenv, querykey, fetched, FETCH_BATCH);

          for (const paper of papers) {            if (seenIds.has(paper.id)) continue;
            seenIds.add(paper.id);

            const { topic, subtopic } = classifyPaper(
              paper.title, paper.abstract, topicPatterns, subtopicPatterns, defaultTopic
            );

            if (!papersByTopicSubtopic[topic]) papersByTopicSubtopic[topic] = {};
            if (!papersByTopicSubtopic[topic][subtopic]) papersByTopicSubtopic[topic][subtopic] = [];
            papersByTopicSubtopic[topic][subtopic].push(paper);
            totalFetched++;
          }

          fetched += papers.length;
          process.stdout.write(`    Progress: ${fetched.toLocaleString()}/${toFetch.toLocaleString()} (total unique: ${totalFetched.toLocaleString()})\r`);

          // Only stop if we got zero records — partial batches are normal for large XML
          if (papers.length === 0) break;

          await new Promise(r => setTimeout(r, RATE_LIMIT_MS));

        } catch (err) {
          if (err.message === 'TIMEOUT' || err.message.includes('hang up') || err.message.includes('ECONNRESET')) {
            const wait = 5000;
            console.log(`\n    Network error (${err.message}), retrying in ${wait/1000}s...`);
            await new Promise(r => setTimeout(r, wait));
            // Don't advance fetched — retry same offset
          } else {
            console.error(`\n    Fetch error: ${err.message}`);
            fetched += FETCH_BATCH; // skip this batch and continue
          }
        }
      }

      console.log(`\n    Done: ${fetched.toLocaleString()} fetched`);

    } catch (err) {
      console.error(`\n    Search error on "${query}": ${err.message}`);
    }

    await new Promise(r => setTimeout(r, RATE_LIMIT_MS * 2));
  }

  console.log(`\n  [${domainName}] Total unique: ${totalFetched.toLocaleString()}`);
  console.log(`  [${domainName}] Saving to database/topics/...`);
  const saved = savePapers(papersByTopicSubtopic, domainName);
  console.log(`  [${domainName}] ✓ Complete — ${saved.toLocaleString()} new papers saved\n`);
  return { domain: domainName, total: totalFetched, saved };
}

module.exports = { ingestPubMed };
