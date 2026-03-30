import type { NextApiRequest, NextApiResponse } from 'next';
import { withOptionalAuth } from '../../middleware/auth';
import { rateLimit } from '../../middleware/ratelimit';
import { getEnrichedAsset, getBatchEnrichedAssets } from '../../services/market-data';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../lib/response';
export const quotesHandler = withOptionalAuth(async (req, res, userId, plan) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const allowed = await rateLimit(req, res, userId, plan); if (!allowed) return;
  try {
    const { tickers, ticker } = req.query;
    if (ticker && typeof ticker === 'string') {
      const asset = await getEnrichedAsset(ticker.toUpperCase());
      if (!asset) return notFound(res, `Ativo ${ticker}`);
      return ok(res, asset, { cachedAt: new Date().toISOString() });
    }
    if (tickers) {
      const list = (typeof tickers === 'string' ? tickers : tickers.join(',')).split(',').map(t => t.trim().toUpperCase()).filter(Boolean).slice(0, 30);
      if (list.length === 0) return badRequest(res, 'Forneça ao menos um ticker');
      const assets = await getBatchEnrichedAssets(list);
      return ok(res, assets, { total: assets.length, cachedAt: new Date().toISOString() });
    }
    return badRequest(res, 'Parâmetro ticker ou tickers obrigatório');
  } catch (err) { return serverError(res, err); }
});
export default quotesHandler;
