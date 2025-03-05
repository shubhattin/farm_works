import { t } from './trpc_init';
import { customer_router } from './routers/customer';
import { records_router } from './routers/records';

export const router = t.router({
  customer: customer_router,
  records: records_router
});

export type Router = typeof router;
