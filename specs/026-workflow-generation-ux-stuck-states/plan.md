# Implementation Plan: Workflow Generation UX — Stuck States and Feedback Gaps

## Summary

Add a running-state UX layer to the workflow generation flow. The user must
always know: (1) something is happening, (2) roughly how long it will take,
(3) they can cancel if needed.

## Technical Context

**Stack**: React 19, TypeScript, Tailwind CSS, Vite
**Key files**: WorkflowWorkspace.tsx, session-store.tsx, GenerationStatusNotice.tsx,
StepActionBar.tsx, PhaseTracker.tsx, GuidancePanel.tsx, button.tsx, custom-fetch.ts
**Existing assets**: `ai-loading-slide` CSS keyframe (unused), Spinner component,
GuidancePanel isLoading prop (unwired)

## Execution Phases

### Phase 1: GenerationRunningNotice

**Goal**: Visible in-panel feedback the moment generation starts.

1. Extend `GenerationStatusNotice` to render for `status === 'running'`.
2. Show: spinner + step label + "usually takes 10–30 seconds" message.
3. Add an elapsed-time counter that appears after 10 seconds.
4. Use the `ai-loading-slide` keyframe for an indeterminate progress bar.
5. Add a cancel button (wired in Phase 4).

### Phase 2: Button and Action Bar Feedback

**Goal**: Buttons clearly communicate they are in a loading state.

1. Add a `loading` prop to the Button component (optional, non-breaking).
2. When `loading=true`: show spinner, change text to "Generating…", add
   `cursor-wait`, apply subtle pulse.
3. Update all panel StepActionBar buttons to use the loading prop.
4. Increase StepActionBar loading visual from `opacity-85` to a more visible
   treatment (e.g., `opacity-60` + border highlight).

### Phase 3: PhaseTracker and GuidancePanel

**Goal**: Global navigation and sidebar reflect generation state.

1. Pass `generatingPhase` prop to PhaseTracker.
2. Replace the number badge with an animated spinner for the generating phase.
3. Wire `isLoading={isWorkflowGenerating}` to GuidancePanel in
   WorkflowWorkspaceContent.
4. Add a loading label: "AI is generating {step}…"

### Phase 4: Cancel Mechanism

**Goal**: Users can abort a long-running generation.

1. Add an `AbortController` ref to the session store's `runGeneration`.
2. Pass the signal to `customFetch` via `options.signal`.
3. Expose `cancelGeneration()` from the store.
4. Wire the cancel button in GenerationRunningNotice.
5. On abort: set status to `idle`, show "Generation cancelled" toast.
6. Handle the AbortError gracefully (don't show it as a failure).

### Phase 5: Completion Transition

**Goal**: Users notice when new content arrives.

1. Add a brief highlight/flash animation to the content area on generation
   success.
2. Auto-scroll to the top of the new content if needed.
3. Consider auto-advancing to the next phase (configurable).

### Phase 6: Validation

1. Test each generation step (clarification, PRD, epics, stories, quality).
2. Confirm running state is visible within 500ms of click.
3. Confirm cancel works and doesn't leave stale state.
4. Confirm completion is noticeable.
5. Confirm PhaseTracker shows generating indicator.
6. Test timeout scenario (45s) — confirm the UI doesn't look stuck.

## Risks

- Cancel mechanism requires the API server to handle aborted connections
  gracefully (it already does — the server completes independently).
- Auto-advance might confuse users who want to stay on the current phase.
  Make it optional or only advance the PhaseTracker highlight.
- The elapsed timer must not create anxiety. Keep the tone calm.

## Dependencies

- Spec 025 should ideally land first to clean up the state model. If not,
  this spec can still be implemented on the current state model by using
  `session.generation[step].status === 'running'` as the single source.

## Recommended Agents

- `agent-implementer` for the UI changes
- `agent-reviewer` for accessibility and interaction review
- `agent-tester` for browser validation
