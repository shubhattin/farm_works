import { t, protectedAdminProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { customers } from '~/db/schema';
import { db } from '~/db/db';

const register_customer_route = protectedAdminProcedure
  .input(
    z.object({
      name: z.string().min(2).max(50),
      phone_number: z.string().min(10).max(13).nullable(),
      address: z.string().min(5).max(100).nullable()
    })
  )
  .mutation(async ({ input: { name, address, phone_number } }) => {
    const uuid = crypto.randomUUID();
    const inserted = (
      await db.insert(customers).values({ uuid, name, phone_number, address }).returning()
    )[0];
    return {
      id: inserted.id,
      uuid: inserted.uuid
    };
  });

export const customer_router = t.router({
  register_customer: register_customer_route
});
