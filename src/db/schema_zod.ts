import { users, customers } from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UsersSchemaZod = createSelectSchema(users);
export const CustomersSchemaZod = createSelectSchema(customers);
