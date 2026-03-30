import type { NextApiRequest, NextApiResponse } from 'next';
import { withOptionalAuth } from '../../middleware/auth';
import { rateLimit } from '../../middleware/ratelimit';
import { getMarketNews, getAssetNews } from '../../services/news/newsapi';
import { enrichNewsWithSentiment } from '../../services/sentiment/analyzer';
import { ok, serverError, methodNotAllowed } from '../../lib/response';
export const newsHandler = withOptionalAuth(async (req, res, userId, plan = 'FREE') => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const allowed = await rateLimit(req, res, userId, plan); if (!allowed) return;
  try {
    const { ticker, sentiment, limit = '20' } = req.query;
    const maxItems = Math.min(Number(limit), 50);
    let articles = ticker ? await getAssetNews(String(ticker).toUpperCase(), maxItems) : await getMarketNews(maxItems);
    articles = await enrichNewsWithSentiment(articles);
    if (sentiment && typeof sentiment === 'string') articles = articles.filter(a => a.sentiment === sentiment);
    return ok(res, articles.slice(0, maxItems), { total: articles.length, cachedAt: new Date().toISOString() });
  } catch (err) { return serverError(res, err); }
});
export default newsHandler;
