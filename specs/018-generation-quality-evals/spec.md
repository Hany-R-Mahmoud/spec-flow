# Feature Specification: Generation Quality Evals

**Feature Branch**: `018-generation-quality-evals`  
**Created**: 2026-05-15  
**Status**: Draft  
**Source**: `docs/manus/reports/synthesis.md`, `docs/manus/reports/action-matrix.md`

## Goal

Turn the Manus workflow fixture benchmark into durable SpecFlow evaluation
material so future prompt, phase-skill, and workflow changes can be judged
against consistent examples.

## Requirements

- **FR-001**: Preserve the ten accepted product scenarios as fixture references.
- **FR-002**: Use the weighted rubric: clarification 15%, PRD 20%, epics 15%,
  stories 20%, warnings 15%, export readiness 10%, completeness 5%.
- **FR-003**: Start with manual scoring before building automated evals.
- **FR-004**: Every eval run must record input, generated artifacts, scores,
  failures, and recommended fixes.
- **FR-005**: Failed fixtures must map to one of: phase skill change, prompt
  change, UI routing issue, or data model gap.

## Initial Artifacts

- `docs/evals/generation/fixtures.md`
- `docs/evals/generation/rubric.md`

## Success Criteria

- A reviewer can run a generation fixture without reading raw Manus reports.
- Scores are comparable across runs.
- Future workflow changes can cite affected fixture IDs.
