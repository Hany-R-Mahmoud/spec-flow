# Feature Specification: Adaptive Intake And Step Skills

**Feature Branch**: `023-adaptive-intake-and-step-skills`  
**Created**: 2026-05-15  
**Status**: Draft  
**Source**: user feature ideas, `StartupKit.zip`, current SpecFlow phases

## Goal

Let users enter SpecFlow with complete or incomplete existing content instead
of always starting from scratch, then route that content through only the
workflow steps still needed. Add editable step skills that define behavior,
guidance, and output expectations for each workflow phase.

## Product Model

Current phases stay canonical:

- clarification
- prd
- epics
- stories
- quality
- export

New capability sits on top:

1. Intake analyzes pasted/imported content.
2. System detects which phase artifacts already exist.
3. System marks completed phases as reusable, incomplete phases as needs work,
   and missing phases as generate.
4. Step skills guide how each phase behaves.

## Requirements

- **FR-001**: User can add existing content as raw text, markdown, or structured
  sections when creating or updating a session.
- **FR-002**: Intake must classify content into known artifacts: clarification
  answers, PRD sections, epics, stories, quality notes, export metadata, and
  unknown/extra context.
- **FR-003**: System must recommend the next needed phase instead of forcing
  users to restart at clarification.
- **FR-004**: If a phase artifact is complete enough, user can keep it and skip
  regeneration.
- **FR-005**: If a phase artifact is incomplete, user can continue from that
  phase with gaps highlighted.
- **FR-006**: Existing content must never be silently overwritten by generation.
- **FR-007**: Every phase has a default editable step skill with purpose,
  inputs, process rules, output contract, quality checks, and examples.
- **FR-008**: User can create, edit, duplicate, reset, and assign custom skills
  per phase.
- **FR-009**: Generation must record which skill version shaped each artifact.
- **FR-010**: Skills must support template variables for project context,
  existing artifacts, user answers, team settings, and export target.
- **FR-011**: Invalid or unsafe skill instructions must be rejected or shown as
  warnings before use.

## StartupKit Lessons To Reuse

- One skill per phase.
- Each skill owns its output contract.
- Session state is machine-readable.
- Phase completion is explicit.
- Templates are editable but resettable.
- Heavy phases can support modes like `quick`, `standard`, and `deep`.

## Step Skill Shape

```yaml
id: prd-default
phase: prd
name: PRD Builder
version: 1
mode: standard
inputs:
  - roughInput
  - clarificationAnswers
  - existingPrdSections
processRules:
  - preserve user-provided decisions unless contradicted
  - mark unknown facts as Unknown / verify
outputContract:
  - overview
  - users
  - userJourneys
  - requirements
  - successCriteria
qualityChecks:
  - missing user
  - missing success metric
  - unclear scope
```

## Open Product Questions

- Should imported content create a new session, update the active session, or
  support both?
- Should step skills be workspace-wide, project-level, or session-level?
- Should skills be plain Markdown like `SKILL.md`, structured YAML+Markdown, or
  stored as rich editable forms?
- Should users be allowed to share skills across workspaces?

## MVP Boundary

MVP should include:

- paste/import existing content
- classify artifacts
- skip/reuse/generate recommendations
- default skills for current six phases
- edit/reset skill text
- record skill version used

Defer:

- marketplace/shared skill library
- automated skill testing
- cross-project knowledge graph
- public skill sharing
- multi-agent execution

## Success Criteria

- User can paste a half-written PRD and continue from epics/stories without
  repeating clarification.
- User can paste existing stories and run only quality/export readiness.
- User can edit the stories phase skill and see future generation use that
  version.
- Generated artifacts cite the skill version used.
- Missing or uncertain content is marked `Unknown / verify`.
