import type { NextApiRequest, NextApiResponse } from 'next';
import { runAlertChecker } from '../../jobs/radar-updater';
function verifyCronSecret(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  return req.headers.authorization === `Bearer ${secret}`;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyCronSecret(req)) return res.status(401).json({ error: 'Unauthorized' });
  const result = await runAlertChecker();
  return res.status(result.status === 'success' ? 200 : 500).json(result);
}
