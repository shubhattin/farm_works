import { t, protectedMaintainerProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';

const get_users_list_route = protectedMaintainerProcedure.query(async ({ ctx: { user } }) => {
  await delay(600);
  const data = await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
      is_approved: true,
      is_maintainer: true,
      super_admin: true,
      role: true
    },
    where: ({ id }, { ne }) => ne(id, user.id)
  });
  return data;
});

export const users_router = t.router({
  get_users_list: get_users_list_route
});
