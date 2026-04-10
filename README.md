# RAHBA Marketplace Platform

RAHBA is a production-oriented multi-vendor marketplace platform built for the Moroccan market with a Cloudflare-native architecture.

It supports multi-seller checkout, guest ordering, shipping resolution, order tracking, WhatsApp notifications, and admin maintenance workflows.

---

## Overview

RAHBA is designed around these principles:

- mobile-first commerce
- multi-seller marketplace flows
- secure and reliable checkout
- Cloudflare-native backend
- operational simplicity for phone/Termux-based development
- production hardening over demo-only features

The platform currently includes:

- storefront for buyers
- seller management flows
- admin moderation endpoints
- catalog browsing and product details
- product reviews
- order creation and tracking
- shipping method resolution
- session-based auth
- Google auth support
- order idempotency protection
- rate limiting on sensitive endpoints

---

## Architecture

### Monorepo structure

```text
apps/
  storefront/
  seller-portal/
  admin/

workers/
  api/

packages/
  shared/


Main components
apps/storefront
Buyer-facing frontend.
workers/api
Main backend API running on Cloudflare Workers using Hono.
packages/shared
Shared API client and common utilities used across apps.
Tech Stack
Frontend
React 18
Vite
React Router
Mobile-first UI
Backend
Hono
TypeScript
Cloudflare Workers
Data & Infrastructure
Cloudflare D1
Cloudflare R2
Cloudflare KV
Tooling
pnpm workspaces
Turbo
TypeScript
Core Features
Catalog
categories endpoint
product listing with filtering, sorting, pagination
product details with media, specs, FAQs
similar products
product reviews
Marketplace
multi-seller cart
cart split by seller automatically
guest checkout
authenticated checkout
seller-specific shipping resolution
Orders
order creation per seller
COD checkout
guest order tracking
buyer order history
seller/admin order visibility
shipping status + payment status normalization
tracking number support
Security & Reliability
PBKDF2 password hashing
legacy password migration on login
auth/session middleware
rate limiting
idempotent order creation
expired session cleanup support
Admin
seller listing
seller KYC approval/rejection
system health summary
cleanup expired sessions
Current Reliability Features
1. Password security
Passwords are no longer stored using reversible encoding.
RAHBA now uses PBKDF2-based hashing with legacy migration support.
2. Rate limiting
Rate limiting is applied to sensitive endpoints such as:
register
login
order tracking
order creation
3. Idempotent checkout
Order creation supports idempotency keys to prevent duplicate orders during retries or repeated clicks.
Database support includes:
orders.idempotency_key
orders.request_fingerprint
4. Session lifecycle
Expired sessions can be:
rejected at auth time
cleaned manually through admin maintenance workflows
API Highlights
Auth
POST /auth/register
POST /auth/login
GET /auth/me
POST /auth/logout
GET /auth/google/login
GET /auth/google/callback
Catalog
GET /catalog/home
GET /catalog/categories
GET /catalog/products
GET /catalog/products/:slug
GET /catalog/products/:slug/full
GET /catalog/products/:slug/reviews
POST /catalog/products/:slug/reviews
GET /catalog/products/:slug/similar
Orders
POST /commerce/orders
GET /commerce/orders
GET /commerce/orders/:id
PATCH /commerce/orders/:id/status
GET /commerce/track/:orderNumber?phone=...
Admin
GET /admin/sellers
PATCH /admin/sellers/:id/status
GET /admin/system/health-summary
POST /admin/system/cleanup-sessions
Important Production Behaviors
Multi-seller checkout
One cart can generate multiple orders:
one order per seller
one shipping selection per seller
one success/failure result per seller
Guest order storage
Guest orders are saved locally on the device/browser for quick re-access.
Retry-safe checkout
The storefront sends an idempotency_key during checkout so repeated submissions can reuse the same order instead of creating duplicates.
Tracking protection
Guest order tracking requires:
order number
buyer phone
This reduces unauthorized access to order data.
Environment Variables
Set these in your Cloudflare environment / secrets.
Required bindings
DB
MEDIA
CACHE
App vars
APP_ENV
JWT_ISSUER
Secrets
JWT_SECRET
Google OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
WhatsApp
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_DEFAULT_COUNTRY_CODE
WHATSAPP_REGISTRATION_PIN
WHATSAPP_ADMIN_PHONE
Local Development
Install dependencies
Bash
pnpm install
Run dev mode
Bash
pnpm dev
Typecheck API
Bash
pnpm --filter @rahba/api typecheck
Build all apps
Bash
pnpm build
Build storefront only
Bash
pnpm --filter @rahba/storefront build
Cloudflare D1 from Termux
Wrangler may not work reliably on some Android/Termux environments.
RAHBA supports direct D1 API usage through Cloudflare REST calls.
Example helper:
Bash
cf_d1_query() {
  local SQL="$1"
  curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DB_ID/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"sql\": $(printf '%s' "$SQL" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))') }"
}
Example:
Bash
cf_d1_query "SELECT 1 AS ok;"
Database Notes
The platform currently relies on D1 tables such as:
users
sessions
sellers
products
product_media
product_specs
product_faqs
product_reviews
orders
order_items
order_shipments
logistics_providers
logistics_provider_methods
categories
Important indexes include auth and order safety indexes such as:
idx_users_email
idx_users_google_id
idx_sessions_token
idx_sessions_user_id
idx_sessions_expires_at
idx_orders_idempotency_key
idx_orders_request_fingerprint
Operational Maintenance
System summary
Admins can inspect high-level counts using:
users
sellers
products
orders
sessions
expired sessions
Session cleanup
Admins can manually clean expired sessions when needed.
Production Checklist
Before launch, verify the following.
Security
rotate all exposed tokens
use a strong JWT secret
confirm rate limiting is active
verify Google OAuth secrets are not committed
verify Cloudflare API tokens are scoped minimally
Database
confirm required columns exist
confirm indexes exist
verify order idempotency fields are present
verify expired session cleanup works
Auth
test register
test login
test legacy password migration
test logout
test /auth/me
test Google login callback
Checkout
test single-seller checkout
test multi-seller checkout
test checkout retry safety
test guest checkout
test shipping option selection
test repeated submit with same idempotency key
Orders
test tracking by phone + order number
test seller order visibility
test buyer order visibility
test admin order visibility
test status updates
Frontend
verify storefront build
verify checkout success screen
verify reused-order messaging
verify mobile-first rendering
Known Current Constraints
COD is currently the main supported payment flow
no full payment gateway integration yet
cleanup is currently manual/admin-triggered rather than scheduled
checkout idempotency is implemented, but broader transactional guarantees can still be improved later
Recommended Next Improvements
scheduled cleanup automation
payment gateway support
transaction-hardening for order creation
richer seller analytics
better search relevance
multilingual UX expansion
deployment documentation
observability and alerting
Status
The project is no longer just a prototype.
Current state:
strong marketplace foundation
real checkout flows
production-focused backend hardening
safer auth/session handling
anti-duplicate order protection
Cloudflare-ready architecture
Still recommended before full public launch:
deployment checklist completion
secret rotation
additional operational documentation
broader end-to-end testing
License
Private project. All rights reserved.
