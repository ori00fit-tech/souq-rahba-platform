# Full Scan Audit Report — 2026-04-16

## Scope
Repository-wide health scan for the monorepo at `/workspace/souq-rahba-platform`.

## Commands run
1. `pnpm -r lint`
2. `pnpm -r typecheck`
3. `pnpm -r build`
4. `pnpm audit --prod --audit-level moderate`

## Results summary
- **Lint:** ✅ Passed across all workspace packages that define lint scripts.
- **Typecheck:** ❌ Failed in `workers/webhooks`.
- **Build:** ✅ Passed across all workspace packages.
- **Dependency security audit:** ⚠️ Could not complete due npm audit endpoint returning HTTP 403 in this environment.

## Detailed findings

### 1) TypeScript typecheck conflict in `workers/webhooks`
`pnpm -r typecheck` failed for `@rahba/webhooks` with duplicate/conflicting global type declarations between:
- `@cloudflare/workers-types`
- TypeScript DOM lib declarations (`lib.dom.d.ts`)

Representative error families:
- `TS6200` duplicate identifier definitions (DOM + workers globals)
- `TS2403` subsequent variable declaration mismatch
- `TS2717` subsequent property declaration mismatch
- `TS2430` interface extension/type incompatibility

#### Probable root cause
`workers/webhooks/tsconfig.json` includes `@cloudflare/workers-types` but does not restrict `lib`, allowing DOM libs to be included and collide with workers globals.

#### Recommended remediation
In `workers/webhooks/tsconfig.json`, set an explicit workers-safe lib set, e.g.:
- `"lib": ["ES2022"]`

If needed for compatibility constraints, temporarily add:
- `"skipLibCheck": true`

Then rerun:
- `pnpm --filter @rahba/webhooks typecheck`
- `pnpm -r typecheck`

### 2) Security audit endpoint blocked in environment
`pnpm audit --prod --audit-level moderate` returned:
- `ERR_PNPM_AUDIT_BAD_RESPONSE`
- npm audit endpoint responded `403 Forbidden`

#### Recommended remediation
Run the same command in CI or a local environment with registry access and capture the output artifact for tracking.

## Current risk posture (based on executable checks)
- **Build integrity:** Good (all builds pass).
- **Static typing integrity:** At risk in `workers/webhooks` until tsconfig/type-space conflict is resolved.
- **Dependency vulnerability visibility:** Unknown due audit endpoint access failure.
