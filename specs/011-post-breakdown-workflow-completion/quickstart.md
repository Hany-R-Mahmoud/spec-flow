# Quickstart: Validate Post-Breakdown Workflow Completion

## Required Env

Use the existing root `.env` values already used by the app. No new variables
are expected just to verify the workflow surface.

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

1. Create a breakdown from `/new`.
2. Walk through clarification, PRD, epics, stories, quality review, dev
   review, and export.
3. Click every visible post-breakdown control.
4. Confirm each control either:
   - performs a real action,
   - persists state,
   - navigates to a real destination, or
   - is no longer rendered.
5. Refresh after changing phase and confirm the same phase returns.
6. Use the guidance sidebar and confirm every action item has a real result.
7. Try `Split Story` and confirm it produces a persisted outcome.
8. Try `Send All to Dev Review` and confirm story-level state changes, not just
   a tab switch.
9. Try `Complete Review` and confirm unresolved review work is blocked or
   clearly warned.
10. Open export and confirm Jira connect is a real state, not a coming-soon
    placeholder.
11. Use export download or history download and confirm a real artifact is
    produced.

## Suggested Commands

Use targeted checks only when needed:

```bash
pnpm --filter @workspace/specflow-ai typecheck
pnpm --filter @workspace/api-server typecheck
```

If the flow changes materially, use the browser to confirm the controls are
real and refresh-safe.

## Completion Evidence

Final implementation report should include:

- files changed
- which dummy or partial controls were removed or replaced
- which controls now have real handlers
- browser proof that phase state survives refresh
- browser proof that split, review, Jira, and export actions are real
- any surfaces intentionally removed instead of converted
