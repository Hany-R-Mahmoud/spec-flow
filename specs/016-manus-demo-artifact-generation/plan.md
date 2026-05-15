# Implementation Plan: Manus Demo Artifact Generation

**Branch**: `016-manus-demo-artifact-generation` | **Date**: 2026-05-15 | **Spec**: `specs/016-manus-demo-artifact-generation/spec.md`

## Summary

Manus should create truthful, reusable demo material for SpecFlow AI. The work
is content generation, not product implementation.

## Technical Context

**Primary Input**: `docs/manus/project-brief.md`  
**Primary Output**: Markdown artifact pack  
**Repo Edits**: None  
**Verification**: Claims must match project brief or be labeled
`Unknown / verify`

## Execution Phases

### Phase 1: Narrative

- Identify the clearest product story.
- Define target demo audiences.
- Decide which workflow stages matter most in the demo.

### Phase 2: Scenario Creation

- Create three realistic demo scenarios.
- Include rough input, expected transformation, and resulting artifacts.

### Phase 3: Artifact Writing

- Write demo script.
- Write deck outline and speaker notes.
- Write launch copy variants and FAQ.
- Write before/after examples.

### Phase 4: Handoff

- Flag assumptions and unsupported claims.
- Provide Codex-ready recommendations for docs, slides, or app copy.

## Constraints

- Keep claims truthful.
- Avoid fake customers, metrics, or testimonials.
- Avoid implying integrations are production-ready unless verified.

## Recommended Output File

`manus-demo-artifact-pack.md`

