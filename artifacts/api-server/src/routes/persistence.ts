import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import {
  type ClarificationQuestion,
  type Epic,
  exportPackagesTable,
  exportItemsTable,
  integrationConfigTable,
  type ExportPackage,
  type ExportItemRow,
  type IntegrationConfigRow,
  type GenerationMode,
  type GenerationStatus,
  type Phase,
  type PhaseStatus,
  projectsTable,
  type PRDSection,
  sessionsTable,
  settingsTable,
  type Story,
  type WorkflowArtifacts,
  type WorkflowGeneration,
  workflowArtifactsTable,
  getDb,
  isDatabaseConfigured,
} from "@workspace/db";
import type {
  ExportStatus,
  Project,
  WorkflowSession,
  WorkspaceSettings,
} from "@workspace/api-zod";

type Database = ReturnType<typeof getDb>;

const DEFAULT_SETTINGS_ID = "workspace-default";
const REQUIRED_INTEGRATION_KEYS: Record<string, string[]> = {
  jira: ["domain", "email", "apiToken", "projectKey"],
  github: ["owner", "repo", "token"],
};

const DEFAULT_PHASES: Record<Phase, PhaseStatus> = {
  intake: "complete",
  clarification: "in-progress",
  prd: "not-started",
  epics: "not-started",
  stories: "not-started",
  quality: "not-started",
  devReview: "not-started",
  export: "not-started",
};

const DEFAULT_QUESTIONS: ClarificationQuestion[] = [
  {
    id: "clarity-scope",
    group: "Scope",
    text: "What user problem should this workflow solve first?",
    required: true,
    answer: "",
    skipped: false,
  },
  {
    id: "clarity-success",
    group: "Success Metrics",
    text: "How will the team know this breakdown produced a successful outcome?",
    required: true,
    answer: "",
    skipped: false,
  },
  {
    id: "clarity-risk",
    group: "Constraints",
    text: "Which non-negotiable constraints or dependencies already exist?",
    required: true,
    answer: "",
    skipped: false,
  },
  {
    id: "clarity-edge",
    group: "Edge Cases",
    text: "Which risky scenario should be handled before delivery?",
    required: false,
    answer: "",
    skipped: false,
  },
];

const DEFAULT_PRD_SECTIONS: PRDSection[] = [
  {
    id: "prd-problem",
    title: "Problem Statement",
    content: "",
    complete: false,
    order: 1,
  },
  {
    id: "prd-users",
    title: "Target Users",
    content: "",
    complete: false,
    order: 2,
  },
  {
    id: "prd-scope",
    title: "Scope",
    content: "",
    complete: false,
    order: 3,
  },
  {
    id: "prd-risks",
    title: "Risks and Unknowns",
    content: "",
    complete: false,
    order: 4,
  },
];

export const PROMPT_VERSIONS = {
  clarification: "clarification-v1",
  prd: "prd-v1",
  epics: "epics-v1",
  stories: "stories-v1",
  quality: "quality-v1",
} as const;

type GenerationStepKey = keyof typeof PROMPT_VERSIONS;

function createGenerationStep(
  promptVersion: string,
  mode: GenerationMode,
  status: GenerationStatus = "idle",
): WorkflowGeneration[GenerationStepKey] {
  return {
    status,
    mode,
    promptVersion,
    updatedAt: null,
    errorMessage: null,
  };
}

export function createWorkflowGeneration(
  mode: GenerationMode = "demo",
): WorkflowGeneration {
  return {
    clarification: createGenerationStep(PROMPT_VERSIONS.clarification, mode),
    prd: createGenerationStep(PROMPT_VERSIONS.prd, mode),
    epics: createGenerationStep(PROMPT_VERSIONS.epics, mode),
    stories: createGenerationStep(PROMPT_VERSIONS.stories, mode),
    quality: createGenerationStep(PROMPT_VERSIONS.quality, mode),
  };
}

export function withGenerationStatus(
  generation: WorkflowGeneration,
  step: GenerationStepKey,
  input: {
    status: GenerationStatus;
    mode?: GenerationMode;
    promptVersion?: string;
    errorMessage?: string | null;
    updatedAt?: string | null;
    provider?: string | null;
    model?: string | null;
    providerRequestId?: string | null;
    inputSnapshotHash?: string | null;
    tokenEstimate?: number | null;
    costEstimateCents?: number | null;
    errorClass?: string | null;
  },
): WorkflowGeneration {
  return {
    ...generation,
    [step]: {
      ...generation[step],
      status: input.status,
      mode: input.mode ?? generation[step].mode,
      promptVersion: input.promptVersion ?? generation[step].promptVersion,
      errorMessage:
        input.errorMessage === undefined
          ? generation[step].errorMessage
          : input.errorMessage,
      updatedAt: input.updatedAt ?? new Date().toISOString(),
      provider:
        input.provider === undefined ? generation[step].provider ?? null : input.provider,
      model: input.model === undefined ? generation[step].model ?? null : input.model,
      providerRequestId:
        input.providerRequestId === undefined
          ? generation[step].providerRequestId ?? null
          : input.providerRequestId,
      inputSnapshotHash:
        input.inputSnapshotHash === undefined
          ? generation[step].inputSnapshotHash ?? null
          : input.inputSnapshotHash,
      tokenEstimate:
        input.tokenEstimate === undefined
          ? generation[step].tokenEstimate ?? null
          : input.tokenEstimate,
      costEstimateCents:
        input.costEstimateCents === undefined
          ? generation[step].costEstimateCents ?? null
          : input.costEstimateCents,
      errorClass:
        input.errorClass === undefined
          ? generation[step].errorClass ?? null
          : input.errorClass,
    },
  };
}

function derivePhaseProgress(
  phase: Phase,
  status: PhaseStatus,
): Record<Phase, PhaseStatus> {
  const next = { ...DEFAULT_PHASES };
  const orderedPhases: Phase[] = [
    "intake",
    "clarification",
    "prd",
    "epics",
    "stories",
    "quality",
    "devReview",
    "export",
  ];
  const currentIndex = orderedPhases.indexOf(phase);

  orderedPhases.forEach((item, index) => {
    if (index < currentIndex) {
      next[item] = "complete";
      return;
    }

    if (index === currentIndex) {
      next[item] = status;
      return;
    }

    next[item] = "not-started";
  });

  return next;
}

function createDemoStory(sessionId: string, epicId: string): Story[] {
  return [
    {
      id: "story-demo-1",
      epicId,
      sessionId,
      title: "Summarize project intake into actionable workflow state",
      userStory:
        "As a product manager, I want intake context organized quickly so I can move into clarification without losing details.",
      description:
        "Persist the product input, business goal, and labels so the team can resume work after refresh.",
      acceptanceCriteria: [
        "Session data survives a full browser refresh.",
        "Workspace reopens in the current phase after reload.",
      ],
      priority: "P1",
      labels: ["Persistence", "Frontend"],
      components: ["Dashboard", "Workspace"],
      dependencies: [],
      edgeCases: ["Blank optional fields should still persist cleanly."],
      errorHandling:
        "Show a user-friendly save failure state and keep local edits visible until retry.",
      localizationNotes: "",
      designNotes: "Keep saved-state affordances subtle and honest.",
      analyticsNotes: "Track session create and resume events.",
      qaNotes: "Refresh after create and after edit.",
      technicalNotes: "Use shared API contract types for saved payloads.",
      openQuestions: [],
      readinessScore: {
        total: 88,
        clarity: 18,
        acceptanceCriteria: 18,
        businessAlignment: 13,
        technicalFeasibility: 13,
        testability: 9,
        edgeCasesErrorHandling: 8,
        dependenciesDesignLocalization: 9,
        label: "Minor review needed",
      },
      warnings: [
        {
          id: "warn-demo-1",
          type: "validation",
          message: "Consider defining an explicit retry pattern for failed saves.",
          severity: "warning",
        },
      ],
      reviewStatus: "pending",
    },
    {
      id: "story-demo-2",
      epicId,
      sessionId,
      title: "Load persisted sessions on dashboard and project list",
      userStory:
        "As a product manager, I want my saved sessions visible on key pages so I can jump back into active work.",
      description:
        "Replace the in-memory primary source with API-backed session loading on dashboard and projects.",
      acceptanceCriteria: [
        "Dashboard session counts come from persisted data.",
        "Projects page opens a persisted workspace.",
      ],
      priority: "P1",
      labels: ["Persistence", "API"],
      components: ["Projects", "Dashboard"],
      dependencies: ["story-demo-1"],
      edgeCases: ["Empty account should show a clear empty state."],
      errorHandling:
        "If API load fails, show a page-level error message and allow retry.",
      localizationNotes: "",
      designNotes: "",
      analyticsNotes: "",
      qaNotes: "Verify both empty-state and loaded-state paths.",
      technicalNotes: "Flatten stories across sessions for review queues.",
      openQuestions: [],
      readinessScore: {
        total: 93,
        clarity: 19,
        acceptanceCriteria: 19,
        businessAlignment: 14,
        technicalFeasibility: 14,
        testability: 9,
        edgeCasesErrorHandling: 9,
        dependenciesDesignLocalization: 9,
        label: "Ready for Jira",
      },
      warnings: [],
      reviewStatus: "approved",
      developerReview: {
        status: "approved",
        comment: "Scope good. Keep API error states obvious.",
        reviewerName: "Demo Reviewer",
        timestamp: new Date().toISOString(),
        pmRevisionStatus: "resolved",
      },
    },
  ];
}

function createDemoArtifacts(sessionId: string): Pick<
  WorkflowArtifacts,
  "clarificationQuestions" | "prdSections" | "epics" | "stories" | "metadata"
> {
  const epicId = "epic-demo-1";
  const stories = createDemoStory(sessionId, epicId);
  const epics: Epic[] = [
    {
      id: epicId,
      sessionId,
      title: "Persistence foundation",
      businessObjective: "Make workflows refresh-safe for daily product use.",
      scopeSummary:
        "Persist sessions, workspace edits, and project visibility in the MVP product shell.",
      prdRequirements: ["REQ-1", "REQ-2"],
      priority: "P1",
      dependencies: [],
      risks: ["Schema drift between frontend and backend contracts."],
      jiraEpicDescription:
        "Create a minimal persistence layer for sessions, settings, and workflow artifacts.",
      storyCount: stories.length,
    },
  ];

  return {
    clarificationQuestions: DEFAULT_QUESTIONS.map((question, index) => ({
      ...question,
      answer:
        index === 0
          ? "Preserve workflow state across refresh."
          : index === 1
            ? "Sessions reload into the right phase with saved artifacts."
            : "",
      skipped: false,
    })),
    prdSections: DEFAULT_PRD_SECTIONS.map((section) => ({
      ...section,
      content:
        section.id === "prd-problem"
          ? "Current workflow data disappears after refresh."
          : "",
      complete: section.id === "prd-problem",
    })),
    epics,
    stories,
    metadata: {
      generation: {
        ...withGenerationStatus(
          createWorkflowGeneration("demo"),
          "clarification",
          { status: "succeeded" },
        ),
        prd: {
          ...createGenerationStep(PROMPT_VERSIONS.prd, "demo", "succeeded"),
          updatedAt: new Date().toISOString(),
          errorMessage: null,
        },
        epics: {
          ...createGenerationStep(PROMPT_VERSIONS.epics, "demo", "succeeded"),
          updatedAt: new Date().toISOString(),
          errorMessage: null,
        },
        stories: {
          ...createGenerationStep(PROMPT_VERSIONS.stories, "demo", "succeeded"),
          updatedAt: new Date().toISOString(),
          errorMessage: null,
        },
        quality: {
          ...createGenerationStep(PROMPT_VERSIONS.quality, "demo", "succeeded"),
          updatedAt: new Date().toISOString(),
          errorMessage: null,
        },
      },
    },
  };
}

const DEMO_EXPORTS: ExportPackage[] = [
  {
    id: "export-demo-1",
    sessionId: "session-demo-1",
    sessionName: "SpecFlow Persistence Demo",
    date: new Date().toISOString(),
    epicCount: 1,
    storyCount: 2,
    avgReadiness: 91,
    format: "json",
    status: "complete",
  },
];

const DEFAULT_SETTINGS_TEMPLATE = {
  workspaceName: "SpecFlow Workspace",
  jiraKey: "SPEC",
  defaultLabels: ["Feature", "Frontend"],
  defaultComponents: ["Dashboard", "Workspace"],
  templatePreference: "Standard",
  qualityThreshold: 75,
  devReviewRequired: true,
  autoGenerateQuestions: true,
  showReadinessWarnings: true,
} satisfies Omit<WorkspaceSettings, "id" | "workspaceId" | "createdAt" | "updatedAt">;

const workspaceSeedPromises = new Map<string, Promise<void>>();

export function getSettingsId(workspaceId: string): string {
  return `workspace-settings-${assertWorkspaceId(workspaceId)}`;
}

function buildDefaultSettings(
  workspaceId: string,
): Omit<WorkspaceSettings, "createdAt" | "updatedAt"> & { workspaceId: string } {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  return {
    id: getSettingsId(scopedWorkspaceId),
    workspaceId: scopedWorkspaceId,
    ...DEFAULT_SETTINGS_TEMPLATE,
  };
}

function assertWorkspaceId(workspaceId: string): string {
  const trimmed = workspaceId.trim();
  if (!trimmed) {
    throw new Error("Workspace ID is required.");
  }

  return trimmed;
}

export function requireDatabase(): Database {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Persistence requires DATABASE_URL. Configure the database before calling persistence routes.",
    );
  }

  return getDb() as Database;
}

export async function ensureSeedData(db: Database, workspaceId: string): Promise<void> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const pendingSeed = workspaceSeedPromises.get(scopedWorkspaceId);
  if (pendingSeed) {
    await pendingSeed;
    return;
  }

  const seedPromise = (async () => {
    const [settings] = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.workspaceId, scopedWorkspaceId));

    if (!settings) {
      await db.insert(settingsTable).values(buildDefaultSettings(scopedWorkspaceId));
    }
  })();

  workspaceSeedPromises.set(scopedWorkspaceId, seedPromise);

  try {
    await seedPromise;
  } finally {
    workspaceSeedPromises.delete(scopedWorkspaceId);
  }
}

type SessionWithArtifactsRow = {
  session: typeof sessionsTable.$inferSelect;
  artifacts: typeof workflowArtifactsTable.$inferSelect | null;
};

function sanitizeGenerationStatus(
  step: WorkflowGeneration[keyof WorkflowGeneration],
): WorkflowGeneration[keyof WorkflowGeneration] {
  // A 'running' status persisted in the DB means the server process was
  // interrupted mid-generation. Reset it to 'failed' so the client doesn't
  // treat it as an active in-flight request.
  if (step.status === "running") {
    return {
      ...step,
      status: "failed",
      errorMessage: "Generation was interrupted. Retry when ready.",
    };
  }
  return step;
}

function toResponseGeneration(
  generation: WorkflowGeneration,
): WorkflowSession["generation"] {
  return {
    clarification: {
      ...sanitizeGenerationStatus(generation.clarification),
      updatedAt: generation.clarification.updatedAt
        ? new Date(generation.clarification.updatedAt)
        : null,
    },
    prd: {
      ...sanitizeGenerationStatus(generation.prd),
      updatedAt: generation.prd.updatedAt ? new Date(generation.prd.updatedAt) : null,
    },
    epics: {
      ...sanitizeGenerationStatus(generation.epics),
      updatedAt: generation.epics.updatedAt
        ? new Date(generation.epics.updatedAt)
        : null,
    },
    stories: {
      ...sanitizeGenerationStatus(generation.stories),
      updatedAt: generation.stories.updatedAt
        ? new Date(generation.stories.updatedAt)
        : null,
    },
    quality: {
      ...sanitizeGenerationStatus(generation.quality),
      updatedAt: generation.quality.updatedAt
        ? new Date(generation.quality.updatedAt)
        : null,
    },
  };
}

export function toProject(project: typeof projectsTable.$inferSelect): Project {
  return {
    id: project.id,
    name: project.name,
    jiraKey: project.jiraKey,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function toWorkflowSession({
  session,
  artifacts,
}: SessionWithArtifactsRow): WorkflowSession {
  const generation = toResponseGeneration(
    artifacts?.metadata?.generation ?? createWorkflowGeneration("demo"),
  );

  return {
    id: session.id,
    projectId: session.projectId,
    name: session.name,
    inputType: session.inputType,
    outputDepth: session.outputDepth,
    jiraKey: session.jiraKey,
    targetUsers: session.targetUsers,
    businessGoal: session.businessGoal,
    knownConstraints: session.knownConstraints,
    labels: session.labels,
    rawInput: session.rawInput,
    currentPhase: session.currentPhase as Phase,
    phases: session.phases as WorkflowSession["phases"],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    clarificationQuestions: artifacts?.clarificationQuestions ?? [],
    prdSections: artifacts?.prdSections ?? [],
    epics: artifacts?.epics ?? [],
    stories:
      artifacts?.stories.map((story) => ({
        ...story,
        developerReview: story.developerReview
          ? {
              ...story.developerReview,
              timestamp: new Date(story.developerReview.timestamp),
            }
          : story.developerReview,
      })) ?? [],
    generation,
  };
}

export function toSettings(
  settings: typeof settingsTable.$inferSelect,
): WorkspaceSettings {
  return {
    id: settings.id,
    workspaceName: settings.workspaceName,
    jiraKey: settings.jiraKey,
    defaultLabels: settings.defaultLabels,
    defaultComponents: settings.defaultComponents,
    templatePreference: settings.templatePreference,
    qualityThreshold: settings.qualityThreshold,
    devReviewRequired: settings.devReviewRequired,
    autoGenerateQuestions: settings.autoGenerateQuestions,
    showReadinessWarnings: settings.showReadinessWarnings,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export function toExportPackage(
  exportPackage: typeof exportPackagesTable.$inferSelect,
): ExportPackage {
  return {
    id: exportPackage.id,
    sessionId: exportPackage.sessionId,
    sessionName: exportPackage.sessionName,
    date: exportPackage.date.toISOString(),
    epicCount: exportPackage.epicCount,
    storyCount: exportPackage.storyCount,
    avgReadiness: exportPackage.avgReadiness,
    format: exportPackage.format as ExportPackage["format"],
    status: exportPackage.status as ExportStatus,
  };
}

export function createSessionDefaults(): Pick<
  WorkflowArtifacts,
  "clarificationQuestions" | "prdSections" | "epics" | "stories" | "metadata"
> {
  return {
    clarificationQuestions: DEFAULT_QUESTIONS.map((question) => ({ ...question })),
    prdSections: DEFAULT_PRD_SECTIONS.map((section) => ({ ...section })),
    epics: [],
    stories: [],
    metadata: {
      generation: createWorkflowGeneration("demo"),
    },
  };
}

export async function getSessionArtifactsRecord(
  db: Database,
  sessionId: string,
  workspaceId: string,
): Promise<SessionWithArtifactsRow | null> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const [row] = await db
    .select({
      session: sessionsTable,
      artifacts: workflowArtifactsTable,
    })
    .from(sessionsTable)
    .leftJoin(
      workflowArtifactsTable,
      eq(workflowArtifactsTable.sessionId, sessionsTable.id),
    )
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, scopedWorkspaceId)));

  return row ?? null;
}

export function buildPhaseUpdate(
  phase: Phase,
  status: PhaseStatus,
): Pick<typeof sessionsTable.$inferInsert, "currentPhase" | "phases" | "updatedAt"> {
  return {
    currentPhase: phase,
    phases: derivePhaseProgress(phase, status),
    updatedAt: new Date(),
  };
}

export async function listSessionsWithArtifacts(
  db: Database,
  workspaceId: string,
): Promise<WorkflowSession[]> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const rows = await db
    .select({
      session: sessionsTable,
      artifacts: workflowArtifactsTable,
    })
    .from(sessionsTable)
    .leftJoin(
      workflowArtifactsTable,
      eq(workflowArtifactsTable.sessionId, sessionsTable.id),
    )
    .where(eq(sessionsTable.workspaceId, scopedWorkspaceId))
    .orderBy(asc(sessionsTable.createdAt));

  return rows.map(toWorkflowSession);
}

export async function getSessionWithArtifacts(
  db: Database,
  sessionId: string,
  workspaceId: string,
): Promise<WorkflowSession | null> {
  const row = await getSessionArtifactsRecord(db, sessionId, workspaceId);
  return row ? toWorkflowSession(row) : null;
}

export async function createProjectRecord(
  db: Database,
  workspaceId: string,
  input: { name: string; jiraKey?: string },
): Promise<Project> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const now = new Date();
  const [project] = await db
    .insert(projectsTable)
    .values({
      id: randomUUID(),
      workspaceId: scopedWorkspaceId,
      name: input.name,
      jiraKey: input.jiraKey ?? "",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return toProject(project);
}

export { DEFAULT_PHASES, DEFAULT_SETTINGS_ID, randomUUID, eq, asc };

export interface ExportItem {
  id: string;
  exportPackageId: string;
  storyId: string;
  epicId: string;
  title: string;
  priority: string;
  readinessScore: number;
  reviewStatus: string;
  jiraKey: string | null;
  githubIssueUrl: string | null;
  externalExportStatus: string | null;
  externalExportError: string | null;
  exportedAt: Date | null;
}

export interface IntegrationConfig {
  id: string;
  integrationType: string;
  enabled: boolean;
  configured: boolean;
}

export function toExportItem(
  item: ExportItemRow,
): ExportItem {
  return {
    id: item.id,
    exportPackageId: item.exportPackageId,
    storyId: item.storyId,
    epicId: item.epicId,
    title: item.title,
    priority: item.priority,
    readinessScore: item.readinessScore,
    reviewStatus: item.reviewStatus,
    jiraKey: item.jiraKey,
    githubIssueUrl: item.githubIssueUrl,
    externalExportStatus: item.externalExportStatus,
    externalExportError: item.externalExportError,
    exportedAt: item.exportedAt,
  };
}

export function toIntegrationConfig(
  config: IntegrationConfigRow,
): IntegrationConfig {
  const requiredKeys = REQUIRED_INTEGRATION_KEYS[config.integrationType] ?? [];
  const hasValidConfig =
    requiredKeys.length > 0 &&
    requiredKeys.every(
      (key) =>
        typeof config.config[key] === "string" && config.config[key].trim().length > 0,
    );
  return {
    id: config.id,
    integrationType: config.integrationType,
    enabled: config.enabled,
    configured: hasValidConfig,
  };
}

export async function getIntegrationConfigs(
  db: Database,
  workspaceId: string,
): Promise<IntegrationConfig[]> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const configs = await db
    .select()
    .from(integrationConfigTable)
    .where(eq(integrationConfigTable.workspaceId, scopedWorkspaceId));
  return configs.map(toIntegrationConfig);
}

export async function getIntegrationConfig(
  db: Database,
  type: string,
  workspaceId: string,
): Promise<IntegrationConfigRow | null> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const [config] = await db
    .select()
    .from(integrationConfigTable)
    .where(
      and(
        eq(integrationConfigTable.integrationType, type),
        eq(integrationConfigTable.workspaceId, scopedWorkspaceId),
      ),
    );
  return config ?? null;
}

export async function updateIntegrationConfigRecord(
  db: Database,
  type: string,
  workspaceId: string,
  input: { enabled: boolean; config: Record<string, string> },
): Promise<IntegrationConfig> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const existing = await getIntegrationConfig(db, type, scopedWorkspaceId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(integrationConfigTable)
      .set({
        enabled: input.enabled,
        config: input.config,
        updatedAt: now,
        workspaceId: scopedWorkspaceId,
      })
      .where(
        and(
          eq(integrationConfigTable.integrationType, type),
          eq(integrationConfigTable.workspaceId, scopedWorkspaceId),
        ),
      )
      .returning();
    return toIntegrationConfig(updated);
  }

  const [created] = await db
    .insert(integrationConfigTable)
    .values({
      id: randomUUID(),
      workspaceId: scopedWorkspaceId,
      integrationType: type,
      enabled: input.enabled,
      config: input.config,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toIntegrationConfig(created);
}

export async function getExportItemsByPackageId(
  db: Database,
  packageId: string,
  workspaceId: string,
): Promise<ExportItem[]> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const items = await db
    .select()
    .from(exportItemsTable)
    .where(
      and(
        eq(exportItemsTable.exportPackageId, packageId),
        eq(exportItemsTable.workspaceId, scopedWorkspaceId),
      ),
    );
  return items.map(toExportItem);
}

export async function createExportItemRecord(
  db: Database,
  workspaceId: string,
  input: {
    exportPackageId: string;
    storyId: string;
    epicId: string;
    title: string;
    priority: string;
    readinessScore: number;
    reviewStatus: string;
  },
): Promise<ExportItem> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const [item] = await db
    .insert(exportItemsTable)
    .values({
      id: randomUUID(),
      workspaceId: scopedWorkspaceId,
      ...input,
      jiraKey: null,
      githubIssueUrl: null,
      externalExportStatus: "pending",
      externalExportError: null,
      exportedAt: null,
      createdAt: new Date(),
    })
    .returning();
  return toExportItem(item);
}

export async function updateExportItemExternalResult(
  db: Database,
  itemId: string,
  workspaceId: string,
  result: {
    status: string;
    jiraKey?: string;
    githubIssueUrl?: string;
    error?: string;
  },
): Promise<ExportItem> {
  const scopedWorkspaceId = assertWorkspaceId(workspaceId);
  const [updated] = await db
    .update(exportItemsTable)
    .set({
      externalExportStatus: result.status,
      jiraKey: result.jiraKey ?? null,
      githubIssueUrl: result.githubIssueUrl ?? null,
      externalExportError: result.error ?? null,
      exportedAt: result.status === "success" ? new Date() : null,
    })
    .where(
      and(
        eq(exportItemsTable.id, itemId),
        eq(exportItemsTable.workspaceId, scopedWorkspaceId),
      ),
    )
    .returning();
  return toExportItem(updated);
}
