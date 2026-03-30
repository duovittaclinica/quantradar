# QuantRadar — Deploy Guide

## Quick Start

```bash
git clone <repo> && cd quantradar
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Vercel Deploy

```bash
npm i -g vercel
vercel deploy --prod
```

## Environment Variables

Required:
- DATABASE_URL
- NEXTAUTH_SECRET
- ANTHROPIC_API_KEY

Optional:
- BRAPI_TOKEN
- NEWS_API_KEY
- REDIS_URL
- STRIPE_SECRET_KEY
- CRON_SECRET
```
