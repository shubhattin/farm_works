import { z } from 'zod';
import {
  user,
  customer,
  jotAI_record,
  kaTAI_record,
  trolley_record,
  bill,
  payment,
  account,
  verification
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UserSchemaZod = createSelectSchema(user, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banExpires: z.coerce.date().nullable()
});
export const AccountSchemaZod = createSelectSchema(account, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable()
});
export const VerificationSchemaZod = createSelectSchema(verification, {
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date()
});

export const CustomerSchemaZod = createSelectSchema(customer);
export const BillSchemaZod = createSelectSchema(bill, {
  timestamp: z.coerce.date(),
  date: z.coerce.date()
});
export const KaTAIRecordSchemaZod = createSelectSchema(kaTAI_record);
export const JotAIRecordSchemaZod = createSelectSchema(jotAI_record);
export const TrolleyRecordSchemaZod = createSelectSchema(trolley_record);
export const PaymentSchemaZod = createSelectSchema(payment, {
  timestamp: z.coerce.date(),
  date: z.coerce.date()
});

// enums
// export const UserTypeEnumZod = z.enum(userTypeEnum.enumValues);
// export const JotAIEnumZod = z.enum(jotAI_enum.enumValues);
// export const KaTAIEnumZod = z.enum(kaTAI_enum.enumValues);
// export const KaTAIDhAnEnumZod = z.enum(kaTAI_dhAn_enum.enumValues);
