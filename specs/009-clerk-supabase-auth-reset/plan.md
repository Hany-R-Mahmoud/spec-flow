# Implementation Plan: Clerk-Supabase Auth Reset

**Branch**: `009-clerk-supabase-auth-reset` | **Date**: 2026-05-09 | **Spec**: `specs/009-clerk-supabase-auth-reset/spec.md`  
**Input**: Feature specification from `/specs/009-clerk-supabase-auth-reset/spec.md`

## Summary

Clean the current Clerk/Supabase/Postgres setup by choosing one base
architecture and making it explicit in code, contract, and docs:

```text
React/Vite app
  -> Clerk React SDK owns sign-in/session state
  -> generated API client sends Clerk session token only after token exists
  -> Express API verifies Clerk request and derives workspace context
  -> Supabase-hosted Postgres stores app data through DATABASE_URL
```

The API is the application authorization boundary. Supabase Auth and browser
Supabase clients are not part of this reset.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24  
**Primary Dependencies**: React/Vite, `@clerk/react`, Express 5,
`@clerk/express`, Drizzle ORM, generated OpenAPI/Zod clients  
**Storage**: Supabase-hosted Postgres via `DATABASE_URL` and Drizzle  
**Testing**: User will run tests by default; executor should run targeted
typecheck/browser/API checks only when needed to diagnose auth reset  
**Target Platform**: Local Vite app on port 8080, Express API on port 24549,
future deploy with separate app/API origins  
**Project Type**: pnpm monorepo with frontend app, API server, shared API
contracts, and DB schema package  
**Performance Goals**: No extra network retry loop on dashboard first load;
single token readiness gate before first data fetch  
**Constraints**: No deprecated Clerk Supabase JWT template; no Supabase JWT
secret sharing; no broad refactor outside auth/data boundaries  
**Scale/Scope**: One app, one API, personal workspaces plus Clerk org
workspaces, existing persistence tables

## Constitution Check

- Simplicity and Maintainability: PASS. One auth provider, one API auth
  boundary, one persistence path.
- TypeScript and Schema Discipline: PASS. Shared API and DB schema contracts
  must define auth errors and ownership fields.
- Accessible Product Quality: PASS. Auth loading and error states remain visible
  and user-friendly.
- Security and Trust Boundaries: PASS. Token, CORS, role, secret, and database
  boundaries are first-class requirements.
- Surgical Workflow: PASS. Scope is limited to auth/runtime integration,
  contract, schema, and docs needed for the reset.

## Architecture Decisions

### AD-001: Clerk is the only auth source

Use Clerk session/user/org state as the only authentication input. Do not keep
Supabase Auth, custom local sessions, or local storage auth as fallback.

### AD-002: Express API owns authorization

Because the repo currently connects to Postgres through `DATABASE_URL`, not
Supabase Data API, RLS is not the runtime authorization control. The API must
verify Clerk identity and enforce workspace/role authorization before DB access.

### AD-003: Env/config loads before app construction

Move root `.env` loading and runtime config validation before importing or
constructing the Express app. `clerkMiddleware()` must receive validated config,
not defaulted late-bound env.

### AD-004: Token readiness means token exists

`isTokenReady` must mean `getToken()` produced a non-empty token at least once
for the current Clerk session. Protected data providers must not mount before
that.

### AD-005: Workspace identity is typed, not string fallback

Replace `orgId ?? userId` scattered usage with a central auth context:

```ts
type WorkspaceAuthContext = {
  actorUserId: string;
  workspaceId: string;
  workspaceType: "personal" | "organization";
  orgId: string | null;
  orgRole: string | null;
  canManageWorkspace: boolean;
};
```

Persist row ownership using explicit non-empty workspace identifiers derived by
that context. Prefer `workspace_type`, `clerk_user_id`, and nullable
`clerk_org_id` columns where useful for auditing and future migrations.

### AD-006: Protected route contract is explicit

OpenAPI must declare bearer auth and error outcomes. Generated clients should
reflect auth as a required runtime concern, not a hidden side effect.

### AD-007: Secrets are not normal readable config

Integration tokens must not be returned to the frontend. Store them encrypted
with a server-only key or move them into a secret-store abstraction. If no
secret-store key exists, token writes must fail with a clear setup error rather
than storing raw plaintext.

## Project Structure

### Documentation (this feature)

```text
specs/009-clerk-supabase-auth-reset/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-auth-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
artifacts/specflow-ai/
├── src/main.tsx
├── src/App.tsx
├── src/components/providers/auth-provider.tsx
├── src/components/layout/Topbar.tsx
├── src/pages/LoginPage.tsx
├── src/vite-env.d.ts
└── vite.config.ts

artifacts/api-server/
├── src/index.ts
├── src/app.ts
├── src/config.ts                 # new or equivalent validated runtime config
├── src/routes/auth.ts
├── src/routes/error-response.ts
├── src/routes/settings.ts
├── src/routes/integrations.ts
├── src/routes/projects.ts
├── src/routes/sessions.ts
├── src/routes/export-packages.ts
└── src/routes/generation.ts

lib/api-spec/
└── openapi.yaml

lib/api-client-react/
└── src/custom-fetch.ts

lib/db/
├── src/schema/index.ts
└── drizzle.config.ts

.env.example
README.md
```

**Structure Decision**: Keep existing monorepo/package layout. Add config/auth
helpers only inside `artifacts/api-server/src`; do not introduce a new service.

## Implementation Phases

### Phase 1: Runtime Config Foundation

- Add server config module that loads root `.env`, validates Clerk keys,
  app origins, CORS origins, `DATABASE_URL`, and optional secret-encryption key.
- Update API entrypoint so config loads before `app` import/construction.
- Use the same allowed origins for CORS and Clerk `authorizedParties`.
- Fail production-like runtime clearly if required config is missing.

### Phase 2: Client Token Boundary

- Make `AuthProvider` await `getToken()` and track token readiness per Clerk
  session.
- Mount `SessionProvider` only after token readiness.
- Update `customFetch` so protected calls do not silently omit auth when a
  getter is configured but token is unavailable.
- Keep public health calls possible if needed by bypassing auth explicitly.

### Phase 3: API Auth Context

- Centralize auth resolution in `routes/auth.ts`.
- Add middleware or helper for protected routes that returns typed
  `WorkspaceAuthContext`.
- Keep `/api/healthz` public.
- Replace route-level `requireWorkspaceId()` with context-aware helpers.
- Add `403` helper for authenticated but unauthorized requests.

### Phase 4: Workspace Ownership Data Model

- Remove empty-string defaults from workspace-scoped columns.
- Add explicit ownership columns or a documented workspace key convention.
- Add indexes/constraints for workspace-scoped lookups.
- Ensure all related updates filter by workspace, including linked project
  updates after session changes.
- Plan or implement migration for existing rows keyed by current
  `workspace_id`.

### Phase 5: Role and Secret Hardening

- Add admin/owner checks for sensitive writes.
- Keep ordinary member access to normal read/write workspace workflow routes
  only where product allows.
- Encrypt integration tokens or externalize them.
- Ensure read responses return `configured` flags, not credential values.
- Return generic `500` bodies and log internal errors server-side.

### Phase 6: Contract and Docs

- Add bearer security scheme to OpenAPI.
- Add `401` and `403` responses to protected paths.
- Regenerate `@workspace/api-zod` and `@workspace/api-client-react` as needed.
- Update README and `.env.example` to reflect the chosen base architecture.
- Remove `SUPABASE_` browser env exposure unless a direct Supabase client is
  explicitly reintroduced.

## Validation Strategy

1. Static review:
   - Confirm no protected route bypasses auth context.
   - Confirm no Vite `SUPABASE_` env exposure.
   - Confirm no raw token fields are returned by integration config reads.
2. API checks:
   - Missing token to `/api/sessions` -> `401`.
   - Valid token to `/api/sessions` -> `200`.
   - Valid member token to `/api/integrations/config/:type` -> `403`.
   - Valid admin token to same route -> success.
3. Browser checks:
   - Sign in.
   - Hard refresh dashboard.
   - Inspect first protected requests for Bearer token and `200`.
   - Switch org and confirm data reloads under new workspace key.
4. Schema checks:
   - Drizzle schema has no empty workspace defaults.
   - Migration/data notes describe handling existing rows.
5. Contract checks:
   - OpenAPI protected routes declare bearer auth and `401`/`403`.
   - Generated clients compile after regeneration.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Secret encryption or secret-store abstraction | Integration tokens are currently raw database JSON | Keeping raw plaintext is a confirmed high-risk boundary issue |
| Explicit workspace auth context | `orgId ?? userId` fallback caused ambiguous tenant scope | A plain string does not carry user/org/role semantics needed for authorization |

## Risks

- Clerk org role claims depend on active organization and token freshness.
- Existing database rows may need migration from generic `workspace_id`.
- Localhost vs 127.0.0.1 origin mismatch can still cause auth failures unless
  env and docs are exact.
- If API uses direct Postgres connection, database RLS cannot be assumed to
  protect tenant isolation.

## Recommended Executor Agents

- Implementer: config, token readiness, auth context, route updates, schema.
- Security reviewer: role checks, CORS, secret storage, error handling.
- Tester: browser first-load flow and API 401/403 checks.
- Docs owner: README, `.env.example`, OpenAPI contract notes.
