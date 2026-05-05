# Open Design Sandbox Comparison

**Skills referenced**:

- `.local/skills/open-design-dashboard/SKILL.md`
- `.local/skills/open-design-web-prototype/SKILL.md`
- `.local/skills/open-design-critique/SKILL.md`

## Attempt 1 - Dashboard / Precision Ops

Artifact:

- `open-design/dashboard-precision-ops.html`

Fit:

- Strongest match to Open Design dashboard skill.
- Keeps left sidebar, topbar, KPI cards, and table.
- Uses design-system tokens rather than inventing new palette.

Export quality:

- High for HTML reference.
- Not production React code.
- Good for visual target and interaction intent.

Setup friction:

- Low. Self-contained HTML.

## Attempt 2 - Web Prototype / SaaS Landing

Decision:

- Rejected for current implementation pass.

Reason:

- The user explicitly wants to refine a SaaS workflow tool, not create a
  marketing landing page.
- Landing prototypes risk hero sections, value-prop copy, decorative sections,
  and IA drift.

Use later:

- Could support public website/onboarding after product core is real.

## Attempt 3 - Critique Mode

Input:

- Existing OpenCode critique and Huashu 5D critique.

Value:

- Confirms accessibility is the first high-severity issue.
- Confirms implementation feasibility is high for the first polish slice.

## Open Design Recommendation

Use Open Design dashboard output as a **visual reference only** for app shell,
command trigger, KPI cards, and table structure. Do not copy as production HTML.

Best implementation target:

- `002-ui-polish-foundation`

Do not use Open Design landing/mobile variants for this round.
