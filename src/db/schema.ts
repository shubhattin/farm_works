import {
  pgTable,
  serial,
  varchar,
  pgEnum,
  uuid,
  integer,
  timestamp,
  index,
  boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user, account } from './auth-schema';

export const customer = pgTable(
  'customer',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }).notNull(),
    phone_number: varchar({ length: 13 }),
    address: varchar({ length: 100 }),
    uuid: uuid().defaultRandom().notNull().unique()
  },
  (table) => [index('customer_uuidIdx').on(table.uuid)]
);

export const bill = pgTable(
  'bill',
  {
    id: serial().primaryKey(),
    customer_id: integer()
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    added_by_user_id: integer()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    payment_complete: boolean().notNull().default(false),
    rate: integer().notNull(),
    total: integer().notNull(),
    date: timestamp({ withTimezone: true }).notNull(),
    // ^ date is the date indended to be recored
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
    kaTAI_record: integer().references(() => kaTAI_record.id),
    jotAI_record: integer().references(() => jotAI_record.id),
    trolley_record: integer().references(() => trolley_record.id)
    // ^ the individual record tables values cannot be deleted before the bill is deleetd as linked as forigen key
  },
  (table) => [
    index('bill_customerIdx').on(table.customer_id),
    index('bill_timestampIdx').on(table.timestamp),
    index('bill_dateIdx').on(table.date),
    index('bill_paymentCompleteIdx').on(table.payment_complete)
  ]
);

export const payment = pgTable(
  'payment',
  {
    id: serial().primaryKey(),
    bill_id: integer()
      .notNull()
      .references(() => bill.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    added_by_user_id: integer()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: timestamp({ withTimezone: true }).notNull(),
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('payment_billIdx').on(table.bill_id),
    index('payment_timestampIdx').on(table.timestamp),
    index('payment_dateIdx').on(table.date)
  ]
);

// kaTAI records
export const kaTAI_enum = pgEnum('kaTAI', ['dhAn', 'gehUM']);
export const kaTAI_dhAn_enum = pgEnum('kaTAI_dhAn', ['sAdA', '4x4', 'girA']);
export const kaTAI_record = pgTable('kaTAI_record', {
  id: serial().primaryKey(),
  type: kaTAI_enum().notNull(),
  kheta: integer().notNull(),
  dhAna_type: kaTAI_dhAn_enum() // only if type is dhAn
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
export const jotAI_record = pgTable('jotAI_record', {
  id: serial().primaryKey(),
  type: jotAI_enum().notNull(),
  kheta: integer().notNull(),
  chAsa: integer() // only when 1, 2 and 3
});

// trolley records
export const trolley_record = pgTable('trolley_record', {
  id: serial().primaryKey(),
  number: integer().notNull()
});

// relations

export const userRelations = relations(user, ({ many }) => ({
  bills: many(bill),
  accounts: many(account)
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const customerRelations = relations(customer, ({ many }) => ({
  bills: many(bill)
}));

export const billRelations = relations(bill, ({ one, many }) => ({
  added_by_user: one(user, { fields: [bill.added_by_user_id], references: [user.id] }),
  customer: one(customer, { fields: [bill.customer_id], references: [customer.id] }),
  payments: many(payment),
  kaTAI_records: one(kaTAI_record, {
    fields: [bill.kaTAI_record],
    references: [kaTAI_record.id]
  }),
  jotAI_records: one(jotAI_record, {
    fields: [bill.jotAI_record],
    references: [jotAI_record.id]
  }),
  trolley_records: one(trolley_record, {
    fields: [bill.trolley_record],
    references: [trolley_record.id]
  })
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  bill: one(bill, { fields: [payment.bill_id], references: [bill.id] }),
  added_by_user: one(user, { fields: [payment.added_by_user_id], references: [user.id] })
}));

export const kaTAIRelations = relations(kaTAI_record, ({ one }) => ({
  bill: one(bill)
}));
export const jotAIRelations = relations(jotAI_record, ({ one }) => ({
  bill: one(bill)
}));
export const trolleyRelations = relations(trolley_record, ({ one }) => ({
  bill: one(bill)
}));
