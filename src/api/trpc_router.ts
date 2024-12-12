import { t } from './trpc_init';
import { auth_router } from './routers/auth';

export const router = t.router({
  auth: auth_router
});

export type Router = typeof router;
