# Implementation Plan: Collaboration And Review

## Summary

Persist review collaboration data as durable backend records, then surface the
saved review state, status history, activity timeline, and notifications in the
existing dashboard and review UI.

## Architecture Decisions

1. Review data belongs in backend persistence, not local component state.
2. Status history and activity records should be append-only where practical.
3. Notifications should derive from workflow events rather than ad hoc frontend
   flags.
4. Workspace/team records stay minimal and only support ownership or audit
   needs.
5. Export events should be usable as inputs to activity or notification records.

## Sequence

1. Model review, comment, status history, activity, and notification data.
2. Expand OpenAPI and generated client contracts.
3. Add API routes for review writes and timeline reads.
4. Wire DeveloperReviewPanel to persisted state.
5. Wire ReviewsPage and Dashboard counts to API-backed review data.
6. Add activity timeline and notification UI surfaces.
7. Preserve honest disabled/loading/error states throughout.

## Validation

- Submit a review, refresh, and confirm it remains.
- Change review status and confirm a history entry is recorded.
- Trigger an export/review event and confirm the activity or notification feed
  changes.
- Confirm the UI does not assume full auth or team membership.

## Constitution Check

- Security: reviewer identity and display fields are untrusted input until
  auth exists.
- TypeScript/schema: use shared contracts and generated API types.
- Accessibility: notifications and timelines must remain readable and keyboard
  accessible.
- Surgical: do not expand into full auth, team invites, or real-time sync.
