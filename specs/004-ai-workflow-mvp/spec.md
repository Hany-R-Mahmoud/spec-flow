# Feature Specification: AI Workflow MVP

**Feature Branch**: `004-ai-workflow-mvp`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase D from the 2nd phase roadmap

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

## Executor Handoff

```text
Execute spec 004-ai-workflow-mvp. Read spec.md, plan.md, tasks.md, constitution,
and persistence spec outcome first. Implement AI workflow only, with validation,
error handling, and no export integrations.
```
