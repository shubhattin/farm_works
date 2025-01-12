import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '~/db/db';
import { get_customers_data_func } from '~/api/routers/customer';
import { z } from 'zod';

export const load: PageServerLoad = async ({ params }) => {
  const id_uuid = params.id.split('.');
  const INVALID_MSG_CODE = 'invalid_id_uuid';
  if (id_uuid.length !== 2)
    error(404, {
      message: INVALID_MSG_CODE
    });
  try {
    const [id, uuid] = z.tuple([z.coerce.number(), z.string().uuid()]).parse(id_uuid);
    const info = await db.query.customers.findFirst({
      where: (tbl, { eq, and }) => and(eq(tbl.id, id), eq(tbl.uuid, uuid)),
      columns: {
        id: true
      }
    });
    if (!info) throw new Error('Invalid Customer ID or UUID');
    return {
      id: id,
      uuid,
      customer_data: await get_customers_data_func(id)
    };
  } catch (e) {
    error(404, {
      message: INVALID_MSG_CODE
    });
  }
};
