# Clerk Implementation Guide

## Purpose

This document captures how Clerk is implemented in SpecFlow AI today, so the
same pattern can be reused in another project without repeating the same auth
mistakes.

Use this as the guide for:

- frontend Clerk wiring
- backend Clerk verification
- workspace/org scoping
- env setup
- known failure modes
- manual work vs agent work

## Final Architecture We Chose

We ended on one clear auth model:

```text
React/Vite app
-> Clerk handles sign-in and session state
-> frontend gets Clerk session token
-> generated API client sends Bearer token
-> Express API verifies Clerk token
-> API derives workspace context from Clerk user/org
-> Postgres stores app data through DATABASE_URL
```

Important boundary decisions:

- Clerk is the only auth provider.
- The Express API is the only application authorization boundary.
- Supabase is used as Postgres only, not as browser auth/session runtime.
- Protected frontend requests must wait until Clerk token wiring is ready.

Source basis:

- [`specs/008-clerk-hobby-auth/spec.md`](../specs/008-clerk-hobby-auth/spec.md)
- [`specs/009-clerk-supabase-auth-reset/spec.md`](../specs/009-clerk-supabase-auth-reset/spec.md)
- [`specs/009-clerk-supabase-auth-reset/research.md`](../specs/009-clerk-supabase-auth-reset/research.md)

## Packages We Added Or Relied On

- Frontend: `@clerk/react` in [`artifacts/specflow-ai/package.json`](../artifacts/specflow-ai/package.json)
- Backend: `@clerk/express` in [`artifacts/api-server/package.json`](../artifacts/api-server/package.json)

## Env Variables Used

Root `.env`:

```env
CLERK_PUBLISHABLE_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_SERVER_URL=http://127.0.0.1:24549
VITE_APP_URL=http://127.0.0.1:8080
APP_ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080
INTEGRATION_SECRET_ENCRYPTION_KEY=
DATABASE_URL=
```

Current template: [`.env.example`](../.env.example)

Notes:

- `VITE_CLERK_PUBLISHABLE_KEY` is required by the browser app.
- Backend accepts `CLERK_PUBLISHABLE_KEY` or falls back to `VITE_CLERK_PUBLISHABLE_KEY`.
- `CLERK_SECRET_KEY` is server-only.
- `VITE_APP_URL` and `APP_ALLOWED_ORIGINS` matter for both CORS and Clerk authorized parties.
- `DATABASE_URL` is mandatory because auth is useless unless the API can boot and read/write scoped data.

## Exact Implementation Steps

### 1. Add Clerk to frontend and backend

Install:

- `@clerk/react`
- `@clerk/express`

Why:

- frontend needs Clerk session + prebuilt sign-in UI
- backend needs Clerk request verification

### 2. Put `ClerkProvider` at the frontend root

File: [`artifacts/specflow-ai/src/main.tsx`](../artifacts/specflow-ai/src/main.tsx)

What we do:

- read `VITE_CLERK_PUBLISHABLE_KEY`
- fail visibly if key missing
- wrap app in `ClerkProvider`
- set `signInUrl="/login"`
- set `signInFallbackRedirectUrl={appPath()}`

Key point:

- we fail fast in UI if Clerk env is missing instead of booting into a half-authenticated app

### 3. Use Clerk prebuilt sign-in page

File: [`artifacts/specflow-ai/src/pages/LoginPage.tsx`](../artifacts/specflow-ai/src/pages/LoginPage.tsx)

What we do:

- use Clerk `<SignIn />`
- route it on `/login`
- send signed-in users back to `/app`

Why this choice:

- less custom auth code
- less chance of drifting from Clerk-supported flows

### 4. Create one app-level auth provider

File: [`artifacts/specflow-ai/src/components/providers/auth-provider.tsx`](../artifacts/specflow-ai/src/components/providers/auth-provider.tsx)

What this provider owns:

- signed-in / signed-out / loading state
- Clerk user display info
- active org info
- derived workspace identity
- admin/member capability
- generated client token getter registration

Exact logic:

- read Clerk state from `useAuth`, `useUser`, `useOrganization`
- if Clerk not loaded, or user not signed in, or org still loading:
  - clear token getter
  - mark token not ready
- once ready:
  - register `setAuthTokenGetter(() => getToken())`
  - mark token ready
- derive workspace:
  - personal workspace: `personal:${user.id}`
  - org workspace: `org:${orgId}`
- derive mutable permission:
  - personal workspace -> allowed
  - org workspace -> only `org:admin`

This is the main frontend auth contract.

### 5. Delay protected app routes until auth and API are both ready

File: [`artifacts/specflow-ai/src/App.tsx`](../artifacts/specflow-ai/src/App.tsx)

What we do:

- keep public landing page at `/`
- keep Clerk auth route at `/login`
- redirect legacy app routes into `/app/...`
- before mounting protected app shell:
  - wait for Clerk status
  - if signed in, also wait for token readiness
  - wait for API health readiness

Why:

- avoids first-load anonymous API calls
- avoids noisy `401` on dashboard hard refresh

### 6. Make generated API client attach Clerk Bearer token

File: [`lib/api-client-react/src/custom-fetch.ts`](../lib/api-client-react/src/custom-fetch.ts)

What we do:

- keep module-level `setAuthTokenGetter`
- before request:
  - if auth getter exists
  - and request did not explicitly skip auth
  - and no `Authorization` header already provided
  - fetch token from Clerk
  - attach `Authorization: Bearer <token>`
- if getter exists but token is empty:
  - throw local error
  - do not silently send anonymous request

This was one of the most important fixes.

### 7. Load backend env before creating Clerk middleware

Files:

- [`artifacts/api-server/src/config.ts`](../artifacts/api-server/src/config.ts)
- [`artifacts/api-server/src/server.ts`](../artifacts/api-server/src/server.ts)

What we do:

- load root `.env` early with `dotenv`
- validate Clerk keys
- validate app origin
- build allowed origin list
- validate `DATABASE_URL`
- pass config into `createApp(config)`

Why:

- Clerk middleware must be created with real env, not missing/default env

### 8. Share one origin allowlist between CORS and Clerk

Files:

- [`artifacts/api-server/src/config.ts`](../artifacts/api-server/src/config.ts)
- [`artifacts/api-server/src/app.ts`](../artifacts/api-server/src/app.ts)

What we do:

- normalize app origin from `VITE_APP_URL`
- merge:
  - app origin
  - `APP_ALLOWED_ORIGINS`
  - Vercel env origins
  - default local origins (`localhost` and `127.0.0.1`)
- use same list for:
  - Express CORS `origin`
  - Clerk `authorizedParties` when explicitly configured

Why:

- origin mismatches were causing auth failures even with valid sign-in

### 9. Put CORS before Clerk middleware

File: [`artifacts/api-server/src/app.ts`](../artifacts/api-server/src/app.ts)

What we do:

- install CORS first
- then logging
- then Clerk middleware

Why:

- browser `Authorization` requests trigger unauthenticated `OPTIONS` preflight
- CORS must answer before Clerk tries to auth that preflight

### 10. Centralize backend auth context

File: [`artifacts/api-server/src/routes/auth.ts`](../artifacts/api-server/src/routes/auth.ts)

What we do:

- call `getAuth(req, { acceptsToken: "session_token" })`
- reject request if not authenticated
- derive:
  - `actorUserId`
  - `workspaceType`
  - `workspaceId`
  - `orgId`
  - `orgRole`
  - `canManageWorkspace`

Helpers:

- `requireAuthContext()` -> `401` when not authenticated
- `requireMutableWorkspaceContext()` -> `403` when authenticated but not admin

This removed route-by-route auth guesswork.

### 11. Apply auth helpers across protected routes

Routes using the centralized auth helpers include:

- `sessions`
- `projects`
- `settings`
- `ai-provider`
- `export-packages`
- `integrations`
- `generation`

Pattern:

- normal protected reads/writes use `requireAuthContext`
- sensitive workspace mutations use `requireMutableWorkspaceContext`

### 12. Keep workspace identity explicit

Current workspace key format:

- personal: `personal:<clerk_user_id>`
- organization: `org:<clerk_org_id>`

Why:

- plain `orgId ?? userId` was too ambiguous
- explicit prefixes make tenant type obvious and safer in logs, routing, and queries

### 13. Keep account/session UI Clerk-native

Files:

- [`artifacts/specflow-ai/src/components/layout/Topbar.tsx`](../artifacts/specflow-ai/src/components/layout/Topbar.tsx)
- [`artifacts/specflow-ai/src/components/landing/Hero.tsx`](../artifacts/specflow-ai/src/components/landing/Hero.tsx)

What we do:

- show Clerk `UserButton`
- drive CTA behavior from `isSignedIn`
- use Clerk-derived display name/email/workspace name

## Problems We Hit And How We Cleared Them

### Problem 1. API booted before auth env was ready

Symptom:

- Clerk middleware built with missing env
- auth behavior inconsistent or broken

Root cause:

- env load happened too late in old flow

Fix:

- move env loading + validation into `loadApiServerConfig()`
- call it before `createApp()`

Files:

- [`artifacts/api-server/src/config.ts`](../artifacts/api-server/src/config.ts)
- [`artifacts/api-server/src/server.ts`](../artifacts/api-server/src/server.ts)

### Problem 2. First dashboard requests sometimes went out anonymous

Symptom:

- signed-in user hard refreshes
- first `/api/...` requests return `401`

Root cause:

- UI considered itself ready before Clerk token wiring was actually ready

Fix:

- add `isTokenReady`
- only mount protected app state after token getter is registered
- make API client throw if token getter exists but token is empty

Files:

- [`artifacts/specflow-ai/src/components/providers/auth-provider.tsx`](../artifacts/specflow-ai/src/components/providers/auth-provider.tsx)
- [`artifacts/specflow-ai/src/App.tsx`](../artifacts/specflow-ai/src/App.tsx)
- [`lib/api-client-react/src/custom-fetch.ts`](../lib/api-client-react/src/custom-fetch.ts)

### Problem 3. `localhost` vs `127.0.0.1` caused valid sessions to fail

Symptom:

- login succeeds
- API still rejects requests from another local origin spelling

Root cause:

- origin allowlists did not consistently include both local forms

Fix:

- normalize origins
- include both defaults
- share one allowlist between CORS and Clerk authorized parties

Files:

- [`artifacts/api-server/src/config.ts`](../artifacts/api-server/src/config.ts)
- [`artifacts/api-server/src/app.ts`](../artifacts/api-server/src/app.ts)

### Problem 4. Preflight requests could get blocked by auth

Symptom:

- browser auth requests fail before real request reaches route handler

Root cause:

- auth middleware can interfere with unauthenticated `OPTIONS` probes if CORS is too late

Fix:

- put CORS before Clerk middleware

File:

- [`artifacts/api-server/src/app.ts`](../artifacts/api-server/src/app.ts)

### Problem 5. Workspace scope was too loose

Symptom:

- tenant identity logic scattered
- risk of reads/writes using wrong workspace logic

Root cause:

- ad hoc fallback patterns like `orgId ?? userId`

Fix:

- central `WorkspaceAuthContext`
- explicit `personal:` and `org:` workspace ids

File:

- [`artifacts/api-server/src/routes/auth.ts`](../artifacts/api-server/src/routes/auth.ts)

### Problem 6. Sensitive workspace writes needed stronger guard than normal auth

Symptom:

- member users should not mutate admin-only settings/integrations

Root cause:

- auth and authz were mixed together

Fix:

- separate `401` auth guard from `403` mutable/admin guard
- use `requireMutableWorkspaceContext()` for sensitive routes

Files:

- [`artifacts/api-server/src/routes/auth.ts`](../artifacts/api-server/src/routes/auth.ts)
- protected routes under [`artifacts/api-server/src/routes/`](../artifacts/api-server/src/routes/)

### Problem 7. Clerk and Supabase auth models were getting half-mixed

Symptom:

- architecture confusion
- easy to add wrong fixes like retries or second session source

Root cause:

- no single declared runtime model

Fix:

- declare Clerk as only auth source
- declare Express API as only authz boundary
- keep Supabase as database only

Source:

- [`specs/009-clerk-supabase-auth-reset/research.md`](../specs/009-clerk-supabase-auth-reset/research.md)

## What Was Manual On Our Side

These parts require human/project-owner work.

### Clerk dashboard setup

You need to:

- create the Clerk application
- copy publishable key
- copy secret key
- enable the sign-in methods you want
- if using social login, configure each provider in Clerk
- if using organizations, enable Clerk Organizations

For another project, this is still manual because the agent cannot create your external Clerk project unless you explicitly provide access/tooling for it.

### Environment values

You need to provide:

- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY` and/or `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_APP_URL`
- `APP_ALLOWED_ORIGINS`
- `DATABASE_URL`
- deployment env vars in Vercel or your hosting platform

### OAuth provider credentials

If you want Google/GitHub sign-in:

- create provider apps
- enter callback/credential values in Clerk dashboard
- verify allowed domains and redirect URLs there

### Organization and role operations

If your app uses organizations, you still need manual product decisions for:

- whether orgs are enabled at all
- who becomes admin
- who can invite members
- whether personal workspaces remain allowed

### Production domain rollout

You need to manually verify:

- production app URL
- production API URL if separate
- Clerk allowed origins / redirect behavior
- environment split per dev/staging/prod

Current repo unknowns still marked:

- `Unknown / verify`: whether production app and API always deploy together or can split
- `Unknown / verify`: whether all production envs use same Clerk/Supabase instances

## What The Agent Can Do Reliably

The agent can do all repo-side implementation work:

- add Clerk packages
- wire `ClerkProvider`
- replace custom login page with Clerk prebuilt auth
- create app auth provider
- derive workspace identity from Clerk user/org
- attach Bearer token in generated fetch client
- gate protected UI until token is ready
- wire backend Clerk middleware
- centralize `401`/`403` auth helpers
- update protected routes to use those helpers
- update `.env.example`
- write docs and validation checklist

The agent can also help with hosted config preparation:

- tell you exact env vars to add
- tell you expected redirect/origin values
- map manual Clerk dashboard steps
- prepare verification steps for local and production

The agent usually cannot complete external dashboard setup by itself unless you explicitly connect tooling that grants access.

## Recommended Manual Checklist For Another Project

1. Create Clerk app.
2. Enable email/social auth methods you need.
3. Enable Organizations only if workspace membership really needs it.
4. Copy publishable and secret keys into project env.
5. Decide exact frontend URL and backend URL early.
6. Put both `localhost` and `127.0.0.1` in local origin plan if your team uses both.
7. Decide whether personal workspaces are allowed, org workspaces are required, or both.
8. Decide which org role maps to admin write access.

## Recommended Agent Checklist For Another Project

1. Add `@clerk/react` and `@clerk/express`.
2. Mount `ClerkProvider` at app root.
3. Add `/login` Clerk sign-in page.
4. Create one app auth provider that exposes token readiness and workspace context.
5. Register API token getter from Clerk `getToken()`.
6. Refuse protected API calls when token should exist but does not.
7. Load backend env before constructing auth middleware.
8. Share one origin allowlist between CORS and Clerk authorized parties.
9. Put CORS before auth middleware.
10. Centralize backend auth context and role checks.
11. Use explicit workspace ids with prefixes.
12. Verify `401`, `403`, hard refresh, and org-switch flows.

## Validation We Used

From [`specs/009-clerk-supabase-auth-reset/quickstart.md`](../specs/009-clerk-supabase-auth-reset/quickstart.md):

1. Start API and app:
   - `pnpm dev:api`
   - `pnpm dev:specflow`
2. Open `http://127.0.0.1:8080/`
3. Sign in through `/login`
4. Hard refresh `/app`
5. Confirm first protected requests carry `Authorization: Bearer ...`
6. Confirm protected routes return `200` when signed in
7. Confirm same routes return `401` when token is missing
8. If using orgs, switch active organization and confirm workspace reload
9. Confirm member cannot perform admin-only writes

Key routes checked:

- `/api/sessions`
- `/api/settings`
- `/api/export-packages`

## Minimal Reuse Pattern

If you want the shortest reusable pattern from this repo, keep these pieces:

1. `ClerkProvider` at root.
2. Central frontend auth provider.
3. `setAuthTokenGetter(() => getToken())`.
4. Protected UI waits for token readiness.
5. Express `clerkMiddleware()`.
6. Central `requireAuthContext()` / `requireMutableWorkspaceContext()`.
7. Explicit workspace ids from Clerk user/org.

That is the core. Most auth bugs we hit came from missing one of those seven pieces.
