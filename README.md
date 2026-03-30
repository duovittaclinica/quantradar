# QuantRadar ⚡

**Plataforma de inteligência financeira para o mercado brasileiro.**

Radar de oportunidades com scoring automatizado, análise de sentimento via IA, 
indicadores técnicos e fundamentalistas, alertas em tempo real e backtesting histórico.

## Stack
- **Frontend**: Next.js 14 + TypeScript + Recharts
- **Backend**: Next.js API Routes
- **DB**: PostgreSQL + Prisma ORM
- **Cache**: Redis (Upstash)
- **Auth**: NextAuth (Credentials + Google)
- **AI**: Claude (Anthropic)
- **Market Data**: BRAPI
- **News**: NewsAPI
- **Billing**: Stripe
- **Deploy**: Vercel

## Quick Start

```bash
git clone <repo>
cd quantradar
cp .env.example .env      # configure API keys
npm install
npx prisma migrate dev
npm run db:seed
npm run dev               # → http://localhost:3000
```

See [DEPLOY.md](./DEPLOY.md) for full production deployment guide.

## Architecture

```
/src
  /services           Core business logic
    /market-data      BRAPI integration + technical indicators
    /news             NewsAPI integration
    /sentiment        Claude sentiment analysis
    /scoring          Opportunity scoring engine
    /backtesting      Historical signal replay
    /alerts           Multi-channel alert dispatcher
    /billing          Stripe subscription management
    /cache            Redis + memory fallback
  /api                Route handlers
  /pages              Next.js pages + API routes
  /components         React UI components
  /hooks              Data-fetching hooks
  /middleware         Auth + rate limiting
  /jobs               Background jobs
  /auth               NextAuth config
  /database           Prisma client
  /types              Shared TypeScript types
```

## Scoring Formula

```
score = technical×35% + fundamental×30% + sentiment×20% + liquidity×15%
```

Each weight is configurable via the Admin panel per investor profile.

## SaaS Plans

| Plan | Price | Radar | Alerts | AI/day |
|------|-------|-------|--------|--------|
| Free | R$0   | 10    | 5      | 3      |
| Pro  | R$97  | 30    | 50     | 50     |
| Premium | R$197 | 100 | ∞     | ∞      |

## ⚠️ Disclaimer

Este sistema gera **sugestões** baseadas em algoritmos e dados públicos.
**Não constitui recomendação financeira.** Sempre consulte um profissional qualificado.
