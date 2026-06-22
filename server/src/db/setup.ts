import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { config } from '../config';
import { seed } from './seed';

/**
 * One-shot bootstrap: apply db/schema.sql (creates the database + tables),
 * then load demo data. Run with `npm run db:setup`.
 */
async function run() {
  const schemaPath = path.resolve(__dirname, '../../../db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  console.log('Applying schema from', schemaPath);
  await conn.query(sql);
  await conn.end();
  console.log('Schema applied.');

  await seed();
  console.log('Seed complete. You can now run `npm run dev`.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
