import { getBatchEnrichedAssets } from '../market-data';
import { getAssetNews, getMarketNews } from '../news/newsapi';
import { getTickerSentimentScore, enrichNewsWithSentiment } from '../sentiment/analyzer';
import { batchCalculateScores } from './engine';
import { cache } from '../cache/redis';
import { config } from '../../lib/config';
import { RadarEntry, ScoringResult, InvestorProfile } from '../../types';
function toRiskLevel(r: ScoringResult): 'baixo'|'moderado'|'alto' { const h=r.risks.filter(x=>x.severity==='high').length; if(h>=2||r.score<45)return 'alto'; if(h===1||r.score<65)return 'moderado'; return 'baixo'; }
function buildSummary(r: ScoringResult): string { const p=r.justification.filter(j=>j.impact==='positive').slice(0,3); if(!p.length)return 'Sem convergência de indicadores.'; return `Entrou no radar: ${p.map(j=>j.description.toLowerCase()).join('; ')}.`; }
export async function buildRadar(tickers: string[]=config.radar.defaultTickers as unknown as string[], profile: InvestorProfile='MODERADO', limit=20): Promise<RadarEntry[]> {
  const cacheKey=cache.keys.radar(profile);
  return cache.getOrSet(cacheKey, async () => {
    const [assets,marketNews]=await Promise.all([getBatchEnrichedAssets(tickers),getMarketNews(30)]);
    const enrichedNews=await enrichNewsWithSentiment(marketNews);
    const sentimentMap=new Map<string,number>();
    await Promise.all(assets.map(async asset => { const relevant=enrichedNews.filter(n=>n.relatedTickers.includes(asset.ticker)); if(relevant.length>0){const{score}=await getTickerSentimentScore(relevant);sentimentMap.set(asset.ticker,score);} }));
    const scores=batchCalculateScores(assets,sentimentMap,profile);
    return scores.slice(0,limit).map((result,idx) => { const asset=assets.find(a=>a.ticker===result.ticker)!; return { rank:idx+1, ticker:result.ticker, name:asset?.name??result.ticker, type:asset?.type??'ACAO', sector:asset?.sector, price:asset?.quote.price??0, changePercent:asset?.quote.changePercent??0, score:result.score, tag:result.tag, summary:buildSummary(result), breakdown:result.breakdown, risk:toRiskLevel(result), technicals:{rsi14:asset?.technicals.rsi14??50,signal:asset?.technicals.signal??'neutral',trend:asset?.technicals.trend??'lateral'}, dividendYield:asset?.fundamentals.dividendYield, pvp:asset?.fundamentals.pvp, volume:asset?.quote.volume??0 }; });
  }, config.redis.ttl.radar);
}