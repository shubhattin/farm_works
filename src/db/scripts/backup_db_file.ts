import * as fs from 'fs';
import { z } from 'zod';
import { execSync } from 'child_process';

import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '../../../.env.local' });

const OUT_FOLDER = './backup';

async function main() {
  if (!fs.existsSync(OUT_FOLDER)) fs.mkdirSync(OUT_FOLDER);

  const envs_parsed = z
    .object({
      PG_DATABASE_URL: z.string()
    })
    .safeParse(process.env);
  if (!envs_parsed.success) {
    console.error(envs_parsed.error);
    return;
  }
  const envs = envs_parsed.data;

  if (!process.argv.slice(2).includes('--only-trans')) {
    // Backup using pg_dump
    execSync(
      `pg_dump --dbname=${envs.PG_DATABASE_URL} --if-exists --clean --insert --no-owner --rows-per-insert=8000 -f b.sql`
    );
    const backup_file_data = fs.readFileSync('b.sql').toString('utf-8');
    fs.writeFileSync(`${OUT_FOLDER}/db_dump.sql`, backup_file_data, {
      encoding: 'utf-8'
    });
    fs.rmSync('b.sql');
  }
}

main();
