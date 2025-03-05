import { dbClient_ext as db, queryClient } from './client';
import { writeFile } from 'fs/promises';
import { dbMode, make_dir, take_input } from '~/tools/kry_server';

export const import_data = async (no_confirm = false) => {
  if (!no_confirm && !(await confirm_environemnt())) return;

  console.log(`Fetching Data from ${dbMode} Database...`);

  const user = await db.query.user.findMany();
  const account = await db.query.account.findMany();
  const verification = await db.query.verification.findMany();
  const customer = await db.query.customer.findMany();
  const bill = await db.query.bill.findMany();
  const payment = await db.query.payment.findMany();
  const jotAI_record = await db.query.jotAI_record.findMany();
  const kaTAI_record = await db.query.kaTAI_record.findMany();
  const trolley_record = await db.query.trolley_record.findMany();

  const json_data = {
    user,
    account,
    verification,
    customer,
    bill,
    payment,
    jotAI_record,
    kaTAI_record,
    trolley_record
  };

  await make_dir('./out');
  const out_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];
  await writeFile(`./out/${out_file_name}`, JSON.stringify(json_data, null, 2));
};

const isMainModule = () => {
  try {
    return import.meta.url === new URL(process.argv[1], 'file://').href;
  } catch {
    return false;
  }
};
if (isMainModule())
  import_data().then(() => {
    queryClient.end();
  });

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure SELECT from ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
