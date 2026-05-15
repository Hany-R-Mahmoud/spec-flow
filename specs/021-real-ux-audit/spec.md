# Feature Specification: Real UX Audit

**Feature Branch**: `021-real-ux-audit`  
**Created**: 2026-05-15  
**Status**: Draft  
**Source**: `docs/manus/reports/synthesis.md`

## Goal

Replace the stale Manus preview-page UX teardown with a real audit against the
actual SpecFlow AI app.

## Requirements

- **FR-001**: Audit the correct app target: local dev URL or verified production
  URL.
- **FR-002**: Cover dashboard, projects, new breakdown, workflow workspace,
  reviews, exports, and settings.
- **FR-003**: Check keyboard access, focus states, semantic structure, contrast,
  empty states, loading states, and error states.
- **FR-004**: Ignore stale Manus claims about missing dashboard, project
  creation, workflow, export, and settings pages.
- **FR-005**: Findings must include page, reproduction steps, severity, and
  recommended fix.

## Success Criteria

- UX findings describe the real app, not a Manus preview artifact.
- Accessibility issues become traceable implementation tasks.
