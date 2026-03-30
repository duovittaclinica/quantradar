import type { NextApiRequest, NextApiResponse } from 'next';
import { handleStripeWebhook } from '../../../services/billing/stripe';
export const config = { api: { bodyParser: false } };
async function raw(req: NextApiRequest): Promise<Buffer> {
  return new Promise((res, rej) => { const c: any[] = []; req.on('data',d=>c.push(d)); req.on('end',()=>res(Buffer.concat(c))); req.on('error',rej); });
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const body = await raw(req);
    const result = await handleStripeWebhook(body, req.headers['stripe-signature'] as string);
    return res.status(200).json({ received: true, ...result });
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message });
  }
}
