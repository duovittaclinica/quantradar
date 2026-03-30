import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../database/client';
import { cache } from '../../services/cache/redis';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const start = Date.now();
  const checks: Record<string, 'ok' | 'error'> = {};
  try { await prisma.$queryRaw`SELECT 1`; checks.db = 'ok'; } catch { checks.db = 'error'; }
  try { await cache.set('__health__', 1, 5); const v = await cache.get<number>('__health__'); checks.redis = v === 1 ? 'ok' : 'error'; } catch { checks.redis = 'error'; }
  const allOk = Object.values(checks).every(v => v === 'ok');
  return res.status(allOk ? 200 : 503).json({ status: allOk ? 'healthy' : 'degraded', checks, uptime: process.uptime(), responseMs: Date.now() - start, version: '2.0.0', timestamp: new Date().toISOString() });
}
