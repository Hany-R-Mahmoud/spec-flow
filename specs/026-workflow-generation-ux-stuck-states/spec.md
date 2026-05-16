# Feature Specification: Workflow Generation UX — Stuck States and Feedback Gaps

**Created**: 2026-05-16
**Status**: Draft
**Source**: user-reported issues, code-level investigation, UX gap analysis
**Relates to**: 025-workflow-ai-loading-guidance-refactor (overlapping root causes)

## Problem Statement

When a user triggers AI generation during the breakdown workflow, the UI
provides almost no feedback during the 10–45 second wait. The result is a
"stuck screen" perception: users cannot tell whether the system is working,
how long to wait, or whether something has failed. This creates anxiety,
premature abandonment, and false error perception.

The existing fixes (tiny button spinners, 15% opacity reduction) treat
symptoms. The source problem is that the workflow has no dedicated
**running-state UX layer** between "user clicked" and "result arrived."

## Findings

### F-01: GenerationStatusNotice ignores the running state

`GenerationStatusNotice` renders only for `succeeded`, `failed`, and
`unavailable`. When `status === 'running'`, the notice area is empty. The user
sees the same panel content as before clicking.

**File**: `components/workspace/GenerationStatusNotice.tsx` line 18
**Impact**: No in-panel feedback during the entire generation window.

### F-02: Content area stays completely static during generation

While the AI processes (10–45s), the main panel content (questions, PRD
sections, epics, stories) remains unchanged. No skeleton, no shimmer, no
overlay, no progress indicator.

**Files**: `ClarificationPanel.tsx`, `PRDPanel.tsx`, `EpicsPanel.tsx`,
`StoriesPanel.tsx`, `QualityReviewPanel.tsx`
**Impact**: Users perceive the UI as frozen or broken.

### F-03: PhaseTracker has no generating indicator

`PhaseTracker` shows phase tabs with status icons (check, warning, number) but
has no visual state for "currently generating." Users cannot tell which phase
is being processed from the navigation.

**File**: `components/workspace/PhaseTracker.tsx`
**Impact**: No global context about what the system is doing.

### F-04: GuidancePanel loading state is never activated

`GuidancePanel` accepts an `isLoading` prop with skeleton UI, but
`WorkflowWorkspaceContent` never passes `isLoading=true` during generation.

**Files**: `GuidancePanel.tsx`, `WorkflowWorkspace.tsx`
**Impact**: Wasted existing infrastructure. The sidebar could communicate
loading but doesn't.

### F-05: StepActionBar opacity change is imperceptible

`StepActionBar` applies `opacity-85` during loading — a 15% reduction that is
nearly invisible, especially on light backgrounds.

**File**: `components/workspace/StepActionBar.tsx` line 18
**Impact**: The action bar looks the same whether generating or idle.

### F-06: Button spinner is too small and text doesn't change

The `Spinner` inside buttons is `h-3.5 w-3.5` (14px). The button text remains
the same ("Generate PRD", "Generate Stories"). Users must notice a tiny
spinning icon to know something is happening.

**Files**: All panel components using `<Spinner className="h-3.5 w-3.5" />`
**Impact**: Primary call-to-action gives minimal visual feedback.

### F-07: No time estimation or progress communication

The AI provider timeout is 45 seconds. There is no indication to the user of
how long the call might take. No elapsed timer, no progress bar, no "usually
takes 10–30 seconds" message.

**File**: `provider-client.ts` — `DEFAULT_AI_PROVIDER_TIMEOUT_MS = 45_000`
**Impact**: Users have no mental model for wait duration.

### F-08: No cancel mechanism

There is no `AbortController` on the client-side fetch. No cancel button is
rendered during generation. The user is stuck waiting with no escape.

**Files**: `custom-fetch.ts`, `session-store.tsx`
**Impact**: Users who want to abort must refresh the page.

### F-09: Toast is the only completion signal

When generation succeeds, the only feedback is a toast notification. The
content updates silently in place. If the user isn't watching, they may miss
the transition entirely.

**File**: `WorkflowWorkspace.tsx` — `handleGeneration` success path
**Impact**: Completion is easy to miss, especially on longer waits.

### F-10: No phase auto-advance after generation

After generation succeeds, the phase doesn't automatically advance to the next
step. The user must manually notice the toast and click the next phase tab.

**File**: `WorkflowWorkspace.tsx` — `handleGeneration` only calls
`setActivePhase(phaseMap[step])` which stays on the current phase.
**Impact**: Users don't know what to do next after generation completes.

### F-11: Disabled buttons give no explanation

`isWorkflowGenerating` blocks all generation buttons globally. But there is no
visual explanation of WHY buttons are disabled when another step is running.

**File**: `WorkflowWorkspace.tsx` — `isWorkflowGenerating` check
**Impact**: Users see disabled buttons with no context.

### F-12: ai-loading-slide animation exists but is unused

The CSS defines an `ai-loading-slide` keyframe animation that could serve as a
progress indicator, but it is not referenced anywhere in the workflow
components.

**File**: `index.css` lines 7–17
**Impact**: Existing design asset is wasted.

## Root Cause

The workflow was built with a "request → response" mental model but no
**in-flight UX layer**. The generation state machine has a `running` status,
but no component is designed to render meaningful UI for that status. Every
component only handles idle, succeeded, and failed.

## Requirements

### Must Have

- **R-01**: A visible, prominent running-state indicator in the main content
  area when any generation is in flight.
- **R-02**: Button text must change during generation (e.g., "Generating PRD…"
  instead of "Generate PRD").
- **R-03**: An estimated time or elapsed timer visible during generation.
- **R-04**: PhaseTracker must show which phase is currently generating.
- **R-05**: GenerationStatusNotice must render a running-state message.

### Should Have

- **R-06**: A cancel button that aborts the in-flight request.
- **R-07**: Content area overlay or skeleton that communicates "new content
  incoming."
- **R-08**: Use the existing `ai-loading-slide` animation for the progress
  indicator.
- **R-09**: GuidancePanel should show loading state during generation.
- **R-10**: A completion animation or highlight when new content arrives.

### Nice to Have

- **R-11**: Phase auto-advance after successful generation.
- **R-12**: Disabled button tooltip explaining why it's disabled.
- **R-13**: Optimistic phase tracker update showing the next phase as
  "preparing."

## Proposed Solution

### Layer 1: GenerationRunningNotice (new component)

A prominent inline notice that renders when `generationStep.status === 'running'`:

```
┌─────────────────────────────────────────────────────────┐
│  ⟳  Generating PRD sections…                           │
│     This usually takes 10–30 seconds.          [Cancel] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
└─────────────────────────────────────────────────────────┘
```

- Uses the `ai-loading-slide` animation for the progress bar.
- Shows elapsed time after 10 seconds.
- Includes a cancel button wired to an AbortController.

### Layer 2: Button loading state

- Button text changes: "Generate PRD" → "Generating…"
- Spinner size increases to `h-4 w-4`.
- Button gets a subtle pulse animation while loading.
- Consider adding a `loading` prop to the Button component.

### Layer 3: PhaseTracker generating indicator

- Replace the number badge with an animated spinner for the generating phase.
- Add a subtle pulse or glow to the active phase tab during generation.

### Layer 4: Content area overlay

- Light overlay with reduced opacity on the existing content.
- Skeleton placeholders for the expected output shape.
- Prevents interaction with stale content during generation.

### Layer 5: Completion transition

- Brief highlight animation when new content replaces old.
- Auto-scroll to the new content if it's below the fold.
- Consider auto-advancing to the next logical phase.

### Layer 6: Cancel mechanism

- Add `AbortController` to the `customFetch` call in `runGeneration`.
- Expose a `cancelGeneration` function from the session store.
- Wire the cancel button in GenerationRunningNotice.
- On cancel: set status to `idle`, show a "Generation cancelled" toast.

## File Impact

| File | Change |
|------|--------|
| `components/workspace/GenerationStatusNotice.tsx` | Add running state rendering |
| `components/workspace/StepActionBar.tsx` | Stronger loading visual |
| `components/workspace/PhaseTracker.tsx` | Add generating indicator |
| `components/workspace/GuidancePanel.tsx` | Wire isLoading to generation |
| `components/ui/button.tsx` | Add optional loading prop/variant |
| `pages/WorkflowWorkspace.tsx` | Pass generation state to guidance, wire cancel |
| `store/session-store.tsx` | Add AbortController, cancelGeneration |
| `lib/api-client-react/src/custom-fetch.ts` | Accept AbortSignal |
| `ClarificationPanel.tsx` | Update button text during loading |
| `PRDPanel.tsx` | Update button text during loading |
| `EpicsPanel.tsx` | Update button text during loading |
| `StoriesPanel.tsx` | Update button text during loading |
| `QualityReviewPanel.tsx` | Update button text during loading |

## Relationship to Spec 025

Spec 025 addresses the *architectural* problem: duplicate state sources,
guidance spam, and overlapping loading surfaces. This spec addresses the
*user-facing* problem: what the user sees and feels during the generation
window.

Both specs share root causes but have different outputs:
- 025 simplifies the internal model.
- 026 adds the missing running-state UX layer.

They should be executed together or in sequence (025 first to clean the
foundation, then 026 to add the UX layer on top).

## Success Criteria

- **SC-01**: A user can tell the system is working within 500ms of clicking
  generate.
- **SC-02**: A user can estimate how long to wait without guessing.
- **SC-03**: A user can cancel a generation that is taking too long.
- **SC-04**: The PhaseTracker visually indicates which phase is generating.
- **SC-05**: Content arrival is noticeable without watching the toast area.
- **SC-06**: No user perceives the UI as "stuck" during normal generation
  times (10–30s).
