

# Souq Rahba Platform | سوق رحبة

Monorepo for a modern marketplace platform built with React, Vite, Cloudflare Workers, Hono, and Cloudflare D1.

## Overview

Souq Rahba is a marketplace platform structured as a scalable monorepo with:

- **Storefront app** for customer-facing browsing and shopping
- **Admin app** for back-office management
- **API worker** running on Cloudflare Workers
- **Shared packages** for contracts, UI, and common logic
- **Infrastructure files** for D1 database setup and deployment

## Repository Structure

```text
souq-rahba-platform/
├── apps/
│   ├── storefront/   # Customer-facing React app
│   └── admin/        # Admin React app
├── workers/
│   └── api/          # Cloudflare Worker API (Hono)
├── packages/         # Shared workspace packages
├── infra/
│   └── d1/           # Database schema and seed files
├── .github/
│   └── workflows/    # CI workflow
├── package.json
├── pnpm-workspace.yaml
└── README.md

Tech Stack

Frontend

React 18

Vite 6

TypeScript 5

React Router DOM


Backend

Cloudflare Workers

Hono

Zod

Cloudflare D1


Platform / Tooling

pnpm workspaces

Turbo

Prettier

GitHub Actions


Workspace Packages

Current workspace apps and services:

@rahba/storefront

@rahba/admin

@rahba/api


Requirements

Node.js 18+

pnpm

Cloudflare account

Wrangler CLI configured for deployment


Getting Started

1) Clone the repository

git clone https://github.com/ori00fit-tech/souq-rahba-platform.git
cd souq-rahba-platform

2) Install dependencies

pnpm install

3) Create environment file

cp .env.example .env

Then update the values according to your local or Cloudflare environment.

Environment Variables

The example file currently includes the following keys:

PUBLIC_API_BASE_URL=
JWT_SECRET=
R2_PUBLIC_BUCKET=
D1_DB_NAME=

Add any additional secrets required by your Cloudflare setup through Wrangler or dashboard-based secret management.

Development

Run all main apps together

pnpm dev

This runs the main workspace development processes in parallel.

Run a specific app

Storefront

pnpm --filter @rahba/storefront dev

Admin

pnpm --filter @rahba/admin dev

API Worker

pnpm --filter @rahba/api dev

Build

Build all workspace packages:

pnpm build

Quality Checks

pnpm lint
pnpm typecheck
pnpm format

API Overview

The API worker is mounted with route groups under:

/auth

/catalog

/marketplace

/admin

/commerce


If you call an undefined route, the worker returns a JSON NOT_FOUND response.

Cloudflare Deployment

The API worker is configured through workers/api/wrangler.toml and uses Cloudflare bindings for services such as:

D1 database

R2 bucket

KV namespace


Before deploying, make sure your Cloudflare resources exist and the bindings match your target environment.

Deploy the API worker

From the API worker directory:

cd workers/api
pnpm deploy

Or use your preferred Wrangler deployment flow if you manage environments separately.

CI

A GitHub Actions workflow is included and runs the following on push / pull request:

install dependencies

lint

typecheck

build


This helps keep the workspace healthy before deployment.

Infrastructure

Database-related files live under:

infra/d1/

Typical contents include schema and seed files for initializing Cloudflare D1.

Notes

This repository is organized as a production-oriented monorepo.

Keep README and route documentation in sync whenever API structure changes.

Prefer documenting only verified features that exist in the codebase.


Contributing

1. Fork the repository


2. Create a feature branch


3. Make your changes


4. Run:

pnpm lint
pnpm typecheck
pnpm build


5. Open a pull request



License

MIT

ولكي تكتبه مباشرة من Termux باستعمال `cat`:

```bash
cd ~/downloads/souq-rahba-platform

cat > README.md <<'EOF'
# Souq Rahba Platform | سوق رحبة

Monorepo for a modern marketplace platform built with React, Vite, Cloudflare Workers, Hono, and Cloudflare D1.

## Overview

Souq Rahba is a marketplace platform structured as a scalable monorepo with:

- **Storefront app** for customer-facing browsing and shopping
- **Admin app** for back-office management
- **API worker** running on Cloudflare Workers
- **Shared packages** for contracts, UI, and common logic
- **Infrastructure files** for D1 database setup and deployment

## Repository Structure

```text
souq-rahba-platform/
├── apps/
│   ├── storefront/   # Customer-facing React app
│   └── admin/        # Admin React app
├── workers/
│   └── api/          # Cloudflare Worker API (Hono)
├── packages/         # Shared workspace packages
├── infra/
│   └── d1/           # Database schema and seed files
├── .github/
│   └── workflows/    # CI workflow
├── package.json
├── pnpm-workspace.yaml
└── README.md

Tech Stack

Frontend

React 18

Vite 6

TypeScript 5

React Router DOM


Backend

Cloudflare Workers

Hono

Zod

Cloudflare D1


Platform / Tooling

pnpm workspaces

Turbo

Prettier

GitHub Actions


Workspace Packages

Current workspace apps and services:

@rahba/storefront

@rahba/admin

@rahba/api


Requirements

Node.js 18+

pnpm

Cloudflare account

Wrangler CLI configured for deployment


Getting Started

1) Clone the repository

git clone https://github.com/ori00fit-tech/souq-rahba-platform.git
cd souq-rahba-platform

2) Install dependencies

pnpm install

3) Create environment file

cp .env.example .env

Then update the values according to your local or Cloudflare environment.

Environment Variables

The example file currently includes the following keys:

PUBLIC_API_BASE_URL=
JWT_SECRET=
R2_PUBLIC_BUCKET=
D1_DB_NAME=

Add any additional secrets required by your Cloudflare setup through Wrangler or dashboard-based secret management.

Development

Run all main apps together

pnpm dev

This runs the main workspace development processes in parallel.

Run a specific app

Storefront

pnpm --filter @rahba/storefront dev

Admin

pnpm --filter @rahba/admin dev

API Worker

pnpm --filter @rahba/api dev

Build

Build all workspace packages:

pnpm build

Quality Checks

pnpm lint
pnpm typecheck
pnpm format

API Overview

The API worker is mounted with route groups under:

/auth

/catalog

/marketplace

/admin

/commerce


If you call an undefined route, the worker returns a JSON NOT_FOUND response.

Cloudflare Deployment

The API worker is configured through workers/api/wrangler.toml and uses Cloudflare bindings for services such as:

D1 database

R2 bucket

KV namespace


Before deploying, make sure your Cloudflare resources exist and the bindings match your target environment.

Deploy the API worker

From the API worker directory:

cd workers/api
pnpm deploy

Or use your preferred Wrangler deployment flow if you manage environments separately.

CI

A GitHub Actions workflow is included and runs the following on push / pull request:

install dependencies

lint

typecheck

build


This helps keep the workspace healthy before deployment.

Infrastructure

Database-related files live under:

infra/d1/

Typical contents include schema and seed files for initializing Cloudflare D1.

Notes

This repository is organized as a production-oriented monorepo.

Keep README and route documentation in sync whenever API structure changes.

Prefer documenting only verified features that exist in the codebase.


Contributing

1. Fork the repository


2. Create a feature branch


3. Make your changes


4. Run:

pnpm lint
pnpm typecheck
pnpm build


5. Open a pull request



License

MIT EOF

ثم نفذ:

```bash
git add README.md
git commit -m "Rewrite README with accurate monorepo and deployment docs"
git push origin main
