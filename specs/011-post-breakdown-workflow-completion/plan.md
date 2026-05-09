# Implementation Plan: Post-Breakdown Workflow Completion

**Branch**: `011-post-breakdown-workflow-completion` | **Date**: 2026-05-09 | **Spec**: `specs/011-post-breakdown-workflow-completion/spec.md`

## Summary

Turn the post-breakdown workflow into a fully functional product path.
The goal is not a cosmetic cleanup. The goal is to remove every dummy,
partial, or misleading action after `Create Breakdown` and replace it with a
real command, real persistence, or an honest removal from the UI.

```text
User action -> real command -> persisted workflow state or real artifact ->
refresh-safe UI
```

The workflow must stop pretending. If a control is visible, it must either do
real work or tell the truth by not being interactive.

## Technical Context

**Language/Version**: TypeScript, React 19, Vite  
**Primary Dependencies**: React Hook Form, session store, existing API client,
current shadcn-style UI primitives  
**Storage**: Existing API-backed persistence; extend only if a real action
needs more state  
**Testing**: Do not run broad suites by default. Use targeted browser or
typecheck checks only when needed to prove the no-dummy boundary  
**Target Platform**: Local Vite app with the existing api-server  
**Project Type**: pnpm monorepo with workflow UI and backend persistence  
**Performance Goals**: Preserve current responsiveness while removing fake
interactions  
**Constraints**: No visible no-op controls, no local-only phase illusion, no
toast-only exports, no coming-soon CTAs in the active flow  
**Scale/Scope**: Workflow workspace, guidance, review, export, Jira connect,
and the store paths they depend on

## Constitution Check

- Simplicity and Maintainability: PASS. Real command paths are easier to reason
  about than pseudo-actions.
- TypeScript and Schema Discipline: PASS. Prefer existing types and explicit
  contracts for actions and persisted state.
- Accessible Product Quality: PASS. Real buttons remain real buttons; fake
  buttons get removed.
- Security and Trust Boundaries: PASS, with caution. Jira connect may involve
  credentials or tokens, so auth handling must stay explicit.
- Surgical Workflow: PASS. Scope stays inside the active workflow path and the
  small set of backend calls it needs.

## Architecture Decisions

### AD-001: Phase tracker must become persisted workflow state

Phase clicks cannot remain local-only view switches. The phase model must
update the real session state so the visible workflow survives refresh and
matches the dashboard.

### AD-002: Guidance items must be real commands or plain text

`GuidancePanel` already accepts callbacks. The parent must either provide real
handlers or stop rendering fake action buttons.

### AD-003: Bulk review handoffs must update story state

Bulk actions like `Send All to Dev Review` must touch the underlying stories,
not just the visible phase label.

### AD-004: Split Story must produce persisted output

If Split Story stays in the product, it must create a real persisted result and
update downstream counts, badges, and queues.

### AD-005: Jira connect must be a real state machine

The export path should show disconnected, connecting, connected, and failed
states. A disabled `Coming Soon` button is not acceptable in the active flow.

### AD-006: Export history must return real artifacts

If export history exists, downloads must fetch or regenerate a real artifact.
Toast-only feedback is not enough.

### AD-007: Dead props and dead handlers should be removed

Unused command props are misleading. If a prop has no real use, delete it.
If the action is real, wire it to a real command path.

## Execution Phases

### Phase 1: Surface Inventory and Behavior Matrix

- Inventory every clickable control after `Create Breakdown`.
- Classify each control as real, partial, dummy, or dead.
- Confirm the command path, persisted state, and failure behavior for each one.
- Output: action matrix and final scope list.

### Phase 2: Contract Design

- Define the real workflow-state model for phase tracking.
- Define the command contract for guidance actions.
- Define the split-story contract.
- Define the Jira connection/export contract.
- Define the review-completion gate rules.
- Output: implementation contract for all interactive surfaces.

### Phase 3: Phase and Guidance Wiring

- Make phase clicks persist real state.
- Wire guidance actions to real commands or replace them with read-only text.
- Remove dead props and dead callbacks that only create confusion.
- Output: phase and guidance surfaces that no longer fake behavior.

### Phase 4: Review and Split Workflows

- Implement the real `Split Story` flow.
- Make `Send All to Dev Review` update actual story-level review state.
- Make `Complete Review` validate the remaining review work before export.
- Output: review surfaces that reflect real workflow state.

### Phase 5: Jira and Export Completion

- Replace the Jira coming-soon placeholder with a real connection state.
- Wire export history to real file or artifact retrieval.
- Ensure export actions have real results, not toast-only acknowledgements.
- Output: functional export path and honest connection state.

### Phase 6: Cleanup

- Remove old dead branches, unused props, and misleading CTA labels.
- Keep only real commands in the active workflow path.
- Output: cleaner code with fewer places to drift back into partial behavior.

### Phase 7: Validation

- Prove phase state survives refresh.
- Prove every visible action does something real or is not rendered.
- Prove split, review, Jira, and export actions all produce real outcomes.
- Prove no dummy or partial label remains in the active flow.

## Validation Strategy

1. Browser proof:
   - Open a fresh breakdown.
   - Move through the workflow.
   - Click every active control in the post-breakdown path.
2. Persistence proof:
   - Change phase, refresh, and confirm the same phase returns.
3. Guidance proof:
   - Click each guidance action and confirm a real navigation, state change,
     generation, or explicit disabled truth.
4. Review proof:
   - Trigger bulk review handoff and dev review completion.
   - Confirm story-level state changes persist.
5. Export proof:
   - Connect Jira or hit the real connection state.
   - Download or sync export artifacts and confirm the result is not a toast
     only.

## Complexity Tracking

| Gap | Why it must change | Simpler option rejected because |
|---|---|---|
| Phase tracker persistence | Local-only phase state creates drift | Keeping it view-only leaves refresh mismatch |
| Guidance command wiring | Fake buttons break trust | Hiding the controls is better than dead UI |
| Split Story | Dead control is misleading | A disabled button still implies missing work |
| Jira connection | Placeholder blocks product completion | Coming soon is not functional |
| Export history | Toast-only download is not an export | Fake success is worse than no action |

## Risks

- Jira integration may need auth or connector work beyond the current UI.
- Split Story may need a backend contract for child stories or replacement
  workflow state.
- Bulk review and completion rules can become ambiguous unless the gating
  contract is explicit.
- Removing dead UI may expose missing backend behavior earlier, which is good
  but may require coordinated cleanup.

## Recommended Next Agent

- `agent-implementer` for the code changes
- `agent-tester` for browser and persistence proof
- `agent-reviewer` for dead-code and behavior audit
