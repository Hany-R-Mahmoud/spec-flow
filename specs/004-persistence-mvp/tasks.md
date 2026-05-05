# Tasks: Persistence MVP

## Preflight

- [ ] T001 Read constitution, spec, plan, and spec 003 outcome.
- [ ] T002 Inspect `lib/db`, `lib/api-spec`, `lib/api-zod`,
      `lib/api-client-react`, `artifacts/api-server`, and frontend store/pages.
- [ ] T003 Identify current mock-data entry points and list which ones must stop
      being primary runtime sources.

## Schema And Contracts

- [ ] T004 Define minimal `projects` schema.
- [ ] T005 Define minimal `sessions` schema with current `ProjectSession`
      fields.
- [ ] T006 Define workflow artifact storage for clarification, PRD, epics,
      stories, phase state, and metadata.
- [ ] T007 Define settings schema.
- [ ] T008 Define export/review placeholder metadata only if needed for forward
      compatibility.
- [ ] T009 Add insert/select schemas and exported types.
- [ ] T010 Expand OpenAPI for project CRUD.
- [ ] T011 Expand OpenAPI for session CRUD.
- [ ] T012 Expand OpenAPI for settings read/update.
- [ ] T013 Regenerate/update Zod/client code using existing repo workflow.

## API

- [ ] T014 Add API routes for projects.
- [ ] T015 Add API routes for sessions.
- [ ] T016 Add API routes for workflow artifacts/phase updates.
- [ ] T017 Add API routes for settings.
- [ ] T018 Validate request bodies close to the server boundary.
- [ ] T019 Return user-friendly error shapes.

## Frontend Wiring

- [ ] T020 Replace primary mock session loading with API loading.
- [ ] T021 Persist New Breakdown submissions through API.
- [ ] T022 Load Dashboard data from API.
- [ ] T023 Load Projects data from API.
- [ ] T024 Load Workspace by session ID from API.
- [ ] T025 Persist phase changes and artifact edits through API.
- [ ] T026 Persist settings through API.
- [ ] T027 Keep sample data only as explicit seed/demo fallback.

## States And Verification

- [ ] T028 Add loading states for API-backed views.
- [ ] T029 Add empty states for no projects/sessions/settings.
- [ ] T030 Add error states for failed API reads/writes.
- [ ] T031 Verify created session survives refresh.
- [ ] T032 Verify settings survive refresh.
- [ ] T033 Run or skip focused checks with reason.
- [ ] T034 Report schema/API/client/UI files changed.
- [ ] T035 Report remaining mock usage and why it remains.
