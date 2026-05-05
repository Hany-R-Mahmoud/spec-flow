# Huashu Design Exploration: SpecFlow AI

**Skill**: `.local/skills/huashu-design/SKILL.md`  
**Mode**: design direction consultant + high-fidelity HTML prototype planning  
**Date**: 2026-05-05  

## Design Assumptions

- Product is a spec-driven AI development workspace, not a marketing site.
- First implementation should polish current Replit dashboard, not replace IA.
- The UI must support repeated daily use by PMs, developers, and AI-agent
  operators.
- Existing density is valuable; the design should sharpen it, not make it airy.

## Direction 1 - Precision Ops

**Philosophy**: Pentagram-style information architecture: order, hierarchy,
clear surfaces, quiet confidence.

**Look**:

- White/pale gray shell.
- Blue primary accent.
- Teal sync status.
- Violet used only for agent handoff signals.
- Tight table rhythm, strong text hierarchy, minimal shadow.

**Best for**:

- Immediate app polish.
- Low implementation risk.
- Accessibility and SaaS workflow fit.

**Risks**:

- Could remain too close to current UI if details are under-executed.
- Needs careful active states and status badges to avoid gray sameness.

**Keep**:

- KPI grid.
- Active sessions table.
- Command palette cue.

**Fix**:

- Stronger shell separation.
- Accessible command trigger.
- Active nav indicator.
- Semantic KPI accents.

## Direction 2 - Agent Control Room

**Philosophy**: operational command center for AI-agent orchestration.

**Look**:

- Darker left rail or dark header band.
- Higher contrast status strips.
- Agent handoff queue as a first-class surface.
- More pronounced progress/status visualization.

**Best for**:

- Future version after AI workflow features are real.
- Users who want a cockpit feel.

**Risks**:

- Could overfit to "AI dashboard" tropes.
- More visual weight than current app needs.
- Higher implementation risk and contrast QA burden.

**Keep**:

- Workflow phases.
- Readiness scores.
- Review/export queues.

**Fix**:

- Avoid decorative terminal styling.
- Avoid dark-blue/slate dominance.
- Keep content density readable.

## Direction 3 - Spec Ledger

**Philosophy**: rigorous product/spec record system: auditability, traceability,
and review history.

**Look**:

- Document-like dashboard.
- Strong section dividers.
- Breadcrumb/spec lifecycle emphasis.
- Activity rail or timeline hints.

**Best for**:

- Future persistence/review phases.
- Emphasizing trust, audit trail, Spec Kit lifecycle.

**Risks**:

- Less immediately polished for dashboard first impression.
- Requires product features not fully present yet: activity history, durable
  reviews, synced records.

**Keep**:

- Tables and review queue.
- Export history.
- Workflow status vocabulary.

**Fix**:

- Needs more product data than current prototype has.
- Could feel administrative if first screen lacks action emphasis.

## Recommendation

Choose **Direction 1 - Precision Ops** for the first implementation pass.

Reason:

- Strongest fit for current app state.
- Low risk with existing React/Tailwind/Radix/lucide stack.
- Directly addresses critique issues: accessibility, hierarchy, active nav,
  command affordance, KPI semantics.
- Leaves room to evolve into Direction 2/3 when AI/persistence features mature.

## Rejected For Now

- Direction 2 is deferred until AI workflow and notifications are real.
- Direction 3 is deferred until persistence, review history, and audit trail are
  real.
