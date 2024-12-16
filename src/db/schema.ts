import { pgTable, serial, varchar, char, pgEnum, uuid, boolean } from 'drizzle-orm/pg-core';

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
