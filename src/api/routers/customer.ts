import { t, protectedAdminProcedure, protectedProcedure, publicProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { bills, customers, payments } from '~/db/schema';
import { db } from '~/db/db';
import { desc, eq, like, max, sql } from 'drizzle-orm';
import { delay } from '~/tools/delay';

const register_customer_route = protectedAdminProcedure
  .input(
    z.object({
      name: z.string().min(2).max(50),
      phone_number: z.string().min(10).max(13).nullable(),
      address: z.string().min(5).max(100).nullable()
    })
  )
  .mutation(async ({ input: { name, address, phone_number } }) => {
    const inserted = (
      await db.insert(customers).values({ name: name.trim(), phone_number, address }).returning()
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
        customer_id: customers.id,
        customer_name: customers.name,
        customer_uuid: customers.uuid,
        total_amount: sql<number>`CAST(
      COALESCE(
        SUM(CASE WHEN ${bills.payment_complete} = false THEN ${bills.total} ELSE 0 END)
      , 0) 
    AS INTEGER)`,
        remaining_amount: sql<number>`CAST(
      COALESCE(
        SUM(CASE WHEN ${bills.payment_complete} = false THEN ${bills.total} ELSE 0 END) -
        (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM ${payments} p
          INNER JOIN ${bills} b ON b.id = p.bill_id
          WHERE b.customer_id = ${customers.id}
          AND b.payment_complete = false
        )
      , 0) 
    AS INTEGER)`
      })
      .from(customers)
      .leftJoin(bills, eq(bills.customer_id, customers.id))
      .groupBy(customers.id, customers.name, customers.uuid)
      .orderBy(desc(sql`COALESCE(MAX(${bills.timestamp}), '1970-01-01'::timestamp)`))
      .limit(30);
    // only doing aggregation on uncompleted bill paymenents

    const customers_list = await (search_term.match(/^\d+$/)
      ? baseQuery.where(eq(customers.id, parseInt(search_term)))
      : baseQuery.where(like(customers.name, `%${search_term}%`)));

    return customers_list;
  });

export const get_customers_data_func = async (customer_id: number, customer_uuid: string) => {
  const customer_exists = await db.query.customers.findFirst({
    where: ({ id, uuid }, { eq, and }) => and(eq(id, customer_id), eq(uuid, customer_uuid)),
    columns: {
      id: true
    }
  });
  if (!customer_exists) throw new Error('Invalid Customer ID or UUID');

  const data_prom = db.query.customers.findFirst({
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
      customer_id: customers.id,
      customer_name: customers.name,
      total_amount: sql<number>`CAST(
        COALESCE(
          SUM(CASE WHEN ${bills.payment_complete} = false THEN ${bills.total} ELSE 0 END)
        , 0) AS INTEGER
      )`,
      total_paid: sql<number>`CAST(
        COALESCE(
          (
            SELECT COALESCE(SUM(p.amount), 0)
            FROM ${payments} AS p
            INNER JOIN ${bills} AS b ON b.id = p.bill_id
            WHERE b.customer_id = ${customers.id}
            AND b.payment_complete = false
          )
        , 0) AS INTEGER
      )`,
      remaining_amount: sql<number>`(
        CAST(
          COALESCE(
            SUM(CASE WHEN ${bills.payment_complete} = false THEN ${bills.total} ELSE 0 END)
          , 0) AS INTEGER
        ) - 
        CAST(
          COALESCE(
            (
              SELECT COALESCE(SUM(p.amount), 0)
              FROM ${payments} AS p
              INNER JOIN ${bills} AS b ON b.id = p.bill_id
              WHERE b.customer_id = ${customers.id}
              AND b.payment_complete = false
            )
          , 0) AS INTEGER
        )
      )`
    })
    .from(customers)
    .leftJoin(bills, eq(bills.customer_id, customers.id))
    .where(eq(customers.id, customer_id))
    .groupBy(customers.id, customers.name)
    .limit(1);

  const bills_remaning_amounts_prom = db
    .select({
      bill_id: bills.id,
      remaining_amount: sql<number>`CAST(
      ${bills.total} - COALESCE(SUM(${payments.amount}), 0)
    AS INTEGER)`
    })
    .from(bills)
    .leftJoin(payments, eq(payments.bill_id, bills.id))
    .where(eq(bills.customer_id, customer_id))
    .groupBy(bills.id, bills.total) // Added bills.total to groupBy
    .orderBy(desc(bills.date), desc(bills.id));
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

export const customer_router = t.router({
  register_customer: register_customer_route,
  get_customers_list: get_customers_list_route,
  get_customers_data: get_customers_data_route
});
