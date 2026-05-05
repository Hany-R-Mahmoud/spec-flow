# Feature Specification: UI Polish Foundation Implementation

**Feature Branch**: `002-ui-polish-foundation`  
**Created**: 2026-05-05  
**Status**: Executed  
**Phase**: Phase A of the 2nd phase roadmap  
**Depends On**: `001-ui-ux-polish-workflow` design-lab artifacts
**Approved Direction**: Precision Ops

## Purpose

Apply the approved low-risk UI/UX foundation polish from the design-lab work to
the current Replit-generated SpecFlow AI app. This spec turns the old
design-lab roadmap into the first executable Phase 2 implementation slice.

The executor must not invent a new visual direction. It must read the existing
tracked design-lab artifacts, use **Precision Ops** as the source of truth,
implement only the foundation slice, and report exactly what was changed and
verified.

## Source Of Truth

The canonical design artifacts are the tracked files under:

```text
specs/001-ui-ux-polish-workflow/design-lab/
```

Do not rely on `.local/design-lab/` for execution. `.local/` is scratch space and
may be ignored by git.

Final decision:

- Direction: **Precision Ops**
- First implementation target: this spec, `002-ui-polish-foundation`
- Primary rationale: high fit for current app shape, low implementation risk,
  strong accessibility/hierarchy payoff, no new dependency required

## User Scenarios

### User Story 1 - Trust The App Shell (Priority: P1)

As a user, I want the header, sidebar, command trigger, and main content shell
to feel coherent and accessible so the product looks like a serious dev-tool
workspace.

**Acceptance Scenarios**:

1. Given I load the dashboard, when I scan the shell, then product identity,
   workspace context, navigation, and primary action are visually distinct.
2. Given I use keyboard navigation, when focus moves through shell controls,
   then focus is visible and tab order is logical.
3. Given I use a screen reader, when I encounter nav/search/icon controls, then
   each control has a useful accessible name.

### User Story 2 - Read Dashboard State Quickly (Priority: P1)

As a PM/operator, I want dashboard KPI cards and active sessions to communicate
workflow state clearly so I know where to act next.

**Acceptance Scenarios**:

1. Given the dashboard renders sessions and stories, when I view KPI cards, then
   the value, meaning, and status context are clear.
2. Given active sessions render, when I inspect the table, then phase, progress,
   readiness, status, and updated time remain easy to scan.
3. Given there are no review/export items, when the dashboard renders, then a
   helpful empty state appears instead of blank space.

### User Story 3 - Preserve Prototype Utility (Priority: P2)

As the product owner, I want polish without product drift so the app remains the
same workflow tool while becoming clearer and more credible.

**Acceptance Scenarios**:

1. Given implementation is complete, when I compare the app to the baseline,
   then workflow structure remains recognizable.
2. Given a design suggestion would require new dependencies or backend work,
   when the executor evaluates it, then it is deferred with a note.

## Must Finish

- Follow the Precision Ops direction from
  `specs/001-ui-ux-polish-workflow/design-lab/decision-report.md`.
- Improve app shell separation and hierarchy.
- Improve sidebar active state and accessibility.
- Improve command/search trigger affordance and label.
- Add accessible names to icon-only controls.
- Add skip-to-content and labeled landmarks.
- Add table captions/accessibility names where dashboard/review/export tables
  are touched.
- Refine KPI card visual hierarchy using existing dependencies and CSS.
- Preserve existing routes and in-memory data behavior.

## May Defer

- Full command palette behavior; handled in spec `003-product-skeleton-completion`.
- Projects route; handled in spec `003-product-skeleton-completion`.
- Persistence/API/backend work.
- AI generation.
- Jira/GitHub integrations.

## Must Not Touch

- API server routes.
- DB schema.
- AI workflow generation.
- Export integration logic.
- Unrelated formatting or refactors.

## Read First

1. `.specify/memory/constitution.md`
2. `specs/001-ui-ux-polish-workflow/spec.md`
3. `specs/001-ui-ux-polish-workflow/plan.md`
4. `specs/001-ui-ux-polish-workflow/design-lab/decision-report.md`
5. `specs/001-ui-ux-polish-workflow/design-lab/design-system/MASTER.md`
6. `specs/001-ui-ux-polish-workflow/design-lab/design-system/pages/dashboard.md`
7. `specs/001-ui-ux-polish-workflow/design-lab/design-system/checklist.md`
8. `specs/001-ui-ux-polish-workflow/design-lab/critique-001-current-dashboard.md`
9. `specs/001-ui-ux-polish-workflow/design-lab/huashu/visual-directions.md`
10. `specs/001-ui-ux-polish-workflow/design-lab/huashu/critique-5d.md`
11. `specs/001-ui-ux-polish-workflow/design-lab/open-design/prototype-comparison.md`
12. `specs/001-ui-ux-polish-workflow/design-lab/execution-prompt.md`

## Likely Files

- `artifacts/specflow-ai/src/components/layout/AppShell.tsx`
- `artifacts/specflow-ai/src/components/layout/Sidebar.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/ReviewsPage.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/index.css`
- existing shared UI components only if required

## Success Criteria

- **SC-001**: Search/command trigger has visible or programmatic label.
- **SC-002**: Notification/account icon controls have accessible names.
- **SC-003**: Sidebar uses a labeled nav landmark and clearer active state.
- **SC-004**: App shell has a skip-to-content path.
- **SC-005**: Dashboard table and cards are more scannable without changing
  product behavior.
- **SC-006**: No new runtime dependency is added.
- **SC-007**: Executor reports before/after evidence or exact manual checks.
- **SC-008**: Executor report explicitly says how the implementation follows
  Precision Ops and which design-lab recommendations were deferred.

## Evidence Required

Executor must report:

1. Files changed.
2. Accessibility fixes completed.
3. Visual hierarchy changes completed.
4. Checks run or explicitly skipped.
5. Any design-lab recommendation intentionally deferred.

## Execution Outcome

Executed in commit:

```text
249307d refactor(ui): improve accessibility and visual hierarchy
```

Summary:

- Implemented Precision Ops foundation polish for app shell, topbar, sidebar,
  dashboard cards, and accessible tables.
- Preserved existing routes and in-memory data behavior.
- Deferred full command palette behavior, Projects route, persistence, AI
  workflow, and integrations to later specs.

Verification:

- `pnpm --filter @workspace/specflow-ai typecheck` passed.

## Executor Handoff

```text
Execute spec 002-ui-polish-foundation and report the outcome. Read spec.md,
plan.md, tasks.md, the constitution, and the tracked design-lab artifacts under
specs/001-ui-ux-polish-workflow/design-lab first. Preserve unrelated changes.
Implement only the Precision Ops foundation UI/accessibility slice. Report
changed files, evidence, skipped checks, and deferred recommendations.
```
