const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const BATCH_SIZE = 100; // 100 papers per transaction

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function createSchema(client) {
  console.log('Creating schema...');
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      abstract TEXT,
      authors TEXT,
      year INTEGER,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      keywords TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);
  
  await client.execute('CREATE INDEX IF NOT EXISTS idx_topic_subtopic ON papers(topic, subtopic)');
  await client.execute('CREATE INDEX IF NOT EXISTS idx_year ON papers(year)');
  
  await client.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
      title,
      abstract,
      content='papers',
      content_rowid='rowid'
    )
  `);
  
  console.log('✓ Schema created');
}

async function migrate() {
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN
  });

  console.log('=== Turso Migration (Fast) ===\n');
  
  await createSchema(client);
  
  let totalPapers = 0;
  let totalErrors = 0;
  const startTime = Date.now();
  
  const topicsDir = 'database/topics';
  const topics = fs.readdirSync(topicsDir).filter(f => 
    fs.statSync(path.join(topicsDir, f)).isDirectory()
  );

  console.log(`\nMigrating ${topics.length} topics...\n`);

  for (const topic of topics) {
    const topicPath = path.join(topicsDir, topic);
    const subtopicFiles = fs.readdirSync(topicPath).filter(f => 
      f.endsWith('.json') && f !== '_topic.json'
    );
    
    for (const subtopicFile of subtopicFiles) {
      const subtopicPath = path.join(topicPath, subtopicFile);
      const data = JSON.parse(fs.readFileSync(subtopicPath, 'utf8'));
      
      const subtopic = subtopicFile.replace('.json', '');
      const papers = data.sources || data.papers || [];
      
      console.log(`📁 ${topic}/${subtopic}: ${papers.length} papers`);

      // Batch insert using transactions
      for (let i = 0; i < papers.length; i += BATCH_SIZE) {
        const batch = papers.slice(i, i + BATCH_SIZE);
        
        try {
          // Use transaction for batch
          await client.batch(
            batch.map(paper => ({
              sql: `INSERT OR IGNORE INTO papers 
                    (id, title, abstract, authors, year, topic, subtopic, keywords)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                paper.id || paper.arxiv || `paper-${i}`,
                paper.title || '',
                paper.abstract || '',
                JSON.stringify(paper.authors || []),
                paper.year || null,
                topic,
                subtopic,
                JSON.stringify(paper.keywords || [])
              ]
            })),
            'write'
          );
          
          totalPapers += batch.length;
          
          if (i % 1000 === 0 && i > 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = totalPapers / elapsed;
            const remaining = (998538 - totalPapers) / rate / 60;
            process.stdout.write(`   Progress: ${i}/${papers.length} | Total: ${totalPapers.toLocaleString()} | ${rate.toFixed(0)} papers/sec | ETA: ${remaining.toFixed(0)}min\r`);
          }
        } catch (error) {
          totalErrors++;
          if (totalErrors < 10) {
            console.error(`\n❌ Error at batch ${i}:`, error.message);
          }
          // Continue with next batch
        }
      }
      
      console.log(`   ✓ Complete: ${papers.length} papers                    `);
    }
  }

  console.log('\n\n=== Building Full-Text Search Index ===\n');
  console.log('This may take 5-10 minutes...');
  
  try {
    await client.execute({
      sql: `INSERT INTO papers_fts(rowid, title, abstract)
            SELECT rowid, title, abstract FROM papers`,
      args: []
    });
    console.log('✓ FTS index built');
  } catch (error) {
    console.error('❌ FTS index error:', error.message);
  }

  const totalTime = (Date.now() - startTime) / 1000 / 60;
  
  console.log('\n=== Migration Summary ===\n');
  console.log(`Papers processed: ${totalPapers.toLocaleString()}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Time: ${totalTime.toFixed(1)} minutes`);
  
  const result = await client.execute({ sql: 'SELECT COUNT(*) as count FROM papers', args: [] });
  console.log(`Verified in DB: ${result.rows[0].count.toLocaleString()} papers`);
  
  if (result.rows[0].count < totalPapers * 0.95) {
    console.error('\n❌ Migration failed - too many papers missing');
    process.exit(1);
  }
  
  console.log('\n✅ Migration complete!');
}

migrate().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
