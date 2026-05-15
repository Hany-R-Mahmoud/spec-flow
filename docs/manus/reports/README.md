# Manus Reports

This folder stores Manus AI outputs and Codex synthesis.

## Files

- `raw/`: original Manus markdown exports, copied without edits
- `synthesis.md`: Codex summary, validation notes, and recommended processing
- `action-matrix.md`: decision board for turning Manus findings into specs,
  backlog items, docs, or rejected/stale items

## Processing Rule

Do not implement directly from raw Manus reports. First classify each finding:

- `Accept`: useful and consistent with current repo/product direction
- `Needs verification`: plausible, but must be checked against current app,
  source docs, or live behavior
- `Reject / stale`: conflicts with current repo or was based on wrong target
- `Future idea`: useful later, but too broad or not current priority

Accepted findings should become a spec-kit spec, project documentation, a
fixture file, or a tightly scoped implementation task.

