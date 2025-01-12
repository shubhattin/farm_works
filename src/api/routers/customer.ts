import { t, protectedAdminProcedure, protectedProcedure } from '~/api/trpc_init';
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

const get_customers_list_route1 = protectedAdminProcedure.query(async () => {
  const customers = await db.query.customers.findMany({
    columns: {
      id: true,
      name: true
    }
  });
  return customers;
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
        // last_bill_date: max(bills.timestamp),
        total_amount: sql<number>`COALESCE(SUM(CASE WHEN ${bills.payment_complete} = false THEN ${bills.total} ELSE 0 END), 0)`,
        // total_paid: sql<number>`
        //   COALESCE(
        //     SUM(
        //       CASE WHEN ${bills.payment_complete} = false THEN
        //         (
        //           SELECT COALESCE(SUM(${payments.amount}), 0)
        //           FROM ${payments}
        //           WHERE ${payments.bill_id} = ${bills.id}
        //         )
        //       ELSE 0 END
        //     ),
        //     0
        //   )
        // `,
        remaining_amount: sql<number>`
          COALESCE(
            SUM(
              CASE WHEN ${bills.payment_complete} = false THEN
                ${bills.total} - (
                  SELECT COALESCE(SUM(${payments.amount}), 0)
                  FROM ${payments}
                  WHERE ${payments.bill_id} = ${bills.id}
                )
              ELSE 0 END
            ),
            0
          )
        `
      })
      .from(customers)
      .leftJoin(bills, eq(bills.customer_id, customers.id))
      .groupBy(customers.id, customers.name)
      .orderBy(desc(max(bills.timestamp)))
      .limit(30);

    const customers_list = await (search_term.match(/^\d+$/)
      ? baseQuery.where(eq(customers.id, parseInt(search_term)))
      : baseQuery.where(like(customers.name, `%${search_term}%`)));

    return customers_list;
  });

export const get_customers_data_func = async (customer_id: number) => {
  const data_prom = db.query.customers.findMany({
    where: ({ id }, { eq }) => eq(id, customer_id),
    columns: {
      name: true,
      id: true,
      uuid: true
    },
    with: {
      bills: {
        columns: {
          id: true,
          total: true,
          rate: true,
          payment_complete: true,
          date: true
        },
        orderBy: ({ timestamp }, { desc }) => desc(timestamp),
        with: {
          jotAI_records: true,
          kaTAI_records: true,
          trolley_records: true,
          payments: true
        }
      }
    }
  });
  return (await data_prom)!;
};
const get_customers_data_route = protectedProcedure
  .input(
    z.object({
      customer_id: z.number().int()
    })
  )
  .query(async ({ input: { customer_id } }) => {
    await delay(700);
    return await get_customers_data_func(customer_id);
  });

export const customer_router = t.router({
  register_customer: register_customer_route,
  get_customers_list1: get_customers_list_route1,
  get_customers_list: get_customers_list_route,
  get_customers_data: get_customers_data_route
});
