import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '../types';
export type PlanName = 'FREE' | 'PRO' | 'PREMIUM' | 'ADMIN';
const PLAN_HIERARCHY: Record<PlanName, number> = { FREE: 0, PRO: 1, PREMIUM: 2, ADMIN: 99 };
function planGte(userPlan: string, required: PlanName): boolean {
  return (PLAN_HIERARCHY[userPlan as PlanName] ?? 0) >= PLAN_HIERARCHY[required];
}
export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, userId: string, plan: string) => Promise<void>, options: { minPlan?: PlanName; adminOnly?: boolean } = {}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' } } as ApiError);
    if (options.adminOnly && session.user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acesso restrito' } } as ApiError);
    if (options.minPlan && !planGte(session.user.plan, options.minPlan)) return res.status(403).json({ success: false, error: { code: 'PLAN_REQUIRED', message: `Requer plano ${options.minPlan}` } } as ApiError);
    return handler(req, res, session.user.id, session.user.plan);
  };
}
export function withOptionalAuth(handler: (req: NextApiRequest, res: NextApiResponse, userId?: string, plan?: string) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions).catch(() => null);
    return handler(req, res, session?.user?.id, session?.user?.plan);
  };
}
