<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- Surgical Workflow -> Surgical Workflow
Added sections:
- Executor-Ready Spec Handoffs
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md: ok, generic Constitution Check remains valid
- .specify/templates/spec-template.md: ok, user scenarios and success criteria align
- .specify/templates/tasks-template.md: ok, phased task model aligns
Follow-up TODOs:
- None
-->

# SpecFlow AI Constitution

## Core Principles

### I. Simplicity and Maintainability

Code MUST prefer simple, organized, maintainable solutions over clever
abstractions. New abstractions, dependencies, and architectural patterns require
a clear payoff: reduced duplication, clearer boundaries, or materially lower
complexity. Plans MUST document any complexity that violates this principle and
name the simpler alternative considered.

### II. TypeScript and Schema Discipline

All new project code MUST use TypeScript when the package supports it. Code MUST
avoid `any`; use concrete types or `unknown` with narrowing. Existing
schema-layer contracts MUST be reused before defining local interfaces for the
same data. Important inputs crossing client, server, storage, or process
boundaries MUST be validated close to the trust boundary.

### III. Accessible Product Quality

User-facing work MUST include loading, empty, and error states where the flow can
enter those states. UI MUST prefer semantic HTML, keyboard-accessible controls,
visible focus behavior, meaningful labels, sufficient contrast, and user-friendly
error messages. React forms SHOULD be controlled unless an existing local pattern
or library contract makes uncontrolled inputs clearer.

### IV. Security and Trust Boundaries

Secrets MUST NOT be hardcoded. Auth, authorization, storage, network calls, and
generated content handling MUST be reviewed for injection, XSS, secret leakage,
and broken trust-boundary assumptions. Server-side and client-side validation
MUST both be considered when user input affects persisted data, API behavior, or
rendered output.

### V. Surgical Workflow

Changes MUST stay scoped to the requested feature or fix. Do not refactor,
reformat, or clean adjacent code unless required to complete the work safely.
Generated plans and tasks MUST reference real repository files and commands,
preserve existing workspace structure, and use `pnpm` for package commands.
Tests, lint, and type checks are not run by default; run them only when requested
or when needed to diagnose a failure. Each implementation spec MUST be executable
by an AI agent from the spec folder alone, without requiring hidden chat context.

## Workspace Standards

SpecFlow AI is a pnpm workspace with Vite and TypeScript packages. Future specs
and plans MUST preserve the existing package layout unless they explicitly
justify a structural change. New dependencies MUST be added to the smallest
package scope that needs them. Production paths MUST NOT keep debugging
`console.log` calls, unused imports, unused variables, or dead code introduced by
the change.

## Development Workflow

Specifications MUST describe user value, scenarios, edge cases, and measurable
success criteria before implementation details. Plans MUST identify the real
workspace package or file areas affected, the validation approach, and any
constitution risks. Tasks MUST be independently executable where practical,
ordered by user-story value, and explicit about file paths.

## Executor-Ready Spec Handoffs

Every implementation-ready Spec Kit feature MUST include enough context for a
separate executor to run from a prompt such as "execute spec-00X and report the
outcome." At minimum, the spec folder MUST include:

- `spec.md` with user value, scope, acceptance scenarios, edge cases, and
  non-goals.
- `plan.md` with real file/package boundaries, architecture decisions,
  sequencing, and validation expectations.
- `tasks.md` with ordered, checkable tasks grouped by independently useful
  slices.
- An "Executor Handoff" section naming the exact files to read first, files
  likely to change, allowed commands, reporting expectations, and preservation
  rules.

Specs MUST call out dependencies on prior specs and MUST avoid requiring future
agents to infer product intent from chat history. Cross-spec work MUST be split
so each spec has a bounded outcome and can be reviewed independently.

## Governance

This constitution is the controlling project guidance for Spec Kit specs, plans,
and tasks. Future amendments MUST update this file, include a Sync Impact Report,
and use semantic versioning:

- MAJOR: Backward-incompatible principle or governance change.
- MINOR: New principle, section, or materially expanded guidance.
- PATCH: Clarification, typo fix, or non-semantic wording update.

All future `/speckit.*` work MUST check compliance during planning and again
before implementation. Any justified violation MUST be documented in the plan's
Complexity Tracking section with the simpler alternative rejected.

**Version**: 1.1.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
