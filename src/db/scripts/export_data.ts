import { dbClient_ext as db, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry_server';
import {} from '~/db/schema';
import {} from '~/db/schema_zod';
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

  const data = z.object({}).parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  // insertig users
  try {
    // await db.insert(users).values(data.users);
    // // reset  SERIAL
    // await db.execute(sql`SELECT setval('users_id_seq', (select MAX(id) from users))`);
    // console.log('Successfully added values into table `users`');
  } catch {}

  // insertig rent_data
  try {
    // await db.insert(rent_data).values(data.rent_data);
    // console.log('Successfully added values into table `rent_data`');
    // // reset  SERIAL
    // await db.execute(sql`SELECT setval('rent_data_id_seq', (select MAX(id) from rent_data))`);
  } catch {}

  // insertig others
  try {
    // data.others.length !== 0 && (await db.insert(others).values(data.others));
    // console.log('Successfully added values into table `others`');
  } catch {}

  try {
    // // insertig verification requests
    // data.verification_requests.length !== 0 &&
    //   (await db.insert(verification_requests).values(data.verification_requests));
    // // reset  SERIAL
    // await db.execute(
    //   sql`SELECT setval('verification_requests_id_seq', (select MAX(id) from verification_requests))`
    // );
    // console.log('Successfully added values into table `verification_requests`');
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
