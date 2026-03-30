import type { NextApiRequest, NextApiResponse } from 'next';
import { signalsListHandler, generateSignalHandler } from '../../../api/signals/route';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return req.method === 'POST' ? generateSignalHandler(req, res) : signalsListHandler(req, res);
}
