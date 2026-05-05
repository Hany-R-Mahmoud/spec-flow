# Tasks: AI Workflow MVP

## Preflight

- [ ] T001 Read constitution, spec, plan, and spec 004 outcome.
- [ ] T002 Inspect `mock-ai.ts`, workspace panels, API routes, persisted artifact
      schema, and current generated-data UI assumptions.
- [ ] T003 Identify active generation path and confirm which stubs must be
      replaced or bypassed.

## Contracts And Prompting

- [ ] T004 Define generation request schemas for clarification, PRD, epics,
      stories, and scoring.
- [ ] T005 Define response schemas for each generated artifact.
- [ ] T006 Add prompt template modules/files with version identifiers.
- [ ] T007 Add model configuration handling with no hardcoded secrets.
- [ ] T008 Add deterministic unavailable/demo behavior when credentials are
      missing.

## Backend Workflow

- [ ] T009 Add clarification generation endpoint/service.
- [ ] T010 Add PRD generation endpoint/service.
- [ ] T011 Add epic generation endpoint/service.
- [ ] T012 Add story generation endpoint/service.
- [ ] T013 Add readiness scoring endpoint/service or integrated scoring step.
- [ ] T014 Add warning detection.
- [ ] T015 Validate AI output before saving.
- [ ] T016 Persist generated output and generation status.
- [ ] T017 Prevent invalid output from corrupting prior saved state.

## Frontend Workflow

- [ ] T018 Wire ClarificationPanel generate action.
- [ ] T019 Wire PRDPanel generate action.
- [ ] T020 Wire EpicsPanel generate action.
- [ ] T021 Wire StoriesPanel generate action.
- [ ] T022 Wire QualityReviewPanel scoring/warning display to real outputs.
- [ ] T023 Add regenerate controls where useful.
- [ ] T024 Add loading states.
- [ ] T025 Add failure and retry states.
- [ ] T026 Add unavailable/demo state if model config missing.
- [ ] T027 Ensure generated text is rendered safely, not as unsafe HTML.

## Verification

- [ ] T028 Run one happy path from intake to stories or document exact blocker.
- [ ] T029 Simulate failed generation and verify recovery path.
- [ ] T030 Verify generated artifacts survive refresh.
- [ ] T031 Run or skip focused checks with reason.
- [ ] T032 Report prompt/model assumptions, changed files, and remaining risks.
