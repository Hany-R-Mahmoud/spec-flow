import { Router, type IRouter } from "express";
import {
  GenerateClarificationBody,
  GenerateEpicsBody,
  GeneratePrdBody,
  GenerateQualityBody,
  GenerateStoriesBody,
} from "@workspace/api-zod";
import {
  clarificationQuestionSchema,
  epicSchema,
  prdSectionSchema,
  storySchema,
  workflowArtifactsTable,
  sessionsTable,
  type WorkflowGeneration,
} from "@workspace/db";
import { applyQualityReview, generateClarificationQuestions, generateEpics, generatePrdSections, generateStories } from "../ai/deterministic-workflow";
import { getGenerationRuntime } from "../ai/config";
import { workflowPrompts } from "../ai/prompts";
import { sendError, sendUnexpectedError } from "./error-response";
import {
  buildPhaseUpdate,
  createSessionDefaults,
  createWorkflowGeneration,
  getSessionArtifactsRecord,
  getSessionWithArtifacts,
  PROMPT_VERSIONS,
  requireDatabase,
  withGenerationStatus,
  eq,
} from "./persistence";

const router: IRouter = Router();

type GenerationRouteStep =
  | "clarification"
  | "prd"
  | "epics"
  | "stories"
  | "quality";

const generateBodyParsers = {
  clarification: GenerateClarificationBody,
  prd: GeneratePrdBody,
  epics: GenerateEpicsBody,
  stories: GenerateStoriesBody,
  quality: GenerateQualityBody,
} as const;

function resetStep(
  generation: WorkflowGeneration,
  step: GenerationRouteStep,
): WorkflowGeneration {
  return {
    ...generation,
    [step]: {
      ...generation[step],
      status: "idle",
      errorMessage: null,
      updatedAt: null,
    },
  };
}

function resetDownstream(
  generation: WorkflowGeneration,
  step: GenerationRouteStep,
): WorkflowGeneration {
  if (step === "clarification") {
    return resetStep(resetStep(resetStep(resetStep(generation, "prd"), "epics"), "stories"), "quality");
  }

  if (step === "prd") {
    return resetStep(resetStep(resetStep(generation, "epics"), "stories"), "quality");
  }

  if (step === "epics") {
    return resetStep(resetStep(generation, "stories"), "quality");
  }

  if (step === "stories") {
    return resetStep(generation, "quality");
  }

  return generation;
}

async function markGenerationState(args: {
  sessionId: string;
  step: GenerationRouteStep;
  status: "running" | "failed" | "succeeded" | "unavailable";
  errorMessage?: string | null;
}) {
  const db = requireDatabase();
  const row = await getSessionArtifactsRecord(db, args.sessionId);

  if (!row?.artifacts) {
    return null;
  }

  const generation =
    row.artifacts.metadata?.generation ?? createWorkflowGeneration("demo");
  const runtime = getGenerationRuntime();
  const nextGeneration = withGenerationStatus(generation, args.step, {
    status: args.status,
    mode: runtime.mode,
    errorMessage: args.errorMessage ?? null,
  });

  await db
    .update(workflowArtifactsTable)
    .set({
      metadata: { generation: nextGeneration },
      updatedAt: new Date(),
    })
    .where(eq(workflowArtifactsTable.sessionId, args.sessionId));

  return nextGeneration;
}

async function runGeneration(
  sessionId: string,
  step: GenerationRouteStep,
): Promise<Awaited<ReturnType<typeof getSessionWithArtifacts>>> {
  const db = requireDatabase();
  const row = await getSessionArtifactsRecord(db, sessionId);

  if (!row) {
    throw new Error("Session not found.");
  }

  if (!row.artifacts) {
    throw new Error("Session artifacts not found.");
  }

  const runtime = getGenerationRuntime();
  const promptVersion = PROMPT_VERSIONS[step];
  let generation =
    row.artifacts.metadata?.generation ?? createWorkflowGeneration(runtime.mode);

  if (runtime.mode === "unavailable") {
    generation = withGenerationStatus(generation, step, {
      status: "unavailable",
      mode: "unavailable",
      errorMessage: runtime.unavailableReason,
    });

    await db
      .update(workflowArtifactsTable)
      .set({
        metadata: { generation },
        updatedAt: new Date(),
      })
      .where(eq(workflowArtifactsTable.sessionId, sessionId));

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "needs-attention"))
      .where(eq(sessionsTable.id, sessionId));

    return getSessionWithArtifacts(db, sessionId);
  }

  const runningGeneration = withGenerationStatus(generation, step, {
    status: "running",
    mode: runtime.mode,
    errorMessage: null,
  });

  await db
    .update(workflowArtifactsTable)
    .set({
      metadata: { generation: runningGeneration },
      updatedAt: new Date(),
    })
    .where(eq(workflowArtifactsTable.sessionId, sessionId));

  try {
    const prompt = workflowPrompts[step].buildPrompt({
      name: row.session.name,
      inputType: row.session.inputType,
      outputDepth: row.session.outputDepth,
      jiraKey: row.session.jiraKey,
      targetUsers: row.session.targetUsers,
      businessGoal: row.session.businessGoal,
      knownConstraints: row.session.knownConstraints,
      labels: row.session.labels,
      rawInput: row.session.rawInput,
    });

    void prompt;
    void promptVersion;

    let artifactPatch: Record<string, unknown> = {};
    let nextGeneration = resetDownstream(runningGeneration, step);

    if (step === "clarification") {
      const clarificationQuestions = clarificationQuestionSchema.array().parse(
        generateClarificationQuestions({
          ...row.session,
          clarificationQuestions: row.artifacts.clarificationQuestions,
          prdSections: row.artifacts.prdSections,
          epics: row.artifacts.epics,
          stories: row.artifacts.stories,
        }),
      );

      artifactPatch = {
        clarificationQuestions,
        prdSections: createSessionDefaults().prdSections,
        epics: [],
        stories: [],
      };
    }

    if (step === "prd") {
      const prdSections = prdSectionSchema.array().parse(
        generatePrdSections({
          ...row.session,
          clarificationQuestions: row.artifacts.clarificationQuestions,
          prdSections: row.artifacts.prdSections,
          epics: row.artifacts.epics,
          stories: row.artifacts.stories,
        }),
      );

      artifactPatch = {
        prdSections,
        epics: [],
        stories: [],
      };
    }

    if (step === "epics") {
      const epics = epicSchema.array().parse(
        generateEpics({
          ...row.session,
          clarificationQuestions: row.artifacts.clarificationQuestions,
          prdSections: row.artifacts.prdSections,
          epics: row.artifacts.epics,
          stories: row.artifacts.stories,
        }),
      );

      artifactPatch = {
        epics,
        stories: [],
      };
    }

    if (step === "stories") {
      const stories = storySchema.array().parse(
        generateStories({
          ...row.session,
          clarificationQuestions: row.artifacts.clarificationQuestions,
          prdSections: row.artifacts.prdSections,
          epics: row.artifacts.epics,
          stories: row.artifacts.stories,
        }),
      );

      artifactPatch = { stories };
    }

    if (step === "quality") {
      const stories = storySchema.array().parse(applyQualityReview(row.artifacts.stories));

      artifactPatch = { stories };
    }

    nextGeneration = withGenerationStatus(nextGeneration, step, {
      status: "succeeded",
      mode: runtime.mode,
      errorMessage: null,
    });

    await db
      .update(workflowArtifactsTable)
      .set({
        ...artifactPatch,
        metadata: { generation: nextGeneration },
        updatedAt: new Date(),
      })
      .where(eq(workflowArtifactsTable.sessionId, sessionId));

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "in-progress"))
      .where(eq(sessionsTable.id, sessionId));

    return getSessionWithArtifacts(db, sessionId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Generation failed before valid output could be saved.";

    await markGenerationState({
      sessionId,
      step,
      status: "failed",
      errorMessage: message,
    });

    await db
      .update(sessionsTable)
      .set(buildPhaseUpdate(step, "needs-attention"))
      .where(eq(sessionsTable.id, sessionId));

    throw error;
  }
}

function handleStep(step: GenerationRouteStep) {
  router.post(`/sessions/:sessionId/generate/${step}`, async (req, res) => {
    try {
      generateBodyParsers[step].parse(req.body ?? {});

      const db = requireDatabase();
      const existing = await getSessionArtifactsRecord(db, req.params.sessionId);

      if (!existing) {
        sendError(res, 404, "Session not found.");
        return;
      }

      if (!existing.artifacts) {
        sendError(res, 404, "Session artifacts not found.");
        return;
      }

      const session = await runGeneration(req.params.sessionId, step);
      res.json(session);
    } catch (error) {
      sendUnexpectedError(res, error);
    }
  });
}

handleStep("clarification");
handleStep("prd");
handleStep("epics");
handleStep("stories");
handleStep("quality");

export default router;
