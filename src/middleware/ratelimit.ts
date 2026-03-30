import type { NextApiRequest, NextApiResponse } from 'next';
import { cache } from '../services/cache/redis';
const PLAN_LIMITS: Record<string, {windowMs:number;max:number;keyPrefix:string}> = {
  FREE: {windowMs:60_000,max:20,keyPrefix:'rl'}, PRO: {windowMs:60_000,max:100,keyPrefix:'rl'},
  PREMIUM: {windowMs:60_000,max:500,keyPrefix:'rl'}, ADMIN: {windowMs:60_000,max:9999,keyPrefix:'rl'},
};
export async function rateLimit(req: NextApiRequest, res: NextApiResponse, userId?: string, plan = 'FREE'): Promise<boolean> {
  const cfg = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  const id = userId ?? (req.headers['x-forwarded-for'] as string ?? req.socket.remoteAddress ?? 'unknown');
  const key = `${cfg.keyPrefix}:${id}`;
  const current = (await cache.get<number>(key)) ?? 0;
  if (current >= cfg.max) { res.setHeader('X-RateLimit-Remaining', 0); res.status(429).json({success:false,error:{code:'RATE_LIMITED',message:'Muitas requisições.'}}); return false; }
  await cache.set(key, current + 1, Math.ceil(cfg.windowMs / 1000));
  res.setHeader('X-RateLimit-Remaining', cfg.max - current - 1);
  return true;
}
