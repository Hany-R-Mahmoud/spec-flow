# Feature Specification: Product Skeleton Completion

**Feature Branch**: `003-product-skeleton-completion`  
**Created**: 2026-05-05  
**Status**: Executed  
**Phase**: Phase B from the 2nd phase roadmap  
**Depends On**: `002-ui-polish-foundation`
**Input**: Complete the visible product skeleton by fixing missing routes, fake
affordances, and foundational states before deeper persistence or AI work.

## User Scenarios & Testing

### User Story 1 - Navigate All Primary App Sections (Priority: P1)

As a workspace user, I want every sidebar link to lead to a useful page so the
app feels coherent and evaluable.

**Acceptance Scenarios**:

1. Given I click `Projects`, when the route opens, then I see a projects list
   or empty state instead of NotFound.
2. Given a project/session exists, when I open it from Projects, then I can
   reach its workflow workspace.

### User Story 2 - Use Command Search (Priority: P1)

As a keyboard-driven user, I want command/search to open useful navigation and
workflow commands instead of being visual-only.

**Acceptance Scenarios**:

1. Given I press the command shortcut or activate search, when the palette
   opens, then I can navigate to Dashboard, New Breakdown, Projects, Reviews,
   Exports, and Settings.
2. Given sessions exist, when I search by session name or Jira key, then I can
   open the matching workspace.

### User Story 3 - Trust Prototype States (Priority: P2)

As a reviewer, I want fake or inactive controls to be clearly implemented,
removed, or marked as coming soon so I can distinguish real behavior from
placeholder behavior.

**Acceptance Scenarios**:

1. Given a control is not implemented, when I see it, then it is disabled or
   visibly marked coming soon.
2. Given a list has no items, when the list renders, then it shows a useful empty
   state with a next action.

## Requirements

- **FR-001**: Add a real `/projects` route and page.
- **FR-002**: Projects page MUST summarize existing sessions grouped as project
  cards or rows using current in-memory state.
- **FR-003**: Add command palette/search behavior using existing dependencies
  where available.
- **FR-004**: Command palette MUST include nav commands and session open
  commands.
- **FR-005**: Replace or clarify fake affordances in topbar, notifications,
  account, exports history, and coming-soon controls.
- **FR-006**: Add empty/loading/error states for Projects, Dashboard lists,
  Reviews, Exports, and Workspace missing session.
- **FR-007**: Apply low-risk accessibility fixes that do not depend on visual
  redesign: labels, nav labels, table accessible names, skip link, icon-button
  labels.
- **FR-008**: Do not add backend persistence in this spec.
- **FR-009**: Do not add external integrations in this spec.

## Must Finish

- `/projects` route must exist and must not render NotFound.
- Projects page must be useful with current in-memory sessions.
- Command palette must provide actual navigation/session-open behavior.
- Fake topbar/export/account/notification affordances must be implemented,
  disabled, or clearly marked coming soon.
- Empty states must exist for the key list/filter surfaces named in the plan.
- Low-risk accessibility fixes must remain intact from spec 002.

## May Defer

- Backend persistence.
- Database schema.
- AI generation.
- Real notification backend.
- Jira/GitHub export.

## Must Not Touch

- API server and DB packages, unless only importing existing client types.
- AI generation stubs beyond removing misleading UI references.
- Visual redesign beyond small skeleton/state changes.

## Failure Conditions

Executor must not report complete if:

- `/projects` still shows NotFound.
- Command palette/search remains visual-only.
- Any primary sidebar item is broken.
- Placeholder controls remain clickable with fake success behavior and no
  honest coming-soon/disabled treatment.
- Empty states are missing from any touched list surface.

## Key Files

- `artifacts/specflow-ai/src/App.tsx`
- `artifacts/specflow-ai/src/components/layout/AppShell.tsx`
- `artifacts/specflow-ai/src/components/layout/Sidebar.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/pages/ReviewsPage.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`

## Success Criteria

- **SC-001**: No sidebar link routes to NotFound.
- **SC-002**: Command palette can navigate to all primary pages and open
  sessions.
- **SC-003**: Placeholder controls are visibly honest.
- **SC-004**: Core lists have useful empty states.
- **SC-005**: Baseline accessibility failures from the critique are addressed or
  explicitly deferred with reason.

## Evidence Required

Executor must report:

1. Route list verified.
2. Command palette actions verified.
3. Placeholder controls changed or justified.
4. Empty-state surfaces verified.
5. Files changed.
6. Checks run or skipped with reason.

## Execution Outcome

Executed locally in the workspace on 2026-05-05.

Summary:

- Added a real `/projects` route and `ProjectsPage` backed by current in-memory
  session, epic, and story data.
- Implemented a working command palette in the topbar for primary navigation
  and session-open actions using existing `cmdk` UI.
- Preserved and extended honest placeholder behavior in topbar controls.
- Added stronger empty and missing-session states for Projects, Reviews,
  Exports, and Workspace missing-session flow.
- Kept the work frontend-only and in-memory as required by this spec.

Verification:

- `pnpm --filter @workspace/specflow-ai typecheck` passed.
- Human browser pass was not run in this execution step.

## Executor Handoff

Prompt example:

```text
Execute spec 003-product-skeleton-completion. Read spec.md, plan.md, tasks.md,
and the project constitution first. Preserve unrelated changes. Implement only
this spec. Report changed files, behavior completed, and checks run or skipped.
```
