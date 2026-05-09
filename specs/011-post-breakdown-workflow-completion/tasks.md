# Tasks: Post-Breakdown Workflow Completion

**Input**: Design docs from `/specs/011-post-breakdown-workflow-completion/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `quickstart.md`  
**Tests**: Do not run broad suites by default. Use targeted browser or typecheck
checks only when needed to prove the no-dummy boundary.

## Phase 1: Inventory and Contract Map

**Purpose**: Prove where the remaining dummy and partial behaviors live.

- [ ] T001 Read this spec folder and the project constitution.
- [ ] T002 Inspect the workflow workspace and map every visible control after
      `Create Breakdown`.
- [ ] T003 Classify each control as real, partial, dummy, dead, or removable.
- [ ] T004 Confirm which controls already have real persistence or generation
      paths.
- [ ] T005 Produce the final action contract matrix.

## Phase 2: Behavior Design

**Purpose**: Define the real command semantics before editing code.

- [ ] T006 Decide the persisted phase-state model.
- [ ] T007 Define the guidance action contract for each phase.
- [ ] T008 Define the real `Split Story` contract.
- [ ] T009 Define the Jira connection contract and failure states.
- [ ] T010 Define the review-completion gate rules.
- [ ] T011 Decide which dead controls should be removed instead of converted.

## Phase 3: Phase and Guidance Wiring

**Purpose**: Remove the fake workflow navigation and fake help buttons.

- [ ] T012 Make phase navigation persist real session state.
- [ ] T013 Make phase changes survive refresh and match persisted data.
- [ ] T014 Wire guidance actions to real callbacks.
- [ ] T015 Render guidance items as plain text when no real action exists.
- [ ] T016 Remove dead guidance action paths.

## Phase 4: Review Workflow Completion

**Purpose**: Turn the review handoffs into real workflow state changes.

- [ ] T017 Implement the real `Split Story` flow or remove the CTA.
- [ ] T018 Make `Send All to Dev Review` update story-level state.
- [ ] T019 Make `Complete Review` block or warn when unresolved work remains.
- [ ] T020 Remove or wire the dead `onSendToReview` prop path.

## Phase 5: Jira and Export Completion

**Purpose**: Replace placeholders with real artifact behavior.

- [ ] T021 Replace the Jira coming-soon CTA with a real connection state flow.
- [ ] T022 Wire export history download to a real artifact source.
- [ ] T023 Ensure export actions produce a real copy, download, or sync result.
- [ ] T024 Remove any remaining placeholder copy in the export path.

## Phase 6: Cleanup

**Purpose**: Remove misleading code after the real paths exist.

- [ ] T025 Remove unused props, dead handlers, and placeholder branches.
- [ ] T026 Keep only the commands that now have a real product effect.
- [ ] T027 Preserve the already-working intake-to-review flow.

## Phase 7: Verification

**Purpose**: Prove the flow is now fully functional.

- [ ] T028 Verify every visible post-breakdown control does something real or
      is not rendered.
- [ ] T029 Verify phase state survives refresh.
- [ ] T030 Verify guidance actions no longer no-op.
- [ ] T031 Verify split, review, Jira, and export actions all have real
      outcomes.
- [ ] T032 Verify no visible `Coming Soon` or other dummy CTA remains.

## Dependencies and Execution Order

- Phase 1 blocks safe design.
- Phase 2 blocks implementation because the command contract must be clear.
- Phase 3 should land before Phase 4 because the top-level navigation and
  guidance surfaces are the first user-visible trust gaps.
- Phase 5 depends on the review workflow contract being stable.
- Phase 6 removes leftover dead code only after the real path exists.
- Phase 7 is the final proof step.

## Parallel Opportunities

- Guidance wiring, review workflow completion, and Jira/export completion can
  run in parallel once the behavior contract is settled.
- Browser verification can run alongside cleanup once the commands are wired.
