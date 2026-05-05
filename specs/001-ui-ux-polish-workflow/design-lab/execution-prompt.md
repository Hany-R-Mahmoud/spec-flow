# Execution Prompt: Spec 002 UI Polish Foundation

Work in `/Users/hanyramadan/spec-flow`.

Goal: execute `specs/002-ui-polish-foundation` using the approved Precision Ops
direction from the design-lab artifacts. Implement only the frontend
app-shell/dashboard accessibility and polish slice. Preserve existing user
changes.

## Read First

1. `.specify/memory/constitution.md`
2. `specs/002-ui-polish-foundation/spec.md`
3. `specs/002-ui-polish-foundation/plan.md`
4. `specs/002-ui-polish-foundation/tasks.md`
5. `.local/design-lab/001-ui-ux-polish-workflow/decision-report.md`
6. `.local/design-lab/001-ui-ux-polish-workflow/design-system/MASTER.md`
7. `.local/design-lab/001-ui-ux-polish-workflow/design-system/pages/dashboard.md`
8. `.local/design-lab/001-ui-ux-polish-workflow/design-system/checklist.md`
9. `.local/design-lab/001-ui-ux-polish-workflow/huashu/visual-directions.md`
10. `.local/design-lab/001-ui-ux-polish-workflow/open-design/prototype-comparison.md`

## Likely Files To Inspect/Edit

- `artifacts/specflow-ai/src/components/layout/AppShell.tsx`
- `artifacts/specflow-ai/src/components/layout/Sidebar.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/ReviewsPage.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/index.css`

## Must Finish

1. Add skip-to-content link and stable main target.
2. Ensure sidebar nav has accessible label.
3. Improve command/search trigger affordance and accessible name.
4. Add accessible names to icon-only controls.
5. Strengthen sidebar active state using existing tokens.
6. Refine dashboard KPI card hierarchy with semantic accents.
7. Add accessible table names/captions where touched.
8. Add dashboard subsection empty states where relevant.

## Must Not Do

1. Do not implement full command palette behavior.
2. Do not add Projects route.
3. Do not edit API server, DB, AI workflow, or export integrations.
4. Do not add runtime dependencies.
5. Do not copy prototype HTML into app source.
6. Do not reformat unrelated files.

## Verification

Prefer:

```bash
pnpm --filter @workspace/specflow-ai typecheck
```

Also manually verify:

1. `/` dashboard renders.
2. Keyboard tab reaches skip link, sidebar, command trigger, topbar buttons, and
   dashboard controls.
3. Screen-reader-relevant controls have labels.
4. Dashboard metrics and session navigation behavior still work.

If checks are skipped, report why.

## Report Back

Report:

1. Files changed.
2. Tasks completed.
3. Checks run or skipped.
4. Any blocked or deferred items.
5. Confirmation no unrelated app/API/DB work was changed.
