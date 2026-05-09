# Execution Report: Persistence MVP

**Spec**: `004-persistence-mvp`  
**Status**: Implemented, compile-verified, runtime verification pending  
**Date**: 2026-05-05

## Files Changed

- `lib/db/src/schema/index.ts`
- `lib/db/src/index.ts`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/api-zod/src/generated/types/*`
- `lib/api-client-react/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.schemas.ts`
- `artifacts/api-server/src/routes/error-response.ts`
- `artifacts/api-server/src/routes/export-packages.ts`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/persistence.ts`
- `artifacts/api-server/src/routes/projects.ts`
- `artifacts/api-server/src/routes/settings.ts`
- `artifacts/api-server/src/routes/sessions.ts`
- `artifacts/specflow-ai/src/lib/types.ts`
- `artifacts/specflow-ai/src/lib/sample-data.ts`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/ProjectsPage.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/pages/SettingsPage.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/vite.config.ts`
- `specs/004-persistence-mvp/spec.md`
- `specs/004-persistence-mvp/tasks.md`

## Schema

Added persisted Drizzle tables for:

1. `projects`
2. `sessions`
3. `workflow_artifacts`
4. `settings`
5. `export_packages`

Shared schema exports now cover:

- phase / review enums
- clarification questions
- PRD sections
- epics
- stories
- readiness + warning metadata
- settings and export-package types

`lib/db/src/index.ts` now lazy-initializes DB access so health routes can still boot while persistence routes fail clearly when `DATABASE_URL` is missing.

## API

Expanded OpenAPI and regenerated shared Zod/client code for:

1. `GET /api/projects`
2. `POST /api/projects`
3. `GET /api/projects/:projectId`
4. `PATCH /api/projects/:projectId`
5. `GET /api/sessions`
6. `POST /api/sessions`
7. `GET /api/sessions/:sessionId`
8. `PATCH /api/sessions/:sessionId`
9. `PATCH /api/sessions/:sessionId/artifacts`
10. `GET /api/settings`
11. `PUT /api/settings`
12. `GET /api/export-packages`

API behavior added:

- request validation at server boundary via generated `@workspace/api-zod` parsers
- friendly `{ message }` error shape
- demo seed fallback written into DB when tables are empty
- normalized artifact persistence for story review payloads

## Frontend

Primary runtime session/settings/export data now loads from API instead of global mock arrays.

Implemented:

1. `SessionProvider` now fetches persisted sessions, settings, and export packages.
2. Workspace mutations persist phase, clarification, PRD, story, and review edits through API.
3. New Breakdown creates real persisted sessions through `POST /api/sessions`.
4. Settings page loads and saves persisted workspace settings.
5. Dashboard / Projects / Workspace / Exports now show loading + error states for API-backed flows.
6. `lib/types.ts` now reuses generated API contract types instead of local duplicate interfaces.
7. Vite dev server now proxies `/api` to the API server target.

## Known Gaps

These are the main pieces still not complete or not yet proven in a real runtime:

1. `ExportsPage` download is still a toast-only action. The page shows persisted export history, but it does not generate or fetch a real file yet.
2. `ReviewsPage` is display-only. Stories can be viewed and filtered, but there is no full developer-review writeback flow from that page yet.
3. Workflow generation is deterministic/demo-driven, not live AI. That is acceptable for this persistence MVP, but it is still not the final intended AI behavior.
4. Refresh verification is still pending against a real database-backed runtime. The code path exists, but `T031` and `T032` are not yet proven end to end in this session.
5. A few UI strings still mention "local memory" or demo fallback. They do not block the flow, but they are stale copy and should be cleaned up later.

## Remaining Mock Usage

`artifacts/specflow-ai/src/lib/sample-data.ts` remains only as a tiny typed fallback module. It is no longer the primary runtime source for Dashboard, Projects, Workspace, New Breakdown, Settings, or export history.

## Verification

Passed:

```bash
pnpm --filter @workspace/api-spec codegen
pnpm run typecheck
```

Not completed in this execution:

- `T031` refresh proof for newly created sessions
- `T032` refresh proof for settings persistence

Reason:

- No `DATABASE_URL` was present in this session, so I could compile and wire the persistence path but could not boot a real database-backed runtime to perform end-to-end refresh verification.

## Honest Status

Implementation is in place and compile-clean, but spec success criteria `SC-001` and `SC-003` are not claimed as verified yet. Next step is runtime validation against a provisioned Postgres database:

1. set `DATABASE_URL`
2. run `pnpm --filter @workspace/db push`
3. start API + frontend
4. create session, refresh, confirm persistence
5. update settings, refresh, confirm persistence
