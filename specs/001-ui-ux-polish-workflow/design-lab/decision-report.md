# Decision Report: UI/UX Polish Workflow

**Feature**: `001-ui-ux-polish-workflow`  
**Date**: 2026-05-05  
**Decision**: Adopt **Precision Ops** for first implementation slice.  

## Inputs Reviewed

1. `baseline.md`
2. `baseline.png`
3. `design-system/MASTER.md`
4. `design-system/pages/dashboard.md`
5. `design-system/checklist.md`
6. `critique-001-current-dashboard.md`
7. `huashu/visual-directions.md`
8. `huashu/dashboard-prototype.html`
9. `huashu/workflow-explainer-deck.md`
10. `huashu/critique-5d.md`
11. `open-design/dashboard-precision-ops.html`
12. `open-design/prototype-comparison.md`

## Selected Direction

**Precision Ops**

Use a calm, precise, premium dev-tool dashboard language:

- White/pale-gray app shell.
- Blue primary action and active navigation accent.
- Teal for sync/export readiness.
- Violet only for future agent handoff concepts.
- Compact KPI cards with semantic accents.
- Dense but readable tables.
- Accessible command/search trigger.
- Stronger app-shell separation.

## Why This Direction Wins

1. Best fit for current Replit-generated app shape.
2. Preserves useful dashboard density.
3. Does not require new runtime dependencies.
4. Directly fixes critique issues: accessibility, command affordance, active nav,
   table semantics, and generic KPI cards.
5. Can be implemented as a bounded frontend-only slice in
   `002-ui-polish-foundation`.

## Rejected / Deferred Directions

### Agent Control Room

Deferred.

Reason:

- Better after real AI workflow, notifications, and agent handoff features exist.
- Current app would risk fake AI dashboard styling.

### Spec Ledger

Deferred.

Reason:

- Better after persistence, review history, and audit trail exist.
- Current app lacks durable records needed to make ledger/audit design honest.

### SaaS Landing / Marketing Prototype

Rejected for this phase.

Reason:

- The work is product UI polish, not public marketing.
- Landing-page patterns would violate the workflow-tool focus.

## Rubric Scores

| Criterion | Score | Rationale |
|---|---:|---|
| Visual quality | 8/10 | Strong enough with shell hierarchy, semantic KPI accents, and table rhythm. |
| Fit for SpecFlow product | 9/10 | Directly supports spec-driven workflow management and review/export loops. |
| Implementation usefulness | 9/10 | Maps to existing `AppShell`, `Sidebar`, `Topbar`, and `Dashboard` files. |
| Export quality | 7/10 | HTML prototypes are useful visual references, not production code. |
| Setup friction | 9/10 | No new dependencies; all artifacts local. |
| License / reuse safety | 8/10 | Outputs are locally synthesized from repo context; avoid copying vendor code into app. |
| Accessibility readiness | 8/10 | Clear first fixes identified; implementation still must verify focus/labels. |

## Top Problems To Fix First

1. Search/command trigger lacks accessible label and clear affordance.
2. Icon-only controls lack accessible names.
3. Sidebar active state is too subtle.
4. Dashboard KPI cards need semantic meaning and stronger scanning.
5. Tables need accessible names/captions and clearer row structure.

## Top Strengths To Preserve

1. Dashboard information density.
2. KPI categories: active sessions, readiness, review queue, exports.
3. Active sessions table columns.
4. Command palette concept.
5. Existing workflow phase model.

## Recommended First Micro-Change

Implement `002-ui-polish-foundation`:

1. App shell semantics: skip link, labeled nav, stable main target.
2. Topbar: accessible command/search trigger and icon-button labels.
3. Sidebar: stronger active state.
4. Dashboard: semantic KPI accents and accessible table naming.
5. Small empty states for dashboard subsections where relevant.

## Do Not Change Yet

- Do not implement full command palette behavior; that belongs to
  `003-product-skeleton-completion`.
- Do not add Projects route in the design slice.
- Do not add persistence/API/database changes.
- Do not add AI workflow.
- Do not add Jira/GitHub integrations.
- Do not redesign product IA.
- Do not copy prototype HTML into production.

## Implementation Feasibility

**Score: 8/10**

Reason:

- Existing app already has correct component boundaries.
- Likely files are limited to layout/dashboard components and CSS.
- Existing lucide/Radix/shadcn-style stack can support the changes.
- Main risk is scope creep, not technical difficulty.

## Decision

Proceed to `002-ui-polish-foundation` with Precision Ops as the approved design
direction.
