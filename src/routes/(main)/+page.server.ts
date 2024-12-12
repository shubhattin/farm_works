import { db } from '~/db/db';

export const load = async ({ locals }) => {
  if (!locals?.user)
    return {
      admin_users_list: await db.query.users.findMany({
        where: ({ user_type }, { eq }) => eq(user_type, 'admin'),
        columns: {
          id: true,
          name: true
        }
      })
    };
};
