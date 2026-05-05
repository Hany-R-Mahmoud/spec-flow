# Tasks: Collaboration And Review

## Preflight

- [ ] T001 Read constitution, spec, plan, and specs 004/006 outcomes.
- [ ] T002 Inspect DeveloperReviewPanel, ReviewsPage, Dashboard counts, export
      events, and notification UI.
- [ ] T003 Identify current in-memory review/comment state that must become
      persisted.

## Persistence And API

- [ ] T004 Add persisted review schema.
- [ ] T005 Add persisted comment schema.
- [ ] T006 Add persisted status history schema.
- [ ] T007 Add persisted activity event schema.
- [ ] T008 Add persisted notification schema.
- [ ] T009 Add API endpoints for reviews.
- [ ] T010 Add API endpoints for comments.
- [ ] T011 Add API endpoints for status changes/history.
- [ ] T012 Add API endpoints for activity timeline.
- [ ] T013 Add API endpoints for notifications.
- [ ] T014 Validate identity/user display fields as untrusted input.

## Frontend Wiring

- [ ] T015 Wire DeveloperReviewPanel submit/read to API.
- [ ] T016 Persist reviewer name/comment/status.
- [ ] T017 Wire ReviewsPage filters/counts to API.
- [ ] T018 Add status history display where useful.
- [ ] T019 Add activity timeline surface.
- [ ] T020 Replace fake notification bell with real notification list/state.
- [ ] T021 Update Dashboard review counts from persisted state.
- [ ] T022 Emit activity/notification events for review and export status
      changes.

## Scope Guardrails And Verification

- [ ] T023 Keep full auth/team roles deferred unless separately specified.
- [ ] T024 Verify review comment survives refresh.
- [ ] T025 Verify status history records changes.
- [ ] T026 Verify notification list changes when relevant events occur.
- [ ] T027 Run or skip focused checks with reason.
- [ ] T028 Report remaining auth/identity assumptions.
