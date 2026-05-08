# Feature Specification: Export Integrations

**Feature Branch**: `006-export-integrations`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase E from the 2nd phase roadmap  
**Depends On**: `004-persistence-mvp`, `005-ai-workflow-mvp`

## Goal

Turn local export previews into persisted export packages and add honest,
configuration-gated paths for Jira and GitHub exports.

## User Scenarios

1. As a PM, I can create an export package from approved stories and keep it in
   history.
2. As a PM, I can download Markdown, CSV, or JSON from a saved export package
   without rebuilding it from live UI state.
3. As a PM, I can see whether Jira export is configured, disabled, or failed
   before I try to push work out.
4. As a PM, I can see whether GitHub issue export is configured, disabled, or
   failed before I try to push work out.

## Requirements

- **FR-001**: Persist export packages and package items in the backend.
- **FR-002**: Generate Markdown, CSV, and JSON from persisted package data.
- **FR-003**: Render export history from API-backed package records.
- **FR-004**: Keep local copy/download actions available from persisted data.
- **FR-005**: Add Jira export behind explicit configuration and safe secret
  handling.
- **FR-006**: Add GitHub issue export behind explicit configuration and safe
  secret handling.
- **FR-007**: Record per-item success, failure, and remote URLs or issue keys
  when external export is configured.
- **FR-008**: Keep retry behavior idempotent where practical.
- **FR-009**: Show clear configured, unconfigured, disabled, loading, and
  error states in the UI.
- **FR-010**: Do not hardcode or log credentials, tokens, or repository
  secrets.
- **FR-011**: Do not implement collaboration, review, or auth scope here.

## Must Finish

- Persist export packages and package items.
- Render ExportsPage from API-backed history instead of mock-only state.
- Generate Markdown/CSV/JSON from persisted export records.
- Keep local download and copy actions working from persisted data.
- Add honest Jira/GitHub disabled and configured states.
- Record per-item outcomes for external exports when configured.

## May Defer

- Live Jira/GitHub export if credentials are absent.
- Bulk retry orchestration.
- Team permission controls.
- Rich export package editing after creation.

## Must Not Touch

- AI generation behavior except reading approved/generated stories.
- Developer review persistence except reading approved approval state.
- Full auth/RBAC.
- Unrelated app shell redesign.

## Failure Conditions

Executor must not report complete if:

- Export history still comes only from `mockExportPackages`.
- Export package downloads are generated from stale or unsaved UI state.
- Jira or GitHub controls pretend success when configuration is missing.
- Any token, secret, or repo credential is hardcoded or logged.
- Export item results are not traceable per story.

## Key Files

- `artifacts/specflow-ai/src/components/workspace/ExportPanel.tsx`
- `artifacts/specflow-ai/src/pages/ExportsPage.tsx`
- `artifacts/specflow-ai/src/pages/Dashboard.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/api-server/src/routes/export-packages.ts`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/persistence.ts`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/api.ts`
- `lib/api-client-react/src/generated/api.ts`
- `lib/db/src/schema/index.ts`

## Success Criteria

- **SC-001**: Export history is persisted and visible.
- **SC-002**: Downloaded files match the selected persisted stories.
- **SC-003**: Jira and GitHub disabled states are clear when not configured.
- **SC-004**: Successful external export records remote issue keys or URLs.
- **SC-005**: Failed item export preserves useful error details.

## Evidence Required

Executor must report:

1. Export schema and API routes added.
2. ExportPanel package creation verified.
3. ExportsPage history verified.
4. Download content verified against persisted data.
5. Jira/GitHub configured or disabled-state behavior.
6. Secret-handling notes and any intentional deferrals.

## Executor Handoff

```text
Execute spec 006-export-integrations. Read spec.md, plan.md, tasks.md, and the
constitution first. Read specs/004-persistence-mvp and specs/005-ai-workflow-mvp
outcomes first. Preserve unrelated changes. Implement persisted export package
history, local downloads, and honest Jira/GitHub integration states only.
Never hardcode secrets. Report changed files, verification, and any deferred
integration scope.
```
