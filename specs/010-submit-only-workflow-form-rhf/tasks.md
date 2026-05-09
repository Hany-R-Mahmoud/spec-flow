# Tasks: Submit-Only Workflow Form RHF

**Input**: Design documents from `/specs/010-submit-only-workflow-form-rhf/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `quickstart.md`  
**Tests**: Do not run by default. Use targeted browser or typecheck checks only
when needed to prove the submit-only boundary.

## Phase 1: Discovery and Boundary Map

**Purpose**: Prove where draft changes currently escape into persistence.

- [ ] T001 Read this spec folder and the project constitution.
- [ ] T002 Inspect `artifacts/specflow-ai/src/pages/NewBreakdown.tsx` and map
      every field to its current state owner.
- [ ] T003 Inspect `artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx`,
      `PRDPanel.tsx`, `DeveloperReviewPanel.tsx`, and `SettingsPage.tsx`.
- [ ] T004 Inspect `artifacts/specflow-ai/src/store/session-store.tsx` for
      any draft-time persistence path.
- [ ] T005 List every API mutation that currently runs from typing or field
      change.

## Phase 2: RHF Contract Design

**Purpose**: Define one repeatable form pattern before editing code.

- [ ] T006 Decide which fields use `register` and which require `Controller`.
- [ ] T007 Define the submit/save contract for each workflow surface.
- [ ] T008 Decide where `FormProvider` or `useFormContext` reduces prop
      drilling.
- [ ] T009 Define how `defaultValues` and `reset(...)` will hydrate persisted
      data without triggering writes.

## Phase 3: Intake Rewrite

**Purpose**: Make the breakdown form submit-only.

- [ ] T010 Refactor `NewBreakdown` so all intake fields live in one RHF form.
- [ ] T011 Move chips/select/custom controls into RHF-compatible handlers.
- [ ] T012 Keep derived UI like character count and helper badges read-only.
- [ ] T013 Ensure session creation happens only in the submit handler.

## Phase 4: Workflow Step Rewrite

**Purpose**: Remove keystroke writes from the rest of the workflow.

- [ ] T014 Convert clarification answers to RHF draft state.
- [ ] T015 Make clarification persistence happen only on explicit submit or
      generation action.
- [ ] T016 Convert PRD section editing to RHF draft state.
- [ ] T017 Keep PRD persistence behind explicit Save only.
- [ ] T018 Normalize developer review inputs to the same submit-only pattern.
- [ ] T019 Normalize settings inputs that persist to the same submit-only
      pattern.

## Phase 5: Store Cleanup

**Purpose**: Remove the root cause from the store.

- [ ] T020 Remove or isolate any store path that persists on `UPDATE_*` draft
      actions.
- [ ] T021 Keep explicit persistence methods available for real submit/save
      operations.
- [ ] T022 Make sure draft-only updates do not call `updateSessionArtifacts`,
      `updateSession`, `saveSettings`, or any generation mutation.

## Phase 6: Verification

**Purpose**: Prove the submit-only boundary is real.

- [ ] T023 Verify typing into workflow fields does not issue API requests.
- [ ] T024 Verify submit/start/save buttons still persist once.
- [ ] T025 Verify derived UI still updates from draft state.
- [ ] T026 Verify no workflow surface regressed to autosave behavior.

## Phase 7: Handoff

**Purpose**: Leave a clean record for implementation and review.

- [ ] T027 Document changed files and any input surfaces deferred on purpose.
- [ ] T028 Document any RHF patterns added for custom controls.
- [ ] T029 Report any remaining edge cases that still need manual submit
      gating.

## Dependencies and Execution Order

- Phase 1 blocks safe design.
- Phase 2 blocks implementation because the form pattern must be shared.
- Phase 3 should happen before Phase 4 because the intake form is the primary
  user entry point.
- Phase 5 must land before final verification.
- Phase 6 is the final proof step.

## Parallel Opportunities

- Intake rewrite and workflow-step rewrite can proceed in parallel once the RHF
  contract is settled, as long as the store cleanup is coordinated.
- RHF custom-input wiring and store cleanup touch different files and can be
  split across workers if needed.
