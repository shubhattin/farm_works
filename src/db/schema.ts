import { pgTable, serial, date, varchar, integer, text, char, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 15 }).notNull(),
  password: char('password', { length: 96 }).notNull(), // SHA-256 hash + salt of length 32
  user_type: userTypeEnum('user_type').default('non-admin').notNull()
});
