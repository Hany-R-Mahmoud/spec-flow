# Implementation Plan: AI Workflow MVP

## Summary

Move from stubbed local functions to validated server-side AI workflow steps
that save artifacts and expose clear UI states.

## Architecture Decisions

1. API server owns AI calls, prompt templates, validation, and persistence.
2. Frontend triggers generation and displays saved artifacts.
3. Each generation step is independently retryable.
4. AI output must be parsed/validated before saving.
5. Missing credentials should produce an explicit unavailable state.

## Sequence

1. Define generation API contracts.
2. Add prompt modules/templates.
3. Implement clarification generation.
4. Implement PRD generation.
5. Implement epic generation.
6. Implement story generation.
7. Implement scoring/warnings.
8. Wire UI actions and states.

## Validation

- Run one happy path from intake through stories.
- Simulate model/API failure.
- Confirm invalid output is rejected.
- Confirm artifacts persist.

## Constitution Check

- Complexity: justified by core product workflow.
- TypeScript/schema: validated outputs required.
- Accessibility: loading/error states required.
- Security: model inputs/outputs cross trust boundary; review for injection and
  unsafe rendering.
- Surgical: no external export scope.
