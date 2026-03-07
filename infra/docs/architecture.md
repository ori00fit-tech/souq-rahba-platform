# Architecture

## Core domains
- Identity & sessions
- Sellers & KYC
- Catalog & inventory
- Orders & checkout
- Payments & settlements
- Returns & disputes
- Notifications
- Analytics & moderation

## Deployment split
- Storefront: Cloudflare Pages
- Admin: Cloudflare Pages (protected by Cloudflare Access)
- API: Cloudflare Workers
- Media: R2
- Relational data: D1
- Caching/flags/sessions: KV
- Async jobs: Queues

## Production notes
- Keep payment orchestration isolated from storefront
- Add idempotency on order/payment endpoints
- Add audit logs for compliance-sensitive actions
- Keep invoice numbering atomic
