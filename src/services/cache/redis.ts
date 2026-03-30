/**
 * Cache Service — Redis with in-memory fallback
 */
import { createClient } from 'redis';
import { logger } from '../../lib/logger';

const MEM_CACHE = new Map<string, { value: string; expiresAt: number }>();

function memSet(key: string, value: string, ttlSeconds: number) {
  MEM_CACHE.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}
function memGet(key: string): string | null {
  const entry = MEM_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { MEM_CACHE.delete(key); return null; }
  return entry.value;
}
function memDel(key: string) { MEM_CACHE.delete(key); }

let redisClient: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (redisClient && redisAvailable) return redisClient;
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', () => { redisAvailable = false; });
    await redisClient.connect();
    redisAvailable = true;
    return redisClient;
  } catch {
    redisAvailable = false;
    return null;
  }
}

export const cache = {
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const raw = client ? await client.get(key) : memGet(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch { return null; }
  },
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const client = await getRedisClient();
      if (client) { await client.setEx(key, ttlSeconds, serialized); }
      else { memSet(key, serialized, ttlSeconds); }
    } catch { /* silent */ }
  },
  async del(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      if (client) { await client.del(key); } else { memDel(key); }
    } catch { /* silent */ }
  },
  async flush(pattern = '*'): Promise<void> {
    try {
      const client = await getRedisClient();
      if (client) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) await client.del(keys);
      } else {
        for (const key of MEM_CACHE.keys()) {
          if (pattern === '*' || key.includes(pattern.replace('*',''))) MEM_CACHE.delete(key);
        }
      }
    } catch { /* silent */ }
  },
};
