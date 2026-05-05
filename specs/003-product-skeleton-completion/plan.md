# Implementation Plan: Product Skeleton Completion

**Branch**: `003-product-skeleton-completion` | **Date**: 2026-05-05 |
**Spec**: [spec.md](./spec.md)

## Summary

Complete the visible app skeleton before backend/AI investment: add Projects,
make command search useful, clean fake controls, and add core states/accessibility
fixes.

## Architecture Decisions

1. Stay frontend-only and in-memory.
2. Use existing `wouter`, `cmdk`, Radix/shadcn-style components, and local store.
3. Add no runtime dependencies.
4. Keep mock data but isolate user-facing skeleton behavior from obvious fakes.

## File Boundaries

Likely changed:

- `artifacts/specflow-ai/src/App.tsx`
- `artifacts/specflow-ai/src/components/layout/AppShell.tsx`
- `artifacts/specflow-ai/src/components/layout/Sidebar.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/specflow-ai/src/pages/ProjectsPage.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/ReviewsPage.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`

Avoid:

- API server changes.
- DB schema changes.
- AI generation changes.
- Export integration changes.

## Implementation Sequence

1. Add Projects page and route.
2. Wire Sidebar Projects link to the route.
3. Add command palette behavior to Topbar.
4. Add accessible app-shell landmarks and skip link.
5. Add accessible labels for icon-only controls.
6. Add empty states for key lists.
7. Clarify disabled/coming-soon controls.

## Validation

Preferred if executor runs checks:

- `pnpm --filter @workspace/specflow-ai typecheck`
- Manual browser pass on `/`, `/projects`, `/new`, `/reviews`, `/exports`,
  `/settings`, and one `/workspace/:id`

If checks are skipped, report why.

## Constitution Check

- Simplicity: PASS, frontend-only skeleton work.
- TypeScript/schema: PASS, no new data contracts.
- Accessibility: REQUIRED, several low-risk fixes included.
- Security: PASS, no auth/integration changes.
- Surgical workflow: PASS, no backend/persistence scope.
