# Tasks: UI Polish Foundation

## Preflight

- [ ] T001 Read constitution and tracked design-lab artifacts listed in
      `spec.md`.
- [ ] T002 Inspect current `AppShell`, `Sidebar`, `Topbar`, `Dashboard`,
      `ReviewsPage`, and `ExportsPage`.
- [ ] T003 Note existing user changes from `git status`; do not revert them.
- [ ] T004 Confirm final selected design direction is Precision Ops.
- [ ] T005 Confirm `.local/design-lab/` is not the execution source of truth.

## App Shell And Accessibility

- [ ] T006 Add skip-to-content link.
- [ ] T007 Ensure `main` has stable id/target for skip link.
- [ ] T008 Add accessible label to sidebar nav.
- [ ] T009 Add visible focus treatment if current focus states are weak.

## Topbar

- [ ] T010 Add accessible name to search/command control.
- [ ] T011 Improve search/command visual affordance without implementing full
      command palette.
- [ ] T012 Add accessible names to notification/account icon controls.
- [ ] T013 Mark fake notification behavior honestly if still not implemented.

## Sidebar

- [ ] T014 Strengthen active nav state with existing color/radius/border tokens.
- [ ] T015 Preserve existing nav labels and routes.
- [ ] T016 Do not fix `/projects` route in this spec unless a route already
      exists.

## Dashboard

- [ ] T017 Refine KPI card hierarchy using existing icons/tokens.
- [ ] T018 Apply Precision Ops semantic accents: blue action, green readiness,
      amber review attention, teal export/sync.
- [ ] T019 Preserve existing KPI calculations.
- [ ] T020 Add table caption or accessible name to Active Sessions table.
- [ ] T021 Add empty states for review/export dashboard subsections if empty.
- [ ] T022 Preserve current row navigation to workspace.

## Verification And Report

- [ ] T023 Run focused typecheck or explain skip.
- [ ] T024 Manually verify keyboard path or explain skip.
- [ ] T025 Report changed files, evidence, deferred items, and remaining risks.
- [ ] T026 Report which tracked design-lab files were used.
