export type AssetType = 'ACAO' | 'FII' | 'ETF' | 'BDR' | 'CRIPTO' | 'INDICE' | 'RENDA_FIXA';
export type SignalTag = 'COMPRA_FORTE' | 'COMPRA_MODERADA' | 'AGUARDAR' | 'ALTO_RISCO' | 'VENDA';
export type Sentiment = 'positivo' | 'neutro' | 'negativo';
export type ImpactLevel = 'alto' | 'médio' | 'baixo';
export type InvestorProfile = 'CONSERVADOR' | 'MODERADO' | 'AGRESSIVO' | 'DIVIDENDOS' | 'VALORIZACAO' | 'CURTO_PRAZO' | 'LONGO_PRAZO';

export interface RawQuote {
  ticker: string; price: number; open: number; high: number; low: number;
  close: number; previousClose: number; change: number; changePercent: number;
  volume: number; marketCap?: number; source: string; timestamp: Date;
}
export interface HistoricalDataPoint {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}
export interface Technicals {
  rsi14: number; macd: number; macdSignal: number; macdHistogram: number;
  ma20: number; ma50: number; ma200: number;
  bbUpper: number; bbMiddle: number; bbLower: number;
  atr: number; adx: number; volumeRelative: number;
  trend: 'alta' | 'baixa' | 'lateral';
  signal: 'bullish' | 'bearish' | 'neutral';
}
export interface Fundamentals {
  pl?: number; pvp?: number; dividendYield?: number; roe?: number; roic?: number;
  ebitdaMargin?: number; netMargin?: number; debtToEquity?: number;
  vacancyRate?: number;
}
export interface EnrichedAsset {
  ticker: string; name: string; type: AssetType; sector?: string;
  quote: RawQuote; technicals: Technicals; fundamentals: Fundamentals;
  sentimentScore?: number; latestNews?: NewsItem[];
}
export interface NewsItem {
  id: string; title: string; description?: string; url?: string;
  source: string; publishedAt: Date;
  sentiment?: Sentiment; sentimentScore?: number;
  impactLevel?: ImpactLevel; keywords: string[]; relatedTickers: string[];
}
export interface ScoreWeights {
  technical: number; fundamental: number; sentiment: number; liquidity: number;
}
export interface ScoreBreakdown {
  technical: number; fundamental: number; sentiment: number; liquidity: number; total: number;
}
export interface JustificationItem {
  factor: string; description: string; impact: 'positive' | 'negative' | 'neutral'; weight: number;
}
export interface RiskItem {
  type: string; description: string; severity: 'low' | 'medium' | 'high';
}
export interface ScoringResult {
  ticker: string; score: number; tag: SignalTag;
  breakdown: ScoreBreakdown; justification: JustificationItem[]; risks: RiskItem[];
  targetPrice?: number; stopLoss?: number; horizon?: 'curto' | 'médio' | 'longo';
  confidence: number; weights: ScoreWeights; generatedAt: Date;
}
export interface RadarEntry {
  rank: number; ticker: string; name: string; type: AssetType; sector?: string;
  price: number; changePercent: number; score: number; tag: SignalTag;
  summary: string; breakdown: ScoreBreakdown; risk: 'baixo' | 'moderado' | 'alto';
  technicals: Pick<Technicals, 'rsi14' | 'signal' | 'trend'>;
  dividendYield?: number; pvp?: number; volume: number;
}
export interface ApiSuccess<T> {
  success: true; data: T;
  meta?: { total?: number; page?: number; limit?: number; cachedAt?: string; nextRefresh?: string; };
}
export interface ApiError {
  success: false; error: { code: string; message: string; details?: unknown; };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
