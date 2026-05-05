# Graph Report - spec-flow  (2026-05-05)

## Corpus Check
- 171 files · ~56,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 296 nodes · 215 edges · 25 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `dispatch()` - 11 edges
2. `toast()` - 11 edges
3. `customFetch()` - 10 edges
4. `parseErrorBody()` - 8 edges
5. `inferResponseType()` - 5 edges
6. `parseSuccessBody()` - 5 edges
7. `reducer()` - 4 edges
8. `applyBaseUrl()` - 4 edges
9. `resolveUrl()` - 4 edges
10. `buildErrorMessage()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `saveEdit()` --calls--> `dispatch()`  [INFERRED]
  artifacts/specflow-ai/src/components/workspace/PRDPanel.tsx → artifacts/specflow-ai/src/hooks/use-toast.ts
- `copyEpic()` --calls--> `toast()`  [INFERRED]
  artifacts/specflow-ai/src/components/workspace/EpicsPanel.tsx → artifacts/specflow-ai/src/hooks/use-toast.ts
- `handleAnswer()` --calls--> `dispatch()`  [INFERRED]
  artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx → artifacts/specflow-ai/src/hooks/use-toast.ts
- `handleSkip()` --calls--> `dispatch()`  [INFERRED]
  artifacts/specflow-ai/src/components/workspace/ClarificationPanel.tsx → artifacts/specflow-ai/src/hooks/use-toast.ts
- `onSubmit()` --calls--> `dispatch()`  [INFERRED]
  artifacts/specflow-ai/src/pages/NewBreakdown.tsx → artifacts/specflow-ai/src/hooks/use-toast.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (15): addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast(), download(), onSubmit() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (22): ApiError, applyBaseUrl(), buildErrorMessage(), customFetch(), getMediaType(), getStringField(), hasNoBody(), inferResponseType() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.46
Nodes (6): cn(), handleKeyDown(), SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), useSidebar()

### Community 4 - "Community 4"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 5 - "Community 5"
Cohesion: 0.53
Nodes (5): getHealthCheckQueryKey(), getHealthCheckQueryOptions(), getHealthCheckUrl(), healthCheck(), useHealthCheck()

### Community 6 - "Community 6"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (2): Calendar(), cn()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (1): saveEdit()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (1): QualityReviewPanel()

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): loadComponent(), _resolveComponent()

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (1): cn()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (1): cn()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (1): cn()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): cn()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): Badge()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): cn()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): copyEpic()

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreBar()

## Knowledge Gaps
- **Thin community `Community 7`** (4 nodes): `chart.tsx`, `chart.tsx`, `cn()`, `useChart()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (4 nodes): `calendar.tsx`, `calendar.tsx`, `Calendar()`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (4 nodes): `PRDPanel.tsx`, `cancelEdit()`, `saveEdit()`, `startEdit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (4 nodes): `QualityReviewPanel.tsx`, `QualityReviewPanel()`, `scoreBg()`, `scoreColor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (3 nodes): `App.tsx`, `loadComponent()`, `_resolveComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (3 nodes): `button-group.tsx`, `button-group.tsx`, `ButtonGroup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `badge.tsx`, `badge.tsx`, `Badge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `carousel.tsx`, `carousel.tsx`, `useCarousel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `EpicsPanel.tsx`, `copyEpic()`, `toggle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `ScoreBar.tsx`, `getScoreColor()`, `ScoreBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dispatch()` connect `Community 0` to `Community 9`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `toast()` connect `Community 0` to `Community 25`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `customFetch()` connect `Community 1` to `Community 5`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `dispatch()` (e.g. with `submitReview()` and `saveEdit()`) actually correct?**
  _`dispatch()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `toast()` (e.g. with `submitReview()` and `copy()`) actually correct?**
  _`toast()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._