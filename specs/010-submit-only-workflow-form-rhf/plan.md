# Implementation Plan: Submit-Only Workflow Form RHF

**Branch**: `010-submit-only-workflow-form-rhf` | **Date**: 2026-05-09 | **Spec**: `specs/010-submit-only-workflow-form-rhf/spec.md`  
**Input**: Feature specification from `/specs/010-submit-only-workflow-form-rhf/spec.md`

## Summary

Replace draft-time persistence with a submit-only form boundary across the
workflow app.

```text
User types into RHF draft state
  -> derived UI may subscribe for counts/validation
  -> no API mutation occurs
  -> user clicks explicit submit/save
  -> store/API mutation runs once
```

The main fix is not just "add RHF". The real fix is to separate draft editing
from persistence so the artifacts service only sees intentional writes.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Vite  
**Primary Dependencies**: React Hook Form, `@hookform/resolvers`, Zod,
existing shadcn-style form primitives, session store, generated API client  
**Storage**: Existing API-backed persistence only; no schema redesign expected
for the form rewrite  
**Testing**: User does not want tests run by default. Use targeted checks only
when needed to prove the submit-only boundary  
**Target Platform**: Local Vite app on port 8080 with API on port 24549  
**Project Type**: pnpm monorepo with frontend workflow surfaces and shared API
client  
**Performance Goals**: Typing must stay local; rerenders and derived counts are
fine, network writes are not  
**Constraints**: No per-keystroke persistence, no hidden autosave, no
uncontrolled custom input writes, preserve current UX flow  
**Scale/Scope**: Breakdown intake, clarification answers, PRD edits, review
inputs, settings inputs, and the store paths they currently touch

## Constitution Check

- Simplicity and Maintainability: PASS. One form contract, one persistence
  boundary.
- TypeScript and Schema Discipline: PASS. Use existing schema and RHF
  contracts instead of introducing new hidden state.
- Accessible Product Quality: PASS. Submit buttons remain explicit and
  keyboard-friendly.
- Security and Trust Boundaries: PASS. No new trust boundary, just fewer
  accidental writes.
- Surgical Workflow: PASS. Scope stays inside workflow input surfaces and the
  store methods they call.

## Architecture Decisions

### AD-001: RHF owns draft state

Each editable workflow surface gets a single RHF form boundary. Local draft
state lives inside the component or a small shared form hook, not in the
session store.

### AD-002: Persistence only on explicit submit/save

API mutations run only inside `handleSubmit(...)` or click handlers for explicit
save buttons. No `onChange` side effects, no `useEffect` persistence, no store
dispatch that secretly writes.

### AD-003: Use RHF primitives by input type

- Native text inputs and textareas use `register` where practical.
- Custom controls such as chips, selects, radios, sliders, and segmented
  controls use `Controller`.
- `FormProvider`/`useFormContext` are used where they reduce prop drilling
  across nested form sections.

### AD-004: Derived UI may subscribe, but cannot persist

`watch`, `useWatch`, and form state subscriptions may drive counts, badges,
validation hints, and disabled states. They must never call the artifacts
service.

### AD-005: Reset on incoming persisted data only

Use RHF `defaultValues` and `reset(...)` when persisted state changes. Do not
mirror store state back into draft fields during render.

### AD-006: Store methods stay explicit

`session-store.tsx` should expose explicit persistence actions, not hidden
change-time writes. Any remaining local dispatch actions must be draft-only or
pure UI state.

## Execution Phases

### Phase 1: Discovery and Boundary Mapping

- Inventory every workflow surface that accepts free-form input.
- Locate every store action or component handler that writes during change.
- Confirm which derived UI behaviors actually need live subscriptions.

### Phase 2: Form Contract Design

- Define the RHF pattern for native inputs, custom chips, selects, and text
  areas.
- Decide which form surfaces are standalone forms and which are nested in a
  shared provider.
- Define the submit/save contract for each surface.

### Phase 3: Intake Rewrite

- Convert `NewBreakdown` to one RHF model for all intake fields.
- Move chips and counters into RHF-compatible controlled components.
- Keep session creation behind the submit handler only.

### Phase 4: Workflow Step Rewrite

- Convert clarification answers to RHF drafts with explicit save/generate
  actions.
- Convert PRD editing to RHF with explicit save buttons.
- Convert developer review and settings inputs to the same pattern where they
  still participate in persistence.

### Phase 5: Store Cleanup

- Remove or isolate any store path that persists from draft changes.
- Keep explicit save methods and generation methods intact.
- Make sure draft actions cannot call the API by accident.

### Phase 6: Validation

- Prove typing in every editable field does not trigger API traffic.
- Prove submit/save still writes exactly once.
- Prove the user can still complete the workflow end to end.

### Phase 7: Docs and Handoff

- Update the spec-kit docs if implementation changes the expected RHF pattern.
- Capture any edge cases that remain intentionally manual.

## Validation Strategy

1. Browser proof:
   - Open `/new`.
   - Type across all fields.
   - Confirm no `POST /api/sessions` or `PATCH /api/sessions/...` until submit.
2. Step proof:
   - Answer clarification questions.
   - Edit a PRD section.
   - Confirm no `updateSessionArtifacts`-backed request until the explicit save
     or generation action.
3. Store proof:
   - Confirm the session store no longer writes from draft dispatch actions.
4. RHF proof:
   - Confirm custom inputs use `Controller` or another sanctioned RHF pattern.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Submit-only persistence boundary | Prevents accidental API writes during typing | Debounce still writes during typing and leaves the boundary unclear |
| RHF for custom controls | Standardizes inputs and keeps drafts local | Ad hoc state would keep the current split between local and persisted state |
| Store cleanup | Stops hidden writes at the root | Only fixing one component leaves other workflow surfaces vulnerable |

## Risks

- If one component keeps a direct store mutation in `onChange`, the bug will
  survive even if other forms move to RHF.
- `useWatch` can accidentally become a write trigger if the code is not kept
  explicit.
- Custom chip/select components may need careful `Controller` wiring to avoid
  value drift.
- Save buttons must remain clear or users will think the app lost data.
