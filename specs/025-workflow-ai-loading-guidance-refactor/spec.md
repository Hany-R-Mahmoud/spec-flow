# Feature Specification: Workflow AI Loading And Guidance Refactor

**Feature Branch**: `025-workflow-ai-loading-guidance-refactor`  
**Created**: 2026-05-16  
**Status**: Draft  
**Source**: user request, runtime/code analysis, subagent findings

## Goal

Refactor the workflow AI experience from the source, not by stacking more UI
guards. The workspace should have one clear generation authority, one honest
guidance model, and one loading story per region. The result must stay simple,
maintainable, and safe to extend.

This refactor targets the root causes behind:

- too many AI requests during a single workflow step
- duplicated loading UI in the main panel, sidebar, and action bars
- sidebar guidance behaving like a second workflow lane
- draft edits refiring guidance requests on every keystroke
- top banners and status copy showing the wrong loading semantics

## Findings

1. **Generation state is split between store state and local page state.**
   `WorkflowWorkspace` keeps `pendingGenerationStep`, while
   `SessionProvider` persists `session.generation[phase].status`. Both drive
   the UI. See [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L317) and [session-store.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/store/session-store.tsx#L703).
2. **Guidance is a live AI request path, not passive support.**
   `getWorkflowGuidance()` posts to the API and then to the provider every
   time the effect fires. See [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L601) and [generation.ts](/Users/hanyramadan/spec-flow/artifacts/api-server/src/routes/generation.ts#L833).
3. **Draft edits retrigger guidance.**
   `useWatch()` pushes live draft updates into the workspace effect through
   `onDraftChange`. See [ClarificationPanel.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx#L69) and [PRDPanel.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/components/workspace/PRDPanel.tsx#L59).
4. **Loading UI is repeated in several layers.**
   Button spinners, `StepActionBar` loading chips, panel banners, top banners,
   and sidebar loading all respond to the same in-flight moment. See
   [StepActionBar.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/components/workspace/StepActionBar.tsx#L20),
   [ClarificationPanel.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx#L156),
   [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L715),
   and [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L860).
5. **Top banner is rendered on generation object existence, not on active work.**
   That makes it look like a loading/AI surface even when it should be passive
   metadata. See [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L687).
6. **Guidance has no cache or abort.**
   The frontend effect uses a cancel flag for UI only. The backend guidance
   route always makes a fresh provider call when reached. See
   [WorkflowWorkspace.tsx](/Users/hanyramadan/spec-flow/artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx#L653) and [generation.ts](/Users/hanyramadan/spec-flow/artifacts/api-server/src/routes/generation.ts#L887).

## Root Cause

The current design mixes three concerns in the same surfaces:

- generation orchestration
- guidance computation
- loading presentation

That creates the UI problems and the provider fan-out. The fix is not another
spinner rule. The fix is to redraw the boundaries.

## Product Model

The workspace should have these clear roles:

1. **Generation**: one state source, one in-flight signal, one success/failure
   model per phase.
2. **Guidance**: support text, not a second AI-driven workflow lane by default.
3. **Loading**: one visible indicator per region, not stacked indicators for
   the same event.
4. **Manual mode**: deterministic support only. No fake AI chrome.

## Requirements

- **FR-001**: Workflow generation MUST have a single authoritative in-flight
  state source.
- **FR-002**: Guidance MUST be driven by stable workflow snapshots, not live
  draft keystrokes.
- **FR-003**: Sidebar guidance MUST be passive by default or explicitly
  refreshed, not automatically treated as a second generation surface.
- **FR-004**: One workflow action MUST not produce multiple overlapping AI
  requests unless the user explicitly requests them.
- **FR-005**: Each visible region MUST use at most one primary loading surface
  for the same action.
- **FR-006**: Top banners and status chips MUST reflect actual workflow
  semantics, not just object presence.
- **FR-007**: If guidance is unavailable or manual-mode-only, the UI MUST say
  so plainly.
- **FR-008**: The refactor MUST preserve current working workflow behavior:
  clarification, PRD, epics, stories, quality, dev review, and export.
- **FR-009**: The refactor MUST not add workarounds that conceal the same
  duplicated behavior.

## Target Refactor

### Generation Boundary

- Move the in-flight generation source into one place.
- Derive panel busy state from that source.
- Remove duplicate `pendingGenerationStep` logic unless it remains purely
  presentational.

### Guidance Boundary

- Replace live draft-array dependency with a stable snapshot contract.
- Cache by snapshot hash.
- Abort stale requests.
- Refresh guidance only on meaningful workflow transitions or explicit user
  action.

### Presentation Boundary

- Pick one loading surface per region.
- Keep the button, action bar, banner, and sidebar from all narrating the same
  event.
- Convert the top banner into passive metadata or remove it if it adds no
  value.

## User Scenarios

1. As a PM, I can move from one phase to another without triggering redundant
   AI traffic.
2. As a PM, I can type in clarification or PRD drafts without the sidebar
   calling the provider on every keystroke.
3. As a PM, I see one clear loading indicator per action, not three or four.
4. As a PM in manual mode, I still get honest status and support text.
5. As the team, we can review the flow and understand where generation ends
   and guidance begins.

## MVP Boundary

MVP should include:

- single-source workflow generation state
- stable guidance snapshot contract
- cached or skipped guidance on repeated identical inputs
- simplified loading presentation
- browser retest proof on local host

Defer:

- visual redesign unrelated to the trust gap
- provider marketplace work
- new AI prompt tuning unless required by the refactor

## Must Not Do

- Do not leave both local and store state deciding AI busy state.
- Do not keep guidance tied to draft keystrokes.
- Do not stack loading chip, spinner, banner, and sidebar loading for one
  action.
- Do not add a caching workaround that hides the same request churn without
  fixing the source contract.
- Do not change unrelated workflow behavior while refactoring this boundary.

## Success Criteria

- **SC-001**: One workflow generation click produces one generation request and
  at most one intentional guidance refresh.
- **SC-002**: Draft typing does not spam guidance requests.
- **SC-003**: The same loading event is not represented in multiple redundant
  surfaces.
- **SC-004**: Sidebar guidance behaves like support, not a parallel workflow
  lane.
- **SC-005**: Manual mode remains honest and usable.
- **SC-006**: Browser retest on local host confirms the UI no longer shows the
  old duplicated loading pattern.

## Evidence Required

Executor must report:

1. The source-level state changes that removed the split busy model.
2. The new guidance snapshot or caching contract.
3. The loading surfaces kept, removed, or downgraded.
4. The files changed to move from duplicated behavior to single-source
   behavior.
5. Browser retest notes from the built-in browser on local host.

## Executor Handoff

```text
Execute spec 025-workflow-ai-loading-guidance-refactor. Read spec.md, plan.md,
research.md, review.md, testing.md, and tasks.md first. Refactor the workflow
AI experience from the source. Keep the design simple, remove duplicate loading
and request paths, preserve manual mode honesty, and prove the result in the
built-in browser on local host.
```
