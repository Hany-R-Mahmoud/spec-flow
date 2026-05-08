# Implementation Plan: Export Integrations

## Summary

Persist export packages as first-class records, then layer local downloads and
configuration-gated Jira/GitHub export paths on top of those records.

## Architecture Decisions

1. Export packages and export items are persisted backend records.
2. The API server owns export generation and external integration calls.
3. Credentials must come from environment or secret-management patterns only.
4. Local download and copy flows must continue to work without external
   credentials.
5. External export item results should be stored per story so failures are
   inspectable.

## Sequence

1. Model export package and export item persistence.
2. Expand OpenAPI and generated client contracts for export package APIs.
3. Wire ExportPanel to create persisted packages from approved stories.
4. Wire ExportsPage to API-backed package history.
5. Keep Markdown, CSV, and JSON downloads based on persisted records.
6. Add Jira configuration detection, disabled state, and export path.
7. Add GitHub configuration detection, disabled state, and export path.
8. Record per-item result metadata and remote links or issue keys.

## Validation

- Create an export package from persisted stories.
- Refresh and confirm package history remains visible.
- Download Markdown, CSV, and JSON from a saved package and confirm the
  content matches the persisted story set.
- Confirm Jira and GitHub controls are honest when configuration is missing.
- If credentials are configured, export at least one item and confirm the
  stored remote result metadata.

## Constitution Check

- Security: no hardcoded secrets, no secret logging, no trust in client-only
  config.
- TypeScript/schema: use shared contracts and generated API types.
- Accessibility: loading/error/disabled states must remain readable.
- Surgical: do not expand into review/comment/history features.
