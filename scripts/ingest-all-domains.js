/**
 * Domain ingestion orchestrator
 *
 * Strategy:
 * - Biology + Medicine → PubMed API (parallel OK — different servers)
 * - Chemistry + Physics + CS + Engineering → arXiv OAI-PMH (sequential — same IP, 21s/req policy)
 *
 * Usage:
 *   node scripts/ingest-all-domains.js              # all domains
 *   node scripts/ingest-all-domains.js pubmed        # only PubMed domains
 *   node scripts/ingest-all-domains.js arxiv         # only arXiv domains
 *   node scripts/ingest-all-domains.js chemistry,cs  # specific domains
 */

const { fork } = require('child_process');
const path = require('path');

const PUBMED_DOMAINS = ['biology', 'medicine'];
const ARXIV_DOMAINS  = ['chemistry', 'physics', 'cs', 'engineering'];

const ALL_SCRIPTS = {
  biology:     'domains/ingest-biology.js',
  medicine:    'domains/ingest-medicine.js',
  chemistry:   'domains/ingest-chemistry.js',
  physics:     'domains/ingest-physics.js',
  cs:          'domains/ingest-cs.js',
  engineering: 'domains/ingest-engineering.js'
};

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = fork(path.join(__dirname, scriptPath), [], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    child.on('exit', code => resolve({ code }));
    child.on('error', err => resolve({ code: 1, err: err.message }));
  });
}

async function main() {
  const arg = process.argv[2] || 'all';

  let toRun;
  if (arg === 'all') {
    toRun = Object.keys(ALL_SCRIPTS);
  } else if (arg === 'pubmed') {
    toRun = PUBMED_DOMAINS;
  } else if (arg === 'arxiv') {
    toRun = ARXIV_DOMAINS;
  } else {
    toRun = arg.split(',').map(s => s.trim().toLowerCase());
    const invalid = toRun.filter(d => !ALL_SCRIPTS[d]);
    if (invalid.length) {
      console.error(`Unknown domains: ${invalid.join(', ')}`);
      console.error(`Valid: ${Object.keys(ALL_SCRIPTS).join(', ')}`);
      process.exit(1);
    }
  }

  const pubmedToRun = toRun.filter(d => PUBMED_DOMAINS.includes(d));
  const arxivToRun  = toRun.filter(d => ARXIV_DOMAINS.includes(d));

  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   ASET Domain Expansion Orchestrator     ║`);
  console.log(`╚══════════════════════════════════════════╝`);
  console.log(`\nPubMed (parallel): ${pubmedToRun.join(', ') || 'none'}`);
  console.log(`arXiv OAI (sequential): ${arxivToRun.join(', ') || 'none'}\n`);

  const results = {};
  const startTime = Date.now();

  // Phase 1: PubMed domains — run sequentially to respect 3 req/sec rate limit
  // Running both in parallel doubles the request rate and causes 429s
  if (pubmedToRun.length) {
    console.log('── Phase 1: PubMed (sequential — rate limit safe) ──\n');
    for (const domain of pubmedToRun) {
      console.log(`\nStarting: ${domain}`);
      const { code } = await runScript(ALL_SCRIPTS[domain]);
      results[domain] = code === 0 ? 'SUCCESS' : `FAILED (exit ${code})`;
      console.log(`Finished: ${domain} — ${results[domain]}`);
    }
    console.log(`\n── Phase 1 complete ──\n`);
  }

  // Phase 2: arXiv OAI domains sequentially (same IP — must not parallel)
  if (arxivToRun.length) {
    console.log('── Phase 2: arXiv OAI (sequential, 21s/req) ──\n');
    for (const domain of arxivToRun) {
      console.log(`\nStarting: ${domain}`);
      const { code } = await runScript(ALL_SCRIPTS[domain]);
      results[domain] = code === 0 ? 'SUCCESS' : `FAILED (exit ${code})`;
      console.log(`Finished: ${domain} — ${results[domain]}`);
    }
    console.log(`\n── Phase 2 complete ──\n`);
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`╔══════════════════════════════════════════╗`);
  console.log(`║              Ingestion Summary           ║`);
  console.log(`╚══════════════════════════════════════════╝`);
  console.log(`Total time: ${elapsed} minutes\n`);

  let allSuccess = true;
  for (const [domain, status] of Object.entries(results)) {
    const icon = status === 'SUCCESS' ? '✅' : '❌';
    console.log(`  ${icon} ${domain.padEnd(15)} ${status}`);
    if (status !== 'SUCCESS') allSuccess = false;
  }

  console.log('');
  if (allSuccess) {
    console.log('✅ All domains ingested.');
    console.log('\nNext — migrate to Turso:');
    console.log('  node scripts/migrate-to-turso-fast.js\n');
  } else {
    console.log('⚠️  Some domains failed. Re-run individually:');
    for (const [domain, status] of Object.entries(results)) {
      if (status !== 'SUCCESS') {
        console.log(`  node scripts/domains/ingest-${domain}.js`);
      }
    }
    process.exit(1);
  }
}

main().catch(console.error);
