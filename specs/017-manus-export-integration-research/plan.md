# Implementation Plan: Manus Export Integration Research

**Branch**: `017-manus-export-integration-research` | **Date**: 2026-05-15 | **Spec**: `specs/017-manus-export-integration-research/spec.md`

## Summary

Manus should research Jira and GitHub export mechanics before Codex turns the
results into product specs or implementation work.

## Technical Context

**Primary Input**: `docs/manus/project-brief.md`  
**Primary Output**: Markdown integration research report  
**Repo Edits**: None  
**Verification**: Source links for external API/product claims

## Execution Phases

### Phase 1: Context Load

- Read the project brief.
- Identify SpecFlow AI artifact types: PRD sections, epics, stories, acceptance
  criteria, labels, warnings, and export packages.

### Phase 2: Jira Research

- Research Jira Cloud issue creation behavior.
- Identify issue types, required fields, project keys, labels, acceptance
  criteria formatting, and common failures.

### Phase 3: GitHub Research

- Research GitHub issue creation behavior.
- Identify title/body/labels/assignees/milestones, API constraints, and common
  failures.

### Phase 4: Product Model

- Recommend field mappings.
- Recommend export preview, dry-run, audit, retry, and disconnect states.
- Identify auth and storage risks.

### Phase 5: Handoff

- Write product requirements Codex can use.
- Label unknowns.
- Include source links.

## Constraints

- Do not use real credentials.
- Do not test against production accounts.
- Do not assume integrations are already configured.

## Recommended Output File

`manus-export-integration-research.md`

