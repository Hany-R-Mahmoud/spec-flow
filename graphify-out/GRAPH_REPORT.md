# Graph Report - spec-flow  (2026-05-15)

## Corpus Check
- 253 files · ~213,406 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 608 nodes · 699 edges · 33 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
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
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `customFetch()` - 33 edges
2. `runGeneration()` - 17 edges
3. `toast()` - 16 edges
4. `assertWorkspaceId()` - 13 edges
5. `dispatch()` - 10 edges
6. `download()` - 8 edges
7. `parseErrorBody()` - 8 edges
8. `loadApiServerConfig()` - 7 edges
9. `generatePrdSections()` - 7 edges
10. `markGenerationState()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ensureWorkspaceSchema()` --calls--> `getPool()`  [INFERRED]
  artifacts/api-server/src/server.ts → lib/db/src/index.ts
- `runGeneration()` --calls--> `generateEpics()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `runGeneration()` --calls--> `generateStories()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `requireDatabase()` --calls--> `isDatabaseConfigured()`  [INFERRED]
  artifacts/api-server/src/routes/persistence.ts → lib/db/src/index.ts
- `onSubmit()` --calls--> `createSession()`  [INFERRED]
  artifacts/specflow-ai/src/pages/NewBreakdown.tsx → lib/api-client-react/src/generated/api.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (109): createExportPackage(), createProject(), createSession(), exportToGitHub(), exportToJira(), generateClarification(), generateEpics(), generatePrd() (+101 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (37): getGenerationRuntime(), markGenerationState(), resetDownstream(), resetStep(), runGeneration(), assertWorkspaceId(), buildDefaultSettings(), buildPhaseUpdate() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (21): addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast(), navigate(), openProjects() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (18): ApiError, applyBaseUrl(), buildErrorMessage(), getMediaType(), getStringField(), hasNoBody(), inferResponseType(), isJsonMediaType() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.23
Nodes (6): getWorkspaceAuthContext(), requireAuthContext(), requireMutableWorkspaceContext(), hasZodIssues(), sendError(), sendUnexpectedError()

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (11): createApp(), loadApiServerConfig(), loadLocalEnv(), normalizeOrigin(), parseAllowedOrigins(), readAppOrigin(), readRequiredEnv(), readVercelOrigins() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (15): answeredQuestionSummary(), applyQualityReview(), buildReadinessScore(), compactSentences(), detectWarnings(), generateClarificationQuestions(), generateEpics(), generatePrdSections() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (11): analyzeAdaptiveIntake(), buildAdaptiveArtifacts(), buildAdaptivePhasePatch(), extractAcceptanceCriteria(), extractSectionContent(), extractStoryLines(), getRecommendedPhase(), hasPrdSignals() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.27
Nodes (7): createMetaSelector(), ensureLinkTag(), ensureMetaTag(), getRouteMetadata(), syncDocumentMetadata(), getCanonicalUrl(), isPreviewDeployment()

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (6): buildCsv(), buildJson(), buildMarkdown(), download(), slugifyFilename(), triggerFileDownload()

### Community 10 - "Community 10"
Cohesion: 0.46
Nodes (6): cn(), handleKeyDown(), SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), useSidebar()

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (5): emptyState(), getStepSkillSnapshotForPhase(), parseStoredState(), useStepSkills(), StepSkillsSection()

### Community 12 - "Community 12"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 15 - "Community 15"
Cohesion: 0.8
Nodes (3): getApp(), handler(), loadServerModule()

### Community 16 - "Community 16"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): Calendar(), cn()

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (2): loadComponent(), _resolveComponent()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): cn()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): cn()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): cn()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): cn()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): Badge()

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (1): cn()

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (2): AuthProvider(), getDisplayName()

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreBar()

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): appPath(), joinAppPath()

## Knowledge Gaps
- **Thin community `Community 17`** (4 nodes): `chart.tsx`, `chart.tsx`, `cn()`, `useChart()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `calendar.tsx`, `calendar.tsx`, `Calendar()`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `App.tsx`, `loadComponent()`, `_resolveComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `button-group.tsx`, `button-group.tsx`, `ButtonGroup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `badge.tsx`, `badge.tsx`, `Badge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `carousel.tsx`, `carousel.tsx`, `useCarousel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `auth-provider.tsx`, `AuthProvider()`, `getDisplayName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `ScoreBar.tsx`, `getScoreColor()`, `ScoreBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `routes.ts`, `appPath()`, `joinAppPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runGeneration()` connect `Community 1` to `Community 0`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `toast()` connect `Community 2` to `Community 9`, `Community 7`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `customFetch()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `customFetch()` (e.g. with `healthCheck()` and `listProjects()`) actually correct?**
  _`customFetch()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `runGeneration()` (e.g. with `requireDatabase()` and `getSessionArtifactsRecord()`) actually correct?**
  _`runGeneration()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `toast()` (e.g. with `copy()` and `download()`) actually correct?**
  _`toast()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `dispatch()` (e.g. with `openSession()` and `markReady()`) actually correct?**
  _`dispatch()` has 6 INFERRED edges - model-reasoned connections that need verification._