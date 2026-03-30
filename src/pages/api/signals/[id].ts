import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../database/client';
import { withAuth } from '../../../middleware/auth';
import { ok, notFound, serverError, methodNotAllowed } from '../../../lib/response';
export default withAuth(async (req, res, userId) => {
  const id = req.query.id as string;
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const signal = await prisma.signal.findUnique({
      where: { id },
      include: { asset: { select: { ticker: true, name: true, type: true } } },
    });
    if (!signal) return notFound(res, 'Sinal');
    await prisma.signalView.upsert({
      where: { userId_signalId: { userId, signalId: id } },
      create: { userId, signalId: id },
      update: {},
    }).catch(() => {});
    return ok(res, signal);
  } catch (err) { return serverError(res, err); }
});
