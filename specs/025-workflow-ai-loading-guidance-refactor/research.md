# Research: Workflow AI Loading And Guidance Refactor

## Summary

This research captures the user-facing problems, the source-level causes, and
the refactor direction. It is the reasoning layer behind the spec packet.

## Confirmed Findings

### 1. Busy state is split

- `WorkflowWorkspace` owns `pendingGenerationStep`.
- `SessionProvider` owns persisted `generation.status`.
- Panel loading derives from both.

Impact:

- one action can appear busy in multiple places
- local state and persisted state can disagree
- flow is harder to reason about and test

### 2. Guidance is too eager

- guidance runs from a workspace effect
- the effect depends on live draft arrays
- draft updates happen on every form change
- server guidance route always calls the provider when AI exists

Impact:

- repeated provider spend
- spiky UI updates
- user editing can accidentally become agent load

### 3. Sidebar is overloaded

- phase summary
- phase status
- readiness
- AI guidance
- loading state

Impact:

- sidebar feels like a second workflow lane
- users cannot tell whether it is supporting or orchestrating

### 4. Banner semantics are wrong

- the top banner renders from generation object presence
- it should render from actual active generation or be passive metadata

Impact:

- banner looks like loading chrome even when nothing is running

## Suggestions

### A. Make generation state singular

Use one authoritative source for in-flight generation. Prefer the persisted
generation state in the store. Only keep local state if it is purely cosmetic
and never used to decide behavior.

### B. Make guidance snapshot-based

Build a stable input snapshot from session fields that actually matter.
Examples:

- session id
- active phase
- persisted draft snapshot
- step skill versions
- provider capability mode

Cache or skip identical snapshots. Abort stale in-flight work.

### C. Make loading honest and minimal

Keep one visible loading surface per region.

Suggested split:

- primary action buttons show busy/disabled state
- step panel shows a short status line if needed
- sidebar shows support status only when guidance is explicitly loading
- top banner becomes metadata or goes away

### D. Make sidebar passive by default

The sidebar should support the current phase, not try to run the phase.

Good sidebar jobs:

- summarize current state
- show phase readiness
- show manual-mode truth
- expose an explicit refresh action for guidance

Bad sidebar jobs:

- refetching guidance on every live edit
- mirroring every other loading indicator
- pretending to be the main command surface

### E. Retest in browser, not only in code

After refactor, verify in the built-in browser on local host:

- open a fresh session
- move one phase at a time
- trigger one generation action
- type in draft fields
- confirm no extra guidance spam
- confirm no duplicate loaders

## Root Cause Map

| Symptom | Cause |
|---|---|
| Multiple loaders at once | same busy event mapped into several components |
| Sidebar loading during main generation | sidebar reuses generation status |
| Guidance spam on typing | live draft arrays feed workspace effect |
| Extra AI calls on phase change | effect dependencies are too broad |
| Banner always visible | banner uses object presence instead of active status |

## Refactor Principle

Do not patch the symptoms first. Fix the contract first:

1. what is the active workflow state?
2. what is guidance?
3. what is loading?
4. who owns each truth?

