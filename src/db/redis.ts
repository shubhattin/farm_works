import { env } from '$env/dynamic/private';
import { Redis } from '@upstash/redis/cloudflare';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
});

export const CACHE_KEYS = {
  additional_customer_info: (customer_id: number) => `customer:${customer_id}:additional_info`
};

export const CACHE_WRITE_DELAY = 30;
