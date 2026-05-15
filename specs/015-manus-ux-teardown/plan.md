# Implementation Plan: Manus UX Teardown

**Branch**: `015-manus-ux-teardown` | **Date**: 2026-05-15 | **Spec**: `specs/015-manus-ux-teardown/spec.md`

## Summary

Manus should behave like a product-minded UX reviewer and return evidence,
priorities, and actionable fixes.

## Technical Context

**Primary Input**: `docs/manus/project-brief.md`  
**Primary Output**: Markdown UX teardown report  
**Target**: Live app or user-provided local URL  
**Repo Edits**: None  
**Verification**: Reproduction steps and screenshots/visual evidence

## Execution Phases

### Phase 1: Setup

- Load project brief.
- Record tested URL, browser, auth limitations, and data limitations.
- Define user journeys to inspect.

### Phase 2: Journey Review

- Inspect landing and app shell.
- Inspect dashboard/projects.
- Inspect workflow workspace.
- Inspect review and export surfaces.
- Inspect settings.

### Phase 3: Accessibility and Trust Review

- Review keyboard/focus/semantics/contrast/labels.
- Find fake, partial, or misleading controls.
- Identify state persistence confusion or unclear feedback.

### Phase 4: Prioritization

- Rank findings P0 through P3.
- Separate quick wins from deeper product changes.
- Provide Codex-ready handoff.

## Constraints

- Do not use private production data.
- Do not change settings or integrations.
- Do not submit destructive actions.

## Recommended Output File

`manus-ux-teardown.md`

