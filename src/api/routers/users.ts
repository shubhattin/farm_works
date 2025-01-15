import { t, publicProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';

const get_registred_users_list_route = publicProcedure.query(async ({ ctx }) => {
  const users = await db.query.users.findMany({
    // both admin and non-admin users
    columns: {
      id: true,
      name: true
    }
  });
  return users;
});

export const users_router = t.router({
  get_registered_users_list: get_registred_users_list_route
});
