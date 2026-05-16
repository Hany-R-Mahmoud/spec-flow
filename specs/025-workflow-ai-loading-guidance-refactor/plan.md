# Implementation Plan: Workflow AI Loading And Guidance Refactor

## Summary

Refactor the workflow AI path so generation, guidance, and loading each have a
clean boundary. The goal is simpler code, fewer requests, and fewer confusing
surfaces.

## Technical Context

**Language/Version**: TypeScript, React 19, Vite  
**Primary Dependencies**: existing session store, api client, current workflow
panels, API route for guidance and generation  
**Storage**: existing API-backed session persistence  
**Testing**: focused browser retest on local host, targeted checks only when
needed  
**Target Platform**: local Vite app + api server  
**Scope**: workflow workspace, guidance, loading UI, store coordination  

## Constitution Check

- Simplicity and Maintainability: PASS. Source refactor beats layered fixes.
- TypeScript and Schema Discipline: PASS. Keep contracts explicit.
- Accessible Product Quality: PASS. Reduce noise and duplicate loading.
- Security: PASS with caution. Guidance/provider paths cross trust boundary.
- Surgical Workflow: PASS. Stay inside workflow and guidance surfaces.

## Architecture Decisions

### AD-001: One generation authority

Pick one authoritative source for in-flight generation state. Do not let page
local state and store state both decide whether AI is running.

### AD-002: Guidance is snapshot-driven

Guidance should use a stable snapshot contract instead of live draft state.
Fresh guidance comes from meaningful workflow change or explicit user action.

### AD-003: Loading is region-specific

Each region may have one primary loading surface. Do not repeat the same busy
state as button spinner, inline banner, action-chip, and sidebar loader at the
same time.

### AD-004: Sidebar supports, it does not orchestrate

Sidebar guidance should be passive by default. If it stays AI-backed, it must
be explicit, sparse, and cacheable.

### AD-005: Top banner is metadata, not fake loading chrome

If the top banner cannot add truth, remove or downgrade it. Do not keep a
permanent-looking banner that implies work when the work is elsewhere.

### AD-006: Browser retest is mandatory

The refactor is not done until the built-in browser on local host proves the
duplicate-loading pattern is gone.

## Execution Phases

### Phase 1: Contract Cleanup

- Identify the single source of truth for generation state.
- Define the new guidance snapshot contract.
- Decide which loading surfaces remain.
- Output: final behavior matrix.

### Phase 2: State Refactor

- Remove or demote duplicate local busy state.
- Adjust store/page wiring so one source decides busy state.
- Output: simplified generation state flow.

### Phase 3: Guidance Refactor

- Replace live-draft dependency with a stable snapshot.
- Add caching or snapshot dedupe.
- Add abort handling for stale guidance work.
- Output: lower request fan-out and calmer sidebar.

### Phase 4: UI Simplification

- Reduce loading surfaces per region.
- Fix banner semantics.
- Make sidebar support honest and minimal.
- Output: cleaner in-flow presentation.

### Phase 5: Validation

- Retest in the built-in browser on local host.
- Confirm no duplicate loading surfaces.
- Confirm no guidance spam from typing.
- Confirm one generate action stays one generate action.

## Validation Strategy

1. Open a fresh session in the local app.
2. Move through at least one generation phase.
3. Watch network and UI behavior during one generation.
4. Type in clarification or PRD drafts.
5. Confirm guidance does not refetch on every keystroke.
6. Confirm loading appears once per region, not stacked.
7. Refresh and confirm state still resolves correctly.

## Risks

- Guidance may lose some “smartness” if the snapshot is too small.
- Over-caching could hide meaningful phase changes if the hash is too coarse.
- Removing loading surfaces too aggressively could make the UI feel silent.

## Recommended Next Agent

- `agent-implementer` for the source refactor
- `agent-tester` for browser retest and regression proof
- `agent-reviewer` for trust-boundary and dead-surface review
