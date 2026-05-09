# Research: Submit-Only Workflow Form RHF

## Question

How should the workflow forms be structured so that typing never triggers the
artifacts service, while the app still uses React Hook Form in a clean,
official way?

## Decision

Use React Hook Form as the draft-state layer for every editable workflow
surface, and keep all persistence inside explicit submit/save handlers.

```text
User input -> RHF draft state -> derived UI only -> explicit submit/save ->
API mutation
```

## Repo Finding

The current keystroke-write bug is not random. The session store already
presents the root cause, and the confirmed keystroke path is in
`ClarificationPanel`:

- `UPDATE_CLARIFICATION` calls `updateSessionArtifacts(...)`
- `UPDATE_PRD_SECTION` calls `updateSessionArtifacts(...)`
- `ClarificationPanel` dispatches `UPDATE_CLARIFICATION` from textarea
  `onChange`

That means any UI wired to those actions can persist while a user is still
typing. Fixing only one form would leave the underlying pattern intact.

## Official Guidance Summary

### React Hook Form core pattern

The official RHF home page emphasizes fewer re-renders and a submit-driven
model with `handleSubmit(...)`. That is the right base for this refactor:

- keep inputs registered locally
- validate through RHF/Zod
- submit once at the end

Source:

- [React Hook Form](https://react-hook-form.com/)

### Native inputs

For regular inputs and textareas, RHF works best when the field is registered
directly and the form submits through `handleSubmit`.

Source:

- [useForm docs](https://react-hook-form.com/docs/useform)

### Custom inputs

For custom controls like chips, selects, radios, or any non-native field, RHF
recommends using `Controller` or an equivalent RHF-controlled integration
instead of inventing a separate write path.

Sources:

- [Controller docs](https://react-hook-form.com/docs/controller)
- [FormProvider docs](https://react-hook-form.com/docs/formprovider)

### Derived UI

RHF subscriptions such as `watch` or `useWatch` are good for derived UI like
character counts, completeness, or button enablement. They are not a
persistence mechanism.

Source:

- [useWatch docs](https://react-hook-form.com/docs/usewatch)

### Initial values

Persisted data should enter the form through `defaultValues` or `reset(...)`
when the backing record changes. That avoids render-time writes and keeps the
draft/persist boundary clear.

## Rationale

- RHF is already present in the codebase and fits the current shadcn-style form
  primitives.
- The app needs fewer moving parts, not another save scheduler.
- The store-side bug is a boundary problem, so the fix should remove the hidden
  persistence path instead of patching symptoms with debounce or retries.
- `Controller` and `FormProvider` let custom inputs participate without creating
  a separate local state system.

## Alternatives Considered

### Alternative A: Keep controlled local state and debounce writes

Rejected. It still writes during typing, just less often, and it keeps the
boundary ambiguous.

### Alternative B: Add autosave with a delay

Rejected. Autosave is the opposite of submit-only behavior.

### Alternative C: Only fix `NewBreakdown`

Rejected. The workflow panels and store dispatch paths already show the same
pattern, so the bug would come back in the next edit surface.

## Sources

- [React Hook Form home](https://react-hook-form.com/)
- [React Hook Form useForm](https://react-hook-form.com/docs/useform)
- [React Hook Form Controller](https://react-hook-form.com/docs/controller)
- [React Hook Form FormProvider](https://react-hook-form.com/docs/formprovider)
- [React Hook Form useWatch](https://react-hook-form.com/docs/usewatch)
