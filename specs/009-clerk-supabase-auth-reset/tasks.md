# Tasks: Clerk-Supabase Auth Reset

**Input**: Design documents from `/specs/009-clerk-supabase-auth-reset/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/api-auth-contract.md`, `quickstart.md`  
**Tests**: User does not want tests run by default. Add or run tests only if
needed to diagnose auth failure or if explicitly requested.

## Phase 1: Setup and Preflight

**Purpose**: Confirm current drift and prepare safe implementation.

- [x] T001 Read this spec folder and `.specify/memory/constitution.md`.
- [x] T002 Inspect existing worktree changes with `git status --short` and do
      not revert unrelated user edits.
- [x] T003 Inspect current auth files:
      `artifacts/specflow-ai/src/main.tsx`,
      `artifacts/specflow-ai/src/App.tsx`,
      `artifacts/specflow-ai/src/components/providers/auth-provider.tsx`,
      `artifacts/specflow-ai/src/pages/LoginPage.tsx`,
      `artifacts/api-server/src/app.ts`,
      `artifacts/api-server/src/index.ts`,
      `artifacts/api-server/src/routes/auth.ts`.
- [x] T004 Inspect contract/schema files:
      `lib/api-spec/openapi.yaml`,
      `lib/api-client-react/src/custom-fetch.ts`,
      `lib/db/src/schema/index.ts`,
      `.env.example`,
      `README.md`.

## Phase 2: Runtime Config Foundation

**Purpose**: Clerk middleware must receive validated env before app creation.

- [x] T005 Add a server runtime config module at
      `artifacts/api-server/src/config.ts` or equivalent.
- [x] T006 Move root `.env` loading before importing/constructing Express app in
      `artifacts/api-server/src/index.ts`.
- [x] T007 Validate `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` or fallback,
      `DATABASE_URL`, and allowed origins before server listens.
- [x] T008 Replace hardcoded/default authorized parties in
      `artifacts/api-server/src/app.ts` with config-driven allowed origins.
- [x] T009 Replace broad `cors()` in `artifacts/api-server/src/app.ts` with the
      same allowed origin list used for Clerk `authorizedParties`.
- [x] T010 Ensure API boot reports a clear setup error when required config is
      missing.

**Checkpoint**: API cannot construct Clerk middleware with stale or missing env.

## Phase 3: Client Token Readiness

**Goal**: Signed-in dashboard waits for real token before protected requests.

**Independent Test**: Hard refresh dashboard after sign-in; first protected
requests include Bearer token and return `200`.

- [x] T011 Update
      `artifacts/specflow-ai/src/components/providers/auth-provider.tsx` so
      `isTokenReady` becomes true only after `await getToken()` returns a
      non-empty string for the current session.
- [x] T012 Store current token or token getter state without leaking token into
      UI/debug output.
- [x] T013 Reset token readiness on sign-out, session change, or token failure.
- [x] T014 Keep `artifacts/specflow-ai/src/App.tsx` from mounting
      `SessionProvider` until `isSignedIn && isTokenReady`.
- [x] T015 Update `lib/api-client-react/src/custom-fetch.ts` so configured auth
      getter returning null fails locally instead of sending an anonymous
      protected request.
- [x] T016 Preserve explicit caller-provided `Authorization` header behavior in
      `customFetch`.

**Checkpoint**: Token race no longer produces anonymous first dashboard load.

## Phase 4: API Auth Context

**Goal**: Every protected route uses one typed Clerk-derived workspace context.

**Independent Test**: Missing token returns `401`; valid token resolves
workspace context; health remains public.

- [x] T017 Replace string-only `requireWorkspaceId()` in
      `artifacts/api-server/src/routes/auth.ts` with typed auth context helpers.
- [x] T018 Include `actorUserId`, `workspaceId`, `workspaceType`, `orgId`,
      `orgRole`, and `canManageWorkspace` in the context.
- [x] T019 Keep `GET /api/healthz` public in
      `artifacts/api-server/src/routes/health.ts`.
- [x] T020 Apply protected auth context to
      `artifacts/api-server/src/routes/projects.ts`.
- [x] T021 Apply protected auth context to
      `artifacts/api-server/src/routes/sessions.ts`.
- [x] T022 Apply protected auth context to
      `artifacts/api-server/src/routes/settings.ts`.
- [x] T023 Apply protected auth context to
      `artifacts/api-server/src/routes/export-packages.ts`.
- [x] T024 Apply protected auth context to
      `artifacts/api-server/src/routes/generation.ts`.
- [x] T025 Apply protected auth context to
      `artifacts/api-server/src/routes/integrations.ts`.
- [x] T026 Add stable `401` and `403` response helpers in
      `artifacts/api-server/src/routes/error-response.ts`.
- [x] T027 Update unexpected error handling to return generic `500` body and log
      details server-side.

**Checkpoint**: Auth is centralized; routes no longer hand-roll workspace string
fallbacks.

## Phase 5: Workspace Ownership Data Model

**Goal**: Database ownership matches canonical auth context.

**Independent Test**: Rows cannot be inserted without non-empty workspace owner;
different workspaces cannot see each other's rows.

- [x] T028 Update `lib/db/src/schema/index.ts` to remove empty-string defaults
      from all `workspaceId` columns.
- [x] T029 Add explicit ownership/audit fields or document and implement the
      canonical `workspaceId` convention from `data-model.md`.
- [x] T030 Add workspace-scoped indexes/unique constraints for projects,
      sessions, artifacts, settings, exports, export items, and integration
      config.
- [x] T031 Update persistence helpers in
      `artifacts/api-server/src/routes/persistence.ts` to require auth context
      or explicit non-empty workspace IDs.
- [x] T032 Ensure linked project updates in
      `artifacts/api-server/src/routes/sessions.ts` filter by workspace as well
      as project id.
- [x] T033 Add migration notes or migration implementation for existing rows.
- [x] T034 Update `lib/db/drizzle.config.ts` only if needed for the migration
      workflow.

**Checkpoint**: New data cannot enter an empty or ambiguous workspace namespace.

## Phase 6: Clerk Organization Surface and Roles

**Goal**: Workspace switching and sensitive writes match Clerk org context.

**Independent Test**: Org switch changes data scope; org member cannot update
sensitive workspace config; admin can.

- [x] T035 Add Clerk organization surface to
      `artifacts/specflow-ai/src/components/layout/Topbar.tsx` or another
      existing shell location without redesigning the app.
- [x] T036 Update
      `artifacts/specflow-ai/src/components/providers/auth-provider.tsx` to
      expose active org/workspace metadata needed by the shell.
- [x] T037 Ensure `SessionProvider` remounts/reloads when active workspace
      changes.
- [x] T038 Require `canManageWorkspace` for `PUT /settings` in
      `artifacts/api-server/src/routes/settings.ts`.
- [x] T039 Require `canManageWorkspace` for `PUT /integrations/config/:type` in
      `artifacts/api-server/src/routes/integrations.ts`.
- [x] T040 Keep personal workspace users able to manage their own personal
      workspace.

**Checkpoint**: Workspace role model is enforced server-side.

## Phase 7: Integration Secret Boundary

**Goal**: Integration credentials are write-only from frontend perspective.

**Independent Test**: Read integration config after saving credentials; response
contains `configured` but no token values.

- [x] T041 Separate safe integration metadata from secret material in
      `artifacts/api-server/src/routes/integrations.ts`.
- [x] T042 Encrypt integration secrets with server-only config or introduce a
      secret-store abstraction in `artifacts/api-server/src`.
- [x] T043 Fail secret writes clearly if required secret-store/encryption config
      is missing.
- [x] T044 Update `integration_config` persistence helpers in
      `artifacts/api-server/src/routes/persistence.ts` so public responses never
      include raw secret fields.
- [x] T045 Add clear or rotate behavior for saved secrets.

**Checkpoint**: Plaintext token readback is impossible through normal API.

## Phase 8: API Contract and Generated Clients

**Goal**: Auth behavior is part of the API contract.

**Independent Test**: OpenAPI protected paths declare bearer auth and `401`/`403`.

- [x] T046 Add `bearerAuth` security scheme to `lib/api-spec/openapi.yaml`.
- [x] T047 Add `Unauthorized` and `Forbidden` reusable responses to
      `lib/api-spec/openapi.yaml`.
- [x] T048 Add auth security and `401`/`403` responses to every protected
      operation in `lib/api-spec/openapi.yaml`.
- [x] T049 Keep `/healthz` public in OpenAPI.
- [x] T050 Regenerate API packages using the repo's codegen command if present.
- [x] T051 Resolve generated type/client compile issues caused by auth contract
      changes.

**Checkpoint**: Future client generation cannot hide auth requirements.

## Phase 9: Env, Auth UI, and Docs Cleanup

**Goal**: Repo docs and browser env match chosen architecture.

- [x] T052 Remove `SUPABASE_` from Vite `envPrefix` in
      `artifacts/specflow-ai/vite.config.ts` unless a direct browser Supabase
      client is deliberately added.
- [x] T053 Update `artifacts/specflow-ai/src/vite-env.d.ts` for only supported
      browser env.
- [x] T054 Normalize `.env.example` to Clerk, app/API URLs, allowed origins,
      `DATABASE_URL`, and optional secret encryption config.
- [x] T055 Remove duplicate `.env.example` entries and mark Supabase auth env as
      out of scope or remove it.
- [x] T056 Update `README.md` to describe two-process local run and selected
      Clerk + Express + Supabase Postgres architecture.
- [x] T057 Simplify `artifacts/specflow-ai/src/pages/LoginPage.tsx` so Clerk auth
      URL behavior has one source of truth.
- [x] T058 Keep `/signup` behavior in `artifacts/specflow-ai/src/App.tsx`
      documented as legacy redirect or implement it as a real Clerk route, but
      do not keep half-both.

**Checkpoint**: No legacy Supabase auth assumptions remain in primary runtime.

## Phase 10: Verification and Handoff

**Purpose**: Prove root issue is fixed and report remaining risk.

- [ ] T059 Verify signed-in dashboard hard refresh sends Bearer token on first
      protected requests and returns `200`.
- [ ] T060 Verify missing token returns `401` for protected routes.
- [ ] T061 Verify invalid/wrong role returns `403` for sensitive writes.
- [ ] T062 Verify org switch changes workspace data scope.
- [ ] T063 Verify integration config read returns no raw secrets.
- [ ] T064 Verify `/api/healthz` remains public.
- [x] T065 Run targeted typecheck/codegen/browser checks only as needed and
      report exact commands/results.
- [x] T066 Report changed files, migration impact, skipped checks, and any
      unresolved risks.

## Dependencies and Execution Order

- Phase 2 blocks all API work because middleware needs valid config.
- Phase 3 blocks dashboard verification.
- Phase 4 blocks route/schema role work.
- Phase 5 should happen before final route verification.
- Phase 6 and Phase 7 can proceed after Phase 4, but they touch some same route
  files and should be coordinated.
- Phase 8 should happen after route behavior is settled.
- Phase 9 can run in parallel with Phase 8 except for docs that depend on final
  env names.
- Phase 10 is final only.

## Parallel Opportunities

- Config foundation and OpenAPI planning can be researched in parallel.
- Schema ownership and frontend token readiness touch different packages.
- Docs cleanup can run while API route auth context is implemented.
- Security review should run after Phases 4-7 before completion.
