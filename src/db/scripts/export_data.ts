import { dbClient_ext as db, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry_server';
import { users } from '~/db/schema';
import { UsersSchemaZod } from '~/db/schema_zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const main = async () => {
  /*
   Better backup & restore tools like `pg_dump` and `pg_restore` should be used.
  
   Although Here the foriegn key relations are not that complex so we are doing it manually
  */
  if (!(await confirm_environemnt())) return;

  console.log(`Insering Data into ${dbMode} Database...`);

  const in_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];

  const data = z
    .object({
      users: z.array(UsersSchemaZod)
    })
    .parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  // insertig users
  try {
    await db.delete(users);
    await db.insert(users).values(data.users);
    // reset  SERIAL
    await db.execute(sql`SELECT setval('users_id_seq', (select MAX(id) from users))`);
    console.log('Successfully added values into table `users`');
  } catch {}
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure INSERT in ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
