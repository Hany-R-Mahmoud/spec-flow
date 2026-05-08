# Open Design Prompt: Dashboard Prototype

Use the tracked `DESIGN.md` from this redesign phase as the source of truth.

Goal:
- Generate a high-fidelity desktop dashboard prototype for SpecFlow AI.
- Keep the Precision Ops direction.
- Focus on workflow management, not marketing.

Use this product context:
- SpecFlow AI is a spec-driven SaaS workflow tool.
- Core surfaces: dashboard, projects, workflow workspace, reviews, exports, settings.
- The product already has a working shell, real routes, persistence, AI workflow generation, and export/review surfaces.
- The dashboard should emphasize active sessions, readiness, review queue, and export state.

Design constraints:
- Calm, precise, premium dev-tool feel.
- White / pale gray shell.
- Blue primary action and active navigation accent.
- Teal for sync/export readiness.
- Violet only for future agent handoff concepts.
- Compact but readable KPI cards and tables.
- Strong app-shell separation.
- Accessible command/search trigger.
- No marketing-page styling.
- No fake controls.
- No flashy motion.

Use these input files:
- `specs/001-ui-ux-polish-workflow/design-lab/redesign-phase/DESIGN.md`
- `specs/001-ui-ux-polish-workflow/design-lab/decision-report.md`
- `specs/001-ui-ux-polish-workflow/design-lab/design-system/MASTER.md`
- `specs/001-ui-ux-polish-workflow/design-lab/design-system/pages/dashboard.md`
- `specs/001-ui-ux-polish-workflow/design-lab/critique-001-current-dashboard.md`

If the app asks for a skill, use the dashboard or web-prototype skill path. If it lets you choose a skill prompt, prefer a dashboard/tool UI skill, not a landing-page skill.

What to generate:
- App shell with sidebar, topbar, command/search trigger.
- KPI row for active sessions, readiness, review queue, exports.
- Active sessions table with dense but readable rows.
- Review queue and export readiness states.
- Clear empty states where relevant.
- Accessibility-friendly labels and table semantics.

Output expectations:
- One desktop dashboard prototype.
- It should look like a real product dashboard, not a pitch deck or landing page.
- Keep the design consistent with Precision Ops and the generated `DESIGN.md`.
