/**
 * Rebuild FTS index from scratch
 * Required after bulk inserts to content-table FTS5
 */
require('dotenv').config();
const { createClient } = require('@libsql/client');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function rebuild() {
  console.log('Rebuilding FTS index...');
  
  // Step 1: Delete all FTS content
  console.log('Step 1: Clearing FTS...');
  await db.execute("INSERT INTO papers_fts(papers_fts) VALUES('delete-all')");
  
  // Step 2: Repopulate in batches
  const total = (await db.execute('SELECT COUNT(*) as c FROM papers')).rows[0].c;
  console.log(`Step 2: Repopulating ${total.toLocaleString()} papers...`);
  
  const BATCH = 10000;
  let offset = 0;
  
  while (offset < total) {
    await db.execute({
      sql: `INSERT INTO papers_fts(rowid, title, abstract)
            SELECT rowid, title, abstract FROM papers
            LIMIT ? OFFSET ?`,
      args: [BATCH, offset]
    });
    offset += BATCH;
    process.stdout.write(`  Progress: ${Math.min(offset, total).toLocaleString()}/${total.toLocaleString()}\r`);
  }
  
  console.log('\nStep 3: Verifying...');
  const ftsCount = (await db.execute('SELECT COUNT(*) as c FROM papers_fts')).rows[0].c;
  console.log(`FTS rows: ${ftsCount.toLocaleString()}`);
  
  // Quick test
  const test = await db.execute("SELECT COUNT(*) as c FROM papers_fts WHERE papers_fts MATCH 'language'");
  console.log(`Test "language" matches: ${test.rows[0].c}`);
  
  console.log('\n✅ FTS rebuild complete');
}

rebuild().catch(err => {
  console.error('❌ Rebuild failed:', err.message);
  process.exit(1);
});
