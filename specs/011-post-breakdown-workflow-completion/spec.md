# Feature Specification: Post-Breakdown Workflow Completion

**Feature Branch**: `011-post-breakdown-workflow-completion`  
**Created**: 2026-05-09  
**Status**: Draft  
**Depends On**: `004-persistence-mvp`, `005-ai-workflow-mvp`, `006-export-integrations`, `010-submit-only-workflow-form-rhf`

## Goal

Make the workflow after `Create Breakdown` fully functional end to end.
No visible control in the post-breakdown flow may be dummy, partial, or
misleading. Every action must either perform a real domain operation, persist
state, navigate to a real destination, or be removed from the UI.

This spec closes the remaining trust gap in the product:
- the workflow must persist real phase state
- guidance actions must do real work
- quality handoffs must update actual story state
- story splitting must create a real result
- Jira connect must be a real integration state, not a placeholder
- export surfaces must return real artifacts, not toast-only feedback

## Current Problems Found

1. **Phase tracker is view-only**: clicking a phase tab changes local UI only.
   The visible phase can drift from persisted workflow state after refresh.
2. **Guidance actions are fake**: `GuidancePanel` renders buttons, but the
   current callers do not provide real callbacks.
3. **Split Story is dead**: the quality review panel exposes a button with no
   handler.
4. **Bulk handoff is partial**: `Send All to Dev Review` advances the phase but
   does not apply a story-level handoff state.
5. **Review completion is too loose**: `Complete Review` can advance to export
   even when review work is still unresolved.
6. **Jira connect is a placeholder**: `Connect Jira -- Coming Soon` is a
   disabled control in the active flow.
7. **Export history download is toast-only**: the exports page implies a
   downloadable artifact, but the current action does not retrieve a real file.
8. **Dead prop path exists**: `onSendToReview` is passed into `StoriesPanel`
   but not used as the workflow command path.

## User Scenarios

1. As a PM, I can move through the workflow and trust that the visible phase
   matches persisted state after refresh.
2. As a PM, I can click guidance actions and get a real outcome, not a fake
   button.
3. As a PM, I can split a story and see the resulting persisted story records.
4. As a PM, I can connect Jira through a real integration flow and export
   stories only when the integration is ready.
5. As the team, we can run the full breakdown flow without any visible dummy
   controls or misleading partial states.

## Requirements

- **FR-001**: Every visible action after `Create Breakdown` MUST either perform
  a real domain operation or be removed from the UI.
- **FR-002**: Phase navigation MUST persist real workflow state and survive
  refresh. View state alone is not enough.
- **FR-003**: Guidance sidebar action items MUST have real callbacks. If no
  real action exists, the UI MUST render them as plain text instead of a fake
  button.
- **FR-004**: `Send All to Dev Review` MUST update story-level handoff state,
  not only switch the session phase.
- **FR-005**: `Complete Review` MUST validate review readiness before exporting
  or clearly block with an actionable explanation.
- **FR-006**: `Split Story` MUST create a real persisted result, such as child
  stories or a split workflow record, and downstream views MUST reflect it.
- **FR-007**: Jira connect MUST be a real connection state flow with
  disconnected, connecting, connected, and failed states. No `Coming Soon`
  label may remain in the active flow.
- **FR-008**: Export entry points MUST perform a real artifact action:
  download, copy, or Jira sync. Toast-only feedback is not enough.
- **FR-009**: Dead props, dead handlers, and unused command paths in the
  workflow surfaces MUST be removed or wired to a real command path.
- **FR-010**: Existing working surfaces such as Clarification, PRD, Epics,
  Stories, Quality Review, and Dev Review MUST remain functional while the
  dummy and partial states are removed.
- **FR-011**: Any derived UI may reflect state, but it MUST NOT become a hidden
  persistence path.
- **FR-012**: No user-facing action may silently no-op.

## Must Finish

- Phase tracker reflects and persists real workflow state.
- Guidance buttons either do real work or disappear.
- `Split Story` performs a real split flow or is removed.
- `Send All to Dev Review` changes actual story handoff state.
- `Complete Review` gates export on real review readiness.
- Jira connect is a real integration state, not a placeholder.
- Export history downloads real artifacts.
- No visible `Coming Soon` or dead CTA remains in the post-breakdown flow.

## May Defer

- Cosmetic redesign of the workflow panels.
- New AI prompt tuning unless it is required to make a real action work.
- Broader analytics instrumentation beyond what is needed to prove the flow.
- Non-workflow pages that are not part of the post-breakdown journey.

## Must Not Touch

- Authentication architecture unless Jira integration needs it.
- Persistence schema redesign unless a real action requires new stored data.
- Unrelated dashboard, settings, or landing page polish.
- Existing working generation logic except where needed to remove partial
  state behavior.

## Failure Conditions

Executor must not report complete if:

- Clicking a phase tab still only changes local view state.
- A guidance item still looks clickable but does nothing.
- `Split Story` remains a no-op button.
- `Send All to Dev Review` advances phase without updating story handoff state.
- `Complete Review` can export unresolved review work without warning or block.
- `Connect Jira` remains disabled or labeled as coming soon.
- Export downloads do not produce a real file or artifact.
- Any visible dummy or partial CTA remains in the active workflow path.

## Key Files

- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/components/workspace/GuidancePanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/PhaseTracker.tsx`
- `artifacts/specflow-ai/src/components/workspace/QualityReviewPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/DeveloperReviewPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/StoriesPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/ExportPanel.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/api-server/src/*` where real integration or persisted state
  changes are required

## Success Criteria

- **SC-001**: Any phase change survives refresh and matches persisted state.
- **SC-002**: Any visible guidance action does real work or is not rendered as
  a button.
- **SC-003**: `Split Story` changes persisted story data.
- **SC-004**: Bulk send to review updates the story queue state, not just the
  selected tab.
- **SC-005**: Dev review cannot complete with unresolved review items without a
  deliberate warning or block.
- **SC-006**: Jira connect is a functional integration state and is no longer a
  placeholder.
- **SC-007**: Export and history download return real artifacts.
- **SC-008**: No dummy or partial UI remains in the active workflow path.
- **SC-009**: Existing good behavior from the intake, clarification, PRD,
  epics, stories, and quality flows still works.

## Evidence Required

Executor must report:

1. The real command path for each post-breakdown control.
2. The files that changed from partial or dummy behavior to real behavior.
3. Browser proof that phase state survives refresh.
4. Browser proof that guidance items no longer no-op.
5. Browser proof that split, review, Jira, and export actions all have real
   outcomes.
6. Any surfaces intentionally removed instead of converted.

## Executor Handoff

```text
Execute spec 011-post-breakdown-workflow-completion. Read spec.md, plan.md,
research.md, quickstart.md, and tasks.md first. Preserve unrelated changes.
Remove every dummy, partial, or misleading control in the post-breakdown
workflow. Make the phase tracker persistent, make guidance actions real, make
Split Story real, make Jira connect real, make export real, and keep the
working intake-to-review flow intact.
```
