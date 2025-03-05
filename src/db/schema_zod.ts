import { z } from 'zod';
import {
  users,
  customer,
  jotAI_record,
  kaTAI_record,
  trolley_record,
  bill,
  payment
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UsersSchemaZod = createSelectSchema(users);
export const CustomersSchemaZod = createSelectSchema(customer);
export const BillsSchemaZod = createSelectSchema(bill, {
  timestamp: z.coerce.date(),
  date: z.coerce.date()
});
export const KaTAIRecordsSchemaZod = createSelectSchema(kaTAI_record);
export const JotAIRecordsSchemaZod = createSelectSchema(jotAI_record);
export const TrolleyRecordsSchemaZod = createSelectSchema(trolley_record);
export const PaymentsSchemaZod = createSelectSchema(payment, {
  timestamp: z.coerce.date(),
  date: z.coerce.date()
});

// enums
// export const UserTypeEnumZod = z.enum(userTypeEnum.enumValues);
// export const JotAIEnumZod = z.enum(jotAI_enum.enumValues);
// export const KaTAIEnumZod = z.enum(kaTAI_enum.enumValues);
// export const KaTAIDhAnEnumZod = z.enum(kaTAI_dhAn_enum.enumValues);
