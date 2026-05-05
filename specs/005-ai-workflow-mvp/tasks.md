# Tasks: AI Workflow MVP

## Preflight

- [x] T001 Read constitution, spec, plan, and spec 004 outcome.
- [x] T002 Inspect `mock-ai.ts`, workspace panels, API routes, persisted artifact
      schema, and current generated-data UI assumptions.
- [x] T003 Identify active generation path and confirm which stubs must be
      replaced or bypassed.

## Contracts And Prompting

- [x] T004 Define generation request schemas for clarification, PRD, epics,
      stories, and scoring.
- [x] T005 Define response schemas for each generated artifact.
- [x] T006 Add prompt template modules/files with version identifiers.
- [x] T007 Add model configuration handling with no hardcoded secrets.
- [x] T008 Add deterministic unavailable/demo behavior when credentials are
      missing.

## Backend Workflow

- [x] T009 Add clarification generation endpoint/service.
- [x] T010 Add PRD generation endpoint/service.
- [x] T011 Add epic generation endpoint/service.
- [x] T012 Add story generation endpoint/service.
- [x] T013 Add readiness scoring endpoint/service or integrated scoring step.
- [x] T014 Add warning detection.
- [x] T015 Validate AI output before saving.
- [x] T016 Persist generated output and generation status.
- [x] T017 Prevent invalid output from corrupting prior saved state.

## Frontend Workflow

- [x] T018 Wire ClarificationPanel generate action.
- [x] T019 Wire PRDPanel generate action.
- [x] T020 Wire EpicsPanel generate action.
- [x] T021 Wire StoriesPanel generate action.
- [x] T022 Wire QualityReviewPanel scoring/warning display to real outputs.
- [x] T023 Add regenerate controls where useful.
- [x] T024 Add loading states.
- [x] T025 Add failure and retry states.
- [x] T026 Add unavailable/demo state if model config missing.
- [x] T027 Ensure generated text is rendered safely, not as unsafe HTML.

## Verification

- [x] T028 Run one happy path from intake to stories or document exact blocker.
- [ ] T029 Simulate failed generation and verify recovery path.
- [ ] T030 Verify generated artifacts survive refresh.
- [x] T031 Run or skip focused checks with reason.
- [x] T032 Report prompt/model assumptions, changed files, and remaining risks.
