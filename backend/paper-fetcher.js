/**
 * Dynamic Paper Fetcher
 * When ASET can't find relevant papers locally, fetches from arXiv + PubMed
 * and permanently adds them to the database — self-growing knowledge base
 */

const https = require('https');

function httpsGet(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { hostname, path, headers: { 'User-Agent': 'ASET/2.0 (mailto:aset@research.org)' } },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

/**
 * Search arXiv for papers matching a claim
 */
async function searchArxiv(claim, maxResults = 10) {
  const query = encodeURIComponent(claim.substring(0, 200));
  const { status, body } = await httpsGet(
    'export.arxiv.org',
    `/api/query?search_query=all:${query}&max_results=${maxResults}&sortBy=relevance`
  );

  if (status !== 200) return [];

  const papers = [];
  const entries = body.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

  for (const entry of entries) {
    try {
      const id = (entry.match(/<id>https?:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/) || [])[1]?.trim();
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.replace(/\s+/g, ' ').trim();
      const abstract = (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.replace(/\s+/g, ' ').trim();
      const published = (entry.match(/<published>([\s\S]*?)<\/published>/) || [])[1];
      const year = published ? parseInt(published.substring(0, 4)) : null;
      const authorMatches = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g) || [];
      const authors = authorMatches.map(a => (a.match(/<name>([\s\S]*?)<\/name>/) || [])[1]?.trim()).filter(Boolean).join(', ');

      if (id && title && abstract && abstract.length > 100) {
        papers.push({ id, title, abstract, authors, year, source: 'arxiv', url: `https://arxiv.org/abs/${id}` });
      }
    } catch (e) { /* skip */ }
  }

  return papers;
}

/**
 * Search PubMed for papers matching a claim
 */
async function searchPubMed(claim, maxResults = 10) {
  const query = encodeURIComponent(claim.substring(0, 200));

  // esearch
  const { body: searchBody } = await httpsGet(
    'eutils.ncbi.nlm.nih.gov',
    `/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=${maxResults}&retmode=json&usehistory=y`
  );

  const searchData = JSON.parse(searchBody);
  const { webenv, querykey, idlist } = searchData.esearchresult || {};
  if (!idlist?.length) return [];

  await new Promise(r => setTimeout(r, 400));

  // efetch
  const { body: fetchBody } = await httpsGet(
    'eutils.ncbi.nlm.nih.gov',
    `/entrez/eutils/efetch.fcgi?db=pubmed&WebEnv=${webenv}&query_key=${querykey}&retstart=0&retmax=${maxResults}&retmode=text&rettype=medline`
  );

  const papers = [];
  const records = fetchBody.split(/\n\nPMID- /).map((r, i) => i === 0 ? r : 'PMID- ' + r).filter(r => r.includes('PMID-'));

  for (const record of records) {
    try {
      const pmid = (record.match(/PMID- (\d+)/) || [])[1];
      if (!pmid) continue;

      const titleLines = [], abstractLines = [];
      let inTitle = false, inAbstract = false;
      for (const line of record.split('\n')) {
        if (line.startsWith('TI  - ')) { inTitle = true; inAbstract = false; titleLines.push(line.substring(6)); }
        else if (line.startsWith('AB  - ')) { inAbstract = true; inTitle = false; abstractLines.push(line.substring(6)); }
        else if (line.startsWith('      ')) { if (inTitle) titleLines.push(line.trim()); else if (inAbstract) abstractLines.push(line.trim()); }
        else { inTitle = false; inAbstract = false; }
      }

      const title = titleLines.join(' ').trim();
      const abstract = abstractLines.join(' ').trim();
      if (!title || !abstract || abstract.length < 100) continue;

      const year = parseInt((record.match(/^DP  - (\d{4})/m) || [])[1]) || null;
      const authors = (record.match(/^AU  - (.+)/gm) || []).map(l => l.substring(6).trim()).join(', ');
      const doi = (record.match(/^LID - (10\.\S+) \[doi\]/m) || [])[1]?.trim();

      papers.push({
        id: `pmid-${pmid}`,
        title, abstract, authors, year,
        source: 'pubmed',
        doi: doi || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      });
    } catch (e) { /* skip */ }
  }

  return papers;
}

/**
 * Classify paper into topic/subtopic using keyword matching
 */
function classifyPaper(title, abstract) {
  const text = `${title} ${abstract}`.toLowerCase();

  const topicMap = [
    ['neuroscience', /brain|neuron|synapse|amygdala|cortex|hippocampus|dopamine|serotonin|cognitive/],
    ['oncology', /cancer|tumor|carcinoma|chemotherapy|immunotherapy|metastasis/],
    ['cardiology', /heart|cardiac|cardiovascular|myocardial|arrhythmia|hypertension/],
    ['genetics-and-genomics', /gene|genome|dna|rna|crispr|sequencing|mutation|chromosome/],
    ['pharmacology', /drug|pharmacology|clinical trial|efficacy|therapeutic|medication/],
    ['molecular-biology', /protein|enzyme|folding|ribosome|transcription|amino acid/],
    ['artificial-intelligence', /machine learning|deep learning|neural network|reinforcement/],
    ['natural-language-processing', /nlp|language model|bert|gpt|transformer|text classification/],
    ['quantum-physics', /quantum|qubit|entanglement|superposition|wave function/],
    ['physical-chemistry', /thermodynamic|reaction|catalyst|molecule|spectroscopy|polymer/],
    ['epidemiology', /epidemiology|prevalence|incidence|mortality|cohort|risk factor/],
    ['mental-health', /depression|anxiety|schizophrenia|bipolar|ptsd|psychiatric/],
    ['black-holes', /black hole|event horizon|hawking|accretion|neutron star/],
    ['cosmology', /universe|big bang|dark energy|dark matter|cosmic|hubble/],
    ['robotics', /robot|autonomous|navigation|manipulation|drone|kinematics/],
  ];

  for (const [topic, pattern] of topicMap) {
    if (pattern.test(text)) return { topic, subtopic: 'other' };
  }

  return { topic: 'instrumentation-and-methods', subtopic: 'other' };
}

/**
 * Fetch papers for a claim and store new ones in the database
 * Returns the fetched papers for immediate verification
 */
async function fetchAndStorePapers(claim, db) {
  console.log(`[PaperFetcher] Searching external sources for: "${claim.substring(0, 80)}"`);

  let papers = [];

  // Search both sources in parallel
  try {
    const [arxivPapers, pubmedPapers] = await Promise.allSettled([
      searchArxiv(claim, 8),
      searchPubMed(claim, 8)
    ]);

    if (arxivPapers.status === 'fulfilled') papers.push(...arxivPapers.value);
    if (pubmedPapers.status === 'fulfilled') papers.push(...pubmedPapers.value);
  } catch (err) {
    console.error('[PaperFetcher] Search error:', err.message);
    return [];
  }

  if (!papers.length) {
    console.log('[PaperFetcher] No papers found externally');
    return [];
  }

  console.log(`[PaperFetcher] Found ${papers.length} papers, storing new ones...`);

  // Store new papers in DB
  let stored = 0;
  for (const paper of papers) {
    try {
      const { topic, subtopic } = classifyPaper(paper.title, paper.abstract);
      await db.execute({
        sql: `INSERT OR IGNORE INTO papers (id, title, abstract, authors, year, topic, subtopic, keywords, source)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          paper.id,
          paper.title.substring(0, 500),
          paper.abstract.substring(0, 5000),
          JSON.stringify(paper.authors ? [paper.authors] : []),
          paper.year || null,
          topic,
          subtopic,
          JSON.stringify([]),
          paper.source
        ]
      });

      // Update FTS index for new paper
      await db.execute({
        sql: `INSERT OR IGNORE INTO papers_fts(rowid, title, abstract)
              SELECT rowid, title, abstract FROM papers WHERE id = ?`,
        args: [paper.id]
      });

      stored++;
    } catch (err) {
      // Duplicate or error — skip
    }
  }

  if (stored > 0) {
    console.log(`[PaperFetcher] Stored ${stored} new papers in database`);
  }

  return papers;
}

module.exports = { fetchAndStorePapers };
