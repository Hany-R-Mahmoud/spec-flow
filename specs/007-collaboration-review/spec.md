# Feature Specification: Collaboration And Review

**Feature Branch**: `007-collaboration-review`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase F from the 2nd phase roadmap
**Depends On**: `004-persistence-mvp`, `006-export-integrations`

## Goal

Make review/collaboration durable: developer review comments, status history,
activity timeline, notifications, and workspace/team readiness foundations.

## User Scenarios

1. As a developer, I can leave durable review comments on stories.
2. As a PM, I can see status history and unresolved review work.
3. As a user, I can see an activity timeline for important workflow changes.
4. As a user, I receive visible notifications for review/export/sync events.

## Requirements

- **FR-001**: Persist developer review comments and statuses.
- **FR-002**: Track status history for stories, sessions, exports, and reviews.
- **FR-003**: Add activity timeline records for major workflow events.
- **FR-004**: Add notification records and UI surface.
- **FR-005**: Add workspace/team schema foundations only if needed for
  ownership and audit trails.
- **FR-006**: Do not implement full auth/roles unless separately specified.
- **FR-007**: Keep review filters and dashboard counts API-backed.
- **FR-008**: Preserve existing review UX density while adding durability.

## Must Finish

- Persist developer review comments/statuses.
- Persist status history for reviewable workflow entities.
- Add activity timeline records for major changes.
- Replace fake notification bell with persisted notification state.
- Update dashboard/review counts from persisted state.

## May Defer

- Full auth/RBAC.
- Real-time multiplayer.
- Email/push notifications.
- Team invitation flows.

## Must Not Touch

- AI generation prompts.
- External export implementation except emitting/reading events.
- Full auth/role enforcement.

## Failure Conditions

Executor must not report complete if:

- Review comments disappear after refresh.
- Notification bell remains purely fake.
- Status changes have no persisted history.
- Dashboard review counts still rely on stale mock-only state.

## Success Criteria

- **SC-001**: Review comments survive refresh.
- **SC-002**: Status changes show history.
- **SC-003**: Activity timeline shows major workflow events.
- **SC-004**: Notifications reflect real persisted events.
- **SC-005**: Dashboard/reviews counts are backed by persisted review state.

## Evidence Required

Executor must report:

1. Review/comment/status schemas and APIs.
2. Activity/notification schemas and APIs.
3. Refresh-persistence result for review comments.
4. Status history verification.
5. Notification UI behavior.
6. Remaining auth/identity assumptions.

## Executor Handoff

```text
Execute spec 007-collaboration-review. Read spec.md, plan.md, tasks.md,
constitution, and prior persistence spec 004 and export spec 006 outcomes. Implement durable review
and activity features only; do not build full auth unless a separate spec exists.
```
