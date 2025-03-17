import { dbClient_ext as db, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry_server';
import {
  customer,
  user,
  account,
  verification,
  bill,
  jotAI_record,
  kaTAI_record,
  trolley_record,
  payment
} from '~/db/schema';
import {
  UserSchemaZod,
  AccountSchemaZod,
  VerificationSchemaZod,
  CustomerSchemaZod,
  BillSchemaZod,
  JotAIRecordSchemaZod,
  KaTAIRecordSchemaZod,
  TrolleyRecordSchemaZod,
  PaymentSchemaZod
} from '~/db/schema_zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

const main = async () => {
  /*
   Better backup & restore tools like `pg_dump` and `pg_restore` should be used.
  
   Although Here the foriegn key relations are not that complex so we are doing it manually
  */
  if (!(await confirm_environemnt())) return;

  console.log(chalk.cyan(`Inserting Data into ${chalk.bold(dbMode)} Database...`));

  const in_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];

  const data = z
    .object({
      user: z.array(UserSchemaZod),
      account: z.array(AccountSchemaZod),
      verification: z.array(VerificationSchemaZod),
      customer: z.array(CustomerSchemaZod),
      bill: z.array(BillSchemaZod),
      jotAI_record: z.array(JotAIRecordSchemaZod),
      kaTAI_record: z.array(KaTAIRecordSchemaZod),
      trolley_record: z.array(TrolleyRecordSchemaZod),
      payment: z.array(PaymentSchemaZod)
    })
    .parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  // deleting all the tables initially
  try {
    await db.delete(payment);
    await db.delete(bill);
    await db.delete(jotAI_record);
    await db.delete(kaTAI_record);
    await db.delete(trolley_record);
    await db.delete(customer);
    await db.delete(user);
    await db.delete(account);
    await db.delete(verification);
    console.log(chalk.green('✓ Deleted All Tables Successfully'));
  } catch (e) {
    console.log(chalk.red('✗ Error while deleting tables:'), chalk.yellow(e));
  }

  // inserting users
  try {
    await db.insert(user).values(data.user);
    console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`users`'));
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting users:'), chalk.yellow(e));
  }

  // inserting account
  try {
    await db.insert(account).values(data.account);
    console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`account`'));
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting account:'), chalk.yellow(e));
  }

  // inserting verification
  try {
    await db.insert(verification).values(data.verification);
    console.log(
      chalk.green('✓ Successfully added values into table'),
      chalk.blue('`verification`')
    );
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting verification:'), chalk.yellow(e));
  }

  // inserting customers
  try {
    await db.insert(customer).values(data.customer);
    console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`customers`'));
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting customers:'), chalk.yellow(e));
  }

  // inserting jotAI_records
  try {
    await db.insert(jotAI_record).values(data.jotAI_record);
    console.log(
      chalk.green('✓ Successfully added values into table'),
      chalk.blue('`jotAI_records`')
    );
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting jotAI_records:'), chalk.yellow(e));
  }

  // inserting kaTAI_records
  try {
    await db.insert(kaTAI_record).values(data.kaTAI_record);
    console.log(
      chalk.green('✓ Successfully added values into table'),
      chalk.blue('`kaTAI_records`')
    );
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting kaTAI_records:'), chalk.yellow(e));
  }

  // inserting trolley_records
  try {
    await db.insert(trolley_record).values(data.trolley_record);
    console.log(
      chalk.green('✓ Successfully added values into table'),
      chalk.blue('`trolley_records`')
    );
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting trolley_records:'), chalk.yellow(e));
  }

  // inserting bills
  try {
    await db.insert(bill).values(data.bill);
    console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`bills`'));
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting bills:'), chalk.yellow(e));
  }

  // inserting payments
  try {
    await db.insert(payment).values(data.payment);
    console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`payments`'));
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting payments:'), chalk.yellow(e));
  }

  // resetting SERIAL
  try {
    await db.execute(sql`SELECT setval('"customer_id_seq"', (select MAX(id) from "customer"))`);
    await db.execute(sql`SELECT setval('"bill_id_seq"', (select MAX(id) from "bill"))`);
    await db.execute(
      sql`SELECT setval('"jotAI_record_id_seq"', (select MAX(id) from "jotAI_record"))`
    );
    await db.execute(
      sql`SELECT setval('"kaTAI_record_id_seq"', (select MAX(id) from "kaTAI_record"))`
    );
    await db.execute(
      sql`SELECT setval('"trolley_record_id_seq"', (select MAX(id) from "trolley_record"))`
    );
    console.log(chalk.green('✓ Successfully resetted ALL SERIAL'));
  } catch (e) {
    console.log(chalk.red('✗ Error while resetting SERIAL:'), chalk.yellow(e));
  }
};

main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(
    chalk.yellow(`Are you sure to INSERT in ${chalk.bold(dbMode)}? `)
  );
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
