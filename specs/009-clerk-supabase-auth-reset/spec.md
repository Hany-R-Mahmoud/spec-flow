# Feature Specification: Clerk-Supabase Auth Reset

**Feature Branch**: `009-clerk-supabase-auth-reset`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User request: "Go from base, find how the different stacks should integrate with each other, clean the setup itself from very base, formulate a spec-kit spec for the actual problems and the way to fix/refactor without workaround or legacy maintenance."  
**Depends On**: `004-persistence-mvp`, `008-clerk-hobby-auth`

## Goal

Reset the authentication and persistence boundary so SpecFlow has one coherent
runtime model:

- Clerk is the only authentication provider.
- The Express API is the only application authorization boundary.
- Supabase is used as the Postgres database behind `DATABASE_URL`, not as a
  second auth/session system.
- The React app sends authenticated API requests only after Clerk has produced a
  real session token.

This spec fixes the current dashboard `401 Unauthorized` failure by removing
root causes instead of adding fetch retries, route exceptions, or legacy
Supabase auth fallbacks.

## Current Problems Found

1. **Server config loads too late**: `artifacts/api-server/src/index.ts` imports
   `app` before loading root `.env`, while `artifacts/api-server/src/app.ts`
   constructs `clerkMiddleware()` at module load. Clerk keys and authorized
   parties can be missing or defaulted before env exists.
2. **Token readiness is not real readiness**:
   `artifacts/specflow-ai/src/components/providers/auth-provider.tsx` sets
   `isTokenReady` immediately after registering a getter, before proving
   `getToken()` returns a non-empty token. `SessionProvider` then loads dashboard
   data and `customFetch` silently omits `Authorization` when the token is null.
3. **Workspace identity is ambiguous**: frontend treats `user.id` as
   `workspaceId`; backend uses `orgId ?? userId`; database only stores generic
   `workspace_id`. There is no canonical actor/workspace model.
4. **Organization requirements are half-implemented**: `008-clerk-hobby-auth`
   requires Clerk Organizations, but current app has no `OrganizationSwitcher`,
   no active organization state, and no member/admin authorization.
5. **API auth contract is hidden**: `lib/api-spec/openapi.yaml` has no bearer
   security scheme and no explicit `401` or `403` responses for protected routes.
   The generated client depends on a side-effect token getter.
6. **Environment boundary is muddy**: Vite exposes `SUPABASE_` variables even
   though the current app no longer uses a Supabase browser client. `.env.example`
   keeps legacy Supabase auth variables beside Clerk and DB variables.
7. **CORS is too broad**: API uses `cors()` without an origin allowlist.
8. **Sensitive integration tokens are plaintext**: Jira and GitHub tokens are
   accepted by `/integrations/config/:type` and stored raw in a JSONB column.
9. **Database allows empty workspace namespace**: workspace-scoped tables default
   `workspace_id` to an empty string, which weakens tenant isolation.
10. **Unexpected errors leak internal messages**: generic server failures return
    raw `Error.message`.
11. **Auth UI still has mixed route intent**: `/signup` is legacy-redirected to
    `/login`, but `LoginPage` still passes `withSignUp`.

## User Scenarios & Testing

### User Story 1 - Signed-in Dashboard Loads Data (Priority: P1)

As a signed-in user, I can open the dashboard and see my workspace data without
getting a dashboard `401`.

**Why this priority**: This is the direct production-blocking failure.

**Independent Test**: Start API and Vite app with valid Clerk keys and
`DATABASE_URL`, sign in, hard refresh `/`, and confirm the first
`/api/sessions`, `/api/settings`, and `/api/export-packages` requests include a
Bearer token and return `200`.

**Acceptance Scenarios**:

1. **Given** a signed-in Clerk session, **When** the dashboard first mounts,
   **Then** the data provider waits until a non-empty Clerk session token exists.
2. **Given** the first token exists, **When** the generated API client calls
   protected routes, **Then** `Authorization: Bearer <token>` is sent.
3. **Given** a valid Clerk token from an allowed app origin, **When** the API
   receives the request, **Then** Clerk auth resolves an authenticated actor and
   the route returns workspace data.
4. **Given** a missing or invalid token, **When** any protected route is called,
   **Then** the API returns `401` with a stable error body and no data access.

---

### User Story 2 - Workspace Scope Is Canonical (Priority: P1)

As a user or organization member, I can only read and modify records in the
workspace resolved from my Clerk identity.

**Why this priority**: Fixing 401 without a clear tenant model would preserve
the deeper auth bug.

**Independent Test**: Use two Clerk users or one user plus one active
organization. Verify each workspace gets separate projects, sessions, settings,
exports, and integration config rows.

**Acceptance Scenarios**:

1. **Given** no active Clerk organization, **When** the API resolves auth,
   **Then** workspace context is a personal workspace based on `userId`.
2. **Given** an active Clerk organization, **When** the API resolves auth,
   **Then** workspace context is an organization workspace based on `orgId`.
3. **Given** a workspace-scoped route, **When** a row belongs to a different
   workspace, **Then** reads and writes return `404` or `403` without exposing
   foreign data.
4. **Given** a workspace-scoped table insert, **When** code omits workspace
   ownership, **Then** the insert fails rather than writing `workspace_id = ""`.

---

### User Story 3 - Admin-Only Sensitive Workspace Settings (Priority: P2)

As a workspace owner/admin, I can manage settings and integration credentials,
while ordinary members cannot mutate sensitive workspace configuration.

**Why this priority**: Integration tokens and workspace settings cross a higher
trust boundary than ordinary session reads.

**Independent Test**: With an org admin token, update settings and integrations.
With an org member token, verify sensitive writes return `403`.

**Acceptance Scenarios**:

1. **Given** an active org admin, **When** the user updates integration config,
   **Then** the API accepts the write and stores secrets safely.
2. **Given** an active org member, **When** the user updates integration config,
   **Then** the API returns `403`.
3. **Given** integration config is read back, **When** the frontend loads it,
   **Then** secret values are never returned, only `configured` state.

---

### User Story 4 - One Documented Auth Contract (Priority: P2)

As a future executor, I can understand and regenerate the API client from a
contract that states auth, roles, errors, and environment requirements.

**Why this priority**: The current contract hides auth in implementation
side-effects, making regressions likely.

**Independent Test**: Read `lib/api-spec/openapi.yaml`, regenerate clients, and
verify protected operations declare bearer auth plus `401` and `403` responses.

**Acceptance Scenarios**:

1. **Given** a protected API path, **When** reading OpenAPI, **Then** bearer auth
   is declared.
2. **Given** generated client code, **When** no auth token is available,
   **Then** the client fails locally with an auth-token-unavailable error instead
   of sending an anonymous request.
3. **Given** a server error, **When** API returns `500`, **Then** response body
   is generic and server logs carry diagnostic details.

## Edge Cases

- Clerk is loaded but `getToken()` returns null on first pass.
- Browser origin is `localhost` while env allowlist only contains `127.0.0.1`,
  or the reverse.
- API starts without `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, or allowed app
  origins.
- User signs in but has no active organization.
- User switches active organization while dashboard data is already loaded.
- Clerk token has `org_id` but user has only member role.
- `DATABASE_URL` points to Supabase Postgres, but no Supabase browser auth is
  configured.
- Integration token is updated, cleared, rotated, or read back.
- Legacy `/signup` URL is opened from a saved bookmark.

## Requirements

### Functional Requirements

- **FR-001**: System MUST load server environment before constructing Clerk
  middleware or database clients.
- **FR-002**: System MUST fail API boot in non-test runtime when required Clerk
  server env is missing.
- **FR-003**: System MUST define one app-origin allowlist used by both CORS and
  Clerk `authorizedParties`.
- **FR-004**: React app MUST wait for a real non-empty Clerk session token before
  mounting `SessionProvider` or issuing protected dashboard requests.
- **FR-005**: Generated API client MUST not silently call protected routes
  anonymously when a token getter is configured but returns null.
- **FR-006**: API MUST resolve a typed auth context for protected routes:
  `actorUserId`, `workspaceId`, `workspaceType`, `orgId`, `orgRole`, and
  `canManageWorkspace`.
- **FR-007**: Health routes MUST stay public; all other API routes MUST require
  authenticated Clerk identity.
- **FR-008**: Workspace-scoped tables MUST require non-empty workspace ownership
  and MUST remove empty-string defaults.
- **FR-009**: Workspace-scoped reads and writes MUST filter by canonical
  workspace context on every route.
- **FR-010**: Sensitive workspace writes, including settings and integrations,
  MUST require admin/owner authorization when active org context exists.
- **FR-011**: Integration credentials MUST not be returned to the frontend and
  MUST not remain raw plaintext in the normal application table.
- **FR-012**: OpenAPI MUST declare bearer auth, `401`, and `403` for protected
  operations, then generated clients MUST be regenerated.
- **FR-013**: Vite MUST expose only required browser env. `SUPABASE_` variables
  MUST not be part of the frontend env prefix unless a browser Supabase client is
  deliberately reintroduced.
- **FR-014**: README and `.env.example` MUST document the chosen architecture:
  Clerk auth, Express API authorization, Supabase Postgres via `DATABASE_URL`.
- **FR-015**: Login UI MUST keep one Clerk auth entry point. `/signup` MUST be
  either a documented legacy redirect or a real Clerk route, not both.
- **FR-016**: Server `500` responses MUST not expose raw internal exception
  messages.

### Key Entities

- **AuthContext**: Server-side request identity resolved from Clerk. Contains
  actor user, active org, role, workspace identifier, and permissions.
- **Workspace**: Canonical tenant boundary. Either `personal:user_<id>` or
  `org:org_<id>`.
- **WorkspaceMembership**: Clerk-provided relationship between actor and
  workspace, including org role when organization context exists.
- **WorkspaceOwnedRecord**: Any persisted project, session, workflow artifact,
  settings, export package, export item, or integration config row.
- **IntegrationSecret**: Jira/GitHub credential material. Must be write-only from
  frontend perspective and protected by admin authorization.

## Success Criteria

### Measurable Outcomes

- **SC-001**: After sign-in and hard refresh, dashboard first-load protected API
  calls return `200` and include an `Authorization` header.
- **SC-002**: Missing token requests to `/api/sessions`, `/api/settings`, and
  `/api/export-packages` return `401`.
- **SC-003**: Valid authenticated member without admin role receives `403` for
  sensitive settings/integration writes.
- **SC-004**: Switching active Clerk organization causes the app to reload data
  under the new workspace scope.
- **SC-005**: Database schema no longer has empty-string defaults for
  workspace-scoped ownership fields.
- **SC-006**: OpenAPI declares auth on every non-health route and generated
  client output reflects the updated contract.
- **SC-007**: Frontend bundle no longer exposes legacy Supabase auth env.
- **SC-008**: Integration config read responses contain no raw Jira/GitHub token
  values.

## Assumptions

- Supabase remains the database provider through `DATABASE_URL`; this spec does
  not use Supabase Auth or a browser Supabase client.
- RLS is not relied on for this reset because the current backend uses a direct
  Postgres connection. The Express API must enforce authorization.
- If direct Supabase Data API access is introduced later, it must use Supabase
  Third-Party Auth with Clerk session tokens, not deprecated Clerk Supabase JWT
  templates.
- Clerk Organizations stay in scope only for workspace switching and basic
  member/admin authorization.
- AI generation, export behavior, and UI redesign are out of scope except where
  their routes need consistent auth.

## Must Finish

- Deterministic server env loading before Clerk middleware construction.
- Real token readiness gate before dashboard API load.
- Central protected-route auth context and public health exception.
- Canonical workspace identity and database ownership cleanup.
- API contract/auth documentation and regenerated clients.
- CORS/env cleanup for one allowed-origin model.
- Sensitive integration secret handling plan implemented or explicitly blocked
  before marking complete.

## May Defer

- Full billing, MFA, passkeys, SSO, verified domains, and satellite domains.
- Direct Supabase Data API access with RLS.
- A separate workspace management page beyond Clerk's minimal org switcher.
- Historical migration of abandoned demo rows if no production data exists.

## Must Not Touch

- AI prompt content and generation quality logic.
- Product workflow phase logic beyond auth guards.
- Visual redesign of dashboard, sidebar, or workspace pages.
- Export provider behavior except credential storage and route authorization.
- Deprecated Clerk Supabase JWT templates or Supabase JWT secret sharing.

## Failure Conditions

Executor must not report complete if:

- Dashboard still fires protected API requests before a token exists.
- API constructs Clerk middleware before env/config validation.
- Any protected route can access data without Clerk identity.
- Workspace-scoped rows can be created with empty or missing workspace owner.
- Member users can edit org-level secrets/settings.
- OpenAPI still omits bearer auth for protected routes.
- Supabase browser env remains exposed without a deliberate Supabase client path.
- Jira/GitHub tokens are returned to the frontend or stored raw without a
  documented encryption/secret-store decision.

## Evidence Required

Executor must report:

1. Changed files grouped by auth client, API auth, DB schema, API contract, docs.
2. Exact environment variables required for local run.
3. Verification of signed-in dashboard first load.
4. Verification of missing token `401`.
5. Verification of valid member forbidden `403` for sensitive writes.
6. Verification that no raw integration token appears in read responses.
7. Any schema migration/data migration impact.
8. Any skipped validation with reason.

## Source-Grounded Notes

- Clerk docs say cross-origin API calls must pass the session token as
  `Authorization: Bearer <token>`, and same-origin calls can rely on Clerk
  cookies.
- Clerk Express docs recommend `clerkMiddleware()` plus `getAuth()` for API
  routes that should return `401`.
- Clerk backend docs recommend `authorizedParties` for request authorization.
- Supabase docs now recommend native Third-Party Auth with Clerk if using
  Supabase Data APIs directly, and mark the old Clerk Supabase JWT template as
  deprecated.
- Supabase RLS docs recommend `auth.jwt()` claims for policies when Supabase is
  evaluating user JWTs. This repo currently uses direct Postgres access, so API
  authorization remains mandatory.

Sources:

- [Clerk: Making authenticated requests](https://clerk.com/docs/guides/development/making-requests)
- [Clerk: Express getAuth](https://clerk.com/docs/reference/express/get-auth)
- [Clerk: authenticateRequest](https://clerk.com/docs/reference/backend/authenticate-request)
- [Clerk: Session tokens](https://clerk.com/docs/guides/sessions/session-tokens)
- [Clerk: Integrate Supabase with Clerk](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase: Third-party auth overview](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase: Clerk third-party auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase: JWTs](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Executor Handoff

```text
Execute spec 009-clerk-supabase-auth-reset. Read spec.md, plan.md, research.md,
data-model.md, quickstart.md, contracts/api-auth-contract.md, and tasks.md first.
Preserve unrelated worktree changes. Do not revive Supabase Auth or deprecated
Clerk Supabase JWT templates. Keep Supabase as Postgres through DATABASE_URL
unless a later spec deliberately introduces Supabase Third-Party Auth/RLS. Fix
root boundaries before UI polish: env loading, token readiness, API auth context,
workspace ownership, role checks, API contract, and env/docs cleanup. Report
changed files, verification evidence, and unresolved risk.
```
