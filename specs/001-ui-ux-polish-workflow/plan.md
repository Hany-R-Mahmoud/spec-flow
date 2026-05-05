# Implementation Plan: UI/UX Polish Workflow

**Branch**: `001-ui-ux-polish-workflow` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-ux-polish-workflow/spec.md`

## Summary

Polish the current Replit-generated SpecFlow AI SaaS workflow UI through a
local, spec-driven design-lab process before app code changes. Codex owns the
Spec Kit documents and implementation handoff prompts. OpenCode or another
execution agent receives one scoped prompt per approved spec and implements only
that spec after reading the relevant artifacts.

The workflow uses three local design sources in sequence:

1. UI UX Pro Max for a practical design-system direction.
2. Huashu Design for visual exploration and critique artifacts.
3. Open Design for sandboxed studio prototypes and export comparison.

No application source code changes occur during design discovery. All local
design outputs stay under ignored `.local/design-lab/` folders unless the user
explicitly asks to commit them.

## Technical Context

**Language/Version**: TypeScript, Vite, pnpm workspace  
**Primary Dependencies**: Existing workspace packages only during planning; no
new runtime dependency allowed without implementation-plan justification  
**Storage**: Local filesystem artifacts under `.local/` and Spec Kit docs under
`specs/`  
**Testing**: Not run by default; visual/artifact review is primary validation for
this design phase  
**Target Platform**: Desktop web SaaS dashboard first, with responsive/accessibility
constraints documented for later implementation  
**Project Type**: pnpm workspace web application  
**Performance Goals**: Keep UI polish implementable with existing app structure;
avoid heavy design-driven runtime cost  
**Constraints**: Preserve user changes, avoid global skill installs, avoid
unrelated app refactors, and keep OpenCode handoffs scoped to one spec  
**Scale/Scope**: Dashboard, workflow surfaces, handoff prompts, GitHub/local sync
visibility, Spec Kit lifecycle visibility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicity and Maintainability**: PASS. Design work is artifact-first and
  avoids app rewrites until a bounded implementation direction is approved.
- **TypeScript and Schema Discipline**: PASS. No app code changes in this phase;
  future implementation prompts must reuse existing schema contracts.
- **Accessible Product Quality**: PASS. Accessibility rules and contrast/focus
  checks are explicit design-system and critique outputs.
- **Security and Trust Boundaries**: PASS. No secrets or auth changes expected;
  future implementation prompts must flag any generated-content or sync-boundary
  risks.
- **Surgical Workflow**: PASS. Local design outputs are isolated under `.local/`;
  OpenCode receives one scoped prompt per spec and must preserve unrelated user
  changes.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-ux-polish-workflow/
├── spec.md
└── plan.md
```

### Local Design-Lab Artifacts

```text
.local/
├── vendor/
│   ├── ui-ux-pro-max-skill/
│   ├── huashu-design/
│   └── open-design/
├── skills/
│   ├── ui-ux-pro-max/
│   ├── huashu-design/
│   └── open-design-*/
└── design-lab/
    └── 001-ui-ux-polish-workflow/
        ├── baseline.md
        ├── baseline.png
        ├── design-system/
        │   ├── MASTER.md
        │   ├── pages/
        │   │   └── dashboard.md
        │   └── checklist.md
        ├── huashu/
        ├── open-design/
        ├── decision-report.md
        └── execution-prompt.md
```

### Source Code (repository root)

```text
artifacts/specflow-ai/
├── package.json
├── tsconfig.json
└── vite.config.ts

lib/
├── api-client-react/
├── api-spec/
├── api-zod/
└── db/
```

**Structure Decision**: Design workflow files live in `specs/` and `.local/`.
Application source stays untouched until the approved execution prompt is handed
to OpenCode for the implementation step.

## Workflow Roadmap

### Round 0 - Baseline

Status: complete.

Artifacts:

- `.local/design-lab/001-ui-ux-polish-workflow/baseline.md`
- `.local/design-lab/001-ui-ux-polish-workflow/baseline.png`

Purpose:

- Capture current Replit-generated dashboard state.
- Identify initial UI/UX strengths, weaknesses, and candidate polish targets.
- Confirm no app source code changes.

### Round 1 - Design System

Primary tool: `.local/skills/ui-ux-pro-max/SKILL.md`

Prompt intent:

```text
Generate a design system for SpecFlow AI: a SaaS workspace for spec-driven AI
development, GitHub sync, Spec Kit workflows, and AI agent orchestration. Target
feel: clear, precise, premium dev-tool, not marketing-heavy. Produce colors,
typography, spacing, components, dashboard patterns, accessibility rules, and
anti-patterns.
```

Required outputs:

- `.local/design-lab/001-ui-ux-polish-workflow/design-system/MASTER.md`
- `.local/design-lab/001-ui-ux-polish-workflow/design-system/pages/dashboard.md`
- `.local/design-lab/001-ui-ux-polish-workflow/design-system/checklist.md`

Exit criteria:

- Product personality is clear.
- Tokens and component rules are concrete enough for another agent.
- Anti-patterns prevent generic marketing UI and overdecorated dashboard work.

### Round 2 - Artifact Exploration

Primary tool: `.local/skills/huashu-design/SKILL.md`

Prompt intent:

```text
Create 3 differentiated visual directions for SpecFlow AI, then build one
clickable desktop dashboard prototype and run a 5-dimension expert critique.
Keep outputs local under .local/design-lab/001-ui-ux-polish-workflow/huashu/.
```

Required outputs:

- Three differentiated visual directions.
- One desktop dashboard prototype HTML.
- One onboarding/workflow explainer deck.
- One 5-dimension critique of the current UI direction.

Exit criteria:

- Directions are visually distinct.
- Recommended direction is named with rationale.
- Prototype focuses on workflow utility, not a landing page.

### Round 3 - Open Design Studio Sandbox

Primary tool/source: `.local/vendor/open-design` and selected
`.local/skills/open-design-*` skills.

Allowed focus areas:

- dashboard
- saas-landing
- mobile-app
- critique

Required outputs:

- 2-3 design-system/prototype attempts exported under
  `.local/design-lab/001-ui-ux-polish-workflow/open-design/`
- Exported HTML/ZIP/PDF where available.
- Notes on setup friction and export quality.

Exit criteria:

- Open Design outputs are compared against Huashu and UI UX Pro Max artifacts.
- Any reusable patterns are extracted without blending conflicting visual styles.

### Decision Pass

Create:

- `.local/design-lab/001-ui-ux-polish-workflow/decision-report.md`

Rubric:

- Visual quality
- Fit for SpecFlow product
- Implementation usefulness
- Export quality
- Setup friction
- License / reuse safety

Decision output must include:

- Selected UI direction.
- Rationale and rejected alternatives.
- First bounded app polish scope.
- Explicit accessibility risks to fix.
- Explicit "do not change yet" list.

### Execution Prompt

Create:

- `.local/design-lab/001-ui-ux-polish-workflow/execution-prompt.md`

Prompt must instruct OpenCode to:

- Read `specs/001-ui-ux-polish-workflow/spec.md`.
- Read this `plan.md`.
- Read `.specify/memory/constitution.md`.
- Read selected design-lab artifacts.
- Inspect existing app files before editing.
- Preserve unrelated user changes.
- Implement only the approved bounded UI/UX scope.
- Avoid new runtime dependencies unless justified.
- Report changed files and verification performed.

## Current Concurrency Note

OpenCode may currently be working from the prior handoff prompt against
`.local/design-lab/001-ui-ux-polish-workflow/critique-001-current-dashboard.md`.
Codex must not edit that file or app source while that work is in flight. If
both agents produce design-lab artifacts, keep them as separate inputs for the
decision pass instead of overwriting either output.

## Complexity Tracking

No constitution violations currently planned.
