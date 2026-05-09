# Research: Post-Breakdown Workflow Completion

## Question

How do we make the workflow after `Create Breakdown` fully functional, with no
dummy, partial, or misleading controls left in the active path?

## Decision

Use the existing workflow surfaces as the source of truth and convert every
visible post-breakdown control into one of three states:

1. real command
2. honest disabled state with reason
3. removed from the UI

If a control cannot do real work yet, it should not pretend to be interactive.

## Repo Findings

The current codebase already proves the problem is not limited to one file.
The confirmed gaps are spread across the workflow:

- `PhaseTracker` changes local view state only.
- `GuidancePanel` renders action buttons, but the caller does not provide
  callbacks.
- `QualityReviewPanel` exposes a `Split Story` control without a handler.
- `Send All to Dev Review` only advances the phase.
- `Complete Review` does not gate unresolved review work.
- `ExportPanel` still has a `Coming Soon` Jira button.
- `ExportsPage` uses a toast-only download path.
- `StoriesPanel` still carries a dead `onSendToReview` prop path.

That means the fix must be a workflow contract, not a single button patch.

## Product Rule

The user-facing contract should be simple:

```text
visible control -> real outcome, honest disabled state, or no control
```

This is the only rule that keeps the flow trustworthy.

## Implementation Guidance

- Use the current session/store as the persistence boundary.
- Keep phase changes tied to persisted workflow state.
- Use explicit command handlers for guidance items instead of inferred clicks.
- Make bulk review actions update the underlying stories, not just the tab.
- Treat Jira connect as a real integration state machine, not a decoration.
- Treat export history as a real artifact source, not a toast source.

## Alternatives Considered

### Alternative A: Keep placeholders until backend work lands

Rejected. The product remains misleading and the user still sees fake
functionality.

### Alternative B: Hide all unfinished controls without adding real actions

Rejected for this spec. The user asked for full functionality, not a smaller
surface area.

### Alternative C: Leave phase tracker local-only

Rejected. That creates state drift and makes the workflow feel real when it is
not.

## Sources

Local code review findings:

- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/components/workspace/GuidancePanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/PhaseTracker.tsx`
- `artifacts/specflow-ai/src/components/workspace/QualityReviewPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/DeveloperReviewPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/ExportPanel.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
