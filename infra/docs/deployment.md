# Deployment

## GitHub repo strategy
- Default branch: `main`
- Protect `main`
- Require PR reviews
- Require CI success
- Keep secrets in GitHub Actions + Cloudflare secrets

## Cloudflare setup order
1. Create D1 database
2. Create R2 bucket
3. Create KV namespace
4. Update `workers/api/wrangler.toml`
5. Deploy API worker
6. Deploy storefront Pages
7. Deploy admin Pages behind Access

## Commands
```bash
pnpm install
pnpm --filter @souq/storefront build
pnpm --filter @souq/admin build
pnpm --filter @souq/api dev
```

## D1
```bash
wrangler d1 execute souq-db --file=infra/d1/schema.sql
wrangler d1 execute souq-db --file=infra/d1/seed.sql
```
