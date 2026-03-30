# QuantRadar Architecture

## Stack
- Frontend: Next.js 14 + TypeScript + Recharts
- Backend: Next.js API Routes
- DB: PostgreSQL + Prisma 5
- Auth: NextAuth v4
- AI: Claude (Anthropic)
- Market Data: BRAPI
- News: NewsAPI
- Billing: Stripe
- Cache: Redis (Upstash)
- Deploy: Vercel

## Scoring
```
score = technical×35% + fundamental×30% + sentiment×20% + liquidity×15%
```

## Cron Jobs
- `*/5 9-18 * * 1-5` — Radar update
- `*/2 9-18 * * 1-5` — Alert check  
- `*/10 * * * *` — News refresh
