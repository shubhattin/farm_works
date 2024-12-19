import { dbClient_ext as db, queryClient } from './client';
import { writeFile } from 'fs/promises';
import { dbMode, make_dir, take_input } from '~/tools/kry_server';

const main = async () => {
  if (!(await confirm_environemnt())) return;

  console.log(`Fetching Data from ${dbMode} Database...`);

  const users = await db.query.users.findMany();
  const customers = await db.query.customers.findMany();
  const bills = await db.query.bills.findMany();
  const jotAI_records = await db.query.jotAI_records.findMany();
  const kaTAI_records = await db.query.kaTAI_records.findMany();
  const trolley_records = await db.query.trolley_records.findMany();

  const json_data = {
    users,
    customers,
    bills,
    jotAI_records,
    kaTAI_records,
    trolley_records
  };

  await make_dir('./out');
  const out_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];
  await writeFile(`./out/${out_file_name}`, JSON.stringify(json_data, null, 2));
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure SELECT from ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
