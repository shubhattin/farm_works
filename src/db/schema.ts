import { pgTable, serial, varchar, char, pgEnum, uuid, integer, date } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  password_hash: char('password_hash', { length: 96 }).notNull(), // SHA-256 hash + salt of length 32
  user_type: userTypeEnum('user_type').default('non-admin').notNull()
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  phone_number: varchar('phone_number', { length: 13 }),
  address: varchar('address', { length: 100 }),
  uuid: uuid('uuid').notNull() // will be generated manually on insert
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  customer_id: integer('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'no action' }),
  date: date('date').notNull(),
  rate: integer('rate').notNull(),
  total: integer('total').notNull(),
  kaTAI_records: integer('kaTAI_records').references(() => kaTAI_records.id),
  jotAI_records: integer('jotAI_records').references(() => jotAI_records.id),
  trolley_records: integer('trolley_records').references(() => trolley_records.id)
});

// kaTAI records
export const kaTAI_enum = pgEnum('kaTAI', ['dhAn', 'gehUM']);
export const kaTAI_dhAn_enum = pgEnum('kaTAI_dhAn', ['sAdA', '4x4', 'girA']);
export const kaTAI_records = pgTable('kaTAI_records', {
  id: serial('id').primaryKey(),
  type: kaTAI_enum('type').notNull(),
  kheta: integer('kheta').notNull(),
  dhAna_type: kaTAI_dhAn_enum('dhAna_type') // only if type is dhAn
});

// jotAI records
export const jotAI_enum = pgEnum('jotAI', [
  'rota_meter',
  'cultivator',
  'tAva',
  'meDza',
  'lohaDzI',
  'super_seeder'
]);
export const jotAI_records = pgTable('jotAI_records', {
  id: serial('id').primaryKey(),
  type: jotAI_enum('type').notNull(),
  kheta: integer('kheta').notNull(),
  chAsa: integer('chAsa') // only when 1, 2 and 3
});

// trolley records
export const trolley_records = pgTable('trolley_records', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull()
});
