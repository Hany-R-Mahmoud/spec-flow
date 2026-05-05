# Feature Specification: Persistence MVP

**Feature Branch**: `003-persistence-mvp`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase C from the 2nd phase roadmap

## Goal

Replace refresh-lost in-memory workflow state with a minimal persisted backend
for projects, sessions, workflow artifacts, settings, and export package records.

## User Scenarios

1. As a user, I can create a breakdown and still see it after refresh.
2. As a user, I can update workflow artifacts and see the saved state later.
3. As a user, I can change settings and keep them across sessions.
4. As a future AI/export feature, I can read/write structured workflow data
   through stable API contracts.

## Requirements

- **FR-001**: Define Drizzle tables for projects, sessions, workflow artifacts,
  settings, reviews, and export packages where needed for MVP.
- **FR-002**: Reuse or generate schema-layer types instead of local duplicate
  contracts.
- **FR-003**: Expand OpenAPI beyond health endpoints for basic CRUD.
- **FR-004**: Implement API routes for projects and sessions.
- **FR-005**: Persist New Breakdown submissions.
- **FR-006**: Load Dashboard/Projects/Workspace from API data.
- **FR-007**: Persist settings.
- **FR-008**: Keep sample data only as seed/demo fallback, not primary runtime
  source.
- **FR-009**: Add loading/error/empty states for API-backed views.
- **FR-010**: Do not implement AI generation in this spec.

## Key Files

- `lib/db/src/schema/index.ts`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.ts`
- `artifacts/api-server/src/routes/`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/ProjectsPage.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/pages/SettingsPage.tsx`

## Success Criteria

- **SC-001**: New sessions survive browser refresh.
- **SC-002**: Dashboard reflects API-backed sessions.
- **SC-003**: Settings persist.
- **SC-004**: API validates inputs close to server boundary.
- **SC-005**: No product page depends on global mock state for primary data.

## Executor Handoff

```text
Execute spec 003-persistence-mvp. Read spec.md, plan.md, tasks.md, constitution,
and spec 002 outcome first. Preserve unrelated changes. Implement persistence
MVP only. Report schema/API/UI changes and verification.
```
