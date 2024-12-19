import { z } from 'zod';
import { users, customers, jotAI_records, kaTAI_records, trolley_records, bills } from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UsersSchemaZod = createSelectSchema(users);
export const CustomersSchemaZod = createSelectSchema(customers);
export const BillsSchemaZod = createSelectSchema(bills);
export const KaTAIRecordsSchemaZod = createSelectSchema(kaTAI_records);
export const JotAIRecordsSchemaZod = createSelectSchema(jotAI_records);
export const TrolleyRecordsSchemaZod = createSelectSchema(trolley_records);

// enums
// export const UserTypeEnumZod = z.enum(userTypeEnum.enumValues);
// export const JotAIEnumZod = z.enum(jotAI_enum.enumValues);
// export const KaTAIEnumZod = z.enum(kaTAI_enum.enumValues);
// export const KaTAIDhAnEnumZod = z.enum(kaTAI_dhAn_enum.enumValues);
