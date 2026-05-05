# Tasks: UI/UX Polish Workflow

**Spec**: `001-ui-ux-polish-workflow`  
**Phase**: Phase A - UI Polish Foundation  
**Executor goal**: finish design-lab decision work, then produce a scoped
implementation prompt for app-shell/dashboard/accessibility polish.

## Executor Handoff

Read first:

1. `.specify/memory/constitution.md`
2. `specs/001-ui-ux-polish-workflow/spec.md`
3. `specs/001-ui-ux-polish-workflow/plan.md`
4. `.local/design-lab/001-ui-ux-polish-workflow/baseline.md`
5. `.local/design-lab/001-ui-ux-polish-workflow/design-system/MASTER.md`
6. `.local/design-lab/001-ui-ux-polish-workflow/design-system/pages/dashboard.md`
7. `.local/design-lab/001-ui-ux-polish-workflow/design-system/checklist.md`
8. `.local/design-lab/001-ui-ux-polish-workflow/critique-001-current-dashboard.md`

Do not edit app source until a decision report and implementation prompt exist.
Do not overwrite local design artifacts from another agent.

## Tasks

- [ ] T001 Review OpenCode critique and add missing implementation feasibility
      score to a new decision artifact, not by overwriting the critique file.
- [ ] T002 Run or synthesize remaining Huashu exploration outputs under
      `.local/design-lab/001-ui-ux-polish-workflow/huashu/`.
- [ ] T003 Run or synthesize Open Design sandbox outputs under
      `.local/design-lab/001-ui-ux-polish-workflow/open-design/`.
- [ ] T004 Create `.local/design-lab/001-ui-ux-polish-workflow/decision-report.md`
      with selected direction, rationale, rejected directions, accessibility
      risks, and do-not-change-yet list.
- [ ] T005 Create `.local/design-lab/001-ui-ux-polish-workflow/execution-prompt.md`
      for app-shell/dashboard polish.
- [ ] T006 Ensure execution prompt names likely files:
      `artifacts/specflow-ai/src/components/layout/AppShell.tsx`,
      `Sidebar.tsx`, `Topbar.tsx`, `pages/Dashboard.tsx`, and relevant shared
      UI components.
- [ ] T007 Confirm no source code changes occurred during design-lab tasks.

## Validation

- [ ] Decision report can be understood within 5 minutes.
- [ ] Execution prompt can be handed to OpenCode without extra chat context.
- [ ] No app source files changed before implementation approval.
