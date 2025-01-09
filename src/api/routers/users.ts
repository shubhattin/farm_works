import { t, publicProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';

const get_admin_users_list_route = publicProcedure.query(async ({ ctx }) => {
  const users = await db.query.users.findMany({
    where: ({ user_type }, { eq }) => eq(user_type, 'admin'),
    columns: {
      id: true,
      name: true
    }
  });
  return users;
});

export const users_router = t.router({
  get_admin_users_list: get_admin_users_list_route
});
