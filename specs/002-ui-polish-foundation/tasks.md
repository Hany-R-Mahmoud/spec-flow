# Tasks: UI Polish Foundation

## Preflight

- [x] T001 Read constitution and tracked design-lab artifacts listed in
      `spec.md`.
- [x] T002 Inspect current `AppShell`, `Sidebar`, `Topbar`, `Dashboard`,
      `ReviewsPage`, and `ExportsPage`.
- [x] T003 Note existing user changes from `git status`; do not revert them.
- [x] T004 Confirm final selected design direction is Precision Ops.
- [x] T005 Confirm `.local/design-lab/` is not the execution source of truth.

## App Shell And Accessibility

- [x] T006 Add skip-to-content link.
- [x] T007 Ensure `main` has stable id/target for skip link.
- [x] T008 Add accessible label to sidebar nav.
- [x] T009 Add visible focus treatment if current focus states are weak.

## Topbar

- [x] T010 Add accessible name to search/command control.
- [x] T011 Improve search/command visual affordance without implementing full
      command palette.
- [x] T012 Add accessible names to notification/account icon controls.
- [x] T013 Mark fake notification behavior honestly if still not implemented.

## Sidebar

- [x] T014 Strengthen active nav state with existing color/radius/border tokens.
- [x] T015 Preserve existing nav labels and routes.
- [x] T016 Do not fix `/projects` route in this spec unless a route already
      exists.

## Dashboard

- [x] T017 Refine KPI card hierarchy using existing icons/tokens.
- [x] T018 Apply Precision Ops semantic accents: blue action, green readiness,
      amber review attention, teal export/sync.
- [x] T019 Preserve existing KPI calculations.
- [x] T020 Add table caption or accessible name to Active Sessions table.
- [x] T021 Add empty states for review/export dashboard subsections if empty.
- [x] T022 Preserve current row navigation to workspace.

## Verification And Report

- [x] T023 Run focused typecheck or explain skip.
- [ ] T024 Manually verify keyboard path or explain skip.
- [x] T025 Report changed files, evidence, deferred items, and remaining risks.
- [x] T026 Report which tracked design-lab files were used.

## Execution Notes

- Commit: `249307d refactor(ui): improve accessibility and visual hierarchy`
- Typecheck: `pnpm --filter @workspace/specflow-ai typecheck` passed.
- T024 remains open for a human/browser keyboard pass.
