import { t, protectedAdminProcedure, publicProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { db } from '~/db/db';
import {
  KaTAIRecordsSchemaZod,
  JotAIRecordsSchemaZod,
  TrolleyRecordsSchemaZod
} from '~/db/schema_zod';
import { jotAI_records, kaTAI_records, bills, trolley_records, payments } from '~/db/schema';
import { delay } from '~/tools/delay';
import { eq, sql } from 'drizzle-orm';

const kaTAI_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
  type: z.literal('kaTAI'),
  data: KaTAIRecordsSchemaZod.omit({
    id: true
  })
});
const jotAI_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
  type: z.literal('jotAI'),
  data: JotAIRecordsSchemaZod.omit({
    id: true
  })
});
const trolley_add_record_input_schema = z.object({
  customer_id: z.number().int(),
  total: z.number().int(),
  rate: z.number().int(),
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

const add_bill_route = protectedAdminProcedure.input(add_record_input_schema).mutation(
  async ({
    input: DATA,
    ctx: {
      user: { id: user_id }
    }
  }) => {
    const { type, customer_id, total, rate } = DATA;
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
    const { id: bill_id } = (
      await db
        .insert(bills)
        .values({
          added_by_user_id: user_id,
          customer_id,
          rate,
          total,
          kaTAI_record: kaTAI_record_id,
          jotAI_record: jotAI_record_id,
          trolley_record: trolley_record_id
        })
        .returning()
    )[0];
    return { bill_id, kaTAI_record_id, jotAI_record_id, trolley_record_id };
  }
);

const get_bill_payments_route = publicProcedure
  .input(
    z.object({
      customer_id: z.number().int(),
      customer_uuid: z.string().uuid(),
      bill_id: z.number().int()
    })
  )
  .query(async ({ input: { customer_id, customer_uuid, bill_id } }) => {
    await delay(800);
    const bill_payments = await db.query.payments.findMany({
      where: (tbl, { eq, and }) => and(eq(tbl.bill_id, bill_id)),
      columns: {
        id: true,
        amount: true,
        timestamp: true
      },
      with: {
        bill: {
          columns: {},
          with: {
            customer: {
              columns: {
                id: true,
                uuid: true
              }
            }
          }
        }
      }
    });
    // verify for correct id and uuid
    bill_payments.forEach((pay) => {
      const customer = pay.bill.customer;
      if (customer.id !== customer_id || customer.uuid !== customer_uuid)
        throw new Error('Invalid Id or UUID');
    });
    return bill_payments.map((v) => ({
      id: v.id,
      amount: v.amount,
      timestamp: v.timestamp
    }));
  });

const submit_bill_payment_route = protectedAdminProcedure
  .input(
    z.object({
      customer_id: z.number().int(),
      customer_uuid: z.string().uuid(),
      bill_id: z.number().int(),
      amount: z.number().int().min(1)
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      message: z.enum(['already_paid', 'invalid_amount', 'added_payment'])
    })
  )
  .mutation(async ({ input: { customer_id, customer_uuid, bill_id, amount }, ctx: { user } }) => {
    const [bill_info, [{ remaining_amount }]] = await Promise.all([
      db.query.bills.findFirst({
        where: ({ id }, { eq }) => eq(id, bill_id),
        columns: {
          payment_complete: true
        },
        with: {
          customer: {
            columns: {
              id: true,
              uuid: true
            }
          }
        }
      }),
      db
        .select({
          remaining_amount: sql<number>`CAST(${bills.total} - COALESCE(SUM(${payments.amount}), 0) AS INTEGER)`
        })
        .from(bills)
        .leftJoin(payments, eq(payments.bill_id, bills.id))
        .where(eq(bills.id, bill_id))
        .groupBy(bills.id, bills.total)
        .limit(1)
    ]);
    if (!bill_info) throw new Error('Invalid Bill ID');
    if (bill_info.customer.id !== customer_id || bill_info.customer.uuid !== customer_uuid)
      throw new Error('Invalid Customer ID or UUID');
    if (bill_info.payment_complete)
      return {
        success: false,
        message: 'already_paid'
      };
    if (amount > remaining_amount)
      return {
        success: false,
        message: 'invalid_amount'
      };
    await Promise.all([
      db.insert(payments).values({
        bill_id,
        amount,
        added_by_user_id: user.id
      }),
      amount === remaining_amount &&
        db.update(bills).set({ payment_complete: true }).where(eq(bills.id, bill_id))
    ]);
    return {
      success: true,
      message: 'added_payment'
    };
  });

export const records_router = t.router({
  add_bill: add_bill_route,
  get_bill_payments: get_bill_payments_route,
  submit_bill_payment: submit_bill_payment_route
});
