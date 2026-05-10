# Implementation Plan: SpecFlow AI Public Landing Page

**Branch**: `012-specflow-ai-landing-page` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-specflow-ai-landing-page/spec.md`

## Summary

Build a public homepage for SpecFlow AI that feels like the product's website
front door, not a generic marketing page. The page should use the existing
design system, preserve the app's calm premium tone, and keep the attached
21st.dev hero motion family as inspiration only.

The implementation should stay frontend-only, use existing shadcn-style
components and tokens, and avoid new runtime dependencies unless the current
stack cannot support a required interaction.

## Technical Context

**Language/Version**: TypeScript, React, Vite, pnpm workspace  
**Primary Dependencies**: Existing workspace UI stack, `framer-motion`,
`lucide-react`, shadcn-style components, `wouter`, Clerk auth shell  
**Storage**: N/A for this feature  
**Testing**: Targeted browser validation and optional `typecheck` only if needed
to prove route safety, motion behavior, or accessibility  
**Target Platform**: Web browser, desktop first with mobile support  
**Project Type**: Web application  
**Performance Goals**: Smooth hero motion, no layout jank, no horizontal scroll
on supported viewports  
**Constraints**: Preserve existing auth/app flows, stay within the repo design
system, keep copy product-specific, respect reduced-motion preferences  
**Scale/Scope**: One public landing page plus route wiring and a small set of
landing-specific components

## Constitution Check

*GATE: Must pass before implementation. Re-check after design and route decisions.*

- **Simplicity and Maintainability**: PASS. One landing surface, reused
  components, no new framework.
- **TypeScript and Schema Discipline**: PASS. New code should use TypeScript and
  existing local types where relevant.
- **Accessible Product Quality**: PASS. The spec requires semantic structure,
  keyboard focus, contrast, and reduced-motion support.
- **Security and Trust Boundaries**: PASS. No new secrets, no user data
  handling, no new trust boundary.
- **Surgical Workflow**: PASS. Scope is limited to the public landing page,
  route split, and related copy/motion polish.

## Project Structure

### Documentation (this feature)

```text
specs/012-specflow-ai-landing-page/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
artifacts/specflow-ai/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   └── LoginPage.tsx
│   └── components/
│       ├── landing/
│       │   ├── Hero.tsx
│       │   ├── TrustStrip.tsx
│       │   ├── FeatureGrid.tsx
│       │   ├── HowItWorks.tsx
│       │   ├── FAQ.tsx
│       │   └── FinalCTA.tsx
│       └── ui/
│           └── [existing shadcn components reused]
```

**Structure Decision**: Keep the landing page in the existing workspace app and
build a small landing-specific component set under `src/components/landing/`.
Route splitting belongs in `App.tsx` so the public homepage and authenticated
app do not collide.

## Read First

1. `README.md`
2. `specs/001-ui-ux-polish-workflow/design-lab/design-system/MASTER.md`
3. `specs/001-ui-ux-polish-workflow/design-lab/design-system/checklist.md`
4. `specs/001-ui-ux-polish-workflow/design-lab/decision-report.md`
5. `artifacts/specflow-ai/src/App.tsx`
6. `artifacts/specflow-ai/src/pages/LoginPage.tsx`
7. `artifacts/specflow-ai/src/components/layout/AppShell.tsx`
8. `artifacts/specflow-ai/src/index.css`

## Route And Content Decisions

- Public landing page should be the first page the website presents to a new
  visitor.
- Public route should stay at `/`.
- Authenticated app route namespace should live under `/app` so the marketing
  page and the workflow shell do not collide.
- Authenticated app navigation must remain available and must not be broken by
  the homepage work.
- Hero CTA labels should be product-led, not vague marketing phrases.
- Landing copy should reference the real SpecFlow AI flow, not generic SaaS
  copy.
- Use the existing motion stack to create a soft, premium entrance animation
  and gentle floating shapes.
- Use product-native preview treatment instead of stock-photo dependence when
  possible.

## Agent Routing

| Phase | Owner | Output |
|---|---|---|
| Planning and narrative | `agent-orchestrator` | Route the work, confirm route split, and keep scope tight. |
| Copy and section structure | `agent-design` | Finalize product-led messaging, section order, and proof copy. |
| Visual direction and motion fit | `agent-impeccable` | Translate the 21st.dev motion family into SpecFlow AI tokens and responsive behavior. |
| Implementation | `agent-implementer` | Build the landing page, route wiring, and reusable landing sections. |
| Verification | `agent-tester` | Browser-check desktop/mobile layout, CTA routes, and reduced motion. |
| Final audit | `agent-reviewer` | Check for accessibility issues, dead code, and scope drift. |

## Complexity Tracking

No constitution violations are required for this feature.

The only meaningful design risk is route overlap between the public homepage and
the authenticated app. That is handled in the route decision above rather than
by stacking the landing page into the dashboard shell.

## Validation Checkpoints

1. Verify the public homepage loads without opening the app shell.
2. Verify the primary CTA and secondary CTA point at the intended sign-in or
   app destination.
3. Verify the hero animation still feels like the attached reference, but
   remains subtle and brand-fit.
4. Verify the page renders cleanly on mobile without horizontal scroll.
5. Verify reduced-motion mode disables or flattens decorative motion.
6. Verify existing protected routes still work after the route split.
