# Implementation Plan: Manus Competitive Product Research

**Branch**: `013-manus-competitive-product-research` | **Date**: 2026-05-15 | **Spec**: `specs/013-manus-competitive-product-research/spec.md`

## Summary

Manus should run external market research and return structured product
evidence. Codex will later decide which recommendations become project specs.

## Technical Context

**Primary Input**: `docs/manus/project-brief.md`  
**Primary Output**: Markdown research report  
**Tools**: Manus web research, screenshots, source collection  
**Repo Edits**: None  
**Verification**: Source links and clear `Unknown / verify` labels

## Execution Phases

### Phase 1: Context Load

- Read the project brief.
- Identify SpecFlow AI's current workflow and target users.
- Define comparison criteria before researching competitors.

### Phase 2: Competitor Research

- Research the comparison set.
- Capture product promise, primary workflow, AI features, integrations, and
  pricing model where public.
- Add any direct competitors discovered during research.

### Phase 3: Analysis

- Compare SpecFlow AI against each product.
- Identify buildable opportunities and risks.
- Separate direct competitor threats from adjacent workflow inspiration.

### Phase 4: Recommendations

- Produce Now, Next, Later recommendations.
- Keep recommendations specific enough for Codex to turn into specs.

## Constraints

- No unsourced external claims.
- No invented SpecFlow AI capabilities.
- No implementation plan unless tied to product opportunity.

## Recommended Output File

`manus-competitive-product-research.md`

