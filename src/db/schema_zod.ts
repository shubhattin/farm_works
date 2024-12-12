import { users } from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UsersSchemaZod = createSelectSchema(users);
