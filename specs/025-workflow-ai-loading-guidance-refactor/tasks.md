# Tasks: Workflow AI Loading And Guidance Refactor

## Phase 1: Inventory And Boundary Map

**Purpose**: lock the source problem before changing code.

- [ ] T001 Read `spec.md`, `plan.md`, `research.md`, `review.md`, `testing.md`,
      and the project constitution.
- [ ] T002 Inspect the workflow workspace, store, guidance route, and panel
      components.
- [ ] T003 Build a state-and-loading matrix for generation, guidance, and
      sidebar behavior.
- [ ] T004 Identify every UI surface that currently narrates the same busy
      event.

## Phase 2: Contract Design

**Purpose**: define the source-level behavior before implementation.

- [ ] T005 Define the one true generation-state owner.
- [ ] T006 Define the guidance snapshot contract and its hash inputs.
- [ ] T007 Define which loading surfaces remain and which are removed or
      downgraded.
- [ ] T008 Decide whether sidebar guidance is explicit refresh only or cached
      passive support.
- [ ] T009 Define the banner semantics.

## Phase 3: State Refactor

**Purpose**: remove the split busy model.

- [ ] T010 Remove or demote duplicate local generation busy state.
- [ ] T011 Make panels derive busy state from the authoritative source only.
- [ ] T012 Keep manual-mode and unavailable states honest.

## Phase 4: Guidance Refactor

**Purpose**: stop guidance from refiring on live typing.

- [ ] T013 Replace live-draft guidance dependencies with a stable snapshot.
- [ ] T014 Add cache or dedupe by snapshot hash.
- [ ] T015 Add stale-request abort behavior.
- [ ] T016 Remove the guidance effect dependencies that cause churn.

## Phase 5: UI Simplification

**Purpose**: reduce duplicate loading surfaces.

- [ ] T017 Remove or consolidate duplicate loading chip / banner / spinner
      combinations.
- [ ] T018 Fix top banner semantics so it does not masquerade as loading
      chrome.
- [ ] T019 Simplify sidebar loading presentation.

## Phase 6: Validation

**Purpose**: prove the refactor solved the source issues.

- [ ] T020 Run a built-in browser retest on local host.
- [ ] T021 Confirm one generate action does not fan out into multiple
      overlapping AI requests.
- [ ] T022 Confirm draft typing does not spam guidance requests.
- [ ] T023 Confirm duplicate loading surfaces are gone.
- [ ] T024 Confirm refresh behavior still works.

## Phase 7: Cleanup And Documentation

**Purpose**: leave the codebase simpler than before.

- [ ] T025 Remove dead code introduced by the old split-state model.
- [ ] T026 Update docs or decision log if the refactor changes durable
      workflow behavior.
- [ ] T027 Capture remaining risks and any follow-up work.

## Dependencies And Order

- Phase 1 blocks Phase 2.
- Phase 2 blocks safe code changes.
- Phase 3 should land before Phase 4 because the state source must be clear
  first.
- Phase 4 and Phase 5 can overlap once the state contract is settled.
- Phase 6 is the proof step.
- Phase 7 closes out the refactor cleanly.

## Parallel Opportunities

- State refactor review and guidance refactor review can run in parallel once
  the contract is fixed.
- Browser verification can run while cleanup is underway if it does not touch
  the same files.

