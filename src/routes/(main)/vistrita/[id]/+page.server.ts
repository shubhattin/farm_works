import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '~/db/db';

export const load: PageServerLoad = async ({ params }) => {
  const id_uuid = params.id.split('.');
  const INVALID_MSG_CODE = 'invalid_id_uuid';
  if (id_uuid.length !== 2)
    throw error(404, {
      message: INVALID_MSG_CODE
    });
  const [id, uuid] = id_uuid;
  try {
    const info = await db.query.customers.findFirst({
      where: (tbl, { eq, and }) => and(eq(tbl.id, parseInt(id)), eq(tbl.uuid, uuid)),
      columns: {
        id: true
      }
    });
    if (!info)
      throw error(404, {
        message: INVALID_MSG_CODE
      });
    return {
      id: parseInt(id),
      uuid
    };
  } catch (e) {
    throw error(404, {
      message: INVALID_MSG_CODE
    });
  }
};
