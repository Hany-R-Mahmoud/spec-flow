# Feature Specification: Manus Competitive Product Research

**Feature Branch**: `013-manus-competitive-product-research`  
**Created**: 2026-05-15  
**Status**: Draft  
**Depends On**: `docs/manus/project-brief.md`

## Goal

Use Manus as an external research agent to understand how SpecFlow AI should
position itself against adjacent product, planning, and delivery tools. The
output must help decide what features, onboarding messages, and export
workflows are worth building next.

## Manus Assignment

Research comparable tools and extract actionable lessons for SpecFlow AI.
Focus on products that help teams move from rough product context to specs,
PRDs, epics, stories, roadmaps, or delivery tickets.

Suggested comparison set:

- Jira Product Discovery
- Linear
- Productboard
- Aha!
- Notion AI / Notion Projects
- ChatPRD
- Atlassian Confluence AI and Jira AI features
- Any newer direct competitor found during research

## User Scenarios

1. As the founder, I want to know which parts of SpecFlow AI are differentiated
   versus commodity.
2. As the product owner, I want evidence for which onboarding and workflow
   features should be prioritized.
3. As the engineer, I want research output structured enough to become specs,
   not loose market commentary.

## Requirements

- **FR-001**: Research MUST compare at least six relevant tools.
- **FR-002**: Research MUST include positioning, key workflows, target users,
  pricing model if public, AI capabilities, and export/integration behavior.
- **FR-003**: Findings MUST distinguish direct competitors from adjacent tools.
- **FR-004**: Output MUST identify concrete opportunities for SpecFlow AI.
- **FR-005**: Output MUST identify risks where competitors already solve the
  same problem better.
- **FR-006**: Claims MUST include source links or be labeled `Unknown / verify`.
- **FR-007**: Recommendations MUST be prioritized as Now, Next, Later.
- **FR-008**: Output MUST avoid code suggestions unless they are directly tied
  to product capability gaps.

## Must Finish

- Competitor matrix.
- Feature gap analysis.
- Positioning recommendation.
- Onboarding and export workflow lessons.
- Prioritized opportunities for SpecFlow AI.

## May Defer

- Deep pricing strategy.
- Full SEO analysis.
- Enterprise procurement research.
- Implementation design.

## Must Not Touch

- Repo code.
- Secrets, private credentials, or internal deployment settings.
- Unsourced claims presented as fact.

## Failure Conditions

Manus output is not acceptable if:

- It compares fewer than six tools.
- It gives generic advice without specific product implications.
- It lacks source links for external claims.
- It does not separate Now, Next, and Later recommendations.
- It invents SpecFlow AI capabilities not present in the project brief.

## Success Criteria

- **SC-001**: Research clearly explains where SpecFlow AI can win.
- **SC-002**: Research names at least five buildable opportunities.
- **SC-003**: Research identifies at least three competitor risks.
- **SC-004**: Output can be passed to Codex and converted into product specs.

## Expected Manus Output

Create one markdown report with these sections:

1. Executive summary
2. Competitor matrix
3. Workflow comparison
4. AI capability comparison
5. Export and integration comparison
6. Positioning recommendation
7. Now / Next / Later opportunities
8. Risks and unknowns
9. Codex implementation handoff

## Manus Handoff Prompt

```text
Read docs/manus/project-brief.md first. Then execute
specs/013-manus-competitive-product-research/spec.md, plan.md, and tasks.md.
Research comparable product/spec/story tools. Produce one evidence-backed
markdown report with competitor matrix, workflow lessons, positioning,
opportunities, risks, source links, and a Codex implementation handoff. Do not
edit repository code.
```

