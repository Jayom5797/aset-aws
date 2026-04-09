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
 * Falls back to best-effort classification based on abstract content
 */
function classifyPaper(title, abstract) {
  const text = `${title} ${abstract}`.toLowerCase();

  const topicMap = [
    ['neuroscience', /\b(brain|neuron|synapse|amygdala|cortex|hippocampus|dopamine|serotonin|cognitive|memory|alzheimer|parkinson|epilepsy|neurotransmitter|cerebral|limbic)\b/],
    ['oncology', /\b(cancer|tumor|carcinoma|chemotherapy|immunotherapy|metastasis|oncology|malignant|biopsy|leukemia|lymphoma|melanoma)\b/],
    ['cardiology', /\b(heart|cardiac|cardiovascular|myocardial|arrhythmia|hypertension|coronary|stroke|ecg|atrial|ventricular)\b/],
    ['genetics-and-genomics', /\b(gene|genome|dna|rna|crispr|sequencing|mutation|chromosome|allele|snp|mrna|pcr|epigenetic|transcription factor)\b/],
    ['pharmacology', /\b(drug|pharmacology|clinical trial|efficacy|therapeutic|medication|dose|pharmacokinetic|placebo|adverse effect)\b/],
    ['molecular-biology', /\b(protein|enzyme|folding|ribosome|translation|amino acid|peptide|antibody|receptor|ligand|binding site)\b/],
    ['artificial-intelligence', /\b(machine learning|deep learning|neural network|reinforcement learning|generative|diffusion|gan|cnn|lstm|transformer|attention)\b/],
    ['natural-language-processing', /\b(nlp|language model|bert|gpt|text classification|sentiment|translation|tokeniz|embedding|named entity)\b/],
    ['computer-vision', /\b(image recognition|object detection|segmentation|convolutional|yolo|resnet|visual|pixel|feature extraction)\b/],
    ['quantum-physics', /\b(quantum|qubit|entanglement|superposition|wave function|decoherence|quantum computing|bell|hamiltonian)\b/],
    ['condensed-matter-physics', /\b(superconductor|semiconductor|transistor|band gap|ferromagnet|topological|phase transition|crystal|lattice)\b/],
    ['nuclear-physics', /\b(nuclear|fission|fusion|radioactive|neutron|proton|isotope|radiation|reactor|decay)\b/],
    ['physical-chemistry', /\b(thermodynamic|reaction|catalyst|molecule|spectroscopy|polymer|nanomaterial|crystal|synthesis|bond)\b/],
    ['epidemiology', /\b(epidemiology|prevalence|incidence|mortality|cohort|risk factor|pandemic|outbreak|public health|surveillance)\b/],
    ['mental-health', /\b(depression|anxiety|schizophrenia|bipolar|ptsd|psychiatric|therapy|antidepressant|cognitive behavioral)\b/],
    ['robotics', /\b(robot|autonomous|navigation|manipulation|drone|uav|kinematics|actuator|path planning|slam)\b/],
    ['signal-processing', /\b(signal|filter|fourier|wavelet|noise|compression|modulation|antenna|radar|communication)\b/],
    ['control-systems', /\b(control system|feedback|pid|stability|transfer function|state space|optimal control|mpc|lyapunov)\b/],
    ['black-holes', /\b(black hole|event horizon|hawking|singularity|accretion|gravitational collapse|neutron star|quasar)\b/],
    ['cosmology', /\b(universe|big bang|dark energy|dark matter|cosmic|inflation|hubble|redshift|cmb|galaxy cluster)\b/],
    ['exoplanets', /\b(exoplanet|habitable zone|transit|radial velocity|kepler|biosignature|planetary atmosphere)\b/],
    ['evolutionary-biology', /\b(evolution|natural selection|species|phylogen|adaptation|fossil|extinction|speciation|darwin)\b/],
    ['microbiology', /\b(bacteria|virus|pathogen|antibiotic|infection|microbiome|fungus|parasite|vaccine|immunity)\b/],
    ['immunology', /\b(immune|antibody|t cell|b cell|cytokine|inflammation|autoimmune|vaccine|antigen|lymphocyte)\b/],
    ['materials-chemistry', /\b(nanomaterial|graphene|composite|thin film|coating|porous|mof|zeolite|2d material|nanoparticle)\b/],
    ['electrical-engineering', /\b(circuit|power electronics|voltage|current|transformer|motor|generator|inverter|grid|pcb)\b/],
    ['mechanical-engineering', /\b(stress|strain|fatigue|fracture|vibration|heat transfer|manufacturing|finite element|fluid mechanics)\b/],
    ['civil-engineering', /\b(structural|concrete|steel|foundation|bridge|earthquake|geotechnical|construction|pavement)\b/],
    ['aerospace-engineering', /\b(aerodynamic|propulsion|aircraft|turbine|rocket|satellite|flight|hypersonic|reentry|thrust)\b/],
  ];

  // Score each topic by number of keyword matches (not just first match)
  let bestTopic = 'instrumentation-and-methods';
  let bestScore = 0;

  for (const [topic, pattern] of topicMap) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return { topic: bestTopic, subtopic: bestScore > 0 ? 'other' : 'general' };
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
