import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import {
  type ClarificationQuestion,
  type Epic,
  exportPackagesTable,
  type ExportPackage,
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
    errorMessage?: string | null;
    updatedAt?: string | null;
  },
): WorkflowGeneration {
  return {
    ...generation,
    [step]: {
      ...generation[step],
      status: input.status,
      mode: input.mode ?? generation[step].mode,
      errorMessage:
        input.errorMessage === undefined
          ? generation[step].errorMessage
          : input.errorMessage,
      updatedAt: input.updatedAt ?? new Date().toISOString(),
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

const DEFAULT_SETTINGS = {
  id: DEFAULT_SETTINGS_ID,
  workspaceName: "SpecFlow Workspace",
  jiraKey: "SPEC",
  defaultLabels: ["Feature", "Frontend"],
  defaultComponents: ["Dashboard", "Workspace"],
  templatePreference: "Standard",
  qualityThreshold: 75,
  devReviewRequired: true,
  autoGenerateQuestions: true,
  showReadinessWarnings: true,
} satisfies Omit<WorkspaceSettings, 'createdAt' | 'updatedAt'>;

export function requireDatabase(): Database {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Persistence requires DATABASE_URL. Configure the database before calling persistence routes.",
    );
  }

  return getDb() as Database;
}

export async function ensureSeedData(db: Database): Promise<void> {
  const [settingsCount] = await db.select().from(settingsTable);
  if (!settingsCount) {
    await db.insert(settingsTable).values(DEFAULT_SETTINGS);
  }

  const [projectCount] = await db.select().from(projectsTable);
  if (projectCount) {
    return;
  }

  const now = new Date();
  const demoProjectId = "project-demo-1";
  const demoSessionId = "session-demo-1";
  const demoArtifacts = createDemoArtifacts(demoSessionId);

  await db.insert(projectsTable).values({
    id: demoProjectId,
    name: "SpecFlow Persistence Demo",
    jiraKey: "SPEC",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(sessionsTable).values({
    id: demoSessionId,
    projectId: demoProjectId,
    name: "SpecFlow Persistence Demo",
    inputType: "PRD draft",
    outputDepth: "Standard",
    jiraKey: "SPEC",
    targetUsers: ["Product Manager", "Engineer"],
    businessGoal: "Keep workflow progress durable between browser sessions.",
    knownConstraints: "No AI generation in this phase.",
    labels: ["Persistence", "MVP"],
    rawInput:
      "Persist session progress, settings, and workflow artifacts so refresh no longer loses active work.",
    currentPhase: "stories",
    phases: {
      ...DEFAULT_PHASES,
      clarification: "complete",
      prd: "complete",
      epics: "complete",
      stories: "in-progress",
    },
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(workflowArtifactsTable).values({
    sessionId: demoSessionId,
    ...demoArtifacts,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(exportPackagesTable).values(
    DEMO_EXPORTS.map((pkg) => ({
      ...pkg,
      date: new Date(pkg.date),
    })),
  );
}

type SessionWithArtifactsRow = {
  session: typeof sessionsTable.$inferSelect;
  artifacts: typeof workflowArtifactsTable.$inferSelect | null;
};

function toResponseGeneration(
  generation: WorkflowGeneration,
): WorkflowSession["generation"] {
  return {
    clarification: {
      ...generation.clarification,
      updatedAt: generation.clarification.updatedAt
        ? new Date(generation.clarification.updatedAt)
        : null,
    },
    prd: {
      ...generation.prd,
      updatedAt: generation.prd.updatedAt ? new Date(generation.prd.updatedAt) : null,
    },
    epics: {
      ...generation.epics,
      updatedAt: generation.epics.updatedAt
        ? new Date(generation.epics.updatedAt)
        : null,
    },
    stories: {
      ...generation.stories,
      updatedAt: generation.stories.updatedAt
        ? new Date(generation.stories.updatedAt)
        : null,
    },
    quality: {
      ...generation.quality,
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
): Promise<SessionWithArtifactsRow | null> {
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
    .where(eq(sessionsTable.id, sessionId));

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
): Promise<WorkflowSession[]> {
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
    .orderBy(asc(sessionsTable.createdAt));

  return rows.map(toWorkflowSession);
}

export async function getSessionWithArtifacts(
  db: Database,
  sessionId: string,
): Promise<WorkflowSession | null> {
  const row = await getSessionArtifactsRecord(db, sessionId);
  return row ? toWorkflowSession(row) : null;
}

export async function createProjectRecord(
  db: Database,
  input: { name: string; jiraKey?: string },
): Promise<Project> {
  const now = new Date();
  const [project] = await db
    .insert(projectsTable)
    .values({
      id: randomUUID(),
      name: input.name,
      jiraKey: input.jiraKey ?? "",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return toProject(project);
}

export { DEFAULT_PHASES, DEFAULT_SETTINGS_ID, randomUUID, eq, asc };
