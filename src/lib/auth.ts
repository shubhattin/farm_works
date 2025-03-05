import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, redis } from '../db/db';
import * as schema from '../db/schema';
import { env } from '$env/dynamic/private';
import { admin } from 'better-auth/plugins';
import { COOKIE_CACHE_TIME_MS } from './cache-time';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema
  }),
  plugins: [admin()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_CACHE_TIME_MS / 1000
    },
    expiresIn: 60 * 60 * 24 * 20, // 20 days
    updateAge: 60 * 60 * 24 * 1 // 1 day (every 1 day the session expiration is updated)
  },
  secondaryStorage: {
    get: async (key) => {
      const value = (await redis.get(key)) as null | any;
      return value ? JSON.stringify(value) : null;
    },
    set: async (key, value, ttl) => {
      if (ttl)
        await redis.set(key, value, {
          ex: ttl
        });
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    }
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!
    }
  }
});
