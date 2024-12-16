import { t, protectedAdminProcedure } from '~/api/trpc_init';
import { z } from 'zod';
import { db } from '~/db/db';

const add_kaTAI_record_route = protectedAdminProcedure
  .input(
    z.object({
      //
    })
  )
  .mutation(() => {
    //
  });

export const records_router = t.router({
  add_kaTAI_record: add_kaTAI_record_route
});
