# Feature Specification: Product Skeleton Completion

**Feature Branch**: `002-product-skeleton-completion`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase B from the 2nd phase roadmap  
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

## Executor Handoff

Prompt example:

```text
Execute spec 002-product-skeleton-completion. Read spec.md, plan.md, tasks.md,
and the project constitution first. Preserve unrelated changes. Implement only
this spec. Report changed files, behavior completed, and checks run or skipped.
```
