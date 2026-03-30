/**
 * Admin API — stats, seed, jobs
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export async function getAdminStats() {
  const [userCount, signalCount, alertCount, jobLogs] = await Promise.all([
    prisma.user.count(),
    prisma.signal.count(),
    prisma.alert.count({ where: { active: true } }),
    prisma.jobLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);
  return { userCount, signalCount, alertCount, jobLogs };
}

export async function getAdminConfig() {
  return {
    radarEnabled: true,
    alertsEnabled: true,
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    brapiEnabled: !!process.env.BRAPI_TOKEN,
    redisEnabled: !!process.env.REDIS_URL,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const stats = await getAdminStats();
      return res.json(stats);
    } catch (e: any) {
      logger.error('Admin stats error', e);
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).end();
}
