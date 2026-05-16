# Tasks: Workflow Generation UX — Stuck States and Feedback Gaps

## Phase 1: Running-State Notice

- [ ] T001 Extend `GenerationStatusNotice` to render when `status === 'running'`
      with spinner, step label, and time estimate message.
- [ ] T002 Add an elapsed-time counter (shows after 10s: "Running for 12s…").
- [ ] T003 Add the `ai-loading-slide` progress bar below the notice text.
- [ ] T004 Add a cancel button placeholder (wired in Phase 4).

## Phase 2: Button and Action Bar

- [ ] T005 Add optional `loading` prop to `Button` component. When true:
      show spinner, apply `cursor-wait`, add subtle pulse animation.
- [ ] T006 Update `ClarificationPanel` buttons: text changes to
      "Generating…" during loading, use `loading` prop.
- [ ] T007 Update `PRDPanel` buttons: same pattern.
- [ ] T008 Update `EpicsPanel` buttons: same pattern.
- [ ] T009 Update `StoriesPanel` buttons: same pattern.
- [ ] T010 Update `QualityReviewPanel` buttons: same pattern.
- [ ] T011 Strengthen `StepActionBar` loading visual: increase from
      `opacity-85` to `opacity-60` + accent border or background change.

## Phase 3: PhaseTracker and GuidancePanel

- [ ] T012 Add `generatingPhase` prop to `PhaseTracker`. Show animated
      spinner instead of number badge for the generating phase.
- [ ] T013 Pass `isWorkflowGenerating` and step label to `GuidancePanel`
      as `isLoading` and `loadingLabel` in `WorkflowWorkspaceContent`.
- [ ] T014 Add disabled-button explanation: when buttons are disabled due
      to another step generating, show a small "Another step is generating…"
      message in the StepActionBar.

## Phase 4: Cancel Mechanism

- [ ] T015 Add `AbortController` management to `runGeneration` in
      `session-store.tsx`. Store the controller ref.
- [ ] T016 Update `customFetch` to accept and forward `signal` from options.
- [ ] T017 Expose `cancelGeneration()` from the session store context.
- [ ] T018 Wire the cancel button in `GenerationStatusNotice` to call
      `cancelGeneration()`.
- [ ] T019 Handle `AbortError` in `runGeneration`: set status to `idle`,
      show "Generation cancelled" toast, don't treat as failure.

## Phase 5: Completion Transition

- [ ] T020 Add a brief highlight animation to the content area when
      generation succeeds (e.g., border flash or background pulse).
- [ ] T021 Auto-scroll to top of new content on generation success.
- [ ] T022 Evaluate and optionally implement phase auto-advance after
      generation success (may be deferred based on user feedback).

## Phase 6: Validation

- [ ] T023 Test all 5 generation steps with the new running-state UI.
- [ ] T024 Test cancel mechanism — confirm clean abort and state reset.
- [ ] T025 Test timeout scenario — confirm UI stays informative through 45s.
- [ ] T026 Test completion transition — confirm content arrival is noticeable.
- [ ] T027 Test disabled-button explanation — confirm users understand why
      buttons are disabled.
- [ ] T028 Accessibility check: screen reader announces generation state
      changes via `aria-live` or `aria-busy`.

## Dependencies and Order

- Phase 1 can start immediately (no blockers).
- Phase 2 can start in parallel with Phase 1.
- Phase 3 depends on Phase 1 (needs the running state to be visible first).
- Phase 4 depends on Phase 1 (cancel button lives in the notice).
- Phase 5 depends on Phase 1 and 2 (needs the generation flow working).
- Phase 6 depends on all previous phases.

## Parallel Opportunities

- T001–T004 (notice) and T005–T011 (buttons) can run in parallel.
- T012–T014 (tracker/guidance) can start once T001 lands.
- T015–T019 (cancel) can start once T004 lands.
