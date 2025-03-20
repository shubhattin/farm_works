import { env } from '$env/dynamic/private';
import { Redis } from '@upstash/redis/cloudflare';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
});

export const CACHE_KEYS = {
  additional_customer_info: (customer_id: number) => `customer:${customer_id}:additional_info`,
  customer_info: (customer_id: number) => `customer:${customer_id}:info`,
  customer_bills: (customer_id: number) => `customer:${customer_id}:bills`,
  bill_payments: (bill_id: number) => `bill:${bill_id}:payments`
};

export const CACHE_WRITE_DELAY = 30;
