import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import { createCheckoutSession, STRIPE_PRICES } from '../../../services/billing/stripe';
import { ok, badRequest, serverError, methodNotAllowed } from '../../../lib/response';
const MAP: Record<string, Record<string, string>> = {
  PRO:     { monthly: STRIPE_PRICES.PRO_MONTHLY,     yearly: STRIPE_PRICES.PRO_YEARLY },
  PREMIUM: { monthly: STRIPE_PRICES.PREMIUM_MONTHLY, yearly: STRIPE_PRICES.PREMIUM_YEARLY },
};
export default withAuth(async (req, res, userId) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const { plan, interval = 'monthly', email } = req.body as { plan: string; interval?: string; email: string };
  if (!plan || !MAP[plan]) return badRequest(res, 'Plano inválido');
  const priceId = MAP[plan][interval];
  if (!priceId) return badRequest(res, 'Stripe não configurado.');
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const r = await createCheckoutSession(userId, email, priceId, `${base}/dashboard?upgraded=1`, `${base}/pricing`);
    return ok(res, r);
  } catch (err) { return serverError(res, err); }
});
