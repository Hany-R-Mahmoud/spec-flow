# Tasks: SpecFlow AI Public Landing Page

**Input**: Design docs from `/specs/012-specflow-ai-landing-page/`  
**Prerequisites**: `spec.md`, `plan.md`  
**Tests**: Use targeted browser checks and focused typecheck only if needed to
prove route safety, motion behavior, or accessibility.

## Phase 1: Narrative And Route Contract

**Purpose**: Lock the product story and make the homepage/app split explicit
before code changes.

- [ ] T001 [P] [US1] `agent-design` finalize the landing-page headline,
      subheadline, trust line, CTA labels, and section copy in
      `specs/012-specflow-ai-landing-page/spec.md`.
- [ ] T002 [P] [US1] `agent-impeccable` translate the attached 21st.dev hero
      motion into a SpecFlow-safe motion brief: floating geometry, staggered
      fades, reduced-motion fallback, and no generic marketing flourishes.
- [ ] T003 [US2] `agent-orchestrator` confirm the route split between the
      public landing page at `/` and the authenticated app shell under `/app`
      so the website and workspace experience do not fight.

**Checkpoint**: Homepage story, motion direction, and route ownership are
clear.

## Phase 2: Landing Shell Implementation

**Purpose**: Build the landing page shell and hero.

- [ ] T004 [US1] `agent-implementer` add `artifacts/specflow-ai/src/pages/LandingPage.tsx`
      and wire the public route in `artifacts/specflow-ai/src/App.tsx`, with
      authenticated app routing preserved under `/app`.
- [ ] T005 [P] [US1] `agent-implementer` create
      `artifacts/specflow-ai/src/components/landing/Hero.tsx` with the animated
      geometric hero, primary CTA, secondary CTA, and product-specific copy.
- [ ] T006 [P] [US1] `agent-implementer` add the trust strip and product proof
      microcopy in `artifacts/specflow-ai/src/components/landing/TrustStrip.tsx`.

**Checkpoint**: The public homepage has a real first fold and can be reached
without the app shell.

## Phase 3: Section Storytelling

**Purpose**: Fill out the rest of the landing page with SpecFlow-native value
sections.

- [ ] T007 [US2] `agent-implementer` add the problem/solution, feature grid,
      and how-it-works sections under `artifacts/specflow-ai/src/components/landing/`.
- [ ] T008 [P] [US2] `agent-implementer` add the benefit section, testimonial
      placeholders, FAQ, and final CTA in the same landing component set.
- [ ] T009 [US2] `agent-design` review the generated copy for product accuracy
      so the page clearly reflects breakdowns, stories, review, and export.

**Checkpoint**: The page tells a complete product story and not just a hero
section.

## Phase 4: Motion, Responsiveness, And Accessibility

**Purpose**: Make the page feel premium without breaking usability.

- [ ] T010 [US3] `agent-implementer` tune animation timing, floating-shape
      behavior, and `prefers-reduced-motion` handling using the existing motion
      stack.
- [ ] T011 [P] [US3] `agent-implementer` apply responsive spacing, typography,
      and section stacking so the page works on phone, tablet, and desktop.
- [ ] T012 [US3] `agent-impeccable` review the landing page against the repo
      design system and tighten any visual drift from the approved palette,
      radius, and hierarchy.

**Checkpoint**: The landing page is responsive, calm, and visually on brand.

## Phase 5: Verification And Audit

**Purpose**: Prove the public homepage is shippable.

- [ ] T013 [US3] `agent-tester` run a browser pass for desktop and mobile
      layout, CTA click paths, keyboard focus, and reduced-motion behavior.
- [ ] T014 [P] [US3] `agent-reviewer` audit the implementation for accessibility
      regressions, route collisions, dead code, and copy that drifts from the
      product.
- [ ] T015 [US3] `agent-implementer` address any review findings without
      broadening the scope.

**Checkpoint**: Homepage is verified and ready for review.

## Dependencies & Execution Order

- Phase 1 must finish before implementation starts.
- Phase 2 can start once the route contract is settled.
- Phase 3 depends on the landing shell existing.
- Phase 4 depends on the page components being in place.
- Phase 5 depends on the landing page being renderable in the browser.

## Parallel Opportunities

- T001 and T002 can run in parallel.
- T005 and T006 can run in parallel after the landing route exists.
- T007 and T008 can run in parallel once the hero and shell are in place.
- T011 and T012 can overlap with T010 if they do not touch the same file
  blocks.
- T013 and T014 can run in parallel for final proof.

## Implementation Strategy

### MVP First

1. Finish Phase 1.
2. Finish Phase 2.
3. Validate the hero and CTA path.
4. Stop if the public homepage is already strong enough for review.

### Incremental Delivery

1. Add route and hero.
2. Add supporting sections.
3. Tighten motion and responsive behavior.
4. Validate on browser and audit for accessibility.

## Notes

- [P] tasks can run in parallel when they touch different files.
- Keep copy product-specific. Do not fall back to generic startup marketing
  language.
- Avoid stock-image dependence unless the route strategy later requires it.
- Preserve unrelated changes in the workspace.
