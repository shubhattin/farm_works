import {
  pgTable,
  serial,
  varchar,
  pgEnum,
  uuid,
  integer,
  date,
  timestamp,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
  id: serial().primaryKey(),
  name: varchar({ length: 50 }).notNull(),
  password_hash: varchar({ length: 96 }).notNull(), // bcrypt hash (60)
  user_type: userTypeEnum().default('non-admin').notNull()
});

export const customers = pgTable(
  'customers',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }).notNull(),
    phone_number: varchar({ length: 13 }),
    address: varchar({ length: 100 }),
    uuid: uuid().defaultRandom().notNull().unique()
  },
  (table) => ({
    nameIdx: index().on(table.name)
    // only `LIKE 'NAME%` is optmizied and not `LIKE '%NAME%'`
    // the latter is inefficient as it requires a full table scan
  })
);

export const bills = pgTable(
  'bills',
  {
    id: serial().primaryKey(),
    customer_id: integer()
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    added_by_user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date().notNull(),
    rate: integer().notNull(),
    total: integer().notNull(),
    timestamp: timestamp().notNull().defaultNow(),
    kaTAI_record: integer().references(() => kaTAI_records.id),
    jotAI_record: integer().references(() => jotAI_records.id),
    trolley_record: integer().references(() => trolley_records.id)
    // ^ the individual record tables values cannot be deleted before the bill is deleetd as linked as forigen key
  },
  (table) => ({
    customerIdx: index().on(table.customer_id),
    timestampIdx: index().on(table.timestamp)
  })
);

export const payments = pgTable(
  'payments',
  {
    id: serial().primaryKey(),
    bill_id: integer()
      .notNull()
      .references(() => bills.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    timestamp: timestamp().notNull().defaultNow()
  },
  (table) => ({
    billIdx: index().on(table.bill_id),
    timestampIdx: index().on(table.timestamp)
  })
);

// kaTAI records
export const kaTAI_enum = pgEnum('kaTAI', ['dhAn', 'gehUM']);
export const kaTAI_dhAn_enum = pgEnum('kaTAI_dhAn', ['sAdA', '4x4', 'girA']);
export const kaTAI_records = pgTable('kaTAI_records', {
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
export const jotAI_records = pgTable('jotAI_records', {
  id: serial().primaryKey(),
  type: jotAI_enum().notNull(),
  kheta: integer().notNull(),
  chAsa: integer() // only when 1, 2 and 3
});

// trolley records
export const trolley_records = pgTable('trolley_records', {
  id: serial().primaryKey(),
  number: integer().notNull()
});

// relations

export const userRelations = relations(users, ({ many }) => ({
  bills: many(bills)
}));

export const customerRelations = relations(customers, ({ many }) => ({
  bills: many(bills)
}));

export const billRelations = relations(bills, ({ one, many }) => ({
  added_by_user: one(users, { fields: [bills.added_by_user_id], references: [users.id] }),
  customer: one(customers, { fields: [bills.customer_id], references: [customers.id] }),
  payments: many(payments),
  kaTAI_records: one(kaTAI_records, {
    fields: [bills.kaTAI_record],
    references: [kaTAI_records.id]
  }),
  jotAI_records: one(jotAI_records, {
    fields: [bills.jotAI_record],
    references: [jotAI_records.id]
  }),
  trolley_records: one(trolley_records, {
    fields: [bills.trolley_record],
    references: [trolley_records.id]
  })
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  bill: one(bills, { fields: [payments.bill_id], references: [bills.id] })
}));

export const kaTAIRelations = relations(kaTAI_records, ({ one }) => ({
  bill: one(bills)
}));
export const jotAIRelations = relations(jotAI_records, ({ one }) => ({
  bill: one(bills)
}));
export const trolleyRelations = relations(trolley_records, ({ one }) => ({
  bill: one(bills)
}));
