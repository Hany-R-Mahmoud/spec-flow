# Implementation Plan: UI Polish Foundation

## Architecture Route

Frontend-only UI polish. No API/server/database work. Use existing React,
wouter, lucide, Radix/shadcn-style components, CSS variables, and local state.

## Implementation Slices

1. **App shell semantics**
   - Add skip link.
   - Ensure `main` has stable target/id.
   - Ensure sidebar `nav` is labeled.

2. **Topbar affordances**
   - Give search/command input or trigger clear accessible name.
   - Give icon-only notification/account buttons accessible names.
   - Improve border/container separation of command/search.

3. **Sidebar hierarchy**
   - Strengthen active state using existing tokens.
   - Keep navigation labels and route behavior unchanged.
   - Do not implement Projects here unless it already exists.

4. **Dashboard readability**
   - Refine KPI card hierarchy and semantic accents.
   - Preserve current data and calculations.
   - Add accessible table naming/captions where practical.
   - Add small empty-state copy for dashboard subsections when arrays are empty.

5. **Review/export table accessibility**
   - Add table accessible names/captions if tables are touched.
   - Do not change export behavior.

## Risks

- Over-polishing could drift into redesign. Keep changes close to design-system
  artifacts and current layout.
- Adding command behavior belongs to spec 003, not this spec.
- Accessibility fixes may reveal component-level gaps; make local fixes first.

## Validation

Preferred:

- `pnpm --filter @workspace/specflow-ai typecheck`
- Browser/manual check of `/`, `/reviews`, `/exports`, `/settings`
- Keyboard tab pass through sidebar/topbar/dashboard

Acceptable if not running commands:

- Report checks skipped and why.
- Provide file-level reasoning for each accessibility fix.

## Done Means

Done means the shell/dashboard polish is implemented and evidence is reported.
It does not mean Phase 2 is complete.
