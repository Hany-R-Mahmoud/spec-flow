# Tasks: Persistence MVP

## Preflight

- [x] T001 Read constitution, spec, plan, and spec 003 outcome.
- [x] T002 Inspect `lib/db`, `lib/api-spec`, `lib/api-zod`,
      `lib/api-client-react`, `artifacts/api-server`, and frontend store/pages.
- [x] T003 Identify current mock-data entry points and list which ones must stop
      being primary runtime sources.

## Schema And Contracts

- [x] T004 Define minimal `projects` schema.
- [x] T005 Define minimal `sessions` schema with current `ProjectSession`
      fields.
- [x] T006 Define workflow artifact storage for clarification, PRD, epics,
      stories, phase state, and metadata.
- [x] T007 Define settings schema.
- [x] T008 Define export/review placeholder metadata only if needed for forward
      compatibility.
- [x] T009 Add insert/select schemas and exported types.
- [x] T010 Expand OpenAPI for project CRUD.
- [x] T011 Expand OpenAPI for session CRUD.
- [x] T012 Expand OpenAPI for settings read/update.
- [x] T013 Regenerate/update Zod/client code using existing repo workflow.

## API

- [x] T014 Add API routes for projects.
- [x] T015 Add API routes for sessions.
- [x] T016 Add API routes for workflow artifacts/phase updates.
- [x] T017 Add API routes for settings.
- [x] T018 Validate request bodies close to the server boundary.
- [x] T019 Return user-friendly error shapes.

## Frontend Wiring

- [x] T020 Replace primary mock session loading with API loading.
- [x] T021 Persist New Breakdown submissions through API.
- [x] T022 Load Dashboard data from API.
- [x] T023 Load Projects data from API.
- [x] T024 Load Workspace by session ID from API.
- [x] T025 Persist phase changes and artifact edits through API.
- [x] T026 Persist settings through API.
- [x] T027 Keep sample data only as explicit seed/demo fallback.

## States And Verification

- [x] T028 Add loading states for API-backed views.
- [x] T029 Add empty states for no projects/sessions/settings.
- [x] T030 Add error states for failed API reads/writes.
- [ ] T031 Verify created session survives refresh.
- [ ] T032 Verify settings survive refresh.
- [x] T033 Run or skip focused checks with reason.
- [x] T034 Report schema/API/client/UI files changed.
- [x] T035 Report remaining mock usage and why it remains.
