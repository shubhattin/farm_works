import { t, protectedAdminProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { bills, customers, payments } from '~/db/schema';
import { db } from '~/db/db';
import { count, desc, eq, max, sql } from 'drizzle-orm';

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
      await db.insert(customers).values({ name, phone_number, address }).returning()
    )[0];
    return {
      id: inserted.id
    };
  });

const get_customers_list_route1 = protectedAdminProcedure.query(async ({ ctx }) => {
  const customers = await db.query.customers.findMany({
    columns: {
      id: true,
      name: true
    }
  });
  return customers;
});

const get_customers_list_route = protectedAdminProcedure.query(async ({ ctx }) => {
  const customers_list = await db
    .select({
      customer_id: customers.id,
      customer_name: customers.name,
      last_bill_date: max(bills.timestamp),
      total_amount: sql<number>`COALESCE(SUM(${bills.total}), 0)`,
      total_paid: sql<number>`
      COALESCE(
        SUM(
          (
            SELECT COALESCE(SUM(${payments.amount}), 0)
            FROM ${payments}
            WHERE ${payments.bill_id} = ${bills.id}
          )
        ),
        0
      )
    `,
      remainingAmount: sql<number>`
      COALESCE(
        SUM(
          ${bills.total} - (
            SELECT COALESCE(SUM(${payments.amount}), 0)
            FROM ${payments}
            WHERE ${payments.bill_id} = ${bills.id}
          )
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
  return customers_list;
});

export const customer_router = t.router({
  register_customer: register_customer_route,
  get_customers_list1: get_customers_list_route1,
  get_customers_list: get_customers_list_route
});
