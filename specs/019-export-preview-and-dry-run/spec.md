# Feature Specification: Export Preview And Dry Run

**Feature Branch**: `019-export-preview-and-dry-run`  
**Created**: 2026-05-15  
**Status**: Draft  
**Source**: `docs/manus/reports/raw/export-integration-research.md`

## Goal

Make exports trustworthy before external issue creation by adding preview,
dry-run validation, explicit field mapping, partial-success handling, retry,
and audit/history behavior.

## Requirements

- **FR-001**: Export flow must show a preview of items, target, mapped fields,
  labels, issue type, and warnings before creating external issues.
- **FR-002**: Dry run must validate configuration, workspace boundary, target
  access, required fields, and obvious mapping errors without creating issues.
- **FR-003**: Jira and GitHub mapping must be explicit and reviewable.
- **FR-004**: Partial success must record created links, failed items, retryable
  errors, and non-retryable errors.
- **FR-005**: Retry must avoid duplicating already-created external issues.
- **FR-006**: Export history must include who exported, when, target, status,
  created links, and errors.
- **FR-007**: Credential storage, OAuth/PAT scope validation, and workspace
  boundary enforcement require separate security design before implementation.

## Success Criteria

- User can understand exactly what will be exported before creation.
- Failed exports are recoverable without manual reconstruction.
- No credential behavior is improvised during implementation.
