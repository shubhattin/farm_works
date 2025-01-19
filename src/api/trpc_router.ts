import { t } from './trpc_init';
import { auth_router } from './routers/auth';
import { customer_router } from './routers/customer';
import { records_router } from './routers/records';

export const router = t.router({
  auth: auth_router,
  customer: customer_router,
  records: records_router
});

export type Router = typeof router;
