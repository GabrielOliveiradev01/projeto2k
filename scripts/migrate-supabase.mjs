import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../supabase/schema.sql');

const dbUrl =
  process.env.SUPABASE_DB_URL ||
  (process.env.SUPABASE_DB_PASSWORD
    ? `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@db.azmzyqctlaqbhoehicnz.supabase.co:5432/postgres`
    : null);

if (!dbUrl) {
  console.error('Defina SUPABASE_DB_URL ou SUPABASE_DB_PASSWORD no .env');
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log('Schema aplicado com sucesso.');
} catch (error) {
  console.error('Erro ao aplicar schema:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
