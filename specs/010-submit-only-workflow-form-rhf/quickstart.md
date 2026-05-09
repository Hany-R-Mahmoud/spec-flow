# Quickstart: Validate Submit-Only Workflow Form RHF

## Required Env

Use the existing root `.env` values already used by the app. No new auth or DB
variables are expected for this refactor.

## Start Local Runtime

Run the app normally:

```bash
pnpm dev
```

Open:

```text
http://localhost:8080/
```

## Manual Validation

1. Open the breakdown screen at `/new`.
2. Open browser devtools Network tab.
3. Type into every intake field:
   - name
   - input type
   - output depth
   - Jira key
   - target users
   - business goal
   - known constraints
   - labels/components
   - raw input
4. Confirm no artifacts service request fires while typing.
5. Click the submit/start button.
6. Confirm the first request is the expected session creation call.
7. Open the workflow workspace.
8. Type into clarification answers and PRD editors.
9. Confirm no `PATCH /api/sessions/.../artifacts` call appears until the
   explicit save or generate action.
10. Open Settings.
11. Type into persisted settings fields and confirm nothing writes until the
   explicit Save button is clicked.

## Suggested Commands

Use targeted checks only when needed:

```bash
pnpm --filter @workspace/specflow-ai typecheck
pnpm --filter @workspace/api-server typecheck
```

If the workflow UI is touched heavily, use the browser to confirm the network
panel is quiet during typing.

## Completion Evidence

Final implementation report should include:

- files changed
- which forms now use RHF
- which store writes were removed from change handlers
- browser proof that typing stays local
- browser proof that submit/save still persists once
- any remaining input surfaces that still need migration
