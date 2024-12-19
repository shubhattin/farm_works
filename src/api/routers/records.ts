import { t, protectedAdminProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { db } from '~/db/db';
import {
  KaTAIRecordsSchemaZod,
  JotAIRecordsSchemaZod,
  TrolleyRecordsSchemaZod
} from '~/db/schema_zod';
import { jotAI_records, kaTAI_records, bills, trolley_records } from '~/db/schema';

const kaTAI_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
  date: z.coerce.date(),
  type: z.literal('kaTAI'),
  data: KaTAIRecordsSchemaZod.omit({
    id: true
  })
});
const jotAI_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
  date: z.coerce.date(),
  type: z.literal('jotAI'),
  data: JotAIRecordsSchemaZod.omit({
    id: true
  })
});
const trolley_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
  date: z.coerce.date(),
  type: z.literal('trolley'),
  data: TrolleyRecordsSchemaZod.omit({
    id: true
  })
});
const add_record_input_schema = z.discriminatedUnion('type', [
  kaTAI_add_record_input_schema,
  jotAI_add_record_input_schema,
  trolley_add_record_input_schema
]);

const add_record_route = protectedAdminProcedure.input(add_record_input_schema).mutation(
  async ({
    input: DATA,
    ctx: {
      user: { id: user_id }
    }
  }) => {
    const { type, customer_id, total, rate, date } = DATA;
    let kaTAI_record_id = null;
    let jotAI_record_id = null;
    let trolley_record_id = null;
    if (type === 'kaTAI') {
      const { dhAna_type, kheta, type: kaTAI_type } = DATA.data;
      const { id } = (
        await db
          .insert(kaTAI_records)
          .values({
            kheta,
            dhAna_type,
            type: kaTAI_type
          })
          .returning()
      )[0];
      kaTAI_record_id = id;
    } else if (type === 'jotAI') {
      const { chAsa, kheta, type: jotAI_type } = DATA.data;
      const { id } = (
        await db
          .insert(jotAI_records)
          .values({
            kheta,
            chAsa,
            type: jotAI_type
          })
          .returning()
      )[0];
      jotAI_record_id = id;
    } else if (type === 'trolley') {
      const { number } = DATA.data;
      const { id } = (
        await db
          .insert(trolley_records)
          .values({
            number
          })
          .returning()
      )[0];
      trolley_record_id = id;
    }
    const { id: transaction_id } = (
      await db
        .insert(bills)
        .values({
          added_by_user_id: user_id,
          customer_id,
          date: date.toISOString(),
          rate,
          total,
          kaTAI_record: kaTAI_record_id,
          jotAI_record: jotAI_record_id,
          trolley_record: trolley_record_id
        })
        .returning()
    )[0];
    return { transaction_id, kaTAI_record_id, jotAI_record_id, trolley_record_id };
  }
);

export const records_router = t.router({
  add_record: add_record_route
});
