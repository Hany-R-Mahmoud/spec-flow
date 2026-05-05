# Tasks: UI Polish Foundation

## Preflight

- [ ] T001 Read constitution and design-lab artifacts listed in `spec.md`.
- [ ] T002 Inspect current `AppShell`, `Sidebar`, `Topbar`, `Dashboard`,
      `ReviewsPage`, and `ExportsPage`.
- [ ] T003 Note existing user changes from `git status`; do not revert them.

## App Shell And Accessibility

- [ ] T004 Add skip-to-content link.
- [ ] T005 Ensure `main` has stable id/target for skip link.
- [ ] T006 Add accessible label to sidebar nav.
- [ ] T007 Add visible focus treatment if current focus states are weak.

## Topbar

- [ ] T008 Add accessible name to search/command control.
- [ ] T009 Improve search/command visual affordance without implementing full
      command palette.
- [ ] T010 Add accessible names to notification/account icon controls.
- [ ] T011 Mark fake notification behavior honestly if still not implemented.

## Sidebar

- [ ] T012 Strengthen active nav state with existing color/radius/border tokens.
- [ ] T013 Preserve existing nav labels and routes.
- [ ] T014 Do not fix `/projects` route in this spec unless a route already
      exists.

## Dashboard

- [ ] T015 Refine KPI card hierarchy using existing icons/tokens.
- [ ] T016 Preserve existing KPI calculations.
- [ ] T017 Add table caption or accessible name to Active Sessions table.
- [ ] T018 Add empty states for review/export dashboard subsections if empty.
- [ ] T019 Preserve current row navigation to workspace.

## Verification And Report

- [ ] T020 Run focused typecheck or explain skip.
- [ ] T021 Manually verify keyboard path or explain skip.
- [ ] T022 Report changed files, evidence, deferred items, and remaining risks.
