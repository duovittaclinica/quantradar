function opt(key: string, fallback = ''): string { return process.env[key] ?? fallback; }
export const config = {
  env: opt('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  brapi: { baseUrl: opt('BRAPI_BASE_URL', 'https://brapi.dev/api'), token: opt('BRAPI_TOKEN'), rateLimitPerMin: 10, timeout: 8000 },
  alphaVantage: { baseUrl: 'https://www.alphavantage.co/query', apiKey: opt('ALPHA_VANTAGE_KEY','demo'), rateLimitPerMin: 5, timeout: 10000 },
  newsApi: { baseUrl: 'https://newsapi.org/v2', apiKey: opt('NEWS_API_KEY'), rateLimitPerDay: 100, timeout: 8000 },
  claude: { apiKey: opt('ANTHROPIC_API_KEY'), model: 'claude-sonnet-4-20250514', maxTokens: 1024 },
  redis: { url: opt('REDIS_URL','redis://localhost:6379'), ttl: { quote:60, historical:3600, news:300, sentiment:3600, radar:120, fundamentals:86400 } },
  scoring: { defaultWeights: { technical:35, fundamental:30, sentiment:20, liquidity:15 }, minScoreCompraForte:80, minScoreCompraMod:65, minScoreAguardar:45 },
  radar: { defaultTickers: ['PETR4','VALE3','ITUB4','BBDC4','ABEV3','WEGE3','RENT3','PRIO3','CSMG3','EGIE3','BBAS3','SUZB3','TAEE11','SANB11','MXRF11','HGLG11','KNRI11','VISC11','XPML11','BCFF11','IVVB11','BOVA11','SMAL11','HASH11'] },
} as const;
