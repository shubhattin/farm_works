import { pgTable, serial, varchar, char, pgEnum, uuid, boolean } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull(),
  password_hash: char('password_hash', { length: 96 }).notNull(), // SHA-256 hash + salt of length 32
  user_type: userTypeEnum('user_type').default('non-admin').notNull(),
  is_customer: boolean('is_customer').default(true).notNull(),
  uuid: uuid('uuid').notNull()
});
