import type { Router } from '~/api/trpc_router';
import { httpBatchLink } from '@trpc/client';
import { createTRPCClient } from 'trpc-sveltekit';
import transformer from './transformer';
import { createTRPCSvelte } from 'trpc-svelte-query';
import { ensure_auth_access_status } from '~/tools/auth_tools';

let access_token: string;
let token_renew_started = false;

export const setAccessToken = (token: string) => {
  // to set the jwt_token while we make trpc request
  access_token = token;
};
export const setTokenRenewStarted = (val: boolean) => {
  token_renew_started = val;
};

const client_options = {
  links: [
    httpBatchLink({
      url: '/trpc',
      async headers() {
        if (!token_renew_started) await ensure_auth_access_status();
        return {
          Authorization: `Bearer ${access_token}`
        };
      }
    })
  ],
  transformer
};

export const client = createTRPCClient<Router>(client_options);
export const client_q = createTRPCSvelte<Router>(client_options);
