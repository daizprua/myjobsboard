const fs = require('fs');
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function main() {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("Connected to Turso database.");
  const sql = fs.readFileSync('turso_utf8.sql', 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);
  
  for (const statement of statements) {
    try {
      await libsql.execute(statement);
    } catch (err) {
      console.error("Error executing statement:", statement);
      console.error(err.message);
    }
  }

  console.log("Migration complete!");
}

main().catch(console.error);
