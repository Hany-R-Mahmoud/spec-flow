# Testing Plan: Workflow AI Loading And Guidance Refactor

## Goal

Prove the refactor in the local app, especially in the built-in browser, and
confirm the duplicate-loading and guidance-spam problems are gone.

## Required Browser Retest

Use the built-in browser on local host, not just code inspection.

### Retest Steps

1. Open `http://localhost:8080/app`.
2. Start from a fresh workspace or the first reachable workflow step.
3. Move into a generation-capable phase.
4. Trigger one generation action.
5. Watch for:
   - button spinner
   - inline status text
   - top banner
   - sidebar loading
6. Confirm only the intended surfaces appear.
7. Type in clarification or PRD drafts.
8. Confirm guidance does not refetch on every keystroke.
9. Move to the next phase and confirm the flow stays stable.
10. Refresh the page.
11. Confirm persisted state and phase state still resolve correctly.

## What To Observe

- one action, one request path
- no repeated guidance churn from typing
- no duplicate loading chip plus spinner plus banner trio
- sidebar support should feel passive, not noisy
- manual mode should still explain itself clearly

## Debug Signals

Capture if possible:

- browser console errors
- network request count for generation and guidance
- any unexpected rerenders or loader flashes

## Pass Criteria

- generation stays readable and calm
- guidance is not spammed by draft edits
- loading is not repeated across multiple surfaces
- refresh does not break the workflow
- manual mode remains honest

## Fail Criteria

Retest fails if:

- typing causes guidance to refetch repeatedly
- one generation action still lights up several redundant loaders
- sidebar still feels like a second generation lane
- the top banner still acts like loading chrome
- refresh loses the visible workflow state

## Test Notes

- Keep this focused. No broad suite needed unless the code changes demand it.
- Browser proof matters more than pure static review for this refactor.
- If local host browser access is blocked, document the blocker and the exact
  fallback proof used instead.

