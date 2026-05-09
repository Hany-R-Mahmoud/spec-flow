# Feature Specification: Submit-Only Workflow Form RHF

**Feature Branch**: `010-submit-only-workflow-form-rhf`  
**Created**: 2026-05-09  
**Status**: Draft  
**Depends On**: `004-persistence-mvp`, `005-ai-workflow-mvp`, `009-clerk-supabase-auth-reset`

## Goal

Stop the workflow app from writing to the artifacts service while the user is
typing. Every persisted change in the breakdown and workflow surfaces must go
through an explicit submit or save action, with React Hook Form owning draft
state for all editable fields.

This spec fixes the current keystroke-driven persistence problem at the source:
form inputs stay local, submit buttons trigger persistence, and derived UI can
still react to draft values without causing API traffic.

## Current Problems Found

1. **The store persists from field updates**:
   `artifacts/specflow-ai/src/store/session-store.tsx` dispatches
   `updateSessionArtifacts(...)` inside `UPDATE_CLARIFICATION` and
   `UPDATE_PRD_SECTION`. The confirmed keystroke path is
   `ClarificationPanel -> dispatch(UPDATE_CLARIFICATION) ->
   updateSessionArtifacts(...)`.
2. **The intake form mixes local state with form state**:
   `artifacts/specflow-ai/src/pages/NewBreakdown.tsx` already uses React Hook
   Form for some fields, but it still keeps `targetUsers`, `labels`, and the
   raw input character count in separate local state paths. That makes the form
   contract inconsistent and easy to regress.
3. **Step editors use ad hoc controlled inputs**:
   `ClarificationPanel`, `PRDPanel`, `DeveloperReviewPanel`, and `SettingsPage`
   each manage draft fields differently, so there is no single rule that says
   "typing is local, submit is persistent".
4. **There is no submit-only workflow contract**:
   The repo lacks a documented boundary that separates draft editing from API
   mutations across all workflow steps.

## User Scenarios

1. As a PM, I can type in breakdown fields without any artifacts service call
   firing until I click the submit button.
2. As a PM, I can answer clarification questions and edit PRD sections without
   saving on each keystroke.
3. As a PM, I can edit settings, review notes, and workflow metadata through
   explicit save actions only.
4. As the team, we can reason about every form surface through one RHF
   pattern instead of one-off local state handlers.

## Requirements

- **FR-001**: All editable workflow surfaces MUST use React Hook Form for draft
  state.
- **FR-002**: Persisted API mutations MUST happen only from explicit submit or
  save handlers, never from `onChange`, `onValueChange`, `watch`, or
  `useEffect` side effects.
- **FR-003**: `NewBreakdown` MUST keep all intake fields in one RHF form
  context, including chips/select/custom inputs.
- **FR-004**: Clarification answers MUST remain local until an explicit submit
  or generation action persists them.
- **FR-005**: PRD section edits MUST remain local until the user clicks Save.
- **FR-006**: Developer review, settings, and similar workflow editors MUST
  follow the same submit-only rule.
- **FR-007**: Custom inputs such as chips, selects, radios, and sliders MUST be
  integrated through RHF `Controller`, `FormProvider`, or equivalent RHF
  patterns, not bespoke mutation handlers.
- **FR-008**: `useWatch` or equivalent subscriptions MAY be used for derived UI
  only, such as character counts, completeness hints, or button disabled
  states. They MUST NOT trigger persistence.
- **FR-009**: Existing persisted values MUST preload into forms through
  `defaultValues` and `reset`, not by writing back during render.
- **FR-010**: The session store MUST separate draft editing from persistence so
  local input changes cannot call API mutations implicitly.

## Must Finish

- No workflow field causes an API request while the user is typing.
- The breakdown intake flow only creates a session when the user submits.
- Clarification, PRD, review, and settings edits only persist through explicit
  buttons.
- The codebase has one documented form pattern for custom inputs and submit
  handlers.
- The root cause in `session-store.tsx` is removed or bypassed for draft input.

## May Defer

- Cosmetic form redesigns that do not affect event flow.
- Broader validation copy polish beyond the fields touched by this refactor.
- Reworking unrelated dashboard filters or read-only screens.

## Must Not Touch

- Auth, Clerk, or workspace-identity behavior.
- Persistence schema changes unless a form shape needs a new field contract.
- Export, review, or generation logic except where needed to stop draft writes.
- Unrelated UI polish or app shell changes.

## Failure Conditions

Executor must not report complete if:

- Typing in any workflow field still issues `POST`, `PATCH`, or `PUT` requests.
- Draft values are mirrored into the store in a way that triggers persistence
  before submit.
- `ClarificationPanel` still dispatches draft keystrokes into persistence.
- Custom inputs stay outside RHF and still call the artifacts service directly.
- The intake form still mixes submit-time and keystroke-time data sources.
- Save buttons exist but the related handlers still persist on change.

## Key Files

- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/PRDPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/DeveloperReviewPanel.tsx`
- `artifacts/specflow-ai/src/pages/SettingsPage.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/specflow-ai/src/components/ui/form.tsx`
- `artifacts/specflow-ai/src/components/ui/input.tsx`
- `artifacts/specflow-ai/src/components/ui/textarea.tsx`
- `artifacts/specflow-ai/src/components/ui/select.tsx`
- `artifacts/specflow-ai/src/components/ui/radio-group.tsx`
- `lib/api-client-react/src/custom-fetch.ts`

## Success Criteria

- **SC-001**: Typing into any workflow form does not hit the artifacts API.
- **SC-002**: The breakdown intake form only creates a session after submit.
- **SC-003**: Clarification and PRD edits save only on explicit actions.
- **SC-004**: React Hook Form owns all editable workflow drafts.
- **SC-005**: Derived UI still updates from draft input without causing writes.

## Evidence Required

Executor must report:

1. The exact draft-to-persistence boundary used for each workflow surface.
2. The files that moved from change-time writes to submit-time writes.
3. Browser proof that typing stays local and submit triggers the first request.
4. Any RHF helper patterns introduced for custom inputs.
5. Any remaining edge cases that still need manual submit gating.

## Executor Handoff

```text
Execute spec 010-submit-only-workflow-form-rhf. Read spec.md, plan.md,
research.md, quickstart.md, and tasks.md first. Preserve unrelated changes.
Follow React Hook Form official patterns: keep draft state local, use
FormProvider/useFormContext where it reduces prop drilling, use Controller for
custom inputs, and call persistence only inside explicit submit/save handlers.
Remove any store path that writes artifacts during field changes. Report changed
files, verification, and any remaining submit-only gaps.
```
