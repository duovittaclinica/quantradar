# QuantRadar — Developer Shortcuts
.PHONY: dev build test lint seed stripe-listen

dev:
	npm run dev

build:
	npm run build

test:
	npm test

test-watch:
	npm run test:watch

test-coverage:
	npm test -- --coverage

lint:
	npm run lint && npm run typecheck

seed:
	npm run db:seed

migrate:
	npx prisma migrate dev

studio:
	npx prisma studio

# Stripe webhook forwarding for local dev
stripe-listen:
	stripe listen --forward-to localhost:3000/api/billing/webhook

# Force-refresh radar cache
radar-update:
	curl -X POST http://localhost:3000/api/cron/radar-update \
	  -H "Authorization: Bearer $${CRON_SECRET}"

# Health check
health:
	curl -s http://localhost:3000/api/health | jq .

# Docker compose for local infra (Postgres + Redis)
infra-up:
	docker-compose up -d postgres redis

infra-down:
	docker-compose down
