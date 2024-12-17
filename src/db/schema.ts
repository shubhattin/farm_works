import { pgTable, serial, varchar, char, pgEnum, uuid, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  added_by_user_id: integer('added_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'no action' }),
  date: date('date').notNull(),
  rate: integer('rate').notNull(),
  total: integer('total').notNull(),
  kaTAI_records: integer('kaTAI_records').references(() => kaTAI_records.id),
  jotAI_records: integer('jotAI_records').references(() => jotAI_records.id),
  trolley_records: integer('trolley_records').references(() => trolley_records.id)
  // ^ the individual record tables values cannot be deleted before the transaction is deleetd as linked as forigen key
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

// relations

export const userRelations = relations(users, ({ many }) => ({
  transactions: many(transactions)
}));

export const customerRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions)
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  added_by_user: one(users, { fields: [transactions.added_by_user_id], references: [users.id] }),
  customer: one(customers, { fields: [transactions.customer_id], references: [customers.id] }),
  kaTAI_records: one(kaTAI_records, {
    fields: [transactions.kaTAI_records],
    references: [kaTAI_records.id]
  }),
  jotAI_records: one(jotAI_records, {
    fields: [transactions.jotAI_records],
    references: [jotAI_records.id]
  }),
  trolley_records: one(trolley_records, {
    fields: [transactions.trolley_records],
    references: [trolley_records.id]
  })
}));

export const kaTAIRelations = relations(kaTAI_records, ({ one }) => ({
  transaction: one(transactions)
}));
export const jotAIRelations = relations(jotAI_records, ({ one }) => ({
  transaction: one(transactions)
}));
export const trolleyRelations = relations(trolley_records, ({ one }) => ({
  transaction: one(transactions)
}));
