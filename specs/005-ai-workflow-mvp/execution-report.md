# Execution Report: AI Workflow MVP

**Spec**: `005-ai-workflow-mvp`  
**Status**: Implemented, compile-verified, runtime verification pending  
**Date**: 2026-05-05

## Files Changed

- `lib/db/src/schema/index.ts`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.schemas.ts`
- `artifacts/api-server/src/ai/config.ts`
- `artifacts/api-server/src/ai/prompts.ts`
- `artifacts/api-server/src/ai/deterministic-workflow.ts`
- `artifacts/api-server/src/routes/generation.ts`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/persistence.ts`
- `artifacts/specflow-ai/src/lib/types.ts`
- `artifacts/specflow-ai/src/lib/sample-data.ts`
- `artifacts/specflow-ai/src/lib/mock-ai.ts`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/PRDPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/EpicsPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/StoriesPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/QualityReviewPanel.tsx`
- `specs/005-ai-workflow-mvp/spec.md`
- `specs/005-ai-workflow-mvp/tasks.md`

## Contracts And Persistence

Added workflow-generation schema state to persisted artifacts:

1. `generation.mode`
2. `generation.status`
3. `generation.promptVersion`
4. `generation.updatedAt`
5. `generation.errorMessage`

Expanded OpenAPI and regenerated shared clients for:

1. `POST /api/sessions/:sessionId/generate/clarification`
2. `POST /api/sessions/:sessionId/generate/prd`
3. `POST /api/sessions/:sessionId/generate/epics`
4. `POST /api/sessions/:sessionId/generate/stories`
5. `POST /api/sessions/:sessionId/generate/quality`

The API response contract now includes `session.generation` so the UI can render
loading, failure, success, and unavailable states per workflow step.

## Backend Workflow

Added inspectable AI workflow modules under `artifacts/api-server/src/ai/`:

1. `config.ts`
   Selects `demo` or `unavailable` mode from environment without hardcoded
   secrets.
2. `prompts.ts`
   Stores prompt templates and prompt version ids in source.
3. `deterministic-workflow.ts`
   Generates non-empty clarification questions, PRD sections, epics, stories,
   readiness scores, and warnings.

`routes/generation.ts` now:

1. Validates request bodies at the API boundary with generated `@workspace/api-zod`
   parsers.
2. Validates generated artifacts with shared schema-layer Zod contracts from
   `@workspace/db` before saving.
3. Persists generation status separately from artifacts.
4. Resets downstream generation states when upstream artifacts are regenerated.
5. Preserves prior saved artifacts if generation fails or is unavailable.

## Frontend Workflow

The active generation path no longer depends on empty stubs.

Implemented:

1. `SessionProvider.runGeneration(...)` to call generation endpoints in API
   mode.
2. Deterministic local generation fallback in demo mode via
   `artifacts/specflow-ai/src/lib/mock-ai.ts`.
3. Per-step loading, success, failure, and unavailable banners in the
   workspace panels.
4. Explicit regenerate controls for clarification, PRD, epics, stories, and
   quality review.
5. Workspace button wiring so generation triggers artifact creation instead of
   only advancing phases.

## Verification

Passed:

```bash
pnpm --filter @workspace/api-spec codegen
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/specflow-ai typecheck
pnpm run typecheck
```

Observed:

```bash
curl -s http://127.0.0.1:24549/api/healthz
# {"status":"ok"}

curl -s -o - -w "\nSTATUS:%{http_code}\n" http://127.0.0.1:24549/api/sessions
# {"message":"Persistence requires DATABASE_URL. Configure the database before calling persistence routes."}
# STATUS:500
```

## Honest Status

Spec 005 is implemented and compile-clean. Two runtime items remain unverified:

1. A true happy-path run from intake to stories against the API-backed
   persistence path.
2. Refresh verification that generated artifacts survive browser reload.

Why not verified yet:

- `DATABASE_URL` is still absent, so all persistence-backed session/generation
  routes return the expected blocker message before any end-to-end generation
  flow can run.
- The frontend fallback path is wired for demo mode, but I did not claim
  browser-level verification of each button path in this execution.

## Prompt / Model Assumptions

1. Default generation mode is deterministic `demo`.
2. `SPECFLOW_AI_MODE=unavailable` forces explicit unavailable behavior.
3. `SPECFLOW_AI_MODE=live` is treated as unsupported in this MVP and returns an
   unavailable state until a real provider integration is added.

## Remaining Risks

1. `SC-001`, `SC-002`, `SC-003`, and `SC-004` are implemented but not claimed
   runtime-verified without a real database-backed session flow.
2. Quality and warning heuristics are deterministic rubric-based logic, not a
   live model.
3. Regeneration resets downstream artifacts by design; this should be confirmed
   with product expectations during runtime QA.
