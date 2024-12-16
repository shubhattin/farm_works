import {
  users,
  customers,
  jotAI_records,
  kaTAI_records,
  trolley_records,
  transactions
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UsersSchemaZod = createSelectSchema(users);
export const CustomersSchemaZod = createSelectSchema(customers);
export const TransactionsSchemaZod = createSelectSchema(transactions);
export const KaTAIRecordsSchemaZod = createSelectSchema(kaTAI_records);
export const JotAIRecordsSchemaZod = createSelectSchema(jotAI_records);
export const TrolleyRecordsSchemaZod = createSelectSchema(trolley_records);
