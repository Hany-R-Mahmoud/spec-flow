# Feature Specification: Collaboration And Review

**Feature Branch**: `007-collaboration-review`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase F from the 2nd phase roadmap  
**Depends On**: `004-persistence-mvp`, `006-export-integrations`

## Goal

Make review and collaboration durable: developer review comments, status
history, activity timeline, notifications, and the minimum workspace/team
scaffolding needed for audit-friendly ownership.

## User Scenarios

1. As a developer, I can leave durable review comments on stories.
2. As a PM, I can see status history and unresolved review work.
3. As a user, I can see an activity timeline for important workflow changes.
4. As a user, I can see real notification state for review, export, and sync
   events.

## Requirements

- **FR-001**: Persist developer review comments and statuses.
- **FR-002**: Persist status history for stories, sessions, exports, and
  reviews.
- **FR-003**: Add activity timeline records for major workflow events.
- **FR-004**: Add notification records and a visible UI surface.
- **FR-005**: Add minimal workspace/team schema foundations only if needed for
  ownership or audit trails.
- **FR-006**: Do not implement full auth/RBAC unless separately specified.
- **FR-007**: Keep review filters, counts, and dashboard summary data
  API-backed.
- **FR-008**: Preserve existing review density while adding durability and
  honest states.
- **FR-009**: Keep export events available as activity/notification triggers.
- **FR-010**: Do not touch AI generation prompts or external export mechanics
  beyond emitting or reading events.

## Must Finish

- Persist developer review comments and statuses.
- Persist status history for reviewable workflow entities.
- Add activity timeline records for major changes.
- Replace fake notification state with persisted notification data.
- Update dashboard and review counts from persisted state.

## May Defer

- Full auth/RBAC.
- Real-time multiplayer.
- Email or push notifications.
- Team invitation flows.

## Must Not Touch

- AI generation prompts.
- External export implementation except for event emission or event reads.
- Full auth or role enforcement.
- Broad UI redesign.

## Failure Conditions

Executor must not report complete if:

- Review comments disappear after refresh.
- Notification state remains purely fake or visual-only.
- Status changes have no persisted history.
- Dashboard review counts still rely on stale mock-only state.
- Review identity fields are trusted without validation.

## Key Files

- `artifacts/specflow-ai/src/components/workspace/DeveloperReviewPanel.tsx`
- `artifacts/specflow-ai/src/components/workspace/ExportPanel.tsx`
- `artifacts/specflow-ai/src/pages/ReviewsPage.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/api-server/src/routes/`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.ts`
- `lib/db/src/schema/index.ts`

## Success Criteria

- **SC-001**: Review comments survive refresh.
- **SC-002**: Status changes show history.
- **SC-003**: Activity timeline shows major workflow events.
- **SC-004**: Notifications reflect persisted events.
- **SC-005**: Dashboard and review counts are backed by persisted review state.

## Evidence Required

Executor must report:

1. Review, comment, and status schemas and APIs.
2. Activity and notification schemas and APIs.
3. Refresh-persistence result for review comments.
4. Status history verification.
5. Notification UI behavior.
6. Remaining auth and identity assumptions.

## Executor Handoff

```text
Execute spec 007-collaboration-review. Read spec.md, plan.md, tasks.md, and
the constitution first. Read specs/004-persistence-mvp and specs/006-export-
integrations outcomes first. Preserve unrelated changes. Implement durable
review comments, status history, activity timeline, and notifications only.
Do not build full auth. Report changed files, verification, and any deferred
identity or RBAC assumptions.
```
