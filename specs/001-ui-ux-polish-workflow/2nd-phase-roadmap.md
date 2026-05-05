# 2nd Phase Roadmap

**Feature**: `001-ui-ux-polish-workflow`  
**Created**: 2026-05-05  
**Purpose**: quick product review roadmap for deciding next phases after the
current UI/UX polish workflow.

## Current Project State Summary

1. Main app lives in `artifacts/specflow-ai/`.
2. API scaffold lives in `artifacts/api-server/`.
3. Mockup sandbox lives in `artifacts/mockup-sandbox/`.
4. Shared API/spec/db libraries live in `lib/`.
5. Spec Kit docs live in `specs/`.
6. UI is a strong Replit-generated prototype.
7. Product behavior is mostly in-memory/mock.
8. Backend is health-check only.
9. Database layer is scaffold only.
10. AI generation layer is stubbed.

## Working / Partly Working / Dummy

1. Dashboard: mostly working UI, mock data.
2. New Breakdown form: working locally, creates in-memory session only.
3. Workflow workspace: interactive prototype, mostly mock/generated content.
4. Clarification panel: interactive, not real AI-backed.
5. PRD panel: interactive, mock content.
6. Epics panel: interactive, mock content.
7. Stories panel: interactive, mock content.
8. Quality review panel: interactive, mock scoring.
9. Developer review panel: interactive, in-memory only.
10. Export panel: copy/download works for local generated text files.
11. Reviews page: working filters/sort over mock stories.
12. Exports page: dummy export history; download button mostly toast behavior.
13. Settings page: interactive dummy; values do not persist.
14. Projects nav item: missing route.
15. Command search: visual only.
16. Notifications/account menu: mostly visual.
17. API server: `/api/healthz` only.
18. OpenAPI/API client: health only.
19. Drizzle/Postgres DB: no real product schema yet.
20. AI generation functions: stubs returning empty arrays.

## Completion Estimate

1. UI prototype: 65-75%.
2. Real app behavior: 20-30%.
3. Backend/API: 5-10%.
4. Persistence: 0-5%.
5. AI workflow engine: 0-10%.
6. Export/Jira integration: 15-25%.
7. Spec Kit process setup: 50-60%.
8. UI/UX polish workflow: 35-40%.

## Refinement Backlog

1. Fix missing Projects route.
2. Make command/search real or remove fake affordance.
3. Add accessible labels for icon-only buttons.
4. Add app-shell skip link.
5. Add accessible nav labels.
6. Add table captions or accessible names.
7. Persist sessions beyond refresh.
8. Replace global mock data with session-scoped data.
9. Make New Breakdown generate real clarification questions.
10. Add robust empty states.
11. Add loading states.
12. Add user-friendly error states.
13. Tighten dashboard hierarchy.
14. Align app shell/dashboard with design-system artifacts.
15. Add real settings persistence.
16. Add real export package creation/history.
17. Preserve existing useful density while improving scan paths.
18. Remove fake affordances before production use.

## Feature Add Candidates

1. Project list page.
2. Project detail page.
3. Spec Kit lifecycle tracker.
4. GitHub repo/branch sync.
5. Local workspace sync/status.
6. Agent handoff prompt generator.
7. OpenCode execution prompt history.
8. AI clarification question generation.
9. PRD generation from intake.
10. Epic generation from PRD.
11. Story generation from epics.
12. Readiness scoring engine.
13. Developer review workflow with comments.
14. Jira export integration.
15. GitHub issue export.
16. Activity timeline/audit log.
17. Workspace/team roles.
18. Notifications for review/export/sync state.

## Proposed Next Phases

1. **Phase A - UI Polish Foundation**
   - Spec: `002-ui-polish-foundation`
   - Status: Executed in `249307d`
   - Execute approved foundation polish from the old `001` design-lab workflow.
   - Apply approved app-shell/dashboard/accessibility polish.
   - Keep scope bounded to frontend UI/accessibility only.

2. **Phase B - Product Skeleton Completion**
   - Spec: `003-product-skeleton-completion`
   - Status: Executed locally on 2026-05-05
   - Add Projects route.
   - Make command palette/search behavior real.
   - Clean fake affordances.
   - Add missing empty/loading/error states.

3. **Phase C - Persistence MVP**
   - Spec: `004-persistence-mvp`
   - Define DB schema for sessions, projects, workflow artifacts, settings.
   - Add basic CRUD API.
   - Save sessions and settings beyond refresh.

4. **Phase D - AI Workflow MVP**
   - Spec: `005-ai-workflow-mvp`
   - Implement intake to clarification questions.
   - Generate PRD sections.
   - Generate epics.
   - Generate stories.
   - Score readiness and warnings.

5. **Phase E - Export Integrations**
   - Spec: `006-export-integrations`
   - Create export packages.
   - Persist export history.
   - Add Jira export.
   - Add GitHub issue export.

6. **Phase F - Collaboration And Review**
   - Spec: `007-collaboration-review`
   - Persist developer reviews.
   - Add comments/status history.
   - Add activity timeline.
   - Add notifications.

## Spec Execution Map

Use these prompts with OpenCode or another executor:

1. `execute spec 002-ui-polish-foundation and report the outcome`
2. `execute spec 003-product-skeleton-completion and report the outcome`
3. `execute spec 004-persistence-mvp and report the outcome`
4. `execute spec 005-ai-workflow-mvp and report the outcome`
5. `execute spec 006-export-integrations and report the outcome`
6. `execute spec 007-collaboration-review and report the outcome`

Spec `001-ui-ux-polish-workflow` remains the original design-lab/spec-driven
workflow track. It is not a Phase 2 implementation spec. Phase 2 starts at
`002-ui-polish-foundation` and each Phase 2 spec folder contains `spec.md`,
`plan.md`, and `tasks.md`.

## Recommended Next Spec

Create a new Spec Kit feature for **Product Skeleton Completion** after the
current UI/UX polish decision pass.

Initial scope:

1. Projects route.
2. Command palette/search behavior.
3. Fake affordance cleanup.
4. Empty states.
5. Basic accessibility fixes that do not depend on visual redesign.

Why this first:

1. High user-visible value.
2. Low backend dependency.
3. Cleans prototype seams before deeper persistence/AI work.
4. Makes the app easier to evaluate during later phases.

## OpenCode Critique Execution Assessment

OpenCode produced:

1. `.local/design-lab/001-ui-ux-polish-workflow/critique-001-current-dashboard.md`

Prompt completion:

1. Overall UI/UX diagnosis: done.
2. Visual hierarchy score: done, `6/10`.
3. Navigation clarity score: done, `6/10`.
4. Information density score: done, `7/10`.
5. SaaS workflow fit score: done, `6/10`.
6. Accessibility score: done, `4/10`.
7. Implementation feasibility score: missing.
8. Top 5 problems with evidence/why/severity/fix direction: done.
9. Top 5 strengths: done.
10. Recommended first micro-change: done.
11. Explicit do-not-change-yet note: done.
12. No app source code changed: confirmed by critique text and current git
    status showing no tracked app-source modifications.

Assessment:

OpenCode completed roughly 85-90% of the critique prompt. Main gap is the
missing `Implementation feasibility` score. The output is still useful as an
input to the decision pass and should be preserved as-is rather than overwritten.
