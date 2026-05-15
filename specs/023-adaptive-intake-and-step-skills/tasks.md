# Tasks: Adaptive Intake And Step Skills

**Input**: Design docs from `/specs/023-adaptive-intake-and-step-skills/`  
**Prerequisites**: `spec.md`  
**Tests**: Do not run broad suites by default. Use targeted typecheck/browser
checks only when needed to prove routing, persistence, and skill application.

## Phase 1: Discovery And Contract Map

**Purpose**: Locate current workflow contracts before changing intake or skills.

- [x] T001 Read `spec.md`, `docs/architecture.md`, `docs/key-flows.md`, and
      `graphify-out/GRAPH_REPORT.md`.
- [x] T002 Inspect workflow state in
      `artifacts/specflow-ai/src/store/session-store.tsx`.
- [x] T003 Inspect intake entry in
      `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`.
- [x] T004 Inspect phase workspace in
      `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`.
- [x] T005 Inspect generation route and deterministic workflow logic in
      `artifacts/api-server/src/routes/generation.ts` and
      `artifacts/api-server/src/ai/`.
- [x] T006 Inspect persisted workflow schema in `lib/db/src/schema/index.ts`.
- [x] T007 Inspect `lib/api-spec/openapi.yaml` for current session,
      generation, and artifact contracts.
- [x] T008 Produce an implementation contract map: content intake, artifact
      classification, phase routing, step skill storage, generation use.

## Phase 2: Product Contract Design

**Purpose**: Define behavior before schema/API edits.

- [x] T009 Define imported content artifact classes: clarification answers,
      PRD sections, epics, stories, quality notes, export metadata, unknown
      context.
- [x] T010 Define phase readiness states: `complete`, `partial`, `missing`,
      `unknown`, and `needs-review`.
- [x] T011 Define skip/reuse/generate rules for each canonical phase.
- [x] T012 Define how user-confirmed existing content is protected from silent
      overwrite.
- [x] T013 Define step skill scope: workspace default, project override, session
      snapshot.
- [x] T014 Define step skill versioning and artifact provenance.
- [x] T015 Define default step skill structure: purpose, inputs, process rules,
      output contract, quality checks, examples.
- [x] T016 Define validation rules for unsafe or invalid custom skill text.

## Phase 3: Data Model

**Purpose**: Add persistence for imported content, phase analysis, skills, and
skill provenance.

- [ ] T017 Add schema objects/types for imported content analysis.
- [ ] T018 Add schema objects/types for phase readiness and routing
      recommendation.
- [ ] T019 Add schema objects/types for step skills and skill versions.
- [ ] T020 Add schema objects/types for artifact provenance: phase, skill ID,
      skill version, generated/imported source, timestamp.
- [ ] T021 Add database tables or JSON columns needed for step skills and
      intake analysis.
- [ ] T022 Add migrations or Drizzle push notes as required by repo pattern.
- [ ] T023 Keep generated/shared types aligned across `lib/db`, `lib/api-zod`,
      and app usage.

## Phase 4: API Contract

**Purpose**: Expose explicit operations instead of hiding logic in UI state.

- [ ] T024 Add OpenAPI schemas for imported content, phase analysis, step skill,
      and skill version.
- [ ] T025 Add endpoint to analyze imported content for a session or draft
      session.
- [ ] T026 Add endpoint to accept/reject phase routing recommendations.
- [ ] T027 Add endpoints to list default and custom step skills.
- [ ] T028 Add endpoints to create, update, duplicate, reset, and assign step
      skills.
- [x] T029 Add generation request fields for selected skill version or session
      skill snapshot.
- [x] T030 Regenerate API client and Zod outputs.

## Phase 5: Intake Analysis Implementation

**Purpose**: Let users start from existing content and continue at the right
phase.

- [x] T031 Implement deterministic first-pass content classification.
- [x] T032 Classify pasted markdown/text into known artifact buckets.
- [x] T033 Mark uncertain sections as `unknown` with `Unknown / verify` notes.
- [x] T034 Compute recommended phase routing from completeness and missing
      artifacts.
- [x] T035 Persist analysis result without overwriting existing session
      artifacts.
- [x] T036 Add user confirmation path to reuse imported artifacts.
- [ ] T037 Add rollback/reset path for a bad import analysis.

## Phase 6: Step Skills Implementation

**Purpose**: Make phase behavior editable and traceable.

- [x] T038 Create default skills for `clarification`, `prd`, `epics`,
      `stories`, `quality`, and `export`.
- [x] T039 Store default skills separately from user-edited custom skills.
- [x] T040 Implement skill edit/save/reset/duplicate behavior.
- [x] T041 Implement skill assignment per phase.
- [x] T042 Snapshot selected skill version onto generation runs.
- [x] T043 Pass applicable skill content into generation logic.
- [x] T044 Persist artifact provenance with skill version used.
- [x] T045 Show validation warnings for invalid or risky skill instructions.

## Phase 7: UI Implementation

**Purpose**: Add usable screens without redesigning unrelated pages.

- [x] T046 Add existing-content intake mode to `NewBreakdown`.
- [x] T047 Show analysis result with buckets, confidence, and unknown sections.
- [x] T048 Show per-phase status: reuse, complete, partial, missing, generate.
- [x] T049 Let user confirm which imported artifacts to keep.
- [x] T050 Route user to the recommended next phase after confirmation.
- [x] T051 Add step skills management surface, likely under settings or
      workflow phase configuration.
- [x] T052 Add per-phase skill preview/edit/reset controls.
- [x] T053 Show skill provenance on generated artifacts where useful.
- [ ] T054 Preserve existing create-from-scratch flow.

## Phase 8: Generation And Workflow Integration

**Purpose**: Make imported content and step skills affect real workflow output.

- [x] T055 Update generation payloads to include imported/reused artifacts.
- [x] T056 Prevent generation from replacing user-kept artifacts unless user
      explicitly chooses regenerate.
- [x] T057 Make clarification generation skip already answered questions where
      imported answers are sufficient.
- [x] T058 Make PRD generation preserve imported decisions and mark gaps.
- [x] T059 Make epics/stories generation consume reused upstream artifacts.
- [x] T060 Make quality phase work directly on imported or generated stories.
- [x] T061 Make export readiness work for imported stories that passed quality.

## Phase 9: Documentation And Handoff

**Purpose**: Keep durable behavior discoverable.

- [x] T062 Document adaptive intake behavior in project docs.
- [x] T063 Document step skill structure and editing rules.
- [x] T064 Document security/safety limits for custom skills.
- [x] T065 Add default skill examples to a repo-owned location.
- [x] T066 Update `docs/ai-agent-guide.md` if implementation changes agent
      workflow.

## Phase 10: Verification

**Purpose**: Prove MVP behavior.

- [ ] T067 Verify half-written PRD can route directly to epics/stories.
- [ ] T068 Verify existing stories can route directly to quality/export.
- [x] T069 Verify complete imported phases are not repeated unless user chooses
      regenerate.
- [ ] T070 Verify edited story skill affects future story generation.
- [ ] T071 Verify generated artifacts record skill version used.
- [x] T072 Verify unknown/uncertain imported facts are marked `Unknown / verify`.
- [ ] T073 Verify create-from-scratch flow still works.
- [x] T074 Run targeted typecheck or browser verification if touched code path
      needs proof.

## Dependencies And Execution Order

- Phase 1 blocks all implementation.
- Phase 2 blocks schema and API changes.
- Phase 3 blocks Phase 4 if new persistence is needed.
- Phase 4 blocks UI and generation integration.
- Phase 5 and Phase 6 can proceed in parallel after contracts are stable.
- Phase 7 depends on API shape.
- Phase 8 depends on intake and skill persistence.
- Phase 10 is final proof.

## Parallel Opportunities

- Intake analysis and step skills can be built in parallel after Phase 2.
- UI intake screen and skill management screen can be split across workers once
  API contracts exist.
- Documentation can proceed while implementation is finishing.

## MVP Slice Recommendation

Build in this order:

1. Adaptive intake: paste content, classify, show phase routing, confirm reuse.
2. Step skills: default skills, edit/reset, assign per phase.
3. Generation integration: pass skill version and preserve imported artifacts.
4. Provenance and verification.
