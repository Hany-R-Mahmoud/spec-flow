# Feature Specification: Export Integrations

**Feature Branch**: `005-export-integrations`  
**Created**: 2026-05-05  
**Status**: Draft  
**Phase**: Phase E from the 2nd phase roadmap

## Goal

Turn local export previews into persisted export packages and first real
integration paths for Jira and GitHub issues.

## User Scenarios

1. As a PM, I can create an export package from approved stories.
2. As a PM, I can download Markdown/CSV/JSON from saved package history.
3. As a PM, I can send stories to Jira when credentials are configured.
4. As a PM, I can send stories to GitHub issues when a repo is configured.

## Requirements

- **FR-001**: Persist export packages and package items.
- **FR-002**: Generate Markdown/CSV/JSON from saved stories.
- **FR-003**: Add Jira export integration behind explicit configuration.
- **FR-004**: Add GitHub issue export integration behind explicit
  configuration.
- **FR-005**: Do not hardcode credentials or tokens.
- **FR-006**: Show per-item export result and errors.
- **FR-007**: Keep retries idempotent where practical.
- **FR-008**: Keep existing local copy/download functionality.
- **FR-009**: Do not implement team roles or collaboration features here.

## Success Criteria

- **SC-001**: Export history is persisted and visible.
- **SC-002**: Downloaded files match selected stories.
- **SC-003**: Jira/GitHub disabled states are clear when not configured.
- **SC-004**: Successful external export records remote issue keys/URLs.
- **SC-005**: Failed item export preserves useful error details.

## Executor Handoff

```text
Execute spec 005-export-integrations. Read spec.md, plan.md, tasks.md,
constitution, and prior persistence/AI specs. Implement persisted exports and
configured Jira/GitHub paths only. Never hardcode secrets.
```
