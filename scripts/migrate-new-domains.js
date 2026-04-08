/**
 * Migrate ONLY new domain folders to Turso
 * Skips existing space science topics already in DB
 * Usage: node scripts/migrate-new-domains.js
 *        node scripts/migrate-new-domains.js biology,medicine  (specific domains)
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const BATCH_SIZE = 100;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

// Space science topics already in Turso — skip these
const EXISTING_TOPICS = new Set([
  'black-holes', 'cosmology', 'dark-matter-and-dark-energy',
  'exoplanets', 'galaxies', 'gravitational-waves',
  'high-energy-astrophysics', 'instrumentation-and-methods',
  'neutron-stars', 'planetary-science', 'small-bodies',
  'solar-physics', 'star-formation', 'stellar-astrophysics'
]);

async function migrateNewDomains() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Ensure source column exists (new domains have it)
  try {
    await client.execute(`ALTER TABLE papers ADD COLUMN source TEXT DEFAULT 'arxiv'`);
    console.log('✓ Added source column');
  } catch (e) {
    // Already exists — fine
  }

  const topicsDir = 'database/topics';
  const allTopics = fs.readdirSync(topicsDir)
    .filter(f => fs.statSync(path.join(topicsDir, f)).isDirectory());

  // Filter to only new domains
  const arg = process.argv[2];
  let newTopics;
  if (arg) {
    const requested = arg.split(',').map(s => s.trim().toLowerCase());
    newTopics = allTopics.filter(t => requested.some(r => t.includes(r)));
  } else {
    newTopics = allTopics.filter(t => !EXISTING_TOPICS.has(t));
  }

  if (!newTopics.length) {
    console.log('No new topics found to migrate.');
    process.exit(0);
  }

  console.log(`\n=== Migrating ${newTopics.length} new domain topics ===\n`);
  console.log('Topics:', newTopics.join(', '), '\n');

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (const topic of newTopics) {
    const topicPath = path.join(topicsDir, topic);
    const subtopicFiles = fs.readdirSync(topicPath)
      .filter(f => f.endsWith('.json') && f !== '_topic.json');

    for (const subtopicFile of subtopicFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(topicPath, subtopicFile), 'utf8'));
      const papers = data.sources || data.papers || [];
      const subtopic = subtopicFile.replace('.json', '');

      if (!papers.length) continue;
      console.log(`📁 ${topic}/${subtopic}: ${papers.length} papers`);

      for (let i = 0; i < papers.length; i += BATCH_SIZE) {
        const batch = papers.slice(i, i + BATCH_SIZE);

        try {
          const statements = batch.map(paper => {
            // Handle both arXiv and PubMed paper shapes
            const id = paper.id || paper.arxiv || `${topic}-${subtopic}-${i}`;
            const source = paper.source || (paper.arxiv ? 'arxiv' : 'pubmed');
            const authorsRaw = paper.authors;
            const authors = Array.isArray(authorsRaw)
              ? JSON.stringify(authorsRaw)
              : JSON.stringify(typeof authorsRaw === 'string' ? [authorsRaw] : []);

            return {
              sql: `INSERT OR IGNORE INTO papers
                    (id, title, abstract, authors, year, topic, subtopic, keywords, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                id,
                (paper.title || '').substring(0, 500),
                (paper.abstract || '').substring(0, 5000),
                authors,
                paper.year || null,
                topic,
                subtopic,
                JSON.stringify(paper.keywords || []),
                source
              ]
            };
          });

          const results = await client.batch(statements, 'write');
          const inserted = results.reduce((s, r) => s + (r.rowsAffected || 0), 0);
          totalInserted += inserted;
          totalSkipped += batch.length - inserted;

        } catch (err) {
          totalErrors++;
          if (totalErrors <= 5) console.error(`  ❌ Batch error: ${err.message}`);
        }
      }

      console.log(`   ✓ ${papers.length} processed`);
    }
  }

  // Update FTS index for new papers only
  console.log('\n=== Updating FTS index for new papers ===');
  try {
    await client.execute(`
      INSERT INTO papers_fts(rowid, title, abstract)
      SELECT rowid, title, abstract FROM papers
      WHERE rowid NOT IN (SELECT rowid FROM papers_fts)
    `);
    console.log('✓ FTS index updated');
  } catch (err) {
    console.error('❌ FTS update error:', err.message);
    // Fallback: rebuild entire FTS
    try {
      await client.execute(`INSERT INTO papers_fts(papers_fts) VALUES('rebuild')`);
      console.log('✓ FTS rebuilt');
    } catch (e) {
      console.error('❌ FTS rebuild also failed:', e.message);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const total = await client.execute('SELECT COUNT(*) as count FROM papers');

  console.log(`\n=== Summary ===`);
  console.log(`Inserted: ${totalInserted.toLocaleString()}`);
  console.log(`Skipped (dupes): ${totalSkipped.toLocaleString()}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Time: ${elapsed} minutes`);
  console.log(`Total papers in DB: ${total.rows[0].count.toLocaleString()}`);
  console.log('\n✅ Done');
}

migrateNewDomains().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
