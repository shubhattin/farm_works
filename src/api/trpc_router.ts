import { t } from './trpc_init';
import { auth_router } from './routers/auth';
import { customer_router } from './routers/customer';

export const router = t.router({
  auth: auth_router,
  customer: customer_router
});

export type Router = typeof router;
