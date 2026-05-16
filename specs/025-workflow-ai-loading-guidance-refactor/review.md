# Review Rubric: Workflow AI Loading And Guidance Refactor

## Review Goal

Check that the refactor solved the source problem, not just the visual symptom.

## Review Questions

1. Is there one authoritative source for in-flight generation state?
2. Does guidance depend on stable snapshot inputs instead of live draft churn?
3. Does one user action produce one intentional AI request path, not a burst?
4. Do loading states appear once per region, not as stacked duplicates?
5. Does the sidebar still feel like support, not a second workflow lane?
6. Does the top banner say something true and useful?
7. Is manual mode honest?
8. Did the refactor avoid over-engineering?

## Review Checklist

- [ ] Split state removed or demoted.
- [ ] Guidance effect no longer depends on live typing noise.
- [ ] Guidance cache or dedupe exists.
- [ ] Stale guidance requests can be aborted.
- [ ] Redundant loading chrome reduced.
- [ ] Top banner semantics fixed.
- [ ] No dead or misleading UI remains in the active flow.
- [ ] No unrelated workflow behavior regressed.

## Review Failures

The refactor should be rejected if:

- page state and store state still both decide AI busy state
- guidance still refires on each draft keystroke
- the same busy event is still rendered in multiple surfaces
- sidebar still behaves like a second generation lane
- top banner still implies loading from object existence alone

## Review Output

Review should report:

1. the final state ownership model
2. the guidance input hash or snapshot rule
3. which loading surfaces stayed
4. which loading surfaces were removed
5. whether the code is simpler than before

