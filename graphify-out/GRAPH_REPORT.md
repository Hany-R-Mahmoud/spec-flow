# Graph Report - spec-flow  (2026-05-12)

## Corpus Check
- 246 files · ~136,470 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 575 nodes · 604 edges · 30 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `customFetch()` - 33 edges
2. `runGeneration()` - 17 edges
3. `toast()` - 16 edges
4. `assertWorkspaceId()` - 13 edges
5. `dispatch()` - 10 edges
6. `download()` - 8 edges
7. `parseErrorBody()` - 8 edges
8. `markGenerationState()` - 7 edges
9. `createWorkflowGeneration()` - 7 edges
10. `pickConstraint()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `runGeneration()` --calls--> `generateEpics()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `runGeneration()` --calls--> `generateStories()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `requireDatabase()` --calls--> `isDatabaseConfigured()`  [INFERRED]
  artifacts/api-server/src/routes/persistence.ts → lib/db/src/index.ts
- `onSubmit()` --calls--> `createSession()`  [INFERRED]
  artifacts/specflow-ai/src/pages/NewBreakdown.tsx → lib/api-client-react/src/generated/api.ts
- `download()` --calls--> `getExportPackage()`  [INFERRED]
  artifacts/specflow-ai/src/pages/ExportsPage.tsx → lib/api-client-react/src/generated/api.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (108): createExportPackage(), createProject(), createSession(), exportToGitHub(), exportToJira(), generateClarification(), generateEpics(), generatePrd() (+100 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (22): addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast(), navigate(), openProjects() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (32): getGenerationRuntime(), markGenerationState(), resetDownstream(), resetStep(), runGeneration(), assertWorkspaceId(), buildDefaultSettings(), buildPhaseUpdate() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (19): ApiError, applyBaseUrl(), buildErrorMessage(), getMediaType(), getStringField(), hasNoBody(), inferResponseType(), isJsonMediaType() (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (13): requireDatabase(), createApp(), loadApiServerConfig(), normalizeOrigin(), parseAllowedOrigins(), readRequiredEnv(), ensureWorkspaceSchema(), getDb() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.3
Nodes (12): answeredQuestionSummary(), applyQualityReview(), buildReadinessScore(), compactSentences(), generateClarificationQuestions(), generateEpics(), generatePrdSections(), generateStories() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (7): createMetaSelector(), ensureLinkTag(), ensureMetaTag(), getRouteMetadata(), syncDocumentMetadata(), getCanonicalUrl(), isPreviewDeployment()

### Community 7 - "Community 7"
Cohesion: 0.36
Nodes (6): buildCsv(), buildJson(), buildMarkdown(), download(), slugifyFilename(), triggerFileDownload()

### Community 8 - "Community 8"
Cohesion: 0.43
Nodes (6): getWorkspaceAuthContext(), requireAuthContext(), requireMutableWorkspaceContext(), hasZodIssues(), sendError(), sendUnexpectedError()

### Community 9 - "Community 9"
Cohesion: 0.46
Nodes (6): cn(), handleKeyDown(), SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), useSidebar()

### Community 10 - "Community 10"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 13 - "Community 13"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): Calendar(), cn()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (2): loadComponent(), _resolveComponent()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): cn()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): cn()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): cn()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): cn()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): Badge()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (1): cn()

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): AuthProvider(), getDisplayName()

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreBar()

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (2): appPath(), joinAppPath()

## Knowledge Gaps
- **Thin community `Community 14`** (4 nodes): `chart.tsx`, `chart.tsx`, `cn()`, `useChart()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `calendar.tsx`, `calendar.tsx`, `Calendar()`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `App.tsx`, `loadComponent()`, `_resolveComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `button-group.tsx`, `button-group.tsx`, `ButtonGroup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `badge.tsx`, `badge.tsx`, `Badge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `carousel.tsx`, `carousel.tsx`, `useCarousel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `auth-provider.tsx`, `AuthProvider()`, `getDisplayName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `ScoreBar.tsx`, `getScoreColor()`, `ScoreBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `routes.ts`, `appPath()`, `joinAppPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runGeneration()` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `customFetch()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `toast()` connect `Community 1` to `Community 7`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `customFetch()` (e.g. with `healthCheck()` and `listProjects()`) actually correct?**
  _`customFetch()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `runGeneration()` (e.g. with `requireDatabase()` and `getSessionArtifactsRecord()`) actually correct?**
  _`runGeneration()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `toast()` (e.g. with `copy()` and `download()`) actually correct?**
  _`toast()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `dispatch()` (e.g. with `openSession()` and `markReady()`) actually correct?**
  _`dispatch()` has 6 INFERRED edges - model-reasoned connections that need verification._