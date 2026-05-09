# Research: Clerk-Supabase Auth Reset

## Question

How should Clerk, the custom Express API, and Supabase/Postgres integrate without
workarounds or legacy auth assumptions?

## Decision

Use this architecture for the current repo:

```text
Clerk authenticates user
React obtains Clerk session token
Express verifies Clerk request and authorizes workspace access
Postgres stores application data through DATABASE_URL
```

Supabase is the database provider in this architecture. Supabase Auth,
Supabase browser client sessions, and deprecated Clerk Supabase JWT templates
are not part of the primary runtime path.

## Rationale

- Current code uses `DATABASE_URL` with Drizzle (`lib/db/src/index.ts`) rather
  than a browser Supabase client.
- Current API routes already sit between frontend and database, so Express can
  enforce application authorization consistently.
- Clerk docs support passing session tokens to cross-origin APIs and using
  Express `clerkMiddleware()` / `getAuth()` for `401` API protection.
- Supabase docs support Clerk Third-Party Auth and RLS for direct Supabase Data
  API use, but that is a different architecture and should not be half-mixed.

## Official Guidance Summary

### Clerk authenticated requests

Clerk session tokens identify signed-in users. Same-origin requests can use
Clerk cookies. Cross-origin requests must include:

```text
Authorization: Bearer <Clerk session token>
```

Frontend token retrieval uses Clerk `getToken()`.

### Clerk backend verification

For Express APIs, Clerk docs support `clerkMiddleware()` plus `getAuth()` to
inspect `isAuthenticated`, `userId`, `orgId`, and role-related auth data.
`getAuth()` is appropriate for API routes because it can return `401` instead
of redirecting.

Clerk backend docs recommend setting `authorizedParties` to allowed frontend
origins. This repo must make that allowlist explicit and shared with CORS.

### Supabase + Clerk

Supabase supports Clerk as a Third-Party Auth provider for Supabase Data APIs,
Storage, Realtime, and Functions. If using Supabase client libraries directly,
use `accessToken: async () => session?.getToken() ?? null` and design RLS
policies against Clerk session claims.

The old Clerk Supabase JWT template is deprecated and should not be used for
new work.

### RLS implication

RLS policies only protect requests evaluated by Supabase/PostgREST or direct DB
roles configured to use them. This repo currently uses a direct Postgres
connection from the custom API. Therefore the API must enforce tenant and role
authorization even if Supabase hosts the database.

## Alternatives Considered

### Alternative A: Direct Supabase client with Clerk Third-Party Auth

Rejected for this reset. It would require introducing a browser Supabase client,
Supabase Third-Party Auth setup, RLS policies, and a different ownership model.
That is useful later, but too broad for fixing the current Express-backed
dashboard `401`.

### Alternative B: Keep Supabase Auth and Clerk together

Rejected. Two session sources would preserve the current ambiguity and create
more failure modes.

### Alternative C: Add retry logic around dashboard requests

Rejected. The first request can be anonymous because token readiness is wrong.
Retrying hides the boundary bug instead of fixing it.

## Sources

- [Clerk: Making authenticated requests](https://clerk.com/docs/guides/development/making-requests)
- [Clerk: Express getAuth](https://clerk.com/docs/reference/express/get-auth)
- [Clerk: authenticateRequest](https://clerk.com/docs/reference/backend/authenticate-request)
- [Clerk: Session tokens](https://clerk.com/docs/guides/sessions/session-tokens)
- [Clerk: Integrate Supabase with Clerk](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase: Third-party auth overview](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase: Clerk third-party auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase: JWTs](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
