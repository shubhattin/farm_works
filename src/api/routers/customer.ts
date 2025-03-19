import { t, protectedAdminProcedure, protectedProcedure, publicProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { bill, customer, payment } from '~/db/schema';
import { db } from '~/db/db';
import { and, desc, eq, like, sql } from 'drizzle-orm';
import { delay } from '~/tools/delay';
import { CACHE_KEYS, CACHE_WRITE_DELAY, redis } from '~/db/redis';
import ms from 'ms';

const register_customer_route = protectedAdminProcedure
  .input(
    z.object({
      name: z.string().min(2).max(50),
      phone_number: z.string().min(10).max(13).nullable(),
      address: z.string().min(3).max(100).nullable()
    })
  )
  .mutation(async ({ input: { name, address, phone_number } }) => {
    const inserted = (
      await db.insert(customer).values({ name: name.trim(), phone_number, address }).returning()
    )[0];
    return {
      id: inserted.id
    };
  });

const get_customers_list_route = protectedProcedure
  .input(z.object({ search_term: z.string().optional().default('') }))
  .query(async ({ input: { search_term } }) => {
    await delay(600);

    const baseQuery = db
      .select({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_uuid: customer.uuid,
        total_amount: sql<number>`CAST(
      COALESCE(
        SUM(CASE WHEN ${bill.payment_complete} = false THEN ${bill.total} ELSE 0 END)
      , 0) 
    AS INTEGER)`,
        remaining_amount: sql<number>`CAST(
      COALESCE(
        SUM(CASE WHEN ${bill.payment_complete} = false THEN ${bill.total} ELSE 0 END) -
        (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM ${payment} p
          INNER JOIN ${bill} b ON b.id = p.bill_id
          WHERE b.customer_id = ${customer.id}
          AND b.payment_complete = false
        )
      , 0) 
    AS INTEGER)`
      })
      .from(customer)
      .leftJoin(bill, eq(bill.customer_id, customer.id))
      .groupBy(customer.id, customer.name, customer.uuid)
      .orderBy(desc(sql`COALESCE(MAX(${bill.timestamp}), '1970-01-01'::timestamp)`))
      .limit(30);
    // only doing aggregation on uncompleted bill paymenents

    const customers_list = await (search_term.match(/^\d+$/)
      ? baseQuery.where(eq(customer.id, parseInt(search_term)))
      : baseQuery.where(like(customer.name, `%${search_term}%`)));

    return customers_list;
  });

export const get_customers_data_func = async (customer_id: number, customer_uuid: string) => {
  const customer_exists = await db.query.customer.findFirst({
    where: ({ id, uuid }, { eq, and }) => and(eq(id, customer_id), eq(uuid, customer_uuid)),
    columns: {
      id: true
    }
  });
  if (!customer_exists) throw new Error('Invalid Customer ID or UUID');

  const data_prom = db.query.customer.findFirst({
    where: ({ id }, { eq }) => eq(id, customer_id),
    columns: {
      id: true
    },
    with: {
      bills: {
        columns: {
          id: true,
          total: true,
          rate: true,
          date: true,
          payment_complete: true
        },
        orderBy: ({ date, id }, { desc }) => [desc(date), desc(id)],
        with: {
          jotAI_records: true,
          kaTAI_records: true,
          trolley_records: true
        }
      }
    }
  });
  const customer_info_prom = db
    .select({
      customer_id: customer.id,
      customer_name: customer.name,
      total_amount: sql<number>`CAST(
        COALESCE(
          SUM(CASE WHEN ${bill.payment_complete} = false THEN ${bill.total} ELSE 0 END)
        , 0) AS INTEGER
      )`,
      total_paid: sql<number>`CAST(
        COALESCE(
          (
            SELECT COALESCE(SUM(p.amount), 0)
            FROM ${payment} AS p
            INNER JOIN ${bill} AS b ON b.id = p.bill_id
            WHERE b.customer_id = ${customer.id}
            AND b.payment_complete = false
          )
        , 0) AS INTEGER
      )`,
      remaining_amount: sql<number>`(
        CAST(
          COALESCE(
            SUM(CASE WHEN ${bill.payment_complete} = false THEN ${bill.total} ELSE 0 END)
          , 0) AS INTEGER
        ) - 
        CAST(
          COALESCE(
            (
              SELECT COALESCE(SUM(p.amount), 0)
              FROM ${payment} AS p
              INNER JOIN ${bill} AS b ON b.id = p.bill_id
              WHERE b.customer_id = ${customer.id}
              AND b.payment_complete = false
            )
          , 0) AS INTEGER
        )
      )`
    })
    .from(customer)
    .leftJoin(bill, eq(bill.customer_id, customer.id))
    .where(eq(customer.id, customer_id))
    .groupBy(customer.id, customer.name)
    .limit(1);

  const bills_remaning_amounts_prom = db
    .select({
      bill_id: bill.id,
      remaining_amount: sql<number>`CAST(
      ${bill.total} - COALESCE(SUM(${payment.amount}), 0)
    AS INTEGER)`
    })
    .from(bill)
    .leftJoin(payment, eq(payment.bill_id, bill.id))
    .where(eq(bill.customer_id, customer_id))
    .groupBy(bill.id, bill.total) // Added bills.total to groupBy
    .orderBy(desc(bill.date), desc(bill.id));
  /*
  Sorting both the fields by timestamp and id in descending order
  This is to ensure that the entries(ids) in both of them are in same order
  As timestamps (possibly) can be same
  */

  const [data, customer_info, remaining_amounts] = await Promise.all([
    data_prom,
    customer_info_prom,
    bills_remaning_amounts_prom
  ]);
  // console.log(data!.bills, remaining_amounts);
  return {
    customer_info: customer_info[0],
    bills: data!.bills.map((bill, i) => ({
      ...bill,
      remaining_amount: remaining_amounts[i].remaining_amount
    }))
  };
};
const get_customers_data_route = publicProcedure
  .input(
    z.object({
      customer_id: z.number().int(),
      customer_uuid: z.string().uuid()
    })
  )
  .query(async ({ input: { customer_id, customer_uuid } }) => {
    await delay(700);
    return await get_customers_data_func(customer_id, customer_uuid);
  });

export const get_customer_additional_data_route = protectedProcedure
  .input(
    z.object({
      customer_id: z.number().int(),
      customer_uuid: z.string().uuid()
    })
  )
  .query(async ({ input: { customer_id, customer_uuid } }) => {
    await delay(100);
    type return_type = {
      id: number;
      phone_number: string | null;
      address: string | null;
    };
    const cache = await redis.get<return_type>(CACHE_KEYS.additional_customer_info(customer_id));
    if (cache) return cache;
    const data = await db.query.customer.findFirst({
      where: ({ id, uuid }, { eq, and }) => and(eq(id, customer_id), eq(uuid, customer_uuid)),
      columns: {
        id: true,
        phone_number: true,
        address: true
      }
    });
    setTimeout(async () => {
      await redis.set(CACHE_KEYS.additional_customer_info(customer_id), data!, {
        ex: ms('15days') / 1000
      });
    }, CACHE_WRITE_DELAY);
    return data! satisfies return_type;
  });

const edit_customer_info_route = protectedAdminProcedure
  .input(
    z.object({
      customer_id: z.number().int(),
      customer_uuid: z.string().uuid(),
      name: z.string().min(2).max(50),
      phone_number: z.string().min(10).max(13).nullable(),
      address: z.string().min(3).max(100).nullable()
    })
  )
  .mutation(async ({ input: { customer_id, customer_uuid, name, phone_number, address } }) => {
    await delay(650);
    await Promise.allSettled([
      db
        .update(customer)
        .set({ name, phone_number, address })
        .where(and(eq(customer.id, customer_id), eq(customer.uuid, customer_uuid))),
      redis.del(CACHE_KEYS.additional_customer_info(customer_id))
    ]);
  });

export const customer_router = t.router({
  register_customer: register_customer_route,
  get_customers_list: get_customers_list_route,
  get_customers_data: get_customers_data_route,
  get_customer_additional_data: get_customer_additional_data_route,
  edit_customer_info: edit_customer_info_route
});
