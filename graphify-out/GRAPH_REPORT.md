# Graph Report - spec-flow  (2026-05-17)

## Corpus Check
- 271 files · ~235,908 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 703 nodes · 859 edges · 34 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
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
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]

## God Nodes (most connected - your core abstractions)
1. `customFetch()` - 41 edges
2. `runGeneration()` - 24 edges
3. `toast()` - 16 edges
4. `assertWorkspaceId()` - 13 edges
5. `download()` - 8 edges
6. `parseErrorBody()` - 8 edges
7. `loadApiServerConfig()` - 7 edges
8. `validateOpenAiKey()` - 7 edges
9. `runOpenAiJson()` - 7 edges
10. `generatePrdSections()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `requireDatabase()` --calls--> `isDatabaseConfigured()`  [INFERRED]
  artifacts/api-server/src/routes/persistence.ts → lib/db/src/index.ts
- `runGeneration()` --calls--> `generateEpics()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `runGeneration()` --calls--> `generateStories()`  [INFERRED]
  artifacts/api-server/src/routes/generation.ts → lib/api-client-react/src/generated/api.ts
- `requireDatabase()` --calls--> `getDb()`  [INFERRED]
  artifacts/api-server/src/routes/persistence.ts → lib/db/src/index.ts
- `onSubmit()` --calls--> `createSession()`  [INFERRED]
  artifacts/specflow-ai/src/pages/NewBreakdown.tsx → lib/api-client-react/src/generated/api.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (133): createExportPackage(), createProject(), createSession(), exportToGitHub(), exportToJira(), generateClarification(), generateEpics(), generatePrd() (+125 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (35): deleteAiProvider(), getDeleteAiProviderUrl(), getValidateAiProviderUrl(), validateAiProvider(), addToRemoveQueue(), dispatch(), genId(), reducer() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (43): getGenerationRuntime(), buildInputSnapshotHash(), GenerationRouteError, getGenerationErrorStatus(), getOutputContract(), hasZodIssues(), markGenerationState(), normalizeProviderJsonContent() (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (18): ApiError, applyBaseUrl(), buildErrorMessage(), getMediaType(), getStringField(), hasNoBody(), inferResponseType(), isJsonMediaType() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (15): createApp(), loadApiServerConfig(), loadLocalEnv(), normalizeOrigin(), parseAllowedOrigins(), readAppOrigin(), readRequiredEnv(), readVercelOrigins() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (8): sendAiProviderRouteError(), getWorkspaceAuthContext(), requireAuthContext(), requireMutableWorkspaceContext(), hasZodIssues(), sendError(), sendUnexpectedError(), sendGenerationError()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (15): answeredQuestionSummary(), applyQualityReview(), buildReadinessScore(), compactSentences(), detectWarnings(), generateClarificationQuestions(), generateEpics(), generatePrdSections() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.28
Nodes (13): AiProviderError, buildProviderUrl(), classifyStatus(), createTimeoutSignal(), extractProviderErrorMessage(), normalizeBaseUrl(), parseProviderError(), postChatCompletion() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (10): defaultAiProviderConfig(), getAiProviderConfigRow(), getAiProviderSecret(), isAiProviderStorageMissingError(), markAiProviderValidation(), normalizeAiProviderBaseUrl(), recordAuditEvent(), saveAiProviderConfig() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (7): createMetaSelector(), ensureLinkTag(), ensureMetaTag(), getRouteMetadata(), syncDocumentMetadata(), getCanonicalUrl(), isPreviewDeployment()

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (10): analyzeAdaptiveIntake(), buildAdaptiveArtifacts(), buildAdaptivePhasePatch(), extractAcceptanceCriteria(), extractSectionContent(), extractStoryLines(), getRecommendedPhase(), hasPrdSignals() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (6): buildCsv(), buildJson(), buildMarkdown(), download(), slugifyFilename(), triggerFileDownload()

### Community 12 - "Community 12"
Cohesion: 0.46
Nodes (6): cn(), handleKeyDown(), SidebarMenu(), SidebarMenuButton(), SidebarMenuItem(), useSidebar()

### Community 14 - "Community 14"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 16 - "Community 16"
Cohesion: 0.8
Nodes (3): getApp(), handler(), loadServerModule()

### Community 17 - "Community 17"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): Calendar(), cn()

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (2): loadComponent(), _resolveComponent()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): cn()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): cn()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): cn()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): cn()

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (1): Badge()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): cn()

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): AuthProvider(), getDisplayName()

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreBar()

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (2): appPath(), joinAppPath()

## Knowledge Gaps
- **Thin community `Community 18`** (4 nodes): `chart.tsx`, `chart.tsx`, `cn()`, `useChart()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (4 nodes): `calendar.tsx`, `calendar.tsx`, `Calendar()`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `App.tsx`, `loadComponent()`, `_resolveComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `button-group.tsx`, `button-group.tsx`, `ButtonGroup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `badge.tsx`, `badge.tsx`, `Badge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `carousel.tsx`, `carousel.tsx`, `useCarousel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `auth-provider.tsx`, `AuthProvider()`, `getDisplayName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `ScoreBar.tsx`, `getScoreColor()`, `ScoreBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `routes.ts`, `appPath()`, `joinAppPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runGeneration()` connect `Community 2` to `Community 8`, `Community 0`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `customFetch()` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `generateEpics()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `customFetch()` (e.g. with `getWorkflowGuidance()` and `deleteSession()`) actually correct?**
  _`customFetch()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `runGeneration()` (e.g. with `requireDatabase()` and `getSessionArtifactsRecord()`) actually correct?**
  _`runGeneration()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `toast()` (e.g. with `copy()` and `download()`) actually correct?**
  _`toast()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `download()` (e.g. with `getExportPackage()` and `toast()`) actually correct?**
  _`download()` has 2 INFERRED edges - model-reasoned connections that need verification._