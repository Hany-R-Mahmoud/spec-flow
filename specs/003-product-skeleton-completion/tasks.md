# Tasks: Product Skeleton Completion

## Read First

- `.specify/memory/constitution.md`
- `specs/003-product-skeleton-completion/spec.md`
- `specs/003-product-skeleton-completion/plan.md`
- `specs/001-ui-ux-polish-workflow/2nd-phase-roadmap.md`

## Tasks

- [x] T001 Inspect current routes in `App.tsx` and layout components.
- [x] T002 Create `ProjectsPage.tsx` using current session data.
- [x] T003 Add `/projects` route.
- [x] T004 Ensure each project/session card opens `/workspace/:id`.
- [x] T005 Implement command palette/search in `Topbar.tsx`.
- [x] T006 Add nav commands for all primary routes.
- [x] T007 Add session commands filtered by name/Jira key.
- [x] T008 Add `aria-label` to search/command trigger.
- [x] T009 Add `aria-label` to icon-only notification/account controls.
- [x] T010 Add labeled `nav` landmark and skip-to-content link.
- [x] T011 Add table captions or accessible names where tables render.
- [x] T012 Add empty states for Dashboard review/export sections.
- [x] T013 Add empty state for Projects.
- [x] T014 Add empty state for Reviews filters.
- [x] T015 Add empty state for Exports filters.
- [x] T016 Mark unimplemented controls as disabled/coming soon or implement
      them.
- [x] T017 Run or skip typecheck with reason.
- [x] T018 Report changed files and remaining deferred items.

## Execution Notes

- Status: Executed locally on 2026-05-05.
- Typecheck: `pnpm --filter @workspace/specflow-ai typecheck` passed.
- Preserved skip link, nav landmark, and table accessibility work from spec
  `002-ui-polish-foundation` while extending route and command behavior.
