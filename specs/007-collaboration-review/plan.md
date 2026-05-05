# Implementation Plan: Collaboration And Review

## Architecture Decisions

1. Review state belongs in backend persistence.
2. Activity records should be append-only where practical.
3. Notifications derive from workflow events, not ad hoc frontend state.
4. Workspace/team records are minimal ownership scaffolding, not full auth.

## Sequence

1. Model reviews, comments, status history, activity, notifications.
2. Add API endpoints.
3. Wire DeveloperReviewPanel to persisted state.
4. Wire ReviewsPage filters/counts to API.
5. Add activity timeline UI.
6. Replace fake notification bell with persisted notifications.
7. Update dashboard counts from persisted state.

## Validation

- Submit review, refresh, confirm it remains.
- Change status, confirm history entry.
- Trigger export/review event, confirm activity/notification.
- Confirm no full auth assumptions leak into UI.

## Constitution Check

- Security: reviewer/user identity must be treated as untrusted input until auth
  exists.
- TypeScript/schema: use shared contracts.
- Accessibility: notifications and timelines readable, keyboard accessible.
- Surgical: no full RBAC/auth scope.
