# Feature Specification: AI Workflow MVP

**Feature Branch**: `005-ai-workflow-mvp`  
**Created**: 2026-05-05  
**Status**: Implemented (runtime verification pending)  
**Phase**: Phase D from the 2nd phase roadmap
**Depends On**: `004-persistence-mvp`

## Goal

Replace stubbed AI generation with a real workflow pipeline:
intake -> clarification questions -> PRD -> epics -> stories -> readiness score
and warnings.

## User Scenarios

1. As a PM, I paste rough input and receive useful clarification questions.
2. As a PM, I answer questions and generate a structured PRD.
3. As a PM, I generate epics and stories from the PRD.
4. As a developer reviewer, I see readiness scores and warnings that explain
   missing details.

## Requirements

- **FR-001**: Implement generation orchestration behind API boundaries.
- **FR-002**: Keep prompts/versioning inspectable in source.
- **FR-003**: Store generated artifacts from each phase.
- **FR-004**: Allow regeneration with explicit user action.
- **FR-005**: Validate AI outputs with Zod/schema contracts.
- **FR-006**: Handle AI errors with retryable user-facing states.
- **FR-007**: Implement deterministic fallback or clear unavailable state if no
  model credentials exist.
- **FR-008**: Implement readiness scoring and warning detection.
- **FR-009**: Do not add Jira/GitHub export integration in this spec.

## Must Finish

- Replace empty-return stubs for the core generation path or route all
  generation through API-backed implementations.
- Persist generation status and outputs for clarification, PRD, epics, stories,
  readiness scores, and warnings.
- Validate generated outputs before saving.
- Show loading/error/retry/unavailable states.
- Keep prompt templates and output schemas inspectable.

## May Defer

- Using a paid/live model if credentials are not configured; must provide clear
  unavailable/demo behavior.
- Advanced prompt tuning.
- Collaboration notifications.
- External exports.

## Must Not Touch

- Jira/GitHub integrations.
- Auth/team roles.
- Broad persistence redesign beyond artifact fields needed for generation.

## Failure Conditions

Executor must not report complete if:

- `mock-ai.ts` still returns empty arrays for the active generation path.
- AI output can be saved without schema validation.
- Failed generation leaves UI stuck with no retry or explanation.
- Generated artifacts are lost after refresh.

## Key Files

- `artifacts/specflow-ai/src/lib/mock-ai.ts`
- `artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx`
- `PRDPanel.tsx`, `EpicsPanel.tsx`, `StoriesPanel.tsx`,
  `QualityReviewPanel.tsx`
- `artifacts/api-server/src/routes/`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/db/src/schema/index.ts`

## Success Criteria

- **SC-001**: New intake can generate non-empty clarification questions.
- **SC-002**: Answered questions can generate PRD sections.
- **SC-003**: PRD can generate epics and stories.
- **SC-004**: Stories include readiness scores and warnings.
- **SC-005**: Invalid or failed AI output does not corrupt saved workflow state.

## Evidence Required

Executor must report:

1. Generation endpoints or services added.
2. Prompt/template files or modules added.
3. Output schemas/validation used.
4. One happy path result from intake to stories, or exact blocker.
5. Failure/unavailable behavior verified.
6. Checks run or skipped with reason.

## Executor Handoff

```text
Execute spec 005-ai-workflow-mvp. Read spec.md, plan.md, tasks.md, constitution,
and persistence spec 004 outcome first. Implement AI workflow only, with validation,
error handling, and no export integrations.
```
