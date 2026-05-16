# Quickstart: Workflow AI Loading And Guidance Refactor

## Read First

1. `spec.md`
2. `plan.md`
3. `research.md`
4. `review.md`
5. `testing.md`
6. `tasks.md`

## Goal

Refactor the workflow AI experience from the source. Keep it simple. Remove
duplicate busy signals. Stop guidance churn. Prove it in the browser.

## Implementation Loop

1. Map current state ownership.
2. Decide the single busy source.
3. Define guidance snapshot inputs.
4. Remove stacked loading surfaces.
5. Add cache or dedupe for guidance.
6. Retest in the built-in browser on local host.
7. Review for dead code and misleading UI.

## Success Signal

The app should feel calmer:

- one generation path
- one guidance contract
- one loading story per region
- no noisy sidebar
- no repeated request burst on typing

## Hand Off To Executor

If execution is approved, the next step is code changes inside the workflow
workspace, store, and guidance surfaces, followed by browser retest on
`http://localhost:8080/app`.
